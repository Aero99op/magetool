@echo off
setlocal enabledelayedexpansion

echo ========================================================
echo   🚀 MAGETOOL: HIGH-SPEED HF DEPLOYMENT (BYPASS MODE)
echo ========================================================
echo.

:: --- CONFIGURATION ---
set "HF_USER=spandan1234"
set "SPACES=magetool-backend-api magetool-backend-1 magetool-backend-2 magetool-backend-3 magetool-backend-4"

:: --- CHECK GIT ---
git rev-parse --is-inside-work-tree >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Git not initialized in this folder!
    pause
    exit /b
)

:: --- AUTHENTICATION ---
echo [STEP 1] Authentication
set /p HF_TOKEN="Enter your HF Write Token (invisible if you paste): "
if "%HF_TOKEN%"=="" (
    echo [ERROR] Token is required!
    pause
    exit /b
)

:: --- SETUP REMOTES ---
echo.
echo [STEP 2] Setting up HF Git Remotes...
for %%S in (%SPACES%) do (
    git remote remove %%S >nul 2>&1
    echo Adding remote: %%S
    git remote add %%S https://%HF_USER%:%HF_TOKEN%@huggingface.co/spaces/%HF_USER%/%%S
)

:: --- PREPARE CODE ---
echo.
echo [STEP 3] Preparing code for deployment...
git add .
set /p COMMIT_MSG="Enter commit message (default: Manual Hotfix): "
if "!COMMIT_MSG!"=="" set "COMMIT_MSG=Manual Hotfix"
git commit -m "!COMMIT_MSG!"

:: --- DEPLOY ---
echo.
echo [STEP 4] Pushing to HF Spaces (This will trigger builds)...
for %%S in (%SPACES%) do (
    echo.
    echo --------------------------------------------------------
    echo 🆙 Deploying to: %%S
    echo --------------------------------------------------------
    git push %%S main --force
    if !errorlevel! neq 0 (
        echo [WARNING] Push to %%S failed! Check your token/permissions.
    ) else (
        echo [SUCCESS] Build triggered for %%S
    )
)

echo.
echo ========================================================
echo   ✅ ALL DEPLOYMENTS TRIGGERED!
echo   Go to Hugging Face dashboard to monitor builds.
echo ========================================================
pause
