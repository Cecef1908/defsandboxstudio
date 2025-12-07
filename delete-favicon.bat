@echo off
echo Suppression du favicon.ico...
taskkill /F /IM node.exe 2>nul
timeout /t 2 /nobreak >nul
del /F /Q "app\favicon.ico" 2>nul
if exist "app\favicon.ico" (
    echo ERREUR: Le fichier existe toujours. Supprime-le manuellement.
    explorer app
) else (
    echo OK: Fichier supprime avec succes!
)
rmdir /S /Q .next 2>nul
echo Cache Next.js nettoye.
echo.
echo Maintenant, relance: npm run dev
pause
