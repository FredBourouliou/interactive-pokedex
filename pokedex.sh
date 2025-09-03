#!/bin/bash

# Script de gestion complète de l'application Interactive Pokédex
# Usage: ./pokedex.sh [commande]

# Couleurs pour l'affichage
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Fonction pour afficher le logo
show_logo() {
    echo -e "${CYAN}"
    echo "╔═══════════════════════════════════════════╗"
    echo "║     🎮 INTERACTIVE POKÉDEX MANAGER 🎮      ║"
    echo "╚═══════════════════════════════════════════╝"
    echo -e "${NC}"
}

# Fonction pour afficher le menu
show_menu() {
    echo -e "${YELLOW}Commandes disponibles :${NC}"
    echo ""
    echo -e "${GREEN}  start${NC}     - Démarrer l'application en mode développement"
    echo -e "${GREEN}  build${NC}     - Construire l'application pour la production"
    echo -e "${GREEN}  preview${NC}   - Prévisualiser la version de production"
    echo -e "${GREEN}  install${NC}   - Installer/Réinstaller les dépendances"
    echo -e "${GREEN}  update${NC}    - Mettre à jour les dépendances"
    echo -e "${GREEN}  clean${NC}     - Nettoyer le projet (node_modules, dist)"
    echo -e "${GREEN}  test${NC}      - Lancer les tests"
    echo -e "${GREEN}  lint${NC}      - Vérifier le code avec ESLint"
    echo -e "${GREEN}  format${NC}    - Formater le code avec Prettier"
    echo -e "${GREEN}  info${NC}      - Afficher les informations du projet"
    echo -e "${GREEN}  help${NC}      - Afficher cette aide"
    echo ""
    echo -e "${PURPLE}Usage : ./pokedex.sh [commande]${NC}"
    echo ""
}

# Fonction pour vérifier les prérequis
check_requirements() {
    echo -e "${BLUE}🔍 Vérification des prérequis...${NC}"
    
    if ! command -v node &> /dev/null; then
        echo -e "${RED}❌ Node.js n'est pas installé${NC}"
        echo "   Visitez: https://nodejs.org/"
        exit 1
    fi
    
    if ! command -v npm &> /dev/null; then
        echo -e "${RED}❌ npm n'est pas installé${NC}"
        exit 1
    fi
    
    echo -e "${GREEN}✅ Node.js $(node -v)${NC}"
    echo -e "${GREEN}✅ npm $(npm -v)${NC}"
    echo ""
}

# Fonction pour démarrer l'application
start_app() {
    show_logo
    check_requirements
    
    if [ ! -d "node_modules" ]; then
        echo -e "${YELLOW}📦 Installation des dépendances...${NC}"
        npm install
    fi
    
    # Vérifier le port
    if lsof -Pi :5173 -sTCP:LISTEN -t >/dev/null 2>&1; then
        echo -e "${YELLOW}⚠️  Le port 5173 est déjà utilisé${NC}"
        echo "Voulez-vous tuer le processus existant ? (o/n)"
        read -r response
        if [[ "$response" == "o" || "$response" == "O" ]]; then
            kill -9 $(lsof -Pi :5173 -sTCP:LISTEN -t) 2>/dev/null
            sleep 1
        fi
    fi
    
    echo -e "${GREEN}🚀 Démarrage de l'application...${NC}"
    echo -e "${CYAN}📍 URL : http://localhost:5173${NC}"
    echo -e "${YELLOW}💡 Ctrl+C pour arrêter${NC}"
    echo ""
    npm run dev
}

# Fonction pour construire l'application
build_app() {
    show_logo
    check_requirements
    
    if [ ! -d "node_modules" ]; then
        echo -e "${YELLOW}📦 Installation des dépendances...${NC}"
        npm install
    fi
    
    echo -e "${BLUE}🔨 Construction de l'application...${NC}"
    npm run build
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Construction terminée avec succès !${NC}"
        echo -e "${CYAN}📁 Les fichiers sont dans le dossier 'dist'${NC}"
    else
        echo -e "${RED}❌ Erreur lors de la construction${NC}"
        exit 1
    fi
}

# Fonction pour prévisualiser
preview_app() {
    show_logo
    
    if [ ! -d "dist" ]; then
        echo -e "${YELLOW}⚠️  Aucune version de production trouvée${NC}"
        echo "Voulez-vous construire l'application maintenant ? (o/n)"
        read -r response
        if [[ "$response" == "o" || "$response" == "O" ]]; then
            build_app
        else
            exit 0
        fi
    fi
    
    echo -e "${BLUE}👁️  Prévisualisation de la version de production...${NC}"
    echo -e "${CYAN}📍 URL : http://localhost:4173${NC}"
    npm run preview
}

# Fonction pour installer les dépendances
install_deps() {
    show_logo
    check_requirements
    
    echo -e "${BLUE}📦 Installation des dépendances...${NC}"
    npm install
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Installation terminée !${NC}"
    else
        echo -e "${RED}❌ Erreur lors de l'installation${NC}"
        exit 1
    fi
}

# Fonction pour mettre à jour les dépendances
update_deps() {
    show_logo
    check_requirements
    
    echo -e "${BLUE}🔄 Mise à jour des dépendances...${NC}"
    npm update
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Mise à jour terminée !${NC}"
    else
        echo -e "${RED}❌ Erreur lors de la mise à jour${NC}"
        exit 1
    fi
}

# Fonction pour nettoyer le projet
clean_project() {
    show_logo
    
    echo -e "${YELLOW}🧹 Nettoyage du projet...${NC}"
    
    if [ -d "node_modules" ]; then
        echo "  Suppression de node_modules..."
        rm -rf node_modules
    fi
    
    if [ -d "dist" ]; then
        echo "  Suppression de dist..."
        rm -rf dist
    fi
    
    if [ -d ".vite" ]; then
        echo "  Suppression du cache Vite..."
        rm -rf .vite
    fi
    
    echo -e "${GREEN}✅ Nettoyage terminé !${NC}"
}

# Fonction pour lancer les tests
run_tests() {
    show_logo
    check_requirements
    
    echo -e "${BLUE}🧪 Lancement des tests...${NC}"
    
    if npm run test 2>/dev/null; then
        echo -e "${GREEN}✅ Tests réussis !${NC}"
    else
        echo -e "${YELLOW}⚠️  Aucun script de test configuré${NC}"
    fi
}

# Fonction pour linter le code
lint_code() {
    show_logo
    check_requirements
    
    echo -e "${BLUE}🔍 Vérification du code...${NC}"
    
    if npm run lint 2>/dev/null; then
        echo -e "${GREEN}✅ Code vérifié !${NC}"
    else
        echo -e "${YELLOW}⚠️  ESLint n'est pas configuré${NC}"
    fi
}

# Fonction pour formater le code
format_code() {
    show_logo
    check_requirements
    
    echo -e "${BLUE}✨ Formatage du code...${NC}"
    
    if npm run format 2>/dev/null; then
        echo -e "${GREEN}✅ Code formaté !${NC}"
    else
        echo -e "${YELLOW}⚠️  Prettier n'est pas configuré${NC}"
        echo "Voulez-vous installer Prettier ? (o/n)"
        read -r response
        if [[ "$response" == "o" || "$response" == "O" ]]; then
            npm install --save-dev prettier
            echo '{"singleQuote": true, "semi": false}' > .prettierrc
            npx prettier --write "src/**/*.{js,jsx,ts,tsx,css}"
        fi
    fi
}

# Fonction pour afficher les informations
show_info() {
    show_logo
    
    echo -e "${CYAN}📊 Informations du projet${NC}"
    echo "═══════════════════════════════════════"
    echo ""
    
    if [ -f "package.json" ]; then
        echo -e "${GREEN}📦 Nom :${NC} $(grep '"name"' package.json | cut -d '"' -f 4)"
        echo -e "${GREEN}📌 Version :${NC} $(grep '"version"' package.json | cut -d '"' -f 4)"
        echo -e "${GREEN}📝 Description :${NC} Interactive Pokédex avec toutes les générations"
    fi
    
    echo ""
    echo -e "${PURPLE}🛠️  Technologies utilisées :${NC}"
    echo "  • React 18.2"
    echo "  • TypeScript"
    echo "  • Vite"
    echo "  • React Router v6"
    echo "  • Framer Motion"
    echo "  • PokéAPI"
    
    echo ""
    echo -e "${YELLOW}✨ Fonctionnalités :${NC}"
    echo "  • Pokédex complet (9 générations)"
    echo "  • Système de favoris"
    echo "  • Comparaison de Pokémon"
    echo "  • Constructeur d'équipes"
    echo "  • Calculateur de dégâts"
    echo "  • Mode Shiny"
    echo "  • Filtres avancés"
    
    echo ""
    if [ -d "node_modules" ]; then
        echo -e "${GREEN}📦 Dépendances installées :${NC} $(ls node_modules | wc -l) packages"
    else
        echo -e "${YELLOW}⚠️  Dépendances non installées${NC}"
    fi
    
    if [ -d "dist" ]; then
        echo -e "${GREEN}🏗️  Build de production :${NC} Disponible"
    else
        echo -e "${YELLOW}🏗️  Build de production :${NC} Non disponible"
    fi
    
    echo ""
}

# Traitement de la commande
case "$1" in
    start)
        start_app
        ;;
    build)
        build_app
        ;;
    preview)
        preview_app
        ;;
    install)
        install_deps
        ;;
    update)
        update_deps
        ;;
    clean)
        clean_project
        ;;
    test)
        run_tests
        ;;
    lint)
        lint_code
        ;;
    format)
        format_code
        ;;
    info)
        show_info
        ;;
    help|"")
        show_logo
        show_menu
        ;;
    *)
        show_logo
        echo -e "${RED}❌ Commande inconnue : $1${NC}"
        echo ""
        show_menu
        exit 1
        ;;
esac