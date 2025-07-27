# User Stories

## Introdução

Este documento apresenta as user stories para o Gerador de Arquivo IRPF para Investimentos B3. As user stories são descritas seguindo o modelo Gherkin, com critérios de aceitação claros e casos de teste para garantir a cobertura adequada de cenários positivos e negativos.

## Épicos

### 1. Upload e Importação de Arquivos

**Descrição**: Como investidor, quero fazer upload dos meus extratos da B3 para que o sistema possa processar minhas operações e eventos.

### 2. Processamento de Dados

**Descrição**: Como investidor, quero que o sistema processe meus dados de investimentos para calcular corretamente minha posição, custo médio e resultados.

### 3. Visualização de Resultados

**Descrição**: Como investidor, quero visualizar os resultados do processamento para entender minha posição atual e os resultados fiscais.

### 4. Geração de Arquivo IRPF

**Descrição**: Como investidor, quero gerar um arquivo compatível com o programa da Receita Federal para facilitar minha declaração de imposto de renda.

## User Stories

### 1.1 Upload de Arquivo de Negociação

**Como** investidor  
**Eu quero** fazer upload do meu arquivo de negociação da B3  
**Para que** o sistema possa processar minhas operações de compra e venda

#### Critérios de Aceitação

```gherkin
Cenário: Upload bem-sucedido de arquivo de negociação
Dado que estou na página de upload
Quando eu seleciono um arquivo de negociação válido
E clico no botão "Processar"
Então o sistema deve mostrar uma mensagem de sucesso
E me redirecionar para a página de processamento

Cenário: Tentativa de upload sem selecionar arquivo
Dado que estou na página de upload
Quando eu clico no botão "Processar" sem selecionar um arquivo de negociação
Então o sistema deve mostrar uma mensagem de erro
E permanecer na página de upload

Cenário: Upload de arquivo com formato inválido
Dado que estou na página de upload
Quando eu seleciono um arquivo que não é Excel (.xlsx)
E clico no botão "Processar"
Então o sistema deve mostrar uma mensagem de erro informando o formato esperado
E permanecer na página de upload

Cenário: Upload de arquivo de negociação com estrutura inválida
Dado que estou na página de upload
Quando eu seleciono um arquivo Excel que não segue o padrão da B3
E clico no botão "Processar"
Então o sistema deve mostrar uma mensagem de erro detalhando o problema
E permanecer na página de upload
```

#### Casos de Teste

1. **Positivo**: Upload de arquivo de negociação válido da B3
2. **Negativo**: Tentar processar sem selecionar arquivo
3. **Negativo**: Upload de arquivo PDF em vez de Excel
4. **Negativo**: Upload de arquivo Excel que não é um extrato da B3
5. **Negativo**: Upload de arquivo Excel corrompido
6. **Limite**: Upload de arquivo muito grande (>10MB)

### 1.2 Upload de Arquivo de Movimentação

**Como** investidor  
**Eu quero** fazer upload do meu arquivo de movimentação da B3  
**Para que** o sistema possa processar eventos especiais como dividendos e desdobramentos

#### Critérios de Aceitação

```gherkin
Cenário: Upload bem-sucedido de arquivo de movimentação
Dado que estou na página de upload
E já selecionei um arquivo de negociação válido
Quando eu seleciono um arquivo de movimentação válido
E clico no botão "Processar"
Então o sistema deve mostrar uma mensagem de sucesso
E me redirecionar para a página de processamento

Cenário: Upload bem-sucedido sem arquivo de movimentação
Dado que estou na página de upload
E já selecionei um arquivo de negociação válido
Quando eu clico no botão "Processar" sem selecionar um arquivo de movimentação
Então o sistema deve mostrar uma mensagem informando que o processamento será feito apenas com o arquivo de negociação
E me redirecionar para a página de processamento

Cenário: Upload de arquivo de movimentação com formato inválido
Dado que estou na página de upload
E já selecionei um arquivo de negociação válido
Quando eu seleciono um arquivo de movimentação que não é Excel (.xlsx)
E clico no botão "Processar"
Então o sistema deve mostrar uma mensagem de erro informando o formato esperado
E permanecer na página de upload

Cenário: Upload de arquivo de movimentação com estrutura inválida
Dado que estou na página de upload
E já selecionei um arquivo de negociação válido
Quando eu seleciono um arquivo de movimentação Excel que não segue o padrão da B3
E clico no botão "Processar"
Então o sistema deve mostrar uma mensagem de erro detalhando o problema
E permanecer na página de upload
```

#### Casos de Teste

1. **Positivo**: Upload de arquivo de movimentação válido da B3
2. **Positivo**: Processar apenas com arquivo de negociação, sem arquivo de movimentação
3. **Negativo**: Upload de arquivo PDF em vez de Excel
4. **Negativo**: Upload de arquivo Excel que não é um extrato da B3
5. **Negativo**: Upload de arquivo Excel corrompido
6. **Limite**: Upload de arquivo muito grande (>10MB)

### 2.1 Processamento de Transações

**Como** investidor  
**Eu quero** que o sistema processe minhas transações  
**Para que** eu possa ver minha posição atual e custo médio de cada ativo

#### Critérios de Aceitação

```gherkin
Cenário: Processamento bem-sucedido de transações
Dado que fiz upload de um arquivo de negociação válido
Quando o sistema processa as transações
Então deve calcular corretamente a posição atual de cada ativo
E deve calcular corretamente o custo médio de cada ativo
E deve me mostrar um resumo das posições processadas

Cenário: Processamento com inconsistências
Dado que fiz upload de um arquivo de negociação com possíveis inconsistências
Quando o sistema processa as transações
Então deve identificar e listar as inconsistências encontradas
E deve permitir que eu continue mesmo com as inconsistências
E deve me mostrar um resumo das posições processadas

Cenário: Processamento com vendas a descoberto
Dado que fiz upload de um arquivo de negociação com vendas a descoberto
Quando o sistema processa as transações
Então deve identificar as vendas a descoberto como inconsistências
E deve me mostrar um resumo das posições processadas
```

#### Casos de Teste

1. **Positivo**: Processamento de arquivo com apenas compras
2. **Positivo**: Processamento de arquivo com compras e vendas
3. **Positivo**: Processamento de arquivo com múltiplos ativos
4. **Negativo**: Processamento de arquivo com vendas a descoberto
5. **Negativo**: Processamento de arquivo com quantidades negativas
6. **Limite**: Processamento de arquivo com grande volume de transações (>1000)

### 2.2 Processamento de Eventos Especiais

**Como** investidor  
**Eu quero** que o sistema processe eventos especiais como dividendos e desdobramentos  
**Para que** meu custo médio e posição sejam calculados corretamente

#### Critérios de Aceitação

```gherkin
Cenário: Processamento de desdobramento
Dado que fiz upload de arquivos de negociação e movimentação
E o arquivo de movimentação contém um evento de desdobramento
Quando o sistema processa os eventos especiais
Então deve ajustar a quantidade de ativos de acordo com o fator de desdobramento
E deve ajustar o custo médio proporcionalmente
E deve me mostrar um resumo dos eventos processados

Cenário: Processamento de bonificação
Dado que fiz upload de arquivos de negociação e movimentação
E o arquivo de movimentação contém um evento de bonificação
Quando o sistema processa os eventos especiais
Então deve aumentar a quantidade de ativos de acordo com a bonificação
E deve recalcular o custo médio considerando a bonificação
E deve me mostrar um resumo dos eventos processados

Cenário: Processamento de dividendos
Dado que fiz upload de arquivos de negociação e movimentação
E o arquivo de movimentação contém eventos de dividendos
Quando o sistema processa os eventos especiais
Então deve registrar os dividendos como rendimentos isentos
E deve me mostrar um resumo dos eventos processados

Cenário: Processamento de JCP
Dado que fiz upload de arquivos de negociação e movimentação
E o arquivo de movimentação contém eventos de JCP
Quando o sistema processa os eventos especiais
Então deve registrar os JCP como rendimentos com tributação exclusiva
E deve calcular o imposto retido na fonte (15%)
E deve me mostrar um resumo dos eventos processados
```

#### Casos de Teste

1. **Positivo**: Processamento de desdobramento (ex: 1:2)
2. **Positivo**: Processamento de grupamento (ex: 2:1)
3. **Positivo**: Processamento de bonificação
4. **Positivo**: Processamento de dividendos
5. **Positivo**: Processamento de JCP
6. **Negativo**: Processamento de evento especial para ativo não existente na carteira
7. **Limite**: Processamento de múltiplos eventos especiais para o mesmo ativo

### 3.1 Visualização de Posições

**Como** investidor  
**Eu quero** visualizar minhas posições atuais  
**Para que** eu possa conferir se os dados estão corretos

#### Critérios de Aceitação

```gherkin
Cenário: Visualização de lista de posições
Dado que o sistema processou meus arquivos
Quando eu acesso a página de resultados
Então devo ver uma lista de todas as minhas posições
E cada posição deve mostrar o código do ativo, quantidade, custo médio e valor total

Cenário: Visualização de detalhes de uma posição
Dado que estou na página de resultados
Quando eu seleciono uma posição específica
Então devo ver os detalhes dessa posição
E os detalhes devem incluir todas as transações e eventos relacionados a esse ativo
```

#### Casos de Teste

1. **Positivo**: Visualização de lista com múltiplas posições
2. **Positivo**: Visualização de detalhes de uma posição específica
3. **Positivo**: Visualização de posição zerada (vendida totalmente)
4. **Limite**: Visualização de lista com grande número de posições (>100)

### 3.2 Visualização de Resultados Fiscais

**Como** investidor  
**Eu quero** visualizar meus resultados fiscais  
**Para que** eu possa entender minha situação tributária

#### Critérios de Aceitação

```gherkin
Cenário: Visualização de resultados mensais
Dado que o sistema processou meus arquivos
Quando eu acesso a seção de resultados fiscais
Então devo ver um resumo dos resultados por mês
E cada mês deve mostrar o total de vendas, lucro, prejuízo e imposto devido

Cenário: Visualização de resultados por tipo de ativo
Dado que estou na seção de resultados fiscais
Quando eu seleciono a visualização por tipo de ativo
Então devo ver os resultados separados por ações e FIIs
E devo ver o total de vendas, lucro, prejuízo e imposto devido para cada tipo
```

#### Casos de Teste

1. **Positivo**: Visualização de resultados com lucro em todos os meses
2. **Positivo**: Visualização de resultados com prejuízo em alguns meses
3. **Positivo**: Visualização de resultados com compensação de prejuízo
4. **Positivo**: Visualização de resultados com isenção (vendas abaixo de R$ 20.000/mês)
5. **Limite**: Visualização de resultados para o ano todo (12 meses)

### 3.3 Visualização de Inconsistências

**Como** investidor  
**Eu quero** visualizar possíveis inconsistências nos dados  
**Para que** eu possa corrigi-las ou entender suas implicações

#### Critérios de Aceitação

```gherkin
Cenário: Visualização de lista de inconsistências
Dado que o sistema processou meus arquivos e encontrou inconsistências
Quando eu acesso a seção de inconsistências
Então devo ver uma lista de todas as inconsistências encontradas
E cada inconsistência deve ter uma descrição clara do problema

Cenário: Visualização de detalhes de uma inconsistência
Dado que estou na seção de inconsistências
Quando eu seleciono uma inconsistência específica
Então devo ver os detalhes dessa inconsistência
E os detalhes devem incluir informações sobre as transações ou eventos relacionados
E devo receber sugestões sobre como resolver o problema
```

#### Casos de Teste

1. **Positivo**: Visualização de lista com múltiplas inconsistências
2. **Positivo**: Visualização de detalhes de uma inconsistência específica
3. **Positivo**: Processamento sem inconsistências (lista vazia)
4. **Limite**: Visualização de lista com grande número de inconsistências (>20)

### 4.1 Informação de Dados do Contribuinte

**Como** investidor  
**Eu quero** informar meus dados pessoais  
**Para que** o arquivo gerado contenha as informações corretas do contribuinte

#### Critérios de Aceitação

```gherkin
Cenário: Preenchimento correto de dados do contribuinte
Dado que estou na página de geração de arquivo
Quando eu preencho corretamente meu nome, CPF e ano-calendário
E clico no botão "Continuar"
Então o sistema deve aceitar os dados
E me permitir prosseguir para a próxima etapa

Cenário: Tentativa de prosseguir sem preencher dados obrigatórios
Dado que estou na página de geração de arquivo
Quando eu deixo campos obrigatórios em branco
E clico no botão "Continuar"
Então o sistema deve mostrar mensagens de erro para os campos obrigatórios
E não deve me permitir prosseguir

Cenário: Preenchimento de CPF inválido
Dado que estou na página de geração de arquivo
Quando eu preencho um CPF com formato inválido
E clico no botão "Continuar"
Então o sistema deve mostrar uma mensagem de erro específica para o CPF
E não deve me permitir prosseguir
```

#### Casos de Teste

1. **Positivo**: Preenchimento correto de todos os campos
2. **Negativo**: Tentativa de prosseguir sem preencher nome
3. **Negativo**: Tentativa de prosseguir sem preencher CPF
4. **Negativo**: Preenchimento de CPF com formato inválido
5. **Negativo**: Preenchimento de CPF com dígitos verificadores inválidos
6. **Limite**: Preenchimento de nome muito longo (>100 caracteres)

### 4.2 Geração de Arquivo IRPF

**Como** investidor  
**Eu quero** gerar um arquivo no formato aceito pela Receita Federal  
**Para que** eu possa importá-lo diretamente no programa IRPF

#### Critérios de Aceitação

```gherkin
Cenário: Geração bem-sucedida de arquivo
Dado que o sistema processou meus arquivos
E informei meus dados de contribuinte
Quando eu clico no botão "Gerar Arquivo"
Então o sistema deve gerar um arquivo no formato .DBK
E deve iniciar o download do arquivo automaticamente
E deve mostrar uma mensagem de sucesso

Cenário: Geração de arquivo com opções personalizadas
Dado que estou na página de geração de arquivo
Quando eu seleciono opções personalizadas (como incluir posição inicial)
E clico no botão "Gerar Arquivo"
Então o sistema deve gerar um arquivo considerando minhas opções
E deve iniciar o download do arquivo automaticamente
E deve mostrar uma mensagem de sucesso

Cenário: Tentativa de geração sem processamento prévio
Dado que não processei nenhum arquivo
Quando eu tento acessar a página de geração de arquivo
Então o sistema deve me redirecionar para a página de upload
E deve mostrar uma mensagem informando que preciso processar arquivos primeiro
```

#### Casos de Teste

1. **Positivo**: Geração de arquivo com dados completos
2. **Positivo**: Geração de arquivo com opções personalizadas
3. **Positivo**: Geração de arquivo apenas com posições (sem operações)
4. **Negativo**: Tentativa de geração sem processamento prévio
5. **Limite**: Geração de arquivo com grande volume de dados

## Priorização

As user stories foram priorizadas usando o método MoSCoW (Must have, Should have, Could have, Won't have):

### Must Have (Essencial para o MVP)
- 1.1 Upload de Arquivo de Negociação
- 2.1 Processamento de Transações
- 3.1 Visualização de Posições
- 4.1 Informação de Dados do Contribuinte
- 4.2 Geração de Arquivo IRPF

### Should Have (Importante, mas não crítico para o MVP)
- 1.2 Upload de Arquivo de Movimentação
- 2.2 Processamento de Eventos Especiais
- 3.2 Visualização de Resultados Fiscais
- 3.3 Visualização de Inconsistências

### Could Have (Desejável, mas pode ser adiado)
- Exportação de relatórios detalhados
- Salvamento de sessões para uso futuro
- Importação de posições de anos anteriores

### Won't Have (Fora do escopo atual)
- Integração com outras corretoras além da B3
- Simulações de estratégias fiscais
- Sincronização com a nuvem

## Conclusão

As user stories definidas neste documento fornecem uma base sólida para o desenvolvimento do Gerador de Arquivo IRPF para Investimentos B3. Elas foram elaboradas com foco na experiência do usuário, buscando minimizar a interação necessária e automatizar o máximo possível do processo.

Os critérios de aceitação e casos de teste garantem uma cobertura abrangente de cenários positivos e negativos, permitindo que a equipe de desenvolvimento entregue uma solução robusta e confiável.

A priorização das stories ajuda a equipe a focar nos elementos essenciais para o MVP, garantindo que a solução entregue atenda às necessidades mais críticas dos usuários desde a primeira versão.
