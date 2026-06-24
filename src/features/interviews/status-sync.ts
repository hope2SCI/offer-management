import type { ApplicationStatus } from "@/features/applications/constants";
import type { InterviewRound } from "./constants";

const INTERVIEW_STATUS_BY_ROUND: Partial<Record<InterviewRound, ApplicationStatus>> = {
  FIRST_INTERVIEW: "FIRST_INTERVIEW",
  SECOND_INTERVIEW: "SECOND_INTERVIEW",
  HR_INTERVIEW: "HR_INTERVIEW"
};

const ADVANCING_STATUS_ORDER: ApplicationStatus[] = [
  "INTERESTED",
  "APPLIED",
  "WRITTEN_TEST",
  "FIRST_INTERVIEW",
  "SECOND_INTERVIEW",
  "HR_INTERVIEW"
];

export function nextInterviewApplicationStatus(
  currentStatus: string,
  round: string
): ApplicationStatus | null {
  const targetStatus = INTERVIEW_STATUS_BY_ROUND[round as InterviewRound];
  if (!targetStatus) return null;

  const currentIndex = ADVANCING_STATUS_ORDER.indexOf(
    currentStatus as ApplicationStatus
  );
  const targetIndex = ADVANCING_STATUS_ORDER.indexOf(targetStatus);

  return currentIndex >= 0 && targetIndex > currentIndex ? targetStatus : null;
}
