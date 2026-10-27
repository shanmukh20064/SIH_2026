$ErrorActionPreference = "SilentlyContinue"
$conns = Get-NetTCPConnection -LocalPort 8000 -State Listen -ErrorAction SilentlyContinue
if ($conns) {
    foreach ($c in $conns) {
        $p = Get-Process -Id $c.OwningProcess -ErrorAction SilentlyContinue
        if ($p) {
            Stop-Process -Id $p.Id -Force
            Write-Host "Stopped AICTE Platform process (PID $($p.Id))." -ForegroundColor Yellow
        }
    }
} else {
    Write-Host "No active AICTE Platform server found on port 8000." -ForegroundColor Gray
}
