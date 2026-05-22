export const protectedPathPrefixes = [
  "/dashboard",
  "/plans",
  "/today",
  "/review",
  "/weekly",
];

export function isProtectedPath(pathname: string) {
  return protectedPathPrefixes.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
}

export function getAuthRedirectPath(pathname: string, isAuthenticated: boolean) {
  if (isAuthenticated && pathname === "/login") {
    return "/dashboard";
  }

  if (!isAuthenticated && isProtectedPath(pathname)) {
    return "/login";
  }

  return null;
}

export function getAuthErrorMessage(message?: string) {
  if (!message) {
    return "操作失败，请重试。";
  }

  const normalized = message?.toLowerCase() ?? "";

  if (normalized.includes("missing supabase environment variables")) {
    return "Supabase 环境变量未配置，请先填写 .env.local。";
  }

  if (normalized.includes("invalid api key")) {
    return "Supabase key 填错了，请检查 .env.local";
  }

  if (normalized.includes("invalid login credentials")) {
    return "邮箱或密码错误";
  }

  if (normalized.includes("email not confirmed")) {
    return "邮箱尚未确认，请检查邮箱或关闭邮箱确认";
  }

  if (
    normalized.includes("user already registered") ||
    normalized.includes("already registered")
  ) {
    return "该邮箱已注册，请切换到登录";
  }

  if (
    normalized.includes("signup disabled") ||
    normalized.includes("email signups are disabled")
  ) {
    return "当前 Supabase 项目未开启邮箱注册";
  }

  if (normalized.includes("password should be at least")) {
    return "密码至少需要 6 位";
  }

  if (normalized.includes("unable to validate email address: invalid format")) {
    return "邮箱格式不正确";
  }

  return message;
}

export function formatAuthError(message?: string) {
  const rawMessage = message || "未知 Supabase Auth 错误";

  return {
    message: getAuthErrorMessage(rawMessage),
    rawMessage,
  };
}
