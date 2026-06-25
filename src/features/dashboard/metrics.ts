import { prisma } from "@/lib/prisma";
import { getTaskBuckets } from "@/features/tasks/queries";
import { endOfWeek, startOfWeek } from "@/lib/date";
import {
  APPLICATION_STATUSES,
  STATUS_LABELS,
  type ApplicationStatus
} from "@/features/applications/constants";

export async function getDashboardMetrics(userId: string) {
  const weekStart = startOfWeek();
  const weekEnd = endOfWeek();
  const [
    totalApplications,
    activeApplications,
    offerCount,
    endedCount,
    highPriorityCount,
    weeklyAppliedCount,
    allApplications,
    recentApplications,
    taskBuckets
  ] = await Promise.all([
    prisma.jobApplication.count({ where: { userId } }),
    prisma.jobApplication.count({
      where: { userId, status: { not: "ENDED" } }
    }),
    prisma.jobApplication.count({ where: { userId, status: "OFFER" } }),
    prisma.jobApplication.count({ where: { userId, status: "ENDED" } }),
    prisma.jobApplication.count({
      where: { userId, priority: "HIGH", status: { not: "ENDED" } }
    }),
    prisma.jobApplication.count({
      where: {
        userId,
        createdAt: { gte: weekStart, lte: weekEnd }
      }
    }),
    prisma.jobApplication.findMany({
      where: { userId },
      select: { status: true }
    }),
    prisma.jobApplication.findMany({
      where: { userId },
      include: { resume: true },
      orderBy: { updatedAt: "desc" },
      take: 3
    }),
    getTaskBuckets(userId)
  ]);

  const statusDistribution = APPLICATION_STATUSES.map((status) => ({
    status,
    name: STATUS_LABELS[status as ApplicationStatus],
    value: allApplications.filter((application) => application.status === status)
      .length
  }));

  return {
    cards: {
      totalApplications,
      activeApplications,
      offerCount,
      endedCount,
      highPriorityCount,
      weeklyAppliedCount
    },
    statusDistribution,
    recentApplications,
    tasks: taskBuckets
  };
}
