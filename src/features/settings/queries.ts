import { getAiSettingsStatus } from "./service";

export async function getSettingsPageData(userId: string) {
  return getAiSettingsStatus(userId);
}
