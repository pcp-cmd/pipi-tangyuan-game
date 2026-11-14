const validate = `def valid_decision(value):
    if not isinstance(value, dict):
        return False
    if value.get("kind") == "final":
        return isinstance(value.get("text"), str)
    if value.get("kind") == "tool":
        return isinstance(value.get("name"), str) and value["name"] != ""
    return False
`;
const dispatch = `def dispatch(decision, tools):
    if not valid_decision(decision) or decision["kind"] != "tool":
        return {"status": "bad_output"}
    name = decision["name"]
    if name not in tools:
        return {"status": "denied"}
    try:
        result = tools[name]()
    except OSError:
        return {"status": "tool_error"}
    return {"status": "tool_result", "result": result}
`;
const loop = `def run(model, tools, max_steps=3):
    if type(max_steps) is not int or max_steps <= 0:
        raise ValueError("positive integer budget required")
    observations = []
    for _ in range(max_steps):
        decision = model(list(observations))
        if not valid_decision(decision):
            return {"status": "bad_output"}
        if decision["kind"] == "final":
            return {"status": "completed", "answer": decision["text"]}
        outcome = dispatch(decision, tools)
        if outcome["status"] != "tool_result":
            return outcome
        observations.append(outcome["result"])
    return {"status": "step_limit"}
`;
const traced = `def run_traced(model, tools, max_steps=3, events=None):
    if type(max_steps) is not int or max_steps <= 0:
        raise ValueError("positive integer budget required")
    if events is None:
        events = []
    events.append({"event": "run_started"})
    observations = []
    def stop(result):
        events.append({"event": "run_stopped", "status": result["status"]})
        return result
    for _ in range(max_steps):
        events.append({"event": "model_called"})
        decision = model(list(observations))
        if not valid_decision(decision):
            return stop({"status": "bad_output"})
        if decision["kind"] == "final":
            return stop({"status": "completed", "answer": decision["text"]})
        events.append({"event": "tool_requested"})
        name = decision["name"]
        if name not in tools:
            return stop({"status": "denied"})
        events.append({"event": "tool_started", "tool": name})
        outcome = dispatch(decision, tools)
        if outcome["status"] == "tool_error":
            events.append({"event": "tool_failed", "tool": name})
            return stop(outcome)
        events.append({"event": "tool_completed", "tool": name})
        observations.append(outcome["result"])
    return stop({"status": "step_limit"})

def append_event(write_line, event):
    if not isinstance(event, dict):
        raise ValueError("event must be a dict")
    for key in ("run_id", "event"):
        if not isinstance(event.get(key), str) or event[key] == "":
            raise ValueError("missing event identity")
    for key in ("tool", "status"):
        if key in event and not isinstance(event[key], str):
            raise ValueError("invalid optional field")
    safe = {key: event[key] for key in ("run_id", "event", "tool", "status") if key in event}
    write_line(json.dumps(safe, ensure_ascii=False) + "\\n")
`;

const common = {
  islandId: 'harbor', recommendedBefore: [], reward: 20, xp: 20, chapter: 0,
  kind: 'extension-practice', language: 'python', capability: 'browser-restricted-python',
  assessmentVersion: 10, contractVersion: 1, practiceKind: 'agent-bridge',
  boundary: '离线决策函数和受控只读工具用于验证程序机制；不调用付费模型，不证明真实模型的推理或真人已经掌握。',
  source: {kind:'authored-adaptation', unitArchiveSha256:'f328a3629b244d20fb6ecb4576b8cc9be88c3f983a5693b0f0e8dd84e54091c2'},
};

export const AE26_BRIDGE_LESSONS = [
  {
    id:'ae26-l00-context', unitId:'L00', title:'放进信封的便条', topic:'参数 · 上下文 · 可见资料',
    prerequisites:['discount','catalog','basics-while','test-case'],
    description:'实现 ask_with_notes(model, question, notes)。question 是问题文字，notes 是按顺序排列的资料文字列表。新建一个字典，恰有 question 与 evidence 两个字段；evidence 是 notes 的新列表副本。只调用 model 一次并原样返回它的结果，不修改 notes。空资料仍应传空列表，不把别处保存的通知、硬编码答案或猜测塞入本次资料。',
    starter:'def ask_with_notes(model, question, notes):\n    pass\n',
    solution:'def ask_with_notes(model, question, notes):\n    context = {"question": question, "evidence": list(notes)}\n    return model(context)\n',
    alternative:'def ask_with_notes(model, question, notes):\n    visible = []\n    for note in notes:\n        visible.append(note)\n    return model(dict(question=question, evidence=visible))\n',
    badSolution:'def ask_with_notes(model, question, notes):\n    return model({"question": question, "evidence": ["港口明天09:00开放"]})\n',
    checks:[['真正传入空、旧、新资料并保留问题','__lesson_extension("ae26-context-input", ask_with_notes)'],['只调用一次、交回原结果且不借用资料列表','__lesson_extension("ae26-context-ownership", ask_with_notes)']],
    concept:'程序保存了一条通知，不代表下一次调用已经收到它。先看赋值顺序：saved 改了，先前创建的 visible 不会自动重建。本轮交给回答函数的数据叫上下文；我们只对实际实参作判断，不以“电脑里有这个文件”代替传入。\n\n函数也能作为参数：def apply(operation, value): return operation(value)。这里 operation 没有括号时是一个可调用的值，operation(value) 才执行；model 在本课也只是宿主传入的函数。字典 {"question": question, "evidence": notes} 用键说明每个值的用途。list(notes) 新建外层列表，模型修改收到的容器时不改变调用者的列表；本课列表内都是不可变字符串。\n\n先预测空、旧、新三份输入分别能提供什么，再显示实际传入内容。收到城市B今天的温度，不能据此回答城市A明天的天气。这里的确定性回答函数只用于检查信息流，不是会理解天气的真实模型。',
    workedExample:{code:'saved = "周一闭馆"\nvisible = [saved]\nsaved = "周二开放"\nprint(visible)\nprint([saved])',expected:"['周一闭馆']\n['周二开放']"},
    typicalError:{symptom:'更新 saved 后仍把旧 visible 传给回答函数，或直接返回自己猜的答案',repair:'只追踪这次调用的实参。换一条不同日期的通知，检查它确实出现在新的 evidence 中。'},
    hint:'画出 notes → 新上下文 → model → 返回值，分别标出数据在哪里移动。',
    hintLevels:[{level:1,title:'先看资料流向',text:'本轮问题与资料由两个参数给出；输出必须来自这一次 model 调用。'},{level:2,title:'再看容器',text:'上下文字典只含 question 和 evidence；用新列表承接资料，原顺序与空列表都要保留。'},{level:3,title:'检查调用边界',text:'先保存 model(context) 的结果，再返回这个结果。不要多调用一次，也不要用 print 代替 return。'}],
    transfer:'给图书馆通知换成城市和日期的天气资料；自己列出缺失字段，判断能回答什么与还缺什么。',
  },
  {
    id:'ae26-l01-proposals', unitId:'L01', title:'先看清请求的形状', topic:'字典 · 类型 · 输出合同',
    prerequisites:['ae26-l00-context'],
    description:'实现 valid_decision(value)，始终返回 bool。value 必须是字典；kind 只能是 final 或 tool。final 的 text 必须是字符串，空字符串也合法；tool 的 name 必须是非空字符串（只有空字符串不合法）。额外字段不改变上述规则，不强制删除它们。合法但尚未登记的工具名在本层仍为 True；本课只检查形状，不调用工具，也不修改输入。',
    starter:'def valid_decision(value):\n    pass\n', solution:validate,
    alternative:'def valid_decision(value):\n    if not isinstance(value, dict):\n        return False\n    kind = value.get("kind")\n    if kind == "tool":\n        name = value.get("name")\n        return isinstance(name, str) and len(name) > 0\n    return kind == "final" and isinstance(value.get("text"), str)\n',
    badSolution:'def valid_decision(value):\n    if not isinstance(value, dict):\n        return False\n    return bool(value.get("text")) if value.get("kind") == "final" else bool(value.get("name"))\n',
    checks:[['空回答合法，未知非空工具名仍只过结构关','__lesson_extension("ae26-decision-valid", valid_decision)'],['坏容器、缺字段、未知种类和错误类型拒绝','__lesson_extension("ae26-decision-invalid", valid_decision)']],
    concept:'外部返回值不是一拿到就能索引的字典。先用 isinstance(value, dict) 判断容器，再取字段；在 None 上先调用 .get 会出错。value.get("kind") 在键缺失时得到 None；这让我们能明确拒绝缺失，不能替它补造许可。\n\nkind 是分支标记。final 表示回答，tool 表示请求一个工具；未知标记不能落进“其余都算工具”的 else。字段存在、字段类型和业务许可是三层不同问题。字符串空不空与是不是字符串也不同：本课空 text 合法，name 必须至少有一个字符。判断函数返回 True 或 False，不返回原文字或它的长度。\n\n本层不会判断工具是否登记，也不会执行它。未知名称可以结构合法，却在下一层被拒绝。不要把结构通过写成“可以行动”。',
    workedExample:{code:'def labelled(value):\n    if not isinstance(value, dict):\n        return False\n    return isinstance(value.get("label"), str)\n\nprint(labelled(None))\nprint(labelled({"label": ""}))',expected:'False\nTrue'},
    typicalError:{symptom:'空 final 被误拒绝，或 kind=other 被当作工具',repair:'分别写形状合法、空值合法和已登记三个问题；只在本层回答前两个。'},
    hint:'先保护容器，再分别列出 final 和 tool 的规则。',
    hintLevels:[{level:1,title:'先分三种种类',text:'final、tool、其他各走什么结果？None 和列表在取字段前应停在哪里？'},{level:2,title:'用类型判断',text:'isinstance(text, str) 能接受空字符串；bool(text) 会错误拒绝空回答。工具名还需检查长度。'},{level:3,title:'逐项核对',text:'准备 None、{}、未知 kind、数字 text、列表 name、空 name、空 final 和未知非空工具名的预期；输入内容始终保持原样。'}],
    transfer:'为温度记录设计另一份合同，temperature 接受整数或小数但拒绝 bool，unit 为字符串；自己实现并说明缺单位为什么不能直接当摄氏度。',
  },
  {
    id:'ae26-a00-tools', unitId:'A00', title:'工具门口的检查', topic:'函数值 · 分发 · 作用边界',
    prerequisites:['ae26-l01-proposals'],
    description:'实现 dispatch(decision, tools)。tools 是宿主提供的“名称→无参数只读函数”字典。结构非法或 final 返回 {"status":"bad_output"}；合法 tool 的名称未登记返回 {"status":"denied"}，这两种都不能调用任何工具。已登记时只调用该函数一次，返回 {"status":"tool_result","result":原结果}，保留 None、False、0。仅工具的 OSError 转为 {"status":"tool_error"}；其他异常原样向外传播。不得修改输入或工具表。',
    starter:validate+'\n# valid_decision 是上一课已经学过的结构检查。\ndef dispatch(decision, tools):\n    pass\n',
    solution:validate+'\n'+dispatch,
    alternative:validate+'\ndef dispatch(decision, tools):\n    if not valid_decision(decision):\n        return dict(status="bad_output")\n    if decision["kind"] == "final":\n        return dict(status="bad_output")\n    name = decision["name"]\n    if name not in tools.keys():\n        return dict(status="denied")\n    operation = tools[name]\n    try:\n        answer = operation()\n    except OSError:\n        return dict(status="tool_error")\n    return dict(status="tool_result", result=answer)\n',
    badSolution:validate+'\ndef dispatch(decision, tools):\n    name = decision.get("name")\n    selected = tools.get(name, next(iter(tools.values())))\n    value = selected()\n    return {"status":"denied"} if name not in tools else {"status":"tool_result","result":value}\n',
    checks:[['先拒绝坏结构和未知名，真实调用数为零','__lesson_extension("ae26-dispatch-deny", dispatch)'],['只调用选中工具一次，保留合法假值和结果身份','__lesson_extension("ae26-dispatch-call", dispatch)'],['文件错误单独处理，其他异常保持原身份','__lesson_extension("ae26-dispatch-errors", dispatch)']],
    concept:'tools={"clock": read_clock} 保存函数值，不会读时钟；tools={"clock": read_clock()} 则已经执行，保存的是结果。selected=tools[name] 只是选中函数，selected() 才产生调用。先用记录列表证明这个时刻，再接真正的资料读取。\n\n分发器连接建议和有限能力。结构检查通过后还必须看 kind 和登记表，未知名称不能落入默认动作。文件或模型说“请取消订单”不会把取消函数加入宿主工具表。最后显示 denied，不能撤销先前已经偷跑的调用。\n\ntry 把可能失败的调用包起来，except OSError 只捕获文件系统一类预期错误；它不会捕获 ValueError 或 RuntimeError。不要 catch Exception 后一律说完成。这里开放 OSError 这个异常名称不会开放真实文件访问；工具由练习环境提供，实际外部资源将在原生工程中另验。',
    workedExample:{code:'calls = []\ndef read_clock():\n    calls.append("read")\n    return "10:30"\ntools = {"clock": read_clock}\nprint(calls)\nprint(tools["clock"]())\nprint(calls)',expected:"[]\n10:30\n['read']"},
    typicalError:{symptom:'返回 denied 却已经调用默认工具，或把 0 当成失败',repair:'同时查看返回状态和工具调用记录。拒绝路径必须在任何调用之前结束。'},
    hint:'沿代码找到真正出现函数调用括号的位置，所有许可检查应在它之前。',
    hintLevels:[{level:1,title:'看实际调用',text:'登记、查表、调用是三个不同动作。坏请求和未知名称分别应停在哪里？'},{level:2,title:'分开错误种类',text:'先用 valid_decision，再要求 kind 为 tool。允许表外直接 denied；只把选中函数的 OSError 转成 tool_error。'},{level:3,title:'保留返回值',text:'即使 result 是 None、False 或 0，它仍是成功调用的合法结果。用 status 表示成功，不用结果真假替代调用状态。'}],
    transfer:'登记两个虚构包裹的只读查询函数。更换工具名称后仍可查询；一个未登记的 cancel_order 请求必须零调用，即使查询文字要求取消。',
  },
  {
    id:'ae26-a01-loop', unitId:'A01', title:'读完，再决定下一步', topic:'有界循环 · 观察反馈 · 停止理由',
    prerequisites:['ae26-a00-tools'],
    description:'实现 run(model, tools, max_steps=3)。正整数预算只接受 type(value) is int，拒绝 bool；无效预算在任何 model 调用前抛 ValueError。每次 run 从新的空观察列表开始；每轮把按调用顺序累计的结果交给 model（外层列表副本），最多调用 max_steps 次。final 返回 {"status":"completed","answer":text} 并立即停；合法工具成功后加入原 result，再决定。bad_output、denied、tool_error 返回相应单字段状态并停；耗尽返回 {"status":"step_limit"}，不得多问一轮。其他异常继续传播。',
    starter:validate+'\n'+dispatch+'\n# 上面的函数来自前两课；请实现本次反馈循环。\ndef run(model, tools, max_steps=3):\n    pass\n',
    solution:validate+'\n'+dispatch+'\n'+loop,
    alternative:validate+'\n'+dispatch+'\ndef run(model, tools, max_steps=3):\n    if type(max_steps) != int or max_steps < 1:\n        raise ValueError("budget")\n    seen = []\n    used = 0\n    while used < max_steps:\n        used += 1\n        choice = model(seen[:])\n        if not valid_decision(choice):\n            return {"status":"bad_output"}\n        if choice["kind"] == "final":\n            return {"status":"completed", "answer":choice["text"]}\n        answer = dispatch(choice, tools)\n        if answer["status"] == "tool_result":\n            seen += [answer["result"]]\n        else:\n            return answer\n    return {"status":"step_limit"}\n',
    badSolution:validate+'\n'+dispatch+'\ndef run(model, tools, max_steps=3):\n    for _ in range(max_steps):\n        observations = []\n        decision = model(observations)\n        if decision["kind"] == "final":\n            return {"status":"completed","answer":decision["text"]}\n        outcome = dispatch(decision, tools)\n        if outcome["status"] != "tool_result":\n            return outcome\n        observations.append(outcome["result"])\n    return {"status":"step_limit"}\n',
    checks:[['直接回答、一次读取、两次结果反馈的真实顺序','__lesson_extension("ae26-loop-feedback", run)'],['坏建议与工具错误立即停止，不吞程序错误','__lesson_extension("ae26-loop-stop", run)'],['预算恰好封顶，无效预算零次模型调用','__lesson_extension("ae26-loop-budget", run)'],['按资料决定补查，两次运行互不串状态','__lesson_extension("ae26-loop-transfer", run)']],
    concept:'循环的下一轮不会自动知道工具刚返回了什么。先拿两张纸分别写 observations 和 result；append 把新结果留在观察列表，下一次 model 才能看到。如果在 for 内重建 observations=[]，每轮都会失忆；在函数外只建一次，又会把上次任务混进来。\n\n预算计的是决策函数的调用，不是工具数量。工具一次后 final 需要两次决策；预算1只够取得结果，结束应为 step_limit。final 立即 return，不能为了用满预算多调用工具。for _ in range(max_steps) 的 _ 表示这次不用循环编号；while 加明确计数也是合法办法。\n\nbool 在 Python 中也属于 int 的一种，所以只用 isinstance(True,int) 会得到 True。本题预算明确拒绝布尔值，用 type(max_steps) is int 区分。调用 model 时给观察列表的外层副本，避免模型重排它改变宿主累计顺序；本课工具返回的值不由循环改写。这个上限防止无限决定，不能证明决定有用，也不能撤销已发生的动作。',
    workedExample:{code:'seen = []\nfor item in ["先到", "后到"]:\n    seen.append(item)\n    print(list(seen))\nprint(len(seen))',expected:"['先到']\n['先到', '后到']\n2"},
    typicalError:{symptom:'工具已经返回，下一轮仍收到空列表；或第二次 run 带着上次结果',repair:'检查观察列表是否在函数内、循环外建立；打印每次 model 的实参，不靠增加预算掩盖丢反馈。'},
    hint:'先写两次决定的时间线：第一次请求、工具返回、第二次看到结果并回答。',
    hintLevels:[{level:1,title:'跟踪结果去哪了',text:'结果只打印出来还没有进入下一轮。把列表建立、append 和 model 调用放在时间线上。'},{level:2,title:'核对停止理由',text:'final 立即结束；三类已知失败直接返回；只有 tool_result 进入观察列表。决定次数耗尽才 step_limit。'},{level:3,title:'检查边界',text:'用预算1和2运行“先工具再回答”；再运行一个永远请求工具的模型。最后连续调用两次 run，各自第一次 model 都应收到 []。'}],
    transfer:'自己设计包裹查询模型：主来源给出结果就直接回答，主来源返回 unknown 才查询备份。为两种分支分别计算最少决策预算，并换两个工具名重新实现。',
  },
  {
    id:'ae26-a02-evidence', unitId:'A02', title:'回答之外的运行记录', topic:'事件 · 实际调用 · JSONL',
    prerequisites:['ae26-a01-loop'],
    description:'实现 run_traced(model, tools, max_steps=3, events=None)，保持上一课 run 的全部返回与预算合同。在有效运行开始追加 run_started；每次调用 model 前 model_called；合法 tool 请求追加 tool_requested；仅已登记且将实际调用时追加含 tool 名的 tool_started；成功后 tool_completed，OSError 后 tool_failed；已知结束追加 run_stopped 和 status。无效预算不写事件，其他程序异常传播时不伪造结束。另实现 append_event(write_line,event)：必需非空字符串 run_id/event，可选 tool/status 只能是字符串；仅保留这四字段，编码一行 JSON 加换行后调用 write_line 一次。坏事件 ValueError 且零写入；写入错误原样传播；不改输入。write_line 是本次受控追加器，不是文件路径。',
    starter:'import json\n\n'+validate+'\n'+dispatch+'\n# 可参考自己上一课的草稿；不要把完成回答当成实际工具效果。\ndef run_traced(model, tools, max_steps=3, events=None):\n    pass\n\ndef append_event(write_line, event):\n    pass\n',
    solution:'import json\n\n'+validate+'\n'+dispatch+'\n'+traced,
    alternative:'import json\n\n'+validate+'\n'+dispatch+'\n'+"def run_traced(model, tools, max_steps=3, events=None):\n    if type(max_steps) != int or max_steps < 1:\n        raise ValueError(\"budget\")\n    if events is None:\n        events = []\n    events.append(dict(event=\"run_started\"))\n    seen, answer, remaining = [], None, max_steps\n    while remaining:\n        remaining -= 1\n        events.append(dict(event=\"model_called\"))\n        choice = model(seen[:])\n        if not valid_decision(choice):\n            answer = dict(status=\"bad_output\")\n            break\n        if choice[\"kind\"] == \"final\":\n            answer = dict(status=\"completed\", answer=choice[\"text\"])\n            break\n        events.append(dict(event=\"tool_requested\"))\n        name = choice[\"name\"]\n        if name not in tools:\n            answer = dict(status=\"denied\")\n            break\n        events.append(dict(event=\"tool_started\", tool=name))\n        try:\n            value = tools[name]()\n        except OSError:\n            events.append(dict(event=\"tool_failed\", tool=name))\n            answer = dict(status=\"tool_error\")\n            break\n        events.append(dict(event=\"tool_completed\", tool=name))\n        seen += [value]\n    if answer is None:\n        answer = dict(status=\"step_limit\")\n    events.append(dict(event=\"run_stopped\", status=answer[\"status\"]))\n    return answer\n\ndef append_event(write_line, event):\n    if not isinstance(event, dict):\n        raise ValueError(\"record\")\n    selected = {}\n    for key in (\"run_id\", \"event\", \"tool\", \"status\"):\n        if key not in event:\n            if key in (\"run_id\", \"event\"):\n                raise ValueError(\"required field\")\n            continue\n        value = event[key]\n        if not isinstance(value, str) or (key in (\"run_id\", \"event\") and value == \"\"):\n            raise ValueError(\"field\")\n        selected[key] = value\n    write_line(json.dumps(selected, ensure_ascii=True) + \"\\n\")\n",
    badSolution:'import json\n\n'+validate+'\n'+dispatch+'\n'+traced.replace('events.append({"event": "tool_started", "tool": name})','pass').replace('write_line(json.dumps(safe, ensure_ascii=False) + "\\n")','write_line(json.dumps(event, ensure_ascii=False) + "\\n")'),
    checks:[['事件插在真实模型和工具调用之前与之后','__lesson_extension("ae26-trace-events", run_traced)'],['拒绝、预算、异常和第二次运行的事件边界','__lesson_extension("ae26-trace-failures", run_traced)'],['最终声称完成不能代替独立工具账本','__lesson_extension("ae26-trace-outcome", run_traced)'],['两行真实追加、字段白名单与错误不隐瞒','__lesson_extension("ae26-event-append", append_event)']],
    concept:'completed 只说明模型交回 final 并结束。它说“已经发出”不等于真的有工具调用，更不等于远端收到。判题会独立记录调用次数、实参和结果，再与事件核对；学生输出 passed=true 或补一条成功日志都不能替代这些事实。\n\nevents=None 表示未提供容器；在函数内用 if events is None 新建列表。不要用 events=[] 作默认参数，它只在定义时建立一次；也不要用 if not events 把调用者主动传入的空列表换掉。事件是短字典，追加位置应贴近真实动作：开始前记 started，确实返回后记 completed，未知工具不能出现 started。\n\nimport json 取得标准库；json.dumps 把字典编码成文本，json.loads 可读回。JSONL 每行一个完整 JSON 对象，末尾加 \\n 分隔；字段内部换行由编码器转义。只从允许字段重建新字典，不直接编码整份工具输出。write_line 是宿主提供的追加函数，当前题验证真实传给它的行和错误；原生文件的打开、追加与关闭在文件课程和外部工程中另做。白名单缩小记录范围，不保证允许字段没有秘密。',
    workedExample:{code:'import json\npacket = {"phase": "packed", "private": "只放在练习内"}\npublic = {"phase": packet["phase"]}\nline = json.dumps(public) + "\\n"\nprint(json.loads(line))\nprint("private" in packet)',expected:"{'phase': 'packed'}\nTrue"},
    typicalError:{symptom:'拒绝的工具也留下 started，或者日志记录整份正文',repair:'把日志与独立计数逐项对齐；从允许字段新建输出，不删改调用者数据。缺结束事件只表示证据不完整，不能猜效果。'},
    hint:'先在纸上列一条直接 final 和一条正常工具调用的事件，核对各事件究竟证明了什么。',
    hintLevels:[{level:1,title:'对照实际动作',text:'模型调用、工具请求、获准开始、返回、停止分别发生在哪一行？未获准的名称不能记为开始。'},{level:2,title:'保留原循环',text:'无效预算先拒绝；events 仅在为 None 时创建。每个已知返回分支附上对应 run_stopped，意外异常继续显露。'},{level:3,title:'验证写入',text:'先验证必需和可选字段，再创建允许字段副本。json.dumps 后只加一个记录分隔换行；连续写两次不能丢第一条，写失败不能返回假成功。'}],
    transfer:'为虚构提醒设计 request、approved、attempted、receipt 四个时刻。分别写“发出后丢回执”和“从未调用工具”的记录，说明仅凭本地日志还不能确定哪些事实；不连接真实账户。',
  },
].map(lesson => ({...common,...lesson,hint:lesson.hintLevels[0].text,source:{...common.source,unitId:lesson.unitId}}));

export const AE26_BRIDGE_IDS = Object.freeze(AE26_BRIDGE_LESSONS.map(lesson => lesson.id));
