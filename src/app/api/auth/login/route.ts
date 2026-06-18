import { NextResponse } from "next/server";
import { createSession } from "@/features/auth/session";
import { authenticateUser } from "@/features/auth/service";
import { authSchema } from "@/features/auth/validators";
import { getErrorMessage } from "@/lib/errors";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const data = authSchema.parse(body);
    const user = await authenticateUser(data.username, data.password);
    await createSession(user.id);
    return NextResponse.json({ user });
  } catch (error) {
    return NextResponse.json(
      { message: getErrorMessage(error) },
      { status: 401 }
    );
  }
}
