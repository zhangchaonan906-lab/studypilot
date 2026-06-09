import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  defaultA3ResourceTypes,
  generateAgentWorkflow,
  generateLearningResources,
} from "./resource-generator";

const rootDir = process.cwd();
const bannedPhrases = ["赋能", "全方位提升", "数字化时代", "智能化变革"];

function readSource(...parts: string[]) {
  const filePath = join(rootDir, ...parts);
  expect(existsSync(filePath)).toBe(true);
  return readFileSync(filePath, "utf8");
}

describe("A3 resource generator", () => {
  const baseInput = {
    profileSummary:
      "大数据管理与应用专业，大二，正在复习数据结构，线性表和二叉树薄弱，每天可学习 2 小时，喜欢代码例题和刷题。",
    courseId: "data-structure",
    weakPoints: ["线性表", "二叉树"],
    resourceTypes: defaultA3ResourceTypes,
  };

  it("generates at least five resource types", () => {
    const resources = generateLearningResources(baseInput);

    expect(resources.length).toBeGreaterThanOrEqual(5);
    expect(resources.map((resource) => resource.type)).toEqual([
      "course_explanation",
      "mind_map",
      "practice_questions",
      "code_practice",
      "extended_reading",
    ]);
  });

  it("returns complete resource cards with type, title, content, and agent name", () => {
    const resources = generateLearningResources(baseInput);

    for (const resource of resources) {
      expect(resource.type).toBeTruthy();
      expect(resource.title.length).toBeGreaterThan(4);
      expect(resource.content.length).toBeGreaterThan(40);
      expect(resource.agentName.length).toBeGreaterThan(4);
      expect(resource.targetConcepts.length).toBeGreaterThan(0);
      expect(resource.estimatedMinutes).toBeGreaterThan(0);
    }
  });

  it("generates a concrete course explanation for linear lists", () => {
    const [resource] = generateLearningResources({
      ...baseInput,
      chapterId: "linear-list",
      weakPoints: ["线性表"],
      resourceTypes: ["course_explanation"],
    });

    expect(resource.title).toContain("线性表");
    expect(resource.content).toContain("顺序表");
    expect(resource.content).toContain("单链表");
    expect(resource.agentName).toBe("Resource Agent");
  });

  it("generates practice questions for binary trees", () => {
    const [resource] = generateLearningResources({
      ...baseInput,
      chapterId: "trees-binary-trees",
      weakPoints: ["二叉树"],
      resourceTypes: ["practice_questions"],
    });

    expect(resource.content).toContain("选择题");
    expect(resource.content).toContain("简答题");
    expect(resource.content).toContain("算法题");
    expect(resource.content).toContain("答案");
    expect(resource.content).toContain("解析");
    expect(resource.agentName).toBe("Exercise Agent");
  });

  it("generates code practice with a code snippet", () => {
    const [resource] = generateLearningResources({
      ...baseInput,
      chapterId: "linear-list",
      weakPoints: ["线性表"],
      resourceTypes: ["code_practice"],
    });

    expect(resource.content).toMatch(/#include|function|typedef|struct/);
    expect(resource.content).toContain("易错边界");
    expect(resource.agentName).toBe("Practice Agent");
  });

  it("generates mind map resources with a text hierarchy", () => {
    const [resource] = generateLearningResources({
      ...baseInput,
      chapterId: "linear-list",
      weakPoints: ["线性表"],
      resourceTypes: ["mind_map"],
    });

    expect(resource.content).toContain("├─");
    expect(resource.content).toContain("└─");
  });

  it("does not use obvious AI-flavored slogans", () => {
    const resources = generateLearningResources(baseInput);
    const joined = resources.map((resource) => resource.content).join("\n");

    for (const phrase of bannedPhrases) {
      expect(joined).not.toContain(phrase);
    }
  });

  it("returns a safe fallback when a chapter cannot be matched", () => {
    const [resource] = generateLearningResources({
      ...baseInput,
      chapterId: "missing-chapter",
      weakPoints: ["不存在的知识点"],
      resourceTypes: ["course_explanation"],
    });

    expect(resource.content).toContain("暂未在数据结构知识库中找到");
    expect(resource.difficulty).toBe("基础");
  });

  it("describes the multi-agent workflow", () => {
    const workflow = generateAgentWorkflow(baseInput);

    expect(workflow.map((step) => step.agentName)).toEqual([
      "Profile Agent",
      "Knowledge Agent",
      "Resource Agent",
      "Exercise Agent",
      "Practice Agent",
      "Review Agent",
    ]);
    expect(workflow.every((step) => step.status === "completed")).toBe(true);
  });
});

describe("/a3/resources page", () => {
  it("renders the resource generation center with workflow and resource cards", () => {
    const source = readSource("src", "app", "a3", "resources", "page.tsx");

    expect(source).toContain("A3 个性化资源生成中心");
    expect(source).toContain("generateLearningResources");
    expect(source).toContain("generateAgentWorkflow");
    expect(source).toContain("生成个性化资源");
    expect(source).toContain("Profile Agent");
    expect(source).toContain("Knowledge Agent");
    expect(source).toContain("Resource Agent");
    expect(source).toContain("Exercise Agent");
    expect(source).toContain("Practice Agent");
    expect(source).toContain("Review Agent");
    expect(source).toContain("resource.content");
    expect(source).toContain("whitespace-pre-wrap");
    expect(source).not.toContain("dangerouslySetInnerHTML");
  });
});
