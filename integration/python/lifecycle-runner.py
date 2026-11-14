"""Awaited lifecycle grader for Pyodide WebLoop; educational, not a security sandbox."""
import ast
import asyncio
import builtins
import contextlib
import hashlib
import inspect
import io
import json
import sys
import traceback
import types
import unittest

_TASKS = {'multi_resource': ('MultiResourceTests', 19), 'async_stream': ('AsyncStreamTests', 20), 'bounded_map': ('BoundedMapTests', 21)}
_TEST_SOURCES = {}
_LABELS = {}
_EXPORTS = {
    'contextlib': ('contextmanager','asynccontextmanager','closing','aclosing','ExitStack','AsyncExitStack','nullcontext'),
    'asyncio': ('Event','Lock','Semaphore','BoundedSemaphore','Queue','QueueEmpty','QueueFull','Future','TaskGroup','CancelledError','TimeoutError','create_task','current_task','all_tasks','gather','wait','wait_for','timeout','sleep','FIRST_COMPLETED','FIRST_EXCEPTION','ALL_COMPLETED','get_running_loop','ensure_future','shield'),
    'collections': ('deque','Counter'),
    'typing': ('Any','Iterable','Iterator','AsyncIterable','AsyncIterator','Callable','Awaitable','TypeVar','Generic','Protocol'),
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


_MODULES = {name:_ReadOnlyModule({key:getattr(__import__(name),key) for key in exports}) for name,exports in _EXPORTS.items()}
_DUNDERS = {'__init__','__enter__','__exit__','__aenter__','__aexit__','__iter__','__next__','__aiter__','__anext__','__await__','__bool__','__len__','__getitem__','__setitem__','__contains__','__call__','__eq__','__hash__','__name__','__doc__','__annotations__','__cause__','__context__'}


def _install_lifecycle(payload_json):
    global _TEST_SOURCES,_LABELS
    payload=json.loads(payload_json)
    _TEST_SOURCES=payload['tests']
    _LABELS=payload['labels']


def _import(name,globals=None,locals=None,fromlist=(),level=0):
    if level or name not in _MODULES:raise ImportError('本工作台仅开放合同所需的标准库接口。')
    if any(key not in _EXPORTS[name] for key in fromlist or ()):raise ImportError('该接口未在网页工作台开放。')
    return _MODULES[name]


def _compile_learner(code):
    if type(code) is not str or len(code)>20000:raise ValueError('单次运行限20,000字符；导出和本地运行不受此输入框限制。')
    tree=ast.parse(code,filename='learner.py')
    for node in ast.walk(tree):
        if isinstance(node,ast.Name) and node.id.startswith('__') and node.id not in ('__name__',):
            raise ValueError('不开放运行器内部名称。')
        if isinstance(node,ast.Attribute) and node.attr.startswith('__') and node.attr not in _DUNDERS:
            raise ValueError('不开放内部属性；任务所需协议方法可以使用。')
        if isinstance(node,(ast.Import,ast.ImportFrom)):
            names=[alias.name for alias in node.names] if isinstance(node,ast.Import) else [node.module]
            if getattr(node,'level',0) or any(name not in _EXPORTS for name in names):
                raise ImportError('网页工作台可用模块：'+', '.join(k for k in _EXPORTS if not k.startswith('_')))
            if isinstance(node,ast.ImportFrom) and any(alias.name not in _EXPORTS[node.module] for alias in node.names):
                raise ImportError('导入接口不在网页合同内。')
    return compile(tree,'learner.py','exec')


class _Output(io.StringIO):
    def write(self,value):
        left=6000-self.tell()
        if left>0:super().write(value[:left])
        return len(value)


def _info(error):
    args=BaseException.__getattribute__(error,'args')
    message=args[0][:600] if args and type(args[0]) is str else '该行为没有满足约定。'
    frames=traceback.extract_tb(error.__traceback__)
    line=next((frame.lineno for frame in reversed(frames) if frame.filename=='learner.py'),None)
    return {'name':type(error).__name__,'message':message,'line':line}


def _leaves(error):
    if isinstance(error,BaseExceptionGroup):return [leaf for child in error.exceptions for leaf in _leaves(child)]
    return [error]


async def _signal(event):
    await asyncio.wait_for(event.wait(),1.5)


async def _settle(task,*gates):
    for gate in gates:gate.set()
    if not task.done():task.cancel()
    await asyncio.gather(task,return_exceptions=True)


def _load_contracts(task,module):
    support=types.ModuleType('_lifecycle_support')
    def candidate(name):
        if name!=task:raise ValueError('合同与候选不匹配')
        return module
    support.__dict__.update(candidate=candidate,leaves=_leaves,signal=_signal,settle=_settle)
    sys.modules['_lifecycle_support']=support
    tests=types.ModuleType('_lifecycle_tests_'+task)
    source=_TEST_SOURCES[task]
    original='from tests.support import '
    if original not in source:raise ValueError('固定合同入口缺失')
    source=source.replace(original,'from _lifecycle_support import ',1)
    exec(compile(source,'contracts/'+task+'.py','exec'),tests.__dict__)
    return getattr(tests,_TASKS[task][0])


async def _call_case(case):
    case.setUp()
    if isinstance(case,unittest.IsolatedAsyncioTestCase):await case.asyncSetUp()
    try:
        outcome=getattr(case,case._testMethodName)()
        if inspect.isawaitable(outcome):await outcome
    finally:
        if isinstance(case,unittest.IsolatedAsyncioTestCase):await case.asyncTearDown()
        case.tearDown()
        # The frozen contracts do not register cleanups; fail closed if this changes.
        if case._cleanups:raise RuntimeError('新增cleanup需要先扩展异步适配器，不能跳过。')


async def _close_new_tasks(before):
    current=asyncio.current_task()
    tasks={task for task in asyncio.all_tasks() if task not in before and task is not current and not task.done()}
    for task in tasks:task.cancel()
    if tasks:
        _,pending=await asyncio.wait(tasks,timeout=0.2)
    else:pending=set()
    return len(tasks),len(pending)


async def _execute_lifecycle(request_json):
    request=json.loads(request_json)
    task=request.get('lifecycleTask')
    if task not in _TASKS:
        return json.dumps({'ok':False,'passed':False,'checks':[],'error':{'name':'ValueError','message':'未知生命周期任务；未记录通过。'}})
    before=set(asyncio.all_tasks())
    output=_Output();module=None;used=0;checks=[];scene=[];fatal=None
    code=request.get('code','')
    def trace(frame,event,arg):
        nonlocal used
        if frame.f_code.co_filename=='learner.py':
            used+=1
            if used>300000:raise RuntimeError('本次运行步数过多；请检查循环终止条件。')
        return trace
    try:
        compiled=_compile_learner(code)
        name='_learner_'+hashlib.sha256(code.encode()).hexdigest()[:16]
        module=types.ModuleType(name)
        allowed='abs all any aiter anext bool callable dict enumerate filter float frozenset getattr hasattr hash id int isinstance issubclass iter len list map max min next object ord pow print property range repr reversed round set slice sorted staticmethod classmethod str sum super tuple type zip Exception BaseException BaseExceptionGroup ExceptionGroup ValueError TypeError RuntimeError OSError LookupError KeyError IndexError AttributeError NotImplementedError AssertionError StopIteration StopAsyncIteration GeneratorExit KeyboardInterrupt'.split()
        module.__dict__['__builtins__']={key:getattr(builtins,key) for key in allowed}
        module.__dict__['__builtins__'].update(__build_class__=builtins.__build_class__,__import__=_import)
        sys.modules[name]=module
        with contextlib.redirect_stdout(output),contextlib.redirect_stderr(output):
            sys.settrace(trace)
            exec(compiled,module.__dict__)
            if globals().get('_restore_exports', lambda: False)():raise ValueError('共享标准库类型不可修改。')
            cls=_load_contracts(task,module)
            names=unittest.defaultTestLoader.getTestCaseNames(cls)
            if len(names)!=_TASKS[task][1]:raise RuntimeError('固定合同数量变化；适配器必须同步更新，不能空验收。')
            for index,name in enumerate(names):
                baseline=set(asyncio.all_tasks())
                case=cls(name)
                record={'id':name,'label':_LABELS.get(name,name.removeprefix('test_').replace('_',' ')),'passed':False,'detail':''}
                progress=globals().get('_lifecycle_progress')
                if progress is not None:
                    try:progress(index,len(names),record['label'])
                    except Exception:pass
                case_task=asyncio.create_task(_call_case(case))
                try:
                    # This watchdog detects a stuck contract, not timing-dependent correctness.
                    await asyncio.wait_for(case_task,3.0)
                    record['passed']=True
                except BaseException as error:
                    info=_info(error);record['detail']=info['name']+'：'+info['message'];record['error']=info
                finally:
                    if globals().get('_restore_exports', lambda: False)():
                        record['passed']=False
                        record['detail']='共享标准库类型不可修改。'
                    leaks,pending=await _close_new_tasks(baseline)
                    if leaks:
                        record['passed']=False;record['leakedTasks']=leaks;record['stillPendingTasks']=pending
                        record['detail']+=' 退出时仍有未收尾任务。'
                checks.append(record)
                if progress is not None:
                    try:progress(index+1,len(names),record['label'])
                    except Exception:pass
                if record.get('stillPendingTasks'):raise RuntimeError('任务拒绝停止；本次工作台会销毁，不认证通过。')
            scene_task=asyncio.create_task(_scene_lifecycle(task,module,request.get('scene','normal')))
            try:scene=await asyncio.wait_for(scene_task,3.0)
            except BaseException as error:scene=['场景未完成：'+_info(error)['name']]
    except BaseException as error:
        fatal=_info(error)
    finally:
        sys.settrace(None)
        globals().get('_restore_exports', lambda: False)()
        leaks,pending=await _close_new_tasks(before)
        if leaks:
            fatal={'name':'LifecycleLeak','message':'本次运行结束时仍有后台任务，未记录通过。','leakedTasks':leaks,'stillPendingTasks':pending}
        if module is not None:sys.modules.pop(module.__name__,None)
        sys.modules.pop('_lifecycle_support',None)
    response={'ok':fatal is None,'passed':fatal is None and len(checks)==_TASKS[task][1] and all(x['passed'] for x in checks),
              'checks':checks,'stdout':output.getvalue(),'worldEvents':scene,'effects':[],
              'lifecycleTask':task,'expectedChecks':_TASKS[task][1],'python':sys.version.split()[0],
              'codeSha256':hashlib.sha256(code.encode()).hexdigest() if type(code) is str else None,
              'surface':'awaited lifecycle contracts, not native unittest.run','sandboxClaim':False}
    if fatal:response['error']=fatal
    return json.dumps(response,ensure_ascii=False)
