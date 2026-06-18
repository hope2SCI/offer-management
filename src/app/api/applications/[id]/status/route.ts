import { NextResponse } from "next/server";
import { getCurrentUser } from "@/features/auth/session";
import { updateApplicationStatus } from "@/features/applications/service";
import { getErrorMessage } from "@/lib/errors";
import {
  type ApplicationStatus,
  type EndReason
} from "@/features/applications/constants";

type Params = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: Request, { params }: Params) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ message: "请先登录。" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const application = await updateApplicationStatus(
      user.id,
      id,
      body.status as ApplicationStatus,
      body.endReason as EndReason | undefined
    );
    return NextResponse.json({ application });
  } catch (error) {
    return NextResponse.json(
      { message: getErrorMessage(error) },
      { status: 400 }
    );
  }
}
