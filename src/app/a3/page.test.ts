import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const rootDir = process.cwd();
const bannedPhrases = [
  "赋能",
  "全方位提升",
  "数字化时代",
  "智能化变革",
  "显著增强学习效果",
];

function readA3PageSource() {
  const filePath = join(rootDir, "src", "app", "a3", "page.tsx");
  expect(existsSync(filePath)).toBe(true);
  return readFileSync(filePath, "utf8");
}

describe("/a3 demo center page", () => {
  it("renders the A3 demo center headline and contest topic", () => {
    const source = readA3PageSource();

    expect(source).toContain("StudyPilot A3 参赛版演示中心");
    expect(source).toContain("基于大模型的个性化资源生成与学习多智能体系统开发");
  });

  it("links to every A3 demo module", () => {
    const source = readA3PageSource();

    expect(source).toContain('href="/a3/knowledge-base"');
    expect(source).toContain('href="/a3/profile"');
    expect(source).toContain('href="/a3/resources"');
    expect(source).toContain('href="/a3/evaluation"');
  });

  it("shows the demo flow, agent chain, and supported resource types", () => {
    const source = readA3PageSource();

    expect(source).toContain("第一步：查看数据结构课程知识库");
    expect(source).toContain("第二步：输入自然语言，生成学习画像");
    expect(source).toContain("第三步：基于画像和知识点生成 5 类资源");
    expect(source).toContain("第四步：根据任务完成、错题和资源反馈生成评估报告");
    expect(source).toContain("Profile Agent");
    expect(source).toContain("Knowledge Agent");
    expect(source).toContain("Resource Agent");
    expect(source).toContain("Exercise Agent");
    expect(source).toContain("Practice Agent");
    expect(source).toContain("Evaluation Agent");
    expect(source).toContain("课程讲解文档");
    expect(source).toContain("知识点思维导图");
    expect(source).toContain("练习题与答案解析");
    expect(source).toContain("代码实操案例");
    expect(source).toContain("拓展阅读材料");
  });

  it("keeps the page safe and avoids advertisement-like slogans", () => {
    const source = readA3PageSource();

    expect(source).not.toContain("dangerouslySetInnerHTML");
    for (const phrase of bannedPhrases) {
      expect(source).not.toContain(phrase);
    }
  });
});
