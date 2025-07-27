#!/bin/bash

echo "Executando todas as etapas do projeto..."
echo ""

echo "1. Instalando dependencias..."
npm install -f
echo ""

echo "2. Formatando codigo..."
npm run format
echo ""

echo "3. Verificando codigo com ESLint..."
npm run lint
echo ""

echo "4. Executando testes..."
npm test
echo ""

echo "5. Construindo aplicacao para producao..."
npm run build
echo ""

echo "6. Criando arquivo ZIP do projeto..."
node create-zip.js
echo ""

echo "Todas as etapas foram concluidas com sucesso!"
echo "Pressione ENTER para sair..."
read
