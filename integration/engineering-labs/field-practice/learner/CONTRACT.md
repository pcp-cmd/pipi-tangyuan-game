# 远航实践合同

四个子合同分别形成可观察结果。它们补充 F00、S01、X00、GRAD 的实践入口，不宣称重现原 AE26 全部实验。

## F00 的输入和结果

`inspect_launch(marker)` 在本进程当前工作目录解释相对路径，按 UTF-8 读取该文件。返回字典，恰含 `cwd`、`interpreter`、`marker_path`、`marker_text`。前三项是解析后的绝对路径，解释器取本次实际 `sys.executable`。原文保留换行。文件不存在应保留 `FileNotFoundError`，不得替用户生成文件或切换工作目录。

`python_sources(folder)` 返回该目录直接包含的普通 `.py` 文件名，按文件名排序。不递归，不包括目录，不把 `example.py.txt` 当 Python 文件。后缀区分大小写。

`run.py environment` 已提供命令行入口。成功退出 0，已知文件或参数错误退出 2。实验须包含从错误目录失败后恢复的实际新进程结果。

## S01 的允许范围

`read_note(root, relative, grant)` 仅在 `grant` 是字典、`action` 为 `read`、`path` 精确等于 `relative`、`approved is True` 时读取。数字 1 不等于明确批准。

路径必须是非空字符串和相对路径，拒绝反斜线及 `..` 路径段。解析符号链接后必须仍在 `root` 内。先确认批准和路径，再读取 UTF-8。拒绝时抛 `PermissionError`，不改文件。授权正确但文件缺失时保留 `FileNotFoundError`。

实验假设目录内容没有被另一个进程并发替换。该函数没有防止进程绕过工具直接访问磁盘，没有实现未知代码隔离。路径竞态、网络限制、进程资源限制和操作系统沙箱都不在此合同内。

## X00 的共同业务合同

请求恰为 `{"parcel": 非空字符串}`。无效请求抛 `ValueError`，零工具调用。工具端口只提供 `primary` 和 `backup` 两个来源。

先查询主来源。主来源为 `ready` 或 `transit` 时，返回它的实际状态，不查询备来源。主来源为 `unknown` 或抛 `TimeoutError` 时，预算允许才查询备来源。`PermissionError` 必须传播，不能转向备来源绕过拒绝。每个来源最多查询一次。

答案恰含 `parcel`、`status`、`source`。确定状态时，`source` 为实际来源名称。证据不足或预算耗尽时返回 `status="unknown"`、`source=None`。不要根据案例名、包裹名或预期报告硬编码答案。`port.remaining` 是剩余调用预算。

三个实现分别使用以下结构。

- `run_fixed(request, port)` 直接编排固定步骤。
- `next_action(request, observations)` 根据实际观察返回查询动作或最终答案。查询动作为 `{"kind":"query","source":来源,"parcel":编号}`，最终动作为 `{"kind":"answer","value":答案}`。空观察先查询主来源。`run_loop` 每次决定前调用 `port.note("decision")`，执行动作并收集观察，最多三个决策周期。
- `collect_for_role` 只返回观察。`decide_for_role` 只读取观察形成答案。`run_roles` 在派给查询角色和交给回答角色时各调用一次 `port.note("handoff")`。

观察格式为 `{"source":来源,"result":实际返回值或None,"error":None或"TimeoutError"}`。工具返回值包含 `parcel` 和 `status`。权限拒绝不转成普通观察。

这些合作函数必须参与实际运行。`run_loop` 执行 `next_action` 返回的动作，并把真实工具观察送回下一次决定；`run_roles` 把查询角色的真实观察交给回答角色，并采用它返回的答案。公开检查会临时替换这些合作函数来观察因果关系，不能只记录几个事件后调用固定流程。

`compare` 对每个实现重建同样的端口和预算，记录真实调用事件。工具次数不是延迟或费用，角色交接次数不是模型思考质量。保存报告绑定当前源码和固定输入，修改后须重新运行。

## GRAD 的新业务合同

`allocate(capacities, events)` 接受时段容量字典和事件列表。时段名为非空白字符串，容量是非负整数，排除 bool。保留名称原文。

预约事件恰含 `action="reserve"`、非空白 `id`、已存在的 `slot` 和正整数 `qty`。同一预约 id 只能 reserve 一次，即使之前被拒绝或已取消也不能再次使用。取消事件恰含 `action="cancel"` 和非空白 `id`。任何未知字段、未知动作或非法值都抛 `ValueError`。

先校验完整输入，再按事件顺序处理。容量足够时接受并扣除，不足时只拒绝这一笔，后续事件继续。取消活动预约会归还容量。取消不存在、已拒绝或已取消的预约，记录 `inactive`。

返回 `decisions`、`active`、`remaining`。`decisions` 按事件顺序给出 `id`、`action`、`result`，结果为 `accepted`、`shortage`、`cancelled` 或 `inactive`。`active` 按原接受顺序列出仍有效的 `id`、`slot`、`qty`。`remaining` 保留全部时段及零容量。输入不可改变。

`write_report(capacity_path, event_path, report_path)` 读取两份真实 UTF-8 JSON 文件，调用上述业务，再写出可解码的 JSON 报告，返回同一数据。报告不得与任一输入是同一文件。坏输入包括最后一条坏事件，必须保留已有报告的完整字节。写出使用同目录临时文件和替换，完成后没有遗留临时文件。操作系统断电保证不属于本合同。

写入中途或最后替换失败时，错误必须对调用者可见，旧报告完整保留，并清理本次临时文件。公开检查在独立子进程中制造文件大小限制与替换失败，兼容 `dump`、`write_text`、文件描述符写入及标准库的 `rename`/`replace` 入口。没有进程文件大小限制的系统会跳过相应检查，应记录为部分覆盖。

## 审核与毕业

四项公开检查只证明已列行为。提交包和测试均可由本人修改，本机报告属于自报。可信审核方没有配置时，游戏保留“待核验”，不自动授予工程毕业。课堂“海神大使”仍按原 99 课的保存证据派生，原成绩和奖励不变。

答辩需要学习者解释自己的失败、修复与新需求。延时重做需要本人后续完成，不能由作者脚本生成掌握证明。
