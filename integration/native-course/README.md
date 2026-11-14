# 货运报告原生项目

这份项目把游戏中 engineering-files、engineering-csv、engineering-cli、engineering-tests 与 engineering-report 的规则放进真实多文件 Python 包。它只使用标准库，没有联网或付费服务。游戏通过记录不会自动认证本地操作。这是带参考实现的跟做材料，之后应另写一份闭卷实现。

使用 Python 3.12 或更高版本。在解压目录打开终端。可先用 `python -m venv .venv` 创建隔离环境。Windows使用 `.venv\Scripts\python.exe`，Linux/macOS使用 `.venv/bin/python` 代替下面的python。本项目没有第三方依赖，无需pip install。解释器、依赖版本和工作目录都属于环境，不等于代码逻辑。

1. 阅读 `catcargo/core.py`。它只把文本变成数据，适合用小案例测试。
2. 阅读 `catcargo/files.py`。它通过相对导入 `.core` 取得纯函数，只负责打开文件、调用规则、写JSON。相对导入需要包上下文，因此使用 `python -m catcargo`，不能直接执行 `python catcargo/cli.py`。
3. 阅读 `catcargo/cli.py`。它只负责参数与退出状态。正常为0，缺参数、坏数据和文件错误为2。命令行字符串先由argparse解析，再成为函数参数。
4. 创建UTF-8文件orders.csv，内容为下面三行。运行 `python -m catcargo orders.csv report.json`，核对输出JSON为 `{"灯": 3}`，源文件不变。

```csv
item,qty
灯,4
灯,-1
```

5. 运行 `python -m unittest discover -s tests -v`。每项测试使用临时目录。故意把累加改成覆盖，或把解析放在写文件之后，观察测试失败；修复后重跑。
6. 运行 `python build.py catcargo.pyz`。换到另一个目录，执行 `python 路径/catcargo.pyz 输入.csv 输出.json`。pyz包含包代码，不包含解释器，目标机器仍需要兼容Python。
7. 闭卷迁移。增加 `--minimum` 参数，只输出累计数量不低于阈值的货物。先写正常、等于阈值、负数、空结果与坏参数测试，再改CLI和纯函数。旧文件失败保护必须继续成立。这部分不会自动写入游戏学习记录。

调试先看异常最后一行，再沿文件与行号回到自己的函数。区分文件找不到、CSV格式错、数量转换失败与断言失败。用最小输入复现，再改一个原因；不要捕获所有异常并返回空字典来掩盖问题。

本项目保证解析失败不覆盖旧目标。写入过程中断、电源故障或磁盘满的原子替换不在合同内，不应把教学示例当成持久事务系统。
