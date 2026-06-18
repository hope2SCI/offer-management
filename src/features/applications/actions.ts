"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "@/features/auth/session";
import { getErrorMessage } from "@/lib/errors";
import {
  createApplication,
  deleteApplication,
  updateApplication,
  updateApplicationStatus
} from "./service";
import { type ApplicationStatus, type EndReason } from "./constants";

export type CreateApplicationFormState = {
  ok: boolean;
  message?: string;
};

function applicationInputFromForm(formData: FormData) {
  return {
    companyName: formData.get("companyName"),
    jobTitle: formData.get("jobTitle"),
    status: formData.get("status") || "INTERESTED",
    endReason: formData.get("endReason"),
    priority: formData.get("priority") || "MEDIUM",
    city: formData.get("city"),
    salaryRange: formData.get("salaryRange"),
    jobUrl: formData.get("jobUrl"),
    jdContent: formData.get("jdContent"),
    source: formData.get("source"),
    notes: formData.get("notes"),
    resumeId: formData.get("resumeId")
  };
}

export async function createApplicationInPlaceAction(
  _state: CreateApplicationFormState,
  formData: FormData
): Promise<CreateApplicationFormState> {
  try {
    const user = await requireUser();
    await createApplication(user.id, applicationInputFromForm(formData));
    revalidatePath("/applications");
    revalidatePath("/dashboard");
    return { ok: true };
  } catch (error) {
    return { ok: false, message: getErrorMessage(error) };
  }
}

export async function updateApplicationInModalAction(
  id: string,
  formData: FormData
) {
  const user = await requireUser();
  await updateApplication(user.id, id, applicationInputFromForm(formData));
  revalidatePath("/applications");
  revalidatePath("/dashboard");
  const redirectTo = formData.get("redirectTo");
  if (typeof redirectTo === "string" && redirectTo.startsWith("/applications")) {
    redirect(redirectTo);
  }
}

export async function updateApplicationStatusAction(
  id: string,
  formData: FormData
) {
  const user = await requireUser();
  await updateApplicationStatus(
    user.id,
    id,
    String(formData.get("status")) as ApplicationStatus,
    (formData.get("endReason") || undefined) as EndReason | undefined
  );
  revalidatePath("/applications");
}

export async function deleteApplicationAction(id: string) {
  const user = await requireUser();
  await deleteApplication(user.id, id);
  revalidatePath("/applications");
  redirect("/applications");
}
