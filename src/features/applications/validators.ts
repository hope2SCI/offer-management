import { z } from "zod";
import {
  APPLICATION_STATUSES,
  END_REASONS,
  PRIORITIES
} from "./constants";

const emptyToUndefined = (value: unknown) =>
  value == null || (typeof value === "string" && value.trim() === "")
    ? undefined
    : value;

export const applicationSchema = z
  .object({
    companyName: z.string().trim().min(1, "公司名必填。").max(120),
    jobTitle: z.string().trim().min(1, "岗位名必填。").max(160),
    status: z.enum(APPLICATION_STATUSES).default("INTERESTED"),
    endReason: z.preprocess(emptyToUndefined, z.enum(END_REASONS).optional()),
    priority: z.enum(PRIORITIES).default("MEDIUM"),
    city: z.preprocess(emptyToUndefined, z.string().trim().max(80).optional()),
    salaryRange: z.preprocess(emptyToUndefined, z.string().trim().max(80).optional()),
    jobUrl: z.preprocess(emptyToUndefined, z.string().trim().url("请输入有效链接。").optional()),
    jdContent: z.preprocess(emptyToUndefined, z.string().trim().max(12000).optional()),
    source: z.preprocess(emptyToUndefined, z.string().trim().max(80).optional()),
    notes: z.preprocess(emptyToUndefined, z.string().trim().max(5000).optional()),
    resumeId: z.preprocess(emptyToUndefined, z.string().trim().optional())
  })
  .superRefine((data, ctx) => {
    if (data.status === "ENDED" && !data.endReason) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["endReason"],
        message: "已结束岗位需要选择结束原因。"
      });
    }
  });

export const statusUpdateSchema = z
  .object({
    status: z.enum(APPLICATION_STATUSES),
    endReason: z.preprocess(emptyToUndefined, z.enum(END_REASONS).optional())
  })
  .superRefine((data, ctx) => {
    if (data.status === "ENDED" && !data.endReason) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["endReason"],
        message: "已结束岗位需要选择结束原因。"
      });
    }
  });
