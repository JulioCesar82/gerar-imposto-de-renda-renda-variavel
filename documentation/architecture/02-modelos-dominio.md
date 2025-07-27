# Modelos de Domínio

## Introdução

Os modelos de domínio representam os conceitos centrais da aplicação e encapsulam a lógica de negócio. Eles são independentes de detalhes de infraestrutura e implementação, permitindo que a lógica de negócio seja testada e mantida de forma isolada.

## Transaction

Representa uma transação (compra ou venda) de um ativo financeiro.

```typescript
export interface Transaction {
  id: string;
  date: Date;
  assetCode: string;
  assetCategory: AssetCategory;
  operationType: OperationType;
  quantity: number;
  price: number;
  totalValue: number;
  fees?: number;
  year: number;
  source: string;
}

export enum AssetCategory {
  STOCK = "STOCK",               // Ações
  REAL_ESTATE_FUND = "REAL_ESTATE_FUND", // Fundos Imobiliários
  ETF = "ETF",                   // ETFs
  BDR = "BDR",                   // BDRs
  OTHER = "OTHER"                // Outros
}

export enum OperationType {
  BUY = "BUY",                   // Compra
  SELL = "SELL"                  // Venda
}
```

### Atributos

- **id**: Identificador único da transação
- **date**: Data da transação
- **assetCode**: Código do ativo (ex: PETR4, BBAS3)
- **assetCategory**: Categoria do ativo (ação, FII, ETF, etc.)
- **operationType**: Tipo de operação (compra ou venda)
- **quantity**: Quantidade de ativos negociados
- **price**: Preço unitário do ativo
- **totalValue**: Valor total da transação (quantidade * preço)
- **fees**: Taxas e emolumentos (opcional)
- **year**: Ano da transação
- **source**: Origem da transação (ex: B3_NEGOTIATION)

## SpecialEvent

Representa um evento especial relacionado a um ativo, como desdobramentos, bonificações, etc.

```typescript
export interface SpecialEvent {
  id: string;
  date: Date;
  assetCode: string;
  assetCategory: AssetCategory;
  eventType: EventType;
  quantity?: number;
  price?: number;
  factor?: number;
  oldQuantity?: number;
  newAssetCode?: string;
  year: number;
}

export enum EventType {
  SPLIT = "SPLIT",               // Desdobramento
  REVERSE_SPLIT = "REVERSE_SPLIT", // Grupamento
  BONUS = "BONUS",               // Bonificação
  SUBSCRIPTION = "SUBSCRIPTION", // Subscrição
  CONVERSION_IN = "CONVERSION_IN", // Conversão (entrada)
  CONVERSION_OUT = "CONVERSION_OUT", // Conversão (saída)
  DIVIDEND = "DIVIDEND",         // Dividendo
  JCP = "JCP",                   // Juros sobre Capital Próprio
  INCOME = "INCOME"              // Rendimento (FIIs)
}
```

### Atributos

- **id**: Identificador único do evento
- **date**: Data do evento
- **assetCode**: Código do ativo
- **assetCategory**: Categoria do ativo
- **eventType**: Tipo de evento
- **quantity**: Quantidade de ativos envolvidos (opcional)
- **price**: Valor unitário (opcional)
- **factor**: Fator de ajuste para desdobramentos/grupamentos (opcional)
- **oldQuantity**: Quantidade anterior (opcional)
- **newAssetCode**: Novo código do ativo em caso de conversão (opcional)
- **year**: Ano do evento

## AssetPosition

Representa a posição de um ativo, incluindo seu histórico de transações e eventos.

```typescript
export interface AssetPosition {
  assetCode: string;
  assetCategory: AssetCategory;
  quantity: number;
  averageCost: number;
  totalCost: number;
  lastUpdate: Date;
  transactions: Transaction[];
  specialEvents: SpecialEvent[];
}
```

### Atributos

- **assetCode**: Código do ativo
- **assetCategory**: Categoria do ativo
- **quantity**: Quantidade atual do ativo
- **averageCost**: Preço médio de aquisição
- **totalCost**: Custo total (quantidade * preço médio)
- **lastUpdate**: Data da última atualização
- **transactions**: Lista de transações relacionadas ao ativo
- **specialEvents**: Lista de eventos especiais relacionados ao ativo

## TradeResult

Representa o resultado de uma operação de venda.

```typescript
export interface TradeResult {
  assetCode: string;
  date: Date;
  soldQuantity: number;
  salePrice: number;
  saleValue: number;
  averageCost: number;
  costBasis: number;
  profit: number;
  isExempt: boolean;
  month: number;
  year: number;
}
```

### Atributos

- **assetCode**: Código do ativo
- **date**: Data da venda
- **soldQuantity**: Quantidade vendida
- **salePrice**: Preço de venda
- **saleValue**: Valor total da venda
- **averageCost**: Preço médio de aquisição
- **costBasis**: Base de custo (averageCost * soldQuantity)
- **profit**: Lucro ou prejuízo (saleValue - costBasis)
- **isExempt**: Indica se a operação é isenta de imposto
- **month**: Mês da venda
- **year**: Ano da venda

## MonthlyResult

Representa o resultado mensal das operações.

```typescript
export interface MonthlyResult {
  year: number;
  month: number;
  stockResults: {
    totalSales: number;
    totalProfit: number;
    totalLoss: number;
    netResult: number;
    isExempt: boolean;
  };
  realEstateFundResults: {
    totalSales: number;
    totalProfit: number;
    totalLoss: number;
    netResult: number;
  };
  previousLossCompensation: number;
  taxableProfit: number;
  taxDue: number;
}
```

### Atributos

- **year**: Ano do resultado
- **month**: Mês do resultado
- **stockResults**: Resultados de operações com ações
- **realEstateFundResults**: Resultados de operações com FIIs
- **previousLossCompensation**: Compensação de prejuízos anteriores
- **taxableProfit**: Lucro tributável
- **taxDue**: Imposto devido

## IncomeRecord

Representa um registro de rendimento (dividendos, JCP, etc.).

```typescript
export interface IncomeRecord {
  assetCode: string;
  assetCategory: AssetCategory;
  incomeType: IncomeType;
  date: Date;
  value: number;
  taxWithheld?: number;
  year: number;
  payerName: string;
  payerCNPJ: string;
}

export enum IncomeType {
  DIVIDEND = "DIVIDEND",         // Dividendos
  JCP = "JCP",                   // JCP
  REAL_ESTATE_FUND_INCOME = "REAL_ESTATE_FUND_INCOME", // Rendimentos de FIIs
  EXEMPT_PROFIT = "EXEMPT_PROFIT" // Lucro isento em vendas
}
```

### Atributos

- **assetCode**: Código do ativo
- **assetCategory**: Categoria do ativo
- **incomeType**: Tipo de rendimento
- **date**: Data do recebimento
- **value**: Valor do rendimento
- **taxWithheld**: Imposto retido na fonte (opcional)
- **year**: Ano do recebimento
- **payerName**: Nome do pagador
- **payerCNPJ**: CNPJ do pagador

## IRPFDeclaration

Representa uma declaração IRPF completa.

```typescript
export interface IRPFDeclaration {
  taxPayerInfo: TaxPayerInfo;
  assets: Asset[];
  exemptIncome: ExemptIncome[];
  exclusiveTaxIncome: ExclusiveTaxIncome[];
  variableIncome: VariableIncome;
  year: number;
}

export interface TaxPayerInfo {
  name: string;
  cpf: string;
  birthDate?: Date;
  address?: string;
}

export interface Asset {
  code: string;
  description: string;
  assetCode: string;
  quantity: number;
  acquisitionValue: number;
  previousYearValue: number;
  currentYearValue: number;
  acquisitionDate?: Date;
}

export interface ExemptIncome {
  code: string;
  type: ExemptIncomeType;
  value: number;
  payerInfo?: {
    name: string;
    cnpj: string;
  };
}

export enum ExemptIncomeType {
  DIVIDENDS = "DIVIDENDS",       // Dividendos
  REAL_ESTATE_FUND_INCOME = "REAL_ESTATE_FUND_INCOME", // Rendimentos de FIIs
  EXEMPT_STOCK_PROFIT = "EXEMPT_STOCK_PROFIT" // Lucro isento em vendas de ações
}

export interface ExclusiveTaxIncome {
  code: string;
  type: ExclusiveTaxType;
  grossValue: number;
  taxWithheld: number;
  netValue: number;
  payerInfo?: {
    name: string;
    cnpj: string;
  };
}

export enum ExclusiveTaxType {
  JCP = "JCP"                    // Juros sobre Capital Próprio
}

export interface VariableIncome {
  monthlyResults: MonthlyVariableIncome[];
  lossCompensation: {
    previousYearLoss: number;
    currentYearLoss: number;
    compensatedLoss: number;
    remainingLoss: number;
  };
}

export interface MonthlyVariableIncome {
  month: number;
  commonOperations: {
    sales: number;
    profit: number;
    loss: number;
    compensatedLoss: number;
    netResult: number;
    taxBase: number;
    taxRate: number;
    taxDue: number;
  };
}
```

### Atributos Principais

- **taxPayerInfo**: Informações do contribuinte
- **assets**: Lista de ativos (Bens e Direitos)
- **exemptIncome**: Lista de rendimentos isentos
- **exclusiveTaxIncome**: Lista de rendimentos com tributação exclusiva
- **variableIncome**: Informações de renda variável
- **year**: Ano da declaração

## Relacionamentos entre Modelos

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Transaction   │     │  SpecialEvent   │     │  IncomeRecord   │
└────────┬────────┘     └────────┬────────┘     └────────┬────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────────────────────────────────────────────────────┐
│                        AssetPosition                            │
└────────────────────────────────┬────────────────────────────────┘
                                 │
                                 │
         ┌─────────────────────┬─┴───┬─────────────────────┐
         │                     │     │                     │
         ▼                     ▼     ▼                     ▼
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   TradeResult   │     │  MonthlyResult  │     │  IRPFDeclaration│
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

## Regras de Negócio

### Cálculo de Custo Médio

O custo médio de um ativo é calculado da seguinte forma:

1. Para cada compra, o custo médio é recalculado:
   ```
   novoCustoMedio = (custoMedioAtual * quantidadeAtual + precoCompra * quantidadeComprada) / (quantidadeAtual + quantidadeComprada)
   ```

2. Para cada venda, o custo médio permanece o mesmo, mas a quantidade é reduzida.

3. Para eventos especiais:
   - Desdobramento: a quantidade aumenta pelo fator de desdobramento, e o custo médio é dividido pelo mesmo fator.
   - Grupamento: a quantidade diminui pelo fator de grupamento, e o custo médio é multiplicado pelo mesmo fator.
   - Bonificação: a quantidade aumenta, mas o custo médio é recalculado para diluir o custo total pela nova quantidade.

### Apuração de Resultados

1. Para cada venda, o resultado é calculado:
   ```
   resultado = valorVenda - (custoMedio * quantidadeVendida)
   ```

2. Resultados são agrupados por mês e por tipo de ativo (ações, FIIs).

3. Prejuízos podem ser compensados com lucros futuros do mesmo tipo de ativo.

4. Vendas de ações com valor total mensal até R$ 20.000,00 são isentas de imposto.

### Rendimentos

1. Dividendos são isentos de imposto.

2. JCP tem tributação exclusiva na fonte (15%).

3. Rendimentos de FIIs são isentos para pessoas físicas.
