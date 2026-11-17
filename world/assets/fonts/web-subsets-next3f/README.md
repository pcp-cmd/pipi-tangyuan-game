# 新文章字体增补

这三个 WOFF2 仅包含当前文字 corpus 中原 `web-subsets-v1` 未收录、原完整字体支持的 71 个 Unicode 字符。旧完整 OTF/WOFF2、旧子集、版权和来源文件、`world/font-tokens.css` 均保留原字节。

派生字体的内部字族为 `Island Journal Article Text Next3f` / `Island Journal Article Code Next3f`。许可仍是 **SIL Open Font License 1.1**，见父目录 `NOTO-LICENSE.txt`；原 name 表版权、许可声明和链接完整保留。源字体、旧子集、构建器和输出的 SHA-256 见 `MANIFEST.json`。

`world/font-article-tokens.css` 必须在 `world/font-tokens.css` **之后**加载。增补规则沿用 `Island Sans` / `Island Mono` 和原 weight 描述，只覆盖精确新增字符范围，不修改全局字族、字号或字重。后定义的匹配规则优先；旧完整字体仍可为玩家输入的其他字符按需加载。例如“幕”和“餐”由增补字体覆盖，“龘”仍由完整字体回退。原字体本来不支持的字符继续走既有系统或数字字体回退，不声称扩充原字体能力。

构建器复用固定 SHA-256 的 `tools/typescript/build-font-subsets.py` 中子集、重命名、轮廓和许可校验函数，并沿用现有 FontTools 4.61.1、Node v24.22.1 / Brotli 1.2.0。不安装依赖。

```sh
python3 -B tools/typescript/build-font-article-subsets.py --check --output /absolute/external/new-font-check.json
```

`--check` 不写产品文件，逐个检查当前 corpus 差集、全部新增字形轮廓、横向/纵向度量、行高度量、许可、旧资产摘要、增补摘要和精确 CSS。正文变化而字符集合不变仍可通过，报告会区分输入字节是否与构建时完全相同。

从**尚无本目录与新 CSS**的干净检出重建：

```sh
python3 -B tools/typescript/build-font-article-subsets.py --output /absolute/external/new-font-build.json
```

每个字体实际构建两次，字节必须相同。已有输出时构建器拒绝覆盖；需要保留本版并另行制作后续增补。不要运行旧构建器的写入模式来覆盖 v1。

此清单证明字体资产、覆盖和构建确定性，不证明浏览器下载行为、渲染表现或 Windows 显示。实际浏览器冷启动复测及任意输入完整字体回退由最终候选验收另行记录。
