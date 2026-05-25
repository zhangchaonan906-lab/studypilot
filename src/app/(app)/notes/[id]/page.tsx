import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge } from "@/components/Badge";
import { PageHeader } from "@/components/PageHeader";
import { ErrorMessage, SuccessMessage } from "@/components/StatusMessage";
import { formatFileSize, getNoteDetail } from "@/lib/study/notes";
import { deleteNoteAction } from "@/lib/study/notes-actions";

export const dynamic = "force-dynamic";

function getParamValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function formatDateTime(value: string | null) {
  if (!value) {
    return "未知时间";
  }

  return new Intl.DateTimeFormat("zh-CN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export default async function NoteDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const [{ id }, query] = await Promise.all([params, searchParams]);
  const note = await getNoteDetail(id);

  if (!note) {
    notFound();
  }

  const error = getParamValue(query.error);
  const images = note.attachments.filter((attachment) => attachment.attachment_type === "image");
  const files = note.attachments.filter((attachment) => attachment.attachment_type === "file");
  const deleteAction = deleteNoteAction.bind(null, note.id);

  return (
    <>
      <PageHeader
        eyebrow="学习笔记"
        title={note.title}
        description="阅读模式会先展示完整内容，需要修改时再进入编辑页。"
      />

      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Link href="/notes" className="btn-secondary w-full sm:w-auto">
          返回笔记列表
        </Link>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Link href={`/notes/${note.id}/edit`} className="btn-primary w-full sm:w-auto">
            编辑笔记
          </Link>
          <form action={deleteAction}>
            <button
              type="submit"
              className="w-full rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700 sm:w-auto"
            >
              删除笔记
            </button>
          </form>
        </div>
      </div>

      <div className="mx-auto max-w-5xl space-y-5">
        {error ? <ErrorMessage>{error}</ErrorMessage> : null}
        {query.saved ? <SuccessMessage>笔记已保存。</SuccessMessage> : null}
        {query.uploaded ? <SuccessMessage>附件已上传。</SuccessMessage> : null}
        {query.attachmentDeleted ? <SuccessMessage>附件已删除。</SuccessMessage> : null}

        <article className="sp-card overflow-hidden">
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone="blue">阅读模式</Badge>
            <Badge tone={note.plan ? "violet" : "slate"}>
              {note.plan?.title ?? "未关联计划"}
            </Badge>
            <Badge tone={note.course_name ? "emerald" : "slate"}>
              {note.course_name ?? "未填写课程"}
            </Badge>
          </div>

          <p className="mt-5 text-sm font-semibold text-slate-400">
            更新于 {formatDateTime(note.updated_at)}
          </p>

          {note.tags.length > 0 ? (
            <div className="mt-5 flex flex-wrap gap-2">
              {note.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-primary"
                >
                  #{tag}
                </span>
              ))}
            </div>
          ) : null}

          <div className="mt-8 whitespace-pre-wrap break-words text-base leading-8 text-slate-700">
            {note.content || "暂无正文。"}
          </div>
        </article>

        <section className="sp-card">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="sp-section-title">图片附件</h2>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                点击图片可在新窗口打开临时预览链接。
              </p>
            </div>
            <Badge tone={images.length > 0 ? "blue" : "slate"}>{images.length} 张图片</Badge>
          </div>

          {images.length === 0 ? (
            <p className="mt-4 text-sm text-slate-500">暂无图片附件。</p>
          ) : (
            <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {images.map((attachment) => (
                <a
                  key={attachment.id}
                  href={attachment.signed_url}
                  target="_blank"
                  rel="noreferrer"
                  className="group overflow-hidden rounded-2xl border border-slate-100 bg-slate-50"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element -- Supabase signed URLs are private and short-lived. */}
                  <img
                    src={attachment.signed_url}
                    alt={attachment.file_name}
                    className="h-44 w-full object-cover transition group-hover:scale-[1.02]"
                  />
                  <p className="break-words px-3 py-2 text-sm font-semibold text-ink">
                    {attachment.file_name}
                  </p>
                </a>
              ))}
            </div>
          )}
        </section>

        <section className="sp-card">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="sp-section-title">文件附件</h2>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                普通学习资料使用签名链接下载，不会公开暴露文件地址。
              </p>
            </div>
            <Badge tone={files.length > 0 ? "blue" : "slate"}>{files.length} 个文件</Badge>
          </div>

          {files.length === 0 ? (
            <p className="mt-4 text-sm text-slate-500">暂无文件附件。</p>
          ) : (
            <div className="mt-5 grid gap-3 md:grid-cols-2">
              {files.map((attachment) => (
                <article
                  key={attachment.id}
                  className="flex min-w-0 flex-col gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <p className="break-words text-sm font-bold text-ink">{attachment.file_name}</p>
                    <p className="mt-1 text-xs text-slate-500">
                      {attachment.mime_type ?? attachment.file_type} ·{" "}
                      {formatFileSize(attachment.file_size)}
                    </p>
                  </div>
                  <a
                    href={attachment.signed_url}
                    className="btn-secondary w-full text-center sm:w-auto"
                  >
                    下载文件
                  </a>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </>
  );
}
