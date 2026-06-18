import { AppShell } from "@/components/layout/app-shell";
import { requireUser } from "@/features/auth/session";
import { createApplicationAction } from "@/features/applications/actions";
import {
  APPLICATION_STATUSES,
  APPLICATION_SOURCES,
  PRIORITIES,
  PRIORITY_LABELS,
  STATUS_LABELS,
  isApplicationStatus,
  type ApplicationStatus,
  type Priority
} from "@/features/applications/constants";
import { listResumeOptions } from "@/features/resumes/queries";

type NewApplicationPageProps = {
  searchParams: Promise<{ status?: string }>;
};

export default async function NewApplicationPage({
  searchParams
}: NewApplicationPageProps) {
  const user = await requireUser();
  const { status } = await searchParams;
  const defaultStatus = status && isApplicationStatus(status)
    ? status
    : "INTERESTED";
  const resumes = await listResumeOptions(user.id);

  return (
    <AppShell title="新增岗位" description="先记录必要信息，后续可以慢慢补全。">
      <form
        action={createApplicationAction}
        className="max-w-4xl rounded-lg border border-slate-200 bg-white p-6 shadow-sm"
      >
        <div className="grid gap-4 md:grid-cols-2">
          <label className="block">
            <span className="text-sm font-medium text-slate-700">公司名 *</span>
            <input name="companyName" required className="mt-1 h-10 w-full rounded-md border border-slate-300 px-3 focus-ring" />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-slate-700">岗位名 *</span>
            <input name="jobTitle" required className="mt-1 h-10 w-full rounded-md border border-slate-300 px-3 focus-ring" />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-slate-700">状态</span>
            <select name="status" defaultValue={defaultStatus} className="mt-1 h-10 w-full rounded-md border border-slate-300 px-3 focus-ring">
              {APPLICATION_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {STATUS_LABELS[status as ApplicationStatus]}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="text-sm font-medium text-slate-700">优先级</span>
            <select name="priority" defaultValue="MEDIUM" className="mt-1 h-10 w-full rounded-md border border-slate-300 px-3 focus-ring">
              {PRIORITIES.map((priority) => (
                <option key={priority} value={priority}>
                  {PRIORITY_LABELS[priority as Priority]}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="text-sm font-medium text-slate-700">城市</span>
            <input name="city" className="mt-1 h-10 w-full rounded-md border border-slate-300 px-3 focus-ring" />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-slate-700">薪资范围</span>
            <input name="salaryRange" className="mt-1 h-10 w-full rounded-md border border-slate-300 px-3 focus-ring" />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-slate-700">JD 链接</span>
            <input name="jobUrl" type="url" className="mt-1 h-10 w-full rounded-md border border-slate-300 px-3 focus-ring" />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-slate-700">投递渠道</span>
            <select name="source" defaultValue="" className="mt-1 h-10 w-full rounded-md border border-slate-300 px-3 focus-ring">
              <option value="">暂不选择</option>
              {APPLICATION_SOURCES.map((source) => (
                <option key={source} value={source}>{source}</option>
              ))}
            </select>
          </label>
          <label className="block md:col-span-2">
            <span className="text-sm font-medium text-slate-700">关联简历</span>
            <select name="resumeId" defaultValue="" className="mt-1 h-10 w-full rounded-md border border-slate-300 px-3 focus-ring">
              <option value="">暂不关联</option>
              {resumes.map((resume) => (
                <option key={resume.id} value={resume.id}>{resume.name}</option>
              ))}
            </select>
          </label>
          <label className="block md:col-span-2">
            <span className="text-sm font-medium text-slate-700">JD 内容</span>
            <textarea name="jdContent" rows={6} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 focus-ring" />
          </label>
          <label className="block md:col-span-2">
            <span className="text-sm font-medium text-slate-700">备注</span>
            <textarea name="notes" rows={4} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 focus-ring" />
          </label>
        </div>
        <div className="mt-6 flex justify-end">
          <button className="h-10 rounded-md bg-teal-700 px-4 text-sm font-semibold text-white hover:bg-teal-800">
            创建岗位
          </button>
        </div>
      </form>
    </AppShell>
  );
}
