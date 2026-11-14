# 从数据合同到可组合命令

完成本节后，你能让另一个进程稳定调用报价程序，并准确判断一次调用成功还是失败。

## 先把 JSON、Python 对象和业务值分开

`'{"count":2}'` 是字符串，`{"count": 2}` 是 Python 字典。`json.loads` 把前者解析成后者。`json.dumps` 执行相反方向。禁止用 `eval` 处理外部输入。

成功解析不代表字段正确。`{"count":"2"}` 也是真实 JSON，乘法却可能变成字符串重复。Python 还有一个边界，`isinstance(True, int)` 为真。合同要求数量是整数时，必须明确拒绝布尔值。

在 Python 交互窗口预测后运行。

```python
import json
print(json.loads('{"count":"2"}')["count"] * 3)
print(isinstance(True, int))
print(type(True) is int)
```

预期输出是 `222`、`True`、`False`。练习把 `count` 换成列表、`None`、负数与零，分别说明“语法是否合法”和“业务是否接受”。报价任务的数量范围为 1 到 999；库存与单价允许零。

## 先运行一段异题程序

打开 `examples/temperature_cli.py`。它把摄氏温度转成华氏温度，与报价无关。`main` 返回退出码，底部的 `if __name__ == "__main__"` 才启动它，所以导入模块不会读取输入或启动服务。

运行 `python examples/temperature_parent.py`。父进程把参数列表交给 `subprocess.run`，没有把路径拼成一条 shell 字符串。这样含空格的文件名仍然是一个参数。`sys.executable` 使用当前 Python；`timeout` 限制子进程等待时间。

`capture_output=True` 分开收集 stdout 与 stderr。stdout 是给调用程序的 JSON，stderr 是给人的诊断。退出码是第三条信息。不能只看 stdout 非空就当作成功。

把温度例子的输入改成 `{"celsius":"warm"}`。你应看到退出码 2、stdout 的错误对象和 stderr 的短说明。不要把这段温度函数直接替换成整题报价解法。

## 实现报价合同

先写纯函数 `quote(catalog, request)`。纯函数读取字典并返回新的报价对象，不减库存、不写文件。先做三种检查：完整目录是否有效、请求是否具有准确字段、请求的 SKU 是否存在。任何额外的 `approved` 或 `root` 字段都不能扩大能力。

再实现 `load_catalog`，用 `Path.read_text(encoding="utf-8")` 读取目录。文件可能不存在，也可能不是 JSON。两类错误不能都伪装成“没有货”。`decode_json` 还需拒绝 Python JSON 解码器默认容许的非有限数常量；输出使用 `allow_nan=False`。

最后用 `argparse` 增加 `quote --catalog PATH`。命令从 stdin 接收一个 JSON 对象，并在 stdout 写一个 JSON 行。`--help` 是人的帮助信息，单独定义为允许输出文字。`allow_abbrev=False` 防止 `--cat` 悄悄代替 `--catalog`。

参数、stdout、错误码和输入长度的准确规则见 [能力合同](CONTRACT.md)。先完成合法报价，再加错误分支，不要先硬编码公开样例。

## 分层提示

如果不知道如何组织，先画出“读取边界，纯函数，输出边界”三个位置。不要在每个字段读取处散落 `try/except`。

如果错误分类仍混乱，给三个独立案例写预期退出码：坏引号、未知 SKU、不存在的目录文件。让测试捕获退出码、stdout 和 stderr，而不是只检查异常文本。

如果含空格的路径失败，检查调用参数是否为列表，检查是否把工作目录误当作资料目录。公开检查会从另一个工作目录调用你的模块。

## 独立应用

自己创建含中文 SKU、零单价、库存不足和正常库存的目录。保存原文件 SHA-256，连续报价后再次计算。内容必须相同。再从另一个目录调用你的工具，并说明为什么不依赖启动目录。

独立测试至少增加一个未出现在公开夹具中的合法案例和一个混淆类型的错误案例。只把数字 2 改成 3 不足以证明理解；解释为什么 `true` 不能被当作数量 1。
