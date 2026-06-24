import type { InterviewReview, JobApplication } from "@prisma/client";
import { Badge } from "@/components/ui/badge";
import { formatDateTime } from "@/lib/date";
import {
  INTERVIEW_DIFFICULTY_LABELS,
  INTERVIEW_DIFFICULTY_STYLES,
  INTERVIEW_FEELING_LABELS,
  INTERVIEW_ROUND_LABELS,
  type InterviewDifficulty,
  type InterviewFeeling,
  type InterviewRound
} from "@/features/interviews/constants";
import { interviewExcerpt } from "@/features/interviews/view";
import { InterviewAiAnswerButton } from "./interview-ai-answer-button";
import { InterviewReviewModalButton } from "./interview-review-modal-button";

type ApplicationOption = Pick<JobApplication, "id" | "companyName" | "jobTitle">;

type ReviewWithApplication = InterviewReview & {
  jobApplication: ApplicationOption;
};

type Props = {
  applications: ApplicationOption[];
  emptyText?: string;
  reviews: ReviewWithApplication[];
};

export function InterviewReviewList({
  applications,
  emptyText = "暂无面试复盘",
  reviews
}: Props) {
  if (reviews.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">
        {emptyText}
      </div>
    );
  }

  return (
    <div className="grid gap-3">
      {reviews.map((review) => {
        const round = review.round as InterviewRound;
        const difficulty = review.difficulty as InterviewDifficulty;
        const feeling = review.feeling as InterviewFeeling;

        return (
          <article
            key={review.id}
            className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-slate-950">
                  {review.jobApplication.companyName} ·{" "}
                  {review.jobApplication.jobTitle}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  {formatDateTime(review.scheduledAt)} ·{" "}
                  {review.durationMinutes} 分钟
                </p>
              </div>
              <div className="flex flex-wrap justify-end gap-2">
                <InterviewAiAnswerButton review={review} />
                <InterviewReviewModalButton
                  applications={applications}
                  review={review}
                  variant="link"
                >
                  编辑
                </InterviewReviewModalButton>
              </div>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <Badge className="border-teal-200 bg-teal-50 text-teal-700">
                {INTERVIEW_ROUND_LABELS[round]}
              </Badge>
              <Badge className={INTERVIEW_DIFFICULTY_STYLES[difficulty]}>
                {INTERVIEW_DIFFICULTY_LABELS[difficulty]}
              </Badge>
              {review.aiAnswer ? (
                <Badge className="border-sky-200 bg-sky-50 text-sky-700">
                  已生成 AI 解答
                </Badge>
              ) : null}
            </div>
            <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-500">
              <span>评分：{review.overallRating}/5</span>
              <span>感受：{INTERVIEW_FEELING_LABELS[feeling]}</span>
            </div>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              {interviewExcerpt(review.questions)}
            </p>
          </article>
        );
      })}
    </div>
  );
}
