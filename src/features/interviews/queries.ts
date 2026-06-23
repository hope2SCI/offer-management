import { prisma } from "@/lib/prisma";

export async function listInterviewReviews(
  userId: string,
  search?: string,
  round?: string,
  difficulty?: string
) {
  const q = search?.trim();

  return prisma.interviewReview.findMany({
    where: {
      AND: [
        { jobApplication: { userId } },
        round ? { round } : {},
        difficulty ? { difficulty } : {},
        q
          ? {
              OR: [
                { questions: { contains: q } },
                { notes: { contains: q } },
                { jobApplication: { companyName: { contains: q } } },
                { jobApplication: { jobTitle: { contains: q } } }
              ]
            }
          : {}
      ]
    },
    include: { jobApplication: true },
    orderBy: { scheduledAt: "desc" }
  });
}
