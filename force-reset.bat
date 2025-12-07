@echo off
echo ============================================
echo ☢️  FORCE RESET TOTAL GITHUB  ☢️
echo ============================================
echo.

echo [1/6] Nettoyage fichier problematique...
if exist "app\account\page.tsx" (
    del "app\account\page.tsx"
    echo Fichier page.tsx supprime.
) else (
    echo Fichier page.tsx deja absent.
)
echo.

echo [2/6] Suppression historique Git local...
rmdir /s /q .git
echo OK.
echo.

echo [3/6] Initialisation nouveau Git...
git init
git branch -M main
echo OK.
echo.

echo [4/6] Ajout des fichiers...
git add .
echo OK.
echo.

echo [5/6] Creation du Commit "Fresh Start"...
git commit -m "FRESH START: Fix Vercel Build Error"
echo OK.
echo.

echo [6/6] Connexion et Force Push...
git remote add origin https://github.com/Cecef1908/defsandboxstudio.git
echo.
echo ---------------------------------------------------
echo ATTENTION : Si on vous demande le mot de passe :
echo UTILISEZ VOTRE PERSONAL ACCESS TOKEN (PAT) !
echo ---------------------------------------------------
echo.
git push -u --force origin main

echo.
echo ============================================
echo ✅ TERMINE ! 
echo Allez voir Vercel, un nouveau build doit avoir demarre.
echo ============================================
pause
