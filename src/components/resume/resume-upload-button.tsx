"use client";

import {
  type FormEvent,
  useActionState,
  useEffect,
  useRef,
  useState
} from "react";
import { useRouter } from "next/navigation";
import { createPortal } from "react-dom";
import { FileText, Upload, X } from "lucide-react";
import {
  uploadResumeAction,
  type UploadResumeFormState
} from "@/features/resumes/actions";
import {
  getResumeFileValidationError,
  RESUME_FILE_ACCEPT,
  RESUME_LANGUAGES
} from "@/features/resumes/validators";

export function ResumeUploadButton() {
  const [open, setOpen] = useState(false);
  const [modalKey, setModalKey] = useState(0);

  function openModal() {
    setModalKey((key) => key + 1);
    setOpen(true);
  }

  return (
    <>
      <button
        type="button"
        onClick={openModal}
        className="inline-flex h-9 items-center gap-2 rounded-md bg-teal-700 px-3 text-sm font-semibold text-white hover:bg-teal-800"
      >
        <Upload className="h-4 w-4" aria-hidden="true" />
        上传简历
      </button>

      {open
        ? createPortal(
            <ResumeUploadModal
              key={modalKey}
              onClose={() => setOpen(false)}
            />,
            document.body
          )
        : null}
    </>
  );
}

function ResumeUploadModal({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const nameInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [clientError, setClientError] = useState<string>();
  const [selectedFileName, setSelectedFileName] = useState("");
  const initialState: UploadResumeFormState = { ok: false };
  const [state, formAction, pending] = useActionState(
    uploadResumeAction,
    initialState
  );

  useEffect(() => {
    if (!state.ok) return;
    router.refresh();
    onClose();
  }, [onClose, router, state.ok]);

  function handleFileChange() {
    const file = fileInputRef.current?.files?.[0];
    setSelectedFileName(file?.name ?? "");
    setClientError(getResumeFileValidationError(file) ?? undefined);

    if (file && nameInputRef.current && !nameInputRef.current.value.trim()) {
      nameInputRef.current.value = file.name.replace(/\.(pdf|docx?)$/i, "");
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    const file = fileInputRef.current?.files?.[0];
    const error = getResumeFileValidationError(file);
    setClientError(error ?? undefined);
    if (error) event.preventDefault();
  }

  const errorMessage = clientError ?? state.message;

  return (
    <div
      aria-modal="true"
      role="dialog"
      className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden bg-slate-950/40 p-3 backdrop-blur-sm sm:p-5"
    >
      <button
        type="button"
        aria-label="关闭上传简历"
        className="fixed inset-0 cursor-default"
        onClick={onClose}
      />
      <section className="relative flex max-h-[calc(100vh-1.5rem)] w-full max-w-2xl flex-col overflow-hidden rounded-lg border border-slate-200 bg-white shadow-2xl sm:max-h-[calc(100vh-2.5rem)]">
        <header className="flex shrink-0 items-start justify-between gap-4 border-b border-slate-200 px-4 py-3">
          <div>
            <p className="text-sm font-medium text-teal-700">简历仓</p>
            <h2 className="mt-1 text-lg font-semibold text-slate-950">
              上传简历
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-slate-300 text-slate-500 hover:bg-slate-100"
            aria-label="关闭"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </header>

        <form
          action={formAction}
          onSubmit={handleSubmit}
          className="flex min-h-0 flex-1 flex-col p-4"
        >
          <div className="grid min-h-0 gap-3 overflow-y-auto pr-1 md:grid-cols-2">
            <label className="block">
              <span className="text-sm font-medium text-slate-700">
                简历名称
              </span>
              <input
                ref={nameInputRef}
                name="name"
                placeholder="可由上传文件自动填入"
                className="mt-1 h-10 w-full rounded-md border border-slate-300 px-3 focus-ring"
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-slate-700">版本</span>
              <input
                name="version"
                defaultValue="v1.0"
                required
                className="mt-1 h-10 w-full rounded-md border border-slate-300 px-3 focus-ring"
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-slate-700">
                适用岗位方向
              </span>
              <input
                name="targetRole"
                placeholder="前端、全栈、产品运营"
                className="mt-1 h-10 w-full rounded-md border border-slate-300 px-3 focus-ring"
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-slate-700">
                语言类型
              </span>
              <select
                name="language"
                defaultValue="中文"
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
                placeholder="输入标签，可用逗号分隔"
                className="mt-1 h-10 w-full rounded-md border border-slate-300 px-3 focus-ring"
              />
            </label>
            <label className="block md:col-span-2">
              <span className="text-sm font-medium text-slate-700">
                上传文件
              </span>
              <div className="mt-1 flex min-h-28 cursor-pointer flex-col items-center justify-center rounded-md border border-dashed border-slate-300 bg-slate-50 px-4 py-5 text-center hover:border-teal-300 hover:bg-teal-50/50">
                <FileText className="h-6 w-6 text-teal-700" aria-hidden="true" />
                <p className="mt-3 text-sm font-medium text-slate-700">
                  {selectedFileName || "点击此处选择简历文件"}
                </p>
                <input
                  ref={fileInputRef}
                  name="file"
                  type="file"
                  accept={RESUME_FILE_ACCEPT}
                  required
                  onChange={handleFileChange}
                  className="sr-only"
                />
                <p className="mt-2 text-xs text-slate-500">
                  支持 PDF、DOC、DOCX，文件大小不超过 10MB
                </p>
              </div>
            </label>
          </div>

          {errorMessage ? (
            <div className="mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {errorMessage}
            </div>
          ) : null}

          <div className="mt-4 flex shrink-0 justify-end gap-3 border-t border-slate-200 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="h-10 rounded-md border border-slate-300 px-4 text-sm font-medium hover:bg-slate-100"
            >
              取消
            </button>
            <button
              disabled={pending}
              className="inline-flex h-10 items-center gap-2 rounded-md bg-teal-700 px-4 text-sm font-semibold text-white hover:bg-teal-800 disabled:cursor-not-allowed disabled:bg-slate-400"
            >
              <Upload className="h-4 w-4" aria-hidden="true" />
              {pending ? "上传中..." : "上传简历"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
