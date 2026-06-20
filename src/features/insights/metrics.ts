import { prisma } from "@/lib/prisma";

const appliedStatuses = [
  "APPLIED",
  "WRITTEN_TEST",
  "FIRST_INTERVIEW",
  "SECOND_INTERVIEW",
  "HR_INTERVIEW",
  "OFFER",
  "ENDED"
];

const interviewStatuses = ["FIRST_INTERVIEW", "SECOND_INTERVIEW", "HR_INTERVIEW", "OFFER"];

type InsightApplication = {
  id: string;
  status: string;
  source: string | null;
  city: string | null;
  activities: Array<{ toStatus: string | null }>;
};

function percent(part: number, total: number) {
  return total === 0 ? 0 : Math.round((part / total) * 100);
}

function seenStatuses(application: InsightApplication) {
  return new Set([
    application.status,
    ...application.activities.flatMap((activity) =>
      activity.toStatus ? [activity.toStatus] : []
    )
  ]);
}

function groupName(value: string | null, fallback: string) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : fallback;
}

export function buildInsightMetrics(applications: InsightApplication[]) {
  const rows = applications.map((application) => {
    const statuses = seenStatuses(application);
    return {
      application,
      applied: appliedStatuses.some((status) => statuses.has(status)),
      interviewed: interviewStatuses.some((status) => statuses.has(status)),
      offered: statuses.has("OFFER"),
      statuses
    };
  });

  const appliedRows = rows.filter((row) => row.applied);
  const interviewRows = appliedRows.filter((row) => row.interviewed);
  const offerRows = appliedRows.filter((row) => row.offered);
  const writtenTestCount = appliedRows.filter((row) =>
    row.statuses.has("WRITTEN_TEST")
  ).length;
  const interviewRate = percent(interviewRows.length, appliedRows.length);
  const offerRate = percent(offerRows.length, appliedRows.length);

  const channels = Array.from(
    appliedRows.reduce((map, row) => {
      const name = groupName(row.application.source, "未填写");
      const item = map.get(name) ?? {
        name,
        appliedCount: 0,
        interviewCount: 0,
        offerCount: 0
      };

      item.appliedCount += 1;
      if (row.interviewed) item.interviewCount += 1;
      if (row.offered) item.offerCount += 1;
      map.set(name, item);
      return map;
    }, new Map<string, { name: string; appliedCount: number; interviewCount: number; offerCount: number }>())
  )
    .map(([, item]) => ({
      ...item,
      interviewRate: percent(item.interviewCount, item.appliedCount),
      offerRate: percent(item.offerCount, item.appliedCount)
    }))
    .sort((a, b) => b.appliedCount - a.appliedCount || a.name.localeCompare(b.name));

  const cityCounts = Array.from(
    appliedRows.reduce((map, row) => {
      const city = row.application.city?.trim();
      if (!city) return map;
      map.set(city, (map.get(city) ?? 0) + 1);
      return map;
    }, new Map<string, number>())
  ).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));

  const cityTotal = cityCounts.reduce((sum, [, count]) => sum + count, 0);

  return {
    cards: {
      totalApplied: appliedRows.length,
      interviewCount: interviewRows.length,
      offerCount: offerRows.length,
      interviewRate,
      offerRate,
      interviewToOfferRate: percent(offerRows.length, interviewRows.length)
    },
    jobFunnel: [
      { label: "总投递", count: appliedRows.length, percent: percent(appliedRows.length, appliedRows.length) },
      { label: "笔试", count: writtenTestCount, percent: percent(writtenTestCount, appliedRows.length) },
      { label: "面试", count: interviewRows.length, percent: interviewRate },
      { label: "Offer", count: offerRows.length, percent: offerRate }
    ],
    channels,
    cities: cityCounts.map(([name, count]) => ({
      name,
      count,
      percent: percent(count, cityTotal)
    }))
  };
}

export async function getInsightMetrics(userId: string) {
  const applications = await prisma.jobApplication.findMany({
    where: { userId },
    select: {
      id: true,
      status: true,
      source: true,
      city: true,
      activities: {
        select: { toStatus: true }
      }
    }
  });

  return buildInsightMetrics(applications);
}
