/**
 * Represents a transaction from B3
 */
export interface Transaction {
  /**
   * The date of the transaction
   */
  date: Date;
  
  /**
   * The year of the transaction
   */
  year: number;
  
  /**
   * The month of the transaction
   */
  month: number;
  
  /**
   * The type of transaction (buy or sell)
   */
  type: 'buy' | 'sell';
  
  /**
   * The market type (spot, options, etc.)
   */
  marketType: MarketType;
  
  /**
   * The asset code (ticker)
   */
  assetCode: string;
  
  /**
   * The asset name
   */
  assetName: string;
  
  /**
   * The quantity of assets
   */
  quantity: number;
  
  /**
   * The unit price
   */
  unitPrice: number;
  
  /**
   * The total value
   */
  totalValue: number;
  
  /**
   * The fees
   */
  fees: number;
  
  /**
   * The taxes
   */
  taxes: number;
  
  /**
   * The net value
   */
  netValue: number;
  
  /**
   * The asset category
   */
  assetCategory: AssetCategory;
  
  /**
   * The broker name
   */
  brokerName: string;
  
  /**
   * The broker code
   */
  brokerCode: string;
  
  /**
   * The row number in the original file (for debugging)
   */
  rowNumber?: number;
  
  /**
   * The file name (for debugging)
   */
  fileName?: string;
}

/**
 * Market types
 */
export enum MarketType {
  SPOT = 'SPOT',                 // Mercado à vista
  OPTIONS = 'OPTIONS',           // Opções
  TERM = 'TERM',                 // Mercado a termo
  FUTURES = 'FUTURES',           // Mercado futuro
  FRACTIONAL = 'FRACTIONAL',     // Mercado fracionário
  OTHER = 'OTHER'                // Outros
}

/**
 * Asset categories
 */
export enum AssetCategory {
  STOCK = 'STOCK',               // Ações
  ETF = 'ETF',                   // ETFs
  FII = 'FII',                   // Fundos Imobiliários
  BDR = 'BDR',                   // BDRs
  OPTION = 'OPTION',             // Opções
  // SUBSCRIPTION_RIGHT = 'SUBSCRIPTION_RIGHT', // Direitos de subscrição
  DEBENTURE = 'DEBENTURE',       // Debêntures
  TREASURY = 'TREASURY',         // Tesouro Direto
  OTHER = 'OTHER'                // Outros
}
