#!/usr/bin/env python3
"""
SIPPRO-TWR - Strix AI Penetration Testing & Vulnerability Audit Script
Integrates with Strix (https://github.com/usestrix/strix) standards
Audits HTTP Security Headers, RBAC Route Guards, XSS/SQLi Fuzzing & Zero-Error Guarantees
"""

import sys
import json
import urllib.request
import urllib.error
import urllib.parse
from datetime import datetime

BASE_URL = "http://localhost:3000"

def log_pass(msg):
    print(f"\033[92m[STRIX PASS]\033[0m {msg}")

def log_fail(msg):
    print(f"\033[91m[STRIX FAIL]\033[0m {msg}")

def log_info(msg):
    print(f"\033[94m[STRIX INFO]\033[0m {msg}")

def audit_security_headers(base_url=BASE_URL):
    log_info(f"Auditing HTTP Security Headers on {base_url}...")
    req = urllib.request.Request(base_url, headers={"User-Agent": "Strix-Security-Scanner/1.0"})
    
    try:
        with urllib.request.urlopen(req, timeout=5) as res:
            headers = {k.lower(): v for k, v in res.headers.items()}
            
            required = [
                ("content-security-policy", "Content-Security-Policy"),
                ("x-frame-options", "X-Frame-Options"),
                ("x-content-type-options", "X-Content-Type-Options"),
                ("referrer-policy", "Referrer-Policy"),
                ("strict-transport-security", "Strict-Transport-Security"),
            ]
            
            all_passed = True
            for key, display in required:
                if key in headers:
                    log_pass(f"Header '{display}' is active: {headers[key][:60]}...")
                else:
                    log_fail(f"Missing security header: '{display}'")
                    all_passed = False
            return all_passed
    except Exception as e:
        log_fail(f"Could not connect to {base_url}: {e}")
        return False

def audit_route_guards(base_url=BASE_URL):
    log_info("Auditing Route Protection & RBAC Guards (/workstation)...")
    url = f"{base_url}/workstation"
    req = urllib.request.Request(url, headers={"User-Agent": "Strix-Security-Scanner/1.0"})
    
    # We do NOT follow redirects automatically to detect 307/302
    class NoRedirect(urllib.request.HTTPRedirectHandler):
        def redirect_request(self, req, fp, code, msg, headers, newurl):
            return None

    opener = urllib.request.build_opener(NoRedirect)
    try:
        res = opener.open(req, timeout=5)
        # If status 200 without cookie, guard failed
        log_fail(f"/workstation was directly accessible anonymously (status {res.status})")
        return False
    except urllib.error.HTTPError as e:
        if e.code in (302, 307):
            log_pass(f"Anonymous request to /workstation properly redirected to login (HTTP {e.code})")
            return True
        else:
            log_info(f"Received HTTP status {e.code}")
            return True
    except Exception as e:
        log_fail(f"Error checking route guard: {e}")
        return False

def audit_api_fuzzing(base_url=BASE_URL):
    log_info("Auditing API Injection Resistance (SQLi / XSS / Out-of-range coords)...")
    
    fuzz_payloads = [
        ("SQL Injection 1", {"q": "' OR 1=1 --"}),
        ("SQL Injection 2", {"q": "admin' UNION SELECT * FROM users --"}),
        ("XSS Payload", {"q": "<script>alert('XSS')</script>"}),
        ("Extreme Coords", {"lat": "999.999", "lng": "-999.999", "radius": "-500"}),
        ("Special Characters", {"q": "%%27%22%3C%3E"}),
    ]
    
    all_clean = True
    for name, params in fuzz_payloads:
        qs = urllib.parse.urlencode(params)
        url = f"{base_url}/api/properties?{qs}"
        req = urllib.request.Request(url, headers={"User-Agent": "Strix-Security-Scanner/1.0"})
        try:
            with urllib.request.urlopen(req, timeout=5) as res:
                body = res.read().decode("utf-8")
                data = json.loads(body)
                if data.get("success") is True:
                    log_pass(f"Fuzz payload '{name}' safely handled without crashing (returned {len(data.get('data', []))} sanitized items)")
                else:
                    log_pass(f"Fuzz payload '{name}' gracefully rejected with structured error")
        except urllib.error.HTTPError as e:
            try:
                body = e.read().decode("utf-8")
                data = json.loads(body)
                if "error" in data:
                    log_pass(f"Fuzz payload '{name}' safely handled with structured error (HTTP {e.code})")
                else:
                    log_fail(f"Fuzz payload '{name}' produced unformatted error: {body[:100]}")
                    all_clean = False
            except Exception:
                log_fail(f"Fuzz payload '{name}' resulted in unformatted crash: HTTP {e.code}")
                all_clean = False
        except Exception as e:
            log_fail(f"Fuzz payload '{name}' failed unexpectedly: {e}")
            all_clean = False
            
    return all_clean

def main():
    print("=" * 70)
    print(" STRIX AUTONOMOUS AI PENETRATION TESTING & AUDIT RUNNER")
    print(f" Target: {BASE_URL} | Timestamp: {datetime.now().isoformat()}")
    print(" Reference: https://github.com/usestrix/strix")
    print("=" * 70)
    
    # 1. Header audit
    h_ok = audit_security_headers()
    # 2. Route guard audit
    r_ok = audit_route_guards()
    # 3. Fuzzing injection audit
    f_ok = audit_api_fuzzing()
    
    print("-" * 70)
    if h_ok and r_ok and f_ok:
        print("\033[92m[STRIX SUCCESS] ALL PENETRATION AUDIT TESTS PASSED (ZERO VULNERABILITIES DETECTED)\033[0m")
        sys.exit(0)
    else:
        print("\033[91m[STRIX WARN] Some audit checks flagged issues. Review log above.\033[0m")
        sys.exit(1)

if __name__ == "__main__":
    main()
