# 第一站：一份资料到底是哪一份

目标：独立运行 Python 文件，分清当前目录和脚本位置，读写 JSON，解释一次 hash 和一次位置定位。先修是函数、列表、字典、文件和异常；下面补足本工程需要的终端和标准库细节。

## 先跑不同的题目

在本工程目录执行 `python examples/toy_walkthrough.py files`。例子只谈果园浇水，与你要研究的港口和维修活动不同。它打印一段原文的 SHA256，再只加一个换行。预测两个 hash 是否相同后再运行。

hash 是对**实际字节**的摘要。给报告手填一个“版本1”字符串，并不能证明文件没变；只算正文也会漏掉访问标签、发布日期或替代关系变化。因此本工程读取完整 JSON bytes 后计算 SHA256。这个摘要不证明文字真实、作者是谁，也不替代授权。

打开 `research_lab/boundary.py` 的 `load_documents`：它先限制输入目录、文件种类和大小，再解析数据形状，最后附上原始 hash 与相对文件名。`Path` 负责路径操作；`read_bytes()` 得到 bytes；`.decode('utf-8')` 变成字符串；`json.loads` 变成字典。它们属于不同边界，不能把路径字符串直接当资料。

自己新建一个临时 `orchard.json`，保存不同内容再读回来。用 `with path.open(...)` 或现成 Path 方法释放文件。为了避免覆盖已有证据，CLI 使用新输出文件；再次运行到相同文件应报 FileExistsError，而不是静默替换。

## 原文位置为什么也要保存

Python 的 `text[start:end]` 包含 start，不包含 end。例子中 `watering = before noon` 后还有 `weather = dry only`。先找到第一行起点，计算 end，再打印切片。换成带中文的文本：本工程位置按 Python 字符计，不按 UTF-8 字节计。hash 仍对 bytes 计算，两种计量不要混用。

`text.split('\n\n')` 以空行划分片段；`enumerate` 同时给原序号与内容。若第 1 段只有空格，跳过后下一段仍是第 2 段，不能重新编号为 1。否则旧引用指向另一处。先用 `'a\n\n   \n\nb'` 手数，再实现索引。

## 终端与环境

先运行 `python --version`；不要因测试报错立即装一批包。本工程只用自带模块。想隔离环境，可执行 `python -m venv .venv`，随后直接用 `.venv/bin/python`（Linux/macOS）或 `.venv\Scripts\python.exe`（Windows）执行命令，无需改变系统解释器或安装包。环境目录不属于作品提交。

导入模块时 Python 根据模块搜索路径找文件。主入口 `run_lab.py` 在解压目录，使用 `from research_lab.cli import main`。把函数散放在另一个未登记文件夹会造成 ModuleNotFoundError；先核对目录和实际解释器，不把导入失败误判成检索算法错误。

## 本站自查

1. 用自己的词说明“文件路径、JSON 字典、原始字节摘要、段落字符位置”四者分别回答什么。
2. 只改访问标签，确认摘要也改变；只改内存中一个字典，不写回，确认磁盘文件保持原样。
3. 在项目根目录运行公开检查。未写函数出现 NotImplementedError 是待做提示；SyntaxError 应先看具体行，不能改测试消掉它。

独立应用：给另一份“雨天暂停”通知定位完整条件句；证明只引用“开放”会漏掉条件。将原文、位置与切片写在 DELIVERY 的预测记录里。
