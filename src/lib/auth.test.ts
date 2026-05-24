import { describe, expect, it } from "vitest";
import {
  formatAuthError,
  getAuthRedirectPath,
  getAuthErrorMessage,
  isProtectedPath,
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

  it("keeps the raw Supabase error message for debugging on the page", () => {
    expect(formatAuthError("Signup disabled")).toEqual({
      message: "当前 Supabase 项目未开启邮箱注册",
      rawMessage: "Signup disabled",
    });

    expect(formatAuthError("Something unexpected")).toEqual({
      message: "Something unexpected",
      rawMessage: "Something unexpected",
    });
  });
});
