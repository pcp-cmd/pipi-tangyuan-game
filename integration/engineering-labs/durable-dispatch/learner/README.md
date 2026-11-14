# 灯塔的可靠派送工坊

这是一份需要你动手完成的 Python 多文件工程。你会在真实 SQLite 数据库中保存状态，启动多个进程，故意丢失回复，再从另一目录运行自己打包的程序。所有通知都是本地虚构数据，不发邮件、不连接模型 API，也不需要付费服务。

包内 `durable_learning/` 的业务函数尚未实现。CLI、本地接收方适配器、打包工具和公开检查已提供；直接运行检查应当失败。课程通过、你在本机运行检查、老师审核独立能力，是三种记录。游戏只保存最小作品材料和待核验状态，不会因为你写了“全部通过”而发奖或盖章。

## 开始前

建议先完成游戏中的 `engineering-files`、`engineering-cli`、`engineering-tests`、`engineering-imports`、`archive-json`、`lifecycle-bounded-map`、`ae26-a02-evidence`。不熟悉 `try/finally`、异常传播、模块导入或 `async/await` 时，先返回相应讲解。SQLite 从本包第一章开始教，不假定你已经会数据库。

本工程需要 **Python 3.11 或以上**，依赖仅为标准库。游戏本身不需要另装 Python；这是离开游戏、使用自己的终端或 VS Code 的工程实践。编辑器不限，下面命令不依赖 VS Code 扩展。

把 ZIP 解压到一个新建的专用练习目录，不覆盖旧作品。

Windows PowerShell：

```powershell
py -3 --version
py -3 -m venv .venv
.\.venv\Scripts\python.exe -m durable_learning --help
.\.venv\Scripts\python.exe -m unittest discover -s tests -t . -v
```

Linux / macOS：

```sh
python3 --version
python3 -m venv .venv
.venv/bin/python -m durable_learning --help
.venv/bin/python -m unittest discover -s tests -t . -v
```

后面的 `python` 指你刚选定的虚拟环境解释器；可以直接使用上面的完整路径，不要求激活脚本。遇到 `No module named durable_learning`，先检查终端是否在解压目录，以及是否把另一个文件夹又套在外面。遇到 `No module named sqlite3`，该解释器没有提供本题所需标准库，请在 DELIVERY 中记录环境阻塞，不要编造一次测试结果。

## 先学，再做

| 阶段 | 先读 | 自己实现 | 证明什么 |
|---|---|---|---|
| 1 | [数据库与事务](lessons/01-sqlite.md) | `checkpoint.py` | 两条业务事实一起成功或一起失败，连接有主人 |
| 2 | [持久回执](lessons/02-receipts.md) | `receiver.py` | 重启后识别同一意图；回复丢失不等于没有执行 |
| 3 | [待发箱](lessons/03-outbox.md) | `outbox.py` | 业务与待发记录一起落盘；发送后、本地确认前可恢复 |
| 4 | [租期与旧工人](lessons/04-fencing.md) | `fenced_store.py` | 旧代次无法覆盖新结果；实际写入点检查资格 |
| 5 | [一次精确授权](lessons/05-approval.md) | `approval.py` | 批准的内容与真正执行的内容一致；一次授权只消费一次 |
| 6 | [重试与总时限](lessons/06-retry-deadline.md) | `retrying.py` | 有限等待；取消与清理可观察 |
| 7 · 迁移 | [最后一个名额](lessons/07-transfer.md) | `registration.py` | 在新业务中组合容量、一致性、重放和通知 |
| 8 · 组合 | [持久个人工作流](lessons/08-personal-host.md) | `personal.py` | 同一次派送中核对版本、批准、租期、回执并真实重启 |
| 9 · 陌生迁移 | [航次改期清单](lessons/09-sailing-transfer.md) | `reminder_plan.py` | 完整文件变成原子草稿批次，逐份批准后才可恢复派送 |

公开检查不是答案。每个函数的 docstring 是具体接口合同，表名、字段名也是可检查接口。你可以选择不同控制流、SQL 写法和合法事务管理方法；检查读取结果、异常、调用和真实数据库，不要求某种函数内代码排版。作者专用的 SQL 追踪强杀探针没有塞进学生检查，因此不会因为你使用了另一种合法 SQL 拼法就判错。

逐阶段运行可缩小排错范围：

```sh
python -m unittest tests.test_durable.CheckpointTests -v
python -m unittest tests.test_durable.ReceiverTests -v
python -m unittest tests.test_durable.OutboxTests -v
python -m unittest tests.test_durable.FencingTests -v
python -m unittest tests.test_durable.ApprovalTests -v
python -m unittest tests.test_durable.RetryTests -v
python -m unittest tests.test_transfer -v
python -m unittest tests.test_personal -v
python -m unittest tests.test_reminder_plan -v
```

## 把故障变成看得见的实验

先完成前三阶段，再在新建的实验目录运行：

```sh
python -m durable_learning --workspace ./practice-state queue invitation-1 "fictional notice"
python -m durable_learning --workspace ./practice-state dispatch --lose-reply
python -m durable_learning --workspace ./practice-state inspect
```

第二条故意返回退出码 2。观察数据库：接收方已有一条 effect 和一份 receipt，发送方仍是 pending。不要只看命令中的错误字样，就断言“没有发过”。

关闭终端或在另一个新进程继续：

```sh
python -m durable_learning --workspace ./practice-state dispatch
python -m durable_learning --workspace ./practice-state inspect
```

应当只有一条实际 effect，发送方改为 sent。再运行 `dispatch`，本次确认数为 0。换一个 operation ID 表示另一份真实意图，会产生第二次效果；不要用每次重试都随机生成新 ID 来“去重”。

再试 `checkpoint --interrupt`、`queue --interrupt`、`dispatch --interrupt`，分别解释故障发生在哪个事务边界。保留已有成功记录，不把整个数据库删掉后重跑称作恢复。

## 交付为可从别处启动的程序

```sh
python build.py
python durable-dispatch.pyz --help
```

`build.py` 不覆盖已有产物。需要再次构建时，在另一个项目副本构建或先自行保留旧产物。不要拿旧 `.pyz` 的结果证明改过的源码。

随后从**另一个空目录**，用解释器加 `.pyz` 的绝对路径启动，并给 `--workspace` 一个绝对实验目录。Windows 示例：

```powershell
C:\YourProject\.venv\Scripts\python.exe C:\YourProject\durable-dispatch.pyz --workspace C:\YourLab\state inspect
```

替换成你实际的路径。Windows 路径带空格时使用引号。将实际路径、Python 版本、命令、退出码和从表中观察到的事实写入 DELIVERY；没有在 Windows 运行就写未验证 Windows，不用 Linux 成功代替。

## Debug 与 Transfer 的交付

Debug 至少挑三种实质错误：两份记录间提前提交、重试换 operation ID、发布漏验 generation、批准 A 却执行 B、最后一次失败后还等待。先预测后果，再在自己的副本中做小改动，证明你新写的测试会失败，修回后通过。提交失败原因与观察，不提交“所有坏实现都拒绝”的空话。

Transfer 完成第七章的新报名需求和第九章的航次改期需求，并补自己的额外边界测试。两者同属这一份工程，不重复计算多个毕业作品。CLI 提供 `event`、`book`、`deliver-bookings`、`plan-trips`，仍需你实现业务。

第八章先把草稿、批准、待发箱、租期与回执连成实际流程：`draft` → `approve-draft` → `queue-approved` → `personal-send --lose-reply` → 新进程 `personal-run`。批准入口先显示真实内容，只有自己确认后键入指定短语才记录批准。第九章把新文件需求接入同一条流程，不能自动批准整批。详见对应章节的可运行命令和稳定合同。

在游戏的“在 VS Code 完成一项工程”入口选择本委托，预览并只保留源码、测试、必要虚构样例及 DELIVERY。`.sqlite`、`.pyz`、`.venv`、`.git`、缓存与真实收件人资料不属于最小提交。可以把数据库查询结果手动整理成去敏的 `RUN.txt`；它是你的声明，不能替代独立核验。

## 边界

本包证明的是本地、受控 SQLite 与进程行为。双进程实验只覆盖具体调度，不是分布式系统所有调度的数学证明。真实网络、文件系统断电、远端服务、MCP 客户端、VS Code 操作和人工独立解释需要相应环境与观察。第五章的授权模块是串行内存练习；第八章新增本地持久批准与组合恢复，它仍不是可投入生产的身份系统。提供的 provider 在真实 SQLite 中记录虚构效果和绑定具体内容的回执；不能据此信任任意服务返回的字典。租期检查只约束本地受保护写入，不自动约束外部服务。回执和幂等记忆的保留期是协议前提；删掉接收方数据后不能承诺永远不重复。
