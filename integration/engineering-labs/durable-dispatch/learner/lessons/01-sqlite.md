# 01 · 保存成功，不等于两份事实都保存了

## 这一章要学会什么

把字典里的状态换成重启后仍存在的数据；区分一条 SQL 成功、事务提交和连接关闭；遇到中途失败时保留此前的正确记录。先在一次性的实验数据库上练，再实现 `checkpoint.py`。

## 表、行、键与查询

数据库文件里可以有多张表。一行是一条事实，一列是一种值。主键用来区分行；本题主键重复时应当拒绝，不能擅自覆盖。

下面是与题目不同的温度观测例子。可以另存 `temperature_demo.py`，使用一个全新目录运行：

```python
import sqlite3

db = sqlite3.connect("temperature-demo.sqlite")
try:
    db.execute("CREATE TABLE IF NOT EXISTS readings (station TEXT PRIMARY KEY, degrees INTEGER NOT NULL)")
    db.execute("INSERT INTO readings(station, degrees) VALUES (?, ?)", ("north", 17))
    db.commit()
    row = db.execute("SELECT degrees FROM readings WHERE station = ?", ("north",)).fetchone()
    print(row)  # (17,)，不是单独的 17
finally:
    db.close()
```

`?` 是值参数的占位符。第二个参数是元组，单元素元组写作 `("north",)`。不要把用户输入拼进 SQL；引号、中文或带引号的名字都应该作为值处理。SQL 的表名不能用值占位符，本练习只使用合同规定的固定表名。

先预测再试：第二次运行会发生什么？把查询改为不存在的站点会得到什么？`fetchone()` 没找到行是 `None`；不能直接索引 `None[0]`。用另一份练习数据库添加两个站点，写 `SELECT COUNT(*)` 数行，再读回每行值。

## 事务的范围由业务决定

假设记账同时需要“总额增加”和“新增明细”。只完成其中一个会制造矛盾。事务把这些操作组成一组：一起提交，或者一起撤回。`commit()` 使本事务成功，`rollback()` 撤回本事务未提交的修改；它不会撤销更早已经提交的历史。

本工程显式使用事务的起止，让边界清楚可观察。使用 `isolation_level=None` 时，连接默认自动提交模式，你需要在业务组开始时执行 `BEGIN` 或 `BEGIN IMMEDIATE`。后者先取得写事务资格，适合后面“先读资格、再写结果”的竞争场景。不要把 `CREATE TABLE` 初始化、一次业务事务和程序的一生混成同一个范围。

也可以使用 `with connection:` 管理提交/回滚，但它**不会帮你关闭连接**。不论选择哪种方式，都要安排 `finally: connection.close()` 或明确的关闭所有者。异常处理中的 `raise` 可以把原异常继续抛出去；不应仅打印错误后假装成功。

## 自己实现

阅读 `save_checkpoint` docstring：同一条 name/text 要同时写入 progress 和 notes。列出四个状态：写入前、完成第一份、完成第二份、提交后。`crash=True` 在两份之间制造异常。先画出哪些状态允许对外可见，再编写实现。

检查时至少保留一个早先成功的记录，再制造故障。否则“失败后数据库为空”既可能是正确回滚，也可能是错误地删掉全部历史，无法区分。

## 常见错误与反馈

| 现象 | 优先检查 |
|---|---|
| progress 多了一行，notes 没有 | 两次写入间是否提交；是否其实用了两个独立事务 |
| 异常后之前的记录也没了 | 是否用清空表代替回滚 |
| 第二次同名悄悄覆盖 | 是否用了 REPLACE 或无条件 UPDATE，违背重复主键合同 |
| 文件仍被程序占用 | 是否把事务上下文误当成连接关闭 |
| 查到的是 `(17,)` 却算不了数 | 是否区分行元组和列值 |

## 独立检查

运行 CheckpointTests，再自己增加一例带单引号的中文 name、一例空 text 和一例错误类型。讲清楚“已提交历史不会随本次回滚一起消失”。公开测试通过还没有证明突然断电或所有操作系统的文件可靠性；不要写出超出观察范围的结论。

## Python整数与存储边界

Python int 可以比数据库INTEGER更大。本包容量明确为0到2**63-1，代次为1到2**63-1；超范围应在绑定SQL参数前按合同拒绝，不等SQLite报OverflowError，更不能先创建空库。代次用尽需显式停止，不能回绕变成旧工人的资格。请分别测试最大合法值、下一值与bool。
