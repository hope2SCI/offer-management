import { readFile } from "fs/promises";
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/features/auth/session";
import { getResume } from "@/features/resumes/queries";

type Params = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, { params }: Params) {
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
  return new NextResponse(file, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${encodeURIComponent(resume.fileName)}"`
    }
  });
}
