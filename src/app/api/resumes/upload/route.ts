import { NextResponse } from "next/server";
import { getCurrentUser } from "@/features/auth/session";
import { saveResumeFile } from "@/features/resumes/service";
import { getErrorMessage } from "@/lib/errors";

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ message: "请先登录。" }, { status: 401 });
    }
    const formData = await request.formData();
    const file = formData.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json({ message: "请选择 PDF 简历文件。" }, { status: 400 });
    }
    const resume = await saveResumeFile(
      user.id,
      file,
      String(formData.get("name") ?? "")
    );
    return NextResponse.json({ resume });
  } catch (error) {
    return NextResponse.json(
      { message: getErrorMessage(error) },
      { status: 400 }
    );
  }
}
