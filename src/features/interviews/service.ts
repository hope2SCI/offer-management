import { prisma } from "@/lib/prisma";
import { AppError } from "@/lib/errors";
import { parseDateTimeLocal } from "@/lib/date";
import { ACTIVITY_TYPES } from "@/features/applications/constants";
import { INTERVIEW_ROUND_LABELS } from "./constants";
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
        content: `新增${INTERVIEW_ROUND_LABELS[data.round]}复盘`
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
