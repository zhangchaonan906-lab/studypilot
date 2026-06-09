import type { Metadata } from "next";
import Link from "next/link";
import { IcpFooter } from "@/components/IcpFooter";
import { StudyPilotLogo } from "@/components/StudyPilotLogo";
import {
  getCourseKnowledgeBase,
  searchDataStructureConcepts,
} from "@/lib/a3/knowledge-base";

export const metadata: Metadata = {
  title: "数据结构课程知识库 - StudyPilot",
  description: "中国软件杯 A3 赛题适配的数据结构课程知识库展示页",
};

type KnowledgeBasePageProps = {
  searchParams?: Promise<{
    q?: string | string[];
  }>;
};

export default async function A3KnowledgeBasePage({
  searchParams,
}: KnowledgeBasePageProps) {
  const params = await searchParams;
  const rawQuery = Array.isArray(params?.q) ? params.q[0] : params?.q;
  const query = rawQuery?.trim() ?? "";
  const course = getCourseKnowledgeBase("data-structure");

  if (!course) {
    return null;
  }

  const chapters = course.chapters;
  const conceptCount = chapters.reduce(
    (total, chapter) => total + chapter.coreConcepts.length,
    0,
  );
  const codeExampleCount = chapters.reduce(
    (total, chapter) => total + chapter.codeExamples.length,
    0,
  );
  const searchResults = query ? searchDataStructureConcepts(query) : [];

  return (
    <main className="min-h-screen bg-mist text-ink">
      <header className="border-b border-slate-200/80 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <Link href="/" className="flex min-w-0 items-center gap-3">
            <StudyPilotLogo size={40} showText />
          </Link>
          <Link href="/login" className="btn-secondary px-4 py-2">
            登录
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="min-w-0">
            <p className="badge-soft mb-4">中国软件杯 A3 赛题适配</p>
            <h1 className="text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
              数据结构课程知识库
            </h1>
            <p className="mt-4 max-w-3xl text-base leading-7 text-slate-600">
              {course.description}
            </p>
            <p className="mt-3 text-sm leading-6 text-slate-500">
              适用对象：{course.audience}
            </p>
          </div>

          <aside className="sp-card h-fit">
            <h2 className="sp-section-title">课程概览</h2>
            <div className="mt-4 grid grid-cols-3 gap-2 text-center text-sm">
              <OverviewStat label="章节数量" value={chapters.length} />
              <OverviewStat label="知识点数量" value={conceptCount} />
              <OverviewStat label="代码案例数量" value={codeExampleCount} />
            </div>
          </aside>
        </div>

        <section className="sp-card mt-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="sp-section-title">搜索知识点</h2>
              <p className="mt-1 text-sm leading-6 text-slate-500">
                输入“二叉树”“KMP”“最短路径”等关键词，快速定位章节和核心概念。
              </p>
            </div>
            <form action="/a3/knowledge-base" className="flex w-full gap-2 sm:max-w-md">
              <input
                name="q"
                type="search"
                defaultValue={query}
                placeholder="搜索知识点"
                className="sp-input min-w-0 flex-1"
              />
              <button type="submit" className="btn-primary shrink-0">
                搜索
              </button>
            </form>
          </div>

          {query ? (
            <div className="mt-5">
              <p className="text-sm font-semibold text-slate-600">
                “{query}” 搜索结果：{searchResults.length} 条
              </p>
              {searchResults.length > 0 ? (
                <div className="mt-3 grid gap-3 md:grid-cols-2">
                  {searchResults.map((result) => (
                    <article
                      key={`${result.chapter.id}-${result.concept.id}`}
                      className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                    >
                      <p className="text-xs font-semibold text-primary">
                        第 {result.chapter.order} 章 · {result.chapter.title}
                      </p>
                      <h3 className="mt-1 font-bold text-ink">{result.concept.title}</h3>
                      <p className="mt-2 text-sm leading-6 text-slate-600">
                        {result.concept.summary}
                      </p>
                    </article>
                  ))}
                </div>
              ) : (
                <p className="mt-3 rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-500">
                  暂未找到匹配知识点，可以尝试更短的关键词。
                </p>
              )}
            </div>
          ) : null}
        </section>

        <section className="mt-6 grid gap-4 lg:grid-cols-2">
          {chapters.map((chapter) => (
            <article key={chapter.id} className="sp-card">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-sm font-semibold text-primary">
                    第 {chapter.order} 章
                  </p>
                  <h2 className="mt-1 text-xl font-bold text-ink">{chapter.title}</h2>
                </div>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                  {chapter.coreConcepts.length} 个知识点
                </span>
              </div>

              <p className="mt-3 text-sm leading-6 text-slate-600">
                {chapter.introduction}
              </p>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <ChapterBlock title="学习目标" items={chapter.learningObjectives} />
                <ChapterBlock title="重点难点" items={chapter.keyDifficulties} />
                <ChapterBlock title="常见题型" items={chapter.questionTypes} />
                <ChapterBlock title="复习建议" items={chapter.reviewSuggestions} />
              </div>

              <div className="mt-4">
                <h3 className="text-sm font-bold text-ink">核心知识点</h3>
                <div className="mt-2 flex flex-wrap gap-2">
                  {chapter.coreConcepts.map((concept) => (
                    <span
                      key={concept.id}
                      className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-600"
                    >
                      {concept.title}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-4 rounded-2xl border border-blue-100 bg-blue-50/70 p-4">
                <p className="text-sm font-bold text-blue-950">
                  代码案例：{chapter.codeExamples[0]?.title}
                </p>
                <p className="mt-1 text-sm leading-6 text-blue-900/80">
                  {chapter.codeExamples[0]?.description}
                </p>
              </div>
            </article>
          ))}
        </section>
      </section>

      <IcpFooter />
    </main>
  );
}

function OverviewStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl bg-slate-50 px-2 py-3">
      <p className="text-lg font-extrabold text-ink">{value}</p>
      <p className="mt-1 text-xs text-slate-500">{label}</p>
    </div>
  );
}

function ChapterBlock({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-4">
      <h3 className="text-sm font-bold text-ink">{title}</h3>
      <ul className="mt-2 space-y-1.5 text-sm leading-6 text-slate-600">
        {items.slice(0, 3).map((item) => (
          <li key={item}>· {item}</li>
        ))}
      </ul>
    </div>
  );
}
