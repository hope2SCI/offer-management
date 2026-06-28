import { AppShell } from "@/components/layout/app-shell";
import { ApplicationBoard } from "@/components/application/application-board";
import { ApplicationCreateModalButton } from "@/components/application/application-create-modal-button";
import { ApplicationDetailModal } from "@/components/application/application-detail-modal";
import { ApplicationFilterChips } from "@/components/application/application-filter-chips";
import { ApplicationList } from "@/components/application/application-list";
import { ApplicationSearchField } from "@/components/application/application-search-field";
import { requireUser } from "@/features/auth/session";
import {
  getApplication,
  getApplicationFilterOptions,
  getApplicationsByStatus,
  listApplications
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
    view?: string;
    from?: string;
  }>;
};

function tabClass(active: boolean) {
  return active
    ? "rounded-md bg-teal-700 px-3 py-2 text-sm font-semibold text-white"
    : "rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100";
}

export default async function ApplicationsPage({
  searchParams
}: ApplicationsPageProps) {
  const user = await requireUser();
  const { q, priority, status, source, city, applicationId, view, from } =
    await searchParams;
  const isListView = view === "list";
  const [grouped, applications, selectedApplication, resumes, filterOptions] = await Promise.all([
    getApplicationsByStatus(user.id),
    isListView
      ? listApplications(user.id, q, priority, status, source, city)
      : Promise.resolve([]),
    applicationId ? getApplication(user.id, applicationId) : Promise.resolve(null),
    listResumeOptions(user.id),
    getApplicationFilterOptions(user.id)
  ]);

  const closeParams = new URLSearchParams();
  if (isListView) closeParams.set("view", "list");
  if (q) closeParams.set("q", q);
  if (priority) closeParams.set("priority", priority);
  if (status) closeParams.set("status", status);
  if (source) closeParams.set("source", source);
  if (city) closeParams.set("city", city);
  const closeHref =
    from === "dashboard"
      ? "/dashboard"
      : closeParams.size
        ? `/applications?${closeParams.toString()}`
        : "/applications";

  return (
    <AppShell
      username={user.username}
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
      <section className="mb-5 flex flex-wrap gap-2 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <a className={tabClass(!isListView)} href="/applications">
          看板
        </a>
        <a className={tabClass(isListView)} href="/applications?view=list">
          列表
        </a>
      </section>

      {isListView ? (
        <>
          <form className="mb-5 flex flex-col gap-3 rounded-lg border border-slate-200 bg-white p-4 md:flex-row">
            <input type="hidden" name="view" value="list" />
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
            view="list"
            sources={filterOptions.sources}
            cities={filterOptions.cities}
          />

          <ApplicationList
            applications={applications}
            detailBaseQuery={closeParams.toString()}
          />
        </>
      ) : (
        <ApplicationBoard grouped={grouped} resumes={resumes} />
      )}

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
