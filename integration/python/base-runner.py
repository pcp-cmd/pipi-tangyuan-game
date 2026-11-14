import ast
import builtins
import copy
import contextlib
import io
import gc
import types
import json
import re
import sys
import traceback

_ALLOWED_MODULES = {'math', 'json', 'collections', 'itertools', 'functools', 're', 'statistics', 'io', 'csv', 'argparse', 'fractions', 'dataclasses'}
_ALLOWED_BUILTINS = ['abs','all','any','bool','dict','divmod','enumerate','filter','float','int','isinstance','issubclass','iter','len','list','map','max','min','next','object','pow','print','range','repr','reversed','round','set','slice','sorted','str','sum','tuple','type','zip','BaseException','Exception','RuntimeError','ValueError','TypeError','KeyError','IndexError','ZeroDivisionError','OverflowError','AssertionError','StopIteration','OSError','property','staticmethod','classmethod','super','SystemExit','__build_class__']
_MODULE_EXPORTS = {
    'io': ['StringIO'],
    'csv': ['reader','writer','DictReader','DictWriter','Error'],
    'argparse': ['ArgumentParser','ArgumentError','ArgumentTypeError'],
    'fractions': ['Fraction'],
    'dataclasses': ['dataclass','field','FrozenInstanceError'],
    'math': 'pi e tau inf nan ceil floor trunc fabs factorial gcd lcm comb perm sqrt pow exp log log2 log10 sin cos tan asin acos atan atan2 sinh cosh tanh degrees radians hypot dist fsum prod isclose isfinite isinf isnan copysign fmod remainder modf frexp ldexp'.split(),
    'json': ['dumps', 'loads', 'JSONDecodeError'],
    'collections': 'Counter defaultdict deque OrderedDict namedtuple ChainMap'.split(),
    'itertools': 'accumulate batched chain combinations combinations_with_replacement compress count cycle dropwhile filterfalse groupby islice pairwise permutations product repeat starmap takewhile tee zip_longest'.split(),
    'functools': 'cache lru_cache cached_property cmp_to_key partial partialmethod reduce total_ordering wraps'.split(),
    're': 'compile match fullmatch search sub subn split findall finditer escape error ASCII IGNORECASE LOCALE MULTILINE DOTALL UNICODE VERBOSE NOFLAG A I L M S U X'.split(),
    'statistics': 'mean fmean geometric_mean harmonic_mean median median_low median_high median_grouped mode multimode quantiles pstdev pvariance stdev variance covariance correlation linear_regression NormalDist StatisticsError'.split(),
}


_EXTENSION_NAMESPACE = {}

def _missing_extension(*args):
    raise RuntimeError('增量课程合同未安装，不能记录通过。')

def _install_extensions(source):
    exec(compile(source, 'extension-contracts.py', 'exec'), _EXTENSION_NAMESPACE)


class _ModuleFacade:
    def __init__(self, name):
        module = builtins.__import__(name)
        object.__setattr__(self, '_exports', {key: getattr(module, key) for key in _MODULE_EXPORTS[name]})

    def __getattr__(self, name):
        if name not in self._exports:
            raise AttributeError('练习模块未开放这个属性。')
        return self._exports[name]

    def __setattr__(self, name, value):
        raise AttributeError('练习模块不可修改。')

class _Output(io.StringIO):
    truncated = False  # Writes assign instance state without extra traced lines.
    number_three_seen, number_tail = False, ""
    _number_three_closed = re.compile(r"(?<![\d.])3(?=[^\d.])")
    _number_three_end = re.compile(r"(?<![\d.])3\Z")
    def write(self, value):
        remaining = 8000 - self.tell(); self.truncated = self.truncated or len(value) > remaining; self.number_three_seen = self.number_three_seen or self._number_three_closed.search(self.number_tail + value, 1 if len(self.number_tail) == 2 else 0) is not None; self.number_tail = (self.number_tail + value)[-2:]
        if remaining > 0:
            return super().write(value[:remaining])
        return len(value)

class _Activity(ast.NodeTransformer):
    def marker(self, node, activity):
        call = ast.Expr(value=ast.Call(func=ast.Name(id='__island_mark__', ctx=ast.Load()), args=[ast.Constant(activity)], keywords=[]))
        return ast.copy_location(call, node)

    def visit_Assert(self, node):
        self.generic_visit(node)
        return [self.marker(node, 'assert'), node]

    def visit_For(self, node):
        self.generic_visit(node)
        node.body.insert(0, self.marker(node, 'loop'))
        return node

    def visit_While(self, node):
        return self.visit_For(node)


class _InputBindings(ast.NodeTransformer):
    """Inject trusted replay values after the learner's first input binding.

    The original program is parsed afresh for every replay. New bindings only
    affect replays, never the submission's returned game actions.
    """
    def __init__(self, names):
        self.names = set(names)
        self.scope_depth = 0

    def _after(self, node, bound):
        result = [node]
        for name in sorted(set(bound) & self.names):
            value = ast.Call(func=ast.Name(id='__island_seed', ctx=ast.Load()),
                             args=[ast.Constant(name), ast.Name(id=name, ctx=ast.Load())], keywords=[])
            assignment = ast.Assign(targets=[ast.Name(id=name, ctx=ast.Store())], value=value)
            result.append(ast.copy_location(assignment, node))
        return result

    def visit_Assign(self, node):
        if self.scope_depth:
            return node
        names = [n.id for target in node.targets for n in ast.walk(target)
                 if isinstance(n, ast.Name) and isinstance(n.ctx, ast.Store)]
        return self._after(node, names)

    def visit_AnnAssign(self, node):
        if self.scope_depth or node.value is None:
            return node
        names = [n.id for n in ast.walk(node.target) if isinstance(n, ast.Name) and isinstance(n.ctx, ast.Store)]
        return self._after(node, names)

    def visit_FunctionDef(self, node):
        # Function and class bodies have separate local variables. Do not seed them.
        return self._after(node, [node.name]) if not self.scope_depth else node

    def visit_AsyncFunctionDef(self, node):
        return self.visit_FunctionDef(node)

    def visit_ClassDef(self, node):
        return self._after(node, [node.name]) if not self.scope_depth else node


class _Game:
    def __init__(self, state, actions):
        self._actions = actions
        self.coins = state['coins']
        self.position = state['position']
    @property
    def actions(self):
        return copy.deepcopy(self._actions)

    def move(self, steps):
        if type(steps) is not int or not 1 <= steps <= 6:
            raise ValueError('game.move() 每次需要 1 到 6 的整数。')
        if len(self._actions) >= 32:
            raise ValueError('本次操作数量过多。')
        self._actions.append({'type':'move','steps':steps})
    def buy(self, item):
        if type(item) is not str or len(item) > 40:
            raise ValueError('商品 ID 必须是短字符串。')
        if len(self._actions) >= 32:
            raise ValueError('本次操作数量过多。')
        self._actions.append({'type':'buy','item':item})

def _safe_import(name, globals=None, locals=None, fromlist=(), level=0):
    if name not in _ALLOWED_MODULES or level:
        raise ImportError('这座练习岛仅开放 math、json、collections、itertools、functools、re、statistics。')
    if any(not isinstance(item, str) or item.startswith('_') or item not in _MODULE_EXPORTS[name] for item in (fromlist or ())):
        raise ImportError('只能导入练习模块明确开放的公开名称。')
    return _ModuleFacade(name)

def _execute(request_json):
    request = json.loads(request_json)
    output = _Output()
    actions = []
    game = _Game(request['state'], actions)
    env = {'__builtins__':{name:getattr(builtins,name) for name in _ALLOWED_BUILTINS},'__name__':'island','game':game}
    env['__builtins__']['__import__'] = _safe_import
    checks = []
    counter = 0
    user_events = 0
    activities = set()
    env['__island_mark__'] = activities.add
    def budget(frame, event, arg):
        nonlocal counter, user_events
        counter += 1
        if frame.f_code.co_filename == 'adventure.py':
            user_events += 1
        if counter > 150000:
            raise RuntimeError('这次代码执行了太多步骤，请检查循环终止条件。')
        return budget
    def lazy_iterator(function):
        def retained_batch(iterator):
            pending = [iterator]
            visited = set()
            while pending:
                value = pending.pop()
                if id(value) in visited:
                    continue
                visited.add(id(value))
                if isinstance(value, (list, tuple, dict, set, frozenset)):
                    if len(value) > 32:
                        return True
                    pending.extend(value.values() if isinstance(value, dict) else value)
                elif isinstance(value, types.GeneratorType):
                    if value.gi_frame is not None:
                        pending.extend(value.gi_frame.f_locals.values())
                    if value.gi_yieldfrom is not None:
                        pending.append(value.gi_yieldfrom)
                elif isinstance(value, types.FunctionType):
                    pending.extend(value.__defaults__ or ())
                    pending.extend((value.__kwdefaults__ or {}).values())
                    pending.extend(value.__closure__ or ())
                elif not isinstance(value, (type, types.ModuleType, types.CodeType, types.FrameType)):
                    pending.extend(gc.get_referents(value))
            return False
        samples = []
        for size in (3, 1000):
            before = user_events
            iterator = function(size)
            if iter(iterator) is not iterator:
                return False
            if size > 32 and retained_batch(iterator):
                return False
            prefix = [next(iterator) for _ in range(3)]
            if size > 32 and retained_batch(iterator):
                return False
            samples.append((prefix, user_events - before))
        return samples[0][0] == samples[1][0] == [1, 4, 9] and samples[1][1] <= samples[0][1] + 20

    def compare_case(actual, expected):
        def same(a,b):
            if type(a) is not type(b):
                return False
            if isinstance(a,(list,tuple)):
                return len(a)==len(b) and all(same(x,y) for x,y in zip(a,b))
            if isinstance(a,dict):
                return a.keys()==b.keys() and all(same(a[k],b[k]) for k in a)
            return a==b
        if not same(actual,expected):
            raise AssertionError("期望 " + repr(expected)[:300] + "；实际 " + repr(actual)[:300])
        return True


    def log_search(function):
        def counted_sequence(values):
            reads = 0
            def check_budget():
                if reads > 16:
                    raise AssertionError("读取超过16个数值；检查是否在逐项扫描或复制整段数据。")
            class CountedSequence:
                __slots__ = ()
                def __len__(self):
                    return len(values)
                def __getitem__(self, index):
                    nonlocal reads
                    value = values[index]
                    reads += len(value) if isinstance(index, slice) else 1
                    check_budget()
                    return value
            return CountedSequence(), check_budget
        values=tuple(i//3-300 for i in range(2048))
        for target in (-301,-300,-1,0,382,383,1000):
            expected=sum(value<target for value in values)
            sequence, check_budget=counted_sequence(values)
            actual=function(sequence,target)
            check_budget()
            if type(actual) is not int or actual!=expected:
                raise AssertionError("二分边界错误：期望 " + str(expected) + "；实际 " + repr(actual))
        return True


    def numeric_equal(actual, expected):
        import math
        from fractions import Fraction
        if type(actual) not in (int, float) or type(expected) not in (int, float):
            raise AssertionError("需要int或float数值，不接受bool。")
        if (type(actual) is float and not math.isfinite(actual)) or (type(expected) is float and not math.isfinite(expected)):
            raise AssertionError("需要有限数值。")
        left, right = Fraction(actual), Fraction(expected)
        tolerance = max(Fraction(1e-9) * max(abs(left), abs(right)), Fraction(1e-12))
        if abs(left - right) > tolerance:
            raise AssertionError("期望数值 " + repr(expected)[:200] + "；实际 " + repr(actual)[:200])
        return True


    def unchanged_call(function, arguments, expected, unchanged_indices, new_index=None):
        import copy
        snapshots={index:copy.deepcopy(arguments[index]) for index in unchanged_indices}
        originals={index:arguments[index] for index in unchanged_indices}
        new_original=arguments[new_index] if new_index is not None else None
        actual=function(*arguments)
        compare_case(actual,expected)
        for index,before in snapshots.items():
            if arguments[index] is not originals[index]:
                raise AssertionError("输入对象被替换")
            try:
                compare_case(arguments[index],before)
            except AssertionError:
                raise AssertionError("返回值正确，但输入被改写；请保留题目要求的原对象。") from None
        if new_index is not None and actual is new_original:
            raise AssertionError("需要返回新对象，当前返回了输入对象本身。")
        return True

    def resupply_ownership(function):
        for amount in (7,0,-3):
            original=[2,4]
            other=[]
            supply={"cat":original,"boat":other}
            result=function(supply,amount)
            compare_case(result,{"cat":[2,4,amount],"boat":[amount]})
            if result is supply or supply.get("cat") is not original or supply.get("boat") is not other:
                raise AssertionError("不能替换原字典中的列表；结果应另存新字典。")
            compare_case(original,[2,4]);compare_case(other,[])
            if result["cat"] is original or result["boat"] is other:
                raise AssertionError("输出仍与原列表共享对象。")
        return True

    def pipeline_once(function):
        events=[]
        start={"value":4};middle={"value":9};end={"value":18}
        def first(value):
            events.append(("first",value is start))
            return middle
        def second(value):
            events.append(("second",value is middle))
            return end
        result=function(start,[first,second])
        if result is not end or events!=[("first",True),("second",True)]:
            raise AssertionError("每个阶段应按顺序仅调用一次，并传递前一阶段的实际对象。")
        if function(start,[]) is not start:
            raise AssertionError("空流程应返回原值。")
        # Falsy values are real stage results, not an implicit stop/fallback.
        for empty in (None,False,0,"",[],{}):
            called=[]
            def receive(value):
                called.append(("receive",value is empty))
                return middle
            def produce(value):
                called.append(("produce",value is middle))
                return empty
            def finish(value):
                called.append(("finish",value is empty))
                return end
            result=function(empty,[receive,produce,finish])
            if result is not end or called != [("receive",True),("produce",True),("finish",True)]:
                raise AssertionError("None、False、0和空容器也必须原样传给下一阶段，不能跳过或提前返回。")
            called=[]
            def final_empty(value):
                called.append(value is start)
                return empty
            if function(start,[final_empty]) is not empty or called != [True]:
                raise AssertionError("末阶段的假值结果不能被初值或默认值替代。")
            if function(empty,[]) is not empty:
                raise AssertionError("空流程应保留假值原对象。")
        # The same propagation contract applies after any successful prefix,
        # not only to ValueError in the first operation. Every case includes a
        # later operation, so preserving identity alone cannot hide continuing.
        for error_type in (ValueError, TypeError, RuntimeError, StopIteration):
            for failure_index in range(3):
                failure=error_type("stage failed")
                values=[{"stage":index} for index in range(5)]
                called=[]
                def stage(index):
                    def operation(value):
                        called.append((index,value is values[index]))
                        if index == failure_index:
                            raise failure
                        return values[index+1]
                    return operation
                operations=[stage(index) for index in range(4)]
                try:
                    function(values[0],operations)
                except BaseException as error:
                    if error is not failure:
                        raise AssertionError("必须传播原异常对象。") from None
                else:
                    raise AssertionError("阶段异常被吞掉了。")
                if called != [(index,True) for index in range(failure_index+1)]:
                    raise AssertionError("每个成功前序阶段仅调用一次并传递原对象；失败后不应继续调用后续阶段。")
        return True

    def json_matches(payload, ledger, restored):
        expected = {'cat': '汤圆', 'coins': 80}
        return isinstance(payload, str) and json.loads(payload) == expected and ledger == expected and restored == expected
    def replay_once(seeds):
        seen = set()
        replay_activities = set()
        replay_game = _Game(request['state'], [])
        replay_env = {
            '__builtins__': {name: getattr(builtins, name) for name in _ALLOWED_BUILTINS},
            '__name__': 'island', 'game': replay_game,
            '__island_mark__': replay_activities.add,
        }
        replay_env['__builtins__']['__import__'] = _safe_import
        def seed(name, original):
            if name in seen:
                return original
            seen.add(name)
            return copy.deepcopy(seeds[name])
        replay_env['__island_seed'] = seed
        replay_tree = ast.parse(request['code'], filename='adventure.py')
        replay_tree = _InputBindings(seeds).visit(replay_tree)
        replay_tree = ast.fix_missing_locations(_Activity().visit(replay_tree))
        with contextlib.redirect_stdout(_Output()), contextlib.redirect_stderr(_Output()):
            exec(compile(replay_tree, 'adventure.py', 'exec'), replay_env)
        return replay_env, seen

    replay_feedback = ''

    def replay_input_note(seeds):
        # Only bounded plain input data supplied by the course, never learner
        # objects/repr, expected answers, predicate expressions or replay output.
        budget = [64]
        def plain(value, depth=0):
            budget[0] -= 1
            if budget[0] < 0 or depth > 4:
                return False
            if value is None or type(value) is bool:
                return True
            if type(value) is int:
                return value.bit_length() <= 128
            if type(value) is str:
                return len(value) <= 120
            if type(value) is list:
                return len(value) <= 16 and all(plain(item, depth+1) for item in value)
            if type(value) is dict:
                return len(value) <= 16 and all(type(key) is str and plain(key, depth+1) and plain(item, depth+1) for key, item in value.items())
            return False
        if not plain(seeds):
            return '变化输入：本组数据较复杂，未展开。'
        encoded = json.dumps(seeds, ensure_ascii=False, separators=(', ', ': '))
        if len(encoded) > 360:
            return '变化输入：本组数据较长，未展开。'
        return '变化输入：' + encoded

    def replay(cases, expression, mode=''):
        nonlocal replay_feedback
        for seeds in cases:
            note = replay_input_note(seeds)
            # Set before execution so a raised learner exception retains context.
            replay_feedback = note
            candidate, seen = replay_once(seeds)
            if seen != set(seeds):
                replay_feedback = note + ' · 未找到全部输入变量的赋值，请保留题目输入变量。'
                return False
            if mode == 'backpack':
                candidate['__lesson_expected_bag'] = seeds['bag'] + ['地图']
            if mode == 'catalog':
                candidate['__lesson_expected_prices'] = dict(seeds['prices'], 地图=12)
            if mode == 'shells':
                candidate['__lesson_expected_total'] = sum(seeds['shells'])
            assessment = dict(candidate)
            assessment.update({name: getattr(builtins, name) for name in _ALLOWED_BUILTINS})
            if not bool(eval(expression, assessment)):
                replay_feedback = note + ' · 这组输入未通过，请检查代码是否根据输入计算。'
                return False
        replay_feedback = ''
        return True

    def json_functions(encode, decode):
        def same_data(left, right):
            if type(left) is not type(right):
                return False
            if isinstance(left, dict):
                return left.keys() == right.keys() and all(same_data(left[key], right[key]) for key in left)
            if isinstance(left, list):
                return len(left) == len(right) and all(same_data(a, b) for a, b in zip(left, right))
            return left == right
        samples = [
            {'cat': '皮皮', 'coins': 0},
            {'cat': '舟舟', 'coins': 117, 'cargo': ['海图', '绳索'], 'open': True},
            {'note': 'line\n"quoted"', 'missing': None, 'nested': {'debt': -3}},
        ]
        for sample_index, data in enumerate(samples):
            before = copy.deepcopy(data)
            payload = encode(data)
            if not isinstance(payload, str) or not same_data(json.loads(payload), before) or data != before:
                return False
            # Decoder receives an independently constructed text, rather than the
            # encoder's previous output or a shared global ledger.
            incoming_data = samples[(sample_index + 1) % len(samples)]
            incoming = json.dumps(incoming_data, ensure_ascii=True, sort_keys=True)
            if not same_data(decode(incoming), incoming_data):
                return False
        return True

    def assert_mutations():
        mutants = [
            lambda a, b: 0 if b == 0 else a / b,
            lambda a, b: None if b == 0 else a // b,
        ]
        assert_lines = {n.lineno for n in ast.walk(ast.parse(request['code'])) if isinstance(n, ast.Assert)}
        if not assert_lines:
            return False
        for mutant in mutants:
            try:
                replay_once({'safe_divide': mutant})
            except AssertionError as error:
                frames = traceback.extract_tb(error.__traceback__)
                if not frames or frames[-1].filename != 'adventure.py' or frames[-1].lineno not in assert_lines:
                    return False
            except BaseException:
                return False
            else:
                return False
        return True

    try:
        code = request['code']
        if len(code) > 20000:
            raise ValueError('代码超过 20,000 字符。')
        tree = ast.parse(code, filename='adventure.py')
        for node in ast.walk(tree):
            # Names in definitions, parameters and patterns are stored as text
            # fields rather than ast.Name nodes. Keep the trusted namespace
            # reserved there too; ordinary __init__/__iter__ remain allowed.
            if any(field in ('name', 'arg', 'rest') and isinstance(value, str)
                   and value.startswith('__island_') for field, value in ast.iter_fields(node)):
                raise ValueError('练习环境不开放内部运行时名称。')
            if isinstance(node, ast.Attribute) and node.attr.startswith('_'):
                raise ValueError('练习环境不开放内部属性访问。')
            if isinstance(node, ast.Name) and node.id.startswith('__'):
                raise ValueError('练习环境不开放内部运行时名称。')
            if isinstance(node, (ast.Import,ast.ImportFrom)):
                names = [x.name for x in node.names] if isinstance(node,ast.Import) else [node.module]
                if any(n not in _ALLOWED_MODULES for n in names) or getattr(node,'level',0):
                    raise ImportError('这个模块不在练习环境的开放列表中。')
                if any(alias.name.startswith('_') or (alias.asname and alias.asname.startswith('_')) for alias in node.names):
                    raise ImportError('不开放模块内部名称或私有导入别名。')
                if isinstance(node, ast.ImportFrom) and any(alias.name not in _MODULE_EXPORTS[node.module] for alias in node.names):
                    raise ImportError('这个名称不在练习模块的开放列表中。')
        sys.settrace(budget)
        with contextlib.redirect_stdout(output), contextlib.redirect_stderr(output):
            tree = ast.fix_missing_locations(_Activity().visit(tree))
            exec(compile(tree,'adventure.py','exec'),env)
            if globals().get('_restore_exports', lambda: False)():
                raise ValueError('共享标准库类型不可修改。')
            assessment = dict(env)
            assessment.update({name: getattr(builtins, name) for name in _ALLOWED_BUILTINS})
            assessment.update({
                '__lesson_extension': _EXTENSION_NAMESPACE.get('_run_extension_check', _missing_extension),
                '__lesson_equal': compare_case,
                '__lesson_unchanged': unchanged_call,
                '__lesson_resupply_ownership': resupply_ownership,
                '__lesson_pipeline_once': pipeline_once,
                '__lesson_numeric': numeric_equal,
                '__lesson_log_search': log_search,
                '__lesson_stdout': output.getvalue(),
                '__lesson_printed_number': lambda number: (output.number_three_seen or output._number_three_end.search(output.number_tail) is not None) if type(number) is int and number == 3 else re.search(r'(?<![\d.])' + re.escape(str(number)) + r'(?![\d.])', output.getvalue()) is not None,
                '__lesson_actions': copy.deepcopy(actions),
                '__lesson_ran_loop': 'loop' in activities,
                '__lesson_ran_assert': 'assert' in activities,
                '__lesson_json_matches': json_matches,
                '__lesson_lazy_iterator': lazy_iterator,
                '__lesson_replay': replay,
                '__lesson_json_functions': json_functions,
                '__lesson_assert_mutations': assert_mutations,
            })
            for label, expression in request.get('checks',[]):
                replay_feedback = ''
                display = label if '__lesson_' in expression else expression
                try:
                    passed = bool(eval(expression,assessment))
                    detail = '' if passed else f'未满足：{display}'
                    if not passed and replay_feedback:
                        detail = replay_feedback + ' · ' + detail
                    if globals().get('_restore_exports', lambda: False)():
                        passed = False
                        detail = '共享标准库类型不可修改。'
                    checks.append({'label':label,'passed':passed,'detail':detail[:900]})
                except Exception as error:
                    frames = traceback.extract_tb(error.__traceback__)
                    line = next((f.lineno for f in reversed(frames) if f.filename == 'adventure.py'), None)
                    location = f'第 {line} 行 · ' if line else ''
                    detail = f'{location}{type(error).__name__}: {str(error)[:180]} · 检查输入：{display}'
                    if replay_feedback:
                        detail = replay_feedback + ' · ' + detail
                    checks.append({'label':label,'passed':False,'detail':detail[:900]})
        return json.dumps({'ok':True,'stdout':output.getvalue(),**({'outputTruncated':True} if output.truncated else {}),'checks':checks,'passed':all(x['passed'] for x in checks),'effects':copy.deepcopy(actions)},ensure_ascii=False)
    except BaseException as error:
        frames = traceback.extract_tb(error.__traceback__)
        line = getattr(error,'lineno',None) or next((f.lineno for f in reversed(frames) if f.filename=='adventure.py'),None)
        return json.dumps({'ok':False,'stdout':output.getvalue(),**({'outputTruncated':True} if output.truncated else {}),'error':{'name':type(error).__name__,'message':str(error)[:700],'line':line},'effects':[],'checks':checks,'passed':False},ensure_ascii=False)
    finally:
        sys.settrace(None)
        globals().get('_restore_exports', lambda: False)()
