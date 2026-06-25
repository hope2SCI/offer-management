import Link from "next/link";
import type {
  ApplicationActivity,
  InterviewReview,
  JobApplication,
  Resume,
  Task
} from "@prisma/client";
import { Badge } from "@/components/ui/badge";
import { InterviewReviewList } from "@/components/interview/interview-review-list";
import { InterviewReviewModalButton } from "@/components/interview/interview-review-modal-button";
import { TaskList } from "@/components/task/task-list";
import {
  deleteApplicationAction,
  updateApplicationInModalAction
} from "@/features/applications/actions";
import {
  APPLICATION_STATUSES,
  APPLICATION_SOURCES,
  END_REASONS,
  END_REASON_LABELS,
  PRIORITIES,
  PRIORITY_LABELS,
  STATUS_LABELS,
  type ApplicationStatus,
  type EndReason,
  type Priority
} from "@/features/applications/constants";
import { createTaskAction } from "@/features/tasks/actions";
import {
  TASK_TYPES,
  TASK_TYPE_LABELS,
  type TaskType
} from "@/features/tasks/constants";
import { formatDateTime } from "@/lib/date";

type ApplicationDetailModalProps = {
  application: JobApplication & {
    resume: Resume | null;
    tasks: Task[];
    activities: ApplicationActivity[];
    interviewReviews: InterviewReview[];
  };
  resumes: Array<Pick<Resume, "id" | "name" | "version">>;
  closeHref: string;
};

export function ApplicationDetailModal({
  application,
  resumes,
  closeHref
}: ApplicationDetailModalProps) {
  const editFormId = `application-edit-${application.id}`;
  const applicationOption = {
    id: application.id,
    companyName: application.companyName,
    jobTitle: application.jobTitle
  };

  return (
    <div
      aria-modal="true"
      role="dialog"
      className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-slate-950/40 p-3 backdrop-blur-sm sm:p-5"
    >
      <Link
        href={closeHref}
        aria-label="关闭岗位详情"
        className="fixed inset-0 cursor-default"
      />
      <section className="relative flex max-h-[calc(100vh-1.5rem)] w-full max-w-4xl flex-col overflow-hidden rounded-lg border border-slate-200 bg-white shadow-2xl sm:max-h-[calc(100vh-2.5rem)]">
        <header className="shrink-0 flex items-start justify-between gap-4 border-b border-slate-200 px-4 py-3">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <Badge className="border-teal-200 bg-teal-50 text-teal-700">
                {STATUS_LABELS[application.status as ApplicationStatus]}
              </Badge>
              <Badge className="border-amber-200 bg-amber-50 text-amber-700">
                优先级：{PRIORITY_LABELS[application.priority as Priority]}
              </Badge>
              {application.endReason ? (
                <Badge className="border-slate-200 bg-slate-50 text-slate-600">
                  {END_REASON_LABELS[application.endReason as EndReason]}
                </Badge>
              ) : null}
            </div>
            <h2 className="mt-2 truncate text-lg font-semibold text-slate-950">
              {application.companyName} · {application.jobTitle}
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              最近更新：{formatDateTime(application.updatedAt)}
            </p>
          </div>
          <Link
            href={closeHref}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-slate-300 text-lg leading-none text-slate-500 hover:bg-slate-100"
            aria-label="关闭"
          >
            ×
          </Link>
        </header>

        <div className="grid min-h-0 flex-1 gap-0 overflow-hidden lg:grid-cols-[1fr_260px]">
          <main className="min-w-0 overflow-y-auto border-r border-slate-200 p-4">
            <form
              id={editFormId}
              action={updateApplicationInModalAction.bind(null, application.id)}
              className="grid gap-3 md:grid-cols-2"
            >
              <input type="hidden" name="redirectTo" value={closeHref} />
              <label className="block">
                <span className="text-sm font-medium text-slate-700">
                  公司名 *
                </span>
                <input
                  name="companyName"
                  required
                  defaultValue={application.companyName}
                  className="mt-1 h-9 w-full rounded-md border border-slate-300 px-3 focus-ring"
                />
              </label>
              <label className="block">
                <span className="text-sm font-medium text-slate-700">
                  岗位名 *
                </span>
                <input
                  name="jobTitle"
                  required
                  defaultValue={application.jobTitle}
                  className="mt-1 h-9 w-full rounded-md border border-slate-300 px-3 focus-ring"
                />
              </label>
              <label className="block">
                <span className="text-sm font-medium text-slate-700">状态</span>
                <select
                  name="status"
                  defaultValue={application.status}
                  className="mt-1 h-9 w-full rounded-md border border-slate-300 px-3 focus-ring"
                >
                  {APPLICATION_STATUSES.map((status) => (
                    <option key={status} value={status}>
                      {STATUS_LABELS[status as ApplicationStatus]}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="text-sm font-medium text-slate-700">
                  结束原因
                </span>
                <select
                  name="endReason"
                  defaultValue={application.endReason ?? ""}
                  className="mt-1 h-9 w-full rounded-md border border-slate-300 px-3 focus-ring"
                >
                  <option value="">未结束</option>
                  {END_REASONS.map((reason) => (
                    <option key={reason} value={reason}>
                      {END_REASON_LABELS[reason as EndReason]}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="text-sm font-medium text-slate-700">
                  优先级
                </span>
                <select
                  name="priority"
                  defaultValue={application.priority}
                  className="mt-1 h-9 w-full rounded-md border border-slate-300 px-3 focus-ring"
                >
                  {PRIORITIES.map((priority) => (
                    <option key={priority} value={priority}>
                      {PRIORITY_LABELS[priority as Priority]}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="text-sm font-medium text-slate-700">城市</span>
                <input
                  name="city"
                  defaultValue={application.city ?? ""}
                  className="mt-1 h-9 w-full rounded-md border border-slate-300 px-3 focus-ring"
                />
              </label>
              <label className="block">
                <span className="text-sm font-medium text-slate-700">
                  薪资范围
                </span>
                <input
                  name="salaryRange"
                  defaultValue={application.salaryRange ?? ""}
                  className="mt-1 h-9 w-full rounded-md border border-slate-300 px-3 focus-ring"
                />
              </label>
              <label className="block">
                <span className="text-sm font-medium text-slate-700">
                  投递渠道
                </span>
                <select
                  name="source"
                  defaultValue={application.source ?? ""}
                  className="mt-1 h-9 w-full rounded-md border border-slate-300 px-3 focus-ring"
                >
                  <option value="">暂不选择</option>
                  {APPLICATION_SOURCES.map((source) => (
                    <option key={source} value={source}>
                      {source}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block md:col-span-2">
                <span className="text-sm font-medium text-slate-700">
                  JD 链接
                </span>
                <input
                  name="jobUrl"
                  type="url"
                  defaultValue={application.jobUrl ?? ""}
                  className="mt-1 h-9 w-full rounded-md border border-slate-300 px-3 focus-ring"
                />
              </label>
              <label className="block md:col-span-2">
                <span className="text-sm font-medium text-slate-700">
                  关联简历
                </span>
                <select
                  name="resumeId"
                  defaultValue={application.resumeId ?? ""}
                  className="mt-1 h-9 w-full rounded-md border border-slate-300 px-3 focus-ring"
                >
                  <option value="">暂不关联</option>
                  {resumes.map((resume) => (
                    <option key={resume.id} value={resume.id}>
                      {resume.name} · {resume.version}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block md:col-span-2">
                <span className="text-sm font-medium text-slate-700">
                  JD 内容
                </span>
                <textarea
                  name="jdContent"
                  rows={8}
                  defaultValue={application.jdContent ?? ""}
                  className="mt-1 max-h-72 min-h-32 w-full resize-y rounded-md border border-slate-300 px-3 py-2 [field-sizing:content] focus-ring"
                />
              </label>
              <label className="block md:col-span-2">
                <span className="text-sm font-medium text-slate-700">备注</span>
                <textarea
                  name="notes"
                  rows={1}
                  defaultValue={application.notes ?? ""}
                  className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 focus-ring"
                />
              </label>
            </form>

            <details className="mt-4 rounded-lg border border-slate-200 bg-slate-50">
              <summary className="cursor-pointer px-3 py-2 text-sm font-semibold text-slate-800">
                待办与活动
              </summary>
              <div className="grid gap-4 border-t border-slate-200 p-3 xl:grid-cols-2">
                <section>
                  <h3 className="mb-2 text-sm font-semibold text-slate-950">
                    岗位待办
                  </h3>
                  <TaskList
                    tasks={application.tasks}
                    emptyText="这个岗位暂无待办"
                  />
                </section>
                <section>
                  <h3 className="text-sm font-semibold text-slate-950">
                    活动时间线
                  </h3>
                  <div className="mt-3 max-h-56 space-y-3 overflow-y-auto pr-1">
                    {application.activities.length === 0 ? (
                      <p className="text-sm text-slate-500">暂无活动记录</p>
                    ) : (
                      application.activities.map((activity) => (
                        <div
                          key={activity.id}
                          className="border-l-2 border-teal-200 pl-3"
                        >
                          <p className="text-sm font-medium text-slate-900">
                            {activity.content ?? activity.type}
                          </p>
                          <p className="mt-1 text-xs text-slate-500">
                            {activity.fromStatus
                              ? `${STATUS_LABELS[activity.fromStatus as ApplicationStatus]} -> ${
                                  STATUS_LABELS[
                                    activity.toStatus as ApplicationStatus
                                  ]
                                }`
                              : activity.toStatus
                                ? STATUS_LABELS[
                                    activity.toStatus as ApplicationStatus
                                  ]
                                : "记录"}
                            {" · "}
                            {formatDateTime(activity.createdAt)}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                </section>
              </div>
            </details>

          </main>

          <aside className="space-y-3 overflow-y-auto bg-slate-50 p-4">
            <section className="rounded-lg border border-slate-200 bg-white p-3">
              <h3 className="font-semibold text-slate-950">关联简历</h3>
              {application.resume ? (
                <div className="mt-3 text-sm text-slate-600">
                  <p className="font-medium text-slate-950">
                    {application.resume.name} · {application.resume.version}
                  </p>
                  <Link
                    href={`/api/resumes/${application.resume.id}/file`}
                    target="_blank"
                    className="mt-3 inline-flex h-9 items-center rounded-md border border-slate-300 px-3 text-sm font-medium hover:bg-slate-100"
                  >
                    预览 PDF
                  </Link>
                </div>
              ) : (
                <p className="mt-3 text-sm text-slate-500">尚未关联简历</p>
              )}
            </section>

            <details className="rounded-lg border border-slate-200 bg-white">
              <summary className="cursor-pointer px-3 py-2 text-sm font-semibold text-slate-950">
                新增待办
              </summary>
              <form action={createTaskAction} className="space-y-2 border-t border-slate-200 p-3">
                <input
                  type="hidden"
                  name="jobApplicationId"
                  value={application.id}
                />
                <input
                  name="title"
                  required
                  placeholder="待办标题"
                  className="h-9 w-full rounded-md border border-slate-300 px-3 focus-ring"
                />
                <select
                  name="type"
                  defaultValue="CUSTOM"
                  className="h-9 w-full rounded-md border border-slate-300 px-3 focus-ring"
                >
                  {TASK_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {TASK_TYPE_LABELS[type as TaskType]}
                    </option>
                  ))}
                </select>
                <input
                  name="dueAt"
                  type="date"
                  required
                  className="h-9 w-full rounded-md border border-slate-300 px-3 focus-ring"
                />
                <textarea
                  name="description"
                  rows={2}
                  placeholder="备注"
                  className="w-full rounded-md border border-slate-300 px-3 py-2 focus-ring"
                />
                <button className="h-9 w-full rounded-md bg-teal-700 px-4 text-sm font-semibold text-white hover:bg-teal-800">
                  添加待办
                </button>
              </form>
            </details>

            <section className="rounded-lg border border-slate-200 bg-white p-3">
              <div className="flex items-center justify-between gap-3">
                <h3 className="font-semibold text-slate-950">面试复盘</h3>
                <InterviewReviewModalButton
                  applications={[applicationOption]}
                  defaultApplicationId={application.id}
                  variant="link"
                />
              </div>
              <div className="mt-3">
                <InterviewReviewList
                  applications={[applicationOption]}
                  reviews={application.interviewReviews.map((review) => ({
                    ...review,
                    jobApplication: applicationOption
                  }))}
                  emptyText="这个岗位还没有面试复盘"
                />
              </div>
            </section>
          </aside>
        </div>

        <footer className="flex shrink-0 items-center justify-between gap-3 border-t border-slate-200 bg-white px-4 py-3">
          <form action={deleteApplicationAction.bind(null, application.id)}>
            <button className="h-9 rounded-md border border-red-200 bg-white px-3 text-sm font-semibold text-red-700 hover:bg-red-50">
              删除岗位
            </button>
          </form>
          <button
            form={editFormId}
            className="h-9 rounded-md bg-teal-700 px-4 text-sm font-semibold text-white hover:bg-teal-800"
          >
            保存修改
          </button>
        </footer>
      </section>
    </div>
  );
}
