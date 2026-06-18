import Link from "next/link";
import type { JobApplication, Resume, Task } from "@prisma/client";
import { formatDateTime } from "@/lib/date";
import {
  END_REASON_LABELS,
  PRIORITY_LABELS,
  PRIORITY_STYLES,
  type EndReason,
  type Priority
} from "@/features/applications/constants";
import { Badge } from "@/components/ui/badge";

type ApplicationCardProps = {
  application: JobApplication & {
    resume?: Resume | null;
    tasks?: Task[];
  };
  href?: string;
};

export function ApplicationCard({ application, href }: ApplicationCardProps) {
  const priority = application.priority as Priority;
  const endReason = application.endReason as EndReason | null;

  return (
    <Link
      href={href ?? `/applications?applicationId=${application.id}`}
      className="block w-full overflow-hidden rounded-lg border border-slate-200 bg-white p-4 shadow-sm transition-colors hover:border-teal-300 hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-slate-950">
            {application.companyName}
          </p>
          <p className="mt-1 truncate text-sm text-slate-600">
            {application.jobTitle}
          </p>
        </div>
        <Badge className={`${PRIORITY_STYLES[priority]} shrink-0`}>
          {PRIORITY_LABELS[priority]}
        </Badge>
      </div>

      {endReason ? (
        <p className="mt-3 text-xs text-slate-500">
          结束原因：{END_REASON_LABELS[endReason]}
        </p>
      ) : null}

      <div className="mt-4 space-y-2 text-xs text-slate-500">
        <p className="truncate">简历：{application.resume?.name ?? "未关联"}</p>
        <div className="flex flex-wrap items-center gap-2">
          <span className="max-w-full truncate rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 text-xs text-slate-600">
            {application.city ?? "未填写城市"}
          </span>
          <span className="max-w-full truncate rounded-md border border-teal-100 bg-teal-50 px-2 py-0.5 text-xs text-teal-700">
            {application.source ?? "未填写渠道"}
          </span>
        </div>
        <p>更新：{formatDateTime(application.updatedAt)}</p>
      </div>
    </Link>
  );
}
