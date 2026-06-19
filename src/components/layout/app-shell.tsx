import type { ReactNode } from "react";
import { AccountMenu } from "./account-menu";
import { Sidebar } from "./sidebar";

type AppShellProps = {
  title: string;
  description?: string;
  children: ReactNode;
  action?: ReactNode;
  username: string;
};

export function AppShell({
  title,
  description,
  children,
  action,
  username
}: AppShellProps) {
  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar />
      <main className="lg:pl-64">
        <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/95 backdrop-blur">
          <div className="flex min-h-16 flex-col gap-3 px-5 py-4 md:flex-row md:items-center md:justify-between lg:px-8">
            <div>
              <h1 className="text-xl font-semibold text-slate-950">{title}</h1>
              {description ? (
                <p className="mt-1 text-sm text-slate-500">{description}</p>
              ) : null}
            </div>
            <div className="flex items-center gap-3">
              {action}
              <AccountMenu username={username} />
            </div>
          </div>
        </header>
        <div className="px-5 py-6 lg:px-8">{children}</div>
      </main>
    </div>
  );
}
