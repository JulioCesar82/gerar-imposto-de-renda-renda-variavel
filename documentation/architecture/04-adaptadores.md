# Adaptadores

## Introdução

Na arquitetura hexagonal, os adaptadores são implementações concretas das portas (interfaces) que conectam o domínio da aplicação com o mundo exterior. Eles traduzem as solicitações externas para o formato que o domínio entende e vice-versa.

Existem dois tipos principais de adaptadores:

1. **Adaptadores Primários (Driving Adapters)**: Iniciam a interação com a aplicação, como interfaces de usuário, APIs REST, etc.
2. **Adaptadores Secundários (Driven Adapters)**: São utilizados pela aplicação para interagir com sistemas externos, como bancos de dados, serviços web, etc.

## B3FileParser

Implementação da interface `FileParserPort` para arquivos Excel da B3.

```typescript
export class B3FileParser implements FileParserPort {
  async parseNegotiationFile(file: File): Promise<Transaction[]> {
    // Implementação para analisar arquivos de negociação
  }
  
  async parseMovementFile(file: File): Promise<SpecialEvent[]> {
    // Implementação para analisar arquivos de movimentação
  }
  
  // Métodos privados auxiliares
  private async readExcelFile(file: File): Promise<any[]> {
    // Lê o arquivo Excel usando a biblioteca SheetJS
  }
  
  private processNegotiationData(data: any[]): Transaction[] {
    // Processa os dados de negociação
  }
  
  private processMovementData(data: any[]): SpecialEvent[] {
    // Processa os dados de movimentação
  }
  
  // Outros métodos auxiliares para parsing e mapeamento
}
```

### Responsabilidades

- Ler arquivos Excel usando a biblioteca SheetJS
- Identificar cabeçalhos e colunas relevantes nos arquivos
- Mapear dados para os modelos de domínio (Transaction, SpecialEvent)
- Normalizar códigos de ativos, datas, valores, etc.
- Determinar categorias de ativos com base em padrões de código
- Tratar diferentes formatos de data e número

### Detalhes de Implementação

- Utiliza a biblioteca SheetJS para ler arquivos Excel
- Implementa estratégias de busca flexível para encontrar cabeçalhos
- Suporta diferentes formatos de data (DD/MM/YYYY, número Excel)
- Normaliza valores monetários (remove R$, converte vírgulas, etc.)
- Identifica tipos de eventos especiais com base em descrições

## DBKFileParser

Implementação da interface `FileParserPort` para análise e extração de dados de arquivos `.DBK` da Receita Federal.

```typescript
export class DBKFileParser implements FileParserPort {
  async parseDBKFile(file: File): Promise<{
    taxPayerInfo: TaxPayerInfo;
    declaration?: Partial<IRPFDeclaration>;
  }> {
    // Analisa um arquivo .DBK e extrai informações
  }
  
  // Métodos privados auxiliares para parsing e extração
}
```

### Responsabilidades

- Analisar arquivos .DBK no formato da Receita Federal
- Extrair informações do contribuinte e dados da declaração
- Mapear dados do formato .DBK para o modelo de domínio da aplicação

### Detalhes de Implementação

- Suporta tanto o formato padrão quanto o formato oficial da Receita Federal
- Implementa estratégias de extração de dados baseadas em posições fixas no arquivo
- Realiza validação e sanitização dos dados extraídos
- Não armazena dados sensíveis como valores padrão no código

## IndexedDBStorage

Implementação da interface `StoragePort` usando IndexedDB para armazenamento local.

```typescript
export class IndexedDBStorage implements StoragePort {
  private readonly DB_NAME = 'IRPFGeneratorDB';
  private readonly DB_VERSION = 1;
  private db: IDBPDatabase | null = null;
  
  async initialize(): Promise<void> {
    // Inicializa o banco de dados IndexedDB
  }
  
  async saveSession(
    sessionId: string,
    description: string | undefined,
    year: number
  ): Promise<void> {
    // Salva uma sessão
  }
  
  async saveTransactions(
    sessionId: string,
    transactions: Transaction[]
  ): Promise<void> {
    // Salva transações
  }
  
  async saveSpecialEvents(
    sessionId: string,
    specialEvents: SpecialEvent[]
  ): Promise<void> {
    // Salva eventos especiais
  }
  
  async saveProcessedData(
    sessionId: string,
    assetPositions: AssetPosition[],
    monthlyResults: MonthlyResult[],
    incomeRecords: IncomeRecord[]
  ): Promise<void> {
    // Salva dados processados
  }
  
  async saveDeclaration(
    sessionId: string,
    declaration: IRPFDeclaration
  ): Promise<void> {
    // Salva uma declaração
  }
  
  async getSessions(): Promise<StoredSession[]> {
    // Obtém todas as sessões
  }
  
  async getSessionData(
    sessionId: string
  ): Promise<StoredData | null> {
    // Obtém dados de uma sessão
  }
  
  async deleteSession(
    sessionId: string
  ): Promise<void> {
    // Exclui uma sessão
  }
}
```

### Responsabilidades

- Inicializar e gerenciar o banco de dados IndexedDB
- Salvar e recuperar sessões, transações, eventos especiais, etc.
- Gerenciar o ciclo de vida das sessões
- Garantir a persistência dos dados entre sessões do navegador

### Detalhes de Implementação

- Utiliza a biblioteca idb para interagir com IndexedDB
- Implementa um esquema de banco de dados com duas stores principais:
  - `sessions`: Armazena metadados das sessões
  - `sessionData`: Armazena os dados completos de cada sessão
- Gerencia atualizações de status das sessões
- Implementa operações atômicas para garantir consistência dos dados

## DefaultAssetProcessor

Implementação da interface `AssetProcessorPort` com a lógica de negócio para processamento de ativos.

```typescript
export class DefaultAssetProcessor implements AssetProcessorPort {
  async processAssets(
    transactions: Transaction[], 
    specialEvents: SpecialEvent[],
    initialPositions?: AssetPosition[]
  ): Promise<AssetPosition[]> {
    // Processa transações e eventos especiais para calcular posições de ativos
  }
  
  async calculateTradeResults(
    assetPositions: AssetPosition[]
  ): Promise<TradeResult[]> {
    // Calcula resultados de operações de venda
  }
  
  async calculateMonthlyResults(
    tradeResults: TradeResult[],
    previousYearLoss?: number
  ): Promise<MonthlyResult[]> {
    // Calcula resultados mensais e imposto devido
  }
  
  async extractIncomeRecords(
    specialEvents: SpecialEvent[]
  ): Promise<IncomeRecord[]> {
    // Extrai registros de rendimentos de eventos especiais
  }
  
  async validateData(
    transactions: Transaction[],
    specialEvents: SpecialEvent[]
  ): Promise<Inconsistency[]> {
    // Valida dados e identifica inconsistências
  }
  
  // Métodos privados auxiliares para cálculos e validações
}
```

### Responsabilidades

- Implementar a lógica de negócio para processamento de ativos
- Calcular custo médio de ativos
- Calcular resultados de operações de venda
- Calcular imposto devido
- Identificar inconsistências nos dados

### Detalhes de Implementação

- Ordena transações e eventos especiais por data
- Implementa algoritmo de custo médio ponderado
- Aplica regras fiscais para cálculo de imposto
- Implementa lógica para tratamento de eventos especiais
- Implementa validações para identificar inconsistências

## DBKFileGenerator

Implementação da interface `IRPFGeneratorPort` para geração de arquivos .DBK compatíveis com o programa da Receita Federal.

```typescript
export class DBKFileGenerator implements IRPFGeneratorPort {
  async generateDBKFile(
    declaration: IRPFDeclaration
  ): Promise<Blob> {
    // Gera um arquivo .DBK
  }
  
  // Métodos privados auxiliares para formatação e geração
}
```

### Responsabilidades

- Gerar arquivo .DBK no formato aceito pela Receita Federal
- Aplicar regras de formatação específicas da Receita Federal

### Detalhes de Implementação

- Gera arquivo .DBK seguindo o layout oficial da Receita Federal
- Implementa a codificação e formatação específica do formato .DBK

## Adaptadores de UI

Os componentes React funcionam como adaptadores primários, iniciando a interação com a aplicação.

### Páginas

- **HomePage**: Página inicial com informações sobre a aplicação
- **UploadPage**: Página para upload de arquivos da B3
- **ProcessingPage**: Página de processamento com indicador de progresso
- **ResultsPage**: Página de resultados com tabelas e gráficos
- **GeneratePage**: Página para geração do arquivo IRPF

### Componentes de Layout

- **Layout**: Componente principal de layout
- **Header**: Cabeçalho da aplicação
- **Footer**: Rodapé da aplicação

## Relacionamentos entre Adaptadores

```
┌─────────────────────────────────────────────────────────────────┐
│                     Adaptadores Primários                        │
│                                                                 │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  │
│  │    HomePage     │  │   UploadPage    │  │  ResultsPage    │  │
│  └────────┬────────┘  └────────┬────────┘  └────────┬────────┘  │
│           │                    │                    │           │
└───────────┼────────────────────┼────────────────────┼───────────┘
            │                    │                    │
            ▼                    ▼                    ▼
┌─────────────────────────────────────────────────────────────────┐
│                          Domínio                                │
└───────────┬────────────────────┬────────────────────┬───────────┘
            │                    │                    │
            ▼                    ▼                    ▼
┌─────────────────────────────────────────────────────────────────┐
│                     Adaptadores Secundários                      │
│                                                                 │
│  ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐    │
│  │  B3FileParser   │ │  DBKFileParser  │ │ IndexedDBStorage│    │
│  └─────────────────┘ └─────────────────┘ └─────────────────┘    │
│                      ┌─────────────────┐                        │
│                      │ DBKFileGenerator│                        │
│                      └─────────────────┘                        │
└─────────────────────────────────────────────────────────────────┘
```

## Princípios de Design

### Adaptadores Plugáveis

Os adaptadores são projetados para serem plugáveis, permitindo que diferentes implementações sejam substituídas sem afetar o domínio.

### Separação de Responsabilidades

Cada adaptador tem uma responsabilidade bem definida, seguindo o princípio de responsabilidade única (Single Responsibility Principle).

### Testabilidade

Os adaptadores são projetados para serem facilmente testáveis, com dependências explícitas e interfaces bem definidas.

## Benefícios

- **Flexibilidade**: Diferentes implementações podem ser substituídas sem afetar o domínio
- **Testabilidade**: Adaptadores podem ser testados de forma isolada
- **Manutenibilidade**: Separação clara de responsabilidades facilita a manutenção
- **Evolução**: Novos adaptadores podem ser adicionados sem modificar o código existente
