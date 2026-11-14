import { LEARNING_NOTES } from './course-learning-notes.mjs';

const firstSteps = {
  'first-steps': '先找出保存步数的名字，再看显示和行动是否读取同一个值。',
  'coin-math': '把卖出的收入与已经付出的成本分开，先用文字写出利润的含义。',
  'greeting': '找出明信片中固定的文字与会随旅客变化的两处内容。',
  'safe-buy': '分别想一笔不够钱、一笔恰好够钱和一笔有余额的交易。',
  'backpack': '这次要完成两件事：给末尾增加物品，以及读取原来排第一的物品。',
  'shells': '每走到一个采集点，累计值应该怎样变化？',
  'catalog': '查价和写入新价格是两种不同操作，先确认每个键对应什么。',
  'discount': '百分数表示每一百份中减去多少，先手算零折扣和全折扣。',
  'select-items': '对每个价格单独判断去留，不给输入额外排序或去重。',
  'invalid-input': '先区分可以转换的文字和转换时会失败的文字。',
  'ledger': '编码和解码分别接收什么、返回什么？不要依赖同一次运行的全局账本。',
  'stock-class': '每次出售之前，哪些条件必须成立？拒绝后库存应该怎样？',
  'generator': '把“现在创建流程”和“现在要求下一项”分开观察。',
  'test-case': '挑能区分正确除法与两种错解的输入，不能只证明一个普通样例。',
  'tool-router': '先列出已知意图，再决定未知意图的默认去向。',
  'permission': '行动是否可做与是否收到明确许可，是两项分别需要检查的信息。',
  'dedupe': '先画出相邻重复与间隔重复的输入，标记应该留下哪一次。',
  'retrieval': '比较时的文字与最后交给玩家的原文，是否需要是同一份表示？',
  'harbor-rations': '先明确总需求和每箱容量的单位，再考虑放不满的一箱。',
  'harbor-labels': '首尾空白、内部空格和字母大小写分别有什么意义？',
  'harbor-fare': '把票价规则画成互不重叠的年龄区间。',
  'harbor-route': '先写出还没移动时的记录，再逐步应用每个增量。',
  'harbor-quantity': '能转成整数与整数在允许范围内，是两道不同检查。',
  'harbor-manifest': '先写清清理名称、排除空项与去重的先后关系。',
  'market-stock': '把每件商品分成充足、刚好和不足三种情况，决定哪些需要列出来。',
  'market-receipts': '一张收据是增量，账本里的数字是到目前为止的总量。',
  'market-intersection': '一件物品必须满足哪些条件，才能进入两艘船的共同清单？',
  'market-ranking': '先手工比较两个不同分数，再比较两个同分但名字不同的记录。',
  'market-copy': '画出原字典、结果字典及其内层列表分别归谁所有。',
  'market-checkout': '订单中最后一件缺货时，前面的库存应该已经扣掉吗？',
  'workshop-defaults': '分开考虑省略列表参数与明确传入空列表的两次调用。',
  'workshop-closure': '先分清配置折扣的时间与真正接收价格的时间。',
  'workshop-composition': '画出每一站的输入从哪里来、输出交给谁。',
  'workshop-wallet': '先给一个钱包定义允许的状态变化，再观察两个钱包是否互相影响。',
  'workshop-iterable': '输入如果只能读一次，哪些看似方便的预处理会把它读完？',
  'workshop-result': '把格式检查、数据检查和成功返回分别列出。',
  'archive-json': '解析成功之后，还缺哪些业务结构检查？',
  'archive-regex': '任务是在寻找一段匹配，还是在验证整个字段？',
  'archive-counter': '缺失的数量与“有没有这个名字”是同一个问题吗？',
  'archive-queue': '给队首、队尾和已经处理的人分别画一个位置。',
  'archive-median': '先区分缺失值与零读数，再看偶数个读数的两个中间位置。',
  'archive-distance': '列出纯整数、普通浮点和超大数三种路径要遵守的比较规则。',
  'observatory-test-cases': '让每个测试用例负责抓住一个具体错误，先写出它的理由。',
  'observatory-binary': '当前仍可能包含答案的区间是什么，每一步怎样让它变小？',
  'observatory-prefix': '第k个前缀值表示前几个输入的和，先用空输入检查定义。',
  'observatory-cache': '改变哪些输入会改变答案？它们都需要参与缓存身份。',
  'observatory-replay': '接受和拒绝事件时，状态与事件记录分别怎样变化？',
  'observatory-diagnose': '相同的下一步动作来自哪些明确错误类型？未知类型怎么办？',
  'beacon-schema': '先看容器，再看字段，再看字段值，不要在未知形状上直接索引。',
  'beacon-permission': '谁、做什么、用什么参数、到什么时候，各自与哪项许可对应？',
  'beacon-idempotency': '键不存在、同键同请求、同键不同请求分别属于什么状态？',
  'beacon-retrieval': '先界定可以阅读的集合，再决定哪些文字符合查询。',
  'beacon-evaluation': '一次失败是否仍属于尝试总数？每组的两个计数分别记录什么？',
  'beacon-budget': '任务要求连续前缀。遇到放不下的一项，后面还能继续吗？',
  'protocol-lifecycle': '把尚未取得、已经取得和已经关闭三个状态分开，标出失败发生的位置。',
  'protocol-cache': '缓存命中与调用是否合法是两件事，分别设计一个观测。',
  'protocol-shipment': '登记后的快照，是否还应该随着外面的装箱列表变化？',
  'protocol-provider': '先写出调用者真正需要的方法，再观察报价对象可能保存的状态。',
  'protocol-stream': '按创建、打开、读取、交付、关闭记录事件，找出谁触发下一次需求。',
  'protocol-pipeline': '消费者只要最后这一项时，在哪个时刻应当归还上游？',
  'lifecycle-multi-resource': '画出每次资源取得后的所有者，以及故障后必须归还的资源。',
  'lifecycle-async-stream': '把等待一项和等待关闭分开，取消时哪一步尚未完成？',
  'lifecycle-bounded-map': '分别统计已经创建的任务、正在等待的任务和已经交付的结果。',
  'async-await-relay': '给取件请求、取件结果、交付请求、交付结果分别起名。',
  'async-event-handshake': '谁拥有信号的复位权，结束信号又能证明什么？',
  'async-cancel-and-join': '把请求取消、正在清理和已经结束三个时刻分开。',
  'basics-values': '先给每个输入写上类型，再判断加号表示相加还是拼接。',
  'basics-branches': '每个阈值左边和阈值本身分别落在哪段？',
  'basics-while': '说明每一轮怎样接近结束，停止标记与合法零值有什么区别？',
  'basics-slices': '截取以后，题目要原位置还是新列表中的位置？',
  'basics-scope': '依次调用两次函数，哪些数据应该重新开始、哪些由调用者给出？',
  'basics-arguments': '标签属于包装函数还是被调用函数？输入应原样交给哪一方？',
  'basics-recursion': '找一个可以直接回答的小问题，再说明列表怎样拆成更小的问题。',
  'engineering-imports': '标准库已经提供了哪个计算？先确认它接收什么和返回什么。',
  'numeric-ratios': '本题要求实际存储值的精确比值，不能先把巨整数变成浮点。',
  'engineering-annotations': '注解描述意图，输入不合法时仍需要谁执行检查？',
  'engineering-dataclass': '字段相等、不可赋值和输入合法，是三个不同的约束。',
  'engineering-files': '第二行损坏时，旧报告是否应当已经被清空？',
  'engineering-csv': '字段里的逗号与记录分隔的逗号，CSV读取器怎样区分？',
  'engineering-cli': '把参数声明、解析、业务校验分开，不要直接读取当前进程的参数。',
  'engineering-tests': '每一种错解在哪个输入上会与正确实现分开？',
  'engineering-report': '先画出文件读取、格式校验、内存汇总和写出之间的数据流。',
};

const specificHelp = {
  'coin-math': '先用销量与单价得到收入，再扣成本。不要把示例的20写死。',
  'safe-buy': '比较表达式本身可以产生True或False；恰好够钱也属于可以买。',
  'backpack': 'append修改列表末尾，索引0读第一项；不要把append的返回值当列表。',
  'shells': '累计变量在循环外建立，每轮把当前项加进去，不覆盖已有累计。',
  'catalog': '方括号里的键用于读取或写入一项；添加新项不应替换整个字典。',
  'select-items': '普通循环加append或推导式都允许；两者都要保留原顺序和重复项。',
  'generator': '用范围决定编号，再在需求到来时交出对应值；不要先建完整结果列表。',
  'test-case': '一个样例针对零除数，另一个需要得到非整数商。断言必须实际执行。',
  'retrieval': '比较两边可以使用小写副本，最后收集的仍是原笔记。',
  'harbor-rations': '完整箱数来自整除；余数存在时要给它再留一箱。',
  'market-receipts': '第一次出现从0开始，之后在已有累计上加入本次增量；零总数也保留键。',
  'market-intersection': '先只保留两边共同的成员，再明确去重与输出排序；允许集合或普通循环。',
  'market-ranking': '数值的方向与名字的方向要分别表达。可以用复合键，也可从次要条件到主要条件做稳定排序。',
  'archive-counter': '分别统计应到和实到数量，最后只保留正缺口；Counter或普通字典都可表达。',
  'observatory-binary': '相等时仍需保留左侧可能位置；每轮都验证区间长度严格减少。',
  'observatory-prefix': '前缀有一个表示尚未读入任何值的起点；每次追加一个新累计。',
  'beacon-budget': '先比较本项成本与剩余量，再决定更新状态还是结束整个遍历。',
  'numeric-ratios': '可以用Fraction表示输入后计算平均，但要理解浮点传入与十进制文本传入的区别。',
};

function oldLevels(lesson) {
  const hint = lesson.hint || '';
  const numbered = [...hint.matchAll(/(?:^|\n)\d\.\s*([^\n]+)/g)].map(match => match[1]);
  const section = lesson.concept?.match(/## 三级提示\s*\n([\s\S]*?)(?=\n## |$)/)?.[1];
  const embedded = section ? [...section.matchAll(/(?:^|\n)\d\.\s*([^\n]+)/g)].map(match => match[1]) : [];
  return embedded.length === 3 ? embedded : numbered.length === 3 ? numbered : null;
}


function readableConcept(lesson) {
  let content = (lesson.concept || '').replace(/\n## 三级提示\s*\n[\s\S]*?(?=\n## |$)/, '');
  if (lesson.id === 'engineering-imports') content += '\n\n## 从标准库走向自己的模块\n\n一个 .py 文件也能成为模块。把 add_one 定义放进 helpers.py，在同目录的 main.py 写 import helpers，再调用 helpers.add_one(3)。导入会执行模块顶层的语句，定义函数只是建立规则，调用才执行函数体。可把需要直接启动的动作放在 if __name__ == \"__main__\": 下，导入时就不会执行这些启动动作。\n\n多个模块可组织成目录包，包内有 __init__.py；同包用 from .helpers import add_one 引用相邻模块，用 python -m 包名 从包的 __main__.py 入口启动。直接运行某个内部文件可能失去相对导入所需的包上下文。路径是终端当前目录与模块位置共同决定的，不是函数错误。游戏运行器只开放课程需要的模块接口；自己的多文件实验应在本机 Python 工程中完成，后续独立交付包提供这些文件结构。';
  if (!lesson.id.startsWith('lifecycle-') && !lesson.id.startsWith('async-')) return content;
  content = content.replace(/^[\s\S]*?(?=# [AL]0[123] · )/, '');
  content = content.replace(/```sh[\s\S]*?```\s*/g, '');
  content = content.replace(/在 `exercises\/[^`]+` 实现/g, '在工作台实现');
  content = content.replace(/运行 `python3 examples\/observe\.py L0[123]` 前[，]?/g, '动手前');
  content = content.replace(/AE26 F09 的 Event 与取消实验/g, '信号等待与取消收尾课程');
  content = content.replace(/阅读 AE26 F09 对 TaskGroup 的介绍。/, '本课下方介绍 TaskGroup 的使用边界。');
  content = content.replace(/需要算法提示时，显式运行 `python3 play\.py --hint A0[12]`；用了提示的这轮应标记为辅助练习。/g, '需要时逐层打开提示，再独立复做。');
  content = content.replace(/需要实现策略时，显式运行 `python3 play\.py --hint A03`；用了提示的这轮应标记为辅助练习。/g, '先列出目标的真实终态，需要时再打开下一层提示。');
  content = content.replace(/最后完成 `docs\/TRANSFER\.md`，其返回值规则与本关不同，不能机械复制最后一行。/, '换成“返回包裹与回执一对值”的要求，在自己的原生脚本中练习；这项自选练习不自动计为游戏通过。');
  content = content.replace(/`--mode caller-cancel` 专门展示这点。/, '请分别画出目标取消与调用者取消的传播路径。');
  content = content.replace(/包内有真实语言边界见证。/, '可在原生 Python 中用最小协程观察此语言边界。');
  content = content.replace(/实际见证保存在 `evidence\/protocol-boundaries\.json`，不是宣称抛错工厂已成功取得资源。/, '可用最小生成器观察这个语言边界；工厂抛错并不表示已经取得资源。');
  content = content.replace(/- 参考解将自行取消转给范围拥有者[^\n]*\n/, '');
  if (lesson.id === 'lifecycle-bounded-map') content += '\n## 认识任务组的语法\n\n`async with asyncio.TaskGroup() as group:` 建立一段拥有子任务的范围。在里面用 `group.create_task(coroutine)`登记任务，退出范围时会等待它们结束。普通子任务错误会触发其他子任务取消，实际错误以异常组向外传播；`except*` 可按类型处理组里的错误，但不能为通过练习而吞掉错误。`asyncio.current_task()`取得当前任务，`cancelling()`读取尚未撤销的取消请求数；请求数与已完成状态并不相同。\n\n任务组并不限制你登记多少个任务，也不替你限制输入读取速度。可用纸上两个泊位观察：谁取得下一项，什么时候才出现空位，结果在什么位置保存。先理解这些概念，再设计自己遵守并发上限的流程。\n';
  return content;
}

export function scaffoldLesson(lesson) {
  if (Array.isArray(lesson.hintLevels) && lesson.hintLevels.length === 3 && lesson.hintLevels.every(level => level && typeof level.text === 'string')) return lesson;
  const note = LEARNING_NOTES[lesson.id];
  const parts = oldLevels(lesson);
  const hints = [firstSteps[lesson.id] || parts?.[0] || '先把输入、期望结果和边界分别写清楚。',
    parts?.[1] || lesson.typicalError?.repair || note?.[4] || '为正常输入和一个边界分别写出中间状态。',
    parts?.[2] || specificHelp[lesson.id] || lesson.hint];
  if (lesson.id === 'lifecycle-bounded-map') hints[2] += ' 子任务自行取消时，要让范围拥有者也进入收尾。比较进入时与现在的取消计数，避免重复请求或把旧计数当成本轮取消；另一条可行路线是维护滑动任务集合，取消并等待所有剩余任务。';
  const concept = readableConcept(lesson);
  return {...lesson, concept, hint: hints[0], hintLevels: hints.map((text, index) => ({level: index + 1,
    title: ['想一想', '分步检查', '具体帮助'][index], text}))};
}
