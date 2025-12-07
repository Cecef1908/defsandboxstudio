@echo off
echo ============================================
echo Configuration Git + GitHub
echo ============================================
echo.

REM Supprimer l'ancien remote (si existe)
echo [1/5] Suppression de l'ancien remote...
git remote remove origin 2>nul
echo OK
echo.

REM Ajouter le nouveau remote
echo [2/5] Ajout du nouveau remote GitHub...
git remote add origin https://github.com/Cecef1908/defsandboxstudio.git
if %errorlevel% neq 0 (
    echo ERREUR: Impossible d'ajouter le remote
    pause
    exit /b 1
)
echo OK
echo.

REM Verifier le remote
echo [3/5] Verification du remote...
git remote -v
echo.

REM Ajouter tous les fichiers
echo [4/5] Ajout des fichiers...
git add .
echo OK
echo.

REM Creer le commit
echo [5/5] Creation du commit initial...
git commit -m "Initial commit - Agence Hub v2.0 - Production Ready"
if %errorlevel% neq 0 (
    echo ATTENTION: Rien a commiter ou commit deja fait
)
echo.

REM Configurer la branche main
echo Configuration de la branche main...
git branch -M main
echo OK
echo.

echo ============================================
echo Configuration terminee!
echo ============================================
echo.
echo Prochaine etape: Push vers GitHub
echo Commande: git push -u origin main
echo.
echo Si demande d'authentification:
echo - Username: Cecef1908
echo - Password: Votre Personal Access Token (PAT)
echo.
echo Creer un PAT sur:
echo https://github.com/settings/tokens
echo.
pause
