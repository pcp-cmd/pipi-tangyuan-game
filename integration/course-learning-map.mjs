// This capability map describes teaching scope, not an automatic mastery claim.
// Course IDs remain the stable save keys; clusters do not impose island gates.
const rows = [
  {
    id: 'agent-foundations', title: '让程序有边界地使用工具',
    abilities: ['核对真正传入的上下文', '区分结构合法与工具许可', '执行前检查，拒绝时零调用', '回传观察并限制决定次数', '把事件、回答与实际效果分开'],
    lessonIds: ['ae26-l00-context','ae26-l01-proposals','ae26-a00-tools','ae26-a01-loop','ae26-a02-evidence'],
    demonstration: '用新的工具名、资料和停止条件重建一个离线闭环，并用实际调用记录解释它能证明和不能证明什么。',
  },
  {
    id: 'expressions', title: '读懂一次计算',
    abilities: ['区分值、名字与表达式', '预测从上到下的执行', '区分函数定义、调用、返回与显示', '用边界检查布尔决策'],
    lessonIds: ['first-steps','coin-math','greeting','safe-buy','basics-values','basics-branches'],
    demonstration: '面对新的输入，先预测结果，说明每个值从哪里来，再写可复用的函数。',
  },
  {
    id: 'control-and-containers', title: '组织数据与执行流程',
    abilities: ['选择列表或字典', '写有终止理由的循环', '使用切片与拆包', '通过参数而非全局状态传递数据', '把大问题分为可检查的小函数'],
    lessonIds: ['backpack','shells','basics-while','basics-slices','catalog','select-items','basics-scope','discount','basics-arguments','basics-recursion'],
    demonstration: '对空输入、零值、重复项和第二次调用分别说明结果，保持调用者输入不变。',
  },
  {
    id: 'clean-and-combine', title: '清理、汇总与比较',
    abilities: ['区分解析与业务校验', '保持需要的原顺序与重复信息', '按规则清洗文本', '汇总增量与计算缺口', '设计多字段排序和平局规则', '识别共享引用'],
    lessonIds: ['invalid-input','harbor-rations','harbor-labels','harbor-fare','harbor-route','harbor-quantity','harbor-manifest','dedupe','market-stock','market-receipts','market-intersection','market-ranking','market-copy','market-checkout'],
    demonstration: '把熟悉的数据结构用于不同的需求，并能给出使旧题解失效的反例。',
  },
  {
    id: 'objects-and-functions', title: '设计可复用的规则',
    abilities: ['维护实例不变量', '理解默认参数的求值时机', '使用闭包与装饰器', '组合函数并保持错误身份', '把注解与运行时验证分开', '建立不可变数据快照'],
    lessonIds: ['stock-class','workshop-defaults','workshop-closure','workshop-composition','workshop-wallet','workshop-iterable','workshop-result','basics-decorators','engineering-annotations','engineering-dataclass'],
    demonstration: '用两个独立对象、两次调用和一次故障证明状态边界，没有串账或重复操作。',
  },
  {
    id: 'files-and-numbers', title: '处理真实文件和数据',
    abilities: ['按需迭代数据', '选用JSON、CSV、正则与标准库', '区分语法合法和业务合法', '考虑浮点舍入与大整数', '关闭拥有的资源', '验证完成后再写报告'],
    lessonIds: ['ledger','generator','archive-json','archive-regex','archive-counter','archive-queue','archive-median','archive-distance','engineering-imports','numeric-ratios','engineering-files','engineering-csv','engineering-cli','engineering-report','engineering-cleanup'],
    demonstration: '从两份真实文件构建报告，坏尾部不会清空旧输出，资源在所有退出路径被归还。',
  },
  {
    id: 'tests-and-algorithms', title: '用证据排错与改进',
    abilities: ['构造能区分错解的测试', '读失败信息并缩小复现', '用不变量解释二分', '建立前缀与缓存身份', '重放事件而不破坏状态'],
    lessonIds: ['test-case','observatory-test-cases','observatory-binary','observatory-prefix','observatory-cache','observatory-replay','observatory-diagnose','engineering-tests'],
    demonstration: '先使一个合理错解失败，再确认合法替代实现通过；不能用数量替代测试价值。',
  },
  {
    id: 'service-boundaries', title: '为程序划清行动边界',
    abilities: ['严格验证输入形状与布尔许可', '拒绝未知行动', '把授权筛选与内容检索结合', '区分新请求、重放与冲突', '记录所有尝试并遵守预算'],
    lessonIds: ['tool-router','permission','retrieval','beacon-schema','beacon-permission','beacon-idempotency','beacon-retrieval','beacon-evaluation','beacon-budget'],
    demonstration: '同一请求改变主体、参数、版本或有效期后，能解释为什么决策必须改变。',
  },
  {
    id: 'ownership-and-async', title: '管理协议、资源与并发',
    abilities: ['按所有权清理已取得的资源', '保留主错误与清理错误', '遵守装饰器调用签名', '控制惰性读取和早停', '区分取消请求与真实终态', '限制输入需求和存活任务数量'],
    lessonIds: ['protocol-lifecycle','protocol-cache','protocol-shipment','protocol-provider','protocol-stream','protocol-pipeline','lifecycle-multi-resource','lifecycle-async-stream','lifecycle-bounded-map','async-await-relay','async-event-handshake','async-cancel-and-join'],
    demonstration: '使用事件闸门证明先后顺序与收尾边界，说明一次取消合同没有覆盖哪些更复杂竞态。',
  },
  {
    id: 'independent-delivery', title: '在新任务中独立交付',
    abilities: ['复现索引、提前返回与共享引用故障', '迁移预算、重复检测、补货和稳定排序规则', '从JSONL坏数据继续处理', '设计回归测试抓住具体错解', '拆分模块并交付命令行程序'],
    lessonIds: ['debugging-index','debugging-return','transfer-travel-plan','transfer-repeat-alerts','transfer-resupply','transfer-stable-priority','debugging-aliases','transfer-log-report','testing-regression','project-stock-ledger'],
    demonstration: '先读新需求、写自己的测试，从未解起始代码完成；再在原生环境交付可从空目录运行的工具。',
  },
];
export const CAPABILITY_MAP = Object.freeze(rows.map(row => Object.freeze({ ...row, abilities: Object.freeze(row.abilities), lessonIds: Object.freeze(row.lessonIds) })));
const byId = new Map(CAPABILITY_MAP.flatMap(row => row.lessonIds.map(id => [id, row])));
export function capabilityFor(id) {
  const row = byId.get(id);
  if (!row) throw new Error(`Missing capability mapping for ${id}`);
  return row;
}
export const LEARNING_EVIDENCE_LEVELS = Object.freeze([
  { id: 'reference', meaning: '作者参考实现经过当前判题', proves: '当前检查能够接受这一实现', doesNotProve: '合法替代都接受、全部错解拒绝或玩家掌握' },
  { id: 'automated', meaning: '独立构造的合法替代、典型错解和边界测试经过真实运行器', proves: '已列输入与合同的可观察行为', doesNotProve: '所有可能输入正确或真人独立完成' },
  { id: 'saved-independent', meaning: '游戏记录中当前版本的无辅助通过', proves: '该草稿在这次提交未被标记使用提示/参考解', doesNotProve: '作者身份、闭卷过程、延时保持或陌生项目能力' },
  { id: 'human-transfer', meaning: '玩家在未见任务中解释需求、设计测试、独立交付，并在延时后复做', proves: '需要人类观察的实践证据', doesNotProve: '本轮自动验收尚未观察到这一层' },
]);
