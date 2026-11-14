# 06 · 重试有预算，取消有归属

## 不是所有异常都值得重试

文件名写错、参数不合法，重复一百次也不会自动变好。临时服务不可用可能恢复，但也需要次数、等待和总时限。这里由调用者用 `TransientError` 明确标记可重试失败；其他异常原样传播。

先用自己的纸面例子计算：最多四次尝试，等待基数 0.5 秒，前三次失败时等待分别是 0.5、1、2 秒；最后一次失败后不再等待。成功时立即返回，不能把真实结果替换为“成功”字符串。

## 异步函数与可注入等待

`async def` 调用后产生协程，使用 `await` 才把结果和异常带回当前流程。`asyncio.sleep` 允许其他工作继续；同步 `time.sleep` 会阻塞事件循环，不适合放在这里。

为了精确检查等待序列，测试可以传一个记录 delay 的 async 函数。它仍在真实 Python 中运行真实控制流，只是不耗费真实等待时间。要证明取消，则需要真正的 await 点；本包另用 `asyncio.Event().wait()` 配合总时限测试 finally 是否执行。

## 总时限覆盖整件事

假设每次尝试最多两秒，重试三次，再加等待，整个操作可能远超两秒。把 timeout 放进每一轮，会重复刷新预算。`with_deadline` 接收整个操作，它包含所有尝试与重试间等待。

Python 3.11 提供 `asyncio.timeout` 异步上下文。另一种合法方案可使用 `asyncio.wait_for`。先用与本题不同的小实验理解清理：

```python
import asyncio

async def wait_for_bell():
    try:
        await asyncio.Event().wait()
    finally:
        print("bell listener closed")

async def demo():
    try:
        async with asyncio.timeout(0.02):
            await wait_for_bell()
    except TimeoutError:
        print("time is up")

asyncio.run(demo())
```

先预测两行输出顺序，再运行。取消不是清理完成的同义词；等待协程退出并执行 finally，才知道本层拥有的工作已经收尾。

## 本题的失败证据

测试检查调用次数、等待值、最后异常是否仍是原对象、永久失败和取消是否立即传播，以及总时限是否覆盖正在等待的重试。bool 在 Python 中是 int 的子类，所以“最多 True 次”不能用普通 isinstance(int) 意外放行。

Debug 选一种坏实现：捕获所有 Exception 后重试；每轮都重新建立总时限；末次失败后再 sleep；返回 None 掩盖最终错误。你的测试应当指出哪个可观察事实被破坏，而不仅仅检查实现里有没有某个关键字。

## 边界与后续

离线练习没测真实服务的限流、Retry-After、抖动退避或跨进程取消。也没证明 CPU 死循环能被协程取消；没有 await 的代码不一定及时响应取消。请将这些写为设计边界，不编造已经验证的网络可靠性。
