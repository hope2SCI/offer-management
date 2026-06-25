import { prisma } from "@/lib/prisma";

export async function listResumes(userId: string) {
  return prisma.resume.findMany({
    where: { userId },
    include: {
      applications: {
        select: { id: true, companyName: true, jobTitle: true },
        orderBy: { updatedAt: "desc" }
      }
    },
    orderBy: { updatedAt: "desc" }
  });
}

export async function getResume(userId: string, id: string) {
  return prisma.resume.findFirst({
    where: { id, userId },
    include: {
      applications: {
        select: { id: true, companyName: true, jobTitle: true },
        orderBy: { updatedAt: "desc" }
      }
    }
  });
}

export async function listResumeOptions(userId: string) {
  return prisma.resume.findMany({
    where: { userId },
    select: { id: true, name: true, version: true },
    orderBy: { updatedAt: "desc" }
  });
}
