// Static lesson context only. Original editor, checks and save/navigation owners stay authoritative.
const content = {
  "task": {
    "heading": "货栈委托：列出缺货单",
    "mission": "替货栈列出还缺哪些货、各缺多少。这里只算缺口，不扣库存，也不改订单。",
    "invitation": "可以先展开「本关知识卡」预测一张缺货单，再到代码编辑器实现 shortages(stock, orders)。不必填写或提交预测。"
  },
  "conceptSupplement": {
    "prediction": {
      "heading": "先想一想：教学预测示例 A（绳/茶/灯）",
      "provenance": "教学预测示例 A：绳/茶/灯 · 示例输入 / 手算预期，未运行你的代码",
      "provenanceNote": "这只是虚构数据的手算示例，不展示你的程序返回，也不表示已经补货。",
      "stockLabel": "示例库存 stock",
      "stock": {
        "绳": 4,
        "茶": 1
      },
      "ordersLabel": "示例订单 orders",
      "orders": {
        "绳": 6,
        "茶": 1,
        "灯": 2
      },
      "prompt": "绳还差多少？茶恰好够，要不要列出？库存表没有灯，本题怎样处理？先想一想，再按需查看手算预期。",
      "reveal": {
        "summary": "查看本例的手算预期（不是程序返回）",
        "initialOpen": false,
        "expectedLabel": "手算预期",
        "expected": {
          "绳": 2,
          "灯": 2
        },
        "explanation": [
          "绳不足，还缺 2。",
          "茶恰好足够，不列入缺货单。",
          "灯没有库存记录，按本题约定视为 0，还缺 2。"
        ],
        "coverage": "本例是“不足、恰好、缺键”。有余量可对照原第 4 项检查：水有 8、订单要 2，预期不列出缺货。"
      }
    },
    "recall": {
      "heading": "字典的小例子（与本题函数分开）",
      "intro": "get(键, 默认值) 在没有这个键时给出默认值；for label in counts 依次取得字典里的键。试着预测下面会打印什么。",
      "code": "counts = {\"贝壳\": 4}\nprint(counts.get(\"羽毛\", 0))\nfor label in counts:\n    print(label)\n",
      "boundary": "这里只回忆读字典和取键，不是 shortages 的完整写法。把未知库存当 0 是本题约定，不是所有真实货栈都适用。"
    },
    "readResults": {
      "heading": "写完后，怎样看结果",
      "steps": [
        "在原代码编辑器写函数，准备好后点「运行代码」。查看示例不会替你运行。",
        "运行后的结果以原检查区为准。正常进入任务检查时沿用原 5 项；若程序先报错，先看原错误信息，这时可能还没有检查结果。",
        "检查标签里的箭头指向预期，不是你的函数实际返回；打印输出也不等于函数返回。",
        "最后一项同时检查那组输入的返回值和输入是否保持原值。它没有通过时，先看原检查详情，不要仅凭这一项猜测原因。",
        "检查通过与保存成功是两回事。请查看当前保存状态；若未确认保存，先「导出当前进度」，再「重试保存」。",
        "离开时用原关闭或返回按钮。若保存未完成，请留在当前页面处理；不要依赖关页自动保存。"
      ],
      "next": "下一步由原结果区的按钮和先修提示决定；看到「到手账查看先修」时，先按提示补齐。已有有效记录不必重做。"
    },
    "inputRule": "stock 是库存表，orders 是订单表；两表的数量都是非负整数。本题把库存表里没有的物品按 0 计算，只列出缺货数量大于 0 的项。"
  }
};
export function renderMarketStockContext({task, supplement, lessonId}) {
  task.replaceChildren(); supplement.replaceChildren();
  task.hidden = true; supplement.hidden = true;
  if (lessonId !== 'market-stock') return false;
  const document = task.ownerDocument;
  const make = (tag, text, className = '') => {
    const node = document.createElement(tag);
    if (text !== undefined) node.textContent = text;
    if (className) node.className = className;
    return node;
  };
  const {task:brief, conceptSupplement:extra} = content;
  task.append(make('strong', brief.heading), make('p', brief.mission), make('p', brief.invitation));
  const p = extra.prediction, r = p.reveal;
  supplement.append(make('p', extra.inputRule), make('h4', p.heading, 'knowledge-heading'),
    make('p', p.provenance), make('p', p.provenanceNote),
    make('strong', p.stockLabel), make('pre', JSON.stringify(p.stock, null, 2)),
    make('strong', p.ordersLabel), make('pre', JSON.stringify(p.orders, null, 2)), make('p', p.prompt));
  const reveal = make('details'); reveal.open = false;
  reveal.append(make('summary', r.summary), make('strong', r.expectedLabel), make('pre', JSON.stringify(r.expected, null, 2)));
  const reasons = make('ul', undefined, 'knowledge-list');
  for (const text of r.explanation) reasons.append(make('li', text));
  reveal.append(reasons, make('p', r.coverage)); supplement.append(reveal);
  const recall = extra.recall, figure = make('figure', undefined, 'knowledge-example'), pre = make('pre');
  pre.append(make('code', recall.code)); figure.append(pre);
  supplement.append(make('h4', recall.heading, 'knowledge-heading'), make('p', recall.intro), figure, make('p', recall.boundary));
  const guide = extra.readResults, list = make('ul', undefined, 'knowledge-list');
  for (const text of guide.steps) list.append(make('li', text));
  supplement.append(make('h4', guide.heading, 'knowledge-heading'), list, make('p', guide.next));
  task.hidden = false; supplement.hidden = false;
  return true;
}
