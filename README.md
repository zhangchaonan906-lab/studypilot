# StudyPilot

StudyPilot 是一个面向大学同学公开测试的 AI 学习计划生成器。用户登录后可以输入学习目标、当前水平、截止日期、每天可学习时间和学习偏好，由服务端 AI 生成每日学习安排、任务、资料建议和复习方法。后续可以每天打卡、写复盘、记录错题，并生成每周学习总结。

## 功能列表

- Supabase 邮箱注册、登录、登出
- 受保护页面访问控制（proxy 层鉴权），未登录用户直接跳转 `/login`
- AI 生成学习计划，支持 DeepSeek / OpenAI provider 切换
- 学习计划详情页查看每日任务、复习方法和资料建议
- 任务编辑、新增、删除（计划详情页内联操作）
- YouTube / B站 学习资源搜索链接
- 每日任务查看、完成打卡和取消完成（乐观更新）
- 每日复盘新增与编辑
- 错题复习记录，支持关联当天任务
- 删除学习计划（带确认面板，支持从详情页或 Dashboard 删除）
- Dashboard 展示当前计划完成率、今日进度、距离截止天数、错题数量和最近复盘
- 进行中计划卡片展示真实任务完成率
- AI 生成计划接口限流（每用户每日 5 次，每分钟 2 次）
- 每周 AI 学习总结
- 页面错误边界（error.tsx）和 404 页面（not-found.tsx）
- 全局安全错误提示，不暴露服务端原始错误或 API Key
- Supabase RLS 隔离用户数据

## 技术栈

- Next.js 16 App Router (Turbopack)
- TypeScript (strict)
- Tailwind CSS
- Supabase Auth (SSR)
- Supabase Postgres (RLS)
- DeepSeek / OpenAI API (服务端调用)
- Zod
- Vitest

## 本地运行

```bash
npm install
cp .env.example .env.local
npm run dev
```

打开 `http://localhost:3000`。

本地发布前检查：

```bash
npm run lint
npm run test
npm run build
```

## 环境变量

不要提交 `.env.local`。当前 `.gitignore` 已忽略 `.env*`，只保留 `.env.example`。

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=

AI_PROVIDER=deepseek

OPENAI_API_KEY=
OPENAI_MODEL=gpt-4o-mini

DEEPSEEK_API_KEY=
DEEPSEEK_MODEL=deepseek-v4-flash
DEEPSEEK_BASE_URL=https://api.deepseek.com
```

说明：

- `NEXT_PUBLIC_SUPABASE_URL`：Supabase Project URL，可以暴露给前端
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`：Supabase anon public key，可以暴露给前端，安全性依赖 RLS
- `AI_PROVIDER`：填写 `deepseek` 或 `openai`
- `DEEPSEEK_API_KEY` / `OPENAI_API_KEY`：只在服务端读取，不要加 `NEXT_PUBLIC_`
- `DEEPSEEK_MODEL` 受白名单校验，支持 `deepseek-v4-flash` / `deepseek-v4-pro` / `deepseek-chat` / `deepseek-reasoner`
- `OPENAI_MODEL` 受白名单校验，支持 `gpt-4o-mini` / `gpt-4o` / `gpt-4-turbo`
- 不需要、也不要配置 Supabase service role key

## Supabase 数据库

数据库 schema 和 RLS migration 位于：

```text
supabase/migrations/001_init_schema.sql
```

上线前需要在 Supabase SQL Editor 执行该 SQL。它会创建：

- `plans`
- `plan_days`
- `tasks`
- `resources`
- `mistake_reviews`
- `daily_reflections`
- `weekly_summaries`
- `ai_usage_logs`

所有业务表都启用了 Row Level Security，策略基于 `auth.uid() = user_id`，确保用户只能访问自己的数据。

## 项目结构

```text
src/
├── app/
│   ├── layout.tsx                  # 根布局
│   ├── page.tsx                    # 首页（营销页）
│   ├── error.tsx                   # 全局错误边界
│   ├── not-found.tsx               # 404 页面
│   ├── login/page.tsx              # 登录页
│   ├── auth/callback/route.ts      # Supabase OAuth 回调
│   ├── api/
│   │   ├── generate-plan/route.ts  # AI 生成计划（含限流）
│   │   └── weekly-summary/route.ts # AI 生成周总结
│   └── (app)/
│       ├── layout.tsx              # 受保护路由组布局（含 AppShell）
│       ├── error.tsx               # 应用组错误边界
│       ├── dashboard/page.tsx      # 仪表盘
│       ├── plans/
│       │   ├── new/page.tsx        # 新建计划
│       │   └── [id]/page.tsx       # 计划详情（含任务 CRUD）
│       ├── today/page.tsx          # 今日任务
│       ├── review/page.tsx         # 错题复习
│       └── weekly/page.tsx         # 每周总结
├── components/
│   ├── AppShell.tsx                # 应用外壳（导航 + 退出）
│   ├── TaskCompletionToggle.tsx    # 任务打卡切换
│   ├── TaskCard.tsx                # 任务卡片（编辑 / 删除）
│   ├── CreateTaskForm.tsx          # 新增任务表单
│   ├── DeletePlanButton.tsx        # 删除计划按钮（含确认面板）
│   ├── PlanCard.tsx                # 计划卡片（含真实完成率）
│   ├── NewPlanForm.tsx             # 新建计划表单（含进度条）
│   ├── DailyReflectionForm.tsx     # 每日复盘表单
│   ├── MistakeReviewForm.tsx       # 错题复习表单
│   ├── ResourceSearchLinks.tsx     # B站 / YouTube 搜索链接
│   ├── WeeklySummaryGenerator.tsx  # 周总结生成器
│   └── ...                         # Badge, Card, EmptyState, ProgressBar 等
├── lib/
│   ├── auth.ts                     # 认证辅助（路径保护、错误映射）
│   ├── study/
│   │   ├── types.ts                # 全部领域类型
│   │   ├── data.ts                 # 数据访问层（所有 Supabase 查询）
│   │   ├── actions.ts              # Server Actions
│   │   ├── task-management.ts      # 任务 CRUD 核心函数
│   │   ├── task-completion.ts      # 任务完成状态切换
│   │   ├── plan-deletion.ts        # 计划删除逻辑
│   │   ├── metrics.ts              # 完成率、周范围计算
│   │   ├── forms.ts                # FormData 解析
│   │   └── resource-links.ts       # 搜索 URL 构建
│   ├── ai/
│   │   ├── client.ts               # AI 客户端配置（含模型白名单）
│   │   ├── schemas.ts              # Zod schema 与校验
│   │   ├── generate-plan.ts        # 计划生成（含重试）
│   │   └── generate-weekly-summary.ts
│   └── supabase/
│       ├── config.ts               # 环境变量读取
│       ├── server.ts               # 服务端 Supabase 客户端
│       └── browser.ts              # 浏览器端 Supabase 客户端
├── proxy.ts                        # Proxy 层鉴权
└── middleware.ts                    # 不存在，鉴权由 proxy.ts 处理
```

## 部署

### Vercel

1. 把项目推送到 GitHub。
2. 在 Vercel 新建项目并导入该仓库，Framework Preset 选择 Next.js。
3. 在 Vercel Project Settings → Environment Variables 中添加所需环境变量。
4. 触发 Production 部署。
5. 部署完成后，在 Supabase Auth 设置中把 Vercel 域名加入 Site URL / Redirect URLs。

### EdgeOne Pages（推荐国内访问）

EdgeOne Pages 是腾讯云边缘计算平台，国内访问速度优于 Vercel，且对 Next.js App Router 原生支持。项目零 Vercel 专有依赖，可直接迁移。

1. 登录 [EdgeOne Pages 控制台](https://console.cloud.tencent.com/edgeone/pages)。
2. 创建项目 → 导入 Git 仓库 → 授权 GitHub 并选择 `studypilot`。
3. Framework 选择 Next.js（通常自动识别），Build Command 为 `npm run build`。
4. 在环境变量设置中填入下方全部变量。
5. 点击部署，等待完成。
6. 回到 Supabase Dashboard → Authentication → URL Configuration，把 EdgeOne 域名加入 Site URL 和 Redirect URLs（同时保留 Vercel 域名，如需并存）。

### 部署环境变量清单

所有平台均需配置以下变量：

```text
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
AI_PROVIDER
DEEPSEEK_API_KEY
DEEPSEEK_MODEL
DEEPSEEK_BASE_URL
OPENAI_API_KEY
OPENAI_MODEL
```

`AI_PROVIDER` 和对应的 API Key 按实际使用的 provider 填写，其余可留空。修改环境变量后需重新部署生效。

### Supabase Auth 回调地址

部署后需要在 Supabase Dashboard → Authentication → URL Configuration 添加：

- Site URL：部署域名
- Redirect URLs：`https://<your-domain>/auth/callback` 和 `https://<your-domain>/**`

## 安全说明

- **路由鉴权**：`src/proxy.ts` 在请求到达页面之前校验 Supabase session cookie，未登录用户访问受保护路径直接重定向 `/login`。数据层 `getAuthenticatedContext()` 作为纵深防御保留。
- **AI 限流**：`/api/generate-plan` 基于 `ai_usage_logs` 表按 `user_id` 限流，每用户每日最多 5 次，每分钟最多 2 次。删除计划不重置计数。
- **错误安全**：所有 API Route 和 Server Action 的错误返回经过审计，`console.error` 记录原始错误供运维排查，前端只收到固定中文安全提示。不暴露 API Key、SDK 原始错误、堆栈信息或环境变量值。
- **模型白名单**：DeepSeek 和 OpenAI 模型名受白名单校验，非法配置返回 `"AI 模型配置无效，请检查服务端配置。"`，不暴露实际 env 值。
- AI API Key 只在服务端 API Route 中使用。
- 前端只调用站内接口，例如 `/api/generate-plan` 和 `/api/weekly-summary`。
- 不使用 Supabase service role key。
- `.env.local` 不应提交到代码仓库。
- 数据访问层和 API Route 都基于当前登录用户查询，与 RLS 双重隔离。
- AI 返回内容经过 Zod 校验和重试，格式不正确时返回中文错误提示。
