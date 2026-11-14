# 第五站：交付一条完整研究链

目标：让自己的索引、排名、引文核对与策略组成同一个可执行程序，发布前再核对每个实际读取版本。不能把若干小函数绿灯当成完整研究。

## 先画一次失败的状态变化

另造两份渡船公告：旧文件说上午一班，新文件明确替代旧文件说上午两班。最简单策略一读到旧值就停止，会交出真引用的旧报告。写下三行：尚无资料；找到旧值；检查到更新。每行说明下一查询要解决哪个缺口，不能只写“继续搜”。

现在实现 `strategy.plan`。它得到 question、自己已经做过的 history 和当前 preview；没有期望答案。第一问可用 question.query；没找到完整目标字段时可换字段词；已有值仍需检查更新与撤回。相同查询重复不会产生新证据，宿主必须停止。你可换策略，但每步须有具体 reason，不能硬编码港口答案。

`propose` 只从这次文档提取本问题的完整字段行，返回提案列表。为什么不是单个提案？同一文件也可能写两条冲突规则，不能悄悄只取第一条。每提案再交你的 `validate_claim`，不可由提案自己填“已核验”。

## 再组织宿主

实现 `research` 时，先只接一个问题的一次 search → read → propose → validate，确认日志来自实际调用。然后一次加一个机制：保存 history；带理由的下一查询；来源替代与冲突；总预算；发布前重新读；上下文钉住任务与未决项。正文依赖第七站 compact 的预算接口，可以先按合同留 stub，完成第七站后回此处跑全链。

搜索工具返回 id 和分数，不直接把未计数的正文给 proposer。读取后由宿主保存原文，回调接深副本。让一个坏 proposer 先改 document.text 再返回伪造句子；只要你拿被污染的对象验证，就会错误通过。验证必须对照宿主原件。

counts 在调用之前增加，失败也消耗一次。reads 包括发布前检查。预算耗尽不能偷偷省掉核对而保留单一答案；标 unknown 或 needs_refresh，并写清 stop_reason。当前按问题顺序消耗总预算，可能让后题机会少，交付时说明这一取舍。

## 版本属于每一条引用

让同一文件第一次读到 A，第二个问题读到 B，发布前仍是 B。第一条引用仍然绑定 A，不得拿最新全局缓存的 B 覆盖它。实际读取每个 observed 版本，用自己的 SHA 比较；发现变化撤下 answer，但保留旧引用、旧 hash 与 stale_sources 供追查。

修复报告正文后也要更新被钉住的 context；否则下一次继续时，摘要里还留着“旧答案已完成”。`recheck` 不能把 needs_refresh 自动恢复为 cited，即使旧文件又出现；重新研究才能重新解释内容。

## 真文件实验

完成接口后，按 README 运行 index 和 run。把 `data/harbor` 复制到你自己的 `work/corpus`，用这个副本重新生成首次报告，原始练习资料保留。接着修改副本里的现行通知文本及 version，保存文件后运行：

```text
python run_lab.py recheck --corpus work/corpus --report work/report.json --session data/alice.json --as-of 2026-11-01 --output work/recheck.json
python run_lab.py index --corpus work/corpus --output work/index-v2.json
python run_lab.py run --corpus work/corpus --index work/index-v2.json --questions data/harbor-questions.json --session data/alice.json --as-of 2026-11-01 --output work/report-v2.json
```

先确保首次 report 本来就是从该副本产生；不要拿另一个版本的报告混比。比较旧、新报告的实际 sha、原句、状态、pinned context 和调用记录。新增文件也应使旧报告需重查，因为可能新增反证。

独立排错：从“跳过发布前核查”“只认最新日期”“用全局最新 hash 覆盖旧引用”“回调修改宿主原文”选一个，保存最小坏例、故障输出、根因和修复后回归。公开测试通过只是合同层证据，仍需你的真实文件实验。
