$ErrorActionPreference = "SilentlyContinue"

$TARGET_DOMAIN = "https://magetool.in"
$TARGET_PROD_API = "https://magetool-api.onrender.com"
$TARGET_LOCAL_API = "http://localhost:8000"

$TARGET = $TARGET_LOCAL_API
$REPORT_FILE = "RedTeam_Report.txt"
$VULNS_FOUND = 0

"=============================================" | Out-File $REPORT_FILE
"MAGETOOL DOOMSDAY AUDIT REPORT" | Out-File -Append $REPORT_FILE
"Target: $TARGET" | Out-File -Append $REPORT_FILE
"Initiated by: Jaani Dushman (Red Team)" | Out-File -Append $REPORT_FILE
"=============================================" | Out-File -Append $REPORT_FILE

Write-Host "JAANI DUSHMAN MODE ACTIVATED" -ForegroundColor Red
Write-Host "Launching full-scale simulated attack on $TARGET..." -ForegroundColor Yellow

# 1. SERVER HEADERS & INFO LEAKAGE
Write-Host "[*] Phase 1: Info Leakage & Missing Headers" -ForegroundColor Cyan
"[*] Phase 1: Info Leakage" | Out-File -Append $REPORT_FILE
try {
    $res = Invoke-WebRequest -Uri "$TARGET/" -Method Get -MaximumRedirection 0
    "Server Header: $($res.Headers['Server'])" | Out-File -Append $REPORT_FILE
    if ($null -eq $res.Headers["Strict-Transport-Security"]) { "VULN: Missing HSTS Header!" | Out-File -Append $REPORT_FILE; $VULNS_FOUND++ }
    if ($null -eq $res.Headers["X-Frame-Options"]) { "VULN: Missing X-Frame-Options (Clickjacking possible)!" | Out-File -Append $REPORT_FILE; $VULNS_FOUND++ }
} catch {
    "Failed to reach root endpoint." | Out-File -Append $REPORT_FILE
}

# 2. HTTP METHOD TAMPERING (OPTIONS, PUT, TRACE)
Write-Host "[*] Phase 2: HTTP Method Tampering" -ForegroundColor Cyan
"[*] Phase 2: HTTP Methods" | Out-File -Append $REPORT_FILE
$methods = @("OPTIONS", "PUT", "TRACE", "DELETE")
foreach ($m in $methods) {
    try {
        $res = Invoke-WebRequest -Uri "$TARGET/api/health" -Method $m
        if ($res.StatusCode -eq 200) {
            "VULN: HTTP Method $m is allowed!" | Out-File -Append $REPORT_FILE
            $VULNS_FOUND++
        }
    } catch { }
}

# 3. THE GAREEB SECRET BRUTE-FORCE
Write-Host "[*] Phase 3: Unleashing Brute-Force on Secret Key" -ForegroundColor Cyan
"[*] Phase 3: Authentication / Secret Bruteforce" | Out-File -Append $REPORT_FILE
$secrets = @("admin123", "magetool-secret-fallback-123", "secret", "password")
foreach ($s in $secrets) {
    try {
        $headers = @{"X-Magetool-Secret" = $s}
        $res = Invoke-RestMethod -Uri "$TARGET/api/status/any-id" -Method Get -Headers $headers
        if ($res) {
            "CRITICAL VULN: Backend accepts weak secret: $s" | Out-File -Append $REPORT_FILE
            Write-Host "CRITICAL: Secret '$s' worked!" -ForegroundColor Red -BackgroundColor White
            $VULNS_FOUND += 10
            break
        }
    } catch { }
}

# 4. WAF EVASION & INJECTION PROBES
Write-Host "[*] Phase 4: WAF Evasion (SQLi, XSS, Path Traversal) Probes" -ForegroundColor Cyan
"[*] Phase 4: WAF Evasion" | Out-File -Append $REPORT_FILE
$payloads = @(
    "?id=1' OR '1'='1", 
    "?file=../../../../etc/passwd", 
    "?test=<script>alert(1)</script>",
    "/?%00%27UNION%20SELECT%20--%20"
)
foreach ($p in $payloads) {
    try {
        $res = Invoke-WebRequest -Uri "$TARGET/api/health$p" -Method Get
        if ($res.StatusCode -eq 200) {
            "VULN: Payload allowed through WAF -> $p" | Out-File -Append $REPORT_FILE
            $VULNS_FOUND++
        }
    } catch { }
}

# 5. DOS & RATE LIMIT EXHAUSTION
Write-Host "[*] Phase 5: Resource Exhaustion (Rate Limit Testing)" -ForegroundColor Cyan
"[*] Phase 5: Rate Limiting Test" | Out-File -Append $REPORT_FILE
$allowed = 0
$blocked = 0
1..50 | ForEach-Object {
    try {
        $res = Invoke-WebRequest -Uri "$TARGET/api/health/live" -Method Get
        $allowed++
    } catch {
        if ($_.Exception.Response.StatusCode -eq 429) { $blocked++ }
    }
}
"Allowed: $allowed | Blocked (429): $blocked" | Out-File -Append $REPORT_FILE
if ($blocked -eq 0) {
    "CRITICAL VULN: Rate limiting is NOT working or limit is too high! Website can be DOS'd." | Out-File -Append $REPORT_FILE
    $VULNS_FOUND += 5
} else {
    "Shield Active: SlowAPI rate limiting worked after $allowed requests." | Out-File -Append $REPORT_FILE
}

# 6. CORS ORIGIN SPOOFING
Write-Host "[*] Phase 6: Cross-Origin Resource Sharing (CORS) Spoofing" -ForegroundColor Cyan
"[*] Phase 6: CORS Misconfiguration" | Out-File -Append $REPORT_FILE
try {
    $evil_origin = "https://evil-hacker-site.com"
    $headers = @{"Origin" = $evil_origin}
    $res = Invoke-WebRequest -Uri "$TARGET/api/health/live" -Method Options -Headers $headers
    if ($res.Headers["Access-Control-Allow-Origin"] -eq $evil_origin -or $res.Headers["Access-Control-Allow-Origin"] -eq "*") {
        "VULN: CORS admits untrusted origins! Found: $($res.Headers['Access-Control-Allow-Origin'])" | Out-File -Append $REPORT_FILE
        $VULNS_FOUND++
    }
} catch { }

# SUMMARY
"=============================================" | Out-File -Append $REPORT_FILE
"AUDIT COMPLETE. Total Vulnerabilities Found: $VULNS_FOUND" | Out-File -Append $REPORT_FILE
"=============================================" | Out-File -Append $REPORT_FILE

Write-Host "Hacking Simulation Complete." -ForegroundColor Green
Write-Host "Report saved to: $REPORT_FILE" -ForegroundColor Yellow
if ($VULNS_FOUND -gt 0) {
    Write-Host "Tujhe bola tha na bhai, gaand phat jayegi. Padh le report!" -ForegroundColor Red
} else {
    Write-Host "Waah bete, Gareeb Shield tagdi hai!" -ForegroundColor Green
}
