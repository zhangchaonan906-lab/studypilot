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

function readSystemPageSource() {
  const filePath = join(rootDir, "src", "app", "a3", "system", "page.tsx");
  expect(existsSync(filePath)).toBe(true);
  return readFileSync(filePath, "utf8");
}

describe("/a3/system page", () => {
  it("renders the system support title and major sections", () => {
    const source = readSystemPageSource();

    expect(source).toContain("A3 系统保障与开发说明");
    expect(source).toContain("防幻觉机制");
    expect(source).toContain("内容安全策略");
    expect(source).toContain("多智能体进度机制");
    expect(source).toContain("Markdown 与多模态内容展示说明");
    expect(source).toContain("AI Coding 工具使用说明");
    expect(source).toContain("开源工具与技术栈说明");
    expect(source).toContain("测试与部署说明");
  });

  it("documents safe generation, tooling, and deployment without key examples", () => {
    const source = readSystemPageSource();

    expect(source).toContain("基于“数据结构课程知识库”生成资源");
    expect(source).toContain("不生成不存在的网址和虚假引用");
    expect(source).toContain("不输出 API Key、service role key、环境变量");
    expect(source).toContain("Codex / Claude Code");
    expect(source).toContain("npm.cmd run test");
    expect(source).toContain("npm.cmd run build");
    expect(source).toContain("npm.cmd run lint");
    expect(source).toContain("www.studypilot.cn/a3");
    expect(source).not.toContain("dangerouslySetInnerHTML");
    expect(source).not.toContain("sk-");
    expect(source).not.toContain("service_role=");
  });

  it("avoids advertisement-like slogans", () => {
    const source = readSystemPageSource();

    for (const phrase of bannedPhrases) {
      expect(source).not.toContain(phrase);
    }
  });
});
