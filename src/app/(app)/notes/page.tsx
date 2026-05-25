import Link from "next/link";
import { Badge } from "@/components/Badge";
import { EmptyState } from "@/components/EmptyState";
import { PageHeader } from "@/components/PageHeader";
import { SuccessMessage } from "@/components/StatusMessage";
import { getNotes, getNoteSummary } from "@/lib/study/notes";
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

export default async function NotesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const query = getParamValue(params.q)?.trim() ?? "";
  const notes = await getNotes(query);
  const hasQuery = query.length > 0;

  return (
    <>
      <PageHeader
        eyebrow="学习工具"
        title="学习笔记"
        description="记录课堂重点、复习想法和学习资料，图片与文件都会保存到你的私有空间。"
      />

      {params.deleted ? (
        <div className="mb-5">
          <SuccessMessage>笔记已删除。</SuccessMessage>
        </div>
      ) : null}

      <section className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <form action="/notes" className="flex min-w-0 flex-1 flex-col gap-2 sm:flex-row">
          <input
            name="q"
            defaultValue={query}
            placeholder="搜索标题或正文"
            className="sp-input"
          />
          <button type="submit" className="btn-secondary w-full sm:w-auto">
            搜索
          </button>
        </form>
        <Link href="/notes/new" className="btn-primary w-full sm:w-auto">
          新建笔记
        </Link>
      </section>

      {notes.length === 0 ? (
        <EmptyState
          title={hasQuery ? "没有找到匹配的笔记" : "还没有笔记，记录第一条学习想法吧。"}
          description={
            hasQuery
              ? "换一个关键词试试，或者新建一条学习笔记。"
              : "可以记录文字、图片、PDF、Word、PPT、Excel 或 txt 学习资料。"
          }
          actionHref="/notes/new"
          actionLabel="新建笔记"
        />
      ) : (
        <section className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
          {notes.map((note) => (
            <article
              key={note.id}
              data-note-card
              className="sp-card group relative flex min-h-64 flex-col overflow-hidden transition hover:border-indigo-200 hover:shadow-md"
            >
              <Link
                href={`/notes/${note.id}`}
                aria-label={`打开笔记：${note.title}`}
                className="absolute inset-0 z-0"
              />

              <div className="pointer-events-none relative z-10 flex flex-1 flex-col">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 pr-24">
                    <h2 className="break-words text-xl font-bold leading-7 text-ink">
                      {note.title}
                    </h2>
                    <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-600">
                      {getNoteSummary(note.content, 180)}
                    </p>
                  </div>
                </div>

                <div className="mt-5 flex flex-wrap items-center gap-2">
                  {note.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-primary"
                    >
                      #{tag}
                    </span>
                  ))}
                  {note.plan ? (
                    <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-primary">
                      {note.plan.title}
                    </span>
                  ) : null}
                  {note.course_name ? (
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                      {note.course_name}
                    </span>
                  ) : null}
                </div>

                <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-5">
                  <Badge tone={note.attachment_count > 0 ? "blue" : "slate"}>
                    {note.attachment_count} 个附件
                  </Badge>
                  <p className="text-xs font-semibold text-slate-400">
                    更新于 {formatDateTime(note.updated_at)}
                  </p>
                </div>
              </div>

              <div className="absolute right-4 top-4 z-20 flex items-center gap-2">
                <Link
                  href={`/notes/${note.id}/edit`}
                  className="rounded-full bg-white/95 px-3 py-1.5 text-xs font-semibold text-primary shadow-sm ring-1 ring-indigo-100 transition hover:bg-indigo-50"
                >
                  编辑
                </Link>
                <form action={deleteNoteAction.bind(null, note.id)}>
                  <button
                    type="submit"
                    className="rounded-full bg-white/95 px-3 py-1.5 text-xs font-semibold text-red-600 shadow-sm ring-1 ring-red-100 transition hover:bg-red-50"
                  >
                    删除
                  </button>
                </form>
              </div>
            </article>
          ))}
        </section>
      )}
    </>
  );
}
