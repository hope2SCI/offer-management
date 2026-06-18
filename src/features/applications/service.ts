import { prisma } from "@/lib/prisma";
import { AppError } from "@/lib/errors";
import {
  ACTIVITY_TYPES,
  type ApplicationStatus,
  type EndReason
} from "./constants";
import { applicationSchema, statusUpdateSchema } from "./validators";

function normalizeEndReason(status: string, endReason?: string | null) {
  return status === "ENDED" ? (endReason ?? null) : null;
}

async function assertResumeBelongsToUser(userId: string, resumeId?: string | null) {
  if (!resumeId) return;

  const resume = await prisma.resume.findFirst({
    where: { id: resumeId, userId },
    select: { id: true }
  });
  if (!resume) throw new AppError("Resume not found.", 404);
}

export async function createApplication(userId: string, input: unknown) {
  const data = applicationSchema.parse(input);
  const now = new Date();
  await assertResumeBelongsToUser(userId, data.resumeId);

  return prisma.jobApplication.create({
    data: {
      ...data,
      userId,
      endReason: normalizeEndReason(data.status, data.endReason),
      lastStatusChangedAt: now,
      activities: {
        create: {
          type: ACTIVITY_TYPES.STATUS_CHANGED,
          toStatus: data.status,
          content: "Created application"
        }
      }
    }
  });
}

export async function updateApplication(
  userId: string,
  id: string,
  input: unknown
) {
  const data = applicationSchema.parse(input);
  const existing = await prisma.jobApplication.findFirst({
    where: { id, userId }
  });
  if (!existing) throw new AppError("Application not found.", 404);
  await assertResumeBelongsToUser(userId, data.resumeId);

  const statusChanged = existing.status !== data.status;
  const resumeChanged = existing.resumeId !== (data.resumeId ?? null);

  return prisma.$transaction(async (tx) => {
    const application = await tx.jobApplication.update({
      where: { id },
      data: {
        ...data,
        endReason: normalizeEndReason(data.status, data.endReason),
        lastStatusChangedAt: statusChanged
          ? new Date()
          : existing.lastStatusChangedAt
      }
    });

    if (statusChanged) {
      await tx.applicationActivity.create({
        data: {
          jobApplicationId: id,
          type: ACTIVITY_TYPES.STATUS_CHANGED,
          fromStatus: existing.status,
          toStatus: data.status,
          content: "Updated application status"
        }
      });
    }

    if (resumeChanged) {
      await tx.applicationActivity.create({
        data: {
          jobApplicationId: id,
          type: ACTIVITY_TYPES.RESUME_LINKED,
          content: data.resumeId ? "Linked resume" : "Unlinked resume"
        }
      });
    }

    return application;
  });
}

export async function updateApplicationStatus(
  userId: string,
  id: string,
  status: ApplicationStatus,
  endReason?: EndReason
) {
  const data = statusUpdateSchema.parse({ status, endReason });
  const existing = await prisma.jobApplication.findFirst({
    where: { id, userId }
  });
  if (!existing) throw new AppError("Application not found.", 404);
  if (existing.status === data.status && existing.endReason === data.endReason) {
    return existing;
  }

  return prisma.$transaction(async (tx) => {
    const application = await tx.jobApplication.update({
      where: { id },
      data: {
        status: data.status,
        endReason: normalizeEndReason(data.status, data.endReason),
        lastStatusChangedAt: new Date()
      }
    });

    await tx.applicationActivity.create({
      data: {
        jobApplicationId: id,
        type: ACTIVITY_TYPES.STATUS_CHANGED,
        fromStatus: existing.status,
        toStatus: data.status,
        content: "Updated application status"
      }
    });

    return application;
  });
}

export async function deleteApplication(userId: string, id: string) {
  const existing = await prisma.jobApplication.findFirst({
    where: { id, userId },
    select: { id: true }
  });
  if (!existing) throw new AppError("Application not found.", 404);

  return prisma.jobApplication.delete({ where: { id } });
}
