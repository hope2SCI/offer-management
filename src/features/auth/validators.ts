import { z } from "zod";

export const authSchema = z.object({
  username: z.string().trim().min(2, "用户名至少需要 2 个字符。").max(40),
  password: z.string().min(6, "密码至少需要 6 个字符。").max(128)
});
