# 接手工具，也接手所有出口的关闭责任

读取源时可能失败，处理某一项时也可能失败。若close只写在循环后面，任何异常都会跳过它。调用者已经把源交给你，这次函数退出时就不能把一份仍打开的资源留在身后。

本课 `consume_owned(source, transform)` 接手一个已经取得的源。源可迭代并有close方法，题目保证close不会抛错。每读一项立刻调用transform一次，按顺序保存结果；成功、空源、创建迭代器失败、读取失败或处理失败，都要关闭源恰好一次。

## finally在异常传播前也会执行

下面的普通Python探针只观察收尾与异常身份，没有实现资源消费函数。

```python
trace = []
failure = ValueError("bad item")
try:
    try:
        trace.append("work")
        raise failure
    finally:
        trace.append("cleanup")
except ValueError as error:
    print(error is failure)
print(trace)
```

输出True和 `['work', 'cleanup']`。finally不需要把错误变成成功，执行收尾后原异常仍向外传播。同一对象身份被保留，而不是新建一个仅文字相同的ValueError。

先划定关闭责任的保护范围，再开始迭代。`for` 会先取得迭代器，这一步也可能抛错；如果在try外先写 `iterator = iter(source)`，创建迭代器失败就绕开了收尾。close应有一个统一调用位置，不要在except和finally都关一次。

## 先处理当前项，再取得下一项

不要先 `list(source)` 读完再map。除了额外存储，它改变了事件顺序：原本第二项处理失败时不应再读取第三项，预先读完却已消费后续数据。当前合同要求的顺序是读取第0项、处理第0项、读取第1项、处理第1项，如此交替。

transform可以返回0、False、None，它们都是应保留的结果。错误时不能返回已完成的半份列表当成功，不能只打印错误后继续，也不能在finally中return；finally的return会压住原异常。让业务错误自然传播，收尾只负责资源。

源只有可迭代与close这两项承诺，未必实现with要求的上下文管理协议。因此不能仅凭“有close”就直接 `with source`。可以使用合适的清理结构，但要清楚结构调用的是哪个对象、何时调用、调用几次。

这些保证不包含close自身失败时如何组合错误，也不涉及异步取消或强行关闭阻塞IO。题目明确把这些责任留在范围之外，别用一段同步finally概括所有资源系统。

## 借来的源，只关闭自己新建的工具

另写处理流程：输入源是借用的，函数不能关闭它；函数通过factory创建一个记录器，并负责无论成功失败都关闭记录器。创建记录器失败时没有对象可关，源迭代失败时记录器仍要关，业务异常应保留原对象。

用事件记录核对创建、读取、处理、记录、关闭先后，并检查源close从未调用。新题改变所有权与取得失败的边界，不能把当前finally中的source.close照搬。保存故障注入记录供人工评估，不自动登记游戏成绩。
