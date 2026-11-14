"""Protocol island educational runner. Reduced APIs, not a security sandbox proof."""
import ast
import builtins
import contextlib
import hashlib
import io
import json
import sys
import traceback
import types
import unittest

_PROTOCOL_TESTS = None
_PROTOCOL_LESSONS = {}
_EXPORTS = {
    'contextlib': ('contextmanager','closing','ExitStack','nullcontext'),
    'functools': ('wraps','update_wrapper','partial'),
    'inspect': ('signature','Signature','Parameter'),
    'dataclasses': ('dataclass','field','replace','asdict','is_dataclass','FrozenInstanceError'),
    'typing': ('Protocol','Iterable','Iterator','Callable','Any','TypeVar','Generic','Sequence','runtime_checkable'),
    'json': ('loads','dumps','JSONDecodeError'),
    'collections': ('deque','Counter'),
    '__future__': ('annotations',),
}
class _ReadOnlyModule:
    def __init__(self, values):
        object.__setattr__(self, '_values', values)
    def __getattr__(self, name):
        try:
            return self._values[name]
        except KeyError:
            raise AttributeError('该接口未在本工作台开放。') from None
    def __setattr__(self, name, value):
        raise AttributeError('课程共享标准库接口只读，请在自己的函数或对象上修改状态。')


_PUBLIC_MODULES = {name: _ReadOnlyModule({key:getattr(__import__(name),key) for key in names}) for name,names in _EXPORTS.items()}
_METHODS = {'__init__','__post_init__','__enter__','__exit__','__iter__','__next__','__call__','__len__','__eq__','__hash__','__name__','__doc__','__annotations__','__wrapped__'}
_LABELS = {
 'success_owns_exactly_one_resource':'正常借用：获取一次，关闭一次',
 'body_failure_preserves_identity':'工作失败：保留原错误并关闭',
 'acquisition_failure_before_object_exists':'获取失败：不伪造资源或运行主体',
 'partial_open_failure_still_closes':'部分打开失败仍须关闭',
 'close_failure_is_visible':'关闭本身失败必须可见',
 'body_and_close_failures_both_survive':'工作与关闭双故障都保留',
 'open_and_close_failures_both_survive':'打开与关闭双故障都保留',
 'non_exception_control_signal_is_not_swallowed':'控制信号不被吞掉',
 'control_signal_and_cleanup_failure_are_both_preserved':'控制信号与清理错误同时保留',
 'metadata_and_introspection_signature':'名称、文档、注解与签名保留',
 'parameters_and_custom_context_key':'完整参数转发与业务键',
 'custom_key_can_merge_equivalent_inputs':'业务键可合并等价输入',
 'hash_collisions_keep_distinct_business_keys':'不同业务键即使哈希相同也分别缓存',
 'falsey_results_are_cached':'零、False、None与空串都可缓存',
 'exception_identity_and_retry':'失败不缓存，重试保留正确行为',
 'clear_and_function_isolation':'清空与不同函数缓存隔离',
 'cache_hit_does_not_bypass_original_signature':'命中也先检查原调用签名',
 'key_failure_does_not_run_business':'键计算失败不调用业务',
 'original_custom_attributes_cannot_replace_cache_internals':'元信息不覆盖缓存内部状态',
 'canonical_data_value_equality_and_hash':'规范化、dataclass、相等与哈希',
 'frozen_and_independent_snapshot':'冻结运单的名称和重量，快照保持独立',
 'invalid_constructor_values':'空名、空重量和非法重量被拒',
 'declares_structural_protocol_without_claiming_static_analysis':'声明结构协议与返回注解',
 'structural_provider_no_inheritance_required':'替换普通承运商，顺序与调用数正确',
 'new_provider_and_order_are_not_hardcoded':'更换运单与免费承运商',
 'provider_contract_is_runtime_checked':'非法金额立即拒绝，不再调用后续承运商',
 'empty_batch_has_no_provider_effect':'空批次不调用承运商',
 'provider_exception_preserves_identity':'保留承运商原异常，并停止后续报价',
 'no_open_before_first_next_and_close_unstarted':'首次next前不打开，未开始可关闭',
 'laziness_one_result_and_early_close':'只读到下一条结果，早停可关闭',
 'complete_stream_preserves_rows_and_closes':'完整读取保留原字段并关闭',
 'invalid_json_preserves_physical_line_and_cause':'坏JSON保留物理行号与原因',
 'bad_schema_and_bool_quantity_rejected':'结构、零数量与bool边界',
 'source_io_error_not_disguised_as_bad_json':'读取故障保留同一个异常对象，并关闭一次',
 'factory_failure_does_not_fabricate_data':'源获取失败保留原异常',
 'empty_source_closes':'空源也关闭一次',
 'pipeline_zero_limit_never_opens_or_filters':'零上限不打开、不筛选；非法上限拒绝',
 'pipeline_stops_at_limit_without_reading_bad_tail':'达到数量即关闭，坏尾部不读取',
 'pipeline_early_consumer_close_propagates':'关闭外层传递到源',
 'pipeline_predicate_failure_preserves_identity_and_closes':'筛选失败保留原错误并关闭',
 'pipeline_no_match_and_upstream_failure':'无匹配与上游失败也正确清理',
 'provider_duplicate_ids_still_call_once_each':'同名运单按实际顺序逐张报价',
 'invalid_limit_rejected_when_iteration_begins':'非法上限在迭代开始时拒绝',
 'stream_preserves_identifier_whitespace':'合法id字段原样保留，不能暗自规范化',
}

_LABELS.update({'cleanup_control_signal_preserves_primary': '清理控制信号与主要错误都保留', 'falsey_resource_is_still_owned': '假值资源仍须正常管理', 'wrapped_identity_and_variadic_forwarding': '原函数身份与可变参数转发', 'provider_declares_shipment_parameter': '结构协议声明运单参数类型', 'provider_stops_at_first_invalid_amount': '中途非法金额立即停止后续报价', 'full_schema_boundary_preserves_format_error': '缺字段及所有非法字段统一报告格式错误', 'read_failure_preserves_exact_exception_object': '读取故障保留同一个错误对象', 'pipeline_multiple_results_keep_order_and_close_at_limit': '多条匹配按序交出，达到上限才关闭', 'pipeline_exhaustion_below_quota_preserves_all_matches': '匹配不足上限时交出全部结果并关闭', 'pipeline_unstarted_close_never_opens': '未开始的管线关闭不打开源'})

def _install_protocol_runtime(contracts_source, lessons_json):
    global _PROTOCOL_TESTS, _PROTOCOL_LESSONS
    _PROTOCOL_TESTS=types.ModuleType('_protocol_contract_tests')
    exec(compile(contracts_source,'protocol-contracts.py','exec'),_PROTOCOL_TESTS.__dict__)
    _PROTOCOL_LESSONS={q['protocolTask']:q for q in json.loads(lessons_json)}

def _user_import(name,globals=None,locals=None,fromlist=(),level=0):
    if level or name not in _PUBLIC_MODULES:
        raise ImportError('本工作台只开放任务所需的标准库接口。')
    if any(part not in _EXPORTS[name] for part in (fromlist or ())):
        raise ImportError('该名称不在本工作台开放接口内。')
    return _PUBLIC_MODULES[name]

def _check_user_source(code):
    if type(code) is not str or len(code)>20000:
        raise ValueError('单次运行最多20,000字符；草稿仍可完整保存与导出。')
    tree=ast.parse(code,filename='workbench.py')
    for node in ast.walk(tree):
        if isinstance(node,ast.Name) and node.id.startswith('__'):
            raise ValueError('不开放运行器内部名称。')
        if isinstance(node,ast.Attribute) and node.attr.startswith('__'):
            allowed=node.attr in _METHODS or (node.attr=='__setattr__' and isinstance(node.value,ast.Name) and node.value.id=='object')
            if not allowed:raise ValueError('不开放内部属性；本题需要的对象协议方法可以使用。')
        if isinstance(node,(ast.Import,ast.ImportFrom)):
            names=[alias.name for alias in node.names] if isinstance(node,ast.Import) else [node.module]
            if getattr(node,'level',0) or any(name not in _EXPORTS for name in names):
                raise ImportError('当前可用：'+', '.join(name for name in _EXPORTS if not name.startswith('_')))
            if isinstance(node,ast.ImportFrom) and any(a.name not in _EXPORTS[node.module] for a in node.names):raise ImportError('导入名称不在开放接口内。')
    return compile(tree,'workbench.py','exec')

class _Output(io.StringIO):
    def write(self,text):
        remaining=6000-self.tell()
        if remaining>0:super().write(text[:remaining])
        return len(text)

def _error_info(error):
    message=''
    args=BaseException.__getattribute__(error,'args')
    if args and type(args[0]) is str:message=args[0][:400]
    frames=traceback.extract_tb(error.__traceback__)
    line=next((f.lineno for f in reversed(frames) if f.filename=='workbench.py'),None)
    return {'name':type(error).__name__,'message':message,'line':line}

class _Results(unittest.TestResult):
    def __init__(self):super().__init__();self.records=[];self.current=None
    def startTest(self,test):
        super().startTest(test);key=test._testMethodName.removeprefix('test_')
        self.current={'label':_LABELS.get(key,key),'passed':True,'detail':''};self.records.append(self.current)
    def _fail(self,error):
        self.current['passed']=False
        info=_error_info(error)
        self.current['detail']=info['name']+((' · 第 '+str(info['line'])+' 行') if info['line'] else '')+('：'+info['message'] if info['message'] else '：该行为未满足约定，请检查这项输入或事件顺序。')
    def addFailure(self,test,err):super().addFailure(test,err);self._fail(err[1])
    def addError(self,test,err):super().addError(test,err);self._fail(err[1])
    def addSubTest(self,test,subtest,err):
        super().addSubTest(test,subtest,err)
        if err is not None:self._fail(err[1])
    def addSkip(self,test,reason):super().addSkip(test,reason);self.current.update(passed=False,detail='跳过不能作为通过。')

def _suite(task,module):
    pt=_PROTOCOL_TESTS;pt.M=module
    model={'test_canonical_data_value_equality_and_hash','test_frozen_and_independent_snapshot','test_invalid_constructor_values'}
    cls={'lifecycle':pt.Lifecycle,'cache':pt.Decorators,'shipment':pt.Protocols,'provider':pt.Protocols,'stream':pt.Streams,'pipeline':pt.Streams}[task]
    names=unittest.defaultTestLoader.getTestCaseNames(cls)
    if task=='shipment':names=[n for n in names if n in model]
    if task=='provider':names=[n for n in names if n not in model]
    if task=='stream':names=[n for n in names if not n.startswith('test_pipeline_')]
    if task=='pipeline':names=[n for n in names if n.startswith('test_pipeline_')]
    suite=unittest.TestSuite(cls(name) for name in names)
    class Extra(unittest.TestCase):
        def test_provider_duplicate_ids_still_call_once_each(self):
            rows=[module.Shipment('same',[2]),module.Shipment('same',[9])];seen=[]
            class Carrier:
                def quote(self,row):seen.append(row);return sum(row.weights)*3+len(seen)
            self.assertEqual(module.quote_batch(rows,Carrier()),[('same',7),('same',29)]);self.assertEqual(seen,rows)
        def test_invalid_limit_rejected_when_iteration_begins(self):
            def forbidden():raise AssertionError('must not open')
            for limit in (-1,True,1.5):
                cursor=module.take_matching(forbidden,lambda row:True,limit)
                with self.assertRaises(ValueError):list(cursor)
        def test_stream_preserves_identifier_whitespace(self):
            source=pt.Lines(['{"id":" X ","qty":3}'])
            self.assertEqual(list(module.stream_orders(lambda:source)),[{'id':' X ','qty':3}])
            self.assertEqual(source.closes,1)
    if task=='provider':suite.addTest(Extra('test_provider_duplicate_ids_still_call_once_each'))
    if task=='pipeline':suite.addTest(Extra('test_invalid_limit_rejected_when_iteration_begins'))
    if task=='stream':suite.addTest(Extra('test_stream_preserves_identifier_whitespace'))
    return suite

def _scene(task,m,mode):
    events=[]
    def event(text):
        if len(events)<24:events.append(text)
    class Device:
        def open(self):
            event('打开设备')
            if mode=='failure':raise OSError('模拟：打开失败')
        def close(self):
            event('关闭设备')
            if mode=='edge':raise OSError('模拟：清理失败')
    class Source:
        def __init__(self,rows):self.rows=iter(rows);self.reads=0;self.closes=0
        def __iter__(self):return self
        def __next__(self):
            value=next(self.rows);self.reads+=1;event('读取第 '+str(self.reads)+' 行');return value
        def close(self):self.closes+=1;event('关闭源，第 '+str(self.closes)+' 次')
    try:
        if task=='lifecycle':
            def factory():event('取得钥匙');return Device()
            with m.managed_session(factory):
                event('开始使用')
                if mode=='edge':raise ValueError('模拟：工作失败')
            event('借用结束')
        elif task=='cache':
            def key(*args,**kwargs):event('计算缓存键');return (args[0],kwargs.get('rate',2))
            calls=[]
            def quote(weight,/,*,rate=2):
                event('报价机实际运行');calls.append(weight)
                if mode=='edge' and len(calls)==1:raise ValueError('模拟：首次报价失败')
                return weight*rate
            cached=m.memoize_by_key(key)(quote)
            if mode=='edge':
                try:cached(4,rate=2)
                except BaseException as error:event('第一次请求：'+type(error).__name__)
                event('重试收到报价：'+str(cached(4,rate=2)))
            else:
                for _ in range(2):event('收到报价：'+str(cached(4,rate=2)))
                if mode=='failure':cached(weight=4)
                else:event('不同键收到报价：'+str(cached(6,rate=2)))
        elif task=='shipment':
            if mode=='failure':
                for bad in ([True],[0],[-1],[]):
                    try:m.Shipment('cargo-A',bad)
                    except BaseException as error:event('重量 '+str(bad)+'：'+type(error).__name__)
                    else:event('重量 '+str(bad)+'：被接受')
                return events
            weights=[3,4]
            row=m.Shipment('  cargo-A  ',weights);event('登记运单：'+row.identifier)
            weights.append(90);event('外部列表追加90；运单重量='+str(row.weights))
            if mode=='edge':
                other=m.Shipment('cargo-A',[3,4]);event('同内容相等='+str(row==other)+'，哈希相同='+str(hash(row)==hash(other)))
                row.identifier='changed'
        elif task=='provider':
            calls=[]
            class Carrier:
                def __init__(self,policy):self.policy=policy
                def quote(self,row):
                    event('承运商报价：'+row.identifier);calls.append(row)
                    if self.policy=='invalid':return True
                    if self.policy=='free':return 0
                    return sum(row.weights)*5+(len(calls) if self.policy=='stateful' else 0)
            rows=[m.Shipment('A',[2]),m.Shipment('A',[3])]
            policies=['invalid'] if mode=='edge' else ['stateful'] if mode=='failure' else ['weight','free']
            for policy in policies:
                result=m.quote_batch(rows,Carrier(policy));event(policy+' 回执：'+str(result))
        elif task=='stream':
            rows=[' ', '{"id":"A","qty":2}', 'bad-tail']
            source=Source(rows)
            def factory():event('打开货流');return source
            cursor=m.stream_orders(factory);event('已创建生成器；读取数='+str(source.reads))
            if mode=='normal':cursor.close();event('关闭尚未开始的生成器')
            else:
                try:
                    value=next(cursor);event('交出订单：'+value['id'])
                    if mode=='edge':next(cursor)
                finally:cursor.close()
                event('读取数='+str(source.reads)+'，关闭数='+str(source.closes))
        elif task=='pipeline':
            source=Source(['{"id":"skip","qty":1}','{"id":"keep","qty":8}','bad-tail'])
            def factory():event('打开货流');return source
            def select(row):
                event('筛选订单：'+row['id'])
                if mode=='edge':raise ValueError('模拟：筛选失败')
                return row['qty']>4
            if mode=='edge':
                early=m.take_matching(factory,lambda row:True,4)
                try:event('提前取一项：'+next(early)['id'])
                finally:early.close()
                event('外层关闭后源关闭数='+str(source.closes))
                source=Source(['{"id":"error","qty":3}'])
            cursor=m.take_matching(factory,select,0 if mode=='normal' else 1)
            try:
                for row in cursor:event('交出 '+row['id']+' 时关闭数='+str(source.closes))
            finally:cursor.close()
            event('读取数='+str(source.reads)+'，关闭数='+str(source.closes))
    except BaseException as error:
        info=_error_info(error);event('观察到 '+info['name']+'：'+info['message'])
        if isinstance(error,BaseExceptionGroup):
            for item in error.exceptions:event('保留子错误：'+type(item).__name__)
    return events

def _execute_protocol(request_json):
    request=json.loads(request_json);task=request.get('protocolTask');lesson=_PROTOCOL_LESSONS.get(task)
    if not lesson:return json.dumps({'ok':False,'passed':False,'checks':[],'error':{'name':'ValueError','message':'未知工作台，未记录通过。'}})
    output=_Output();code=request.get('code','');module=None;budget_used=0
    def budget(frame,event,arg):
        nonlocal budget_used
        if frame.f_code.co_filename in ('workbench.py','provided.py'):
            budget_used+=1
            if budget_used>150000:raise RuntimeError('运行步数过多，请检查循环、递归和惰性读取。')
        return budget
    try:
        compiled=_check_user_source(code)
        name='_workbench_'+hashlib.sha256(code.encode()).hexdigest()[:16]
        module=types.ModuleType(name)
        allowed='abs all any bool callable dict enumerate filter float frozenset hash int isinstance issubclass iter len list map max min next object ord pow print property range repr reversed round set slice sorted staticmethod classmethod str sum super tuple type zip Exception BaseException BaseExceptionGroup ExceptionGroup ValueError TypeError RuntimeError OSError KeyError IndexError AttributeError NotImplementedError AssertionError StopIteration GeneratorExit KeyboardInterrupt'.split()
        module.__dict__['__builtins__']={key:getattr(builtins,key) for key in allowed}
        module.__dict__['__builtins__'].update(__build_class__=builtins.__build_class__,__import__=_user_import)
        sys.modules[name]=module;sys.settrace(budget)
        with contextlib.redirect_stdout(output),contextlib.redirect_stderr(output):
            exec(compile(lesson.get('supportCode',''),'provided.py','exec'),module.__dict__)
            exec(compiled,module.__dict__)
            if globals().get('_restore_exports', lambda: False)():raise ValueError('共享标准库类型不可修改。')
            result=_Results();_suite(task,module).run(result)
            if globals().get('_restore_exports', lambda: False)():raise ValueError('共享标准库类型不可修改。')
            events=_scene(task,module,request.get('scene','normal'))
        checks=result.records
        return json.dumps({'ok':True,'passed':bool(checks) and all(item['passed'] for item in checks),'checks':checks,'stdout':output.getvalue(),'effects':[],'worldEvents':events,'codeSha256':hashlib.sha256(code.encode()).hexdigest(),'protocolTask':task},ensure_ascii=False)
    except BaseException as error:
        return json.dumps({'ok':False,'passed':False,'checks':[],'stdout':output.getvalue(),'effects':[],'error':_error_info(error)},ensure_ascii=False)
    finally:
        sys.settrace(None)
        globals().get('_restore_exports', lambda: False)()
        if module is not None:sys.modules.pop(module.__name__,None)
        if _PROTOCOL_TESTS is not None:_PROTOCOL_TESTS.M=None
