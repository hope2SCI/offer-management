"use client";

import {
  useActionState,
  useEffect,
  useState,
  useTransition,
  type ReactNode
} from "react";
import { createPortal } from "react-dom";
import type { InterviewReview } from "@prisma/client";
import {
  createInterviewReviewInModalAction,
  deleteInterviewReviewAction,
  updateInterviewReviewInModalAction,
  type InterviewReviewFormState
} from "@/features/interviews/actions";
import {
  INTERVIEW_DIFFICULTIES,
  INTERVIEW_DIFFICULTY_LABELS,
  INTERVIEW_FEELINGS,
  INTERVIEW_FEELING_LABELS,
  INTERVIEW_ROUNDS,
  INTERVIEW_ROUND_LABELS
} from "@/features/interviews/constants";
import { dateTimeLocalValue } from "@/features/interviews/view";

type ApplicationOption = {
  id: string;
  companyName: string;
  jobTitle: string;
};

type Props = {
  applications: ApplicationOption[];
  children?: ReactNode;
  defaultApplicationId?: string;
  review?: InterviewReview;
  variant?: "primary" | "card" | "link";
};

export function InterviewReviewModalButton({
  applications,
  children,
  defaultApplicationId,
  review,
  variant = "primary"
}: Props) {
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
          variant === "card"
            ? "block w-full rounded-lg border border-slate-200 bg-white p-4 text-left shadow-sm hover:border-teal-300 hover:shadow-md"
            : variant === "link"
              ? "text-sm font-semibold text-teal-700 hover:text-teal-900"
              : "h-9 rounded-md bg-teal-700 px-3 text-sm font-semibold text-white hover:bg-teal-800"
        }
      >
        {children ?? (review ? "编辑复盘" : "新建复盘")}
      </button>

      {open
        ? createPortal(
            <InterviewReviewModal
              key={modalKey}
              applications={applications}
              defaultApplicationId={defaultApplicationId}
              onClose={() => setOpen(false)}
              review={review}
            />,
            document.body
          )
        : null}
    </>
  );
}

function InterviewReviewModal({
  applications,
  defaultApplicationId,
  onClose,
  review
}: {
  applications: ApplicationOption[];
  defaultApplicationId?: string;
  onClose: () => void;
  review?: InterviewReview;
}) {
  const [isDeleting, startDelete] = useTransition();
  const [state, formAction] = useActionState<InterviewReviewFormState, FormData>(
    review
      ? updateInterviewReviewInModalAction.bind(null, review.id)
      : createInterviewReviewInModalAction,
    { ok: false }
  );

  useEffect(() => {
    if (state.ok) onClose();
  }, [onClose, state.ok]);

  function deleteReview() {
    if (!review) return;
    startDelete(async () => {
      await deleteInterviewReviewAction(review.id);
      onClose();
    });
  }

  return (
    <div
      aria-modal="true"
      role="dialog"
      className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden bg-slate-950/40 p-3 backdrop-blur-sm sm:p-5"
    >
      <button
        type="button"
        aria-label="关闭面试复盘弹窗"
        className="fixed inset-0 cursor-default"
        onClick={onClose}
      />
      <section className="relative flex max-h-[calc(100vh-1.5rem)] w-full max-w-2xl flex-col overflow-hidden rounded-lg border border-slate-200 bg-white shadow-2xl sm:max-h-[calc(100vh-2.5rem)]">
        <header className="flex shrink-0 items-center justify-between border-b border-slate-200 px-4 py-3">
          <h2 className="font-semibold text-slate-950">
            {review ? "编辑面试复盘" : "新建面试复盘"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-md border border-slate-300 text-slate-500 hover:bg-slate-100"
            aria-label="关闭"
          >
            ×
          </button>
        </header>

        <form action={formAction} className="flex min-h-0 flex-1 flex-col p-4">
          <div className="grid min-h-0 gap-3 overflow-y-auto pr-1 md:grid-cols-2">
            <label className="block md:col-span-2">
              <span className="text-sm font-medium text-slate-700">关联岗位 *</span>
              <select
                name="jobApplicationId"
                required
                defaultValue={review?.jobApplicationId ?? defaultApplicationId ?? ""}
                disabled={Boolean(defaultApplicationId)}
                className="mt-1 h-10 w-full rounded-md border border-slate-300 px-3 focus-ring disabled:bg-slate-100"
              >
                <option value="">请选择岗位</option>
                {applications.map((application) => (
                  <option key={application.id} value={application.id}>
                    {application.companyName} · {application.jobTitle}
                  </option>
                ))}
              </select>
              {defaultApplicationId ? (
                <input
                  type="hidden"
                  name="jobApplicationId"
                  value={defaultApplicationId}
                />
              ) : null}
            </label>

            <label className="block">
              <span className="text-sm font-medium text-slate-700">面试轮次 *</span>
              <select
                name="round"
                required
                defaultValue={review?.round ?? "FIRST_INTERVIEW"}
                className="mt-1 h-10 w-full rounded-md border border-slate-300 px-3 focus-ring"
              >
                {INTERVIEW_ROUNDS.map((round) => (
                  <option key={round} value={round}>
                    {INTERVIEW_ROUND_LABELS[round]}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="text-sm font-medium text-slate-700">开始时间 *</span>
              <input
                name="scheduledAt"
                type="datetime-local"
                required
                defaultValue={dateTimeLocalValue(review?.scheduledAt)}
                className="mt-1 h-10 w-full rounded-md border border-slate-300 px-3 focus-ring"
              />
            </label>

            <label className="block">
              <span className="text-sm font-medium text-slate-700">持续时长 *</span>
              <input
                name="durationMinutes"
                type="number"
                min={1}
                required
                defaultValue={review?.durationMinutes ?? 60}
                className="mt-1 h-10 w-full rounded-md border border-slate-300 px-3 focus-ring"
              />
            </label>

            <label className="block">
              <span className="text-sm font-medium text-slate-700">整体评价 *</span>
              <input
                name="overallRating"
                type="number"
                min={1}
                max={5}
                required
                defaultValue={review?.overallRating ?? 3}
                className="mt-1 h-10 w-full rounded-md border border-slate-300 px-3 focus-ring"
              />
            </label>

            <label className="block">
              <span className="text-sm font-medium text-slate-700">面试难度 *</span>
              <select
                name="difficulty"
                required
                defaultValue={review?.difficulty ?? "MEDIUM"}
                className="mt-1 h-10 w-full rounded-md border border-slate-300 px-3 focus-ring"
              >
                {INTERVIEW_DIFFICULTIES.map((difficulty) => (
                  <option key={difficulty} value={difficulty}>
                    {INTERVIEW_DIFFICULTY_LABELS[difficulty]}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="text-sm font-medium text-slate-700">自我感受 *</span>
              <select
                name="feeling"
                required
                defaultValue={review?.feeling ?? "OK"}
                className="mt-1 h-10 w-full rounded-md border border-slate-300 px-3 focus-ring"
              >
                {INTERVIEW_FEELINGS.map((feeling) => (
                  <option key={feeling} value={feeling}>
                    {INTERVIEW_FEELING_LABELS[feeling]}
                  </option>
                ))}
              </select>
            </label>

            <label className="block md:col-span-2">
              <span className="text-sm font-medium text-slate-700">
                面试问题记录
              </span>
              <textarea
                name="questions"
                rows={6}
                defaultValue={review?.questions ?? ""}
                placeholder="只记录遇到的问题即可，可以一行一个问题。"
                className="mt-1 min-h-36 w-full resize-y rounded-md border border-slate-300 px-3 py-2 focus-ring"
              />
            </label>

            <label className="block md:col-span-2">
              <span className="text-sm font-medium text-slate-700">
                备注 / 总结
              </span>
              <textarea
                name="notes"
                rows={4}
                defaultValue={review?.notes ?? ""}
                className="mt-1 min-h-24 w-full resize-y rounded-md border border-slate-300 px-3 py-2 focus-ring"
              />
            </label>
          </div>

          {state.message ? (
            <div className="mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {state.message}
            </div>
          ) : null}

          <div className="mt-4 flex shrink-0 justify-between gap-3 border-t border-slate-200 pt-4">
            {review ? (
              <button
                type="button"
                onClick={deleteReview}
                disabled={isDeleting}
                className="h-10 rounded-md border border-red-200 px-4 text-sm font-semibold text-red-700 hover:bg-red-50 disabled:opacity-60"
              >
                删除
              </button>
            ) : (
              <span />
            )}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="h-10 rounded-md border border-slate-300 px-4 text-sm font-medium hover:bg-slate-100"
              >
                取消
              </button>
              <button className="h-10 rounded-md bg-teal-700 px-4 text-sm font-semibold text-white hover:bg-teal-800">
                {review ? "保存" : "创建"}
              </button>
            </div>
          </div>
        </form>
      </section>
    </div>
  );
}
