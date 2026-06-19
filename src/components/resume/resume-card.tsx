"use client";

import Link from "next/link";
import {
  type FormEvent,
  useActionState,
  useEffect,
  useRef,
  useState
} from "react";
import { useRouter } from "next/navigation";
import { Download, FileText, Pencil, Save, Trash2, X } from "lucide-react";
import {
  deleteResumeAction,
  updateResumeInPlaceAction,
  type UpdateResumeFormState
} from "@/features/resumes/actions";
import {
  getResumeFileValidationError,
  RESUME_FILE_ACCEPT,
  RESUME_LANGUAGES
} from "@/features/resumes/validators";
import { ResumePreviewButton } from "./resume-preview-button";

type ResumeCardProps = {
  resume: {
    id: string;
    name: string;
    version: string;
    targetRole: string | null;
    language: string;
    tags: string | null;
    fileName: string;
    fileType: string;
  };
};

function splitTags(tags?: string | null) {
  return (tags ?? "")
    .split(/[，,]/)
    .map((tag) => tag.trim())
    .filter(Boolean);
}

export function ResumeCard({ resume }: ResumeCardProps) {
  const [editing, setEditing] = useState(false);
  const tags = splitTags(resume.tags);

  if (editing) {
    return <ResumeEditCard resume={resume} onCancel={() => setEditing(false)} />;
  }

  return (
    <article className="flex min-h-52 flex-col rounded-lg border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-1 gap-4 p-5">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-md border border-teal-200 bg-teal-50 text-teal-700">
          <FileText className="h-6 w-6" aria-hidden="true" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-md border border-teal-200 bg-teal-50 px-2 py-1 text-xs font-semibold text-teal-700">
              {resume.fileType}
            </span>
            <span className="rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-xs font-medium text-slate-600">
              {resume.version}
            </span>
          </div>
          <h2 className="mt-3 truncate font-semibold text-slate-950">
            {resume.name}
          </h2>
          <div className="mt-3 flex min-h-7 flex-wrap gap-2">
            {tags.length > 0 ? (
              tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-md border border-amber-200 bg-amber-50 px-2 py-1 text-xs font-medium text-amber-700"
                >
                  {tag}
                </span>
              ))
            ) : (
              <span className="text-sm text-slate-500">暂无标签</span>
            )}
          </div>
        </div>
      </div>
      <div className="flex flex-wrap justify-end gap-2 border-t border-slate-200 px-5 py-3">
        <ResumePreviewButton
          resumeId={resume.id}
          name={resume.name}
          fileType={resume.fileType}
        />
        <Link
          href={`/api/resumes/${resume.id}/file?download=1`}
          className="inline-flex h-9 items-center gap-2 rounded-md border border-slate-300 px-3 text-sm font-medium hover:bg-slate-100"
        >
          <Download className="h-4 w-4" aria-hidden="true" />
          下载
        </Link>
        <button
          type="button"
          onClick={() => setEditing(true)}
          className="inline-flex h-9 items-center gap-2 rounded-md border border-slate-300 px-3 text-sm font-medium hover:bg-slate-100"
        >
          <Pencil className="h-4 w-4" aria-hidden="true" />
          编辑
        </button>
        <form action={deleteResumeAction.bind(null, resume.id)}>
          <button className="inline-flex h-9 items-center gap-2 rounded-md border border-red-200 px-3 text-sm font-semibold text-red-700 hover:bg-red-50">
            <Trash2 className="h-4 w-4" aria-hidden="true" />
            删除
          </button>
        </form>
      </div>
    </article>
  );
}

function ResumeEditCard({
  resume,
  onCancel
}: {
  resume: ResumeCardProps["resume"];
  onCancel: () => void;
}) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFileName, setSelectedFileName] = useState("");
  const [clientError, setClientError] = useState<string>();
  const initialState: UpdateResumeFormState = { ok: false };
  const [state, formAction, pending] = useActionState(
    updateResumeInPlaceAction.bind(null, resume.id),
    initialState
  );

  useEffect(() => {
    if (!state.ok) return;
    router.refresh();
    onCancel();
  }, [onCancel, router, state.ok]);

  function handleFileChange() {
    const file = fileInputRef.current?.files?.[0];
    setSelectedFileName(file?.name ?? "");
    setClientError(
      file ? getResumeFileValidationError(file) ?? undefined : undefined
    );
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    const file = fileInputRef.current?.files?.[0];
    const error = file ? getResumeFileValidationError(file) : null;
    setClientError(error ?? undefined);
    if (error) event.preventDefault();
  }

  const errorMessage = clientError ?? state.message;

  return (
    <article className="rounded-lg border border-teal-200 bg-white shadow-sm">
      <form action={formAction} onSubmit={handleSubmit} className="p-5">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-medium text-teal-700">编辑简历</p>
            <h2 className="mt-1 font-semibold text-slate-950">{resume.name}</h2>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-slate-300 text-slate-500 hover:bg-slate-100"
            aria-label="取消编辑"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <label className="block">
            <span className="text-sm font-medium text-slate-700">简历名称</span>
            <input
              name="name"
              required
              defaultValue={resume.name}
              className="mt-1 h-10 w-full rounded-md border border-slate-300 px-3 focus-ring"
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-slate-700">版本</span>
            <input
              name="version"
              required
              defaultValue={resume.version}
              className="mt-1 h-10 w-full rounded-md border border-slate-300 px-3 focus-ring"
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-slate-700">
              适用岗位方向
            </span>
            <input
              name="targetRole"
              defaultValue={resume.targetRole ?? ""}
              className="mt-1 h-10 w-full rounded-md border border-slate-300 px-3 focus-ring"
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-slate-700">语言类型</span>
            <select
              name="language"
              defaultValue={resume.language}
              className="mt-1 h-10 w-full rounded-md border border-slate-300 px-3 focus-ring"
            >
              {RESUME_LANGUAGES.map((language) => (
                <option key={language} value={language}>
                  {language}
                </option>
              ))}
            </select>
          </label>
          <label className="block md:col-span-2">
            <span className="text-sm font-medium text-slate-700">标签</span>
            <input
              name="tags"
              defaultValue={resume.tags ?? ""}
              placeholder="输入标签，可用逗号分隔"
              className="mt-1 h-10 w-full rounded-md border border-slate-300 px-3 focus-ring"
            />
          </label>
          <label className="block md:col-span-2">
            <span className="text-sm font-medium text-slate-700">替换文件</span>
            <div className="mt-1 flex min-h-24 cursor-pointer flex-col items-center justify-center rounded-md border border-dashed border-slate-300 bg-slate-50 px-4 py-5 text-center hover:border-teal-300 hover:bg-teal-50/50">
              <FileText className="h-6 w-6 text-teal-700" aria-hidden="true" />
              <p className="mt-3 text-sm font-medium text-slate-700">
                {selectedFileName || `当前文件：${resume.fileName}`}
              </p>
              <input
                ref={fileInputRef}
                name="file"
                type="file"
                accept={RESUME_FILE_ACCEPT}
                onChange={handleFileChange}
                className="sr-only"
              />
              <p className="mt-2 text-xs text-slate-500">
                不选择新文件则保留当前文件；支持 PDF、DOC、DOCX，最大 10MB
              </p>
            </div>
          </label>
        </div>

        {errorMessage ? (
          <div className="mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {errorMessage}
          </div>
        ) : null}

        <div className="mt-4 flex justify-end gap-3 border-t border-slate-200 pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="h-10 rounded-md border border-slate-300 px-4 text-sm font-medium hover:bg-slate-100"
          >
            取消
          </button>
          <button
            disabled={pending}
            className="inline-flex h-10 items-center gap-2 rounded-md bg-teal-700 px-4 text-sm font-semibold text-white hover:bg-teal-800 disabled:cursor-not-allowed disabled:bg-slate-400"
          >
            <Save className="h-4 w-4" aria-hidden="true" />
            {pending ? "保存中..." : "保存修改"}
          </button>
        </div>
      </form>
    </article>
  );
}
