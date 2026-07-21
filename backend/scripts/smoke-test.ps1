# =============================================================
# Smoke test for ParkingSystem API
# ---------------------------------------------------------
# Goals:
#   1. Confirm the dev box can build, run, and exercise the
#      full happy path: login → vehicle → ticket → session
#      → payment (paid) → ticket check-out.
#   2. Be idempotent — every request body that mutates data
#      uses a fresh GUID/LicensePlate so re-running works.
#   3. Be runnable on Windows out-of-the-box using curl.exe.
#
# Exit code:
#   0 = all steps green
#   non-zero = any step failed (the script aborts at the
#             first failure).
# =============================================================

[CmdletBinding()]
param(
    [string] $BaseUrl = 'http://127.0.0.1:5169',
    [string] $AdminEmail = 'admin@parking.local',
    [string] $AdminPassword = 'Admin@123',
    [switch] $SkipSeedLookup
)

$ErrorActionPreference = 'Stop'
$here = Split-Path -Parent $MyInvocation.MyCommand.Path

# --- helper: run a request, assert the expected status, parse JSON ---
function Invoke-Api {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory)] [string] $Method,
        [Parameter(Mandatory)] [string] $Path,
        [string] $Body = $null,
        [string] $Bearer = $null,
        [int[]] $Expected = @(200, 201, 204)
    )
    $headerList = @()
    if ($Body) { $headerList += 'Content-Type: application/json' }
    if ($Bearer) { $headerList += "Authorization: Bearer $Bearer" }

    $bodyFile = $null
    if ($Body) {
        $bodyFile = Join-Path $here ([Guid]::NewGuid().Guid + '.json')
        Set-Content -Path $bodyFile -Value $Body -Encoding UTF8
    }
    try {
        $args = @('-sS', '-X', $Method, '--url', "$BaseUrl$Path")
        if ($Body) { $args += @('--data-binary', "@$bodyFile") }
        foreach ($h in $headerList) { $args += @('-H', $h) }
        $args += @('-o', 'response.body', '-w', '%{http_code}')
        $statusStr = & curl.exe @args 2>$null
        $status = 0
        if (-not [int]::TryParse([string]$statusStr, [ref]$status)) {
            throw "Invalid HTTP status: $statusStr"
        }
        if (Test-Path 'response.body') {
            $bodyText = (Get-Content 'response.body' -Raw -Encoding UTF8)
        } else {
            $bodyText = ''
        }
    } finally {
        if ($bodyFile -and (Test-Path $bodyFile)) { Remove-Item $bodyFile -Force }
        if (Test-Path 'response.body') { Remove-Item 'response.body' -Force }
    }

    if ($Expected -notcontains $status) {
        Write-Host "FAIL [$Method $Path] expected $($Expected -join '/'), got $status" -ForegroundColor Red
        Write-Host "Body:`n$bodyText"
        throw "Request failed: $Method $Path"
    }
    Write-Host ("OK   [{0,3}] {1,-6} {2}" -f $status, $Method, $Path) -ForegroundColor Green

    if ($status -eq 204) { return $null }
    if (-not $bodyText) { return $null }
    try { return ($bodyText | ConvertFrom-Json) } catch { return $bodyText }
}

# ----- Step 1: login -----
Write-Host "`n== 1. Login ==" -ForegroundColor Cyan
$loginBody = (@{ email = $AdminEmail; password = $AdminPassword } | ConvertTo-Json -Compress)
$loginResp = Invoke-Api -Method POST -Path '/api/auth/login' -Body $loginBody
$token = $loginResp.accessToken
$adminUserId = $loginResp.user.id
Write-Host "  logged in as $($loginResp.user.email) ($($loginResp.user.role))"

# ----- Step 2: discover IDs (admin-managed data already in DB) -----
Write-Host "`n== 2. Look up vehicle types / buildings / slot ==" -ForegroundColor Cyan

# Find a Car vehicle type.
$adminUser = $adminUserId  # for issuing tickets later
$hAdmin = @{ Authorization = "Bearer $token" }

# 2a. list buildings
$buildings = Invoke-Api -Method GET -Path '/api/buildings' -Bearer $token
Write-Host "  buildings: $($buildings.Count)"
$building = $buildings | Select-Object -First 1
$buildingId = $building.id

# 2b. floors of first building
$floors = Invoke-Api -Method GET -Path "/api/floors?buildingId=$buildingId" -Bearer $token
$floorId = $floors[0].id

# 2c. zones of first floor
$zones = Invoke-Api -Method GET -Path "/api/zones?floorId=$floorId" -Bearer $token
# Pick first zone that LOOKS like "Car" (match the seeded sample building).
$carZone = $zones | Where-Object { $_.name -like '*Car*' } | Select-Object -First 1
if (-not $carZone) { $carZone = $zones | Select-Object -First 1 }
$zoneId = $carZone.id
Write-Host "  using building='$($building.name)' floor=$($floors[0].name) zone='$($carZone.name)'"

# 2d. first available slot in that zone
$slots = Invoke-Api -Method GET -Path "/api/slots?zoneId=$zoneId" -Bearer $token
$slotId = ($slots | Select-Object -First 1).id
Write-Host "  using slot #$slotId"

# 2e. Pull the cheapest vehicle type directly from Postgres via a temp SQL file
$tmpSql = Join-Path $here ([Guid]::NewGuid().Guid + '.sql')
Set-Content -Path $tmpSql -Value 'SELECT "Id" FROM "VehicleTypes" ORDER BY "DefaultHourlyRate" LIMIT 1;' -Encoding UTF8
try {
    $raw = Get-Content -Raw $tmpSql | & docker exec -i parkingsystem-postgres psql -U parkinguser -d parkingdb -A -t
} finally {
    if (Test-Path $tmpSql) { Remove-Item $tmpSql -Force }
}
$vehicleTypeId = ([string]$raw).Trim()
if (-not $vehicleTypeId) { throw 'No VehicleTypes found — is the DB seeded?' }
Write-Host "  vehicleTypeId: $vehicleTypeId"

# ----- Step 3: create a vehicle -----
Write-Host "`n== 3. Create vehicle ==" -ForegroundColor Cyan
$plate = "59A-" + ([Guid]::NewGuid().Guid.Substring(0,8).ToUpper())
$vehicleBody = (@{
    licensePlate = $plate
    vehicleTypeId = $vehicleTypeId
    brand = 'Toyota'
    model = 'Vios'
    color = 'White'
} | ConvertTo-Json -Compress)
$vehicle = Invoke-Api -Method POST -Path '/api/vehicles' -Body $vehicleBody -Bearer $token
$vehicleId = $vehicle.id
Write-Host "  vehicle created: $plate (id=$vehicleId)"

# ----- Step 4: issue a parking ticket -----
Write-Host "`n== 4. Issue parking ticket ==" -ForegroundColor Cyan
$ticketBody = (@{
    vehicleId = $vehicleId
    type = 0                 # Hourly
    issuedByUserId = $adminUser
} | ConvertTo-Json -Compress)
$ticket = Invoke-Api -Method POST -Path '/api/tickets' -Body $ticketBody -Bearer $token
$ticketId = $ticket.id
$ticketCode = $ticket.ticketCode
Write-Host "  ticket issued: code=$ticketCode"

# ----- Step 5: start a parking session -----
Write-Host "`n== 5. Start session ==" -ForegroundColor Cyan
$sessionBody = (@{
    ticketId = $ticketId
    slotId = $slotId
} | ConvertTo-Json -Compress)
$session = Invoke-Api -Method POST -Path '/api/parking-sessions' -Body $sessionBody -Bearer $token
$sessionId = $session.id
Write-Host "  session started: $sessionId (entry=$($session.entryTime))"

# ----- Step 6: create payment (Pending) -----
Write-Host "`n== 6. Create payment (Pending) ==" -ForegroundColor Cyan
$paymentBody = (@{
    sessionId = $sessionId
    amount = 5000
    method = 0              # Cash
    processedByUserId = $adminUser
} | ConvertTo-Json -Compress)
$payment = Invoke-Api -Method POST -Path '/api/payments' -Body $paymentBody -Bearer $token
$paymentId = $payment.id
Write-Host "  payment pending: $paymentId amount=$($payment.amount)"

# ----- Step 7: mark paid (cancellation/refund would be 8/9/10) -----
Write-Host "`n== 7. Mark payment paid ==" -ForegroundColor Cyan
$markPaidBody = (@{
    method = 0
    transactionReference = "TX-$([Guid]::NewGuid().Guid.Substring(0,8))"
    processedByUserId = $adminUser
} | ConvertTo-Json -Compress)
$paid = Invoke-Api -Method POST -Path "/api/payments/$paymentId/mark-paid" -Body $markPaidBody -Bearer $token
if ($paid.status -ne 1) {
    throw "Expected payment.status=1 (Paid), got $($paid.status)"
}
Write-Host "  payment marked Paid at $($paid.paidAt)"

# ----- Step 8: ticket check-out BEFORE end (computes fee via PricingRuleService) -----
Write-Host "`n== 8. Check-out ticket (computes fee) ==" -ForegroundColor Cyan
$checkOutBody = '{ "exitTime": null, "applyPenalty": false }'
$checkOut = Invoke-Api -Method POST -Path "/api/tickets/$ticketId/check-out" -Body $checkOutBody -Bearer $token
Write-Host "  fee=$($checkOut.feeAmount) rule='$($checkOut.pricingRuleDescription)' durationHours=$($checkOut.durationHours)"

# ----- Step 9: end session (slot freed) -----
Write-Host "`n== 9. End session ==" -ForegroundColor Cyan
$endBody = '{ }'   # default exit time = now
$ended = Invoke-Api -Method POST -Path "/api/parking-sessions/$sessionId/end" -Body $endBody -Bearer $token
if ($ended.status -ne 1) {
    throw "Expected session.status=1 (Completed), got $($ended.status)"
}
Write-Host "  session Completed at $($ended.exitTime)"

# ----- Step 10: verify slot is free again -----
Write-Host "`n== 10. Confirm slot is back to Available ==" -ForegroundColor Cyan
$slot = Invoke-Api -Method GET -Path "/api/slots/$slotId" -Bearer $token
if ($slot.status -ne 0) {
    throw "Expected slot.status=0 (Available), got $($slot.status)"
}
Write-Host "  slot $($slot.slotCode) status=Available"

# ----- Step 11: verify SystemLog audit trail was written -----
Write-Host "`n== 11. Confirm SystemLog rows were written ==" -ForegroundColor Cyan
$tmpSql = Join-Path $here ([Guid]::NewGuid().Guid + '.sql')
Set-Content -Path $tmpSql -Value 'SELECT COUNT(*) FROM "SystemLogs";' -Encoding UTF8
try {
    $raw = Get-Content -Raw $tmpSql | & docker exec -i parkingsystem-postgres psql -U parkinguser -d parkingdb -A -t
} finally {
    if (Test-Path $tmpSql) { Remove-Item $tmpSql -Force }
}
$logCount = 0
if (-not [int]::TryParse(([string]$raw).Trim(), [ref]$logCount)) {
    throw "Could not parse SystemLogs COUNT(*) from Postgres: '$raw'"
}
if ($logCount -lt 1) {
    throw "Expected at least 1 row in SystemLogs (audit trail), got $logCount"
}
Write-Host "  SystemLogs row count: $logCount  (audit trail active)"

# Spot-check that a row carries the admin's user id.
$tmpSql2 = Join-Path $here ([Guid]::NewGuid().Guid + '.sql')
Set-Content -Path $tmpSql2 -Value "SELECT COUNT(*) FROM `"SystemLogs`" WHERE `"UserId`" = '$adminUserId';" -Encoding UTF8
try {
    $raw2 = Get-Content -Raw $tmpSql2 | & docker exec -i parkingsystem-postgres psql -U parkinguser -d parkingdb -A -t
} finally {
    if (Test-Path $tmpSql2) { Remove-Item $tmpSql2 -Force }
}
$adminLogCount = 0
[void][int]::TryParse(([string]$raw2).Trim(), [ref]$adminLogCount)
if ($adminLogCount -lt 1) {
    throw "Expected at least 1 SystemLog row tied to admin ($adminUserId), got $adminLogCount"
}
Write-Host "  SystemLogs rows tagged with admin user: $adminLogCount"

Write-Host "`n== ALL SMOKE STEPS PASSED ==" -ForegroundColor Green
exit 0
