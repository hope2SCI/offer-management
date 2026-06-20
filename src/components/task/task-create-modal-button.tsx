"use client";

import { useActionState, useEffect, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import {
  createTaskInModalAction,
  type TaskFormState
} from "@/features/tasks/actions";
import {
  TASK_TYPES,
  TASK_TYPE_LABELS,
  type TaskType
} from "@/features/tasks/constants";

type TaskCreateModalButtonProps = {
  applications: Array<{ id: string; companyName: string; jobTitle: string }>;
  defaultDueAt?: string;
  label?: ReactNode;
  variant?: "primary" | "link" | "cell";
};

export function TaskCreateModalButton({
  applications,
  defaultDueAt,
  label,
  variant = "primary"
}: TaskCreateModalButtonProps) {
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
        className={
          variant === "link"
            ? "text-sm font-semibold text-violet-500 hover:text-violet-700"
            : variant === "cell"
              ? "absolute inset-0 z-10 h-full w-full cursor-pointer rounded-none text-transparent transition-colors hover:bg-teal-50/70 focus-visible:bg-teal-50/70"
            : "h-9 rounded-md bg-teal-700 px-3 text-sm font-semibold text-white hover:bg-teal-800"
        }
        aria-label="新建事项"
        title="新建事项"
      >
        {label ?? (variant === "link" ? "+ 添加" : "新建事项")}
      </button>

      {open
        ? createPortal(
            <TaskCreateModal
              key={modalKey}
              applications={applications}
              defaultDueAt={defaultDueAt}
              onClose={() => setOpen(false)}
            />,
            document.body
          )
        : null}
    </>
  );
}

function TaskCreateModal({
  applications,
  defaultDueAt,
  onClose
}: {
  applications: Array<{ id: string; companyName: string; jobTitle: string }>;
  defaultDueAt?: string;
  onClose: () => void;
}) {
  const [state, formAction] = useActionState<TaskFormState, FormData>(
    createTaskInModalAction,
    { ok: false }
  );

  useEffect(() => {
    if (state.ok) onClose();
  }, [onClose, state.ok]);

  return (
    <div
      aria-modal="true"
      role="dialog"
      className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/40 p-3 backdrop-blur-sm"
    >
      <button
        type="button"
        aria-label="关闭新建事项"
        className="fixed inset-0 cursor-default"
        onClick={onClose}
      />
      <section className="relative w-full max-w-xl rounded-lg border border-slate-200 bg-white shadow-2xl">
        <header className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
          <h2 className="font-semibold text-slate-950">新建事项</h2>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-md border border-slate-300 text-slate-500 hover:bg-slate-100"
            aria-label="关闭"
          >
            ×
          </button>
        </header>
        <form action={formAction} className="grid gap-3 p-4">
          <input
            name="title"
            required
            placeholder="事项标题"
            className="h-10 rounded-md border border-slate-300 px-3 focus-ring"
          />
          <div className="grid gap-3 sm:grid-cols-2">
            <select
              name="type"
              defaultValue="CUSTOM"
              className="h-10 rounded-md border border-slate-300 px-3 focus-ring"
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
              defaultValue={defaultDueAt}
              className="h-10 rounded-md border border-slate-300 px-3 focus-ring"
            />
          </div>
          <select
            name="jobApplicationId"
            defaultValue=""
            className="h-10 rounded-md border border-slate-300 px-3 focus-ring"
          >
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
            className="rounded-md border border-slate-300 px-3 py-2 focus-ring"
          />
          <div className="flex justify-end gap-3 border-t border-slate-200 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="h-10 rounded-md border border-slate-300 px-4 text-sm font-medium hover:bg-slate-100"
            >
              取消
            </button>
            <button className="h-10 rounded-md bg-teal-700 px-4 text-sm font-semibold text-white hover:bg-teal-800">
              创建
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
