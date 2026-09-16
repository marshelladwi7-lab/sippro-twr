import { describe, it, expect } from "vitest";
import {
  encodeSession,
  decodeSession,
  hasPermission,
  DEMO_USERS,
  ROLE_PERMISSIONS,
  UserRole,
} from "../src/lib/auth/session";

describe("Auth & RBAC Session Security", () => {
  it("encodes and decodes valid session tokens faithfully", () => {
    const original = DEMO_USERS.penilai;
    const token = encodeSession(original);
    expect(typeof token).toBe("string");
    expect(token.length).toBeGreaterThan(20);

    const decoded = decodeSession(token);
    expect(decoded).not.toBeNull();
    expect(decoded?.userId).toBe(original.userId);
    expect(decoded?.role).toBe("penilai");
    expect(decoded?.name).toBe(original.name);
  });

  it("returns null for corrupted or tampered session tokens", () => {
    expect(decodeSession("invalid-token-xyz")).toBeNull();
    expect(decodeSession("")).toBeNull();
    expect(decodeSession("eyJmb28iOiJiYXIifQ")).toBeNull(); // valid json but missing userId/role
  });

  it("verifies permissions for Penilai Publik", () => {
    const valuer = DEMO_USERS.penilai;
    expect(hasPermission(valuer, "VALUATION_FULL")).toBe(true);
    expect(hasPermission(valuer, "EDIT_KKP")).toBe(true);
    expect(hasPermission(valuer, "APPROVE_KKP")).toBe(true);
    expect(hasPermission(valuer, "MANAGE_USERS")).toBe(false);
  });

  it("verifies permissions for Reviewer Bank", () => {
    const reviewer = DEMO_USERS.reviewer;
    expect(hasPermission(reviewer, "REVIEW_VALUATION")).toBe(true);
    expect(hasPermission(reviewer, "VALIDATE_HAIRCUT")).toBe(true);
    expect(hasPermission(reviewer, "EDIT_KKP")).toBe(false);
  });

  it("verifies permissions for Surveyor Lapangan", () => {
    const surveyor = DEMO_USERS.surveyor;
    expect(hasPermission(surveyor, "INSPECT_PROPERTIES")).toBe(true);
    expect(hasPermission(surveyor, "ADD_COMPARABLE")).toBe(true);
    expect(hasPermission(surveyor, "VALUATION_FULL")).toBe(false);
  });

  it("verifies full administrative privileges for Admin", () => {
    const admin = DEMO_USERS.admin;
    expect(hasPermission(admin, "MANAGE_USERS")).toBe(true);
    expect(hasPermission(admin, "EDIT_DATABASE")).toBe(true);
    expect(hasPermission(admin, "VALUATION_FULL")).toBe(true);
  });

  it("verifies sandbox restrictions for Guest", () => {
    const guest = DEMO_USERS.guest;
    expect(hasPermission(guest, "MANAGE_USERS")).toBe(false);
    expect(hasPermission(guest, "EDIT_KKP")).toBe(false);
    expect(hasPermission(guest, "EXPORT_DATA")).toBe(true);
  });
});
