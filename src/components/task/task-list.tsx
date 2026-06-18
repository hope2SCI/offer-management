import type { JobApplication, Task } from "@prisma/client";
import { formatDateTime } from "@/lib/date";
import { TASK_TYPE_LABELS, type TaskType } from "@/features/tasks/constants";
import {
  completeTaskAction,
  deleteTaskAction,
  reopenTaskAction
} from "@/features/tasks/actions";
import { Badge } from "@/components/ui/badge";

type TaskListProps = {
  tasks: Array<Task & { jobApplication?: JobApplication | null }>;
  emptyText?: string;
};

export function TaskList({ tasks, emptyText = "暂无待办" }: TaskListProps) {
  if (tasks.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-slate-300 bg-white p-6 text-center text-sm text-slate-500">
        {emptyText}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {tasks.map((task) => {
        const type = task.type as TaskType;
        const toggleAction = task.completedAt
          ? reopenTaskAction.bind(null, task.id)
          : completeTaskAction.bind(null, task.id);
        return (
          <div
            key={task.id}
            className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
          >
            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-medium text-slate-950">{task.title}</h3>
                  <Badge className="border-teal-200 bg-teal-50 text-teal-700">
                    {TASK_TYPE_LABELS[type]}
                  </Badge>
                  {task.completedAt ? (
                    <Badge className="border-slate-200 bg-slate-50 text-slate-500">
                      已完成
                    </Badge>
                  ) : null}
                </div>
                <p className="mt-2 text-sm text-slate-500">
                  时间：{formatDateTime(task.dueAt)}
                </p>
                {task.jobApplication ? (
                  <p className="mt-1 text-sm text-slate-500">
                    岗位：{task.jobApplication.companyName} ·{" "}
                    {task.jobApplication.jobTitle}
                  </p>
                ) : null}
                {task.description ? (
                  <p className="mt-3 whitespace-pre-wrap text-sm text-slate-600">
                    {task.description}
                  </p>
                ) : null}
              </div>
              <div className="flex gap-2">
                <form action={toggleAction}>
                  <button className="h-9 rounded-md border border-slate-300 px-3 text-sm font-medium hover:bg-slate-100">
                    {task.completedAt ? "重开" : "完成"}
                  </button>
                </form>
                <form action={deleteTaskAction.bind(null, task.id)}>
                  <button className="h-9 rounded-md border border-red-200 px-3 text-sm font-medium text-red-700 hover:bg-red-50">
                    删除
                  </button>
                </form>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
