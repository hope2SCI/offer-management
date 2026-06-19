import { randomUUID } from "crypto";
import { mkdir, unlink, writeFile } from "fs/promises";
import path from "path";
import { prisma } from "@/lib/prisma";
import { AppError } from "@/lib/errors";
import {
  getResumeFileValidationError,
  resumeUpdateSchema,
  resumeUploadSchema
} from "./validators";

const RESUME_DIR = path.join(process.cwd(), "uploads", "resumes");

function sanitizeFileName(fileName: string) {
  return fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
}

async function storeResumeFile(file: File) {
  await mkdir(RESUME_DIR, { recursive: true });
  const storedFileName = `${randomUUID()}-${sanitizeFileName(file.name)}`;
  const filePath = path.join(RESUME_DIR, storedFileName);
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(filePath, buffer);

  return {
    fileName: file.name,
    filePath,
    fileSize: file.size
  };
}

export async function saveResumeFile(
  userId: string,
  file: File,
  input: unknown
) {
  const data = resumeUploadSchema.parse(input);
  const fileError = getResumeFileValidationError(file);
  if (fileError) throw new AppError(fileError);

  const storedFile = await storeResumeFile(file);

  return prisma.resume.create({
    data: {
      userId,
      name: data.name || file.name.replace(/\.(pdf|docx?)$/i, ""),
      version: data.version,
      targetRole: data.targetRole,
      language: data.language,
      tags: data.tags,
      ...storedFile
    }
  });
}

export async function updateResume(
  userId: string,
  id: string,
  input: unknown,
  file?: File
) {
  const data = resumeUpdateSchema.parse(input);
  const existing = await prisma.resume.findFirst({
    where: { id, userId },
    select: { id: true, filePath: true }
  });
  if (!existing) throw new AppError("Resume not found.", 404);

  const fileError = file ? getResumeFileValidationError(file) : null;
  if (fileError) throw new AppError(fileError);

  const storedFile = file ? await storeResumeFile(file) : null;

  try {
    const updated = await prisma.resume.update({
      where: { id },
      data: {
        ...data,
        ...(storedFile ?? {})
      }
    });

    if (storedFile) {
      try {
        await unlink(existing.filePath);
      } catch {
        // The old file may already be gone; the updated database record is authoritative.
      }
    }

    return updated;
  } catch (error) {
    if (storedFile) {
      try {
        await unlink(storedFile.filePath);
      } catch {
        // Best-effort cleanup if the database update failed after writing a replacement.
      }
    }
    throw error;
  }
}

export async function deleteResume(userId: string, id: string) {
  const resume = await prisma.resume.findFirst({ where: { id, userId } });
  if (!resume) throw new AppError("Resume not found.", 404);

  await prisma.resume.delete({ where: { id } });

  try {
    await unlink(resume.filePath);
  } catch {
    // File may have been moved or already deleted; the database record is authoritative.
  }
}
