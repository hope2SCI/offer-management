"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { JobApplication, Resume, Task } from "@prisma/client";
import { ApplicationCard } from "@/components/application/application-card";
import { ApplicationCreateModalButton } from "@/components/application/application-create-modal-button";
import { updateApplicationStatusAction } from "@/features/applications/actions";
import {
  STATUS_LABELS,
  type ApplicationStatus
} from "@/features/applications/constants";

const BOARD_COLUMN_WIDTH_CLASS = "w-80";

type BoardApplication = JobApplication & {
  resume?: Resume | null;
  tasks?: Task[];
};

type ApplicationGroup = {
  status: string;
  applications: BoardApplication[];
};

type ApplicationBoardProps = {
  grouped: ApplicationGroup[];
  resumes: Array<Pick<Resume, "id" | "name">>;
  query?: string;
  priority?: string;
  status?: string;
  source?: string;
  city?: string;
};

export function ApplicationBoard({
  grouped,
  resumes,
  query,
  priority,
  status,
  source,
  city
}: ApplicationBoardProps) {
  const router = useRouter();
  const [groups, setGroups] = useState(grouped);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [overStatus, setOverStatus] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  useEffect(() => {
    setGroups(grouped);
  }, [grouped]);

  const applicationStatusById = useMemo(() => {
    const map = new Map<string, string>();
    for (const group of groups) {
      for (const application of group.applications) {
        map.set(application.id, group.status);
      }
    }
    return map;
  }, [groups]);

  function applicationHref(id: string) {
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (priority) params.set("priority", priority);
    if (status) params.set("status", status);
    if (source) params.set("source", source);
    if (city) params.set("city", city);
    params.set("applicationId", id);
    return `/applications?${params.toString()}`;
  }

  function moveApplication(applicationId: string, targetStatus: string) {
    setGroups((currentGroups) => {
      let movedApplication: BoardApplication | null = null;

      const withoutMoved = currentGroups.map((group) => {
        const applications = group.applications.filter((application) => {
          if (application.id === applicationId) {
            movedApplication = { ...application, status: targetStatus };
            return false;
          }
          return true;
        });
        return { ...group, applications };
      });

      if (!movedApplication) return currentGroups;

      return withoutMoved.map((group) =>
        group.status === targetStatus
          ? { ...group, applications: [movedApplication!, ...group.applications] }
          : group
      );
    });
  }

  function persistStatus(applicationId: string, targetStatus: string) {
    const formData = new FormData();
    formData.set("status", targetStatus);
    if (targetStatus === "ENDED") {
      formData.set("endReason", "OTHER");
    }

    startTransition(async () => {
      await updateApplicationStatusAction(applicationId, formData);
      router.refresh();
    });
  }

  function handleDrop(targetStatus: string) {
    if (!draggingId) return;
    const currentStatus = applicationStatusById.get(draggingId);

    setDraggingId(null);
    setOverStatus(null);

    if (!currentStatus || currentStatus === targetStatus) return;

    moveApplication(draggingId, targetStatus);
    persistStatus(draggingId, targetStatus);
  }

  return (
    <div className="-mx-5 overflow-x-auto px-5 pb-6 lg:-mx-8 lg:px-8">
      <div className="flex w-max gap-5">
        {groups.map((group) => {
          const status = group.status as ApplicationStatus;
          const isOver = overStatus === group.status;

          return (
            <section
              key={group.status}
              onDragOver={(event) => {
                event.preventDefault();
                setOverStatus(group.status);
              }}
              onDragLeave={() => setOverStatus(null)}
              onDrop={(event) => {
                event.preventDefault();
                handleDrop(group.status);
              }}
              className={`h-fit ${BOARD_COLUMN_WIDTH_CLASS} shrink-0 rounded-lg border p-4 transition-colors ${
                isOver
                  ? "border-teal-300 bg-teal-50"
                  : "border-slate-200 bg-slate-100/70"
              }`}
            >
              <div className="mb-4 flex items-center justify-between gap-3">
                <h2 className="truncate text-sm font-semibold text-slate-800">
                  {STATUS_LABELS[status]}
                </h2>
                <div className="flex shrink-0 items-center gap-2">
                  <span className="rounded-full bg-white px-2.5 py-0.5 text-xs text-slate-500">
                    {group.applications.length}
                  </span>
                  <ApplicationCreateModalButton
                    defaultStatus={status}
                    resumes={resumes}
                    trigger="icon"
                  />
                </div>
              </div>
              <div className="min-h-120 space-y-3">
                {group.applications.length === 0 ? (
                  <div className="flex min-h-40 items-end justify-center pb-1 text-xs text-slate-400">
                    拖拽或点击 + 添加
                  </div>
                ) : (
                  group.applications.map((application) => (
                    <div
                      key={application.id}
                      draggable
                      onDragStart={(event) => {
                        event.dataTransfer.effectAllowed = "move";
                        event.dataTransfer.setData("text/plain", application.id);
                        setDraggingId(application.id);
                      }}
                      onDragEnd={() => {
                        setDraggingId(null);
                        setOverStatus(null);
                      }}
                      className={
                        draggingId === application.id
                          ? "cursor-grabbing opacity-60"
                          : "cursor-grab"
                      }
                    >
                      <ApplicationCard
                        application={application}
                        href={applicationHref(application.id)}
                      />
                    </div>
                  ))
                )}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
