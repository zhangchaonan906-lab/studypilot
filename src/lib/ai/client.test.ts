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
});
