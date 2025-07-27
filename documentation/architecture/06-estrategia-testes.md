# Estratégia de Testes

## Introdução

Uma estratégia de testes abrangente é essencial para garantir a qualidade, confiabilidade e manutenibilidade da aplicação. Este documento descreve a abordagem de testes adotada para o Gerador de Arquivo IRPF para Investimentos B3, incluindo tipos de testes, ferramentas, práticas e processos.

## Princípios de Teste

A estratégia de testes é baseada nos seguintes princípios:

1. **Testes como Documentação Viva**: Os testes servem como documentação executável do comportamento esperado do sistema.
2. **Pirâmide de Testes**: Maior ênfase em testes unitários, seguidos por testes de integração e, por fim, testes de interface.
3. **Isolamento de Dependências**: Uso de mocks e stubs para isolar o código sendo testado de suas dependências.
4. **Cobertura de Código**: Busca por alta cobertura de código, especialmente para lógica de negócio crítica.
5. **Testes Automatizados**: Priorização de testes automatizados que podem ser executados frequentemente.
6. **Testes Determinísticos**: Os testes devem produzir resultados consistentes em execuções repetidas.

## Tipos de Testes

### Testes Unitários

Os testes unitários verificam o comportamento de unidades individuais de código (geralmente funções ou métodos) de forma isolada.

#### Escopo

- **Modelos de Domínio**: Testes para validar o comportamento dos modelos de domínio.
- **Lógica de Negócio**: Testes para validar regras de negócio, cálculos e transformações.
- **Utilitários**: Testes para funções utilitárias e helpers.

#### Exemplo

```typescript
// Teste unitário para a função de cálculo de custo médio
describe('calculateAverageCost', () => {
  it('should calculate average cost correctly for a buy transaction', () => {
    const initialPosition = {
      quantity: 10,
      averageCost: 50,
      totalCost: 500
    };
    
    const transaction = {
      operationType: OperationType.BUY,
      quantity: 5,
      price: 60,
      totalValue: 300
    };
    
    const result = calculateAverageCost(initialPosition, transaction);
    
    expect(result.quantity).toBe(15);
    expect(result.averageCost).toBe(53.33); // (500 + 300) / 15
    expect(result.totalCost).toBe(800);
  });
  
  it('should calculate average cost correctly for a sell transaction', () => {
    const initialPosition = {
      quantity: 10,
      averageCost: 50,
      totalCost: 500
    };
    
    const transaction = {
      operationType: OperationType.SELL,
      quantity: 3,
      price: 60,
      totalValue: 180
    };
    
    const result = calculateAverageCost(initialPosition, transaction);
    
    expect(result.quantity).toBe(7);
    expect(result.averageCost).toBe(50); // Unchanged
    expect(result.totalCost).toBe(350);
  });
});
```

### Testes de Integração

Os testes de integração verificam a interação entre diferentes partes do sistema, garantindo que elas funcionem corretamente em conjunto.

#### Escopo

- **Adaptadores**: Testes para validar a integração entre adaptadores e o domínio.
- **Fluxos de Dados**: Testes para validar o fluxo de dados através de múltiplos componentes.
- **Persistência**: Testes para validar a integração com o mecanismo de armazenamento.

#### Exemplo

```typescript
// Teste de integração para o adaptador B3FileParser
describe('B3FileParser Integration', () => {
  it('should parse a negotiation file and return valid transactions', async () => {
    // Arrange
    const parser = new B3FileParser();
    const file = new File([negotiationFileContent], 'negociacao.xlsx', { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    
    // Act
    const transactions = await parser.parseNegotiationFile(file);
    
    // Assert
    expect(transactions).toHaveLength(5);
    expect(transactions[0]).toMatchObject({
      assetCode: 'PETR4',
      operationType: OperationType.BUY,
      quantity: 100,
      price: 28.50
    });
  });
  
  it('should parse a movement file and return valid special events', async () => {
    // Arrange
    const parser = new B3FileParser();
    const file = new File([movementFileContent], 'movimentacao.xlsx', { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    
    // Act
    const specialEvents = await parser.parseMovementFile(file);
    
    // Assert
    expect(specialEvents).toHaveLength(3);
    expect(specialEvents[0]).toMatchObject({
      assetCode: 'BBAS3',
      eventType: EventType.DIVIDEND,
      value: 120.50
    });
  });
});
```

### Testes de Interface

Os testes de interface verificam a interação do usuário com a aplicação, garantindo que a interface funcione conforme esperado.

#### Escopo

- **Renderização de Componentes**: Testes para validar a renderização correta de componentes.
- **Interações do Usuário**: Testes para validar o comportamento em resposta a interações do usuário.
- **Fluxos de Navegação**: Testes para validar fluxos completos de navegação.

#### Exemplo

```typescript
// Teste de interface para o componente UploadPage
describe('UploadPage', () => {
  it('should render upload form correctly', () => {
    // Arrange
    render(<UploadPage />);
    
    // Assert
    expect(screen.getByText('Upload de Arquivos')).toBeInTheDocument();
    expect(screen.getByLabelText('Arquivo de Negociação')).toBeInTheDocument();
    expect(screen.getByLabelText('Arquivo de Movimentação (opcional)')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Processar' })).toBeInTheDocument();
  });
  
  it('should validate required fields', async () => {
    // Arrange
    render(<UploadPage />);
    
    // Act
    fireEvent.click(screen.getByRole('button', { name: 'Processar' }));
    
    // Assert
    expect(await screen.findByText('O arquivo de negociação é obrigatório')).toBeInTheDocument();
  });
  
  it('should navigate to processing page on form submission', async () => {
    // Arrange
    const navigate = jest.fn();
    jest.spyOn(require('react-router-dom'), 'useNavigate').mockReturnValue(navigate);
    
    render(<UploadPage />);
    
    // Act
    const negotiationInput = screen.getByLabelText('Arquivo de Negociação');
    const file = new File(['content'], 'negociacao.xlsx', { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    
    fireEvent.change(negotiationInput, { target: { files: [file] } });
    fireEvent.click(screen.getByRole('button', { name: 'Processar' }));
    
    // Assert
    await waitFor(() => {
      expect(navigate).toHaveBeenCalledWith('/processing');
    });
  });
});
```

### Testes End-to-End

Os testes end-to-end verificam o comportamento da aplicação como um todo, simulando a interação do usuário com a aplicação completa.

#### Escopo

- **Fluxos Completos**: Testes para validar fluxos completos de uso da aplicação.
- **Integração com o Ambiente**: Testes para validar a integração com o ambiente de execução.

#### Exemplo

```typescript
// Teste end-to-end para o fluxo de upload e processamento
describe('Upload and Processing Flow', () => {
  it('should upload files, process them and show results', async () => {
    // Arrange
    cy.visit('/');
    
    // Act - Navigate to upload page
    cy.findByRole('link', { name: 'Começar Agora' }).click();
    
    // Upload negotiation file
    cy.findByLabelText('Arquivo de Negociação').attachFile('negociacao.xlsx');
    
    // Upload movement file
    cy.findByLabelText('Arquivo de Movimentação (opcional)').attachFile('movimentacao.xlsx');
    
    // Submit form
    cy.findByRole('button', { name: 'Processar' }).click();
    
    // Assert - Processing page
    cy.findByText('Processando Arquivos').should('be.visible');
    
    // Wait for processing to complete and navigate to results
    cy.url().should('include', '/results');
    
    // Assert - Results page
    cy.findByText('Resultados do Processamento').should('be.visible');
    cy.findByText('PETR4').should('be.visible');
    cy.findByText('BBAS3').should('be.visible');
  });
});
```

## Ferramentas de Teste

### Jest

Jest é o framework de testes principal, utilizado para testes unitários e de integração.

```javascript
// jest.config.js
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@ui/(.*)$': '<rootDir>/src/ui/$1',
    '^@domain/(.*)$': '<rootDir>/src/domain/$1',
    '^@ports/(.*)$': '<rootDir>/src/ports/$1',
    '^@adapters/(.*)$': '<rootDir>/src/adapters/$1'
  },
  transform: {
    '^.+\\.tsx?$': 'ts-jest'
  },
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/main.tsx',
    '!src/vite-env.d.ts'
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  }
};
```

### Testing Library

Testing Library é utilizada para testes de componentes React, focando em testar o comportamento do ponto de vista do usuário.

```javascript
// jest.setup.js
import '@testing-library/jest-dom';
```

### Mock Service Worker (MSW)

MSW é utilizado para simular requisições de API em testes, permitindo testar o comportamento da aplicação sem depender de serviços externos.

```typescript
// src/mocks/handlers.ts
import { rest } from 'msw';

export const handlers = [
  rest.get('/api/sessions', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json([
        {
          id: '1',
          createdAt: '2023-01-01T00:00:00.000Z',
          lastModified: '2023-01-01T00:00:00.000Z',
          year: 2022,
          description: 'Declaração 2022',
          status: 'PROCESSED'
        }
      ])
    );
  }),
  
  rest.get('/api/sessions/:id', (req, res, ctx) => {
    const { id } = req.params;
    
    return res(
      ctx.status(200),
      ctx.json({
        sessionId: id,
        transactions: [],
        specialEvents: []
      })
    );
  })
];
```

## Organização dos Testes

Os testes são organizados seguindo a estrutura do código-fonte, com arquivos de teste colocados ao lado dos arquivos que eles testam.

```
src/
├── domain/
│   ├── models/
│   │   ├── Transaction.ts
│   │   └── Transaction.test.ts
├── ports/
│   ├── FileParserPort.ts
│   └── FileParserPort.test.ts
├── adapters/
│   ├── B3FileParser.ts
│   └── B3FileParser.test.ts
└── ui/
    ├── pages/
    │   ├── HomePage.tsx
    │   └── HomePage.test.tsx
```

## Convenções de Nomenclatura

- **Arquivos de Teste**: `[nome-do-arquivo].test.ts` ou `[nome-do-arquivo].test.tsx`
- **Suites de Teste**: Descrições claras do que está sendo testado
- **Casos de Teste**: Descrições no formato "should [expected behavior] when [condition]"

```typescript
// Exemplo de convenção de nomenclatura
describe('AssetPosition', () => {
  describe('calculateAverageCost', () => {
    it('should update average cost correctly when adding a buy transaction', () => {
      // ...
    });
    
    it('should not change average cost when adding a sell transaction', () => {
      // ...
    });
  });
});
```

## Mocks e Stubs

Mocks e stubs são utilizados para isolar o código sendo testado de suas dependências.

### Exemplo de Mock

```typescript
// Mock de uma porta
const mockFileParser: FileParserPort = {
  parseNegotiationFile: jest.fn().mockResolvedValue([
    {
      id: '1',
      date: new Date('2022-01-01'),
      assetCode: 'PETR4',
      assetCategory: AssetCategory.STOCK,
      operationType: OperationType.BUY,
      quantity: 100,
      price: 28.50,
      totalValue: 2850,
      year: 2022,
      source: 'B3_NEGOTIATION'
    }
  ]),
  parseMovementFile: jest.fn().mockResolvedValue([])
};
```

### Exemplo de Stub

```typescript
// Stub de dados
const stubTransactions: Transaction[] = [
  {
    id: '1',
    date: new Date('2022-01-01'),
    assetCode: 'PETR4',
    assetCategory: AssetCategory.STOCK,
    operationType: OperationType.BUY,
    quantity: 100,
    price: 28.50,
    totalValue: 2850,
    year: 2022,
    source: 'B3_NEGOTIATION'
  },
  {
    id: '2',
    date: new Date('2022-02-01'),
    assetCode: 'PETR4',
    assetCategory: AssetCategory.STOCK,
    operationType: OperationType.SELL,
    quantity: 50,
    price: 30.00,
    totalValue: 1500,
    year: 2022,
    source: 'B3_NEGOTIATION'
  }
];
```

## Cobertura de Testes

A cobertura de testes é medida usando o Jest, com relatórios gerados para linhas, funções, branches e statements.

```bash
npm run test:coverage
```

### Metas de Cobertura

- **Domínio**: 90% de cobertura
- **Portas e Adaptadores**: 80% de cobertura
- **Interface de Usuário**: 70% de cobertura

## Testes de Regressão

Os testes de regressão são executados automaticamente antes de cada commit, garantindo que mudanças não quebrem funcionalidades existentes.

```json
// package.json
{
  "husky": {
    "hooks": {
      "pre-commit": "lint-staged"
    }
  },
  "lint-staged": {
    "*.{ts,tsx}": [
      "eslint --fix",
      "jest --findRelatedTests"
    ]
  }
}
```

## Testes de Performance

Os testes de performance são executados para garantir que a aplicação mantenha um bom desempenho, especialmente para operações críticas.

### Exemplo

```typescript
// Teste de performance para processamento de transações
describe('AssetProcessor Performance', () => {
  it('should process 1000 transactions in less than 500ms', () => {
    // Arrange
    const processor = new DefaultAssetProcessor();
    const transactions = generateManyTransactions(1000);
    
    // Act
    const startTime = performance.now();
    const result = processor.processAssets(transactions, []);
    const endTime = performance.now();
    
    // Assert
    expect(endTime - startTime).toBeLessThan(500);
    expect(result).toHaveLength(expect.any(Number));
  });
});
```

## Testes de Acessibilidade

Os testes de acessibilidade são executados para garantir que a aplicação seja acessível para todos os usuários.

### Exemplo

```typescript
// Teste de acessibilidade para o componente HomePage
describe('HomePage Accessibility', () => {
  it('should not have accessibility violations', async () => {
    // Arrange
    const { container } = render(<HomePage />);
    
    // Assert
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
```

## Integração Contínua

Os testes são executados automaticamente em um ambiente de integração contínua (CI) a cada push para o repositório.

### GitHub Actions

```yaml
# .github/workflows/test.yml
name: Test

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
    - uses: actions/checkout@v2
    - name: Use Node.js
      uses: actions/setup-node@v2
      with:
        node-version: '16.x'
    - name: Install dependencies
      run: npm ci
    - name: Run tests
      run: npm test
    - name: Run coverage
      run: npm run test:coverage
    - name: Upload coverage
      uses: codecov/codecov-action@v2
```

## Conclusão

A estratégia de testes adotada para o Gerador de Arquivo IRPF para Investimentos B3 visa garantir a qualidade, confiabilidade e manutenibilidade da aplicação. Através de uma combinação de testes unitários, de integração, de interface e end-to-end, cobrimos diferentes aspectos da aplicação, garantindo que ela funcione conforme esperado.

A arquitetura hexagonal facilita os testes, permitindo que o domínio seja testado de forma isolada, sem depender de detalhes de implementação. Os adaptadores podem ser testados com mocks das portas, garantindo que a integração com o domínio funcione corretamente.

Com essa abordagem, podemos ter confiança de que a aplicação funciona corretamente e que mudanças futuras não quebrarão funcionalidades existentes.
