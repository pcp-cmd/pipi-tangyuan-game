# 来源与使用边界

本包的教学说明、学生骨架、CLI、打包脚本、虚构样例与行为检查为本项目本轮自主编写，作为《皮皮和汤圆 Python 学习游戏》的工程练习交付。没有复制 AE26 原教材、原练习解答、受限源码或其他游戏素材。此说明不为整个游戏、原素材或用户附件重新授予开源许可证。

仅使用 Python 标准库：sqlite3、asyncio、json、argparse、pathlib、tempfile、subprocess、threading、queue、unittest、zipapp、shutil 等。Python 解释器及其 SQLite 库由学习者自己的环境提供，未捆入学生 ZIP；它们各自的许可证继续适用。未捆入第三方 SDK、模型服务或付费依赖。

外部概念与 API 参考：

- Python sqlite3 官方文档：https://docs.python.org/3/library/sqlite3.html
- Python asyncio 任务与超时文档：https://docs.python.org/3/library/asyncio-task.html
- SQLite 事务文档：https://www.sqlite.org/lang_transaction.html
- Python zipapp 文档：https://docs.python.org/3/library/zipapp.html

这些链接用于进一步查阅，不是离线练习的必需网络请求。可运行所需合同、说明和示例均在包内。作者验证只运行本轮明确编写的代码与已知语义变体；游戏不会在普通宿主上执行你上传的代码。
