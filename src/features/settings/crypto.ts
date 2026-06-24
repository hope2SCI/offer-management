import crypto from "node:crypto";

type EncryptedValue = {
  cipher: string;
  iv: string;
  authTag: string;
};

function getSecretKey() {
  const secret =
    process.env.AI_SETTINGS_SECRET ??
    process.env.JWT_SECRET ??
    "local-development-secret-change-before-sharing";

  return crypto.createHash("sha256").update(secret).digest();
}

export function encryptSecret(value: string): EncryptedValue {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", getSecretKey(), iv);
  const encrypted = Buffer.concat([
    cipher.update(value, "utf8"),
    cipher.final()
  ]);

  return {
    cipher: encrypted.toString("base64"),
    iv: iv.toString("base64"),
    authTag: cipher.getAuthTag().toString("base64")
  };
}

export function decryptSecret(value: EncryptedValue) {
  const decipher = crypto.createDecipheriv(
    "aes-256-gcm",
    getSecretKey(),
    Buffer.from(value.iv, "base64")
  );
  decipher.setAuthTag(Buffer.from(value.authTag, "base64"));

  return Buffer.concat([
    decipher.update(Buffer.from(value.cipher, "base64")),
    decipher.final()
  ]).toString("utf8");
}
