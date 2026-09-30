@echo off
setlocal
title FN Pro Rocket League Master Engine - Compiler
color 0b
echo ==========================================================
echo    FN PRO ROCKET LEAGUE MASTER-ENGINE - COMPILER
echo ==========================================================
echo.

set CSC=
if exist "%SystemRoot%\Microsoft.NET\Framework64\v4.0.30319\csc.exe" (
    set "CSC=%SystemRoot%\Microsoft.NET\Framework64\v4.0.30319\csc.exe"
) else if exist "%SystemRoot%\Microsoft.NET\Framework\v4.0.30319\csc.exe" (
    set "CSC=%SystemRoot%\Microsoft.NET\Framework\v4.0.30319\csc.exe"
)

if "%CSC%"=="" (
    echo [ERROR] Microsoft .NET Framework csc.exe compiler not found.
    echo Please make sure .NET Framework 4.x is installed on your Windows machine.
    pause
    exit /b 1
)

echo [OK] Found Windows C# Compiler: %CSC%
echo [+] Compiling FN_RocketLeague_MasterEngine.cs into standalone EXE...
echo.

"%CSC%" /target:winexe /optimize+ /platform:anycpu /out:"%~dp0FN_RocketLeague_MasterEngine.exe" /reference:System.Windows.Forms.dll /reference:System.Drawing.dll "%~dp0FN_RocketLeague_MasterEngine.cs"

if exist "%~dp0FN_RocketLeague_MasterEngine.exe" (
    echo.
    echo ==========================================================
    echo    BUILD SUCCESSFUL! STANDALONE WINDOWS GUI READY!
    echo ==========================================================
    echo Generated: %~dp0FN_RocketLeague_MasterEngine.exe
    echo.
    echo Starting FN_RocketLeague_MasterEngine.exe now...
    start "" "%~dp0FN_RocketLeague_MasterEngine.exe"
) else (
    echo.
    echo [ERROR] Compilation failed. Please check the error output above.
)

echo.
pause
