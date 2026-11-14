export const INDEPENDENT_PRACTICE_LESSONS = [
  {
    "id": "debugging-index",
    "title": "修好队尾的报错",
    "topic": "排错 · traceback · 最小反例",
    "islandId": "harbor",
    "prerequisites": [
      "basics-slices",
      "invalid-input"
    ],
    "recommendedBefore": [],
    "description": "修复 shift_left(values)。把有限列表的第一项移到最后并返回新列表；空列表返回[]，单项保持原值。不要修改输入。起始代码含真实的 IndexError：先运行，读出报错行，再用两项列表和空列表分别定位。修复后不仅要消除异常，还要保留每一项。",
    "starter": "def shift_left(values):\n    result = []\n    for index in range(1, len(values) + 1):\n        result.append(values[index])\n    result.append(values[0])\n    return result\n",
    "solution": "def shift_left(values):\n    if not values:\n        return []\n    return values[1:] + values[:1]\n",
    "alternative": "def shift_left(values):\n    result = list(values)\n    if result:\n        first = result.pop(0)\n        result.append(first)\n    return result\n",
    "badSolution": "def shift_left(values):\n    return list(values[1:])\n",
    "checks": [
      [
        "两项与单项的顺序",
        "__lesson_equal(shift_left(['灯','绳']),['绳','灯']) and __lesson_equal(shift_left([0]),[0])"
      ],
      [
        "空输入也有明确结果",
        "__lesson_equal(shift_left([]),[])"
      ],
      [
        "重复项、假值和原列表均保留",
        "__lesson_unchanged(shift_left,[[0,False,None,'',0]],[False,None,'',0,0],[0])"
      ],
      [
        "不同长度都只轮转一次",
        "all(__lesson_equal(shift_left(list(range(n))),list(range(1,n))+([0] if n else [])) for n in range(10))"
      ],
      [
        "每种长度都返回独立的新列表",
        "__lesson_extension('rotation-new-list', shift_left)"
      ]
    ],
    "concept": "排错先区分异常与错误结果。traceback最后一条与你代码有关的行告诉你失败位置，异常名称告诉你失败种类；前面的调用链解释它是怎样被触发的。IndexError通常表示索引越界，SyntaxError则发生在代码还未执行时。把大输入缩成仍会失败的最小输入，再追踪索引和值。\n\n列表长度为n时，合法非负索引为0到n-1。range的stop不包含在输出里。修掉越界后还要复验空输入，因为values[0]对空列表仍无效。不要用广泛except掩盖错误或静默丢掉最后一项。",
    "hint": "用两项列表手动列出循环会访问的索引。",
    "hintLevels": [
      {
        "level": 1,
        "title": "想一想",
        "text": "用两项列表手动列出循环会访问的索引。"
      },
      {
        "level": 2,
        "title": "分步检查",
        "text": "先核对range右端，再单独考虑没有第一项的输入。"
      },
      {
        "level": 3,
        "title": "具体帮助",
        "text": "可以组合两个切片，或先复制再移动；两种方式都要返回新列表。"
      }
    ],
    "workedExample": {
      "code": "values = [8, 3]\nprint(len(values))\nprint(list(range(1, len(values))))\nprint(values[1])",
      "expected": "2\n[1]\n3"
    },
    "typicalError": {
      "symptom": "把所有异常吞掉后返回不完整列表",
      "repair": "先给两项输入写期望，再检查空输入；每个输入元素都应有且只有一个输出位置。"
    },
    "reward": 20,
    "xp": 20,
    "chapter": 0,
    "kind": "extension-practice",
    "practiceKind": "debugging",
    "transferFrom": [],
    "language": "python",
    "capability": "browser-restricted-python",
    "assessmentVersion": 9,
    "contractVersion": 2,
    "boundary": "通过记录只说明本次代码满足给定合同。真人解释、换题应用与延时保持需要另行观察。"
  },
  {
    "id": "debugging-return",
    "title": "找回漏掉的后半段",
    "topic": "排错 · 缩进 · 过早 return",
    "islandId": "harbor",
    "prerequisites": [
      "basics-scope",
      "basics-branches"
    ],
    "recommendedBefore": [],
    "description": "修复 positive_total(values)。输入为整数列表，只累加严格大于0的值并返回整数。空输入或没有正数返回0，保留原列表。起始代码可以运行，但过早return；先用[2,-1,5]写出每轮total，再修复缩进与返回位置。",
    "starter": "def positive_total(values):\n    total = 0\n    for value in values:\n        if value > 0:\n            total += value\n        return total\n",
    "solution": "def positive_total(values):\n    total = 0\n    for value in values:\n        if value > 0:\n            total += value\n    return total\n",
    "alternative": "def positive_total(values):\n    return sum(value for value in values if value > 0)\n",
    "badSolution": "def positive_total(values):\n    return sum(values)\n",
    "checks": [
      [
        "正负交错不丢后半段",
        "__lesson_equal(positive_total([2,-1,5]),7) and __lesson_equal(positive_total([-4,3,0,9]),12)"
      ],
      [
        "空列表与无正数",
        "__lesson_equal(positive_total([]),0) and __lesson_equal(positive_total([0,-4]),0)"
      ],
      [
        "长序列和输入保护",
        "__lesson_unchanged(positive_total,[list(range(-9,10))],45,[0])"
      ]
    ],
    "concept": "程序没有报错，并不表示结果正确。缩进决定语句属于哪一个代码块；函数中的return一旦执行，就结束这一次调用，不会继续下一轮循环。先写追踪表，列出本轮value、进入分支前后的total、是否已经返回。\n\nprint可以放在循环里观察中间状态，但调试输出不能替代最终返回值。验证空输入，能检查循环一次也没执行时函数是否仍有返回路径。",
    "hint": "代码在第一轮之后会走到哪里？",
    "hintLevels": [
      {
        "level": 1,
        "title": "想一想",
        "text": "代码在第一轮之后会走到哪里？"
      },
      {
        "level": 2,
        "title": "分步检查",
        "text": "把“逐项累加”和“交回最终结果”分成两个阶段。"
      },
      {
        "level": 3,
        "title": "具体帮助",
        "text": "最终返回应在遍历结束后发生；空列表也需要经过它。"
      }
    ],
    "workedExample": {
      "code": "def markers(values):\n    for value in values:\n        print(\"读到\", value)\n    print(\"遍历结束\")\nmarkers([1, 2])",
      "expected": "读到 1\n读到 2\n遍历结束"
    },
    "typicalError": {
      "symptom": "第一项正确却漏掉后面所有项",
      "repair": "核对return的缩进层级，并补空输入案例。"
    },
    "reward": 20,
    "xp": 20,
    "chapter": 0,
    "kind": "extension-practice",
    "practiceKind": "debugging",
    "transferFrom": [],
    "language": "python",
    "capability": "browser-restricted-python",
    "assessmentVersion": 9,
    "contractVersion": 1,
    "boundary": "通过记录只说明本次代码满足给定合同。真人解释、换题应用与延时保持需要另行观察。"
  },
  {
    "id": "transfer-travel-plan",
    "title": "为陌生航线安排预算",
    "topic": "迁移 · 条件 · 聚合 · 新需求",
    "islandId": "harbor",
    "prerequisites": [
      "discount",
      "basics-branches",
      "catalog"
    ],
    "recommendedBefore": [],
    "description": "独立实现 trip_budget(legs, budget)。legs是[票价,人数]二元素序列的列表，数字均为非负整数。返回{total:总费用,remaining:预算减费用,can_go:费用不超过预算的布尔值}。即使超预算也保留负remaining，不能把它改成0。空行程费用为0。此任务没有折扣，不使用旧收银题的百分数公式。输入不变。",
    "starter": "def trip_budget(legs, budget):\n    pass\n",
    "solution": "def trip_budget(legs, budget):\n    total = 0\n    for price, passengers in legs:\n        total += price * passengers\n    return {\"total\": total, \"remaining\": budget-total, \"can_go\": total <= budget}\n",
    "alternative": "def trip_budget(legs, budget):\n    cost = sum(row[0] * row[1] for row in legs)\n    result = {\"total\": cost, \"remaining\": budget-cost}\n    result[\"can_go\"] = budget >= cost\n    return result\n",
    "badSolution": "def trip_budget(legs, budget):\n    total = sum(price+count for price,count in legs)\n    return {\"total\":total,\"remaining\":max(0,budget-total),\"can_go\":total<budget}\n",
    "checks": [
      [
        "多段行程按人数计算",
        "__lesson_equal(trip_budget([[3,2],[5,1]],15),{'total':11,'remaining':4,'can_go':True})"
      ],
      [
        "相等、超支和零费用",
        "__lesson_equal(trip_budget([[4,3]],12),{'total':12,'remaining':0,'can_go':True}) and __lesson_equal(trip_budget([[4,3]],5),{'total':12,'remaining':-7,'can_go':False}) and __lesson_equal(trip_budget([],0),{'total':0,'remaining':0,'can_go':True})"
      ],
      [
        "输入不变且按新数据计算",
        "__lesson_unchanged(trip_budget,[[[0,5],[7,0],[2,3]],9],{'total':6,'remaining':3,'can_go':True},[0])"
      ]
    ],
    "concept": "迁移时先重新读输入和输出合同。熟悉的计算工具可以复用，旧题的业务规则不能自动搬来。先为每段行程写出单位，再检查“单价×人数”的单位是费用；总费用是各段费用之和。\n\n返回字典时，三个字段应从同一次总费用计算导出。remaining可以为负，这是一条有用的诊断信息；can_go是比较结果，不能用非零数字代替布尔值。",
    "hint": "先单独算每一段费用，再汇总。",
    "hintLevels": [
      {
        "level": 1,
        "title": "想一想",
        "text": "先单独算每一段费用，再汇总。"
      },
      {
        "level": 2,
        "title": "分步检查",
        "text": "三项输出分别回答花了多少、还差多少、能不能出发。"
      },
      {
        "level": 3,
        "title": "具体帮助",
        "text": "用空行程、恰好够钱和超支各做一次手算，再比较字典字段。"
      }
    ],
    "workedExample": {
      "code": "receipt = {\"unit\": 6, \"quantity\": 2}\nprint(receipt[\"unit\"] * receipt[\"quantity\"])\nprint(4 <= 4)",
      "expected": "12\nTrue"
    },
    "typicalError": {
      "symptom": "将超支余额截断为0或忘记人数",
      "repair": "先写单段算式，再用预算恰好相等的输入检查边界。"
    },
    "reward": 20,
    "xp": 20,
    "chapter": 0,
    "kind": "extension-practice",
    "practiceKind": "transfer",
    "transferFrom": [
      "coin-math",
      "safe-buy",
      "discount",
      "catalog"
    ],
    "language": "python",
    "capability": "browser-restricted-python",
    "assessmentVersion": 9,
    "contractVersion": 1,
    "boundary": "通过记录只说明本次代码满足给定合同。真人解释、换题应用与延时保持需要另行观察。"
  },
  {
    "id": "transfer-repeat-alerts",
    "title": "找出第二次出现的信号",
    "topic": "迁移 · 集合 · 计数 · 顺序",
    "islandId": "market",
    "prerequisites": [
      "dedupe",
      "market-receipts"
    ],
    "recommendedBefore": [],
    "description": "独立实现 repeat_alerts(ids)。输入为字符串列表；当某ID第二次出现时，将它加入告警列表，之后再出现不重复告警。结果按第二次出现的先后排序，不按第一次出现排序。例如[a,b,b,a,b]得到[b,a]。空输入返回[]，保留输入。",
    "starter": "def repeat_alerts(ids):\n    pass\n",
    "solution": "def repeat_alerts(ids):\n    seen = set()\n    reported = set()\n    result = []\n    for value in ids:\n        if value in seen and value not in reported:\n            result.append(value)\n            reported.add(value)\n        seen.add(value)\n    return result\n",
    "alternative": "def repeat_alerts(ids):\n    counts = {}\n    alerts = []\n    for value in ids:\n        counts[value] = counts.get(value,0) + 1\n        if counts[value] == 2:\n            alerts.append(value)\n    return alerts\n",
    "badSolution": "def repeat_alerts(ids):\n    result=[]\n    for value in ids:\n        if value not in result:\n            result.append(value)\n    return result\n",
    "checks": [
      [
        "告警顺序来自第二次出现",
        "__lesson_equal(repeat_alerts(['a','b','b','a','b']),['b','a'])"
      ],
      [
        "没有重复和空输入",
        "__lesson_equal(repeat_alerts(['a','b','c']),[]) and __lesson_equal(repeat_alerts([]),[])"
      ],
      [
        "反复重复、空ID与中文",
        "__lesson_unchanged(repeat_alerts,[['','岛','','岛','岛','尾']],['','岛'],[0])"
      ],
      [
        "变化位置",
        "__lesson_equal(repeat_alerts(['x','y','z','z','y','x']),['z','y','x'])"
      ]
    ],
    "concept": "同样使用集合与列表，触发时机改变后算法也会改变。先画出单个ID的三种状态：没出现、出现一次、已经告警。第二次出现才产生输出，第三次以后只保留状态。告警的输出顺序由事件发生时间决定。\n\n可用出现次数表示状态，也可用“已见过”和“已告警”两份集合。选择你能解释的结构，不必模仿某一种写法。",
    "hint": "对一个ID依次考虑第一次、第二次、第三次。",
    "hintLevels": [
      {
        "level": 1,
        "title": "想一想",
        "text": "对一个ID依次考虑第一次、第二次、第三次。"
      },
      {
        "level": 2,
        "title": "分步检查",
        "text": "只有一个状态转换应当向结果追加元素。"
      },
      {
        "level": 3,
        "title": "具体帮助",
        "text": "可以维护次数并在次数恰好变为2时告警；也可以用两个集合。"
      }
    ],
    "workedExample": {
      "code": "counts = {\"灯\": 1}\nprint(counts.get(\"灯\", 0))\nprint(counts.get(\"绳\", 0))\ncounts[\"灯\"] += 1\nprint(counts[\"灯\"] == 2)",
      "expected": "1\n0\nTrue"
    },
    "typicalError": {
      "symptom": "照抄保序去重，收集的是第一次出现",
      "repair": "比较[a,b,b,a]的两种顺序，明确告警产生在哪一步。"
    },
    "reward": 20,
    "xp": 20,
    "chapter": 1,
    "kind": "extension-practice",
    "practiceKind": "transfer",
    "transferFrom": [
      "dedupe",
      "market-receipts"
    ],
    "language": "python",
    "capability": "browser-restricted-python",
    "assessmentVersion": 9,
    "contractVersion": 1,
    "boundary": "通过记录只说明本次代码满足给定合同。真人解释、换题应用与延时保持需要另行观察。"
  },
  {
    "id": "transfer-resupply",
    "title": "把缺口变成整箱补给",
    "topic": "迁移 · 缺货 · 向上取整",
    "islandId": "market",
    "prerequisites": [
      "market-stock",
      "harbor-rations",
      "basics-scope"
    ],
    "recommendedBefore": [],
    "description": "独立实现 resupply_boxes(stock, target, pack_size)。stock和target把物品名映射到非负整数；缺失库存当0。pack_size为正整数，每箱可装该物品pack_size件。只给库存低于目标的物品下单，返回{物品名:需要的整箱数}。不把富余物品列入；不能混装不同名称；两个输入字典不变。",
    "starter": "def resupply_boxes(stock, target, pack_size):\n    pass\n",
    "solution": "def resupply_boxes(stock, target, pack_size):\n    result = {}\n    for name, desired in target.items():\n        missing = desired - stock.get(name, 0)\n        if missing > 0:\n            result[name] = (missing + pack_size - 1) // pack_size\n    return result\n",
    "alternative": "def resupply_boxes(stock, target, pack_size):\n    result = {}\n    for name in target:\n        gap = target[name] - stock.get(name, 0)\n        if gap > 0:\n            whole, rest = divmod(gap, pack_size)\n            result[name] = whole + (rest != 0)\n    return result\n",
    "badSolution": "def resupply_boxes(stock, target, pack_size):\n    return {name:(amount-stock.get(name,0))//pack_size for name,amount in target.items()}\n",
    "checks": [
      [
        "缺口转换为箱数且各品名单独计算",
        "__lesson_equal(resupply_boxes({'灯':2,'水':9},{'灯':8,'水':3,'绳':1},4),{'灯':2,'绳':1})"
      ],
      [
        "零缺口、空目标和恰好整箱",
        "__lesson_equal(resupply_boxes({'灯':2},{'灯':2},3),{}) and __lesson_equal(resupply_boxes({}, {},7),{}) and __lesson_equal(resupply_boxes({}, {'灯':6},3),{'灯':2})"
      ],
      [
        "巨整数与输入保护",
        "__lesson_unchanged(resupply_boxes,[{'a':1},{'a':10**40+2},7],{'a':(10**40+7)//7},[0,1])"
      ]
    ],
    "concept": "先辨认中间结果的单位。缺口的单位是“件”，最终订单的单位是“箱”；这两层结果不能直接互换。每一种商品独立计算，先决定是否需要补，再决定整箱数量。\n\n用刚好整除、还差一件和完全不缺三种输入检验组合规则。整数整除与余数不需要转换成浮点，数量很大时仍能保留精度。",
    "hint": "先为一个物品算出真正的缺口。",
    "hintLevels": [
      {
        "level": 1,
        "title": "想一想",
        "text": "先为一个物品算出真正的缺口。"
      },
      {
        "level": 2,
        "title": "分步检查",
        "text": "不缺的物品不用产生订单；缺口需要换算单位。"
      },
      {
        "level": 3,
        "title": "具体帮助",
        "text": "整除得到完整箱数，余数非零时还需要一箱。"
      }
    ],
    "workedExample": {
      "code": "pieces = 11\nwhole, remainder = divmod(pieces, 5)\nprint(whole, remainder)\nprint(remainder > 0)",
      "expected": "2 1\nTrue"
    },
    "typicalError": {
      "symptom": "直接复制缺货单，把件数当箱数或忽略余数",
      "repair": "在变量旁标注单位，用缺1件却每箱4件的输入检查。"
    },
    "reward": 20,
    "xp": 20,
    "chapter": 1,
    "kind": "extension-practice",
    "practiceKind": "transfer",
    "transferFrom": [
      "market-stock",
      "harbor-rations"
    ],
    "language": "python",
    "capability": "browser-restricted-python",
    "assessmentVersion": 9,
    "contractVersion": 1,
    "boundary": "通过记录只说明本次代码满足给定合同。真人解释、换题应用与延时保持需要另行观察。"
  },
  {
    "id": "transfer-stable-priority",
    "title": "同一天的救援先后",
    "topic": "迁移 · 稳定排序 · 多关键字",
    "islandId": "market",
    "prerequisites": [
      "market-ranking",
      "basics-slices"
    ],
    "recommendedBefore": [],
    "description": "独立实现 rescue_order(rows)。每条是{id:字符串,day:非负整数,urgent:布尔值}。先按day升序，同一天urgent=True先到；两项都相同时保留原输入次序，不按id排序。返回id列表，不改输入，重复id也不能丢。",
    "starter": "def rescue_order(rows):\n    pass\n",
    "solution": "def rescue_order(rows):\n    return [row[\"id\"] for row in sorted(rows, key=lambda row: (row[\"day\"], not row[\"urgent\"]))]\n",
    "alternative": "def rescue_order(rows):\n    ordered = sorted(rows, key=lambda row: not row[\"urgent\"])\n    ordered = sorted(ordered, key=lambda row: row[\"day\"])\n    return [row[\"id\"] for row in ordered]\n",
    "badSolution": "def rescue_order(rows):\n    return [row[\"id\"] for row in sorted(rows,key=lambda row:(row[\"day\"],not row[\"urgent\"],row[\"id\"]))]\n",
    "checks": [
      [
        "日期优先，紧急仅在同日比较",
        "__lesson_equal(rescue_order([{'id':'a','day':1,'urgent':False},{'id':'b','day':2,'urgent':True},{'id':'c','day':1,'urgent':True}]),['c','a','b'])"
      ],
      [
        "同键保持原顺序",
        "__lesson_equal(rescue_order([{'id':'z','day':0,'urgent':True},{'id':'a','day':0,'urgent':True},{'id':'m','day':0,'urgent':True}]),['z','a','m'])"
      ],
      [
        "空输入、重复ID和只读输入",
        "__lesson_equal(rescue_order([]),[]) and __lesson_unchanged(rescue_order,[[{'id':'x','day':3,'urgent':False},{'id':'x','day':1,'urgent':False}]],['x','x'],[0])"
      ]
    ],
    "concept": "Python的sorted是稳定排序：比较键相等的元素保持输入先后。只有任务明确要求时才添加额外的平局规则。本题日期是第一条件，紧急程度是第二条件，原顺序是最后的要求。\n\n排序键可以是元组，按从左到右的字段比较；也可以先稳定排序次要字段，再排序主要字段。输出只是id，输入行本身不能被修改或去重。",
    "hint": "先在纸上逐对比较日期，再考虑同日的规则。",
    "hintLevels": [
      {
        "level": 1,
        "title": "想一想",
        "text": "先在纸上逐对比较日期，再考虑同日的规则。"
      },
      {
        "level": 2,
        "title": "分步检查",
        "text": "同键的输入已有顺序，不需要发明第三个名字排序条件。"
      },
      {
        "level": 3,
        "title": "具体帮助",
        "text": "可构造由日期与紧急程度组成的键，或从次要到主要做两次稳定排序。"
      }
    ],
    "workedExample": {
      "code": "words = [\"aa\", \"b\", \"cc\", \"d\"]\nprint(sorted(words, key=len))\nprint(words)",
      "expected": "['b', 'd', 'aa', 'cc']\n['aa', 'b', 'cc', 'd']"
    },
    "typicalError": {
      "symptom": "把旧排位课的按名字平局规则一起复制",
      "repair": "给同日同紧急级别安排z、a两个ID，检查原次序是否保留。"
    },
    "reward": 20,
    "xp": 20,
    "chapter": 1,
    "kind": "extension-practice",
    "practiceKind": "transfer",
    "transferFrom": [
      "market-ranking"
    ],
    "language": "python",
    "capability": "browser-restricted-python",
    "assessmentVersion": 9,
    "contractVersion": 1,
    "boundary": "通过记录只说明本次代码满足给定合同。真人解释、换题应用与延时保持需要另行观察。"
  },
  {
    "id": "debugging-aliases",
    "title": "两只猫的清单串了",
    "topic": "排错 · 可变别名 · 回归",
    "islandId": "market",
    "prerequisites": [
      "market-copy",
      "basics-scope"
    ],
    "recommendedBefore": [],
    "description": "修复 make_packs(names, items)。names为互不重复的字符串列表，items为物品列表。返回每个名字到一份独立物品列表的字典，不要修改names或items。修改任一结果列表不应改变其他猫的列表或原items。起始代码给每只猫同一个列表。先复现一次串改，再修复；仅比较初始内容相等不够。",
    "starter": "def make_packs(names, items):\n    result = {}\n    for name in names:\n        result[name] = items\n    return result\n",
    "solution": "def make_packs(names, items):\n    return {name: list(items) for name in names}\n",
    "alternative": "def make_packs(names, items):\n    result = {}\n    for name in names:\n        copy = []\n        for item in items:\n            copy.append(item)\n        result[name] = copy\n    return result\n",
    "badSolution": "def make_packs(names, items):\n    shared=list(items)\n    return {name:shared for name in names}\n",
    "checks": [
      [
        "清单内容与空输入",
        "__lesson_equal(make_packs(['皮皮','汤圆'],['水',0]),{'皮皮':['水',0],'汤圆':['水',0]}) and __lesson_equal(make_packs([],['水']),{})"
      ],
      [
        "每一份清单独立，原件不被改动",
        "__lesson_extension('packs-aliases', make_packs)"
      ]
    ],
    "concept": "赋值让名字指向对象，不会自动复制对象。两份列表显示相同，并不能说明它们独立。浅复制字典也不会复制字典内共享的列表。\n\n检验别名需要一次后续操作。保存原items、建立两份结果、只改一只猫的结果，再查看其他两份。修复应在每次创建猫的清单时产生新的列表；在循环外只复制一次仍会共享。物品本身按本题约定视为值，本课不要求任意深度对象复制。",
    "hint": "画出三个名字分别指向哪个列表对象。",
    "hintLevels": [
      {
        "level": 1,
        "title": "想一想",
        "text": "画出三个名字分别指向哪个列表对象。"
      },
      {
        "level": 2,
        "title": "分步检查",
        "text": "需要独立的是每一只猫的内层列表。"
      },
      {
        "level": 3,
        "title": "具体帮助",
        "text": "在每个结果条目建立时复制物品列表，再只修改其中一份验证。"
      }
    ],
    "workedExample": {
      "code": "original = [\"灯\"]\nalias = original\ncopy = list(original)\nalias.append(\"绳\")\nprint(original)\nprint(copy)",
      "expected": "['灯', '绳']\n['灯']"
    },
    "typicalError": {
      "symptom": "循环外只复制一次，所有猫仍引用同一副本",
      "repair": "以写入后的可观察变化验收，不能只看创建时的==比较。"
    },
    "reward": 20,
    "xp": 20,
    "chapter": 1,
    "kind": "extension-practice",
    "practiceKind": "debugging",
    "transferFrom": [],
    "language": "python",
    "capability": "browser-restricted-python",
    "assessmentVersion": 9,
    "contractVersion": 2,
    "boundary": "通过记录只说明本次代码满足给定合同。真人解释、换题应用与延时保持需要另行观察。"
  },
  {
    "id": "engineering-cleanup",
    "title": "出错后也收好工具",
    "topic": "try/finally · 资源所有权",
    "islandId": "archive",
    "prerequisites": [
      "engineering-files",
      "basics-arguments"
    ],
    "recommendedBefore": [],
    "description": "实现 consume_owned(source, transform)。source是已经取得的、可迭代且有close()的源；本函数接手它的关闭责任，close按本题约定不会抛错。按顺序对每项只调用一次transform，返回结果列表。无论读完、读取失败或transform失败，都close恰好一次。业务错误保留原对象传播，不假装成功。不要预先读完源再处理。",
    "starter": "def consume_owned(source, transform):\n    pass\n",
    "solution": "def consume_owned(source, transform):\n    try:\n        result = []\n        for value in source:\n            result.append(transform(value))\n        return result\n    finally:\n        source.close()\n",
    "alternative": "def consume_owned(source, transform):\n    try:\n        return [transform(value) for value in source]\n    finally:\n        source.close()\n",
    "badSolution": "def consume_owned(source, transform):\n    result = [transform(value) for value in source]\n    source.close()\n    return result\n",
    "checks": [
      [
        "正常、空源、读取失败和处理失败都关闭",
        "__lesson_extension('owned-cleanup', consume_owned)"
      ]
    ],
    "concept": "try/finally适合表达离开一段范围时一定执行的收尾。try中的return会先保存返回值，再执行finally，最后才把结果交给调用者。发生异常时也会先执行finally，再继续向外传播；finally不代表错误已经被处理。\n\n先写清资源在进入函数前已经取得，并由谁负责关闭。不要在正常分支和finally都调用close，也不要在finally里随意return，否则会覆盖本来要传播的错误。close也会失败时需要更强的异常组合合同，后续单资源协议课继续学习。",
    "hint": "列出正常返回、读取失败、处理失败三条退出路径。",
    "hintLevels": [
      {
        "level": 1,
        "title": "想一想",
        "text": "列出正常返回、读取失败、处理失败三条退出路径。"
      },
      {
        "level": 2,
        "title": "分步检查",
        "text": "关闭责任相同，可以让三条路径共享一个出口。"
      },
      {
        "level": 3,
        "title": "具体帮助",
        "text": "遍历与transform都应位于try范围，finally只负责关闭，不返回备用成功。"
      }
    ],
    "workedExample": {
      "code": "def observe():\n    try:\n        print(\"开始\")\n        return 4\n    finally:\n        print(\"离开\")\nprint(observe())",
      "expected": "开始\n离开\n4"
    },
    "typicalError": {
      "symptom": "只在正常return前close，错误路径遗留资源",
      "repair": "把transform的第二次调用设成抛错，观察close是否仍记录一次。"
    },
    "reward": 20,
    "xp": 20,
    "chapter": 3,
    "kind": "extension-practice",
    "practiceKind": "foundation",
    "transferFrom": [],
    "language": "python",
    "capability": "browser-restricted-python",
    "assessmentVersion": 9,
    "contractVersion": 1,
    "boundary": "通过记录只说明本次代码满足给定合同。真人解释、换题应用与延时保持需要另行观察。"
  },
  {
    "id": "basics-decorators",
    "title": "给报价函数戴一枚标签",
    "topic": "装饰器 · 闭包 · wraps",
    "islandId": "workshop",
    "prerequisites": [
      "basics-arguments",
      "workshop-closure",
      "invalid-input"
    ],
    "recommendedBefore": [],
    "description": "实现 label_result(label)，返回一个装饰器。被装饰函数仍接收任意原位置和关键字参数，每次恰好调用一次原函数；返回(label,原返回对象)。保留原函数名称和文档供工具阅读。原函数出错时传播同一个错误，不返回失败字符串。不同装饰器的标签不能互相串改。",
    "starter": "from functools import wraps\n\ndef label_result(label):\n    pass\n",
    "solution": "from functools import wraps\n\ndef label_result(label):\n    def decorate(function):\n        @wraps(function)\n        def wrapped(*args, **kwargs):\n            return label, function(*args, **kwargs)\n        return wrapped\n    return decorate\n",
    "alternative": "from functools import wraps\n\ndef label_result(label):\n    def decorate(function):\n        def invoke(*values, **names):\n            result = function(*values, **names)\n            return (label, result)\n        return wraps(function)(invoke)\n    return decorate\n",
    "badSolution": "def label_result(label):\n    def decorate(function):\n        def wrapped(*args, **kwargs):\n            return label, function()\n        return wrapped\n    return decorate\n",
    "checks": [
      [
        "参数转发、返回身份、元数据、异常和标签隔离",
        "__lesson_extension('decorator-label', label_result)"
      ]
    ],
    "concept": "装饰器是接收一个函数、返回另一个可调用对象的函数。@decorate写在函数定义上方，相当于定义后执行function = decorate(function)。带配置的装饰器会先用配置创建decorate，所以这里有“配置、接收函数、实际调用”三个不同时间。\n\n闭包让实际调用记住配置；*args和**kwargs负责原样转发。functools.wraps把名称、文档等描述信息带到包装函数，不替你运行原函数。不要在装饰阶段提前执行业务。",
    "hint": "先画出三个阶段各自收到什么、返回什么。",
    "hintLevels": [
      {
        "level": 1,
        "title": "想一想",
        "text": "先画出三个阶段各自收到什么、返回什么。"
      },
      {
        "level": 2,
        "title": "分步检查",
        "text": "配置和原函数由闭包保存，真实参数属于最后一次调用。"
      },
      {
        "level": 3,
        "title": "具体帮助",
        "text": "包装函数需要转发*args与**kwargs；元数据用wraps保留。"
      }
    ],
    "workedExample": {
      "code": "def mark(function):\n    print(\"接收函数\")\n    return function\n@mark\ndef hello():\n    return \"你好\"\nprint(\"开始调用\")\nprint(hello())",
      "expected": "接收函数\n开始调用\n你好"
    },
    "typicalError": {
      "symptom": "装饰阶段就调用原函数，或丢失关键字参数",
      "repair": "分别记录创建装饰器、装饰函数、调用结果的时刻。"
    },
    "reward": 20,
    "xp": 20,
    "chapter": 2,
    "kind": "extension-practice",
    "practiceKind": "foundation",
    "transferFrom": [],
    "language": "python",
    "capability": "browser-restricted-python",
    "assessmentVersion": 9,
    "contractVersion": 1,
    "boundary": "通过记录只说明本次代码满足给定合同。真人解释、换题应用与延时保持需要另行观察。"
  },
  {
    "id": "transfer-log-report",
    "title": "从混合日志整理交班表",
    "topic": "迁移 · JSONL · 错误定位 · 分组",
    "islandId": "archive",
    "prerequisites": [
      "engineering-csv",
      "archive-json"
    ],
    "recommendedBefore": [],
    "description": "实现 summarize_logs(text)。text按物理行分隔JSON，每条非空行应恰含name和ok；name为非空白字符串且原样保留，ok严格为bool。空白行跳过。坏JSON、字段或类型错误不终止整份日志，记录从1开始的物理行号。返回{groups:{name:{passed:成功数,total:总数}},invalid:[坏行号]}。每个有效行都计入total，失败也不丢掉。",
    "starter": "import json\n\ndef summarize_logs(text):\n    pass\n",
    "solution": "import json\n\ndef summarize_logs(text):\n    groups = {}\n    invalid = []\n    for number, line in enumerate(text.splitlines(), 1):\n        if not line.strip():\n            continue\n        try:\n            row = json.loads(line)\n            if type(row) is not dict or set(row) != {\"name\",\"ok\"} or type(row[\"name\"]) is not str or not row[\"name\"].strip() or type(row[\"ok\"]) is not bool:\n                raise ValueError(\"row\")\n        except ValueError:\n            invalid.append(number)\n            continue\n        name = row[\"name\"]\n        if name not in groups:\n            groups[name] = {\"passed\":0,\"total\":0}\n        groups[name][\"total\"] += 1\n        if row[\"ok\"]:\n            groups[name][\"passed\"] += 1\n    return {\"groups\":groups,\"invalid\":invalid}\n",
    "alternative": "import json\n\ndef summarize_logs(text):\n    groups, invalid = {}, []\n    for index, line in enumerate(text.splitlines()):\n        if line.strip() == \"\":\n            continue\n        try:\n            item = json.loads(line)\n        except ValueError:\n            invalid.append(index+1)\n            continue\n        valid = type(item) is dict and set(item) == {\"name\",\"ok\"}\n        valid = valid and type(item[\"name\"]) is str and bool(item[\"name\"].strip()) and type(item[\"ok\"]) is bool\n        if not valid:\n            invalid.append(index+1)\n            continue\n        count = groups.setdefault(item[\"name\"], {\"passed\":0,\"total\":0})\n        count[\"total\"] += 1\n        count[\"passed\"] += int(item[\"ok\"])\n    return dict(groups=groups, invalid=invalid)\n",
    "badSolution": "import json\n\ndef summarize_logs(text):\n    groups={}\n    for line in text.splitlines():\n        row=json.loads(line)\n        groups[row[\"name\"]]={\"passed\":int(row[\"ok\"]),\"total\":1}\n    return {\"groups\":groups,\"invalid\":[]}\n",
    "checks": [
      [
        "有效、失败、空行与坏行交错",
        "__lesson_extension('log-report', summarize_logs)"
      ]
    ],
    "concept": "CSV和逐行JSON都是文本数据，但记录边界不同。这里每个物理行独立解析，空白行也占行号；不能先删除空行再重新编号。某行损坏时，业务要求继续处理后面的行，因此应在每一行的范围处理预期解析错误。\n\n先检查JSON结构，再读取字段。布尔值和整数在Python中有关联，但本合同明确只接受bool。统计的分母是全部有效行，失败记录也属于分母。新输入格式与新容错规则要求重新设计，不直接复制CSV课。",
    "hint": "把定位坏行与汇总有效行分成两种结果。",
    "hintLevels": [
      {
        "level": 1,
        "title": "想一想",
        "text": "把定位坏行与汇总有效行分成两种结果。"
      },
      {
        "level": 2,
        "title": "分步检查",
        "text": "每行有自己的解析与校验范围，错误不能丢掉后续行。"
      },
      {
        "level": 3,
        "title": "具体帮助",
        "text": "enumerate保留物理位置，分组累计必须让每条有效记录都增加total。"
      }
    ],
    "workedExample": {
      "code": "import json\nfor number, line in enumerate([\"\", '{\"ok\": false}', \"bad\"], 1):\n    if line:\n        try:\n            print(number, json.loads(line))\n        except ValueError:\n            print(number, \"坏JSON\")",
      "expected": "2 {'ok': False}\n3 坏JSON"
    },
    "typicalError": {
      "symptom": "先过滤空行而错报位置，或只计成功行",
      "repair": "让第一行空白、第二行失败、第三行坏JSON，核对行号和分母。"
    },
    "reward": 20,
    "xp": 20,
    "chapter": 3,
    "kind": "extension-practice",
    "practiceKind": "transfer",
    "transferFrom": [
      "engineering-csv",
      "archive-json",
      "market-receipts"
    ],
    "language": "python",
    "capability": "browser-restricted-python",
    "assessmentVersion": 9,
    "contractVersion": 1,
    "boundary": "通过记录只说明本次代码满足给定合同。真人解释、换题应用与延时保持需要另行观察。"
  },
  {
    "id": "testing-regression",
    "title": "给解析器留下回归证据",
    "topic": "测试设计 · 异常 · 变异反测",
    "islandId": "observatory",
    "prerequisites": [
      "engineering-tests",
      "debugging-index"
    ],
    "recommendedBefore": [],
    "description": "实现 check_quantity(candidate)。candidate(text)的正确合同是：合法整数文本转换为整数，只接受0到99，其他文本返回None。你的测试函数对正确实现不抛错；对拒绝0、误收100、直接int不处理坏文本、只看isdigit拒绝合法空白/正号四类错解都抛AssertionError。测试须实际调用candidate，不读取或分析其代码。输入都为字符串。",
    "starter": "def check_quantity(candidate):\n    pass\n",
    "solution": "def check_quantity(candidate):\n    for text, expected in [(\"0\",0),(\"99\",99),(\"100\",None),(\"bad\",None),(\" +7 \",7),(\"-1\",None)]:\n        try:\n            actual = candidate(text)\n        except Exception:\n            raise AssertionError(\"unexpected failure\") from None\n        assert type(actual) is type(expected) and actual == expected\n",
    "alternative": "def check_quantity(candidate):\n    samples = {\"0\":0,\"99\":99,\"100\":None,\"oops\":None,\" +8 \":8,\"-3\":None}\n    for text in samples:\n        try:\n            result = candidate(text)\n        except Exception as error:\n            assert False, str(error)\n        assert result == samples[text] and type(result) is type(samples[text])\n",
    "badSolution": "def check_quantity(candidate):\n    assert candidate(\"12\") == 12\n",
    "checks": [
      [
        "正确实现通过，四类真实错解被捕获",
        "__lesson_extension('quantity-regression', check_quantity)"
      ]
    ],
    "concept": "回归测试把曾经的缺陷变成以后可以重复检查的行为。测试必须同时满足两个方向：正确实现通过，目标错解失败。只测试普通值12，可能看不出0和100的边界错误。\n\n每个样例应该有清楚用途。正常、边界、非法文本和合法但不常见的文本分开设计。测试用例不能改变业务合同，例如空白和正号是int接受的合法形式，就不能只用isdigit替它定义合法输入。",
    "hint": "先列出每种错误与正确程序发生分歧的输入。",
    "hintLevels": [
      {
        "level": 1,
        "title": "想一想",
        "text": "先列出每种错误与正确程序发生分歧的输入。"
      },
      {
        "level": 2,
        "title": "分步检查",
        "text": "边界0、边界外100、坏文本、合法带符号文本各有作用。"
      },
      {
        "level": 3,
        "title": "具体帮助",
        "text": "candidate意外抛错时也应让你的检查以AssertionError报告失败，不能吞掉后继续。"
      }
    ],
    "workedExample": {
      "code": "def positive(number):\n    return number > 0\nfor number, expected in [(0, False), (1, True)]:\n    assert positive(number) is expected\nprint(\"两条边界检查通过\")",
      "expected": "两条边界检查通过"
    },
    "typicalError": {
      "symptom": "测试只让正确程序运行，却不能区分错误实现",
      "repair": "给每一种已知错解找一个最小反例，再验证正确程序也接受该反例。"
    },
    "reward": 20,
    "xp": 20,
    "chapter": 4,
    "kind": "extension-practice",
    "practiceKind": "transfer",
    "transferFrom": [
      "test-case",
      "engineering-tests",
      "harbor-quantity"
    ],
    "language": "python",
    "capability": "browser-restricted-python",
    "assessmentVersion": 9,
    "contractVersion": 1,
    "boundary": "通过记录只说明本次代码满足给定合同。真人解释、换题应用与延时保持需要另行观察。"
  },
  {
    "id": "project-stock-ledger",
    "title": "独立交付港口库存工具",
    "topic": "综合项目 · 双文件 · 校验 · 安全写入",
    "islandId": "observatory",
    "prerequisites": [
      "engineering-report",
      "transfer-log-report",
      "testing-regression",
      "market-checkout"
    ],
    "recommendedBefore": [],
    "description": "实现 inventory_project(stock_path, orders_path, report_path, open_file)。读两份UTF-8 CSV，表头必须恰为item,qty，名称必须是非空白字符串且原样保留；qty是非负整数文本，每份文件同名累计。表头后的完全空行跳过；空名称字段或空白名称仍是坏数据。全部读取和校验后，对照订单计算短缺。若有短缺，返回并写出{status:\"shortage\",stock:原汇总库存,missing:正缺口}；全部足够则写出{status:\"ready\",stock:扣除后的新库存,missing:{}}，保留零库存及订单中的零数量键。损坏CSV、负数量或坏字段抛ValueError，保留原报告字节；所有文件关闭。open_file是本次临时工作区的真实文件入口，接口与open相同。请将解析、计算和写出分成自己能独立测试的函数。完成后可下载无答案多文件工程，将自己的实现拆成模块、运行unittest并交付pyz。",
    "starter": "import csv\nimport json\n\ndef inventory_project(stock_path, orders_path, report_path, open_file):\n    pass\n",
    "solution": "import csv\nimport json\n\ndef read_totals(path, open_file):\n    totals = {}\n    try:\n        with open_file(path, \"r\", encoding=\"utf-8\", newline=\"\") as source:\n            reader = csv.reader(source, strict=True)\n            if next(reader, None) != [\"item\", \"qty\"]:\n                raise ValueError(\"header\")\n            for row in reader:\n                if not row:\n                    continue\n                if len(row) != 2 or not row[0].strip():\n                    raise ValueError(\"row\")\n                qty = int(row[1])\n                if qty < 0:\n                    raise ValueError(\"quantity\")\n                totals[row[0]] = totals.get(row[0], 0) + qty\n    except csv.Error as error:\n        raise ValueError(\"csv\") from error\n    return totals\n\ndef inventory_project(stock_path, orders_path, report_path, open_file):\n    stock = read_totals(stock_path, open_file)\n    orders = read_totals(orders_path, open_file)\n    missing = {name: qty-stock.get(name,0) for name,qty in orders.items() if qty>stock.get(name,0)}\n    if missing:\n        result = {\"status\":\"shortage\", \"stock\":stock, \"missing\":missing}\n    else:\n        remaining = dict(stock)\n        for name, qty in orders.items():\n            remaining[name] = remaining.get(name,0) - qty\n        result = {\"status\":\"ready\", \"stock\":remaining, \"missing\":{}}\n    with open_file(report_path, \"w\", encoding=\"utf-8\") as target:\n        target.write(json.dumps(result, ensure_ascii=False))\n    return result\n",
    "alternative": "import csv,json\n\ndef inventory_project(stock_path,orders_path,report_path,open_file):\n    all_totals=[]\n    for path in (stock_path,orders_path):\n        totals={}\n        try:\n            with open_file(path,encoding=\"utf-8\",newline=\"\") as source:\n                reader=csv.DictReader(source,strict=True)\n                if reader.fieldnames != [\"item\",\"qty\"]:\n                    raise ValueError(\"header\")\n                for row in reader:\n                    if set(row)!={\"item\",\"qty\"} or row[\"item\"] is None or not row[\"item\"].strip() or row[\"qty\"] is None:\n                        raise ValueError(\"row\")\n                    qty=int(row[\"qty\"])\n                    if qty<0:\n                        raise ValueError(\"quantity\")\n                    totals[row[\"item\"]]=totals.get(row[\"item\"],0)+qty\n        except csv.Error as error:\n            raise ValueError(\"csv\") from error\n        all_totals.append(totals)\n    stock,order=all_totals\n    missing={}\n    for name in order:\n        if order[name]>stock.get(name,0):\n            missing[name]=order[name]-stock.get(name,0)\n    result={\"status\":\"shortage\" if missing else \"ready\",\"stock\":dict(stock),\"missing\":missing}\n    if not missing:\n        for name in order:\n            result[\"stock\"][name]=result[\"stock\"].get(name,0)-order[name]\n    with open_file(report_path,encoding=\"utf-8\",mode=\"w\") as target:\n        target.write(json.dumps(result,ensure_ascii=False))\n    return result\n",
    "badSolution": "import json\n\ndef inventory_project(stock_path,orders_path,report_path,open_file):\n    result={\"status\":\"ready\",\"stock\":{},\"missing\":{}}\n    with open_file(report_path,\"w\",encoding=\"utf-8\") as target:\n        target.write(json.dumps(result))\n    return result\n",
    "checks": [
      [
        "两份真实文件、重复商品、缺货与成功报告",
        "__lesson_extension('inventory-project-normal', inventory_project)"
      ],
      [
        "任一输入损坏都保留旧报告并关闭资源",
        "__lesson_extension('inventory-project-error', inventory_project)"
      ]
    ],
    "concept": "项目开始先写四个边界：输入格式、核心规则、失败时保留什么、交付物是什么。这里读取两份文件，不能只借用上课的单份CSV汇总。纯计算函数只接收内存数据，读写函数负责文件资源，入口负责组合。\n\n先分别测试解析器和库存计算，再测试真实文件输出。只要任一输入损坏，旧报告必须保留；因此写出发生在两份输入全部校验之后。缺货是正常业务结果，坏CSV才是格式错误，两者不能都写成空成功报告。\n\n离开游戏后，使用无答案学生工程，把解析、库存规则、文件操作和命令行分开。先建虚拟环境，运行unittest，再打包pyz并在空目录重跑。游戏内通过与本地独立交付是两条证据，不能相互代替。",
    "hint": "先写解析函数和只读的库存决策函数，各自测试。",
    "hintLevels": [
      {
        "level": 1,
        "title": "想一想",
        "text": "先写解析函数和只读的库存决策函数，各自测试。"
      },
      {
        "level": 2,
        "title": "分步检查",
        "text": "汇总两份输入后才能决定是否扣库存；缺货时不扣任何一项。"
      },
      {
        "level": 3,
        "title": "具体帮助",
        "text": "直到得到完整结果对象后才打开报告文件。独立交付还需完成本地工程的测试与打包。"
      }
    ],
    "workedExample": {
      "code": "def plan(quantity, demand):\n    if demand > quantity:\n        return {\"state\":\"wait\", \"left\":quantity}\n    return {\"state\":\"done\", \"left\":quantity-demand}\nprint(plan(3, 4))\nprint(plan(3, 2))",
      "expected": "{'state': 'wait', 'left': 3}\n{'state': 'done', 'left': 1}"
    },
    "typicalError": {
      "symptom": "未读完第二份输入就覆盖报告，或将缺货误判为格式错误",
      "repair": "测试第二份输入最后一行才损坏的情况，并对比报告原始字节。"
    },
    "reward": 20,
    "xp": 20,
    "chapter": 4,
    "kind": "extension-practice",
    "practiceKind": "project",
    "transferFrom": [
      "engineering-files",
      "engineering-csv",
      "engineering-report",
      "market-checkout",
      "testing-regression"
    ],
    "language": "python",
    "capability": "browser-restricted-python",
    "assessmentVersion": 9,
    "contractVersion": 2,
    "boundary": "通过记录只说明本次代码满足给定合同。真人解释、换题应用与延时保持需要另行观察。"
  }
];

export const INDEPENDENT_PRACTICE_IDS = Object.freeze(INDEPENDENT_PRACTICE_LESSONS.map(lesson => lesson.id));
