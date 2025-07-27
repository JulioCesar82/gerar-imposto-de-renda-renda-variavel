# Visão Geral da Arquitetura

## Introdução

O Gerador de Arquivo IRPF para Investimentos B3 é uma aplicação web desenvolvida para auxiliar investidores brasileiros na geração de arquivos de importação para a Declaração de Imposto de Renda de Pessoa Física (DIRPF). A aplicação processa extratos da B3, calcula o custo médio de ativos, trata eventos especiais e gera um arquivo no formato aceito pela Receita Federal.

## Arquitetura Hexagonal (Ports and Adapters)

A aplicação segue o padrão de arquitetura hexagonal, também conhecido como "Ports and Adapters", que visa separar o domínio da aplicação das implementações técnicas. Esta arquitetura permite:

- **Isolamento do domínio**: A lógica de negócio é isolada de detalhes de infraestrutura
- **Testabilidade**: Componentes podem ser testados de forma isolada
- **Flexibilidade**: Adaptadores podem ser substituídos sem afetar o domínio
- **Manutenibilidade**: Separação clara de responsabilidades

## Componentes Principais

### Domínio

O domínio contém os modelos e a lógica de negócio da aplicação:

- **Transaction**: Representa uma transação (compra ou venda) de um ativo
- **SpecialEvent**: Representa um evento especial (desdobramento, bonificação, etc.)
- **AssetPosition**: Representa a posição de um ativo, incluindo seu histórico
- **IRPFDeclaration**: Representa a declaração IRPF completa

### Portas (Interfaces)

As portas definem as operações que a aplicação pode realizar:

- **FileParserPort**: Interface para parsing de arquivos da B3
- **AssetProcessorPort**: Interface para processamento de ativos
- **IRPFGeneratorPort**: Interface para geração de arquivos IRPF
- **StoragePort**: Interface para armazenamento e recuperação de dados

### Adaptadores

Os adaptadores implementam as interfaces definidas pelas portas:

- **B3FileParser**: Implementação de `FileParserPort` para arquivos de negociação da B3.
- **DBKFileParser**: Implementação de `FileParserPort` para arquivos `.DBK` da Receita Federal.
- **DBKFileGenerator**: Implementação de `IRPFGeneratorPort` para gerar o arquivo `.DBK` final.
- **IndexedDBStorage**: Implementação de `StoragePort` usando IndexedDB.

### Interface de Usuário

A interface de usuário é construída com React e Tailwind CSS:

- **Layout**: Componentes de layout (Header, Footer, etc.)
- **Pages**: Páginas da aplicação (HomePage, UploadPage, etc.)

## Fluxo de Dados

1.  Opcionalmente, o usuário importa um arquivo `.DBK` para preencher os dados do contribuinte. O adaptador `DBKFileParser` extrai as informações.
2.  O usuário faz upload dos arquivos de extrato da B3.
3.  O adaptador `B3FileParser` converte os arquivos em objetos de domínio (`Transaction`, `SpecialEvent`).
4.  O processador de ativos calcula posições, resultados e registros de renda.
5.  O gerador `DBKFileGenerator` cria a declaração e o arquivo `.DBK` para exportação.
6.  Os dados da sessão são armazenados localmente usando `IndexedDB`.

## Diagrama de Arquitetura

```
┌─────────────────────────────────────────────────────────────────┐
│                        Interface de Usuário                      │
└───────────────────────────────┬─────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                              Portas                              │
│                                                                 │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  │
│  │  FileParserPort │  │AssetProcessorPort│  │IRPFGeneratorPort│  │
│  └────────┬────────┘  └────────┬────────┘  └────────┬────────┘  │
│           │                    │                    │           │
│  ┌────────▼────────┐  ┌────────▼────────┐  ┌────────▼────────┐  │
│  │   StoragePort   │  │                 │  │                 │  │
│  └────────┬────────┘  │                 │  │                 │  │
└───────────┼────────────────────┼─────────────────────┼───────────┘
            │                    │                     │
            ▼                    ▼                     ▼
┌───────────────────┐  ┌─────────────────────┐  ┌─────────────────┐
│   Adaptadores     │  │      Domínio        │  │  Infraestrutura │
│                   │  │                     │  │                 │
│ - B3FileParser    │  │ - Transaction       │  │ - IndexedDB     │
│ - DBKFileParser   │  │ - SpecialEvent      │  │ - LocalStorage  │
│ - DBKFileGenerator│  │ - AssetPosition     │  │                 │
└───────────────────┘  └─────────────────────┘  └─────────────────┘
```

## Tecnologias Utilizadas

- **Frontend**: React, TypeScript, Tailwind CSS
- **Armazenamento**: IndexedDB (local)
- **Processamento de Dados**: JavaScript/TypeScript
- **Manipulação de Excel**: SheetJS (xlsx)
- **Testes**: Jest, Testing Library
- **Ferramentas de Desenvolvimento**: Vite, ESLint, Prettier

## Considerações de Segurança

- Processamento totalmente local (dados não saem do computador do usuário)
- Sem dependência de serviços externos
- Sem armazenamento de dados sensíveis em servidores remotos
