import Link from "next/link";
import { ApplicationCreateModalButton } from "@/components/application/application-create-modal-button";
import { AppShell } from "@/components/layout/app-shell";
import { StatusChart } from "@/components/dashboard/status-chart";
import { TaskList } from "@/components/task/task-list";
import { requireUser } from "@/features/auth/session";
import { getDashboardMetrics } from "@/features/dashboard/metrics";
import { listResumeOptions } from "@/features/resumes/queries";
import {
  PRIORITY_LABELS,
  STATUS_LABELS,
  type ApplicationStatus,
  type Priority
} from "@/features/applications/constants";
import { formatDateTime } from "@/lib/date";

export default async function DashboardPage() {
  const user = await requireUser();
  const [metrics, resumes] = await Promise.all([
    getDashboardMetrics(user.id),
    listResumeOptions(user.id)
  ]);

  const cards = [
    { label: "总岗位数", value: metrics.cards.totalApplications },
    { label: "活跃岗位", value: metrics.cards.activeApplications },
    { label: "Offer", value: metrics.cards.offerCount },
    { label: "已结束", value: metrics.cards.endedCount },
    { label: "高优先级", value: metrics.cards.highPriorityCount },
    {
      label: "投递到面试转化率",
      value: `${metrics.cards.interviewConversionRate}%`
    }
  ];

  return (
    <AppShell
      username={user.username}
      title="Dashboard"
      description="查看当前求职状态、待办压力和最近更新。"
      action={
        <ApplicationCreateModalButton
          defaultStatus="INTERESTED"
          resumes={resumes}
          trigger="primary"
        />
      }
    >
      <section className="grid gap-4 md:grid-cols-3 xl:grid-cols-6">
        {cards.map((card) => (
          <div
            key={card.label}
            className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
          >
            <p className="text-sm text-slate-500">{card.label}</p>
            <p className="mt-3 text-2xl font-semibold text-slate-950">
              {card.value}
            </p>
          </div>
        ))}
      </section>

      <section className="mt-6 grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold text-slate-950">状态分布</h2>
            <Link href="/applications" className="text-sm text-teal-700">
              查看看板
            </Link>
          </div>
          <StatusChart data={metrics.statusDistribution} />
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="font-semibold text-slate-950">最近更新</h2>
          <div className="mt-4 space-y-3">
            {metrics.recentApplications.length === 0 ? (
              <p className="text-sm text-slate-500">暂无岗位记录</p>
            ) : (
              metrics.recentApplications.map((application) => (
                <Link
                  key={application.id}
                  href={`/applications?applicationId=${application.id}`}
                  className="block rounded-md border border-slate-200 p-3 hover:bg-slate-50"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium text-slate-950">
                        {application.companyName}
                      </p>
                      <p className="mt-1 text-sm text-slate-500">
                        {application.jobTitle}
                      </p>
                    </div>
                    <span className="text-xs text-slate-500">
                      {
                        PRIORITY_LABELS[
                          application.priority as Priority
                        ]
                      }
                    </span>
                  </div>
                  <p className="mt-2 text-xs text-slate-500">
                    {STATUS_LABELS[application.status as ApplicationStatus]} ·{" "}
                    {formatDateTime(application.updatedAt)}
                  </p>
                </Link>
              ))
            )}
          </div>
        </div>
      </section>

      <section className="mt-6 grid gap-6 xl:grid-cols-3">
        <div>
          <h2 className="mb-3 font-semibold text-slate-950">今日待办</h2>
          <TaskList tasks={metrics.tasks.today} emptyText="今天没有待办" />
        </div>
        <div>
          <h2 className="mb-3 font-semibold text-slate-950">逾期待办</h2>
          <TaskList tasks={metrics.tasks.overdue} emptyText="没有逾期待办" />
        </div>
        <div>
          <h2 className="mb-3 font-semibold text-slate-950">本周日程</h2>
          <TaskList tasks={metrics.tasks.week} emptyText="本周暂无日程" />
        </div>
      </section>
    </AppShell>
  );
}
