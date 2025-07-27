#!/bin/bash

echo "Limpando projeto..."

echo "Removendo node_modules..."
if [ -d "node_modules" ]; then
  rm -rf node_modules
fi

echo "Removendo dist..."
if [ -d "dist" ]; then
  rm -rf dist
fi

echo "Removendo coverage..."
if [ -d "coverage" ]; then
  rm -rf coverage
fi

echo "Removendo arquivos temporarios..."
if [ -d ".temp" ]; then
  rm -rf .temp
fi
if [ -d ".tmp" ]; then
  rm -rf .tmp
fi
if [ -d ".cache" ]; then
  rm -rf .cache
fi

echo ""
echo "Projeto limpo com sucesso!"
echo "Pressione ENTER para sair..."
read
