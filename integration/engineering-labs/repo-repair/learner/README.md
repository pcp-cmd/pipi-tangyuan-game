# 代码工坊 · 给仓库一次可靠修补

在 VS Code 或其他文本编辑器完成这个工程。游戏内可以领取、下载、保存作品与如实记录帮助；本机的测试结果不会自动成为独立能力认证。

## 你会交付什么

一套能从陌生仓库找线索、读取当前版本、提出最小修改、请求精确批准、写入、验证、恢复并重新核验的 Python 工具，以及自己的有界决策流程。原游戏课程和存档不需要修改。

先完成游戏中的文件、模块、测试、排错、Agent 工具和循环练习。不了解 Git 暂存区、原始字节摘要或子进程时，先跟随 `LEARN.md` 的小实验。本项目仅用 Python 标准库与已安装的 Git；不需要模型 API、密钥、网络账户或收费服务。

## 启动

1. 将整个 ZIP 解到一个专用目录，用编辑器打开该目录。不要在游戏源仓库或自己的工作项目里试验恢复命令。
2. 在终端运行 `python --version`、`git --version`，再运行 `python -c "import sys; print(sys.executable)"`。记录你实际使用的解释器。建议 Python 3.12 或更新版本；Windows 的 junction 检查需要对应平台验收，Linux 的符号链接测试不能替它背书。
3. 阅读 `LEARN.md`，实现 `repair.py` 与 `host.py`。它们起初全部未解；第一次运行出现 `NotImplementedError` 是预期现象。
4. 运行 `python -B -m unittest discover -s tests -v`。公开检查会创建并清理自己的临时 Git 仓库，不会操作你的真实仓库。它导入你自己的代码，所以运行前要审阅代码；它不是执行恶意程序的沙箱。
5. 每解决一种失败，在 `DELIVERY.md` 记录失败原因、最小修复和新测试。测试全过之后仍要完成 `TRANSFER.md` 中的另题。

Windows 可用 `py -3.12` 替换命令中的 `python`。不要为了完成课程修改全局 Git 配置。`fixture.py` 只为它自己建立的临时仓库写本地身份。

工具合同通过后，实际连成自己的主机：

```sh
python -B run_lab.py --setup ferry --output my-ferry-run
python -B run_lab.py --run --output my-ferry-run --decisions DECISIONS.json
python -B run_lab.py --resume --output my-ferry-run
```

第一步只建立陌生位置的教学仓库并保留修改前失败。第二步读你自己的决策；默认的`final`只能得到未验证。每次修补会显示实际diff与参数摘要，输入完整摘要才批准这一项。第三步由新进程重新核对checkpoint。也可用`--planner decision.py`提供你自己审阅过的`decide(prompt)`，两个决策入口互斥。终端命令不会访问外部模型。

## 文件用途

| 文件 | 用途 |
| --- | --- |
| `LEARN.md` | 先修小实验、预测、解释和分层提示 |
| `CONTRACT.md` | 你的函数、失败状态和副作用的准确合同 |
| `repair.py` | 你实现的文件工具、批准、验证与边界判断 |
| `host.py` | 你实现的决策循环、当前验证和恢复检查 |
| `fixture.py` | 自主编写的临时仓库与固定可信测试入口；保留不改 |
| `tests/test_contract.py` | 公开行为检查；另外添加自己的 `tests/test_*.py` |
| `TRANSFER.md` | 陌生需求与自主交付，不提供同题替换代码 |
| `transfer/reminders.py` | 你独立实现的借阅提醒规则与命令行入口 |
| `transfer/examples/loans.json` | 另题使用的虚构借阅数据 |
| `tests/test_transfer_contract.py` | 另题的公开边界与真实命令行检查 |
| `DELIVERY.md` | 实际运行、失败复现、帮助来源与未验事项 |

三个公开 fixture 的规则与作者可执行字节存在于 `fixture.py`，用于检验主机是否可靠组合工具。读取它们、运行默认流程都不算独立解题。陌生项目需要你自己的需求分析、决策与测试，不能拿 fixture 的修复文本提交为 Transfer。

## 提交回游戏

选择本项目的专用作业目录，先排除 `.git`、`.venv`、缓存、无关文件与个人资料。提交你实现的 `repair.py`、`host.py`、`transfer/reminders.py`、自己的测试、`DELIVERY.md` 与 `DECISIONS.json`；可附文本形式的 diff、运行日志和恢复记录。每个文本不超过 64 KiB，整份最小提交不超过 512 KiB。未完成的部分应在交付记录中直说，保存材料不会自动授予通过。

游戏不会执行上传材料。未配置可信审核方时，作品状态保持“待核验”；你可以继续学习和导出材料，不会因等待审核而锁住航线。

## 来源与许可

本包的代码、临时业务数据、练习说明和验收器均为本项目自主编写，来源范围见 `SOURCE-NOTICE.md`。AE26 的 D00/D01/F06/S00/S01/D02/KCODE 提供能力映射参考，未复制其实现或打包原教材。Python 与 Git 的官方文档链接列在 `LEARN.md`，外部文档不随包复制。
