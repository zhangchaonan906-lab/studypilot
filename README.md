# StudyPilot

StudyPilot 是一个面向大学同学公开测试的 AI 学习计划生成器。用户登录后可以输入学习目标、当前水平、截止日期、每天可学习时间和学习偏好，由服务端 AI 生成每日学习安排、任务、资料建议和复习方法。后续可以每天打卡、写复盘、记录错题，并生成每周学习总结。

## 功能列表

- Supabase 邮箱注册、登录、登出
- 受保护页面访问控制，未登录用户会跳转到 `/login`
- AI 生成学习计划，支持 DeepSeek / OpenAI provider 切换
- 每日任务查看、完成打卡和取消完成
- 每日复盘新增与编辑
- 错题复习记录，支持关联当天任务
- Dashboard 展示完成率、今日进度、截止天数、最近复盘和错题数量
- 每周 AI 学习总结，保存或更新到 `weekly_summaries`
- Supabase RLS 隔离用户数据

## 技术栈

- Next.js App Router
- TypeScript
- Tailwind CSS
- Supabase Auth
- Supabase Postgres
- DeepSeek / OpenAI API
- Zod
- Vercel

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

## Vercel 部署

1. 把项目推送到 GitHub / GitLab / Bitbucket。
2. 在 Vercel 新建项目并导入该仓库。
3. Framework Preset 选择 Next.js，通常会自动识别。
4. 在 Vercel Project Settings -> Environment Variables 中添加下方变量。
5. 触发 Production 部署。后续如果修改环境变量，需要重新部署才会生效。
6. 部署完成后，在 Supabase Auth 设置中把 Vercel 域名加入允许的 Site URL / Redirect URLs。

Vercel 需要配置的环境变量：

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

如果 `AI_PROVIDER=deepseek`，必须填写 DeepSeek 相关变量；如果 `AI_PROVIDER=openai`，必须填写 OpenAI 相关变量。

## 安全说明

- AI API Key 只在服务端 API Route 中使用
- 前端只调用站内接口，例如 `/api/generate-plan` 和 `/api/weekly-summary`
- 不使用 Supabase service role key
- `.env.local` 不应提交到代码仓库
- 数据访问层和 API Route 都基于当前登录用户查询
- AI 返回内容会经过 Zod 校验，格式不正确时返回中文错误提示
