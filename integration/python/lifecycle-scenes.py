async def _scene_lifecycle(task,module,mode):
    events=[]
    def log(text):
        if len(events)<36:events.append(text)
    if mode not in ('normal','failure','cancel'):raise ValueError('未知观察场景')
    try:
        if task=='multi_resource':
            class Device:
                def __init__(self,name):self.name=name
                def open(self):
                    log('打开 '+self.name)
                    if mode=='failure' and self.name=='B 闸门':raise ValueError('B 部分打开失败')
                def close(self):
                    log('关闭 '+self.name)
                    if mode=='failure' and self.name=='B 闸门':raise OSError('B 关闭也失败')
            def factory(name):
                def acquire():log('取得 '+name);return Device(name)
                return acquire
            with module.managed_resources([factory('A 电源'),factory('B 闸门'),factory('C 记录器')]):
                log('三件资源交给皮皮')
                if mode=='cancel':raise KeyboardInterrupt('模拟控制中断')
            log('范围完整退出')
        elif task=='async_stream':
            reading=asyncio.Event();read_gate=asyncio.Event();closing=asyncio.Event();close_gate=asyncio.Event()
            class Source:
                def __init__(self):self.count=0;self.closes=0
                def __aiter__(self):return self
                async def __anext__(self):
                    self.count+=1;log('请求第 '+str(self.count)+' 项');reading.set()
                    if mode=='cancel':await read_gate.wait()
                    if mode=='failure':raise OSError('模拟读取故障')
                    if self.count>3:raise StopAsyncIteration
                    log('产生读数 '+str(self.count));return self.count
                async def aclose(self):
                    self.closes+=1;log('开始关闭源，第 '+str(self.closes)+' 次');closing.set()
                    if mode=='cancel':await close_gate.wait()
                    log('源已关闭')
            source=Source()
            async def opener():log('取得异步源');return source
            stream=module.stream_owned(opener)
            log('只创建生成器，尚未请求数据')
            if mode=='cancel':
                pending=asyncio.create_task(anext(stream))
                try:
                    await _signal(reading);log('请求取消');pending.cancel();await _signal(closing)
                    log('清理未放行时任务'+('已经结束（不应如此）' if pending.done() else '仍在等待'))
                    close_gate.set()
                    try:await pending
                    except asyncio.CancelledError:log('观察到取消完成，源已收好')
                finally:
                    await _settle(pending,read_gate,close_gate);await stream.aclose()
            else:
                try:log('交给汤圆的读数：'+str(await anext(stream)))
                finally:await stream.aclose()
            log('实际拉取 '+str(source.count)+' 次，关闭 '+str(source.closes)+' 次')
        else:
            if mode=='normal':
                started=[asyncio.Event() for _ in range(3)];gates=[asyncio.Event() for _ in range(3)];done=[asyncio.Event() for _ in range(3)]
                async def worker(index):
                    log('开始维修 '+str(index));started[index].set();await gates[index].wait()
                    log('完成维修 '+str(index));done[index].set();return index+10
                pending=asyncio.create_task(module.map_bounded([0,1,2],3,worker))
                try:
                    for event in started:await _signal(event)
                    for index in (2,1,0):gates[index].set();await _signal(done[index])
                    log('按输入顺序交回：'+str(await pending))
                finally:await _settle(pending,*gates)
            else:
                started=asyncio.Event();release=asyncio.Event();closing=asyncio.Event();close_gate=asyncio.Event();count=0
                async def worker(index):
                    nonlocal count
                    count+=1;log('开始维修 '+str(index))
                    if count==2:started.set()
                    if index==0 and mode=='failure':
                        await release.wait();log('维修 0 失败');raise ValueError('维修故障')
                    try:await asyncio.Event().wait()
                    finally:
                        log('维修 '+str(index)+' 开始清理');closing.set();await close_gate.wait();log('维修 '+str(index)+' 清理完成')
                pending=asyncio.create_task(module.map_bounded([0,1],2,worker))
                try:
                    await _signal(started)
                    if mode=='cancel':log('请求整体取消');pending.cancel()
                    else:release.set()
                    await _signal(closing)
                    log('清理未放行时调度器'+('已返回（不应如此）' if pending.done() else '仍在等待'))
                    close_gate.set()
                    try:await pending
                    except asyncio.CancelledError:log('整体取消完成')
                    except BaseExceptionGroup as error:log('全部收尾后报告 '+type(error).__name__)
                finally:await _settle(pending,release,close_gate)
    except BaseException as error:
        log('观察到 '+_info(error)['name']+'：'+_info(error)['message'])
        if isinstance(error,BaseExceptionGroup):
            for child in error.exceptions:log('保留原始子错误：'+type(child).__name__)
    return events
