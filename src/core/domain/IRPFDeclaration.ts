import { AssetPosition, MonthlyResult, IncomeRecord } from './AssetPosition';

/**
 * Represents an IRPF declaration
 */
export interface IRPFDeclaration {
  /**
   * The taxPayer information
   */
  taxPayerInfo: TaxPayerInfo;

  /**
   * The year of the declaration
   */
  year: number;

  /**
   * The asset positions (can be filtered or complete list)
   */
  assetPositions: AssetPosition[];

  /**
   * The monthly results (can be filtered or complete list)
   */
  monthlyResults: MonthlyResult[];

  /**
   * The income records (can be filtered or complete list)
   */
  incomeRecords: IncomeRecord[];

  /**
   * The total tax due calculated for the year
   */
  totalTaxDue: number;

  /**
   * The total tax withheld (from trades and income)
   */
  totalTaxWithheld: number;

  /**
   * The total tax to pay or restitue (positive to pay, negative to restitute)
   */
  totalTaxToPay: number;

  /**
   * The remaining loss to compensate in the next year
   */
  remainingLoss: number;

  /**
   * The total assets value at the end of the year
   */
  totalAssetsValue: number;

  /**
   * The total income received in the year
   */
  totalIncome: number;

  /**
   * The generation date of this declaration structure
   */
  generationDate: Date;

  /**
   * The structured declaration sections ready for file generation
   */
  sections: DeclarationSection[];
}

/**
 * Represents a taxPayer information
 */
export interface TaxPayerInfo {
  /**
   * The taxPayer name
   */
  name: string;

  /**
   * The taxPayer CPF
   */
  cpf: string;

  /**
   * The taxPayer date of birth
   */
  dateOfBirth: Date;

  /**
   * The taxPayer address
   */
  address: Address;

  /**
   * The taxPayer phone
   */
  phone: string;

  /**
   * The taxPayer email
   */
  email: string;

  /**
   * The taxPayer occupation code (from IRPF table)
   */
  occupation: string; // Pode ser código ou descrição
}

/**
 * Represents an address
 */
export interface Address {
  /**
   * The street
   */
  street: string;

  /**
   * The number
   */
  number: string;

  /**
   * The complement
   */
  complement?: string;

  /**
   * The neighborhood
   */
  neighborhood: string;

  /**
   * The city
   */
  city: string;

  /**
   * The state abbreviation (e.g., 'SP')
   */
  state: string;

  /**
   * The zip code (CEP)
   */
  zipCode: string;

  /**
   * The country (Default 'Brasil')
   */
  country: string;
}

/**
 * Represents a declaration section (e.g., Bens e Direitos, Rendimentos Isentos)
 */
export interface DeclarationSection {
  /**
   * Internal code for the section (e.g., 'BENS', 'REND_ISENTOS')
   */
  code: string;

  /**
   * User-friendly name for the section
   */
  name: string;

  /**
   * Optional description for the section
   */
  description: string;

  /**
   * The items belonging to this section
   */
  items: DeclarationItem[];
}

/**
 * Represents a single item within a declaration section
 */
export interface DeclarationItem {
  /**
   * Código do item na declaração IRPF (e.g., '31', '73', '09', '10', '26', '99').
   * Ou um código interno descritivo para Renda Variável (e.g., 'RV_DT_ACOES.1').
   */
  code: string;

  /**
   * Descrição do item (pode ser o nome do ativo, tipo de rendimento, etc.).
   */
  description: string;

  /**
   * Valor principal do item (Valor atual do bem, valor do rendimento, resultado líquido do mês).
   */
  value: number;

  /**
   * Detalhes adicionais, como a discriminação completa do bem (agora é string).
   */
  details?: string;

  // --- Campos Adicionais para Suportar os Requisitos ---
  /**
   * CNPJ da empresa, FII ou Fonte Pagadora.
   */
  cnpj?: string;
  /**
   * Nome da Fonte Pagadora (para rendimentos).
   */
  sourceName?: string;
  /**
   * Ticker do ativo (para Bens e Direitos).
   */
  ticker?: string;
  /**
   * Valor em 31/12 do ano anterior (para Bens e Direitos).
   */
  previousYearValue?: number;
  /**
   * Mês (para resultados mensais de Renda Variável).
   */
  month?: number;
  /**
   * Valor negociado no mês (para Renda Variável).
   */
  tradedValue?: number;
  /**
   * Tipo adicional para diferenciar itens com mesmo código (e.g., JSCP vs Crédito FII em Bens cód 99).
   */
  additionalType?: 'JUROS_CAPITAL_NAO_PAGOS' | 'CREDITO_TRANSITO_NAO_PAGOS' | string;
  /**
   * Tipo interno para agrupar ou diferenciar itens (e.g., Renda Variável).
   */
  type?: 'DAY_TRADE_ACOES' | 'FII' | 'COMMON_ACOES' | string;
  // --- Fim dos Campos Adicionais ---
}
