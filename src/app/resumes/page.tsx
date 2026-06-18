import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { requireUser } from "@/features/auth/session";
import { listResumes } from "@/features/resumes/queries";
import {
  deleteResumeAction,
  updateResumeAction,
  uploadResumeAction
} from "@/features/resumes/actions";
import { formatDateTime } from "@/lib/date";

export default async function ResumesPage() {
  const user = await requireUser();
  const resumes = await listResumes(user.id);

  return (
    <AppShell
      title="简历仓"
      description="上传 PDF 简历，记录方向标签，并关联到岗位。"
    >
      <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="font-semibold text-slate-950">上传 PDF</h2>
        <form action={uploadResumeAction} className="mt-4 grid gap-4 md:grid-cols-[1fr_1fr_auto]">
          <input
            name="name"
            placeholder="简历名称，可留空"
            className="h-10 rounded-md border border-slate-300 px-3 focus-ring"
          />
          <input
            name="file"
            type="file"
            accept="application/pdf,.pdf"
            required
            className="h-10 rounded-md border border-slate-300 px-3 py-2 text-sm focus-ring"
          />
          <button className="h-10 rounded-md bg-teal-700 px-4 text-sm font-semibold text-white hover:bg-teal-800">
            上传
          </button>
        </form>
      </section>

      <section className="mt-6 grid gap-6 xl:grid-cols-2">
        {resumes.length === 0 ? (
          <div className="rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500 xl:col-span-2">
            还没有上传简历
          </div>
        ) : (
          resumes.map((resume) => (
            <article
              key={resume.id}
              className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="flex flex-col gap-4 lg:flex-row">
                <iframe
                  src={`/api/resumes/${resume.id}/file`}
                  title={resume.name}
                  className="h-80 w-full rounded-md border border-slate-200 lg:w-56"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h2 className="font-semibold text-slate-950">{resume.name}</h2>
                      <p className="mt-1 text-sm text-slate-500">
                        {resume.fileName} · {(resume.fileSize / 1024).toFixed(1)} KB
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        更新：{formatDateTime(resume.updatedAt)}
                      </p>
                    </div>
                    <Link
                      href={`/api/resumes/${resume.id}/file`}
                      target="_blank"
                      className="h-9 shrink-0 rounded-md border border-slate-300 px-3 py-2 text-sm font-medium hover:bg-slate-100"
                    >
                      打开
                    </Link>
                  </div>

                  <form action={updateResumeAction.bind(null, resume.id)} className="mt-4 space-y-3">
                    <label className="block">
                      <span className="text-sm font-medium text-slate-700">名称</span>
                      <input name="name" defaultValue={resume.name} required className="mt-1 h-10 w-full rounded-md border border-slate-300 px-3 focus-ring" />
                    </label>
                    <label className="block">
                      <span className="text-sm font-medium text-slate-700">方向标签</span>
                      <input name="tags" defaultValue={resume.tags ?? ""} placeholder="前端、全栈、英文版" className="mt-1 h-10 w-full rounded-md border border-slate-300 px-3 focus-ring" />
                    </label>
                    <label className="block">
                      <span className="text-sm font-medium text-slate-700">备注</span>
                      <textarea name="notes" defaultValue={resume.notes ?? ""} rows={3} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 focus-ring" />
                    </label>
                    <button className="h-9 rounded-md bg-teal-700 px-3 text-sm font-semibold text-white hover:bg-teal-800">
                      保存
                    </button>
                  </form>

                  <div className="mt-4 border-t border-slate-200 pt-4">
                    <p className="text-sm font-medium text-slate-700">关联岗位</p>
                    {resume.applications.length === 0 ? (
                      <p className="mt-1 text-sm text-slate-500">暂无关联</p>
                    ) : (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {resume.applications.map((application) => (
                          <Link
                            key={application.id}
                            href={`/applications?applicationId=${application.id}`}
                            className="rounded-md border border-slate-200 px-2 py-1 text-xs text-slate-600 hover:bg-slate-50"
                          >
                            {application.companyName} · {application.jobTitle}
                          </Link>
                        ))}
                      </div>
                    )}
                    <form action={deleteResumeAction.bind(null, resume.id)} className="mt-4">
                      <button className="h-9 rounded-md border border-red-200 px-3 text-sm font-semibold text-red-700 hover:bg-red-50">
                        删除简历
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            </article>
          ))
        )}
      </section>
    </AppShell>
  );
}
