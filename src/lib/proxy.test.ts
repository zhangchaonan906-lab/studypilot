import { readFileSync } from "node:fs";
import { join } from "node:path";
import { NextRequest } from "next/server";
import { describe, expect, it } from "vitest";

const rootDir = process.cwd();

async function runProxy(request: NextRequest) {
  const { proxy } = await import("../proxy");
  return proxy(request);
}

function createRequest({
  path,
  host = "https://www.studypilot.cn",
  method = "GET",
  cookie,
}: {
  path: string;
  host?: string;
  method?: string;
  cookie?: string;
}) {
  return new NextRequest(`${host}${path}`, {
    method,
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
      const response = await runProxy(createRequest({ path }));

      expect(response.headers.get("location")).toBeNull();
    }
  });

  it("redirects logged-out protected routes to login with a next path", async () => {
    const dashboardResponse = await runProxy(createRequest({ path: "/dashboard" }));
    const notesResponse = await runProxy(createRequest({ path: "/notes?tag=math" }));

    expect(dashboardResponse.headers.get("location")).toBe(
      "https://www.studypilot.cn/login?next=%2Fdashboard",
    );
    expect(notesResponse.headers.get("location")).toBe(
      "https://www.studypilot.cn/login?next=%2Fnotes%3Ftag%3Dmath",
    );
  });

  it("allows protected routes when a Supabase auth cookie exists", async () => {
    const response = await runProxy(
      createRequest({
        path: "/today",
        cookie: "sb-project-ref-auth-token=fake-session",
      }),
    );

    expect(response.headers.get("location")).toBeNull();
  });

  it("redirects root domain page GET and HEAD requests to the www canonical host", async () => {
    const getResponse = await runProxy(
      createRequest({
        path: "/plans/new?source=root",
        host: "https://studypilot.cn",
      }),
    );
    const headResponse = await runProxy(
      createRequest({
        path: "/login?next=/dashboard",
        host: "https://studypilot.cn",
        method: "HEAD",
      }),
    );

    expect(getResponse.status).toBe(308);
    expect(getResponse.headers.get("location")).toBe(
      "https://www.studypilot.cn/plans/new?source=root",
    );
    expect(headResponse.status).toBe(308);
    expect(headResponse.headers.get("location")).toBe(
      "https://www.studypilot.cn/login?next=/dashboard",
    );
  });

  it("does not canonicalize www, localhost, or Vercel hosts", async () => {
    const cookie = "sb-project-ref-auth-token=fake-session";

    for (const host of [
      "https://www.studypilot.cn",
      "http://localhost:3000",
      "http://127.0.0.1:3000",
      "https://studypilot-seven.vercel.app",
    ]) {
      const response = await runProxy(createRequest({ path: "/plans/new", host, cookie }));

      expect(response.headers.get("location")).toBeNull();
    }
  });

  it("returns a clear JSON error for API requests sent to the root domain", async () => {
    const response = await runProxy(
      createRequest({
        path: "/api/generate-plan",
        host: "https://studypilot.cn",
        method: "POST",
        cookie: "sb-project-ref-auth-token=fake-session",
      }),
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: "请使用 www.studypilot.cn 访问正式站点。",
    });
  });
});
