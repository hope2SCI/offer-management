import { AppShell } from "@/components/layout/app-shell";
import { TaskList } from "@/components/task/task-list";
import { requireUser } from "@/features/auth/session";
import { listApplicationOptions } from "@/features/applications/queries";
import { createTaskAction } from "@/features/tasks/actions";
import { getTaskBuckets, listTasks } from "@/features/tasks/queries";
import { TASK_TYPES, TASK_TYPE_LABELS, type TaskType } from "@/features/tasks/constants";

export default async function TasksPage() {
  const user = await requireUser();
  const [applications, buckets, allTasks] = await Promise.all([
    listApplicationOptions(user.id),
    getTaskBuckets(user.id),
    listTasks(user.id)
  ]);

  return (
    <AppShell
      title="日程待办"
      description="管理今日待办、逾期待办和本周日程。"
    >
      <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="font-semibold text-slate-950">新增待办</h2>
        <form action={createTaskAction} className="mt-4 grid gap-4 lg:grid-cols-4">
          <input
            name="title"
            required
            placeholder="待办标题"
            className="h-10 rounded-md border border-slate-300 px-3 focus-ring"
          />
          <select name="type" defaultValue="CUSTOM" className="h-10 rounded-md border border-slate-300 px-3 focus-ring">
            {TASK_TYPES.map((type) => (
              <option key={type} value={type}>
                {TASK_TYPE_LABELS[type as TaskType]}
              </option>
            ))}
          </select>
          <input
            name="dueAt"
            type="datetime-local"
            required
            className="h-10 rounded-md border border-slate-300 px-3 focus-ring"
          />
          <select name="jobApplicationId" defaultValue="" className="h-10 rounded-md border border-slate-300 px-3 focus-ring">
            <option value="">不关联岗位</option>
            {applications.map((application) => (
              <option key={application.id} value={application.id}>
                {application.companyName} · {application.jobTitle}
              </option>
            ))}
          </select>
          <textarea
            name="description"
            rows={3}
            placeholder="备注"
            className="rounded-md border border-slate-300 px-3 py-2 focus-ring lg:col-span-4"
          />
          <div className="lg:col-span-4">
            <button className="h-10 rounded-md bg-teal-700 px-4 text-sm font-semibold text-white hover:bg-teal-800">
              创建待办
            </button>
          </div>
        </form>
      </section>

      <section className="mt-6 grid gap-6 xl:grid-cols-3">
        <div>
          <h2 className="mb-3 font-semibold text-slate-950">今日待办</h2>
          <TaskList tasks={buckets.today} emptyText="今天没有待办" />
        </div>
        <div>
          <h2 className="mb-3 font-semibold text-slate-950">逾期待办</h2>
          <TaskList tasks={buckets.overdue} emptyText="没有逾期待办" />
        </div>
        <div>
          <h2 className="mb-3 font-semibold text-slate-950">本周日程</h2>
          <TaskList tasks={buckets.week} emptyText="本周暂无日程" />
        </div>
      </section>

      <section className="mt-6">
        <h2 className="mb-3 font-semibold text-slate-950">全部待办</h2>
        <TaskList tasks={allTasks} emptyText="暂无待办" />
      </section>
    </AppShell>
  );
}
