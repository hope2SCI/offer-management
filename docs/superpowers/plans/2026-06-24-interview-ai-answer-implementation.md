# Interview AI Answer Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let users save a Deepseek API key and generate editable AI reference answers for one interview review.

**Architecture:** Store one encrypted Deepseek key per user, store the latest AI answer directly on `InterviewReview`, and call Deepseek from server actions with `fetch`. Keep the UI as one card button plus one modal; no streaming, no history table, no provider abstraction.

**Tech Stack:** Next.js App Router, React server actions, Prisma SQLite, Zod, Node `crypto`, native `fetch`, Deepseek OpenAI-compatible chat completions.

---

## Source Notes

- Project verification command: `npx tsc --noEmit`.
- Deepseek base URL: `https://api.deepseek.com`.
- Deepseek docs used: `https://api-docs.deepseek.com/quick_start/pricing` and `https://api-docs.deepseek.com/guides/thinking_mode`.
- First implementation model mapping:
  - `FAST` -> `deepseek-v4-flash`
  - `DEEP` -> `deepseek-v4-pro`
- Use the non-streaming chat completions endpoint. `FAST` disables thinking; `DEEP` enables thinking with `reasoning_effort: "high"`. Streaming is out of scope.

## File Structure

- Modify `prisma/schema.prisma`: add interview AI answer fields and a user-owned AI settings model.
- Modify `src/features/interviews/constants.ts`: add AI answer modes and labels.
- Modify `src/features/interviews/validators.ts`: add AI answer action schemas.
- Modify `src/features/interviews/service.ts`: add ownership-aware AI answer update helpers.
- Modify `src/features/interviews/actions.ts`: add save and generate server actions.
- Create `src/features/interviews/ai.ts`: build prompts and call Deepseek.
- Create `src/features/settings/validators.ts`: validate API key form data.
- Create `src/features/settings/crypto.ts`: encrypt/decrypt API keys with Node `crypto`.
- Create `src/features/settings/service.ts`: save and load current user's Deepseek key.
- Create `src/features/settings/actions.ts`: settings form server action.
- Create `src/features/settings/queries.ts`: expose settings state to the page and AI actions.
- Create `src/components/settings/ai-settings-form.tsx`: client form with save feedback.
- Create `src/app/settings/page.tsx`: settings screen.
- Modify `src/components/layout/account-menu.tsx`: add settings link.
- Create `src/components/interview/interview-ai-answer-button.tsx`: AI answer modal.
- Modify `src/components/interview/interview-review-list.tsx`: render cards as articles with separate edit and AI buttons.
- Modify `src/components/application/application-detail-modal.tsx`: pass reviews with AI fields through the shared list.

---

### Task 1: Add Data Fields And Mode Constants

**Files:**
- Modify: `prisma/schema.prisma`
- Modify: `src/features/interviews/constants.ts`
- Modify: `src/features/interviews/validators.ts`

- [ ] **Step 1: Extend the Prisma schema**

Modify `User`:

```prisma
model User {
  id           String           @id @default(cuid())
  username     String           @unique
  passwordHash String
  applications JobApplication[]
  resumes      Resume[]
  tasks        Task[]
  aiSettings   UserAiSetting?
  createdAt    DateTime         @default(now())
  updatedAt    DateTime         @updatedAt
}
```

Modify `InterviewReview`:

```prisma
model InterviewReview {
  id                String         @id @default(cuid())
  jobApplicationId  String
  jobApplication    JobApplication @relation(fields: [jobApplicationId], references: [id], onDelete: Cascade)
  round             String
  scheduledAt       DateTime
  durationMinutes   Int
  overallRating     Int
  difficulty        String
  feeling           String
  questions         String?
  notes             String?
  aiAnswer          String?
  aiAnswerMode      String?
  aiAnswerUpdatedAt DateTime?
  createdAt         DateTime       @default(now())
  updatedAt         DateTime       @updatedAt

  @@index([jobApplicationId])
}
```

Add this model:

```prisma
model UserAiSetting {
  id                     String   @id @default(cuid())
  userId                 String   @unique
  user                   User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  deepseekApiKeyCipher   String
  deepseekApiKeyIv       String
  deepseekApiKeyAuthTag  String
  createdAt              DateTime @default(now())
  updatedAt              DateTime @updatedAt
}
```

- [ ] **Step 2: Add AI mode constants**

Append to `src/features/interviews/constants.ts`:

```ts
export const AI_ANSWER_MODES = ["FAST", "DEEP"] as const;

export type AiAnswerMode = (typeof AI_ANSWER_MODES)[number];

export const AI_ANSWER_MODE_LABELS: Record<AiAnswerMode, string> = {
  FAST: "快速解答",
  DEEP: "深度思考"
};
```

- [ ] **Step 3: Add interview AI validators**

Modify the constants import in `src/features/interviews/validators.ts`:

```ts
import {
  AI_ANSWER_MODES,
  INTERVIEW_DIFFICULTIES,
  INTERVIEW_FEELINGS,
  INTERVIEW_ROUNDS
} from "./constants";
```

Append the schemas after `interviewReviewSchema`:

```ts
export const aiAnswerModeSchema = z.enum(AI_ANSWER_MODES);

export const saveAiAnswerSchema = z.object({
  answer: z.string().trim().min(1, "请填写 AI 参考答案。"),
  mode: aiAnswerModeSchema
});

export const generateAiAnswerSchema = z.object({
  mode: aiAnswerModeSchema
});
```

- [ ] **Step 4: Validate and sync Prisma**

Run:

```powershell
npx prisma validate
npx prisma db push
npx prisma generate
npx tsc --noEmit
```

Expected:

```text
The schema at prisma\schema.prisma is valid
```

and `npx tsc --noEmit` exits with code `0`.

- [ ] **Step 5: Commit**

```powershell
git add prisma/schema.prisma src/features/interviews/constants.ts src/features/interviews/validators.ts
git commit -m "Add interview AI answer data fields"
```

---

### Task 2: Add User Deepseek Settings

**Files:**
- Create: `src/features/settings/crypto.ts`
- Create: `src/features/settings/validators.ts`
- Create: `src/features/settings/service.ts`
- Create: `src/features/settings/queries.ts`
- Create: `src/features/settings/actions.ts`
- Create: `src/components/settings/ai-settings-form.tsx`
- Create: `src/app/settings/page.tsx`
- Modify: `src/components/layout/account-menu.tsx`

- [ ] **Step 1: Create API key encryption helpers**

Create `src/features/settings/crypto.ts`:

```ts
import crypto from "node:crypto";

type EncryptedValue = {
  cipher: string;
  iv: string;
  authTag: string;
};

function getSecretKey() {
  const secret =
    process.env.AI_SETTINGS_SECRET ??
    process.env.JWT_SECRET ??
    "local-development-secret-change-before-sharing";

  return crypto.createHash("sha256").update(secret).digest();
}

export function encryptSecret(value: string): EncryptedValue {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", getSecretKey(), iv);
  const encrypted = Buffer.concat([
    cipher.update(value, "utf8"),
    cipher.final()
  ]);

  return {
    cipher: encrypted.toString("base64"),
    iv: iv.toString("base64"),
    authTag: cipher.getAuthTag().toString("base64")
  };
}

export function decryptSecret(value: EncryptedValue) {
  const decipher = crypto.createDecipheriv(
    "aes-256-gcm",
    getSecretKey(),
    Buffer.from(value.iv, "base64")
  );
  decipher.setAuthTag(Buffer.from(value.authTag, "base64"));

  return Buffer.concat([
    decipher.update(Buffer.from(value.cipher, "base64")),
    decipher.final()
  ]).toString("utf8");
}
```

- [ ] **Step 2: Create settings validators**

Create `src/features/settings/validators.ts`:

```ts
import { z } from "zod";

export const aiSettingsSchema = z.object({
  deepseekApiKey: z
    .string()
    .trim()
    .min(1, "请输入 Deepseek API Key。")
    .max(300, "API Key 太长。")
});
```

- [ ] **Step 3: Create settings service**

Create `src/features/settings/service.ts`:

```ts
import { prisma } from "@/lib/prisma";
import { AppError } from "@/lib/errors";
import { decryptSecret, encryptSecret } from "./crypto";
import { aiSettingsSchema } from "./validators";

export async function saveAiSettings(userId: string, input: unknown) {
  const data = aiSettingsSchema.parse(input);
  const encrypted = encryptSecret(data.deepseekApiKey);

  return prisma.userAiSetting.upsert({
    where: { userId },
    create: {
      userId,
      deepseekApiKeyCipher: encrypted.cipher,
      deepseekApiKeyIv: encrypted.iv,
      deepseekApiKeyAuthTag: encrypted.authTag
    },
    update: {
      deepseekApiKeyCipher: encrypted.cipher,
      deepseekApiKeyIv: encrypted.iv,
      deepseekApiKeyAuthTag: encrypted.authTag
    }
  });
}

export async function getAiSettingsStatus(userId: string) {
  const settings = await prisma.userAiSetting.findUnique({
    where: { userId },
    select: { id: true, updatedAt: true }
  });

  return {
    hasDeepseekApiKey: Boolean(settings),
    updatedAt: settings?.updatedAt ?? null
  };
}

export async function getDeepseekApiKey(userId: string) {
  const settings = await prisma.userAiSetting.findUnique({
    where: { userId }
  });
  if (!settings) throw new AppError("请先在设置中配置 Deepseek API Key。", 400);

  return decryptSecret({
    cipher: settings.deepseekApiKeyCipher,
    iv: settings.deepseekApiKeyIv,
    authTag: settings.deepseekApiKeyAuthTag
  });
}
```

- [ ] **Step 4: Create settings query wrapper**

Create `src/features/settings/queries.ts`:

```ts
import { getAiSettingsStatus } from "./service";

export async function getSettingsPageData(userId: string) {
  return getAiSettingsStatus(userId);
}
```

- [ ] **Step 5: Create settings action**

Create `src/features/settings/actions.ts`:

```ts
"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/features/auth/session";
import { getErrorMessage } from "@/lib/errors";
import { saveAiSettings } from "./service";

export type AiSettingsFormState = {
  ok: boolean;
  message?: string;
};

export async function saveAiSettingsAction(
  _state: AiSettingsFormState,
  formData: FormData
): Promise<AiSettingsFormState> {
  try {
    const user = await requireUser();
    await saveAiSettings(user.id, {
      deepseekApiKey: formData.get("deepseekApiKey")
    });
    revalidatePath("/settings");
    return { ok: true, message: "已保存 Deepseek API Key。" };
  } catch (error) {
    return { ok: false, message: getErrorMessage(error) };
  }
}
```

- [ ] **Step 6: Create settings page**

Create `src/components/settings/ai-settings-form.tsx`:

```tsx
"use client";

import { useActionState } from "react";
import {
  saveAiSettingsAction,
  type AiSettingsFormState
} from "@/features/settings/actions";

export function AiSettingsForm({
  hasDeepseekApiKey
}: {
  hasDeepseekApiKey: boolean;
}) {
  const [state, formAction] = useActionState<AiSettingsFormState, FormData>(
    saveAiSettingsAction,
    { ok: false }
  );

  return (
    <form action={formAction} className="mt-4 space-y-3">
      <label className="block">
        <span className="text-sm font-medium text-slate-700">
          Deepseek API Key
        </span>
        <input
          name="deepseekApiKey"
          type="password"
          autoComplete="off"
          required
          placeholder={
            hasDeepseekApiKey
              ? "输入新 Key 后保存即可替换"
              : "请输入 Deepseek API Key"
          }
          className="mt-1 h-10 w-full rounded-md border border-slate-300 px-3 focus-ring"
        />
      </label>

      {state.message ? (
        <div
          className={
            state.ok
              ? "rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700"
              : "rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
          }
        >
          {state.message}
        </div>
      ) : null}

      <button className="h-10 rounded-md bg-teal-700 px-4 text-sm font-semibold text-white hover:bg-teal-800">
        保存
      </button>
    </form>
  );
}
```

Create `src/app/settings/page.tsx`:

```tsx
import { AppShell } from "@/components/layout/app-shell";
import { AiSettingsForm } from "@/components/settings/ai-settings-form";
import { requireUser } from "@/features/auth/session";
import { getSettingsPageData } from "@/features/settings/queries";

export default async function SettingsPage() {
  const user = await requireUser();
  const settings = await getSettingsPageData(user.id);

  return (
    <AppShell
      username={user.username}
      title="设置"
      description="配置面试复盘 AI 解答所需的服务。"
    >
      <section className="max-w-2xl rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="font-semibold text-slate-950">Deepseek</h2>
        <p className="mt-1 text-sm text-slate-500">
          API Key 只属于当前账号，保存后不会完整回显。
        </p>

        <div className="mt-4 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600">
          当前状态：{settings.hasDeepseekApiKey ? "已配置" : "未配置"}
        </div>

        <AiSettingsForm hasDeepseekApiKey={settings.hasDeepseekApiKey} />
      </section>
    </AppShell>
  );
}
```

- [ ] **Step 7: Add account menu settings link**

Modify `src/components/layout/account-menu.tsx`:

```tsx
import Link from "next/link";
import { logoutAction } from "@/features/auth/actions";
import { getAvatarInitial } from "./account-menu-utils";
```

Add the link before the logout form:

```tsx
<div className="border-t border-slate-200 p-1">
  <Link
    href="/settings"
    className="focus-ring flex h-10 w-full items-center rounded-md px-3 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100"
  >
    设置
  </Link>
</div>
```

- [ ] **Step 8: Verify and commit**

Run:

```powershell
npx tsc --noEmit
```

Expected: exit code `0`.

Commit:

```powershell
git add src/features/settings src/components/settings/ai-settings-form.tsx src/app/settings/page.tsx src/components/layout/account-menu.tsx
git commit -m "Add AI settings page"
```

---

### Task 3: Add Deepseek Generation Service And Server Actions

**Files:**
- Create: `src/features/interviews/ai.ts`
- Modify: `src/features/interviews/service.ts`
- Modify: `src/features/interviews/actions.ts`

- [ ] **Step 1: Create Deepseek helper**

Create `src/features/interviews/ai.ts`:

```ts
import { AppError } from "@/lib/errors";
import type { AiAnswerMode } from "./constants";

const DEEPSEEK_BASE_URL = "https://api.deepseek.com";

function modelForMode(mode: AiAnswerMode) {
  return mode === "DEEP" ? "deepseek-v4-pro" : "deepseek-v4-flash";
}

export function buildInterviewAnswerPrompt(questions: string) {
  return [
    "你是一个资深面试辅导助手。",
    "请基于用户记录的面试问题生成中文参考答案。",
    "用户只记录了问题，没有记录自己的回答。",
    "请尽量拆分每个问题，并严格使用以下格式：",
    "",
    "问题：",
    "参考答案：",
    "追问/补充点：",
    "",
    "面试问题记录：",
    questions
  ].join("\n");
}

export async function generateInterviewAiAnswer({
  apiKey,
  mode,
  questions
}: {
  apiKey: string;
  mode: AiAnswerMode;
  questions: string;
}) {
  const thinkingEnabled = mode === "DEEP";
  const response = await fetch(`${DEEPSEEK_BASE_URL}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: modelForMode(mode),
      messages: [
        {
          role: "user",
          content: buildInterviewAnswerPrompt(questions)
        }
      ],
      thinking: { type: thinkingEnabled ? "enabled" : "disabled" },
      ...(thinkingEnabled ? { reasoning_effort: "high" } : {}),
      stream: false
    })
  });

  if (!response.ok) {
    throw new AppError("AI 解答生成失败，请稍后重试。", 502);
  }

  const data = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const answer = data.choices?.[0]?.message?.content?.trim();

  if (!answer) throw new AppError("AI 没有返回可保存的答案。", 502);
  return answer;
}
```

- [ ] **Step 2: Add AI answer service functions**

Update the imports at the top of `src/features/interviews/service.ts`:

```ts
import type { AiAnswerMode } from "./constants";
import {
  generateAiAnswerSchema,
  saveAiAnswerSchema
} from "./validators";
```

Merge these names into existing imports from the same files.

Add:

```ts
export async function getInterviewReviewForAi(userId: string, id: string) {
  const review = await prisma.interviewReview.findFirst({
    where: { id, jobApplication: { userId } },
    select: {
      id: true,
      questions: true,
      aiAnswer: true,
      aiAnswerMode: true
    }
  });

  if (!review) throw new AppError("Interview review not found.", 404);
  return review;
}

export async function saveInterviewAiAnswer(
  userId: string,
  id: string,
  input: unknown
) {
  const data = saveAiAnswerSchema.parse(input);
  await assertReviewBelongsToUser(userId, id);

  return prisma.interviewReview.update({
    where: { id },
    data: {
      aiAnswer: data.answer,
      aiAnswerMode: data.mode,
      aiAnswerUpdatedAt: new Date()
    }
  });
}

export function parseGenerateAiAnswerInput(input: unknown): {
  mode: AiAnswerMode;
} {
  return generateAiAnswerSchema.parse(input);
}
```

- [ ] **Step 3: Add AI server actions**

Modify imports in `src/features/interviews/actions.ts`:

```ts
import { getDeepseekApiKey } from "@/features/settings/service";
import { generateInterviewAiAnswer } from "./ai";
import {
  createInterviewReview,
  deleteInterviewReview,
  getInterviewReviewForAi,
  parseGenerateAiAnswerInput,
  saveInterviewAiAnswer,
  updateInterviewReview
} from "./service";
```

Add:

```ts
export type InterviewAiAnswerState = {
  ok: boolean;
  answer?: string;
  message?: string;
};

export async function saveInterviewAiAnswerAction(
  id: string,
  _state: InterviewAiAnswerState,
  formData: FormData
): Promise<InterviewAiAnswerState> {
  try {
    const user = await requireUser();
    await saveInterviewAiAnswer(user.id, id, {
      answer: formData.get("answer"),
      mode: formData.get("mode")
    });
    revalidateInterviewViews();
    return { ok: true, message: "已保存 AI 参考答案。" };
  } catch (error) {
    return { ok: false, message: getErrorMessage(error) };
  }
}

export async function generateInterviewAiAnswerAction(
  id: string,
  _state: InterviewAiAnswerState,
  formData: FormData
): Promise<InterviewAiAnswerState> {
  try {
    const user = await requireUser();
    const { mode } = parseGenerateAiAnswerInput({
      mode: formData.get("mode")
    });
    const review = await getInterviewReviewForAi(user.id, id);
    const questions = review.questions?.trim();
    if (!questions) {
      return { ok: false, message: "请先填写面试问题记录。" };
    }

    const apiKey = await getDeepseekApiKey(user.id);
    const answer = await generateInterviewAiAnswer({
      apiKey,
      mode,
      questions
    });

    await saveInterviewAiAnswer(user.id, id, { answer, mode });
    revalidateInterviewViews();
    return { ok: true, answer, message: "已生成 AI 参考答案。" };
  } catch (error) {
    return { ok: false, message: getErrorMessage(error) };
  }
}
```

- [ ] **Step 4: Verify and commit**

Run:

```powershell
npx tsc --noEmit
```

Expected: exit code `0`.

Commit:

```powershell
git add src/features/interviews/ai.ts src/features/interviews/service.ts src/features/interviews/actions.ts
git commit -m "Add interview AI answer actions"
```

---

### Task 4: Add AI Answer Modal And Card Entry

**Files:**
- Create: `src/components/interview/interview-ai-answer-button.tsx`
- Modify: `src/components/interview/interview-review-list.tsx`

- [ ] **Step 1: Create AI answer button and modal**

Create `src/components/interview/interview-ai-answer-button.tsx`:

```tsx
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
  const [generateState, generateAction] = useActionState<InterviewAiAnswerState, FormData>(
    generateInterviewAiAnswerAction.bind(null, review.id),
    { ok: false }
  );
  const [saveState, saveAction] = useActionState<InterviewAiAnswerState, FormData>(
    saveInterviewAiAnswerAction.bind(null, review.id),
    { ok: false }
  );

  useEffect(() => {
    if (generateState.answer) setAnswer(generateState.answer);
  }, [generateState.answer]);

  const message = generateState.message ?? saveState.message;
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
                if (answer && !confirm("重新生成会覆盖当前 AI 参考答案，确定继续吗？")) {
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
```

- [ ] **Step 2: Update review list cards**

Modify `src/components/interview/interview-review-list.tsx` imports:

```ts
import { InterviewAiAnswerButton } from "./interview-ai-answer-button";
import { InterviewReviewModalButton } from "./interview-review-modal-button";
```

Replace the `reviews.map` body so the card is not a nested button:

```tsx
return (
  <article
    key={review.id}
    className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
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
      <div className="flex flex-wrap justify-end gap-2">
        <InterviewAiAnswerButton review={review} />
        <InterviewReviewModalButton
          applications={applications}
          review={review}
          variant="link"
        >
          编辑
        </InterviewReviewModalButton>
      </div>
    </div>

    <div className="mt-3 flex flex-wrap gap-2">
      <Badge className="border-teal-200 bg-teal-50 text-teal-700">
        {INTERVIEW_ROUND_LABELS[round]}
      </Badge>
      <Badge className={INTERVIEW_DIFFICULTY_STYLES[difficulty]}>
        {INTERVIEW_DIFFICULTY_LABELS[difficulty]}
      </Badge>
      {review.aiAnswer ? (
        <Badge className="border-sky-200 bg-sky-50 text-sky-700">
          已生成 AI 解答
        </Badge>
      ) : null}
    </div>

    <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-500">
      <span>评分：{review.overallRating}/5</span>
      <span>感受：{INTERVIEW_FEELING_LABELS[feeling]}</span>
    </div>
    <p className="mt-3 text-sm leading-6 text-slate-600">
      {interviewExcerpt(review.questions)}
    </p>
  </article>
);
```

- [ ] **Step 3: Verify and commit**

Run:

```powershell
npx tsc --noEmit
```

Expected: exit code `0`.

Commit:

```powershell
git add src/components/interview/interview-ai-answer-button.tsx src/components/interview/interview-review-list.tsx
git commit -m "Add interview AI answer modal"
```

---

### Task 5: Wire Application Detail And Revalidate UX

**Files:**
- Modify: `src/components/application/application-detail-modal.tsx`
- Modify: `src/features/interviews/actions.ts`

- [ ] **Step 1: Confirm application detail uses shared list**

Open `src/components/application/application-detail-modal.tsx` and confirm it renders:

```tsx
<InterviewReviewList
  applications={[applicationOption]}
  reviews={application.interviewReviews}
  emptyText="这个岗位还没有面试复盘"
/>
```

No separate AI UI is needed there because the shared list now owns the AI button.

- [ ] **Step 2: Keep revalidation scoped**

Confirm `revalidateInterviewViews()` in `src/features/interviews/actions.ts` still contains:

```ts
function revalidateInterviewViews() {
  revalidatePath("/interviews");
  revalidatePath("/applications");
}
```

This covers both the main interview page and the application detail modal data.

- [ ] **Step 3: Verify and commit only if files changed**

Run:

```powershell
npx tsc --noEmit
```

Expected: exit code `0`.

If no files changed, skip the commit. If a file changed, commit:

```powershell
git add src/components/application/application-detail-modal.tsx src/features/interviews/actions.ts
git commit -m "Wire interview AI answer into application details"
```

---

### Task 6: Manual Verification And Final Commit Check

**Files:**
- Read: all files changed in Tasks 1-5.

- [ ] **Step 1: Run default verification**

Run:

```powershell
npx tsc --noEmit
```

Expected: exit code `0`.

- [ ] **Step 2: Run Prisma verification**

Run:

```powershell
npx prisma validate
```

Expected:

```text
The schema at prisma\schema.prisma is valid
```

- [ ] **Step 3: Start the app on port 3000**

Run:

```powershell
npm run dev -- --port 3000
```

Expected: the Next.js dev server listens on `http://localhost:3000`.

- [ ] **Step 4: Manual UI checks**

In the browser:

1. Open `http://localhost:3000/settings`.
2. Confirm the page shows Deepseek status and a password input.
3. Save a test-looking key such as `sk-test-local`.
4. Open `http://localhost:3000/interviews`.
5. Confirm each review card has `AI 解答` or `查看 AI 解答`.
6. Open a review with empty questions and confirm generate shows `请先填写面试问题记录。`.
7. Open a review with questions and click generate.
8. With an invalid key, confirm the UI shows generation failure and does not erase any existing answer.
9. Type a manual answer and save it.
10. Confirm the card shows `已生成 AI 解答`.

- [ ] **Step 5: Inspect git state**

Run:

```powershell
git status --short
git log --oneline -5
```

Expected: only unrelated pre-existing local files remain unstaged. The implementation commits are present above the plan/spec commits.

---

## Final Scope Check

Covered:

- Card-level AI entry.
- Single-review generation.
- Editable saved answer.
- Regenerate with overwrite warning.
- User-level Deepseek key settings.
- Fast/deep mode switch.
- Missing key, empty questions, failed AI call, and failed save handling.

Skipped:

- Streaming output.
- Answer history.
- Multi-provider settings.
- Cross-interview summaries.
- High-frequency question extraction.
- Per-question structured editor.
