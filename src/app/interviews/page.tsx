import { AppShell } from "@/components/layout/app-shell";
import { InterviewReviewList } from "@/components/interview/interview-review-list";
import { InterviewReviewModalButton } from "@/components/interview/interview-review-modal-button";
import { requireUser } from "@/features/auth/session";
import { listApplicationOptions } from "@/features/applications/queries";
import {
  INTERVIEW_ROUNDS,
  INTERVIEW_ROUND_LABELS
} from "@/features/interviews/constants";
import { listInterviewReviews } from "@/features/interviews/queries";

type InterviewsPageProps = {
  searchParams: Promise<{
    q?: string;
    round?: string;
  }>;
};

export default async function InterviewsPage({
  searchParams
}: InterviewsPageProps) {
  const user = await requireUser();
  const { q, round } = await searchParams;
  const [applications, reviews] = await Promise.all([
    listApplicationOptions(user.id),
    listInterviewReviews(user.id, q, round)
  ]);

  return (
    <AppShell
      username={user.username}
      title="面试复盘"
      description="记录每次面试遇到的问题、整体评价和个人总结。"
      action={<InterviewReviewModalButton applications={applications} />}
    >
      <form className="mb-5 flex flex-col gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm md:flex-row">
        <input
          name="q"
          defaultValue={q ?? ""}
          placeholder="搜索公司、岗位、问题或备注"
          className="h-10 flex-1 rounded-md border border-slate-300 px-3 focus-ring"
        />
        <select
          name="round"
          defaultValue={round ?? ""}
          className="h-10 rounded-md border border-slate-300 px-3 focus-ring"
        >
          <option value="">全部轮次</option>
          {INTERVIEW_ROUNDS.map((item) => (
            <option key={item} value={item}>
              {INTERVIEW_ROUND_LABELS[item]}
            </option>
          ))}
        </select>
        <button className="h-10 rounded-md border border-slate-300 px-4 text-sm font-medium hover:bg-slate-100">
          搜索
        </button>
      </form>

      <section className="mb-5 rounded-lg border border-teal-100 bg-teal-50 p-4 text-sm text-teal-800">
        积累复盘后，可用于 AI 总结高频问题和建议回答。
      </section>

      <InterviewReviewList
        applications={applications}
        reviews={reviews}
        emptyText="还没有面试复盘，记录第一次面试吧。"
      />
    </AppShell>
  );
}
