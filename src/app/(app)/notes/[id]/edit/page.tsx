import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge } from "@/components/Badge";
import { PageHeader } from "@/components/PageHeader";
import { ErrorMessage, SuccessMessage } from "@/components/StatusMessage";
import { SubmitButton } from "@/components/SubmitButton";
import { listActivePlans } from "@/lib/study/data";
import { formatFileSize, getNoteDetail } from "@/lib/study/notes";
import {
  deleteNoteAttachmentAction,
  updateNoteAction,
  uploadNoteAttachmentAction,
} from "@/lib/study/notes-actions";

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

export default async function EditNotePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const [{ id }, query, plans] = await Promise.all([params, searchParams, listActivePlans()]);
  const note = await getNoteDetail(id);

  if (!note) {
    notFound();
  }

  const editPath = `/notes/${note.id}/edit`;
  const error = getParamValue(query.error);
  const images = note.attachments.filter((attachment) => attachment.attachment_type === "image");
  const files = note.attachments.filter((attachment) => attachment.attachment_type === "file");
  const updateAction = updateNoteAction.bind(null, note.id);
  const uploadAction = uploadNoteAttachmentAction.bind(null, note.id);

  return (
    <>
      <PageHeader
        eyebrow="学习笔记"
        title="编辑笔记"
        description="修改标题、正文、标签和附件，保存后会回到阅读详情页。"
      />

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
        <section className="space-y-5">
          {error ? <ErrorMessage>{error}</ErrorMessage> : null}
          {query.uploaded ? <SuccessMessage>附件已上传。</SuccessMessage> : null}
          {query.attachmentDeleted ? <SuccessMessage>附件已删除。</SuccessMessage> : null}

          <form action={updateAction} className="sp-card space-y-5">
            <input type="hidden" name="return_to" value={editPath} />

            <label className="block">
              <span className="sp-label">标题</span>
              <input
                name="title"
                defaultValue={note.title}
                maxLength={100}
                required
                className="sp-input"
              />
            </label>

            <label className="block">
              <span className="sp-label">正文</span>
              <textarea
                name="content"
                defaultValue={note.content ?? ""}
                rows={14}
                className="sp-input min-h-72 resize-y"
              />
            </label>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="sp-label">关联学习计划</span>
                <select name="plan_id" className="sp-input" defaultValue={note.plan_id ?? ""}>
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
                <input name="course_name" defaultValue={note.course_name ?? ""} className="sp-input" />
              </label>
            </div>

            <label className="block">
              <span className="sp-label">标签</span>
              <input name="tags" defaultValue={note.tags.join(" ")} className="sp-input" />
            </label>

            <div className="flex flex-col gap-3 sm:flex-row">
              <SubmitButton pendingLabel="保存中..." className="btn-primary w-full sm:w-auto">
                保存修改
              </SubmitButton>
              <Link href={`/notes/${note.id}`} className="btn-secondary w-full sm:w-auto">
                取消
              </Link>
            </div>
          </form>
        </section>

        <aside className="space-y-5">
          <section className="sp-card">
            <h2 className="sp-section-title">上传附件</h2>
            <form action={uploadAction} className="mt-4 space-y-3">
              <input type="hidden" name="return_to" value={editPath} />
              <input
                name="attachments"
                type="file"
                multiple
                accept={acceptTypes}
                className="block w-full text-sm text-slate-600 file:mr-3 file:rounded-xl file:border-0 file:bg-primary file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white"
              />
              <p className="text-xs leading-5 text-slate-500">
                每条笔记最多 5 个附件，单个文件不能超过 5MB；你的附件空间最多 50MB。
              </p>
              <SubmitButton pendingLabel="上传中..." className="btn-primary w-full">
                上传附件
              </SubmitButton>
            </form>
          </section>

          <section className="sp-card">
            <div className="flex items-center justify-between gap-3">
              <h2 className="sp-section-title">已有附件</h2>
              <Badge tone={note.attachments.length > 0 ? "blue" : "slate"}>
                {note.attachments.length} 个
              </Badge>
            </div>

            {note.attachments.length === 0 ? (
              <p className="mt-4 text-sm text-slate-500">暂无附件。</p>
            ) : (
              <div className="mt-4 space-y-4">
                {images.length > 0 ? (
                  <div className="space-y-3">
                    <p className="text-sm font-bold text-ink">图片附件</p>
                    {images.map((attachment) => (
                      <AttachmentEditor
                        key={attachment.id}
                        noteId={note.id}
                        editPath={editPath}
                        attachmentId={attachment.id}
                        fileName={attachment.file_name}
                        fileSize={attachment.file_size}
                        signedUrl={attachment.signed_url}
                        isImage
                      />
                    ))}
                  </div>
                ) : null}

                {files.length > 0 ? (
                  <div className="space-y-3">
                    <p className="text-sm font-bold text-ink">文件附件</p>
                    {files.map((attachment) => (
                      <AttachmentEditor
                        key={attachment.id}
                        noteId={note.id}
                        editPath={editPath}
                        attachmentId={attachment.id}
                        fileName={attachment.file_name}
                        fileSize={attachment.file_size}
                        signedUrl={attachment.signed_url}
                      />
                    ))}
                  </div>
                ) : null}
              </div>
            )}
          </section>
        </aside>
      </div>
    </>
  );
}

function AttachmentEditor({
  noteId,
  editPath,
  attachmentId,
  fileName,
  fileSize,
  signedUrl,
  isImage = false,
}: {
  noteId: string;
  editPath: string;
  attachmentId: string;
  fileName: string;
  fileSize: number;
  signedUrl: string;
  isImage?: boolean;
}) {
  return (
    <article className="rounded-2xl bg-slate-50 p-3">
      {isImage ? (
        <a href={signedUrl} target="_blank" rel="noreferrer">
          {/* eslint-disable-next-line @next/next/no-img-element -- Supabase signed URLs are private and short-lived. */}
          <img src={signedUrl} alt={fileName} className="max-h-48 w-full rounded-xl object-cover" />
        </a>
      ) : null}
      <p className="mt-3 break-words text-sm font-bold text-ink">{fileName}</p>
      <p className="mt-1 text-xs text-slate-500">{formatFileSize(fileSize)}</p>
      <div className="mt-3 flex flex-col gap-2 sm:flex-row">
        <a href={signedUrl} className="btn-secondary w-full text-center sm:w-auto">
          下载
        </a>
        <form action={deleteNoteAttachmentAction.bind(null, noteId, attachmentId, editPath)}>
          <button
            type="submit"
            className="w-full rounded-xl border border-red-200 bg-white px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50 sm:w-auto"
          >
            删除附件
          </button>
        </form>
      </div>
    </article>
  );
}
