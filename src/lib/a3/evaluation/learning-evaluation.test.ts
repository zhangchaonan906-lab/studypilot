import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { generateLearningEvaluation } from "./learning-evaluation";

const rootDir = process.cwd();
const bannedPhrases = [
  "赋能",
  "全方位提升",
  "数字化时代",
  "智能化变革",
  "构建闭环",
  "显著增强学习效果",
];

function readSource(...parts: string[]) {
  const filePath = join(rootDir, ...parts);
  expect(existsSync(filePath)).toBe(true);
  return readFileSync(filePath, "utf8");
}

describe("A3 learning evaluation", () => {
  const baseInput = {
    profileSummary:
      "大数据管理与应用专业，大二，正在复习数据结构，线性表和二叉树薄弱，每天可学习 2 小时，喜欢代码例题和刷题。",
    courseId: "data-structure",
    weakPoints: ["二叉树"],
    completedTasks: 7,
    totalTasks: 10,
    focusMinutes: 80,
    mistakeCount: 2,
    noteCount: 1,
    resourceFeedback: "一般" as const,
    recentConcepts: ["二叉树"],
  };

  it("calculates completion rate", () => {
    const report = generateLearningEvaluation(baseInput);

    expect(report.completionRate).toBe(70);
  });

  it("marks low completion as weak or building mastery", () => {
    const report = generateLearningEvaluation({
      ...baseInput,
      completedTasks: 2,
      totalTasks: 10,
    });

    expect(["基础薄弱", "正在建立"]).toContain(report.masteryLevel);
  });

  it("marks high completion as basic or good mastery", () => {
    const report = generateLearningEvaluation({
      ...baseInput,
      completedTasks: 9,
      totalTasks: 10,
    });

    expect(["基本掌握", "掌握较好"]).toContain(report.masteryLevel);
  });

  it("marks low focus minutes as low focus level", () => {
    const report = generateLearningEvaluation({
      ...baseInput,
      focusMinutes: 20,
    });

    expect(report.focusLevel).toBe("偏低");
  });

  it("adds note risk when no notes were created", () => {
    const report = generateLearningEvaluation({
      ...baseInput,
      noteCount: 0,
    });

    expect(report.riskPoints.join("")).toContain("笔记");
  });

  it("adds mistake risk when mistake count is high", () => {
    const report = generateLearningEvaluation({
      ...baseInput,
      mistakeCount: 8,
    });

    expect(report.riskPoints.join("")).toContain("错题集中，需要回到基础概念");
  });

  it("recommends concrete resource types when feedback is not helpful", () => {
    const report = generateLearningEvaluation({
      ...baseInput,
      resourceFeedback: "帮助不大",
    });

    expect(report.recommendedResourceTypes).toEqual(
      expect.arrayContaining(["练习题", "代码案例", "图解资料"]),
    );
  });

  it("adds traversal or recursion advice when binary tree is weak", () => {
    const report = generateLearningEvaluation({
      ...baseInput,
      weakPoints: ["二叉树"],
      recentConcepts: ["二叉树"],
    });

    expect(report.adjustedLearningPath.join("")).toMatch(/遍历|递归/);
  });

  it("does not use obvious AI-flavored slogans", () => {
    const report = generateLearningEvaluation(baseInput);
    const joined = [
      ...report.riskPoints,
      ...report.strengths,
      ...report.nextStepSuggestions,
      ...report.recommendedResourceTypes,
      ...report.adjustedLearningPath,
      report.summary,
    ].join("\n");

    for (const phrase of bannedPhrases) {
      expect(joined).not.toContain(phrase);
    }
  });
});

describe("/a3/evaluation page", () => {
  it("renders the evaluation form, example action, workflow, and report cards", () => {
    const source = readSource("src", "app", "a3", "evaluation", "page.tsx");

    expect(source).toContain("A3 学习效果评估");
    expect(source).toContain("generateLearningEvaluation");
    expect(source).toContain("填入数据结构复习示例");
    expect(source).toContain("fillDataStructureExample");
    expect(source).toContain("生成评估报告");
    expect(source).toContain("请填写有效的任务数量。");
    expect(source).toContain("Behavior Agent");
    expect(source).toContain("Weakness Agent");
    expect(source).toContain("Resource Feedback Agent");
    expect(source).toContain("Evaluation Agent");
    expect(source).toContain("Recommendation Agent");
    expect(source).toContain("report?.masteryLevel");
    expect(source).toContain("已根据数据结构知识库调整学习路径。");
    expect(source).not.toContain("dangerouslySetInnerHTML");
  });
});
