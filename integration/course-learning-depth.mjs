export const DEEPER_LEARNING = {
  'archive-median': {
    explanation: '先把None过滤掉，不能写成if value，否则0也消失。排序后取中间低值low与高值high；奇数项二者相同，直接返回即可。\n\n偶数项的普通写法(low+high)/2有两个独立风险。1e308+1.6e308会先得到无穷；10**400转换成float会抛OverflowError。先把每个输入表示成整数比a/b与c/d，中点是(ad+cb)/(2bd)，中间整数乘加仍精确。浮点的as_integer_ratio()描述实际二进制值，不能假定0.1恰好是1/10。\n\n先练numeric-ratios，再逐步处理三个分支。若low==high，直接返回原值，保留最小非零浮点。否则构造整数比分子分母；能整除时直接返回整数。不能整除时做一次最终除法；若结果超过float范围，按本课相对容差可返回相差不到1的整数近似。最后独立检验同号大数、异号抵消和相等微小数，不能只验证普通statistics.median例子。',
    workedExample: { code: 'from fractions import Fraction\nlarge = 10**400\nmid = (Fraction(-large) + Fraction(large + 1)) / 2\nprint(mid.numerator, mid.denominator)\nprint(float(mid))\nprint(float((Fraction(1e308) + Fraction(1.6e308)) / 2))', expected: '1 2\n0.5\n1.3e+308' },
  },
  'archive-distance': {
    explanation: '先分清本题三条数值路径。若x、y、radius全是int，直接比较x*x+y*y与radius*radius，任意大整数仍精确，圆周计入。否则先用math.hypot，再与radius比较；这是本题明确要求的浮点舍入合同，例如0.3与0.4在半径0.5内。\n\n当混合了无法转换为float的巨整数，或hypot结果非有限时，回退到整数比。设x=a/b，y=c/d，r=e/f，比较(a*a*d*d+c*c*b*b)*f*f <= e*e*b*b*d*d。分母均为正，因此交叉相乘不改变不等号方向；不需要平方根，也不会在中间先变成无穷。\n\n先完成numeric-ratios，再给每个路径各写圆内、圆周、圆外案例。下面是回退路径的精确演示，不能机械替换常规浮点路径，因为本题常规浮点明确采用hypot舍入语义。',
    workedExample: { code: 'from fractions import Fraction\ndef exact_inside(x, y, radius):\n    return Fraction(x)**2 + Fraction(y)**2 <= Fraction(radius)**2\nbig = 10**400\nprint(exact_inside(big, 0.0, big))\nprint(exact_inside(big, 1.0, big))\nprint(exact_inside(big - 1, 0.0, big))', expected: 'True\nFalse\nTrue' },
  },
  'protocol-cache': {
    explanation: '先完成basics-arguments，把接收参数与展开调用分开。def f(a, /, *, b)中，/前的a只能按位置传，*后的b只能按关键字传。包装函数的*args/**kwargs能接收广泛形状，却不会自动保留原函数的限制。\n\ninspect.signature(function)读取原签名，signature.bind(*args, **kwargs)只做绑定检查，不调用业务函数，也不计算缓存键。缺参数、重复参数和错误传参方式会抛TypeError。必须先bind，即使缓存里已经有结果也不能绕过原函数合同。\n\n随后调用key_fn得到业务键，以key in cache判断存在性。成功才写入；0、False、None都可缓存，异常不能缓存。装饰器外层为每个函数创建独立cache，wraps保存名称、注解和__wrapped__，最后安装自己的cache_clear防止原函数同名属性覆盖它。依次测试合法调用、预热后的非法调用、失败后重试、清空和两个函数隔离。',
    workedExample: { code: 'from inspect import signature\ndef quote(item, /, *, speed=1):\n    return speed * 3\nshape = signature(quote)\nprint(dict(shape.bind("灯", speed=2).arguments))\ntry:\n    shape.bind(item="灯", speed=2)\nexcept TypeError:\n    print("位置专用参数不能按名字传")', expected: "{'item': '灯', 'speed': 2}\n位置专用参数不能按名字传" },
  },
  'protocol-shipment': {
    explanation: '先完成engineering-annotations和engineering-dataclass。@dataclass根据字段生成__init__、比较等方法；frozen=True拒绝普通属性赋值。字段注解不会自动验证值，frozen也不会冻结字段指向的可变列表。\n\n生成的构造方法在赋值后调用__post_init__。Shipment在这里先严格检查identifier是str，strip后不得为空；再把weights转成tuple快照，并检查至少一项、每项type(value) is int且大于0。True虽然isinstance(True,int)为真，仍须拒绝。\n\n冻结对象构造中的规范化使用object.__setattr__，这是本协议工作台明确允许的构造动作；构造后普通shipment.weights=...仍被拒。名称和tuple里的整数都不可变，才使内容相等和hash一致有可靠基础。分别测试外部列表后改、两个相同运单作为集合键、普通属性赋值和坏字段，不把单一tuple例子当完整合同。',
    workedExample: { code: 'from dataclasses import dataclass, FrozenInstanceError\n@dataclass(frozen=True)\nclass CountCard:\n    count: int\n    def __post_init__(self):\n        if type(self.count) is not int or self.count < 0:\n            raise ValueError("nonnegative integer required")\na = CountCard(2)\nprint(a == CountCard(2), hash(a) == hash(CountCard(2)))\ntry:\n    a.count = 4\nexcept FrozenInstanceError:\n    print("字段已冻结")\ntry:\n    CountCard(True)\nexcept ValueError:\n    print("布尔值不是本题数量")', expected: 'True True\n字段已冻结\n布尔值不是本题数量' },
  },
};

export const INPUT_DOMAINS = {
  'safe-buy': '余额coins与价格price使用非负整数，包含0。返回严格True或False，恰好够钱允许购买。',
  discount: 'price为非负有限int/float，percent为0至100的有限int/float；允许小数与0、100端点。',
  'workshop-closure': 'percent为0至100的有限int/float；返回的函数接受非负有限int/float价格，允许零价与小数。',
  'select-items': 'prices是有限数值列表，budget是有限数值；可含负数、0、重复项，输出保持原顺序。',
  generator: 'n是非负整数，0表示空流；返回一次性按需迭代器。大n时取得前三项不应提前建立整批列表。',
  'workshop-wallet': 'start是非负整数；costs是整数列表。负金额拒绝且余额不变，0金额合法；不同Wallet互不影响。',
  'observatory-prefix': 'values是整数列表，可含负数与0；返回长度len(values)+1的整数列表，第一项固定为0。',
};
