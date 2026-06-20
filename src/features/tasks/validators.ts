import { z } from "zod";
import { TASK_TYPES } from "./constants";

const emptyToUndefined = (value: unknown) =>
  value == null || (typeof value === "string" && value.trim() === "")
    ? undefined
    : value;

export const taskSchema = z.object({
  title: z.string().trim().min(1, "待办标题必填。").max(160),
  description: z.preprocess(emptyToUndefined, z.string().trim().max(2000).optional()),
  type: z.enum(TASK_TYPES).default("CUSTOM"),
  dueAt: z.string().min(1, "请选择日期。"),
  jobApplicationId: z.preprocess(emptyToUndefined, z.string().trim().optional())
});
