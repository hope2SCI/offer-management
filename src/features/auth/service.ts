import { AppError } from "@/lib/errors";
import { prisma } from "@/lib/prisma";
import { hashPassword, verifyPassword } from "./password";

export async function createInitialUser(username: string, password: string) {
  const existingUsers = await prisma.user.count();
  if (existingUsers > 0) {
    throw new AppError("系统已初始化，请直接登录。", 409);
  }

  const passwordHash = await hashPassword(password);
  return prisma.user.create({
    data: { username, passwordHash },
    select: { id: true, username: true }
  });
}

export async function authenticateUser(username: string, password: string) {
  const user = await prisma.user.findUnique({ where: { username } });
  if (!user) {
    throw new AppError("用户名或密码错误。", 401);
  }

  const ok = await verifyPassword(password, user.passwordHash);
  if (!ok) {
    throw new AppError("用户名或密码错误。", 401);
  }

  return { id: user.id, username: user.username };
}
