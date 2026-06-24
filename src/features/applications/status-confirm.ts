import type { ApplicationStatus } from "./constants";

const STATUS_ORDER: ApplicationStatus[] = [
  "INTERESTED",
  "APPLIED",
  "WRITTEN_TEST",
  "FIRST_INTERVIEW",
  "SECOND_INTERVIEW",
  "HR_INTERVIEW",
  "OFFER",
  "ENDED"
];

export function shouldConfirmStatusChange(
  currentStatus: string,
  targetStatus: string
) {
  const currentIndex = STATUS_ORDER.indexOf(currentStatus as ApplicationStatus);
  const targetIndex = STATUS_ORDER.indexOf(targetStatus as ApplicationStatus);

  return currentIndex >= 0 && targetIndex >= 0 && targetIndex < currentIndex;
}
