# Interface de Usuário

## Introdução

A interface de usuário da aplicação é construída com React e Tailwind CSS, seguindo uma abordagem de componentes reutilizáveis e responsivos. A UI funciona como um adaptador primário na arquitetura hexagonal, iniciando a interação com o domínio da aplicação através das portas definidas.

## Estrutura de Componentes

A interface de usuário é organizada em uma estrutura hierárquica de componentes:

```
src/ui/
├── layout/           # Componentes de layout
│   ├── Layout.tsx    # Layout principal
│   ├── Header.tsx    # Cabeçalho
│   └── Footer.tsx    # Rodapé
└── pages/            # Páginas da aplicação
    ├── HomePage.tsx          # Página inicial
    ├── UploadPage.tsx        # Upload de arquivos
    ├── ProcessingPage.tsx    # Processamento
    ├── ResultsPage.tsx       # Resultados
    ├── GeneratePage.tsx      # Geração de arquivo
    └── NotFoundPage.tsx      # Página 404
```

## Roteamento

O roteamento é implementado usando React Router, permitindo a navegação entre as diferentes páginas da aplicação.

```typescript
function App() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-screen">Carregando...</div>}>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="upload" element={<UploadPage />} />
          <Route path="processing" element={<ProcessingPage />} />
          <Route path="results" element={<ResultsPage />} />
          <Route path="generate" element={<GeneratePage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </Suspense>
  )
}
```

## Lazy Loading

Os componentes de página são carregados de forma lazy para melhorar o desempenho inicial da aplicação:

```typescript
// Lazy load pages
const HomePage = lazy(() => import('@ui/pages/HomePage'))
const UploadPage = lazy(() => import('@ui/pages/UploadPage'))
const ProcessingPage = lazy(() => import('@ui/pages/ProcessingPage'))
const ResultsPage = lazy(() => import('@ui/pages/ResultsPage'))
const GeneratePage = lazy(() => import('@ui/pages/GeneratePage'))
const NotFoundPage = lazy(() => import('@ui/pages/NotFoundPage'))
```

## Componentes de Layout

### Layout

O componente Layout define a estrutura básica da aplicação, incluindo cabeçalho, conteúdo principal e rodapé.

```typescript
const Layout = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
```

### Header

O cabeçalho contém o logotipo da aplicação e a navegação principal.

```typescript
const Header = () => {
  const location = useLocation()
  
  return (
    <header className="bg-primary text-primary-foreground shadow-md">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <Link to="/" className="text-xl font-bold">Gerador IRPF B3</Link>
          
          <nav className="hidden md:flex space-x-4">
            <NavLink to="/" current={location.pathname === "/"}>Início</NavLink>
            <NavLink to="/upload" current={location.pathname === "/upload"}>Upload</NavLink>
            <NavLink to="/results" current={location.pathname === "/results"}>Resultados</NavLink>
          </nav>
        </div>
      </div>
    </header>
  )
}
```

### Footer

O rodapé contém informações de copyright e disclaimers.

```typescript
const Footer = () => {
  const currentYear = new Date().getFullYear()
  
  return (
    <footer className="bg-secondary py-6">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <p className="text-sm text-secondary-foreground">
              © {currentYear} Gerador IRPF B3. Todos os direitos reservados.
            </p>
          </div>
          <div>
            <p className="text-xs text-secondary-foreground/70">
              Esta aplicação não é afiliada à Receita Federal ou B3.
              <br />
              Verifique sempre os dados gerados antes de importar.
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
```

## Páginas

### HomePage

A página inicial apresenta uma visão geral da aplicação, seus recursos e como utilizá-la.

```typescript
const HomePage = () => {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">
          Gerador de Arquivo IRPF para Investimentos B3
        </h1>
        <p className="text-xl text-muted-foreground">
          Gere facilmente o arquivo de importação para sua declaração de imposto de renda
          com dados de ações e fundos imobiliários.
        </p>
      </div>

      {/* Como Funciona e Recursos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        {/* ... */}
      </div>

      {/* Call to Action */}
      <div className="text-center">
        <Link 
          to="/upload" 
          className="bg-primary text-primary-foreground px-6 py-3 rounded-md font-medium text-lg hover:bg-primary/90 transition-colors"
        >
          Começar Agora
        </Link>
      </div>
    </div>
  )
}
```

### UploadPage

A página de upload permite ao usuário fazer upload dos arquivos de extrato da B3.

```typescript
const UploadPage = () => {
  const navigate = useNavigate()
  const [negotiationFile, setNegotiationFile] = useState<File | null>(null)
  const [movementFile, setMovementFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Refs e handlers para upload de arquivos
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validação e processamento dos arquivos
    
    // Navegação para a página de processamento
    navigate('/processing')
  }
  
  return (
    <div className="max-w-3xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Upload de Arquivos</h1>
        <p className="text-muted-foreground">
          Faça upload dos extratos da B3 para começar a gerar seu arquivo de importação.
        </p>
      </div>
      
      <div className="bg-card p-6 rounded-lg shadow-md">
        <form onSubmit={handleSubmit}>
          {/* Campos de upload */}
        </form>
      </div>
    </div>
  )
}
```

### ProcessingPage

A página de processamento exibe um indicador de progresso enquanto os arquivos são processados.

```typescript
const ProcessingPage = () => {
  const navigate = useNavigate()
  const [progress, setProgress] = useState(0)
  const [currentStep, setCurrentStep] = useState('Iniciando processamento...')
  
  useEffect(() => {
    // Simulação de etapas de processamento
    
    // Navegação para a página de resultados após o processamento
    setTimeout(() => {
      navigate('/results')
    }, 500)
  }, [navigate])
  
  return (
    <div className="max-w-2xl mx-auto text-center">
      <h1 className="text-3xl font-bold mb-8">Processando Arquivos</h1>
      
      {/* Barra de progresso */}
      
      <div className="bg-card p-6 rounded-lg shadow-md">
        <p className="text-xl font-medium mb-4">{currentStep}</p>
        <p className="text-muted-foreground">
          Por favor, aguarde enquanto processamos seus arquivos.
        </p>
      </div>
    </div>
  )
}
```

### ResultsPage

A página de resultados exibe os dados processados, incluindo posições de ativos, resultados de operações e inconsistências.

```typescript
const ResultsPage = () => {
  const navigate = useNavigate()
  const [selectedAsset, setSelectedAsset] = useState<string | null>(null)
  const [showInconsistencies, setShowInconsistencies] = useState(true)
  
  const handleGenerateFile = () => {
    navigate('/generate')
  }
  
  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Resultados do Processamento</h1>
        <button
          onClick={handleGenerateFile}
          className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90"
        >
          Gerar Arquivo IRPF
        </button>
      </div>
      
      {/* Resumo, inconsistências, lista de ativos, detalhes */}
    </div>
  )
}
```

### GeneratePage

A página de geração permite ao usuário informar seus dados pessoais e gerar o arquivo IRPF. Também oferece a opção de importar dados do contribuinte a partir de um arquivo .DBK.

```typescript
const GeneratePage = () => {
  const navigate = useNavigate()
  const { actions, state } = useAppContext()
  const { importDBKFile, generateDeclaration } = actions
  const { isImporting, importError } = state
  
  const [formData, setFormData] = useState({
    name: '',
    cpf: '',
    year: new Date().getFullYear() - 1,
    includeInitialPosition: true
  })
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Ref para o input de arquivo
  const dbkFileInputRef = useRef<HTMLInputElement>(null)
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    // Atualização do estado do formulário
  }
  
  const handleDBKFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      try {
        // Importar dados do contribuinte do arquivo DBK
        const taxPayerInfo = await importDBKFile(file)
        
        // Atualizar o formulário com os dados importados
        setFormData({
          ...formData,
          name: taxPayerInfo.name,
          cpf: taxPayerInfo.cpf,
        })
      } catch (error) {
        console.error('Erro ao importar arquivo DBK:', error)
      }
    }
  }
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validação e geração do arquivo
    
    // Navegação de volta para a página inicial
    navigate('/')
  }
  
  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Gerar Arquivo IRPF</h1>
        <p className="text-muted-foreground">
          Informe seus dados pessoais para gerar o arquivo de importação.
        </p>
      </div>
      
      <div className="bg-card p-6 rounded-lg shadow-md">
        {/* Botão para importar arquivo DBK */}
        <div className="mb-6">
          <input
            type="file"
            accept=".dbk"
            hidden
            ref={dbkFileInputRef}
            onChange={handleDBKFileChange}
          />
          <Button
            variant="outlined"
            startIcon={<CloudUploadIcon />}
            onClick={() => dbkFileInputRef.current?.click()}
            disabled={isGenerating || isImporting}
          >
            Importar Declaração Pré-Preenchida (arquivo .DBK)
          </Button>
          
          {isImporting && (
            <div className="flex items-center mt-2">
              <CircularProgress size={20} className="mr-2" />
              <span>Importando...</span>
            </div>
          )}
          
          {importError && (
            <Alert severity="error" className="mt-2">
              {importError}
            </Alert>
          )}
        </div>
        
        <form onSubmit={handleSubmit}>
          {/* Campos do formulário */}
        </form>
      </div>
    </div>
  )
}
```

### NotFoundPage

A página 404 é exibida quando o usuário tenta acessar uma rota inexistente.

```typescript
const NotFoundPage = () => {
  return (
    <div className="max-w-md mx-auto text-center py-12">
      <h1 className="text-4xl font-bold mb-4">404</h1>
      <h2 className="text-2xl font-semibold mb-6">Página não encontrada</h2>
      <p className="text-muted-foreground mb-8">
        A página que você está procurando não existe ou foi movida.
      </p>
      <Link
        to="/"
        className="bg-primary text-primary-foreground px-6 py-3 rounded-md font-medium hover:bg-primary/90 inline-block"
      >
        Voltar para a página inicial
      </Link>
    </div>
  )
}
```

## Estilização com Tailwind CSS

A aplicação utiliza Tailwind CSS para estilização, com um conjunto de classes utilitárias que permitem construir interfaces responsivas e consistentes.

### Temas e Cores

O tema da aplicação é definido no arquivo `tailwind.config.js`:

```javascript
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#0f766e',
          foreground: '#ffffff',
        },
        secondary: {
          DEFAULT: '#1e293b',
          foreground: '#f8fafc',
        },
        card: {
          DEFAULT: '#ffffff',
          foreground: '#0f172a',
        },
        muted: {
          DEFAULT: '#f1f5f9',
          foreground: '#64748b',
        },
        destructive: {
          DEFAULT: '#ef4444',
          foreground: '#ffffff',
        },
      },
    },
  },
  plugins: [],
}
```

### Responsividade

A interface é projetada para ser responsiva, adaptando-se a diferentes tamanhos de tela:

- **Mobile First**: Design inicialmente para dispositivos móveis
- **Breakpoints**: Utilização de breakpoints para adaptar o layout em telas maiores
- **Flexbox e Grid**: Utilização de flexbox e grid para layouts responsivos

## Interação com o Domínio

A interface de usuário interage com o domínio da aplicação através das portas definidas:

1. **Upload de Arquivos**: Utiliza `FileParserPort` para analisar os arquivos da B3
2. **Processamento**: Utiliza `AssetProcessorPort` para processar os dados
3. **Geração de Arquivo**: Utiliza `IRPFGeneratorPort` para gerar o arquivo IRPF
4. **Persistência**: Utiliza `StoragePort` para salvar e recuperar dados

## Gerenciamento de Estado

O estado da aplicação é gerenciado usando hooks do React:

- **useState**: Para estado local de componentes
- **useEffect**: Para efeitos colaterais, como carregamento de dados
- **useRef**: Para referências a elementos DOM
- **useNavigate**: Para navegação programática
- **useLocation**: Para acesso à localização atual

## Fluxo de Navegação

O fluxo de navegação da aplicação segue uma sequência lógica:

1. **Página Inicial**: Apresentação da aplicação
2. **Upload**: Upload dos arquivos da B3
3. **Processamento**: Processamento dos arquivos
4. **Resultados**: Visualização dos resultados
5. **Geração**: Geração do arquivo IRPF

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  HomePage   │ ──> │  UploadPage │ ──> │ProcessingPage│
└─────────────┘     └─────────────┘     └─────────────┘
                                               │
                                               ▼
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│    Home     │ <── │GeneratePage │ <── │ ResultsPage │
└─────────────┘     └─────────────┘     └─────────────┘
```

## Acessibilidade

A interface de usuário é projetada com considerações de acessibilidade:

- **Semântica HTML**: Utilização de elementos semânticos
- **Contraste de Cores**: Garantia de contraste adequado
- **Navegação por Teclado**: Suporte à navegação por teclado
- **Textos Alternativos**: Descrições para elementos visuais

## Considerações de UX

A experiência do usuário é aprimorada através de:

- **Feedback Visual**: Indicadores de progresso, mensagens de erro, etc.
- **Validação de Formulários**: Validação em tempo real e mensagens de erro claras
- **Prevenção de Erros**: Desativação de botões durante operações, confirmações para ações destrutivas
- **Consistência**: Padrões consistentes de design e interação

## Testes de UI

A interface de usuário é testada usando:

- **Jest**: Framework de testes
- **Testing Library**: Biblioteca para testes de componentes React
- **Mock Service Worker**: Para simular requisições de API

## Conclusão

A interface de usuário da aplicação é projetada para ser intuitiva, responsiva e acessível, seguindo boas práticas de design e desenvolvimento. Como adaptador primário na arquitetura hexagonal, ela inicia a interação com o domínio da aplicação através das portas definidas, mantendo uma separação clara de responsabilidades.
