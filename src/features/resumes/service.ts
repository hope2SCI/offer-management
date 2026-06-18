import { randomUUID } from "crypto";
import { mkdir, unlink, writeFile } from "fs/promises";
import path from "path";
import { prisma } from "@/lib/prisma";
import { AppError } from "@/lib/errors";
import { resumeUpdateSchema } from "./validators";

const RESUME_DIR = path.join(process.cwd(), "uploads", "resumes");

function sanitizeFileName(fileName: string) {
  return fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
}

export async function saveResumeFile(
  userId: string,
  file: File,
  name?: string | null
) {
  if (!file || file.size === 0) throw new AppError("Please select a PDF file.");
  const lowerName = file.name.toLowerCase();
  if (file.type !== "application/pdf" && !lowerName.endsWith(".pdf")) {
    throw new AppError("Only PDF files are supported.");
  }

  await mkdir(RESUME_DIR, { recursive: true });
  const storedFileName = `${randomUUID()}-${sanitizeFileName(file.name)}`;
  const filePath = path.join(RESUME_DIR, storedFileName);
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(filePath, buffer);

  return prisma.resume.create({
    data: {
      userId,
      name: name?.trim() || file.name.replace(/\.pdf$/i, ""),
      fileName: file.name,
      filePath,
      fileSize: file.size
    }
  });
}

export async function updateResume(userId: string, id: string, input: unknown) {
  const data = resumeUpdateSchema.parse(input);
  const existing = await prisma.resume.findFirst({
    where: { id, userId },
    select: { id: true }
  });
  if (!existing) throw new AppError("Resume not found.", 404);

  return prisma.resume.update({
    where: { id },
    data
  });
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
