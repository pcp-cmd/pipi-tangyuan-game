# repo-repair / 合同 1

以下合同描述可观察行为，不规定你的内部算法。`root` 是宿主指定的临时教学仓库，`writable`/`protected` 也由宿主给出；模型与仓库资料不能扩大它们。当前练习采用单写入者，拒绝链接，不提供恶意代码沙箱。

## 文件与补丁

| 接口 | 输入与结果 | 必须拒绝/保留 |
| --- | --- | --- |
| `list_repo(root)` | 排序后的相对 `/` 文件名数组 | 排除 `.git`、`.venv`、`venv`、`__pycache__`，不跟随链接/junction |
| `read_snapshot(root,name)` | `{path,sha256,text,bytes}`；摘要和长度按原始字节 | 路径逃逸/链接为 PermissionError；超过65,536字节为 ValueError；严格UTF-8失败显露；缺文件显露 |
| `search_repo(root,needle)` | 依路径与行号排序的 `{path,line,text}`；行号从1开始 | needle 1–100字符；跳过超长/非UTF-8文件，其他异常显露 |
| `propose_patch(root,name,before_hash,old,new,writable)` | `{path,before_hash,after_hash,old,new,before_text,after_text,diff}` | 不写；name不获准拒绝；旧摘要不符、old空/不唯一、无变化/过大拒绝；保留其余原始换行 |
| `apply_patch(root,proposal,grant,actor,now,used,writable)` | 写后重读，返回 `{path,before_hash,after_hash,before_text,diff}` | 重新核版本及全部提议字段；确认批准后消费id；单目标替换；保留其他文件与权限位 |
| `restore_patch(root,saved,grant,actor,now,used,writable)` | 恢复后snapshot | 当前摘要必须仍等于saved.after_hash；before_text摘要须匹配；不得覆盖新的人类改动，不改暂存区或无关文件 |

`diff` 使用统一差异格式，文件名为 `a/<path>` 与 `b/<path>`。可用文本唯一替换或字节分段拼接；如果结果相同，两种都应通过。临时文件名必须唯一，不能覆盖已有 `.pending` 文件。

为保持路径规则明确，排除目录名称按大小写无关比较，各路径组件不能以点或空格结尾。这项字符串规则会在Linux实际文件上检查；它不等于已经完成Windows文件系统、junction或设备名的实机验证。

## 精确批准

`authorize(grant,actor,action,arguments,now,used)` 校验后返回 grant id，不消费。调用写入的一层消费id。

批准字段准确为 `id, actor, action, arguments_sha256, expires_at`。`id` 是非空字符串；`now/expires_at` 是整数且不是bool；`now >= expires_at` 拒绝；已用id拒绝；操作者/动作/参数任一变化拒绝。

稳定参数编码为 UTF-8 的 `json.dumps(value, ensure_ascii=False, sort_keys=True, separators=(',', ':'))`，之后取SHA256。patch参数只有 `path,before_hash,old,new`；restore参数只有 `path,current_hash,restore_hash`。这是本地课程批准合同，真实权力来自宿主回调，不是摘要本身或模型提交的grant。

## 验证

`fingerprints(root,names)` 对非空、无重复的明确文件列表返回 `{name: sha256}`。缺文件/范围错误不能被忽略。

`verify(root,protected_hashes,observed_names,runner)`：先确认原测试摘要，调用一次可信runner，再核保护文件与整个可见源码文件集。runner异常显露；没有runner拒绝；空保护表拒绝。

结果准确包含 `status, report, verified_hashes`。`status` 为下列之一：

- `protected_changed`：保护文件缺失/改动；在调用前发现时不得运行；调用后发现也不能认可结果。
- `changed_during_verification`：测试前后可见文件集或字节不同。
- `invalid_report`：报告的tests_run/failures/errors/exit_code不是整数（bool也不行），或者前三者为负。
- `no_tests`：tests_run为0。
- `tests_failed`：有测试，但退出码、failures、errors任一非零。
- `tests_passed`：上述条件全部满足；只在此时保存完整源码文件集的verified_hashes。

`green_is_current(root,verification,observed_names)` 只有当前全文件集/摘要与这份成功记录一致才返回True。新文件、删除文件、改一字节都使结论失效。

## 执行边界观察

`assess_probe(original,outside_after,network_hits,credential_leak,report,nonce)` 返回 `{status,violations}`。

- `outside_after != original` → file；宿主network_hits>0 → network；credential_leak非空 → credential。任何实际违规都优先判unsafe，顺序为file/network/credential。
- 无违规时，report必须是字典、nonce一致、completed恰为True，否则inconclusive；完整才probe_passed。不要读sandboxed字段。
- network_hits必须是非负整数且不为bool；这不是从候选返回值取得的计数。

`executor_for(id,configuration,validations,executors,now)` 只返回登记函数，不调用。configuration必须非空且匹配，probe_status必须probe_passed，now小于整数expires_at，函数必须可调用；否则PermissionError。没有OS后端时，登记表为空是有效且诚实的状态。

## 主机循环与恢复

`host.run(root,request,decide,approve,runner,tools,now=10,budget=12)` 使用宿主request中的 `actor,task,constraints,writable,protected,observed`。预算为1–40整数；测试里的now是宿主提供的逻辑时间，不能伪装真实计时器。

传给decide的内容是 `{context,tools}`。context首两项固定为 `id=task` 和 `id=constraints`，trust为host；每次工具观察追加为observation-N，text为JSON、trust为untrusted。向决策端传副本，不能让它改掉宿主约束。

决策准确为 `{action,args}`，允许：list(空args)、search(needle)、read(path)、patch(path/before_hash/old/new)、verify(空args)、final(空args)。shell或参数多余应denied。patch只使用approve(action,args)回调结果，不读决策中的grant。PermissionError/ValueError/FileNotFoundError作为失败观察；未知程序异常继续显露。

final只有当前成功验证仍对应当前全文件时才completed，否则unverified；用完预算为budget_exhausted；字段坏为invalid_decision。返回至少 `status,observations,verification,patches,used_grants,steps,checkpoint`。checkpoint为schema `pipi-repair-checkpoint/v1`、task、constraints、current_hashes、status，不能包含可再次消费的批准。

`inspect_checkpoint(root,checkpoint,request,tools)`：schema/任务/约束不符→needs_review；文件摘要不符→needs_refresh；相同→ready_to_reverify。全部返回can_reuse_verification=False。它不是自动回滚或新建另一个仓库。
