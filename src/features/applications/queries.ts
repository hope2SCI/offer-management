import { prisma } from "@/lib/prisma";
import { APPLICATION_STATUSES } from "./constants";

export async function listApplications(
  userId: string,
  search?: string,
  priority?: string,
  status?: string,
  source?: string,
  city?: string
) {
  const where = {
    AND: [
      { userId },
      search
        ? {
            OR: [
              { companyName: { contains: search } },
              { jobTitle: { contains: search } },
              { city: { contains: search } },
              { source: { contains: search } }
            ]
          }
        : {},
      priority ? { priority } : {},
      status ? { status } : {},
      source ? { source } : {},
      city ? { city } : {}
    ]
  };

  return prisma.jobApplication.findMany({
    where,
    include: {
      resume: true,
      tasks: {
        where: { completedAt: null },
        orderBy: { dueAt: "asc" },
        take: 1
      }
    },
    orderBy: [{ priority: "asc" }, { updatedAt: "desc" }]
  });
}

export async function getApplicationsByStatus(
  userId: string,
  search?: string,
  priority?: string,
  status?: string,
  source?: string,
  city?: string
) {
  const applications = await listApplications(
    userId,
    search,
    priority,
    status,
    source,
    city
  );
  return APPLICATION_STATUSES.map((status) => ({
    status,
    applications: applications.filter((application) => application.status === status)
  }));
}

export async function getApplication(userId: string, id: string) {
  return prisma.jobApplication.findFirst({
    where: { id, userId },
    include: {
      resume: true,
      tasks: { orderBy: { dueAt: "asc" } },
      activities: { orderBy: { createdAt: "desc" } },
      interviewReviews: { orderBy: { createdAt: "desc" } }
    }
  });
}

export async function listApplicationOptions(userId: string) {
  return prisma.jobApplication.findMany({
    where: { userId },
    select: { id: true, companyName: true, jobTitle: true },
    orderBy: { updatedAt: "desc" }
  });
}

export async function getApplicationFilterOptions(userId: string) {
  const applications = await prisma.jobApplication.findMany({
    where: { userId },
    select: { source: true, city: true },
    orderBy: { updatedAt: "desc" }
  });

  const sources = Array.from(
    new Set(
      applications
        .map((application) => application.source?.trim())
        .filter((value): value is string => Boolean(value))
    )
  );
  const cities = Array.from(
    new Set(
      applications
        .map((application) => application.city?.trim())
        .filter((value): value is string => Boolean(value))
    )
  );

  return { sources, cities };
}
