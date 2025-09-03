#!/bin/bash

# Script de démarrage de l'application Interactive Pokédex
# Usage: ./start.sh

echo "🚀 Démarrage de l'application Interactive Pokédex..."
echo "=================================================="

# Vérifier si node est installé
if ! command -v node &> /dev/null; then
    echo "❌ Node.js n'est pas installé. Veuillez installer Node.js d'abord."
    echo "   Visitez: https://nodejs.org/"
    exit 1
fi

# Vérifier si npm est installé
if ! command -v npm &> /dev/null; then
    echo "❌ npm n'est pas installé. Veuillez installer npm d'abord."
    exit 1
fi

echo "✅ Node.js version: $(node -v)"
echo "✅ npm version: $(npm -v)"
echo ""

# Installer les dépendances si node_modules n'existe pas ou si package.json a été modifié récemment
if [ ! -d "node_modules" ]; then
    echo "📦 Installation des dépendances..."
    npm install
    if [ $? -ne 0 ]; then
        echo "❌ Erreur lors de l'installation des dépendances"
        exit 1
    fi
    echo "✅ Dépendances installées avec succès"
    echo ""
else
    echo "✅ Les dépendances sont déjà installées"
    echo ""
fi

# Vérifier si un processus utilise déjà le port 5173
if lsof -Pi :5173 -sTCP:LISTEN -t >/dev/null ; then
    echo "⚠️  Le port 5173 est déjà utilisé."
    echo "   Voulez-vous tuer le processus existant ? (o/n)"
    read -r response
    if [[ "$response" == "o" || "$response" == "O" ]]; then
        echo "🔄 Arrêt du processus existant..."
        kill -9 $(lsof -Pi :5173 -sTCP:LISTEN -t)
        sleep 2
    else
        echo "❌ Impossible de démarrer l'application. Le port 5173 est occupé."
        exit 1
    fi
fi

# Démarrer l'application
echo "🎮 Lancement de l'application Pokédex..."
echo "=================================================="
echo ""
echo "📍 L'application sera accessible à : http://localhost:5173"
echo ""
echo "📝 Commandes disponibles :"
echo "   • Arrêter l'application : Ctrl + C"
echo "   • Relancer après modification : Le rechargement est automatique"
echo ""
echo "=================================================="
echo ""

# Lancer le serveur de développement
npm run dev

# Message de fin (s'affiche quand l'utilisateur arrête l'application)
echo ""
echo "👋 Application arrêtée. À bientôt !"