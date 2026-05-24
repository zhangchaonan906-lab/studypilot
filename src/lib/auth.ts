export const protectedPathPrefixes = [
  "/dashboard",
  "/plans",
  "/today",
  "/review",
  "/weekly",
  "/focus",
  "/resources",
  "/templates",
  "/marketplace",
  "/schedule",
  "/checkin",
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

export function sanitizeRedirectPath(nextPath: string | null | undefined) {
  const fallback = "/dashboard";
  const path = nextPath?.trim();

  if (!path || !path.startsWith("/") || path.startsWith("//")) {
    return fallback;
  }

  return path;
}

export type AuthMode = "sign-in" | "sign-up";

export const authValidationMessages = {
  invalidEmail: "请输入有效的邮箱地址。",
  missingCredentials: "请填写邮箱和密码。",
  shortPassword: "密码至少需要 6 位。",
  loginFailed: "登录失败，请检查邮箱或密码。",
  signupFailed: "注册失败，请稍后重试或更换邮箱。",
} as const;

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type AuthCredentials = {
  mode: AuthMode;
  email: string;
  password: string;
};

type ValidatedAuthCredentials =
  | {
      ok: true;
      data: {
        email: string;
        password: string;
      };
    }
  | {
      ok: false;
      error: string;
    };

type SupabaseAuthLike = {
  signUp(input: {
    email: string;
    password: string;
    options?: {
      emailRedirectTo?: string;
    };
  }): Promise<{
    data: {
      session: unknown | null;
    } | null;
    error: {
      message?: string;
    } | null;
  }>;
  signInWithPassword(input: { email: string; password: string }): Promise<{
    error: {
      message?: string;
    } | null;
  }>;
};

export function isValidEmail(email: string) {
  return emailPattern.test(email.trim());
}

export function validateAuthCredentials({
  mode,
  email,
  password,
}: AuthCredentials): ValidatedAuthCredentials {
  const normalizedEmail = email.trim();

  if (!normalizedEmail || !isValidEmail(normalizedEmail)) {
    return {
      ok: false,
      error: authValidationMessages.invalidEmail,
    };
  }

  if (!password) {
    return {
      ok: false,
      error:
        mode === "sign-up"
          ? authValidationMessages.shortPassword
          : authValidationMessages.missingCredentials,
    };
  }

  if (mode === "sign-up" && password.length < 6) {
    return {
      ok: false,
      error: authValidationMessages.shortPassword,
    };
  }

  return {
    ok: true,
    data: {
      email: normalizedEmail,
      password,
    },
  };
}

export async function submitAuthCredentials({
  mode,
  email,
  password,
  auth,
  origin,
}: AuthCredentials & {
  auth: SupabaseAuthLike;
  origin: string;
}) {
  const validated = validateAuthCredentials({ mode, email, password });

  if (!validated.ok) {
    return validated;
  }

  if (mode === "sign-up") {
    const { data, error } = await auth.signUp({
      email: validated.data.email,
      password: validated.data.password,
      options: {
        emailRedirectTo: `${origin}/auth/callback?next=/dashboard`,
      },
    });

    if (error) {
      return {
        ok: false,
        error: authValidationMessages.signupFailed,
      } as const;
    }

    return {
      ok: true,
      data: {
        session: data?.session ?? null,
      },
    } as const;
  }

  const { error } = await auth.signInWithPassword({
    email: validated.data.email,
    password: validated.data.password,
  });

  if (error) {
    return {
      ok: false,
      error: authValidationMessages.loginFailed,
    } as const;
  }

  return {
    ok: true,
    data: {
      session: null,
    },
  } as const;
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
  const mappedMessage = getAuthErrorMessage(rawMessage);

  return {
    message:
      mappedMessage === rawMessage ? "操作失败，请重试。" : mappedMessage,
  };
}
