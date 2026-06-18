import { Sparkles } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { requireUser } from "@/features/auth/session";

export default async function InterviewsPage() {
  await requireUser();

  return (
    <AppShell
      title="面试复盘"
      description="第一版先保留入口，后续扩展结构化复盘与 AI 建议。"
    >
      <section className="rounded-lg border border-slate-200 bg-white p-8 shadow-sm">
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-teal-50 text-teal-700">
          <Sparkles className="h-6 w-6" />
        </div>
        <h2 className="mt-5 text-xl font-semibold text-slate-950">
          面试复盘即将支持
        </h2>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
          后续版本会支持记录面试轮次、面试问题、回答表现、改进事项，并结合岗位 JD 与简历生成 AI 复盘建议。
        </p>
        <div className="mt-6 grid gap-3 md:grid-cols-3">
          {["面试记录", "问题复盘", "AI 建议"].map((item) => (
            <div
              key={item}
              className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm font-medium text-slate-700"
            >
              {item}
            </div>
          ))}
        </div>
      </section>
    </AppShell>
  );
}
