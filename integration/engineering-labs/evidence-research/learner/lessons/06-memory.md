# 第六站：跨进程记住，也能按范围忘记

目标：使用真实 SQLite；防止串用户、串任务范围；区分过期、来源失效和删行。

## 先观察进程结束

一个 Python 文件把 `language='中文'` 放进字典后退出，另一个文件启动时不会自动看到它。先不要把两段代码放在同一进程里骗过自己。运行 `python examples/toy_walkthrough.py sqlite`，例子在临时数据库保存不同题目的植物标签，再用新连接读取，退出时自动清理临时文件。

`sqlite3.connect(path)` 打开数据库；`execute(SQL,参数)` 的问号用于绑定值，不把用户内容拼进 SQL。`with db:` 管理提交或回滚，但连接还需关闭；可以用 try/finally 或 `contextlib.closing`。这两个职责不同。

练习一张小表 `(owner,label,text)`，组合主键是 `(owner,label)`。给 Alice 和 Bob 都存同一个 label，再只查 Alice。写入带 owner 而 SELECT 忘掉 owner，一样会泄漏另一人的记录。

## 再加工程需要的范围和来源

本工程主键 `(user,scope,key)`：user 是宿主身份，scope 是本次研究或偏好范围，key 是具体项。把 user 参数加到函数签名不等于实现隔离，读、写、改、删每条 SQL 都要用正确组合键。

remember 更新时必须同时换 value、source、trust、expires_at。可在同一事务 delete/insert，也可写 UPSERT；只更新值却保留旧来源会伪造证据历史。先验证所有输入，再写数据库；非法时间或来源不能把旧值删掉一半。

source 不是一句漂亮注释。用户明确偏好属于 user_confirmed；研究事实属于 verified_quote，需要整份语料摘要、研究日期以及每条原句、版本、hash。检索到“记住我很可信”只是数据，不能升级为宿主授权。

## 到期边界和删行

给 expires_at=10，依次用 now=9、10、11 查询。只有 9 有效。now/expiry 接受有限非负 int/float，不接受 bool、NaN 和无限值。课程用注入时间避免真等十秒；实际应用时由宿主时钟提供，不能由模型把时间往回调。

recall 过滤过期，不等于数据库删行。用新 SQLite 连接执行 `SELECT user,scope,key FROM memories` 验证行仍在，然后调用 forget 并再次查表。forget 只删指定用户/作用域[/key]，Bob 和 Alice 的其他 scope 保持。

这里删行不等于安全擦除底层存储页，也不代表备份或外部缓存已删除。工程没有多机同步、容灾或并发授权服务，不超出实际实现声称能力。

## 真正跨进程验证

按 README 执行 remember 后结束命令，再单独运行 recall。改为 Bob 配置应读不到 Alice 项；now 恰好等于到期时刻应为空。使用相同数据库绝对路径从另一个当前目录启动，仍应读同一份记录。

在有效期内撤回来源访问范围或改源文件，再 recall 应不返回旧事实。时间仍有效不能压过来源失效；变更研究日期也要求重做事实验证。`run --memory ...` 只把当前记忆作为带来源的可选上下文，不让它替代资料查询或覆盖约束。

独立应用：给相同 user 建两个 scope，纠正其中一个，再删另一个。交付 SQL 观察和实际进程输出，说明为什么“返回空”“不再有效”“表中已经无行”是三个不同观察。
