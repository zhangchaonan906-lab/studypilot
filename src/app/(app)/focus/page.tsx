import { FocusTimer } from "@/components/FocusTimer";
import { PageHeader } from "@/components/PageHeader";

export const dynamic = "force-dynamic";

export default function FocusPage() {
  return (
    <>
      <PageHeader
        eyebrow="学习工具"
        title="深度学习计时"
        description="专注计时，番茄钟式学习管理。每次专注结束后自动记录，积少成多。"
      />
      <FocusTimer />
    </>
  );
}
