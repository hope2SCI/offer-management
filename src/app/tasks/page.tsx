import Link from "next/link";
import { Check, ChevronLeft, ChevronRight } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { TaskCreateModalButton } from "@/components/task/task-create-modal-button";
import { TaskEditModalButton } from "@/components/task/task-edit-modal-button";
import { TaskList } from "@/components/task/task-list";
import { requireUser } from "@/features/auth/session";
import { listApplicationOptions } from "@/features/applications/queries";
import { completeTaskAction, reopenTaskAction } from "@/features/tasks/actions";
import { TASK_TYPE_LABELS, type TaskType } from "@/features/tasks/constants";
import { listTasks } from "@/features/tasks/queries";
import {
  dateInputValue,
  dateKey,
  addMonths,
  getListTasks,
  getMonthCalendarDays,
  getSevenDayTaskGroups,
  monthFromParam,
  monthInputValue,
  type TaskViewScope
} from "@/features/tasks/view";
import { formatDate } from "@/lib/date";

type TasksPageProps = {
  searchParams?: Promise<{
    month?: string | string[];
    view?: string | string[];
    scope?: string | string[];
  }>;
};

function pickParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function tabHref(
  view: "calendar" | "list",
  scope: TaskViewScope,
  monthDate?: Date
) {
  const month = view === "calendar" && monthDate
    ? `&month=${monthInputValue(monthDate)}`
    : "";
  return `/tasks?view=${view}&scope=${scope}${month}`;
}

function monthHref(monthDate: Date, scope: TaskViewScope) {
  return `/tasks?view=calendar&scope=${scope}&month=${monthInputValue(monthDate)}`;
}

function tabClass(active: boolean) {
  return active
    ? "rounded-md bg-teal-700 px-3 py-2 text-sm font-semibold text-white"
    : "rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100";
}

function weekday(date: Date) {
  return new Intl.DateTimeFormat("zh-CN", { weekday: "short" }).format(date);
}

export default async function TasksPage({ searchParams }: TasksPageProps) {
  const user = await requireUser();
  const params = (await searchParams) ?? {};
  const view = pickParam(params.view) === "list" ? "list" : "calendar";
  const scope: TaskViewScope =
    pickParam(params.scope) === "today" ? "today" : "all";
  const today = new Date();
  const selectedMonth = monthFromParam(pickParam(params.month), today);

  const [applications, allTasks] = await Promise.all([
    listApplicationOptions(user.id),
    listTasks(user.id)
  ]);

  const todayKey = dateKey(today);
  const calendarTasks =
    scope === "today"
      ? allTasks.filter((task) => dateKey(task.dueAt) === todayKey)
      : allTasks;
  const calendarDays = getMonthCalendarDays(calendarTasks, selectedMonth, today);
  const visibleListTasks = getListTasks(allTasks, scope, today);
  const todayTasks = visibleListTasks.filter(
    (task) => dateKey(task.dueAt) === todayKey
  );
  const futureGroups = getSevenDayTaskGroups(allTasks, today);
  const monthTitle = new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "long"
  }).format(selectedMonth);

  return (
    <AppShell
      username={user.username}
      title="日程待办"
      description="用日历或列表查看事项，快速切到今天。"
    >
      <section className="flex flex-col gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap gap-2">
          <Link className={tabClass(view === "calendar")} href={tabHref("calendar", scope, selectedMonth)}>
            日历
          </Link>
          <Link className={tabClass(view === "list")} href={tabHref("list", scope)}>
            列表
          </Link>
          <Link className={tabClass(scope === "all")} href={tabHref(view, "all", selectedMonth)}>
            全部
          </Link>
          <Link className={tabClass(scope === "today")} href={tabHref(view, "today", selectedMonth)}>
            今天
          </Link>
        </div>
        <TaskCreateModalButton
          applications={applications}
          defaultDueAt={dateInputValue(today)}
        />
      </section>

      {view === "calendar" ? (
        <section className="mt-6 rounded-lg border border-slate-200 bg-white shadow-sm">
          <header className="relative flex items-center justify-end border-b border-slate-200 px-4 py-2">
            <div className="absolute left-1/2 flex -translate-x-1/2 items-center gap-2">
              <Link
                aria-label="上个月"
                className="flex h-8 w-8 items-center justify-center rounded-md text-slate-600 hover:bg-slate-100"
                href={monthHref(addMonths(selectedMonth, -1), scope)}
              >
                <ChevronLeft className="h-4 w-4" />
              </Link>
              <h2 className="min-w-28 text-center font-semibold text-slate-950">
                {monthTitle}
              </h2>
              <Link
                aria-label="下个月"
                className="flex h-8 w-8 items-center justify-center rounded-md text-slate-600 hover:bg-slate-100"
                href={monthHref(addMonths(selectedMonth, 1), scope)}
              >
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
            <p className="text-sm text-slate-500">
              {scope === "today" ? "仅显示今天事项" : "显示全部事项"}
            </p>
          </header>
          <div className="grid grid-cols-7 border-b border-slate-200 text-center text-xs font-medium text-slate-500">
            {["日", "一", "二", "三", "四", "五", "六"].map((day) => (
              <div key={day} className="py-1.5">
                {day}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-7">
            {calendarDays.map((day) => (
              <div
                key={day.key}
                className={[
                  "group relative min-h-32 border-b border-slate-200 p-2 sm:border-r",
                  "sm:min-h-24 sm:p-1.5",
                  day.isToday
                    ? "bg-teal-50 ring-2 ring-inset ring-teal-600"
                    : day.inMonth
                      ? "bg-white"
                      : "bg-slate-50"
                ].join(" ")}
              >
                <TaskCreateModalButton
                  applications={applications}
                  defaultDueAt={day.key}
                  label={<span className="sr-only">新增当天事项</span>}
                  variant="cell"
                />
                <div className="pointer-events-none relative z-20 mb-1 flex items-center justify-between">
                  <span
                    className={
                      day.inMonth
                        ? "text-sm font-medium text-slate-900"
                        : "text-sm text-slate-400"
                    }
                  >
                    <span
                      className={
                        day.isToday
                          ? "inline-flex h-5 w-5 items-center justify-center rounded-full bg-teal-700 text-white"
                          : ""
                      }
                    >
                      {day.date.getDate()}
                    </span>
                  </span>
                  {day.tasks.length ? (
                    <span className="text-xs text-slate-400">
                      {day.tasks.length} 项
                    </span>
                  ) : null}
                </div>
                <div className="relative z-20 space-y-0.5">
                  {day.tasks.map((task) => (
                    <TaskEditModalButton
                      key={task.id}
                      applications={applications}
                      task={task}
                    >
                      <span
                        className={[
                          "block truncate rounded-md border px-1.5 py-0.5 text-xs font-medium",
                          task.completedAt
                            ? "border-slate-200 bg-slate-50 text-slate-400 line-through"
                            : "border-teal-100 bg-teal-50 text-teal-800"
                        ].join(" ")}
                        title={formatDate(task.dueAt)}
                      >
                        {task.title}
                      </span>
                    </TaskEditModalButton>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      ) : (
        <section className="mt-6 grid gap-6 xl:grid-cols-2 xl:items-stretch">
          <section className="h-full rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <h2 className="mb-3 font-semibold text-slate-950">今日日程</h2>
            <TaskList
              applications={applications}
              tasks={todayTasks}
              emptyText="今天没有事项"
            />
          </section>
          {scope === "all" ? (
            <section className="h-full rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
              <h2 className="mb-3 font-semibold text-slate-950">未来 7 天</h2>
              <div className="divide-y divide-slate-200">
                {futureGroups.map((group) => (
                  <section
                    key={group.key}
                    className="grid min-h-24 grid-cols-[150px_minmax(0,1fr)_64px] items-start gap-3 py-4 first:pt-0 last:pb-0"
                  >
                    <div className="whitespace-nowrap text-sm font-semibold text-slate-500">
                      <span>{dateKey(group.date)}</span>
                      <span className="ml-2 text-slate-400">
                        {weekday(group.date)}
                      </span>
                    </div>
                    <div className="flex min-h-16 min-w-0 items-center justify-center">
                      {group.tasks.length ? (
                        <ul className="w-full space-y-1">
                          {group.tasks.map((task) => (
                            <li
                              key={task.id}
                              className="flex min-w-0 items-center gap-2 text-sm text-slate-700"
                            >
                              <form
                                action={
                                  task.completedAt
                                    ? reopenTaskAction.bind(null, task.id)
                                    : completeTaskAction.bind(null, task.id)
                                }
                              >
                                <button
                                  aria-label={task.completedAt ? "重开事项" : "完成事项"}
                                  className={[
                                    "flex h-5 w-5 items-center justify-center rounded border",
                                    task.completedAt
                                      ? "border-teal-600 bg-teal-600 text-white"
                                      : "border-slate-300 text-transparent hover:border-teal-500 hover:text-teal-600"
                                  ].join(" ")}
                                  title={task.completedAt ? "重开" : "完成"}
                                >
                                  <Check className="h-3.5 w-3.5" />
                                </button>
                              </form>
                              <TaskEditModalButton
                                applications={applications}
                                task={task}
                              >
                                <span
                                  className={[
                                    "block truncate",
                                    task.completedAt
                                      ? "text-slate-400 line-through"
                                      : "text-slate-700"
                                  ].join(" ")}
                                >
                                  {task.title}
                                </span>
                              </TaskEditModalButton>
                              <span
                                className={[
                                  "shrink-0 rounded-full border px-2 py-0.5 text-xs",
                                  "border-teal-200 bg-teal-50 text-teal-700"
                                ].join(" ")}
                              >
                                {TASK_TYPE_LABELS[task.type as TaskType]}
                              </span>
                              {task.jobApplication ? (
                                <span className="shrink-0 text-xs text-slate-400">
                                  {task.jobApplication.companyName}
                                </span>
                              ) : null}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-center text-sm text-slate-400">
                          暂无待办
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <TaskCreateModalButton
                        applications={applications}
                        defaultDueAt={group.key}
                        variant="link"
                      />
                    </div>
                  </section>
                ))}
              </div>
            </section>
          ) : null}
        </section>
      )}
    </AppShell>
  );
}
