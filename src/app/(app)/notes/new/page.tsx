import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";
import { ErrorMessage } from "@/components/StatusMessage";
import { SubmitButton } from "@/components/SubmitButton";
import { createNoteAction } from "@/lib/study/notes-actions";
import { listActivePlans } from "@/lib/study/data";

export const dynamic = "force-dynamic";

const acceptTypes = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
  "text/plain",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
].join(",");

function getParamValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function NewNotePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const [plans, params] = await Promise.all([listActivePlans(), searchParams]);
  const error = getParamValue(params.error);

  return (
    <>
      <PageHeader
        eyebrow="学习笔记"
        title="新建笔记"
        description="先用文字记录重点，也可以顺手上传图片、PDF 或课程资料文件。"
      />

      <div className="mx-auto max-w-4xl">
        <form action={createNoteAction} className="sp-card space-y-5">
          {error ? <ErrorMessage>{error}</ErrorMessage> : null}

          <label className="block">
            <span className="sp-label">标题</span>
            <input
              name="title"
              maxLength={100}
              required
              placeholder="例如：高数第一章复习笔记"
              className="sp-input"
            />
          </label>

          <label className="block">
            <span className="sp-label">正文</span>
            <textarea
              name="content"
              rows={10}
              placeholder="记录知识点、例题思路、课堂提醒或复习想法。"
              className="sp-input min-h-64 resize-y"
            />
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="sp-label">关联学习计划</span>
              <select name="plan_id" className="sp-input" defaultValue="">
                <option value="">不关联计划</option>
                {plans.map((plan) => (
                  <option key={plan.id} value={plan.id}>
                    {plan.title}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="sp-label">课程名</span>
              <input name="course_name" placeholder="例如：高等数学" className="sp-input" />
            </label>
          </div>

          <label className="block">
            <span className="sp-label">标签</span>
            <input name="tags" placeholder="用逗号或空格分隔，例如：期末 公式 错题" className="sp-input" />
          </label>

          <label className="block rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4">
            <span className="sp-label">图片和文件上传</span>
            <input
              name="attachments"
              type="file"
              multiple
              accept={acceptTypes}
              className="mt-2 block w-full text-sm text-slate-600 file:mr-3 file:rounded-xl file:border-0 file:bg-primary file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white"
            />
            <p className="mt-2 text-xs leading-5 text-slate-500">
              每条笔记最多 5 个附件，单个文件不能超过 5MB；你的附件空间最多 50MB。
            </p>
          </label>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <SubmitButton pendingLabel="保存中..." className="btn-primary w-full sm:w-auto">
              保存笔记
            </SubmitButton>
            <Link href="/notes" className="btn-secondary w-full sm:w-auto">
              返回列表
            </Link>
          </div>
        </form>
      </div>
    </>
  );
}
