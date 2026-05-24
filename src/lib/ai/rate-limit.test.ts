import { describe, expect, it } from "vitest";
import {
  checkAiUsageRateLimit,
  weeklySummaryRateLimitRule,
} from "./rate-limit";

describe("AI usage rate limits", () => {
  it("returns 429 when weekly summary daily limit is reached", async () => {
    const client = createCountClient([10, 0]);

    const result = await checkAiUsageRateLimit({
      supabase: client,
      userId: "user-1",
      endpoint: "/api/weekly-summary",
      rule: weeklySummaryRateLimitRule,
      now: new Date("2026-05-24T10:30:00.000Z"),
    });

    expect(result).toEqual({
      allowed: false,
      status: 429,
      error: "今日周总结生成次数已达上限，请明天再试。",
    });
    expect(client.filters).toContainEqual({
      column: "endpoint",
      value: "/api/weekly-summary",
    });
  });

  it("returns 429 when weekly summary requests are too frequent", async () => {
    const client = createCountClient([2, 3]);

    const result = await checkAiUsageRateLimit({
      supabase: client,
      userId: "user-1",
      endpoint: "/api/weekly-summary",
      rule: weeklySummaryRateLimitRule,
      now: new Date("2026-05-24T10:30:00.000Z"),
    });

    expect(result).toEqual({
      allowed: false,
      status: 429,
      error: "请求过于频繁，请稍后再试。",
    });
  });
});

function createCountClient(counts: number[]) {
  const filters: Array<{ column: string; value: string }> = [];
  let queryIndex = -1;

  return {
    filters,
    from(table: string) {
      expect(table).toBe("ai_usage_logs");

      return {
        select() {
          queryIndex += 1;

          const query = {
            eq(column: string, value: string) {
              filters.push({ column, value });
              return query;
            },
            gte() {
              return Promise.resolve({
                count: counts[queryIndex],
                error: null,
              });
            },
          };

          return query;
        },
      };
    },
  };
}
