import { EmptyState } from "@/components/EmptyState";
import { PageHeader } from "@/components/PageHeader";

export default function FocusPage() {
  return (
    <>
      <PageHeader
        eyebrow="学习工具"
        title="深度学习计时"
        description="专注计时、番茄钟和学习时长记录将在这里提供。"
      />
      <EmptyState
        title="计时功能正在准备中"
        description="后续会支持专注计时、番茄钟和学习时长记录，先继续用今日任务推进学习。"
        actionHref="/today"
        actionLabel="去今日任务"
      />
    </>
  );
}
