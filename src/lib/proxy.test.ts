import { readFileSync } from "node:fs";
import { join } from "node:path";
import { NextRequest } from "next/server";
import { describe, expect, it } from "vitest";

const rootDir = process.cwd();

async function runProxy(request: NextRequest) {
  const { proxy } = await import("../proxy");
  return proxy(request);
}

function createRequest(path: string, cookie?: string) {
  return new NextRequest(`https://studypilot.cn${path}`, {
    headers: cookie ? { cookie } : undefined,
  });
}

describe("EdgeOne-safe proxy route protection", () => {
  it("does not import Supabase or create a Supabase client in proxy", () => {
    const source = readFileSync(join(rootDir, "src", "proxy.ts"), "utf8");

    expect(source).not.toContain("@supabase");
    expect(source).not.toContain("createServerClient");
    expect(source).not.toContain("createSupabase");
  });

  it("allows public routes without an auth cookie", async () => {
    for (const path of ["/", "/login", "/auth/callback?next=/dashboard", "/icon.svg"]) {
      const response = await runProxy(createRequest(path));

      expect(response.headers.get("location")).toBeNull();
    }
  });

  it("redirects logged-out protected routes to login with a next path", async () => {
    const dashboardResponse = await runProxy(createRequest("/dashboard"));
    const notesResponse = await runProxy(createRequest("/notes?tag=math"));

    expect(dashboardResponse.headers.get("location")).toBe(
      "https://studypilot.cn/login?next=%2Fdashboard",
    );
    expect(notesResponse.headers.get("location")).toBe(
      "https://studypilot.cn/login?next=%2Fnotes%3Ftag%3Dmath",
    );
  });

  it("allows protected routes when a Supabase auth cookie exists", async () => {
    const response = await runProxy(
      createRequest("/today", "sb-project-ref-auth-token=fake-session"),
    );

    expect(response.headers.get("location")).toBeNull();
  });
});
