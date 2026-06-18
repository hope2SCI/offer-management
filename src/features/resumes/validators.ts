import { z } from "zod";

const emptyToUndefined = (value: unknown) =>
  value == null || (typeof value === "string" && value.trim() === "")
    ? undefined
    : value;

export const resumeUpdateSchema = z.object({
  name: z.string().trim().min(1, "简历名称必填。").max(160),
  tags: z.preprocess(emptyToUndefined, z.string().trim().max(240).optional()),
  notes: z.preprocess(emptyToUndefined, z.string().trim().max(2000).optional())
});
