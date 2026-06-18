import type { ReactNode } from "react";
import { logoutAction } from "@/features/auth/actions";
import { Sidebar } from "./sidebar";

type AppShellProps = {
  title: string;
  description?: string;
  children: ReactNode;
  action?: ReactNode;
};

export function AppShell({ title, description, children, action }: AppShellProps) {
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
              <form action={logoutAction}>
                <button className="h-9 rounded-md border border-slate-300 px-3 text-sm font-medium text-slate-700 hover:bg-slate-100">
                  登出
                </button>
              </form>
            </div>
          </div>
        </header>
        <div className="px-5 py-6 lg:px-8">{children}</div>
      </main>
    </div>
  );
}
