import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { extractLearningProfileFromText } from "./profile-extraction";

const rootDir = process.cwd();

function readSource(...parts: string[]) {
  const filePath = join(rootDir, ...parts);
  expect(existsSync(filePath)).toBe(true);
  return readFileSync(filePath, "utf8");
}

describe("A3 learning profile extraction", () => {
  const completeInput =
    "我是大数据管理与应用专业大二学生，最近要复习数据结构，线性表和二叉树比较薄弱，期末还有 20 天，每天能学 2 小时，喜欢代码例题和刷题。";

  it("extracts major background from a complete natural language description", () => {
    const profile = extractLearningProfileFromText(completeInput);

    expect(profile.majorBackground).toContain("大数据管理与应用");
  });

  it("recognizes data structure as the course target", () => {
    const profile = extractLearningProfileFromText(completeInput);

    expect(profile.courseTarget).toBe("数据结构");
  });

  it("recognizes final exam and postgraduate exam learning goals", () => {
    expect(extractLearningProfileFromText(completeInput).learningGoal).toContain("期末");
    expect(
      extractLearningProfileFromText("我是计算机专业学生，准备考研数学，需要冲刺复习。")
        .learningGoal,
    ).toContain("考研");
  });

  it("recognizes weak points in linear lists and binary trees", () => {
    const profile = extractLearningProfileFromText(completeInput);

    expect(profile.weakPoints).toContain("线性表");
    expect(profile.weakPoints).toContain("二叉树");
  });

  it("recognizes daily two-hour study time", () => {
    const profile = extractLearningProfileFromText(completeInput);

    expect(profile.availableTime).toBe("每天 2 小时");
  });

  it("recognizes code examples and practice as resource preferences", () => {
    const profile = extractLearningProfileFromText(completeInput);

    expect(profile.resourcePreference).toContain("代码例题");
    expect(profile.resourcePreference).toContain("刷题练习");
  });

  it("marks sparse input as low confidence and complete input as high confidence", () => {
    expect(extractLearningProfileFromText("想学一下").confidence).toBe("低");
    expect(extractLearningProfileFromText(completeInput).confidence).toBe("高");
  });

  it("returns safe defaults for empty input", () => {
    const profile = extractLearningProfileFromText("");

    expect(profile.majorBackground).toBe("未明确专业背景");
    expect(profile.weakPoints).toEqual([]);
    expect(profile.resourcePreference).toEqual([]);
    expect(profile.confidence).toBe("低");
  });
});

describe("/a3/profile page", () => {
  it("renders the A3 profile demo with textarea, example button, and profile cards", () => {
    const source = readSource("src", "app", "a3", "profile", "page.tsx");

    expect(source).toContain("A3 对话式学习画像");
    expect(source).toContain("extractLearningProfileFromText");
    expect(source).toContain("<textarea");
    expect(source).toContain("我是大数据管理与应用专业大二学生");
    expect(source).toContain("setInput(exampleProfileText)");
    expect(source).toContain("请先描述你的学习情况。");
    expect(source).toContain("生成学习画像");
    expect(source).toContain("专业背景");
    expect(source).toContain("课程目标");
    expect(source).toContain("知识短板");
    expect(source).toContain("资源偏好");
    expect(source).toContain("已识别到数据结构知识点，可用于后续资源生成。");
    expect(source).not.toContain("dangerouslySetInnerHTML");
  });
});
