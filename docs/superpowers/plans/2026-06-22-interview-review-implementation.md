# Interview Review Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the first usable interview review workflow: record reviews from `/interviews` and application detail, search/filter them, and write one timeline activity when a review is created.

**Architecture:** Extend the existing `InterviewReview` Prisma model, add a focused `features/interviews` layer, and render simple card lists plus modal forms. Use Server Actions like the existing tasks/applications modules. No AI API, no charts, no question-card model.

**Tech Stack:** Next.js App Router, React 19, Prisma, SQLite, Zod, Tailwind CSS.

---

## File Map

- Modify `prisma/schema.prisma`: add the missing interview review fields.
- Create `src/features/interviews/constants.ts`: review enum values, labels, styles.
- Create `src/features/interviews/validators.ts`: Zod schema for create/update form data.
- Create `src/features/interviews/service.ts`: create/update/delete with ownership checks and create-time activity entry.
- Create `src/features/interviews/queries.ts`: list all reviews with filters.
- Create `src/features/interviews/actions.ts`: Server Actions and path revalidation.
- Create `src/features/interviews/view.ts`: date input helpers and question excerpt helper.
- Create `src/components/interview/interview-review-modal-button.tsx`: create/edit modal.
- Create `src/components/interview/interview-review-list.tsx`: card list and empty state.
- Modify `src/app/interviews/page.tsx`: replace placeholder with list/search/filter/new entry.
- Modify `src/components/application/application-detail-modal.tsx`: show real reviews and create button for the current application.

## Task 1: Data Model

**Files:**
- Modify: `prisma/schema.prisma`

- [ ] **Step 1: Add interview review fields**

Replace the current `InterviewReview` model with:

```prisma
model InterviewReview {
  id               String         @id @default(cuid())
  jobApplicationId String
  jobApplication   JobApplication @relation(fields: [jobApplicationId], references: [id], onDelete: Cascade)
  round            String
  scheduledAt      DateTime
  durationMinutes  Int
  overallRating    Int
  difficulty       String
  feeling          String
  questions        String?
  notes            String?
  createdAt        DateTime       @default(now())
  updatedAt        DateTime       @updatedAt

  @@index([jobApplicationId])
}
```

- [ ] **Step 2: Validate schema**

Run:

```powershell
npx prisma validate
```

Expected: Prisma reports the schema is valid.

- [ ] **Step 3: Push local SQLite schema and regenerate client**

Run:

```powershell
npx prisma db push
npx prisma generate
```

Expected: both commands exit 0.

- [ ] **Step 4: Typecheck**

Run:

```powershell
npx tsc --noEmit
```

Expected: existing code may fail because `InterviewReview` type consumers now expect new required fields. Continue to Task 2 and fix the feature surface.

## Task 2: Interview Feature Layer

**Files:**
- Create: `src/features/interviews/constants.ts`
- Create: `src/features/interviews/validators.ts`
- Create: `src/features/interviews/service.ts`
- Create: `src/features/interviews/queries.ts`
- Create: `src/features/interviews/actions.ts`
- Create: `src/features/interviews/view.ts`

- [ ] **Step 1: Create constants**

Create `src/features/interviews/constants.ts`:

```ts
export const INTERVIEW_ROUNDS = [
  "FIRST_INTERVIEW",
  "SECOND_INTERVIEW",
  "HR_INTERVIEW",
  "OTHER"
] as const;

export type InterviewRound = (typeof INTERVIEW_ROUNDS)[number];

export const INTERVIEW_ROUND_LABELS: Record<InterviewRound, string> = {
  FIRST_INTERVIEW: "一面",
  SECOND_INTERVIEW: "二面",
  HR_INTERVIEW: "HR 面",
  OTHER: "其他"
};

export const INTERVIEW_DIFFICULTIES = ["EASY", "MEDIUM", "HARD"] as const;

export type InterviewDifficulty = (typeof INTERVIEW_DIFFICULTIES)[number];

export const INTERVIEW_DIFFICULTY_LABELS: Record<InterviewDifficulty, string> = {
  EASY: "简单",
  MEDIUM: "中等",
  HARD: "困难"
};

export const INTERVIEW_DIFFICULTY_STYLES: Record<InterviewDifficulty, string> = {
  EASY: "border-emerald-200 bg-emerald-50 text-emerald-700",
  MEDIUM: "border-amber-200 bg-amber-50 text-amber-700",
  HARD: "border-red-200 bg-red-50 text-red-700"
};

export const INTERVIEW_FEELINGS = ["GOOD", "OK", "BAD"] as const;

export type InterviewFeeling = (typeof INTERVIEW_FEELINGS)[number];

export const INTERVIEW_FEELING_LABELS: Record<InterviewFeeling, string> = {
  GOOD: "很好",
  OK: "一般",
  BAD: "较差"
};
```

- [ ] **Step 2: Create validators**

Create `src/features/interviews/validators.ts`:

```ts
import { z } from "zod";
import {
  INTERVIEW_DIFFICULTIES,
  INTERVIEW_FEELINGS,
  INTERVIEW_ROUNDS
} from "./constants";

const emptyToUndefined = (value: unknown) =>
  value == null || (typeof value === "string" && value.trim() === "")
    ? undefined
    : value;

const positiveInteger = (label: string) =>
  z.coerce.number({ invalid_type_error: `${label}必须是数字` }).int().min(1);

export const interviewReviewSchema = z
  .object({
    jobApplicationId: z.string().trim().min(1, "请选择关联岗位。"),
    round: z.enum(INTERVIEW_ROUNDS),
    scheduledAt: z.string().trim().min(1, "请选择面试开始时间。"),
    durationMinutes: positiveInteger("持续时长"),
    overallRating: z.coerce.number().int().min(1).max(5),
    difficulty: z.enum(INTERVIEW_DIFFICULTIES),
    feeling: z.enum(INTERVIEW_FEELINGS),
    questions: z.preprocess(
      emptyToUndefined,
      z.string().trim().max(10000).optional()
    ),
    notes: z.preprocess(
      emptyToUndefined,
      z.string().trim().max(10000).optional()
    )
  })
  .refine((data) => data.questions || data.notes, {
    message: "请至少填写问题记录或备注总结。",
    path: ["questions"]
  });
```

- [ ] **Step 3: Create view helpers**

Create `src/features/interviews/view.ts`:

```ts
export function dateTimeLocalValue(date: Date | string | null | undefined) {
  if (!date) return "";
  const value = new Date(date);
  if (Number.isNaN(value.getTime())) return "";
  const offsetMs = value.getTimezoneOffset() * 60 * 1000;
  return new Date(value.getTime() - offsetMs).toISOString().slice(0, 16);
}

export function interviewExcerpt(text: string | null | undefined) {
  const normalized = text?.replace(/\s+/g, " ").trim();
  if (!normalized) return "未填写问题记录";
  return normalized.length > 80 ? `${normalized.slice(0, 80)}...` : normalized;
}
```

- [ ] **Step 4: Create service**

Create `src/features/interviews/service.ts`:

```ts
import { prisma } from "@/lib/prisma";
import { AppError } from "@/lib/errors";
import { parseDateTimeLocal } from "@/lib/date";
import { ACTIVITY_TYPES } from "@/features/applications/constants";
import { INTERVIEW_ROUND_LABELS, type InterviewRound } from "./constants";
import { interviewReviewSchema } from "./validators";

async function assertApplicationBelongsToUser(
  userId: string,
  jobApplicationId: string
) {
  const application = await prisma.jobApplication.findFirst({
    where: { id: jobApplicationId, userId },
    select: { id: true }
  });
  if (!application) throw new AppError("Application not found.", 404);
}

async function assertReviewBelongsToUser(userId: string, id: string) {
  const review = await prisma.interviewReview.findFirst({
    where: { id, jobApplication: { userId } },
    select: { id: true }
  });
  if (!review) throw new AppError("Interview review not found.", 404);
}

export async function createInterviewReview(userId: string, input: unknown) {
  const data = interviewReviewSchema.parse(input);
  const scheduledAt = parseDateTimeLocal(data.scheduledAt);
  if (!scheduledAt) throw new AppError("Invalid interview start time.");
  await assertApplicationBelongsToUser(userId, data.jobApplicationId);

  return prisma.$transaction(async (tx) => {
    const review = await tx.interviewReview.create({
      data: {
        jobApplicationId: data.jobApplicationId,
        round: data.round,
        scheduledAt,
        durationMinutes: data.durationMinutes,
        overallRating: data.overallRating,
        difficulty: data.difficulty,
        feeling: data.feeling,
        questions: data.questions ?? null,
        notes: data.notes ?? null
      }
    });

    await tx.applicationActivity.create({
      data: {
        jobApplicationId: data.jobApplicationId,
        type: ACTIVITY_TYPES.CUSTOM,
        content: `新增${INTERVIEW_ROUND_LABELS[data.round as InterviewRound]}复盘`
      }
    });

    return review;
  });
}

export async function updateInterviewReview(
  userId: string,
  id: string,
  input: unknown
) {
  const data = interviewReviewSchema.parse(input);
  const scheduledAt = parseDateTimeLocal(data.scheduledAt);
  if (!scheduledAt) throw new AppError("Invalid interview start time.");
  await assertReviewBelongsToUser(userId, id);
  await assertApplicationBelongsToUser(userId, data.jobApplicationId);

  return prisma.interviewReview.update({
    where: { id },
    data: {
      jobApplicationId: data.jobApplicationId,
      round: data.round,
      scheduledAt,
      durationMinutes: data.durationMinutes,
      overallRating: data.overallRating,
      difficulty: data.difficulty,
      feeling: data.feeling,
      questions: data.questions ?? null,
      notes: data.notes ?? null
    }
  });
}

export async function deleteInterviewReview(userId: string, id: string) {
  await assertReviewBelongsToUser(userId, id);
  return prisma.interviewReview.delete({ where: { id } });
}
```

- [ ] **Step 5: Create queries**

Create `src/features/interviews/queries.ts`:

```ts
import { prisma } from "@/lib/prisma";

export async function listInterviewReviews(
  userId: string,
  search?: string,
  round?: string,
  difficulty?: string
) {
  return prisma.interviewReview.findMany({
    where: {
      AND: [
        { jobApplication: { userId } },
        round ? { round } : {},
        difficulty ? { difficulty } : {},
        search
          ? {
              OR: [
                { questions: { contains: search } },
                { notes: { contains: search } },
                { jobApplication: { companyName: { contains: search } } },
                { jobApplication: { jobTitle: { contains: search } } }
              ]
            }
          : {}
      ]
    },
    include: { jobApplication: true },
    orderBy: { scheduledAt: "desc" }
  });
}
```

- [ ] **Step 6: Create actions**

Create `src/features/interviews/actions.ts`:

```ts
"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/features/auth/session";
import { getErrorMessage } from "@/lib/errors";
import {
  createInterviewReview,
  deleteInterviewReview,
  updateInterviewReview
} from "./service";

export type InterviewReviewFormState = {
  ok: boolean;
  message?: string;
};

function inputFromForm(formData: FormData) {
  return {
    jobApplicationId: formData.get("jobApplicationId"),
    round: formData.get("round"),
    scheduledAt: formData.get("scheduledAt"),
    durationMinutes: formData.get("durationMinutes"),
    overallRating: formData.get("overallRating"),
    difficulty: formData.get("difficulty"),
    feeling: formData.get("feeling"),
    questions: formData.get("questions"),
    notes: formData.get("notes")
  };
}

function revalidateInterviewViews() {
  revalidatePath("/interviews");
  revalidatePath("/applications");
}

export async function createInterviewReviewInModalAction(
  _state: InterviewReviewFormState,
  formData: FormData
): Promise<InterviewReviewFormState> {
  try {
    const user = await requireUser();
    await createInterviewReview(user.id, inputFromForm(formData));
    revalidateInterviewViews();
    return { ok: true };
  } catch (error) {
    return { ok: false, message: getErrorMessage(error) };
  }
}

export async function updateInterviewReviewInModalAction(
  id: string,
  _state: InterviewReviewFormState,
  formData: FormData
): Promise<InterviewReviewFormState> {
  try {
    const user = await requireUser();
    await updateInterviewReview(user.id, id, inputFromForm(formData));
    revalidateInterviewViews();
    return { ok: true };
  } catch (error) {
    return { ok: false, message: getErrorMessage(error) };
  }
}

export async function deleteInterviewReviewAction(id: string) {
  const user = await requireUser();
  await deleteInterviewReview(user.id, id);
  revalidateInterviewViews();
}
```

- [ ] **Step 7: Typecheck feature layer**

Run:

```powershell
npx tsc --noEmit
```

Expected: any errors should be limited to unused new feature code or downstream UI not yet wired. Fix typos before moving on.

## Task 3: Review Components

**Files:**
- Create: `src/components/interview/interview-review-modal-button.tsx`
- Create: `src/components/interview/interview-review-list.tsx`

- [ ] **Step 1: Create modal button**

Create `src/components/interview/interview-review-modal-button.tsx` with one client component that supports create and edit mode:

```tsx
"use client";

import { useActionState, useEffect, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import type { InterviewReview } from "@prisma/client";
import {
  createInterviewReviewInModalAction,
  updateInterviewReviewInModalAction,
  type InterviewReviewFormState
} from "@/features/interviews/actions";
import {
  INTERVIEW_DIFFICULTIES,
  INTERVIEW_DIFFICULTY_LABELS,
  INTERVIEW_FEELINGS,
  INTERVIEW_FEELING_LABELS,
  INTERVIEW_ROUNDS,
  INTERVIEW_ROUND_LABELS,
  type InterviewDifficulty,
  type InterviewFeeling,
  type InterviewRound
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
  const [state, formAction] = useActionState<InterviewReviewFormState, FormData>(
    review
      ? updateInterviewReviewInModalAction.bind(null, review.id)
      : createInterviewReviewInModalAction,
    { ok: false }
  );

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
                    {INTERVIEW_ROUND_LABELS[round as InterviewRound]}
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
                    {INTERVIEW_DIFFICULTY_LABELS[difficulty as InterviewDifficulty]}
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
                    {INTERVIEW_FEELING_LABELS[feeling as InterviewFeeling]}
                  </option>
                ))}
              </select>
            </label>

            <label className="block md:col-span-2">
              <span className="text-sm font-medium text-slate-700">面试问题记录</span>
              <textarea
                name="questions"
                rows={6}
                defaultValue={review?.questions ?? ""}
                placeholder="只记录遇到的问题即可，可以一行一个问题。"
                className="mt-1 min-h-36 w-full resize-y rounded-md border border-slate-300 px-3 py-2 focus-ring"
              />
            </label>

            <label className="block md:col-span-2">
              <span className="text-sm font-medium text-slate-700">备注 / 总结</span>
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

          <div className="mt-4 flex shrink-0 justify-end gap-3 border-t border-slate-200 pt-4">
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
        </form>
      </section>
    </div>
  );
}
```

- [ ] **Step 2: Create card list**

Create `src/components/interview/interview-review-list.tsx`:

```tsx
import type { InterviewReview, JobApplication } from "@prisma/client";
import { Badge } from "@/components/ui/badge";
import { formatDateTime } from "@/lib/date";
import {
  INTERVIEW_DIFFICULTY_LABELS,
  INTERVIEW_DIFFICULTY_STYLES,
  INTERVIEW_FEELING_LABELS,
  INTERVIEW_ROUND_LABELS,
  type InterviewDifficulty,
  type InterviewFeeling,
  type InterviewRound
} from "@/features/interviews/constants";
import { interviewExcerpt } from "@/features/interviews/view";
import { InterviewReviewModalButton } from "./interview-review-modal-button";

type ApplicationOption = Pick<JobApplication, "id" | "companyName" | "jobTitle">;

type ReviewWithApplication = InterviewReview & {
  jobApplication: ApplicationOption;
};

type Props = {
  applications: ApplicationOption[];
  emptyText?: string;
  reviews: ReviewWithApplication[];
};

export function InterviewReviewList({
  applications,
  emptyText = "暂无面试复盘",
  reviews
}: Props) {
  if (reviews.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">
        {emptyText}
      </div>
    );
  }

  return (
    <div className="grid gap-3">
      {reviews.map((review) => {
        const round = review.round as InterviewRound;
        const difficulty = review.difficulty as InterviewDifficulty;
        const feeling = review.feeling as InterviewFeeling;

        return (
          <InterviewReviewModalButton
            key={review.id}
            applications={applications}
            review={review}
            variant="card"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-slate-950">
                  {review.jobApplication.companyName} · {review.jobApplication.jobTitle}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  {formatDateTime(review.scheduledAt)} · {review.durationMinutes} 分钟
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge className="border-teal-200 bg-teal-50 text-teal-700">
                  {INTERVIEW_ROUND_LABELS[round]}
                </Badge>
                <Badge className={INTERVIEW_DIFFICULTY_STYLES[difficulty]}>
                  {INTERVIEW_DIFFICULTY_LABELS[difficulty]}
                </Badge>
              </div>
            </div>
            <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-500">
              <span>评分：{review.overallRating}/5</span>
              <span>感受：{INTERVIEW_FEELING_LABELS[feeling]}</span>
            </div>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              {interviewExcerpt(review.questions)}
            </p>
          </InterviewReviewModalButton>
        );
      })}
    </div>
  );
}
```

- [ ] **Step 3: Typecheck components**

Run:

```powershell
npx tsc --noEmit
```

Expected: component imports and Prisma types compile.

## Task 4: `/interviews` Page

**Files:**
- Modify: `src/app/interviews/page.tsx`

- [ ] **Step 1: Replace placeholder page**

Replace `src/app/interviews/page.tsx` with:

```tsx
import { AppShell } from "@/components/layout/app-shell";
import { InterviewReviewList } from "@/components/interview/interview-review-list";
import { InterviewReviewModalButton } from "@/components/interview/interview-review-modal-button";
import { requireUser } from "@/features/auth/session";
import { listApplicationOptions } from "@/features/applications/queries";
import {
  INTERVIEW_DIFFICULTIES,
  INTERVIEW_DIFFICULTY_LABELS,
  INTERVIEW_ROUNDS,
  INTERVIEW_ROUND_LABELS,
  type InterviewDifficulty,
  type InterviewRound
} from "@/features/interviews/constants";
import { listInterviewReviews } from "@/features/interviews/queries";

type InterviewsPageProps = {
  searchParams: Promise<{
    q?: string;
    round?: string;
    difficulty?: string;
  }>;
};

export default async function InterviewsPage({
  searchParams
}: InterviewsPageProps) {
  const user = await requireUser();
  const { q, round, difficulty } = await searchParams;
  const [applications, reviews] = await Promise.all([
    listApplicationOptions(user.id),
    listInterviewReviews(user.id, q, round, difficulty)
  ]);

  return (
    <AppShell
      username={user.username}
      title="面试复盘"
      description="记录每次面试遇到的问题、整体评价和个人总结。"
      action={<InterviewReviewModalButton applications={applications} />}
    >
      <form className="mb-5 flex flex-col gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm md:flex-row">
        <input
          name="q"
          defaultValue={q ?? ""}
          placeholder="搜索公司、岗位、问题或备注"
          className="h-10 flex-1 rounded-md border border-slate-300 px-3 focus-ring"
        />
        <select
          name="round"
          defaultValue={round ?? ""}
          className="h-10 rounded-md border border-slate-300 px-3 focus-ring"
        >
          <option value="">全部轮次</option>
          {INTERVIEW_ROUNDS.map((item) => (
            <option key={item} value={item}>
              {INTERVIEW_ROUND_LABELS[item as InterviewRound]}
            </option>
          ))}
        </select>
        <select
          name="difficulty"
          defaultValue={difficulty ?? ""}
          className="h-10 rounded-md border border-slate-300 px-3 focus-ring"
        >
          <option value="">全部难度</option>
          {INTERVIEW_DIFFICULTIES.map((item) => (
            <option key={item} value={item}>
              {INTERVIEW_DIFFICULTY_LABELS[item as InterviewDifficulty]}
            </option>
          ))}
        </select>
        <button className="h-10 rounded-md border border-slate-300 px-4 text-sm font-medium hover:bg-slate-100">
          筛选
        </button>
      </form>

      <section className="mb-5 rounded-lg border border-teal-100 bg-teal-50 p-4 text-sm text-teal-800">
        积累复盘后，可用于 AI 总结高频问题和建议回答。
      </section>

      <InterviewReviewList
        applications={applications}
        reviews={reviews}
        emptyText="还没有面试复盘，记录第一次面试吧。"
      />
    </AppShell>
  );
}
```

- [ ] **Step 2: Typecheck page**

Run:

```powershell
npx tsc --noEmit
```

Expected: page compiles and imports resolve.

## Task 5: Application Detail Integration

**Files:**
- Modify: `src/components/application/application-detail-modal.tsx`

- [ ] **Step 1: Import interview components**

Add imports:

```tsx
import { InterviewReviewList } from "@/components/interview/interview-review-list";
import { InterviewReviewModalButton } from "@/components/interview/interview-review-modal-button";
```

- [ ] **Step 2: Add application option list**

Inside `ApplicationDetailModal`, after `const editFormId = ...`, add:

```tsx
  const applicationOption = {
    id: application.id,
    companyName: application.companyName,
    jobTitle: application.jobTitle
  };
```

- [ ] **Step 3: Replace placeholder interview section**

Replace the existing aside section headed `面试复盘` with:

```tsx
            <section className="rounded-lg border border-slate-200 bg-white p-3">
              <div className="flex items-center justify-between gap-3">
                <h3 className="font-semibold text-slate-950">面试复盘</h3>
                <InterviewReviewModalButton
                  applications={[applicationOption]}
                  defaultApplicationId={application.id}
                  variant="link"
                />
              </div>
              <div className="mt-3">
                <InterviewReviewList
                  applications={[applicationOption]}
                  reviews={application.interviewReviews.map((review) => ({
                    ...review,
                    jobApplication: applicationOption
                  }))}
                  emptyText="这个岗位还没有面试复盘"
                />
              </div>
            </section>
```

- [ ] **Step 4: Typecheck detail integration**

Run:

```powershell
npx tsc --noEmit
```

Expected: detail modal compiles with the new required `InterviewReview` fields.

## Task 6: Final Verification

**Files:**
- All files touched above.

- [ ] **Step 1: Run Prisma validation**

Run:

```powershell
npx prisma validate
```

Expected: schema is valid.

- [ ] **Step 2: Run TypeScript verification**

Run:

```powershell
npx tsc --noEmit
```

Expected: exit code 0.

- [ ] **Step 3: Manual smoke check**

Run the dev server only if the user wants visual verification:

```powershell
npm run dev
```

Smoke path:

- Open `/interviews`.
- Create a review with a linked application.
- Confirm it appears in `/interviews`.
- Filter by round and difficulty.
- Open that application detail modal.
- Confirm the review appears there.
- Edit the review.
- Confirm no extra timeline item was created for the edit.
- Delete the review.

- [ ] **Step 4: Commit implementation**

Stage only implementation files:

```powershell
git add prisma/schema.prisma src/features/interviews src/components/interview src/app/interviews/page.tsx src/components/application/application-detail-modal.tsx
git commit -m "Add interview review workflow"
```

Expected: commit contains only interview review implementation files.

## Self-Review

- Spec coverage: all requested fields, `/interviews` list, search, round/difficulty filters, application detail entry, create-time timeline activity, and AI placeholder are covered.
- Explicitly skipped: real AI, charts, question cards, per-question answers, complex time filters.
- Type consistency: constants use `FIRST_INTERVIEW`, `SECOND_INTERVIEW`, `HR_INTERVIEW`, `OTHER`; the same values appear in validators and labels.
- Validation command: use `npx tsc --noEmit`; do not use `npm run build` for routine verification.
