import { NewPlanForm } from "@/components/NewPlanForm";
import { PageHeader } from "@/components/PageHeader";

export const dynamic = "force-dynamic";

export default function NewPlanPage() {
  return (
    <>
      <PageHeader
        eyebrow="新建计划"
        title="告诉 StudyPilot 你的学习目标"
        description="填写目标、起始日期和计划天数，AI 会在服务端生成每日安排、任务和资料建议。"
      />
      <div className="mx-auto max-w-5xl">
        <NewPlanForm />
      </div>
    </>
  );
}
