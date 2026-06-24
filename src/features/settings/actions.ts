"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/features/auth/session";
import { getErrorMessage } from "@/lib/errors";
import { saveAiSettings } from "./service";

export type AiSettingsFormState = {
  ok: boolean;
  message?: string;
};

export async function saveAiSettingsAction(
  _state: AiSettingsFormState,
  formData: FormData
): Promise<AiSettingsFormState> {
  try {
    const user = await requireUser();
    await saveAiSettings(user.id, {
      deepseekApiKey: formData.get("deepseekApiKey")
    });
    revalidatePath("/settings");
    return { ok: true, message: "已保存 Deepseek API Key。" };
  } catch (error) {
    return { ok: false, message: getErrorMessage(error) };
  }
}
