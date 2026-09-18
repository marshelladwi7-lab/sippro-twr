import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { z } from "zod";
import { DEMO_USERS, encodeSession, AUTH_COOKIE_NAME, UserRole, UserSession } from "@/lib/auth/session";
import { getUserByEmail, logAuditAction } from "@/lib/services/user-service";

const LoginSchema = z.object({
  role: z.enum(["admin", "penilai", "reviewer", "surveyor", "guest"]).optional(),
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
          error: "Format kredensial tidak valid.",
        },
        { status: 400 }
      );
    }

    const { role, customName, username, password } = parsed.data;

    let targetUser: UserSession | null = null;

    // 1. Try finding by email/username in managed user store
    if (username) {
      const managed = getUserByEmail(username);
      if (managed) {
        if (managed.status === "SUSPENDED") {
          return NextResponse.json(
            { success: false, error: "Akun ini sedang ditangguhkan oleh Administrator." },
            { status: 403 }
          );
        }
        if (password && managed.password && managed.password !== password) {
          return NextResponse.json(
            { success: false, error: "Kata sandi yang dimasukkan keliru." },
            { status: 401 }
          );
        }
        targetUser = {
          userId: managed.id,
          name: managed.name,
          email: managed.email,
          role: managed.role,
          roleTitle: managed.roleTitle,
          institution: managed.institution,
          permissions: managed.permissions,
          loginAt: new Date().toISOString(),
        };
      }
    }

    // 2. Fallback to role-based persona preset
    if (!targetUser) {
      const selectedRole = role || "penilai";
      const baseUser = DEMO_USERS[selectedRole as UserRole];
      targetUser = {
        ...baseUser,
        name: customName?.trim() || baseUser.name,
        loginAt: new Date().toISOString(),
      };
    }

    const token = encodeSession(targetUser);

    const cookieStore = await cookies();
    cookieStore.set(AUTH_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });

    logAuditAction({
      actorName: targetUser.name,
      actorRole: targetUser.role,
      action: "Otentikasi Pengguna",
      detail: `Sesi login aktif untuk peran ${targetUser.roleTitle}`,
      kepiCompliance: "COMPLIANT",
      ipAddress: "127.0.0.1",
    });

    return NextResponse.json({
      success: true,
      data: targetUser,
    });
  } catch (err: any) {
    console.error("POST /api/auth/login error:", err);
    return NextResponse.json(
      {
        success: false,
        error: "Terjadi kesalahan internal pada proses login.",
      },
      { status: 500 }
    );
  }
}
