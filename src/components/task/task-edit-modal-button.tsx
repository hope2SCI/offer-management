"use client";

import { useActionState, useEffect, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import {
  updateTaskInModalAction,
  type TaskFormState
} from "@/features/tasks/actions";
import {
  TASK_TYPES,
  TASK_TYPE_LABELS,
  type TaskType
} from "@/features/tasks/constants";
import { dateInputValue } from "@/features/tasks/view";

type EditableTask = {
  id: string;
  title: string;
  description?: string | null;
  type: string;
  dueAt: Date | string;
  jobApplicationId?: string | null;
};

type TaskEditModalButtonProps = {
  applications: Array<{ id: string; companyName: string; jobTitle: string }>;
  children: ReactNode;
  task: EditableTask;
};

export function TaskEditModalButton({
  applications,
  children,
  task
}: TaskEditModalButtonProps) {
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
        className="min-w-0 cursor-pointer truncate rounded px-1 text-left transition-colors hover:bg-teal-50 hover:text-teal-700"
        title="点击编辑"
      >
        {children}
      </button>

      {open
        ? createPortal(
            <TaskEditModal
              key={modalKey}
              applications={applications}
              onClose={() => setOpen(false)}
              task={task}
            />,
            document.body
          )
        : null}
    </>
  );
}

function TaskEditModal({
  applications,
  onClose,
  task
}: {
  applications: Array<{ id: string; companyName: string; jobTitle: string }>;
  onClose: () => void;
  task: EditableTask;
}) {
  const [state, formAction] = useActionState<TaskFormState, FormData>(
    updateTaskInModalAction.bind(null, task.id),
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
        aria-label="关闭编辑事项"
        className="fixed inset-0 cursor-default"
        onClick={onClose}
      />
      <section className="relative w-full max-w-xl rounded-lg border border-slate-200 bg-white shadow-2xl">
        <header className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
          <h2 className="font-semibold text-slate-950">编辑事项</h2>
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
            defaultValue={task.title}
            className="h-10 rounded-md border border-slate-300 px-3 focus-ring"
          />
          <div className="grid gap-3 sm:grid-cols-2">
            <select
              name="type"
              defaultValue={task.type}
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
              defaultValue={dateInputValue(task.dueAt)}
              className="h-10 rounded-md border border-slate-300 px-3 focus-ring"
            />
          </div>
          <select
            name="jobApplicationId"
            defaultValue={task.jobApplicationId ?? ""}
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
            defaultValue={task.description ?? ""}
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
              保存
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
