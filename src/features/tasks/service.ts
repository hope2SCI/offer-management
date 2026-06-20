import { prisma } from "@/lib/prisma";
import { AppError } from "@/lib/errors";
import { parseDateTimeLocal } from "@/lib/date";
import { ACTIVITY_TYPES } from "@/features/applications/constants";
import { taskSchema } from "./validators";

async function assertApplicationBelongsToUser(
  userId: string,
  jobApplicationId?: string | null
) {
  if (!jobApplicationId) return;

  const application = await prisma.jobApplication.findFirst({
    where: { id: jobApplicationId, userId },
    select: { id: true }
  });
  if (!application) throw new AppError("Application not found.", 404);
}

export async function createTask(userId: string, input: unknown) {
  const data = taskSchema.parse(input);
  const dueAt = parseDateTimeLocal(data.dueAt);
  if (!dueAt) throw new AppError("Invalid due date.");
  await assertApplicationBelongsToUser(userId, data.jobApplicationId);

  return prisma.$transaction(async (tx) => {
    const task = await tx.task.create({
      data: {
        userId,
        title: data.title,
        description: data.description,
        type: data.type,
        dueAt,
        jobApplicationId: data.jobApplicationId
      }
    });

    if (data.jobApplicationId) {
      await tx.applicationActivity.create({
        data: {
          jobApplicationId: data.jobApplicationId,
          type: ACTIVITY_TYPES.TASK_CREATED,
          content: `Created task: ${data.title}`
        }
      });
    }

    return task;
  });
}

export async function updateTask(userId: string, id: string, input: unknown) {
  const data = taskSchema.parse(input);
  const dueAt = parseDateTimeLocal(data.dueAt);
  if (!dueAt) throw new AppError("Invalid due date.");

  const existing = await prisma.task.findFirst({
    where: { id, userId },
    select: { id: true }
  });
  if (!existing) throw new AppError("Task not found.", 404);
  await assertApplicationBelongsToUser(userId, data.jobApplicationId);

  return prisma.task.update({
    where: { id },
    data: {
      title: data.title,
      description: data.description ?? null,
      type: data.type,
      dueAt,
      jobApplicationId: data.jobApplicationId ?? null
    }
  });
}

export async function completeTask(userId: string, id: string) {
  const existing = await prisma.task.findFirst({
    where: { id, userId },
    select: { id: true }
  });
  if (!existing) throw new AppError("Task not found.", 404);

  return prisma.task.update({
    where: { id },
    data: { completedAt: new Date() }
  });
}

export async function reopenTask(userId: string, id: string) {
  const existing = await prisma.task.findFirst({
    where: { id, userId },
    select: { id: true }
  });
  if (!existing) throw new AppError("Task not found.", 404);

  return prisma.task.update({
    where: { id },
    data: { completedAt: null }
  });
}

export async function deleteTask(userId: string, id: string) {
  const existing = await prisma.task.findFirst({
    where: { id, userId },
    select: { id: true }
  });
  if (!existing) throw new AppError("Task not found.", 404);

  return prisma.task.delete({ where: { id } });
}
