import { z } from "zod";

export const aiSettingsSchema = z.object({
  deepseekApiKey: z
    .string()
    .trim()
    .min(1, "请输入 Deepseek API Key。")
    .max(300, "API Key 太长。")
});
