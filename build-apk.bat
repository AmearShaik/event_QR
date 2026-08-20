@echo off
setlocal enabledelayedexpansion

echo ==========================================================
echo  Graduation Day 2026 Mobile APK Builder
echo ==========================================================

powershell.exe -ExecutionPolicy Bypass -File "%~dp0build-apk.ps1"

if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Build failed with error code %ERRORLEVEL%
    pause
    exit /b %ERRORLEVEL%
)

echo [DONE] APK generated at: %~dp0GraduationQR-Scanner.apk
pause
