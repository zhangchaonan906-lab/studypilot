import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const rootDir = process.cwd();

function readPageSource() {
  return readFileSync(join(rootDir, "src", "app", "page.tsx"), "utf8");
}

describe("StudyPilot landing page", () => {
  const source = readPageSource();

  it("renders StudyPilot brand with logo component", () => {
    expect(source).toContain("StudyPilotLogo");
    expect(source).toContain("showText");
  });

  it("displays the main hero headline", () => {
    expect(source).toContain("把学习目标，");
    expect(source).toContain("拆成每天能完成的任务。");
  });

  it("displays the hero subtitle with value proposition", () => {
    expect(source).toContain("从考试复习到技能学习");
    expect(source).toContain("把模糊目标变成清晰节奏");
    expect(source).not.toContain("番茄钟");
    expect(source).not.toContain("猫爪打卡");
  });

  it('shows primary CTA button in welcome card only', () => {
    expect(source).toContain("开始生成学习计划");
    expect(source).toContain('href="/plans/new"');
  });

  it("does not show the removed secondary hero button", () => {
    expect(source).not.toContain("进入学习台");
  });

  it("shows paw print decoration with supporting text", () => {
    expect(source).toContain("🐾 🐾 🐾");
    expect(source).toContain("每一步坚持，都会留下痕迹。");
  });

  it("shows the learning loop section with data from site", () => {
    expect(source).toContain("学习闭环");
    expect(source).toContain("从目标到执行，形成学习闭环");
    expect(source).toContain("learningLoopSteps.map");
    expect(source).toContain("step.icon");
    expect(source).toContain("step.title");
    expect(source).toContain("step.description");
  });

  it("shows core capability cards with data from site", () => {
    expect(source).toContain("覆盖学习全流程的工具集");
    expect(source).toContain("capabilityCards.map");
    expect(source).toContain("card.icon");
    expect(source).toContain("card.title");
    expect(source).toContain("card.description");
  });

  it("shows learning scene tags with data from site", () => {
    expect(source).toContain("适合这些学习场景");
    expect(source).toContain("sceneTags.map");
    expect(source).toContain("tag.label");
  });

  it("does not contain the removed final CTA section", () => {
    expect(source).not.toContain("今天就把学习目标拆成计划。");
    expect(source).not.toContain("先从一个 7 天计划开始。");
  });

  it("renders welcome card with brand content", () => {
    expect(source).toContain("Welcome to StudyPilot");
    expect(source).toContain("Turn your study goals into daily progress");
    expect(source).toContain("写下目标，生成计划，完成今日任务，用猫爪记录你的坚持。");
    expect(source).toContain("Start small.");
    expect(source).toContain("Begin with a 7-day plan.");
  });

  it("does not contain specific plan names, task names, or progress data", () => {
    expect(source).not.toContain("mockPlans");
    expect(source).not.toContain("todayTasks");
    expect(source).not.toContain("ProgressBar");
    expect(source).not.toContain("高等数学");
    expect(source).not.toContain("今日学习计划");
  });

  it("keeps mobile layout structure", () => {
    // Mobile preview card shown below hero on small screens
    expect(source).toContain("lg:hidden");
    // Desktop preview card hidden on mobile
    expect(source).toContain("hidden lg:block");
    // Responsive grid for capability cards
    expect(source).toContain("sm:grid-cols-2 lg:grid-cols-3");
    // Responsive grid for loop steps
    expect(source).toContain("sm:grid-cols-2 lg:grid-cols-4");
    // Welcome card CTA is full-width on mobile
    expect(source).toContain("w-full text-center");
  });

  it("does not contain raw HTML structure tags", () => {
    expect(source).not.toContain("<html");
    expect(source).not.toContain("<body");
  });

  it("imports data from site lib", () => {
    expect(source).toContain("capabilityCards");
    expect(source).toContain("learningLoopSteps");
    expect(source).toContain("sceneTags");
    expect(source).not.toContain("mockPlans");
  });
});
