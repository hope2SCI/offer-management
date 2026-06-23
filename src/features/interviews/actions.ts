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
