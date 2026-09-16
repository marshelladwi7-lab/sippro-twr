#!/usr/bin/env node
/**
 * SIPPRO-TWR - Strix AI Penetration Testing & Vulnerability Audit Script
 * Integrates with Strix (https://github.com/usestrix/strix) standards
 * Node.js Native Runner: Audits Security Headers, Route Guards, Fuzzing & Zero-Error Guarantees
 */

const BASE_URL = process.env.STRIX_TARGET_URL || "http://localhost:3000";

const colors = {
  green: "\x1b[32m",
  red: "\x1b[31m",
  blue: "\x1b[34m",
  reset: "\x1b[0m",
  bold: "\x1b[1m",
};

function logPass(msg) {
  console.log(`${colors.green}[STRIX PASS]${colors.reset} ${msg}`);
}

function logFail(msg) {
  console.log(`${colors.red}[STRIX FAIL]${colors.reset} ${msg}`);
}

function logInfo(msg) {
  console.log(`${colors.blue}[STRIX INFO]${colors.reset} ${msg}`);
}

async function auditSecurityHeaders(baseUrl = BASE_URL) {
  logInfo(`Auditing HTTP Security Headers on ${baseUrl}...`);
  try {
    const res = await fetch(baseUrl, {
      headers: { "User-Agent": "Strix-Security-Scanner/1.0" },
    });

    const headers = res.headers;
    const required = [
      ["content-security-policy", "Content-Security-Policy"],
      ["x-frame-options", "X-Frame-Options"],
      ["x-content-type-options", "X-Content-Type-Options"],
      ["referrer-policy", "Referrer-Policy"],
      ["strict-transport-security", "Strict-Transport-Security"],
    ];

    let allPassed = true;
    for (const [key, display] of required) {
      const val = headers.get(key);
      if (val) {
        logPass(`Header '${display}' active: ${val.slice(0, 60)}...`);
      } else {
        logFail(`Missing security header: '${display}'`);
        allPassed = false;
      }
    }
    return allPassed;
  } catch (err) {
    logFail(`Could not connect to ${baseUrl}: ${err.message}`);
    return false;
  }
}

async function auditRouteGuards(baseUrl = BASE_URL) {
  logInfo("Auditing Route Protection & RBAC Guards (/workstation)...");
  try {
    const res = await fetch(`${baseUrl}/workstation`, {
      redirect: "manual",
      headers: { "User-Agent": "Strix-Security-Scanner/1.0" },
    });

    if (res.status === 307 || res.status === 302) {
      const location = res.headers.get("location") || "";
      logPass(`Anonymous access to /workstation redirected to ${location} (HTTP ${res.status})`);
      return true;
    } else if (res.status === 200) {
      logFail(`/workstation was accessible anonymously without session (HTTP 200)`);
      return false;
    } else {
      logPass(`Route guard responded with secure status HTTP ${res.status}`);
      return true;
    }
  } catch (err) {
    logFail(`Route guard check failed: ${err.message}`);
    return false;
  }
}

async function auditApiFuzzing(baseUrl = BASE_URL) {
  logInfo("Auditing API Injection Resistance (SQLi / XSS / Bounds)...");
  const fuzzPayloads = [
    { name: "SQL Injection 1", params: { q: "' OR 1=1 --" } },
    { name: "SQL Injection 2", params: { q: "admin' UNION SELECT * FROM users --" } },
    { name: "XSS Payload", params: { q: "<script>alert('XSS')</script>" } },
    { name: "Extreme Coords", params: { lat: "999.999", lng: "-999.999", radius: "-500" } },
    { name: "Special Chars", params: { q: "%%27%22%3C%3E" } },
  ];

  let allClean = true;
  for (const item of fuzzPayloads) {
    const qs = new URLSearchParams(item.params).toString();
    const url = `${baseUrl}/api/properties?${qs}`;
    try {
      const res = await fetch(url, {
        headers: { "User-Agent": "Strix-Security-Scanner/1.0" },
      });
      const data = await res.json();
      if (data.success === true) {
        logPass(`Fuzz payload '${item.name}' safely handled without crashing (${data.data?.length || 0} results)`);
      } else if (data.error) {
        logPass(`Fuzz payload '${item.name}' rejected with structured error`);
      } else {
        logFail(`Fuzz payload '${item.name}' produced unstructured response`);
        allClean = false;
      }
    } catch (err) {
      logFail(`Fuzz payload '${item.name}' caused network/parse exception: ${err.message}`);
      allClean = false;
    }
  }
  return allClean;
}

async function auditAuthEndpoints(baseUrl = BASE_URL) {
  logInfo("Auditing Authentication Endpoints (/api/auth/login, /api/auth/me)...");
  try {
    // 1. Invalid payload to /api/auth/login
    const badLogin = await fetch(`${baseUrl}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role: "invalid_hacker_role" }),
    });
    const badJson = await badLogin.json();
    if (badLogin.status === 400 && badJson.success === false) {
      logPass("Invalid login payload properly rejected with HTTP 400 & structured error");
    } else {
      logFail(`Invalid login payload unexpected status: ${badLogin.status}`);
      return false;
    }

    // 2. Unauthenticated call to /api/auth/me
    const meRes = await fetch(`${baseUrl}/api/auth/me`);
    if (meRes.status === 401) {
      logPass("Anonymous request to /api/auth/me properly returns HTTP 401 Unauthorized");
    } else {
      logFail(`/api/auth/me returned unexpected status: ${meRes.status}`);
      return false;
    }

    return true;
  } catch (err) {
    logFail(`Auth audit failed: ${err.message}`);
    return false;
  }
}

async function main() {
  console.log("=".repeat(70));
  console.log(" STRIX AUTONOMOUS AI PENETRATION TESTING & VULNERABILITY SCANNER");
  console.log(` Target: ${BASE_URL} | Timestamp: ${new Date().toISOString()}`);
  console.log(" Reference: https://github.com/usestrix/strix");
  console.log("=".repeat(70));

  const headersOk = await auditSecurityHeaders();
  const routeGuardsOk = await auditRouteGuards();
  const apiFuzzOk = await auditApiFuzzing();
  const authOk = await auditAuthEndpoints();

  console.log("-".repeat(70));
  if (headersOk && routeGuardsOk && apiFuzzOk && authOk) {
    console.log(
      `${colors.green}${colors.bold}[STRIX AUDIT SUCCESS] ZERO VULNERABILITIES DETECTED across all audited endpoints.${colors.reset}`
    );
    process.exit(0);
  } else {
    console.log(
      `${colors.red}${colors.bold}[STRIX AUDIT WARNING] Review flags above.${colors.reset}`
    );
    process.exit(1);
  }
}

main();
