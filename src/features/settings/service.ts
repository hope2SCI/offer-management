import { AppError } from "@/lib/errors";
import { prisma } from "@/lib/prisma";
import { decryptSecret, encryptSecret } from "./crypto";
import { aiSettingsSchema } from "./validators";

export async function saveAiSettings(userId: string, input: unknown) {
  const data = aiSettingsSchema.parse(input);
  const encrypted = encryptSecret(data.deepseekApiKey);

  return prisma.userAiSetting.upsert({
    where: { userId },
    create: {
      userId,
      deepseekApiKeyCipher: encrypted.cipher,
      deepseekApiKeyIv: encrypted.iv,
      deepseekApiKeyAuthTag: encrypted.authTag
    },
    update: {
      deepseekApiKeyCipher: encrypted.cipher,
      deepseekApiKeyIv: encrypted.iv,
      deepseekApiKeyAuthTag: encrypted.authTag
    }
  });
}

export async function getAiSettingsStatus(userId: string) {
  const settings = await prisma.userAiSetting.findUnique({
    where: { userId },
    select: { id: true, updatedAt: true }
  });

  return {
    hasDeepseekApiKey: Boolean(settings),
    updatedAt: settings?.updatedAt ?? null
  };
}

export async function getDeepseekApiKey(userId: string) {
  const settings = await prisma.userAiSetting.findUnique({
    where: { userId }
  });
  if (!settings) throw new AppError("请先在设置中配置 Deepseek API Key。", 400);

  return decryptSecret({
    cipher: settings.deepseekApiKeyCipher,
    iv: settings.deepseekApiKeyIv,
    authTag: settings.deepseekApiKeyAuthTag
  });
}
