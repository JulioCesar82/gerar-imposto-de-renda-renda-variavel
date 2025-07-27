@echo off
echo Limpando projeto...

echo Removendo node_modules...
if exist node_modules rmdir /s /q node_modules

echo Removendo dist...
if exist dist rmdir /s /q dist

echo Removendo coverage...
if exist coverage rmdir /s /q coverage

echo Removendo arquivos temporarios...
if exist .temp rmdir /s /q .temp
if exist .tmp rmdir /s /q .tmp
if exist .cache rmdir /s /q .cache

echo.
echo Projeto limpo com sucesso!
echo Pressione qualquer tecla para sair...
pause > nul
