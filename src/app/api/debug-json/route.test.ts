import { describe, expect, it } from "vitest";
import { POST } from "./route";

describe("/api/debug-json", () => {
  it("returns safe request metadata and JSON keys without exposing full body", async () => {
    const response = await POST(
      new Request("https://www.studypilot.cn/api/debug-json", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "content-length": "36",
          host: "www.studypilot.cn",
          cookie: "sb-project-ref-auth-token=secret",
        },
        body: JSON.stringify({
          hello: "world",
          source: "debug",
          hidden: "do-not-return",
        }),
      }),
    );

    const payload = await response.json();

    expect(payload).toMatchObject({
      method: "POST",
      host: "www.studypilot.cn",
      contentType: "application/json",
      contentLength: "36",
      canParseJson: true,
      parsedKeys: ["hello", "source", "hidden"],
    });
    expect(payload.bodyLength).toBeGreaterThan(30);
    expect(payload.bodyPrefix).toBe(JSON.stringify({
      hello: "world",
      source: "debug",
      hidden: "do-not-return",
    }).slice(0, 30));
    expect(JSON.stringify(payload)).not.toContain("secret");
    expect(JSON.stringify(payload)).not.toContain("do-not-return");
  });

  it("reports invalid JSON without returning the complete request body", async () => {
    const response = await POST(
      new Request("https://www.studypilot.cn/api/debug-json", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          host: "www.studypilot.cn",
        },
        body: "not-json payload with private suffix",
      }),
    );

    const payload = await response.json();

    expect(payload.canParseJson).toBe(false);
    expect(payload.parsedKeys).toEqual([]);
    expect(payload.bodyPrefix).toBe("not-json payload with private ");
    expect(JSON.stringify(payload)).not.toContain("suffix");
  });
});
