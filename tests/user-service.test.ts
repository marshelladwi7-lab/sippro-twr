import { describe, it, expect } from "vitest";
import {
  loadUsers,
  getUserById,
  getUserByEmail,
  createManagedUser,
  updateManagedUser,
  resetUserPassword,
  deleteManagedUser,
  loadAuditLogs,
} from "../src/lib/services/user-service";

describe("Admin User Management & KEPI Compliance Service", () => {
  it("initializes with institutional appraisal demo accounts", () => {
    const users = loadUsers();
    expect(users.length).toBeGreaterThanOrEqual(4);

    const roles = users.map((u) => u.role);
    expect(roles).toContain("admin");
    expect(roles).toContain("penilai");
    expect(roles).toContain("reviewer");
    expect(roles).toContain("surveyor");
  });

  it("retrieves users by ID and by Email correctly", () => {
    const users = loadUsers();
    const adminUser = users.find((u) => u.role === "admin");
    expect(adminUser).toBeDefined();

    const byId = getUserById(adminUser!.id);
    expect(byId).toBeDefined();
    expect(byId?.email).toBe(adminUser!.email);

    const byEmail = getUserByEmail(adminUser!.email);
    expect(byEmail).toBeDefined();
    expect(byEmail?.id).toBe(adminUser!.id);
    expect(byEmail?.rights.canManageUsers).toBe(true);
  });

  it("creates a new managed user with defined rights and KEPI prohibitions", () => {
    const timestamp = Date.now();
    const uniqueEmail = `analis_${timestamp}@twr-valuation.id`;

    const newUser = createManagedUser({
      name: "Analis Agunan Senior",
      email: uniqueEmail,
      role: "reviewer",
      institution: "PT Bank Danamon Tbk",
      phone: "+62 811-2233-4455",
      licenseNo: "MAPPI Cert #9921",
      assignedBranch: "Credit Risk Dept",
      password: "PasswordAgunan2026!",
      rights: {
        canCreatePoi: false,
        canEditValuation: false,
        canDeletePoi: false,
        canExportData: true,
        canAccessAnalytics: true,
        canManageUsers: false,
      },
      prohibitions: {
        prohibitSelfAppraisal: true,
        prohibitUnwatermarkedExport: true,
        prohibitUnauditedPriceOverride: true,
        prohibitMassDelete: true,
      },
    });

    expect(newUser.id).toBeDefined();
    expect(newUser.email).toBe(uniqueEmail);
    expect(newUser.status).toBe("ACTIVE");
    expect(newUser.rights.canExportData).toBe(true);
    expect(newUser.prohibitions.prohibitSelfAppraisal).toBe(true);

    const retrieved = getUserByEmail(uniqueEmail);
    expect(retrieved).toBeDefined();
    expect(retrieved?.name).toBe("Analis Agunan Senior");
  });

  it("prevents creating users with duplicate emails", () => {
    expect(() =>
      createManagedUser({
        name: "Impostor Admin",
        email: "admin@twr.co.id",
        role: "admin",
      })
    ).toThrow(/sudah terdaftar/i);
  });

  it("resets user password with audit logging and validates password length", () => {
    const users = loadUsers();
    const surveyor = users.find((u) => u.role === "surveyor");
    expect(surveyor).toBeDefined();

    // Rejects short password
    expect(() => resetUserPassword(surveyor!.id, "123")).toThrow(/minimal harus 6/i);

    // Accepts valid new password
    const res = resetUserPassword(surveyor!.id, "SurveyorBaru2026#");
    expect(res.success).toBe(true);

    const updated = getUserById(surveyor!.id);
    expect(updated?.password).toBe("SurveyorBaru2026#");

    // Verify audit logs contain the reset
    const logs = loadAuditLogs();
    const resetLog = logs.find(
      (l) => l.action === "Reset Kata Sandi Pengguna" && l.targetUser === surveyor!.name
    );
    expect(resetLog).toBeDefined();
    expect(resetLog?.kepiCompliance).toBe("COMPLIANT");
  });

  it("updates user operational rights and KEPI prohibitions", () => {
    const users = loadUsers();
    const penilai = users.find((u) => u.role === "penilai");
    expect(penilai).toBeDefined();

    const updated = updateManagedUser(penilai!.id, {
      rights: {
        ...penilai!.rights,
        canDeletePoi: true,
      },
      prohibitions: {
        ...penilai!.prohibitions,
        prohibitUnauditedPriceOverride: true,
      },
    });

    expect(updated.rights.canDeletePoi).toBe(true);
    expect(updated.prohibitions.prohibitUnauditedPriceOverride).toBe(true);

    const logs = loadAuditLogs();
    const updateLog = logs.find(
      (l) => l.action === "Pembaruan Profil Pengguna" && l.targetUser === penilai!.name
    );
    expect(updateLog).toBeDefined();
  });

  it("protects primary administrator account from deletion", () => {
    const users = loadUsers();
    const adminUser = users.find((u) => u.role === "admin");
    expect(adminUser).toBeDefined();

    expect(() => deleteManagedUser(adminUser!.id)).toThrow(/Tidak dapat menghapus akun/i);
  });

  it("deletes managed user and preserves audit trail", () => {
    const timestamp = Date.now();
    const tempUser = createManagedUser({
      name: "Staf Magang Valuasi",
      email: `magang_${timestamp}@domain.com`,
      role: "guest",
    });

    expect(getUserById(tempUser.id)).toBeDefined();

    const success = deleteManagedUser(tempUser.id);
    expect(success).toBe(true);

    expect(getUserById(tempUser.id)).toBeUndefined();

    const logs = loadAuditLogs();
    const deleteLog = logs.find(
      (l) => l.action === "Penonaktifan / Hapus Pengguna" && l.targetUser === tempUser.name
    );
    expect(deleteLog).toBeDefined();
    expect(deleteLog?.kepiCompliance).toBe("AUDITED");
  });
});
