import { SidebarNavigation } from "./SidebarNavigation";
import { IcpFooter } from "./IcpFooter";
import { getAppShellData } from "@/lib/study/data";

export async function AppShell({ children }: { children: React.ReactNode }) {
  const shellData = await getAppShellData();

  return (
    <div className="min-h-dvh bg-mist lg:flex lg:h-dvh lg:overflow-hidden">
      <SidebarNavigation
        plans={shellData.activePlans}
        userEmail={shellData.userEmail}
      />

      <main
        data-app-main
        className="min-w-0 flex-1 px-3 pb-[calc(env(safe-area-inset-bottom)+1.5rem)] pt-[calc(var(--mobile-header-height)+1rem)] sm:px-6 lg:min-h-0 lg:overflow-y-auto lg:px-8 lg:py-8"
      >
        <div className="mx-auto w-full max-w-6xl">{children}</div>
        <IcpFooter className="mt-8" />
      </main>
    </div>
  );
}
