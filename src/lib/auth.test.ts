import { describe, expect, it } from "vitest";
import {
  formatAuthError,
  getAuthRedirectPath,
  getAuthErrorMessage,
  isProtectedPath,
  submitAuthCredentials,
  validateAuthCredentials,
} from "./auth";

describe("auth route rules", () => {
  it("protects all application routes except public pages", () => {
    expect(isProtectedPath("/dashboard")).toBe(true);
    expect(isProtectedPath("/plans")).toBe(true);
    expect(isProtectedPath("/plans/new")).toBe(true);
    expect(isProtectedPath("/plans/gaoshu-30")).toBe(true);
    expect(isProtectedPath("/today")).toBe(true);
    expect(isProtectedPath("/review")).toBe(true);
    expect(isProtectedPath("/weekly")).toBe(true);
    expect(isProtectedPath("/")).toBe(false);
    expect(isProtectedPath("/login")).toBe(false);
    expect(isProtectedPath("/_next/static/script.js")).toBe(false);
  });

  it("redirects logged-out users to login and logged-in users away from login", () => {
    expect(getAuthRedirectPath("/dashboard", false)).toBe("/login");
    expect(getAuthRedirectPath("/plans/abc", false)).toBe("/login");
    expect(getAuthRedirectPath("/login", true)).toBe("/dashboard");
    expect(getAuthRedirectPath("/", false)).toBeNull();
  });
});

describe("auth error copy", () => {
  it("maps Supabase auth messages to Chinese user-facing copy", () => {
    expect(getAuthErrorMessage("Invalid login credentials")).toBe("邮箱或密码错误");
    expect(getAuthErrorMessage("User already registered")).toBe(
      "该邮箱已注册，请切换到登录"
    );
    expect(getAuthErrorMessage("Email not confirmed")).toBe(
      "邮箱尚未确认，请检查邮箱或关闭邮箱确认"
    );
    expect(getAuthErrorMessage("Signup disabled")).toBe(
      "当前 Supabase 项目未开启邮箱注册"
    );
    expect(getAuthErrorMessage("Email signups are disabled")).toBe(
      "当前 Supabase 项目未开启邮箱注册"
    );
    expect(getAuthErrorMessage("Password should be at least 6 characters")).toBe(
      "密码至少需要 6 位"
    );
    expect(getAuthErrorMessage("Unable to validate email address: invalid format")).toBe(
      "邮箱格式不正确"
    );
    expect(getAuthErrorMessage("Invalid API key")).toBe(
      "Supabase key 填错了，请检查 .env.local"
    );
    expect(getAuthErrorMessage("Something unexpected")).toBe("Something unexpected");
  });

  it("does not expose raw Supabase error details from formatted errors", () => {
    expect(formatAuthError("Signup disabled")).toEqual({
      message: "当前 Supabase 项目未开启邮箱注册",
    });

    expect(formatAuthError("Something unexpected")).toEqual({
      message: "操作失败，请重试。",
    });
  });
});

describe("auth credential validation", () => {
  it("rejects invalid signup email before calling Supabase", async () => {
    const calls: string[] = [];
    const auth = createAuthStub(calls);

    const result = await submitAuthCredentials({
      mode: "sign-up",
      email: "not-an-email",
      password: "123456",
      auth,
      origin: "http://localhost:3000",
    });

    expect(result).toEqual({
      ok: false,
      error: "请输入有效的邮箱地址。",
    });
    expect(calls).toEqual([]);
  });

  it("rejects invalid signin email before calling Supabase", async () => {
    const calls: string[] = [];
    const auth = createAuthStub(calls);

    const result = await submitAuthCredentials({
      mode: "sign-in",
      email: "student",
      password: "123456",
      auth,
      origin: "http://localhost:3000",
    });

    expect(result).toEqual({
      ok: false,
      error: "请输入有效的邮箱地址。",
    });
    expect(calls).toEqual([]);
  });

  it("trims email before authentication", () => {
    expect(
      validateAuthCredentials({
        mode: "sign-in",
        email: "  student@example.com  ",
        password: "123456",
      })
    ).toEqual({
      ok: true,
      data: {
        email: "student@example.com",
        password: "123456",
      },
    });
  });

  it("rejects short signup passwords with Chinese copy", () => {
    expect(
      validateAuthCredentials({
        mode: "sign-up",
        email: "student@example.com",
        password: "12345",
      })
    ).toEqual({
      ok: false,
      error: "密码至少需要 6 位。",
    });
  });
});

function createAuthStub(calls: string[]) {
  return {
    async signUp() {
      calls.push("signUp");
      return { data: { session: null }, error: null };
    },
    async signInWithPassword() {
      calls.push("signInWithPassword");
      return { error: null };
    },
  };
}
