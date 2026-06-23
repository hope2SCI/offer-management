import { z } from "zod";
import {
  INTERVIEW_DIFFICULTIES,
  INTERVIEW_FEELINGS,
  INTERVIEW_ROUNDS
} from "./constants";

const emptyToUndefined = (value: unknown) =>
  value == null || (typeof value === "string" && value.trim() === "")
    ? undefined
    : value;

const positiveInteger = (label: string) =>
  z.coerce.number({ invalid_type_error: `${label}必须是数字` }).int().min(1);

export const interviewReviewSchema = z
  .object({
    jobApplicationId: z.string().trim().min(1, "请选择关联岗位。"),
    round: z.enum(INTERVIEW_ROUNDS),
    scheduledAt: z.string().trim().min(1, "请选择面试开始时间。"),
    durationMinutes: positiveInteger("持续时长"),
    overallRating: z.coerce.number().int().min(1).max(5),
    difficulty: z.enum(INTERVIEW_DIFFICULTIES),
    feeling: z.enum(INTERVIEW_FEELINGS),
    questions: z.preprocess(
      emptyToUndefined,
      z.string().trim().max(10000).optional()
    ),
    notes: z.preprocess(
      emptyToUndefined,
      z.string().trim().max(10000).optional()
    )
  })
  .refine((data) => data.questions || data.notes, {
    message: "请至少填写问题记录或备注总结。",
    path: ["questions"]
  });
