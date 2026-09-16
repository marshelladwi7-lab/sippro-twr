import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { z } from "zod";
import { DEMO_USERS, encodeSession, AUTH_COOKIE_NAME, UserRole } from "@/lib/auth/session";

const LoginSchema = z.object({
  role: z.enum(["admin", "penilai", "reviewer", "surveyor", "guest"]),
  customName: z.string().optional(),
  username: z.string().optional(),
  password: z.string().optional(),
});

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = LoginSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Format autentikasi tidak valid. Peran harus dipilih.",
        },
        { status: 400 }
      );
    }

    const { role, customName } = parsed.data;
    const baseUser = DEMO_USERS[role as UserRole];

    const sessionData = {
      ...baseUser,
      name: customName?.trim() || baseUser.name,
      loginAt: new Date().toISOString(),
    };

    const token = encodeSession(sessionData);

    const cookieStore = await cookies();
    cookieStore.set(AUTH_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });

    return NextResponse.json({
      success: true,
      data: sessionData,
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        success: false,
        error: "Terjadi kesalahan internal pada proses login.",
      },
      { status: 500 }
    );
  }
}
