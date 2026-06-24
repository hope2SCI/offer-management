"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/features/auth/session";
import { getDeepseekApiKey } from "@/features/settings/service";
import { getErrorMessage } from "@/lib/errors";
import { generateInterviewAiAnswer } from "./ai";
import {
  createInterviewReview,
  deleteInterviewReview,
  getInterviewReviewForAi,
  parseGenerateAiAnswerInput,
  saveInterviewAiAnswer,
  updateInterviewReview
} from "./service";

export type InterviewReviewFormState = {
  ok: boolean;
  message?: string;
};

export type InterviewAiAnswerState = {
  ok: boolean;
  answer?: string;
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
