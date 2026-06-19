import { readFile } from "fs/promises";
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/features/auth/session";
import { getResume } from "@/features/resumes/queries";

type Params = {
  params: Promise<{ id: string }>;
};

function getResumeContentType(fileName: string) {
  const lowerName = fileName.toLowerCase();
  if (lowerName.endsWith(".doc")) return "application/msword";
  if (lowerName.endsWith(".docx")) {
    return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
  }
  return "application/pdf";
}

export async function GET(request: Request, { params }: Params) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ message: "请先登录。" }, { status: 401 });
  }

  const { id } = await params;
  const resume = await getResume(user.id, id);

  if (!resume) {
    return NextResponse.json({ message: "简历不存在。" }, { status: 404 });
  }

  const file = await readFile(resume.filePath);
  const disposition = new URL(request.url).searchParams.has("download")
    ? "attachment"
    : "inline";

  return new NextResponse(file, {
    headers: {
      "Content-Type": getResumeContentType(resume.fileName),
      "Content-Disposition": `${disposition}; filename="${encodeURIComponent(resume.fileName)}"`
    }
  });
}
