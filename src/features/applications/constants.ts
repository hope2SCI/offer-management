export const APPLICATION_STATUSES = [
  "INTERESTED",
  "APPLIED",
  "WRITTEN_TEST",
  "FIRST_INTERVIEW",
  "SECOND_INTERVIEW",
  "HR_INTERVIEW",
  "OFFER",
  "ENDED"
] as const;

export type ApplicationStatus = (typeof APPLICATION_STATUSES)[number];

export const STATUS_LABELS: Record<ApplicationStatus, string> = {
  INTERESTED: "感兴趣",
  APPLIED: "已投递",
  WRITTEN_TEST: "笔试",
  FIRST_INTERVIEW: "一面",
  SECOND_INTERVIEW: "二面",
  HR_INTERVIEW: "HR面",
  OFFER: "Offer",
  ENDED: "已结束"
};

export const END_REASONS = [
  "REJECTED",
  "NO_RESPONSE",
  "GAVE_UP",
  "JOINED",
  "OTHER"
] as const;

export type EndReason = (typeof END_REASONS)[number];

export const END_REASON_LABELS: Record<EndReason, string> = {
  REJECTED: "被拒",
  NO_RESPONSE: "无回应",
  GAVE_UP: "放弃",
  JOINED: "已入职",
  OTHER: "其他"
};

export const PRIORITIES = ["HIGH", "MEDIUM", "LOW"] as const;

export type Priority = (typeof PRIORITIES)[number];

export const PRIORITY_LABELS: Record<Priority, string> = {
  HIGH: "高",
  MEDIUM: "中",
  LOW: "低"
};

export const PRIORITY_STYLES: Record<Priority, string> = {
  HIGH: "border-red-200 bg-red-50 text-red-700",
  MEDIUM: "border-amber-200 bg-amber-50 text-amber-700",
  LOW: "border-slate-200 bg-slate-50 text-slate-600"
};

export const APPLICATION_SOURCES = [
  "内推",
  "官网投递",
  "招聘平台",
  "其他"
] as const;

export const ACTIVITY_TYPES = {
  STATUS_CHANGED: "STATUS_CHANGED",
  NOTE_ADDED: "NOTE_ADDED",
  RESUME_LINKED: "RESUME_LINKED",
  TASK_CREATED: "TASK_CREATED",
  CUSTOM: "CUSTOM"
} as const;
