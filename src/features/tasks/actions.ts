"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/features/auth/session";
import {
  completeTask,
  createTask,
  deleteTask,
  reopenTask,
  updateTask
} from "./service";

function taskInputFromForm(formData: FormData) {
  return {
    title: formData.get("title"),
    description: formData.get("description"),
    type: formData.get("type") || "CUSTOM",
    dueAt: formData.get("dueAt"),
    jobApplicationId: formData.get("jobApplicationId")
  };
}

export async function createTaskAction(formData: FormData) {
  const user = await requireUser();
  await createTask(user.id, taskInputFromForm(formData));
  revalidatePath("/tasks");
  revalidatePath("/dashboard");
  revalidatePath("/applications");
}

export async function updateTaskAction(id: string, formData: FormData) {
  const user = await requireUser();
  await updateTask(user.id, id, taskInputFromForm(formData));
  revalidatePath("/tasks");
  revalidatePath("/dashboard");
  revalidatePath("/applications");
}

export async function completeTaskAction(id: string) {
  const user = await requireUser();
  await completeTask(user.id, id);
  revalidatePath("/tasks");
  revalidatePath("/dashboard");
  revalidatePath("/applications");
}

export async function reopenTaskAction(id: string) {
  const user = await requireUser();
  await reopenTask(user.id, id);
  revalidatePath("/tasks");
  revalidatePath("/dashboard");
  revalidatePath("/applications");
}

export async function deleteTaskAction(id: string) {
  const user = await requireUser();
  await deleteTask(user.id, id);
  revalidatePath("/tasks");
  revalidatePath("/dashboard");
  revalidatePath("/applications");
}
