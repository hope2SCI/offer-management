import { z } from "zod";

const emptyToUndefined = (value: unknown) =>
  value == null || (typeof value === "string" && value.trim() === "")
    ? undefined
    : value;

export const RESUME_MAX_FILE_SIZE = 10 * 1024 * 1024;
export const RESUME_MAX_FILE_SIZE_LABEL = "10MB";
export const RESUME_LANGUAGES = ["中文", "英文", "中英文"] as const;
export const RESUME_ACCEPTED_EXTENSIONS = [".pdf", ".doc", ".docx"] as const;
export const RESUME_ACCEPTED_MIME_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
] as const;
export const RESUME_FILE_ACCEPT = [
  ...RESUME_ACCEPTED_EXTENSIONS,
  ...RESUME_ACCEPTED_MIME_TYPES
].join(",");

type ResumeFileLike = {
  name?: string;
  size?: number;
};

export function getResumeFileValidationError(file?: ResumeFileLike | null) {
  if (!file || !file.name || !file.size) {
    return "请选择简历文件。";
  }

  const lowerName = file.name.toLowerCase();
  const hasAcceptedExtension = RESUME_ACCEPTED_EXTENSIONS.some((extension) =>
    lowerName.endsWith(extension)
  );

  if (!hasAcceptedExtension) {
    return "仅支持 PDF、DOC、DOCX 格式。";
  }

  if (file.size > RESUME_MAX_FILE_SIZE) {
    return `文件大小不能超过 ${RESUME_MAX_FILE_SIZE_LABEL}。`;
  }

  return null;
}

export const resumeUploadSchema = z.object({
  name: z.preprocess(emptyToUndefined, z.string().trim().max(160).optional()),
  version: z.preprocess(
    emptyToUndefined,
    z.string().trim().min(1, "版本必填。").max(40).default("v1.0")
  ),
  targetRole: z.preprocess(
    emptyToUndefined,
    z.string().trim().max(120).optional()
  ),
  language: z.enum(RESUME_LANGUAGES).default("中文"),
  tags: z.preprocess(emptyToUndefined, z.string().trim().max(240).optional())
});

export const resumeUpdateSchema = z.object({
  name: z.string().trim().min(1, "简历名称必填。").max(160),
  version: z.string().trim().min(1, "版本必填。").max(40),
  targetRole: z.preprocess(
    emptyToUndefined,
    z.string().trim().max(120).optional()
  ),
  language: z.enum(RESUME_LANGUAGES),
  tags: z.preprocess(emptyToUndefined, z.string().trim().max(240).optional()),
  notes: z.preprocess(emptyToUndefined, z.string().trim().max(2000).optional())
});
