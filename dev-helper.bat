@echo off
REM AI Study Assistant - Development Helper Script (Windows)
REM This script provides common development tasks

title AI Study Assistant - Development Helper

:menu
cls
echo ====================================
echo   AI Study Assistant - Dev Helper
echo ====================================
echo.
echo Select an option:
echo.
echo 1. Setup project (install dependencies)
echo 2. Start local development
echo 3. Test Worker locally
echo 4. Deploy to production
echo 5. View Worker logs
echo 6. Check deployment status
echo 7. Clean install
echo 8. Open documentation
echo 0. Exit
echo.

set /p choice="Enter your choice [0-8]: "

if "%choice%"=="1" goto setup
if "%choice%"=="2" goto dev
if "%choice%"=="3" goto test
if "%choice%"=="4" goto deploy
if "%choice%"=="5" goto logs
if "%choice%"=="6" goto status
if "%choice%"=="7" goto clean
if "%choice%"=="8" goto docs
if "%choice%"=="0" goto exit
goto invalid

:setup
echo.
echo [INFO] Installing dependencies...
call npm install
echo.
echo [SUCCESS] Dependencies installed!
pause
goto menu

:dev
echo.
echo [INFO] Starting local development server...
echo Worker will be available at: http://localhost:8787
echo Press Ctrl+C to stop
echo.
call npm run dev
pause
goto menu

:test
echo.
echo [INFO] Testing Worker endpoints...
echo.
echo Testing health endpoint...
curl -s http://localhost:8787/health
echo.
echo.
echo Testing chat endpoint...
curl -s -X POST http://localhost:8787/api/chat?sessionId=test123 -H "Content-Type: application/json" -d "{\"message\": \"Hello, AI!\"}"
echo.
echo.
echo [SUCCESS] Tests completed!
pause
goto menu

:deploy
echo.
echo [INFO] Deploying to production...
echo.
echo Deploying Worker...
call npm run deploy
echo.
echo [SUCCESS] Deployment complete!
echo Don't forget to deploy the frontend with: npm run pages:deploy
pause
goto menu

:logs
echo.
echo [INFO] Viewing Worker logs (press Ctrl+C to stop)...
call wrangler tail
pause
goto menu

:status
echo.
echo [INFO] Checking deployment status...
call wrangler whoami
echo.
echo [SUCCESS] Status check complete!
pause
goto menu

:clean
echo.
echo [INFO] Cleaning and reinstalling...
if exist node_modules rmdir /s /q node_modules
if exist package-lock.json del package-lock.json
call npm install
echo.
echo [SUCCESS] Clean install complete!
pause
goto menu

:docs
echo.
echo Opening documentation files...
start README.md
start QUICKSTART.md
start PROMPTS.md
pause
goto menu

:invalid
echo.
echo [ERROR] Invalid option
pause
goto menu

:exit
echo.
echo Goodbye!
timeout /t 2 >nul
exit
