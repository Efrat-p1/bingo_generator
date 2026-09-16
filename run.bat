@echo off
title Bingo Generator Server
echo ===================================
echo Starting Bingo Generator...
echo ===================================
echo.
echo Please wait while the local server starts.
echo A link will appear below (usually http://localhost:5173).
echo Hold CTRL and click the link to open the site in your browser.
echo.
call npm run dev
pause
