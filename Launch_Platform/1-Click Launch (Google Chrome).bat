@echo off
title AICTE Regulatory Scrutiny Platform Launcher
color 0B
cd /d "C:\hackthons"

echo ========================================================================
echo    AICTE Regulatory Scrutiny and Compliance Verification Platform
echo ========================================================================
echo.

:: 1. Check if backend server is already running on port 8000
netstat -ano | findstr :8000 | findstr LISTENING >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo [+] Server is ALREADY RUNNING on port 8000.
) else (
    echo [*] Starting FastAPI Backend and Scrutiny Engine...
    start "AICTE Backend Server" /min "C:\hackthons\venv\Scripts\python.exe" -m uvicorn app.main:app --app-dir "C:\hackthons" --host 127.0.0.1 --port 8000
    
    :: Wait 2 seconds for server initialization
    ping -n 3 127.0.0.1 >nul 2>&1
)

:: 2. Launch Google Chrome
echo [*] Opening platform in Google Chrome...
if exist "C:\Program Files\Google\Chrome\Application\chrome.exe" (
    start "" "C:\Program Files\Google\Chrome\Application\chrome.exe" "http://127.0.0.1:8000"
) else if exist "C:\Program Files (x86)\Google\Chrome\Application\chrome.exe" (
    start "" "C:\Program Files (x86)\Google\Chrome\Application\chrome.exe" "http://127.0.0.1:8000"
) else (
    start "" "http://127.0.0.1:8000"
)

echo.
echo ========================================================================
echo   [SUCCESS] AICTE Platform is active in Google Chrome!
echo   URL: http://127.0.0.1:8000
echo ========================================================================
echo.
echo   - To stop the platform server, double-click 'Stop Platform.bat'
echo.
ping -n 4 127.0.0.1 >nul 2>&1
exit