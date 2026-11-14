import { scaffoldLesson } from './course-learning-scaffolds.mjs';

const RAW_LESSON_DATA = [
  {
    "id": "first-steps",
    "title": "给冒险一个起点",
    "topic": "变量 · 输出",
    "description": "皮皮想前进 3 格。创建 steps 变量，打印它，再用 game.move(steps) 带它去分支路口。",
    "starter": "steps = 1\nprint(steps)\ngame.move(steps)",
    "solution": "steps = 3\nprint(steps)\ngame.move(steps)",
    "checks": [
      [
        "steps 是整数 3",
        "type(steps) is int and steps == 3"
      ],
      [
        "真正发出前进 3 格的指令",
        "__lesson_actions == [{\"type\":\"move\",\"steps\":3}]"
      ],
      [
        "输出中打印了 3",
        "__lesson_printed_number(3)"
      ]
    ],
    "concept": "变量像有名字的小盒子。= 把右边的值存入左边的名字。print() 会把值显示在终端。",
    "hint": "把 steps = 1 改成 steps = 3。函数括号里的 steps 会读取这个变量。",
    "chapter": 0,
    "reference": "F01",
    "reward": 35,
    "xp": 25,
    "assessmentVersion": 1,
    "contractVersion": 1
  },
  {
    "id": "coin-math",
    "title": "鱼饼生意的第一笔账",
    "topic": "数值 · 运算",
    "description": "卖出 4 份鱼饼，每份 8 金币，成本共 12。算出 profit，然后前进 2 格。 输入值会变化，检查时会替换首次赋给输入变量的数据。请保留输入变量的定义，后面的计算从它们读取。",
    "starter": "sold = 4\nprice = 8\ncost = 12\nprofit = 0\nprint(profit)\ngame.move(2)",
    "solution": "sold = 4\nprice = 8\ncost = 12\nprofit = sold * price - cost\nprint(profit)\ngame.move(2)",
    "checks": [
      [
        "利润为 20",
        "profit == 20"
      ],
      [
        "题目中的销量、单价与成本保持正确",
        "sold == 4 and price == 8 and cost == 12"
      ],
      [
        "实际前进两格",
        "sum(a[\"steps\"] for a in __lesson_actions if a[\"type\"] == \"move\") == 2"
      ],
      [
        "换一组销量、单价和成本，也按输入计算",
        "__lesson_replay([{\"sold\": 7, \"price\": 5, \"cost\": 11}], \"profit == 24\") and __lesson_replay([{\"sold\": 0, \"price\": 9, \"cost\": 4}], \"profit == -4\")"
      ]
    ],
    "concept": "乘法写作 *，除法是 /。括号可以改变运算顺序。先算乘除，再算加减。",
    "hint": "profit = sold * price - cost",
    "chapter": 0,
    "reference": "F01",
    "reward": 35,
    "xp": 25,
    "assessmentVersion": 2,
    "contractVersion": 1
  },
  {
    "id": "greeting",
    "title": "给汤圆一张明信片",
    "topic": "字符串 · f-string",
    "description": "用名字 name 和岛名 island 组成 greeting，内容要是「汤圆，欢迎来到启航岛！」。 输入值会变化，检查时会替换首次赋给输入变量的数据。请保留输入变量的定义，后面的计算从它们读取。",
    "starter": "name = \"汤圆\"\nisland = \"启航岛\"\ngreeting = \"\"\nprint(greeting)\ngame.move(1)",
    "solution": "name = \"汤圆\"\nisland = \"启航岛\"\ngreeting = f\"{name}，欢迎来到{island}！\"\nprint(greeting)\ngame.move(1)",
    "checks": [
      [
        "明信片文字正确",
        "greeting == \"汤圆，欢迎来到启航岛！\""
      ],
      [
        "换名字和岛名后，明信片跟着改变",
        "__lesson_replay([{\"name\": \"皮皮\", \"island\": \"珊瑚港\"}], \"greeting == '皮皮，欢迎来到珊瑚港！'\") and __lesson_replay([{\"name\": \"舟舟\", \"island\": \"风铃岛\"}], \"greeting == '舟舟，欢迎来到风铃岛！'\")"
      ]
    ],
    "concept": "字符串放在引号里。f\"{name}\" 会把花括号内的变量放进文字。",
    "hint": "在 f-string 里分别放入 {name} 和 {island}。",
    "chapter": 0,
    "reference": "F01",
    "reward": 35,
    "xp": 25,
    "assessmentVersion": 2,
    "contractVersion": 1
  },
  {
    "id": "safe-buy",
    "title": "买得起才出发",
    "topic": "条件 · 布尔值",
    "description": "完成 can_buy(coins, price)，余额足够时返回 True，否则返回 False。",
    "starter": "def can_buy(coins, price):\n    return False\n\nprint(can_buy(120, 80))\ngame.move(2)",
    "solution": "def can_buy(coins, price):\n    return coins >= price\n\nprint(can_buy(120, 80))\ngame.move(2)",
    "checks": [
      [
        "够钱可以买",
        "can_buy(120, 80) is True"
      ],
      [
        "正好够钱也可以买",
        "can_buy(80, 80) is True"
      ],
      [
        "不够钱不买",
        "can_buy(30, 80) is False"
      ],
      [
        "多种余额与价格都按大小比较",
        "all(can_buy(c, p) is (c >= p) for c in (0, 1, 17, 99, 201) for p in (0, 1, 18, 99, 202))"
      ]
    ],
    "concept": "## 先看懂函数外壳\n\n你已经用过 `print(...)`。现在用 `def` 给自己的一段计算起名，之后可以反复调用。先看一个与买东西无关的例子：\n\n```python\ndef add_one(number):\n    return number + 1\n\nanswer = add_one(3)\nprint(answer)\n```\n\n- `def` 定义函数，`add_one` 是名字；`number` 是参数，也就是接收这次输入的名字。定义时只记住做法，还没有执行里面的加法。\n- 定义行以冒号 `:` 结束，下一行缩进 4 个空格，表示它属于函数。`answer = ...` 不缩进，已经回到函数外面。\n- `add_one(3)` 才是在调用：这次 `number` 接到 3。`return` 把算出的 4 交回调用处，并结束这次函数调用，于是 `answer` 得到 4。\n- `print(answer)` 把 4 显示出来。`return` 负责交回结果，`print` 负责显示，不能互相代替。函数正常结束却没有执行 `return` 时，调用结果是 `None`，表示没有返回具体结果。\n\n自检：把调用中的 3 改成 6，`answer` 应该是多少？沿着“传入 6 → 加 1 → 交回结果”检查。回到上面的原例：如果只把函数里的 `return number + 1` 换成 `print(number + 1)`，里面会显示 4，但外面的 `print(answer)` 会显示 `None`，不是 4。\n\n## 回到买东西\n\n`can_buy(coins, price)` 有两个参数，调用时按顺序接收余额和价格。本关保留这个函数外壳，让 `return` 交回比较结果，而不是只把结果打印出来。\n\n比较表达式得到 True 或 False。>= 表示大于或等于，边界相等时也要考虑。",
    "hint": "返回 coins >= price。这里不需要写一长串 if。",
    "chapter": 0,
    "reference": "F01",
    "reward": 35,
    "xp": 25,
    "assessmentVersion": 2,
    "contractVersion": 1
  },
  {
    "id": "backpack",
    "title": "整理两只猫的背包",
    "topic": "列表 · 索引",
    "description": "背包加上「地图」，并把 first_item 设置成第一件物品。 输入值会变化，检查时会替换首次赋给输入变量的数据。请保留输入变量的定义，后面的计算从它们读取。",
    "starter": "bag = [\"鱼饼\", \"水壶\"]\n# 用 append 添加地图\nfirst_item = \"\"\nprint(bag)\ngame.move(1)",
    "solution": "bag = [\"鱼饼\", \"水壶\"]\nbag.append(\"地图\")\nfirst_item = bag[0]\nprint(bag)\ngame.move(1)",
    "checks": [
      [
        "背包顺序正确",
        "bag == [\"鱼饼\", \"水壶\", \"地图\"]"
      ],
      [
        "第一件是鱼饼",
        "first_item == \"鱼饼\""
      ],
      [
        "换背包内容也在末尾补地图并读取首项",
        "__lesson_replay([{\"bag\": [\"指南针\", \"绳索\"]}, {\"bag\": [\"围巾\"]}], \"bag == __lesson_expected_bag and first_item == bag[0]\", \"backpack\")"
      ]
    ],
    "concept": "列表用 [] 保存有顺序的数据。索引从 0 开始，append() 在末尾加一项。",
    "hint": "bag.append(\"地图\")，然后 first_item = bag[0]。",
    "chapter": 0,
    "reference": "F02",
    "reward": 35,
    "xp": 25,
    "assessmentVersion": 2,
    "contractVersion": 1
  },
  {
    "id": "shells",
    "title": "把贝壳一枚枚数清",
    "topic": "for · 累计",
    "description": "海滩各处有 [3, 5, 2, 4] 枚贝壳。用循环求 total。 输入值会变化，检查时会替换首次赋给输入变量的数据。请保留输入变量的定义，后面的计算从它们读取。",
    "starter": "shells = [3, 5, 2, 4]\ntotal = 0\nfor count in shells:\n    pass\nprint(total)\ngame.move(2)",
    "solution": "shells = [3, 5, 2, 4]\ntotal = 0\nfor count in shells:\n    total += count\nprint(total)\ngame.move(2)",
    "checks": [
      [
        "贝壳总数是 14",
        "total == 14"
      ],
      [
        "真正执行 for 或 while 循环体",
        "__lesson_ran_loop"
      ],
      [
        "换贝壳数量后仍累计正确",
        "__lesson_replay([{\"shells\": [8, 0, 1]}, {\"shells\": [2, 2, 2, 2, 2]}, {\"shells\": []}], \"total == __lesson_expected_total\", \"shells\")"
      ]
    ],
    "concept": "for 会依次取出列表元素。缩进里的代码是循环体，+= 会把新值累加到原值。",
    "hint": "把 pass 换成 total += count。",
    "chapter": 0,
    "reference": "F02",
    "reward": 35,
    "xp": 25,
    "assessmentVersion": 2,
    "contractVersion": 1
  },
  {
    "id": "catalog",
    "title": "猫咪商店的价目表",
    "topic": "字典 · 键值",
    "description": "读取 prices 中鱼饼的价格，并新增地图价格 12。 输入值会变化，检查时会替换首次赋给输入变量的数据。请保留输入变量的定义，后面的计算从它们读取。",
    "starter": "prices = {\"鱼饼\": 8, \"水壶\": 15}\nfish_price = 0\nprint(prices)\ngame.move(1)",
    "solution": "prices = {\"鱼饼\": 8, \"水壶\": 15}\nfish_price = prices[\"鱼饼\"]\nprices[\"地图\"] = 12\nprint(prices)\ngame.move(1)",
    "checks": [
      [
        "读取鱼饼价格",
        "fish_price == 8"
      ],
      [
        "新增地图价格",
        "prices.get(\"地图\") == 12"
      ],
      [
        "换鱼饼单价后读取新值，保留已有商品",
        "__lesson_replay([{\"prices\": {\"鱼饼\": 11, \"绳索\": 3}}, {\"prices\": {\"鱼饼\": 0, \"船票\": 20}}], \"fish_price == prices.get('鱼饼') and prices == __lesson_expected_prices\", \"catalog\")"
      ]
    ],
    "concept": "字典把名字映射到值。prices[\"鱼饼\"] 读取某个键，赋值可以新增或修改它。",
    "hint": "fish_price = prices[\"鱼饼\"]；prices[\"地图\"] = 12。",
    "chapter": 0,
    "reference": "F02",
    "reward": 35,
    "xp": 25,
    "assessmentVersion": 2,
    "contractVersion": 1
  },
  {
    "id": "discount",
    "title": "做一个可复用的收银员",
    "topic": "函数 · 返回值",
    "description": "定义 discounted(price, percent)，返回折后价格。例如 100 打八折，也就是减价 20%，得到 80。",
    "starter": "def discounted(price, percent):\n    return price\n\nprint(discounted(100, 20))\ngame.move(3)",
    "solution": "def discounted(price, percent):\n    return price * (1 - percent / 100)\n\nprint(discounted(100, 20))\ngame.move(3)",
    "checks": [
      [
        "20% 折扣",
        "discounted(100, 20) == 80"
      ],
      [
        "0% 折扣",
        "discounted(35, 0) == 35"
      ],
      [
        "50% 折扣",
        "discounted(30, 50) == 15"
      ],
      [
        "不同折扣、原价与零价都成立",
        "all(abs(discounted(p, d) - p * (100 - d) / 100) < 1e-8 for p in (0, 1, 7.5, 41, 123) for d in (0, 7, 25, 50, 100))"
      ]
    ],
    "concept": "函数用 def 定义。参数是输入，return 是输出。写通用规则，比只写一个答案更可靠。",
    "hint": "原价乘以 (1 - percent / 100)。",
    "chapter": 0,
    "reference": "F03",
    "reward": 35,
    "xp": 25,
    "assessmentVersion": 2,
    "contractVersion": 1
  },
  {
    "id": "select-items",
    "title": "只带买得起的东西",
    "topic": "列表推导式",
    "description": "实现 affordable(prices, budget)，按原顺序返回不超过预算的价格。",
    "starter": "def affordable(prices, budget):\n    return []\n\nprint(affordable([8, 25, 12], 15))\ngame.move(2)",
    "solution": "def affordable(prices, budget):\n    return [p for p in prices if p <= budget]\n\nprint(affordable([8, 25, 12], 15))\ngame.move(2)",
    "checks": [
      [
        "挑选买得起的物品",
        "affordable([8, 25, 12], 15) == [8, 12]"
      ],
      [
        "空列表",
        "affordable([], 10) == []"
      ],
      [
        "包含预算边界",
        "affordable([10, 11], 10) == [10]"
      ],
      [
        "保留乱序输入和重复值",
        "affordable([12, 8, 12, 20], 15) == [12, 8, 12]"
      ],
      [
        "负数、相等边界和重复元素都保留原顺序",
        "affordable([0, -2, 4, -2, 1], 0) == [0, -2, -2] and affordable([9, 9], 9) == [9, 9]"
      ]
    ],
    "concept": "列表推导式把循环、筛选和收集结果写在一起。先读 for，再读 if，最后看要保留的表达式。",
    "hint": "[p for p in prices if p <= budget]",
    "chapter": 1,
    "reference": "F02",
    "reward": 55,
    "xp": 40,
    "assessmentVersion": 2,
    "contractVersion": 1
  },
  {
    "id": "invalid-input",
    "title": "遇到坏数据也不慌",
    "topic": "异常 · try/except",
    "description": "完成 parse_coins(text)。输入是字符串；能转换成整数就返回整数，不能转换则返回 0。保留负号，允许首尾空格。",
    "starter": "def parse_coins(text):\n    return int(text)\n\nprint(parse_coins(\"12\"))\ngame.move(1)",
    "solution": "def parse_coins(text):\n    try:\n        return int(text)\n    except ValueError:\n        return 0\n\nprint(parse_coins(\"12\"))\ngame.move(1)",
    "checks": [
      [
        "有效数字",
        "parse_coins(\"12\") == 12"
      ],
      [
        "无效文字",
        "parse_coins(\"喵\") == 0"
      ],
      [
        "负数保留",
        "parse_coins(\"-2\") == -2"
      ],
      [
        "处理空串、空格、正号及小数文字",
        "parse_coins(\"\") == 0 and parse_coins(\"  +37  \") == 37 and parse_coins(\"3.5\") == 0 and parse_coins(\"-29\") == -29"
      ],
      [
        "遵循int文本语法：Unicode十进制与合法下划线可转换，坏格式仍为0",
        "__lesson_equal(parse_coins('١٢'), 12) and __lesson_equal(parse_coins('１２'), 12) and __lesson_equal(parse_coins('१२'), 12) and __lesson_equal(parse_coins('-٢٩'), -29) and __lesson_equal(parse_coins('+٣٧'), 37) and __lesson_equal(parse_coins('1_024'), 1024) and __lesson_equal(parse_coins('-１_２'), -12) and __lesson_equal(parse_coins('\\xa0+٤_٢\\u2003'), 42) and __lesson_equal(parse_coins('٠'), 0) and __lesson_equal(parse_coins('0007'), 7) and __lesson_equal(parse_coins('1__2'), 0) and __lesson_equal(parse_coins('_12'), 0) and __lesson_equal(parse_coins('12_'), 0) and __lesson_equal(parse_coins('+_12'), 0) and __lesson_equal(parse_coins('²'), 0) and __lesson_equal(parse_coins('Ⅻ'), 0) and __lesson_equal(parse_coins('0x10'), 0) and __lesson_equal(parse_coins('1 2'), 0) and __lesson_equal(parse_coins('١.٢'), 0) and __lesson_equal(parse_coins('−12'), 0)"
      ]
    ],
    "concept": "转换可能抛出 ValueError。用 try/except 处理你能恢复的具体错误，不要吞掉所有异常。",
    "hint": "把 int(text) 放进 try，在 except ValueError 里 return 0。",
    "chapter": 1,
    "reference": "F04",
    "reward": 55,
    "xp": 40,
    "assessmentVersion": 2,
    "contractVersion": 1
  },
  {
    "id": "ledger",
    "title": "把账本变成 JSON",
    "topic": "标准库 · JSON",
    "description": "实现 encode_ledger(ledger) 和 decode_ledger(payload)：把字典转成 JSON 文本，再从收到的 JSON 文本恢复数据。测试会换账本，并把另一份文本直接交给解码函数。",
    "starter": "import json\n\ndef encode_ledger(ledger):\n    return \"\"\n\ndef decode_ledger(payload):\n    return {}\n\nledger = {\"cat\": \"汤圆\", \"coins\": 80}\npayload = encode_ledger(ledger)\nrestored = decode_ledger(payload)\nprint(restored)\ngame.move(2)",
    "solution": "import json\n\ndef encode_ledger(ledger):\n    return json.dumps(ledger, ensure_ascii=False)\n\ndef decode_ledger(payload):\n    return json.loads(payload)\n\nledger = {\"cat\": \"汤圆\", \"coins\": 80}\npayload = encode_ledger(ledger)\nrestored = decode_ledger(payload)\nprint(restored)\ngame.move(2)",
    "checks": [
      [
        "演示账本往返正确",
        "__lesson_json_matches(payload, ledger, restored)"
      ],
      [
        "编码与解码都依赖各自参数",
        "__lesson_json_functions(encode_ledger, decode_ledger)"
      ]
    ],
    "concept": "JSON 是程序间常用的数据格式。dumps 把 Python 数据转成文字，loads 反向解析。并非所有 Python 对象都能直接编码。",
    "hint": "编码函数返回 json.dumps(ledger)；解码函数返回 json.loads(payload)。不能读取某个固定的全局账本，因为收到的文本可能来自别的岛。",
    "chapter": 1,
    "reference": "F07",
    "reward": 55,
    "xp": 40,
    "assessmentVersion": 2,
    "contractVersion": 2
  },
  {
    "id": "stock-class",
    "title": "为商店建立模型",
    "topic": "类 · 实例 · 方法",
    "description": "完成 Shop.sell(count)。本关 count 与初始 stock 是整数。出售正数且库存够时减少 stock 并返回 True；零、负数或库存不足时保持库存并返回 False。",
    "starter": "class Shop:\n    def __init__(self, stock):\n        self.stock = stock\n\n    def sell(self, count):\n        return False\n\nshop = Shop(5)\nprint(shop.sell(2))\ngame.move(2)",
    "solution": "class Shop:\n    def __init__(self, stock):\n        self.stock = stock\n\n    def sell(self, count):\n        if count > 0 and count <= self.stock:\n            self.stock -= count\n            return True\n        return False\n\nshop = Shop(5)\nprint(shop.sell(2))\ngame.move(2)",
    "checks": [
      [
        "出售后减少库存",
        "(lambda s: s.sell(2) is True and s.stock == 3)(Shop(5))"
      ],
      [
        "不足时不改库存",
        "(lambda s: s.sell(6) is False and s.stock == 5)(Shop(5))"
      ],
      [
        "拒绝负数和零",
        "(lambda s: s.sell(-2) is False and s.sell(0) is False and s.stock == 5)(Shop(5))"
      ],
      [
        "恰好卖完库存",
        "(lambda s: s.sell(5) is True and s.stock == 0 and s.sell(1) is False)(Shop(5))"
      ],
      [
        "两个实例互不影响，连续销售不能超卖",
        "(lambda a, b: a.sell(2) is True and a.sell(2) is False and a.stock == 1 and b.stock == 7)(Shop(3), Shop(7))"
      ]
    ],
    "concept": "类把数据与操作放在一起。self 指向当前实例。__init__ 在新建实例时初始化状态。",
    "hint": "先验证 count > 0 且 count <= self.stock，再扣库存。",
    "chapter": 1,
    "reference": "扩展",
    "reward": 55,
    "xp": 40,
    "assessmentVersion": 2,
    "contractVersion": 1
  },
  {
    "id": "generator",
    "title": "让物资按需到达",
    "topic": "生成器 · yield",
    "description": "实现 supplies(n)，依次生成 1 到 n 的平方，不一次建立列表。",
    "starter": "def supplies(n):\n    yield 0\n\nprint(list(supplies(3)))\ngame.move(2)",
    "solution": "def supplies(n):\n    for i in range(1, n + 1):\n        yield i * i\n\nprint(list(supplies(3)))\ngame.move(2)",
    "checks": [
      [
        "生成平方数",
        "list(supplies(3)) == [1, 4, 9]"
      ],
      [
        "空序列",
        "list(supplies(0)) == []"
      ],
      [
        "返回按需迭代器，大输入也不预先遍历",
        "__lesson_lazy_iterator(supplies)"
      ],
      [
        "不同长度、重复创建的流保持独立",
        "list(supplies(1)) == [1] and list(supplies(5)) == [1, 4, 9, 16, 25] and list(supplies(2)) == [1, 4]"
      ]
    ],
    "concept": "## 先看清 range 的停止位置\n\n你已经用 `for` 逐项读取列表。`range` 能提供连续的整数编号，不必把这些数手写成列表。本节只看省略步长的写法，每次向前加 1：\n\n```python\nfor label in range(4, 7):\n    print(label)\n```\n\n这段代码依次输出 4、5、6，不输出 7。`range(start, stop)` 的 `start` 是起点，`stop` 是不包含的右端点，也就是停止标记，不是最后输出的数。\n\n- 省略起点，只写 `range(3)`，会从 0 开始，依次提供 0、1、2。\n- 在这里默认每次加 1 的写法中，起点等于或大于停止标记时，范围为空。例如 `range(4, 4)` 和 `range(7, 4)` 都不会让循环体执行，程序会继续运行循环后面的代码。\n\n自检：只把例子中的 7 改成 5，会输出几次、输出什么？再把它改成 4 呢？先找第一个编号，再检查它有没有到达停止标记。\n\n## 再区分 range 与 yield\n\n`range` 是可重复遍历的整数序列，不是生成器；它本身也不需要预先保存一整张整数列表。\n\nyield 会暂停函数并交出一个值。下一次迭代从暂停处继续，适合流式处理。\n\n在本题中，把两个问题分开考虑：循环会经历哪些编号？每次继续时，函数要交出什么值？范围对了不代表已经完成生成器，也不要为交出第一个值先算好全部结果。",
    "hint": "for i in range(1, n + 1): 后缩进 yield i * i。",
    "chapter": 1,
    "reference": "扩展",
    "reward": 55,
    "xp": 40,
    "assessmentVersion": 2,
    "contractVersion": 1
  },
  {
    "id": "test-case",
    "title": "先证明，再出航",
    "topic": "断言 · 边界测试",
    "description": "完成 safe_divide(a, b)：除数为 0 时返回 None，其余正常除法。写 assert 检查零除数和带小数的结果。测试必须能抓住“零除返回 0”及“错误使用整除”两种缺陷。",
    "starter": "def safe_divide(a, b):\n    return a / b\n\n# 分别测试零除数和带小数的结果\nprint(safe_divide(8, 2))\ngame.move(1)",
    "solution": "def safe_divide(a, b):\n    if b == 0:\n        return None\n    return a / b\n\nassert safe_divide(1, 0) is None\nassert safe_divide(5, 2) == 2.5\nprint(safe_divide(8, 2))\ngame.move(1)",
    "checks": [
      [
        "正常除法",
        "safe_divide(8, 2) == 4"
      ],
      [
        "零除数",
        "safe_divide(1, 0) is None"
      ],
      [
        "负数",
        "safe_divide(-6, 3) == -2"
      ],
      [
        "正常除法保留小数",
        "safe_divide(5, 2) == 2.5 and safe_divide(-5, 2) == -2.5"
      ],
      [
        "测试能抓住零除和整除缺陷",
        "__lesson_assert_mutations()"
      ]
    ],
    "concept": "assert 在条件不成立时抛出 AssertionError。边界案例和正常案例一样重要。 测试不只是执行过一条 assert。把函数故意改错，测试应当失败；这叫变异测试。它说明这组测试能发现指定错误，不等于证明所有情况正确。",
    "hint": "先检查 b == 0。再写 assert safe_divide(1, 0) is None 和 assert safe_divide(5, 2) == 2.5。测试应在函数变错时失败。",
    "chapter": 1,
    "reference": "F05",
    "reward": 55,
    "xp": 40,
    "assessmentVersion": 2,
    "contractVersion": 2
  },
  {
    "id": "tool-router",
    "title": "让 Agent 选对工具",
    "topic": "工具注册 · 路由",
    "description": "完成 choose_tool(intent)。查价格返回 search，购买返回 buy，其余返回 ask。这里是确定性路由练习，不调用模型。",
    "starter": "def choose_tool(intent):\n    return \"ask\"\n\nprint(choose_tool(\"查价格\"))\ngame.move(3)",
    "solution": "def choose_tool(intent):\n    tools = {\"查价格\": \"search\", \"购买\": \"buy\"}\n    return tools.get(intent, \"ask\")\n\nprint(choose_tool(\"查价格\"))\ngame.move(3)",
    "checks": [
      [
        "查价",
        "choose_tool(\"查价格\") == \"search\""
      ],
      [
        "购买",
        "choose_tool(\"购买\") == \"buy\""
      ],
      [
        "未知请求",
        "choose_tool(\"别的事情\") == \"ask\""
      ],
      [
        "空请求和不同未知文本安全回退",
        "choose_tool(\"\") == \"ask\" and choose_tool(\"购买全部\") == \"ask\" and choose_tool(\"SEARCH\") == \"ask\""
      ]
    ],
    "concept": "工具把可执行能力暴露给 Agent。路由要有可解释的默认行为。真实系统仍需要输入校验与授权。",
    "hint": "用字典保存两种映射，get(intent, \"ask\") 处理未知输入。",
    "chapter": 2,
    "reference": "A00",
    "reward": 55,
    "xp": 40,
    "assessmentVersion": 2,
    "contractVersion": 1
  },
  {
    "id": "permission",
    "title": "购买前先看许可",
    "topic": "授权 · 安全默认值",
    "description": "实现 allowed(action, approved)。查看可以直接进行，购买必须 approved is True，其他行为拒绝。",
    "starter": "def allowed(action, approved):\n    return True\n\nprint(allowed(\"buy\", False))\ngame.move(2)",
    "solution": "def allowed(action, approved):\n    return action == \"view\" or (action == \"buy\" and approved is True)\n\nprint(allowed(\"buy\", False))\ngame.move(2)",
    "checks": [
      [
        "查看无需批准",
        "allowed(\"view\", False) is True"
      ],
      [
        "购买需要批准",
        "allowed(\"buy\", False) is False and allowed(\"buy\", True) is True"
      ],
      [
        "未知操作拒绝",
        "allowed(\"delete\", True) is False"
      ],
      [
        "字符串不等于批准",
        "allowed(\"buy\", \"yes\") is False"
      ],
      [
        "数字一不是布尔批准",
        "allowed(\"buy\", 1) is False and allowed(\"buy\", 1.0) is False"
      ],
      [
        "未知操作和更多非布尔值都拒绝购买",
        "all(allowed(\"buy\", x) is False for x in (None, 0, \"True\", [], {})) and allowed(\"other\", True) is False and allowed(\"view\", None) is True"
      ]
    ],
    "concept": "许可是实际操作前的判断，不是提示词里的愿望。对未知操作默认拒绝，避免字符串等假值绕过检查。",
    "hint": "必须使用 approved is True，而不是仅检查它是否非空。",
    "chapter": 2,
    "reference": "S00",
    "reward": 55,
    "xp": 40,
    "assessmentVersion": 2,
    "contractVersion": 1
  },
  {
    "id": "dedupe",
    "title": "一次订单，只付一次",
    "topic": "集合 · 保序去重（幂等的前置练习）",
    "description": "实现 unique_orders(ids)，保留每个订单 ID 的第一次出现，顺序不变。 本题只处理内存中的列表，不会真的创建订单或支付。",
    "starter": "def unique_orders(ids):\n    return ids\n\nprint(unique_orders([\"a\", \"b\", \"a\"]))\ngame.move(2)",
    "solution": "def unique_orders(ids):\n    seen = set()\n    result = []\n    for order in ids:\n        if order not in seen:\n            seen.add(order)\n            result.append(order)\n    return result\n\nprint(unique_orders([\"a\", \"b\", \"a\"]))\ngame.move(2)",
    "checks": [
      [
        "重复订单去重",
        "unique_orders([\"a\", \"b\", \"a\"]) == [\"a\", \"b\"]"
      ],
      [
        "保留原顺序",
        "unique_orders([\"z\", \"a\", \"z\", \"b\"]) == [\"z\", \"a\", \"b\"]"
      ],
      [
        "空输入",
        "unique_orders([]) == []"
      ],
      [
        "相邻重复、全重复和数字 ID 顺序正确",
        "unique_orders([\"b\", \"b\", \"a\", \"a\", \"b\"]) == [\"b\", \"a\"] and unique_orders([4, 2, 4, 3, 2]) == [4, 2, 3]"
      ]
    ],
    "concept": "## 先用集合回答“有没有”\n\n列表用 `[]` 保存先后顺序。集合可以记录本课的字符串或整数 ID，每个值只记一份，适合查询“以前出现过吗”。先看一个与订单无关的贴纸例子：\n\n```python\nstickers = set()\nprint(\"海星\" in stickers)\nstickers.add(\"海星\")\nstickers.add(\"海星\")\nprint(stickers)\nprint(\"贝壳\" not in stickers)\n```\n\n- `set()` 创建空集合。注意：`{}` 创建的是空字典，不是空集合。\n- `in` 查询某个值是否在集合中，`not in` 查询是否不在，结果都是 `True` 或 `False`。第一次查询发生在加入贴纸之前，所以输出 `False`。\n- `stickers.add(\"海星\")` 在原集合中加入一个值；再加同一个值不会多存一份。因此这里打印出只有一个元素的 `{'海星'}`。\n- `add()` 是修改原集合，不是返回新的集合，不要写成 `stickers = stickers.add(\"海星\")`。\n\n自检：最后一行输出什么？如果把其中的 `not in` 改成 `in` 呢？从“贝壳有没有被加入”判断，而不是记住输出。\n\n## 集合与列表各管一件事\n\n集合适合记“出现过没有”，但不能依靠它的遍历顺序还原输入顺序。把输入直接转成集合再转回列表，不能保证保留第一次出现的先后。\n\n回到本题，想清楚：哪份数据用来查询已遇到的 ID，哪份数据记录决定保留的先后顺序？已有的列表知识仍然有用。\n\n## 练习边界\n\n重试可能重复提交订单。去重 ID 能避免重复处理，但生产系统还需要持久存储与原子提交。这里只练一次函数调用中的列表处理，不是已实现真实支付幂等。",
    "hint": "维护一个 seen 集合和一个 result 列表。",
    "chapter": 2,
    "reference": "R01",
    "reward": 55,
    "xp": 40,
    "assessmentVersion": 2,
    "contractVersion": 1
  },
  {
    "id": "retrieval",
    "title": "找到有用的航海笔记",
    "topic": "检索 · 证据",
    "description": "实现 retrieve(notes, query)，返回包含 query 的笔记，忽略英文大小写。 保留原文、原顺序和重复项；空查询匹配全部笔记。",
    "starter": "def retrieve(notes, query):\n    return []\n\nnotes = [\"Python shop\", \"Cat island\", \"python tools\"]\nprint(retrieve(notes, \"PYTHON\"))\ngame.move(3)",
    "solution": "def retrieve(notes, query):\n    return [note for note in notes if query.lower() in note.lower()]\n\nnotes = [\"Python shop\", \"Cat island\", \"python tools\"]\nprint(retrieve(notes, \"PYTHON\"))\ngame.move(3)",
    "checks": [
      [
        "检索命中",
        "retrieve([\"Python shop\", \"Cat\", \"python tools\"], \"PYTHON\") == [\"Python shop\", \"python tools\"]"
      ],
      [
        "未命中",
        "retrieve([\"cat\"], \"dog\") == []"
      ],
      [
        "空查询、重复笔记和原文顺序处理一致",
        "retrieve([\"A\", \"A\", \"b\"], \"\") == [\"A\", \"A\", \"b\"] and retrieve([\"海图\", \"海风\", \"地图\"], \"海\") == [\"海图\", \"海风\"] and retrieve([], \"cat\") == []"
      ]
    ],
    "concept": "先找证据再回答，是检索增强的基础。本题是字面检索，不是向量检索或完整 RAG。",
    "hint": "query.lower() in note.lower()",
    "chapter": 2,
    "reference": "C00",
    "reward": 55,
    "xp": 40,
    "assessmentVersion": 2,
    "contractVersion": 1
  },
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
      ],
      [
        "大整数整箱与余量不经过浮点舍入",
        "__lesson_equal(boxes(9007199254740993,1,1),9007199254740993) and __lesson_equal(boxes(9007199254740993,1,2),4503599627370497)"
      ],
      [
        "零天、单位容量与超大人数",
        "__lesson_equal(boxes(7,0,5),0) and __lesson_equal(boxes(10**30+1,3,3),10**30+1)"
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
    "badSolution": "def boxes(people, days, capacity):\n    return people * days // capacity\n",
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
        "只清理首尾，保留内部连续空格与制表符",
        "__lesson_equal(clean_label(' \\tSea  MAP\\tDock \\n'),'sea  map\\tdock') and __lesson_equal(clean_label('  A   B  '),'a   b')"
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
    "badSolution": "def clean_label(label):\n    return label.replace(\" \", \"\").lower()\n",
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
      ],
      [
        "零岁、零票价与每个年龄区间均按同一规则计算",
        "all(__lesson_equal(fare(age,base), 0 if age < 6 else base // 2 if age < 18 else base) for age in (0,1,5,6,7,17,18,19,99) for base in (0,2,18,100))"
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
    "badSolution": "def fare(age, base):\n    return 0 if age <= 6 else base // 2 if age <= 18 else base\n",
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
        "航线计算保留原移动列表",
        "__lesson_unchanged(trace_route, [7,[4,-1,0]], [7,11,10,10], [1])"
      ],
      [
        "另一航线仍不消费输入",
        "__lesson_unchanged(trace_route, [-2,[5,3]], [-2,3,6], [1])"
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
    "badSolution": "def trace_route(start, moves):\n    return [start, start + sum(moves)]\n",
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
        "合法 int 文本包含正号与数字分隔符",
        "__lesson_equal(quantity(' +12 '),12) and __lesson_equal(quantity('1_0'),10) and __lesson_equal(quantity(' +0 '),0)"
      ],
      [
        "空白和非法分隔符不是数量",
        "__lesson_equal(quantity(''),None) and __lesson_equal(quantity('   '),None) and __lesson_equal(quantity('1__0'),None)"
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
    "badSolution": "def quantity(text):\n    try:\n        return int(text)\n    except ValueError:\n        return None\n",
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
        "返回新的清单对象",
        "__lesson_unchanged(manifest, [[\" a \",\"a\",\"b\"]], [\"a\",\"b\"], [], 0)"
      ],
      [
        "空清单也返回新对象",
        "__lesson_unchanged(manifest, [[]], [], [], 0)"
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
    "badSolution": "def manifest(items):\n    return sorted(set(str(x).strip() for x in items))\n",
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
      ],
      [
        "库存和订单都保持原值",
        "__lesson_unchanged(shortages, [{\"rope\":2,\"tea\":9},{\"rope\":5,\"tea\":2,\"lamp\":1}], {\"rope\":3,\"lamp\":1}, [0,1])"
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
    "badSolution": "def shortages(stock, orders):\n    return {k:v-stock.get(k,0) for k,v in orders.items()}\n",
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
      ],
      [
        "单条零收据也保留物品键",
        "__lesson_equal(totals([['rope',0],['tea',-3],['tea',3]]),{'rope':0,'tea':0})"
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
    "badSolution": "def totals(receipts):\n    return dict(receipts)\n",
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
    "badSolution": "def shared(a, b):\n    return [x for x in a if x in b]\n",
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
      ],
      [
        "同名不同分的每一行仍保留",
        "__lesson_equal(ranked([['pipi',2],['tang',1],['pipi',4]]),['pipi','pipi','tang'])"
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
    "badSolution": "def ranked(rows):\n    return [x[0] for x in sorted(rows, key=lambda x:x[1], reverse=True)]\n",
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
      ],
      [
        "保留原列表与外部别名，输出另存新列表",
        "__lesson_resupply_ownership(resupply)"
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
    "badSolution": "def resupply(supply, amount):\n    result = supply.copy()\n    for values in result.values():\n        values.append(amount)\n    return result\n",
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
      ],
      [
        "空订单也产生新库存",
        "__lesson_unchanged(checkout, [{\"tea\":5},{}], {\"tea\":5}, [0], 0)"
      ],
      [
        "成功扣除返回新库存",
        "__lesson_unchanged(checkout, [{\"tea\":5},{\"tea\":2}], {\"tea\":3}, [0], 0)"
      ],
      [
        "失败检查保留原库存",
        "__lesson_unchanged(checkout, [{\"tea\":5},{\"tea\":2,\"lamp\":1}], None, [0])"
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
    "badSolution": "def checkout(stock, order):\n    for name, qty in order.items():\n        if stock.get(name,0) < qty:\n            return None\n        stock[name] -= qty\n    return stock\n",
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
    "badSolution": "def append_note(note, notes=[]):\n    notes.append(note)\n    return notes\n",
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
        "两个实例交错调用保持各自配置",
        "(lambda a,b: a(100)==80 and b(30)==15 and a(10)==8 and b(8)==4)(make_discount(20),make_discount(50))"
      ],
      [
        "创建第三个实例不覆盖旧配置",
        "(lambda a,b,c: c(7)==7 and a(50)==40 and b(20)==10)(make_discount(20),make_discount(50),make_discount(0))"
      ],
      [
        "折扣保留非整数结果",
        "__lesson_numeric(make_discount(25)(7),5.25) and __lesson_numeric(make_discount(12.5)(20),17.5)"
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
    "badSolution": "def make_discount(percent):\n    return lambda price: price * 0.8\n",
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
    "description": "pipeline(value, operations) 按顺序各调用每个函数恰好一次，将上次输出交给下次；空列表返回原值；阶段抛出异常时原样传播且不运行后续阶段。",
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
      ],
      [
        "每个阶段恰好调用一次，传递实际结果",
        "__lesson_pipeline_once(pipeline)"
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
    "badSolution": "def pipeline(value, operations):\n    return value\n",
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
      ],
      [
        "Wallet 自身拒绝透支与负数，不改变余额",
        "(lambda a,b: __lesson_equal([a.pay(8),a.balance,a.pay(-1),a.balance,a.pay(0),a.balance,a.pay(5),a.balance,a.pay(1),a.balance,b.balance],[False,5,False,5,True,5,True,0,False,0,9]))(Wallet(5),Wallet(9))"
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
    "badSolution": "class Wallet:\n    balance=10\n    def __init__(self,balance):\n        self.balance=balance\n    def pay(self,cost):\n        self.balance -= cost\n        return True\ndef wallet_story(start,costs):\n    w=Wallet(start)\n    return [w.balance,[w.pay(c) for c in costs]]\n",
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
    "badSolution": "def sum_stream(stream):\n    size = len(list(stream))\n    return sum(stream)\n",
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
        "负数量拒绝",
        "__lesson_equal(parse_order(\"rope:-4\"), {\"ok\":False,\"error\":\"invalid\"})"
      ],
      [
        "合法 int 数量文本包含正号与数字分隔符",
        "__lesson_equal(parse_order(' fish : +2 '),{'ok':True,'item':'fish','quantity':2}) and __lesson_equal(parse_order('tea:1_0'),{'ok':True,'item':'tea','quantity':10})"
      ],
      [
        "名字清理后只有空白仍无效",
        "__lesson_equal(parse_order(' \\t :2'),{'ok':False,'error':'invalid'})"
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
    "badSolution": "def parse_order(text):\n    name, qty = text.split(\":\")\n    return {\"ok\":True,\"item\":name,\"quantity\":int(qty)}\n",
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
        "零数量被拒绝",
        "decode_order('{\"item\":\"rope\",\"qty\":0}') is None"
      ],
      [
        "空名称被拒绝",
        "decode_order('{\"item\":\"\",\"qty\":4}') is None"
      ],
      [
        "名称必须是字符串，数量必须是严格整数",
        "all(decode_order(payload) is None for payload in ['{\"item\":[\"fish\"],\"qty\":2}','{\"item\":7,\"qty\":2}','{\"item\":true,\"qty\":2}','{\"item\":\"fish\",\"qty\":1.5}','{\"item\":\"fish\",\"qty\":\"2\"}','{\"item\":\"fish\"}','{\"qty\":2}'])"
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
    "badSolution": "import json\ndef decode_order(payload):\n    data=json.loads(payload)\n    return data if isinstance(data,dict) and isinstance(data.get(\"qty\"),int) else None\n",
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
    "badSolution": "import re\ndef valid_pass(text):\n    return re.search(r\"[A-Z]{2}-\\d{4}\",text) is not None\n",
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
    "badSolution": "def missing_cargo(expected, arrived):\n    return {x:1 for x in set(expected)-set(arrived)}\n",
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
      ],
      [
        "连续出队保留全部已处理记录，等待者仍按先后顺序",
        "__lesson_equal(rescue([\"a\",\"b\",\"!\",\"c\",\"!\",\"d\",\"!\"]), [[\"a\",\"b\",\"c\"],[\"d\"]]) and __lesson_equal(rescue([\"!\",\"a\",\"!\",\"!\",\"b\",\"!\",\"!\"]), [[\"a\",\"b\"],[]])"
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
    "badSolution": "def rescue(events):\n    waiting=[]\n    done=[]\n    for event in events:\n        if event == \"!\" and waiting:\n            done.append(waiting.pop())\n        elif event != \"!\":\n            waiting.append(event)\n    return [done,waiting]\n",
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
    "topic": "statistics · 中位数与数值边界",
    "description": "readings 是有限int/float（不含bool）或None的列表。忽略None，返回中位数；无有效值返回None。偶数项取中间两数平均。相等数值允许int或float表示，比较容差为1e-9相对或1e-12绝对误差。",
    "function": "median_reading",
    "starter": "def median_reading(readings):\n    # 在这里实现规则，再尝试不同输入\n    pass\n",
    "solution": "import statistics\n\ndef median_reading(readings):\n    values = [value for value in readings if value is not None]\n    if not values:\n        return None\n    low = statistics.median_low(values)\n    high = statistics.median_high(values)\n    if low == high:\n        return low\n    # Integer ratios avoid overflow/underflow in the intermediate sum.\n    a, b = (low, 1) if type(low) is int else low.as_integer_ratio()\n    c, d = (high, 1) if type(high) is int else high.as_integer_ratio()\n    numerator, denominator = a * d + c * b, 2 * b * d\n    whole, remainder = divmod(numerator, denominator)\n    if remainder == 0:\n        return whole\n    try:\n        return numerator / denominator\n    except OverflowError:\n        # An integer approximation differs by less than 1, far below\n        # relative tolerance for results outside the finite float range.\n        return whole\n",
    "checks": [
      [
        "场景 1：[[1, None, 2, 99]] → 2",
        "__lesson_numeric(median_reading([1, None, 2, 99]), 2)"
      ],
      [
        "场景 2：[[0, None]] → 0",
        "__lesson_numeric(median_reading([0, None]), 0)"
      ],
      [
        "场景 3：[[2, 4]] → 3.0",
        "__lesson_numeric(median_reading([2, 4]), 3.0)"
      ],
      [
        "场景 4：[[None]] → None",
        "__lesson_equal(median_reading([None]), None)"
      ],
      [
        "场景 5：[[]] → None",
        "__lesson_equal(median_reading([]), None)"
      ],
      [
        "场景 6：[[0.1, 0.2]] → 0.15",
        "__lesson_numeric(median_reading([0.1, 0.2]), 0.15)"
      ],
      [
        "场景 7：[[-5, -1]] → -3.0",
        "__lesson_numeric(median_reading([-5, -1]), -3.0)"
      ],
      [
        "场景 8：[[0, 0, 9]] → 0",
        "__lesson_numeric(median_reading([0, 0, 9]), 0)"
      ],
      [
        "两个大有限值的中位数仍应有限",
        "__lesson_numeric(median_reading([1e308,1e308]),1e308) and __lesson_numeric(median_reading([1e308,1.6e308]),1.3e308)"
      ],
      [
        "同号负值、异号抵消与最小次正规数",
        "__lesson_numeric(median_reading([-1.6e308,-1e308]),-1.3e308) and __lesson_numeric(median_reading([-1e308,1e308]),0) and __lesson_equal(median_reading([5e-324,5e-324]),5e-324)"
      ],
      [
        "大整数不能先转浮点，近零中点保持准确",
        "__lesson_numeric(median_reading([10**400,10**400+2]),10**400+1) and __lesson_numeric(median_reading([-10**400,10**400+1]),0.5) and __lesson_numeric(median_reading([10**400,10**400+1]),10**400)"
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
      ],
      [
        [
          []
        ],
        null
      ],
      [
        [
          [
            0.1,
            0.2
          ]
        ],
        0.15
      ],
      [
        [
          [
            -5,
            -1
          ]
        ],
        -3.0
      ],
      [
        [
          [
            0,
            0,
            9
          ]
        ],
        0
      ]
    ],
    "concept": "median_low/median_high 选出中间两项。偶数项的中点不能总是直接先相加：两个很大的有限浮点数相加可能溢出。整数比可保留输入数值，避免中间和溢出或下溢。",
    "hint": "过滤条件写 is not None，不写 if x。",
    "boundary": "输入只含有限int/float（排除bool）和None。返回int/float近似中位数，按题定容差比较；极大半整数可以用误差小于1的整数近似。没有承诺任意实数精确编码，NaN/Infinity也不在输入域。",
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
    "badSolution": "def median_reading(readings):\n    values=sorted(x for x in readings if x)\n    return values[len(values)//2] if values else None\n",
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
      "median_low/median_high 选出中间两项。偶数项的中点不能总是直接先相加：两个很大的有限浮点数相加可能溢出。整数比可保留输入数值，避免中间和溢出或下溢。",
      "先过滤None，再用median_low和median_high取得中间两值；两值相同直接返回。",
      "浮点数的as_integer_ratio()给出实际二进制值的整数比。合并两个整数比再除以2，避免先把两个大浮点数相加。"
    ],
    "language": "python",
    "capability": "browser-restricted-python",
    "caseExpectedTypes": [
      "int",
      "int",
      "float",
      "NoneType",
      "NoneType",
      "float",
      "float",
      "int"
    ]
  },
  {
    "id": "archive-distance",
    "title": "地图上的安全半径",
    "topic": "math · 几何",
    "description": "points 是 [x,y] 列表，坐标与 radius 为有限 int/float（不含bool），radius 非负。返回距离原点不超过 radius 的点数，边界计入。纯整数使用精确整数比较；浮点按 math.hypot 的舍入语义比较；超出浮点可表示范围时按输入实际数值的整数比比较。",
    "function": "within_radius",
    "starter": "def within_radius(points, radius):\n    # 在这里实现规则，再尝试不同输入\n    pass\n",
    "solution": "import math\n\ndef within_radius(points, radius):\n    def exact_squared(x, y, radius):\n        a, b = (x, 1) if type(x) is int else x.as_integer_ratio()\n        c, d = (y, 1) if type(y) is int else y.as_integer_ratio()\n        e, f = (radius, 1) if type(radius) is int else radius.as_integer_ratio()\n        return (a*a*d*d + c*c*b*b)*f*f <= e*e*b*b*d*d\n\n    count = 0\n    for x, y in points:\n        if type(x) is int and type(y) is int and type(radius) is int:\n            inside = x*x + y*y <= radius*radius\n        else:\n            try:\n                distance = math.hypot(x, y)\n            except OverflowError:\n                distance = None\n            if distance is None or not math.isfinite(distance):\n                inside = exact_squared(x, y, radius)\n            else:\n                inside = distance <= radius\n        if inside:\n            count += 1\n    return count\n",
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
      ],
      [
        "大有限浮点不能因平方溢出误入圆内",
        "__lesson_equal(within_radius([[1e308,1e308],[1e308,0.0]],1e308),1)"
      ],
      [
        "非零微小点不能因平方下溢变成原点",
        "__lesson_equal(within_radius([[1e-200,0.0],[0.0,0.0]],0.0),1)"
      ],
      [
        "纯大整数保留边界和边界外的一步",
        "__lesson_equal(within_radius([[10**400,0],[10**400,1],[10**400-1,0]],10**400),2)"
      ],
      [
        "混合数值和超大半径也不因浮点转换失败",
        "__lesson_equal(within_radius([[1e308,1e308]],10**400),1) and __lesson_equal(within_radius([[10**400,1.0]],10**400),0)"
      ],
      [
        "常规浮点遵循hypot舍入语义",
        "__lesson_equal(within_radius([[0.3,0.4]],0.5),1)"
      ],
      [
        "超大整数混合浮点回退保留圆周、圆内与圆外",
        "__lesson_equal(within_radius([[10**400,0.0],[10**400-1,0.0],[10**400+1,0.0]],10**400),2) and __lesson_equal(within_radius([[-10**400,0.0],[0.0,10**400]],10**400),2)"
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
    "concept": "纯整数平方可精确比较距离。浮点平方可能上溢或下溢，math.hypot能稳定计算大多数有限浮点的欧氏距离。超大整数混入浮点计算时，可以用整数比比较而不强行转为浮点。",
    "hint": "纯整数可以比较平方；含浮点时先用 math.hypot，超大整数混用时再检查整数比。",
    "boundary": "这是平面欧氏距离，不是经纬度导航。浮点以实际二进制数和math.hypot的舍入结果为准，不保证十进制原始文本或任意实数的无限精度。",
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
    "badSolution": "def within_radius(points,radius):\n    return sum(1 for x,y in points if abs(x)+abs(y) <= radius)\n",
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
      "纯整数平方可精确比较距离。浮点平方可能上溢或下溢，math.hypot能稳定计算大多数有限浮点的欧氏距离。超大整数混入浮点计算时，可以用整数比比较而不强行转为浮点。",
      "先区分纯整数和含浮点的点。纯整数保留平方比较，含浮点优先使用math.hypot。",
      "math.hypot因超大整数转换失败或结果溢出时，将各数转成整数比，交叉相乘比较平方距离。"
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
    "badSolution": "def ticket_cases():\n    return [[8,10]]\n",
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
    "badSolution": "def lower_bound(sorted_values,target):\n    for i,x in enumerate(sorted_values):\n        if x > target:\n            return i\n    return len(sorted_values)\n",
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
    "badSolution": "def build_prefix(values):\n    return [sum(values)]\n",
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
      ],
      [
        "查询只去首尾空白，保留大小写与内部空格",
        "__lesson_equal(cache_key('p',1,' TIDE '),('p',1,'TIDE')) and __lesson_equal(cache_key('p',1,' tide  map '),('p',1,'tide  map')) and __lesson_equal(cache_key('p',1,' \\t '),('p',1,''))"
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
    "badSolution": "def cache_key(user,version,query):\n    return query.strip()\n",
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
    "badSolution": "def replay(start,events):\n    return [max(0,start+sum(events)),[]]\n",
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
      ],
      [
        "等待时间必须为正数",
        "classify({\"kind\":\"rate_limit\",\"retry_after\":0})==\"inspect\" and classify({\"kind\":\"rate_limit\",\"retry_after\":-2})==\"inspect\""
      ],
      [
        "正浮点、字符串与空值不是正整数等待时间",
        "all(classify({'kind':'rate_limit','retry_after':value})=='inspect' for value in [1.0,0.5,'3',None])"
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
    "badSolution": "def classify(error):\n    return \"retry\"\n",
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
      ],
      [
        "闭区间端点1和6均合法",
        "valid_move({\"steps\":1}) is True and valid_move({\"steps\":6}) is True"
      ],
      [
        "浮点、字符串、缺字段和空值不能当步数",
        "all(valid_move(args) is False for args in [{'steps':2.0},{'steps':1.5},{'steps':'2'},{'steps':None},{},None])"
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
    "badSolution": "def valid_move(args):\n    return isinstance(args.get(\"steps\"),int) and 1<=args[\"steps\"]<=6\n",
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
        "动作不同必须拒绝",
        "authorized({\"actor\":\"cat\",\"action\":\"buy\",\"args\":{},\"expires\":50,\"used\":False},\"cat\",\"move\",{},10) is False"
      ],
      [
        "授权检查不消费原授权",
        "__lesson_unchanged(authorized, [{\"actor\":\"cat\",\"action\":\"move\",\"args\":{\"steps\":2},\"expires\":50,\"used\":False},\"cat\",\"move\",{\"steps\":2},10], True, [0])"
      ],
      [
        "拒绝时仍保留原授权",
        "__lesson_unchanged(authorized, [{\"actor\":\"cat\",\"action\":\"move\",\"args\":{\"steps\":2},\"expires\":50,\"used\":False},\"cat\",\"move\",{\"steps\":3},10], False, [0])"
      ],
      [
        "布尔参数不能冒充整数数量",
        "authorized({\"actor\":\"p\",\"action\":\"buy\",\"args\":{\"qty\":1},\"expires\":10,\"used\":False},\"p\",\"buy\",{\"qty\":True},0) is False"
      ],
      [
        "相同参数不同键序仍匹配",
        "authorized({\"actor\":\"p\",\"action\":\"buy\",\"args\":{\"qty\":1,\"item\":\"fish\"},\"expires\":10,\"used\":False},\"p\",\"buy\",{\"item\":\"fish\",\"qty\":1},0) is True"
      ],
      [
        "used 只能是布尔 False",
        "all(authorized({'actor':'p','action':'buy','args':{},'expires':20,'used':used},'p','buy',{},19) is False for used in [0,'',None,[],{}])"
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
    "badSolution": "def authorized(grant,actor,action,args,now):\n    return grant.get(\"action\")==action\n",
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
        "new决策不写入收据",
        "__lesson_unchanged(decide_receipt, [{\"old\":{\"qty\":2}},\"new\",{\"qty\":3}], \"new\", [0])"
      ],
      [
        "replay与conflict也不改收据",
        "__lesson_unchanged(decide_receipt, [{\"old\":{\"qty\":2}},\"old\",{\"qty\":3}], \"conflict\", [0]) and __lesson_unchanged(decide_receipt, [{\"old\":{\"qty\":2}},\"old\",{\"qty\":2}], \"replay\", [0])"
      ],
      [
        "相同ID不同JSON类型是冲突",
        "decide_receipt({\"a\":{\"qty\":1}},\"a\",{\"qty\":True}) == \"conflict\""
      ],
      [
        "JSON 对象的键顺序不改变同一业务内容",
        "__lesson_equal(decide_receipt({'a':{'qty':2,'details':{'name':'fish','fresh':True}}},'a',{'details':{'fresh':True,'name':'fish'},'qty':2}),'replay')"
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
    "badSolution": "def decide_receipt(receipts,key,payload):\n    return \"replay\" if key in receipts else \"new\"\n",
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
      ],
      [
        "大小写不同不可混同",
        "__lesson_equal(retrieve([{\"id\":\"A\",\"text\":\"Sea Map\",\"allowed\":[\"p\"]},{\"id\":\"B\",\"text\":\"sea map\",\"allowed\":[\"p\"]}],\"p\",\"Sea\"), [\"A\"])"
      ],
      [
        "词面子串可在中间或末尾，仍按权限过滤",
        "__lesson_equal(retrieve([{'id':'b','text':'old sea map','allowed':['p']},{'id':'a','text':'tidal sea','allowed':['p']},{'id':'c','text':'sea map','allowed':['t']}],'p','sea'),['a','b'])"
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
    "badSolution": "def retrieve(docs,actor,query):\n    return sorted(d[\"id\"] for d in docs if query in d[\"text\"])\n",
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
        "同组样本不必连续，重现的组累积到原分母",
        "__lesson_equal(score_groups([{'group':'read','passed':True},{'group':'write','passed':False},{'group':'read','passed':False},{'group':'write','passed':True},{'group':'read','passed':True}]),{'read':{'passed':2,'total':3},'write':{'passed':1,'total':2}})"
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
    "badSolution": "def score_groups(rows):\n    groups={}\n    for row in rows:\n        if row[\"passed\"]:\n            groups[row[\"group\"]]={\"passed\":1,\"total\":1}\n    return groups\n",
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
    "badSolution": "def plan_calls(costs,budget):\n    count=0\n    for cost in costs:\n        if cost<=budget:\n            budget-=cost\n            count+=1\n    return [count,budget]\n",
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
  },
  {
    "id": "protocol-lifecycle",
    "title": "闸门钥匙",
    "topic": "with · 资源生命周期 · 异常组",
    "brief": "皮皮要借一台闸门设备。请完成 managed_session(factory)，让借用、工作和归还都有明确顺序，出错时也不丢掉线索。先预测 open 失败后还会发生哪些动作，再运行你的实现。",
    "description": "皮皮要借一台闸门设备。请完成 managed_session(factory)，让借用、工作和归还都有明确顺序，出错时也不丢掉线索。先预测 open 失败后还会发生哪些动作，再运行你的实现。\n\n1. 返回可供 with 使用的对象。每次进入调用 factory 一次；factory 无参返回带 open()/close() 的资源。open 成功后把同一个资源交给 with 块。\n2. factory 直接失败时原样传播同一个异常，不能关闭尚未取得的资源。资源取得后，open 即使部分失败也必须 close 恰好一次；本题资源允许这样关闭。\n3. 正常退出和块内失败都 close 一次；业务异常原样传播，KeyboardInterrupt 等控制信号也不能吞掉。仅 close 失败时传播该关闭错误。\n4. open 或业务与 close 同时失败时，用 BaseExceptionGroup 保存两个原始异常，顺序为主要错误、清理错误。",
    "contract": [
      "返回可供 with 使用的对象。每次进入调用 factory 一次；factory 无参返回带 open()/close() 的资源。open 成功后把同一个资源交给 with 块。",
      "factory 直接失败时原样传播同一个异常，不能关闭尚未取得的资源。资源取得后，open 即使部分失败也必须 close 恰好一次；本题资源允许这样关闭。",
      "正常退出和块内失败都 close 一次；业务异常原样传播，KeyboardInterrupt 等控制信号也不能吞掉。仅 close 失败时传播该关闭错误。",
      "open 或业务与 close 同时失败时，用 BaseExceptionGroup 保存两个原始异常，顺序为主要错误、清理错误。"
    ],
    "starter": "from contextlib import contextmanager\n\n@contextmanager\ndef managed_session(factory):\n    # 完成取得、打开、交给 with 块、关闭及同时失败的处理。\n    raise NotImplementedError('请实现资源生命周期')\n    yield\n",
    "solution": "from contextlib import contextmanager\n\n@contextmanager\ndef managed_session(factory):\n    resource = factory()\n    try:\n        resource.open()\n        yield resource\n    except BaseException as primary:\n        try:\n            resource.close()\n        except BaseException as cleanup:\n            raise BaseExceptionGroup('session and cleanup failed', [primary, cleanup]) from None\n        raise\n    else:\n        resource.close()\n",
    "concept": "with 把进入、使用和退出组织成协议。contextmanager 中的 yield 把资源交给块内代码；块内异常会回到 yield 处。资源状态与错误证据要分别检查：成功调用 close 不代表业务成功，也不会撤销已经发生的外部效果。",
    "hint": "画出“尚未取得、已经取得、已经关闭”三个状态。factory 失败与 open 失败发生在不同状态，清理责任也不同。",
    "hintLevels": [
      "画出“尚未取得、已经取得、已经关闭”三个状态。factory 失败与 open 失败发生在不同状态，清理责任也不同。",
      "把 factory 调用放在取得资源之前的边界；资源取得之后，把 open 和 yield 放进同一个清理范围。正常、异常和控制信号都要有出口。",
      "先保留主要异常，再尝试 close；若 close 也失败，创建按先后保存两个原对象的 BaseExceptionGroup。清理成功后重新抛出原异常，不要返回成功。"
    ],
    "boundary": "浏览器运行真实 Python 的资源协议，设备是可观察的内存对象，不是真实宿主文件或闸门。关闭部分打开的设备是本题约定；资源关闭不等于回滚。多资源逆序清理尚未自动评分。",
    "transfer": "迁移练习（未自动评分）：同时借两台设备，第二台打开失败时按什么顺序归还？先列事件，再注入获取和清理故障，说明哪些业务效果无法靠 close 撤销。",
    "chapter": 6,
    "islandId": "protocol",
    "reward": 20,
    "xp": 20,
    "judgeKind": "protocol",
    "protocolTask": "lifecycle",
    "checks": [],
    "function": "managed_session",
    "targetSymbols": [
      "managed_session"
    ],
    "prerequisites": [
      "workshop-result",
      "workshop-iterable"
    ],
    "prerequisitePolicy": "advisory",
    "kind": "practice",
    "language": "python",
    "capability": "browser-python-protocol",
    "requiredImports": [
      "contextlib"
    ],
    "worldActions": [
      {
        "id": "normal-loan",
        "prompt": "追踪一次正常借用。",
        "observe": "factory → open → 使用 → close，资源身份不变。"
      },
      {
        "id": "partial-open",
        "prompt": "让打开过程失败。",
        "observe": "不进入使用阶段，已经取得的设备仍归还一次。"
      },
      {
        "id": "double-failure",
        "prompt": "同时让工作与归还失败。",
        "observe": "两份原错误都留在异常组中，不能只剩最后一份。"
      }
    ],
    "scene": {
      "district": "雾港协议工坊",
      "before": "皮皮要借一台闸门设备。请完成 managed_session(factory)，让借用、工作和归还都有明确顺序，出错时也不丢掉线索。先预测 open 失败后还会发生哪些动作，再运行你的实现。",
      "after": "这组约定已通过：闸门钥匙。保留运行证据，再试一次不同输入。",
      "requiresCurrentSubmissionPass": true
    },
    "supportCode": "",
    "supportDescription": "",
    "supportExecution": "execute supportCode first, then learner code, in one registered module namespace",
    "reference": "v0.3 advanced native contracts; AE26 skill links F03/F04, not full-module completion",
    "sourceReference": {
      "path": "v0.3/advanced/lifecycle_solution.py",
      "selectedDefinitions": [
        "managed_session"
      ],
      "embeddedSnapshotSha256": "aff8dc0312876237b72b33be4b79830b1e484fac5eb21fc969da9c67df1b6a6b",
      "snapshotNote": "Function/class bodies preserve the reviewed native behavior; prose docstrings omitted."
    },
    "releaseStatus": "implemented-local-candidate",
    "verification": {
      "content": "structure-checked",
      "protocolJudge": "see review/formal-cpython.json",
      "pyodide": "see review/formal-pyodide.json",
      "browserInteraction": "see browser/evidence/browser-playthrough.json",
      "learnerMastery": "unobserved"
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
    "transferStatus": "designed-not-auto-graded"
  },
  {
    "id": "protocol-cache",
    "title": "报价缓存器",
    "topic": "装饰器 · 参数绑定 · 缓存状态",
    "brief": "汤圆希望复用已经成功取得的报价。完成 memoize_by_key(key_fn)，返回装饰器；数清报价机器真正启动了几次，并在缓存已预热后再检查一次非法参数。",
    "description": "汤圆希望复用已经成功取得的报价。完成 memoize_by_key(key_fn)，返回装饰器；数清报价机器真正启动了几次，并在缓存已预热后再检查一次非法参数。\n\n1. 装饰普通同步 Python 函数。每次调用先按原函数签名绑定参数；缺失、多余、位置专用或关键字专用约束被违反时抛 TypeError，且不调用 key_fn 或原函数，命中缓存也一样。\n2. 合法调用把相同位置与关键字参数交给 key_fn，得到可哈希业务键。同一被装饰函数的同键成功结果只计算一次；0、False、None、空字符串也可缓存。\n3. 原函数异常保留身份且不缓存，后续相同调用真正重试；key_fn 失败不调用原函数。不同被装饰函数互不共享缓存。\n4. 提供无参 cache_clear()，只清当前函数缓存。保留名称、文档、注解、__wrapped__ 和 inspect.signature 可观察的签名；原函数的自定义属性不能破坏装饰器自己的缓存状态或清理方法。",
    "contract": [
      "装饰普通同步 Python 函数。每次调用先按原函数签名绑定参数；缺失、多余、位置专用或关键字专用约束被违反时抛 TypeError，且不调用 key_fn 或原函数，命中缓存也一样。",
      "合法调用把相同位置与关键字参数交给 key_fn，得到可哈希业务键。同一被装饰函数的同键成功结果只计算一次；0、False、None、空字符串也可缓存。",
      "原函数异常保留身份且不缓存，后续相同调用真正重试；key_fn 失败不调用原函数。不同被装饰函数互不共享缓存。",
      "提供无参 cache_clear()，只清当前函数缓存。保留名称、文档、注解、__wrapped__ 和 inspect.signature 可观察的签名；原函数的自定义属性不能破坏装饰器自己的缓存状态或清理方法。"
    ],
    "starter": "from functools import wraps\nfrom inspect import signature\n\ndef memoize_by_key(key_fn):\n    # 返回一个装饰器；每个被装饰函数应拥有自己的缓存。\n    raise NotImplementedError('请实现参数透明的缓存装饰器')\n",
    "solution": "from functools import wraps\n\nfrom inspect import signature\n\ndef memoize_by_key(key_fn):\n    def decorate(function):\n        cache = {}\n        call_signature = signature(function)\n\n        @wraps(function)\n        def wrapped(*args, **kwargs):\n            call_signature.bind(*args, **kwargs)\n            key = key_fn(*args, **kwargs)\n            if key not in cache:\n                cache[key] = function(*args, **kwargs)\n            return cache[key]\n\n        wrapped.cache_clear = cache.clear\n        return wrapped\n    return decorate\n",
    "concept": "装饰器接收函数并返回新的可调用对象。wraps 保存元信息，不能替你校验调用形状；signature(...).bind(...) 应在计算缓存键之前完成。键是否存在与结果是否为真是两件事，免费报价 0 也是成功结果。",
    "hint": "分别观察“原函数调用次数”和“最终返回值”。再试免费报价，以及第一次失败、第二次成功的情况。",
    "hintLevels": [
      "分别观察“原函数调用次数”和“最终返回值”。再试免费报价，以及第一次失败、第二次成功的情况。",
      "在每次 decorate(function) 时创建独立字典。包装层先 bind 参数，再求 key；用 key in cache 判断命中，不用结果的真假判断。",
      "只在原函数成功返回后写入缓存，并把 args/kwargs 原样传递。设置 cache_clear 时防止元信息复制覆盖自己的接口；异常不需要转换成成功值。"
    ],
    "boundary": "只面向普通同步函数；不宣称支持实例方法描述符、异步、线程安全、TTL 或容量上限。缓存键由业务定义，结果不自动深复制；有外部副作用的发送、扣款不能直接套用本题缓存。",
    "transfer": "迁移练习（未自动评分）：把租户和报价数据版本加入键，为同名请求的不同租户/版本计算独立期望，再讨论旧版本清理与可变返回值的政策。",
    "chapter": 6,
    "islandId": "protocol",
    "reward": 20,
    "xp": 20,
    "judgeKind": "protocol",
    "protocolTask": "cache",
    "checks": [],
    "function": "memoize_by_key",
    "targetSymbols": [
      "memoize_by_key"
    ],
    "prerequisites": [
      "workshop-closure",
      "workshop-defaults"
    ],
    "prerequisitePolicy": "advisory",
    "kind": "practice",
    "language": "python",
    "capability": "browser-python-protocol",
    "requiredImports": [
      "functools",
      "inspect"
    ],
    "worldActions": [
      {
        "id": "repeated-quote",
        "prompt": "用同一业务键查询两次，再换一个键。",
        "observe": "合法命中不再次启动报价机器，不同键按规则计算。"
      },
      {
        "id": "bound-before-key",
        "prompt": "预热缓存后故意把位置专用参数写成关键字。",
        "observe": "保留 TypeError，key_fn 和报价机器均没有新增调用。"
      },
      {
        "id": "retry-after-error",
        "prompt": "让第一次报价失败，再用相同参数重试。",
        "observe": "失败没有进入缓存，第二次实际执行。"
      }
    ],
    "scene": {
      "district": "雾港协议工坊",
      "before": "汤圆希望复用已经成功取得的报价。完成 memoize_by_key(key_fn)，返回装饰器；数清报价机器真正启动了几次，并在缓存已预热后再检查一次非法参数。",
      "after": "这组约定已通过：报价缓存器。保留运行证据，再试一次不同输入。",
      "requiresCurrentSubmissionPass": true
    },
    "supportCode": "",
    "supportDescription": "",
    "supportExecution": "execute supportCode first, then learner code, in one registered module namespace",
    "reference": "v0.3 advanced native contracts; AE26 skill links F03/F04, not full-module completion",
    "sourceReference": {
      "path": "v0.3/advanced/decorators_solution.py",
      "selectedDefinitions": [
        "memoize_by_key"
      ],
      "embeddedSnapshotSha256": "b51198e9636dd6d8c2cb8a15a63e243713ad3cbe6facf6c8f23de715241101ef",
      "snapshotNote": "Function/class bodies preserve the reviewed native behavior; prose docstrings omitted."
    },
    "releaseStatus": "implemented-local-candidate",
    "verification": {
      "content": "structure-checked",
      "protocolJudge": "see review/formal-cpython.json",
      "pyodide": "see review/formal-pyodide.json",
      "browserInteraction": "see browser/evidence/browser-playthrough.json",
      "learnerMastery": "unobserved"
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
    "transferStatus": "designed-not-auto-graded"
  },
  {
    "id": "protocol-shipment",
    "title": "不会漂移的运单",
    "topic": "dataclass · 不变量 · 可变别名",
    "brief": "运单登记后，外面的装箱清单还会被修改。完成冻结 dataclass Shipment(identifier, weights)，让已登记的重量保持自己的快照；再把 True、零和空列表送到验货台。",
    "description": "运单登记后，外面的装箱清单还会被修改。完成冻结 dataclass Shipment(identifier, weights)，让已登记的重量保持自己的快照；再把 True、零和空列表送到验货台。\n\n1. Shipment 是 frozen=True 的 dataclass，包含 identifier 与 weights。identifier 必须严格是 str，strip 后非空；类型错误抛 TypeError，空名称抛 ValueError。\n2. weights 输入为有限序列，保存成 tuple 快照；至少一项，每项严格为大于 0 的 int，排除 bool。空、零、负数或其他类型的重量抛 ValueError。\n3. 原重量列表随后改变不能影响运单；普通属性赋值被拒绝。相同规范化内容的运单相等且可哈希。",
    "contract": [
      "Shipment 是 frozen=True 的 dataclass，包含 identifier 与 weights。identifier 必须严格是 str，strip 后非空；类型错误抛 TypeError，空名称抛 ValueError。",
      "weights 输入为有限序列，保存成 tuple 快照；至少一项，每项严格为大于 0 的 int，排除 bool。空、零、负数或其他类型的重量抛 ValueError。",
      "原重量列表随后改变不能影响运单；普通属性赋值被拒绝。相同规范化内容的运单相等且可哈希。"
    ],
    "starter": "from dataclasses import dataclass\n\n@dataclass(frozen=True)\nclass Shipment:\n    identifier: str\n    weights: tuple[int, ...]\n\n    def __post_init__(self):\n        # 校验外部数据，并保存独立、规范化的快照。\n        raise NotImplementedError('请建立运单不变量')\n",
    "solution": "from dataclasses import dataclass\n\n@dataclass(frozen=True)\nclass Shipment:\n    identifier: str\n    weights: tuple[int, ...]\n\n    def __post_init__(self):\n        if type(self.identifier) is not str:\n            raise TypeError('identifier must be str')\n        name = self.identifier.strip()\n        if not name:\n            raise ValueError('identifier must not be blank')\n        weights = tuple(self.weights)\n        if not weights or any(type(value) is not int or value <= 0 for value in weights):\n            raise ValueError('weights must contain positive integers, excluding bool')\n        object.__setattr__(self, 'identifier', name)\n        object.__setattr__(self, 'weights', weights)\n",
    "concept": "dataclass 的字段注解不会自动检查输入，frozen 也不会把字段内部的列表冻住。本题保持不变量依靠两件事：构造时存 tuple 快照，且元素只允许不可变的严格整数。",
    "hint": "先创建运单，再修改传入的列表。若运单也跟着变化，说明它仍保留着调用者的可变对象。",
    "hintLevels": [
      "先创建运单，再修改传入的列表。若运单也跟着变化，说明它仍保留着调用者的可变对象。",
      "在 __post_init__ 中先校验名称，再把 weights 转成 tuple 并逐项验证。isinstance(True, int) 为真，业务数量需要更严格的检查。",
      "冻结对象的初始化规范化可用 object.__setattr__。保存去空白名称与合法 tuple；之后由 frozen 拒绝普通赋值，让相等与哈希使用规范化字段。"
    ],
    "boundary": "只承诺有限重量序列的普通业务接口；不把任意非序列输入的所有异常类型纳入合同。tuple[int, ...] 的固定内容不等于任意嵌套对象深冻结；本题不是防任意代码篡改的安全机制，也未运行外部静态类型检查。",
    "transfer": "迁移练习（未自动评分）：运单新增嵌套标签时，先决定允许哪些类型，再写一个会暴露浅复制的例子。解释为什么仅加 frozen=True 不能自动保护内部列表。",
    "chapter": 6,
    "islandId": "protocol",
    "reward": 20,
    "xp": 20,
    "judgeKind": "protocol",
    "protocolTask": "shipment",
    "checks": [],
    "function": "Shipment",
    "targetSymbols": [
      "Shipment"
    ],
    "prerequisites": [
      "workshop-wallet",
      "market-copy"
    ],
    "prerequisitePolicy": "advisory",
    "kind": "practice",
    "language": "python",
    "capability": "browser-python-protocol",
    "requiredImports": [
      "dataclasses"
    ],
    "worldActions": [
      {
        "id": "freeze-snapshot",
        "prompt": "登记后改变原装箱列表。",
        "observe": "已登记重量不变，运单保存自己的 tuple 快照。"
      },
      {
        "id": "invalid-weight",
        "prompt": "检查 True、零、负数和空重量。",
        "observe": "每一种不合法重量都在构造边界被拒绝。"
      },
      {
        "id": "same-shipment",
        "prompt": "比较两张规范化后内容相同的运单。",
        "observe": "相等且可作字典键，普通修改被阻止。"
      }
    ],
    "scene": {
      "district": "雾港协议工坊",
      "before": "运单登记后，外面的装箱清单还会被修改。完成冻结 dataclass Shipment(identifier, weights)，让已登记的重量保持自己的快照；再把 True、零和空列表送到验货台。",
      "after": "这组约定已通过：不会漂移的运单。保留运行证据，再试一次不同输入。",
      "requiresCurrentSubmissionPass": true
    },
    "supportCode": "",
    "supportDescription": "",
    "supportExecution": "execute supportCode first, then learner code, in one registered module namespace",
    "reference": "v0.3 advanced native contracts; AE26 skill links F03/F04, not full-module completion",
    "sourceReference": {
      "path": "v0.3/advanced/protocols_solution.py",
      "selectedDefinitions": [
        "Shipment"
      ],
      "embeddedSnapshotSha256": "a3931e4f192f59240587e7a8937a611e1cdea9c8afbd5f862b827b281980934d",
      "snapshotNote": "Function/class bodies preserve the reviewed native behavior; prose docstrings omitted."
    },
    "releaseStatus": "implemented-local-candidate",
    "verification": {
      "content": "structure-checked",
      "protocolJudge": "see review/formal-cpython.json",
      "pyodide": "see review/formal-pyodide.json",
      "browserInteraction": "see browser/evidence/browser-playthrough.json",
      "learnerMastery": "unobserved"
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
    "transferStatus": "designed-not-auto-graded"
  },
  {
    "id": "protocol-provider",
    "title": "可替换承运商",
    "topic": "结构协议 · 依赖注入 · 一次调用",
    "brief": "同一张运单可以交给不同承运商。声明 QuoteProvider(Protocol)，并实现 quote_batch(shipments, provider)；更换报价对象时，调度函数应保持不变。",
    "description": "同一张运单可以交给不同承运商。声明 QuoteProvider(Protocol)，并实现 quote_batch(shipments, provider)；更换报价对象时，调度函数应保持不变。\n\n本题提供已验证的 Shipment 运单类，可直接使用；它只负责运单数据，不包含 QuoteProvider 或 quote_batch。你需要声明报价协议并完成批量调度。\n\n1. QuoteProvider 继承 typing.Protocol，声明 quote(self, shipment: Shipment) -> int。一个提供 quote 方法的普通对象可以参与，不要求继承具体承运商类。\n2. quote_batch 按输入顺序对每张运单恰好调用一次 provider.quote，返回 [(identifier, cents), ...]。相同 identifier 不意味着同一运单，不得私自去重或缓存。\n3. 金额必须严格是非负 int；True、False、浮点、字符串、None 和负数都抛 ValueError。非法金额后不再调用后续运单；承运商自身异常保留原对象向上传播。\n4. 空输入返回空列表且零调用。提供者可以有状态，因此检查和输出必须复用同一次 quote 的返回值。",
    "contract": [
      "QuoteProvider 继承 typing.Protocol，声明 quote(self, shipment: Shipment) -> int。一个提供 quote 方法的普通对象可以参与，不要求继承具体承运商类。",
      "quote_batch 按输入顺序对每张运单恰好调用一次 provider.quote，返回 [(identifier, cents), ...]。相同 identifier 不意味着同一运单，不得私自去重或缓存。",
      "金额必须严格是非负 int；True、False、浮点、字符串、None 和负数都抛 ValueError。非法金额后不再调用后续运单；承运商自身异常保留原对象向上传播。",
      "空输入返回空列表且零调用。提供者可以有状态，因此检查和输出必须复用同一次 quote 的返回值。"
    ],
    "starter": "from typing import Protocol\n\n# 本题提供 Shipment；请补充协议方法，而不是重新实现运单。\nclass QuoteProvider(Protocol):\n    pass\n\ndef quote_batch(shipments, provider):\n    # 对每张运单报价一次，检查金额并按原顺序返回。\n    raise NotImplementedError('请实现结构协议与批量报价')\n",
    "solution": "from typing import Protocol\n\nclass QuoteProvider(Protocol):\n    def quote(self, shipment: Shipment) -> int:\n        ...\n\ndef quote_batch(shipments: list[Shipment], provider: QuoteProvider) -> list[tuple[str, int]]:\n    result = []\n    for shipment in shipments:\n        cents = provider.quote(shipment)\n        if type(cents) is not int or cents < 0:\n            raise ValueError('provider must return nonnegative integer cents')\n        result.append((shipment.identifier, cents))\n    return result\n",
    "concept": "把协作者作为参数传入，就能在不改调度逻辑的情况下替换实现。Protocol 描述需要的方法；注解不代替运行时金额校验。不要为了检查一次、输出一次而调用两次有状态的承运商。",
    "hint": "先想象一个不继承任何基类但有 quote 方法的对象。调度函数只需要这个方法，而不是某个固定承运商名字。",
    "hintLevels": [
      "先想象一个不继承任何基类但有 quote 方法的对象。调度函数只需要这个方法，而不是某个固定承运商名字。",
      "遍历运单时先保存一次报价结果，再检查严格类型和范围，通过后追加二元组。空输入自然不进入循环。",
      "声明带返回 int 注解的结构协议。批量函数既不按 identifier 去重，也不重试或吞异常；输入顺序和实际调用顺序应一致。"
    ],
    "boundary": "本课检查结构协议声明与动态行为；静态类型检查需在自己的工程中另行运行 mypy 或 pyright。runtime_checkable 也不提供完整参数或返回类型验证。中途异常不会撤销此前已发生的外部报价效果。",
    "transfer": "迁移练习（未自动评分）：添加按地区收最低价的新承运商，保持 quote_batch 与旧回归不变；独立计算新政策期望，再给有状态对象设计能抓住重复调用的测试。",
    "chapter": 6,
    "islandId": "protocol",
    "reward": 20,
    "xp": 20,
    "judgeKind": "protocol",
    "protocolTask": "provider",
    "checks": [],
    "function": "quote_batch",
    "targetSymbols": [
      "QuoteProvider",
      "quote_batch"
    ],
    "prerequisites": [
      "protocol-shipment",
      "workshop-composition"
    ],
    "prerequisitePolicy": "advisory",
    "kind": "practice",
    "language": "python",
    "capability": "browser-python-protocol",
    "requiredImports": [
      "dataclasses",
      "typing"
    ],
    "worldActions": [
      {
        "id": "replace-carrier",
        "prompt": "把按重量报价的承运商换成免费承运商。",
        "observe": "调度函数不变，回执金额随提供者改变。"
      },
      {
        "id": "stateful-carrier",
        "prompt": "让有状态承运商处理两张同名、不同重量的运单。",
        "observe": "仍按顺序各调用一次，不能去重或重复报价。"
      },
      {
        "id": "reject-false-money",
        "prompt": "让承运商返回 True 或负数。",
        "observe": "无效金额被拒绝，后续运单没有偷偷执行。"
      }
    ],
    "scene": {
      "district": "雾港协议工坊",
      "before": "同一张运单可以交给不同承运商。声明 QuoteProvider(Protocol)，并实现 quote_batch(shipments, provider)；更换报价对象时，调度函数应保持不变。",
      "after": "这组约定已通过：可替换承运商。保留运行证据，再试一次不同输入。",
      "requiresCurrentSubmissionPass": true
    },
    "supportCode": "from dataclasses import dataclass\n\n@dataclass(frozen=True)\nclass Shipment:\n    identifier: str\n    weights: tuple[int, ...]\n\n    def __post_init__(self):\n        if type(self.identifier) is not str:\n            raise TypeError('identifier must be str')\n        name = self.identifier.strip()\n        if not name:\n            raise ValueError('identifier must not be blank')\n        weights = tuple(self.weights)\n        if not weights or any(type(value) is not int or value <= 0 for value in weights):\n            raise ValueError('weights must contain positive integers, excluding bool')\n        object.__setattr__(self, 'identifier', name)\n        object.__setattr__(self, 'weights', weights)\n",
    "supportDescription": "本题提供已验证的 Shipment 运单类，可直接使用；它只负责运单数据，不包含 QuoteProvider 或 quote_batch。你需要声明报价协议并完成批量调度。",
    "supportExecution": "execute supportCode first, then learner code, in one registered module namespace",
    "reference": "v0.3 advanced native contracts; AE26 skill links F03/F04, not full-module completion",
    "sourceReference": {
      "path": "v0.3/advanced/protocols_solution.py",
      "selectedDefinitions": [
        "QuoteProvider",
        "quote_batch"
      ],
      "embeddedSnapshotSha256": "a3931e4f192f59240587e7a8937a611e1cdea9c8afbd5f862b827b281980934d",
      "snapshotNote": "Function/class bodies preserve the reviewed native behavior; prose docstrings omitted."
    },
    "releaseStatus": "implemented-local-candidate",
    "verification": {
      "content": "structure-checked",
      "protocolJudge": "see review/formal-cpython.json",
      "pyodide": "see review/formal-pyodide.json",
      "browserInteraction": "see browser/evidence/browser-playthrough.json",
      "learnerMastery": "unobserved"
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
    "transferStatus": "designed-not-auto-graded"
  },
  {
    "id": "protocol-stream",
    "title": "逐行货流",
    "topic": "生成器 · 惰性读取 · 异常来源",
    "brief": "档案馆的订单很长，皮皮暂时只要下一份。完成 stream_orders(open_source)，先只创建货流，再取一条并提前关闭；观察后面的坏行有没有被过早读取。",
    "description": "档案馆的订单很长，皮皮暂时只要下一份。完成 stream_orders(open_source)，先只创建货流，再取一条并提前关闭；观察后面的坏行有没有被过早读取。\n\n1. open_source 无参返回可迭代文本行且有 close() 的源；本题约定 close 不抛错。调用 stream_orders 只创建生成器，第一次 next 才打开，未开始就 close 不打开源。\n2. 每次 next 只读取到下一个有效结果，不能先 list(source)。忽略空白行，但错误行号按全部物理行从 1 计数。\n3. 非空行必须是 JSON 对象，恰好含 id/qty；id 严格是非空白 str，qty 严格是正 int 并排除 bool。返回解析得到的原字典，不 strip 或改写 id。\n4. JSON 或结构错误抛 OrderFormatError(line_number)，并用 __cause__ 保留原解析/验证错误；源本身的 OSError 保留原对象，不能伪装成格式错误。\n5. 正常读完、消费方显式提前 close、解析失败和读取失败都关闭源恰好一次。starter 已给出错误类型，不需要改它来掩盖失败。",
    "contract": [
      "open_source 无参返回可迭代文本行且有 close() 的源；本题约定 close 不抛错。调用 stream_orders 只创建生成器，第一次 next 才打开，未开始就 close 不打开源。",
      "每次 next 只读取到下一个有效结果，不能先 list(source)。忽略空白行，但错误行号按全部物理行从 1 计数。",
      "非空行必须是 JSON 对象，恰好含 id/qty；id 严格是非空白 str，qty 严格是正 int 并排除 bool。返回解析得到的原字典，不 strip 或改写 id。",
      "JSON 或结构错误抛 OrderFormatError(line_number)，并用 __cause__ 保留原解析/验证错误；源本身的 OSError 保留原对象，不能伪装成格式错误。",
      "正常读完、消费方显式提前 close、解析失败和读取失败都关闭源恰好一次。starter 已给出错误类型，不需要改它来掩盖失败。"
    ],
    "starter": "class OrderFormatError(ValueError):\n    def __init__(self, line_number):\n        self.line_number = line_number\n        super().__init__(f'invalid order on line {line_number}')\n\ndef stream_orders(open_source):\n    # 直到第一次 next 才打开；每次只读取到下个结果。\n    raise NotImplementedError('请实现惰性订单货流与清理')\n    yield\n",
    "solution": "import json\n\nclass OrderFormatError(ValueError):\n    def __init__(self, line_number):\n        self.line_number = line_number\n        super().__init__(f'invalid order on line {line_number}')\n\ndef stream_orders(open_source):\n    source = open_source()\n    try:\n        for line_number, line in enumerate(source, 1):\n            if not line.strip():\n                continue\n            try:\n                record = json.loads(line)\n                if type(record) is not dict or set(record) != {'id', 'qty'}:\n                    raise ValueError('expected id and qty')\n                if type(record['id']) is not str or not record['id'].strip():\n                    raise ValueError('id must be nonblank str')\n                if type(record['qty']) is not int or record['qty'] <= 0:\n                    raise ValueError('qty must be a positive integer')\n            except ValueError as error:\n                raise OrderFormatError(line_number) from error\n            yield record\n    finally:\n        source.close()\n",
    "concept": "含 yield 的函数不一定真正惰性：如果先把源读成 list，代价已经发生。生成器拥有它取得的源，finally 负责退出时清理；for 的 break 不保证仍被引用的生成器立即关闭。",
    "hint": "分开记录“创建、打开、读一行、返回一项、关闭”。创建生成器时应没有打开或读取事件。",
    "hintLevels": [
      "分开记录“创建、打开、读一行、返回一项、关闭”。创建生成器时应没有打开或读取事件。",
      "在逐行循环中 enumerate 物理行；先跳过空白，再解析并检查结构。只捕获解析和结构校验中的错误，不能把源读取错误一起改名。",
      "外层 try/finally 管理源；内层把 ValueError 链接为 OrderFormatError。每找到一条合格记录就 yield，别改字段，也别预读后面的行。"
    ],
    "boundary": "源是浏览器内存中的可观察对象，未证明宿主文件系统或网络读取。这里只处理有限同步文本流，close 不抛错；双故障清理由闸门题处理。无限源、异步生成器、重连与背压仍未验证。",
    "transfer": "迁移练习（未自动评分）：从日志里取前两条 WARNING，加入空行、无关行和坏尾部，解释物理行号与筛选序号的不同，并明确谁负责提前关闭。",
    "chapter": 6,
    "islandId": "protocol",
    "reward": 20,
    "xp": 20,
    "judgeKind": "protocol",
    "protocolTask": "stream",
    "checks": [],
    "function": "stream_orders",
    "targetSymbols": [
      "OrderFormatError",
      "stream_orders"
    ],
    "prerequisites": [
      "protocol-lifecycle",
      "archive-json"
    ],
    "prerequisitePolicy": "advisory",
    "kind": "practice",
    "language": "python",
    "capability": "browser-python-protocol",
    "requiredImports": [
      "json"
    ],
    "worldActions": [
      {
        "id": "defer-opening",
        "prompt": "只创建生成器，然后关闭它。",
        "observe": "打开次数和读取次数都为零。"
      },
      {
        "id": "read-prefix",
        "prompt": "只取第一份订单，再显式 close。",
        "observe": "后面的坏尾部未读取，源关闭一次。"
      },
      {
        "id": "error-origin",
        "prompt": "在空行后放一条坏 JSON，再比较源读取故障。",
        "observe": "格式错误保留物理行号与 cause，读取错误仍是原 OSError。"
      }
    ],
    "scene": {
      "district": "雾港协议工坊",
      "before": "档案馆的订单很长，皮皮暂时只要下一份。完成 stream_orders(open_source)，先只创建货流，再取一条并提前关闭；观察后面的坏行有没有被过早读取。",
      "after": "这组约定已通过：逐行货流。保留运行证据，再试一次不同输入。",
      "requiresCurrentSubmissionPass": true
    },
    "supportCode": "",
    "supportDescription": "",
    "supportExecution": "execute supportCode first, then learner code, in one registered module namespace",
    "reference": "v0.3 advanced native contracts; AE26 skill links F03/F04, not full-module completion",
    "sourceReference": {
      "path": "v0.3/advanced/streams_solution.py",
      "selectedDefinitions": [
        "OrderFormatError",
        "stream_orders"
      ],
      "embeddedSnapshotSha256": "b70a809ecae094c0f49f469b882cb661d3bccedb1c3e17f1d3de131b844dac82",
      "snapshotNote": "Function/class bodies preserve the reviewed native behavior; prose docstrings omitted."
    },
    "releaseStatus": "implemented-local-candidate",
    "verification": {
      "content": "structure-checked",
      "protocolJudge": "see review/formal-cpython.json",
      "pyodide": "see review/formal-pyodide.json",
      "browserInteraction": "see browser/evidence/browser-playthrough.json",
      "learnerMastery": "unobserved"
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
    "transferStatus": "designed-not-auto-graded"
  },
  {
    "id": "protocol-pipeline",
    "title": "够数就关闸",
    "topic": "生成管线 · 早停 · 所有权传递",
    "brief": "分拣口只需要前 limit 份符合规则的订单。完成 take_matching(open_source, predicate, limit)，在最后一份交到皮皮手上之前关好上游，不再读取坏尾部。",
    "description": "分拣口只需要前 limit 份符合规则的订单。完成 take_matching(open_source, predicate, limit)，在最后一份交到皮皮手上之前关好上游，不再读取坏尾部。\n\n本题提供已验证的 OrderFormatError 和 stream_orders(open_source)，可直接调用。它们负责逐行读取、校验及源关闭，不包含 take_matching；你负责筛选、数量限制和外层关闭传播。\n\n1. 返回生成器。limit 必须严格是非负 int，排除 bool；非法值在迭代开始时抛 ValueError。limit=0 不打开源、不调用 predicate。\n2. 按源顺序筛选，最多返回 limit 条匹配记录。获得第 limit 条匹配后，先关闭内部生成器，再 yield 该记录，不能读取它之后的坏尾部。\n3. 未达到上限时继续按需读取；消费方显式提前 close 外层时关闭内层。没有匹配时正常耗尽并关闭。\n4. predicate 每条输入只调用一次；predicate 或上游失败时保留原异常并关闭内部生成器。上游负责关闭源，不能再直接重复关闭底层源。",
    "contract": [
      "返回生成器。limit 必须严格是非负 int，排除 bool；非法值在迭代开始时抛 ValueError。limit=0 不打开源、不调用 predicate。",
      "按源顺序筛选，最多返回 limit 条匹配记录。获得第 limit 条匹配后，先关闭内部生成器，再 yield 该记录，不能读取它之后的坏尾部。",
      "未达到上限时继续按需读取；消费方显式提前 close 外层时关闭内层。没有匹配时正常耗尽并关闭。",
      "predicate 每条输入只调用一次；predicate 或上游失败时保留原异常并关闭内部生成器。上游负责关闭源，不能再直接重复关闭底层源。"
    ],
    "starter": "# 本题提供 stream_orders 与 OrderFormatError。\ndef take_matching(open_source, predicate, limit):\n    # 验证 limit，按需筛选，并在最后匹配 yield 前关闭上游。\n    raise NotImplementedError('请实现有明确关闭责任的早停管线')\n    yield\n",
    "solution": "def take_matching(open_source, predicate, limit):\n    if type(limit) is not int or limit < 0:\n        raise ValueError('limit must be a nonnegative integer')\n    if limit == 0:\n        return\n    orders = stream_orders(open_source)\n    count = 0\n    try:\n        for order in orders:\n            if predicate(order):\n                count += 1\n                if count == limit:\n                    orders.close()\n                    yield order\n                    return\n                yield order\n    finally:\n        orders.close()\n",
    "concept": "管线合同同时包含返回值、读取次数和关闭时刻。只用 list(...) 比较结果会漏掉悬挂资源；最后一次 yield 会暂停执行，所以应在把最后一项交出去之前关闭。外层拥有内层，内层拥有源。",
    "hint": "先模拟 limit=0 和 limit=1。把“发现最后一个匹配、关闭、把记录交出”按合同排序。",
    "hintLevels": [
      "先模拟 limit=0 和 limit=1。把“发现最后一个匹配、关闭、把记录交出”按合同排序。",
      "用计数器只数匹配项；到上限时先 orders.close()，再 yield 并结束。不要依赖下一次 next 才触发关闭。",
      "在外层 try/finally 中管理内部生成器，应对消费方提前 close 和 predicate 失败。不要把上游先变成 list，也不要用 islice 代替资源归属规则。"
    ],
    "boundary": "沿用有限同步源且 close 不抛错的合同。实现正确的早停并不证明支持无限规模、异步背压或网络恢复；去重顺序和内存上限是另一个任务。",
    "transfer": "迁移练习（未自动评分）：加入按 ID 去重，比较“先去重再限额”和“先限额再去重”的结果，重新规定拥有者和内存边界，再用重复记录与过滤失败检验。",
    "chapter": 6,
    "islandId": "protocol",
    "reward": 20,
    "xp": 20,
    "judgeKind": "protocol",
    "protocolTask": "pipeline",
    "checks": [],
    "function": "take_matching",
    "targetSymbols": [
      "take_matching"
    ],
    "prerequisites": [
      "protocol-stream",
      "protocol-lifecycle"
    ],
    "prerequisitePolicy": "advisory",
    "kind": "practice",
    "language": "python",
    "capability": "browser-python-protocol",
    "requiredImports": [
      "json"
    ],
    "worldActions": [
      {
        "id": "zero-capacity",
        "prompt": "把 limit 设成 0。",
        "observe": "没有开源、读行或筛选事件。"
      },
      {
        "id": "close-before-last",
        "prompt": "只需要一条匹配，在它后面放坏行。",
        "observe": "取得匹配结果的当下源已关闭，坏尾部未读取。"
      },
      {
        "id": "close-propagates",
        "prompt": "先取一项再关闭外层；另让 predicate 抛出错误。",
        "observe": "两条路径都清理内层，错误路径保留原异常。"
      }
    ],
    "scene": {
      "district": "雾港协议工坊",
      "before": "分拣口只需要前 limit 份符合规则的订单。完成 take_matching(open_source, predicate, limit)，在最后一份交到皮皮手上之前关好上游，不再读取坏尾部。",
      "after": "这组约定已通过：够数就关闸。保留运行证据，再试一次不同输入。",
      "requiresCurrentSubmissionPass": true
    },
    "supportCode": "import json\n\nclass OrderFormatError(ValueError):\n    def __init__(self, line_number):\n        self.line_number = line_number\n        super().__init__(f'invalid order on line {line_number}')\n\ndef stream_orders(open_source):\n    source = open_source()\n    try:\n        for line_number, line in enumerate(source, 1):\n            if not line.strip():\n                continue\n            try:\n                record = json.loads(line)\n                if type(record) is not dict or set(record) != {'id', 'qty'}:\n                    raise ValueError('expected id and qty')\n                if type(record['id']) is not str or not record['id'].strip():\n                    raise ValueError('id must be nonblank str')\n                if type(record['qty']) is not int or record['qty'] <= 0:\n                    raise ValueError('qty must be a positive integer')\n            except ValueError as error:\n                raise OrderFormatError(line_number) from error\n            yield record\n    finally:\n        source.close()\n",
    "supportDescription": "本题提供已验证的 OrderFormatError 和 stream_orders(open_source)，可直接调用。它们负责逐行读取、校验及源关闭，不包含 take_matching；你负责筛选、数量限制和外层关闭传播。",
    "supportExecution": "execute supportCode first, then learner code, in one registered module namespace",
    "reference": "v0.3 advanced native contracts; AE26 skill links F03/F04, not full-module completion",
    "sourceReference": {
      "path": "v0.3/advanced/streams_solution.py",
      "selectedDefinitions": [
        "take_matching"
      ],
      "embeddedSnapshotSha256": "b70a809ecae094c0f49f469b882cb661d3bccedb1c3e17f1d3de131b844dac82",
      "snapshotNote": "Function/class bodies preserve the reviewed native behavior; prose docstrings omitted."
    },
    "releaseStatus": "implemented-local-candidate",
    "verification": {
      "content": "structure-checked",
      "protocolJudge": "see review/formal-cpython.json",
      "pyodide": "see review/formal-pyodide.json",
      "browserInteraction": "see browser/evidence/browser-playthrough.json",
      "learnerMastery": "unobserved"
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
    "transferStatus": "designed-not-auto-graded"
  }
];
export const LESSON_DATA = RAW_LESSON_DATA.map(scaffoldLesson);

export const PROTOCOL_SCHEMAS = {
  "lifecycle": [
    "获取失败：不伪造资源或运行主体",
    "工作与关闭双故障都保留",
    "工作失败：保留原错误并关闭",
    "清理控制信号与主要错误都保留",
    "关闭本身失败必须可见",
    "控制信号与清理错误同时保留",
    "假值资源仍须正常管理",
    "控制信号不被吞掉",
    "打开与关闭双故障都保留",
    "部分打开失败仍须关闭",
    "正常借用：获取一次，关闭一次"
  ],
  "cache": [
    "命中也先检查原调用签名",
    "清空与不同函数缓存隔离",
    "业务键可合并等价输入",
    "失败不缓存，重试保留正确行为",
    "零、False、None与空串都可缓存",
    "不同业务键即使哈希相同也分别缓存",
    "键计算失败不调用业务",
    "名称、文档、注解与签名保留",
    "元信息不覆盖缓存内部状态",
    "完整参数转发与业务键",
    "原函数身份与可变参数转发"
  ],
  "shipment": [
    "规范化、dataclass、相等与哈希",
    "冻结运单的名称和重量，快照保持独立",
    "空名、空重量和非法重量被拒"
  ],
  "provider": [
    "声明结构协议与返回注解",
    "空批次不调用承运商",
    "更换运单与免费承运商",
    "非法金额立即拒绝，不再调用后续承运商",
    "结构协议声明运单参数类型",
    "保留承运商原异常，并停止后续报价",
    "中途非法金额立即停止后续报价",
    "替换普通承运商，顺序与调用数正确",
    "同名运单按实际顺序逐张报价"
  ],
  "stream": [
    "结构、零数量与bool边界",
    "完整读取保留原字段并关闭",
    "空源也关闭一次",
    "源获取失败保留原异常",
    "缺字段及所有非法字段统一报告格式错误",
    "坏JSON保留物理行号与原因",
    "只读到下一条结果，早停可关闭",
    "首次next前不打开，未开始可关闭",
    "读取故障保留同一个错误对象",
    "读取故障保留同一个异常对象，并关闭一次",
    "合法id字段原样保留，不能暗自规范化"
  ],
  "pipeline": [
    "关闭外层传递到源",
    "匹配不足上限时交出全部结果并关闭",
    "多条匹配按序交出，达到上限才关闭",
    "无匹配与上游失败也正确清理",
    "筛选失败保留原错误并关闭",
    "达到数量即关闭，坏尾部不读取",
    "未开始的管线关闭不打开源",
    "零上限不打开、不筛选；非法上限拒绝",
    "非法上限在迭代开始时拒绝"
  ]
};
