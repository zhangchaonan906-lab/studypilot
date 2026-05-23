import { describe, expect, it } from "vitest";
import {
  buildBilibiliSearchUrl,
  buildResourceSearchLinks,
  buildYouTubeSearchUrl,
} from "./resource-links";

describe("resource search links", () => {
  it("builds a Bilibili search URL from search keywords", () => {
    const keywords = "高数 极限 连续 期末复习";

    expect(buildBilibiliSearchUrl(keywords)).toBe(
      `https://search.bilibili.com/all?keyword=${encodeURIComponent(keywords)}`
    );
  });

  it("builds a YouTube search URL from search keywords", () => {
    const keywords = "LeetCode 动态规划 入门";

    expect(buildYouTubeSearchUrl(keywords)).toBe(
      `https://www.youtube.com/results?search_query=${encodeURIComponent(keywords)}`
    );
  });

  it("does not return search buttons when search keywords are empty", () => {
    expect(buildResourceSearchLinks("   ")).toEqual([]);
    expect(buildResourceSearchLinks(null)).toEqual([]);
  });
});
