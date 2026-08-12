import { NextResponse } from "next/server";
import { getAdminPassword, getAdminUsername, getAdminSessionSecret, createAdminSessionToken } from "@/lib/admin";

export async function POST(request: Request) {
  const { username, password } = await request.json();

  if (username === getAdminUsername() && password === getAdminPassword()) {
    const token = createAdminSessionToken(username);

    const response = NextResponse.json({ success: true });
    response.cookies.set({
      name: "admin_session",
      value: token,
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 8,
    });

    return response;
  }

  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}
