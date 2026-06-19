"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/features/auth/session";
import { getErrorMessage } from "@/lib/errors";
import { deleteResume, saveResumeFile, updateResume } from "./service";

export type UploadResumeFormState = {
  ok: boolean;
  message?: string;
};

export type UpdateResumeFormState = {
  ok: boolean;
  message?: string;
};

function resumeInputFromForm(formData: FormData) {
  return {
    name: formData.get("name"),
    version: formData.get("version") || "v1.0",
    targetRole: formData.get("targetRole"),
    language: formData.get("language") || "中文",
    tags: formData.get("tags")
  };
}

function optionalFileFromForm(formData: FormData) {
  const file = formData.get("file");
  if (file instanceof File && file.name && file.size > 0) return file;
  return undefined;
}

export async function uploadResumeAction(
  _state: UploadResumeFormState,
  formData: FormData
): Promise<UploadResumeFormState> {
  try {
    const user = await requireUser();
    const file = formData.get("file");
    if (!(file instanceof File)) {
      throw new Error("请选择简历文件。");
    }

    await saveResumeFile(user.id, file, resumeInputFromForm(formData));
    revalidatePath("/resumes");
    return { ok: true };
  } catch (error) {
    return { ok: false, message: getErrorMessage(error) };
  }
}

export async function updateResumeAction(id: string, formData: FormData) {
  const user = await requireUser();
  await updateResume(
    user.id,
    id,
    {
      ...resumeInputFromForm(formData),
      notes: formData.get("notes")
    },
    optionalFileFromForm(formData)
  );
  revalidatePath("/resumes");
}

export async function updateResumeInPlaceAction(
  id: string,
  _state: UpdateResumeFormState,
  formData: FormData
): Promise<UpdateResumeFormState> {
  try {
    const user = await requireUser();
    await updateResume(
      user.id,
      id,
      {
        ...resumeInputFromForm(formData),
        notes: formData.get("notes")
      },
      optionalFileFromForm(formData)
    );
    revalidatePath("/resumes");
    return { ok: true };
  } catch (error) {
    return { ok: false, message: getErrorMessage(error) };
  }
}

export async function deleteResumeAction(id: string) {
  const user = await requireUser();
  await deleteResume(user.id, id);
  revalidatePath("/resumes");
}
