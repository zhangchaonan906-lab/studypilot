import { describe, expect, it } from "vitest";
import {
  getLoadingProgressState,
  getSubmitButtonState,
  planGenerationProgressSteps,
  weeklySummaryProgressSteps,
} from "./loading-state";

describe("loading progress state", () => {
  it("keeps plan generation progress at 90% until the request succeeds", () => {
    const state = getLoadingProgressState({
      elapsedSeconds: 120,
      status: "loading",
      steps: planGenerationProgressSteps,
      timeoutSeconds: 60,
      timeoutMessage: "仍在生成中，复杂计划可能需要更久，请稍等。",
    });

    expect(state.progress).toBe(90);
    expect(state.label).toBe("正在保存学习计划...");
    expect(state.timeoutMessage).toBe("仍在生成中，复杂计划可能需要更久，请稍等。");
  });

  it("sets plan generation progress to 100% after success", () => {
    const state = getLoadingProgressState({
      elapsedSeconds: 12,
      status: "success",
      steps: planGenerationProgressSteps,
      timeoutSeconds: 60,
      timeoutMessage: "仍在生成中，复杂计划可能需要更久，请稍等。",
      successLabel: "生成完成，正在跳转...",
    });

    expect(state.progress).toBe(100);
    expect(state.label).toBe("生成完成，正在跳转...");
  });

  it("shows weekly summary progress stages and timeout copy", () => {
    const state = getLoadingProgressState({
      elapsedSeconds: 50,
      status: "loading",
      steps: weeklySummaryProgressSteps,
      timeoutSeconds: 45,
      timeoutMessage: "仍在生成中，请稍等。",
    });

    expect(state.progress).toBe(85);
    expect(state.label).toBe("正在保存周总结...");
    expect(state.timeoutMessage).toBe("仍在生成中，请稍等。");
  });

  it("disables /plans/new submit button while pending and restores it after failure", () => {
    expect(
      getSubmitButtonState({
        status: "loading",
        idleLabel: "生成学习计划",
        loadingLabel: "生成中...",
      })
    ).toEqual({ disabled: true, label: "生成中..." });

    expect(
      getSubmitButtonState({
        status: "error",
        idleLabel: "生成学习计划",
        loadingLabel: "生成中...",
      })
    ).toEqual({ disabled: false, label: "生成学习计划" });
  });

  it("disables /weekly submit button while pending", () => {
    expect(
      getSubmitButtonState({
        status: "loading",
        idleLabel: "生成本周总结",
        loadingLabel: "生成中...",
      })
    ).toEqual({ disabled: true, label: "生成中..." });
  });

  it("uses saving labels for daily reflection and mistake review submissions", () => {
    expect(
      getSubmitButtonState({
        status: "loading",
        idleLabel: "保存复盘",
        loadingLabel: "保存中...",
      })
    ).toEqual({ disabled: true, label: "保存中..." });

    expect(
      getSubmitButtonState({
        status: "loading",
        idleLabel: "保存错题",
        loadingLabel: "保存中...",
      })
    ).toEqual({ disabled: true, label: "保存中..." });
  });
});
