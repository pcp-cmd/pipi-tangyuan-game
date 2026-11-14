export const ISLANDS = [
  {
    "id": "harbor",
    "name": "启航岛",
    "subtitle": "让每一步都有依据",
    "place": "潮汐码头",
    "project": "为两只猫完成一份可变化的出航清单",
    "color": "#377b83",
    "prerequisites": [
      "first-steps",
      "safe-buy",
      "discount"
    ],
    "questIds": [
      "harbor-rations",
      "harbor-labels",
      "harbor-fare",
      "harbor-route",
      "harbor-quantity",
      "harbor-manifest"
    ],
    "status": "implemented-local"
  },
  {
    "id": "market",
    "name": "集市岛",
    "subtitle": "把混乱变成可靠的账本",
    "place": "鱼饼街与货栈",
    "project": "让库存、订单和汇总互相对得上",
    "color": "#b2763a",
    "prerequisites": [
      "backpack",
      "catalog",
      "shells"
    ],
    "questIds": [
      "market-stock",
      "market-receipts",
      "market-intersection",
      "market-ranking",
      "market-copy",
      "market-checkout"
    ],
    "status": "implemented-local"
  },
  {
    "id": "workshop",
    "name": "工匠岛",
    "subtitle": "把一次成功变成可复用的工具",
    "place": "钟表工坊",
    "project": "组合出有清晰契约的航行设备",
    "color": "#8b627f",
    "prerequisites": [
      "discount",
      "stock-class"
    ],
    "questIds": [
      "workshop-defaults",
      "workshop-closure",
      "workshop-composition",
      "workshop-wallet",
      "workshop-iterable",
      "workshop-result"
    ],
    "status": "implemented-local"
  },
  {
    "id": "archive",
    "name": "档案岛",
    "subtitle": "让数据带着来源穿过海峡",
    "place": "邮局与观测档案馆",
    "project": "清理、校验并汇总航海数据",
    "color": "#607d45",
    "prerequisites": [
      "invalid-input",
      "ledger"
    ],
    "questIds": [
      "archive-json",
      "archive-regex",
      "archive-counter",
      "archive-queue",
      "archive-median",
      "archive-distance"
    ],
    "status": "implemented-local"
  },
  {
    "id": "observatory",
    "name": "观测岛",
    "subtitle": "用证据检查自己的程序",
    "place": "试航场与观星台",
    "project": "找出错误，证明修复，量出代价",
    "color": "#526d9d",
    "prerequisites": [
      "test-case",
      "discount"
    ],
    "questIds": [
      "observatory-test-cases",
      "observatory-binary",
      "observatory-prefix",
      "observatory-cache",
      "observatory-replay",
      "observatory-diagnose"
    ],
    "status": "implemented-local"
  },
  {
    "id": "beacon",
    "name": "灯塔岛",
    "subtitle": "让自动化遵守可检查的约定",
    "place": "航路调度台",
    "project": "为离线工具代理建立输入、授权、证据和预算合同",
    "color": "#a66a44",
    "prerequisites": [
      "tool-router",
      "permission",
      "dedupe",
      "retrieval"
    ],
    "questIds": [
      "beacon-schema",
      "beacon-permission",
      "beacon-idempotency",
      "beacon-retrieval",
      "beacon-evaluation",
      "beacon-budget"
    ],
    "status": "implemented-local"
  }
];
export const QUESTS = [
  {
    "id": "harbor-rations",
    "title": "潮汐前的补给",
    "topic": "整数 · 向上取整",
    "description": "每箱装 capacity 份鱼饼，需带 people × days 份。返回最少箱数；people、days 是非负整数，capacity 是正整数。",
    "function": "boxes",
    "starter": "def boxes(people, days, capacity):\n    # 在这里实现规则，再尝试不同输入\n    pass\n",
    "solution": "def boxes(people, days, capacity):\n    return (people * days + capacity - 1) // capacity\n",
    "checks": [
      [
        "场景 1：[2, 3, 4] → 2",
        "__lesson_equal(boxes(2, 3, 4), 2)"
      ],
      [
        "场景 2：[0, 5, 3] → 0",
        "__lesson_equal(boxes(0, 5, 3), 0)"
      ],
      [
        "场景 3：[3, 4, 6] → 2",
        "__lesson_equal(boxes(3, 4, 6), 2)"
      ],
      [
        "场景 4：[1, 1, 8] → 1",
        "__lesson_equal(boxes(1, 1, 8), 1)"
      ],
      [
        "场景 5：[7, 3, 5] → 5",
        "__lesson_equal(boxes(7, 3, 5), 5)"
      ]
    ],
    "cases": [
      [
        [
          2,
          3,
          4
        ],
        2
      ],
      [
        [
          0,
          5,
          3
        ],
        0
      ],
      [
        [
          3,
          4,
          6
        ],
        2
      ],
      [
        [
          1,
          1,
          8
        ],
        1
      ],
      [
        [
          7,
          3,
          5
        ],
        5
      ]
    ],
    "concept": "先算总份数，再分成每箱能容纳的份数。整除会丢掉余数；多出的不足一箱仍要占一箱，所以取上整。",
    "hint": "先求 total，再用 (total + capacity - 1) // capacity。",
    "boundary": "这个公式要求整数且 capacity 大于零；价格的小数计算不能直接套用。",
    "transfer": "把容量改为每艘船的人数，检查整除与还差一人的边界。",
    "chapter": 0,
    "islandId": "harbor",
    "reward": 20,
    "xp": 20,
    "reference": "AE26 semantic mapping: docs/ae26-map.md",
    "prerequisites": [],
    "releaseStatus": "implemented-local",
    "kind": "practice",
    "scene": {
      "district": "潮汐码头",
      "before": "为两只猫完成一份可变化的出航清单",
      "after": "已修复：潮汐前的补给。带着同一规则检查下一份输入。"
    },
    "review": {
      "intervalDays": [
        1,
        7,
        21
      ],
      "minimumUnassistedPasses": 2,
      "requiresDifferentContext": true,
      "status": "unobserved"
    },
    "hintLevels": [
      "先算总份数，再分成每箱能容纳的份数。整除会丢掉余数；多出的不足一箱仍要占一箱，所以取上整。",
      "先求 total，再用 (total + capacity - 1) // capacity。"
    ],
    "language": "python",
    "capability": "browser-restricted-python",
    "caseExpectedTypes": [
      "int",
      "int",
      "int",
      "int",
      "int"
    ]
  },
  {
    "id": "harbor-labels",
    "title": "湿掉的行李牌",
    "topic": "字符串 · 规范化",
    "description": "把 label 去掉首尾空白、转小写；空白内容返回 unknown，内部空格保留。",
    "function": "clean_label",
    "starter": "def clean_label(label):\n    # 在这里实现规则，再尝试不同输入\n    pass\n",
    "solution": "def clean_label(label):\n    return label.strip().lower() or \"unknown\"\n",
    "checks": [
      [
        "场景 1：['  PiPi  '] → 'pipi'",
        "__lesson_equal(clean_label('  PiPi  '), 'pipi')"
      ],
      [
        "场景 2：['\\t\\n'] → 'unknown'",
        "__lesson_equal(clean_label('\\t\\n'), 'unknown')"
      ],
      [
        "场景 3：['Sea Map'] → 'sea map'",
        "__lesson_equal(clean_label('Sea Map'), 'sea map')"
      ],
      [
        "场景 4：['汤圆'] → '汤圆'",
        "__lesson_equal(clean_label('汤圆'), '汤圆')"
      ],
      [
        "清理首尾全角空格",
        "__lesson_equal(clean_label('\\u3000汤圆\\u3000'), '汤圆')"
      ],
      [
        "转换非英文字母的小写",
        "__lesson_equal(clean_label('ÉTÉ'), 'été')"
      ],
      [
        "小写时保留字母本身的拼写",
        "__lesson_equal(clean_label('Straße'), 'straße')"
      ],
      [
        "保留内部全角空格",
        "__lesson_equal(clean_label('汤\\u3000圆'), '汤\\u3000圆')"
      ]
    ],
    "cases": [
      [
        [
          "  PiPi  "
        ],
        "pipi"
      ],
      [
        [
          "\t\n"
        ],
        "unknown"
      ],
      [
        [
          "Sea Map"
        ],
        "sea map"
      ],
      [
        [
          "汤圆"
        ],
        "汤圆"
      ]
    ],
    "concept": "首尾空白通常是录入噪声，内部空格可能是名称的一部分，应当保留。strip 去掉首尾空白，lower 把字母转为小写；它们处理的是空白与大小写两个不同问题。\n\n## 先读懂字符串方法\n\n`对象.方法()` 会调用这个对象提供的操作。`strip()` 返回去掉首尾空白后的新字符串，`lower()` 返回小写形式；原来的字符串不会被原地改写。先看与本题函数分开的例子：\n\n```python\ntitle = \"  Map Case  \"\nprint(title.strip())\nprint(title)\nprint(\"BEACON\".lower())\n```\n\n先预测三行输出：第一行首尾空格变了，内部空格还在；第二行仍是原值；第三行变为小写。得到新字符串后，可以用赋值把它保存在一个名字里。\n\n## 一个条件，两条路径\n\n已有比较表达式会得到 True 或 False。`if` 在条件为真时执行缩进内的语句；`else` 处理条件为假的另一条路径，同一次只选其中一条。\n\n```python\nsteps = 4\nif steps == 0:\n    print(\"停在原地\")\nelse:\n    print(\"继续前行\")\n```\n\n`==` 比较两个值是否相等，`=` 则是赋值。if 和 else 的行尾都有冒号，两个关键字对齐，它们内部的语句各缩进 4 个空格。把 steps 改成 0，再预测会显示哪一句。把这类分支放进函数时，分支里的代码要比 if 再多缩进一级；return 交回结果后会结束这一次调用。\n\n`\"\"` 是长度为零的空字符串，`\" \"` 仍有一个空格，并不是空字符串。不要把这两种输入混为一谈。回到原题，自己决定何时判断，以及两条路径各应返回什么。本课不要求照抄参考写法；使用清楚的 if/else 也可以表达规则。",
    "hint": "依次使用 strip()、lower()，再处理空结果。",
    "boundary": "lower 不是完整的身份匹配或 Unicode 安全策略；这里只规范普通标签。",
    "transfer": "输入来自剪贴板时，增加制表符与换行，解释为何不能删掉全部空格。",
    "chapter": 0,
    "islandId": "harbor",
    "reward": 20,
    "xp": 20,
    "reference": "AE26 semantic mapping: docs/ae26-map.md",
    "prerequisites": [
      "harbor-rations"
    ],
    "releaseStatus": "implemented-local",
    "kind": "practice",
    "scene": {
      "district": "潮汐码头",
      "before": "为两只猫完成一份可变化的出航清单",
      "after": "已修复：湿掉的行李牌。带着同一规则检查下一份输入。"
    },
    "review": {
      "intervalDays": [
        1,
        7,
        21
      ],
      "minimumUnassistedPasses": 2,
      "requiresDifferentContext": true,
      "status": "unobserved"
    },
    "hintLevels": [
      "首尾空白通常是录入噪声，内部空格可能是名称的一部分。strip 与 lower 分别解决这两个不同问题。",
      "依次使用 strip()、lower()，再处理空结果。"
    ],
    "language": "python",
    "capability": "browser-restricted-python",
    "caseExpectedTypes": [
      "str",
      "str",
      "str",
      "str"
    ]
  },
  {
    "id": "harbor-fare",
    "title": "渡船售票口",
    "topic": "条件 · 边界",
    "description": "年龄小于6岁免费；6至17岁半价，18岁起全价。base 是偶数整数，age非负；返回整数票价。",
    "function": "fare",
    "starter": "def fare(age, base):\n    # 在这里实现规则，再尝试不同输入\n    pass\n",
    "solution": "def fare(age, base):\n    if age < 6:\n        return 0\n    if age < 18:\n        return base // 2\n    return base\n",
    "checks": [
      [
        "场景 1：[5, 20] → 0",
        "__lesson_equal(fare(5, 20), 0)"
      ],
      [
        "场景 2：[6, 20] → 10",
        "__lesson_equal(fare(6, 20), 10)"
      ],
      [
        "场景 3：[17, 24] → 12",
        "__lesson_equal(fare(17, 24), 12)"
      ],
      [
        "场景 4：[18, 24] → 24",
        "__lesson_equal(fare(18, 24), 24)"
      ],
      [
        "场景 5：[70, 10] → 10",
        "__lesson_equal(fare(70, 10), 10)"
      ]
    ],
    "cases": [
      [
        [
          5,
          20
        ],
        0
      ],
      [
        [
          6,
          20
        ],
        10
      ],
      [
        [
          17,
          24
        ],
        12
      ],
      [
        [
          18,
          24
        ],
        24
      ],
      [
        [
          70,
          10
        ],
        10
      ]
    ],
    "concept": "按互斥区间检查条件，先处理最小年龄，剩下的路径自然缩小范围。边界6和18决定归属。",
    "hint": "把年龄5、6、17、18分别代入你的条件。",
    "boundary": "题目只处理非负年龄与偶数基础价格；现实支付还需要金额精度与退款规则。",
    "transfer": "设计按重量收费的邮寄表，用阈值前一格、阈值、后一格检验。",
    "chapter": 0,
    "islandId": "harbor",
    "reward": 20,
    "xp": 20,
    "reference": "AE26 semantic mapping: docs/ae26-map.md",
    "prerequisites": [
      "harbor-labels"
    ],
    "releaseStatus": "implemented-local",
    "kind": "practice",
    "scene": {
      "district": "潮汐码头",
      "before": "为两只猫完成一份可变化的出航清单",
      "after": "已修复：渡船售票口。带着同一规则检查下一份输入。"
    },
    "review": {
      "intervalDays": [
        1,
        7,
        21
      ],
      "minimumUnassistedPasses": 2,
      "requiresDifferentContext": true,
      "status": "unobserved"
    },
    "hintLevels": [
      "按互斥区间检查条件，先处理最小年龄，剩下的路径自然缩小范围。边界6和18决定归属。",
      "把年龄5、6、17、18分别代入你的条件。"
    ],
    "language": "python",
    "capability": "browser-restricted-python",
    "caseExpectedTypes": [
      "int",
      "int",
      "int",
      "int",
      "int"
    ]
  },
  {
    "id": "harbor-route",
    "title": "沿灯标前行",
    "topic": "循环 · 状态轨迹",
    "description": "从 start 出发依次应用整数 moves，返回包含起点及每步结果的列表；原 moves 保持不变。",
    "function": "trace_route",
    "starter": "def trace_route(start, moves):\n    # 在这里实现规则，再尝试不同输入\n    pass\n",
    "solution": "def trace_route(start, moves):\n    positions = [start]\n    for step in moves:\n        start += step\n        positions.append(start)\n    return positions\n",
    "checks": [
      [
        "场景 1：[3, [2, -1, 4]] → [3, 5, 4, 8]",
        "__lesson_equal(trace_route(3, [2, -1, 4]), [3, 5, 4, 8])"
      ],
      [
        "场景 2：[0, []] → [0]",
        "__lesson_equal(trace_route(0, []), [0])"
      ],
      [
        "场景 3：[5, [-5, 0]] → [5, 0, 0]",
        "__lesson_equal(trace_route(5, [-5, 0]), [5, 0, 0])"
      ],
      [
        "负位置仍逐步累加，过零和原地停留不重写轨迹",
        "__lesson_unchanged(trace_route, [1,[-3,1,1,0,-4,7]], [1,-2,-1,0,0,-4,3], [1]) and __lesson_unchanged(trace_route, [-2,[-3,0,4]], [-2,-5,-5,-1], [1]) and __lesson_unchanged(trace_route, [0,[-1,2,-3]], [0,-1,1,-2], [1])"
      ],
      [
        "整数轨迹保持精确，大数步长与抵消不能经浮点改写位置",
        "__lesson_unchanged(trace_route, [9007199254740993, []], [9007199254740993], [1]) and __lesson_unchanged(trace_route, [0, [9007199254740993, -9007199254740992, -1, 0]], [0, 9007199254740993, 1, 0, 0], [1]) and __lesson_unchanged(trace_route, [9007199254740992, [1, 1, -2, 0]], [9007199254740992, 9007199254740993, 9007199254740994, 9007199254740992, 9007199254740992], [1]) and __lesson_unchanged(trace_route, [-9007199254740993, [1, 9007199254740992, 0, -1]], [-9007199254740993, -9007199254740992, 0, 0, -1], [1]) and __lesson_unchanged(trace_route, [0, [9223372036854775809, -9223372036854775809, 1]], [0, 9223372036854775809, 0, 1], [1]) and __lesson_unchanged(trace_route, [0, [-9223372036854775809, 9223372036854775809, -1]], [0, -9223372036854775809, 0, -1], [1])"
      ]
    ],
    "cases": [
      [
        [
          3,
          [
            2,
            -1,
            4
          ]
        ],
        [
          3,
          5,
          4,
          8
        ]
      ],
      [
        [
          0,
          []
        ],
        [
          0
        ]
      ],
      [
        [
          5,
          [
            -5,
            0
          ]
        ],
        [
          5,
          0,
          0
        ]
      ]
    ],
    "concept": "当前位置是状态，每个移动是一次状态变更。保留中间结果后，才能定位哪一步偏离航线。",
    "hint": "结果从 [start] 开始，每次累加后 append。",
    "boundary": "总位移相同不代表路线相同；有障碍时还要逐步验证。",
    "transfer": "将移动换成存款和支出，查出首次出现负余额的位置。",
    "chapter": 0,
    "islandId": "harbor",
    "reward": 20,
    "xp": 20,
    "reference": "AE26 semantic mapping: docs/ae26-map.md",
    "prerequisites": [
      "harbor-fare"
    ],
    "releaseStatus": "implemented-local",
    "kind": "practice",
    "scene": {
      "district": "潮汐码头",
      "before": "为两只猫完成一份可变化的出航清单",
      "after": "已修复：沿灯标前行。带着同一规则检查下一份输入。"
    },
    "review": {
      "intervalDays": [
        1,
        7,
        21
      ],
      "minimumUnassistedPasses": 2,
      "requiresDifferentContext": true,
      "status": "unobserved"
    },
    "hintLevels": [
      "当前位置是状态，每个移动是一次状态变更。保留中间结果后，才能定位哪一步偏离航线。",
      "结果从 [start] 开始，每次累加后 append。"
    ],
    "language": "python",
    "capability": "browser-restricted-python",
    "caseExpectedTypes": [
      "list",
      "list",
      "list"
    ]
  },
  {
    "id": "harbor-quantity",
    "title": "读懂订单数量",
    "topic": "类型转换 · 异常",
    "description": "text 是字符串。转为整数，只有0至99返回该整数；无法转换或超范围返回 None。",
    "function": "quantity",
    "starter": "def quantity(text):\n    # 在这里实现规则，再尝试不同输入\n    pass\n",
    "solution": "def quantity(text):\n    try:\n        value = int(text)\n    except ValueError:\n        return None\n    return value if 0 <= value <= 99 else None\n",
    "checks": [
      [
        "场景 1：[' 12 '] → 12",
        "__lesson_equal(quantity(' 12 '), 12)"
      ],
      [
        "场景 2：['0'] → 0",
        "__lesson_equal(quantity('0'), 0)"
      ],
      [
        "场景 3：['99'] → 99",
        "__lesson_equal(quantity('99'), 99)"
      ],
      [
        "场景 4：['100'] → None",
        "__lesson_equal(quantity('100'), None)"
      ],
      [
        "场景 5：['-1'] → None",
        "__lesson_equal(quantity('-1'), None)"
      ],
      [
        "场景 6：['1.5'] → None",
        "__lesson_equal(quantity('1.5'), None)"
      ],
      [
        "场景 7：['fish'] → None",
        "__lesson_equal(quantity('fish'), None)"
      ],
      [
        "int 可解析的 Unicode 十进制文本仍按原值与 0 至 99 范围检查",
        "all(__lesson_equal(quantity(text), expected) for text, expected in [('１２', 12), ('١٢', 12), ('१२', 12), ('+١_٢', 12), ('\\u2003１２\\xa0', 12), ('٠', 0), ('９９', 99), ('-٠', 0), ('١٠٠', None), ('-١', None), ('²', None), ('Ⅻ', None), ('١__٢', None), ('１２.０', None), ('1٢', 12)])"
      ],
      [
        "只按原始文本转换，控制分隔符不是整数两端空白",
        "all(__lesson_equal(quantity(text), None) for text in ('\\x1c12', '12\\x1c', '\\x1d12', '12\\x1d', '\\x1e12', '12\\x1e', '\\x1f12', '12\\x1f', ' \\x1e12 ', '\\x1f１２', '\\x1c+١٢\\x1f'))"
      ],
      [
        "数量范围取决于值，合法前导零不能按字符数拒绝",
        "all(__lesson_equal(quantity(text), expected) for text, expected in [('00012', 12), ('０００１２', 12), ('٠٠٠١٢', 12), ('+00_012', 12), ('0_0_0_99', 99), ('-000', 0), (' 00000 ', 0), ('000100', None), ('-00001', None)])"
      ],
      [
        "不把非 Python 正负号规范化为可接受输入",
        "all(__lesson_equal(quantity(text), None) for text in ['＋１２', '−٠', '－12', '－0', '－٠', '－０', '﹢12', '﹣0', '＋0', '−0'])"
      ]
    ],
    "cases": [
      [
        [
          " 12 "
        ],
        12
      ],
      [
        [
          "0"
        ],
        0
      ],
      [
        [
          "99"
        ],
        99
      ],
      [
        [
          "100"
        ],
        null
      ],
      [
        [
          "-1"
        ],
        null
      ],
      [
        [
          "1.5"
        ],
        null
      ],
      [
        [
          "fish"
        ],
        null
      ]
    ],
    "concept": "能转换为整数与符合业务范围是两层检查。只捕获预期的 ValueError，随后再验证范围。",
    "hint": "try 中转换，except 返回 None，成功后检查上下界。",
    "boundary": "None 表示无有效数量，不能与有效的零混同。",
    "transfer": "在报名表里把年龄解析与年龄范围分成两步，保留失败原因。",
    "chapter": 0,
    "islandId": "harbor",
    "reward": 20,
    "xp": 20,
    "reference": "AE26 semantic mapping: docs/ae26-map.md",
    "prerequisites": [
      "harbor-route"
    ],
    "releaseStatus": "implemented-local",
    "kind": "practice",
    "scene": {
      "district": "潮汐码头",
      "before": "为两只猫完成一份可变化的出航清单",
      "after": "已修复：读懂订单数量。带着同一规则检查下一份输入。"
    },
    "review": {
      "intervalDays": [
        1,
        7,
        21
      ],
      "minimumUnassistedPasses": 2,
      "requiresDifferentContext": true,
      "status": "unobserved"
    },
    "hintLevels": [
      "能转换为整数与符合业务范围是两层检查。只捕获预期的 ValueError，随后再验证范围。",
      "try 中转换，except 返回 None，成功后检查上下界。"
    ],
    "language": "python",
    "capability": "browser-restricted-python",
    "caseExpectedTypes": [
      "int",
      "int",
      "int",
      "NoneType",
      "NoneType",
      "NoneType",
      "NoneType"
    ]
  },
  {
    "id": "harbor-manifest",
    "title": "启航许可证",
    "topic": "组合 · 迁移任务",
    "description": "输入 items 为物品名称列表。保留首次出现顺序去重，只保留非空字符串并 strip 首尾空白；大小写区分。返回新列表。",
    "function": "manifest",
    "starter": "def manifest(items):\n    # 在这里实现规则，再尝试不同输入\n    pass\n",
    "solution": "def manifest(items):\n    result = []\n    for item in items:\n        if isinstance(item, str):\n            name = item.strip()\n            if name and name not in result:\n                result.append(name)\n    return result\n",
    "checks": [
      [
        "场景 1：[[' 地图 ', '水', '地图', '']] → ['地图', '水']",
        "__lesson_equal(manifest([' 地图 ', '水', '地图', '']), ['地图', '水'])"
      ],
      [
        "场景 2：[[None, 3, '灯', ' 灯 ']] → ['灯']",
        "__lesson_equal(manifest([None, 3, '灯', ' 灯 ']), ['灯'])"
      ],
      [
        "场景 3：[[]] → []",
        "__lesson_equal(manifest([]), [])"
      ],
      [
        "场景 4：[['A', 'a']] → ['A', 'a']",
        "__lesson_equal(manifest(['A', 'a']), ['A', 'a'])"
      ],
      [
        "只strip首尾空白，保留内部空白且清理后空名称不入清单",
        "__lesson_equal(manifest([' map  case ', 'map case', 'map  case', ' A\\tB ', 'A B', 'A\\tB']), ['map  case', 'map case', 'A\\tB', 'A B']) and __lesson_equal(manifest(['\\xa0Map\\u2003', 'Map', 'map', ' \\t\\n ', '\\xa0\\u2003', '', None, 0]), ['Map', 'map'])"
      ]
    ],
    "cases": [
      [
        [
          [
            " 地图 ",
            "水",
            "地图",
            ""
          ]
        ],
        [
          "地图",
          "水"
        ]
      ],
      [
        [
          [
            null,
            3,
            "灯",
            " 灯 "
          ]
        ],
        [
          "灯"
        ]
      ],
      [
        [
          []
        ],
        []
      ],
      [
        [
          [
            "A",
            "a"
          ]
        ],
        [
          "A",
          "a"
        ]
      ]
    ],
    "concept": "清理、验证、去重的顺序会改变结果。先清理名称，再判断是否已出现，才能识别带多余空白的同一物品。",
    "hint": "逐项处理，先判断字符串，再strip，再检查结果中是否已有。",
    "boundary": "不允许排序，因为首次出现的顺序就是装船顺序。",
    "transfer": "把行李改成邮件收件地址，先明确大小写、空白的业务规则再去重。",
    "chapter": 0,
    "islandId": "harbor",
    "reward": 20,
    "xp": 20,
    "reference": "AE26 semantic mapping: docs/ae26-map.md",
    "prerequisites": [
      "harbor-quantity"
    ],
    "releaseStatus": "implemented-local",
    "kind": "island-capstone-exercise",
    "scene": {
      "district": "潮汐码头",
      "before": "为两只猫完成一份可变化的出航清单",
      "after": "已修复：启航许可证。带着同一规则检查下一份输入。"
    },
    "review": {
      "intervalDays": [
        1,
        7,
        21
      ],
      "minimumUnassistedPasses": 2,
      "requiresDifferentContext": true,
      "status": "unobserved"
    },
    "hintLevels": [
      "清理、验证、去重的顺序会改变结果。先清理名称，再判断是否已出现，才能识别带多余空白的同一物品。",
      "逐项处理，先判断字符串，再strip，再检查结果中是否已有。"
    ],
    "language": "python",
    "capability": "browser-restricted-python",
    "caseExpectedTypes": [
      "list",
      "list",
      "list",
      "list"
    ]
  },
  {
    "id": "market-stock",
    "title": "货栈的缺货单",
    "topic": "字典 · 默认值",
    "description": "stock/orders 均为名称到非负整数的字典。返回缺货数量大于0的字典，未库存的物品视为0；不要改变输入。",
    "function": "shortages",
    "starter": "def shortages(stock, orders):\n    # 在这里实现规则，再尝试不同输入\n    pass\n",
    "solution": "def shortages(stock, orders):\n    return {name: qty - stock.get(name, 0) for name, qty in orders.items() if qty > stock.get(name, 0)}\n",
    "checks": [
      [
        "场景 1：[{'鱼': 3}, {'鱼': 5, '水': 2}] → {'鱼': 2, '水': 2}",
        "__lesson_equal(shortages({'鱼': 3}, {'鱼': 5, '水': 2}), {'鱼': 2, '水': 2})"
      ],
      [
        "场景 2：[{'鱼': 3}, {'鱼': 3}] → {}",
        "__lesson_equal(shortages({'鱼': 3}, {'鱼': 3}), {})"
      ],
      [
        "场景 3：[{}, {}] → {}",
        "__lesson_equal(shortages({}, {}), {})"
      ],
      [
        "场景 4：[{'水': 8}, {'水': 2}] → {}",
        "__lesson_equal(shortages({'水': 8}, {'水': 2}), {})"
      ]
    ],
    "cases": [
      [
        [
          {
            "鱼": 3
          },
          {
            "鱼": 5,
            "水": 2
          }
        ],
        {
          "鱼": 2,
          "水": 2
        }
      ],
      [
        [
          {
            "鱼": 3
          },
          {
            "鱼": 3
          }
        ],
        {}
      ],
      [
        [
          {},
          {}
        ],
        {}
      ],
      [
        [
          {
            "水": 8
          },
          {
            "水": 2
          }
        ],
        {}
      ]
    ],
    "concept": "库存表缺少某个键时 get 可以提供业务约定的零。只输出正差额，避免把盈余误记成缺货。",
    "hint": "遍历订单中的物品，计算订单减库存。",
    "boundary": "缺失键被定义为零是本题约定；审计系统可能必须把未知库存与零库存分开。",
    "transfer": "用同样结构计算人员排班缺口，并讨论未知出勤信息能否当作零。",
    "chapter": 1,
    "islandId": "market",
    "reward": 20,
    "xp": 20,
    "reference": "AE26 semantic mapping: docs/ae26-map.md",
    "prerequisites": [],
    "releaseStatus": "implemented-local",
    "kind": "practice",
    "scene": {
      "district": "鱼饼街与货栈",
      "before": "让库存、订单和汇总互相对得上",
      "after": "已修复：货栈的缺货单。带着同一规则检查下一份输入。"
    },
    "review": {
      "intervalDays": [
        1,
        7,
        21
      ],
      "minimumUnassistedPasses": 2,
      "requiresDifferentContext": true,
      "status": "unobserved"
    },
    "hintLevels": [
      "库存表缺少某个键时 get 可以提供业务约定的零。只输出正差额，避免把盈余误记成缺货。",
      "遍历订单中的物品，计算订单减库存。"
    ],
    "language": "python",
    "capability": "browser-restricted-python",
    "caseExpectedTypes": [
      "dict",
      "dict",
      "dict",
      "dict"
    ]
  },
  {
    "id": "market-receipts",
    "title": "把收据合成账本",
    "topic": "字典 · 累加",
    "description": "receipts 是 [名称,数量] 对的列表，数量是整数，可含退货负数。汇总每种名称，保留总数为0的键。",
    "function": "totals",
    "starter": "def totals(receipts):\n    # 在这里实现规则，再尝试不同输入\n    pass\n",
    "solution": "def totals(receipts):\n    result = {}\n    for name, qty in receipts:\n        result[name] = result.get(name, 0) + qty\n    return result\n",
    "checks": [
      [
        "场景 1：[[['鱼', 2], ['水', 3], ['鱼', -1]]] → {'鱼': 1, '水': 3}",
        "__lesson_equal(totals([['鱼', 2], ['水', 3], ['鱼', -1]]), {'鱼': 1, '水': 3})"
      ],
      [
        "场景 2：[[['鱼', 2], ['鱼', -2]]] → {'鱼': 0}",
        "__lesson_equal(totals([['鱼', 2], ['鱼', -2]]), {'鱼': 0})"
      ],
      [
        "场景 3：[[]] → {}",
        "__lesson_equal(totals([]), {})"
      ]
    ],
    "cases": [
      [
        [
          [
            [
              "鱼",
              2
            ],
            [
              "水",
              3
            ],
            [
              "鱼",
              -1
            ]
          ]
        ],
        {
          "鱼": 1,
          "水": 3
        }
      ],
      [
        [
          [
            [
              "鱼",
              2
            ],
            [
              "鱼",
              -2
            ]
          ]
        ],
        {
          "鱼": 0
        }
      ],
      [
        [
          []
        ],
        {}
      ]
    ],
    "concept": "每张收据是增量，账本是累计状态。相同键的赋值必须加上旧数，否则只剩最后一张。",
    "hint": "result.get(name, 0) + qty。",
    "boundary": "负数在本题代表退货；不可以统一忽略负数。",
    "transfer": "迁移到每日温度变化，区别变化量与最终值。",
    "chapter": 1,
    "islandId": "market",
    "reward": 20,
    "xp": 20,
    "reference": "AE26 semantic mapping: docs/ae26-map.md",
    "prerequisites": [
      "market-stock"
    ],
    "releaseStatus": "implemented-local",
    "kind": "practice",
    "scene": {
      "district": "鱼饼街与货栈",
      "before": "让库存、订单和汇总互相对得上",
      "after": "已修复：把收据合成账本。带着同一规则检查下一份输入。"
    },
    "review": {
      "intervalDays": [
        1,
        7,
        21
      ],
      "minimumUnassistedPasses": 2,
      "requiresDifferentContext": true,
      "status": "unobserved"
    },
    "hintLevels": [
      "每张收据是增量，账本是累计状态。相同键的赋值必须加上旧数，否则只剩最后一张。",
      "result.get(name, 0) + qty。"
    ],
    "language": "python",
    "capability": "browser-restricted-python",
    "caseExpectedTypes": [
      "dict",
      "dict",
      "dict"
    ]
  },
  {
    "id": "market-intersection",
    "title": "两艘船都要的货",
    "topic": "集合 · 排序",
    "description": "返回 a 与 b 都有的物品，去重并按字符串排序；输入为字符串列表。",
    "function": "shared",
    "starter": "def shared(a, b):\n    # 在这里实现规则，再尝试不同输入\n    pass\n",
    "solution": "def shared(a, b):\n    return sorted(set(a) & set(b))\n",
    "checks": [
      [
        "场景 1：[['水', '水', '鱼'], ['水', '灯']] → ['水']",
        "__lesson_equal(shared(['水', '水', '鱼'], ['水', '灯']), ['水'])"
      ],
      [
        "场景 2：[['b', 'a'], ['a', 'b', 'a']] → ['a', 'b']",
        "__lesson_equal(shared(['b', 'a'], ['a', 'b', 'a']), ['a', 'b'])"
      ],
      [
        "场景 3：[[], ['a']] → []",
        "__lesson_equal(shared([], ['a']), [])"
      ]
    ],
    "cases": [
      [
        [
          [
            "水",
            "水",
            "鱼"
          ],
          [
            "水",
            "灯"
          ]
        ],
        [
          "水"
        ]
      ],
      [
        [
          [
            "b",
            "a"
          ],
          [
            "a",
            "b",
            "a"
          ]
        ],
        [
          "a",
          "b"
        ]
      ],
      [
        [
          [],
          [
            "a"
          ]
        ],
        []
      ]
    ],
    "concept": "集合消除重复，交集保留共同成员。集合不承诺你要的展示顺序，所以返回前明确排序。",
    "hint": "先转 set，再做 &，最后 sorted。",
    "boundary": "如果数量和首次顺序很重要，集合会丢失这些信息。",
    "transfer": "比较两个课程清单的共同主题，另用计数器处理重复报名人数。",
    "chapter": 1,
    "islandId": "market",
    "reward": 20,
    "xp": 20,
    "reference": "AE26 semantic mapping: docs/ae26-map.md",
    "prerequisites": [
      "market-receipts"
    ],
    "releaseStatus": "implemented-local",
    "kind": "practice",
    "scene": {
      "district": "鱼饼街与货栈",
      "before": "让库存、订单和汇总互相对得上",
      "after": "已修复：两艘船都要的货。带着同一规则检查下一份输入。"
    },
    "review": {
      "intervalDays": [
        1,
        7,
        21
      ],
      "minimumUnassistedPasses": 2,
      "requiresDifferentContext": true,
      "status": "unobserved"
    },
    "hintLevels": [
      "集合消除重复，交集保留共同成员。集合不承诺你要的展示顺序，所以返回前明确排序。",
      "先转 set，再做 &，最后 sorted。"
    ],
    "language": "python",
    "capability": "browser-restricted-python",
    "caseExpectedTypes": [
      "list",
      "list",
      "list"
    ]
  },
  {
    "id": "market-ranking",
    "title": "集市的出航顺序",
    "topic": "排序 · 多关键字",
    "description": "rows 为 [名字,分数] 列表。按分数降序、同分按名字升序，返回名字列表。",
    "function": "ranked",
    "starter": "def ranked(rows):\n    # 在这里实现规则，再尝试不同输入\n    pass\n",
    "solution": "def ranked(rows):\n    return [name for name, score in sorted(rows, key=lambda row: (-row[1], row[0]))]\n",
    "checks": [
      [
        "场景 1：[[['pipi', 8], ['tang', 10], ['al', 8]]] → ['tang', 'al', 'pipi']",
        "__lesson_equal(ranked([['pipi', 8], ['tang', 10], ['al', 8]]), ['tang', 'al', 'pipi'])"
      ],
      [
        "场景 2：[[['z', 0], ['a', 0]]] → ['a', 'z']",
        "__lesson_equal(ranked([['z', 0], ['a', 0]]), ['a', 'z'])"
      ],
      [
        "场景 3：[[]] → []",
        "__lesson_equal(ranked([]), [])"
      ]
    ],
    "cases": [
      [
        [
          [
            [
              "pipi",
              8
            ],
            [
              "tang",
              10
            ],
            [
              "al",
              8
            ]
          ]
        ],
        [
          "tang",
          "al",
          "pipi"
        ]
      ],
      [
        [
          [
            [
              "z",
              0
            ],
            [
              "a",
              0
            ]
          ]
        ],
        [
          "a",
          "z"
        ]
      ],
      [
        [
          []
        ],
        []
      ]
    ],
    "concept": "复合排序键把主规则与平局规则写在一起。数值取负可改变主规则方向，而名字仍保持升序。",
    "hint": "排序 key 返回 (-score, name)。",
    "boundary": "对整个元组用 reverse=True 会连名字方向一起反转。",
    "transfer": "设计按截止日期优先、同日按订单号排序的配送队列。",
    "chapter": 1,
    "islandId": "market",
    "reward": 20,
    "xp": 20,
    "reference": "AE26 semantic mapping: docs/ae26-map.md",
    "prerequisites": [
      "market-intersection"
    ],
    "releaseStatus": "implemented-local",
    "kind": "practice",
    "scene": {
      "district": "鱼饼街与货栈",
      "before": "让库存、订单和汇总互相对得上",
      "after": "已修复：集市的出航顺序。带着同一规则检查下一份输入。"
    },
    "review": {
      "intervalDays": [
        1,
        7,
        21
      ],
      "minimumUnassistedPasses": 2,
      "requiresDifferentContext": true,
      "status": "unobserved"
    },
    "hintLevels": [
      "复合排序键把主规则与平局规则写在一起。数值取负可改变主规则方向，而名字仍保持升序。",
      "排序 key 返回 (-score, name)。"
    ],
    "language": "python",
    "capability": "browser-restricted-python",
    "caseExpectedTypes": [
      "list",
      "list",
      "list"
    ]
  },
  {
    "id": "market-copy",
    "title": "两只猫的独立补给",
    "topic": "可变对象 · 复制",
    "description": "supply 为名称到整数列表的字典。返回新字典，其中每个列表末尾加上 amount；不要改原字典或原列表。",
    "function": "resupply",
    "starter": "def resupply(supply, amount):\n    # 在这里实现规则，再尝试不同输入\n    pass\n",
    "solution": "def resupply(supply, amount):\n    return {name: values + [amount] for name, values in supply.items()}\n",
    "checks": [
      [
        "场景 1：[{'皮皮': [1, 2], '汤圆': []}, 3] → {'皮皮': [1, 2, 3], '汤圆': [3]}",
        "__lesson_equal(resupply({'皮皮': [1, 2], '汤圆': []}, 3), {'皮皮': [1, 2, 3], '汤圆': [3]})"
      ],
      [
        "场景 2：[{}, 2] → {}",
        "__lesson_equal(resupply({}, 2), {})"
      ],
      [
        "原输入保持不变",
        "(lambda data: (resupply(data, 9), data)[1] == {\"x\":[1]} )({\"x\":[1]})"
      ]
    ],
    "cases": [
      [
        [
          {
            "皮皮": [
              1,
              2
            ],
            "汤圆": []
          },
          3
        ],
        {
          "皮皮": [
            1,
            2,
            3
          ],
          "汤圆": [
            3
          ]
        }
      ],
      [
        [
          {},
          2
        ],
        {}
      ]
    ],
    "concept": "复制字典只复制外层，里面的列表可能仍共享。这里每个 values + [amount] 都建立新的列表。",
    "hint": "为每个键创建新列表，不对原列表调用 append。",
    "boundary": "更深的嵌套还可能共享内部对象；本题只承诺一层整数列表。",
    "transfer": "两个旅客各拿一份清单，修改其中一份后验证另一份是否改变。",
    "chapter": 1,
    "islandId": "market",
    "reward": 20,
    "xp": 20,
    "reference": "AE26 semantic mapping: docs/ae26-map.md",
    "prerequisites": [
      "market-ranking"
    ],
    "releaseStatus": "implemented-local",
    "kind": "practice",
    "scene": {
      "district": "鱼饼街与货栈",
      "before": "让库存、订单和汇总互相对得上",
      "after": "已修复：两只猫的独立补给。带着同一规则检查下一份输入。"
    },
    "review": {
      "intervalDays": [
        1,
        7,
        21
      ],
      "minimumUnassistedPasses": 2,
      "requiresDifferentContext": true,
      "status": "unobserved"
    },
    "hintLevels": [
      "复制字典只复制外层，里面的列表可能仍共享。这里每个 values + [amount] 都建立新的列表。",
      "为每个键创建新列表，不对原列表调用 append。"
    ],
    "language": "python",
    "capability": "browser-restricted-python",
    "caseExpectedTypes": [
      "dict",
      "dict"
    ]
  },
  {
    "id": "market-checkout",
    "title": "不扣半份库存",
    "topic": "原子变更 · 项目",
    "description": "stock/order 为名称到非负整数的字典。只要任一商品不足就返回 None；全部足够则返回扣除后的新库存，保留零库存键；原库存始终不变。",
    "function": "checkout",
    "starter": "def checkout(stock, order):\n    # 在这里实现规则，再尝试不同输入\n    pass\n",
    "solution": "def checkout(stock, order):\n    if any(qty > stock.get(name, 0) for name, qty in order.items()):\n        return None\n    result = stock.copy()\n    for name, qty in order.items():\n        result[name] = result.get(name, 0) - qty\n    return result\n",
    "checks": [
      [
        "场景 1：[{'鱼': 5, '水': 1}, {'鱼': 2}] → {'鱼': 3, '水': 1}",
        "__lesson_equal(checkout({'鱼': 5, '水': 1}, {'鱼': 2}), {'鱼': 3, '水': 1})"
      ],
      [
        "场景 2：[{'鱼': 5}, {'鱼': 2, '水': 1}] → None",
        "__lesson_equal(checkout({'鱼': 5}, {'鱼': 2, '水': 1}), None)"
      ],
      [
        "场景 3：[{'鱼': 2}, {'鱼': 2}] → {'鱼': 0}",
        "__lesson_equal(checkout({'鱼': 2}, {'鱼': 2}), {'鱼': 0})"
      ],
      [
        "场景 4：[{}, {}] → {}",
        "__lesson_equal(checkout({}, {}), {})"
      ],
      [
        "成功与失败都不修改输入",
        "(lambda d: (checkout(d,{\"x\":1}),d)[1] == {\"x\":2})({\"x\":2}) and (lambda d: (checkout(d,{\"x\":1,\"y\":1}),d)[1] == {\"x\":2})({\"x\":2})"
      ]
    ],
    "cases": [
      [
        [
          {
            "鱼": 5,
            "水": 1
          },
          {
            "鱼": 2
          }
        ],
        {
          "鱼": 3,
          "水": 1
        }
      ],
      [
        [
          {
            "鱼": 5
          },
          {
            "鱼": 2,
            "水": 1
          }
        ],
        null
      ],
      [
        [
          {
            "鱼": 2
          },
          {
            "鱼": 2
          }
        ],
        {
          "鱼": 0
        }
      ],
      [
        [
          {},
          {}
        ],
        {}
      ]
    ],
    "concept": "先验证整份订单，再生成新状态。如果边检查边扣库存，后面的商品失败时可能留下半次交易。",
    "hint": "第一遍判断是否足够；通过后再复制并扣减。",
    "boundary": "这是内存中的单次操作，不是跨进程数据库事务。",
    "transfer": "把订单换成同时预订船票和旅馆，指出哪一步需要真正的事务或补偿。",
    "chapter": 1,
    "islandId": "market",
    "reward": 20,
    "xp": 20,
    "reference": "AE26 semantic mapping: docs/ae26-map.md",
    "prerequisites": [
      "market-copy"
    ],
    "releaseStatus": "implemented-local",
    "kind": "island-capstone-exercise",
    "scene": {
      "district": "鱼饼街与货栈",
      "before": "让库存、订单和汇总互相对得上",
      "after": "已修复：不扣半份库存。带着同一规则检查下一份输入。"
    },
    "review": {
      "intervalDays": [
        1,
        7,
        21
      ],
      "minimumUnassistedPasses": 2,
      "requiresDifferentContext": true,
      "status": "unobserved"
    },
    "hintLevels": [
      "先验证整份订单，再生成新状态。如果边检查边扣库存，后面的商品失败时可能留下半次交易。",
      "第一遍判断是否足够；通过后再复制并扣减。"
    ],
    "language": "python",
    "capability": "browser-restricted-python",
    "caseExpectedTypes": [
      "dict",
      "NoneType",
      "dict",
      "dict"
    ]
  },
  {
    "id": "workshop-defaults",
    "title": "不会串单的便签",
    "topic": "默认参数 · 生命周期",
    "description": "append_note(note, notes=None) 返回加上 note 的新列表。未传 notes 时从空列表开始；传入列表也不能被修改。",
    "function": "append_note",
    "starter": "def append_note(note, notes=None):\n    # 在这里实现规则，再尝试不同输入\n    pass\n",
    "solution": "def append_note(note, notes=None):\n    return ([] if notes is None else list(notes)) + [note]\n",
    "checks": [
      [
        "场景 1：['a'] → ['a']",
        "__lesson_equal(append_note('a'), ['a'])"
      ],
      [
        "场景 2：['b'] → ['b']",
        "__lesson_equal(append_note('b'), ['b'])"
      ],
      [
        "场景 3：['c', ['a']] → ['a', 'c']",
        "__lesson_equal(append_note('c', ['a']), ['a', 'c'])"
      ],
      [
        "连续调用彼此独立",
        "append_note(\"first\") == [\"first\"] and append_note(\"second\") == [\"second\"]"
      ],
      [
        "输入列表不被修改",
        "(lambda x: (append_note(\"b\", x),x)[1] == [\"a\"])([\"a\"])"
      ],
      [
        "显式 None 仍表示缺省，重复便签也必须追加一项",
        "__lesson_equal(append_note('explicit', None), ['explicit']) and __lesson_equal(append_note('echo', ['echo']), ['echo', 'echo']) and __lesson_equal(append_note('', ['', 'echo', '']), ['', 'echo', '', '']) and __lesson_equal(append_note('地图', ['地图', '水', '地图']), ['地图', '水', '地图', '地图'])"
      ],
      [
        "保留先前返回值，每次调用均产生独立的新列表",
        "(lambda first, second: first is not second and __lesson_equal(first, ['first']) and __lesson_equal(second, ['second']))(append_note('first'), append_note('second', None)) and (lambda source: (lambda first, second: first is not source and second is not source and first is not second and __lesson_equal(source, ['old']) and __lesson_equal(first, ['old', 'one']) and __lesson_equal(second, ['old', 'two']))(append_note('one', source), append_note('two', source)))(['old']) and (lambda source: (lambda result: result is not source and __lesson_equal(source, []) and __lesson_equal(result, ['new']))(append_note('new', source)))([])"
      ]
    ],
    "cases": [
      [
        [
          "a"
        ],
        [
          "a"
        ]
      ],
      [
        [
          "b"
        ],
        [
          "b"
        ]
      ],
      [
        [
          "c",
          [
            "a"
          ]
        ],
        [
          "a",
          "c"
        ]
      ]
    ],
    "concept": "函数的默认值在定义时求值；默认可变列表会在调用间共享。用 None 表示缺省，再为每次结果创建列表。",
    "hint": "区分 notes is None 与传入的列表。",
    "boundary": "None 不是空列表本身，它只是这里约定的缺省标记。",
    "transfer": "给每次旅程创建独立日志，连续调用两次验证不会混入上次记录。",
    "chapter": 2,
    "islandId": "workshop",
    "reward": 20,
    "xp": 20,
    "reference": "AE26 semantic mapping: docs/ae26-map.md",
    "prerequisites": [],
    "releaseStatus": "implemented-local",
    "kind": "practice",
    "scene": {
      "district": "钟表工坊",
      "before": "组合出有清晰契约的航行设备",
      "after": "已修复：不会串单的便签。带着同一规则检查下一份输入。"
    },
    "review": {
      "intervalDays": [
        1,
        7,
        21
      ],
      "minimumUnassistedPasses": 2,
      "requiresDifferentContext": true,
      "status": "unobserved"
    },
    "hintLevels": [
      "函数的默认值在定义时求值；默认可变列表会在调用间共享。用 None 表示缺省，再为每次结果创建列表。",
      "区分 notes is None 与传入的列表。"
    ],
    "language": "python",
    "capability": "browser-restricted-python",
    "caseExpectedTypes": [
      "list",
      "list",
      "list"
    ]
  },
  {
    "id": "workshop-closure",
    "title": "可调节的打折器",
    "topic": "闭包 · 函数值",
    "description": "make_discount(percent) 返回一个函数，输入 price 后得到 price × (1-percent/100)。",
    "function": "make_discount",
    "starter": "def make_discount(percent):\n    # 在这里实现规则，再尝试不同输入\n    pass\n",
    "solution": "def make_discount(percent):\n    def apply(price):\n        return price * (1 - percent / 100)\n    return apply\n",
    "checks": [
      [
        "两种配置及多个输入",
        "make_discount(20)(100) == 80 and make_discount(50)(30) == 15 and make_discount(0)(7) == 7"
      ],
      [
        "零价格与100%折扣仍按原公式计算并保留各自配置",
        "__lesson_numeric(make_discount(100)(7),0) and __lesson_numeric(make_discount(100)(0),0) and __lesson_numeric(make_discount(25)(0),0) and __lesson_numeric(make_discount(0)(0),0) and (lambda a,b: __lesson_numeric(a(12.5),0) and __lesson_numeric(b(0),0) and __lesson_numeric(b(8),6) and __lesson_numeric(a(25),0))(make_discount(100),make_discount(25))"
      ]
    ],
    "cases": [],
    "concept": "返回的函数保存对外层 percent 的引用，让“配置一次、反复使用”成为可能。不同创建调用各有自己的参数。",
    "hint": "内层函数接受 price，外层 return 内层函数本身。",
    "boundary": "闭包捕获的是绑定关系，循环中创建闭包时要特别注意变量后续变化。",
    "transfer": "创建按不同汇率换算的函数，比较它与每次额外传入汇率的取舍。",
    "chapter": 2,
    "islandId": "workshop",
    "reward": 20,
    "xp": 20,
    "reference": "AE26 semantic mapping: docs/ae26-map.md",
    "prerequisites": [
      "workshop-defaults"
    ],
    "releaseStatus": "implemented-local",
    "kind": "practice",
    "scene": {
      "district": "钟表工坊",
      "before": "组合出有清晰契约的航行设备",
      "after": "已修复：可调节的打折器。带着同一规则检查下一份输入。"
    },
    "review": {
      "intervalDays": [
        1,
        7,
        21
      ],
      "minimumUnassistedPasses": 2,
      "requiresDifferentContext": true,
      "status": "unobserved"
    },
    "hintLevels": [
      "返回的函数保存对外层 percent 的引用，让“配置一次、反复使用”成为可能。不同创建调用各有自己的参数。",
      "内层函数接受 price，外层 return 内层函数本身。"
    ],
    "language": "python",
    "capability": "browser-restricted-python",
    "caseExpectedTypes": []
  },
  {
    "id": "workshop-composition",
    "title": "串起三个加工站",
    "topic": "高阶函数 · 组合",
    "description": "pipeline(value, operations) 依次调用每个函数，将上次输出交给下次；空列表返回原值。",
    "function": "pipeline",
    "starter": "def pipeline(value, operations):\n    # 在这里实现规则，再尝试不同输入\n    pass\n",
    "solution": "def pipeline(value, operations):\n    for operation in operations:\n        value = operation(value)\n    return value\n",
    "checks": [
      [
        "顺序不可倒置",
        "pipeline(3,[lambda x:x+2, lambda x:x*4]) == 20"
      ],
      [
        "空流程与文本",
        "pipeline(7,[]) == 7 and pipeline(\" X \",[lambda x:x.strip(), lambda x:x.lower()]) == \"x\""
      ]
    ],
    "cases": [],
    "concept": "每个加工站都有输入与输出。组合的条件是上一步的输出满足下一步的输入契约，顺序通常不可交换。",
    "hint": "循环更新 value，结束后返回。",
    "boundary": "失败时本题直接传播异常，不代表已经回滚前序外部操作。",
    "transfer": "用清理空白、转小写、加前缀三个文本函数检验先后顺序。",
    "chapter": 2,
    "islandId": "workshop",
    "reward": 20,
    "xp": 20,
    "reference": "AE26 semantic mapping: docs/ae26-map.md",
    "prerequisites": [
      "workshop-closure"
    ],
    "releaseStatus": "implemented-local",
    "kind": "practice",
    "scene": {
      "district": "钟表工坊",
      "before": "组合出有清晰契约的航行设备",
      "after": "已修复：串起三个加工站。带着同一规则检查下一份输入。"
    },
    "review": {
      "intervalDays": [
        1,
        7,
        21
      ],
      "minimumUnassistedPasses": 2,
      "requiresDifferentContext": true,
      "status": "unobserved"
    },
    "hintLevels": [
      "每个加工站都有输入与输出。组合的条件是上一步的输出满足下一步的输入契约，顺序通常不可交换。",
      "循环更新 value，结束后返回。"
    ],
    "language": "python",
    "capability": "browser-restricted-python",
    "caseExpectedTypes": []
  },
  {
    "id": "workshop-wallet",
    "title": "会拒绝透支的钱包",
    "topic": "类 · 实例状态",
    "description": "在函数外（模块顶层）定义 Wallet 类：Wallet(balance) 用传入余额初始化实例，wallet.balance 可读余额；wallet.pay(cost) 在金额非负且余额足够时扣款并返回 True，否则保持余额并返回 False。再实现 wallet_story(start, costs)：创建一个 Wallet，依次支付，返回 [最终余额, 成功布尔列表]。不同实例互不影响。",
    "function": "wallet_story",
    "starter": "class Wallet:\n    def __init__(self, balance):\n        self.balance = balance\n\n    def pay(self, cost):\n        # 按支付规则返回 True 或 False\n        pass\n\n\ndef wallet_story(start, costs):\n    # 创建一个 Wallet，依次调用 pay，收集每次支付结果\n    pass\n",
    "solution": "class Wallet:\n    def __init__(self, balance):\n        self.balance = balance\n    def pay(self, cost):\n        if cost < 0 or cost > self.balance:\n            return False\n        self.balance -= cost\n        return True\n\ndef wallet_story(start, costs):\n    wallet = Wallet(start)\n    results = [wallet.pay(cost) for cost in costs]\n    return [wallet.balance, results]\n",
    "checks": [
      [
        "场景 1：[10, [3, 8, 7]] → [0, [True, False, True]]",
        "__lesson_equal(wallet_story(10, [3, 8, 7]), [0, [True, False, True]])"
      ],
      [
        "场景 2：[0, [0, 1, -1]] → [0, [True, False, False]]",
        "__lesson_equal(wallet_story(0, [0, 1, -1]), [0, [True, False, False]])"
      ],
      [
        "场景 3：[5, []] → [5, []]",
        "__lesson_equal(wallet_story(5, []), [5, []])"
      ],
      [
        "Wallet 实例独立",
        "(lambda a,b: (a.pay(2),a.balance,b.balance)==(True,3,9))(Wallet(5),Wallet(9))"
      ]
    ],
    "cases": [
      [
        [
          10,
          [
            3,
            8,
            7
          ]
        ],
        [
          0,
          [
            true,
            false,
            true
          ]
        ]
      ],
      [
        [
          0,
          [
            0,
            1,
            -1
          ]
        ],
        [
          0,
          [
            true,
            false,
            false
          ]
        ]
      ],
      [
        [
          5,
          []
        ],
        [
          5,
          []
        ]
      ]
    ],
    "concept": "实例把余额与支付操作放在一起，支付方法维护“不透支”约定。self 指向这次调用所属的钱包。",
    "hint": "先检查金额，再扣余额；拒绝时保持原状态。",
    "boundary": "这是教学用整数钱包；不是安全支付系统，也没有持久化。",
    "transfer": "建立两个钱包，给一个扣费，确认另一个余额没有变化。",
    "chapter": 2,
    "islandId": "workshop",
    "reward": 20,
    "xp": 20,
    "reference": "AE26 semantic mapping: docs/ae26-map.md",
    "prerequisites": [
      "workshop-composition"
    ],
    "releaseStatus": "implemented-local",
    "kind": "practice",
    "scene": {
      "district": "钟表工坊",
      "before": "组合出有清晰契约的航行设备",
      "after": "已修复：会拒绝透支的钱包。带着同一规则检查下一份输入。"
    },
    "review": {
      "intervalDays": [
        1,
        7,
        21
      ],
      "minimumUnassistedPasses": 2,
      "requiresDifferentContext": true,
      "status": "unobserved"
    },
    "hintLevels": [
      "实例把余额与支付操作放在一起，支付方法维护“不透支”约定。self 指向这次调用所属的钱包。",
      "先检查金额，再扣余额；拒绝时保持原状态。"
    ],
    "language": "python",
    "capability": "browser-restricted-python",
    "caseExpectedTypes": [
      "list",
      "list",
      "list"
    ]
  },
  {
    "id": "workshop-iterable",
    "title": "只读一次的货流",
    "topic": "迭代器 · 单遍消费",
    "description": "sum_stream(stream) 返回每个整数的和。stream 可以是只能读一次的迭代器，不可以先消耗它来计算长度。",
    "function": "sum_stream",
    "starter": "def sum_stream(stream):\n    # 在这里实现规则，再尝试不同输入\n    pass\n",
    "solution": "def sum_stream(stream):\n    total = 0\n    for value in stream:\n        total += value\n    return total\n",
    "checks": [
      [
        "场景 1：[[1, 2, 3]] → 6",
        "__lesson_equal(sum_stream([1, 2, 3]), 6)"
      ],
      [
        "场景 2：[[]] → 0",
        "__lesson_equal(sum_stream([]), 0)"
      ],
      [
        "场景 3：[[-1, 1]] → 0",
        "__lesson_equal(sum_stream([-1, 1]), 0)"
      ],
      [
        "一次性迭代器",
        "sum_stream(iter([4,2,-1])) == 5 and sum_stream(iter([])) == 0"
      ],
      [
        "零是合法整数，不是结束信号；列表与一次性迭代器都继续求和",
        "all(__lesson_equal(sum_stream(iter(values)), expected) and __lesson_equal(sum_stream(values), expected) for values, expected in [([], 0), ([0], 0), ([0, 0, 0], 0), ([0, 3], 3), ([2, 0, 4], 6), ([-4, 0, 5], 1), ([2, -2, 0, 3], 3), ([1, 0, -1], 0), ([3, 0, 0, -8, 2], -3), ([1000000000000000000000000000000, 0, -1000000000000000000000000000000, 7], 7)])"
      ]
    ],
    "cases": [
      [
        [
          [
            1,
            2,
            3
          ]
        ],
        6
      ],
      [
        [
          []
        ],
        0
      ],
      [
        [
          [
            -1,
            1
          ]
        ],
        0
      ]
    ],
    "concept": "迭代器记住读取进度，走过的元素不会自动回到开头。一次循环同时计算结果，避免第二遍读空。",
    "hint": "直接遍历 stream 累加，或使用 sum。",
    "boundary": "列表可重复遍历，迭代器未必可以；输入抽象会改变算法可用性。",
    "transfer": "把整个文件的行换成按需读取的行流，保持单遍处理。",
    "chapter": 2,
    "islandId": "workshop",
    "reward": 20,
    "xp": 20,
    "reference": "AE26 semantic mapping: docs/ae26-map.md",
    "prerequisites": [
      "workshop-wallet"
    ],
    "releaseStatus": "implemented-local",
    "kind": "practice",
    "scene": {
      "district": "钟表工坊",
      "before": "组合出有清晰契约的航行设备",
      "after": "已修复：只读一次的货流。带着同一规则检查下一份输入。"
    },
    "review": {
      "intervalDays": [
        1,
        7,
        21
      ],
      "minimumUnassistedPasses": 2,
      "requiresDifferentContext": true,
      "status": "unobserved"
    },
    "hintLevels": [
      "迭代器记住读取进度，走过的元素不会自动回到开头。一次循环同时计算结果，避免第二遍读空。",
      "直接遍历 stream 累加，或使用 sum。"
    ],
    "language": "python",
    "capability": "browser-restricted-python",
    "caseExpectedTypes": [
      "int",
      "int",
      "int"
    ]
  },
  {
    "id": "workshop-result",
    "title": "把失败也变成契约",
    "topic": "异常边界 · 结果对象",
    "description": "parse_order(text) 接收「名字:数量」。名字去首尾空白且非空，数量可被int转换且大于0；格式或数据错误返回 {ok:False,error:\"invalid\"}，成功返回 {ok:True,item:名字,quantity:整数}。",
    "function": "parse_order",
    "starter": "def parse_order(text):\n    # 在这里实现规则，再尝试不同输入\n    pass\n",
    "solution": "def parse_order(text):\n    try:\n        name, raw = text.split(\":\")\n        name = name.strip()\n        qty = int(raw)\n        if not name or qty <= 0:\n            raise ValueError(\"invalid\")\n        return {\"ok\":True,\"item\":name,\"quantity\":qty}\n    except ValueError:\n        return {\"ok\":False,\"error\":\"invalid\"}\n",
    "checks": [
      [
        "场景 1：[' 鱼 : 2'] → {'ok': True, 'item': '鱼', 'quantity': 2}",
        "__lesson_equal(parse_order(' 鱼 : 2'), {'ok': True, 'item': '鱼', 'quantity': 2})"
      ],
      [
        "场景 2：['鱼:0'] → {'ok': False, 'error': 'invalid'}",
        "__lesson_equal(parse_order('鱼:0'), {'ok': False, 'error': 'invalid'})"
      ],
      [
        "场景 3：['鱼:2:3'] → {'ok': False, 'error': 'invalid'}",
        "__lesson_equal(parse_order('鱼:2:3'), {'ok': False, 'error': 'invalid'})"
      ],
      [
        "场景 4：[':2'] → {'ok': False, 'error': 'invalid'}",
        "__lesson_equal(parse_order(':2'), {'ok': False, 'error': 'invalid'})"
      ],
      [
        "场景 5：['bad'] → {'ok': False, 'error': 'invalid'}",
        "__lesson_equal(parse_order('bad'), {'ok': False, 'error': 'invalid'})"
      ],
      [
        "int转换失败须返回固定invalid结果，不抛异常或换成错误文本",
        "all(__lesson_equal(parse_order(text),{'ok':False,'error':'invalid'}) for text in ['fish:abc', 'fish:', 'fish: \\t', 'fish:2.0', 'fish:1e2', 'fish:0x10', 'fish:1__0', 'fish:++2', 'fish:²', 'fish:Ⅻ', 'fish:NaN', 'fish:Infinity'])"
      ],
      [
        "数量沿用int接受的Unicode十进制数字、合法符号分隔与空白",
        "all(__lesson_equal(parse_order(text),expected) for text,expected in [(' tea : １２ ', {'ok': True, 'item': 'tea', 'quantity': 12}), ('water:٣', {'ok': True, 'item': 'water', 'quantity': 3}), ('rope:+४', {'ok': True, 'item': 'rope', 'quantity': 4}), ('leaf:１_٢', {'ok': True, 'item': 'leaf', 'quantity': 12}), ('paper:\\xa0٥\\u2003', {'ok': True, 'item': 'paper', 'quantity': 5})])"
      ],
      [
        "名字仅去首尾空白，保留大小写与内部空白，Unicode空白名仍无效",
        "all(__lesson_equal(parse_order(text),expected) for text,expected in [('\\xa0 Tea \\u2003:2', {'ok': True, 'item': 'Tea', 'quantity': 2}), (' MiXeD :3', {'ok': True, 'item': 'MiXeD', 'quantity': 3}), (' Fish  Roe :4', {'ok': True, 'item': 'Fish  Roe', 'quantity': 4}), (' Name\\tTag \\t:5', {'ok': True, 'item': 'Name\\tTag', 'quantity': 5}), ('\\xa0\\u2003:2', {'ok': False, 'error': 'invalid'})])"
      ]
    ],
    "cases": [
      [
        [
          " 鱼 : 2"
        ],
        {
          "ok": true,
          "item": "鱼",
          "quantity": 2
        }
      ],
      [
        [
          "鱼:0"
        ],
        {
          "ok": false,
          "error": "invalid"
        }
      ],
      [
        [
          "鱼:2:3"
        ],
        {
          "ok": false,
          "error": "invalid"
        }
      ],
      [
        [
          ":2"
        ],
        {
          "ok": false,
          "error": "invalid"
        }
      ],
      [
        [
          "bad"
        ],
        {
          "ok": false,
          "error": "invalid"
        }
      ]
    ],
    "concept": "返回结构让调用者可以检查成功或失败。解析层只处理预期格式错误，不应把程序中所有异常吞掉。",
    "hint": "拆成两项，校验名字和数量；只捕获 ValueError。",
    "boundary": "这不是通用CSV解析；名字含冒号时必须另定编码规范。",
    "transfer": "把订单输入换成JSON，保持相同成功结果，并明确新的解析错误。",
    "chapter": 2,
    "islandId": "workshop",
    "reward": 20,
    "xp": 20,
    "reference": "AE26 semantic mapping: docs/ae26-map.md",
    "prerequisites": [
      "workshop-iterable"
    ],
    "releaseStatus": "implemented-local",
    "kind": "island-capstone-exercise",
    "scene": {
      "district": "钟表工坊",
      "before": "组合出有清晰契约的航行设备",
      "after": "已修复：把失败也变成契约。带着同一规则检查下一份输入。"
    },
    "review": {
      "intervalDays": [
        1,
        7,
        21
      ],
      "minimumUnassistedPasses": 2,
      "requiresDifferentContext": true,
      "status": "unobserved"
    },
    "hintLevels": [
      "返回结构让调用者可以检查成功或失败。解析层只处理预期格式错误，不应把程序中所有异常吞掉。",
      "拆成两项，校验名字和数量；只捕获 ValueError。"
    ],
    "language": "python",
    "capability": "browser-restricted-python",
    "caseExpectedTypes": [
      "dict",
      "dict",
      "dict",
      "dict",
      "dict"
    ]
  },
  {
    "id": "archive-json",
    "title": "把漂流瓶还原成订单",
    "topic": "JSON · 验证数据",
    "description": "payload 为JSON文本。解码出字典且只有 item(str非空)、qty(int非bool且>0) 两个键时返回该字典，否则返回 None。",
    "function": "decode_order",
    "starter": "def decode_order(payload):\n    # 在这里实现规则，再尝试不同输入\n    pass\n",
    "solution": "import json\ndef decode_order(payload):\n    try:\n        data = json.loads(payload)\n    except ValueError:\n        return None\n    if not isinstance(data, dict) or set(data) != {\"item\",\"qty\"}:\n        return None\n    if type(data[\"item\"]) is not str or not data[\"item\"] or type(data[\"qty\"]) is not int or data[\"qty\"] <= 0:\n        return None\n    return data\n",
    "checks": [
      [
        "场景 1：['{\"item\":\"鱼\",\"qty\":2}'] → {'item': '鱼', 'qty': 2}",
        "__lesson_equal(decode_order('{\"item\":\"鱼\",\"qty\":2}'), {'item': '鱼', 'qty': 2})"
      ],
      [
        "场景 2：['{\"qty\":5,\"item\":\"水\"}'] → {'qty': 5, 'item': '水'}",
        "__lesson_equal(decode_order('{\"qty\":5,\"item\":\"水\"}'), {'qty': 5, 'item': '水'})"
      ],
      [
        "场景 3：['[]'] → None",
        "__lesson_equal(decode_order('[]'), None)"
      ],
      [
        "场景 4：['{\"item\":\"鱼\",\"qty\":true}'] → None",
        "__lesson_equal(decode_order('{\"item\":\"鱼\",\"qty\":true}'), None)"
      ],
      [
        "场景 5：['{\"item\":\"鱼\",\"qty\":-1}'] → None",
        "__lesson_equal(decode_order('{\"item\":\"鱼\",\"qty\":-1}'), None)"
      ],
      [
        "场景 6：['oops'] → None",
        "__lesson_equal(decode_order('oops'), None)"
      ],
      [
        "场景 7：['{\"item\":\"鱼\",\"qty\":1,\"x\":0}'] → None",
        "__lesson_equal(decode_order('{\"item\":\"鱼\",\"qty\":1,\"x\":0}'), None)"
      ],
      [
        "JSON数量必须解码为int，小数或指数写法即使数值为整数也拒绝",
        "all(decode_order(payload) is None for payload in ['{\"item\":\"fish\",\"qty\":1.0}', '{\"item\":\"fish\",\"qty\":2.0}', '{\"item\":\"fish\",\"qty\":2e0}', '{\"item\":\"fish\",\"qty\":1E+2}', '{\"item\":\"fish\",\"qty\":0.0}', '{\"item\":\"fish\",\"qty\":-1.0}'])"
      ],
      [
        "非空字符串按解码原文返回，不擅自strip、改写或拒绝空白字符",
        "all(__lesson_equal(decode_order(payload),expected) for payload,expected in [('{\"item\": \" fish \", \"qty\": 2}', {'item': ' fish ', 'qty': 2}), ('{\"item\": \" \", \"qty\": 1}', {'item': ' ', 'qty': 1}), ('{\"item\": \"\\\\t\\\\n\", \"qty\": 3}', {'item': '\\t\\n', 'qty': 3}), ('{\"item\": \"海  图\", \"qty\": 4}', {'item': '海  图', 'qty': 4}), ('{\"item\": \"A\\\\\\\\B \\\\\"C\\\\\"\", \"qty\": 5}', {'item': 'A\\\\B \"C\"', 'qty': 5})])"
      ]
    ],
    "cases": [
      [
        [
          "{\"item\":\"鱼\",\"qty\":2}"
        ],
        {
          "item": "鱼",
          "qty": 2
        }
      ],
      [
        [
          "{\"qty\":5,\"item\":\"水\"}"
        ],
        {
          "qty": 5,
          "item": "水"
        }
      ],
      [
        [
          "[]"
        ],
        null
      ],
      [
        [
          "{\"item\":\"鱼\",\"qty\":true}"
        ],
        null
      ],
      [
        [
          "{\"item\":\"鱼\",\"qty\":-1}"
        ],
        null
      ],
      [
        [
          "oops"
        ],
        null
      ],
      [
        [
          "{\"item\":\"鱼\",\"qty\":1,\"x\":0}"
        ],
        null
      ]
    ],
    "concept": "JSON解码只恢复数据结构，不证明业务合法。Python 中 bool 是 int 的子类，所以严格数量字段用 type(...) is int。",
    "hint": "先 loads，再检查字典、键集合、每个值的类型与范围。",
    "boundary": "本题拒绝未知字段；版本升级时必须显式调整契约。",
    "transfer": "另一家商店交换字段顺序、加入新字段，判断何种变化应兼容。",
    "chapter": 3,
    "islandId": "archive",
    "reward": 20,
    "xp": 20,
    "reference": "AE26 semantic mapping: docs/ae26-map.md",
    "prerequisites": [],
    "releaseStatus": "implemented-local",
    "kind": "practice",
    "scene": {
      "district": "邮局与观测档案馆",
      "before": "清理、校验并汇总航海数据",
      "after": "已修复：把漂流瓶还原成订单。带着同一规则检查下一份输入。"
    },
    "review": {
      "intervalDays": [
        1,
        7,
        21
      ],
      "minimumUnassistedPasses": 2,
      "requiresDifferentContext": true,
      "status": "unobserved"
    },
    "hintLevels": [
      "JSON解码只恢复数据结构，不证明业务合法。Python 中 bool 是 int 的子类，所以严格数量字段用 type(...) is int。",
      "先 loads，再检查字典、键集合、每个值的类型与范围。"
    ],
    "language": "python",
    "capability": "browser-restricted-python",
    "caseExpectedTypes": [
      "dict",
      "dict",
      "NoneType",
      "NoneType",
      "NoneType",
      "NoneType",
      "NoneType"
    ]
  },
  {
    "id": "archive-regex",
    "title": "灯塔通行证",
    "topic": "正则 · 整体匹配",
    "description": "valid_pass(text) 检查是否严格为两个ASCII大写字母、短横线、四个ASCII数字，例如 AB-0123。返回 bool。",
    "function": "valid_pass",
    "starter": "def valid_pass(text):\n    # 在这里实现规则，再尝试不同输入\n    pass\n",
    "solution": "import re\ndef valid_pass(text):\n    return re.fullmatch(r\"[A-Z]{2}-[0-9]{4}\", text) is not None\n",
    "checks": [
      [
        "场景 1：['AB-0123'] → True",
        "__lesson_equal(valid_pass('AB-0123'), True)"
      ],
      [
        "场景 2：['aB-0123'] → False",
        "__lesson_equal(valid_pass('aB-0123'), False)"
      ],
      [
        "场景 3：['XAB-0123'] → False",
        "__lesson_equal(valid_pass('XAB-0123'), False)"
      ],
      [
        "场景 4：['AB-0123\\n'] → False",
        "__lesson_equal(valid_pass('AB-0123\\n'), False)"
      ],
      [
        "场景 5：['AB-１２３４'] → False",
        "__lesson_equal(valid_pass('AB-１２３４'), False)"
      ]
    ],
    "cases": [
      [
        [
          "AB-0123"
        ],
        true
      ],
      [
        [
          "aB-0123"
        ],
        false
      ],
      [
        [
          "XAB-0123"
        ],
        false
      ],
      [
        [
          "AB-0123\n"
        ],
        false
      ],
      [
        [
          "AB-１２３４"
        ],
        false
      ]
    ],
    "concept": "查找子串与验证整个字段不同。fullmatch要求整个输入都符合结构，ASCII范围也明确排除外形相似的其他数字。",
    "hint": "使用 fullmatch；[0-9] 比这里的 \\d 更贴合ASCII要求。",
    "boundary": "格式通过并不意味着通行证真实有效；真实性需要额外核验。",
    "transfer": "验证邮袋编号时分别列出语法规则与数据库存在性规则。",
    "chapter": 3,
    "islandId": "archive",
    "reward": 20,
    "xp": 20,
    "reference": "AE26 semantic mapping: docs/ae26-map.md",
    "prerequisites": [
      "archive-json"
    ],
    "releaseStatus": "implemented-local",
    "kind": "practice",
    "scene": {
      "district": "邮局与观测档案馆",
      "before": "清理、校验并汇总航海数据",
      "after": "已修复：灯塔通行证。带着同一规则检查下一份输入。"
    },
    "review": {
      "intervalDays": [
        1,
        7,
        21
      ],
      "minimumUnassistedPasses": 2,
      "requiresDifferentContext": true,
      "status": "unobserved"
    },
    "hintLevels": [
      "查找子串与验证整个字段不同。fullmatch要求整个输入都符合结构，ASCII范围也明确排除外形相似的其他数字。",
      "使用 fullmatch；[0-9] 比这里的 \\d 更贴合ASCII要求。"
    ],
    "language": "python",
    "capability": "browser-restricted-python",
    "caseExpectedTypes": [
      "bool",
      "bool",
      "bool",
      "bool",
      "bool"
    ]
  },
  {
    "id": "archive-counter",
    "title": "失散的货物",
    "topic": "Counter · 多重集合",
    "description": "expected 和 arrived 是字符串列表。返回缺少的每种物品及数量；多到的物品忽略，只有正数。",
    "function": "missing_cargo",
    "starter": "def missing_cargo(expected, arrived):\n    # 在这里实现规则，再尝试不同输入\n    pass\n",
    "solution": "from collections import Counter\ndef missing_cargo(expected, arrived):\n    return dict(Counter(expected) - Counter(arrived))\n",
    "checks": [
      [
        "场景 1：[['鱼', '鱼', '水'], ['鱼']] → {'鱼': 1, '水': 1}",
        "__lesson_equal(missing_cargo(['鱼', '鱼', '水'], ['鱼']), {'鱼': 1, '水': 1})"
      ],
      [
        "场景 2：[['水'], ['水', '水']] → {}",
        "__lesson_equal(missing_cargo(['水'], ['水', '水']), {})"
      ],
      [
        "场景 3：[[], []] → {}",
        "__lesson_equal(missing_cargo([], []), {})"
      ],
      [
        "重复货物分别缺 3 件和 2 件，多到及额外物品不列入缺口",
        "__lesson_equal(missing_cargo(['鱼','水','鱼','绳','鱼','水','鱼','水'], ['鱼','水','绳','绳','灯']), {'鱼':3,'水':2})"
      ],
      [
        "没有到货时保留每种物品的完整数量",
        "__lesson_equal(missing_cargo(['绳','灯','绳','绳'], []), {'绳':3,'灯':1})"
      ],
      [
        "没有预期货物时，额外到货不产生缺口",
        "__lesson_equal(missing_cargo([], ['灯','灯']), {})"
      ]
    ],
    "cases": [
      [
        [
          [
            "鱼",
            "鱼",
            "水"
          ],
          [
            "鱼"
          ]
        ],
        {
          "鱼": 1,
          "水": 1
        }
      ],
      [
        [
          [
            "水"
          ],
          [
            "水",
            "水"
          ]
        ],
        {}
      ],
      [
        [
          [],
          []
        ],
        {}
      ]
    ],
    "concept": "集合只回答有没有，Counter记录有几个。两个计数器相减可以找出重复货物的数量缺口。",
    "hint": "Counter(expected) - Counter(arrived)，再转 dict。",
    "boundary": "若需要保留负差额作盈亏账，Counter相减会丢掉这些项，应改用逐键计算。",
    "transfer": "盘点图书复本时区分书名集合与每本书的数量。",
    "chapter": 3,
    "islandId": "archive",
    "reward": 20,
    "xp": 20,
    "reference": "AE26 semantic mapping: docs/ae26-map.md",
    "prerequisites": [
      "archive-regex"
    ],
    "releaseStatus": "implemented-local",
    "kind": "practice",
    "scene": {
      "district": "邮局与观测档案馆",
      "before": "清理、校验并汇总航海数据",
      "after": "已修复：失散的货物。带着同一规则检查下一份输入。"
    },
    "review": {
      "intervalDays": [
        1,
        7,
        21
      ],
      "minimumUnassistedPasses": 2,
      "requiresDifferentContext": true,
      "status": "unobserved"
    },
    "hintLevels": [
      "集合只回答有没有，Counter记录有几个。两个计数器相减可以找出重复货物的数量缺口。",
      "Counter(expected) - Counter(arrived)，再转 dict。"
    ],
    "language": "python",
    "capability": "browser-restricted-python",
    "caseExpectedTypes": [
      "dict",
      "dict",
      "dict"
    ]
  },
  {
    "id": "archive-queue",
    "title": "按到达顺序救援",
    "topic": "deque · 队列",
    "description": "events 是字符串列表。其他字符串表示入队，! 表示处理最早的一人；空队列时忽略 !。返回 [已处理列表,等待列表]。",
    "function": "rescue",
    "starter": "def rescue(events):\n    # 在这里实现规则，再尝试不同输入\n    pass\n",
    "solution": "from collections import deque\ndef rescue(events):\n    queue = deque()\n    served = []\n    for event in events:\n        if event == \"!\":\n            if queue:\n                served.append(queue.popleft())\n        else:\n            queue.append(event)\n    return [served, list(queue)]\n",
    "checks": [
      [
        "场景 1：[['pipi', 'tang', '!']] → [['pipi'], ['tang']]",
        "__lesson_equal(rescue(['pipi', 'tang', '!']), [['pipi'], ['tang']])"
      ],
      [
        "场景 2：[['!', 'a', '!', '!']] → [['a'], []]",
        "__lesson_equal(rescue(['!', 'a', '!', '!']), [['a'], []])"
      ],
      [
        "场景 3：[[]] → [[], []]",
        "__lesson_equal(rescue([]), [[], []])"
      ]
    ],
    "cases": [
      [
        [
          [
            "pipi",
            "tang",
            "!"
          ]
        ],
        [
          [
            "pipi"
          ],
          [
            "tang"
          ]
        ]
      ],
      [
        [
          [
            "!",
            "a",
            "!",
            "!"
          ]
        ],
        [
          [
            "a"
          ],
          []
        ]
      ],
      [
        [
          []
        ],
        [
          [],
          []
        ]
      ]
    ],
    "concept": "队列从一端进入、另一端离开，表达先来先服务。deque 的 popleft 避免列表头部删除时搬动其余元素。",
    "hint": "append 入队，队列非空才 popleft。",
    "boundary": "紧急程度优先是另一种规则，需要优先队列，不能只靠到达顺序。",
    "transfer": "把救援换成打印任务，说明什么情况下先进先出不再合适。",
    "chapter": 3,
    "islandId": "archive",
    "reward": 20,
    "xp": 20,
    "reference": "AE26 semantic mapping: docs/ae26-map.md",
    "prerequisites": [
      "archive-counter"
    ],
    "releaseStatus": "implemented-local",
    "kind": "practice",
    "scene": {
      "district": "邮局与观测档案馆",
      "before": "清理、校验并汇总航海数据",
      "after": "已修复：按到达顺序救援。带着同一规则检查下一份输入。"
    },
    "review": {
      "intervalDays": [
        1,
        7,
        21
      ],
      "minimumUnassistedPasses": 2,
      "requiresDifferentContext": true,
      "status": "unobserved"
    },
    "hintLevels": [
      "队列从一端进入、另一端离开，表达先来先服务。deque 的 popleft 避免列表头部删除时搬动其余元素。",
      "append 入队，队列非空才 popleft。"
    ],
    "language": "python",
    "capability": "browser-restricted-python",
    "caseExpectedTypes": [
      "list",
      "list",
      "list"
    ]
  },
  {
    "id": "archive-median",
    "title": "坏传感器的读数",
    "topic": "statistics · 稳健汇总",
    "description": "readings 是数字或 None 的列表。忽略 None，返回剩余值的中位数；无有效值返回 None。偶数个值取中间两数的平均。",
    "function": "median_reading",
    "starter": "def median_reading(readings):\n    # 在这里实现规则，再尝试不同输入\n    pass\n",
    "solution": "import statistics\ndef median_reading(readings):\n    values = [x for x in readings if x is not None]\n    return statistics.median(values) if values else None\n",
    "checks": [
      [
        "场景 1：[[1, None, 2, 99]] → 2",
        "__lesson_equal(median_reading([1, None, 2, 99]), 2)"
      ],
      [
        "场景 2：[[0, None]] → 0",
        "__lesson_equal(median_reading([0, None]), 0)"
      ],
      [
        "场景 3：[[2, 4]] → 3.0",
        "__lesson_equal(median_reading([2, 4]), 3.0)"
      ],
      [
        "场景 4：[[None]] → None",
        "__lesson_equal(median_reading([None]), None)"
      ]
    ],
    "cases": [
      [
        [
          [
            1,
            null,
            2,
            99
          ]
        ],
        2
      ],
      [
        [
          [
            0,
            null
          ]
        ],
        0
      ],
      [
        [
          [
            2,
            4
          ]
        ],
        3.0
      ],
      [
        [
          [
            null
          ]
        ],
        null
      ]
    ],
    "concept": "缺失值None与零不同；先清理缺失值，再用中位数减少极端读数对中心位置的影响。",
    "hint": "过滤条件写 is not None，不写 if x。",
    "boundary": "中位数不会自动修复错误单位或系统偏差；仍需检查数据来源。",
    "transfer": "换成船只延误时间，比较平均值与中位数各自回答的问题。",
    "chapter": 3,
    "islandId": "archive",
    "reward": 20,
    "xp": 20,
    "reference": "AE26 semantic mapping: docs/ae26-map.md",
    "prerequisites": [
      "archive-queue"
    ],
    "releaseStatus": "implemented-local",
    "kind": "practice",
    "scene": {
      "district": "邮局与观测档案馆",
      "before": "清理、校验并汇总航海数据",
      "after": "已修复：坏传感器的读数。带着同一规则检查下一份输入。"
    },
    "review": {
      "intervalDays": [
        1,
        7,
        21
      ],
      "minimumUnassistedPasses": 2,
      "requiresDifferentContext": true,
      "status": "unobserved"
    },
    "hintLevels": [
      "缺失值None与零不同；先清理缺失值，再用中位数减少极端读数对中心位置的影响。",
      "过滤条件写 is not None，不写 if x。"
    ],
    "language": "python",
    "capability": "browser-restricted-python",
    "caseExpectedTypes": [
      "int",
      "int",
      "float",
      "NoneType"
    ]
  },
  {
    "id": "archive-distance",
    "title": "地图上的安全半径",
    "topic": "math · 几何",
    "description": "points 是 [x,y] 列表。返回距离原点不超过 radius 的点数；radius 非负，边界也计入。",
    "function": "within_radius",
    "starter": "def within_radius(points, radius):\n    # 在这里实现规则，再尝试不同输入\n    pass\n",
    "solution": "def within_radius(points, radius):\n    return sum(1 for x,y in points if x*x+y*y <= radius*radius)\n",
    "checks": [
      [
        "场景 1：[[[3, 4], [0, 0], [5, 1]], 5] → 2",
        "__lesson_equal(within_radius([[3, 4], [0, 0], [5, 1]], 5), 2)"
      ],
      [
        "场景 2：[[[0, 0], [1, 0]], 0] → 1",
        "__lesson_equal(within_radius([[0, 0], [1, 0]], 0), 1)"
      ],
      [
        "场景 3：[[], 8] → 0",
        "__lesson_equal(within_radius([], 8), 0)"
      ],
      [
        "场景 4：[[[1, 1]], 1] → 0",
        "__lesson_equal(within_radius([[1, 1]], 1), 0)"
      ]
    ],
    "cases": [
      [
        [
          [
            [
              3,
              4
            ],
            [
              0,
              0
            ],
            [
              5,
              1
            ]
          ],
          5
        ],
        2
      ],
      [
        [
          [
            [
              0,
              0
            ],
            [
              1,
              0
            ]
          ],
          0
        ],
        1
      ],
      [
        [
          [],
          8
        ],
        0
      ],
      [
        [
          [
            [
              1,
              1
            ]
          ],
          1
        ],
        0
      ]
    ],
    "concept": "平面直角坐标的距离平方是x²+y²。两边非负时比较平方就能避免开方，同时保留边界。",
    "hint": "比较 x*x + y*y 与 radius*radius。",
    "boundary": "这不是地球表面经纬度距离，不能直接用于长途航海导航。",
    "transfer": "检查仓库机器人是否在充电站范围内，再解释地图坐标的单位。",
    "chapter": 3,
    "islandId": "archive",
    "reward": 20,
    "xp": 20,
    "reference": "AE26 semantic mapping: docs/ae26-map.md",
    "prerequisites": [
      "archive-median"
    ],
    "releaseStatus": "implemented-local",
    "kind": "island-capstone-exercise",
    "scene": {
      "district": "邮局与观测档案馆",
      "before": "清理、校验并汇总航海数据",
      "after": "已修复：地图上的安全半径。带着同一规则检查下一份输入。"
    },
    "review": {
      "intervalDays": [
        1,
        7,
        21
      ],
      "minimumUnassistedPasses": 2,
      "requiresDifferentContext": true,
      "status": "unobserved"
    },
    "hintLevels": [
      "平面直角坐标的距离平方是x²+y²。两边非负时比较平方就能避免开方，同时保留边界。",
      "比较 x*x + y*y 与 radius*radius。"
    ],
    "language": "python",
    "capability": "browser-restricted-python",
    "caseExpectedTypes": [
      "int",
      "int",
      "int",
      "int"
    ]
  },
  {
    "id": "observatory-test-cases",
    "title": "找出伪装的检票员",
    "topic": "测试设计 · 变异检验",
    "description": "ticket_cases() 返回 [年龄,期望票价] 对列表。规则：小于6岁0，6至17岁10，18岁起20。用样例同时抓住边界、所有人同价和漏掉成人分支等错误实现。",
    "function": "ticket_cases",
    "starter": "def ticket_cases():\n    # 在这里实现规则，再尝试不同输入\n    pass\n",
    "solution": "def ticket_cases():\n    return [[0,0],[5,0],[6,10],[17,10],[18,20],[30,20]]\n",
    "checks": [
      [
        "期望值合法且覆盖四个边界",
        "all(type(a) is int and a>=0 and type(e) is int and e==(0 if a<6 else 10 if a<18 else 20) for a,e in ticket_cases()) and all(any(a==b for a,e in ticket_cases()) for b in (5,6,17,18))"
      ],
      [
        "正确实现通过",
        "all(e==(0 if a<6 else 10 if a<18 else 20) for a,e in ticket_cases())"
      ],
      [
        "拒绝六种错误规则",
        "all(any(e!=f(a) for a,e in ticket_cases()) for f in [lambda a:10,lambda a:0 if a<=6 else 10 if a<18 else 20,lambda a:0 if a<6 else 10 if a<=18 else 20,lambda a:0 if a<6 else 10,lambda a:20,lambda a:0])"
      ]
    ],
    "cases": [],
    "concept": "测试用例必须既接受正确实现，也能拒绝常见错误。只测8岁无法区分小于6与小于等于6。",
    "hint": "覆盖5、6、17、18和正常成人；期望值按规则手算。",
    "boundary": "抓住这些变异不代表所有错误都被覆盖；测试仍需依据需求持续增加。",
    "transfer": "将阈值改为按重量收费，重新挑选边界；不要机械复制原输入。",
    "chapter": 4,
    "islandId": "observatory",
    "reward": 20,
    "xp": 20,
    "reference": "AE26 semantic mapping: docs/ae26-map.md",
    "prerequisites": [],
    "releaseStatus": "implemented-local",
    "kind": "practice",
    "scene": {
      "district": "试航场与观星台",
      "before": "找出错误，证明修复，量出代价",
      "after": "已修复：找出伪装的检票员。带着同一规则检查下一份输入。"
    },
    "review": {
      "intervalDays": [
        1,
        7,
        21
      ],
      "minimumUnassistedPasses": 2,
      "requiresDifferentContext": true,
      "status": "unobserved"
    },
    "hintLevels": [
      "测试用例必须既接受正确实现，也能拒绝常见错误。只测8岁无法区分小于6与小于等于6。",
      "覆盖5、6、17、18和正常成人；期望值按规则手算。"
    ],
    "language": "python",
    "capability": "browser-restricted-python",
    "caseExpectedTypes": []
  },
  {
    "id": "observatory-binary",
    "title": "同名货箱的第一箱",
    "topic": "二分查找 · 循环不变量",
    "description": "用二分返回 target 在升序整数序列中的最左插入索引；等值时放在所有等值元素之前。2048项测试最多读取16个数值，避免逐项扫描。",
    "function": "lower_bound",
    "starter": "def lower_bound(sorted_values, target):\n    # 在这里实现规则，再尝试不同输入\n    pass\n",
    "solution": "def lower_bound(sorted_values, target):\n    lo, hi = 0, len(sorted_values)\n    while lo < hi:\n        mid = (lo + hi) // 2\n        if sorted_values[mid] < target:\n            lo = mid + 1\n        else:\n            hi = mid\n    return lo\n",
    "checks": [
      [
        "场景 1：[[1, 2, 2, 4], 2] → 1",
        "__lesson_equal(lower_bound([1, 2, 2, 4], 2), 1)"
      ],
      [
        "场景 2：[[], 4] → 0",
        "__lesson_equal(lower_bound([], 4), 0)"
      ],
      [
        "场景 3：[[1, 3], 4] → 2",
        "__lesson_equal(lower_bound([1, 3], 4), 2)"
      ],
      [
        "场景 4：[[2, 2], 1] → 0",
        "__lesson_equal(lower_bound([2, 2], 1), 0)"
      ],
      [
        "场景 5：[[1, 3, 5], 4] → 2",
        "__lesson_equal(lower_bound([1, 3, 5], 4), 2)"
      ],
      [
        "2048项最多16次数值读取",
        "__lesson_log_search(lower_bound)"
      ]
    ],
    "cases": [
      [
        [
          [
            1,
            2,
            2,
            4
          ],
          2
        ],
        1
      ],
      [
        [
          [],
          4
        ],
        0
      ],
      [
        [
          [
            1,
            3
          ],
          4
        ],
        2
      ],
      [
        [
          [
            2,
            2
          ],
          1
        ],
        0
      ],
      [
        [
          [
            1,
            3,
            5
          ],
          4
        ],
        2
      ]
    ],
    "concept": "保留半开区间[lo,hi)，左侧都小于目标，右侧都不小于。遇到相等继续收缩右边，才能找到第一次出现的位置。",
    "hint": "循环条件lo<hi；相等时hi=mid。",
    "boundary": "二分依赖排序。无序输入不能据一次比较排除半边。2048项检查提供只读序列，支持len、索引和切片；切片按返回元素数量计入16次数值读取预算，不提供列表专属方法。",
    "transfer": "改成最后一个不大于目标的位置，重新写出区间不变量。",
    "chapter": 4,
    "islandId": "observatory",
    "reward": 20,
    "xp": 20,
    "reference": "AE26 semantic mapping: docs/ae26-map.md",
    "prerequisites": [
      "observatory-test-cases"
    ],
    "releaseStatus": "implemented-local",
    "kind": "practice",
    "scene": {
      "district": "试航场与观星台",
      "before": "找出错误，证明修复，量出代价",
      "after": "已修复：同名货箱的第一箱。带着同一规则检查下一份输入。"
    },
    "review": {
      "intervalDays": [
        1,
        7,
        21
      ],
      "minimumUnassistedPasses": 2,
      "requiresDifferentContext": true,
      "status": "unobserved"
    },
    "hintLevels": [
      "保留半开区间[lo,hi)，左侧都小于目标，右侧都不小于。遇到相等继续收缩右边，才能找到第一次出现的位置。",
      "循环条件lo<hi；相等时hi=mid。"
    ],
    "language": "python",
    "capability": "browser-restricted-python",
    "caseExpectedTypes": [
      "int",
      "int",
      "int",
      "int",
      "int"
    ]
  },
  {
    "id": "observatory-prefix",
    "title": "每天都问前几天赚多少",
    "topic": "前缀和 · 重复查询",
    "description": "build_prefix(values) 返回以0开头的累计和列表，后续区间[l,r)的和即可用 prefix[r]-prefix[l]。",
    "function": "build_prefix",
    "starter": "def build_prefix(values):\n    # 在这里实现规则，再尝试不同输入\n    pass\n",
    "solution": "def build_prefix(values):\n    result=[0]\n    for value in values:\n        result.append(result[-1]+value)\n    return result\n",
    "checks": [
      [
        "场景 1：[[3, -2, 5]] → [0, 3, 1, 6]",
        "__lesson_equal(build_prefix([3, -2, 5]), [0, 3, 1, 6])"
      ],
      [
        "场景 2：[[]] → [0]",
        "__lesson_equal(build_prefix([]), [0])"
      ],
      [
        "场景 3：[[0, 0]] → [0, 0, 0]",
        "__lesson_equal(build_prefix([0, 0]), [0, 0, 0])"
      ]
    ],
    "cases": [
      [
        [
          [
            3,
            -2,
            5
          ]
        ],
        [
          0,
          3,
          1,
          6
        ]
      ],
      [
        [
          []
        ],
        [
          0
        ]
      ],
      [
        [
          [
            0,
            0
          ]
        ],
        [
          0,
          0,
          0
        ]
      ]
    ],
    "concept": "一次预处理保留每个前缀的总量，区间和是两个前缀之差。这样把多次重复求和变成常数次取值。",
    "hint": "结果从0开始，每一步在最后一项上加新值。",
    "boundary": "频繁修改原数据会让旧前缀过期；不能不更新就继续查询。",
    "transfer": "比较只有一次查询和一万次查询时，预处理的成本是否值得。",
    "chapter": 4,
    "islandId": "observatory",
    "reward": 20,
    "xp": 20,
    "reference": "AE26 semantic mapping: docs/ae26-map.md",
    "prerequisites": [
      "observatory-binary"
    ],
    "releaseStatus": "implemented-local",
    "kind": "practice",
    "scene": {
      "district": "试航场与观星台",
      "before": "找出错误，证明修复，量出代价",
      "after": "已修复：每天都问前几天赚多少。带着同一规则检查下一份输入。"
    },
    "review": {
      "intervalDays": [
        1,
        7,
        21
      ],
      "minimumUnassistedPasses": 2,
      "requiresDifferentContext": true,
      "status": "unobserved"
    },
    "hintLevels": [
      "一次预处理保留每个前缀的总量，区间和是两个前缀之差。这样把多次重复求和变成常数次取值。",
      "结果从0开始，每一步在最后一项上加新值。"
    ],
    "language": "python",
    "capability": "browser-restricted-python",
    "caseExpectedTypes": [
      "list",
      "list",
      "list"
    ]
  },
  {
    "id": "observatory-cache",
    "title": "过期的海况公告",
    "topic": "缓存键 · 失效",
    "description": "cache_key(user, version, query) 返回三元素 tuple，query去首尾空白。用户或数据版本不同必须得到不同键。",
    "function": "cache_key",
    "starter": "def cache_key(user, version, query):\n    # 在这里实现规则，再尝试不同输入\n    pass\n",
    "solution": "def cache_key(user, version, query):\n    return (user, version, query.strip())\n",
    "checks": [
      [
        "场景 1：['p', 1, ' tide '] → ('p', 1, 'tide')",
        "__lesson_equal(cache_key('p', 1, ' tide '), ('p', 1, 'tide'))"
      ],
      [
        "场景 2：['t', 1, 'tide'] → ('t', 1, 'tide')",
        "__lesson_equal(cache_key('t', 1, 'tide'), ('t', 1, 'tide'))"
      ],
      [
        "场景 3：['p', 2, 'tide'] → ('p', 2, 'tide')",
        "__lesson_equal(cache_key('p', 2, 'tide'), ('p', 2, 'tide'))"
      ]
    ],
    "cases": [
      [
        [
          "p",
          1,
          " tide "
        ],
        [
          "p",
          1,
          "tide"
        ]
      ],
      [
        [
          "t",
          1,
          "tide"
        ],
        [
          "t",
          1,
          "tide"
        ]
      ],
      [
        [
          "p",
          2,
          "tide"
        ],
        [
          "p",
          2,
          "tide"
        ]
      ]
    ],
    "concept": "缓存键代表“什么情况下答案可以复用”。忽略用户可能串读权限，忽略版本可能复用过期内容。",
    "hint": "保留user和version，只规范query首尾空白。",
    "boundary": "这个键并没有实现缓存存储、TTL、并发或授权校验。",
    "transfer": "同一问句在不同文档版本下答案变化，解释何时该使缓存失效。",
    "chapter": 4,
    "islandId": "observatory",
    "reward": 20,
    "xp": 20,
    "reference": "AE26 semantic mapping: docs/ae26-map.md",
    "prerequisites": [
      "observatory-prefix"
    ],
    "releaseStatus": "implemented-local",
    "kind": "practice",
    "scene": {
      "district": "试航场与观星台",
      "before": "找出错误，证明修复，量出代价",
      "after": "已修复：过期的海况公告。带着同一规则检查下一份输入。"
    },
    "review": {
      "intervalDays": [
        1,
        7,
        21
      ],
      "minimumUnassistedPasses": 2,
      "requiresDifferentContext": true,
      "status": "unobserved"
    },
    "hintLevels": [
      "缓存键代表“什么情况下答案可以复用”。忽略用户可能串读权限，忽略版本可能复用过期内容。",
      "保留user和version，只规范query首尾空白。"
    ],
    "language": "python",
    "capability": "browser-restricted-python",
    "caseExpectedTypes": [
      "tuple",
      "tuple",
      "tuple"
    ]
  },
  {
    "id": "observatory-replay",
    "title": "把航行记录重新走一遍",
    "topic": "事件重放 · 状态机",
    "description": "replay(start, events) 接收整数增量列表。只有新余额不为负才接受该事件，返回 [最终余额,被拒绝的索引列表]。",
    "function": "replay",
    "starter": "def replay(start, events):\n    # 在这里实现规则，再尝试不同输入\n    pass\n",
    "solution": "def replay(start, events):\n    rejected=[]\n    for i,delta in enumerate(events):\n        if start+delta < 0:\n            rejected.append(i)\n        else:\n            start += delta\n    return [start,rejected]\n",
    "checks": [
      [
        "场景 1：[3, [-4, 2, -5]] → [0, [0]]",
        "__lesson_equal(replay(3, [-4, 2, -5]), [0, [0]])"
      ],
      [
        "场景 2：[0, [0, -1, 2]] → [2, [1]]",
        "__lesson_equal(replay(0, [0, -1, 2]), [2, [1]])"
      ],
      [
        "场景 3：[4, []] → [4, []]",
        "__lesson_equal(replay(4, []), [4, []])"
      ]
    ],
    "cases": [
      [
        [
          3,
          [
            -4,
            2,
            -5
          ]
        ],
        [
          0,
          [
            0
          ]
        ]
      ],
      [
        [
          0,
          [
            0,
            -1,
            2
          ]
        ],
        [
          2,
          [
            1
          ]
        ]
      ],
      [
        [
          4,
          []
        ],
        [
          4,
          []
        ]
      ]
    ],
    "concept": "固定初始状态与事件序列后，纯规则应产生相同结果。记录被拒事件的位置，才能复盘为什么余额没有改变。",
    "hint": "先计算候选余额，再决定接受或记录拒绝。",
    "boundary": "重放不能重复发出真实支付；此处只计算纯内存状态。",
    "transfer": "把存档恢复与事件重放比较，指出外部副作用需要单独去重。",
    "chapter": 4,
    "islandId": "observatory",
    "reward": 20,
    "xp": 20,
    "reference": "AE26 semantic mapping: docs/ae26-map.md",
    "prerequisites": [
      "observatory-cache"
    ],
    "releaseStatus": "implemented-local",
    "kind": "practice",
    "scene": {
      "district": "试航场与观星台",
      "before": "找出错误，证明修复，量出代价",
      "after": "已修复：把航行记录重新走一遍。带着同一规则检查下一份输入。"
    },
    "review": {
      "intervalDays": [
        1,
        7,
        21
      ],
      "minimumUnassistedPasses": 2,
      "requiresDifferentContext": true,
      "status": "unobserved"
    },
    "hintLevels": [
      "固定初始状态与事件序列后，纯规则应产生相同结果。记录被拒事件的位置，才能复盘为什么余额没有改变。",
      "先计算候选余额，再决定接受或记录拒绝。"
    ],
    "language": "python",
    "capability": "browser-restricted-python",
    "caseExpectedTypes": [
      "list",
      "list",
      "list"
    ]
  },
  {
    "id": "observatory-diagnose",
    "title": "给失败一个可行动的名字",
    "topic": "异常分类 · 调试反馈",
    "description": "classify(error) 输入含kind与可选retry_after的字典。timeout→retry；rate_limit且retry_after正整数→wait；permission→ask；其余→inspect。",
    "function": "classify",
    "starter": "def classify(error):\n    # 在这里实现规则，再尝试不同输入\n    pass\n",
    "solution": "def classify(error):\n    kind=error.get(\"kind\")\n    if kind==\"timeout\":\n        return \"retry\"\n    if kind==\"rate_limit\" and type(error.get(\"retry_after\")) is int and error[\"retry_after\"]>0:\n        return \"wait\"\n    if kind==\"permission\":\n        return \"ask\"\n    return \"inspect\"\n",
    "checks": [
      [
        "场景 1：[{'kind': 'timeout'}] → 'retry'",
        "__lesson_equal(classify({'kind': 'timeout'}), 'retry')"
      ],
      [
        "场景 2：[{'kind': 'permission'}] → 'ask'",
        "__lesson_equal(classify({'kind': 'permission'}), 'ask')"
      ],
      [
        "场景 3：[{'kind': 'rate_limit', 'retry_after': 3}] → 'wait'",
        "__lesson_equal(classify({'kind': 'rate_limit', 'retry_after': 3}), 'wait')"
      ],
      [
        "场景 4：[{'kind': 'rate_limit', 'retry_after': True}] → 'inspect'",
        "__lesson_equal(classify({'kind': 'rate_limit', 'retry_after': True}), 'inspect')"
      ],
      [
        "场景 5：[{}] → 'inspect'",
        "__lesson_equal(classify({}), 'inspect')"
      ]
    ],
    "cases": [
      [
        [
          {
            "kind": "timeout"
          }
        ],
        "retry"
      ],
      [
        [
          {
            "kind": "permission"
          }
        ],
        "ask"
      ],
      [
        [
          {
            "kind": "rate_limit",
            "retry_after": 3
          }
        ],
        "wait"
      ],
      [
        [
          {
            "kind": "rate_limit",
            "retry_after": true
          }
        ],
        "inspect"
      ],
      [
        [
          {}
        ],
        "inspect"
      ]
    ],
    "concept": "错误类型应决定下一步行动。盲目重试权限错误不会增加授权，未知错误需要先观察证据。",
    "hint": "分别处理明确类型；未知值保留inspect。",
    "boundary": "本题只是分类函数，实际重试还要次数上限、幂等与取消。",
    "transfer": "换成文件读取错误，区分不存在、无权限与暂时不可用。",
    "chapter": 4,
    "islandId": "observatory",
    "reward": 20,
    "xp": 20,
    "reference": "AE26 semantic mapping: docs/ae26-map.md",
    "prerequisites": [
      "observatory-replay"
    ],
    "releaseStatus": "implemented-local",
    "kind": "island-capstone-exercise",
    "scene": {
      "district": "试航场与观星台",
      "before": "找出错误，证明修复，量出代价",
      "after": "已修复：给失败一个可行动的名字。带着同一规则检查下一份输入。"
    },
    "review": {
      "intervalDays": [
        1,
        7,
        21
      ],
      "minimumUnassistedPasses": 2,
      "requiresDifferentContext": true,
      "status": "unobserved"
    },
    "hintLevels": [
      "错误类型应决定下一步行动。盲目重试权限错误不会增加授权，未知错误需要先观察证据。",
      "分别处理明确类型；未知值保留inspect。"
    ],
    "language": "python",
    "capability": "browser-restricted-python",
    "caseExpectedTypes": [
      "str",
      "str",
      "str",
      "str",
      "str"
    ]
  },
  {
    "id": "beacon-schema",
    "title": "工具门口的登记台",
    "topic": "工具输入 · 严格契约",
    "description": "valid_move(args) 只接受字典且恰好含 steps 一个键，值严格为1至6的int，bool不算。",
    "function": "valid_move",
    "starter": "def valid_move(args):\n    # 在这里实现规则，再尝试不同输入\n    pass\n",
    "solution": "def valid_move(args):\n    return type(args) is dict and set(args)=={\"steps\"} and type(args[\"steps\"]) is int and 1<=args[\"steps\"]<=6\n",
    "checks": [
      [
        "场景 1：[{'steps': 3}] → True",
        "__lesson_equal(valid_move({'steps': 3}), True)"
      ],
      [
        "场景 2：[{'steps': True}] → False",
        "__lesson_equal(valid_move({'steps': True}), False)"
      ],
      [
        "场景 3：[{'steps': 0}] → False",
        "__lesson_equal(valid_move({'steps': 0}), False)"
      ],
      [
        "场景 4：[{'steps': 7}] → False",
        "__lesson_equal(valid_move({'steps': 7}), False)"
      ],
      [
        "场景 5：[{'steps': 2, 'admin': True}] → False",
        "__lesson_equal(valid_move({'steps': 2, 'admin': True}), False)"
      ],
      [
        "场景 6：[[]] → False",
        "__lesson_equal(valid_move([]), False)"
      ]
    ],
    "cases": [
      [
        [
          {
            "steps": 3
          }
        ],
        true
      ],
      [
        [
          {
            "steps": true
          }
        ],
        false
      ],
      [
        [
          {
            "steps": 0
          }
        ],
        false
      ],
      [
        [
          {
            "steps": 7
          }
        ],
        false
      ],
      [
        [
          {
            "steps": 2,
            "admin": true
          }
        ],
        false
      ],
      [
        [
          []
        ],
        false
      ]
    ],
    "concept": "工具调用前要验证形状、类型和范围。缺省信任额外字段会让调用的实际含义超出原合同。",
    "hint": "先字典，再键集合，再严格类型，再范围。",
    "boundary": "合法输入不代表有权执行；授权在下一关单独检查。",
    "transfer": "设计购买工具的输入契约，同时列出未知字段和类型混淆反例。",
    "chapter": 5,
    "islandId": "beacon",
    "reward": 20,
    "xp": 20,
    "reference": "AE26 semantic mapping: docs/ae26-map.md",
    "prerequisites": [],
    "releaseStatus": "implemented-local",
    "kind": "practice",
    "scene": {
      "district": "航路调度台",
      "before": "为离线工具代理建立输入、授权、证据和预算合同",
      "after": "已修复：工具门口的登记台。带着同一规则检查下一份输入。"
    },
    "review": {
      "intervalDays": [
        1,
        7,
        21
      ],
      "minimumUnassistedPasses": 2,
      "requiresDifferentContext": true,
      "status": "unobserved"
    },
    "hintLevels": [
      "工具调用前要验证形状、类型和范围。缺省信任额外字段会让调用的实际含义超出原合同。",
      "先字典，再键集合，再严格类型，再范围。"
    ],
    "language": "python",
    "capability": "browser-restricted-python",
    "caseExpectedTypes": [
      "bool",
      "bool",
      "bool",
      "bool",
      "bool",
      "bool"
    ]
  },
  {
    "id": "beacon-permission",
    "title": "一次授权的一次航行",
    "topic": "授权 · 绑定与期限",
    "description": "authorized(grant, actor, action, args, now) 检查grant中actor/action/args都精确匹配，used为False且now<expires；缺字段拒绝。args是普通JSON字典，expires/now为整数。返回bool，不修改grant。",
    "function": "authorized",
    "starter": "def authorized(grant, actor, action, args, now):\n    # 在这里实现规则，再尝试不同输入\n    pass\n",
    "solution": "import json\ndef authorized(grant,actor,action,args,now):\n    required={\"actor\",\"action\",\"args\",\"expires\",\"used\"}\n    return type(grant) is dict and required <= set(grant) and grant[\"actor\"]==actor and grant[\"action\"]==action and json.dumps(grant[\"args\"],sort_keys=True)==json.dumps(args,sort_keys=True) and grant[\"used\"] is False and type(grant[\"expires\"]) is int and now < grant[\"expires\"]\n",
    "checks": [
      [
        "场景 1：[{'actor': 'p', 'action': 'buy', 'args': {'qty': 1}, 'expires': 20, 'used': False}, 'p', 'buy', {'qty': 1}, 19] → True",
        "__lesson_equal(authorized({'actor': 'p', 'action': 'buy', 'args': {'qty': 1}, 'expires': 20, 'used': False}, 'p', 'buy', {'qty': 1}, 19), True)"
      ],
      [
        "场景 2：[{'actor': 'p', 'action': 'buy', 'args': {'qty': 1}, 'expires': 20, 'used': False}, 'p', 'buy', {'qty': 2}, 19] → False",
        "__lesson_equal(authorized({'actor': 'p', 'action': 'buy', 'args': {'qty': 1}, 'expires': 20, 'used': False}, 'p', 'buy', {'qty': 2}, 19), False)"
      ],
      [
        "场景 3：[{'actor': 'p', 'action': 'buy', 'args': {}, 'expires': 20, 'used': False}, 't', 'buy', {}, 19] → False",
        "__lesson_equal(authorized({'actor': 'p', 'action': 'buy', 'args': {}, 'expires': 20, 'used': False}, 't', 'buy', {}, 19), False)"
      ],
      [
        "场景 4：[{'actor': 'p', 'action': 'buy', 'args': {}, 'expires': 20, 'used': False}, 'p', 'buy', {}, 20] → False",
        "__lesson_equal(authorized({'actor': 'p', 'action': 'buy', 'args': {}, 'expires': 20, 'used': False}, 'p', 'buy', {}, 20), False)"
      ],
      [
        "场景 5：[{'actor': 'p', 'action': 'buy', 'args': {}, 'expires': 20, 'used': True}, 'p', 'buy', {}, 19] → False",
        "__lesson_equal(authorized({'actor': 'p', 'action': 'buy', 'args': {}, 'expires': 20, 'used': True}, 'p', 'buy', {}, 19), False)"
      ],
      [
        "场景 6：[{}, 'p', 'buy', {}, 0] → False",
        "__lesson_equal(authorized({}, 'p', 'buy', {}, 0), False)"
      ],
      [
        "布尔参数不能冒充整数数量",
        "authorized({\"actor\":\"p\",\"action\":\"buy\",\"args\":{\"qty\":1},\"expires\":10,\"used\":False},\"p\",\"buy\",{\"qty\":True},0) is False"
      ],
      [
        "相同参数不同键序仍匹配",
        "authorized({\"actor\":\"p\",\"action\":\"buy\",\"args\":{\"qty\":1,\"item\":\"fish\"},\"expires\":10,\"used\":False},\"p\",\"buy\",{\"item\":\"fish\",\"qty\":1},0) is True"
      ]
    ],
    "cases": [
      [
        [
          {
            "actor": "p",
            "action": "buy",
            "args": {
              "qty": 1
            },
            "expires": 20,
            "used": false
          },
          "p",
          "buy",
          {
            "qty": 1
          },
          19
        ],
        true
      ],
      [
        [
          {
            "actor": "p",
            "action": "buy",
            "args": {
              "qty": 1
            },
            "expires": 20,
            "used": false
          },
          "p",
          "buy",
          {
            "qty": 2
          },
          19
        ],
        false
      ],
      [
        [
          {
            "actor": "p",
            "action": "buy",
            "args": {},
            "expires": 20,
            "used": false
          },
          "t",
          "buy",
          {},
          19
        ],
        false
      ],
      [
        [
          {
            "actor": "p",
            "action": "buy",
            "args": {},
            "expires": 20,
            "used": false
          },
          "p",
          "buy",
          {},
          20
        ],
        false
      ],
      [
        [
          {
            "actor": "p",
            "action": "buy",
            "args": {},
            "expires": 20,
            "used": true
          },
          "p",
          "buy",
          {},
          19
        ],
        false
      ],
      [
        [
          {},
          "p",
          "buy",
          {},
          0
        ],
        false
      ]
    ],
    "concept": "授权必须对应具体主体、动作、参数和有效时间。只比较动作名称会把一次小额购买扩成任意购买。",
    "hint": "逐项匹配；期限相等时已过期；used必须是False。",
    "boundary": "本题是纯检查；未实现防篡改签名、原子消费、真实身份或并发授权。",
    "transfer": "把数量1改为数量2，应重新请求授权；说明为什么同名工具不够。",
    "chapter": 5,
    "islandId": "beacon",
    "reward": 20,
    "xp": 20,
    "reference": "AE26 semantic mapping: docs/ae26-map.md",
    "prerequisites": [
      "beacon-schema"
    ],
    "releaseStatus": "implemented-local",
    "kind": "practice",
    "scene": {
      "district": "航路调度台",
      "before": "为离线工具代理建立输入、授权、证据和预算合同",
      "after": "已修复：一次授权的一次航行。带着同一规则检查下一份输入。"
    },
    "review": {
      "intervalDays": [
        1,
        7,
        21
      ],
      "minimumUnassistedPasses": 2,
      "requiresDifferentContext": true,
      "status": "unobserved"
    },
    "hintLevels": [
      "授权必须对应具体主体、动作、参数和有效时间。只比较动作名称会把一次小额购买扩成任意购买。",
      "逐项匹配；期限相等时已过期；used必须是False。"
    ],
    "language": "python",
    "capability": "browser-restricted-python",
    "caseExpectedTypes": [
      "bool",
      "bool",
      "bool",
      "bool",
      "bool",
      "bool"
    ]
  },
  {
    "id": "beacon-idempotency",
    "title": "别把同一箱货付两次",
    "topic": "幂等 · 冲突识别",
    "description": "decide_receipt(receipts,key,payload) 返回 new/replay/conflict。key不存在为new，存在且保存payload相等为replay，否则conflict。不得修改receipts。",
    "function": "decide_receipt",
    "starter": "def decide_receipt(receipts, key, payload):\n    # 在这里实现规则，再尝试不同输入\n    pass\n",
    "solution": "import json\ndef decide_receipt(receipts,key,payload):\n    if key not in receipts:\n        return \"new\"\n    return \"replay\" if json.dumps(receipts[key],sort_keys=True)==json.dumps(payload,sort_keys=True) else \"conflict\"\n",
    "checks": [
      [
        "场景 1：[{}, 'a', {'qty': 1}] → 'new'",
        "__lesson_equal(decide_receipt({}, 'a', {'qty': 1}), 'new')"
      ],
      [
        "场景 2：[{'a': {'qty': 1}}, 'a', {'qty': 1}] → 'replay'",
        "__lesson_equal(decide_receipt({'a': {'qty': 1}}, 'a', {'qty': 1}), 'replay')"
      ],
      [
        "场景 3：[{'a': {'qty': 1}}, 'a', {'qty': 2}] → 'conflict'",
        "__lesson_equal(decide_receipt({'a': {'qty': 1}}, 'a', {'qty': 2}), 'conflict')"
      ],
      [
        "场景 4：[{'a': {}}, 'b', {}] → 'new'",
        "__lesson_equal(decide_receipt({'a': {}}, 'b', {}), 'new')"
      ],
      [
        "相同ID不同JSON类型是冲突",
        "decide_receipt({\"a\":{\"qty\":1}},\"a\",{\"qty\":True}) == \"conflict\""
      ]
    ],
    "cases": [
      [
        [
          {},
          "a",
          {
            "qty": 1
          }
        ],
        "new"
      ],
      [
        [
          {
            "a": {
              "qty": 1
            }
          },
          "a",
          {
            "qty": 1
          }
        ],
        "replay"
      ],
      [
        [
          {
            "a": {
              "qty": 1
            }
          },
          "a",
          {
            "qty": 2
          }
        ],
        "conflict"
      ],
      [
        [
          {
            "a": {}
          },
          "b",
          {}
        ],
        "new"
      ]
    ],
    "concept": "重复标识只有连同原请求一起检查，才能区分重试与冲突。重试复用结果，冲突不能冒充同一操作。",
    "hint": "先判断key是否存在，再比较其保存的payload。",
    "boundary": "内存检查不是持久化幂等；必须用数据库事务处理并发、崩溃和回复丢失。",
    "transfer": "模拟扣款成功但回复丢失，说明为什么应该查收据而不是再扣一次。",
    "chapter": 5,
    "islandId": "beacon",
    "reward": 20,
    "xp": 20,
    "reference": "AE26 semantic mapping: docs/ae26-map.md",
    "prerequisites": [
      "beacon-permission"
    ],
    "releaseStatus": "implemented-local",
    "kind": "practice",
    "scene": {
      "district": "航路调度台",
      "before": "为离线工具代理建立输入、授权、证据和预算合同",
      "after": "已修复：别把同一箱货付两次。带着同一规则检查下一份输入。"
    },
    "review": {
      "intervalDays": [
        1,
        7,
        21
      ],
      "minimumUnassistedPasses": 2,
      "requiresDifferentContext": true,
      "status": "unobserved"
    },
    "hintLevels": [
      "重复标识只有连同原请求一起检查，才能区分重试与冲突。重试复用结果，冲突不能冒充同一操作。",
      "先判断key是否存在，再比较其保存的payload。"
    ],
    "language": "python",
    "capability": "browser-restricted-python",
    "caseExpectedTypes": [
      "str",
      "str",
      "str",
      "str"
    ]
  },
  {
    "id": "beacon-retrieval",
    "title": "先看权限再找证据",
    "topic": "检索 · 权限过滤",
    "description": "docs 是含id、text、allowed(list)的字典列表。只在actor有权读的文档中搜索区分大小写的query子串，返回按id排序的id列表。query为空时返回[]。",
    "function": "retrieve",
    "starter": "def retrieve(docs, actor, query):\n    # 在这里实现规则，再尝试不同输入\n    pass\n",
    "solution": "def retrieve(docs,actor,query):\n    if not query:\n        return []\n    return sorted(doc[\"id\"] for doc in docs if actor in doc[\"allowed\"] and query in doc[\"text\"])\n",
    "checks": [
      [
        "场景 1：[[{'id': 'b', 'text': '海图', 'allowed': ['p']}, {'id': 'a', 'text': '海图', 'allowed': ['t']}], 'p', '海'] → ['b']",
        "__lesson_equal(retrieve([{'id': 'b', 'text': '海图', 'allowed': ['p']}, {'id': 'a', 'text': '海图', 'allowed': ['t']}], 'p', '海'), ['b'])"
      ],
      [
        "场景 2：[[{'id': 'b', 'text': '船', 'allowed': ['p']}, {'id': 'a', 'text': '船', 'allowed': ['p']}], 'p', '船'] → ['a', 'b']",
        "__lesson_equal(retrieve([{'id': 'b', 'text': '船', 'allowed': ['p']}, {'id': 'a', 'text': '船', 'allowed': ['p']}], 'p', '船'), ['a', 'b'])"
      ],
      [
        "场景 3：[[], 'p', 'x'] → []",
        "__lesson_equal(retrieve([], 'p', 'x'), [])"
      ],
      [
        "场景 4：[[{'id': 'a', 'text': 'x', 'allowed': ['p']}], 'p', ''] → []",
        "__lesson_equal(retrieve([{'id': 'a', 'text': 'x', 'allowed': ['p']}], 'p', ''), [])"
      ]
    ],
    "cases": [
      [
        [
          [
            {
              "id": "b",
              "text": "海图",
              "allowed": [
                "p"
              ]
            },
            {
              "id": "a",
              "text": "海图",
              "allowed": [
                "t"
              ]
            }
          ],
          "p",
          "海"
        ],
        [
          "b"
        ]
      ],
      [
        [
          [
            {
              "id": "b",
              "text": "船",
              "allowed": [
                "p"
              ]
            },
            {
              "id": "a",
              "text": "船",
              "allowed": [
                "p"
              ]
            }
          ],
          "p",
          "船"
        ],
        [
          "a",
          "b"
        ]
      ],
      [
        [
          [],
          "p",
          "x"
        ],
        []
      ],
      [
        [
          [
            {
              "id": "a",
              "text": "x",
              "allowed": [
                "p"
              ]
            }
          ],
          "p",
          ""
        ],
        []
      ]
    ],
    "concept": "资料相关不代表可以读取。先限制到有权访问的集合，再做匹配；稳定排序让结果可重复检查。",
    "hint": "权限与文本都通过才保留，最后按id排序。",
    "boundary": "这是词面子串检索，不是语义检索，也不是完整RAG或引用真实性验证。",
    "transfer": "加入相关但无权限的文档，确认排名和输出不会泄露它。",
    "chapter": 5,
    "islandId": "beacon",
    "reward": 20,
    "xp": 20,
    "reference": "AE26 semantic mapping: docs/ae26-map.md",
    "prerequisites": [
      "beacon-idempotency"
    ],
    "releaseStatus": "implemented-local",
    "kind": "practice",
    "scene": {
      "district": "航路调度台",
      "before": "为离线工具代理建立输入、授权、证据和预算合同",
      "after": "已修复：先看权限再找证据。带着同一规则检查下一份输入。"
    },
    "review": {
      "intervalDays": [
        1,
        7,
        21
      ],
      "minimumUnassistedPasses": 2,
      "requiresDifferentContext": true,
      "status": "unobserved"
    },
    "hintLevels": [
      "资料相关不代表可以读取。先限制到有权访问的集合，再做匹配；稳定排序让结果可重复检查。",
      "权限与文本都通过才保留，最后按id排序。"
    ],
    "language": "python",
    "capability": "browser-restricted-python",
    "caseExpectedTypes": [
      "list",
      "list",
      "list",
      "list"
    ]
  },
  {
    "id": "beacon-evaluation",
    "title": "给航海助手一份成绩证据",
    "topic": "评估 · 分母与分组",
    "description": "rows 为 {group,passed(bool)} 列表。返回每组 {passed:通过数,total:总数}，保留失败样本在分母；空输入返回{}。",
    "function": "score_groups",
    "starter": "def score_groups(rows):\n    # 在这里实现规则，再尝试不同输入\n    pass\n",
    "solution": "def score_groups(rows):\n    groups={}\n    for row in rows:\n        group=groups.setdefault(row[\"group\"],{\"passed\":0,\"total\":0})\n        group[\"total\"]+=1\n        group[\"passed\"]+=int(row[\"passed\"])\n    return groups\n",
    "checks": [
      [
        "场景 1：[[{'group': 'read', 'passed': True}, {'group': 'read', 'passed': False}, {'group': 'write', 'passed': False}]] → {'read': {'passed': 1, 'total': 2}, 'write': {'passed': 0, 'total': 1}}",
        "__lesson_equal(score_groups([{'group': 'read', 'passed': True}, {'group': 'read', 'passed': False}, {'group': 'write', 'passed': False}]), {'read': {'passed': 1, 'total': 2}, 'write': {'passed': 0, 'total': 1}})"
      ],
      [
        "场景 2：[[]] → {}",
        "__lesson_equal(score_groups([]), {})"
      ],
      [
        "只出现一个组时，不补出其他组，重复成功分别计数",
        "__lesson_equal(score_groups([{'group':'read','passed':True},{'group':'read','passed':True}]), {'read':{'passed':2,'total':2}})"
      ],
      [
        "新组名也参与统计，全失败的组保留零分子和完整分母",
        "__lesson_equal(score_groups([{'group':'search','passed':False},{'group':'search','passed':False}]), {'search':{'passed':0,'total':2}})"
      ],
      [
        "组名来自输入，三个交错组分别累计，未出现的组不补入",
        "__lesson_equal(score_groups([{'group':'航线','passed':True},{'group':'repair','passed':False},{'group':'search','passed':True},{'group':'航线','passed':False},{'group':'search','passed':True}]), {'航线':{'passed':1,'total':2},'repair':{'passed':0,'total':1},'search':{'passed':2,'total':2}})"
      ]
    ],
    "cases": [
      [
        [
          [
            {
              "group": "read",
              "passed": true
            },
            {
              "group": "read",
              "passed": false
            },
            {
              "group": "write",
              "passed": false
            }
          ]
        ],
        {
          "read": {
            "passed": 1,
            "total": 2
          },
          "write": {
            "passed": 0,
            "total": 1
          }
        }
      ],
      [
        [
          []
        ],
        {}
      ]
    ],
    "concept": "只有成功记录的分数会遮住失败。按任务组保留分子与分母，可发现总体平均数掩盖的薄弱分支。",
    "hint": "每条记录total都加1，只有passed为True才增加通过数。",
    "boundary": "这只是统计；评估还需要独立数据、泄漏检查、失败分析与真实迁移任务。",
    "transfer": "比较读取和写入任务，解释为什么总体高分不能证明写入安全。",
    "chapter": 5,
    "islandId": "beacon",
    "reward": 20,
    "xp": 20,
    "reference": "AE26 semantic mapping: docs/ae26-map.md",
    "prerequisites": [
      "beacon-retrieval"
    ],
    "releaseStatus": "implemented-local",
    "kind": "practice",
    "scene": {
      "district": "航路调度台",
      "before": "为离线工具代理建立输入、授权、证据和预算合同",
      "after": "已修复：给航海助手一份成绩证据。带着同一规则检查下一份输入。"
    },
    "review": {
      "intervalDays": [
        1,
        7,
        21
      ],
      "minimumUnassistedPasses": 2,
      "requiresDifferentContext": true,
      "status": "unobserved"
    },
    "hintLevels": [
      "只有成功记录的分数会遮住失败。按任务组保留分子与分母，可发现总体平均数掩盖的薄弱分支。",
      "每条记录total都加1，只有passed为True才增加通过数。"
    ],
    "language": "python",
    "capability": "browser-restricted-python",
    "caseExpectedTypes": [
      "dict",
      "dict"
    ]
  },
  {
    "id": "beacon-budget",
    "title": "雾夜里的有限航程",
    "topic": "预算 · 停止条件",
    "description": "plan_calls(costs,budget) 按顺序取能放入总预算的前缀，遇到第一个超预算就停止，不跳过；costs/budget为非负整数，返回[选中数量,剩余预算]。",
    "function": "plan_calls",
    "starter": "def plan_calls(costs, budget):\n    # 在这里实现规则，再尝试不同输入\n    pass\n",
    "solution": "def plan_calls(costs,budget):\n    count=0\n    for cost in costs:\n        if cost>budget:\n            break\n        budget-=cost\n        count+=1\n    return [count,budget]\n",
    "checks": [
      [
        "场景 1：[[2, 5, 1], 6] → [1, 4]",
        "__lesson_equal(plan_calls([2, 5, 1], 6), [1, 4])"
      ],
      [
        "场景 2：[[2, 4], 6] → [2, 0]",
        "__lesson_equal(plan_calls([2, 4], 6), [2, 0])"
      ],
      [
        "场景 3：[[0, 0, 1], 0] → [2, 0]",
        "__lesson_equal(plan_calls([0, 0, 1], 0), [2, 0])"
      ],
      [
        "场景 4：[[], 8] → [0, 8]",
        "__lesson_equal(plan_calls([], 8), [0, 8])"
      ]
    ],
    "cases": [
      [
        [
          [
            2,
            5,
            1
          ],
          6
        ],
        [
          1,
          4
        ]
      ],
      [
        [
          [
            2,
            4
          ],
          6
        ],
        [
          2,
          0
        ]
      ],
      [
        [
          [
            0,
            0,
            1
          ],
          0
        ],
        [
          2,
          0
        ]
      ],
      [
        [
          [],
          8
        ],
        [
          0,
          8
        ]
      ]
    ],
    "concept": "每次调用前先检查剩余预算，再扣除成本。明确遇到超额就停止，可避免在不同运行中随意跳过任务。",
    "hint": "循环里先比较，再更新count与budget；超出用break。",
    "boundary": "此处成本已知且没有外部调用；真实系统需超时、取消和事后实际成本核对。",
    "transfer": "把成本换成工具调用时间估算，解释估算不准时如何保留停止余量。",
    "chapter": 5,
    "islandId": "beacon",
    "reward": 20,
    "xp": 20,
    "reference": "AE26 semantic mapping: docs/ae26-map.md",
    "prerequisites": [
      "beacon-evaluation"
    ],
    "releaseStatus": "implemented-local",
    "kind": "island-capstone-exercise",
    "scene": {
      "district": "航路调度台",
      "before": "为离线工具代理建立输入、授权、证据和预算合同",
      "after": "已修复：雾夜里的有限航程。带着同一规则检查下一份输入。"
    },
    "review": {
      "intervalDays": [
        1,
        7,
        21
      ],
      "minimumUnassistedPasses": 2,
      "requiresDifferentContext": true,
      "status": "unobserved"
    },
    "hintLevels": [
      "每次调用前先检查剩余预算，再扣除成本。明确遇到超额就停止，可避免在不同运行中随意跳过任务。",
      "循环里先比较，再更新count与budget；超出用break。"
    ],
    "language": "python",
    "capability": "browser-restricted-python",
    "caseExpectedTypes": [
      "list",
      "list",
      "list",
      "list"
    ]
  }
];
