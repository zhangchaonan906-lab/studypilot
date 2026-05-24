type CountResult = {
  count: number | null;
  error: { message?: string } | null;
};

type CountQuery = {
  eq(column: string, value: string): CountQuery;
  gte(column: string, value: string): PromiseLike<CountResult>;
};

export type AiUsageRateLimitClient = {
  from(table: "ai_usage_logs"): {
    select(
      columns: string,
      options: { count: "exact"; head: true }
    ): CountQuery;
  };
};

export type AiUsageRateLimitRule = {
  dailyLimit: number;
  perMinuteLimit: number;
  dailyLimitError: string;
  perMinuteLimitError: string;
};

export const weeklySummaryRateLimitRule: AiUsageRateLimitRule = {
  dailyLimit: 10,
  perMinuteLimit: 3,
  dailyLimitError: "今日周总结生成次数已达上限，请明天再试。",
  perMinuteLimitError: "请求过于频繁，请稍后再试。",
};

export async function checkAiUsageRateLimit({
  supabase,
  userId,
  endpoint,
  rule,
  now = new Date(),
}: {
  supabase: AiUsageRateLimitClient;
  userId: string;
  endpoint: string;
  rule: AiUsageRateLimitRule;
  now?: Date;
}): Promise<
  | { allowed: true }
  | { allowed: false; status: number; error: string }
> {
  const todayStart = now.toISOString().slice(0, 10) + "T00:00:00Z";
  const oneMinuteAgo = new Date(now.getTime() - 60_000).toISOString();

  const [dailyResult, recentResult] = await Promise.all([
    supabase
      .from("ai_usage_logs")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("endpoint", endpoint)
      .gte("created_at", todayStart),
    supabase
      .from("ai_usage_logs")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("endpoint", endpoint)
      .gte("created_at", oneMinuteAgo),
  ]);

  if (dailyResult.error || recentResult.error) {
    return {
      allowed: false,
      status: 500,
      error: "请求失败，请稍后重试。",
    };
  }

  if ((dailyResult.count ?? 0) >= rule.dailyLimit) {
    return {
      allowed: false,
      status: 429,
      error: rule.dailyLimitError,
    };
  }

  if ((recentResult.count ?? 0) >= rule.perMinuteLimit) {
    return {
      allowed: false,
      status: 429,
      error: rule.perMinuteLimitError,
    };
  }

  return { allowed: true };
}
