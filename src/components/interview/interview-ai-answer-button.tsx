"use client";

import { useActionState, useEffect, useState, type MouseEvent } from "react";
import { createPortal } from "react-dom";
import type { InterviewReview } from "@prisma/client";
import {
  generateInterviewAiAnswerAction,
  saveInterviewAiAnswerAction,
  type InterviewAiAnswerState
} from "@/features/interviews/actions";
import {
  AI_ANSWER_MODE_LABELS,
  AI_ANSWER_MODES,
  type AiAnswerMode
} from "@/features/interviews/constants";

type Props = {
  review: InterviewReview;
};

export function InterviewAiAnswerButton({ review }: Props) {
  const [open, setOpen] = useState(false);

  function openModal(event: MouseEvent<HTMLButtonElement>) {
    event.stopPropagation();
    setOpen(true);
  }

  return (
    <>
      <button
        type="button"
        onClick={openModal}
        className="h-8 rounded-md border border-teal-200 px-3 text-xs font-semibold text-teal-700 hover:bg-teal-50"
      >
        {review.aiAnswer ? "查看 AI 解答" : "AI 解答"}
      </button>

      {open
        ? createPortal(
            <InterviewAiAnswerModal
              review={review}
              onClose={() => setOpen(false)}
            />,
            document.body
          )
        : null}
    </>
  );
}

function InterviewAiAnswerModal({
  onClose,
  review
}: {
  onClose: () => void;
  review: InterviewReview;
}) {
  const initialMode = (review.aiAnswerMode as AiAnswerMode | null) ?? "FAST";
  const [mode, setMode] = useState<AiAnswerMode>(initialMode);
  const [answer, setAnswer] = useState(review.aiAnswer ?? "");
  const [generateState, generateAction] = useActionState<
    InterviewAiAnswerState,
    FormData
  >(generateInterviewAiAnswerAction.bind(null, review.id), { ok: false });
  const [saveState, saveAction] = useActionState<
    InterviewAiAnswerState,
    FormData
  >(saveInterviewAiAnswerAction.bind(null, review.id), { ok: false });

  useEffect(() => {
    if (generateState.answer) setAnswer(generateState.answer);
  }, [generateState.answer]);

  const message = saveState.message ?? generateState.message;
  const hasQuestions = Boolean(review.questions?.trim());

  return (
    <div
      aria-modal="true"
      role="dialog"
      className="fixed inset-0 z-[110] flex items-center justify-center overflow-hidden bg-slate-950/40 p-3 backdrop-blur-sm sm:p-5"
    >
      <button
        type="button"
        aria-label="关闭 AI 解答弹窗"
        className="fixed inset-0 cursor-default"
        onClick={onClose}
      />
      <section className="relative flex max-h-[calc(100vh-1.5rem)] w-full max-w-3xl flex-col overflow-hidden rounded-lg border border-slate-200 bg-white shadow-2xl">
        <header className="flex shrink-0 items-center justify-between border-b border-slate-200 px-4 py-3">
          <h2 className="font-semibold text-slate-950">AI 参考答案</h2>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-md border border-slate-300 text-slate-500 hover:bg-slate-100"
            aria-label="关闭"
          >
            ×
          </button>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto p-4">
          <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
            <p className="text-sm font-medium text-slate-700">面试问题记录</p>
            <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-600">
              {review.questions?.trim() || "还没有填写面试问题记录。"}
            </p>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {AI_ANSWER_MODES.map((item) => (
              <label
                key={item}
                className="flex h-9 items-center gap-2 rounded-md border border-slate-300 px-3 text-sm"
              >
                <input
                  type="radio"
                  name="visibleMode"
                  checked={mode === item}
                  onChange={() => setMode(item)}
                />
                {AI_ANSWER_MODE_LABELS[item]}
              </label>
            ))}
          </div>

          <form action={generateAction} className="mt-4">
            <input type="hidden" name="mode" value={mode} />
            <button
              disabled={!hasQuestions}
              className="h-10 rounded-md bg-teal-700 px-4 text-sm font-semibold text-white hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-60"
              onClick={(event) => {
                if (
                  answer &&
                  !confirm("重新生成会覆盖当前 AI 参考答案，确定继续吗？")
                ) {
                  event.preventDefault();
                }
              }}
            >
              {answer ? "重新生成" : "生成答案"}
            </button>
          </form>

          <form action={saveAction} className="mt-4 space-y-3">
            <input type="hidden" name="mode" value={mode} />
            <label className="block">
              <span className="text-sm font-medium text-slate-700">
                AI 参考答案
              </span>
              <textarea
                name="answer"
                value={answer}
                onChange={(event) => setAnswer(event.target.value)}
                rows={12}
                className="mt-1 min-h-72 w-full resize-y rounded-md border border-slate-300 px-3 py-2 text-sm leading-6 focus-ring"
                placeholder="生成后可在这里手动修改。"
              />
            </label>

            {message ? (
              <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
                {message}
              </div>
            ) : null}

            <div className="flex justify-end gap-3 border-t border-slate-200 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="h-10 rounded-md border border-slate-300 px-4 text-sm font-medium hover:bg-slate-100"
              >
                关闭
              </button>
              <button className="h-10 rounded-md bg-teal-700 px-4 text-sm font-semibold text-white hover:bg-teal-800">
                保存
              </button>
            </div>
          </form>
        </div>
      </section>
    </div>
  );
}
