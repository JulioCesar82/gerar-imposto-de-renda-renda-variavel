@echo off
echo Executando todas as etapas do projeto...
echo.

echo 1. Instalando dependencias...
call npm install -f
echo.

echo 2. Formatando codigo...
call npm run format
echo.

echo 3. Verificando codigo com ESLint...
call npm run lint
echo.

echo 4. Executando testes...
call npm test
echo.

echo 5. Construindo aplicacao para producao...
call npm run build
echo.

echo 6. Criando arquivo ZIP do projeto...
call node create-zip.js
echo.

echo Todas as etapas foram concluidas com sucesso!
echo Pressione qualquer tecla para sair...
pause > nul
