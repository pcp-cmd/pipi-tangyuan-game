# 07 · 最后一个名额：独立迁移挑战

先完成前六章，再关闭这些章节，仅以本合同设计。这里换成新业务：营地活动容量有限，每次成功报名还要登记一份通知。它增加容量竞争、按活动分组、同一参加者重复报名、满员后重放等约束，不能把派送函数改名就算完成。

## 用户需要什么

一个活动有不可在本题中改动的容量。同一个人不能用不同 operation ID 在同一个活动重复占位。相同 operation ID 的原请求可安全重放，已经成功的报名即使后来满员仍应返回 True。没有名额返回 False，并且没有新增报名或通知。

两个独立进程争最后一个名额，应当只有一个成功。报名保存成功而通知丢失、通知存在而报名失败，都不满足业务要求。通知仍通过先前的 outbox 与 receiver 派送，本地记录为虚构数据。

## 稳定接口

实现 `registration.create_event` 与 `registration.register`；精确的表结构、参数、返回值和异常见模块 docstring。此处不提供逐行算法。先自行回答：哪些事实必须在同一事务内判断和更新？哪些情况属于旧意图重放，哪些是新的请求？容量为零与未知活动应当如何区分？

写出你的状态表与至少六个用例再编码。至少有一个你自己设计的反例，不能只是把公开测试里的“camp”改成“trip”。

## 可实际运行的入口

```sh
python -m durable_learning --workspace ./transfer-state event camp-evening 1
python -m durable_learning --workspace ./transfer-state book camp-evening booking-1 pipi
python -m durable_learning --workspace ./transfer-state book camp-evening booking-2 tangyuan
python -m durable_learning --workspace ./transfer-state deliver-bookings --lose-reply
python -m durable_learning --workspace ./transfer-state inspect
python -m durable_learning --workspace ./transfer-state deliver-bookings
python -m durable_learning --workspace ./transfer-state inspect
```

确认第二个报名返回 False，第一份通知在回复丢失后仍能恢复，接收方没有重复 effect。然后用另一活动验证容量按活动分别计算。公开测试会启动两个真实子进程竞争名额，并以 SQL 触发器阻止通知写入，检查是否错误占掉一个座位。

## 你的独立交付

在 DELIVERY 的 Transfer 章节写：最初设计、你拒绝过的错误方案、自己新增测试抓住的故障、重启与双进程实验结果、仍未验证的调度或系统边界。若得到提示、看过参考、使用 AI 或同伴帮助，明确写帮助作用在哪一步；需要另外一个未见任务才能确认新的独立表现。

本挑战仍属于 `durable-dispatch` 一份工程，不单独发课程奖励，也不把同一次通过计成多个综合项目。人与人解释、临时改需求和修复陌生故障仍需要现场或有来源的人工评审。

## Python整数与存储边界

Python int 可以比数据库INTEGER更大。本包容量明确为0到2**63-1，代次为1到2**63-1；超范围应在绑定SQL参数前按合同拒绝，不等SQLite报OverflowError，更不能先创建空库。代次用尽需显式停止，不能回绕变成旧工人的资格。请分别测试最大合法值、下一值与bool。
