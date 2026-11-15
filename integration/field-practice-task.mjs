export const FIELD_PRACTICE_TASK = {
  "id": "field-practice",
  "title": "远航实践 · 环境、边界与架构",
  "contractRevision": 1,
  "courseId": "engineering-cli",
  "courseIds": [
    "engineering-cli",
    "permission",
    "ae26-a01-loop",
    "project-stock-ledger"
  ],
  "prerequisiteIds": [
    "engineering-cli",
    "engineering-files",
    "permission",
    "ae26-a01-loop",
    "testing-regression",
    "project-stock-ledger"
  ],
  "prerequisiteTaskIds": [
    "stockledger",
    "repo-repair"
  ],
  "ae26Units": [
    "F00",
    "S01",
    "X00",
    "GRAD"
  ],
  "summary": "在本机恢复路径、检查工具边界、比较同任务控制结构，再独立交付顺序预约工具。",
  "preparation": "可先领取和下载，按四个子合同逐项实践。接单不代替课程通过。",
  "download": {
    "url": "../integration/engineering-labs/field-practice/student.zip",
    "filename": "field-practice-student.zip",
    "sha256": "4e3bd364fbd425ca9378eb556c2248585ffba2dd499812bd396d017bbc667b85"
  },
  "readme": "../integration/engineering-labs/field-practice/learner/README.md",
  "readingUrls": [
    {
      "title": "四项合同",
      "url": "../integration/engineering-labs/field-practice/learner/CONTRACT.md"
    },
    {
      "title": "自己的交付记录",
      "url": "../integration/engineering-labs/field-practice/learner/DELIVERY.md"
    }
  ],
  "requirements": [
    "F00：保留正确目录、错误目录及恢复后的实际进程结果，核对解释器和真实扩展名。",
    "S01：提交精确授权、越界拒绝和直接读取测试哨兵的对照。工具边界不等于OS隔离。",
    "X00：同任务实现固定流程、决策循环与两个角色协作，运行compare保存实际事件及源码摘要。",
    "GRAD：独立实现顺序预约与取消，提交真实文件输出、自己的测试、失败与修复；真人答辩另行审核。"
  ],
  "allowedFiles": [
    "CONTRACT.md",
    "DELIVERY.md",
    "README.md",
    "fieldwork/__init__.py",
    "fieldwork/architecture.py",
    "fieldwork/boundary.py",
    "fieldwork/environment.py",
    "fieldwork/experiment.py",
    "fieldwork/graduate.py",
    "fieldwork/port.py",
    "fixtures/capacities.json",
    "fixtures/events.json",
    "fixtures/marker.txt",
    "fixtures/scenarios.json",
    "run.py",
    "tests/test_architecture.py",
    "tests/test_boundary.py",
    "tests/test_environment.py",
    "tests/test_graduate.py",
    "ARCHITECTURES.json",
    "reservations.json",
    "RUN.txt"
  ],
  "requiredFiles": [
    "run.py",
    "fieldwork/__init__.py",
    "fieldwork/environment.py",
    "fieldwork/boundary.py",
    "fieldwork/architecture.py",
    "fieldwork/port.py",
    "fieldwork/experiment.py",
    "fieldwork/graduate.py",
    "fixtures/scenarios.json",
    "ARCHITECTURES.json",
    "DELIVERY.md"
  ],
  "submissionNotice": "只收自己的源码、测试、虚构输入和实际结果。预览清单后保存，不执行或自动发送。",
  "reviewNotice": "本地自测与材料一致性可核对；未配置可信审核方，独立构建、排错、迁移及毕业仍待审核。",
  "capabilities": [
    "build",
    "debug",
    "transfer"
  ],
  "rewards": {
    "coins": 0,
    "xp": 0
  }
};
