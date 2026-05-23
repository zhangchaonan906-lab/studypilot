export type ResourceSearchLink = {
  label: string;
  href: string;
};

export function buildBilibiliSearchUrl(searchKeywords: string) {
  return `https://search.bilibili.com/all?keyword=${encodeURIComponent(searchKeywords.trim())}`;
}

export function buildYouTubeSearchUrl(searchKeywords: string) {
  return `https://www.youtube.com/results?search_query=${encodeURIComponent(searchKeywords.trim())}`;
}

export function buildResourceSearchLinks(searchKeywords?: string | null): ResourceSearchLink[] {
  const keywords = searchKeywords?.trim();

  if (!keywords) {
    return [];
  }

  return [
    {
      label: "去 B站搜索",
      href: buildBilibiliSearchUrl(keywords),
    },
    {
      label: "去 YouTube 搜索",
      href: buildYouTubeSearchUrl(keywords),
    },
  ];
}
