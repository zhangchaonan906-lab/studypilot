import Link from "next/link";
import { LoginForm } from "@/components/LoginForm";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;
  const initialMessage =
    params.error === "auth_callback" ? "邮箱确认链接已失效，请重新登录或注册。" : undefined;

  return (
    <main className="min-h-screen bg-mist px-4 py-8">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-md flex-col justify-center">
        <Link href="/" className="mb-8 text-sm font-semibold text-primary">
          StudyPilot
        </Link>
        <LoginForm initialMessage={initialMessage} />
      </div>
    </main>
  );
}
