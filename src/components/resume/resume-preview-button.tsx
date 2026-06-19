"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import { Download, Eye, FileText, X } from "lucide-react";

type ResumePreviewButtonProps = {
  resumeId: string;
  name: string;
  fileType: string;
};

export function ResumePreviewButton({
  resumeId,
  name,
  fileType
}: ResumePreviewButtonProps) {
  const [open, setOpen] = useState(false);
  const fileUrl = `/api/resumes/${resumeId}/file`;
  const isPdf = fileType === "PDF";

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex h-9 items-center gap-2 rounded-md border border-slate-300 px-3 text-sm font-medium hover:bg-slate-100"
      >
        <Eye className="h-4 w-4" aria-hidden="true" />
        预览
      </button>

      {open
        ? createPortal(
            <div
              aria-modal="true"
              role="dialog"
              className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden bg-slate-950/40 p-3 backdrop-blur-sm sm:p-5"
            >
              <button
                type="button"
                aria-label="关闭简历预览"
                className="fixed inset-0 cursor-default"
                onClick={() => setOpen(false)}
              />
              <section className="relative flex h-[min(860px,calc(100vh-1.5rem))] w-full max-w-5xl flex-col overflow-hidden rounded-lg border border-slate-200 bg-white shadow-2xl sm:h-[min(860px,calc(100vh-2.5rem))]">
                <header className="flex shrink-0 items-start justify-between gap-4 border-b border-slate-200 px-4 py-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-teal-700">
                      {fileType} 预览
                    </p>
                    <h2 className="mt-1 truncate text-lg font-semibold text-slate-950">
                      {name}
                    </h2>
                  </div>
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-slate-300 text-slate-500 hover:bg-slate-100"
                    aria-label="关闭"
                  >
                    <X className="h-4 w-4" aria-hidden="true" />
                  </button>
                </header>

                <div className="min-h-0 flex-1 bg-slate-100">
                  {isPdf ? (
                    <iframe
                      src={fileUrl}
                      title={name}
                      className="h-full w-full border-0 bg-white"
                    />
                  ) : (
                    <div className="flex h-full flex-col items-center justify-center p-6 text-center">
                      <div className="flex h-16 w-16 items-center justify-center rounded-md border border-teal-200 bg-teal-50 text-teal-700">
                        <FileText className="h-8 w-8" aria-hidden="true" />
                      </div>
                      <h3 className="mt-4 text-base font-semibold text-slate-950">
                        当前文件无法直接嵌入预览
                      </h3>
                      <p className="mt-2 max-w-md text-sm text-slate-500">
                        DOC/DOCX 文件需要本地 Office 或浏览器插件打开，可先下载查看。
                      </p>
                      <a
                        href={`${fileUrl}?download=1`}
                        className="mt-5 inline-flex h-10 items-center gap-2 rounded-md bg-teal-700 px-4 text-sm font-semibold text-white hover:bg-teal-800"
                      >
                        <Download className="h-4 w-4" aria-hidden="true" />
                        下载文件
                      </a>
                    </div>
                  )}
                </div>
              </section>
            </div>,
            document.body
          )
        : null}
    </>
  );
}
