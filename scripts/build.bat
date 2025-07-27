@echo off
echo Construindo aplicacao para producao...
npm run build
echo.
echo Aplicacao construida com sucesso! Os arquivos estao na pasta 'dist'.
echo Pressione qualquer tecla para sair...
pause > nul
