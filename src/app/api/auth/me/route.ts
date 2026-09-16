import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { decodeSession, AUTH_COOKIE_NAME } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export async function GET(_request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, data: null, message: "Tidak ada sesi aktif" },
        { status: 401 }
      );
    }

    const session = decodeSession(token);
    if (!session) {
      return NextResponse.json(
        { success: false, data: null, message: "Sesi tidak valid" },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      data: session,
    });
  } catch {
    return NextResponse.json(
      { success: false, data: null, message: "Gagal memverifikasi sesi" },
      { status: 500 }
    );
  }
}
