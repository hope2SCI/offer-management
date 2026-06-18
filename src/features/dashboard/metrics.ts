import { prisma } from "@/lib/prisma";
import { getTaskBuckets } from "@/features/tasks/queries";
import {
  APPLICATION_STATUSES,
  STATUS_LABELS,
  type ApplicationStatus
} from "@/features/applications/constants";

const appliedAndAfter = [
  "APPLIED",
  "WRITTEN_TEST",
  "FIRST_INTERVIEW",
  "SECOND_INTERVIEW",
  "HR_INTERVIEW",
  "OFFER",
  "ENDED"
];

const interviewAndAfter = [
  "FIRST_INTERVIEW",
  "SECOND_INTERVIEW",
  "HR_INTERVIEW",
  "OFFER"
];

export async function getDashboardMetrics(userId: string) {
  const [
    totalApplications,
    activeApplications,
    offerCount,
    endedCount,
    highPriorityCount,
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
    prisma.jobApplication.findMany({
      where: { userId },
      select: { status: true }
    }),
    prisma.jobApplication.findMany({
      where: { userId },
      include: { resume: true },
      orderBy: { updatedAt: "desc" },
      take: 6
    }),
    getTaskBuckets(userId)
  ]);

  const denominator = allApplications.filter((application) =>
    appliedAndAfter.includes(application.status)
  ).length;
  const numerator = allApplications.filter((application) =>
    interviewAndAfter.includes(application.status)
  ).length;

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
      interviewConversionRate:
        denominator === 0 ? 0 : Math.round((numerator / denominator) * 100)
    },
    statusDistribution,
    recentApplications,
    tasks: taskBuckets
  };
}
