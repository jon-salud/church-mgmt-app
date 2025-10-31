# Free up ports 3000 and 3001 (Windows only)
function Clear-Port {
  param([int]$Port)
  $netstat = netstat -ano | Select-String ":$Port ".Replace(':',':')
  foreach ($line in $netstat) {
    $parts = $line -split '\s+'
    if ($parts.Length -ge 5) {
      $processId = $parts[-1]
      if ($processId -match '^[0-9]+$') {
        try {
          $proc = Get-Process -Id $processId -ErrorAction SilentlyContinue
          if ($proc) {
            Write-Host "Killing process $processId using port $Port ($($proc.ProcessName))..."
            $proc.Kill() | Out-Null
          }
        } catch {}
      }
    }
  }
}

# Free up API and Web ports before starting
Clear-Port 3001
Clear-Port 3000


$ErrorActionPreference = 'Stop'


$env:DATA_MODE = 'mock'
$env:NODE_ENV = 'test'

$apiLog = "./api-dev.log"
$webLog = "./web-dev.log"

$apiProc = $null
$webProc = $null

function Cleanup {
  if ($apiProc -and !$apiProc.HasExited) {
    Write-Host "Killing API (pid $($apiProc.Id))..."
    $apiProc.Kill() | Out-Null
  }
  if ($webProc -and !$webProc.HasExited) {
    Write-Host "Killing Web (pid $($webProc.Id))..."
    $webProc.Kill() | Out-Null
  }
}

trap { Cleanup; exit 1 }

# Start API
Write-Host "Starting API..."
$apiProc = Start-Process pnpm -ArgumentList '-C', 'api', 'start' -RedirectStandardOutput $apiLog -RedirectStandardError $apiLog -PassThru
Start-Sleep -Seconds 1
Write-Host "API started (pid $($apiProc.Id))"

# Wait for API to be ready
Write-Host "Waiting for API on port 3001..."
for ($i = 1; $i -le 30; $i++) {
  try {
    Invoke-RestMethod -Uri "http://localhost:3001/api/v1/dashboard/summary" -Headers @{ Authorization = 'Bearer demo-admin' } -TimeoutSec 2 | Out-Null
    Write-Host "✓ API ready"
    break
  } catch {
    if ($i -eq 30) {
      Write-Host "✗ API failed to start after 30 attempts"
      Write-Host "--- API logs ---"
      Get-Content $apiLog -ErrorAction SilentlyContinue | Select-Object -Last 50
      Cleanup
      exit 1
    }
    Write-Host "Waiting... (attempt $i/30)"
    Start-Sleep -Seconds 1
  }
}

# Start Web
Write-Host "Starting Web..."
$webProc = Start-Process pnpm -ArgumentList '-C', 'web', 'dev' -RedirectStandardOutput $webLog -RedirectStandardError $webLog -PassThru
Start-Sleep -Seconds 1
Write-Host "Web started (pid $($webProc.Id))"

# Wait for Web to be ready
Write-Host "Waiting for Web on port 3000..."
# Wait for Web to be ready
Write-Host "Waiting for Web on port 3000..."
for ($i = 1; $i -le 30; $i++) {
  try {
    Invoke-RestMethod -Uri "http://localhost:3000/dashboard" -TimeoutSec 2 | Out-Null
    Write-Host "✓ Web ready"
    break
  } catch {
    if ($i -eq 30) {
      Write-Host "✗ Web failed to start after 30 attempts"
      Write-Host "--- Web logs ---"
      Get-Content $webLog -ErrorAction SilentlyContinue | Select-Object -Last 50
      Cleanup
      exit 1
    }
    Write-Host "Waiting... (attempt $i/30)"
    Start-Sleep -Seconds 1
  }
}

Write-Host ""
Write-Host "✓ Services ready, running Playwright..."
Write-Host ""

# Run tests
$testExit = 0
try {
  pnpm -C web test:e2e
  $testExit = $LASTEXITCODE
} catch {
  $testExit = 1
}

Cleanup
exit $testExit
