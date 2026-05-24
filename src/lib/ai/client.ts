type AIProvider = "openai" | "deepseek";

type EnvLike = Record<string, string | undefined>;

type ChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

type AIRequestOptions = {
  maxTokens?: number;
};

export type AIClientConfig = {
  provider: AIProvider;
  apiKey: string;
  model: string;
  baseUrl: string;
};

const ALLOWED_DEEPSEEK_MODELS = new Set([
  "deepseek-v4-flash",
  "deepseek-v4-pro",
  "deepseek-chat",
  "deepseek-reasoner",
]);

const ALLOWED_OPENAI_MODELS = new Set([
  "gpt-4o-mini",
  "gpt-4o",
  "gpt-4-turbo",
]);

export function getAIClientConfig(env: EnvLike = process.env): AIClientConfig {
  const provider = (env.AI_PROVIDER || "deepseek").toLowerCase();

  if (provider === "openai") {
    const apiKey = env.OPENAI_API_KEY;

    if (!apiKey) {
      throw new Error("缺少 OPENAI_API_KEY，请先在 .env.local 中填写。");
    }

    const model = env.OPENAI_MODEL || "gpt-4o-mini";

    if (!ALLOWED_OPENAI_MODELS.has(model)) {
      throw new Error("AI 模型配置无效，请检查服务端配置。");
    }

    return {
      provider: "openai",
      apiKey,
      model,
      baseUrl: "https://api.openai.com/v1",
    };
  }

  if (provider === "deepseek") {
    const apiKey = env.DEEPSEEK_API_KEY;

    if (!apiKey) {
      throw new Error("缺少 DEEPSEEK_API_KEY，请先在 .env.local 中填写。");
    }

    const model = env.DEEPSEEK_MODEL || "deepseek-v4-flash";

    if (!ALLOWED_DEEPSEEK_MODELS.has(model)) {
      throw new Error("AI 模型配置无效，请检查服务端配置。");
    }

    return {
      provider: "deepseek",
      apiKey,
      model,
      baseUrl: env.DEEPSEEK_BASE_URL || "https://api.deepseek.com",
    };
  }

  throw new Error("AI_PROVIDER 只支持 openai 或 deepseek。");
}

export async function callAIJson(messages: ChatMessage[], options: AIRequestOptions = {}) {
  const config = getAIClientConfig();
  const endpoint = `${config.baseUrl.replace(/\/$/, "")}/chat/completions`;
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${config.apiKey}`,
    },
    body: JSON.stringify({
      model: config.model,
      messages,
      temperature: 0.3,
      max_tokens: options.maxTokens ?? 8000,
      response_format: {
        type: "json_object",
      },
      stream: false,
    }),
  });

  const body = await response.json().catch(() => null);

  if (!response.ok) {
    console.error(
      `[StudyPilot] AI call failed: ${config.provider} status=${response.status}`,
      typeof body?.error?.message === "string" ? body.error.message : "",
    );
    throw new Error("AI 服务暂时不可用，请稍后重试。");
  }

  const content = body?.choices?.[0]?.message?.content;

  if (typeof content !== "string" || content.trim().length === 0) {
    throw new Error("AI 没有返回内容，请重试。");
  }

  return content;
}
