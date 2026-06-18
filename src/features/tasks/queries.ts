import { prisma } from "@/lib/prisma";
import { endOfToday, endOfWeek, startOfToday } from "@/lib/date";

export async function listTasks(userId: string) {
  return prisma.task.findMany({
    where: { userId },
    include: { jobApplication: true },
    orderBy: [{ completedAt: "asc" }, { dueAt: "asc" }]
  });
}

export async function getTaskBuckets(userId: string) {
  const todayStart = startOfToday();
  const todayEnd = endOfToday();
  const weekEnd = endOfWeek();

  const [today, overdue, week] = await Promise.all([
    prisma.task.findMany({
      where: {
        userId,
        completedAt: null,
        dueAt: { gte: todayStart, lte: todayEnd }
      },
      include: { jobApplication: true },
      orderBy: { dueAt: "asc" }
    }),
    prisma.task.findMany({
      where: { userId, completedAt: null, dueAt: { lt: todayStart } },
      include: { jobApplication: true },
      orderBy: { dueAt: "asc" }
    }),
    prisma.task.findMany({
      where: { userId, dueAt: { gte: todayStart, lte: weekEnd } },
      include: { jobApplication: true },
      orderBy: { dueAt: "asc" }
    })
  ]);

  return { today, overdue, week };
}
