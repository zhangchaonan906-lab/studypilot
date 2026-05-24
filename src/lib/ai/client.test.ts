import { describe, expect, it } from "vitest";
import { getAIClientConfig } from "./client";

describe("AI provider config", () => {
  it("uses DeepSeek by default with OpenAI-compatible base URL", () => {
    expect(
      getAIClientConfig({
        AI_PROVIDER: "",
        DEEPSEEK_API_KEY: "test-key",
        DEEPSEEK_MODEL: "",
        DEEPSEEK_BASE_URL: "",
      })
    ).toEqual({
      provider: "deepseek",
      apiKey: "test-key",
      model: "deepseek-v4-flash",
      baseUrl: "https://api.deepseek.com",
    });
  });

  it("uses OpenAI config when AI_PROVIDER is openai", () => {
    expect(
      getAIClientConfig({
        AI_PROVIDER: "openai",
        OPENAI_API_KEY: "test-key",
        OPENAI_MODEL: "",
      })
    ).toEqual({
      provider: "openai",
      apiKey: "test-key",
      model: "gpt-4o-mini",
      baseUrl: "https://api.openai.com/v1",
    });
  });

  it("returns Chinese errors for missing provider keys", () => {
    expect(() =>
      getAIClientConfig({
        AI_PROVIDER: "deepseek",
      })
    ).toThrow("缺少 DEEPSEEK_API_KEY");

    expect(() =>
      getAIClientConfig({
        AI_PROVIDER: "openai",
      })
    ).toThrow("缺少 OPENAI_API_KEY");
  });

  it("accepts valid DeepSeek models", () => {
    const validModels = ["deepseek-v4-flash", "deepseek-v4-pro", "deepseek-chat", "deepseek-reasoner"];

    for (const model of validModels) {
      expect(() =>
        getAIClientConfig({
          AI_PROVIDER: "deepseek",
          DEEPSEEK_API_KEY: "test-key",
          DEEPSEEK_MODEL: model,
        }),
      ).not.toThrow();
    }
  });

  it("accepts valid OpenAI models", () => {
    const validModels = ["gpt-4o-mini", "gpt-4o", "gpt-4-turbo"];

    for (const model of validModels) {
      expect(() =>
        getAIClientConfig({
          AI_PROVIDER: "openai",
          OPENAI_API_KEY: "test-key",
          OPENAI_MODEL: model,
        }),
      ).not.toThrow();
    }
  });

  it("rejects invalid DeepSeek models with safe Chinese error", () => {
    expect(() =>
      getAIClientConfig({
        AI_PROVIDER: "deepseek",
        DEEPSEEK_API_KEY: "test-key",
        DEEPSEEK_MODEL: "gpt-4",
      }),
    ).toThrow("AI 模型配置无效，请检查服务端配置。");

    expect(() =>
      getAIClientConfig({
        AI_PROVIDER: "deepseek",
        DEEPSEEK_API_KEY: "test-key",
        DEEPSEEK_MODEL: "made-up-model",
      }),
    ).toThrow("AI 模型配置无效，请检查服务端配置。");
  });

  it("rejects invalid OpenAI models with safe Chinese error", () => {
    expect(() =>
      getAIClientConfig({
        AI_PROVIDER: "openai",
        OPENAI_API_KEY: "test-key",
        OPENAI_MODEL: "deepseek-chat",
      }),
    ).toThrow("AI 模型配置无效，请检查服务端配置。");
  });

  it("never exposes the actual model value in error messages", () => {
    expect(() =>
      getAIClientConfig({
        AI_PROVIDER: "deepseek",
        DEEPSEEK_API_KEY: "test-key",
        DEEPSEEK_MODEL: "evil-model",
      }),
    ).toThrow("AI 模型配置无效，请检查服务端配置。");
  });
});
