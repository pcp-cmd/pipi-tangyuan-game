import { scaffoldLesson } from './course-learning-scaffolds.mjs';

const RAW_LIFECYCLE_LESSON_DATA = [
  {
    "id": "lifecycle-multi-resource",
    "title": "借来的三把钥匙",
    "topic": "多资源所有权、部分打开、逆序清理与异常组",
    "description": "多资源所有权、部分打开、逆序清理与异常组。这是同步高级任务，先理解 with、try/finally、Exception 与 BaseException 的捕获范围，并完成单资源生命周期；通过仅记录实践证据。",
    "starter": "\"\"\"关卡 L01 · 借来的三把钥匙。详见 docs/L01.md。\"\"\"\nfrom contextlib import contextmanager\n\n\n@contextmanager\ndef managed_resources(factories):\n    # TODO: 取得与打开并非同一个时刻；画出每个资源的所有者。\n    # 只改此文件，不需要修改测试。\n    raise NotImplementedError('请完成多资源生命周期')\n    yield ()\n",
    "solution": "\"\"\"参考实现；先独立完成 exercises 版本再阅读。\"\"\"\nfrom contextlib import contextmanager\n\n\n@contextmanager\ndef managed_resources(factories):\n    acquired = []\n    primary = None\n    try:\n        for factory in factories:\n            resource = factory()\n            acquired.append(resource)\n            resource.open()\n        yield tuple(acquired)\n    except BaseException as exc:\n        primary = exc\n        raise\n    finally:\n        cleanup_errors = []\n        for resource in reversed(acquired):\n            try:\n                resource.close()\n            except BaseException as exc:\n                cleanup_errors.append(exc)\n        if cleanup_errors:\n            errors = ([primary] if primary is not None else []) + cleanup_errors\n            if len(errors) == 1:\n                raise errors[0]\n            raise BaseExceptionGroup('resource scope failed', errors)\n",
    "concept": "网页用法：请在当前页编辑代码并点击“运行真实验收”；下文的 python3、grade.py 和 examples/observe.py 命令仅适用于完整原生课程包，当前网页包不含这些 CLI 脚本。\n\n# L01 · 借来的三把钥匙\n\n潮水要涨了。皮皮先借电源，再借闸门，再借记录器。闸门依赖电源，所以必须先关闸门再断电。汤圆发现：第二把钥匙有时只转到一半就卡住，而且归还钥匙本身也可能失败。\n\n你的工作不是只让正常故事通过，而是让每个已取得的资源都有人负责，失败时也不丢掉线索。\n\n## 先修与预测\n\n先能解释 `with`、`try/finally`、普通异常与 `BaseException` 的区别，完成旧协议岛单资源生命周期。这里不重新考单资源题，而是加入多个资源的依赖和多重失败。\n\n运行 `python3 examples/observe.py L01` 前预测：工厂 A 成功、打开 A 成功、工厂 B 成功、打开 B 失败，B 的关闭也失败。C 是否会被询问？A 和 B 按什么顺序关闭？最终异常中应留下哪些对象？\n\n## 任务与合同\n\n在 `exercises/multi_resource.py` 实现 `managed_resources(factories)`，返回同步上下文管理器。\n\n1. `factories` 是有限、可只读一次的工厂可迭代对象。创建管理器时不能消费它；进入 `with` 后按顺序取得工厂。工厂无参返回有 `open()`/`close()` 的资源。本题每次返回不同的资源实例，且范围外不会同时关闭它；重复借入同一实例的共享所有权协议不在范围内。\n2. 每个资源一经工厂返回，所有权就归本范围。**先登记，再打开**：即使 `open()` 部分失败，该资源仍需关闭。题设保证这样关闭合法。\n3. 全部打开成功才执行 `with` 块，并交出按取得顺序排列的 tuple，里面是同一批资源对象。空输入也应正常执行块。\n4. 工厂/工厂迭代器/打开/块内任何一步失败，都不再询问后面的工厂，不运行不该运行的块。\n5. 所有已取得资源按逆序关闭，各恰好一次。某个关闭失败，仍继续关闭其他资源。\n6. 没有清理错误时，主要错误保留同一异常对象向上传播，含 `KeyboardInterrupt`。只有一个清理错误且无主要错误时，传播该原对象。\n7. 有两个或更多错误时，抛 `BaseExceptionGroup`：主要错误在前，清理错误随后按实际逆序关闭顺序排列。不要只记录文字，也不要把错误换成“失败了”。\n8. 范围之间不共享资源状态。没有取得的资源不能凭空关闭。一个范围不会“回滚”已经发生的外部业务效果。\n\n## 知识卡\n\n- 工厂返回是所有权转移；`open()` 成功不是转移点。这是本题约定，并非所有第三方 API 都一样。\n- `ExitStack` 可以帮助管理动态数量的清理，但它不会自动满足“把所有异常按本合同放进一个组”的额外要求。采用库工具时仍要核对其异常语义。\n- 异常处理范围应覆盖取得过程，而不是只有最终业务块。\n- `ExceptionGroup` 只容纳 `Exception`；存在 `KeyboardInterrupt` 等对象时需要 `BaseExceptionGroup`。构造器可以在合适时返回较具体的 `ExceptionGroup`。\n\n## 协议终止信号的边界\n\n工厂、open 与 close 应用领域异常报告故障，不用 `StopIteration`/`StopAsyncIteration` 冒充普通错误。工厂可迭代对象自身的 `StopIteration` 是正常结束。本题的原错误身份合同不把这些终止哨兵作为业务故障输入。\n\n生成器式上下文管理器内若工厂直接抛 `StopIteration`，Python 会把它转换成 `RuntimeError`，`__cause__` 留着原信号；类式上下文管理器可直接传播原信号。两者在合法输入域等价，不能反推对非法协议使用也完全相同。实际见证保存在 `evidence/protocol-boundaries.json`，不是宣称抛错工厂已成功取得资源。\n\n## 三级提示\n\n1. 画一列“已经取得的资源”，每次取得立刻加入。每条失败路径都从这里逆序退出。\n2. 清理循环每次单独捕获错误，先收集，再决定最终传播什么。不能让第一个 `close` 异常截断后续清理。\n3. `@contextmanager` 的 `yield` 前是进入；`yield` 收到的异常来自块内；`finally` 是统一出口。另一种解法是类的 `__enter__`/`__exit__`，两种都允许。\n\n## 运行与调试\n\n```sh\npython3 grade.py multi_resource exercises/multi_resource.py\n```\n\n先让正常顺序通过，再分别解决：第二个工厂失败、第二个打开失败、两个 close 失败、主要错误加两个 close 失败。一次只修改一个假设。测试拒绝“顺序关闭”“先打开再登记”“清理第一个错误就退出”等错解，不按实现风格评分。\n\n## 独立迁移与掌握证据\n\n陌生题：三份临时输出只在全部成功后发布，发布失败会留下已发布的第一份。请分清资源关闭和业务事务，不要把本题自动套成“全有或全无”。设计一个能暴露这个误解的事件序列。\n\n闭卷解释：为什么部分打开也清理？为什么 `finally` 里简单抛一个 close 错误会掩盖主要失败？在新名字、新数量和不同失败位置下独立实现，并写一个自己的反例。1/7/21 天可手动再做，当前没有自动安排复习，也没有学生掌握记录。\n",
    "hint": "先读合同，预测正常、故障和同步控制中断时的资源取得、关闭与异常传播顺序。",
    "boundary": "内存对象的生命周期合同，不证明真实OS资源、外部事务或全部Python掌握。",
    "transfer": "导出代码后完成原生课程里的陌生迁移练习。",
    "chapter": 7,
    "islandId": "lifecycle-depths",
    "reward": 20,
    "xp": 20,
    "judgeKind": "lifecycle",
    "lifecycleTask": "multi_resource",
    "checks": [],
    "prerequisites": [
      "protocol-lifecycle"
    ],
    "prerequisitePolicy": "advisory",
    "assessmentContract": "lifecycle-web-v0.1",
    "sceneModes": [
      "normal",
      "failure",
      "cancel"
    ],
    "knowledgePrerequisites": [
      "同步上下文管理器：with 与进入/退出协议",
      "try/finally；Exception 与 BaseException 的捕获范围",
      "单资源所有权与清理（protocol-lifecycle）"
    ],
    "learnerMastery": "unobserved"
  },
  {
    "id": "lifecycle-async-stream",
    "title": "不会偷偷续流的灯塔",
    "topic": "异步生成器、按需读取、显式关闭与取消收尾",
    "description": "异步生成器、按需读取、显式关闭与取消收尾。这是高级任务，先修资源管理、async/await、Event与取消；通过仅记录实践证据。",
    "starter": "\"\"\"关卡 L02 · 不会偷偷续流的灯塔。详见 docs/L02.md。\"\"\"\nasync def stream_owned(open_source):\n    # TODO: 第一条需求才打开；每次 anext 只拉取一项。\n    # break 不自动保证关闭仍被引用的生成器，调用方要显式 aclose。\n    raise NotImplementedError('请完成异步源的拥有者')\n    yield None\n",
    "solution": "\"\"\"拥有异步源；本题只承诺读取期间的一次取消，见合同。\"\"\"\nasync def stream_owned(open_source):\n    source = await open_source()\n    primary = None\n    try:\n        async for item in source:\n            yield item\n    except BaseException as exc:\n        primary = exc\n        raise\n    finally:\n        try:\n            await source.aclose()\n        except BaseException as cleanup:\n            if primary is not None and not isinstance(primary, GeneratorExit):\n                raise BaseExceptionGroup('read and close failed', [primary, cleanup])\n            raise\n",
    "concept": "网页用法：请在当前页编辑代码并点击“运行真实验收”；下文的 python3、grade.py 和 examples/observe.py 命令仅适用于完整原生课程包，当前网页包不含这些 CLI 脚本。\n\n# L02 · 不会偷偷续流的灯塔\n\n汤圆的海况源必须等待新消息。皮皮只想看下一条，却发现旧机器已经读完全部消息；点“停”以后画面变了，资源却还在收尾。你要分清“请求停止”和“已经结束”。\n\n## 先修与预测\n\n先完成同步生成器、`yield`、`async def`/`await`、AE26 F09 的 Event 与取消实验。这里不教网络接入，所有源都在内存里。\n\n运行 `python3 examples/observe.py L02` 前预测：第一次 `anext` 正在等消息时取消它，清理函数又在等另一个闸门。取消请求发出后，任务应立即报告完成吗？释放清理闸门以后应出现什么顺序？\n\n## 任务与合同\n\n在 `exercises/async_stream.py` 实现异步生成器 `stream_owned(open_source)`。\n\n1. 调用只创建异步生成器。第一次 `anext` 才 `await open_source()`；尚未开始就 `aclose()` 不调用 opener。\n2. opener 返回具有异步迭代协议和异步 `aclose()` 的源。取得返回值后生成器拥有它。源与其 `__aiter__` 返回的迭代器可以不同，最终关闭的是源。源操作可抛普通异常或 `CancelledError`，`GeneratorExit` 保留为生成器关闭控制信号。\n3. 每次需求只拉取一项，返回同一对象，不预读、不缓存全部内容，不丢掉 `0`、`False`、`None` 或空字符串。没有真实需求时不继续拉取。\n4. 正常耗尽、显式 `aclose()`、消费方 `athrow()`、读取/创建迭代器失败，都等待源的 `aclose()` 恰好完成一次。\n5. opener 失败时尚未取得源，原错误保留身份。opener 若在内部部分取得资源，其失败清理由 opener 自己负责，外层不能猜测资源。\n6. 读取期间收到一次取消时，不吞 `CancelledError`。必须等待已拥有源的异步清理完成，调用方才能观察到结束。不得在取消后继续产生读取效果。\n7. 清理成功时，读取或消费方错误保留同一对象。只有清理失败时传播原清理错误。读取/取消与清理同时失败，用 `BaseExceptionGroup([主要错误, 清理错误])` 保留对象和顺序。\n8. `aclose` 产生的 `GeneratorExit` 是正常关闭控制，不作为额外业务错误塞进组；若此时关闭失败，仅传播关闭错误。\n\n## 知识卡\n\n- 有 `yield` 不代表没有预取。先用列表推导吃完异步源，再 yield，仍然不是按需读取。\n- `async for` 的 `break` 不保证仍被引用的异步生成器当场关闭。用 `async with contextlib.aclosing(stream): ...` 明确消费方的退出责任。\n- 生产者拥有源，消费方拥有生产者的使用范围；不要让两边重复关同一个底层资源。\n- `cancel()` 只是请求。`await task` 才能观察到任务退出和错误。UI 不能把“已点取消”当成“没有后台工作”。\n- 捕获 `BaseException` 只为保存错误并清理，不为吞掉控制信号。\n\n## 明确边界\n\n本题检查的是**读取/打开等待期间的一次取消**。没有声称能抵挡清理过程中再次取消、进程强制终止、操作系统崩溃或不合作的源。`shield` 只保护被包住的任务，不自动替调用方等待，也不是通用“不会泄漏”魔法。源的 `aclose()` 必须最终返回或抛错；永久卡住的清理需要另外的超时与恢复合同。\n\n取消不能撤销已发生的远端发送，也不会自动停止任意线程。本题不接真实网络、不授予恢复重试能力。\n\n## 协议终止信号的边界\n\n`__anext__` 抛 `StopAsyncIteration` 表示正常耗尽。opener 或 aclose 不应使用 `StopIteration`/`StopAsyncIteration` 作为普通故障；没有数据应返回一个空源，而不是让 opener 抛终止哨兵。异步生成器边界会将这类漏出的终止信号转换为 `RuntimeError`，`__cause__` 保留原信号，不能承诺外层仍是同一异常对象。此非法协议使用不在“普通故障保留原对象”的合同内；包内有真实语言边界见证。\n\n## 三级提示\n\n1. 把“尚未开始”“已经拥有源”“正在等待一项”“正在清理”“已退出”画成状态图。\n2. 将整个异步迭代放在 `try/finally`，但先保存可能存在的主要错误，否则清理失败会覆盖它。\n3. `async for` 或显式 `aiter`/`anext` 都允许。重点是取得对象、每次拉取和清理的位置，不是要求某个关键字写法。\n\n## 运行与调试\n\n```sh\npython3 grade.py async_stream exercises/async_stream.py\n```\n\n验收用 Event 精确控制到达读闸门与清理闸门。1.5 秒仅是挂死看门狗，不靠“睡够时间”判断顺序。故意漏掉 aclose、提前全部读取、吞掉取消，分别观察哪个合同失败。\n\n## 独立迁移与掌握证据\n\n陌生题：无限传感器源，每十项生成一个摘要，消费者只要三份摘要。先写清早停关闭、最多读到第几项、尾部异常是否应该被看到，再独立实现和反测。不要直接假定本题已经验证批量聚合。\n\n闭卷解释：为什么 `break` 不足以表达关闭责任？取消和清理错误如何同时可见？如果调用方在清理阶段又取消一次，当前合同哪里不再覆盖？迁移与延迟复做仍是未观察状态。\n",
    "hint": "先读合同，预测正常、故障和取消的事件顺序。",
    "boundary": "内存对象的生命周期合同，不证明真实OS资源、外部事务或全部Python掌握。",
    "transfer": "导出代码后完成原生课程里的陌生迁移练习。",
    "chapter": 7,
    "islandId": "lifecycle-depths",
    "reward": 20,
    "xp": 20,
    "judgeKind": "lifecycle",
    "lifecycleTask": "async_stream",
    "checks": [],
    "prerequisites": [
      "protocol-stream",
      "lifecycle-multi-resource"
    ],
    "prerequisitePolicy": "advisory",
    "assessmentContract": "lifecycle-web-v0.1",
    "sceneModes": [
      "normal",
      "failure",
      "cancel"
    ],
    "knowledgePrerequisites": [
      "contextmanager/generator",
      "async/await",
      "asyncio.Event",
      "task.cancel followed by await"
    ],
    "learnerMastery": "unobserved"
  },
  {
    "id": "lifecycle-bounded-map",
    "title": "三个泊位的救援队",
    "topic": "有界并发、输入需求、结果顺序和全部任务收尾",
    "description": "有界并发、输入需求、结果顺序和全部任务收尾。这是高级任务，先修资源管理、async/await、Event与取消；通过仅记录实践证据。",
    "starter": "\"\"\"关卡 L03 · 三个泊位的救援队。详见 docs/L03.md。\"\"\"\nasync def map_bounded(items, limit, worker):\n    # TODO: 限制存活工作，保持输入顺序，退出前等待自己的子任务收尾。\n    raise NotImplementedError('请完成有界并发调度')\n",
    "solution": "import asyncio\n\n\nasync def map_bounded(items, limit, worker):\n    if type(limit) is not int or limit <= 0:\n        raise ValueError('limit must be a positive int, not bool')\n    iterator = iter(items)\n    results = []\n    owner = asyncio.current_task()\n    initial_cancellations = owner.cancelling()\n\n    async def consume():\n        try:\n            while True:\n                try:\n                    item = next(iterator)\n                except StopIteration:\n                    return\n                index = len(results)\n                results.append(None)\n                results[index] = await worker(item)\n        except asyncio.CancelledError:\n            # TaskGroup alone tolerates child cancellation. Relay it to the\n            # owning scope, whether it came from input iteration or worker.\n            # A pre-existing cancellation count is not a new cancellation.\n            if owner.cancelling() <= initial_cancellations:\n                owner.cancel()\n            raise\n\n    async with asyncio.TaskGroup() as group:\n        for _ in range(limit):\n            group.create_task(consume())\n    return results\n",
    "concept": "网页用法：请在当前页编辑代码并点击“运行真实验收”；下文的 python3、grade.py 和 examples/observe.py 命令仅适用于完整原生课程包，当前网页包不含这些 CLI 脚本。\n\n# L03 · 三个泊位的救援队\n\n雾夜只有三个泊位，九艘船等待维修。一次安排九份工作会挤满码头，只安排一份又让另外两个泊位空着。后来一艘船发生故障，皮皮发现函数已经报错，另外两艘却还在后台动工。\n\n## 先修与预测\n\n先能写 async worker、理解 Event、取消传播、`try/finally`；阅读 AE26 F09 对 TaskGroup 的介绍。L02 的资源清理有助于理解本关，但不必调用 L02 的答案。\n\n运行 `python3 examples/observe.py L03` 前，画出“两个 worker 已开始 → 第一个失败 → 请求第二个取消 → 第二个开始清理 → 清理允许完成 → 调度函数才报错”的因果顺序。\n\n## 任务与合同\n\n在 `exercises/bounded_map.py` 实现 `async def map_bounded(items, limit, worker)`。\n\n1. `limit` 严格为正 int，排除 bool；非法值抛 `ValueError`，且不询问 items、不调用 worker。\n2. 输入是有限、可能只读一次的同步可迭代对象。调用方借给调度器，不移交 `close()` 所有权。最初 `iter(items)` 失败，保留同一异常对象。\n3. `worker(item)` 返回可等待对象；正常路径每项恰好调用一次。失败/取消后的未开始项不保证处理，已开始项不自动重试。最多有 limit 个未完成的工作。独立阻塞工作要能并发推进，不可用串行循环冒充有界并发。\n4. 当所有槽位都在等待时，不继续消费输入，不为全部输入预先创建任务。空输入返回 `[]`，零 worker 调用。\n5. 正常结束返回 list，顺序与输入一致，保留 worker 返回对象身份和所有假值。完成顺序可以不同。\n6. worker 调用/执行或输入 `next` 发生普通异常时，请求其余已启动工作取消，并等待全部收尾；以异常组传播实际错误，保留原始叶子异常对象。兄弟清理也失败时不能丢失它。组的具体嵌套形状不评分。\n7. 调用方取消时，取消自己的子任务并等它们收尾，再传播 `CancelledError`。不能先返回，再把清理留在后台。\n8. worker 自行取消或输入 `next` 发出 `CancelledError`，也不得作为成功 `None` 或空列表结果：整体取消并等待兄弟收尾。当取消路径本身没有额外清理错误时，调用方看到 `CancelledError`。\n9. 已发生的业务效果不会因异常或取消自动撤销。任务必须合作地响应取消；不承诺强杀不合作协程、线程或进程。重复取消的竞态和清理永久卡住不属于本关合同。\n\n## 知识卡\n\n- `Semaphore` 只限制进入临界区的数量，若先创建一百万任务，任务对象仍是一百万个。这里连输入需求也绑定空闲槽。\n- `TaskGroup` 管理生命周期范围，退出前等待子任务。`gather` 某一任务失败的默认行为并不自动提供同样的兄弟取消与收尾保证。\n- **TaskGroup 本身把子任务的取消视为非失败。** 如果实现预留结果槽，某个子任务自行取消可能让槽位保留 `None`，甚至让其他任务永久等待。本关要求调度器明确处理这条路径。\n- 参考解将自行取消转给范围拥有者，使 TaskGroup 一起收尾；与进入时的取消计数相比，已收到新取消的拥有者不重复发取消；也不能把以前捕获后留下的取消计数错当成本轮取消。替代解用滑动任务集合，显式收集完成项、取消剩余任务并等待。\n- 调度不等于 CPU 并行，也不保证每个 worker 轮流获得公平时间。不要靠输出打印顺序推断未约定的公平性。\n- 结果保持输入顺序意味着需要保留全部结果。本题是有限映射，不是常量内存的无限流处理器。\n\n## 三级提示\n\n1. 给每项输入分配编号，输出槽位与完成时刻分开；画出谁拥有所有子任务。\n2. 可以建 limit 个消费循环，让它们从同一同步迭代器取下一项。`next` 到保存编号之间不要 await；`await worker` 之后才有空位。\n3. 另一种方法只维护最多 limit 个任务，等一批完成再补位。所有退出路径都要 cancel + await，而不只是正常路径。异常组保留对象，不只保留字符串。\n\n## 运行与调试\n\n```sh\npython3 grade.py bounded_map exercises/bounded_map.py\n```\n\n事件闸门会让前 3 项一起等待，检查输入只读到 3；完成顺序故意设为 2→1→0，检查结果仍为 0→1→2；失败和取消时堵住清理闸门，验证调度器此时没有提前结束。还有自行取消、源迭代失败、清理再失败等反例。\n\n## 独立迁移与掌握证据\n\n陌生题：有限队列服务多个消费者，必须停止生产、清空或丢弃待处理项，并准确归还每个 `task_done()`。先决定关闭协议再实现，不把本题直接当作队列背压已掌握。\n\n闭卷解释：为何 `Semaphore + 全量 create_task` 不等于本题要求？异常返回时为什么仍要等兄弟？为何子任务 cancelled 不等于整个 TaskGroup 失败？在新的资源名、输入顺序、上限和故障位置下复做。学生迁移、性能与延迟保持仍未观察。\n",
    "hint": "先读合同，预测正常、故障和取消的事件顺序。",
    "boundary": "内存对象的生命周期合同，不证明真实OS资源、外部事务或全部Python掌握。",
    "transfer": "导出代码后完成原生课程里的陌生迁移练习。",
    "chapter": 7,
    "islandId": "lifecycle-depths",
    "reward": 20,
    "xp": 20,
    "judgeKind": "lifecycle",
    "lifecycleTask": "bounded_map",
    "checks": [],
    "prerequisites": [
      "lifecycle-async-stream"
    ],
    "prerequisitePolicy": "advisory",
    "assessmentContract": "lifecycle-web-v0.1",
    "sceneModes": [
      "normal",
      "failure",
      "cancel"
    ],
    "knowledgePrerequisites": [
      "contextmanager/generator",
      "async/await",
      "asyncio.Event",
      "task.cancel followed by await"
    ],
    "learnerMastery": "unobserved"
  }
];
export const LIFECYCLE_LESSON_DATA = RAW_LIFECYCLE_LESSON_DATA.map(scaffoldLesson);
export const LIFECYCLE_SCHEMAS = {
  "multi_resource": [
    {
      "id": "test_all_closers_run_despite_multiple_failures",
      "label": "多个清理失败也执行全部关闭"
    },
    {
      "id": "test_body_error_preserves_identity",
      "label": "业务错误保留原对象"
    },
    {
      "id": "test_cleanup_control_signal_preserves_primary_group",
      "label": "关闭控制信号不覆盖业务错误"
    },
    {
      "id": "test_control_and_cleanup_use_base_group",
      "label": "控制信号与清理失败一起保留"
    },
    {
      "id": "test_control_error_is_not_swallowed",
      "label": "控制中断不可吞掉"
    },
    {
      "id": "test_factory_failure_closes_prior_and_skips_tail",
      "label": "取得失败收好前项并停止后项"
    },
    {
      "id": "test_factory_failure_does_not_close_nonexistent",
      "label": "未取得的资源不能关闭"
    },
    {
      "id": "test_factory_iterable_is_not_materialized_ahead",
      "label": "失败后不提前询问后项"
    },
    {
      "id": "test_falsey_owned_resource_still_closes",
      "label": "假值资源仍必须关闭"
    },
    {
      "id": "test_nested_primary_group_keeps_original_object",
      "label": "已有主异常组保留原对象"
    },
    {
      "id": "test_next_factory_failure_cleans_acquired",
      "label": "工厂序列故障仍清理已取得项"
    },
    {
      "id": "test_normal_reverse_order",
      "label": "正常退出按逆序关闭"
    },
    {
      "id": "test_not_acquired_before_enter",
      "label": "进入前不取得资源"
    },
    {
      "id": "test_one_cleanup_error_propagates_same_object",
      "label": "单个关闭错误保留对象"
    },
    {
      "id": "test_open_and_cleanup_both_retained",
      "label": "打开与清理失败都保留"
    },
    {
      "id": "test_partial_open_resource_is_also_closed",
      "label": "部分打开失败仍需关闭"
    },
    {
      "id": "test_primary_first_then_cleanup_order",
      "label": "主要错误先于逆序清理错误"
    },
    {
      "id": "test_scopes_do_not_share_state",
      "label": "独立范围不共享资源状态"
    },
    {
      "id": "test_zero_resources_runs_body",
      "label": "空资源范围也能执行"
    }
  ],
  "async_stream": [
    {
      "id": "test_aiter_error_still_closes_source",
      "label": "创建迭代器失败也清理源"
    },
    {
      "id": "test_athrow_propagates_original_and_closes",
      "label": "消费方抛错仍保留并关闭"
    },
    {
      "id": "test_break_with_aclosing_has_explicit_owner",
      "label": "早停由明确范围负责关闭"
    },
    {
      "id": "test_cancel_and_cleanup_failure_keep_both",
      "label": "取消与清理错误都保留"
    },
    {
      "id": "test_cancel_during_open_does_not_invent_resource",
      "label": "打开期间取消不猜测资源"
    },
    {
      "id": "test_cancellation_awaits_close_and_no_late_effect",
      "label": "取消后等清理，不产生后续效果"
    },
    {
      "id": "test_close_only_error_identity",
      "label": "仅关闭失败时保留错误对象"
    },
    {
      "id": "test_creation_and_unstarted_close_do_not_open",
      "label": "未开始读取就关闭，不打开源"
    },
    {
      "id": "test_empty_source_closed",
      "label": "空源也关闭一次"
    },
    {
      "id": "test_exhaustion_closes_once_even_after_aclose",
      "label": "耗尽后再次关闭不重复清理"
    },
    {
      "id": "test_explicit_close_error_does_not_include_generator_exit",
      "label": "正常关闭控制不伪装业务错误"
    },
    {
      "id": "test_false_values_keep_original_type_and_identity",
      "label": "False与0不能偷换类型或身份"
    },
    {
      "id": "test_nested_primary_group_is_preserved_as_object",
      "label": "异步主异常组不展开或替换"
    },
    {
      "id": "test_no_background_pull_while_consumer_has_no_demand",
      "label": "没有需求时也不能后台预取"
    },
    {
      "id": "test_one_pull_per_request_no_prefetch",
      "label": "每次需求只拉取一项"
    },
    {
      "id": "test_opener_failure_is_not_owned",
      "label": "打开失败不伪造资源"
    },
    {
      "id": "test_opens_once_and_keeps_identity",
      "label": "只打开一次并保留输出对象"
    },
    {
      "id": "test_read_and_close_errors_both_preserved",
      "label": "读取和关闭错误都保留"
    },
    {
      "id": "test_read_error_identity_and_cleanup",
      "label": "读取失败保留身份并清理"
    },
    {
      "id": "test_source_not_iterator_is_owner",
      "label": "关闭真正的源而非借出的迭代器"
    }
  ],
  "bounded_map": [
    {
      "id": "test_borrowed_input_is_not_closed_on_cancellation",
      "label": "取消时不越权关闭借用输入"
    },
    {
      "id": "test_borrowed_input_is_not_closed_on_worker_failure",
      "label": "失败时不越权关闭借用输入"
    },
    {
      "id": "test_bounded_concurrency_and_source_demand",
      "label": "并发与输入需求都有界"
    },
    {
      "id": "test_empty_input_zero_calls",
      "label": "空输入不启动工作"
    },
    {
      "id": "test_failure_waits_for_sibling_cleanup",
      "label": "一个失败也要等兄弟收尾"
    },
    {
      "id": "test_input_is_borrowed_not_closed",
      "label": "成功时不关闭借用输入"
    },
    {
      "id": "test_input_iterator_failure_is_grouped_and_settled",
      "label": "输入故障也汇总并收尾"
    },
    {
      "id": "test_input_next_cancel_is_not_empty_success",
      "label": "输入取消不能伪装空列表成功"
    },
    {
      "id": "test_input_next_cancel_settles_existing_children",
      "label": "输入取消收好已启动任务"
    },
    {
      "id": "test_invalid_limit_before_iter_or_worker",
      "label": "非法并发上限先拒绝且零副作用"
    },
    {
      "id": "test_iter_failure_keeps_identity",
      "label": "初次取得迭代器失败保留身份"
    },
    {
      "id": "test_limit_one_is_sequential",
      "label": "上限1时严格顺序推进"
    },
    {
      "id": "test_parent_cancel_waits_for_all_owned_tasks",
      "label": "整体取消等待全部拥有任务"
    },
    {
      "id": "test_prior_cancel_count_does_not_hide_new_child_cancel",
      "label": "旧取消计数不能掩盖新取消"
    },
    {
      "id": "test_results_follow_input_not_completion",
      "label": "结果按输入顺序返回"
    },
    {
      "id": "test_success_identity_and_false_values",
      "label": "结果保持对象身份和假值"
    },
    {
      "id": "test_worker_accepts_future_and_custom_awaitable",
      "label": "接纳Future与自定义可等待对象"
    },
    {
      "id": "test_worker_and_sibling_cleanup_errors_retained",
      "label": "工作与兄弟清理错误都保留"
    },
    {
      "id": "test_worker_callable_error_retained",
      "label": "调用worker本身失败也可见"
    },
    {
      "id": "test_worker_requests_its_own_cancel",
      "label": "子任务自行请求取消仍正确收尾"
    },
    {
      "id": "test_worker_self_cancellation_is_not_successful_none",
      "label": "子任务取消不能伪装None成功"
    }
  ]
};
export const LIFECYCLE_ASSETS = Object.freeze({
  "lifecycle-runner.py": "fdea82eff101cfdda5d22ffc187d0706e9c7f04eedcf1d375b6722037889fe92",
  "lifecycle-scenes.py": "9ff27f995ca10784b08464c3092ade43d3e3c1870bbda07b893df2c57f6dc4f4",
  "lifecycle-contracts.json": "4d23c156b209e34e2d6b8096975e4cd8b0a88fe4e4b384219c05b690a2b6ea21"
});
export const LIFECYCLE_CONTRACT_DIGEST = "fa5a8e326f4adbefa55bb90a98e2da823a6d8d99da1067152bfa479171418961";
