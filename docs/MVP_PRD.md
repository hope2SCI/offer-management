# 求职流程管理平台 MVP PRD

## 1. 文档信息

- 产品名称：暂定为 Offer Management
- 文档版本：v0.2
- 文档日期：2026-06-19
- 产品形态：本地部署的个人求职流程管理平台
- 目标阶段：MVP

## 2. 产品定位

本产品是一个面向个人求职者的本地优先求职流程管理工具，用于集中管理岗位机会、投递状态、简历文件、站内日程待办和求职进度数据。

第一版定位为个人效率工具，不做多人协作或 SaaS 化能力。核心目标是让用户能快速记录、持续跟进、清楚知道每个岗位目前处于什么阶段，以及接下来需要做什么。

## 3. 目标用户

- 正在求职、实习申请、校招或社招中的个人用户。
- 同时投递多个岗位，需要管理状态、材料、日程和后续跟进的人。
- 希望将求职流程沉淀为结构化数据，而不是散落在表格、备忘录和聊天记录里的人。

## 4. 核心目标

1. 快速记录岗位机会。
2. 用看板管理固定求职流程。
3. 管理 PDF/DOC/DOCX 简历文件，并支持预览、下载和岗位关联。
4. 以日历和列表展示待办事项，支持今日待办、逾期待办和未来 7 天日程。
5. 通过 Dashboard 查看当前求职状态。
6. 为后续 AI 简历建议、面试复盘和投递分析预留入口。

## 5. MVP 范围

### 5.1 包含功能

- 单用户本地登录。
- 岗位新增、编辑、删除。
- 固定状态流转的投递看板。
- 岗位详情页。
- 岗位优先级。
- 岗位结束原因。
- PDF/DOC/DOCX 简历上传、列表、预览、下载和备注。
- 简历与岗位关联。
- 站内日程待办。
- Dashboard 基础统计。
- 面试复盘入口占位。

### 5.2 暂不包含功能

- 多用户 SaaS。
- 团队协作。
- 简历正文在线编辑。
- 简历版本树。
- JD 自动解析。
- 第三方日历同步。
- AI 实际调用。
- 邮件通知、浏览器通知、微信通知。
- 复杂权限系统。
- 移动端 App。

## 6. 技术方案

### 6.1 技术栈

- Framework：Next.js 16
- UI：React 19
- Styling：Tailwind CSS 4
- ORM：Prisma
- Database：SQLite
- Auth：JWT + bcrypt
- Charts：Recharts
- File Storage：本地文件系统
- Resume Preview：PDF 使用浏览器原生预览，DOC/DOCX 提供当前页占位预览和下载

### 6.2 部署形态

第一版只考虑本地部署。数据库使用 SQLite，简历文件存储在本地目录中。

推荐目录：

```text
uploads/resumes
```

数据库中只保存文件元信息和文件路径。

### 6.3 认证策略

- 系统为单用户模式。
- 首次启动时，如果不存在用户，则允许创建本地管理员账号。
- 密码使用 bcrypt 哈希保存。
- 登录成功后签发 JWT。
- JWT 建议保存于 httpOnly cookie。
- 不提供公开注册、邮箱验证、找回密码。

## 7. 核心业务流程

### 7.1 岗位状态流

岗位状态固定为：

```text
感兴趣 -> 已投递 -> 笔试 -> 一面 -> 二面 -> HR面 -> Offer -> 已结束
```

说明：

- 二面不是必经状态。
- HR 面不是必经状态。
- 用户可以根据实际情况跳过某些状态。
- 已结束状态需要记录结束原因。

### 7.2 结束原因

岗位进入已结束后，可以选择结束原因：

```text
被拒 / 无回应 / 放弃 / 已入职 / 其他
```

结束原因不作为独立看板列，而是已结束状态下的补充字段。

### 7.3 优先级

岗位支持三个优先级：

```text
高 / 中 / 低
```

优先级用于看板展示、筛选和 Dashboard 提醒。

## 8. 页面结构

### 8.1 `/setup`

首次初始化账号页面。

访问条件：

- 系统中没有任何用户时可访问。
- 用户已存在时应跳转到登录页或 Dashboard。

核心功能：

- 创建用户名。
- 创建密码。
- 初始化本地管理员账号。

### 8.2 `/login`

登录页。

核心功能：

- 输入用户名。
- 输入密码。
- 登录。
- 登录失败提示。

### 8.3 `/dashboard`

首页概览页。

核心内容：

- 总岗位数。
- 活跃岗位数。
- Offer 数。
- 已结束数量。
- 高优先级岗位数。
- 今日待办。
- 逾期待办。
- 未来 7 天日程。
- 最近更新的岗位。
- 状态分布图。
- 投递到面试转化率。

### 8.4 `/applications`

投递看板页。

看板列：

```text
感兴趣
已投递
笔试
一面
二面
HR面
Offer
已结束
```

岗位卡片建议展示：

- 公司名。
- 岗位名。
- 当前状态。
- 优先级。
- 下一事项。
- 最近更新时间。
- 关联简历。
- 已结束原因，若状态为已结束。

第一版交互：

- 查看岗位列表。
- 按状态分列。
- 点击卡片打开岗位详情弹窗。
- 在看板顶部或任一状态列中打开新增岗位弹窗。
- 在详情弹窗内编辑并保存岗位信息。
- 更新岗位状态。
- 支持基础筛选和搜索。

### 8.5 岗位新增与详情弹窗

岗位新增和详情编辑均在 `/applications` 页面内以弹窗形式完成，不再提供独立新增页或详情页。

新增岗位必填字段：

- 公司名。
- 岗位名。

新增与编辑可选字段：

- 城市。
- 薪资范围。
- JD 链接。
- JD 内容。
- 投递渠道。
- 优先级。
- 当前状态。
- 关联简历。
- 备注。

详情弹窗核心内容：

- 基础信息。
- 当前状态。
- 状态流转操作。
- 已结束原因。
- 优先级。
- 关联简历。
- 待办日程。
- 备注。
- 活动时间线。
- 面试复盘入口。

### 8.6 `/resumes`

简历仓页面。

核心功能：

- 点击页面上传按钮后，在当前页弹出上传卡片。
- 上传卡片字段包括：简历名称、版本、适用岗位方向、语言类型、标签和上传文件。
- 简历名称支持由上传文件名自动填入；版本默认 `v1.0`；语言类型可选中文、英文、中英文，默认中文。
- 上传文件只支持 PDF/DOC/DOCX，文件大小不能超过 10MB。
- 查看简历卡片列表，卡片仅粗略展示文件类型、名称、版本和标签。
- 在当前页预览简历：PDF 直接嵌入预览，DOC/DOCX 提供占位预览和下载入口。
- 下载简历文件。
- 删除简历。
- 编辑简历元信息，并支持重新选择文件替换原文件。
- 查看或维护岗位关联关系。

说明：

- 每个上传文件就是一条独立简历记录。
- 第一版不做简历正文在线编辑。
- 第一版不做简历版本树。

### 8.7 `/tasks`

日程待办页。

核心视图：

- 日历视图：默认展示当月日历，支持左右切换月份。
- 列表视图：左侧展示今日日程，右侧展示从当天开始的未来 7 天日程；即使某天没有事项，也需要展示该日期和空状态。
- 范围切换：支持切换全部事项和今天事项。

待办类型：

```text
投递截止
笔试
面试
Follow-up
简历修改
自定义事项
```

核心功能：

- 点击新建按钮弹出卡片新建待办。
- 点击日历日期格弹出卡片新建当天待办。
- 点击待办标题或日历中的事项弹出卡片编辑待办。
- 新建或编辑保存成功后自动关闭弹出卡片。
- 使用勾选图标完成或重开待办。
- 删除待办。
- 关联岗位。

展示规则：

- 待办时间精确到日，不精确到小时和分钟。
- 日历视图只展示到当月最后一天所在周，不固定补满 6 行。
- 当天日期在日历中需要有明显背景和日期数字高亮。
- 列表中的待办需要展示待办类型标签，例如自定义事项、面试、Follow-up 等。

### 8.8 `/interviews`

面试复盘入口页。

第一版只做入口占位，不实现完整面试复盘功能。

建议展示内容：

- 即将支持面试记录。
- 即将支持问题复盘。
- 即将支持 AI 建议。

岗位详情页中也需要保留面试复盘入口。

## 9. 数据模型

以下为逻辑模型，实际字段命名可根据 Prisma schema 调整。

### 9.1 User

用户表。

字段：

- `id`
- `username`
- `passwordHash`
- `createdAt`
- `updatedAt`

### 9.2 JobApplication

岗位或投递记录表。

字段：

- `id`
- `companyName`
- `jobTitle`
- `status`
- `endReason`
- `priority`
- `city`
- `salaryRange`
- `jobUrl`
- `jdContent`
- `source`
- `notes`
- `resumeId`
- `createdAt`
- `updatedAt`
- `lastStatusChangedAt`

状态枚举：

```text
INTERESTED
APPLIED
WRITTEN_TEST
FIRST_INTERVIEW
SECOND_INTERVIEW
HR_INTERVIEW
OFFER
ENDED
```

结束原因枚举：

```text
REJECTED
NO_RESPONSE
GAVE_UP
JOINED
OTHER
```

优先级枚举：

```text
HIGH
MEDIUM
LOW
```

关系：

- 一个岗位可以关联一个简历。
- 一个岗位可以关联多个待办。
- 一个岗位可以关联多条活动记录。

### 9.3 Resume

简历表。

字段：

- `id`
- `name`
- `version`
- `targetRole`
- `language`
- `fileName`
- `filePath`
- `fileSize`
- `tags`
- `notes`
- `createdAt`
- `updatedAt`

说明：

- 每个 PDF/DOC/DOCX 文件是一条简历记录。
- `version` 用于记录当前简历版本，默认 `v1.0`。
- `targetRole` 用于记录适用岗位方向，例如前端、后端、全栈、算法等。
- `language` 用于记录语言类型，可选中文、英文、中英文。
- `tags` 可用于记录方向，例如前端、后端、全栈、算法、英文版等。
- 第一版可以将 `tags` 存为 JSON 字符串或单独建标签表，优先选择实现简单的方案。

### 9.4 Task

待办或日程表。

字段：

- `id`
- `title`
- `description`
- `type`
- `dueAt`
- `completedAt`
- `jobApplicationId`
- `createdAt`
- `updatedAt`

说明：

- `dueAt` 第一版按日期使用，页面不要求填写小时和分钟。
- 待办可以关联一个岗位，也可以作为自定义事项独立存在。

类型枚举：

```text
DEADLINE
WRITTEN_TEST
INTERVIEW
FOLLOW_UP
RESUME_UPDATE
CUSTOM
```

关系：

- 一个待办可以关联一个岗位。
- 待办也可以不关联岗位，作为普通自定义事项存在。

### 9.5 ApplicationActivity

岗位活动记录表。

用途：

- 记录状态变化。
- 记录重要备注。
- 记录关联简历变化。
- 用于岗位详情页时间线。

字段：

- `id`
- `jobApplicationId`
- `type`
- `fromStatus`
- `toStatus`
- `content`
- `createdAt`

活动类型可包括：

```text
STATUS_CHANGED
NOTE_ADDED
RESUME_LINKED
TASK_CREATED
CUSTOM
```

### 9.6 InterviewReview

面试复盘预留表。

第一版可以先不实现完整功能，但可预留模型。

字段：

- `id`
- `jobApplicationId`
- `round`
- `scheduledAt`
- `notes`
- `createdAt`
- `updatedAt`

说明：

- MVP 阶段只需要入口。
- 后续可扩展为结构化面试记录、问题列表、自评、AI 建议等。

## 10. Dashboard 指标定义

### 10.1 基础指标

- 总岗位数：所有岗位数量。
- 活跃岗位数：状态不是已结束的岗位数量。
- Offer 数：状态为 Offer 的岗位数量。
- 已结束数量：状态为已结束的岗位数量。
- 高优先级岗位数：优先级为高且未结束的岗位数量。

### 10.2 待办指标

- 今日待办：`dueAt` 在今天且未完成的待办。
- 逾期待办：`dueAt` 早于今天且未完成的待办。
- 未来 7 天日程：`dueAt` 从今天起 7 天内的待办。

### 10.3 转化率

投递到面试转化率初版定义：

```text
进入 一面 / 二面 / HR面 / Offer 的岗位数 / 已投递及之后的岗位数
```

分母状态包括：

```text
已投递
笔试
一面
二面
HR面
Offer
已结束
```

分子状态包括：

```text
一面
二面
HR面
Offer
```

说明：

- 该指标为第一版简化定义。
- 后续可以结合活动时间线计算历史上是否进入过面试，而不是只看当前状态。

## 11. 项目架构建议

### 11.1 总体架构

第一版采用 Next.js App Router 单体架构。页面、服务端逻辑、业务服务、数据访问和文件处理都放在同一个项目中，但代码内部保持清晰分层。

推荐架构：

```text
Next.js App Router 单体应用
  ├─ UI 页面层
  ├─ Server Actions / Route Handlers
  ├─ 业务服务层
  ├─ Prisma 数据访问层
  ├─ SQLite 数据库
  └─ 本地简历文件存储
```

设计原则：

- 不拆前后端。
- 不引入微服务。
- 页面组件不直接承载复杂业务规则。
- Prisma 查询不要散落在页面组件中。
- 文件上传、鉴权、数据库访问、日期处理等通用能力集中封装。
- 重要业务动作应写入活动记录，便于岗位详情时间线和后续分析。

### 11.2 推荐目录结构

```text
offer-management/
  docs/
    MVP_PRD.md

  prisma/
    schema.prisma
    migrations/

  uploads/
    resumes/

  src/
    app/
      setup/
        page.tsx
      login/
        page.tsx
      dashboard/
        page.tsx
      applications/
        page.tsx
        new/
          page.tsx
        [id]/
          page.tsx
      resumes/
        page.tsx
      tasks/
        page.tsx
      interviews/
        page.tsx
      api/
        auth/
          login/
            route.ts
          logout/
            route.ts
        resumes/
          upload/
            route.ts
          [id]/
            file/
              route.ts
        applications/
          [id]/
            status/
              route.ts
        ai/
          resume-advice/
            route.ts

    components/
      layout/
      ui/
      application/
      resume/
      task/
      dashboard/

    features/
      applications/
        actions.ts
        service.ts
        queries.ts
        types.ts
        constants.ts
        validators.ts

      resumes/
        actions.ts
        service.ts
        queries.ts
        validators.ts

      tasks/
        actions.ts
        service.ts
        queries.ts
        validators.ts

      auth/
        actions.ts
        service.ts
        session.ts
        password.ts
        validators.ts

      dashboard/
        queries.ts
        metrics.ts

    lib/
      prisma.ts
      auth.ts
      cookies.ts
      upload.ts
      date.ts
      errors.ts

    styles/
      globals.css
```

### 11.3 分层说明

#### 页面层

位置：

```text
src/app
```

职责：

- 页面布局。
- 页面跳转。
- 表单展示。
- 列表、卡片、图表等 UI 组合。
- 调用 Server Actions 或 API。

页面层不应直接写复杂业务规则。

#### 业务组件层

位置：

```text
src/components
```

职责：

- `components/ui`：基础 UI 组件。
- `components/layout`：导航、侧边栏、页面容器。
- `components/application`：岗位卡片、看板列、状态选择器等。
- `components/resume`：简历卡片、上传卡片、当前页预览弹层等。
- `components/task`：待办列表、待办项等。
- `components/dashboard`：指标卡片、图表组件等。

#### Feature 层

位置：

```text
src/features
```

职责：

- 按业务模块组织代码。
- 放置 Server Actions。
- 放置业务服务。
- 放置查询封装。
- 放置校验逻辑。
- 放置枚举展示文案和模块类型。

推荐文件职责：

- `actions.ts`：页面调用的 Server Actions。
- `service.ts`：业务规则和业务动作。
- `queries.ts`：数据库查询封装。
- `validators.ts`：Zod 表单和请求校验。
- `types.ts`：模块内类型。
- `constants.ts`：状态枚举、优先级文案、展示顺序等。

#### 通用基础层

位置：

```text
src/lib
```

职责：

- Prisma client。
- JWT 和登录态处理。
- Cookie 工具。
- 文件上传工具。
- 日期工具。
- 错误处理。

### 11.4 API 接口放置规则

Next.js App Router 的 API 接口统一放在：

```text
src/app/api/**/route.ts
```

当前第一版仅保留确实需要文件流响应的接口：

```text
src/app/api/resumes/[id]/file/route.ts
```

对应接口：

```text
GET  /api/resumes/:id/file
```

Route Handler 职责：

- 解析请求参数。
- 校验登录态。
- 调用对应 feature 的 service 或查询。
- 返回文件流或错误响应。

Route Handler 不应承载大量业务逻辑。

普通表单提交、登录登出、新增岗位、更新岗位、上传简历、待办操作优先使用 Server Actions，不额外保留未被页面调用的 JSON API。

### 11.5 Server Actions 与 Route Handlers 分工

第一版建议 Server Actions 为主，Route Handlers 为辅。

适合使用 Server Actions 的操作：

- 新增岗位。
- 编辑岗位。
- 删除岗位。
- 更新岗位状态。
- 新增待办。
- 编辑待办。
- 完成待办。
- 重开待办。
- 删除待办。
- 登录和登出。
- 简历文件上传。
- 修改简历名称、版本、适用岗位方向、语言类型、标签和备注。
- 替换已上传的简历文件。

适合使用 Route Handlers 的操作：

- 简历文件预览或下载。
- 后续真正接入 AI 服务时的流式或外部请求。
- 未来给外部工具或浏览器插件调用的接口。

原则：

```text
页面内部表单提交和状态更新，优先 Server Actions。
文件流、AI 外部服务、外部调用，使用 /api Route Handlers。
```

### 11.6 文件访问策略

简历文件存储在本地目录：

```text
uploads/resumes
```

建议不要直接暴露静态文件目录，而是通过受保护的 Route Handler 返回文件：

```text
GET /api/resumes/:id/file
```

这样可以保持统一的权限模型：

- 未登录用户不能访问简历文件。
- 文件真实路径不直接暴露给前端。
- 后续迁移到对象存储时改动范围较小。
- 文件响应支持 `inline` 预览和 `attachment` 下载两种模式。

### 11.7 前端布局建议

第一版采用工作台式布局：

```text
左侧导航 + 顶部页面标题 + 主内容区
```

主导航：

- Dashboard
- 投递看板
- 简历仓
- 日程待办
- 面试复盘

设计风格建议：

- 偏工具型界面。
- 信息密度适中。
- 强调清晰、稳定、可扫描。
- 避免营销落地页风格。
- 看板、详情页、待办页应优先服务高频操作。

### 11.8 关键工程约束

- 状态枚举和中文展示文案集中管理。
- 岗位状态顺序集中定义，避免多个页面重复硬编码。
- 状态变化必须更新 `lastStatusChangedAt`。
- 状态变化应写入 `ApplicationActivity`。
- Dashboard 指标应集中在 `features/dashboard/metrics.ts` 中计算。
- 删除简历前需要处理关联岗位，避免孤立引用。
- 上传和替换简历文件必须校验文件类型为 PDF/DOC/DOCX。
- 上传和替换简历文件必须校验文件大小，不能超过 10MB。
- 登录态检查应统一封装，避免每个页面重复实现。

## 12. 开发里程碑

### 阶段 1：项目初始化

- 创建 Next.js 16 项目。
- 接入 React 19。
- 接入 Tailwind CSS 4。
- 接入 Prisma。
- 配置 SQLite。
- 建立基础布局和导航。
- 创建页面骨架。

### 阶段 2：认证系统

- 实现首次初始化账号。
- 实现登录。
- 实现登出。
- 使用 bcrypt 保存密码哈希。
- 使用 JWT cookie 管理登录态。
- 实现路由保护。

### 阶段 3：岗位管理

- 新增岗位。
- 编辑岗位。
- 删除岗位。
- 查看岗位详情。
- 设置优先级。
- 更新状态。
- 设置已结束原因。
- 记录状态变化活动。

### 阶段 4：投递看板

- 按固定状态分列展示岗位。
- 展示岗位卡片。
- 支持状态更新。
- 支持基础搜索。
- 支持按优先级筛选。
- 支持进入岗位详情。

### 阶段 5：简历仓

- 上传 PDF/DOC/DOCX 简历文件。
- 保存文件元信息。
- 上传入口使用当前页弹出卡片，包含名称、版本、适用岗位方向、语言类型、标签和文件选择。
- 展示简历卡片列表，卡片仅展示文件类型、名称、版本和标签。
- 支持当前页预览，PDF 直接嵌入预览，DOC/DOCX 提供占位预览和下载入口。
- 支持下载简历文件。
- 支持编辑简历名称、版本、适用岗位方向、语言类型、标签和备注。
- 支持重新选择文件并替换原简历文件。
- 支持删除简历。
- 支持岗位关联简历。

### 阶段 6：日程待办

- 日历视图展示当月事项，并支持左右切换月份。
- 日历日期格支持点击新建当天事项。
- 日历中的事项支持点击编辑。
- 列表视图分为今日日程和未来 7 天日程两栏。
- 未来 7 天日程按日期展示，空日期也展示空状态。
- 新增待办。
- 编辑待办。
- 完成或重开待办。
- 删除待办。
- 关联岗位。
- 展示今日待办。
- 展示逾期待办。
- 展示未来 7 天日程。

### 阶段 7：Dashboard

- 实现基础指标卡片。
- 实现状态分布图。
- 实现待办提醒。
- 实现最近更新岗位。
- 实现投递到面试转化率。

### 阶段 8：面试复盘入口与收尾

- 添加面试复盘入口页。
- 在岗位详情页添加复盘入口。
- 统一空状态、加载态和错误态。
- 补充本地部署说明。
- 做基础功能验收。

## 13. MVP 验收标准

MVP 完成时应满足：

1. 用户可以初始化本地账号。
2. 用户可以登录和登出系统。
3. 用户可以新增岗位。
4. 用户可以在看板中看到岗位。
5. 用户可以更新岗位状态。
6. 用户可以将岗位设置为已结束并记录原因。
7. 用户可以为岗位设置高、中、低优先级。
8. 用户可以上传 PDF/DOC/DOCX 简历，且文件大小不能超过 10MB。
9. 用户可以在当前页面预览简历，其中 PDF 可直接嵌入预览，DOC/DOCX 可通过占位预览进入下载。
10. 用户可以编辑简历元信息，并可重新选择文件替换原简历文件。
11. 用户可以将简历关联到岗位。
12. 用户可以通过新建按钮或日历日期格创建待办。
13. 用户可以点击待办进入编辑卡片并保存修改。
14. 用户可以完成或重开待办。
15. 用户可以查看日历视图、今日日程、逾期待办和未来 7 天日程。
16. Dashboard 可以反映岗位和待办的当前状态。
17. 面试复盘入口存在，但不要求完整功能。

## 14. 后续增强方向

### 14.1 AI 能力

- 基于 JD 和简历生成匹配度分析。
- 根据岗位 JD 给出简历优化建议。
- 根据简历和岗位生成面试准备建议。
- 生成模拟面试问题。
- 对面试复盘内容生成总结和改进建议。

### 14.2 数据分析

- 渠道转化率分析。
- 岗位方向转化率分析。
- 不同简历带来的面试率对比。
- 平均流程时长分析。
- 长期无回应岗位提醒。

### 14.3 工作流增强

- 浏览器插件采集岗位信息。
- JD 链接自动解析。
- 日历同步。
- 系统通知。
- 数据导入导出。
- 备份与恢复。


