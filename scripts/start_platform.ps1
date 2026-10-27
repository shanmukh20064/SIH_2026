$ErrorActionPreference = "SilentlyContinue"

# Check if port 8000 is already active
$conn = Get-NetTCPConnection -LocalPort 8000 -State Listen -ErrorAction SilentlyContinue

if (-not $conn) {
    Write-Host "Starting AICTE Regulatory Scrutiny Platform on http://127.0.0.1:8000..." -ForegroundColor Cyan
    $pyPath = "C:\hackthons\venv\Scripts\python.exe"
    $args = "-m uvicorn app.main:app --app-dir C:\hackthons --host 127.0.0.1 --port 8000"
    Start-Process -FilePath $pyPath -ArgumentList $args -WorkingDirectory "C:\hackthons" -WindowStyle Hidden
    
    # Wait up to 10 seconds for the server to be listening
    for ($i = 0; $i -lt 20; $i++) {
        Start-Sleep -Milliseconds 500
        $conn = Get-NetTCPConnection -LocalPort 8000 -State Listen -ErrorAction SilentlyContinue
        if ($conn) {
            break
        }
    }
} else {
    Write-Host "Server is already active on port 8000." -ForegroundColor Green
}

# Open in Google Chrome if installed, else fallback to default browser
$chromePath = "C:\Program Files\Google\Chrome\Application\chrome.exe"
$url = "http://127.0.0.1:8000"

if (Test-Path $chromePath) {
    Write-Host "Launching Google Chrome: $url" -ForegroundColor Green
    Start-Process -FilePath $chromePath -ArgumentList $url
} else {
    Write-Host "Launching browser: $url" -ForegroundColor Green
    Start-Process $url
}
