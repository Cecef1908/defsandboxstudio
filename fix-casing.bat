@echo off
echo ============================================
echo 🧹 NETTOYAGE CASSE GIT
echo ============================================

echo [1/3] Renommage temporaire...
git mv lib/services/users.service.ts lib/services/users.service.tmp.ts
git mv lib/services/storage.service.ts lib/services/storage.service.tmp.ts
git mv lib/contexts/AuthContext.tsx lib/contexts/AuthContext.tmp.tsx
git mv components/ui/index.ts components/ui/index.tmp.ts

echo [2/3] Commit intermediaire...
git commit -m "TEMP: Rename files to fix git casing issues"

echo [3/3] Restauration des noms...
git mv lib/services/users.service.tmp.ts lib/services/users.service.ts
git mv lib/services/storage.service.tmp.ts lib/services/storage.service.ts
git mv lib/contexts/AuthContext.tmp.tsx lib/contexts/AuthContext.tsx
git mv components/ui/index.tmp.ts components/ui/index.ts

echo [4/3] Commit Final...
git commit -m "FIX: Restore file names with correct casing"

echo [5/3] Push...
git push

echo.
echo ✅ TERMINE !
pause
