import { EmptyState } from "@/components/EmptyState";
import { PageHeader } from "@/components/PageHeader";

export default function MarketplacePage() {
  return (
    <>
      <PageHeader
        eyebrow="探索"
        title="计划市集"
        description="这里将支持发现、分享和 Fork 优质学习计划。"
      />
      <EmptyState
        title="计划市集暂未开放"
        description="公开分享和 Fork 功能会在后续版本加入，当前先专注把自己的计划执行起来。"
        actionHref="/dashboard"
        actionLabel="回到学习台"
      />
    </>
  );
}
