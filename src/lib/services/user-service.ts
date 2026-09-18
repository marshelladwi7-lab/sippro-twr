import * as fs from "fs";
import * as path from "path";
import * as os from "os";
import { UserRole, Permission, ROLE_PERMISSIONS, DEMO_USERS } from "@/lib/auth/session";

export interface UserOperationalRights {
  canCreatePoi: boolean;
  canEditValuation: boolean;
  canDeletePoi: boolean;
  canExportData: boolean;
  canAccessAnalytics: boolean;
  canManageUsers: boolean;
}

export interface KepiProhibitions {
  prohibitSelfAppraisal: boolean;
  prohibitUnwatermarkedExport: boolean;
  prohibitUnauditedPriceOverride: boolean;
  prohibitMassDelete: boolean;
}

export interface ManagedUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  roleTitle: string;
  institution: string;
  phone: string;
  licenseNo?: string;
  assignedBranch?: string;
  status: "ACTIVE" | "SUSPENDED" | "PENDING";
  password?: string;
  permissions: Permission[];
  rights: UserOperationalRights;
  prohibitions: KepiProhibitions;
  createdAt: string;
  lastActive: string;
  lastLoginIp?: string;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  actorName: string;
  actorRole: string;
  action: string;
  targetUser?: string;
  detail: string;
  kepiCompliance: "COMPLIANT" | "FLAGGED" | "AUDITED";
  ipAddress: string;
}

const DATA_DIR = path.resolve(process.cwd(), "data");
const USERS_FILE = path.join(DATA_DIR, "users.json");
const TMP_USERS_FILE = path.join(os.tmpdir(), "twr_users.json");
const AUDIT_FILE = path.join(DATA_DIR, "audit_logs.json");
const TMP_AUDIT_FILE = path.join(os.tmpdir(), "twr_audit_logs.json");

const DEFAULT_RIGHTS_BY_ROLE: Record<UserRole, UserOperationalRights> = {
  admin: {
    canCreatePoi: true,
    canEditValuation: true,
    canDeletePoi: true,
    canExportData: true,
    canAccessAnalytics: true,
    canManageUsers: true,
  },
  penilai: {
    canCreatePoi: true,
    canEditValuation: true,
    canDeletePoi: false,
    canExportData: true,
    canAccessAnalytics: true,
    canManageUsers: false,
  },
  reviewer: {
    canCreatePoi: false,
    canEditValuation: false,
    canDeletePoi: false,
    canExportData: true,
    canAccessAnalytics: true,
    canManageUsers: false,
  },
  surveyor: {
    canCreatePoi: true,
    canEditValuation: false,
    canDeletePoi: false,
    canExportData: false,
    canAccessAnalytics: false,
    canManageUsers: false,
  },
  guest: {
    canCreatePoi: false,
    canEditValuation: false,
    canDeletePoi: false,
    canExportData: false,
    canAccessAnalytics: true,
    canManageUsers: false,
  },
};

const DEFAULT_PROHIBITIONS_BY_ROLE: Record<UserRole, KepiProhibitions> = {
  admin: {
    prohibitSelfAppraisal: true,
    prohibitUnwatermarkedExport: false,
    prohibitUnauditedPriceOverride: false,
    prohibitMassDelete: false,
  },
  penilai: {
    prohibitSelfAppraisal: true,
    prohibitUnwatermarkedExport: true,
    prohibitUnauditedPriceOverride: true,
    prohibitMassDelete: true,
  },
  reviewer: {
    prohibitSelfAppraisal: true,
    prohibitUnwatermarkedExport: true,
    prohibitUnauditedPriceOverride: true,
    prohibitMassDelete: true,
  },
  surveyor: {
    prohibitSelfAppraisal: true,
    prohibitUnwatermarkedExport: true,
    prohibitUnauditedPriceOverride: true,
    prohibitMassDelete: true,
  },
  guest: {
    prohibitSelfAppraisal: true,
    prohibitUnwatermarkedExport: true,
    prohibitUnauditedPriceOverride: true,
    prohibitMassDelete: true,
  },
};

export const INITIAL_MANAGED_USERS: ManagedUser[] = [
  {
    id: "usr-admin-01",
    name: "Totok Warsito, S.E., M.Ec.Dev., MAPPI (Cert.)",
    email: "admin@twr.co.id",
    role: "admin",
    roleTitle: "Managing Partner & Penilai Publik",
    institution: "KJPP Totok Warsito dan Rekan",
    phone: "+62 811-2345-678",
    licenseNo: "MAPPI 98-S-00812 / KMK No. 512/KM.1/2014",
    assignedBranch: "Kantor Pusat Jakarta & Cabang Bekasi",
    status: "ACTIVE",
    password: "password123",
    permissions: ROLE_PERMISSIONS.admin,
    rights: DEFAULT_RIGHTS_BY_ROLE.admin,
    prohibitions: DEFAULT_PROHIBITIONS_BY_ROLE.admin,
    createdAt: "2024-01-15T08:00:00.000Z",
    lastActive: "Baru saja aktif",
    lastLoginIp: "103.28.114.22",
  },
  {
    id: "usr-penilai-01",
    name: "Budi Santoso, S.T., MAPPI (Cert.)",
    email: "penilai@twr.co.id",
    role: "penilai",
    roleTitle: "Penilai Properti Madya (SPI 106)",
    institution: "KJPP Totok Warsito dan Rekan",
    phone: "+62 812-3456-7890",
    licenseNo: "MAPPI 14-P-02451",
    assignedBranch: "Cabang Cikarang & Karawang",
    status: "ACTIVE",
    password: "password123",
    permissions: ROLE_PERMISSIONS.penilai,
    rights: DEFAULT_RIGHTS_BY_ROLE.penilai,
    prohibitions: DEFAULT_PROHIBITIONS_BY_ROLE.penilai,
    createdAt: "2024-03-10T09:30:00.000Z",
    lastActive: "15 menit lalu",
    lastLoginIp: "182.253.16.45",
  },
  {
    id: "usr-reviewer-01",
    name: "Hendra Wijaya, S.E.",
    email: "reviewer@bankmandiri.co.id",
    role: "reviewer",
    roleTitle: "VP Special Asset & Collateral Risk",
    institution: "PT Bank Mandiri (Persero) Tbk",
    phone: "+62 813-9876-5432",
    licenseNo: "FRM / Certified Banking Risk Officer",
    assignedBranch: "Wholesale Credit Risk Dept",
    status: "ACTIVE",
    password: "password123",
    permissions: ROLE_PERMISSIONS.reviewer,
    rights: DEFAULT_RIGHTS_BY_ROLE.reviewer,
    prohibitions: DEFAULT_PROHIBITIONS_BY_ROLE.reviewer,
    createdAt: "2024-05-02T14:15:00.000Z",
    lastActive: "2 jam lalu",
    lastLoginIp: "103.10.67.89",
  },
  {
    id: "usr-surveyor-01",
    name: "Ahmad Fauzi",
    email: "surveyor@twr.co.id",
    role: "surveyor",
    roleTitle: "Tenaga Inspeksi Lapangan (GIS & Geotagging)",
    institution: "KJPP Totok Warsito dan Rekan",
    phone: "+62 856-7890-1234",
    licenseNo: "Teknisi Geospasial Pratama",
    assignedBranch: "Area Operasional Jabodetabek",
    status: "ACTIVE",
    password: "password123",
    permissions: ROLE_PERMISSIONS.surveyor,
    rights: DEFAULT_RIGHTS_BY_ROLE.surveyor,
    prohibitions: DEFAULT_PROHIBITIONS_BY_ROLE.surveyor,
    createdAt: "2024-06-20T10:00:00.000Z",
    lastActive: "Hari ini, 07:15",
    lastLoginIp: "114.124.200.11",
  },
  {
    id: "usr-guest-01",
    name: "Mitra Evaluator Publik",
    email: "tamu@publik.id",
    role: "guest",
    roleTitle: "Akses Eksplorasi Demo & Observasi",
    institution: "Mitra Evaluator Properti",
    phone: "-",
    assignedBranch: "Sandbox Nasional",
    status: "ACTIVE",
    password: "password123",
    permissions: ROLE_PERMISSIONS.guest,
    rights: DEFAULT_RIGHTS_BY_ROLE.guest,
    prohibitions: DEFAULT_PROHIBITIONS_BY_ROLE.guest,
    createdAt: "2024-08-01T12:00:00.000Z",
    lastActive: "Kemarin",
    lastLoginIp: "36.88.92.140",
  },
];

export const INITIAL_AUDIT_LOGS: AuditLogEntry[] = [
  {
    id: "aud-01",
    timestamp: "18 Sep 2026 09:10",
    actorName: "Totok Warsito (Admin)",
    actorRole: "admin",
    action: "Governance Policy Check",
    detail: "Audit kepatuhan KEPI dan POJK 40/POJK.03/2019 berhasil diverifikasi",
    kepiCompliance: "COMPLIANT",
    ipAddress: "103.28.114.22",
  },
  {
    id: "aud-02",
    timestamp: "18 Sep 2026 03:05",
    actorName: "Budi Santoso",
    actorRole: "penilai",
    action: "Login Sesi Aman",
    detail: "Otentikasi berhasil via HTTP-only cookie berenkripsi",
    kepiCompliance: "COMPLIANT",
    ipAddress: "182.253.16.45",
  },
  {
    id: "aud-03",
    timestamp: "18 Sep 2026 02:40",
    actorName: "Budi Santoso",
    actorRole: "penilai",
    action: "Ekspor Spreadsheet",
    detail: "Unduh file Excel resmi Bank Data 1.511 titik dengan stempel metadata",
    kepiCompliance: "COMPLIANT",
    ipAddress: "182.253.16.45",
  },
  {
    id: "aud-04",
    timestamp: "17 Sep 2026 21:15",
    actorName: "Ahmad Fauzi",
    actorRole: "surveyor",
    action: "Tambah Titik Geotagging",
    detail: "Penambahan koordinat objek Lat: -6.395972, Lng: 107.173722 (Cikarang)",
    kepiCompliance: "COMPLIANT",
    ipAddress: "114.124.200.11",
  },
];

let cachedUsers: ManagedUser[] | null = null;
let cachedAuditLogs: AuditLogEntry[] | null = null;

export function loadUsers(): ManagedUser[] {
  if (cachedUsers && cachedUsers.length > 0) return cachedUsers;

  // 1. Try tmpdir
  try {
    if (fs.existsSync(TMP_USERS_FILE)) {
      const raw = fs.readFileSync(TMP_USERS_FILE, "utf-8");
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        cachedUsers = parsed;
        return cachedUsers;
      }
    }
  } catch {}

  // 2. Try DATA_DIR
  try {
    if (fs.existsSync(USERS_FILE)) {
      const raw = fs.readFileSync(USERS_FILE, "utf-8");
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        cachedUsers = parsed;
        return cachedUsers;
      }
    }
  } catch {}

  // 3. Fallback to initial
  cachedUsers = INITIAL_MANAGED_USERS;
  saveUsers(cachedUsers);
  return cachedUsers;
}

export function saveUsers(users: ManagedUser[]): void {
  cachedUsers = users;

  // Write to tmpdir (safe on Vercel)
  try {
    fs.writeFileSync(TMP_USERS_FILE, JSON.stringify(users, null, 2), "utf-8");
  } catch {}

  // Write to data dir if writable
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), "utf-8");
  } catch {}
}

export function loadAuditLogs(): AuditLogEntry[] {
  if (cachedAuditLogs && cachedAuditLogs.length > 0) return cachedAuditLogs;

  try {
    if (fs.existsSync(TMP_AUDIT_FILE)) {
      const raw = fs.readFileSync(TMP_AUDIT_FILE, "utf-8");
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        cachedAuditLogs = parsed;
        return cachedAuditLogs;
      }
    }
  } catch {}

  try {
    if (fs.existsSync(AUDIT_FILE)) {
      const raw = fs.readFileSync(AUDIT_FILE, "utf-8");
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        cachedAuditLogs = parsed;
        return cachedAuditLogs;
      }
    }
  } catch {}

  cachedAuditLogs = INITIAL_AUDIT_LOGS;
  return cachedAuditLogs;
}

export function logAuditAction(entry: Omit<AuditLogEntry, "id" | "timestamp">): void {
  const allLogs = loadAuditLogs();
  const newEntry: AuditLogEntry = {
    ...entry,
    id: `aud-${Date.now()}`,
    timestamp: new Date().toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }),
  };

  allLogs.unshift(newEntry);
  cachedAuditLogs = allLogs.slice(0, 50);

  try {
    fs.writeFileSync(TMP_AUDIT_FILE, JSON.stringify(cachedAuditLogs, null, 2), "utf-8");
  } catch {}
  try {
    if (fs.existsSync(DATA_DIR)) {
      fs.writeFileSync(AUDIT_FILE, JSON.stringify(cachedAuditLogs, null, 2), "utf-8");
    }
  } catch {}
}

export function getUserById(id: string): ManagedUser | undefined {
  const users = loadUsers();
  return users.find((u) => u.id === id);
}

export function getUserByEmail(email: string): ManagedUser | undefined {
  const users = loadUsers();
  return users.find((u) => u.email.toLowerCase() === email.toLowerCase());
}

export function createManagedUser(data: {
  name: string;
  email: string;
  role: UserRole;
  institution?: string;
  phone?: string;
  licenseNo?: string;
  assignedBranch?: string;
  password?: string;
  rights?: Partial<UserOperationalRights>;
  prohibitions?: Partial<KepiProhibitions>;
}): ManagedUser {
  const users = loadUsers();
  const existing = users.find((u) => u.email.toLowerCase() === data.email.toLowerCase());
  if (existing) {
    throw new Error(`Email ${data.email} sudah terdaftar dalam sistem.`);
  }

  const roleTitleMap: Record<UserRole, string> = {
    admin: "Managing Partner / Administrator",
    penilai: "Penilai Properti Madya (SPI 106)",
    reviewer: "Credit Risk & Collateral Reviewer",
    surveyor: "Surveyor Inspeksi Lapangan (GIS)",
    guest: "Mitra Evaluator Publik",
  };

  const newUser: ManagedUser = {
    id: `usr-${Date.now().toString().slice(-6)}`,
    name: data.name.trim(),
    email: data.email.trim().toLowerCase(),
    role: data.role,
    roleTitle: roleTitleMap[data.role] || "Pengguna Terdaftar",
    institution: data.institution?.trim() || "KJPP Totok Warsito dan Rekan",
    phone: data.phone?.trim() || "-",
    licenseNo: data.licenseNo?.trim(),
    assignedBranch: data.assignedBranch?.trim() || "Kantor Pusat",
    status: "ACTIVE",
    password: data.password || "password123",
    permissions: ROLE_PERMISSIONS[data.role],
    rights: {
      ...DEFAULT_RIGHTS_BY_ROLE[data.role],
      ...(data.rights || {}),
    },
    prohibitions: {
      ...DEFAULT_PROHIBITIONS_BY_ROLE[data.role],
      ...(data.prohibitions || {}),
    },
    createdAt: new Date().toISOString(),
    lastActive: "Baru dibuat",
    lastLoginIp: "-",
  };

  users.unshift(newUser);
  saveUsers(users);

  logAuditAction({
    actorName: "Administrator",
    actorRole: "admin",
    action: "Pendaftaran Pengguna Baru",
    targetUser: newUser.name,
    detail: `Akun baru dibuat dengan peran: ${newUser.role} (${newUser.email})`,
    kepiCompliance: "COMPLIANT",
    ipAddress: "127.0.0.1",
  });

  return newUser;
}

export function updateManagedUser(
  id: string,
  data: Partial<ManagedUser>
): ManagedUser {
  const users = loadUsers();
  const idx = users.findIndex((u) => u.id === id);
  if (idx === -1) {
    throw new Error(`Pengguna dengan ID ${id} tidak ditemukan.`);
  }

  const prev = users[idx];
  const updated: ManagedUser = {
    ...prev,
    ...data,
    // Preserve core fields unless explicitly changed
    id: prev.id,
    permissions: data.role ? ROLE_PERMISSIONS[data.role] : prev.permissions,
    rights: {
      ...prev.rights,
      ...(data.rights || {}),
    },
    prohibitions: {
      ...prev.prohibitions,
      ...(data.prohibitions || {}),
    },
  };

  users[idx] = updated;
  saveUsers(users);

  logAuditAction({
    actorName: "Administrator",
    actorRole: "admin",
    action: "Pembaruan Profil Pengguna",
    targetUser: updated.name,
    detail: `Pembaruan data akun: status=${updated.status}, role=${updated.role}`,
    kepiCompliance: "COMPLIANT",
    ipAddress: "127.0.0.1",
  });

  return updated;
}

export function resetUserPassword(
  id: string,
  newPassword: string
): { success: boolean; message: string } {
  if (!newPassword || newPassword.length < 6) {
    throw new Error("Kata sandi minimal harus 6 karakter.");
  }

  const users = loadUsers();
  const idx = users.findIndex((u) => u.id === id);
  if (idx === -1) {
    throw new Error(`Pengguna dengan ID ${id} tidak ditemukan.`);
  }

  users[idx].password = newPassword;
  saveUsers(users);

  logAuditAction({
    actorName: "Administrator",
    actorRole: "admin",
    action: "Reset Kata Sandi Pengguna",
    targetUser: users[idx].name,
    detail: `Kata sandi direset secara administratif untuk ${users[idx].email}`,
    kepiCompliance: "COMPLIANT",
    ipAddress: "127.0.0.1",
  });

  return { success: true, message: `Kata sandi untuk ${users[idx].name} berhasil diperbarui.` };
}

export function deleteManagedUser(id: string): boolean {
  const users = loadUsers();
  const user = users.find((u) => u.id === id);
  if (!user) return false;

  if (user.role === "admin") {
    throw new Error("Tidak dapat menghapus akun Managing Partner / Administrator utama.");
  }

  const filtered = users.filter((u) => u.id !== id);
  saveUsers(filtered);

  logAuditAction({
    actorName: "Administrator",
    actorRole: "admin",
    action: "Penonaktifan / Hapus Pengguna",
    targetUser: user.name,
    detail: `Akun ${user.email} (${user.role}) dihapus dari sistem`,
    kepiCompliance: "AUDITED",
    ipAddress: "127.0.0.1",
  });

  return true;
}
