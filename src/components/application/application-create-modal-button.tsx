"use client";

import { useActionState, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import type { Resume } from "@prisma/client";
import {
  createApplicationInPlaceAction,
  type CreateApplicationFormState
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

type ApplicationCreateModalButtonProps = {
  defaultStatus: ApplicationStatus;
  resumes: Array<Pick<Resume, "id" | "name">>;
  trigger: "primary" | "icon";
};

export function ApplicationCreateModalButton({
  defaultStatus,
  resumes,
  trigger
}: ApplicationCreateModalButtonProps) {
  const [open, setOpen] = useState(false);
  const [modalKey, setModalKey] = useState(0);
  const statusLabel = STATUS_LABELS[defaultStatus];

  function openModal() {
    setModalKey((key) => key + 1);
    setOpen(true);
  }

  return (
    <>
      <button
        type="button"
        onClick={openModal}
        className={
          trigger === "primary"
            ? "h-9 rounded-md bg-teal-700 px-3 text-sm font-semibold text-white hover:bg-teal-800"
            : "flex h-7 w-7 items-center justify-center rounded-md border border-slate-300 bg-white text-base leading-none text-slate-600 hover:border-teal-300 hover:bg-teal-50 hover:text-teal-700"
        }
        aria-label={`在${statusLabel}中新增岗位`}
        title={`在${statusLabel}中新增岗位`}
      >
        {trigger === "primary" ? "新增岗位" : "+"}
      </button>

      {open ? (
        createPortal(
          <ApplicationCreateModal
            key={modalKey}
            defaultStatus={defaultStatus}
            resumes={resumes}
            onClose={() => setOpen(false)}
          />,
          document.body
        )
      ) : null}
    </>
  );
}

function ApplicationCreateModal({
  defaultStatus,
  resumes,
  onClose
}: {
  defaultStatus: ApplicationStatus;
  resumes: Array<Pick<Resume, "id" | "name">>;
  onClose: () => void;
}) {
  const initialState: CreateApplicationFormState = { ok: false };
  const [state, formAction, pending] = useActionState(
    createApplicationInPlaceAction,
    initialState
  );
  const statusLabel = STATUS_LABELS[defaultStatus];

  useEffect(() => {
    if (state.ok) onClose();
  }, [onClose, state.ok]);

  return (
    <div
      aria-modal="true"
      role="dialog"
      className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden bg-slate-950/40 p-3 backdrop-blur-sm sm:p-5"
    >
      <button
        type="button"
        aria-label="关闭新增岗位"
        className="fixed inset-0 cursor-default"
        onClick={onClose}
      />
      <section className="relative flex max-h-[calc(100vh-1.5rem)] w-full max-w-2xl flex-col overflow-hidden rounded-lg border border-slate-200 bg-white shadow-2xl sm:max-h-[calc(100vh-2.5rem)]">
        <header className="shrink-0 flex items-start justify-between gap-4 border-b border-slate-200 px-4 py-3">
          <div>
            <p className="text-sm font-medium text-teal-700">
              新增到：{statusLabel}
            </p>
            <h2 className="mt-1 text-lg font-semibold text-slate-950">
              新增岗位
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-slate-300 text-lg leading-none text-slate-500 hover:bg-slate-100"
            aria-label="关闭"
          >
            ×
          </button>
        </header>

        <form action={formAction} className="flex min-h-0 flex-1 flex-col p-4">
          <div className="grid min-h-0 gap-3 overflow-y-auto pr-1 md:grid-cols-2">
            <label className="block">
              <span className="text-sm font-medium text-slate-700">
                公司名 *
              </span>
              <input
                name="companyName"
                required
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
                className="mt-1 h-9 w-full rounded-md border border-slate-300 px-3 focus-ring"
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-slate-700">
                当前状态
              </span>
              <select
                name="status"
                defaultValue={defaultStatus}
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
                优先级
              </span>
              <select
                name="priority"
                defaultValue="MEDIUM"
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
              <span className="text-sm font-medium text-slate-700">
                结束原因
              </span>
              <select
                name="endReason"
                defaultValue=""
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
              <span className="text-sm font-medium text-slate-700">城市</span>
              <input
                name="city"
                className="mt-1 h-9 w-full rounded-md border border-slate-300 px-3 focus-ring"
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-slate-700">
                薪资范围
              </span>
              <input
                name="salaryRange"
                className="mt-1 h-9 w-full rounded-md border border-slate-300 px-3 focus-ring"
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-slate-700">
                JD 链接
              </span>
              <input
                name="jobUrl"
                type="url"
                className="mt-1 h-9 w-full rounded-md border border-slate-300 px-3 focus-ring"
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-slate-700">
                投递渠道
              </span>
              <select
                name="source"
                className="mt-1 h-9 w-full rounded-md border border-slate-300 px-3 focus-ring"
                defaultValue=""
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
                关联简历
              </span>
              <select
                name="resumeId"
                defaultValue=""
                className="mt-1 h-10 w-full rounded-md border border-slate-300 px-3 focus-ring"
              >
                <option value="">暂不关联</option>
                {resumes.map((resume) => (
                  <option key={resume.id} value={resume.id}>
                    {resume.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="block md:col-span-2">
              <span className="text-sm font-medium text-slate-700">JD 内容</span>
              <textarea
                name="jdContent"
                rows={5}
                className="mt-1 max-h-56 min-h-28 w-full resize-y rounded-md border border-slate-300 px-3 py-2 [field-sizing:content] focus-ring"
              />
            </label>
            <label className="block md:col-span-2">
              <span className="text-sm font-medium text-slate-700">备注</span>
              <textarea
                name="notes"
                rows={1}
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 focus-ring"
              />
            </label>
          </div>
          {state.message ? (
            <div className="mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {state.message}
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
              className="h-10 rounded-md bg-teal-700 px-4 text-sm font-semibold text-white hover:bg-teal-800 disabled:cursor-not-allowed disabled:bg-slate-400"
            >
              {pending ? "创建中..." : "创建岗位"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
