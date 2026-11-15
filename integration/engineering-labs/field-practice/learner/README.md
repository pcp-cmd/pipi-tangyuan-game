# 远航实践

用自己的 Python 工程完成路径恢复、授权边界、控制架构比较和图书馆预约。需要 Python 3.12 或更高版本，只使用标准库。这个学生包没有参考实现。初次运行报 `NotImplementedError` 是未解题目的正常状态。

## 从实际目录开始

1. 解压到自己的练习目录，路径中可以有中文和空格。
2. 在 VS Code 打开这个目录。打开终端，运行 `python --version`，记录实际版本。
3. 运行 `python run.py environment fixtures/marker.txt`。完成 `fieldwork/environment.py` 后，应输出当前目录、解释器绝对路径、路标绝对路径和原文。
4. 转到另一个目录，用 `python "原练习目录/run.py" environment fixtures/marker.txt` 重试。这个相对路标不存在时，应退出 2，显示 `FileNotFoundError`。
5. 把路标参数改为它的绝对路径。应恢复成功。当前目录仍是新目录，不能把脚本目录伪装成当前目录。
6. 运行 `python -m unittest discover -s tests -p test_environment.py -v`。它还会检查 `.py.txt` 与目录名不是 Python 文件。

Windows 可以使用 `py -3.12` 代替 `python`。在 VS Code 的 Python 解释器菜单选定解释器后，再核对输出中的 `interpreter`。Windows 资源管理器的隐藏扩展名和实际 VS Code 操作需要你自己观察；本包的文件后缀测试不能证明你已经完成这些操作。

## 区分许可与隔离

阅读 `CONTRACT.md` 的 S01 合同，完成 `fieldwork/boundary.py`。运行 `python -m unittest discover -s tests -p test_boundary.py -v`。

测试仅创建临时文件。`read_note` 应拒绝越界路径，但同一进程直接读取测试哨兵仍能成功。这个对照说明文件工具的规则限制了该工具，操作系统没有因此隔离整个进程。不要将本包用于执行未知上传代码。符号链接测试如果被平台拒绝，会显示跳过，不能记成全部通过。

## 做同任务架构比较

完成 `fieldwork/architecture.py`。三个实现使用同一份请求、工具端口、预算、失败条件和答案合同。它们分别是固定工作流、有界决策循环、查询与回答两个角色的协作。角色和决策器都是本地确定性 Python 函数，没有模型服务。

运行 `python run.py compare`，生成 `ARCHITECTURES.json`。初次未实现时，报告会诚实记录异常。实现后重跑，查看每行真实返回值、工具调用、决策事件和角色交接。

再运行 `python -m unittest discover -s tests -p test_architecture.py -v`。测试会重新执行当前实现，并与保存报告及源码摘要核对。改稿后旧报告应失败。不要手填“通过”。

在 `DELIVERY.md` 解释什么时候固定工作流已经足够，哪种变化才值得引入决策循环。这个实验比较控制结构，没有测量真实 LLM、模型费用或多机并发，不能写成三种真实模型系统的性能排名。

## 独立完成图书馆预约

只读 `CONTRACT.md` 的 GRAD 需求。自行完成 `fieldwork/graduate.py`，为每个边界写预期，再运行自己的代码。这个新业务允许某一笔失败后继续接收后续小单，取消会释放容量，不能直接套用库存工程的整批扣除规则。

运行下面的命令查看实际文件输出。

```text
python run.py graduate fixtures/capacities.json fixtures/events.json reservations.json
python -m unittest discover -s tests -p test_graduate.py -v
```

加至少三个有理由的新测试。保留至少一个真实失败和修复后的结果。换一份时段容量和事件顺序重做，解释结果为什么变化。

## 把自己的结果带回游戏

1. 重跑 `python run.py compare`。
2. 运行 `python -m unittest discover -s tests -v`。
3. 在工坊下载本地自测工具，解压在练习目录旁。
4. 运行 `python -B "../local-check-tools/local-check.py" --task field-practice --project .`，生成实际 `LOCAL-CHECK.json`。
5. 完成 `DELIVERY.md`。选择自己的作业目录，预览并排除 `.venv`、缓存和无关文件。
6. 在工坊的“远航实践”委托保存源码、测试、`ARCHITECTURES.json`、`LOCAL-CHECK.json` 与交付说明。关闭后重新打开，查看这次保存的材料和自测结果。

游戏核对材料摘要，不执行上传代码。自报测试与可信审核分别记录。接单、下载、保存或公开测试通过都不会发课程奖励，也不能代替真人独立构建、排错、迁移和答辩。
