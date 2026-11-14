// Stable task contracts. New tasks are registered only with a real student package.
const deepFreeze = value => { if (value && typeof value === 'object') { Object.values(value).forEach(deepFreeze); Object.freeze(value); } return value; };

const STOCKLEDGER = deepFreeze({
  id:'stockledger', title:'仓库交班 · 独立工程', contractRevision:1, courseId:'project-stock-ledger',
  summary:'用自己的 Python 工程读两份 CSV，核对库存并交付可从另一目录启动的命令行工具。',
  prerequisiteIds:['engineering-files','engineering-csv','engineering-cli','engineering-tests','engineering-report','transfer-log-report','testing-regression'],
  preparation:'可以先领作业、查看前置并下载。接单不代替课程通过，也不阻止你继续其他练习。',
  download:{url:'../integration/external-stockledger.zip',filename:'external-stockledger.zip',sha256:'a019791a29203cad41546936cc73dc032699f3b0a347c2f5b060b250ca335ddb'},
  readme:'../integration/external-stockledger/README.md',
  requirements:[
    '实现 core.py、files.py 和 cli.py；公开检查通过后，补至少三个有明确理由的新测试。',
    '在 DELIVERY.md 写清实际解释器、命令和退出状态；没运行就写未运行。',
    'Debug：用具体坏实现证明累计重复商品和坏输入保旧报告的测试能抓错，并说明原因。',
    'Transfer：完成包内安全库存合同 --reserve N；只扣订单、不扣保留量，省略参数时保持原行为，并设计自己的边界测试。',
  ],
  allowedFiles:['stockledger/__init__.py','stockledger/__main__.py','stockledger/core.py','stockledger/files.py','stockledger/cli.py','build.py','DELIVERY.md','README.md','examples/stock.csv','examples/orders.csv','RUN.txt'],
  requiredFiles:['stockledger/core.py','stockledger/files.py','stockledger/cli.py','DELIVERY.md'],
  submissionNotice:'选择自己的专用作业目录，先预览清单并排除无关文件。材料只在本地整理，不会执行或自动发送。',
  reviewNotice:'当前可保存待核验作品并导出最小提交包。尚未配置可信审核方；本地测试结果不会自动成为核验结论。',
  capabilities:['build','debug','transfer'], rewards:{coins:0,xp:0},
});

const DURABLE_DISPATCH = deepFreeze({
  "id": "durable-dispatch",
  "title": "灯塔的可靠派送 · 独立工程",
  "contractRevision": 1,
  "courseId": "ae26-a02-evidence",
  "courseIds": [
    "engineering-files",
    "engineering-tests",
    "archive-json",
    "lifecycle-bounded-map",
    "ae26-a02-evidence"
  ],
  "prerequisiteIds": [
    "engineering-files",
    "engineering-cli",
    "engineering-tests",
    "engineering-imports",
    "archive-json",
    "lifecycle-bounded-map",
    "ae26-a02-evidence"
  ],
  "prerequisiteTaskIds": [
    "stockledger"
  ],
  "ae26Units": [
    "F08",
    "S00",
    "R00",
    "R01",
    "R02",
    "R03",
    "KPERSONAL"
  ],
  "summary": "在真实SQLite与新进程中完成可靠派送，再将持久草稿、精确批准、回执查询和双工人恢复连成个人工作流，并独立处理容量预约与航次改期。",
  "preparation": "先领委托，按九章手册分阶段实现。前置工程是准备建议，接单不改变课程访问、成绩或奖励。",
  "download": {
    "url": "../integration/engineering-labs/durable-dispatch/student.zip",
    "filename": "durable-dispatch-student.zip",
    "sha256": "9472a46d1d36b769fbfd79aed37730a8ac0d24dbef93ee5d5ff8678779dd250a"
  },
  "readme": "../integration/engineering-labs/durable-dispatch/learner/README.md",
  "readingUrls": [
    {
      "title": "1 · 数据库与事务",
      "url": "../integration/engineering-labs/durable-dispatch/learner/lessons/01-sqlite.md"
    },
    {
      "title": "2 · 持久回执",
      "url": "../integration/engineering-labs/durable-dispatch/learner/lessons/02-receipts.md"
    },
    {
      "title": "3 · 待发箱",
      "url": "../integration/engineering-labs/durable-dispatch/learner/lessons/03-outbox.md"
    },
    {
      "title": "4 · 租期与旧工人",
      "url": "../integration/engineering-labs/durable-dispatch/learner/lessons/04-fencing.md"
    },
    {
      "title": "5 · 一次精确授权",
      "url": "../integration/engineering-labs/durable-dispatch/learner/lessons/05-approval.md"
    },
    {
      "title": "6 · 重试与总时限",
      "url": "../integration/engineering-labs/durable-dispatch/learner/lessons/06-retry-deadline.md"
    },
    {
      "title": "7 · 最后一个名额",
      "url": "../integration/engineering-labs/durable-dispatch/learner/lessons/07-transfer.md"
    },
    {
      "title": "8 · 持久个人工作流",
      "url": "../integration/engineering-labs/durable-dispatch/learner/lessons/08-personal-host.md"
    },
    {
      "title": "9 · 航次改期迁移",
      "url": "../integration/engineering-labs/durable-dispatch/learner/lessons/09-sailing-transfer.md"
    },
    {
      "title": "来源与使用边界",
      "url": "../integration/engineering-labs/durable-dispatch/learner/SOURCE-NOTICE.md"
    }
  ],
  "requirements": [
    "Build：实现九个业务模块，串起草稿→精确批准→派送→未知结果→新进程恢复；从真实两侧SQLite表核对，再用本次源码构建pyz并从另一目录启动。",
    "Debug：至少三种语义错误；包括版本或批准错配、同编号不同内容的回执串用、旧工人确认或半批提交中的一项，保留失败原因与修复后的实际观察。",
    "Transfer：独立完成容量预约和航次改期两个新需求。容量竞争只允许最后一个名额的一位成功；航次批次只创建草稿，明确批准一份后才能沿组合流程恢复派送。两项均属于这一工程，不重复记毕业作品。",
    "在 DELIVERY.md 写实际环境、命令、退出码、帮助来源、自己的额外测试和未验证边界；公开检查通过不等于独立能力已核验。"
  ],
  "allowedFiles": [
    "durable_learning/checkpoint.py",
    "durable_learning/receiver.py",
    "durable_learning/outbox.py",
    "durable_learning/fenced_store.py",
    "durable_learning/approval.py",
    "durable_learning/retrying.py",
    "durable_learning/registration.py",
    "durable_learning/cli.py",
    "durable_learning/__main__.py",
    "durable_learning/__init__.py",
    "build.py",
    "DELIVERY.md",
    "README.md",
    "SOURCE-NOTICE.md",
    "examples/fictional-inputs.json",
    "RUN.txt",
    "durable_learning/personal.py",
    "durable_learning/personal_provider.py",
    "durable_learning/reminder_plan.py",
    "tests/__init__.py",
    "examples/trip-changes.json",
    "examples/versioned_ticket.py"
  ],
  "requiredFiles": [
    "durable_learning/checkpoint.py",
    "durable_learning/receiver.py",
    "durable_learning/outbox.py",
    "durable_learning/fenced_store.py",
    "durable_learning/approval.py",
    "durable_learning/retrying.py",
    "durable_learning/registration.py",
    "durable_learning/cli.py",
    "durable_learning/__main__.py",
    "durable_learning/__init__.py",
    "build.py",
    "DELIVERY.md",
    "durable_learning/personal.py",
    "durable_learning/personal_provider.py",
    "durable_learning/reminder_plan.py",
    "tests/__init__.py",
    "examples/trip-changes.json"
  ],
  "submissionNotice": "只选择自己写的源码、测试、虚构样例和交付说明；数据库、可执行产物、环境目录和真实个人资料请在预览中排除。材料不会被执行或自动发送。",
  "reviewNotice": "作品可保存并导出最小提交包，当前仍待可信审核。Linux作者实验、公开检查和自己的运行说明不会自动变成你的独立能力结论。",
  "capabilities": [
    "build",
    "debug",
    "transfer"
  ],
  "rewards": {
    "coins": 0,
    "xp": 0
  }
});

const REPO_REPAIR = deepFreeze({
  "id": "repo-repair",
  "title": "代码工坊 · 可靠修补",
  "contractRevision": 1,
  "courseId": "ae26-a01-loop",
  "courseIds": [
    "engineering-imports",
    "engineering-files",
    "engineering-tests",
    "testing-regression",
    "ae26-a00-tools",
    "ae26-a01-loop"
  ],
  "prerequisiteIds": [
    "engineering-imports",
    "engineering-files",
    "engineering-tests",
    "testing-regression",
    "ae26-a00-tools",
    "ae26-a01-loop"
  ],
  "prerequisiteTaskIds": [
    "stockledger"
  ],
  "ae26Units": [
    "F00",
    "F04",
    "F06",
    "D00",
    "D01",
    "D02",
    "S00",
    "S01",
    "KCODE",
    "X00",
    "GRAD"
  ],
  "summary": "用自己的工具读懂真实Git仓库、提出并批准最小修补，验证当前字节，再有界恢复与重新核验。",
  "preparation": "先读文件、模块、测试与Agent循环课程。Git、解释器和子进程有独立小实验；可以先领工程，不会因等待作品核验而锁住课程或航线。",
  "download": {
    "url": "../integration/engineering-labs/repo-repair/student.zip",
    "filename": "repo-repair-starter.zip",
    "sha256": "5ea5848089b138a3a3fda2f44eb48738fefcc392597feac53cc12b5f699e3ee1"
  },
  "readme": "../integration/engineering-labs/repo-repair/learner/README.md",
  "readingUrls": [
    {
      "title": "七站工程学习",
      "url": "../integration/engineering-labs/repo-repair/learner/LEARN.md"
    },
    {
      "title": "接口与失败合同",
      "url": "../integration/engineering-labs/repo-repair/learner/CONTRACT.md"
    },
    {
      "title": "陌生借阅任务",
      "url": "../integration/engineering-labs/repo-repair/learner/TRANSFER.md"
    },
    {
      "title": "来源与范围",
      "url": "../integration/engineering-labs/repo-repair/learner/SOURCE-NOTICE.md"
    }
  ],
  "requirements": [
    "Build：实现自己的文件工具、精确批准、验证与有界主机，实际串起修改前失败、修后通过和重新读取。",
    "Debug：用具体错误证明旧摘要、重复锚、测试改动和验证后改稿会被发现；保留失败证据及最小修复。",
    "恢复：保留另一个文件的暂存、未暂存与未跟踪内容，只恢复自己的指定改动，并由新Python进程核对checkpoint。",
    "Transfer：独立交付灯塔借阅提醒工具，另写边界与坏输入保护；不要拿公开fixture的修补字段冒充自己的解题。"
  ],
  "allowedFiles": [
    "CHECKPOINT.json",
    "CONTRACT.md",
    "DECISIONS.json",
    "DELIVERY.md",
    "DIFF.patch",
    "LEARN.md",
    "MANIFEST.json",
    "README.md",
    "RESULT.json",
    "RUN.txt",
    "SOURCE-NOTICE.md",
    "TRANSFER.md",
    "decision.py",
    "fixture.py",
    "host.py",
    "repair.py",
    "run_lab.py",
    "tests/test_contract.py",
    "tests/test_transfer_contract.py",
    "transfer/__init__.py",
    "transfer/__main__.py",
    "transfer/examples/loans.json",
    "transfer/reminders.py"
  ],
  "requiredFiles": [
    "repair.py",
    "host.py",
    "DELIVERY.md",
    "DECISIONS.json",
    "transfer/reminders.py"
  ],
  "submissionNotice": "选这份工程的专用目录，先预览并排除Git目录、环境、个人资料和无关文件。这里只整理文本材料，不会执行或自动发送。",
  "reviewNotice": "可保存和导出待核验作品。作者测试、自己的运行声明和独立能力分开；未配置可信审核方时不会自动变成通过。",
  "capabilities": [
    "build",
    "debug",
    "transfer"
  ],
  "rewards": {
    "coins": 0,
    "xp": 0
  }
});

const TOOL_BRIDGE = deepFreeze({
  "id": "tool-bridge",
  "title": "工坊的工具桥 · 独立工程",
  "contractRevision": 1,
  "courseId": "ae26-a02-evidence",
  "courseIds": [
    "engineering-cli",
    "engineering-files",
    "engineering-tests",
    "archive-json",
    "lifecycle-bounded-map",
    "ae26-a02-evidence"
  ],
  "prerequisiteIds": [
    "engineering-cli",
    "engineering-files",
    "engineering-tests",
    "engineering-imports",
    "archive-json",
    "lifecycle-bounded-map",
    "ae26-a02-evidence"
  ],
  "prerequisiteTaskIds": [
    "repo-repair"
  ],
  "ae26Units": [
    "F07",
    "I00",
    "I01",
    "A02",
    "E00",
    "E01"
  ],
  "summary": "交付同一只读工具的真实 CLI、回环 HTTP 和 stdio MCP；从多进程日志与实际效果独立评分，再解决陌生时间窗口任务。",
  "preparation": "先领委托，按六章教材先教后练。前置工程仅为准备建议，不改变旧课程访问、成绩、航线或奖励。",
  "download": {
    "url": "../integration/engineering-labs/tool-bridge/student.zip",
    "filename": "tool-bridge-student.zip",
    "sha256": "8ca22a73514096dd847c4c400ab4afa73cac1ea6b44c129c0235618f697b1c80"
  },
  "readme": "../integration/engineering-labs/tool-bridge/learner/README.md",
  "readingUrls": [
    {
      "title": "1 · JSON 与命令行",
      "url": "../integration/engineering-labs/tool-bridge/learner/docs/01-json-cli.md"
    },
    {
      "title": "2 · 回环 HTTP",
      "url": "../integration/engineering-labs/tool-bridge/learner/docs/02-http.md"
    },
    {
      "title": "3 · MCP 与真实进程",
      "url": "../integration/engineering-labs/tool-bridge/learner/docs/03-mcp.md"
    },
    {
      "title": "4 · 运行记录",
      "url": "../integration/engineering-labs/tool-bridge/learner/docs/04-traces.md"
    },
    {
      "title": "5 · 独立效果评分",
      "url": "../integration/engineering-labs/tool-bridge/learner/docs/05-independent-evaluation.md"
    },
    {
      "title": "6 · 时间窗口迁移",
      "url": "../integration/engineering-labs/tool-bridge/learner/docs/06-transfer.md"
    },
    {
      "title": "能力合同",
      "url": "../integration/engineering-labs/tool-bridge/learner/docs/CONTRACT.md"
    },
    {
      "title": "来源与边界",
      "url": "../integration/engineering-labs/tool-bridge/learner/docs/SOURCES.md"
    }
  ],
  "requirements": [
    "Build：实现同一报价能力的 CLI、127.0.0.1 HTTP 和固定 MCP 2025-11-25 stdio 子集；实际检查请求配对、通知、错误、超时、取消与进程回收。",
    "Build：两个真实 worker 各写日志，另一个进程读回；独立 grader 读取真实调用和文件效果，保留全部试验分母与危险否决。",
    "Debug：用自己新增的测试复现至少两个语义错误，其中一个涉及资源或证据；保留失败、原因和修后结果，不用自报 passed 代替效果。",
    "Transfer：独立实现半开时间窗口与不同站点的冲突判断、真实 CLI、完整时间表验证及未见案例；available 不代表已预约。",
    "在 SUBMISSION.md 写明实际环境、帮助来源、命令、退出码与未验证项；公开测试、作者实验和自己的独立掌握分别记录。"
  ],
  "allowedFiles": [
    "README.md",
    "SOURCE-NOTICE.md",
    "SUBMISSION.md",
    "docs/01-json-cli.md",
    "docs/02-http.md",
    "docs/03-mcp.md",
    "docs/04-traces.md",
    "docs/05-independent-evaluation.md",
    "docs/06-transfer.md",
    "docs/CONTRACT.md",
    "docs/SOURCES.md",
    "examples/effect_claim.py",
    "examples/line_parent.py",
    "examples/line_peer.py",
    "examples/span_identity.py",
    "examples/temperature_cli.py",
    "examples/temperature_http.py",
    "examples/temperature_parent.py",
    "fixtures/catalog.json",
    "fixtures/cleanup_server.py",
    "fixtures/evaluation_cases.json",
    "fixtures/evaluation_worker.py",
    "fixtures/known_agents.py",
    "fixtures/protocol_peer.py",
    "fixtures/read_trace.py",
    "fixtures/schedule.json",
    "fixtures/trace_worker.py",
    "prepare_submission.py",
    "run_checks.py",
    "run_experiment.py",
    "toolbridge/__init__.py",
    "toolbridge/__main__.py",
    "toolbridge/cli.py",
    "toolbridge/domain.py",
    "toolbridge/errors.py",
    "toolbridge/evaluation.py",
    "toolbridge/http_adapter.py",
    "toolbridge/mcp_client.py",
    "toolbridge/mcp_server.py",
    "toolbridge/telemetry.py",
    "evidence/report.json",
    "evidence/cli.json",
    "evidence/http.json",
    "evidence/stdio.json",
    "evidence/trace-readback.json",
    "evidence/evaluation-cases.json",
    "evidence/independent-evaluation.json",
    "evidence/transfer.json",
    "evidence/traces/root.jsonl",
    "evidence/traces/left.jsonl",
    "evidence/traces/right.jsonl",
    "evidence/trial-0/host.json",
    "evidence/trial-0/final.json",
    "evidence/trial-0/effects/receipt.txt",
    "evidence/trial-0/effects/broadcast.txt",
    "evidence/trial-1/host.json",
    "evidence/trial-1/final.json",
    "evidence/trial-1/effects/receipt.txt",
    "evidence/trial-1/effects/broadcast.txt",
    "evidence/trial-2/host.json",
    "evidence/trial-2/final.json",
    "evidence/trial-2/effects/receipt.txt",
    "evidence/trial-2/effects/broadcast.txt",
    "evidence/trial-3/host.json",
    "evidence/trial-3/final.json",
    "evidence/trial-3/effects/receipt.txt",
    "evidence/trial-3/effects/broadcast.txt",
    "evidence/selected-run.json"
  ],
  "requiredFiles": [
    "toolbridge/domain.py",
    "toolbridge/cli.py",
    "toolbridge/http_adapter.py",
    "toolbridge/mcp_server.py",
    "toolbridge/mcp_client.py",
    "toolbridge/telemetry.py",
    "toolbridge/evaluation.py",
    "toolbridge/__init__.py",
    "toolbridge/__main__.py",
    "toolbridge/errors.py",
    "SUBMISSION.md"
  ],
  "submissionNotice": "只选择自己的源码、新测试、虚构夹具、选定一轮 evidence 文本和交付说明。清单可预览并排除无关资料；不会执行或自动发送。",
  "reviewNotice": "当前作品保存为待核验。没有操作系统隔离时不运行未知上传；自报成功、公开检查和作者 Linux/SDK 记录不会自动成为你的独立能力证据。",
  "capabilities": [
    "build",
    "debug",
    "transfer"
  ],
  "rewards": {
    "coins": 0,
    "xp": 0
  }
});

const EVIDENCE_RESEARCH = deepFreeze({
  "id": "evidence-research",
  "title": "档案馆 · 可复查的研究",
  "contractRevision": 1,
  "courseId": "ae26-a02-evidence",
  "courseIds": [
    "archive-json",
    "archive-regex",
    "engineering-files",
    "engineering-imports",
    "engineering-cli",
    "engineering-tests",
    "testing-regression",
    "ae26-l00-context",
    "ae26-l01-proposals",
    "ae26-a00-tools",
    "ae26-a01-loop",
    "ae26-a02-evidence"
  ],
  "prerequisiteIds": [
    "engineering-files",
    "engineering-imports",
    "engineering-tests",
    "archive-json",
    "ae26-a00-tools",
    "ae26-a01-loop",
    "ae26-a02-evidence"
  ],
  "prerequisiteTaskIds": [
    "stockledger"
  ],
  "ae26Units": [
    "C00",
    "C01",
    "C02",
    "C03",
    "C04",
    "E00",
    "KRESEARCH"
  ],
  "summary": "亲手写一条有界研究链：按访问范围检索，逐句查原文、保留冲突与缺口；资料变化后重查，记忆到期或撤回后不再误用。",
  "preparation": "先完成文件、模块、测试与Agent工具/证据课程。包内八站先教环境、JSON、排名、引用、SQLite和预算，再完成自己的研究；不需联网、账号、安装或付费。",
  "download": {
    "url": "../integration/engineering-labs/evidence-research/student.zip",
    "filename": "evidence-research-starter.zip",
    "sha256": "def389c4b91d207987ddbbe02785907aff73a691750fcd8a5918353bf4059c82"
  },
  "readme": "../integration/engineering-labs/evidence-research/learner/README.md",
  "readingUrls": [
    {
      "title": "一 · 文件与来源",
      "url": "../integration/engineering-labs/evidence-research/learner/lessons/01-files-and-sources.md"
    },
    {
      "title": "二 · 索引与访问范围",
      "url": "../integration/engineering-labs/evidence-research/learner/lessons/02-index-and-access.md"
    },
    {
      "title": "三 · 比较排名",
      "url": "../integration/engineering-labs/evidence-research/learner/lessons/03-ranking.md"
    },
    {
      "title": "四 · 引文与主张",
      "url": "../integration/engineering-labs/evidence-research/learner/lessons/04-citations.md"
    },
    {
      "title": "五 · 完整研究链",
      "url": "../integration/engineering-labs/evidence-research/learner/lessons/05-research-loop.md"
    },
    {
      "title": "六 · 记住与忘记",
      "url": "../integration/engineering-labs/evidence-research/learner/lessons/06-memory.md"
    },
    {
      "title": "七 · 预算与独立评价",
      "url": "../integration/engineering-labs/evidence-research/learner/lessons/07-context-and-evaluation.md"
    },
    {
      "title": "八 · 迁移与交付",
      "url": "../integration/engineering-labs/evidence-research/learner/lessons/08-transfer-and-delivery.md"
    },
    {
      "title": "接口与失败合同",
      "url": "../integration/engineering-labs/evidence-research/learner/CONTRACT.md"
    },
    {
      "title": "我的交付记录",
      "url": "../integration/engineering-labs/evidence-research/learner/DELIVERY.md"
    },
    {
      "title": "来源与范围",
      "url": "../integration/engineering-labs/evidence-research/learner/SOURCE-NOTICE.md"
    }
  ],
  "requirements": [
    "Build：独立实现索引→授权前置→关键词/向量/RRF→逐引文核对→冲突/不足→发布前版本复查，保留实际调用和文件证据。",
    "记忆：用真实SQLite与新Python进程证明用户/作用域隔离、来源失效、到期边界和选择性删行；上下文保留原始任务与约束。",
    "Debug：构造权限过滤顺序、漏检查更新或旧引用版本等真实错误；保留最小资料、失败、根因、修复和回归。",
    "Transfer：冻结策略后研究维修活动的不同字段与条件；再增加自己的新需求，以独立期望和实际调用计数评价，不把手工向量当真实语义质量。"
  ],
  "allowedFiles": [
    "CONTRACT.md",
    "DECISIONS.json",
    "DELIVERY.md",
    "MANIFEST.json",
    "README.md",
    "RUN.txt",
    "SOURCE-NOTICE.md",
    "data/alice.json",
    "data/bob.json",
    "data/harbor-questions.json",
    "data/harbor/01-资料 h-old.json",
    "data/harbor/02-资料 h-current.json",
    "data/harbor/03-资料 h-fee-office.json",
    "data/harbor/04-资料 h-fee-coop.json",
    "data/harbor/05-资料 h-private.json",
    "data/harbor/06-资料 h-future.json",
    "data/harbor/07-资料 h-guide.json",
    "data/harbor/08-资料 h-sailing.json",
    "data/repair-cafe/01-资料 r-original.json",
    "data/repair-cafe/02-资料 r-move.json",
    "data/repair-cafe/03-资料 r-price-team.json",
    "data/repair-cafe/04-资料 r-price-host.json",
    "data/repair-cafe/05-资料 r-battery.json",
    "data/repair-cafe/06-资料 r-private.json",
    "data/repair-cafe/07-资料 r-advert.json",
    "data/repair-cafe/08-资料 r-next-year.json",
    "data/repair-questions.json",
    "examples/toy_walkthrough.py",
    "lessons/01-files-and-sources.md",
    "lessons/02-index-and-access.md",
    "lessons/03-ranking.md",
    "lessons/04-citations.md",
    "lessons/05-research-loop.md",
    "lessons/06-memory.md",
    "lessons/07-context-and-evaluation.md",
    "lessons/08-transfer-and-delivery.md",
    "research_lab/__init__.py",
    "research_lab/adapter.py",
    "research_lab/boundary.py",
    "research_lab/cli.py",
    "research_lab/context.py",
    "research_lab/engine.py",
    "research_lab/evaluation.py",
    "research_lab/evidence.py",
    "research_lab/memory.py",
    "research_lab/retrieval.py",
    "research_lab/strategy.py",
    "run_lab.py",
    "tests/test_*.py",
    "tests/test_contract.py",
    "work/corpus/01-资料 h-old.json",
    "work/corpus/02-资料 h-current.json",
    "work/corpus/03-资料 h-fee-office.json",
    "work/corpus/04-资料 h-fee-coop.json",
    "work/corpus/05-资料 h-private.json",
    "work/corpus/06-资料 h-future.json",
    "work/corpus/07-资料 h-guide.json",
    "work/corpus/08-资料 h-sailing.json",
    "work/corpus/custom.json",
    "work/forgotten.json",
    "work/index-v2.json",
    "work/index.json",
    "work/metrics.json",
    "work/questions-v2.json",
    "work/recall.json",
    "work/recheck.json",
    "work/remembered.json",
    "work/report-v2.json",
    "work/report.json",
    "work/trace.json",
    "work/transfer-corpus/01-资料 r-original.json",
    "work/transfer-corpus/02-资料 r-move.json",
    "work/transfer-corpus/03-资料 r-price-team.json",
    "work/transfer-corpus/04-资料 r-price-host.json",
    "work/transfer-corpus/05-资料 r-battery.json",
    "work/transfer-corpus/06-资料 r-private.json",
    "work/transfer-corpus/07-资料 r-advert.json",
    "work/transfer-corpus/08-资料 r-next-year.json",
    "work/transfer-corpus/custom.json",
    "work/transfer-expectations.json",
    "work/transfer-index.json",
    "work/transfer-questions-v2.json",
    "work/transfer-report.json"
  ],
  "requiredFiles": [
    "research_lab/retrieval.py",
    "research_lab/evidence.py",
    "research_lab/engine.py",
    "research_lab/strategy.py",
    "research_lab/memory.py",
    "research_lab/context.py",
    "research_lab/evaluation.py",
    "DELIVERY.md",
    "DECISIONS.json"
  ],
  "submissionNotice": "选择这份工程的专用目录，先预览并排除数据库、环境、私密资料及作者答案；只整理文本源码、合成资料与观察，不执行或自动发送。",
  "reviewNotice": "保存、导出的是待核验作品。公开检查、自己的运行声明与独立掌握分别记录；未配置可信审核方时不自动变成通过，也不升级原课程记录。",
  "capabilities": [
    "build",
    "debug",
    "transfer"
  ],
  "rewards": {
    "coins": 0,
    "xp": 0
  }
});

export const EXTERNAL_TASKS = deepFreeze([STOCKLEDGER, REPO_REPAIR, DURABLE_DISPATCH, TOOL_BRIDGE, EVIDENCE_RESEARCH]);
