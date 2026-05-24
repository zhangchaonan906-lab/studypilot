import { EmptyState } from "@/components/EmptyState";
import { PageHeader } from "@/components/PageHeader";

export default function ResourcesPage() {
  return (
    <>
      <PageHeader
        eyebrow="学习工具"
        title="资料资源"
        description="这里将集中展示每个计划的 B站、YouTube 和学习资料推荐。"
      />
      <EmptyState
        title="资源中心正在整理中"
        description="当前可以先在计划详情和今日任务中查看 AI 推荐的搜索关键词与平台搜索入口。"
        actionHref="/dashboard"
        actionLabel="回到学习台"
      />
    </>
  );
}
