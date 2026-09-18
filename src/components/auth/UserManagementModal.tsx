"use client";

import React, { useState, useEffect, useCallback } from "react";
import { UserRole, UserSession } from "@/lib/auth/session";
import {
  ManagedUser,
  UserOperationalRights,
  KepiProhibitions,
  AuditLogEntry,
} from "@/lib/services/user-service";

interface UserManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserSession | null;
}

export function UserManagementModal({ isOpen, onClose, currentUser }: UserManagementModalProps) {
  const [activeTab, setActiveTab] = useState<"users" | "addUser" | "audit">("users");
  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Edit User & Rights State
  const [editingUser, setEditingUser] = useState<ManagedUser | null>(null);
  const [editRights, setEditRights] = useState<UserOperationalRights | null>(null);
  const [editProhibitions, setEditProhibitions] = useState<KepiProhibitions | null>(null);
  const [editStatus, setEditStatus] = useState<"ACTIVE" | "SUSPENDED" | "PENDING">("ACTIVE");

  // Password Reset State
  const [passwordResetUser, setPasswordResetUser] = useState<ManagedUser | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [passwordNotice, setPasswordNotice] = useState<string | null>(null);

  // New user form state
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPasswordInput, setNewPasswordInput] = useState("password123");
  const [newRole, setNewRole] = useState<UserRole>("penilai");
  const [newInstitution, setNewInstitution] = useState("KJPP Totok Warsito dan Rekan");
  const [newPhone, setNewPhone] = useState("+62 812-");
  const [newLicenseNo, setNewLicenseNo] = useState("");
  const [newBranch, setNewBranch] = useState("Kantor Pusat Jakarta");
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);

  const fetchUsersAndLogs = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/users");
      const json = await res.json();
      if (json.success) {
        setUsers(json.data || []);
        setAuditLogs(json.auditLogs || []);
      }
    } catch (err) {
      console.error("Failed to fetch users:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      fetchUsersAndLogs();
      setFormError(null);
      setFormSuccess(null);
      setPasswordNotice(null);
    }
  }, [isOpen, fetchUsersAndLogs]);

  if (!isOpen) return null;

  const handleOpenEdit = (u: ManagedUser) => {
    setEditingUser(u);
    setEditRights({ ...u.rights });
    setEditProhibitions({ ...u.prohibitions });
    setEditStatus(u.status);
  };

  const handleSaveUserEdits = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser || !editRights || !editProhibitions) return;

    try {
      const res = await fetch("/api/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingUser.id,
          data: {
            name: editingUser.name,
            role: editingUser.role,
            institution: editingUser.institution,
            phone: editingUser.phone,
            licenseNo: editingUser.licenseNo,
            assignedBranch: editingUser.assignedBranch,
            status: editStatus,
            rights: editRights,
            prohibitions: editProhibitions,
          },
        }),
      });
      const json = await res.json();
      if (json.success) {
        setEditingUser(null);
        fetchUsersAndLogs();
      } else {
        alert(json.error || "Gagal menyimpan perubahan");
      }
    } catch {
      alert("Terjadi kesalahan jaringan saat menyimpan perubahan.");
    }
  };

  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordResetUser || newPassword.length < 6) {
      setPasswordNotice("Kata sandi minimal 6 karakter.");
      return;
    }

    try {
      const res = await fetch("/api/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: passwordResetUser.id,
          action: "resetPassword",
          newPassword,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setPasswordNotice(`✅ Berhasil: ${json.message}`);
        setTimeout(() => {
          setPasswordResetUser(null);
          setNewPassword("");
          setPasswordNotice(null);
          fetchUsersAndLogs();
        }, 1200);
      } else {
        setPasswordNotice(`❌ ${json.error || "Gagal mereset sandi"}`);
      }
    } catch {
      setPasswordNotice("❌ Kesalahan jaringan.");
    }
  };

  const handleDeleteUser = async (u: ManagedUser) => {
    if (u.role === "admin") {
      alert("Akun Administrator Utama tidak dapat dihapus demi integritas sistem.");
      return;
    }
    if (!confirm(`Hapus dan nonaktifkan akses untuk "${u.name}" (${u.email})?`)) return;

    try {
      const res = await fetch(`/api/users?id=${u.id}`, { method: "DELETE" });
      const json = await res.json();
      if (json.success) {
        fetchUsersAndLogs();
      } else {
        alert(json.error || "Gagal menghapus pengguna");
      }
    } catch {
      alert("Terjadi kesalahan jaringan saat menghapus pengguna.");
    }
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(null);

    if (!newName.trim() || !newEmail.trim()) {
      setFormError("Nama lengkap dan email wajib diisi.");
      return;
    }

    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newName.trim(),
          email: newEmail.trim(),
          password: newPasswordInput,
          role: newRole,
          institution: newInstitution.trim(),
          phone: newPhone.trim(),
          licenseNo: newLicenseNo.trim() || undefined,
          assignedBranch: newBranch.trim(),
        }),
      });
      const json = await res.json();
      if (json.success) {
        setFormSuccess(`Pengguna ${json.data.name} (${json.data.email}) berhasil didaftarkan.`);
        setNewName("");
        setNewEmail("");
        setNewPasswordInput("password123");
        setNewLicenseNo("");
        fetchUsersAndLogs();
        setTimeout(() => {
          setActiveTab("users");
          setFormSuccess(null);
        }, 1200);
      } else {
        setFormError(json.error || "Gagal mendaftarkan pengguna baru.");
      }
    } catch {
      setFormError("Terjadi kesalahan jaringan saat mendaftarkan pengguna.");
    }
  };

  const filteredUsers = users.filter((u) => {
    const q = searchQuery.toLowerCase();
    return (
      u.name.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      u.role.toLowerCase().includes(q) ||
      u.institution.toLowerCase().includes(q)
    );
  });

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case "admin":
        return "bg-rose-500/20 text-rose-300 border-rose-500/40";
      case "penilai":
        return "bg-blue-500/20 text-blue-300 border-blue-500/40";
      case "reviewer":
        return "bg-indigo-500/20 text-indigo-300 border-indigo-500/40";
      case "surveyor":
        return "bg-sky-500/20 text-sky-300 border-sky-500/40";
      case "guest":
        return "bg-slate-500/20 text-slate-300 border-slate-500/40";
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-3 sm:p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl max-w-5xl w-full max-h-[92vh] flex flex-col text-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 font-bold text-sm shadow-sm">
              🛡️
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-sm font-bold text-white tracking-tight">
                  Tata Kelola Pengguna, Hak Akses &amp; Larangan KEPI
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-blue-950 text-blue-400 border border-blue-800">
                  POJK 40 &amp; SPI 106
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Sistem Kontrol Administrator Terintegrasi • KJPP Totok Warsito &amp; Rekan
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition cursor-pointer text-xs font-bold"
          >
            ✕
          </button>
        </div>

        {/* Sub-Navigation Tabs */}
        <div className="px-6 border-b border-slate-800/80 bg-slate-950/40 flex items-center justify-between text-xs shrink-0">
          <div className="flex space-x-1">
            <button
              onClick={() => setActiveTab("users")}
              className={`px-4 py-3 font-semibold border-b-2 transition-all cursor-pointer flex items-center space-x-2 ${
                activeTab === "users"
                  ? "border-blue-500 text-blue-400"
                  : "border-transparent text-slate-400 hover:text-slate-200"
              }`}
            >
              <span>👥 Direktori Pengguna</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-800 text-slate-300 font-mono">
                {users.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab("addUser")}
              className={`px-4 py-3 font-semibold border-b-2 transition-all cursor-pointer flex items-center space-x-1.5 ${
                activeTab === "addUser"
                  ? "border-blue-500 text-blue-400"
                  : "border-transparent text-slate-400 hover:text-slate-200"
              }`}
            >
              <span>➕ Tambah Pengguna Baru</span>
            </button>

            <button
              onClick={() => setActiveTab("audit")}
              className={`px-4 py-3 font-semibold border-b-2 transition-all cursor-pointer flex items-center space-x-1.5 ${
                activeTab === "audit"
                  ? "border-blue-500 text-blue-400"
                  : "border-transparent text-slate-400 hover:text-slate-200"
              }`}
            >
              <span>📜 Log Kepatuhan &amp; Audit KEPI</span>
              <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
            </button>
          </div>

          <div className="text-[11px] text-slate-400 hidden sm:flex items-center space-x-2">
            <span>Sesi Aktif:</span>
            <span className="font-semibold text-blue-300 font-mono">
              {currentUser?.name || "Administrator"}
            </span>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5">
          {/* TAB 1: USER DIRECTORY & CONTROL */}
          {activeTab === "users" && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="relative flex-1 max-w-sm">
                  <input
                    type="text"
                    placeholder="Cari nama, email, peran, atau institusi..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
                  />
                  <span className="absolute left-2.5 top-2 text-slate-500 text-xs">🔍</span>
                </div>

                <div className="text-xs text-slate-400 flex items-center space-x-2">
                  <span>Status:</span>
                  <span className="px-2 py-0.5 rounded bg-blue-950/60 text-blue-300 border border-blue-800/60 font-mono text-[10px]">
                    {users.filter((u) => u.status === "ACTIVE").length} Aktif
                  </span>
                  {users.some((u) => u.status === "SUSPENDED") && (
                    <span className="px-2 py-0.5 rounded bg-rose-950/60 text-rose-300 border border-rose-800/60 font-mono text-[10px]">
                      {users.filter((u) => u.status === "SUSPENDED").length} Ditangguhkan
                    </span>
                  )}
                </div>
              </div>

              {isLoading ? (
                <div className="p-12 text-center text-slate-400 text-xs">
                  <span className="inline-block w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin mr-2" />
                  Memuat data pengguna...
                </div>
              ) : (
                <div className="border border-slate-800/80 rounded-xl overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider text-[10px] font-semibold border-b border-slate-800">
                      <tr>
                        <th className="p-3">Nama &amp; Kontak</th>
                        <th className="p-3">Peran &amp; Lisensi</th>
                        <th className="p-3">Hak Akses Operasional</th>
                        <th className="p-3">Status</th>
                        <th className="p-3 text-right">Aksi Administrator</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 text-slate-300">
                      {filteredUsers.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="p-8 text-center text-slate-500">
                            Tidak ada pengguna yang cocok dengan pencarian.
                          </td>
                        </tr>
                      ) : (
                        filteredUsers.map((u) => (
                          <tr key={u.id} className="hover:bg-slate-800/30 transition-colors">
                            <td className="p-3">
                              <div className="font-semibold text-white">{u.name}</div>
                              <div className="text-[11px] text-slate-400 font-mono">{u.email}</div>
                              <div className="text-[10px] text-slate-500">{u.institution} • {u.phone}</div>
                            </td>
                            <td className="p-3">
                              <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border uppercase ${getRoleBadge(u.role)}`}>
                                {u.role}
                              </span>
                              <div className="text-[10px] text-slate-400 mt-1">{u.roleTitle}</div>
                              {u.licenseNo && (
                                <div className="text-[9px] text-blue-300/80 font-mono mt-0.5">
                                  📜 {u.licenseNo}
                                </div>
                              )}
                            </td>
                            <td className="p-3">
                              <div className="flex flex-wrap gap-1 max-w-xs text-[9px] font-mono">
                                {u.rights.canCreatePoi && (
                                  <span className="px-1.5 py-0.5 rounded bg-blue-950/80 text-blue-300 border border-blue-800/80">
                                    +POI
                                  </span>
                                )}
                                {u.rights.canEditValuation && (
                                  <span className="px-1.5 py-0.5 rounded bg-blue-950/80 text-blue-300 border border-blue-800/80">
                                    Ubah Nilai
                                  </span>
                                )}
                                {u.rights.canExportData && (
                                  <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                                    Ekspor
                                  </span>
                                )}
                                {u.rights.canDeletePoi && (
                                  <span className="px-1.5 py-0.5 rounded bg-rose-950/80 text-rose-300 border border-rose-800/80">
                                    Hapus POI
                                  </span>
                                )}
                                {u.prohibitions.prohibitSelfAppraisal && (
                                  <span className="px-1.5 py-0.5 rounded bg-rose-950/60 text-rose-400 border border-rose-900" title="Larangan Konflik Kepentingan / Aset Pribadi">
                                    🚫 Self-Appraise
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="p-3">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                                u.status === "ACTIVE"
                                  ? "bg-blue-950 text-blue-400 border-blue-800"
                                  : "bg-rose-950 text-rose-400 border-rose-800"
                              }`}>
                                {u.status === "ACTIVE" ? "Aktif" : "Ditangguhkan"}
                              </span>
                              <div className="text-[10px] text-slate-500 font-mono mt-1">
                                {u.lastActive}
                              </div>
                            </td>
                            <td className="p-3 text-right">
                              <div className="flex items-center justify-end space-x-1.5">
                                <button
                                  onClick={() => handleOpenEdit(u)}
                                  className="px-2.5 py-1 bg-blue-600/20 hover:bg-blue-600/40 text-blue-300 rounded-lg text-[11px] font-semibold border border-blue-500/40 transition active:scale-95 cursor-pointer"
                                  title="Atur Hak Akses & Larangan"
                                >
                                  ⚙️ Hak &amp; Larangan
                                </button>
                                <button
                                  onClick={() => {
                                    setPasswordResetUser(u);
                                    setNewPassword("");
                                    setPasswordNotice(null);
                                  }}
                                  className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-[11px] font-semibold border border-slate-700 transition active:scale-95 cursor-pointer"
                                  title="Ganti Kata Sandi"
                                >
                                  🔑 Sandi
                                </button>
                                {u.role !== "admin" && (
                                  <button
                                    onClick={() => handleDeleteUser(u)}
                                    className="p-1 hover:bg-rose-950/80 text-slate-500 hover:text-rose-400 rounded-lg transition active:scale-95 cursor-pointer"
                                    title="Hapus Pengguna"
                                  >
                                    🗑️
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: TAMBAH PENGGUNA BARU */}
          {activeTab === "addUser" && (
            <form onSubmit={handleAddUser} className="max-w-2xl mx-auto space-y-4 bg-slate-950/60 p-6 rounded-2xl border border-slate-800 text-xs">
              <div>
                <h4 className="font-bold text-white text-sm">Formulir Pendaftaran Pengguna Baru</h4>
                <p className="text-slate-400 text-[11px] mt-0.5">
                  Setiap akun akan diikat dengan standar operasional dan kode etik KEPI.
                </p>
              </div>

              {formError && (
                <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-300 text-xs font-medium">
                  {formError}
                </div>
              )}
              {formSuccess && (
                <div className="p-3 rounded-xl bg-blue-950/60 border border-blue-800 text-blue-300 text-xs font-medium">
                  {formSuccess}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="text-slate-300 font-medium text-[11px] block">Nama Lengkap &amp; Gelar</label>
                  <input
                    type="text"
                    required
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="Contoh: Ir. Bambang Hermanto, MAPPI"
                    className="w-full mt-1 px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-medium text-[11px] block">Email Korporat / Login ID</label>
                  <input
                    type="email"
                    required
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="nama@twr.co.id"
                    className="w-full mt-1 px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 font-mono"
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-medium text-[11px] block">Kata Sandi Awal</label>
                  <input
                    type="text"
                    required
                    value={newPasswordInput}
                    onChange={(e) => setNewPasswordInput(e.target.value)}
                    className="w-full mt-1 px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-slate-100 font-mono focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-medium text-[11px] block">Peran &amp; Tanggung Jawab</label>
                  <select
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value as UserRole)}
                    className="w-full mt-1 px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 cursor-pointer"
                  >
                    <option value="penilai">Penilai Properti (Otoritas Penuh SPI 106)</option>
                    <option value="reviewer">Reviewer Risiko Perbankan (POJK 40)</option>
                    <option value="surveyor">Surveyor Lapangan (Input &amp; Geotag)</option>
                    <option value="admin">Administrator / Managing Partner</option>
                    <option value="guest">Tamu Eksplorasi (Read-Only Demo)</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-300 font-medium text-[11px] block">Institusi / Divisi</label>
                  <input
                    type="text"
                    value={newInstitution}
                    onChange={(e) => setNewInstitution(e.target.value)}
                    className="w-full mt-1 px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-medium text-[11px] block">Nomor HP / WhatsApp</label>
                  <input
                    type="text"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    className="w-full mt-1 px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-slate-100 font-mono focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-medium text-[11px] block">Nomor Izin MAPPI / Lisensi (Opsional)</label>
                  <input
                    type="text"
                    value={newLicenseNo}
                    onChange={(e) => setNewLicenseNo(e.target.value)}
                    placeholder="MAPPI XX-X-XXXXX"
                    className="w-full mt-1 px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-slate-100 font-mono focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-medium text-[11px] block">Cabang / Wilayah Penugasan</label>
                  <input
                    type="text"
                    value={newBranch}
                    onChange={(e) => setNewBranch(e.target.value)}
                    className="w-full mt-1 px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setActiveTab("users")}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-600/20 active:scale-95 transition cursor-pointer"
                >
                  Daftarkan Pengguna
                </button>
              </div>
            </form>
          )}

          {/* TAB 3: AUDIT TRAIL */}
          {activeTab === "audit" && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-white text-xs">Jejak Audit Aktivitas &amp; Integritas Operasional</h4>
                  <p className="text-[11px] text-slate-400">
                    Mencatat setiap otentikasi, modifikasi nilai, dan perubahan hak akses sesuai KEPI 2018.
                  </p>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] bg-blue-950 text-blue-400 border border-blue-800 font-mono font-bold">
                  Immutable Audit Log
                </span>
              </div>

              <div className="border border-slate-800 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider text-[10px] font-semibold border-b border-slate-800">
                    <tr>
                      <th className="p-3 w-36">Waktu</th>
                      <th className="p-3">Pelaksana</th>
                      <th className="p-3">Aktivitas</th>
                      <th className="p-3">Rincian Operasional</th>
                      <th className="p-3 text-center w-28">Status KEPI</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-slate-300">
                    {auditLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-800/30">
                        <td className="p-3 font-mono text-slate-400 text-[11px]">{log.timestamp}</td>
                        <td className="p-3 font-semibold text-white">
                          <div>{log.actorName}</div>
                          <div className="text-[10px] text-slate-500 font-mono">IP: {log.ipAddress}</div>
                        </td>
                        <td className="p-3 font-mono text-blue-300 font-medium">{log.action}</td>
                        <td className="p-3 text-slate-300">
                          <div>{log.detail}</div>
                          {log.targetUser && (
                            <span className="text-[10px] text-slate-500">Target: {log.targetUser}</span>
                          )}
                        </td>
                        <td className="p-3 text-center">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                            log.kepiCompliance === "COMPLIANT"
                              ? "bg-blue-950 text-blue-400 border-blue-800"
                              : "bg-rose-950 text-rose-400 border-rose-800"
                          }`}>
                            {log.kepiCompliance}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* DIALOG: EDIT USER RIGHTS & PROHIBITIONS */}
        {editingUser && editRights && editProhibitions && (
          <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
            <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-xl w-full p-6 space-y-4 shadow-2xl animate-in zoom-in-95">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div>
                  <h4 className="font-bold text-white text-sm">
                    Konfigurasi Hak Akses &amp; Larangan: {editingUser.name}
                  </h4>
                  <p className="text-[11px] text-slate-400">{editingUser.email} • {editingUser.roleTitle}</p>
                </div>
                <button
                  onClick={() => setEditingUser(null)}
                  className="text-slate-400 hover:text-white font-bold p-1 text-sm cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSaveUserEdits} className="space-y-4 text-xs">
                {/* Status Pengguna */}
                <div className="flex items-center justify-between p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <div>
                    <div className="font-bold text-white">Status Akun</div>
                    <div className="text-[10px] text-slate-400">Tangguhkan akun untuk memutus akses seketika.</div>
                  </div>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value as any)}
                    className="bg-slate-900 border border-slate-700 px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer"
                  >
                    <option value="ACTIVE">Aktif (Bisa Login)</option>
                    <option value="SUSPENDED">Ditangguhkan (Blokir)</option>
                    <option value="PENDING">Menunggu Verifikasi</option>
                  </select>
                </div>

                {/* Hak Akses Operasional */}
                <div className="space-y-2">
                  <div className="text-[11px] font-bold text-blue-400 uppercase tracking-wider">
                    1. Hak Operasional (Permissions)
                  </div>
                  <div className="grid grid-cols-2 gap-2 bg-slate-950/80 p-3 rounded-xl border border-slate-800">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editRights.canCreatePoi}
                        onChange={(e) => setEditRights({ ...editRights, canCreatePoi: e.target.checked })}
                        className="rounded accent-blue-600"
                      />
                      <span>Tambah Titik POI Baru</span>
                    </label>

                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editRights.canEditValuation}
                        onChange={(e) => setEditRights({ ...editRights, canEditValuation: e.target.checked })}
                        className="rounded accent-blue-600"
                      />
                      <span>Edit Kisaran Nilai Tanah</span>
                    </label>

                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editRights.canDeletePoi}
                        onChange={(e) => setEditRights({ ...editRights, canDeletePoi: e.target.checked })}
                        className="rounded accent-blue-600"
                      />
                      <span>Hapus Titik Properti</span>
                    </label>

                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editRights.canExportData}
                        onChange={(e) => setEditRights({ ...editRights, canExportData: e.target.checked })}
                        className="rounded accent-blue-600"
                      />
                      <span>Ekspor Excel &amp; KML</span>
                    </label>

                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editRights.canAccessAnalytics}
                        onChange={(e) => setEditRights({ ...editRights, canAccessAnalytics: e.target.checked })}
                        className="rounded accent-blue-600"
                      />
                      <span>Dashboard Analisis POJK 40</span>
                    </label>

                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editRights.canManageUsers}
                        onChange={(e) => setEditRights({ ...editRights, canManageUsers: e.target.checked })}
                        className="rounded accent-blue-600"
                      />
                      <span>Kelola Pengguna (Admin)</span>
                    </label>
                  </div>
                </div>

                {/* Larangan & Perlindungan Etik KEPI */}
                <div className="space-y-2">
                  <div className="text-[11px] font-bold text-rose-400 uppercase tracking-wider flex items-center space-x-1.5">
                    <span>2. Larangan Operasional (KEPI &amp; POJK Safeguards)</span>
                    <span className="text-[9px] text-slate-500 font-normal">Proteksi Hukum &amp; Benturan Kepentingan</span>
                  </div>
                  <div className="space-y-1.5 bg-slate-950/80 p-3 rounded-xl border border-slate-800">
                    <label className="flex items-center justify-between cursor-pointer py-1 border-b border-slate-900">
                      <div>
                        <div className="font-semibold text-white">Larangan Penilaian Afiliasi / Pribadi</div>
                        <div className="text-[10px] text-slate-400">Mencegah benturan kepentingan (Conflict of Interest KEPI).</div>
                      </div>
                      <input
                        type="checkbox"
                        checked={editProhibitions.prohibitSelfAppraisal}
                        onChange={(e) => setEditProhibitions({ ...editProhibitions, prohibitSelfAppraisal: e.target.checked })}
                        className="rounded accent-rose-600"
                      />
                    </label>

                    <label className="flex items-center justify-between cursor-pointer py-1 border-b border-slate-900">
                      <div>
                        <div className="font-semibold text-white">Larangan Ekspor Tanpa Watermark Legal</div>
                        <div className="text-[10px] text-slate-400">Setiap unduhan harus dibubuhi stempel digital KJPP TWR.</div>
                      </div>
                      <input
                        type="checkbox"
                        checked={editProhibitions.prohibitUnwatermarkedExport}
                        onChange={(e) => setEditProhibitions({ ...editProhibitions, prohibitUnwatermarkedExport: e.target.checked })}
                        className="rounded accent-rose-600"
                      />
                    </label>

                    <label className="flex items-center justify-between cursor-pointer py-1">
                      <div>
                        <div className="font-semibold text-white">Larangan Koreksi Nilai Tanpa Berita Acara</div>
                        <div className="text-[10px] text-slate-400">Wajib mencatat narasumber dan bukti inspeksi lapangan.</div>
                      </div>
                      <input
                        type="checkbox"
                        checked={editProhibitions.prohibitUnauditedPriceOverride}
                        onChange={(e) => setEditProhibitions({ ...editProhibitions, prohibitUnauditedPriceOverride: e.target.checked })}
                        className="rounded accent-rose-600"
                      />
                    </label>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setEditingUser(null)}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-semibold cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-md active:scale-95 transition cursor-pointer"
                  >
                    Simpan Perubahan
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* DIALOG: RESET PASSWORD MODAL */}
        {passwordResetUser && (
          <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
            <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl animate-in zoom-in-95">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div>
                  <h4 className="font-bold text-white text-sm">
                    Reset Kata Sandi Pengguna
                  </h4>
                  <p className="text-[11px] text-slate-400">{passwordResetUser.name} ({passwordResetUser.email})</p>
                </div>
                <button
                  onClick={() => setPasswordResetUser(null)}
                  className="text-slate-400 hover:text-white font-bold p-1 text-sm cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {passwordNotice && (
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs font-semibold">
                  {passwordNotice}
                </div>
              )}

              <form onSubmit={handleResetPasswordSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="text-slate-300 font-medium text-[11px] block">
                    Kata Sandi Baru (Min. 6 Karakter)
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Masukkan sandi baru..."
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full mt-1.5 px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-xl text-slate-100 font-mono focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
                  />
                  <p className="text-[10px] text-slate-500 mt-1">
                    💡 Pengguna dapat langsung menggunakan sandi ini pada portal login.
                  </p>
                </div>

                <div className="pt-2 flex items-center justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setPasswordResetUser(null)}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-semibold cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl shadow-md active:scale-95 transition cursor-pointer"
                  >
                    Ubah Kata Sandi
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
