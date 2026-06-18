import { AppShell } from "@/components/layout/app-shell";
import { ApplicationBoard } from "@/components/application/application-board";
import { ApplicationCreateModalButton } from "@/components/application/application-create-modal-button";
import { ApplicationDetailModal } from "@/components/application/application-detail-modal";
import { ApplicationFilterChips } from "@/components/application/application-filter-chips";
import { ApplicationSearchField } from "@/components/application/application-search-field";
import { requireUser } from "@/features/auth/session";
import {
  getApplication,
  getApplicationFilterOptions,
  getApplicationsByStatus
} from "@/features/applications/queries";
import { listResumeOptions } from "@/features/resumes/queries";
import {
  PRIORITIES,
  PRIORITY_LABELS,
  type Priority
} from "@/features/applications/constants";

type ApplicationsPageProps = {
  searchParams: Promise<{
    q?: string;
    priority?: string;
    status?: string;
    source?: string;
    city?: string;
    applicationId?: string;
  }>;
};

export default async function ApplicationsPage({
  searchParams
}: ApplicationsPageProps) {
  const user = await requireUser();
  const { q, priority, status, source, city, applicationId } =
    await searchParams;
  const [grouped, selectedApplication, resumes, filterOptions] = await Promise.all([
    getApplicationsByStatus(user.id, q, priority, status, source, city),
    applicationId ? getApplication(user.id, applicationId) : Promise.resolve(null),
    listResumeOptions(user.id),
    getApplicationFilterOptions(user.id)
  ]);

  const closeParams = new URLSearchParams();
  if (q) closeParams.set("q", q);
  if (priority) closeParams.set("priority", priority);
  if (status) closeParams.set("status", status);
  if (source) closeParams.set("source", source);
  if (city) closeParams.set("city", city);
  const closeHref = closeParams.size
    ? `/applications?${closeParams.toString()}`
    : "/applications";

  return (
    <AppShell
      title="投递看板"
      description="按固定流程管理所有岗位机会。"
      action={
        <ApplicationCreateModalButton
          defaultStatus="INTERESTED"
          resumes={resumes}
          trigger="primary"
        />
      }
    >
      <form className="mb-5 flex flex-col gap-3 rounded-lg border border-slate-200 bg-white p-4 md:flex-row">
        <ApplicationSearchField defaultValue={q} />
        <select
          name="priority"
          defaultValue={priority ?? ""}
          className="h-10 rounded-md border border-slate-300 px-3 focus-ring"
        >
          <option value="">全部优先级</option>
          {PRIORITIES.map((item) => (
            <option key={item} value={item}>
              {PRIORITY_LABELS[item as Priority]}
            </option>
          ))}
        </select>
        <button className="h-10 rounded-md border border-slate-300 px-4 text-sm font-medium hover:bg-slate-100">
          筛选
        </button>
      </form>

      <ApplicationFilterChips
        q={q}
        priority={priority}
        status={status}
        source={source}
        city={city}
        sources={filterOptions.sources}
        cities={filterOptions.cities}
      />

      <ApplicationBoard
        grouped={grouped}
        resumes={resumes}
        query={q}
        priority={priority}
        status={status}
        source={source}
        city={city}
      />

      {selectedApplication ? (
        <ApplicationDetailModal
          application={selectedApplication}
          resumes={resumes}
          closeHref={closeHref}
        />
      ) : null}
    </AppShell>
  );
}
