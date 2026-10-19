@echo off
setlocal
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
  echo Node.js is required. Install Node.js, then run this file again.
  pause
  exit /b 1
)
where npm >nul 2>nul
if errorlevel 1 (
  echo npm is required. Install Node.js with npm, then run this file again.
  pause
  exit /b 1
)
if not exist "node_modules\vite\bin\vite.js" (
  echo Installing the project dependencies for the first run...
  call npm install
  if errorlevel 1 goto failed
)
start "" /b cmd /c "timeout /t 3 /nobreak >nul ^& start http://127.0.0.1:4173/"
call npm run dev -- --host 127.0.0.1 --port 4173 --strictPort
if errorlevel 1 goto failed
goto done
:failed
echo.
echo The site could not start. Check the message above, then try again.
pause
:done
endlocal
