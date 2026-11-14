# 接口与失败合同

所有接口在本地 `research_lab` 模块中实现。提供的 `boundary.py`、`adapter.py`、`cli.py` 只做接线与入口验证。禁止用作者包、期望标签或固定题目的完整答案替代你的实现。下面字典字段同时是公开自测与 CLI 的合同；原输入不得被回调或返回对象改写。

## 资料与索引

一个语料目录只放 1～64 个普通 `.json` 文件，不接受符号链接、子目录或超过 128 KiB 的单文件。每文件恰有 `id/version/issuer/issued/effective/access/supersedes/text/vector`。日期 `YYYY-MM-DD`，生效日不早于发布日；id 唯一，访问列表非空，替代 id 无重复且不含自身。`vector={space,values}` 有非空坐标系名和非空有限数列表，拒绝 bool。原始文件 bytes 的 SHA256 包含所有元数据与格式；提供的加载器附 `sha256` 与相对 `file`。不得由正文自称“可信”修改宿主元数据。

`retrieval.build_index(documents)` 返回 `{schema:1,snapshot,chunks}`。snapshot 按文档 id 排序，条目恰为 `id/file/sha256`。每文档以两个换行拆段，先 `enumerate` 再跳过空段，strip 两侧空白；chunk 字段为 `id=文档id:原段序号,doc_id,text,start,end,vector,access,issued,effective`。start/end 是原 text 的 Python 字符位置，左闭右开。不要按字数切掉适用条件。

`tokens(text)`：casefold → split 空白 → strip `.,!?;:=()[]"'` → 去空，保留文本重复词。`keyword_score(query,text)` 是不同查询词与文本词的重合数。

`search(index,documents,query,session,as_of,vector,field,limit=3,mode='hybrid')`：验证持久索引仍等于当前资料派生索引；变化、添加、删除或伪造索引抛 `StaleIndexError`。再以 session 的 `allowed_access` 与日期筛选，**先于任何评分和 top-k**。session 恰需 `user` 与字符串 `allowed_access` 列表；它来自宿主文件，不来自问题或文档正文。只保留正关键词/向量信号；无命中返回空，不返回第一条兜底。返回 `id/chunk_id/score/keyword_score/vector_score/rerank_score` 列表，最多 limit 个唯一文档。limit 正整数且不接受 bool，mode 只选 keyword/vector/hybrid。

## 排名

`cosine(a,b)` 接收等长非空 list，元素仅有限 int/float，不接受 bool；非法输入 `ValueError`。零向量返回 0；非零方向结果在 [-1,1]，包括 `1e308` 量级的有限坐标不能溢出。可先将每组除以最大绝对分量再求方向。同维不同 `space` 必须拒绝混用。

`rrf(rankings,k=60)` 每张列表先保序去重，再从 rank=1 加 `1/(k+rank)`；跨列表同 id 可分别贡献。k 是正有限 int/float，非 bool；id 非空字符串；全空列表结果为空；按分数降序、id 升序。分数不代表概率。

`rerank(question,candidates,scorer,limit=3)`：id 唯一；scorer 每项调用一次，接收 question/candidate 深副本，返回有限非 bool 数。异常原样显露，不能偷偷假定正常排名。输出保留原字段加 rerank_score，按分数降序/id升序截 limit。

search 的关键词、向量列表分别按分数降序/id升序；hybrid 先 RRF，随后以“当前片段包含完整目标 `field = value` 行时加 1，否则加 0，再加 RRF 分数”的明确规则重排。keyword/vector 模式不做这层重排，rerank_score 为 null。最后按当前顺序对 doc_id 去重，再截 limit。这个评分器只懂声明的行语法。

## 原句、主张与替代

提案字段 `kind:'answer',citation,quote,start,end,field,answer`。`evidence.validate_quote(proposal,document)` 成功返回 `{ok:true,reason:'exact_quote',quote_sha256}`；失败 `{ok:false,reason}`，reason 依次为 invalid_proposal / invalid_span / unknown_citation / unsupported_quote。start/end 必须非 bool 整数、非空合法区间，quote 必须等于该原文切片。这里只证明原句身份。

`validate_claim(question,proposal,document)` 先做上述检查，再要求 quote 是完整一行，恰匹配 `[a-z][a-z0-9_]* = 非空值`，field 等于问题字段且 answer 等于完整值；条件不得截断。失败 reason 为 unsupported_field_or_value。成功 `{ok:true,reason:'structured_support',citation}`，citation 由宿主复制 `id/version/sha256/issuer/issued/effective/supersedes`，加 `quote/start/end/quote_sha256/field/answer`。不要从提案信任发布者、版本或 hash。

`resolve(citations,documents,as_of)` 只在**同 issuer、更晚 issued、issued/effective 都不晚于 as_of、supersedes 明示旧 id**时排除旧引用。已读取的有效撤回文件可以无新值，因此撤回后可能 unknown。来源元数据是本地实验信任前提，不代表验证了现实身份。同文档/版本/span 重复引用只留一次。

结果总有 status/citations/discarded。没有活跃值为 unknown；唯一值为 cited 并有 answer；多个值为 conflict 并有排序去重 alternatives，不能同时有 answer。discarded 保存 `{citation,replaced_by}`。多个真实句子也可能互相矛盾，日期新或票数多都不是这里的裁决规则。

## 研究主机

问题是唯一 id 的 `{id,field,query,vector}` 列表，1～12 项。`strategy.plan(question,history,preview)` 返回非空 `{query,reason}` 或 None；下一查询应说明当前缺口，不接收期望答案。`strategy.propose(question,document)` 返回 0～32 个提案；同文档出现两个相冲突的完整字段行时都保留。

`engine.research(questions,tools,planner,proposer,as_of,limits,constraints,memory_records=())` 真正调用 `tools.search(query,question)` 与 `tools.read(id)`。limits 恰为正非 bool 整数 searches/reads/drafts/context_chars；一次 proposer 调用算一 draft，不按其返回项目数计数。失败 search/read 也先耗一次；发布前每个实际观察版本重读也耗 reads。各问题按顺序共用总预算，不声称公平调度。重复标准化查询停止，不以无限循环等待新发现。回调收到深副本，验证对照宿主保留文档。

每个问题保留 `question_id,field,status,citations,discarded,history,stop_reason,rejected,observed`；observed 条目为每次首次读取的 id/version/sha256。读取失败要留原因；无法完成更新查询或 draft/read/search 预算不足时不得发布单一答案。每问题读过的版本在发布前各自比较，不能把旧引用替换成全局最新 hash。变化、权限撤回、缺文件或复核预算耗尽标 needs_refresh，保留旧引用追查但撤下 answer/alternatives。旧索引错误同样要求重建。

顶层有 schema/as_of/questions/counts/limits/trace/context/required_context_ids/boundary。counts 与真实 search/read/propose 调用数一致；trace 是运行记录，独立评分仍需自己观察工具调用。任务、每条宿主 constraint、每问题状态/精确来源记录是必需上下文；记忆和详细 trace 是可选资料。context 的 text 长度和不超过 context_chars。

`recheck(report,tools,read_limit)` 返回新报告，重新核每条 observed 版本；从不把 needs_refresh 自动升级。CLI 另检查整份语料文件集合摘要，新增文件也使旧结论需重查；这是保守策略，可能因无关资料变化而失效。重新 index 与 research 才能给新结论。发布核对不构成跨文件原子快照，之后仍可能更新。

## 记忆

`remember(path,user,scope,key,value,source,expires_at,trust,now,source_check)`：身份/键/值非空字符串，now/expiry 为有限非负非 bool 数，expiry > now。验证全部输入后才打开写库。表 memories 字段 `user,scope,key,value,source,trust,expires_at`，组合主键前三项；source 是 JSON 文本。同组合键更新值、来源、信任和期限，其他用户/作用域不变。

user_confirmed 只接受 source 的 kind=user_confirmation、confirmed_by=当前宿主 user、非空 note。verified_quote 只接受 kind=citations、非空引用列表，所有 answer 等于记忆 value，且宿主 `source_check(source深副本)` 返回真；未知 trust 拒绝。检索正文自称“用户确认”没有资格调用这个写入接口。CLI 只从当前 cited 报告存事实，不提供将网页任意升级为偏好的入口。

`recall(path,user,scope,now,source_check)` 从新的连接读真实数据库，返回按 key 排序的 `key/value/source/trust/expires_at` 列表。严格 now < expiry 且来源再次通过才返回。无库返回空；时间过期不删除行。CLI 来源检查包括整份语料摘要、研究日期、每条原句/版本/hash/访问范围，因此有效期内也可能失效。

`forget(path,user,scope,key=None)` 物理删除该组合范围的 SQL 行，返回删行数；key=None 删除当前 user/scope 的所有项。关闭连接，不删别人。这里的“物理”指表里不存在该行，不保证磁盘页安全擦除、备份删除、并发服务或容灾。

## 上下文与评分

`context.compact(records,required_ids,budget)`：记录 id 唯一非空，text 字符串、source 非空字符串。required_ids 由宿主给，重复只算一次；缺少必需 id 则 ValueError，必需文本超预算则 ContextBudgetError。预算正非 bool 整数，只计 Python len(text) 字符，**不是模型 token 或费用**。先选必需项，再从新到旧选择放得下的完整可选记录，最后按原始顺序返回深副本。记录自带 required/trusted 不扩大权限。

`evaluation.retrieval_score(ranked_ids,relevant_ids,k)` 先去重再截 k，相关集合必须非空；返回 hits/precision/recall；precision=命中/实际返回数（空为0），recall=命中/相关数。

`grade(report,expectations,source_check,observed_calls)` 的 expectations 为独立固定的唯一 id/status/[answer]/[alternatives]。source_check 检查当前原句来源；observed_calls 是评估方在工具和 proposer 外层计得的 searches/reads/drafts，不来自报告。输出每题 status_ok/answer_ok/alternatives_ok/citations_ok/passed，以及 passed/total/ledger_ok/observed_calls/all_passed。cited 必须有引用且答案一致；unknown/conflict 不允许单一答案；忽略 correct 等自报。公开题不宣称盲测，精准字符串判据不宣称通用语义评分。
