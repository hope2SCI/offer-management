import { NextResponse } from "next/server";
import { getCurrentUser } from "@/features/auth/session";

export async function POST() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ message: "请先登录。" }, { status: 401 });
  }

  return NextResponse.json(
    {
      message: "AI 简历建议将在后续版本接入。"
    },
    { status: 501 }
  );
}
