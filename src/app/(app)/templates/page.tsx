import { EmptyState } from "@/components/EmptyState";
import { PageHeader } from "@/components/PageHeader";

export default function TemplatesPage() {
  return (
    <>
      <PageHeader
        eyebrow="探索"
        title="计划模板"
        description="这里将提供期末冲刺、四六级、考研、编程入门等学习模板。"
      />
      <EmptyState
        title="计划模板即将上线"
        description="后续会提供常见学习目标模板，帮助你更快生成适合自己的计划。"
        actionHref="/plans/new"
        actionLabel="先新建计划"
      />
    </>
  );
}
