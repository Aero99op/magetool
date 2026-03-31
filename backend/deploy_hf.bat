@echo off
setlocal enabledelayedexpansion

echo ========================================================
echo   🚀 MAGETOOL: ISOLATED HF DEPLOYMENT (CLEAN MODE)
echo ========================================================
echo.

:: --- CONFIGURATION ---
set "HF_USER=spandan1234"
set "SPACES=magetool-backend-api magetool-backend-1 magetool-backend-2 magetool-backend-3 magetool-backend-4"
set "DEPLOY_DIR=%TEMP%\magetool_hf_deploy"

:: --- CLEAN PREVIOUS ---
if exist "!DEPLOY_DIR!" rd /s /q "!DEPLOY_DIR!"
mkdir "!DEPLOY_DIR!"

:: --- AUTHENTICATION ---
echo [STEP 1] Authentication
set /p HF_TOKEN="Enter your HF Write Token: "
if "%HF_TOKEN%"=="" (
    echo [ERROR] Token is required!
    pause
    exit /b
)

:: --- COPY BACKEND FILES ONLY ---
echo.
echo [STEP 2] Copying backend files to isolated folder...
:: Use Robocopy to copy ONLY the backend folder content (excluding large/unnecessary dirs)
robocopy "." "!DEPLOY_DIR!" /E /XD venv __pycache__ .pytest_cache .git temp .vscode .mypy_cache /XF .DS_Store Thumbs.db
if %errorlevel% gtr 7 (
    echo [ERROR] Copy failed! Check permissions.
    pause
    exit /b
)

:: --- INIT GIT IN ISOLATED FOLDER ---
echo.
echo [STEP 3] Initializing clean Git repository...
pushd "!DEPLOY_DIR!"
git init
git config user.email "deploy@magetool.site"
git config user.name "Magetool Deployer"
git checkout -b main
git add .
git commit -m "Clean Backend Production Build"

:: --- SETUP REMOTES ---
echo.
echo [STEP 4] Setting up HF Git Remotes...
for %%S in (%SPACES%) do (
    echo Adding remote: %%S
    git remote add %%S https://%HF_USER%:%HF_TOKEN%@huggingface.co/spaces/%HF_USER%/%%S
)

:: --- DEPLOY ---
echo.
echo [STEP 5] Pushing to HF Spaces (TRIGGERING BUILDS)...
for %%S in (%SPACES%) do (
    echo.
    echo --------------------------------------------------------
    echo 🆙 Deploying to: %%S
    echo --------------------------------------------------------
    git push %%S main --force
    if !errorlevel! neq 0 (
        echo [WARNING] Push to %%S failed!
    ) else (
        echo [SUCCESS] Build triggered for %%S
    )
)

popd
:: CLEANUP (Optional: Remark out if you want to inspect)
:: rd /s /q "!DEPLOY_DIR!"

echo.
echo ========================================================
echo   ✅ ALL DEPLOYMENTS TRIGGERED!
echo   Isolated from root Git issues (APKs/large binaries).
echo   Go to Hugging Face dashboard to monitor builds.
echo ========================================================
pause
