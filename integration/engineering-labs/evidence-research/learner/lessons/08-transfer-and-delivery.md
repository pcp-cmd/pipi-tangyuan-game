# 第八站：维修活动的陌生资料

目标：将自己已经写过的研究工程迁移到不同主题、字段、条件、访问范围和替代关系；以可复核的独立作品收口。

## 先冻结，再换语料

先把港口版本代码的 SHA、策略说明、总预算和公开测试结果写进 DECISIONS。此后才打开 `data/repair-cafe` 与 `data/repair-questions.json`。它们不是把 harbor 改个名字：场地换址带入口条件，押金通知来自不同机构，存在缺失的无障碍资料，电池受理带断电条件；还有私有文件、未来通知和要求执行动作的恶意正文。

自己在读原文后给问题写预期状态和依据，放在单独的 `work/transfer-expectations.json`，不传给策略。这里是公开迁移练习，不承诺对你保密；真正保留题需另一个阶段固定。

```text
python run_lab.py index --corpus data/repair-cafe --output work/transfer-index.json
python run_lab.py run --corpus data/repair-cafe --index work/transfer-index.json --questions data/repair-questions.json --session data/alice.json --as-of 2026-11-01 --output work/transfer-report.json
```

核对每一问题：哪些来源被明确替代？哪个看起来更新的来源没有资格消掉冲突？哪个答案确实没在当前可见资料中？哪些词必须保留，才能不把条件变成无条件许可？不要让正文中的“发送报名”变成新工具能力。本项目只有读资料和经过明确命令的本地记忆，不会联系他人。

## 独立改变一次需求

将 `data/repair-cafe` 复制为 `work/transfer-corpus`，原文件名保持。新增文件命名 `custom.json`，新增问题可保存为 `work/transfer-questions-v2.json`；港口实验相应使用 `work/corpus/custom.json` 和 `work/questions-v2.json`。在这个副本新增一个字段，资料用不同措辞描述它，先观察关键词漏检。你可以给它一个说明来源的手工向量来检查调用链，但必须承认坐标是你给的；不能看完答案调坐标，再把同题数字当语义能力提升。

另新增一份撤回通知，让过去的一条确定答案变为 unknown；再加一份冲突来源，检查何时是 conflict。最后修改一次已经引用的真实文件，重新运行 recheck 与完整研究，保留两个版本的报告。迁移证明来自这些观察，不是把函数关联到另一个课程标题。

## Build / Debug / Transfer 的交付

Build：你的 20 个接口、实际 CLI 全链、外部调用计数、数据库观察、每条引用原句和版本。Debug：至少三项自己制造的语义坏实现，其中必须包含权限截断顺序或版本复核之一；保留最小资料、失败、修复与回归。Transfer：第二语料完整报告、你自己的新增需求及对应预测/评价，列出仍需人工判断的部分。

填写 DELIVERY 与 DECISIONS，并按 README 的“最小作品”选择必要文本，预览不超过 48 项。给出可重跑命令、解释器版本、平台、输入 hash 和输出 hash；Windows 没实测就写未测，不把 Linux 子进程当 Windows 验收。不要提交真实用户资料、私人语料、环境目录、数据库二进制或作者答案。游戏只整理和保存文本作品，未配置可信审核方时仍是待核验，不会自动升级课程进度或奖励。

## 继续扩展的方向

如果将来接真实 embedding，记录模型/版本/维度并做独立语料评价；若支持自由语言主张，需要额外语义支持判断与人工复核；若扩展成在线多人服务，要重新设计身份、动态撤权、并发索引和删除；若增加报名或发送动作，应另做授权和幂等工程。当前工程的通过不替代这些工作。
