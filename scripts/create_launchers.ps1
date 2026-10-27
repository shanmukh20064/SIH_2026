$ErrorActionPreference = "Stop"

$desktop = [System.Environment]::GetFolderPath([System.Environment+SpecialFolder]::Desktop)
$folders = @(
    (Join-Path $desktop "AICTE Regulatory Platform"),
    "C:\hackthons\Launch_Platform"
)

$batContent = @"
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
"@

$vbsContent = @"
Set WshShell = CreateObject("WScript.Shell")
Set fso = CreateObject("Scripting.FileSystemObject")

' Check if port 8000 is open
Set objExec = WshShell.Exec("powershell -NoProfile -Command ""Get-NetTCPConnection -LocalPort 8000 -State Listen -ErrorAction SilentlyContinue""")
strOut = objExec.StdOut.ReadAll()

If InStr(strOut, "8000") = 0 Then
    ' Start python uvicorn hidden
    WshShell.CurrentDirectory = "C:\hackthons"
    WshShell.Run """C:\hackthons\venv\Scripts\python.exe"" -m uvicorn app.main:app --app-dir ""C:\hackthons"" --host 127.0.0.1 --port 8000", 0, False
    WScript.Sleep 2500
End If

' Open in Google Chrome
chromePath = "C:\Program Files\Google\Chrome\Application\chrome.exe"
If fso.FileExists(chromePath) Then
    WshShell.Run """" & chromePath & """ ""http://127.0.0.1:8000""", 1, False
Else
    WshShell.Run "http://127.0.0.1:8000", 1, False
End If
"@

$stopContent = @"
@echo off
title Stop AICTE Regulatory Scrutiny Platform
color 0C
echo ========================================================================
echo   Stopping AICTE Regulatory Scrutiny Platform...
echo ========================================================================
echo.

powershell -NoProfile -ExecutionPolicy Bypass -Command "`$conns = Get-NetTCPConnection -LocalPort 8000 -State Listen -ErrorAction SilentlyContinue; if (`$conns) { foreach (`$c in `$conns) { `$p = Get-Process -Id `$c.OwningProcess -ErrorAction SilentlyContinue; if (`$p) { Stop-Process -Id `$p.Id -Force; Write-Host '[+] Successfully stopped AICTE Server (PID ' `$p.Id ')' -ForegroundColor Green } } } else { Write-Host '[-] Platform server is not currently running.' -ForegroundColor Yellow }"

echo.
echo Done.
ping -n 3 127.0.0.1 >nul 2>&1
exit
"@

$urlContent = @"
[InternetShortcut]
URL=http://127.0.0.1:8000
IconFile=C:\Program Files\Google\Chrome\Application\chrome.exe
IconIndex=0
"@

$readmeContent = @"
========================================================================
AICTE Regulatory Scrutiny & Compliance Verification Platform
========================================================================

How to use:
1. Double-click "1-Click Launch (Google Chrome).bat"
   - Automatically starts the backend scrutiny engine and database
   - Automatically opens the fully functioning platform in Google Chrome (http://127.0.0.1:8000)

2. Or double-click "1-Click Launch (Silent Background).vbs"
   - Starts the platform silently in the background and opens Google Chrome without any console window

3. To shut down the server when finished:
   - Double-click "Stop Platform.bat"

Features included:
- Full AICTE Scrutiny & Application Tracker
- Document Upload & SHA-256 Cryptographic Verification
- Real-time Compliance Rules & Validation Engine
- Audit Trail & Scrutiny Workspace
- Live File Storage Browser
"@

foreach ($dir in $folders) {
    if (-not (Test-Path $dir)) {
        New-Item -ItemType Directory -Path $dir -Force | Out-Null
    }
    
    [System.IO.File]::WriteAllText((Join-Path $dir "1-Click Launch (Google Chrome).bat"), $batContent)
    [System.IO.File]::WriteAllText((Join-Path $dir "1-Click Launch (Silent Background).vbs"), $vbsContent)
    [System.IO.File]::WriteAllText((Join-Path $dir "Stop Platform.bat"), $stopContent)
    [System.IO.File]::WriteAllText((Join-Path $dir "Open Webpage Directly.url"), $urlContent)
    [System.IO.File]::WriteAllText((Join-Path $dir "README.txt"), $readmeContent)
}

# Create Windows .lnk Shortcuts
$wsh = New-Object -ComObject WScript.Shell
$chromePath = "C:\Program Files\Google\Chrome\Application\chrome.exe"
if (-not (Test-Path $chromePath)) {
    $chromePath = "C:\Program Files (x86)\Google\Chrome\Application\chrome.exe"
}

# 1. Inside Desktop Folder
$desktopFolder = Join-Path $desktop "AICTE Regulatory Platform"
$folderShortcut = $wsh.CreateShortcut((Join-Path $desktopFolder "Click Here To Open Platform.lnk"))
$folderShortcut.TargetPath = (Join-Path $desktopFolder "1-Click Launch (Google Chrome).bat")
$folderShortcut.WorkingDirectory = "C:\hackthons"
if (Test-Path $chromePath) {
    $folderShortcut.IconLocation = "$chromePath,0"
}
$folderShortcut.Description = "Open AICTE Regulatory Scrutiny Platform in Google Chrome"
$folderShortcut.Save()

# 2. Directly on Desktop
$desktopShortcut = $wsh.CreateShortcut((Join-Path $desktop "AICTE Regulatory Platform (Google Chrome).lnk"))
$desktopShortcut.TargetPath = (Join-Path $desktopFolder "1-Click Launch (Google Chrome).bat")
$desktopShortcut.WorkingDirectory = "C:\hackthons"
if (Test-Path $chromePath) {
    $desktopShortcut.IconLocation = "$chromePath,0"
}
$desktopShortcut.Description = "1-Click Launch AICTE Regulatory Scrutiny Platform in Google Chrome"
$desktopShortcut.Save()

Write-Host "Launchers and shortcuts created successfully!" -ForegroundColor Green
