# 仓库交班：独立工程委托 v1

这是游戏外部委托 `stockledger` 合同第1版的独立多文件工程，承接 `project-stock-ledger`。`stockledger/core.py`、`files.py`、`cli.py` 留有待实现入口；包内没有参考答案。此前的 `integration/native-course/` 是已完成的货运报告跟做项目，仍可作为工具用法参考。两者的任务、输入文件与验收不同。

目标是独立交付一个陌生人能运行的工具：读取库存和订单两份 CSV，决定是否整单出货，把结果写成 JSON。游戏里的通过证据不会自动替本地项目盖章；本地测试通过也不自动变成游戏存档或证明所有者学会。

## 先具备这些能力

完成游戏中的文件与编码、CSV、CLI、测试设计、货运报告，以及独立日志汇总和回归测试挑战。知道 `with` 负责归还文件，函数参数和返回值传递数据，异常沿调用栈传播。这里进一步练习模块边界、命令行、工作目录、测试与交付。

## 1. 先确认环境

游戏本身的试玩不需要另外安装 Python。这个独立开发项目需要本机已有 Python 3.12 或以上；项目只用标准库，无需联网安装第三方依赖。终端中的命令与 `.py` 文件中的 Python 代码不是同一种输入。

在解压出的本目录打开终端，确认可看见 `stockledger`、`tests`、`build.py`。

Windows PowerShell：

```powershell
py -3.12 --version
py -3.12 -m venv .venv
.\.venv\Scripts\python.exe -m stockledger --help
.\.venv\Scripts\python.exe -m unittest discover -s tests -v
```

若机器安装的版本不同，可用实际可用的 `py -3` 或 `python` 创建环境。解释器不存在时先安装 Python；不要把此问题误当成代码错误。以上命令直接调用虚拟环境解释器，不要求修改 PowerShell 执行策略。Linux/macOS 对应：

```sh
python3 --version
python3 -m venv .venv
.venv/bin/python -m stockledger --help
.venv/bin/python -m unittest discover -s tests -v
```

`--help` 在起始项目中应成功。完整测试在尚未实现时会报告 `NotImplementedError`，这是明确的待做入口，不能删测试来“完成”。此学生包在 Linux Python 上验证工具链和独立参考实现；Windows 原生命令尚需用户实机验证。

## 2. 理解数据合同，先手算

请重新阅读接口：这份原生任务用 ready 布尔值表达决策，游戏任务用 status 字符串；此处的空数据行需要拒绝，只有标题的文件才表示空记录。不能原样复制旧入口就认为已满足新要求。

两个 CSV 的首行都必须恰好是 `item,qty`。名称不能全部为空白，原有空格保留；数量按 `int(text)` 解析且非负。相同名称出现多次则累计。必须正确处理引号中的逗号、换行和中文，不能用 `split(',')` 代替 CSV 解析。空文件、错误列数、空名称、坏数量、负数和损坏引号均抛 `ValueError`。例如 `"灯"x,2` 和引号未闭合的记录必须拒绝；用 `csv.reader(..., strict=True)` 明确启用严格引号解析。只有标题行的文件表示空字典。

输出为：

```json
{"ready": true, "stock": {"灯": 3, "绳": 2}, "missing": {}}
```

库存满足整份订单才扣减。如果任何商品不足，`ready` 为 `false`，`stock` 保留原库存数量，`missing` 包含所有正缺口。`ready` 必须是真正的 `bool`，数字1或0不能代替。不能部分扣减。零数量是合法数据，零库存键不应被随意删除。两个输入不变，输出是新字典。先手算随包示例与一份缺货订单，写出预期再开始实现。

## 3. 按责任边界实现

| 文件 | 接收什么 | 交回或影响什么 | 边界 |
| --- | --- | --- | --- |
| `core.py:parse_quantities` | CSV 文字 | 名称到总数量的字典 | 不读文件、不打印 |
| `core.py:prepare_report` | 两个字典和 `reserve=0` | ready/stock/missing | 不改变输入 |
| `files.py:build_report` | 三个不同文件路径和 `reserve=0` | 写 JSON 并返回报告 | 两份输入全部通过校验后才打开输出写入 |
| `cli.py:main` | 参数列表或进程参数 | 成功返回0，数据/文件错误返回2 | 诊断写标准错误；程序缺陷不隐藏 |

`.core` 是相对包导入。使用 `python -m stockledger` 从包入口运行；不要用 `python stockledger/cli.py` 破坏包上下文。`__init__.py` 标识包，`__main__.py` 只负责入口，业务规则不应塞进入口。

文件层明确保证坏数据不会清空旧报告；磁盘写满、写入中断或电源故障的原子替换不是这份练习的合同。输入与输出路径保证不同。理解边界比过度宣称“事务安全”更重要。

## 4. 排错、测试和真正的迁移

先运行一项测试，例如 `python -m unittest tests/test_core.py -v` 在部分环境需要包可导入，因此统一推荐 `python -m unittest discover -s tests -p test_core.py -v`。从异常最后一行开始，沿文件和行号回到自己的函数，记录实际值与期望值。缩小为最小输入，修一个原因，再重跑对应测试与完整测试。

请自行新增 `tests/test_my_cases.py`，至少解释并实现三个随包测试没有覆盖的案例。例如非常大的整数、先成功后坏尾部、两个名称仅空白不同。每个案例必须说清它会抓住哪种错解。故意把累计改成覆盖或把写文件提前，确认测试真的失败，再恢复。不要让测试只验证自己写的实现步骤。

### 安全库存的精确合同

这次工程包含一项需求变更：加入 `--reserve N`。函数 `prepare_report(stock, orders, reserve=0)` 与 `build_report(stock_path, orders_path, report_path, reserve=0)` 都接受这个参数，命令行转为整数再传入。函数层只接受 `type(reserve) is int` 且非负；`True`、`False`、小数、文字、`None` 和负数抛 `ValueError`，即使订单为空也必须检查。

对订单涉及的每个商品，先保留 N 件，剩余且不小于零的数量才能出货。`missing` 表示订单还差多少可出货数量；只列正缺口。库存本来低于 N 时，可出货数为零。订单为零时不要求先补足安全库存；空订单直接可交班。整单可出货才扣实际订购数，**不会另外把安全库存扣掉**。未订购商品不扣减，输出与输入仍分开。

| 库存 | 订单 | N | 应有判断 |
| --- | --- | --- | --- |
| 水9 | 水5 | 4 | 可出货，余水4 |
| 水9 | 水6 | 4 | 缺水1，原库存水9不变 |
| 笔1 | 笔2 | 4 | 缺笔2，原库存笔1不变 |
| 空 | 纸0 | 4 | 可出货，输出纸0 |
| 水1 | 空订单 | 4 | 可交班，水1不变 |

省略参数与显式零必须保持原行为。坏 `reserve`、坏 CSV 或读入失败不能清空旧报告。CLI 对这些错误返回2并写诊断；短缺是合法报告，仍返回0。公开的 `tests/test_reserve.py` 给出了几项正常与边界例子；你仍须增加自己的测试，尤其换全新商品、混合缺货、很大整数与一份坏尾部文件。

## 5. 运行与交付

完成代码后运行：

```sh
python -m unittest discover -s tests -v
python -m stockledger examples/stock.csv examples/orders.csv report.json
python -m stockledger examples/stock.csv examples/orders.csv reserved.json --reserve 3
python build.py stockledger.pyz
```

Windows 可将 `python` 换成 `.\.venv\Scripts\python.exe`。换到另一个空目录，使用绝对路径运行 `python 路径/stockledger.pyz 库存.csv 订单.csv 报告.json`。`.pyz` 包含你写的模块，不包含解释器；不要把本机 `.venv` 复制给别人当通用运行环境。

交付源码、`.pyz`、一对示例输入、预期 JSON、自己的测试和简短运行说明。另附 `DELIVERY.md`：记录实际 Python 版本和系统、真实命令及退出状态、一次故障的前后复现、模块边界、仍不保证的条件。请另一位使用者按说明从空目录运行；他的观察属于真实使用证据，与作者测试分开。

可选用 Git 记录每次有意义的改动：`git init`、`git status`、`git diff`、选择自己的源文件 `git add` 后 `git commit`。先忽略 `.venv/`、`__pycache__/`、临时报告与个人数据。提交历史不是异地备份；未经同意不要把别人的文件或数据推送到外部仓库。

## 6. 回到游戏整理最小提交

在游戏“在 VS Code 完成一项工程”中领委托。完成或遇到需要说明的阻碍后，选择这个专用作业目录，预览后只保留源码、自己的测试、合成示例与 `DELIVERY.md`。排除 `.venv`、`__pycache__`、`.git`、密钥、真实个人数据和二进制 `.pyz`。`.pyz` 用于你在本机交付验证，当前游戏只接收受限的文字材料。

保存后可下载 JSON 最小提交包，其中包含实际选中的文字、逐文件摘要和帮助来源声明。游戏不会运行这些上传材料，不会自动发给外部服务，也不会因 `DELIVERY.md` 写了“通过”就给核验。当前尚未配置可信审核方，作品状态保持“待核验”；可继续学习，也可修改代码后再交新版本。

如果日后接入审核，审核方须对同一源码摘要的 Build、Debug、Transfer 分别核验。缺少环境时记录环境受阻，缺少证据时保留未知，不能用静态读码或作者自报替代真实执行。原课程成绩、奖励和这个作品域彼此独立。

## 来源与许可

本学生任务、示例、脚手架与测试沿用本项目原创的独立工程包，并补充安全库存需求与交班材料，未复制第三方实现。Python 工具用法依据 Python 官方文档：

- https://docs.python.org/3.12/library/venv.html
- https://docs.python.org/3.12/tutorial/modules.html
- https://docs.python.org/3.12/library/unittest.html
- https://docs.python.org/3.12/library/zipapp.html
- https://docs.python.org/3.12/library/csv.html

提供测试是帮助发现程序行为错误，不是自动认证独立学习、延时保持或职业能力。
