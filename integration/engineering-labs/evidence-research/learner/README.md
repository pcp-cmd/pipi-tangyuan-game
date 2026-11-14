# 档案馆 · 可复查的离线研究

你要为港口访客交付一份能接受反证的资料报告，再把自己的工具迁移到陌生的维修活动语料。报告必须说清来源、版本、条件、冲突和缺口，并在资料更新后撤下旧结论。整个工程使用 Python 标准库、真实文件和 SQLite，不联网、不收费、不需要模型账号。

这是需要独立实现的工程包。`research_lab/` 的 20 个核心接口仍是 `NotImplementedError`；运行初始检查出现未实现错误是起点，不能把它标成通过。提供的文件读取、CLI 和参数验证只接你的本地模块，不会偷偷调用作者答案。

## 开始前

先完成游戏的文件、模块、测试、字典和函数课程，再读本包第一站的终端、JSON、SQLite 小实验。如果你还不能独立写循环、函数和测试，先回对应课练习。领取工程不锁住岛屿，工程作品也不会替你升级 99 课成绩。

需要可用的 Python 3.10 或更新解释器。打开终端进入解压后的目录，先执行 `python --version` 和 `python run_lab.py --help`。Windows 若系统只提供 `py -3`，将下面每个命令开头的 `python` 换成 `py -3`。不需要 `pip install`；可选虚拟环境的做法在第一站。Windows 命令仅是启动说明，本包不把 Linux 自动检查称为 Windows 真机验收。

## 学习顺序

| 站点 | 先完成的小实验 | 再独立实现 |
|---|---|---|
| [1 环境与来源](lessons/01-files-and-sources.md) | 另一份果园文本的原始字节、JSON 与位置 | 读懂提供的边界适配器 |
| [2 索引与访问范围](lessons/02-index-and-access.md) | 私有高分挤掉公开低分的反例 | `tokens/keyword_score/build_index/search` 的关键词阶段 |
| [3 比较排名](lessons/03-ranking.md) | 手算方向、重复投票和不同评分尺度 | `cosine/rrf/rerank`，接入混合检索 |
| [4 引文与主张](lessons/04-citations.md) | 真原句却答错字段、截掉条件 | `validate_quote/validate_claim/resolve` |
| [5 研究主循环](lessons/05-research-loop.md) | 先找到旧资料，再检查更新与撤回 | `plan/propose/research/recheck` |
| [6 记住与忘记](lessons/06-memory.md) | 两个用户、两个进程、到期与删除 | `remember/recall/forget` |
| [7 预算与独立评价](lessons/07-context-and-evaluation.md) | 摘要丢约束、自报满分、重复命中 | `compact/retrieval_score/grade` |
| [8 陌生语料迁移](lessons/08-transfer-and-delivery.md) | 冻结自己策略后换维修活动资料 | 独立 Build / Debug / Transfer 交付 |

逐站命令和可观察的成功条件写在正文。先运行 `python examples/toy_walkthrough.py` 看不同题目的小实验，再合上例子写自己的接口。[完整接口合同](CONTRACT.md)用于写完后的查阅，不替代正文。

## 完成接口后的真实主线

下面命令使用新的输出文件，拒绝覆盖已有证据。重复练习时换一个 `work2/` 目录，保留前一次失败。

```text
python -m unittest discover -s tests -v
python run_lab.py index --corpus data/harbor --output work/index.json
python run_lab.py run --corpus data/harbor --index work/index.json --questions data/harbor-questions.json --session data/alice.json --as-of 2026-11-01 --output work/report.json
python run_lab.py remember --corpus data/harbor --report work/report.json --session data/alice.json --as-of 2026-11-01 --memory work/memory.db --scope harbor --now 100 --ttl 10 --output work/remembered.json
python run_lab.py recall --corpus data/harbor --session data/alice.json --as-of 2026-11-01 --memory work/memory.db --scope harbor --now 109 --output work/recall.json
python run_lab.py forget --memory work/memory.db --session data/alice.json --scope harbor --output work/forgotten.json
```

先手判港口每个问题的现行证据、冲突和缺口，再比较报告。修改你自己的语料副本后执行 `recheck`，确认旧单一答案撤下；重建索引、重新研究才可得出新答案。**重查不等于重写一个状态字段。** 第五站有完整操作。

`--memory` 也可加在 `run` 上，把当前有效记忆作为带来源的可选上下文；它不替代资料检索，也不能改变只读约束。`data/alice.json` 是本地练习的宿主身份配置，不是真实认证机制，不能把可编辑 JSON 当多用户安全服务。

## 如何证明自己完成

保留原始预测、你自己构造的失败、最小修复、运行命令、实际报告和 SQLite 观察，填 [DELIVERY.md](DELIVERY.md) 与 [DECISIONS.json](DECISIONS.json)。提交源码和合成文本资料即可，排除数据库、个人文件、密钥和整个 Python 环境。不要把作者测试成功、自己的运行声明和独立玩家掌握合成一个“已掌握”。

公开测试和本包第二语料都是可见练习，不是盲测。固定三维坐标用于验证机制，结构化 `field = value` 行用于验证很窄的支持关系；它们不证明真实 embedding、任意自然语言总结、来源权威或开放研究质量。你应在交付中指出仍需人工判断的条件与反例。

## 整理可提交的最小作品

作品预览最多收 48 个文本文件、每个 64 KiB、总计 512 KiB；它是作品范围检查，不是自动判定学会。不要把解压目录所有内容全选再加运行输出。按下面范围选择必要材料：

- 自己的 `research_lab/*.py`（包含提供的 boundary、adapter、cli 接线）和 `run_lab.py`，至少一份自己的 `tests/test_*.py`。
- 填好的 `DELIVERY.md`、`DECISIONS.json`，必要的 `data/alice.json`、`data/bob.json` 和两份问题文件。
- 为重跑公开检查保留 `data/harbor` 八份基线；版本实验选择 `work/corpus` 的实际副本。迁移时选择 `work/transfer-corpus` 实际副本，未改的 `data/repair-cafe` 可从本学生包取回，不必重复提交。
- 选择必要的三个报告，例如 `work/report.json`、`work/report-v2.json`、`work/transfer-report.json`。其他失败观察可整理到交付说明；需要另交 JSON 时相应移除重复材料，预览确认总数。

上述“12个Python模块/入口＋1份测试＋2份交付说明＋4份会话/问题＋8份港口基线＋16份工作语料＋3份报告”合计 46 项。新增材料以实际需要取舍，不要求照单制造空文件。未改的教学八章、README、CONTRACT、SOURCE-NOTICE、MANIFEST、examples 和数据库不属于最小作品；预览中主动排除它们。

允许的工作语料文件是两套原文件名与各自的 `custom.json`；自定义问题可存 `work/questions-v2.json` 或 `work/transfer-questions-v2.json`。这些明确路径可提交，其他新路径先整理到上述范围。数据库 `.db` 不进入文本作品；用可复查 SQL 观察写明存了什么、删了什么，不提交真人资料。

来源与使用边界见 [SOURCE-NOTICE.md](SOURCE-NOTICE.md)。
