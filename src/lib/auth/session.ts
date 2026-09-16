export type UserRole = "admin" | "penilai" | "reviewer" | "surveyor" | "guest";

export type Permission =
  | "MANAGE_USERS"
  | "EDIT_DATABASE"
  | "VALUATION_FULL"
  | "EDIT_KKP"
  | "APPROVE_KKP"
  | "REVIEW_VALUATION"
  | "VALIDATE_HAIRCUT"
  | "ADD_COMPARABLE"
  | "INSPECT_PROPERTIES"
  | "EXPORT_DATA"
  | "IMPORT_DATA"
  | "PRINT_REPORT";

export interface UserSession {
  userId: string;
  name: string;
  email: string;
  role: UserRole;
  roleTitle: string;
  institution: string;
  permissions: Permission[];
  loginAt: string;
}

export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  admin: [
    "MANAGE_USERS",
    "EDIT_DATABASE",
    "VALUATION_FULL",
    "EDIT_KKP",
    "APPROVE_KKP",
    "REVIEW_VALUATION",
    "VALIDATE_HAIRCUT",
    "ADD_COMPARABLE",
    "INSPECT_PROPERTIES",
    "EXPORT_DATA",
    "IMPORT_DATA",
    "PRINT_REPORT",
  ],
  penilai: [
    "VALUATION_FULL",
    "EDIT_KKP",
    "APPROVE_KKP",
    "ADD_COMPARABLE",
    "INSPECT_PROPERTIES",
    "EXPORT_DATA",
    "PRINT_REPORT",
  ],
  reviewer: [
    "REVIEW_VALUATION",
    "VALIDATE_HAIRCUT",
    "EXPORT_DATA",
    "PRINT_REPORT",
  ],
  surveyor: [
    "ADD_COMPARABLE",
    "INSPECT_PROPERTIES",
    "EXPORT_DATA",
  ],
  guest: [
    "EXPORT_DATA",
    "PRINT_REPORT",
  ],
};

export const DEMO_USERS: Record<UserRole, UserSession> = {
  penilai: {
    userId: "usr-penilai-01",
    name: "Budi Santoso, S.T., MAPPI (Cert.)",
    email: "penilai@twr.co.id",
    role: "penilai",
    roleTitle: "Penilai Properti Madya",
    institution: "KJPP Totok Warsito dan Rekan",
    permissions: ROLE_PERMISSIONS.penilai,
    loginAt: new Date().toISOString(),
  },
  reviewer: {
    userId: "usr-reviewer-01",
    name: "Hendra Wijaya, S.E.",
    email: "reviewer@bankmandiri.co.id",
    role: "reviewer",
    roleTitle: "VP Special Asset & Risk Committee",
    institution: "PT Bank Mandiri (Persero) Tbk",
    permissions: ROLE_PERMISSIONS.reviewer,
    loginAt: new Date().toISOString(),
  },
  surveyor: {
    userId: "usr-surveyor-01",
    name: "Ahmad Fauzi",
    email: "surveyor@twr.co.id",
    role: "surveyor",
    roleTitle: "Tenaga Inspeksi Lapangan (GIS)",
    institution: "KJPP Totok Warsito dan Rekan",
    permissions: ROLE_PERMISSIONS.surveyor,
    loginAt: new Date().toISOString(),
  },
  admin: {
    userId: "usr-admin-01",
    name: "Totok Warsito, S.E., M.Ec.Dev., MAPPI (Cert.)",
    email: "admin@twr.co.id",
    role: "admin",
    roleTitle: "Managing Partner & Penilai Publik",
    institution: "KJPP Totok Warsito dan Rekan",
    permissions: ROLE_PERMISSIONS.admin,
    loginAt: new Date().toISOString(),
  },
  guest: {
    userId: "usr-guest-01",
    name: "Tamu Penilai (Demo Sandbox)",
    email: "tamu@publik.id",
    role: "guest",
    roleTitle: "Akses Eksplorasi Publik",
    institution: "Mitra Evaluator Properti",
    permissions: ROLE_PERMISSIONS.guest,
    loginAt: new Date().toISOString(),
  },
};

export const AUTH_COOKIE_NAME = "twr_auth_session";

export function hasPermission(session: UserSession | null, permission: Permission): boolean {
  if (!session) return false;
  return session.permissions.includes(permission);
}

export function encodeSession(session: UserSession): string {
  const json = JSON.stringify(session);
  return Buffer.from(json, "utf-8").toString("base64url");
}

export function decodeSession(token: string): UserSession | null {
  try {
    const json = Buffer.from(token, "base64url").toString("utf-8");
    const parsed = JSON.parse(json);
    if (!parsed.userId || !parsed.role) return null;
    return parsed as UserSession;
  } catch {
    return null;
  }
}
