import { AppShell } from "@/components/layout/app-shell";
import { ResumeCard } from "@/components/resume/resume-card";
import { ResumeUploadButton } from "@/components/resume/resume-upload-button";
import { requireUser } from "@/features/auth/session";
import { listResumes } from "@/features/resumes/queries";

function getResumeFileType(fileName: string) {
  const extension = fileName.split(".").pop()?.toUpperCase();
  if (extension === "PDF" || extension === "DOC" || extension === "DOCX") {
    return extension;
  }
  return "FILE";
}

export default async function ResumesPage() {
  const user = await requireUser();
  const resumes = await listResumes(user.id);

  return (
    <AppShell
      username={user.username}
      title="简历仓"
      description="集中管理简历版本、适用方向、语言类型和岗位关联。"
      action={<ResumeUploadButton />}
    >
      <section className="grid gap-6 xl:grid-cols-2">
        {resumes.length === 0 ? (
          <div className="rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500 xl:col-span-2">
            还没有上传简历
          </div>
        ) : (
          resumes.map((resume) => {
            const fileType = getResumeFileType(resume.fileName);

            return (
              <ResumeCard
                key={resume.id}
                resume={{
                  id: resume.id,
                  name: resume.name,
                  version: resume.version,
                  targetRole: resume.targetRole,
                  language: resume.language,
                  tags: resume.tags,
                  fileName: resume.fileName,
                  fileType
                }}
              />
            );
          })
        )}
      </section>
    </AppShell>
  );
}
