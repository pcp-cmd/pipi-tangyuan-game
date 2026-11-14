# 来源与核实范围

读取日期为 2026-11-14。教学、未解接口、夹具和检查由本项目重新编写；没有把原书的参考实现或第三方 SDK 源码装进学生 ZIP。

## 用户交接的 AE26 原材料

本工程对照原始 AE26-Library 的以下六单元，分别读取 lesson、lab 和 mastery。原材料保留在交接来源中，不混同本工程已接入的成果。18 个来源文件的 SHA-256 保存在作者证据的 `ae26-source-bindings.json`。

| 单元 | 采用的能力要求 | 本工程中的位置 |
| --- | --- | --- |
| F07 | JSON 与业务合同、HTTP 分层失败 | 第 1、2 章与真实 HTTP 夹具 |
| I00 | 真实 CLI、参数列表、stdout 与 stderr、退出码 | 第 1 章、含中文空格路径和异目录启动检查 |
| I01 | 固定版本 stdio、生命周期、ID、错误、关闭 | 第 3 章、MCP 客户端与服务器、实际 SDK 互通 |
| A02 | 真实事件追加、允许字段、缺记录边界 | 第 4 章与 JSONL 实验 |
| E00 | 独立效果、全试验分母、危险否决、评分器负控 | 第 5 章与独立 grader 进程 |
| E01 | span 身份、parent、并发、重试、取消和未知 | 第 4 章与两个真实 worker、第三进程读回 |

同一个工程承担这些能力，不按六个单元重复计算为六份独立作品。半开时间窗口是本工程另写的迁移任务。

## 实际读取的第一方规范

- [MCP 2025-11-25 生命周期](https://modelcontextprotocol.io/specification/2025-11-25/basic/lifecycle) 规定版本与能力协商、初始化通知和关闭顺序。
- [MCP 2025-11-25 传输](https://modelcontextprotocol.io/specification/2025-11-25/basic/transports) 规定 stdio 的 UTF-8 JSON 消息、换行与输出通道。本工程的普通 HTTP 端点不冒充其中的 Streamable HTTP。
- [MCP 2025-11-25 工具](https://modelcontextprotocol.io/specification/2025-11-25/server/tools) 提供工具发现、调用、内容与工具执行错误的区分。
- [MCP 2025-11-25 基础](https://modelcontextprotocol.io/specification/2025-11-25/basic) 提供请求、响应、ID 和能力框架。
- [JSON-RPC 2.0 第一方规范](https://www.jsonrpc.org/specification) 提供请求与通知、响应 ID 和错误分类。

这是明确冻结的历史协议版本，不称最新版本。课程仅实现固定 catalog_quote 工具的 schema 与 stdio 子集，不声明实现通用 JSON Schema 2020-12、所有 MCP 能力或完整一致性认证。

## 实际 SDK 互操作

作者环境已经安装 Python MCP SDK 1.29.0，本轮没有安装或升级依赖。实际双向实验分别使用 SDK 客户端连接作者服务器、作者客户端连接 SDK 服务器。覆盖初始化、列工具、正确调用、字段错误、业务错误、交错通知、后续正确调用和 EOF 后退出。

SDK 1.29.0 在本次未知 method 试验中返回 -32602，作者服务器对未知方法返回 -32601。首跑对此差异的失败记录保留。后续互操作检查把无效 tools/call 参数的 -32602 与未知方法的实际结果分开记录，没有改写学生服务器的合同。

作者读取本机 SDK 的实际 client session、server、stdio 和 types 源文件，并在实验报告保存摘要。已安装 SDK 的 LICENSE 是 MIT，版权行是 Anthropic, PBC。SDK 代码与依赖未再分发到本学生包。需要查看 SDK 可用性或官方实现时，使用 [Python SDK 第一方仓库](https://github.com/modelcontextprotocol/python-sdk)。

## 本项目自己的边界

学生包只含本项目新写的文本源码、虚构资料、说明和测试。没有角色美术、原游戏资产、第三方字体或账号资料。本轮仅向用户交付项目新增文件，没有为用户授予新的公开许可证。交付与来源范围见根目录 SOURCE-NOTICE.md；原游戏、原书和第三方材料的许可保持原边界。

本机作者运行和 SDK 互操作均属于 Linux 证据。Windows 原生控制台、真实浏览器操作、完整协议一致性、未知代码隔离和真实学习者独立完成分别记录。代码中有检查不等于检查已经运行，公开夹具通过也不等于真实玩家已掌握。
