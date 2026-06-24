export const INTERVIEW_ROUNDS = [
  "FIRST_INTERVIEW",
  "SECOND_INTERVIEW",
  "HR_INTERVIEW",
  "OTHER"
] as const;

export type InterviewRound = (typeof INTERVIEW_ROUNDS)[number];

export const INTERVIEW_ROUND_LABELS: Record<InterviewRound, string> = {
  FIRST_INTERVIEW: "一面",
  SECOND_INTERVIEW: "二面",
  HR_INTERVIEW: "HR 面",
  OTHER: "其他"
};

export const INTERVIEW_DIFFICULTIES = ["EASY", "MEDIUM", "HARD"] as const;

export type InterviewDifficulty = (typeof INTERVIEW_DIFFICULTIES)[number];

export const INTERVIEW_DIFFICULTY_LABELS: Record<InterviewDifficulty, string> = {
  EASY: "简单",
  MEDIUM: "中等",
  HARD: "困难"
};

export const INTERVIEW_DIFFICULTY_STYLES: Record<InterviewDifficulty, string> = {
  EASY: "border-emerald-200 bg-emerald-50 text-emerald-700",
  MEDIUM: "border-amber-200 bg-amber-50 text-amber-700",
  HARD: "border-red-200 bg-red-50 text-red-700"
};

export const INTERVIEW_FEELINGS = ["GOOD", "OK", "BAD"] as const;

export type InterviewFeeling = (typeof INTERVIEW_FEELINGS)[number];

export const INTERVIEW_FEELING_LABELS: Record<InterviewFeeling, string> = {
  GOOD: "很好",
  OK: "一般",
  BAD: "较差"
};

export const AI_ANSWER_MODES = ["FAST", "DEEP"] as const;

export type AiAnswerMode = (typeof AI_ANSWER_MODES)[number];

export const AI_ANSWER_MODE_LABELS: Record<AiAnswerMode, string> = {
  FAST: "快速解答",
  DEEP: "深度思考"
};
