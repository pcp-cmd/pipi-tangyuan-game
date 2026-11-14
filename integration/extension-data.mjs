import { scaffoldLesson } from './course-learning-scaffolds.mjs';
import { INDEPENDENT_PRACTICE_LESSONS } from './independent-practice-data.mjs';
import { AE26_BRIDGE_LESSONS } from './ae26-bridge-data.mjs';

const RETAINED_EXTENSION_LESSONS = [
  {
    "id": "basics-values",
    "title": "看清文字和数字",
    "topic": "表达式 · 类型转换",
    "islandId": "harbor",
    "prerequisites": [
      "first-steps",
      "safe-buy"
    ],
    "recommendedBefore": [],
    "description": "实现 describe_count(text, extra)。text 是合法整数文本，extra 是整数。先转换text再相加，返回 (相加后的整数, 该整数的字符串)。不要把两段文字拼接当加法。",
    "starter": "def describe_count(text, extra):\n    return (0, \"\")\n",
    "solution": "def describe_count(text, extra):\n    total = int(text) + extra\n    return (total, str(total))\n",
    "checks": [
      [
        "文字先转换再运算",
        "__lesson_equal(describe_count(\"12\",3),(15,\"15\")) and __lesson_equal(describe_count(\" -2 \",5),(3,\"3\"))"
      ],
      [
        "零、负数和变化输入",
        "all(__lesson_equal(describe_count(str(a),b),(a+b,str(a+b))) for a in (0,-10,7,1000) for b in (-3,0,4))"
      ]
    ],
    "concept": "表达式产生值，类型决定运算含义。\"2\"+\"3\"拼成\"23\"，2+3得到5。int从合法文字恢复整数，str把值变成显示文字；tuple把两个相关结果一起返回。\n\n先在「买得起才出发」认识函数、参数和return。本课再加入tuple：圆括号中用逗号分隔的一组值，如(3, \"三\")，可以让函数一次交回两个相关结果。text和extra是本次调用的两个参数，return交回计算结果；print只用于观察。",
    "hint": "分三步，转换、相加、把同一个和转换成文字。",
    "workedExample": {
      "code": "print(\"2\" + \"3\")\nprint(int(\"2\") + 3)",
      "expected": "23\n5"
    },
    "typicalError": {
      "symptom": "先把extra转成字符串再拼接",
      "repair": "先在纸上标记两个加号两侧的类型。"
    },
    "alternative": "def describe_count(text, extra):\n    number = extra + int(text)\n    return number, f\"{number}\"\n",
    "badSolution": "def describe_count(text, extra):\n    return (int(text), text + str(extra))\n",
    "reward": 20,
    "xp": 20,
    "chapter": 0,
    "kind": "extension-practice",
    "language": "python",
    "capability": "browser-restricted-python",
    "assessmentVersion": 8,
    "contractVersion": 1,
    "boundary": "本课由游戏真实Python运行器验证。临时文件仅属于本次练习，不访问玩家文件；通过不代表陌生迁移或延时掌握。"
  },
  {
    "id": "basics-branches",
    "title": "按风力选行动",
    "topic": "if · elif · else",
    "islandId": "harbor",
    "prerequisites": [
      "safe-buy"
    ],
    "recommendedBefore": [
      "harbor-fare"
    ],
    "description": "实现 wind_action(speed)。speed 是非负整数。小于3返回\"sail\"，3至5返回\"wait\"，6及以上返回\"shelter\"。每次恰好返回一个行动。",
    "starter": "def wind_action(speed):\n    pass\n",
    "solution": "def wind_action(speed):\n    if speed < 3:\n        return \"sail\"\n    elif speed < 6:\n        return \"wait\"\n    else:\n        return \"shelter\"\n",
    "checks": [
      [
        "三个区间和两个阈值",
        "all(__lesson_equal(wind_action(n),\"sail\" if n<3 else \"wait\" if n<6 else \"shelter\") for n in (0,1,2,3,4,5,6,7,20))"
      ]
    ],
    "concept": "分支从上往下检查，elif只在前面未命中时检查。冒号标记代码块，缩进决定归属。return结束本次函数，因此一条路径只返回一个行动。",
    "hint": "分别代入2、3、5、6，写出第一条命中的条件。",
    "workedExample": {
      "code": "n = 4\nif n < 2:\n    print(\"低\")\nelif n < 5:\n    print(\"中\")\nelse:\n    print(\"高\")",
      "expected": "中"
    },
    "typicalError": {
      "symptom": "把边界写成<=3或<=6",
      "repair": "阈值本身属于后一段。"
    },
    "alternative": "def wind_action(speed):\n    if speed >= 6:\n        return \"shelter\"\n    if speed >= 3:\n        return \"wait\"\n    return \"sail\"\n",
    "badSolution": "def wind_action(speed):\n    return \"sail\" if speed <= 3 else \"wait\" if speed <= 6 else \"shelter\"\n",
    "reward": 20,
    "xp": 20,
    "chapter": 0,
    "kind": "extension-practice",
    "language": "python",
    "capability": "browser-restricted-python",
    "assessmentVersion": 8,
    "contractVersion": 1,
    "boundary": "本课由游戏真实Python运行器验证。临时文件仅属于本次练习，不访问玩家文件；通过不代表陌生迁移或延时掌握。"
  },
  {
    "id": "basics-while",
    "title": "遇到停牌再停下",
    "topic": "while · break · 终止",
    "islandId": "harbor",
    "prerequisites": [
      "shells",
      "safe-buy"
    ],
    "recommendedBefore": [
      "observatory-binary",
      "beacon-budget"
    ],
    "description": "实现 before_stop(values)。输入是整数列表，累加第一个负数之前的值；遇负数立即停止，0仍是数据。输入保持不变。",
    "starter": "def before_stop(values):\n    total = 0\n    return total\n",
    "solution": "def before_stop(values):\n    total = 0\n    index = 0\n    while index < len(values):\n        if values[index] < 0:\n            break\n        total += values[index]\n        index += 1\n    return total\n",
    "checks": [
      [
        "停止前的前缀和",
        "all(__lesson_equal(before_stop(v),e) for v,e in [([],0),([0,3,-1,9],3),([-1,4],0),([2,0,5],7),([4,-2,-3],4)])"
      ],
      [
        "保留输入且循环处理",
        "__lesson_unchanged(before_stop,[[1,0,2,-1,9]],3,[0])"
      ]
    ],
    "concept": "while先判断条件，再执行循环体。要能说明每轮如何接近终止，否则可能一直运行。break结束循环，continue只跳到下一轮；合法的0不等于停止标记。",
    "hint": "维护索引并在正常处理后加1；先判断负数，再累加。",
    "workedExample": {
      "code": "n = 3\nwhile n > 0:\n    print(n)\n    n -= 1",
      "expected": "3\n2\n1"
    },
    "typicalError": {
      "symptom": "漏更新索引或把0当停止",
      "repair": "分别追踪索引与累计值，并测试含0的输入。"
    },
    "alternative": "def before_stop(values):\n    total = 0\n    for value in values:\n        if value < 0:\n            break\n        total += value\n    return total\n",
    "badSolution": "def before_stop(values):\n    return sum(v for v in values if v >= 0)\n",
    "reward": 20,
    "xp": 20,
    "chapter": 0,
    "kind": "extension-practice",
    "language": "python",
    "capability": "browser-restricted-python",
    "assessmentVersion": 8,
    "contractVersion": 1,
    "boundary": "本课由游戏真实Python运行器验证。临时文件仅属于本次练习，不访问玩家文件；通过不代表陌生迁移或延时掌握。"
  },
  {
    "id": "basics-slices",
    "title": "截取一段航行记录",
    "topic": "切片 · 拆包 · enumerate",
    "islandId": "harbor",
    "prerequisites": [
      "backpack",
      "discount"
    ],
    "recommendedBefore": [
      "market-receipts",
      "market-ranking"
    ],
    "description": "实现 label_window(values, start, stop)。按Python切片[start:stop]选择元素，返回 [(原索引, 值), ...]；start/stop为非负整数，可以超出长度。输入保持不变。",
    "starter": "def label_window(values, start, stop):\n    return []\n",
    "solution": "def label_window(values, start, stop):\n    return [(index, value) for index, value in enumerate(values) if start <= index < stop]\n",
    "checks": [
      [
        "半开区间与原索引",
        "__lesson_equal(label_window([\"a\",\"b\",\"c\",\"d\"],1,3),[(1,\"b\"),(2,\"c\")])"
      ],
      [
        "空段、超界、重复值",
        "all(__lesson_equal(label_window(v,a,b),[(i,v[i]) for i in range(a,min(b,len(v)))]) for v,a,b in [([],0,3),([2,2,2],0,2),([1,2],1,9),([1],2,4),([1,2],2,1)])"
      ],
      [
        "原列表不变",
        "__lesson_unchanged(label_window,[[3,2,1],1,3],[(1,2),(2,1)],[0])"
      ]
    ],
    "concept": "切片右端不包含，越界切片会自动截短。enumerate同时给出索引和值；先切片再从0编号会丢掉原索引，需要指定start。拆包让每对值有清楚名字。",
    "hint": "可遍历全输入筛索引，也可切片后用enumerate(..., start)。",
    "workedExample": {
      "code": "letters = [\"a\", \"b\", \"c\", \"d\"]\nprint(letters[1:3])\nprint(list(enumerate(letters[1:3], 1)))",
      "expected": "['b', 'c']\n[(1, 'b'), (2, 'c')]"
    },
    "typicalError": {
      "symptom": "切片后索引从0重排",
      "repair": "原索引从start开始，而不是局部列表的位置。"
    },
    "alternative": "def label_window(values, start, stop):\n    return list(enumerate(values[start:stop],start))\n",
    "badSolution": "def label_window(values, start, stop):\n    return list(enumerate(values[start:stop]))\n",
    "reward": 20,
    "xp": 20,
    "chapter": 0,
    "kind": "extension-practice",
    "language": "python",
    "capability": "browser-restricted-python",
    "assessmentVersion": 8,
    "contractVersion": 1,
    "boundary": "本课由游戏真实Python运行器验证。临时文件仅属于本次练习，不访问玩家文件；通过不代表陌生迁移或延时掌握。"
  },
  {
    "id": "basics-scope",
    "title": "每次调用各有一张草稿",
    "topic": "局部变量 · return · 作用域",
    "islandId": "harbor",
    "prerequisites": [
      "discount",
      "shells"
    ],
    "recommendedBefore": [
      "workshop-closure"
    ],
    "description": "实现 running_total(values, initial=0)。返回从initial开始加上所有values的和。调用之间不能共享累计值；输入不变，空列表返回initial。",
    "starter": "def running_total(values, initial=0):\n    return initial\n",
    "solution": "def running_total(values, initial=0):\n    total = initial\n    for value in values:\n        total += value\n    return total\n",
    "checks": [
      [
        "调用之间独立",
        "__lesson_equal(running_total([2,3],10),15) and __lesson_equal(running_total([1]),1) and __lesson_equal(running_total([],7),7) and __lesson_equal(running_total([-4,0],2),-2)"
      ],
      [
        "关键字参数与输入保持",
        "__lesson_unchanged(running_total,[[1,2],4],7,[0]) and __lesson_equal(running_total([3],initial=9),12)"
      ]
    ],
    "concept": "函数参数与局部名字属于这次调用。局部total每次从initial建立，不依赖上一次运行留下的全局变量。返回值可以继续交给别的函数；只print不提供返回值。",
    "hint": "先给每次调用写出自己的initial和total，再顺序执行两次。",
    "workedExample": {
      "code": "value = 10\ndef add(value):\n    value += 1\n    return value\nprint(add(3), value)",
      "expected": "4 10"
    },
    "typicalError": {
      "symptom": "把累计值放在共享全局变量",
      "repair": "每次调用重新建立局部累加器；交错不同initial检查。"
    },
    "alternative": "def running_total(values, initial=0):\n    return initial + sum(values)\n",
    "badSolution": "total = 0\ndef running_total(values, initial=0):\n    global total\n    total += sum(values) + initial\n    return total\n",
    "reward": 20,
    "xp": 20,
    "chapter": 0,
    "kind": "extension-practice",
    "language": "python",
    "capability": "browser-restricted-python",
    "assessmentVersion": 8,
    "contractVersion": 1,
    "boundary": "本课由游戏真实Python运行器验证。临时文件仅属于本次练习，不访问玩家文件；通过不代表陌生迁移或延时掌握。"
  },
  {
    "id": "basics-arguments",
    "title": "把整份参数交给下一站",
    "topic": "*args · **kwargs · 仅关键字参数",
    "islandId": "workshop",
    "prerequisites": [
      "workshop-composition"
    ],
    "recommendedBefore": [
      "protocol-cache"
    ],
    "description": "实现 call_with_label(operation, *args, label=\"trip\", **kwargs)。把args与kwargs原样只调用一次operation，返回(label, 同一个调用结果对象)。label仅作为本函数标签，不传给operation。operation抛异常时原样传播。",
    "starter": "def call_with_label(operation, *args, label=\"trip\", **kwargs):\n    pass\n",
    "solution": "def call_with_label(operation, *args, label=\"trip\", **kwargs):\n    value = operation(*args, **kwargs)\n    return (label, value)\n",
    "checks": [
      [
        "位置、关键字与默认标签",
        "__lesson_extension(\"arguments\", call_with_label)"
      ]
    ],
    "concept": "*args收集多余位置参数为tuple，**kwargs收集多余关键字参数为dict。调用时的*和**反过来展开它们。*args之后的label只能通过关键字指定。函数签名本身会检查重复、缺失和非法参数。",
    "hint": "保存一次调用结果，再组装标签和结果；不要为了打印再调用一次。",
    "workedExample": {
      "code": "def show(*args, flag=False, **kwargs):\n    print(args, flag, kwargs)\nshow(1, 2, flag=True, name=\"皮皮\")",
      "expected": "(1, 2) True {'name': '皮皮'}"
    },
    "typicalError": {
      "symptom": "把kwargs作为一个位置字典传入",
      "repair": "调用使用operation(*args, **kwargs)，保留原有参数形状。"
    },
    "alternative": "def call_with_label(operation, *args, label=\"trip\", **kwargs):\n    return label, operation(*args, **kwargs)\n",
    "badSolution": "def call_with_label(operation, *args, label=\"trip\", **kwargs):\n    return label, operation(args, kwargs)\n",
    "reward": 20,
    "xp": 20,
    "chapter": 3,
    "kind": "extension-practice",
    "language": "python",
    "capability": "browser-restricted-python",
    "assessmentVersion": 8,
    "contractVersion": 1,
    "boundary": "本课由游戏真实Python运行器验证。临时文件仅属于本次练习，不访问玩家文件；通过不代表陌生迁移或延时掌握。"
  },
  {
    "id": "basics-recursion",
    "title": "数清嵌套的货箱",
    "topic": "递归 · 基例 · 调用栈",
    "islandId": "workshop",
    "prerequisites": [
      "basics-scope",
      "backpack"
    ],
    "recommendedBefore": [],
    "description": "实现 sum_crates(tree)。tree是整数或嵌套列表，只含整数和列表，深度不超过20。返回所有整数之和，空列表为0；不得修改输入。允许递归或显式栈。",
    "starter": "def sum_crates(tree):\n    pass\n",
    "solution": "def sum_crates(tree):\n    if type(tree) is int:\n        return tree\n    return sum(sum_crates(child) for child in tree)\n",
    "checks": [
      [
        "叶子、空容器和多层嵌套",
        "all(__lesson_equal(sum_crates(tree),value) for tree,value in [(4,4),([],0),([1,[2,[],[-3]],4],4),([[0],[5,[6]]],11)])"
      ],
      [
        "输入与调用独立",
        "__lesson_unchanged(sum_crates,[[2,[3,-1]]],4,[0]) and sum_crates([9]) == 9"
      ]
    ],
    "concept": "递归把同一个问题缩小后再调用自己。整数叶子直接返回，是终止基例；列表将子问题的结果相加。每条路径最终到叶子或空列表，才能保证结束。",
    "hint": "先处理整数，再处理列表；用[1,[2,3]]画三次叶子返回。",
    "workedExample": {
      "code": "def size(tree):\n    if type(tree) is int:\n        return 1\n    return sum(size(child) for child in tree)\nprint(size([1, [2, 3]]))",
      "expected": "3"
    },
    "typicalError": {
      "symptom": "只有递归没有整数基例",
      "repair": "每次调用先问输入是否已经是最小问题。"
    },
    "alternative": "def sum_crates(tree):\n    stack = [tree]\n    total = 0\n    while stack:\n        value = stack.pop()\n        if type(value) is int:\n            total += value\n        else:\n            stack.extend(value)\n    return total\n",
    "badSolution": "def sum_crates(tree):\n    return sum(tree)\n",
    "reward": 20,
    "xp": 20,
    "chapter": 3,
    "kind": "extension-practice",
    "language": "python",
    "capability": "browser-restricted-python",
    "assessmentVersion": 8,
    "contractVersion": 1,
    "boundary": "本课由游戏真实Python运行器验证。临时文件仅属于本次练习，不访问玩家文件；通过不代表陌生迁移或延时掌握。"
  },
  {
    "id": "engineering-imports",
    "title": "给工具取清楚的名字",
    "topic": "模块 · import · 标准库",
    "islandId": "archive",
    "prerequisites": [
      "discount"
    ],
    "recommendedBefore": [
      "archive-distance"
    ],
    "description": "实现 rope_length(x,y)。int/float坐标表示直角两边，绝对值不超过1e308，返回 math.hypot(x,y) 的距离。使用标准库计算，不重新写易溢出的平方和。",
    "starter": "import math\n\ndef rope_length(x, y):\n    pass\n",
    "solution": "import math\n\ndef rope_length(x, y):\n    return math.hypot(x, y)\n",
    "checks": [
      [
        "正常值与变化输入",
        "all(__lesson_numeric(rope_length(x,y),v) for x,y,v in [(3,4,5),(0,0,0),(-5,12,13),(0.3,0.4,0.5)])"
      ],
      [
        "极大和极小有限值",
        "__lesson_numeric(rope_length(1e308,0),1e308) and __lesson_equal(rope_length(5e-324,0),5e-324)"
      ]
    ],
    "concept": "模块为相关工具提供命名空间。import math后用math.hypot；from math import hypot只把指定名字放入当前空间。别名可以减少冲突。标准库无需安装，本游戏只开放列出的模块接口。",
    "hint": "阅读hypot的输入输出，再用负坐标与很大数值检查。",
    "workedExample": {
      "code": "from math import hypot as distance\nprint(distance(6, 8))",
      "expected": "10.0"
    },
    "typicalError": {
      "symptom": "局部变量也叫math，覆盖导入模块",
      "repair": "为数据取业务名字，让模块名保持指向工具。"
    },
    "alternative": "from math import hypot as distance\ndef rope_length(x, y):\n    return distance(x,y)\n",
    "badSolution": "def rope_length(x,y):\n    return (x*x+y*y)**0.5\n",
    "reward": 20,
    "xp": 20,
    "chapter": 3,
    "kind": "extension-practice",
    "language": "python",
    "capability": "browser-restricted-python",
    "assessmentVersion": 8,
    "contractVersion": 1,
    "boundary": "本课由游戏真实Python运行器验证。临时文件仅属于本次练习，不访问玩家文件；通过不代表陌生迁移或延时掌握。"
  },
  {
    "id": "numeric-ratios",
    "title": "把小数写成精确比值",
    "topic": "Fraction · 数值边界 · 精确中点",
    "islandId": "archive",
    "prerequisites": [
      "engineering-imports",
      "basics-slices"
    ],
    "recommendedBefore": [
      "archive-median",
      "archive-distance"
    ],
    "description": "实现 midpoint_ratio(a,b)。a/b是有限int或float，返回它们精确平均值的最简整数比(numerator,denominator)，denominator必须为正。不先转float；浮点按它实际存储的二进制数值计算。",
    "starter": "from fractions import Fraction\n\ndef midpoint_ratio(a, b):\n    pass\n",
    "solution": "from fractions import Fraction\n\ndef midpoint_ratio(a, b):\n    middle = (Fraction(a) + Fraction(b)) / 2\n    return (middle.numerator, middle.denominator)\n",
    "checks": [
      [
        "整数、分数与异号抵消",
        "__lesson_extension(\"ratios\", midpoint_ratio)"
      ]
    ],
    "concept": "有限浮点可用as_integer_ratio还原实际存储值。a/b与c/d的平均是(ad+cb)/(2bd)，整数乘加不会先溢出成无穷。Fraction代做约分与符号统一；Fraction(0.1)与Fraction(\"0.1\")含义不同，前者保存实际二进制浮点值。",
    "hint": "先把两个输入各变成Fraction，求平均后读取numerator和denominator。",
    "workedExample": {
      "code": "from fractions import Fraction\nvalue = (Fraction(3) + Fraction(4)) / 2\nprint(value.numerator, value.denominator)\nprint((0.5).as_integer_ratio())",
      "expected": "7 2\n(1, 2)"
    },
    "typicalError": {
      "symptom": "先做(a+b)/2已经发生溢出才转Fraction",
      "repair": "先转换每个输入，再进行加法和除法。"
    },
    "alternative": "import math\ndef midpoint_ratio(a,b):\n    p,q=(a,1) if type(a) is int else a.as_integer_ratio()\n    r,s=(b,1) if type(b) is int else b.as_integer_ratio()\n    top,bot=p*s+r*q,2*q*s\n    factor=math.gcd(top,bot)\n    return top//factor,bot//factor\n",
    "badSolution": "from fractions import Fraction\ndef midpoint_ratio(a,b):\n    mid=Fraction((a+b)/2)\n    return mid.numerator,mid.denominator\n",
    "reward": 20,
    "xp": 20,
    "chapter": 3,
    "kind": "extension-practice",
    "language": "python",
    "capability": "browser-restricted-python",
    "assessmentVersion": 8,
    "contractVersion": 1,
    "boundary": "本课由游戏真实Python运行器验证。临时文件仅属于本次练习，不访问玩家文件；通过不代表陌生迁移或延时掌握。"
  },
  {
    "id": "engineering-annotations",
    "title": "注解不会替你验货",
    "topic": "类型标注 · 运行时验证",
    "islandId": "workshop",
    "prerequisites": [
      "basics-values",
      "invalid-input"
    ],
    "recommendedBefore": [
      "protocol-provider",
      "protocol-shipment"
    ],
    "description": "定义 scale(amount: int, factor: int = 2) -> int。只接受严格整数，bool也拒绝并抛TypeError；负数抛ValueError；其余返回乘积。保留两个参数和返回值的int注解。",
    "starter": "def scale(amount: int, factor: int = 2) -> int:\n    pass\n",
    "solution": "def scale(amount: int, factor: int = 2) -> int:\n    if type(amount) is not int or type(factor) is not int:\n        raise TypeError(\"integers required\")\n    if amount < 0 or factor < 0:\n        raise ValueError(\"nonnegative values required\")\n    return amount * factor\n",
    "checks": [
      [
        "注解、默认值、合法输入和拒绝边界",
        "__lesson_extension(\"annotations\", scale)"
      ]
    ],
    "concept": "注解为读者和静态工具描述意图，Python调用不会自动按注解检查。运行边界必须明确验证。TypeError表示种类不合，ValueError表示种类正确但值不合法。",
    "hint": "先检查两个类型，再检查非负，最后计算；不要用isinstance接受bool。",
    "workedExample": {
      "code": "def echo(value: int) -> int:\n    return value\nprint(echo(\"文字仍会进入函数\"))",
      "expected": "文字仍会进入函数"
    },
    "typicalError": {
      "symptom": "以为写了int注解会自动拒绝字符串",
      "repair": "分别写一组错误类型与错误范围测试，观察真实异常。"
    },
    "alternative": "def scale(amount:int,factor:int=2)->int:\n    for value in (amount,factor):\n        if type(value) is not int:\n            raise TypeError(\"integer\")\n        if value < 0:\n            raise ValueError(\"negative\")\n    return amount*factor\n",
    "badSolution": "def scale(amount:int,factor:int=2)->int:\n    return amount*factor\n",
    "reward": 20,
    "xp": 20,
    "chapter": 3,
    "kind": "extension-practice",
    "language": "python",
    "capability": "browser-restricted-python",
    "assessmentVersion": 8,
    "contractVersion": 1,
    "boundary": "本课由游戏真实Python运行器验证。临时文件仅属于本次练习，不访问玩家文件；通过不代表陌生迁移或延时掌握。"
  },
  {
    "id": "engineering-dataclass",
    "title": "制作不可变坐标卡",
    "topic": "dataclass · frozen · post_init · hash",
    "islandId": "workshop",
    "prerequisites": [
      "stock-class",
      "engineering-annotations"
    ],
    "recommendedBefore": [
      "protocol-shipment"
    ],
    "description": "定义 @dataclass(frozen=True) 的 Coordinate，字段 x:int 与 y:int。构造时二者必须为严格int，其他类型抛TypeError。相同坐标相等且哈希一致，普通属性赋值被拒绝。",
    "starter": "from dataclasses import dataclass\n\n@dataclass(frozen=True)\nclass Coordinate:\n    x: int\n    y: int\n",
    "solution": "from dataclasses import dataclass\n\n@dataclass(frozen=True)\nclass Coordinate:\n    x: int\n    y: int\n\n    def __post_init__(self):\n        if type(self.x) is not int or type(self.y) is not int:\n            raise TypeError(\"integer coordinates required\")\n",
    "checks": [
      [
        "字段、冻结、相等哈希和严格类型",
        "__lesson_extension(\"dataclass\", Coordinate)"
      ]
    ],
    "concept": "dataclass根据字段生成构造和比较方法。frozen拒绝普通字段赋值，并在满足条件时生成hash。生成的__init__随后调用你定义的__post_init__，这里适合验证；注解不会替你检查类型。",
    "hint": "先看默认生成的行为，再在__post_init__中验证两个字段。",
    "workedExample": {
      "code": "from dataclasses import dataclass\n@dataclass(frozen=True)\nclass Label:\n    name: str\nprint(Label(\"灯\") == Label(\"灯\"))\nprint(len({Label(\"灯\"), Label(\"灯\")}))",
      "expected": "True\n1"
    },
    "typicalError": {
      "symptom": "遗漏post_init，True仍可构造",
      "repair": "冻结只管后续赋值，初始值仍需独立校验。"
    },
    "alternative": "from dataclasses import dataclass\n@dataclass(frozen=True)\nclass Coordinate:\n    x:int\n    y:int\n    def __post_init__(self):\n        for value in (self.x,self.y):\n            if type(value) != int:\n                raise TypeError(\"integer coordinate\")\n",
    "badSolution": "from dataclasses import dataclass\n@dataclass(frozen=True)\nclass Coordinate:\n    x:int\n    y:int\n",
    "reward": 20,
    "xp": 20,
    "chapter": 3,
    "kind": "extension-practice",
    "language": "python",
    "capability": "browser-restricted-python",
    "assessmentVersion": 8,
    "contractVersion": 1,
    "boundary": "本课由游戏真实Python运行器验证。临时文件仅属于本次练习，不访问玩家文件；通过不代表陌生迁移或延时掌握。"
  },
  {
    "id": "engineering-files",
    "title": "读完账本再写报告",
    "topic": "文件I/O · with · UTF-8",
    "islandId": "archive",
    "prerequisites": [
      "invalid-input",
      "basics-scope"
    ],
    "recommendedBefore": [
      "protocol-lifecycle"
    ],
    "description": "实现 summarize_file(source_path,target_path,open_file)。用提供的open_file读取UTF-8文本，忽略空白行，将其余行转int，写出 count=N\\ntotal=S\\n 到target_path并返回(N,S)。读完且解析全部成功后才写报告；坏行抛ValueError，保留旧报告；所有已打开文件必须关闭。open_file是本次临时工作区里的真实文件入口，接口与open相同。",
    "starter": "def summarize_file(source_path, target_path, open_file):\n    pass\n",
    "solution": "def summarize_file(source_path, target_path, open_file):\n    count, total = 0, 0\n    with open_file(source_path, \"r\", encoding=\"utf-8\") as source:\n        for line in source:\n            if line.strip():\n                total += int(line)\n                count += 1\n    with open_file(target_path, \"w\", encoding=\"utf-8\") as target:\n        target.write(f\"count={count}\\ntotal={total}\\n\")\n    return count, total\n",
    "checks": [
      [
        "变化文件、空行、覆盖写和UTF-8",
        "__lesson_extension(\"files-normal\", summarize_file)"
      ],
      [
        "坏行保旧报告并关闭读取资源",
        "__lesson_extension(\"files-error\", summarize_file)"
      ]
    ],
    "concept": "文件对象有读取位置，for逐行读取；with负责离开范围时关闭。r读取，w覆盖写，UTF-8明确文字编码。先验证输入再打开输出，可避免坏输入先清空旧文件。浏览器文件在每次运行的临时目录里，不是你的系统磁盘。",
    "hint": "读与写用两个with；只有读循环成功结束才进入写范围。",
    "workedExample": {
      "code": "from io import StringIO\nwith StringIO(\"2\\n5\\n\") as source:\n    print(sum(int(line) for line in source))\nprint(source.closed)",
      "expected": "7\nTrue"
    },
    "typicalError": {
      "symptom": "刚开始就用w打开目标，坏行导致旧报告消失",
      "repair": "把所有读取和转换放在写入之前，使用with确保异常退出仍关闭。"
    },
    "alternative": "def summarize_file(source_path,target_path,open_file):\n    with open_file(source_path,encoding=\"utf-8\") as f:\n        values=[int(line) for line in f if line.strip()]\n    result=(len(values),sum(values))\n    with open_file(target_path,\"w\",encoding=\"utf-8\") as f:\n        f.write(\"count={}\\ntotal={}\\n\".format(*result))\n    return result\n",
    "badSolution": "def summarize_file(source_path,target_path,open_file):\n    f=open_file(target_path,\"w\",encoding=\"utf-8\")\n    return 0,0\n",
    "reward": 20,
    "xp": 20,
    "chapter": 3,
    "kind": "extension-practice",
    "language": "python",
    "capability": "browser-restricted-python",
    "assessmentVersion": 8,
    "contractVersion": 1,
    "boundary": "本课由游戏真实Python运行器验证。临时文件仅属于本次练习，不访问玩家文件；通过不代表陌生迁移或延时掌握。"
  },
  {
    "id": "engineering-csv",
    "title": "逗号也可能在名字里",
    "topic": "CSV · 引号 · 数据校验",
    "islandId": "archive",
    "prerequisites": [
      "market-receipts",
      "engineering-files"
    ],
    "recommendedBefore": [
      "engineering-report"
    ],
    "description": "实现 csv_totals(text)。CSV表头必须按顺序恰好是item,qty。逐行汇总qty整数，可含退货负数；item必须是非空白字符串且保留原文。缺字段、多字段、坏数量、坏表头或损坏的CSV引号抛ValueError；包括未闭引号，以及关闭引号后多出字符。空数据但有表头返回{}。使用csv模块处理引号中的逗号与换行。",
    "starter": "import csv\nfrom io import StringIO\n\ndef csv_totals(text):\n    pass\n",
    "solution": "import csv\nfrom io import StringIO\n\ndef csv_totals(text):\n    reader = csv.DictReader(StringIO(text, newline=\"\"), strict=True)\n    result = {}\n    try:\n        if reader.fieldnames != [\"item\", \"qty\"]:\n            raise ValueError(\"header\")\n        for row in reader:\n            if set(row) != {\"item\", \"qty\"} or row[\"item\"] is None or not row[\"item\"].strip() or row[\"qty\"] is None:\n                raise ValueError(\"row\")\n            qty = int(row[\"qty\"])\n            result[row[\"item\"]] = result.get(row[\"item\"], 0) + qty\n    except csv.Error as error:\n        raise ValueError(\"csv\") from error\n    return result\n",
    "checks": [
      [
        "引号、换行、重复商品和退货",
        "__lesson_extension(\"csv-normal\", csv_totals)"
      ],
      [
        "结构和坏数量必须可见",
        "__lesson_extension(\"csv-error\", csv_totals)"
      ]
    ],
    "concept": "CSV不是简单split逗号。引号可把逗号或换行包含在同一字段，DictReader用表头映射字段。解析成功后还要验证结构与业务值；newline=\"\"让csv模块管理行结束。 设置strict=True，让损坏的引号抛csv.Error；例如字段“灯”关闭引号后紧接x，不是合法字段。用try包住表头读取和整个迭代，再把csv.Error转为ValueError，统一函数对外的错误合同。",
    "hint": "先验证fieldnames，再逐行验证键与缺值，最后转换数量并累计。",
    "workedExample": {
      "code": "import csv\nfrom io import StringIO\nrows = list(csv.reader(StringIO(\"name,qty\\n\\\"红,蓝\\\",2\\n\")))\nprint(rows[1])",
      "expected": "['红,蓝', '2']"
    },
    "typicalError": {
      "symptom": "split(\",\")把带逗号名字拆坏",
      "repair": "把格式边界交给csv.reader或DictReader，再验证值。"
    },
    "alternative": "import csv\nfrom io import StringIO\ndef csv_totals(text):\n    rows=csv.reader(StringIO(text,newline=\"\"),strict=True)\n    result={}\n    try:\n        if next(rows,None) != [\"item\",\"qty\"]:\n            raise ValueError(\"header\")\n        for row in rows:\n            if not row:\n                continue\n            if len(row)!=2 or not row[0].strip():\n                raise ValueError(\"row\")\n            name,raw=row\n            result[name]=result.get(name,0)+int(raw)\n    except csv.Error as error:\n        raise ValueError(\"csv\") from error\n    return result\n",
    "badSolution": "def csv_totals(text):\n    result={}\n    for line in text.splitlines()[1:]:\n        name,qty=line.split(\",\")\n        result[name]=int(qty)\n    return result\n",
    "reward": 20,
    "xp": 20,
    "chapter": 3,
    "kind": "extension-practice",
    "language": "python",
    "capability": "browser-restricted-python",
    "assessmentVersion": 8,
    "contractVersion": 1,
    "boundary": "本课由游戏真实Python运行器验证。临时文件仅属于本次练习，不访问玩家文件；通过不代表陌生迁移或延时掌握。"
  },
  {
    "id": "engineering-cli",
    "title": "把命令参数变成配置",
    "topic": "argparse · 命令行边界",
    "islandId": "observatory",
    "prerequisites": [
      "basics-arguments",
      "invalid-input"
    ],
    "recommendedBefore": [
      "engineering-report"
    ],
    "description": "实现 parse_options(argv)。argv是命令参数字符串列表。--name必填；--count可选整数默认1且非负；--upper是开关。返回{name:原名或upper后名字,count:整数}。坏参数统一抛ValueError，不退出程序。不要读取真实进程命令行。",
    "starter": "import argparse\n\ndef parse_options(argv):\n    pass\n",
    "solution": "import argparse\n\ndef parse_options(argv):\n    parser = argparse.ArgumentParser(add_help=False, exit_on_error=False)\n    parser.add_argument(\"--name\", required=True)\n    parser.add_argument(\"--count\", type=int, default=1)\n    parser.add_argument(\"--upper\", action=\"store_true\")\n    try:\n        options = parser.parse_args(argv)\n    except (argparse.ArgumentError, SystemExit) as error:\n        raise ValueError(\"arguments\") from error\n    if options.count < 0:\n        raise ValueError(\"negative count\")\n    return {\"name\": options.name.upper() if options.upper else options.name, \"count\": options.count}\n",
    "checks": [
      [
        "参数次序、默认值、开关和零值",
        "__lesson_extension(\"cli-normal\", parse_options)"
      ],
      [
        "缺参数、坏数字和未知选项",
        "__lesson_extension(\"cli-error\", parse_options)"
      ]
    ],
    "concept": "命令行程序收到字符串参数，argparse负责选择项、类型转换和帮助结构。给parse_args传入argv可测试而不依赖当前进程。格式错误、类型错误和业务范围是三种边界；本练习将其统一为ValueError供调用者处理。",
    "hint": "先配置parser，再解析传入列表；count转换后还需检查非负。",
    "workedExample": {
      "code": "import argparse\nparser = argparse.ArgumentParser()\nparser.add_argument(\"--size\", type=int, default=2)\nprint(parser.parse_args([\"--size\", \"5\"]).size)",
      "expected": "5"
    },
    "typicalError": {
      "symptom": "parse_args()不传argv读取运行器自己的参数",
      "repair": "显式解析函数的输入列表，让测试和真实调用各有自己的参数。"
    },
    "alternative": "import argparse\ndef parse_options(argv):\n    p=argparse.ArgumentParser(add_help=False,exit_on_error=False)\n    p.add_argument(\"--count\",default=1,type=int)\n    p.add_argument(\"--upper\",action=\"store_true\")\n    p.add_argument(\"--name\",required=True)\n    try:\n        o=p.parse_args(list(argv))\n    except (SystemExit,argparse.ArgumentError):\n        raise ValueError(\"invalid\")\n    if o.count<0:\n        raise ValueError(\"negative\")\n    name=o.name\n    if o.upper:\n        name=name.upper()\n    return dict(name=name,count=o.count)\n",
    "badSolution": "def parse_options(argv):\n    return {\"name\":argv[1],\"count\":1}\n",
    "reward": 20,
    "xp": 20,
    "chapter": 3,
    "kind": "extension-practice",
    "language": "python",
    "capability": "browser-restricted-python",
    "assessmentVersion": 8,
    "contractVersion": 1,
    "boundary": "本课由游戏真实Python运行器验证。临时文件仅属于本次练习，不访问玩家文件；通过不代表陌生迁移或延时掌握。"
  },
  {
    "id": "engineering-tests",
    "title": "给工具写一组回归测试",
    "topic": "测试组织 · 正反例 · 变异检验",
    "islandId": "observatory",
    "prerequisites": [
      "test-case",
      "basics-arguments"
    ],
    "recommendedBefore": [
      "engineering-report"
    ],
    "description": "实现 check_discount(candidate)。candidate(price,percent)应返回price*(1-percent/100)，price非负、percent在0至100。你的函数对正确实现不抛错；对恒返回80、把百分数当金额、使用整除、漏掉100%四种错解必须抛AssertionError。测试必须调用candidate，不能自己替它计算后假装检查。",
    "starter": "def check_discount(candidate):\n    pass\n",
    "solution": "def check_discount(candidate):\n    for price, percent in [(100,20),(7,25),(35,0),(9,100),(0,50)]:\n        expected = price * (1 - percent / 100)\n        assert abs(candidate(price, percent) - expected) < 1e-9\n",
    "checks": [
      [
        "正确替代实现被接受，四种错解被拒绝",
        "__lesson_extension(\"tests\", check_discount)"
      ]
    ],
    "concept": "把测试组织成接收候选函数的函数，可复用同一组案例检查多种实现。断言比较观察到的结果和独立期望；每个用例应有能揭露的错误。变异检查说明测试能抓住指定缺陷，不证明无所有错误。",
    "hint": "让分数价格、零折扣、全折扣各负责一条边界，再对已知错解运行。",
    "workedExample": {
      "code": "def verify(fn):\n    assert fn(3) == 6\n    assert fn(0) == 0\nverify(lambda n: n * 2)\nprint(\"通过\")",
      "expected": "通过"
    },
    "typicalError": {
      "symptom": "只写assert True或仅测100打八折",
      "repair": "先写出四种错解在哪个输入上与正确公式不同。"
    },
    "alternative": "def check_discount(candidate):\n    for p,d,e in [(10,20,8),(7,25,5.25),(35,0,35),(9,100,0),(0,20,0)]:\n        if abs(candidate(p,d)-e)>1e-9:\n            raise AssertionError(\"discount mismatch\")\n",
    "badSolution": "def check_discount(candidate):\n    assert candidate(100,20)==80\n",
    "reward": 20,
    "xp": 20,
    "chapter": 3,
    "kind": "extension-practice",
    "language": "python",
    "capability": "browser-restricted-python",
    "assessmentVersion": 8,
    "contractVersion": 1,
    "boundary": "本课由游戏真实Python运行器验证。临时文件仅属于本次练习，不访问玩家文件；通过不代表陌生迁移或延时掌握。"
  },
  {
    "id": "engineering-report",
    "title": "交付一份可复查的货运报告",
    "topic": "文件 · CSV · JSON · 综合项目",
    "islandId": "observatory",
    "prerequisites": [
      "engineering-csv",
      "engineering-cli",
      "engineering-tests"
    ],
    "recommendedBefore": [],
    "description": "实现 cargo_report(source_path,target_path,open_file)。读取真实UTF-8 CSV文件，表头item,qty；按商品累计整数数量并保留零与负数。名称非空白且原样保留，坏行、坏表头和损坏CSV引号（未闭引号、关闭引号后多出字符）抛ValueError。全部校验后写JSON对象到目标并返回同一数据。坏输入必须保留原目标内容，所有文件关闭。可自行分成解析、汇总和写出函数。",
    "starter": "import csv\nimport json\n\ndef cargo_report(source_path, target_path, open_file):\n    pass\n",
    "solution": "import csv\nimport json\n\ndef cargo_report(source_path, target_path, open_file):\n    result = {}\n    with open_file(source_path, \"r\", encoding=\"utf-8\", newline=\"\") as source:\n        reader = csv.DictReader(source, strict=True)\n        try:\n            if reader.fieldnames != [\"item\", \"qty\"]:\n                raise ValueError(\"header\")\n            for row in reader:\n                if set(row) != {\"item\", \"qty\"} or row[\"item\"] is None or not row[\"item\"].strip() or row[\"qty\"] is None:\n                    raise ValueError(\"row\")\n                qty = int(row[\"qty\"])\n                result[row[\"item\"]] = result.get(row[\"item\"], 0) + qty\n        except csv.Error as error:\n            raise ValueError(\"csv\") from error\n    with open_file(target_path, \"w\", encoding=\"utf-8\") as target:\n        target.write(json.dumps(result, ensure_ascii=False))\n    return result\n",
    "checks": [
      [
        "真实文件变化输入与可解码JSON报告",
        "__lesson_extension(\"report-normal\", cargo_report)"
      ],
      [
        "坏输入不覆盖旧报告，资源均关闭",
        "__lesson_extension(\"report-error\", cargo_report)"
      ]
    ],
    "concept": "综合任务要先写数据流和失败边界。读取与解析完成后得到已验证的内存数据，再序列化写出。函数分层可以让纯解析单独测试，文件函数只负责打开与关闭；本课验证临时文件中的真实字节，尚不包含系统安装与多文件打包。 与CSV课相同，使用strict=True并将表头读取及行迭代产生的csv.Error转为ValueError；写文件必须放在全部校验之后，避免坏引号破坏原报告。",
    "hint": "复用你自己理解后的CSV规则，先在内存形成result，最后才打开目标。",
    "workedExample": {
      "code": "import csv, json\nfrom io import StringIO\nrows = csv.DictReader(StringIO(\"item,qty\\n灯,2\\n\"))\nresult = {r[\"item\"]: int(r[\"qty\"]) for r in rows}\nprint(json.dumps(result, ensure_ascii=False))",
      "expected": "{\"灯\": 2}"
    },
    "typicalError": {
      "symptom": "边解析边写出导致中途坏行留下部分报告",
      "repair": "将验证和提交分开，用已有目标文本作为失败保护测试。"
    },
    "alternative": "import csv,json\ndef cargo_report(source_path,target_path,open_file):\n    try:\n        with open_file(source_path,encoding=\"utf-8\",newline=\"\") as f:\n            rows=list(csv.reader(f,strict=True))\n    except csv.Error as error:\n        raise ValueError(\"csv\") from error\n    if not rows or rows[0]!=[\"item\",\"qty\"]:\n        raise ValueError(\"header\")\n    data={}\n    for row in rows[1:]:\n        if not row:\n            continue\n        if len(row)!=2 or not row[0].strip():\n            raise ValueError(\"row\")\n        name,raw=row\n        data[name]=data.get(name,0)+int(raw)\n    with open_file(target_path,\"w\",encoding=\"utf-8\") as f:\n        f.write(json.dumps(data))\n    return data\n",
    "badSolution": "import json\ndef cargo_report(source_path,target_path,open_file):\n    with open_file(target_path,\"w\",encoding=\"utf-8\") as f:\n        f.write(\"{}\")\n    return {}\n",
    "reward": 20,
    "xp": 20,
    "chapter": 3,
    "kind": "extension-practice",
    "language": "python",
    "capability": "browser-restricted-python",
    "assessmentVersion": 8,
    "contractVersion": 1,
    "boundary": "本课由游戏真实Python运行器验证。临时文件仅属于本次练习，不访问玩家文件；通过不代表陌生迁移或延时掌握。"
  }
];
export const EXTENSION_LESSONS = [...RETAINED_EXTENSION_LESSONS, ...INDEPENDENT_PRACTICE_LESSONS, ...AE26_BRIDGE_LESSONS].map(scaffoldLesson);
export const EXTENSION_IDS = Object.freeze(EXTENSION_LESSONS.map(lesson => lesson.id));
export const EXTENSION_PREREQUISITES = EXTENSION_LESSONS.map(lesson => ({ id: lesson.id, requires: [...lesson.prerequisites], source: 'learning-curriculum-20261114' }));
export const EXTENSION_PRESENTATIONS = EXTENSION_LESSONS.map(lesson => [lesson.id,
  lesson.islandId === 'harbor' ? 'bench' : lesson.islandId === 'market' ? 'warehouse' : lesson.islandId === 'workshop' ? 'clockworks' : lesson.islandId === 'archive' ? 'records' : 'summit',
  lesson.islandId === 'harbor' ? '基础练习台' : lesson.islandId === 'market' ? '货栈实践台' : lesson.islandId === 'workshop' ? '工具试制台' : lesson.islandId === 'archive' ? '文件阅览台' : '交付验证台',
  lesson.title, ['book','gear','forward']]);
