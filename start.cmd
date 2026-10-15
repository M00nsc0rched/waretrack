@echo off
rem Starts the WareTrack server on http://localhost:3000 (stop it with Ctrl+C)
cd /d "%~dp0"

set "NODE_EXE=node"
where node >nul 2>nul
if errorlevel 1 set "NODE_EXE=%USERPROFILE%\Tools\node-v24.22.0-win-x64\node.exe"

if not "%NODE_EXE%"=="node" if not exist "%NODE_EXE%" (
  echo Node.js was not found. Install it from https://nodejs.org/ and run this file again.
  pause
  exit /b 1
)

if not exist "node_modules\express" (
  echo Dependencies are missing. Run "npm ci --ignore-scripts" in this folder first.
  pause
  exit /b 1
)

"%NODE_EXE%" server.js
pause
