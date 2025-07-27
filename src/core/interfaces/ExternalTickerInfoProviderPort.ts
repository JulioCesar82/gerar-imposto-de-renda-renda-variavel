export interface StockInfo {
  cnpj: string;
  name: string;
  // adicionar outros campos se a API retornar e forem úteis
}

export interface ExternalTickerInfoProviderPort {
  /**
   * Busca informações de uma Ação (incluindo CNPJ) pelo ticker.
   * Retorna null se não encontrar ou ocorrer erro.
   * @param ticker O código de negociação da ação (e.g., 'PETR4')
   */
  getStockInfo(ticker: string): Promise<StockInfo | null>;

  /**
   * Busca informações de um FII pelo CNPJ.
   * (Pode ser expandido para buscar por ticker se encontrar uma API adequada)
   * Retorna null se não encontrar ou ocorrer erro.
   * @param cnpj O CNPJ do FII
   */
  // getFiiInfo(cnpj: string): Promise<any | null>; // Exemplo futuro

  /**
   * Busca informações de uma empresa pelo CNPJ.
   * Retorna null se não encontrar ou ocorrer erro.
   * @param cnpj O CNPJ da empresa
   */
  // getCompanyInfo(cnpj: string): Promise<any | null>; // Exemplo futuro
}
