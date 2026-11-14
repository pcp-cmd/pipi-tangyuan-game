import { scaffoldLesson } from './course-learning-scaffolds.mjs';

const freeze = value => { if (value && typeof value === "object") { for (const child of Object.values(value)) freeze(child); Object.freeze(value); } return value; };
export const FOUNDATION_LESSON_DATA = freeze([
  {
    "id": "async-await-relay",
    "title": "先等回执，再启航",
    "topic": "async/await · 顺序等待与结果身份",
    "description": "高级异步前的基础实践；通过只证明给定合同下的实现，不等于全面掌握。",
    "starter": "\"\"\"A01: read docs/A01.md, predict the order, then replace this body.\"\"\"\nasync def relay(fetch, publish):\n    # fetch() and publish(value) each return an awaitable.\n    raise NotImplementedError('等待取件完成，再等待交付完成')\n",
    "solution": "\"\"\"A01: calling an async operation is not the same as awaiting its result.\"\"\"\nasync def relay(fetch, publish):\n    value = await fetch()\n    receipt = await publish(value)\n    return receipt\n",
    "concept": "当前页请编辑代码后点击“运行代码”。以下 python3/play.py/grade.py 命令、事件演示与T迁移练习属于独立原生课程包，不在本页执行。本关运行全套合同，包含失败与取消，不是只验正常故事。算法提示在“给我一点提示”中，打开会记为辅助。\n\n# A01 · 先等回执，再启航\n\n皮皮发出取件请求，汤圆要拿到真正的包裹才能交付。写下一个请求，不等于请求已经执行；开始交付，也不等于回执已经到手。\n\n## 先修\n\n先能独立写普通函数、读懂参数与返回值，知道函数对象和调用结果的区别，并能解释异常向调用者传播。建议先完成原路线的 `workshop-composition` 与 `invalid-input`。这不是用“已访问课程”替代先修证据。\n\n## 先预测，再运行\n\n```sh\npython3 examples/observe.py A01\n```\n\n运行前写下四步事件：\n1. 只执行 `operation = relay(fetch, publish)`，会出现取件事件吗？\n2. 取件仍在等待时，可以交付吗？\n3. 交付开始但回执未到，relay 可以返回吗？\n4. 最后返回包裹还是交付回执？\n\n演示用 Event 人为放开两道闸门，不用“睡了几毫秒”推断先后。\n\n## 知识卡\n\n- 调用 `async def` 函数得到 coroutine 对象，函数体通常还没开始。`await` 让当前异步操作等待它的结果，期间事件循环可以运行别的就绪任务。\n- `await` 不是启动 CPU 并行的魔法。普通耗时计算或阻塞函数仍可能堵住事件循环。\n- coroutine 是一种可等待对象，Future 和实现 `__await__` 的对象也可以被 await。`create_task` 只接受 coroutine，不是本题所有输入的通用替代品。\n- 顺序写两个 await，表达先等第一件事结束，再开始下一件事。返回第二个 coroutine 对象不等于已经等待第二件事。\n- `asyncio.run` 用在原生程序最外层入口。已经运行在事件循环中的异步函数应使用 await，不再嵌套 `asyncio.run`。\n\n## 实现合同\n\n在 `exercises/await_relay.py` 实现 `async def relay(fetch, publish)`。\n\n1. 仅调用 relay 时，不调用 fetch 或 publish；实际等待此操作后才开始工作。\n2. `fetch()` 无参数，返回一个可等待对象。只调用一次、等待一次。\n3. 等取件完成后，才以得到的**同一对象**调用 `publish(value)`，只调用并等待一次。False、整数 0、None、空容器都不是“没有结果”。\n4. 返回交付回执本身，不是取件结果，也不是 True/False 化的标记。\n5. 取件失败就不交付。普通业务错误保留原异常对象传播。交付失败也不能伪造成功。\n6. 不遗留自己启动的后台任务。一次取消沿 await 链传播；等待中的操作有异步 finally 时，要让这次取消按正常 await 语义走完。取消的系统性解释在 A03。\n\n输入函数使用普通业务异常报告失败，不用 StopIteration/StopAsyncIteration 冒充业务错误。这些是 Python 迭代协议终止信号，在 coroutine/生成器边界可能变为 RuntimeError，不承诺外层异常对象相同。\n\n## 动手与反馈\n\n```sh\npython3 grade.py await_relay exercises/await_relay.py\n```\n\n先只看失败检查名，一次改一个原因。需要算法提示时，显式运行 `python3 play.py --hint A01`；用了提示的这轮应标记为辅助练习。\n\n## 自己证明\n\n闭卷解释为什么 `publish(fetch())` 不符合此合同。写一个 publish 必须等待闸门的反例，证明“启动了”与“完成了”不同。最后完成 `docs/TRANSFER.md`，其返回值规则与本关不同，不能机械复制最后一行。\n",
    "hint": "# A01 · 算法提示（辅助练习）\n\n打开后如用于当前提交，请注明辅助情况。重新闭卷尝试时另留一份新提交。\n\n先只看失败检查名，一次改一个原因。需要时再展开提示：\n\n1. 在纸上分别给“取件请求”“取件结果”“交付请求”“交付结果”起名字。\n2. 只有取件结果可以交给 publish；两次请求都需要等待。\n3. 先保存第一次 await 的结果，再返回第二次 await 的结果。使用具体提示完成后，换一组输入闭卷重写，再解释两次等待各自返回什么。\n\n",
    "chapter": 8,
    "islandId": "async-foundations",
    "reward": 20,
    "xp": 20,
    "judgeKind": "foundations",
    "foundationTask": "await_relay",
    "checks": [],
    "sceneModes": [
      "normal"
    ],
    "prerequisites": [
      "workshop-composition",
      "invalid-input"
    ],
    "assessmentContract": "async-foundations-v0.1",
    "knowledgePrerequisites": [
      "普通函数与异常",
      "逐步解释事件因果顺序"
    ],
    "boundary": "单次合作取消、内存对象；不承诺重复取消、真实外部事务或全部Python掌握。"
  },
  {
    "id": "async-event-handshake",
    "title": "亮着的信号，不是一箱货",
    "topic": "Event · 借用信号与结束边界",
    "description": "高级异步前的基础实践；通过只证明给定合同下的实现，不等于全面掌握。",
    "starter": "\"\"\"A02: ready and finished are borrowed Event flags, not data queues.\"\"\"\nasync def receive_when_ready(ready, finished, take):\n    raise NotImplementedError('先等信号；操作结束后再发完成信号')\n",
    "solution": "\"\"\"A02: the caller owns both Event flags; this operation never clears either.\"\"\"\nasync def receive_when_ready(ready, finished, take):\n    try:\n        await ready.wait()\n        return await take()\n    finally:\n        finished.set()\n",
    "concept": "当前页请编辑代码后点击“运行代码”。以下 python3/play.py/grade.py 命令、事件演示与T迁移练习属于独立原生课程包，不在本页执行。本关运行全套合同，包含失败与取消，不是只验正常故事。算法提示在“给我一点提示”中，打开会记为辅助。\n\n# A02 · 亮着的信号，不是一箱货\n\n灯塔亮起表示可以取件。两个守候者都能看见同一盏灯，但灯里没有装两份包裹。另一个 finished 信号只表示本次操作已结束，不能凭它断言业务成功。\n\n## 先修\n\n先完成 A01，能区分 coroutine、等待与结果。先读本页的 try/finally：无论正常返回、异常还是已经进入范围后的取消，finally 都会执行；如果协程还没进入就被取消，则不能凭空执行函数体里的 finally。\n\n## 先做预测\n\n```sh\npython3 examples/observe.py A02\npython3 examples/observe.py A02 --mode pulse\n```\n\n预测：同一 ready.set() 能唤醒几个已等待的操作？ready 之后仍亮着吗？如果在任何人等待前 set 又 clear，后来的等待者会收到历史通知吗？\n\n## 知识卡\n\n- `asyncio.Event` 是一个带状态的旗帜，初始未设置。`set()` 是同步操作，设置旗帜并唤醒等待者；`wait()` 是需要 await 的操作。\n- 已设置时，后来的 wait 可以直接通过。clear 只复位旗帜，不保存过去的通知，也不会撤销已经被 set 唤醒的等待者。\n- Event 不保存数据、不计数，也不保证“一次 set 只交给一个人”。需要一件一取的货物队列时，应学习 `asyncio.Queue`，不能偷偷把 Event 清掉来假装是队列。\n- finished 表示结束，不表示成功。成功、失败、取消应看实际返回或异常。\n- 在函数内部等待自己未来才设置的同一信号，会死锁。谁负责 set，要先画清楚。\n\n## 实现合同\n\n在 `exercises/event_handshake.py` 实现 `async def receive_when_ready(ready, finished, take)`。\n\n1. ready 和 finished 是调用者借给本范围的两个不同 Event。调用者负责复位；本函数不 clear 任何一个。\n2. 函数实际开始后，恰好调用并等待一次 `ready.wait()`。不用循环查询 is_set 代替等待，也不擅自 ready.set()。\n3. 等待通过后，才调用并等待一次 `take()`，返回它的同一结果对象。take 可返回 coroutine、Future 或自定义 awaitable。\n4. 从进入函数的等待范围起，无论正常返回、普通业务异常或一次取消，最后都 `finished.set()` 一次，且在已开始的 take 结束以后。\n5. 等 ready 时取消，不调用 take；take 的异步 finally 尚未结束时，不提前设置 finished。\n6. 错误向外传播，不因为设置了 finished 就改成成功。这里不处理 set() 自己会抛错的异常 Event 实现。\n7. 输入 ready 可预先 set。调用者不在本轮中复用/重置 finished；多个等待者可共享 ready，但各有自己的 finished。\n\n本关不是多个线程之间的同步保证，也不承诺在重复取消或 Worker 被硬终止后完成异步清理。\n\n## 练习\n\n```sh\npython3 grade.py event_handshake exercises/event_handshake.py\n```\n\n需要算法提示时，显式运行 `python3 play.py --hint A02`；用了提示的这轮应标记为辅助练习。\n\n独立检查：设计“ready 预先亮着”“两人一起等”“take 在等待中被取消”三个事件图。每个箭头写明谁 set、谁 await、哪个结果仍未知。图和自己写的测试，比一次绿勾更能揭示理解。\n",
    "hint": "# A02 · 算法提示（辅助练习）\n\n打开后如用于当前提交，请注明辅助情况。\n\n提示按需阅读：\n1. 把等待 ready 也放在会执行 finally 的范围内，否则等灯时被取消就没有结束信号。\n2. finished 应在 finally 中设置；不要把它放在 take 前面。\n3. 这段控制流是 `try: 等灯；等待取件并返回`，`finally: 发结束信号`。参考解只用于跟做后重开。\n\n",
    "chapter": 8,
    "islandId": "async-foundations",
    "reward": 20,
    "xp": 20,
    "judgeKind": "foundations",
    "foundationTask": "event_handshake",
    "checks": [],
    "sceneModes": [
      "normal"
    ],
    "prerequisites": [
      "async-await-relay"
    ],
    "assessmentContract": "async-foundations-v0.1",
    "knowledgePrerequisites": [
      "普通函数与异常",
      "逐步解释事件因果顺序"
    ],
    "boundary": "单次合作取消、内存对象；不承诺重复取消、真实外部事务或全部Python掌握。"
  },
  {
    "id": "async-cancel-and-join",
    "title": "请停船，也等绳索收好",
    "topic": "Task · 取消请求与等待收尾",
    "description": "高级异步前的基础实践；通过只证明给定合同下的实现，不等于全面掌握。",
    "starter": "\"\"\"A03: cancel() requests cancellation; awaiting observes what happened.\"\"\"\nimport asyncio\n\n\nasync def cancel_and_join(task):\n    raise NotImplementedError('请求一次取消，并等到任务真正结束')\n",
    "solution": "\"\"\"A03: request cancellation, then observe the target's terminal outcome.\n\nThe target is owned by the caller and in this loop. Complete cleanup is promised\nonly for one cooperative cancellation and no new cancellation of the joiner.\n\"\"\"\nimport asyncio\n\n\nasync def cancel_and_join(task):\n    caller = asyncio.current_task()\n    if not isinstance(task, asyncio.Task):\n        raise TypeError('expected an asyncio.Task')\n    if task is caller:\n        raise ValueError('cannot join the current task')\n    # Do not erase or mistake the caller's own cancellation for the child's.\n    if caller is not None and caller.cancelling():\n        raise asyncio.CancelledError\n    if not task.done() and task.cancelling() == 0:\n        task.cancel()\n    try:\n        value = await task\n    except asyncio.CancelledError:\n        if caller is not None and caller.cancelling():\n            raise\n        if not task.cancelled():\n            raise\n        return ('cancelled', None)\n    # A target may suppress the cancellation forwarded from this caller.\n    if caller is not None and caller.cancelling():\n        raise asyncio.CancelledError\n    return ('finished', value)\n",
    "concept": "当前页请编辑代码后点击“运行代码”。以下 python3/play.py/grade.py 命令、事件演示与T迁移练习属于独立原生课程包，不在本页执行。本关运行全套合同，包含失败与取消，不是只验正常故事。算法提示在“给我一点提示”中，打开会记为辅助。\n\n# A03 · 请停船，也等绳索收好\n\n叫船停下，不等于已经收好绳索。Task.cancel() 发出请求；目标通常会在下一次可取消的等待处收到 CancelledError。目标可以在 finally 中清理，也可能处理取消后正常返回。\n\n## 先修\n\n先完成 A01、A02，并能解释普通异常、try/finally 和资源所有权。建议已有 `protocol-lifecycle` 的当前独立实践。只可以取消由调用者明确交给你管理的 Task，不擅自停止别人的后台任务。\n\n## 预测后观察\n\n```sh\npython3 examples/observe.py A03\npython3 examples/observe.py A03 --mode suppressed\npython3 examples/observe.py A03 --mode unstarted\npython3 examples/observe.py A03 --mode caller-cancel\n```\n\n分别预测：\n- 清理闸门关着时，cancel 已经被调用，但 task.done() 和 join.done() 是什么？\n- 目标处理取消并返回备用值时，应该报告 finished 还是 cancelled？\n- Task 还没迈出第一步就取消，会执行函数体里的 finally 吗？\n- 正在等待收尾的调用者又被取消，为什么不能再声称原来的清理保证成立？\n\n## 知识卡\n\n- `cancel()` 是请求，不是同步关闭。`done()` 包括正常返回、异常、取消三种终态；只有 `cancelled()` 才表示以取消结束。\n- 在现代 Python 中，CancelledError 继承 BaseException，不会被普通 `except Exception` 捕获。也不能为了“成功”而广泛吞掉 BaseException。\n- 要观察取消的结果，必须 await 目标。否则可能提前离开、遗漏清理或丢失清理错误。\n- 再次 cancel 可能在目标正在 await 清理时再次注入取消。入门函数不要追加打断已经请求的取消。\n- `cancelling()` 是未撤销请求的计数，不等于此刻一定在清理，也不是“是否已经结束”。不要调用 uncancel 来偷偷擦掉调用者的请求。\n\n## 实现合同\n\n在 `exercises/cancel_and_join.py` 实现 `async def cancel_and_join(task)`。\n\n1. task 是当前事件循环中的 asyncio.Task，调用者拥有它的取消权限。拒绝普通 Future（TypeError）与当前调用者自己（ValueError），拒绝时不改变取消状态。\n2. 调用者进入时不能已有未撤销取消请求。若有，向外传播 CancelledError，不启动对目标的新操作。\n3. 目标若没结束且 cancelling()==0，请求一次取消。已收到请求的目标不再追加 cancel；已经结束的目标也不 cancel。\n4. 等待目标进入终态。取消终态返回 `('cancelled', None)`；正常终态返回 `('finished', 原结果对象)`。\n5. 目标可以处理取消并正常返回，此时不能谎报 cancelled。普通业务错误和清理错误保留原对象传播。\n6. 调用者在等待中被取消时，向外传播调用者的取消，不能把它当成正常的目标取消或完成结果，即使目标吞掉转发的取消并返回值也一样。若目标在处理中另抛普通业务/清理错误，本关仍保留该错误，不承诺多方竞态异常的统一优先序。\n7. 不修改其他任务或遗留自己创建的后台任务。\n\n### 收尾保证的边界\n\n“等完整异步清理”只针对目标配合一次取消、没有新的外部取消干扰的合法流程。这个小函数**不是**能抵挡反复取消的通用生产 stop-all。\n\n如果调用者后来也被取消，直接 await 会把额外取消传给目标，可能打断它正在等待的 finally。测试只要求此时不要吞掉调用者取消，并不承诺仍完成原清理。`--mode caller-cancel` 专门展示这点。shield、结构化并发和多重取消下的所有权需要后续高级课程与更强的合同。\n\n未启动的协程被取消也没有“已进入范围”的 finally。浏览器硬终止整个 Worker 更不等于 Python finally 已完成。\n\n## 练习与独立证明\n\n```sh\npython3 grade.py cancel_and_join exercises/cancel_and_join.py\n```\n\n需要实现策略时，显式运行 `python3 play.py --hint A03`；用了提示的这轮应标记为辅助练习。\n\n独立写一个清理闸门测试：在打开闸门前断言 join 仍没结束，打开后断言清理记录出现。不能用“sleep 了足够久”代替这个证明。再解释为什么先取消并等待船 A、最后才取消船 B，在 A 的清理依赖 B 停止时会死锁。后一个双任务场景是迁移讨论题，本包没有把它自动计为已掌握。\n",
    "hint": "# A03 · 实现策略（辅助练习）\n\n打开后如用于当前提交，请注明辅助情况。\n\n1. 先列出“已完成正常”“已失败”“已取消”“正在工作”“正在清理”五种目标状态。\n2. 只有适当的活动状态需要发新请求；所有结果都要在 await 后区分。\n3. 捕获目标的 CancelledError 时，先分清调用者是否也被取消。不要把所有错误变成 `('cancelled', None)`。\n\n",
    "chapter": 8,
    "islandId": "async-foundations",
    "reward": 20,
    "xp": 20,
    "judgeKind": "foundations",
    "foundationTask": "cancel_and_join",
    "checks": [],
    "sceneModes": [
      "normal"
    ],
    "prerequisites": [
      "async-event-handshake",
      "protocol-lifecycle"
    ],
    "assessmentContract": "async-foundations-v0.1",
    "knowledgePrerequisites": [
      "普通函数与异常",
      "逐步解释事件因果顺序"
    ],
    "boundary": "单次合作取消、内存对象；不承诺重复取消、真实外部事务或全部Python掌握。"
  }
].map(scaffoldLesson));
export const FOUNDATION_SCHEMAS = freeze({
  "await_relay": [
    {
      "id": "test_call_is_dormant_until_awaited",
      "label": "调用先得到待执行操作，尚未取件或交付"
    },
    {
      "id": "test_cancellation_during_fetch_does_not_publish",
      "label": "取件等待被取消，不能随后交付或报告正常返回"
    },
    {
      "id": "test_cancellation_during_publish_awaits_its_finally",
      "label": "一次取消沿 await 传播，交付的 finally 结束后才结束等待"
    },
    {
      "id": "test_each_factory_and_awaitable_is_used_once_in_order",
      "label": "取件、等待、交付、等待按因果顺序各发生一次"
    },
    {
      "id": "test_fetch_await_failure_does_not_publish",
      "label": "等待取件失败，原业务错误保留且不交付"
    },
    {
      "id": "test_fetch_factory_failure_does_not_publish",
      "label": "取件函数在返回等待对象前失败，也不交付"
    },
    {
      "id": "test_fetch_must_finish_before_publish_is_called",
      "label": "取件闸门未开，不能提前调用交付"
    },
    {
      "id": "test_future_and_custom_awaitables_are_supported",
      "label": "可等待对象不只 coroutine，也包括 Future 与自定义 awaitable"
    },
    {
      "id": "test_payload_identity_including_false_and_zero",
      "label": "传递原对象，不能把 False、0 或空值改写"
    },
    {
      "id": "test_pending_future_is_awaited_without_busy_wait",
      "label": "尚未完成的 Future 不可直接取 result 或阻塞事件循环"
    },
    {
      "id": "test_pending_publish_future_is_awaited_before_return",
      "label": "publish 返回未完成 Future，不能直接 result() 或提前结束"
    },
    {
      "id": "test_publish_await_failure_keeps_original_error",
      "label": "等待交付失败，不伪造成功回执"
    },
    {
      "id": "test_publish_factory_failure_keeps_original_error",
      "label": "交付函数调用失败，不替换或吞掉原错误"
    },
    {
      "id": "test_publish_must_finish_before_relay_returns",
      "label": "交付仍在等待时，relay 不能提前返回"
    },
    {
      "id": "test_receipt_identity_including_false_and_zero",
      "label": "返回交付结果本身，不能返回取件值或布尔化"
    },
    {
      "id": "test_separate_calls_do_not_share_results",
      "label": "不同调用不复用上一份取件结果或回执"
    }
  ],
  "event_handshake": [
    {
      "id": "test_borrowed_events_are_never_cleared",
      "label": "借用的信号由调用者管理，不擅自 clear"
    },
    {
      "id": "test_cancel_during_take_waits_for_take_cleanup_before_finished",
      "label": "take 的异步清理结束前，不能把 finished 当作已收尾"
    },
    {
      "id": "test_cancel_while_waiting_for_ready_never_calls_take",
      "label": "等待 ready 期间取消，finally 发结束信号但不取件"
    },
    {
      "id": "test_clear_does_not_revoke_already_awakened_waiter",
      "label": "已经等待的任务被 set 唤醒后，紧接的 clear 不撤销此次唤醒"
    },
    {
      "id": "test_completed_scope_does_not_set_another_scope_finished",
      "label": "独立操作各有自己的结束信号，不共用模块级状态"
    },
    {
      "id": "test_falsey_event_objects_are_still_real_events",
      "label": "事件对象的真假值不能替代 wait 的协议"
    },
    {
      "id": "test_finished_is_set_only_after_take_finishes",
      "label": "拿到 ready 不等于工作完成，take 完成前 finished 必须未亮"
    },
    {
      "id": "test_future_and_custom_awaitable_take_are_allowed",
      "label": "take 可返回 Future 或自定义可等待对象"
    },
    {
      "id": "test_pending_take_future_is_awaited_before_finished",
      "label": "take 返回未完成 Future，不能直接 result() 或提前发 finished"
    },
    {
      "id": "test_preset_ready_is_not_a_lost_notification",
      "label": "先 set 后 wait 仍可通过，Event 是保留状态的旗帜"
    },
    {
      "id": "test_success_does_not_set_borrowed_ready",
      "label": "成功也不能擅自 set 调用者借来的 ready"
    },
    {
      "id": "test_take_await_error_still_signals_finished",
      "label": "等待 take 失败也发结束信号，但结束不等于成功"
    },
    {
      "id": "test_take_factory_error_still_signals_finished",
      "label": "take 调用本身失败也进入 finally，保留原错误"
    },
    {
      "id": "test_take_is_called_once_and_result_identity_is_preserved",
      "label": "只取一次并返回同一对象，包括 False 与整数零"
    },
    {
      "id": "test_two_waiters_observe_one_set_without_consuming_it",
      "label": "Event 不是单件队列，同一次 set 可以唤醒两个等待者"
    },
    {
      "id": "test_waits_for_ready_without_calling_take_early",
      "label": "ready 未亮时只等待，不提前取件也不发完成信号"
    }
  ],
  "cancel_and_join": [
    {
      "id": "test_already_cancelled_caller_does_not_start_target_cancellation",
      "label": "进入时调用者已有取消请求，不擅自清计数或启动新操作"
    },
    {
      "id": "test_caller_cancellation_is_not_swallowed_as_target_success",
      "label": "调用者也被取消时向外传播，不把它伪装成正常返回"
    },
    {
      "id": "test_caller_cancellation_survives_target_suppressing_forwarded_request",
      "label": "目标吞掉转发的取消并正常返回，也不能吞掉调用者自己的取消"
    },
    {
      "id": "test_cancelling_unstarted_task_does_not_invent_finally_execution",
      "label": "协程未运行就取消，不凭空宣称进入过 finally"
    },
    {
      "id": "test_cleanup_failure_is_propagated_after_cleanup_runs",
      "label": "清理本身失败必须传播，不能用取消结果盖掉错误"
    },
    {
      "id": "test_entry_cancellation_rejection_keeps_callers_unrevoked_count",
      "label": "拒绝已有取消的调用者，不能偷偷 uncancel 擦掉请求计数"
    },
    {
      "id": "test_existing_cancel_request_is_not_repeated_during_cleanup",
      "label": "目标已收到取消并在清理时，不追加第二次取消打断它"
    },
    {
      "id": "test_existing_cancelled_task_is_observed_without_new_request",
      "label": "已取消的终态仍可读取，不重复发送取消"
    },
    {
      "id": "test_existing_failure_is_not_misclassified_as_cancelled",
      "label": "已失败任务的业务错误原样传播，不当作正常取消"
    },
    {
      "id": "test_finished_task_returns_original_value_without_cancelling",
      "label": "已经正常结束的任务保留原返回对象，不再发取消"
    },
    {
      "id": "test_non_task_input_is_rejected_without_touching_future",
      "label": "普通 Future 不是本关拥有取消协议的 Task 输入"
    },
    {
      "id": "test_one_cancellation_request_and_terminal_cancelled_outcome",
      "label": "对尚未取消的目标请求一次，并等到 cancelled 终态"
    },
    {
      "id": "test_repeated_join_does_not_repeat_cancellation",
      "label": "同一已结束任务重复查看，不再 cancel 或改变结果"
    },
    {
      "id": "test_self_join_is_rejected_without_cancelling_caller",
      "label": "不能取消并等待自己，且拒绝不能改变调用者取消计数"
    },
    {
      "id": "test_task_can_suppress_request_and_finish_normally",
      "label": "cancel 只是请求；目标处理取消后返回值，不能谎报 cancelled"
    },
    {
      "id": "test_waits_for_async_cleanup_gate_before_returning",
      "label": "cancel 返回不等于清理结束，join 必须等待 finally 的闸门"
    }
  ]
});
export const FOUNDATION_ASSETS = freeze({
  "foundation-runner.py": "bea7e3cdd30e4196c7d9d46a7552a9cf55ed8ba5e2d07b87b9719056c613be91",
  "foundation-contracts.json": "509252154a2f90cf7d282a3285befc58b64ab57713bb783c2a78f7ae36d59c4c"
});
export const FOUNDATION_CONTRACT_DIGEST = "c37fe9651c9a5f5fd8a85333dd652ae8c5e6fbaf90cde71c8c4f95d40d5e0328";
