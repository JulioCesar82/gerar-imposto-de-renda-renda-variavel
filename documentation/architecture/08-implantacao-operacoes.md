# Implantação e Operações

## Introdução

Este documento descreve as estratégias de implantação, distribuição e operações para o Gerador de Arquivo IRPF para Investimentos B3. Ele aborda os processos de build, empacotamento, distribuição, monitoramento e manutenção da aplicação, garantindo que ela seja entregue aos usuários de forma eficiente e confiável.

## Estratégia de Implantação

### Visão Geral

A aplicação é uma Single Page Application (SPA) desenvolvida com React e TypeScript, que pode ser implantada como um site estático. Isso simplifica significativamente o processo de implantação, pois não há necessidade de servidores de aplicação ou bancos de dados.

### Ambientes

A aplicação utiliza os seguintes ambientes:

1. **Desenvolvimento**: Ambiente local para desenvolvimento e testes iniciais.
2. **Homologação**: Ambiente para testes mais abrangentes e validação por stakeholders.
3. **Produção**: Ambiente público para uso pelos usuários finais.

### Processo de Build

O processo de build é realizado usando Vite, que compila o código TypeScript, otimiza os assets e gera os arquivos estáticos para implantação.

```bash
# Processo de build
npm run build
```

Este comando executa as seguintes etapas:

1. Compilação do TypeScript para JavaScript
2. Bundling dos módulos JavaScript
3. Minificação de JavaScript e CSS
4. Otimização de imagens e outros assets
5. Geração de arquivos estáticos na pasta `dist`

### Configuração por Ambiente

A configuração específica para cada ambiente é gerenciada através de variáveis de ambiente e arquivos de configuração.

```typescript
// src/config.ts
export const config = {
  appName: 'Gerador IRPF B3',
  version: import.meta.env.VITE_APP_VERSION || '0.1.0',
  environment: import.meta.env.MODE,
  isProduction: import.meta.env.PROD,
  isDevelopment: import.meta.env.DEV,
  features: {
    enableLogging: import.meta.env.VITE_ENABLE_LOGGING === 'true',
    enableAnalytics: import.meta.env.VITE_ENABLE_ANALYTICS === 'true'
  }
};
```

## Estratégia de Distribuição

### Hospedagem Web

A aplicação pode ser hospedada em qualquer provedor de hospedagem estática, como:

- **GitHub Pages**: Solução gratuita para projetos de código aberto
- **Netlify**: Oferece CI/CD integrado e recursos avançados
- **Vercel**: Otimizado para aplicações React
- **AWS S3 + CloudFront**: Solução escalável com CDN integrado
- **Firebase Hosting**: Solução do Google com CDN global

### Configuração de Hospedagem

#### GitHub Pages

```yaml
# .github/workflows/deploy.yml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v2

      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '16'

      - name: Install dependencies
        run: npm ci

      - name: Build
        run: npm run build
        env:
          VITE_APP_VERSION: ${{ github.sha }}

      - name: Deploy
        uses: JamesIves/github-pages-deploy-action@4.1.4
        with:
          branch: gh-pages
          folder: dist
```

#### Netlify

```toml
# netlify.toml
[build]
  command = "npm run build"
  publish = "dist"

[context.production.environment]
  VITE_APP_VERSION = "1.0.0"
  VITE_ENABLE_ANALYTICS = "true"

[context.deploy-preview.environment]
  VITE_APP_VERSION = "preview"
  VITE_ENABLE_ANALYTICS = "false"
```

### Distribuição como Aplicação Desktop

A aplicação também pode ser distribuída como uma aplicação desktop usando Electron, permitindo que os usuários a executem localmente sem necessidade de um navegador.

#### Configuração do Electron

```javascript
// electron/main.js
const { app, BrowserWindow } = require('electron');
const path = require('path');
const url = require('url');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  const startUrl = process.env.ELECTRON_START_URL || url.format({
    pathname: path.join(__dirname, '../dist/index.html'),
    protocol: 'file:',
    slashes: true
  });

  mainWindow.loadURL(startUrl);

  mainWindow.on('closed', function () {
    mainWindow = null;
  });
}

app.on('ready', createWindow);

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', function () {
  if (mainWindow === null) {
    createWindow();
  }
});
```

#### Empacotamento com Electron Builder

```json
// package.json (seção electron-builder)
{
  "build": {
    "appId": "com.example.irpfgenerator",
    "productName": "Gerador IRPF B3",
    "files": [
      "dist/**/*",
      "electron/**/*"
    ],
    "directories": {
      "buildResources": "assets",
      "output": "release"
    },
    "win": {
      "target": [
        "nsis",
        "portable"
      ],
      "icon": "assets/icon.ico"
    },
    "mac": {
      "target": [
        "dmg",
        "zip"
      ],
      "icon": "assets/icon.icns"
    },
    "linux": {
      "target": [
        "AppImage",
        "deb"
      ],
      "icon": "assets/icon.png"
    }
  }
}
```

### Distribuição como PWA

A aplicação pode ser configurada como Progressive Web App (PWA), permitindo que os usuários a instalem em seus dispositivos e a utilizem offline.

#### Configuração do Service Worker

```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'robots.txt', 'apple-touch-icon.png'],
      manifest: {
        name: 'Gerador IRPF B3',
        short_name: 'IRPF B3',
        description: 'Gerador de Arquivo IRPF para Investimentos B3',
        theme_color: '#0f766e',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ]
});
```

## Estratégia de Versionamento

### Versionamento Semântico

A aplicação segue o versionamento semântico (SemVer), com o formato MAJOR.MINOR.PATCH:

- **MAJOR**: Mudanças incompatíveis com versões anteriores
- **MINOR**: Adições de funcionalidades compatíveis com versões anteriores
- **PATCH**: Correções de bugs compatíveis com versões anteriores

### Controle de Versão

O controle de versão é realizado usando Git, com o seguinte fluxo de trabalho:

1. **main**: Branch principal, contendo código estável e pronto para produção
2. **develop**: Branch de desenvolvimento, contendo código para a próxima versão
3. **feature/\***: Branches para desenvolvimento de novas funcionalidades
4. **bugfix/\***: Branches para correção de bugs
5. **release/\***: Branches para preparação de releases

### Changelog

Um changelog é mantido para documentar as mudanças em cada versão:

```markdown
# Changelog

## [1.0.0] - 2025-04-01

### Adicionado
- Suporte para importação de arquivos da B3
- Cálculo de custo médio de ativos
- Geração de arquivo IRPF

### Corrigido
- Problema na importação de arquivos com caracteres especiais

## [0.9.0] - 2025-03-15

### Adicionado
- Interface de usuário inicial
- Estrutura básica da aplicação
```

## Estratégia de CI/CD

### Integração Contínua

A integração contínua é realizada usando GitHub Actions, que executa os seguintes passos a cada push:

1. Instalação de dependências
2. Linting do código
3. Execução de testes unitários
4. Execução de testes de integração
5. Build da aplicação

```yaml
# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main, develop ]

jobs:
  build:
    runs-on: ubuntu-latest

    steps:
    - uses: actions/checkout@v2
    
    - name: Setup Node.js
      uses: actions/setup-node@v2
      with:
        node-version: '16'
        
    - name: Install dependencies
      run: npm ci
      
    - name: Lint
      run: npm run lint
      
    - name: Test
      run: npm test
      
    - name: Build
      run: npm run build
```

### Entrega Contínua

A entrega contínua é realizada automaticamente para o ambiente de homologação a cada push na branch develop, e para o ambiente de produção a cada push na branch main.

```yaml
# .github/workflows/cd.yml
name: CD

on:
  push:
    branches: [ main, develop ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v2
    
    - name: Setup Node.js
      uses: actions/setup-node@v2
      with:
        node-version: '16'
        
    - name: Install dependencies
      run: npm ci
      
    - name: Build
      run: npm run build
      env:
        VITE_APP_VERSION: ${{ github.sha }}
        VITE_ENABLE_ANALYTICS: ${{ github.ref == 'refs/heads/main' }}
        
    - name: Deploy to Homologation
      if: github.ref == 'refs/heads/develop'
      uses: netlify/actions/cli@master
      with:
        args: deploy --dir=dist --site=${{ secrets.NETLIFY_SITE_ID_HOMOLOG }}
      env:
        NETLIFY_AUTH_TOKEN: ${{ secrets.NETLIFY_AUTH_TOKEN }}
        
    - name: Deploy to Production
      if: github.ref == 'refs/heads/main'
      uses: netlify/actions/cli@master
      with:
        args: deploy --dir=dist --prod --site=${{ secrets.NETLIFY_SITE_ID_PROD }}
      env:
        NETLIFY_AUTH_TOKEN: ${{ secrets.NETLIFY_AUTH_TOKEN }}
```

## Monitoramento e Observabilidade

### Logs

A aplicação implementa logging para facilitar o diagnóstico de problemas:

```typescript
// src/utils/logger.ts
export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error'
}

export class Logger {
  private static instance: Logger;
  private enabled: boolean;
  
  private constructor() {
    this.enabled = config.features.enableLogging;
  }
  
  public static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }
  
  public debug(message: string, ...args: any[]): void {
    if (this.enabled) {
      console.debug(`[DEBUG] ${message}`, ...args);
    }
  }
  
  public info(message: string, ...args: any[]): void {
    if (this.enabled) {
      console.info(`[INFO] ${message}`, ...args);
    }
  }
  
  public warn(message: string, ...args: any[]): void {
    if (this.enabled) {
      console.warn(`[WARN] ${message}`, ...args);
    }
  }
  
  public error(message: string, ...args: any[]): void {
    if (this.enabled) {
      console.error(`[ERROR] ${message}`, ...args);
    }
  }
}

export const logger = Logger.getInstance();
```

### Análise de Erros

A aplicação implementa captura e análise de erros para identificar problemas:

```typescript
// src/utils/errorHandler.ts
export class ErrorHandler {
  private static instance: ErrorHandler;
  
  private constructor() {
    window.addEventListener('error', this.handleError.bind(this));
    window.addEventListener('unhandledrejection', this.handleRejection.bind(this));
  }
  
  public static getInstance(): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler();
    }
    return ErrorHandler.instance;
  }
  
  private handleError(event: ErrorEvent): void {
    logger.error('Uncaught error:', event.error);
    // Aqui poderíamos enviar o erro para um serviço de monitoramento
  }
  
  private handleRejection(event: PromiseRejectionEvent): void {
    logger.error('Unhandled rejection:', event.reason);
    // Aqui poderíamos enviar o erro para um serviço de monitoramento
  }
}

export const errorHandler = ErrorHandler.getInstance();
```

### Métricas de Uso

A aplicação pode implementar métricas de uso para entender como os usuários estão utilizando a aplicação:

```typescript
// src/utils/analytics.ts
export class Analytics {
  private static instance: Analytics;
  private enabled: boolean;
  
  private constructor() {
    this.enabled = config.features.enableAnalytics;
  }
  
  public static getInstance(): Analytics {
    if (!Analytics.instance) {
      Analytics.instance = new Analytics();
    }
    return Analytics.instance;
  }
  
  public trackEvent(category: string, action: string, label?: string, value?: number): void {
    if (this.enabled) {
      // Aqui poderíamos enviar o evento para um serviço de analytics
      logger.debug('Analytics event:', { category, action, label, value });
    }
  }
  
  public trackPageView(path: string): void {
    if (this.enabled) {
      // Aqui poderíamos enviar a visualização de página para um serviço de analytics
      logger.debug('Analytics page view:', path);
    }
  }
}

export const analytics = Analytics.getInstance();
```

## Manutenção e Suporte

### Atualizações

As atualizações da aplicação são realizadas através do processo de CI/CD, com as seguintes considerações:

1. **Atualizações de Segurança**: Priorizadas e lançadas o mais rápido possível
2. **Correções de Bugs**: Lançadas em versões patch
3. **Novas Funcionalidades**: Lançadas em versões minor
4. **Mudanças Significativas**: Lançadas em versões major, com comunicação prévia aos usuários

### Suporte ao Usuário

O suporte ao usuário é fornecido através dos seguintes canais:

1. **Documentação**: Guias de uso, FAQs e tutoriais
2. **GitHub Issues**: Para reportar bugs e solicitar funcionalidades
3. **Email**: Para suporte direto aos usuários

### Backup e Recuperação

Como a aplicação processa dados localmente, é importante orientar os usuários sobre backup e recuperação:

1. **Backup de Dados**: Os usuários devem ser orientados a fazer backup dos arquivos gerados
2. **Exportação de Dados**: A aplicação pode oferecer funcionalidades para exportar dados processados
3. **Recuperação**: A aplicação pode oferecer funcionalidades para importar dados previamente exportados

## Considerações de Escalabilidade

Embora a aplicação seja executada localmente no navegador do usuário, algumas considerações de escalabilidade são importantes:

1. **Performance**: Otimização para lidar com grandes volumes de dados
2. **Armazenamento**: Uso eficiente do armazenamento local (IndexedDB)
3. **Processamento**: Uso de Web Workers para operações intensivas

```typescript
// Exemplo de uso de Web Worker para processamento intensivo
// src/workers/processingWorker.ts
self.onmessage = (event) => {
  const { transactions, specialEvents } = event.data;
  
  // Processamento intensivo
  const result = processData(transactions, specialEvents);
  
  self.postMessage(result);
};

function processData(transactions, specialEvents) {
  // Lógica de processamento
  return { /* resultado */ };
}
```

```typescript
// Uso do Web Worker
// src/services/processingService.ts
export class ProcessingService {
  private worker: Worker;
  
  constructor() {
    this.worker = new Worker(new URL('../workers/processingWorker.ts', import.meta.url), { type: 'module' });
  }
  
  public async processData(transactions: Transaction[], specialEvents: SpecialEvent[]): Promise<ProcessingResult> {
    return new Promise((resolve, reject) => {
      this.worker.onmessage = (event) => {
        resolve(event.data);
      };
      
      this.worker.onerror = (error) => {
        reject(error);
      };
      
      this.worker.postMessage({ transactions, specialEvents });
    });
  }
}
```

## Conclusão

A estratégia de implantação e operações para o Gerador de Arquivo IRPF para Investimentos B3 é projetada para garantir que a aplicação seja entregue aos usuários de forma eficiente, confiável e segura. Através de processos automatizados de build, testes e implantação, a aplicação pode ser mantida e atualizada com facilidade, garantindo que os usuários sempre tenham acesso à versão mais recente e estável.

A natureza da aplicação como uma SPA que processa dados localmente simplifica significativamente a infraestrutura necessária, permitindo que ela seja hospedada em uma variedade de plataformas a um custo mínimo. Ao mesmo tempo, a implementação de práticas de monitoramento e observabilidade permite identificar e resolver problemas rapidamente, garantindo uma experiência de usuário consistente e de alta qualidade.
