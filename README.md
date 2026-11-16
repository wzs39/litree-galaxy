# LitTree Galaxy · 点亮之树

学科科技树与交互式知识星图：将计算机科学与数学等学科体系建模为**带前置依赖的分层知识图谱**，默认提供高清 **2D 语义图谱（HiDPI）**，并支持一键切换 **3D WebGL 知识星云**。学习者可以逐级钻取章节、追踪前置依赖路径、点亮知识点并沉淀复习与笔记。

**在线使用**：<https://wzs39.github.io/litree-galaxy/>（GitHub Pages 纯静态部署，学习进度本地存储）

## 核心特性

- **高清 2D 语义图谱（默认）与可选 3D 星云切换**：
  - 2D 画布（`FallbackConstellation`）与雷达小地图（`ConstellationRadar`）支持 `2x–3x` HiDPI 超采样渲染与像素对齐胶囊节点，文字与连接线在高分屏下清晰锐利；
  - 顶部工具栏支持随时切换 **2D 平面图谱 / 3D WebGL 星云**（`NebulaEngine` + `ParticleBurstSystem`）。
- **单击直达下钻与紧凑子树视图**：
  - 点击带子节点的学科标题、分支或单元直接进入子树聚焦视图，无需二级拦截弹窗；
  - 子树视图（`semantic2dLayout`）按当前节点规模动态规划紧凑网格与层级引导边，配合悬浮导航条（`返回上一级` / `本节资料` / `只看关联链` / `星云全景`）快速浏览。
- **结构化 4 标签学习抽屉（`StudyDrawer`）**：
  - 点击任意最小知识点直达详情抽屉，内容收敛为 `概览与资料`、`目录与子项`（或 `清单`）、`前置路径`、`练习笔记` 四个清晰标签页；
  - 头部提供父级面包屑直跳与同级上/下节切换，底部内置紧凑番茄专注计时器（`FocusTimerWidget`）。
- **全量最小节点资料覆盖**：
  - 内置 `cs-math` 学科包全部 `8,286` 个最小知识点与 `1,525` 个章节分支均已补全摘要、预计学习时长与多条定向学习资料（含课程/文档/检索入口），并支持继承所属单元资料与运行时兜底资源。
- **硬门控点亮与前置追踪（`pathTrace`）**：
  - 必须前置未完成时单元自动锁定并展示缺失前置数量；
  - 前置路径标签页按拓扑顺序给出「逐个点亮」引导链与一键定位入口，并支持关联链高亮与孤立查看。
- **学习工作台生态**：
  - **多维度透镜（Lens）**：`全部` / `可点亮` / `核心` / `路线` / `待复习` / `收藏`；
  - **全局快速搜索（`Ctrl+K` / `/`）**：`CommandPalette` 即时检索全图谱节点与层级路径；
  - **今日轨道 & 复习雷达**：`TodayOrbitHud` 统计学习进展与每日目标，`ReviewRadarPanel` 辅助间隔复习调度；
  - **图谱编辑器 & 本地备份**：`GraphEditorPanel` 支持节点/连线编辑与校验导出，`BackupModal` 支持学习进度 JSON 导入导出。

## 内置学科包（`litree/pack-v2`）

- **`cs-math`（计算机 + 数学）**：`10,013` 个节点（`1,525` 分支 / `202` 学习单元 / `8,286` 最小知识点）、`690` 条依赖边（`279` 必须前置 + `411` 推荐前置，均附课程依据）、`13` 个学科域（`11` 个学科根）、`12` 条推荐学习路线。内容源基于 [cs-math-skill-tree](https://github.com/zeroa234/cs-math-skill-tree)（MIT）。
- **`dev-mini`（开发迷你树）**：用于快速调试、测试与自制学科包的轻量模板。

## 快速开始

```bash
npm install
npm run dev        # 启动本地开发服务器（默认 http://localhost:5173）
```

常用脚本：

```bash
npm run typecheck      # TypeScript 类型检查 (tsc --noEmit)
npm test               # Vitest 单元测试与集成测试
npm run build          # 构建纯静态产物到 dist/
npm run preview        # 本地预览 dist/（http://127.0.0.1:4173）
npm run test:e2e       # Playwright 端到端测试
npm run enrich:leaves  # 为最小知识点与分支补全摘要与学习资料
npm run convert:csmath # 从上游 cs-math-skill-tree 转换基础数据包
npm run augment:csmath # 扩充学科路线与扩展节点
```

## 自制学科数据包

1. 复制 `resources/packs/dev-mini.json` 作为 `litree/pack-v2` 骨架；
2. 填充 `domains`、`nodes`（`kind: branch | unit | leaf`）、`edges`（`type: hard | soft` + `reason`）与 `routes`；
3. 放入 `resources/packs/` 并在 `resources/packs/index.json` 注册；
4. 可运行 `npm run enrich:leaves` 自动校验并补全缺失资料字段。

## 技术栈

- **前端框架与状态**：React 19 + TypeScript (strict) + Zustand + Framer Motion + Lucide Icons
- **可视化渲染**：HiDPI 2D Canvas 语义布局（`FallbackConstellation` / `semantic2dLayout`）+ Three.js WebGL 星云引擎（`NebulaEngine` / `CameraRig`）
- **工程与测试**：Vite + Vitest（Happy DOM）+ Playwright；内置 GitHub Actions（`.github/workflows/deploy.yml`）自动构建并发布到 GitHub Pages

## License

MIT。内置学科知识结构部分源自 [cs-math-skill-tree](https://github.com/zeroa234/cs-math-skill-tree)（MIT）。
