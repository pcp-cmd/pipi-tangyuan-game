# 08 · 将各模块连成能恢复的个人工作流

前六章让你分别练过数据库、回执、待发箱、租期、批准和有界重试。这一章要证明它们在**同一次真实派送**中互相约束：持久草稿有版本，宿主批准的是显示过的具体内容，重启不能忘掉原操作编号，工人失去资格不能再覆盖结果。

先运行 `python examples/versioned_ticket.py`。这段异题代码只展示快照与版本。想一想：一本书借七天已获同意，后来草稿改成十四天，为何不能沿用原同意？再看自己的工程，只有函数签名里出现 `version`，并不能证明实际执行检查了它。

## 状态与记录分别负责什么

| 记录 | 必须保存的事实 | 不能代替它的东西 |
|---|---|---|
| 草稿 | 稳定身份、递增版本、收件人、正文 | 终端上曾显示的一段文字 |
| 批准 | 当前版本、规范化内容、操作编号、批准者、期限、是否消费 | 模型提议中的 `approved:true` |
| 任务 | 不可变意图、当前批准、pending/blocked/sent、工人代次和租期 | “send 函数被调用过” |
| 接收方回执 | 实际存下的操作编号、内容、回执 | 只有一个相似的编号或自报 `passed` |

`personal.py` 给出稳定表结构和每个公开接口。你可选不同 SQL 和函数组织方式。先在纸上写清三条事务边界：草稿版本比较与保存；消费批准与登记任务；取得代次与租期。调用 provider 时已经离开写事务，避免持锁等待外部操作。

课程中的串行 `approval.py` 仍保留原合同。这里新增持久批准表，并不假装把一个内存字典变成了真实身份服务器。CLI 是本练习的可信宿主入口；修改本地数据库或宿主源代码的人仍控制这份本地实验。

## 精确批准怎样到达执行边界

完成 `save_draft`、`approve_draft`、`queue_approved`，先运行前半组检查。新草稿从版本1开始，更新要给出读到的旧版本。批准后再改草稿，旧批准必须失效。一旦任务排队，原意图不能原地修改：新内容使用新草稿与新的操作编号。

排队时检查一次仍不够。程序可能等待过久，另一位工人可能接管，批准也可能过期。真正调用 `send` 前，重新读取并核对当前资格与当前批准。`now == expires_at` 已经超时；`now == lease_until` 也不再有写入资格。不要只比较工人的名字：两个真实进程可能使用相同名称，代次才区分新旧领取。

下面是完成后的实际操作流程。`--workspace` 必须是自己的专用实验目录，所有收件人都是虚构值。

```sh
python -m durable_learning --workspace ./personal-state draft notice-draft fictional-inbox "请携带星图"
python -m durable_learning --workspace ./personal-state approve-draft notice-draft 1 notice-op approval-1
```

第二条显示真实草稿、版本、操作编号、批准者和期限。第一次输入 `decline`，应当退出2且没有批准记录；再次运行并查看内容后，自己输入提示中的 `APPROVE approval-1` 才会写授权。

```sh
python -m durable_learning --workspace ./personal-state queue-approved approval-1
python -m durable_learning --workspace ./personal-state personal-send --lose-reply
python -m durable_learning --workspace ./personal-state inspect
```

此处真实接收方已落盘，但发送方应仍是 pending。关闭该进程，在新进程运行：

```sh
python -m durable_learning --workspace ./personal-state personal-run --worker restarted --steps 4
python -m durable_learning --workspace ./personal-state inspect
```

核对两个独立数据库：同一通知只有一条 effect，匹配回执使任务变为 sent。再构建本次 `.pyz`，从另一目录重复查询。不能删除数据库后从头开始，把那次成功叫作“恢复”。

## 回执必须回答“哪一份意图”

`personal_provider.py` 是提供的本地适配器。它查询接收方**实际保存**的 `op_id`、`payload`、`receipt`，没有用调用方传入的数据拼出“证据”。你实现的宿主要验证这三个事实。先看适配器源码，再独立实现检查。

想象两个互不相识的工程目录都用了 `notice-1`。第一份正文是“带星图”，第二份是“带帐篷”。只按编号查到一个回执，无法证明第二份已执行。公开回归会实际建两份宿主数据库共用一个接收方，要求不同内容拒绝且不标 sent；相同内容在新宿主恢复、甚至批准已过期时，可以确认旧效果，但不能再产生一次新效果。

这不意味着任意服务返回的字典都可信。本练习明确由可信宿主供应本地 adapter，并独立查询其真实 SQLite。真实服务需要自己的认证、回执完整性、保留期和权限约束；这里没有建立远端信任系统。

## 失败不是一个模糊的红色状态

| 观察 | 继续办法 |
|---|---|
| `lookup` 或 `send` 抛 OSError | 保留未知结果，下一步仍使用原意图查回执；消耗一次预算 |
| 批准在真正发送前到期 | 进入 blocked，展示并取得新批准；同一内容保持原操作编号 |
| 租期过期或新代次接管 | 旧工人返回 stale，不覆盖新记录 |
| provider 返回别的内容或假回执 | ValueError，保留未完成任务，不伪造完成 |
| 清理租期时数据库也失败 | 主异常仍是原 provider 异常，另附清理错误；不能抹掉未知结果 |
| 步数耗尽 | `budget-exhausted`，明确仍有未完成工作 |

`run` 的预算在1到40步之间，失败尝试也计数。它是可审查的确定性工作流，不假装具有真实模型的自主规划能力。`completed` 是这次本地运行的状态，不能当课程通过或人的独立能力。

```sh
python -m unittest tests.test_personal -v
```

这组会启动真实第二进程、双工人，检查真实表与效果；仍只覆盖所写调度。你还要设计一个没有照抄公开用例的时序反例，先预测结果，再观察。最终在 DELIVERY 说明三个模块都各自通过时，为什么组合仍可能出错，以及你在哪个实际边界发现了它。
