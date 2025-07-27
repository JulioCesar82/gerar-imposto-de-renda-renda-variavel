# Portas (Interfaces)

## Introdução

Na arquitetura hexagonal, as portas são interfaces que definem como o domínio da aplicação se comunica com o mundo exterior. Elas estabelecem contratos claros entre o domínio e os adaptadores, permitindo que diferentes implementações sejam substituídas sem afetar a lógica de negócio.

## FileParserPort

Interface responsável por analisar arquivos da B3 e convertê-los em objetos de domínio.

```typescript
export interface FileParserPort {
  /**
   * Parse a negotiation file (Excel) from B3
   * @param file The file to parse
   * @returns A promise that resolves to an array of transactions
   */
  parseNegotiationFile(file: File): Promise<Transaction[]>;
  
  /**
   * Parse a movement file (Excel) from B3
   * @param file The file to parse
   * @returns A promise that resolves to an array of special events
   */
  parseMovementFile(file: File): Promise<SpecialEvent[]>;
}
```

### Responsabilidades

- Analisar arquivos de negociação da B3 e extrair transações
- Analisar arquivos de movimentação da B3 e extrair eventos especiais
- Validar o formato dos arquivos
- Mapear dados dos arquivos para os modelos de domínio

### Implementações

- **B3FileParser**: Implementação para arquivos Excel da B3

## AssetProcessorPort

Interface responsável pelo processamento de ativos, cálculo de posições, resultados e rendimentos.

```typescript
export interface AssetProcessorPort {
  /**
   * Process transactions and special events to calculate asset positions
   * @param transactions The transactions to process
   * @param specialEvents The special events to process
   * @param initialPositions Optional initial positions
   * @returns A promise that resolves to an array of asset positions
   */
  processAssets(
    transactions: Transaction[], 
    specialEvents: SpecialEvent[],
    initialPositions?: AssetPosition[]
  ): Promise<AssetPosition[]>;
  
  /**
   * Calculate trade results from asset positions
   * @param assetPositions The asset positions to calculate trade results from
   * @returns A promise that resolves to an array of trade results
   */
  calculateTradeResults(
    assetPositions: AssetPosition[]
  ): Promise<TradeResult[]>;
  
  /**
   * Calculate monthly results from trade results
   * @param tradeResults The trade results to calculate monthly results from
   * @param previousYearLoss Optional previous year loss to compensate
   * @returns A promise that resolves to an array of monthly results
   */
  calculateMonthlyResults(
    tradeResults: TradeResult[],
    previousYearLoss?: number
  ): Promise<MonthlyResult[]>;
  
  /**
   * Extract income records from special events
   * @param specialEvents The special events to extract income records from
   * @returns A promise that resolves to an array of income records
   */
  extractIncomeRecords(
    specialEvents: SpecialEvent[]
  ): Promise<IncomeRecord[]>;
  
  /**
   * Validate data for inconsistencies
   * @param transactions The transactions to validate
   * @param specialEvents The special events to validate
   * @returns A promise that resolves to an array of inconsistencies
   */
  validateData(
    transactions: Transaction[],
    specialEvents: SpecialEvent[]
  ): Promise<Inconsistency[]>;
}

/**
 * Represents an inconsistency in the data
 */
export interface Inconsistency {
  type: 'error' | 'warning';
  message: string;
  details: string;
  assetCode?: string;
  date?: Date;
}
```

### Responsabilidades

- Processar transações e eventos especiais para calcular posições de ativos
- Calcular resultados de operações de venda
- Calcular resultados mensais e imposto devido
- Extrair registros de rendimentos de eventos especiais
- Validar dados e identificar inconsistências

### Implementações

- **DefaultAssetProcessor**: Implementação padrão com lógica de negócio

## IRPFGeneratorPort

Interface responsável pela geração de declarações IRPF e arquivos .DBK.

```typescript
export interface IRPFGeneratorPort {
  /**
   * Generate an IRPF declaration from asset positions, monthly results, and income records
   * @param assetPositions The asset positions to generate the declaration from
   * @param monthlyResults The monthly results to generate the declaration from
   * @param incomeRecords The income records to generate the declaration from
   * @param taxPayerInfo The taxpayer information
   * @param year The year of the declaration
   * @param includeInitialPosition Whether to include the initial position
   * @returns A promise that resolves to an IRPF declaration
   */
  generateDeclaration(
    assetPositions: AssetPosition[],
    monthlyResults: MonthlyResult[],
    incomeRecords: IncomeRecord[],
    taxPayerInfo: TaxPayerInfo,
    year: number,
    includeInitialPosition: boolean
  ): Promise<IRPFDeclaration>;
  
  /**
   * Generate a .DBK file from an IRPF declaration
   * @param declaration The IRPF declaration to generate the file from
   * @returns A promise that resolves to a Blob containing the .DBK file
   */
  generateDBKFile(
    declaration: IRPFDeclaration
  ): Promise<Blob>;
}
```

### Responsabilidades

- Gerar declaração IRPF a partir de posições de ativos, resultados mensais e registros de rendimentos
- Gerar arquivo .DBK a partir da declaração IRPF
- Formatar dados conforme especificações da Receita Federal

### Implementações

- **DefaultIRPFGenerator**: Implementação padrão para geração de declarações e arquivos .DBK

## StoragePort

Interface responsável pelo armazenamento e recuperação de dados.

```typescript
export interface StoragePort {
  /**
   * Save a session
   * @param sessionId The ID of the session
   * @param description Optional description of the session
   * @param year The year of the session
   * @returns A promise that resolves when the session is saved
   */
  saveSession(
    sessionId: string,
    description: string | undefined,
    year: number
  ): Promise<void>;
  
  /**
   * Save transactions
   * @param sessionId The ID of the session
   * @param transactions The transactions to save
   * @returns A promise that resolves when the transactions are saved
   */
  saveTransactions(
    sessionId: string,
    transactions: Transaction[]
  ): Promise<void>;
  
  /**
   * Save special events
   * @param sessionId The ID of the session
   * @param specialEvents The special events to save
   * @returns A promise that resolves when the special events are saved
   */
  saveSpecialEvents(
    sessionId: string,
    specialEvents: SpecialEvent[]
  ): Promise<void>;
  
  /**
   * Save processed data
   * @param sessionId The ID of the session
   * @param assetPositions The asset positions to save
   * @param monthlyResults The monthly results to save
   * @param incomeRecords The income records to save
   * @returns A promise that resolves when the processed data is saved
   */
  saveProcessedData(
    sessionId: string,
    assetPositions: AssetPosition[],
    monthlyResults: MonthlyResult[],
    incomeRecords: IncomeRecord[]
  ): Promise<void>;
  
  /**
   * Save a declaration
   * @param sessionId The ID of the session
   * @param declaration The declaration to save
   * @returns A promise that resolves when the declaration is saved
   */
  saveDeclaration(
    sessionId: string,
    declaration: IRPFDeclaration
  ): Promise<void>;
  
  /**
   * Get all sessions
   * @returns A promise that resolves to an array of sessions
   */
  getSessions(): Promise<StoredSession[]>;
  
  /**
   * Get a session by ID
   * @param sessionId The ID of the session
   * @returns A promise that resolves to the session data
   */
  getSessionData(
    sessionId: string
  ): Promise<StoredData | null>;
  
  /**
   * Delete a session
   * @param sessionId The ID of the session
   * @returns A promise that resolves when the session is deleted
   */
  deleteSession(
    sessionId: string
  ): Promise<void>;
}

/**
 * Represents a stored session
 */
export interface StoredSession {
  id: string;
  createdAt: Date;
  lastModified: Date;
  year: number;
  description?: string;
  status: SessionStatus;
}

/**
 * Represents stored data
 */
export interface StoredData {
  sessionId: string;
  transactions: Transaction[];
  specialEvents: SpecialEvent[];
  initialPositions?: AssetPosition[];
  processedData?: {
    assetPositions: AssetPosition[];
    monthlyResults: MonthlyResult[];
    incomeRecords: IncomeRecord[];
  };
  generatedDeclaration?: IRPFDeclaration;
}

/**
 * Status of a session
 */
export enum SessionStatus {
  DRAFT = "DRAFT",               // Rascunho (incompleto)
  PROCESSED = "PROCESSED",       // Processado
  GENERATED = "GENERATED",       // Arquivo gerado
  ARCHIVED = "ARCHIVED"          // Arquivado
}
```

### Responsabilidades

- Salvar e recuperar sessões
- Salvar e recuperar transações e eventos especiais
- Salvar e recuperar dados processados
- Salvar e recuperar declarações
- Gerenciar o ciclo de vida das sessões

### Implementações

- **IndexedDBStorage**: Implementação usando IndexedDB para armazenamento local

## Relacionamentos entre Portas

```
┌─────────────────────────────────────────────────────────────────┐
│                        Interface de Usuário                      │
└───────────────────────────────┬─────────────────────────────────┘
                                │
                                ▼
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  FileParserPort │     │AssetProcessorPort│     │IRPFGeneratorPort│
└────────┬────────┘     └────────┬────────┘     └────────┬────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────────────────────────────────────────────────────┐
│                          StoragePort                            │
└─────────────────────────────────────────────────────────────────┘
```

## Princípios de Design

### Inversão de Dependência

As portas seguem o princípio de inversão de dependência (Dependency Inversion Principle), onde:

1. Módulos de alto nível não dependem de módulos de baixo nível. Ambos dependem de abstrações.
2. Abstrações não dependem de detalhes. Detalhes dependem de abstrações.

### Interface Segregation

As portas são projetadas seguindo o princípio de segregação de interfaces (Interface Segregation Principle), onde:

1. Nenhum cliente deve ser forçado a depender de métodos que não utiliza.
2. Interfaces grandes são divididas em interfaces menores e mais específicas.

### Single Responsibility

Cada porta tem uma única responsabilidade bem definida, seguindo o princípio de responsabilidade única (Single Responsibility Principle).

## Benefícios

- **Testabilidade**: As portas permitem que os componentes sejam testados de forma isolada, usando mocks ou stubs.
- **Flexibilidade**: Diferentes implementações podem ser substituídas sem afetar o domínio.
- **Manutenibilidade**: Separação clara de responsabilidades facilita a manutenção.
- **Evolução**: Novas funcionalidades podem ser adicionadas sem modificar o código existente.
