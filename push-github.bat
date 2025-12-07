@echo off
echo ============================================
echo Push vers GitHub
echo ============================================
echo.

echo Push en cours vers GitHub...
echo Repository: https://github.com/Cecef1908/defsandboxstudio
echo.

git push -u origin main

if %errorlevel% equ 0 (
    echo.
    echo ============================================
    echo SUCCESS! Code pousse vers GitHub
    echo ============================================
    echo.
    echo Prochaine etape: Configuration Vercel
    echo.
    echo 1. Aller sur https://vercel.com/new
    echo 2. Importer: Cecef1908/defsandboxstudio
    echo 3. Configurer les variables d'environnement
    echo 4. Deployer
    echo.
    echo Voir SETUP_GITHUB_VERCEL.md pour les details
) else (
    echo.
    echo ============================================
    echo ERREUR lors du push
    echo ============================================
    echo.
    echo Solutions possibles:
    echo.
    echo 1. Authentification requise
    echo    - Username: Cecef1908
    echo    - Password: Personal Access Token (PAT)
    echo.
    echo 2. Creer un PAT sur GitHub:
    echo    https://github.com/settings/tokens
    echo    - Scope: repo (Full control)
    echo.
    echo 3. Ou utiliser GitHub CLI:
    echo    gh auth login
    echo.
)

echo.
pause
