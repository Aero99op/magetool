@echo off
echo ===========================================
echo Syncing Backend Code to Deployment Folder
echo Source: d:\magetool website\backend
echo Dest:   d:\magetool website\magetool-backend
echo ===========================================

rem Use Robocopy with /MIR (Mirror) to make destination exactly like source
rem /MIR :: MIRror a directory tree (equivalent to /E plus /PURGE).
rem /XD  :: Exclude Directories (like __pycache__)
robocopy "d:\magetool website\backend" "d:\magetool website\magetool-backend" /MIR /XD __pycache__ .pytest_cache .git .venv

echo.
echo ===========================================
echo Sync Complete! You can now cd to magetool-backend and push.
echo ===========================================
pause
