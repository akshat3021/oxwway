# Verify admin API endpoints (PowerShell)
# Run with: powershell -ExecutionPolicy Bypass -File scripts\verify_admin.ps1

$base = "http://localhost:3000"

# Sessions (cookie strings)
$sessionAdmin = "oxway_admin_session={\"email\":\"admin@oxway.io\",\"role\":\"admin\"}; Path=/; HttpOnly"
$sessionEditor = "oxway_admin_session={\"email\":\"editor@oxway.io\",\"role\":\"editor\"}; Path=/; HttpOnly"

function Get-Status($uri, $method = "GET", $session = $null, $body = $null) {
    $params = @{
        Uri = $uri
        Method = $method
        Headers = @{}
        SkipCertificateCheck = $true
        UseBasicParsing = $true
    }
    if ($session) { $params.Headers.Add('Cookie', $session) }
    if ($body) { $params.Body = $body; $params.ContentType = 'application/json' }
    try {
        $resp = Invoke-WebRequest @params -ErrorAction Stop
        return $resp.StatusCode
    } catch {
        if ($_.Exception.Response) {
            return $_.Exception.Response.StatusCode.Value__
        }
        return 0
    }
}

Write-Host "Testing unauthenticated access..."
$endpoints = @('products','blogposts','teammembers','gallery','navitems','joblistings','companyinfo','homepage','sitesettings')
foreach ($ep in $endpoints) {
    $code = Get-Status "$base/api/admin/$ep"
    if ($code -ne 401) { Write-Error "FAIL $ep returned $code (expected 401)"; exit 1 }
}
Write-Host "Unauthenticated checks passed."

Write-Host "Testing editor forbidden actions..."
# DELETE product (editor)
$code = Get-Status "$base/api/admin/products" -Method DELETE -Session $sessionEditor -Body '{"id":1}'
if ($code -ne 403) { Write-Error "FAIL delete product as editor: $code"; exit 1 }
# POST blog with publish (editor)
$code = Get-Status "$base/api/admin/blogposts" -Method POST -Session $sessionEditor -Body '{"title":"Test","slug":"test","status":"published"}'
if ($code -ne 403) { Write-Error "FAIL publish blog as editor: $code"; exit 1 }
# PUT site settings (editor)
$code = Get-Status "$base/api/admin/sitesettings" -Method PUT -Session $sessionEditor -Body '{"defaultTheme":"dark"}'
if ($code -ne 403) { Write-Error "FAIL edit sitesettings as editor: $code"; exit 1 }
Write-Host "Editor forbidden actions passed."

Write-Host "Testing admin allowed actions..."
# GET products
$code = Get-Status "$base/api/admin/products" -Session $sessionAdmin
if ($code -ne 200) { Write-Error "FAIL admin GET products: $code"; exit 1 }
# POST product (draft)
$code = Get-Status "$base/api/admin/products" -Method POST -Session $sessionAdmin -Body '{"name":"Demo","slug":"demo","status":"draft"}'
if ($code -ne 201) { Write-Error "FAIL admin POST product: $code"; exit 1 }
# DELETE product (assume id 1)
$code = Get-Status "$base/api/admin/products" -Method DELETE -Session $sessionAdmin -Body '{"id":1}'
if ($code -ne 200) { Write-Error "FAIL admin DELETE product: $code"; exit 1 }
Write-Host "Admin actions passed."

Write-Host "Verifying audit logs..."
$adminLogs = Invoke-WebRequest -Uri "$base/api/admin/auditlogs?model=Product" -Headers @{'Cookie'=$sessionAdmin} -UseBasicParsing -SkipCertificateCheck
$logCount = ($adminLogs.Content | ConvertFrom-Json).Length
if ($logCount -eq 0) { Write-Error "FAIL: No audit logs for admin actions"; exit 1 }
Write-Host "Audit logs present: $logCount entries."

Write-Host "All verification tests passed successfully."
