import { NewPlanForm } from "@/components/NewPlanForm";
import { PageHeader } from "@/components/PageHeader";

export const dynamic = "force-dynamic";

export default function NewPlanPage() {
  return (
    <>
      <PageHeader
        eyebrow="新建计划"
        title="告诉 StudyPilot 你的学习目标"
        description="这一步只创建基础计划并写入 Supabase，不调用 AI。"
      />
      <NewPlanForm />
    </>
  );
}
