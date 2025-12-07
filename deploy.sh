#!/bin/bash

# ============================================================================
# Script de Déploiement Rapide - Agence Hub v2.0
# ============================================================================

set -e  # Exit on error

echo "🚀 Déploiement Agence Hub v2.0"
echo "================================"
echo ""

# Couleurs pour les messages
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# ============================================================================
# 1. Vérifications préliminaires
# ============================================================================

echo "📋 Vérification des prérequis..."

# Vérifier Node.js
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js n'est pas installé${NC}"
    exit 1
fi
echo -e "${GREEN}✓${NC} Node.js $(node -v)"

# Vérifier npm
if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm n'est pas installé${NC}"
    exit 1
fi
echo -e "${GREEN}✓${NC} npm $(npm -v)"

# Vérifier .env
if [ ! -f .env ]; then
    echo -e "${YELLOW}⚠️  Fichier .env manquant${NC}"
    echo "Copie de .env.example vers .env..."
    cp .env.example .env
    echo -e "${RED}❌ Veuillez configurer les variables dans .env avant de continuer${NC}"
    exit 1
fi
echo -e "${GREEN}✓${NC} Fichier .env présent"

echo ""

# ============================================================================
# 2. Installation des dépendances
# ============================================================================

echo "📦 Installation des dépendances..."
npm install
echo -e "${GREEN}✓${NC} Dépendances installées"
echo ""

# ============================================================================
# 3. Vérification TypeScript
# ============================================================================

echo "🔍 Vérification TypeScript..."
npm run type-check
echo -e "${GREEN}✓${NC} Pas d'erreurs TypeScript"
echo ""

# ============================================================================
# 4. Build de production
# ============================================================================

echo "🏗️  Build de production..."
npm run build
echo -e "${GREEN}✓${NC} Build réussi"
echo ""

# ============================================================================
# 5. Déploiement Firebase Rules (optionnel)
# ============================================================================

if command -v firebase &> /dev/null; then
    echo "🔥 Déploiement des règles Firebase..."
    read -p "Déployer les règles Firestore et Storage? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        firebase deploy --only firestore:rules,storage:rules
        echo -e "${GREEN}✓${NC} Règles Firebase déployées"
    else
        echo -e "${YELLOW}⚠️  Règles Firebase non déployées${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  Firebase CLI non installé - règles non déployées${NC}"
    echo "   Installez avec: npm install -g firebase-tools"
fi
echo ""

# ============================================================================
# 6. Choix de la plateforme de déploiement
# ============================================================================

echo "🌍 Sélectionnez la plateforme de déploiement:"
echo "1) Vercel (recommandé)"
echo "2) Test local"
echo "3) Annuler"
echo ""
read -p "Votre choix (1-3): " choice

case $choice in
    1)
        echo ""
        echo "🚀 Déploiement sur Vercel..."
        
        # Vérifier Vercel CLI
        if ! command -v vercel &> /dev/null; then
            echo "Installation de Vercel CLI..."
            npm install -g vercel
        fi
        
        # Déployer
        vercel --prod
        echo -e "${GREEN}✓${NC} Déployé sur Vercel!"
        ;;
    2)
        echo ""
        echo "🧪 Démarrage du serveur local..."
        echo "L'application sera accessible sur http://localhost:3000"
        npm start
        ;;
    3)
        echo "Déploiement annulé"
        exit 0
        ;;
    *)
        echo -e "${RED}❌ Choix invalide${NC}"
        exit 1
        ;;
esac

echo ""
echo -e "${GREEN}✅ Déploiement terminé!${NC}"
echo ""
echo "📚 Prochaines étapes:"
echo "  1. Tester l'authentification"
echo "  2. Créer le premier super admin via /setup-admin"
echo "  3. Configurer le branding de l'agence"
echo ""
echo "📖 Documentation:"
echo "  - DEPLOYMENT_GUIDE.md"
echo "  - SCALING_BEST_PRACTICES.md"
echo "  - AUDIT_FINAL.md"
echo ""
