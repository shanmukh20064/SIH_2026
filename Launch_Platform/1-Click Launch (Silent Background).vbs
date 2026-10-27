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