@echo off
echo ===========================================
echo Syncing Backend Code to Deployment Folder
echo Source: backend
echo Dest:   magetool-backend-api
echo ===========================================

rem Use Robocopy with /MIR (Mirror) to make destination exactly like source
rem /MIR :: MIRror a directory tree (equivalent to /E plus /PURGE).
rem /XD  :: Exclude Directories (like __pycache__)
robocopy "backend" "magetool-backend-api" /MIR /XD __pycache__ .pytest_cache .git venv temp

echo.
echo ===========================================
echo Sync Complete! You can now cd to magetool-backend-api and push.
echo ===========================================
pause
