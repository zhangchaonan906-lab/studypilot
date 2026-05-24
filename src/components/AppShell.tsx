import { SidebarNavigation } from "./SidebarNavigation";
import { getAppShellData } from "@/lib/study/data";

export async function AppShell({ children }: { children: React.ReactNode }) {
  const shellData = await getAppShellData();

  return (
    <div className="min-h-screen bg-mist lg:flex">
      <SidebarNavigation
        plans={shellData.activePlans}
        userEmail={shellData.userEmail}
      />

      <main className="min-w-0 flex-1 px-4 pb-6 pt-20 sm:px-6 lg:px-8 lg:py-8">
        <div className="mx-auto w-full max-w-6xl">{children}</div>
      </main>
    </div>
  );
}
