import { FocusTimer } from "@/components/FocusTimer";
import { PageHeader } from "@/components/PageHeader";

export const dynamic = "force-dynamic";

function parseMinutesParam(value: string | undefined): number | undefined {
  if (!value) return undefined;
  const n = parseInt(value, 10);
  if (Number.isInteger(n) && n >= 1 && n <= 600) return n;
  return undefined;
}

export default async function FocusPage({
  searchParams,
}: {
  searchParams: Promise<{ goal?: string; minutes?: string }>;
}) {
  const params = await searchParams;
  const initialGoal = params.goal ? decodeURIComponent(params.goal) : undefined;
  const initialMinutes = parseMinutesParam(params.minutes);

  return (
    <>
      <PageHeader
        eyebrow="学习工具"
        title="深度学习计时"
        description="专注计时，番茄钟式学习管理。每次专注结束后自动记录，积少成多。"
      />
      <FocusTimer initialGoal={initialGoal} initialMinutes={initialMinutes} />
    </>
  );
}
