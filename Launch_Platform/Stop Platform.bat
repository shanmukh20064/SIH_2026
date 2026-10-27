@echo off
title Stop AICTE Regulatory Scrutiny Platform
color 0C
echo ========================================================================
echo   Stopping AICTE Regulatory Scrutiny Platform...
echo ========================================================================
echo.

powershell -NoProfile -ExecutionPolicy Bypass -Command "$conns = Get-NetTCPConnection -LocalPort 8000 -State Listen -ErrorAction SilentlyContinue; if ($conns) { foreach ($c in $conns) { $p = Get-Process -Id $c.OwningProcess -ErrorAction SilentlyContinue; if ($p) { Stop-Process -Id $p.Id -Force; Write-Host '[+] Successfully stopped AICTE Server (PID ' $p.Id ')' -ForegroundColor Green } } } else { Write-Host '[-] Platform server is not currently running.' -ForegroundColor Yellow }"

echo.
echo Done.
ping -n 3 127.0.0.1 >nul 2>&1
exit