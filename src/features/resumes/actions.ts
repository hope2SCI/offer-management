"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "@/features/auth/session";
import { deleteResume, saveResumeFile, updateResume } from "./service";

export async function uploadResumeAction(formData: FormData) {
  const user = await requireUser();
  const file = formData.get("file");
  if (!(file instanceof File)) {
    throw new Error("请选择 PDF 简历文件。");
  }

  await saveResumeFile(user.id, file, String(formData.get("name") ?? ""));
  revalidatePath("/resumes");
  redirect("/resumes");
}

export async function updateResumeAction(id: string, formData: FormData) {
  const user = await requireUser();
  await updateResume(user.id, id, {
    name: formData.get("name"),
    tags: formData.get("tags"),
    notes: formData.get("notes")
  });
  revalidatePath("/resumes");
}

export async function deleteResumeAction(id: string) {
  const user = await requireUser();
  await deleteResume(user.id, id);
  revalidatePath("/resumes");
}
