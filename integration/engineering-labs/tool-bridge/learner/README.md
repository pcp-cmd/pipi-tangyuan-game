# 工具桥与运行证据

你要交付一个能从命令行、回环 HTTP 和 MCP stdio 调用的 Python 工具，再用真实日志与独立评分说明它做了什么。工具只读取虚构货品目录并计算报价。你会另外完成一个观测站时间窗口任务，证明自己能把机制用于另一种问题。

这个工程接在游戏已有课程之后。它有未解源码、可运行的小例子、真实进程夹具和公开合同检查。初始源码中的 `NotImplementedError` 是待完成工作；不是运行环境坏了。所有作者解答都在学生包之外。

## 准备

先能独立使用字典、函数、文件、异常、模块、测试、命令行参数和 `async/await`。建议复习游戏的 `engineering-cli`、`engineering-files`、`engineering-tests`、`archive-json` 和 `ae26-a02-evidence`，并完成 `repo-repair` 工程。准备建议不锁住课程，也不自动授予成绩。

本机需要 Python 3.11 或更新版本。先运行 `python --version`。项目主要代码只使用标准库，不需要联网账户或 API 密钥。附带测试不连接公网。官方 MCP SDK 是作者的额外互操作检查依赖，学生的基本检查不要求安装它。

在 Windows PowerShell 中，先启用 Python 的 UTF-8 模式。

```powershell
$env:PYTHONUTF8 = "1"
python --version
python examples/temperature_parent.py
```

在 macOS 或 Linux 中运行同一例子。

```sh
python3 --version
python3 examples/temperature_parent.py
```

例子会启动另一个 Python 进程，输出 `fahrenheit: 68.0`。它只讲输入输出，不包含报价工具解法。

## 按顺序完成

1. 阅读 [JSON 与命令行](docs/01-json-cli.md)，完成 `domain.py` 中的报价功能与 `cli.py`。运行 `python run_checks.py --group domain` 和 `python run_checks.py --group transports`。HTTP 尚未完成时，后一个分组的 HTTP 检查仍会失败。
2. 阅读 [回环 HTTP](docs/02-http.md)，完成 `http_adapter.py`。再次运行 transports 分组，区分连接、状态码、JSON 和业务字段错误。
3. 阅读 [MCP 与两个真实进程](docs/03-mcp.md)，完成服务器和客户端。运行 `python run_checks.py --group mcp`。观察通知交错、超时、取消与子进程退出。
4. 阅读 [记录与还原运行](docs/04-traces.md)，完成 `telemetry.py`。运行 `python run_checks.py --group telemetry`。两个 worker 会真实交错执行，另一个进程会重新读取日志。
5. 阅读 [独立效果评估](docs/05-independent-evaluation.md)，完成 `evaluation.py`。运行 `python run_checks.py --group evaluation`。让自报成功、额外效果和缺失试验都不能冒充通过。
6. 阅读 [陌生迁移](docs/06-transfer.md)，完成 `slot_availability`，自行增加新案例并提交诊断。最后运行 `python run_checks.py`。

每一步先看小例子，再写未解函数。需要具体字段时查 [能力合同](docs/CONTRACT.md)，不要从测试日志反向拼出当前案例的硬编码答案。公开测试会显示预期结果，但不会提供完整实现；你仍要解释数据、错误与边界。

完成后运行真实组合实验，输出目录必须是一个新的目录。

```sh
python run_experiment.py --output evidence
```

实验会留下命令行结果、真实回环端口、stdio 子进程信息、原始 JSONL、独立评分结果与源文件摘要。再次运行请使用新的目录名；提交时保留你选定的一轮为 evidence，旧轮次另外留存。它没有浏览器界面，也不访问游戏真实存档。

## 独立交付

提交自己的 `toolbridge/*.py`、新增的扁平 `tests/test_*.py`、`SUBMISSION.md` 和 `evidence/*.json`、`evidence/*.jsonl`、`evidence/*.txt` 文本证据。`SUBMISSION.md` 应说明三种入口的选择、自己新增的边界案例、一次排错过程和时间窗口迁移。不要提交密钥、个人正文、未知依赖或可执行文件。

完整教材不需要重复提交。游戏的最小提交最多 48 个文本文件，单文件 64 KiB，总量 512 KiB。先填写自己的 SUBMISSION.md，再准备一份新的提交目录。

```sh
python prepare_submission.py --evidence evidence --output prepared-submission
```

这个命令只复制自己的模块、测试、所需夹具和交付说明，把选定一轮的原始记录按原字节与 SHA-256 汇集为 `evidence/selected-run.json`。它不执行作品、不改变评分，也不删除原记录。回到游戏后选择 prepared-submission 目录，并检查预览清单。若运行记录在别的目录，把 `--evidence` 改成那个路径。

准备提交时会逐项比对当前模块、夹具和实验入口的摘要。如果运行后改过这些文件，请重新运行实验，不能把旧版结果贴到新版源码上。这个核对用于发现误配，记录仍是自行生成且待核验，并不提供防恶意伪造的可信签名。

先用公开样例跑通，再换一份自己编写的目录和时间表。从空白说明页写判断，之后再看测试输出。请他人给你一份未见过的合法目录或冲突窗口，独立解释它的结果。此环节需要真实作品评审；作者参考实现通过、你的公开测试通过和独立掌握是三种不同证据。

游戏只保存工程提交与评审状态。当前上传文本不会在游戏宿主执行，也不会因为写了 `passed: true` 自动核验或给课程奖励。没有隔离执行环境的作品保留为待核验。

## 边界与来源

这份 stdio 工具实现固定在历史版本 MCP `2025-11-25` 的教学子集。普通 `/quote` HTTP 接口不是 MCP Streamable HTTP。它不实现资源、提示词、采样、通用 JSON Schema 校验或完整并发 RPC。

本包的日志格式是教学合同，未冒充 OpenTelemetry。单个 JSONL 文件由一个进程写，多个进程各用自己的文件，再按身份合并。文件效果夹具由课程作者控制，不是执行不可信代码的沙箱。

作者在当前 Linux 环境验证真实子进程与回环请求。Windows 实机、完整协议一致性和真实玩家掌握必须分别确认。规范与教学来源见 [来源记录](docs/SOURCES.md)，项目交付与来源范围见 [SOURCE-NOTICE.md](SOURCE-NOTICE.md)。
