import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  loadUsers,
  loadAuditLogs,
  createManagedUser,
  updateManagedUser,
  resetUserPassword,
  deleteManagedUser,
} from "@/lib/services/user-service";

export const dynamic = "force-dynamic";

const CreateUserSchema = z.object({
  name: z.string().min(2, "Nama minimal 2 karakter"),
  email: z.string().email("Format email tidak valid"),
  role: z.enum(["admin", "penilai", "reviewer", "surveyor", "guest"]),
  institution: z.string().optional(),
  phone: z.string().optional(),
  licenseNo: z.string().optional(),
  assignedBranch: z.string().optional(),
  password: z.string().min(6, "Kata sandi minimal 6 karakter").optional(),
  rights: z
    .object({
      canCreatePoi: z.boolean().optional(),
      canEditValuation: z.boolean().optional(),
      canDeletePoi: z.boolean().optional(),
      canExportData: z.boolean().optional(),
      canAccessAnalytics: z.boolean().optional(),
      canManageUsers: z.boolean().optional(),
    })
    .optional(),
  prohibitions: z
    .object({
      prohibitSelfAppraisal: z.boolean().optional(),
      prohibitUnwatermarkedExport: z.boolean().optional(),
      prohibitUnauditedPriceOverride: z.boolean().optional(),
      prohibitMassDelete: z.boolean().optional(),
    })
    .optional(),
});

export async function GET() {
  try {
    const users = loadUsers();
    const auditLogs = loadAuditLogs();
    return NextResponse.json({
      success: true,
      data: users,
      auditLogs,
    });
  } catch (err: any) {
    console.error("GET /api/users error:", err);
    return NextResponse.json(
      { success: false, error: "Gagal memuat daftar pengguna sistem." },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = CreateUserSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Validasi gagal: " + parsed.error.issues.map((i) => i.message).join(", "),
        },
        { status: 400 }
      );
    }

    const newUser = createManagedUser(parsed.data as any);
    return NextResponse.json({ success: true, data: newUser });
  } catch (err: any) {
    console.error("POST /api/users error:", err);
    return NextResponse.json(
      { success: false, error: err?.message || "Gagal membuat pengguna baru." },
      { status: 400 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, action, newPassword, data } = body;

    if (!id || typeof id !== "string") {
      return NextResponse.json(
        { success: false, error: "ID pengguna wajib disertakan." },
        { status: 400 }
      );
    }

    if (action === "resetPassword") {
      if (!newPassword || typeof newPassword !== "string" || newPassword.length < 6) {
        return NextResponse.json(
          { success: false, error: "Kata sandi baru minimal harus 6 karakter." },
          { status: 400 }
        );
      }
      const res = resetUserPassword(id, newPassword);
      return NextResponse.json(res);
    }

    if (!data || typeof data !== "object") {
      return NextResponse.json(
        { success: false, error: "Data pembaruan tidak valid." },
        { status: 400 }
      );
    }

    const updated = updateManagedUser(id, data);
    return NextResponse.json({ success: true, data: updated });
  } catch (err: any) {
    console.error("PUT /api/users error:", err);
    return NextResponse.json(
      { success: false, error: err?.message || "Gagal memperbarui pengguna." },
      { status: 400 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id || typeof id !== "string") {
      return NextResponse.json(
        { success: false, error: "ID pengguna wajib disertakan." },
        { status: 400 }
      );
    }

    const deleted = deleteManagedUser(id.trim());
    return NextResponse.json({ success: deleted });
  } catch (err: any) {
    console.error("DELETE /api/users error:", err);
    return NextResponse.json(
      { success: false, error: err?.message || "Gagal menghapus pengguna." },
      { status: 400 }
    );
  }
}
