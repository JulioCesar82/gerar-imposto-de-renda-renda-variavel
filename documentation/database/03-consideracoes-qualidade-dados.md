# Considerações sobre Qualidade de Dados

## Introdução

A qualidade dos dados é um aspecto crítico para o Gerador de Arquivo IRPF para Investimentos B3, pois impacta diretamente a precisão das declarações de imposto de renda geradas. Este documento descreve as estratégias, processos e medidas implementadas para garantir a qualidade dos dados em todas as etapas do fluxo de processamento.

## Dimensões de Qualidade de Dados

A qualidade dos dados é avaliada em várias dimensões:

### 1. Precisão

**Definição**: Os dados representam corretamente a realidade que pretendem modelar.

**Medidas implementadas**:
- Validação rigorosa dos dados extraídos dos arquivos da B3
- Cálculos de verificação (ex: valor total = quantidade * preço)
- Comparação com valores de referência quando disponíveis

**Exemplo de implementação**:
```typescript
function validateTransactionAccuracy(transaction: Transaction): void {
  // Verifica se o valor total corresponde à quantidade * preço
  const calculatedTotal = transaction.quantity * transaction.price;
  const tolerance = 0.01; // Tolerância para diferenças de arredondamento
  
  if (Math.abs(transaction.totalValue - calculatedTotal) > tolerance * calculatedTotal) {
    throw new Error(`Valor total inconsistente para transação: ${transaction.id}`);
  }
}
```

### 2. Completude

**Definição**: Todos os dados necessários estão presentes e não há valores ausentes.

**Medidas implementadas**:
- Verificação de campos obrigatórios
- Preenchimento de valores padrão quando apropriado
- Alertas para dados incompletos

**Exemplo de implementação**:
```typescript
function checkCompleteness(transaction: Transaction): Inconsistency[] {
  const inconsistencies: Inconsistency[] = [];
  
  // Verifica campos obrigatórios
  if (!transaction.date) {
    inconsistencies.push({
      type: 'error',
      message: 'Data ausente',
      details: `A transação ${transaction.id} não possui data.`,
      assetCode: transaction.assetCode
    });
  }
  
  if (!transaction.assetCode) {
    inconsistencies.push({
      type: 'error',
      message: 'Código do ativo ausente',
      details: `A transação ${transaction.id} não possui código do ativo.`,
      date: transaction.date
    });
  }
  
  // Mais verificações...
  
  return inconsistencies;
}
```

### 3. Consistência

**Definição**: Os dados são consistentes entre si e não apresentam contradições.

**Medidas implementadas**:
- Verificação de consistência entre transações e eventos
- Validação de sequência cronológica
- Detecção de operações impossíveis (ex: venda a descoberto)

**Exemplo de implementação**:
```typescript
function validateConsistency(transactions: Transaction[]): Inconsistency[] {
  const inconsistencies: Inconsistency[] = [];
  const positionsByAsset: Record<string, number> = {};
  
  // Ordena transações por data
  const sortedTransactions = [...transactions].sort((a, b) => a.date.getTime() - b.date.getTime());
  
  // Verifica se não há vendas a descoberto
  for (const transaction of sortedTransactions) {
    const assetCode = transaction.assetCode;
    
    if (!positionsByAsset[assetCode]) {
      positionsByAsset[assetCode] = 0;
    }
    
    if (transaction.operationType === OperationType.BUY) {
      positionsByAsset[assetCode] += transaction.quantity;
    } else {
      if (positionsByAsset[assetCode] < transaction.quantity) {
        inconsistencies.push({
          type: 'error',
          message: 'Venda a descoberto',
          details: `A transação ${transaction.id} vende ${transaction.quantity} unidades de ${assetCode}, mas a posição atual é de apenas ${positionsByAsset[assetCode]} unidades.`,
          assetCode,
          date: transaction.date
        });
      }
      
      positionsByAsset[assetCode] -= transaction.quantity;
    }
  }
  
  return inconsistencies;
}
```

### 4. Validade

**Definição**: Os dados estão dentro dos domínios e formatos esperados.

**Medidas implementadas**:
- Validação de tipos de dados
- Validação de formatos (ex: CPF, CNPJ)
- Validação de valores dentro de faixas esperadas

**Exemplo de implementação**:
```typescript
function validateCPF(cpf: string): boolean {
  // Remove caracteres não numéricos
  cpf = cpf.replace(/\D/g, '');
  
  // Verifica se tem 11 dígitos
  if (cpf.length !== 11) {
    return false;
  }
  
  // Verifica se todos os dígitos são iguais
  if (/^(\d)\1+$/.test(cpf)) {
    return false;
  }
  
  // Calcula o primeiro dígito verificador
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cpf.charAt(i)) * (10 - i);
  }
  let remainder = sum % 11;
  let digit1 = remainder < 2 ? 0 : 11 - remainder;
  
  // Calcula o segundo dígito verificador
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cpf.charAt(i)) * (11 - i);
  }
  remainder = sum % 11;
  let digit2 = remainder < 2 ? 0 : 11 - remainder;
  
  // Verifica se os dígitos verificadores estão corretos
  return parseInt(cpf.charAt(9)) === digit1 && parseInt(cpf.charAt(10)) === digit2;
}
```

### 5. Integridade

**Definição**: Os dados mantêm sua integridade referencial e estrutural.

**Medidas implementadas**:
- Verificação de integridade referencial entre objetos
- Garantia de que operações não violam regras de integridade
- Transações atômicas para operações de armazenamento

**Exemplo de implementação**:
```typescript
async function saveProcessedData(
  sessionId: string,
  assetPositions: AssetPosition[],
  monthlyResults: MonthlyResult[],
  incomeRecords: IncomeRecord[]
): Promise<void> {
  // Inicia uma transação para garantir atomicidade
  const transaction = this.db.transaction(['sessionData'], 'readwrite');
  const store = transaction.objectStore('sessionData');
  
  try {
    // Recupera dados existentes
    const sessionData = await store.get(sessionId);
    
    if (!sessionData) {
      throw new Error(`Sessão não encontrada: ${sessionId}`);
    }
    
    // Atualiza com novos dados
    sessionData.processedData = {
      assetPositions,
      monthlyResults,
      incomeRecords
    };
    
    // Salva os dados atualizados
    await store.put(sessionData);
    
    // Completa a transação
    await transaction.done;
  } catch (error) {
    // Em caso de erro, a transação é automaticamente abortada
    console.error('Erro ao salvar dados processados:', error);
    throw error;
  }
}
```

### 6. Temporalidade

**Definição**: Os dados são atuais e refletem o período correto.

**Medidas implementadas**:
- Validação de datas dentro do período fiscal relevante
- Ordenação cronológica de transações e eventos
- Alertas para dados fora do período esperado

**Exemplo de implementação**:
```typescript
function validateTemporality(transactions: Transaction[], year: number): Inconsistency[] {
  const inconsistencies: Inconsistency[] = [];
  
  for (const transaction of transactions) {
    // Verifica se a transação está no ano fiscal correto
    if (transaction.date.getFullYear() !== year) {
      inconsistencies.push({
        type: 'warning',
        message: 'Transação fora do ano fiscal',
        details: `A transação ${transaction.id} tem data de ${transaction.date.toLocaleDateString()}, que está fora do ano fiscal ${year}.`,
        assetCode: transaction.assetCode,
        date: transaction.date
      });
    }
    
    // Verifica se a data não é futura
    if (transaction.date > new Date()) {
      inconsistencies.push({
        type: 'error',
        message: 'Data futura',
        details: `A transação ${transaction.id} tem data futura: ${transaction.date.toLocaleDateString()}.`,
        assetCode: transaction.assetCode,
        date: transaction.date
      });
    }
  }
  
  return inconsistencies;
}
```

## Estratégias de Garantia de Qualidade

### 1. Validação na Entrada

A primeira linha de defesa para garantir a qualidade dos dados é a validação na entrada, durante o parsing dos arquivos da B3.

#### Validação de Formato

```typescript
function validateFileFormat(file: File): boolean {
  // Verifica a extensão do arquivo
  const extension = file.name.split('.').pop()?.toLowerCase();
  if (extension !== 'xlsx') {
    throw new Error('Formato de arquivo inválido. Apenas arquivos Excel (.xlsx) são aceitos.');
  }
  
  // Verifica o tamanho do arquivo
  const maxSizeInBytes = 10 * 1024 * 1024; // 10 MB
  if (file.size > maxSizeInBytes) {
    throw new Error(`Arquivo muito grande. O tamanho máximo permitido é ${maxSizeInBytes / (1024 * 1024)} MB.`);
  }
  
  return true;
}
```

#### Validação de Estrutura

```typescript
function validateFileStructure(data: any[]): boolean {
  // Verifica se o arquivo tem dados
  if (!data || data.length === 0) {
    throw new Error('Arquivo vazio ou sem dados.');
  }
  
  // Verifica se as colunas esperadas estão presentes
  const requiredColumns = ['Data do Negócio', 'Tipo de Operação', 'Código de Negociação', 'Quantidade', 'Preço', 'Valor Total'];
  const headers = Object.keys(data[0]);
  
  for (const column of requiredColumns) {
    if (!headers.some(header => header.includes(column))) {
      throw new Error(`Coluna obrigatória não encontrada: ${column}`);
    }
  }
  
  return true;
}
```

### 2. Validação de Domínio

Após a extração dos dados, é realizada uma validação de domínio para garantir que os valores estão dentro dos domínios esperados.

```typescript
function validateDomain(transaction: Transaction): void {
  // Validação de tipo de operação
  if (!Object.values(OperationType).includes(transaction.operationType)) {
    throw new Error(`Tipo de operação inválido: ${transaction.operationType}`);
  }
  
  // Validação de categoria de ativo
  if (!Object.values(AssetCategory).includes(transaction.assetCategory)) {
    throw new Error(`Categoria de ativo inválida: ${transaction.assetCategory}`);
  }
  
  // Validação de valores numéricos
  if (transaction.quantity <= 0) {
    throw new Error(`Quantidade inválida: ${transaction.quantity}`);
  }
  
  if (transaction.price <= 0) {
    throw new Error(`Preço inválido: ${transaction.price}`);
  }
  
  if (transaction.totalValue <= 0) {
    throw new Error(`Valor total inválido: ${transaction.totalValue}`);
  }
}
```

### 3. Detecção de Inconsistências

Durante o processamento, são detectadas inconsistências nos dados, que são reportadas ao usuário.

```typescript
function detectInconsistencies(
  transactions: Transaction[],
  specialEvents: SpecialEvent[]
): Inconsistency[] {
  const inconsistencies: Inconsistency[] = [];
  
  // Verifica consistência entre transações
  inconsistencies.push(...validateConsistency(transactions));
  
  // Verifica temporalidade
  inconsistencies.push(...validateTemporality(transactions, new Date().getFullYear() - 1));
  
  // Verifica eventos especiais
  for (const event of specialEvents) {
    // Verifica se o ativo existe nas transações
    const assetExists = transactions.some(t => t.assetCode === event.assetCode);
    if (!assetExists) {
      inconsistencies.push({
        type: 'warning',
        message: 'Evento para ativo não encontrado',
        details: `O evento ${event.id} refere-se ao ativo ${event.assetCode}, que não foi encontrado nas transações.`,
        assetCode: event.assetCode,
        date: event.date
      });
    }
    
    // Mais verificações específicas para cada tipo de evento...
  }
  
  return inconsistencies;
}
```

### 4. Correção Automática

Em alguns casos, é possível corrigir automaticamente inconsistências menores.

```typescript
function autoCorrectData(
  transactions: Transaction[],
  specialEvents: SpecialEvent[]
): { transactions: Transaction[]; specialEvents: SpecialEvent[]; corrections: Correction[] } {
  const corrections: Correction[] = [];
  const correctedTransactions = [...transactions];
  const correctedEvents = [...specialEvents];
  
  // Corrige códigos de ativos (remove espaços, converte para maiúsculas)
  for (let i = 0; i < correctedTransactions.length; i++) {
    const original = correctedTransactions[i].assetCode;
    const corrected = original.replace(/\s+/g, '').toUpperCase();
    
    if (original !== corrected) {
      corrections.push({
        type: 'assetCode',
        entityId: correctedTransactions[i].id,
        originalValue: original,
        correctedValue: corrected
      });
      
      correctedTransactions[i] = {
        ...correctedTransactions[i],
        assetCode: corrected
      };
    }
  }
  
  // Corrige datas (ajusta para o fuso horário local)
  for (let i = 0; i < correctedTransactions.length; i++) {
    const original = correctedTransactions[i].date;
    
    // Se a data tem horário diferente de meia-noite, ajusta para meia-noite
    if (original.getHours() !== 0 || original.getMinutes() !== 0 || original.getSeconds() !== 0) {
      const corrected = new Date(original);
      corrected.setHours(0, 0, 0, 0);
      
      corrections.push({
        type: 'date',
        entityId: correctedTransactions[i].id,
        originalValue: original.toISOString(),
        correctedValue: corrected.toISOString()
      });
      
      correctedTransactions[i] = {
        ...correctedTransactions[i],
        date: corrected
      };
    }
  }
  
  // Mais correções automáticas...
  
  return { transactions: correctedTransactions, specialEvents: correctedEvents, corrections };
}
```

### 5. Feedback ao Usuário

As inconsistências detectadas são apresentadas ao usuário de forma clara, permitindo que ele tome decisões informadas.

```typescript
function presentInconsistenciesToUser(inconsistencies: Inconsistency[]): void {
  // Agrupa inconsistências por tipo
  const errorInconsistencies = inconsistencies.filter(i => i.type === 'error');
  const warningInconsistencies = inconsistencies.filter(i => i.type === 'warning');
  
  // Apresenta erros (que impedem o processamento)
  if (errorInconsistencies.length > 0) {
    console.error(`Foram encontrados ${errorInconsistencies.length} erros que impedem o processamento:`);
    
    for (const inconsistency of errorInconsistencies) {
      console.error(`- ${inconsistency.message}: ${inconsistency.details}`);
    }
  }
  
  // Apresenta avisos (que não impedem o processamento)
  if (warningInconsistencies.length > 0) {
    console.warn(`Foram encontrados ${warningInconsistencies.length} avisos:`);
    
    for (const inconsistency of warningInconsistencies) {
      console.warn(`- ${inconsistency.message}: ${inconsistency.details}`);
    }
  }
}
```

## Monitoramento e Métricas de Qualidade

### 1. Métricas de Qualidade

Para monitorar a qualidade dos dados, são coletadas métricas em diferentes pontos do processamento:

```typescript
interface DataQualityMetrics {
  totalRecords: number;
  validRecords: number;
  invalidRecords: number;
  errorCount: number;
  warningCount: number;
  completenessScore: number; // 0-100%
  accuracyScore: number; // 0-100%
  consistencyScore: number; // 0-100%
}

function calculateDataQualityMetrics(
  transactions: Transaction[],
  specialEvents: SpecialEvent[],
  inconsistencies: Inconsistency[]
): DataQualityMetrics {
  const totalRecords = transactions.length + specialEvents.length;
  const errorInconsistencies = inconsistencies.filter(i => i.type === 'error');
  const warningInconsistencies = inconsistencies.filter(i => i.type === 'warning');
  
  // Calcula registros válidos e inválidos
  const invalidRecords = new Set(
    errorInconsistencies.map(i => i.assetCode || i.date?.toISOString() || '')
  ).size;
  
  const validRecords = totalRecords - invalidRecords;
  
  // Calcula scores
  const completenessScore = calculateCompletenessScore(transactions, specialEvents);
  const accuracyScore = calculateAccuracyScore(transactions, specialEvents);
  const consistencyScore = calculateConsistencyScore(transactions, specialEvents, inconsistencies);
  
  return {
    totalRecords,
    validRecords,
    invalidRecords,
    errorCount: errorInconsistencies.length,
    warningCount: warningInconsistencies.length,
    completenessScore,
    accuracyScore,
    consistencyScore
  };
}
```

### 2. Logging e Auditoria

Para garantir a rastreabilidade e auditabilidade do processamento, são mantidos logs detalhados:

```typescript
function logProcessingStep(
  step: string,
  input: any,
  output: any,
  metrics?: DataQualityMetrics
): void {
  const timestamp = new Date().toISOString();
  
  const logEntry = {
    timestamp,
    step,
    inputSummary: summarizeData(input),
    outputSummary: summarizeData(output),
    metrics
  };
  
  // Salva o log
  console.log(`[${timestamp}] ${step}`);
  
  if (metrics) {
    console.log(`  Métricas de qualidade: ${JSON.stringify(metrics)}`);
  }
  
  // Em um ambiente de produção, poderia salvar em um arquivo ou banco de dados
}

function summarizeData(data: any): any {
  // Cria um resumo dos dados para logging
  if (Array.isArray(data)) {
    return {
      type: 'array',
      length: data.length,
      sample: data.slice(0, 3)
    };
  }
  
  if (typeof data === 'object' && data !== null) {
    return {
      type: 'object',
      keys: Object.keys(data),
      sample: Object.fromEntries(
        Object.entries(data).slice(0, 5)
      )
    };
  }
  
  return {
    type: typeof data,
    value: data
  };
}
```

## Estratégias para Lidar com Dados Problemáticos

### 1. Rejeição de Dados Inválidos

Em alguns casos, a melhor estratégia é rejeitar dados inválidos:

```typescript
function filterValidTransactions(
  transactions: Transaction[],
  inconsistencies: Inconsistency[]
): Transaction[] {
  // Identifica IDs de transações com erros
  const errorTransactionIds = new Set(
    inconsistencies
      .filter(i => i.type === 'error')
      .map(i => {
        // Encontra a transação correspondente à inconsistência
        const transaction = transactions.find(t => 
          t.assetCode === i.assetCode && 
          t.date?.getTime() === i.date?.getTime()
        );
        
        return transaction?.id;
      })
      .filter(Boolean) as string[]
  );
  
  // Filtra transações válidas
  return transactions.filter(t => !errorTransactionIds.has(t.id));
}
```

### 2. Correção Manual

Para inconsistências que não podem ser corrigidas automaticamente, é oferecida a possibilidade de correção manual:

```typescript
interface ManualCorrection {
  entityId: string;
  entityType: 'transaction' | 'specialEvent';
  field: string;
  originalValue: any;
  correctedValue: any;
}

function applyManualCorrections(
  transactions: Transaction[],
  specialEvents: SpecialEvent[],
  corrections: ManualCorrection[]
): { transactions: Transaction[]; specialEvents: SpecialEvent[] } {
  const correctedTransactions = [...transactions];
  const correctedEvents = [...specialEvents];
  
  for (const correction of corrections) {
    if (correction.entityType === 'transaction') {
      const index = correctedTransactions.findIndex(t => t.id === correction.entityId);
      
      if (index !== -1) {
        correctedTransactions[index] = {
          ...correctedTransactions[index],
          [correction.field]: correction.correctedValue
        };
      }
    } else {
      const index = correctedEvents.findIndex(e => e.id === correction.entityId);
      
      if (index !== -1) {
        correctedEvents[index] = {
          ...correctedEvents[index],
          [correction.field]: correction.correctedValue
        };
      }
    }
  }
  
  return { transactions: correctedTransactions, specialEvents: correctedEvents };
}
```

### 3. Dados Ausentes

Para lidar com dados ausentes, são implementadas estratégias de preenchimento:

```typescript
function fillMissingData(
  transactions: Transaction[],
  specialEvents: SpecialEvent[]
): { transactions: Transaction[]; specialEvents: SpecialEvent[] } {
  const filledTransactions = [...transactions];
  const filledEvents = [...specialEvents];
  
  // Preenche ano fiscal ausente
  for (let i = 0; i < filledTransactions.length; i++) {
    if (!filledTransactions[i].year) {
      filledTransactions[i] = {
        ...filledTransactions[i],
        year: filledTransactions[i].date.getFullYear()
      };
    }
  }
  
  // Preenche categoria de ativo ausente
  for (let i = 0; i < filledTransactions.length; i++) {
    if (!filledTransactions[i].assetCategory) {
      filledTransactions[i] = {
        ...filledTransactions[i],
        assetCategory: determineAssetCategory(filledTransactions[i].assetCode, '')
      };
    }
  }
  
  // Mais preenchimentos...
  
  return { transactions: filledTransactions, specialEvents: filledEvents };
}
```

## Conclusão

A qualidade dos dados é um aspecto fundamental para o Gerador de Arquivo IRPF para Investimentos B3, pois impacta diretamente a precisão e confiabilidade das declarações geradas. As estratégias e medidas implementadas visam garantir que os dados sejam precisos, completos, consistentes, válidos, íntegros e temporalmente corretos.

O processo de garantia de qualidade de dados é contínuo e permeia todas as etapas do fluxo de processamento, desde a validação na entrada até a geração do arquivo final. A detecção e correção de inconsistências, o monitoramento através de métricas e o feedback claro ao usuário são elementos essenciais desse processo.

A abordagem adotada busca equilibrar a automação (para eficiência) com a intervenção manual (para casos complexos), sempre priorizando a transparência e a rastreabilidade das transformações aplicadas aos dados.
