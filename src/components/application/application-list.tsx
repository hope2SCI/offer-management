"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { JobApplication, Resume, Task } from "@prisma/client";
import { Badge } from "@/components/ui/badge";
import {
  APPLICATION_STATUSES,
  PRIORITY_LABELS,
  PRIORITY_STYLES,
  STATUS_LABELS,
  type ApplicationStatus,
  type Priority
} from "@/features/applications/constants";
import { formatDateTime } from "@/lib/date";

const PAGE_SIZE = 20;
const PRIORITY_ORDER: Record<string, number> = { HIGH: 0, MEDIUM: 1, LOW: 2 };
const STATUS_STYLES: Record<ApplicationStatus, string> = {
  INTERESTED: "border-slate-200 bg-slate-50 text-slate-600",
  APPLIED: "border-sky-200 bg-sky-50 text-sky-700",
  WRITTEN_TEST: "border-violet-200 bg-violet-50 text-violet-700",
  FIRST_INTERVIEW: "border-indigo-200 bg-indigo-50 text-indigo-700",
  SECOND_INTERVIEW: "border-blue-200 bg-blue-50 text-blue-700",
  HR_INTERVIEW: "border-cyan-200 bg-cyan-50 text-cyan-700",
  OFFER: "border-emerald-200 bg-emerald-50 text-emerald-700",
  ENDED: "border-rose-200 bg-rose-50 text-rose-700"
};
const STATUS_ORDER = Object.fromEntries(
  APPLICATION_STATUSES.map((status, index) => [status, index])
);

type ApplicationListSort = "updatedAt" | "status" | "priority";
type ApplicationListDirection = "asc" | "desc";

type ListApplication = JobApplication & {
  resume?: Resume | null;
  tasks?: Task[];
};

type ApplicationListProps = {
  applications: ListApplication[];
  detailBaseQuery: string;
};

function sortClass(active: boolean) {
  return active
    ? "font-semibold text-teal-700 hover:text-teal-800"
    : "font-medium text-slate-500 hover:text-slate-800";
}

function sortMark(active: boolean, direction: ApplicationListDirection) {
  if (!active) return " ↕";
  return direction === "asc" ? " ↑" : " ↓";
}

export function ApplicationList({
  applications,
  detailBaseQuery
}: ApplicationListProps) {
  const [sort, setSort] = useState<ApplicationListSort>("updatedAt");
  const [direction, setDirection] = useState<ApplicationListDirection>("desc");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    setCurrentPage(1);
  }, [applications]);

  const sortedApplications = useMemo(() => {
    const multiplier = direction === "asc" ? 1 : -1;

    return [...applications].sort((a, b) => {
      if (sort === "status") {
        return (
          multiplier *
          ((STATUS_ORDER[a.status] ?? APPLICATION_STATUSES.length) -
            (STATUS_ORDER[b.status] ?? APPLICATION_STATUSES.length))
        );
      }

      if (sort === "priority") {
        return (
          multiplier *
          ((PRIORITY_ORDER[a.priority] ?? 99) -
            (PRIORITY_ORDER[b.priority] ?? 99))
        );
      }

      return (
        multiplier *
        (new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime())
      );
    });
  }, [applications, direction, sort]);

  const totalPages = Math.max(1, Math.ceil(sortedApplications.length / PAGE_SIZE));
  const page = Math.min(currentPage, totalPages);
  const visibleApplications = sortedApplications.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE
  );

  function changeSort(nextSort: ApplicationListSort) {
    setCurrentPage(1);
    if (nextSort === sort) {
      setDirection((value) => (value === "asc" ? "desc" : "asc"));
      return;
    }
    setSort(nextSort);
    setDirection(nextSort === "updatedAt" ? "desc" : "asc");
  }

  function applicationHref(id: string) {
    const params = new URLSearchParams(detailBaseQuery);
    params.set("applicationId", id);
    return `/applications?${params.toString()}`;
  }

  return (
    <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
      <div className="hidden grid-cols-[0.4fr_1.2fr_96px_80px_1fr_120px] gap-4 border-b border-slate-200 bg-slate-50 px-4 py-3 text-xs font-medium text-slate-500 md:grid">
        <span>公司</span>
        <span>职位</span>
        <button
          className={`text-left ${sortClass(sort === "status")}`}
          type="button"
          onClick={() => changeSort("status")}
        >
          状态{sortMark(sort === "status", direction)}
        </button>
        <button
          className={`text-left ${sortClass(sort === "priority")}`}
          type="button"
          onClick={() => changeSort("priority")}
        >
          优先级{sortMark(sort === "priority", direction)}
        </button>
        <span>信息</span>
        <button
          className={`text-left ${sortClass(sort === "updatedAt")}`}
          type="button"
          onClick={() => changeSort("updatedAt")}
        >
          更新{sortMark(sort === "updatedAt", direction)}
        </button>
      </div>
      <div className="divide-y divide-slate-200">
        {visibleApplications.length === 0 ? (
          <div className="px-4 py-8 text-center text-sm text-slate-500">
            暂无匹配职位
          </div>
        ) : (
          visibleApplications.map((application) => {
          const status = application.status as ApplicationStatus;
          const priority = application.priority as Priority;

          return (
            <Link
              key={application.id}
              href={applicationHref(application.id)}
              className="grid gap-3 px-4 py-4 transition-colors hover:bg-slate-50 md:grid-cols-[0.4fr_1.2fr_96px_80px_1fr_120px] md:items-center md:gap-4"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-slate-950">
                  {application.companyName}
                </p>
                <p className="mt-1 truncate text-xs text-slate-500 md:hidden">
                  {application.jobTitle}
                </p>
              </div>
              <p className="hidden min-w-0 truncate text-sm text-slate-700 md:block">
                {application.jobTitle}
              </p>
              <Badge className={`${STATUS_STYLES[status]} w-fit`}>
                {STATUS_LABELS[status]}
              </Badge>
              <Badge className={`${PRIORITY_STYLES[priority]} w-fit`}>
                {PRIORITY_LABELS[priority]}
              </Badge>
              <div className="min-w-0 text-xs text-slate-500">
                <p className="truncate">
                  {application.city ?? "未填写城市"} ·{" "}
                  {application.source ?? "未填写渠道"}
                </p>
                <p className="mt-1 truncate">
                  简历：
                  {application.resume
                    ? `${application.resume.name} · ${application.resume.version}`
                    : "未关联"}
                </p>
              </div>
              <p className="text-xs text-slate-500">
                {formatDateTime(application.updatedAt)}
              </p>
            </Link>
          );
          })
        )}
      </div>
      <div className="flex flex-col gap-3 border-t border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600 md:flex-row md:items-center md:justify-between">
        <p>
          共 {applications.length} 个职位，第 {page} / {totalPages} 页
        </p>
        <div className="flex gap-2">
          {page > 1 ? (
            <button
              className="rounded-md border border-slate-300 bg-white px-3 py-2 font-medium text-slate-700 hover:bg-slate-100"
              type="button"
              onClick={() => setCurrentPage(page - 1)}
            >
              上一页
            </button>
          ) : (
            <span className="rounded-md border border-slate-200 bg-white px-3 py-2 text-slate-400">
              上一页
            </span>
          )}
          {page < totalPages ? (
            <button
              className="rounded-md border border-slate-300 bg-white px-3 py-2 font-medium text-slate-700 hover:bg-slate-100"
              type="button"
              onClick={() => setCurrentPage(page + 1)}
            >
              下一页
            </button>
          ) : (
            <span className="rounded-md border border-slate-200 bg-white px-3 py-2 text-slate-400">
              下一页
            </span>
          )}
        </div>
      </div>
    </section>
  );
}
