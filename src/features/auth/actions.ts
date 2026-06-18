"use server";

import { redirect } from "next/navigation";
import { getErrorMessage } from "@/lib/errors";
import { authSchema } from "./validators";
import {
  clearSession,
  createSession,
  hasAnyUser,
  getCurrentUser
} from "./session";
import { authenticateUser, createInitialUser } from "./service";

function encodeError(error: unknown) {
  return encodeURIComponent(getErrorMessage(error));
}

export async function setupAction(formData: FormData) {
  const parsed = authSchema.safeParse({
    username: formData.get("username"),
    password: formData.get("password")
  });

  if (!parsed.success) {
    redirect(`/setup?error=${encodeError(parsed.error.issues[0]?.message)}`);
  }

  try {
    const user = await createInitialUser(
      parsed.data.username,
      parsed.data.password
    );
    await createSession(user.id);
  } catch (error) {
    redirect(`/setup?error=${encodeError(error)}`);
  }

  redirect("/dashboard");
}

export async function loginAction(formData: FormData) {
  const parsed = authSchema.safeParse({
    username: formData.get("username"),
    password: formData.get("password")
  });

  if (!parsed.success) {
    redirect(`/login?error=${encodeError(parsed.error.issues[0]?.message)}`);
  }

  try {
    const user = await authenticateUser(parsed.data.username, parsed.data.password);
    await createSession(user.id);
  } catch (error) {
    redirect(`/login?error=${encodeError(error)}`);
  }

  redirect("/dashboard");
}

export async function logoutAction() {
  await clearSession();
  redirect("/login");
}

export async function redirectForAuthPages(target: "login" | "setup") {
  const user = await getCurrentUser();
  if (user) redirect("/dashboard");

  const hasUser = await hasAnyUser();
  if (target === "login" && !hasUser) redirect("/setup");
  if (target === "setup" && hasUser) redirect("/login");
}
