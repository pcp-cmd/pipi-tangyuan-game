# 网页界面与课程字体子集

这些 WOFF2 是保留字体的派生子集，使用独立的内部名称 `Island Journal Text Subset` / `Island Journal Code Subset`。原 `noto-sans-*.otf`、完整 WOFF2、版权与来源文件不变。

许可仍为 **SIL Open Font License 1.1**，详见父目录 `NOTO-LICENSE.txt`。每个子集保留原字体 name 表中的版权、许可声明与许可链接。没有新的字体授权条款；不得单独销售字体。

`MANIFEST.json` 记录每个字体的来源摘要、生成摘要、第二次独立构建摘要、字形轮廓和横向度量核验、原字库覆盖分区、课程 ID 与输入文本文件摘要。

## 加载策略

`world/font-tokens.css` 给同一 CSS 字族定义两份互不重叠的 `unicode-range`：现有界面/课程文字使用子集，其余原字库字符按需加载完整 WOFF2。玩家写入子集之外但原字库支持的中文仍可显示。原来的阿拉伯数字和天城文数字补充字体保持。

子集外回退可用“龘”检查：它存在于原完整字库、初版子集不含。请在性能冷启动测量完成之后再检查此类字符，避免完整字体进入缓存改变测量条件。未被原字体支持的字符继续由原 CSS 系统字体列表回退，不声称扩大了原字库覆盖。

## 可复现构建与检查

从项目根目录执行，工具要求原环境已有的 Python FontTools 4.61.1、Node v24.22.1 / 内置 Brotli 1.2.0。不修改安装目录，不需要 Python Brotli 绑定，也不安装依赖。

```sh
python tools/typescript/build-font-subsets.py --output /absolute/external/font-build.json
python tools/typescript/build-font-subsets.py --check --output /absolute/external/font-check.json
```

构建收集 `world` / `integration` 的文字源码及随包工程材料，排除测试、生成代码/CSS、素材和第三方包，补齐可打印 ASCII，并处理 HTML 实体和 Unicode 转义。每个字体独立生成两次，字节必须一致；生成后再次解码，核对所需字符、字形轮廓、横向度量和许可元数据。原完整字体与许可文件在构建前后逐字节摘要核对。

`--check` 不写产品，只验证当前文本覆盖、子集摘要、原件摘要和 Unicode-range CSS 摘要。新增界面文字后应先执行此检查；若出现未覆盖的字符，重新构建。字体文件大小变化、真实浏览器下载、浏览器渲染及 Windows 显示分别验收。
