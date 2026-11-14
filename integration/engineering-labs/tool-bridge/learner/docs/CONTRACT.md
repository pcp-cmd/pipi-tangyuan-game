# 工具桥能力合同，第 1 版

## 运行条件

Python 3.11 或更新版本，UTF-8 文本，标准库。`asyncio.timeout` 决定最低版本。所有测试只使用虚构数据、新临时目录、作者编写的已知代码和回环端口。函数名与 CLI 是公开接口，内部结构可自由选择。

## 业务层

| 接口 | 输入 | 输出或错误 |
| --- | --- | --- |
| `decode_json(raw)` | JSON 文本或字节 | Python 对象；语法或非有限常量抛 ValueError |
| `load_catalog(path)` | 目录文件路径 | UTF-8 JSON 目录；文件错误保留 OSError |
| `validate_catalog(catalog)` | SKU 到商品记录的字典 | 合法返回 None，否则 DomainError("invalid_catalog") |
| `quote(catalog, request)` | 完整目录；准确字段 sku、quantity | 新报价字典；非法请求 invalid_request，未知商品 unknown_sku |
| `validate_quote(value)` | 外部报价结果 | 返回原合法对象；非法抛 BusinessContractError |
| `slot_availability(schedule, request)` | 时间表与时间窗口 | 新窗口判断；invalid_schedule 或 invalid_window |

SKU 与 station 是 1 至 64 字符的非空字符串，首尾无空白，不含控制字符。商品记录仅有 available 与 price_cents，都是 0 至 10^9 的严格整数。数量为 1 至 999 的严格整数。布尔值不算整数。

报价结果准确包含 sku、quantity、available、total_cents、can_fulfill。总价是本次请求数量对应的金额，即使库存不足仍计算该数量的金额。can_fulfill 是严格布尔值，必须与 available 和 quantity 一致。任何输入都不能被修改。

时间表是列表，每条准确包含 id、station、start、end。id 唯一且满足 SKU 的字符串规则。请求准确包含 station、start、end。start 为 0 至 1439、end 为 1 至 1440 的严格整数，start 小于 end。使用半开区间。所有时间表记录都先验证。结果含请求字段、严格布尔 available 和按原顺序排列的 conflict_ids。报价与时间窗都只读，不承诺预约或库存预留。

## CLI

`python -m toolbridge quote --catalog PATH` 和 `check-slot --schedule PATH` 从 stdin 读取一个 JSON 文本，总长度不超过 32768 字节。成功 stdout 是一行 `{"ok":true,"result":...}`。错误 stdout 是一行 `{"ok":false,"error":{"code":"..."}}`，stderr 是简短非空诊断。

| 情况 | 退出码 | error.code |
| --- | --- | --- |
| 成功 | 0 | 无 |
| 坏 JSON 或 UTF-8 | 2 | invalid_json |
| 不合法业务值 | 2 | 对应 DomainError.code |
| 超长输入 | 2 | input_too_large |
| 未知 SKU | 4 | unknown_sku |
| 文件读取失败 | 5 | io_error |
| argparse 参数错误 | 2 | argparse 可只写 stderr，不要求 JSON |
| `--help` | 0 | 人的帮助文字，不要求 JSON |

不支持缩写参数，不经 shell 拆分路径。导入模块不得启动进程、读 stdin 或打开服务。

## 普通 HTTP

`make_server(catalog, port=0)` 返回已绑定 `127.0.0.1` 的 ThreadingHTTPServer。`serve(catalog_path, port=0)` 在绑定成功后输出一行 `{"ready":true,"host":"127.0.0.1","port":实际端口}`，再服务。它在结束时关闭套接字。

只接受 `POST /quote` 的 application/json。请求有 Content-Length，不能使用 Transfer-Encoding，最大 32768 字节，读取超时 2 秒。GET 返回 405，未知路径 404，错误 Content-Type 415，非法长度 413，UTF-8 或 JSON 错误 400，业务请求错误 422，未知 SKU 404，成功 200。

`fetch_quote(url, request, timeout=2)` 只允许显式的 http://127.0.0.1 地址，拒绝用户信息和片段，不自动跟随跳转。结果只接受 200 的准确 ok/result 包装，校验完整报价与请求身份。

| 失败位置 | 客户端异常 |
| --- | --- |
| 非允许 URL、连接或套接字失败 | TransportError |
| HTTP 错误或跳转 | HttpStatusError，属性 status 保留状态码 |
| 无效 UTF-8、无效 JSON、超长响应 | ResponseFormatError |
| 合法 JSON 的字段、类型或当前请求身份错误 | BusinessContractError |

普通 HTTP 不作为 MCP 传输实现。

## MCP stdio 教学子集

协议固定 2025-11-25。stdin 与 stdout 使用 UTF-8 JSONL，单行最多 65536 字节，输出立即 flush。超长输入返回解析错误后结束；批量数组不在本子集内。stdout 不允许普通提示文字。

服务器状态为 new、initialized、ready。initialize 返回 protocolVersion、capabilities.tools、serverInfo。初始化后收到 notifications/initialized 才进入 ready。过早通知保持原状态。通知无响应。ping 可返回空结果。

请求 ID 接受字符串或整数，不接受 null 或布尔值，同一连接不可复用 ID。响应精确返回请求 ID。未知方法 -32601，无效请求 -32600，坏 JSON -32700，外层参数形状错误或未知工具 -32602。未 ready 的工具调用使用本项目定义的 -32000，不把这个编号称为协议统一要求。

tools/list 只返回 catalog_quote。inputSchema 为 object，必填 sku 与 quantity，禁止额外字段。sku 为字符串，长度 1 至 64；quantity 为 integer，范围 1 至 999。业务层另外检查目录与标签。工具说明只读，不赋予额外权限。

tools/call 中 arguments 不是对象或工具未知时返回外层 error。已找到工具，且 arguments 为对象但字段或业务不合法时，返回 result，其中 isError 为真。成功 result 有 isError 为假、一个 text 类型 content，text 是报价 JSON。可以同时提供 structuredContent，若提供必须与文本数据一致。

`Client(command, timeout=2, env=None, cwd=None)` 为异步上下文管理器。command 是非空字符串参数列表。公开方法有 request、notify、call_quote、close。request 返回协议 result，外层错误抛 RpcError(code,message)，无效协议抛 ProtocolError，超时抛 TimeoutError，取消继续传播 CancelledError。工具层 isError 使 call_quote 抛 RpcError。

客户端只允许一个待回复请求；总时限不能被通知重置。通知可以出现在响应前，客户端跳过它们再等正确 ID。错误 ID、EOF、坏协议、超时或取消都使连接失效并回收子进程。正常 RpcError 后连接可继续使用。实例只能打开一次，不能替换尚在运行的进程。close 幂等。

为资源验收暴露 process、closed、notifications 和 stderr_bytes。process 是实际 asyncio 子进程对象；notifications 最多保留 100 个方法名；stderr_bytes 记录已排空的字节数，不保存诊断正文。关闭输入后最多等待 0.3 秒，必要时 terminate，再等 0.3 秒，最后 kill 并 wait。这些时限是本课程资源策略，不是 MCP 全局规则。

## JSONL 与 trace

`write_event(path,row)` 只保留 event、run_id、span_id、parent、operation_id、kind、attempt、time_ms、status、cause_span，另加当前真实 pid。身份字段为 1 至 80 个 ASCII 字母、数字或 `_.:-`。parent 必须显式提供，可为 None；operation_id 可为 None。time_ms 是有限非负数，不接受 bool。

span_started 有 kind（run、step、tool）与正整数 attempt，没有 status 或 cause_span。span_finished 有 status（ok、error、cancelled），没有 kind 或 attempt。cause_span 只允许出现在 error 结束事件里。非法允许字段抛 ValueError，未知字段丢弃，输入不变。写入时追加、flush、fsync；拒绝接续未换行的残缺尾行。父目录由调用者建立，一个文件只有一个写进程。

`read_events(path)` 返回 rows 与 partial_tail。完整坏行报 ValueError；未换行尾行不解析、不补写，partial_tail 为真。

`summarize(rows)` 按 (run_id,span_id) 排序返回 spans 与 issues。span 含身份、parent、operation_id、kind、attempt、pid、status、elapsed_ms。缺结束为 incomplete 与 None。重复开始或结束、结束无开始、身份或 PID 改变、负时长、parent 环均报 ValueError。缺 parent 记录报告 missing_parent。可选 cause_span 没有同 run 的 error 结束证据时报告 unverified_cause。

`observe(...,operation,clock=time.perf_counter)` 在真实调用前后写事件。正常返回原值，普通异常与取消保留原异常对象传播。若原操作与结束记录同时失败，把记录异常保存在原异常的 trace_log_error 属性，add_note 只含记录异常类型。开始记录失败时零调用；成功操作的结束记录失败可抛日志异常，并保留已发生效果。

同一 span 仅比较同进程 perf_counter。跨进程 parent 表示逻辑关系，不根据两个进程的时钟判断时间包含。trace 不完整不能证明业务未发生。

## 独立评估

`run_trial(case,candidate,directory)` 创建新目录；已有目录拒绝。candidate 仅得到 question 的深拷贝和两工具，不得到 expected 标签。宿主捕获实际工具调用，实际写 effects 文件，记录 status、错误类型、elapsed_ms、calls 和最终回答。异常后保留效果，不能删去已经发生的写入。

`grade_trial` 重新读文件。功能通过要求正常返回、answer 的类型和值递归完全相同、实际效果与 expected_effects 完全相同且没有危险效果。不使用候选自报 passed、score、effects 或费用。额外文件、额外目录、重复或错误内容、符号链接都不算获准效果。可见危险在其他证据缺失时也保留。

缺失或损坏宿主或效果证据，functional_pass 为假，environment_error 与 unknown 为真。dangerous 为真表示已观察到危险；为假且 unknown 为真不等于已证明安全。

`aggregate(results, expected_ids)` 不接受空计划、重复身份或计划外结果。缺失结果生成未知失败项，分母始终等于预定数量。ready 只在全部试验功能通过、无危险、无环境错误、无未知时为真。`dataset_sha256` 使用 ensure_ascii=False、sort_keys=True、allow_nan=False 和紧凑分隔符的 JSON UTF-8 摘要，保留列表顺序。

## 证明层级

公开检查验证本合同中的具体行为，不评价所有可能程序。作者合法实现与负控只是检查器校验。真实 SDK 双向互通只覆盖所列 tools 子集。Windows 实机、完整 MCP 规范一致性、恶意代码隔离与真实学习者独立能力需要另外的证据。
