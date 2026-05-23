import { buildResourceSearchLinks } from "@/lib/study/resource-links";

type ResourceSearchLinksProps = {
  searchKeywords?: string | null;
};

export function ResourceSearchLinks({ searchKeywords }: ResourceSearchLinksProps) {
  const keywords = searchKeywords?.trim();
  const links = buildResourceSearchLinks(keywords);

  if (!keywords || links.length === 0) {
    return null;
  }

  return (
    <div className="mt-3 space-y-3">
      <p className="break-words text-xs font-semibold leading-5 text-primary">
        搜索：{keywords}
      </p>
      <div className="grid gap-2 sm:grid-cols-2">
        {links.map((link) => (
          <a
            key={link.href}
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-3 py-2 text-center text-xs font-semibold text-slate-700 shadow-sm transition hover:border-primary/40 hover:text-primary"
          >
            {link.label}
          </a>
        ))}
      </div>
    </div>
  );
}
