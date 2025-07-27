# Transformações de Dados

## Introdução

Este documento detalha as transformações de dados realizadas no Gerador de Arquivo IRPF para Investimentos B3, desde a extração dos dados brutos dos arquivos da B3 até a geração do arquivo final para importação no programa da Receita Federal. O objetivo é fornecer uma visão clara de como os dados são manipulados, transformados e enriquecidos ao longo do fluxo de processamento.

## Visão Geral das Transformações

O processo de transformação de dados pode ser dividido em várias etapas principais:

1. **Extração e Normalização**: Conversão dos dados brutos dos arquivos Excel para objetos estruturados
2. **Enriquecimento**: Adição de informações derivadas e classificação de dados
3. **Agregação**: Cálculo de valores agregados e resumos
4. **Formatação para Saída**: Conversão dos dados processados para o formato final de saída

## Extração e Normalização

### Parsing de Arquivos Excel

A primeira transformação ocorre durante o parsing dos arquivos Excel da B3. Esta etapa é realizada pelo adaptador `B3FileParser`.

#### Transformações no Arquivo de Negociação

| Dado Original | Transformação | Resultado |
|---------------|---------------|-----------|
| Data do Negócio (texto) | Conversão para objeto Date | `date: Date` |
| Tipo de Operação (C/V) | Mapeamento para enum | `operationType: OperationType` |
| Código de Negociação | Normalização (maiúsculas, sem espaços) | `assetCode: string` |
| Especificação do Ativo | Classificação em categorias | `assetCategory: AssetCategory` |
| Quantidade | Conversão para número | `quantity: number` |
| Preço | Conversão para número decimal | `price: number` |
| Valor Total | Conversão para número decimal | `totalValue: number` |

**Exemplo de código para normalização do código de ativo:**

```typescript
function getAssetKey(code: string): string {
  // Remove espaços e converte para maiúsculas
  return code.replace(/\s+/g, '').toUpperCase();
}
```

**Exemplo de código para classificação de categoria de ativo:**

```typescript
function determineAssetCategory(assetCode: string, specification: string): AssetCategory {
  // Fundos imobiliários geralmente terminam com "11"
  if (assetCode.endsWith('11')) {
    return AssetCategory.REAL_ESTATE_FUND;
  }
  
  // ETFs geralmente terminam com "11B"
  if (assetCode.endsWith('11B')) {
    return AssetCategory.ETF;
  }
  
  // BDRs geralmente têm "34" no final
  if (assetCode.endsWith('34')) {
    return AssetCategory.BDR;
  }
  
  // Verifica se a especificação contém palavras-chave
  const specUpper = specification.toUpperCase();
  if (specUpper.includes('FII') || specUpper.includes('FUNDO IMOB')) {
    return AssetCategory.REAL_ESTATE_FUND;
  }
  
  if (specUpper.includes('ETF')) {
    return AssetCategory.ETF;
  }
  
  if (specUpper.includes('BDR')) {
    return AssetCategory.BDR;
  }
  
  // Padrão para ações
  return AssetCategory.STOCK;
}
```

#### Transformações no Arquivo de Movimentação

| Dado Original | Transformação | Resultado |
|---------------|---------------|-----------|
| Data da Movimentação (texto) | Conversão para objeto Date | `date: Date` |
| Tipo de Movimentação (texto) | Mapeamento para enum | `eventType: EventType` |
| Código de Negociação | Normalização (maiúsculas, sem espaços) | `assetCode: string` |
| Especificação do Evento | Classificação em categorias | `assetCategory: AssetCategory` |
| Quantidade | Conversão para número | `quantity: number` |
| Preço/Valor | Conversão para número decimal | `price: number` |
| Valor Total | Conversão para número decimal | `value: number` |

**Exemplo de código para mapeamento de tipo de evento:**

```typescript
function mapEventType(eventDescription: string): EventType {
  const desc = eventDescription.toUpperCase();
  
  if (desc.includes('DESDOBRAMENTO') || desc.includes('SPLIT')) {
    return EventType.SPLIT;
  }
  
  if (desc.includes('GRUPAMENTO') || desc.includes('INPLIT') || desc.includes('REVERSE SPLIT')) {
    return EventType.REVERSE_SPLIT;
  }
  
  if (desc.includes('BONIFICAÇÃO') || desc.includes('BONIFICACAO')) {
    return EventType.BONUS;
  }
  
  if (desc.includes('DIVIDENDO')) {
    return EventType.DIVIDEND;
  }
  
  if (desc.includes('JCP') || desc.includes('JUROS SOBRE CAPITAL')) {
    return EventType.JCP;
  }
  
  if (desc.includes('RENDIMENTO') && (desc.includes('FII') || desc.includes('FUNDO IMOB'))) {
    return EventType.INCOME;
  }
  
  if (desc.includes('SUBSCRIÇÃO') || desc.includes('SUBSCRICAO')) {
    return EventType.SUBSCRIPTION;
  }
  
  if (desc.includes('CONVERSÃO') || desc.includes('CONVERSAO')) {
    // Determinar se é entrada ou saída
    if (desc.includes('RECEBIDO') || desc.includes('CREDITADO')) {
      return EventType.CONVERSION_IN;
    } else {
      return EventType.CONVERSION_OUT;
    }
  }
  
  // Caso não seja possível determinar o tipo
  throw new Error(`Tipo de evento não reconhecido: ${eventDescription}`);
}
```

### Validação e Limpeza de Dados

Após a extração, os dados passam por um processo de validação e limpeza:

1. **Remoção de Duplicatas**: Identificação e remoção de registros duplicados
2. **Validação de Datas**: Garantia de que as datas estão em um formato válido e dentro do período esperado
3. **Validação de Valores**: Garantia de que valores numéricos são positivos e dentro de faixas esperadas
4. **Preenchimento de Dados Ausentes**: Quando possível, preenchimento de dados ausentes com valores padrão ou derivados

**Exemplo de código para validação de transação:**

```typescript
function validateTransaction(transaction: Transaction): void {
  // Validar data
  if (isNaN(transaction.date.getTime())) {
    throw new Error(`Data inválida para transação: ${transaction.id}`);
  }
  
  // Validar código do ativo
  if (!transaction.assetCode || transaction.assetCode.trim() === '') {
    throw new Error(`Código de ativo ausente para transação: ${transaction.id}`);
  }
  
  // Validar quantidade
  if (transaction.quantity <= 0) {
    throw new Error(`Quantidade inválida para transação: ${transaction.id}`);
  }
  
  // Validar preço
  if (transaction.price <= 0) {
    throw new Error(`Preço inválido para transação: ${transaction.id}`);
  }
  
  // Validar valor total
  const calculatedTotal = transaction.quantity * transaction.price;
  const tolerance = 0.01; // Tolerância para diferenças de arredondamento
  
  if (Math.abs(transaction.totalValue - calculatedTotal) > tolerance * calculatedTotal) {
    throw new Error(`Valor total inconsistente para transação: ${transaction.id}`);
  }
}
```

## Enriquecimento de Dados

### Adição de Metadados

Durante o processamento, os dados são enriquecidos com metadados adicionais:

1. **Identificadores Únicos**: Geração de IDs únicos para cada registro
2. **Carimbos de Tempo**: Adição de informações de data e hora de processamento
3. **Informações de Origem**: Registro da fonte dos dados (arquivo, usuário, etc.)
4. **Ano Fiscal**: Determinação do ano fiscal para cada registro

**Exemplo de código para enriquecimento de transação:**

```typescript
function enrichTransaction(transaction: Partial<Transaction>): Transaction {
  return {
    ...transaction,
    id: generateUUID(),
    year: transaction.date.getFullYear(),
    source: 'B3_NEGOTIATION',
    processedAt: new Date()
  } as Transaction;
}
```

### Classificação e Categorização

Os dados são classificados e categorizados para facilitar o processamento posterior:

1. **Categorização de Ativos**: Classificação em ações, FIIs, ETFs, etc.
2. **Categorização de Eventos**: Classificação em dividendos, JCP, desdobramentos, etc.
3. **Categorização de Operações**: Classificação em compras, vendas, etc.

Esta categorização já foi parcialmente realizada durante a extração, mas pode ser refinada nesta etapa com base em informações adicionais.

## Agregação e Cálculos

### Cálculo de Custo Médio

Uma das transformações mais importantes é o cálculo do custo médio de cada ativo:

```typescript
function calculateAverageCost(
  currentPosition: AssetPosition,
  transaction: Transaction
): AssetPosition {
  if (transaction.operationType === OperationType.BUY) {
    // Compra: recalcula o custo médio
    const newQuantity = currentPosition.quantity + transaction.quantity;
    const newTotalCost = currentPosition.totalCost + transaction.totalValue;
    const newAverageCost = newTotalCost / newQuantity;
    
    return {
      ...currentPosition,
      quantity: newQuantity,
      averageCost: newAverageCost,
      totalCost: newTotalCost,
      lastUpdate: transaction.date,
      transactions: [...currentPosition.transactions, transaction]
    };
  } else {
    // Venda: mantém o custo médio, reduz a quantidade
    const newQuantity = currentPosition.quantity - transaction.quantity;
    const newTotalCost = newQuantity * currentPosition.averageCost;
    
    return {
      ...currentPosition,
      quantity: newQuantity,
      totalCost: newTotalCost,
      lastUpdate: transaction.date,
      transactions: [...currentPosition.transactions, transaction]
    };
  }
}
```

### Aplicação de Eventos Especiais

Os eventos especiais, como desdobramentos e bonificações, requerem transformações específicas:

```typescript
function applySpecialEvent(
  currentPosition: AssetPosition,
  event: SpecialEvent
): AssetPosition {
  switch (event.eventType) {
    case EventType.SPLIT:
      // Desdobramento: aumenta a quantidade e reduz o custo médio proporcionalmente
      const factor = event.factor || 1;
      return {
        ...currentPosition,
        quantity: currentPosition.quantity * factor,
        averageCost: currentPosition.averageCost / factor,
        lastUpdate: event.date,
        specialEvents: [...currentPosition.specialEvents, event]
      };
      
    case EventType.REVERSE_SPLIT:
      // Grupamento: reduz a quantidade e aumenta o custo médio proporcionalmente
      const reverseFactor = event.factor || 1;
      return {
        ...currentPosition,
        quantity: currentPosition.quantity / reverseFactor,
        averageCost: currentPosition.averageCost * reverseFactor,
        lastUpdate: event.date,
        specialEvents: [...currentPosition.specialEvents, event]
      };
      
    case EventType.BONUS:
      // Bonificação: aumenta a quantidade e recalcula o custo médio
      const bonusQuantity = event.quantity || 0;
      const newQuantity = currentPosition.quantity + bonusQuantity;
      const newTotalCost = currentPosition.totalCost; // O custo total não muda
      const newAverageCost = newTotalCost / newQuantity;
      
      return {
        ...currentPosition,
        quantity: newQuantity,
        averageCost: newAverageCost,
        lastUpdate: event.date,
        specialEvents: [...currentPosition.specialEvents, event]
      };
      
    // Outros tipos de eventos...
    
    default:
      // Para eventos que não afetam a posição (dividendos, JCP, etc.)
      return {
        ...currentPosition,
        lastUpdate: event.date,
        specialEvents: [...currentPosition.specialEvents, event]
      };
  }
}
```

### Cálculo de Resultados

O cálculo de resultados de operações de venda envolve várias transformações:

```typescript
function calculateTradeResult(
  position: AssetPosition,
  sellTransaction: Transaction
): TradeResult {
  const costBasis = position.averageCost * sellTransaction.quantity;
  const profit = sellTransaction.totalValue - costBasis;
  const month = sellTransaction.date.getMonth() + 1; // Mês de 1 a 12
  
  // Verifica se a operação é isenta (vendas de ações até R$ 20.000/mês)
  const isExempt = position.assetCategory === AssetCategory.STOCK && 
                  sellTransaction.totalValue <= 20000;
  
  return {
    assetCode: position.assetCode,
    date: sellTransaction.date,
    soldQuantity: sellTransaction.quantity,
    salePrice: sellTransaction.price,
    saleValue: sellTransaction.totalValue,
    averageCost: position.averageCost,
    costBasis,
    profit,
    isExempt,
    month,
    year: sellTransaction.date.getFullYear()
  };
}
```

### Agregação Mensal

Os resultados são agregados por mês para cálculo de imposto:

```typescript
function aggregateMonthlyResults(
  tradeResults: TradeResult[]
): MonthlyResult[] {
  // Agrupa resultados por ano e mês
  const resultsByYearMonth = groupBy(tradeResults, result => `${result.year}-${result.month}`);
  
  return Object.entries(resultsByYearMonth).map(([yearMonth, results]) => {
    const [year, month] = yearMonth.split('-').map(Number);
    
    // Separa resultados por categoria
    const stockResults = results.filter(r => 
      r.assetCategory === AssetCategory.STOCK || 
      r.assetCategory === AssetCategory.ETF || 
      r.assetCategory === AssetCategory.BDR
    );
    
    const realEstateFundResults = results.filter(r => 
      r.assetCategory === AssetCategory.REAL_ESTATE_FUND
    );
    
    // Calcula totais para ações
    const stockTotalSales = sum(stockResults.map(r => r.saleValue));
    const stockTotalProfit = sum(stockResults.filter(r => r.profit > 0).map(r => r.profit));
    const stockTotalLoss = sum(stockResults.filter(r => r.profit < 0).map(r => Math.abs(r.profit)));
    const stockNetResult = stockTotalProfit - stockTotalLoss;
    const stockIsExempt = stockTotalSales <= 20000;
    
    // Calcula totais para FIIs
    const realtEstateTotalSales = sum(realEstateFundResults.map(r => r.saleValue));
    const realEstateTotalProfit = sum(realEstateFundResults.filter(r => r.profit > 0).map(r => r.profit));
    const realEstateTotalLoss = sum(realEstateFundResults.filter(r => r.profit < 0).map(r => Math.abs(r.profit)));
    const realEstateNetResult = realEstateTotalProfit - realEstateTotalLoss;
    
    // Calcula imposto devido (simplificado, sem considerar compensação de prejuízos)
    const taxableProfit = stockIsExempt ? 0 : Math.max(0, stockNetResult) + Math.max(0, realEstateNetResult);
    const taxDue = taxableProfit * 0.15; // Alíquota de 15%
    
    return {
      year,
      month,
      stockResults: {
        totalSales: stockTotalSales,
        totalProfit: stockTotalProfit,
        totalLoss: stockTotalLoss,
        netResult: stockNetResult,
        isExempt: stockIsExempt
      },
      realEstateFundResults: {
        totalSales: realtEstateTotalSales,
        totalProfit: realEstateTotalProfit,
        totalLoss: realEstateTotalLoss,
        netResult: realEstateNetResult
      },
      previousLossCompensation: 0, // Será calculado em uma etapa posterior
      taxableProfit,
      taxDue
    };
  });
}
```

## Formatação para Saída

### Geração de Arquivo IRPF

A transformação final envolve a conversão dos dados processados para o formato aceito pela Receita Federal:

```typescript
function generateIRPFDeclaration(
  assetPositions: AssetPosition[],
  monthlyResults: MonthlyResult[],
  incomeRecords: IncomeRecord[],
  taxPayerInfo: TaxPayerInfo,
  year: number
): IRPFDeclaration {
  // Mapeia posições para bens e direitos
  const assets = assetPositions
    .filter(position => position.quantity > 0)
    .map((position, index) => ({
      code: `31 - AÇÕES ${index + 1}`,
      description: `${position.quantity} ações de ${position.assetCode}`,
      assetCode: position.assetCode,
      quantity: position.quantity,
      acquisitionValue: position.totalCost,
      previousYearValue: 0, // Seria preenchido com dados do ano anterior
      currentYearValue: position.totalCost
    }));
  
  // Mapeia rendimentos isentos
  const exemptIncome = incomeRecords
    .filter(record => 
      record.incomeType === IncomeType.DIVIDEND || 
      record.incomeType === IncomeType.REAL_ESTATE_FUND_INCOME
    )
    .map(record => ({
      code: record.incomeType === IncomeType.DIVIDEND 
        ? '09 - LUCROS E DIVIDENDOS RECEBIDOS'
        : '26 - OUTROS',
      type: record.incomeType === IncomeType.DIVIDEND
        ? ExemptIncomeType.DIVIDENDS
        : ExemptIncomeType.REAL_ESTATE_FUND_INCOME,
      value: record.value,
      payerInfo: {
        name: record.payerName,
        cnpj: record.payerCNPJ
      }
    }));
  
  // Adiciona lucros isentos de vendas de ações
  const exemptProfits = monthlyResults
    .filter(result => result.stockResults.isExempt && result.stockResults.netResult > 0)
    .map(result => ({
      code: '20 - GANHOS LÍQUIDOS EM OPERAÇÕES DE RENDA VARIÁVEL',
      type: ExemptIncomeType.EXEMPT_STOCK_PROFIT,
      value: result.stockResults.netResult
    }));
  
  // Mapeia rendimentos com tributação exclusiva
  const exclusiveTaxIncome = incomeRecords
    .filter(record => record.incomeType === IncomeType.JCP)
    .map(record => ({
      code: '10 - JUROS SOBRE CAPITAL PRÓPRIO',
      type: ExclusiveTaxType.JCP,
      grossValue: record.value,
      taxWithheld: record.taxWithheld || (record.value * 0.15),
      netValue: record.value - (record.taxWithheld || (record.value * 0.15)),
      payerInfo: {
        name: record.payerName,
        cnpj: record.payerCNPJ
      }
    }));
  
  // Mapeia resultados mensais para renda variável
  const monthlyVariableIncome = monthlyResults
    .filter(result => !result.stockResults.isExempt)
    .map(result => {
      const commonOperations = {
        sales: result.stockResults.totalSales + result.realEstateFundResults.totalSales,
        profit: result.stockResults.totalProfit + result.realEstateFundResults.totalProfit,
        loss: result.stockResults.totalLoss + result.realEstateFundResults.totalLoss,
        compensatedLoss: result.previousLossCompensation,
        netResult: result.taxableProfit,
        taxBase: result.taxableProfit,
        taxRate: 0.15,
        taxDue: result.taxDue
      };
      
      return {
        month: result.month,
        commonOperations
      };
    });
  
  // Calcula compensação de prejuízos
  const lossCompensation = calculateLossCompensation(monthlyResults, year);
  
  return {
    taxPayerInfo,
    assets: [...assets, ...exemptIncome, ...exemptProfits],
    exemptIncome: [...exemptIncome, ...exemptProfits],
    exclusiveTaxIncome,
    variableIncome: {
      monthlyResults: monthlyVariableIncome,
      lossCompensation
    },
    year
  };
}
```

### Formatação do Arquivo .DBK

A última transformação é a conversão da declaração IRPF para o formato de arquivo .DBK:

```typescript
function generateDBKFile(declaration: IRPFDeclaration): string {
  let decContent = '';
  
  // Cabeçalho
  decContent += `IRPF${declaration.year}|${declaration.taxPayerInfo.cpf}|${declaration.taxPayerInfo.name}|\r\n`;
  
  // Bens e direitos
  for (const asset of declaration.assets) {
    decContent += `BENS|${asset.code}|${asset.description}|${formatCurrency(asset.previousYearValue)}|${formatCurrency(asset.currentYearValue)}|\r\n`;
  }
  
  // Rendimentos isentos
  for (const income of declaration.exemptIncome) {
    decContent += `RIEX|${income.code}|${formatCurrency(income.value)}|${income.payerInfo?.name || ''}|${income.payerInfo?.cnpj || ''}|\r\n`;
  }
  
  // Rendimentos com tributação exclusiva
  for (const income of declaration.exclusiveTaxIncome) {
    decContent += `RTEX|${income.code}|${formatCurrency(income.grossValue)}|${formatCurrency(income.taxWithheld)}|${income.payerInfo?.name || ''}|${income.payerInfo?.cnpj || ''}|\r\n`;
  }
  
  // Renda variável
  for (const monthly of declaration.variableIncome.monthlyResults) {
    decContent += `RVMF|${monthly.month}|${formatCurrency(monthly.commonOperations.sales)}|${formatCurrency(monthly.commonOperations.profit)}|${formatCurrency(monthly.commonOperations.loss)}|${formatCurrency(monthly.commonOperations.compensatedLoss)}|${formatCurrency(monthly.commonOperations.netResult)}|${formatCurrency(monthly.commonOperations.taxDue)}|\r\n`;
  }
  
  return decContent;
}

function formatCurrency(value: number): string {
  // Formata valor para o padrão do arquivo .DBK (sem separador de milhares e com vírgula como separador decimal)
  return value.toFixed(2).replace('.', ',');
}
```

## Considerações sobre Qualidade de Dados

### Validação e Integridade

Durante todo o processo de transformação, são aplicadas validações para garantir a integridade dos dados:

1. **Validação de Esquema**: Garantia de que os dados seguem a estrutura esperada
2. **Validação de Domínio**: Garantia de que os valores estão dentro dos domínios esperados
3. **Validação de Integridade Referencial**: Garantia de que as referências entre objetos são válidas
4. **Validação de Regras de Negócio**: Garantia de que as regras de negócio são respeitadas

### Tratamento de Erros

O processo de transformação inclui tratamento de erros em várias camadas:

1. **Erros de Parsing**: Tratamento de erros durante a leitura dos arquivos
2. **Erros de Validação**: Tratamento de erros durante a validação dos dados
3. **Erros de Processamento**: Tratamento de erros durante o processamento dos dados
4. **Erros de Geração**: Tratamento de erros durante a geração do arquivo final

### Auditoria e Rastreabilidade

Para garantir a auditabilidade e rastreabilidade das transformações:

1. **Logs de Transformação**: Registro de todas as transformações aplicadas
2. **Metadados de Proveniência**: Registro da origem de cada dado
3. **Versionamento**: Controle de versão dos dados e transformações

## Conclusão

As transformações de dados no Gerador de Arquivo IRPF para Investimentos B3 são projetadas para converter dados brutos dos extratos da B3 em informações estruturadas e prontas para declaração de imposto de renda. O processo é dividido em etapas claras, com validações e tratamentos de erro em cada uma delas, garantindo a qualidade e integridade dos dados.

A arquitetura modular permite que novas transformações sejam adicionadas ou modificadas conforme necessário, facilitando a adaptação a mudanças nos formatos de entrada ou requisitos de saída.
