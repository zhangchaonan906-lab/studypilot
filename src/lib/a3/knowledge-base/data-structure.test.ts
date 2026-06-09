import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  getCourseKnowledgeBase,
  getDataStructureChapter,
  getDataStructureChapters,
  searchDataStructureConcepts,
} from ".";

const rootDir = process.cwd();

function readSource(...parts: string[]) {
  const filePath = join(rootDir, ...parts);
  expect(existsSync(filePath)).toBe(true);
  return readFileSync(filePath, "utf8");
}

describe("A3 data structure knowledge base", () => {
  it("provides the data structure course knowledge base", () => {
    const course = getCourseKnowledgeBase("data-structure");

    expect(course).not.toBeNull();
    expect(course?.id).toBe("data-structure");
    expect(course?.title).toBe("数据结构");
    expect(course?.chapters.length).toBeGreaterThanOrEqual(8);
  });

  it("contains the required eight chapters in order", () => {
    expect(getDataStructureChapters().map((chapter) => chapter.title)).toEqual([
      "绪论",
      "线性表",
      "栈和队列",
      "串",
      "树与二叉树",
      "图",
      "查找",
      "排序",
    ]);
  });

  it("keeps every chapter complete enough for A3 resource generation", () => {
    for (const chapter of getDataStructureChapters()) {
      expect(chapter.introduction.length).toBeGreaterThan(20);
      expect(chapter.learningObjectives.length).toBeGreaterThanOrEqual(3);
      expect(chapter.coreConcepts.length).toBeGreaterThanOrEqual(5);
      expect(chapter.keyDifficulties.length).toBeGreaterThanOrEqual(3);
      expect(chapter.commonMistakes.length).toBeGreaterThanOrEqual(3);
      expect(chapter.questionTypes.length).toBeGreaterThanOrEqual(3);
      expect(chapter.codeExamples.length).toBeGreaterThanOrEqual(1);
      expect(chapter.reviewSuggestions.length).toBeGreaterThanOrEqual(3);
    }
  });

  it("can fetch a chapter by id", () => {
    const chapter = getDataStructureChapter("trees-binary-trees");

    expect(chapter?.title).toBe("树与二叉树");
    expect(chapter?.coreConcepts.map((concept) => concept.title)).toContain("二叉树");
  });

  it("can search concepts by keyword", () => {
    const results = searchDataStructureConcepts("二叉树");

    expect(results.length).toBeGreaterThan(0);
    expect(results.some((result) => result.chapter.title === "树与二叉树")).toBe(true);
    expect(results.some((result) => result.concept.title.includes("二叉树"))).toBe(true);
  });
});

describe("/a3/knowledge-base page", () => {
  it("renders the data structure knowledge base overview and search UI", () => {
    const source = readSource("src", "app", "a3", "knowledge-base", "page.tsx");

    expect(source).toContain("数据结构课程知识库");
    expect(source).toContain("getCourseKnowledgeBase");
    expect(source).toContain("searchDataStructureConcepts");
    expect(source).toContain('name="q"');
    expect(source).toContain("章节数量");
    expect(source).toContain("知识点数量");
    expect(source).toContain("代码案例数量");
    expect(source).toContain("chapter.coreConcepts.length");
    expect(source).not.toContain("dangerouslySetInnerHTML");
  });
});
