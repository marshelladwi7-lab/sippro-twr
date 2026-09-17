"use client";

import React, { useState } from "react";
import { UserRole, UserSession, DEMO_USERS, ROLE_PERMISSIONS, Permission } from "@/lib/auth/session";

interface UserManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserSession | null;
}

interface ManagedUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  institution: string;
  status: "Aktif" | "Non-Aktif";
  lastActive: string;
}

const INITIAL_USERS: ManagedUser[] = [
  {
    id: "usr-01",
    name: "Totok Warsito, S.E., M.Ec.Dev., MAPPI (Cert.)",
    email: "admin@twr.co.id",
    role: "admin",
    institution: "KJPP Totok Warsito dan Rekan",
    status: "Aktif",
    lastActive: "Baru saja",
  },
  {
    id: "usr-02",
    name: "Budi Santoso, S.T., MAPPI (Cert.)",
    email: "penilai@twr.co.id",
    role: "penilai",
    institution: "KJPP Totok Warsito dan Rekan",
    status: "Aktif",
    lastActive: "15 menit lalu",
  },
  {
    id: "usr-03",
    name: "Hendra Wijaya, S.E.",
    email: "reviewer@bankmandiri.co.id",
    role: "reviewer",
    institution: "PT Bank Mandiri (Persero) Tbk",
    status: "Aktif",
    lastActive: "2 jam lalu",
  },
  {
    id: "usr-04",
    name: "Ahmad Fauzi",
    email: "surveyor@twr.co.id",
    role: "surveyor",
    institution: "KJPP Totok Warsito dan Rekan",
    status: "Aktif",
    lastActive: "Kemarin",
  },
];

const AUDIT_LOGS = [
  {
    time: "18 Sep 2026 03:05",
    user: "Budi Santoso",
    action: "Login Sesi Aman",
    detail: "Otentikasi berhasil via HTTP-only cookie",
    status: "Sukses",
  },
  {
    time: "18 Sep 2026 02:40",
    user: "Budi Santoso",
    action: "Ekspor Data",
    detail: "Unduh Spreadsheet Excel 1.511 Rekord",
    status: "Sukses",
  },
  {
    time: "17 Sep 2026 21:15",
    user: "Ahmad Fauzi",
    action: "Penambahan Titik POI",
    detail: "Geotagging koordinat baru Lat: -6.395972, Lng: 107.173722",
    status: "Sukses",
  },
  {
    time: "17 Sep 2026 19:30",
    user: "Hendra Wijaya",
    action: "Reviewer Haircut POJK 40",
    detail: "Verifikasi jaminan kategori SHM wilayah Bekasi",
    status: "Terverifikasi",
  },
];

export function UserManagementModal({ isOpen, onClose, currentUser }: UserManagementModalProps) {
  const [activeTab, setActiveTab] = useState<"users" | "addUser" | "audit">("users");
  const [users, setUsers] = useState<ManagedUser[]>(INITIAL_USERS);

  // New user form state
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newRole, setNewRole] = useState<UserRole>("penilai");
  const [newInstitution, setNewInstitution] = useState("KJPP Totok Warsito dan Rekan");

  if (!isOpen) return null;

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newEmail.trim()) return;

    const created: ManagedUser = {
      id: `usr-${Date.now().toString().slice(-4)}`,
      name: newName.trim(),
      email: newEmail.trim(),
      role: newRole,
      institution: newInstitution.trim(),
      status: "Aktif",
      lastActive: "Baru dibuat",
    };

    setUsers([created, ...users]);
    setNewName("");
    setNewEmail("");
    setActiveTab("users");
  };

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case "admin":
        return "bg-amber-500/20 text-amber-300 border-amber-500/40";
      case "penilai":
        return "bg-sky-500/20 text-sky-300 border-sky-500/40";
      case "reviewer":
        return "bg-purple-500/20 text-purple-300 border-purple-500/40";
      case "surveyor":
        return "bg-emerald-500/20 text-emerald-300 border-emerald-500/40";
      default:
        return "bg-slate-800 text-slate-300 border-slate-700";
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-slate-900 rounded-3xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto border border-slate-800 text-slate-100 flex flex-col">
        {/* Modal Header */}
        <div className="sticky top-0 bg-slate-900/95 backdrop-blur-md px-6 py-5 flex items-center justify-between border-b border-slate-800 z-10">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              <h3 className="text-base font-extrabold text-white tracking-tight">
                Manajemen Pengguna &amp; Akses (RBAC)
              </h3>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Otorisasi Standar KEPI &amp; POJK 40/POJK.03/2019 • KJPP Totok Warsito dan Rekan
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white text-base font-bold p-1 rounded-lg hover:bg-slate-800 transition cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="px-6 pt-4 pb-2 flex items-center space-x-2 border-b border-slate-800/80 bg-slate-950/40 text-xs">
          <button
            onClick={() => setActiveTab("users")}
            className={`px-4 py-2 rounded-xl font-bold transition-all cursor-pointer ${
              activeTab === "users"
                ? "bg-amber-500 text-slate-950 shadow-md"
                : "text-slate-400 hover:text-white hover:bg-slate-800/60"
            }`}
          >
            👥 Daftar Pengguna ({users.length})
          </button>
          <button
            onClick={() => setActiveTab("addUser")}
            className={`px-4 py-2 rounded-xl font-bold transition-all cursor-pointer ${
              activeTab === "addUser"
                ? "bg-amber-500 text-slate-950 shadow-md"
                : "text-slate-400 hover:text-white hover:bg-slate-800/60"
            }`}
          >
            ➕ Tambah Pengguna Baru
          </button>
          <button
            onClick={() => setActiveTab("audit")}
            className={`px-4 py-2 rounded-xl font-bold transition-all cursor-pointer ${
              activeTab === "audit"
                ? "bg-amber-500 text-slate-950 shadow-md"
                : "text-slate-400 hover:text-white hover:bg-slate-800/60"
            }`}
          >
            🛡️ Audit Log KEPI &amp; POJK
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 flex-1 overflow-y-auto">
          {/* TAB 1: USERS LIST */}
          {activeTab === "users" && (
            <div className="space-y-4">
              <div className="grid gap-3">
                {users.map((u) => (
                  <div
                    key={u.id}
                    className="p-4 bg-slate-950/70 rounded-2xl border border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-white">{u.name}</span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border uppercase ${getRoleBadge(u.role)}`}>
                          {u.role}
                        </span>
                      </div>
                      <div className="text-xs text-slate-400 font-mono">
                        {u.email} • <span className="font-sans text-slate-400">{u.institution}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-3 text-xs">
                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 block">Status: <span className="text-amber-400 font-bold">{u.status}</span></span>
                        <span className="text-[9px] text-slate-400 font-mono">{u.lastActive}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => alert(`Hak akses peran ${u.role.toUpperCase()}:\n- ${ROLE_PERMISSIONS[u.role].join("\n- ")}`)}
                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-[11px] font-medium transition cursor-pointer"
                      >
                        Izin Akses
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: ADD USER */}
          {activeTab === "addUser" && (
            <form onSubmit={handleAddUser} className="space-y-4 max-w-lg mx-auto">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">Nama Lengkap &amp; Gelar Penilai</label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Contoh: Rian Pratama, S.T., MAPPI (Cert.)"
                  className="w-full px-3.5 py-2 bg-slate-950 border border-slate-700/80 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">Alamat Surel / Email</label>
                <input
                  type="email"
                  required
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="rian.pratama@twr.co.id"
                  className="w-full px-3.5 py-2 bg-slate-950 border border-slate-700/80 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">Peran Sistem (Role)</label>
                  <select
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value as UserRole)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700/80 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-amber-500/40 cursor-pointer"
                  >
                    <option value="penilai">Penilai Properti (SPI 106)</option>
                    <option value="reviewer">Reviewer Bank (POJK 40)</option>
                    <option value="surveyor">Surveyor Lapangan (GIS)</option>
                    <option value="admin">Managing Partner (Admin)</option>
                    <option value="guest">Tamu Demo</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">Institusi / Lembaga</label>
                  <input
                    type="text"
                    required
                    value={newInstitution}
                    onChange={(e) => setNewInstitution(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-950 border border-slate-700/80 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                  />
                </div>
              </div>

              <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 text-[11px] text-slate-400 space-y-1">
                <div className="font-bold text-slate-300">Izin Default Otomatis:</div>
                <div className="font-mono text-[10px] text-amber-400/90">
                  {ROLE_PERMISSIONS[newRole].join(", ")}
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs transition-all shadow-lg cursor-pointer"
              >
                Simpan &amp; Terbitkan Hak Akses
              </button>
            </form>
          )}

          {/* TAB 3: AUDIT LOG */}
          {activeTab === "audit" && (
            <div className="space-y-3">
              <p className="text-xs text-slate-400">
                Catatan aktivitas tidak dapat dimanipulasi (*tamper-evident*) untuk pemenuhan kepatuhan KEPI dan POJK 40/POJK.03/2019.
              </p>
              <div className="border border-slate-800/80 rounded-2xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950 text-slate-400 text-[10px] uppercase font-mono tracking-wider border-b border-slate-800">
                    <tr>
                      <th className="p-3">Waktu (WIB)</th>
                      <th className="p-3">Pengguna</th>
                      <th className="p-3">Tindakan</th>
                      <th className="p-3">Rincian</th>
                      <th className="p-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/50 bg-slate-900/40">
                    {AUDIT_LOGS.map((log, i) => (
                      <tr key={i} className="hover:bg-slate-800/30 transition-colors">
                        <td className="p-3 font-mono text-[11px] text-slate-400">{log.time}</td>
                        <td className="p-3 font-bold text-slate-200">{log.user}</td>
                        <td className="p-3 text-amber-300 font-medium">{log.action}</td>
                        <td className="p-3 text-slate-400 text-[11px]">{log.detail}</td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                            {log.status}
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
      </div>
    </div>
  );
}
