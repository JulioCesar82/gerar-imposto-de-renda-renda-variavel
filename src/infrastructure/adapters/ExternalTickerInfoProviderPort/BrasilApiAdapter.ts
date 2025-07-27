import {
  ExternalTickerInfoProviderPort,
  StockInfo
} from '../../../core/interfaces/ExternalTickerInfoProviderPort';

export class BrasilApiAdapter implements ExternalTickerInfoProviderPort {
  private readonly baseUrl = 'https://brasilapi.com.br/api';
  private stockCache = new Map<string, StockInfo | null>(); // Cache simples

  async getStockInfo(ticker: string): Promise<StockInfo | null> {
    const upperTicker = ticker.toUpperCase();
    if (this.stockCache.has(upperTicker)) {
      console.log(`[Cache Hit] Stock info for ${upperTicker}`);
      return this.stockCache.get(upperTicker) ?? null;
    }
    console.log(`[API Call] Fetching stock info for ${upperTicker}`);

    try {
      const response = await fetch(`${this.baseUrl}/stocks/v1/${upperTicker}`);
      if (!response.ok) {
        // Se a resposta não for OK (e.g., 404 Not Found), retorna null
        console.warn(`BrasilAPI: Stock ${upperTicker} not found or error ${response.status}`);
        this.stockCache.set(upperTicker, null); // Cache a falha para evitar re-tentativas
        return null;
      }
      const data = await response.json();

      // Verifica se a resposta contém o CNPJ esperado
      if (data && data.cnpj) {
        const stockInfo: StockInfo = {
          cnpj: data.cnpj.replace(/[^\d]/g, ''), // Limpa formatação do CNPJ
          name: data.name || data.longName || ticker, // Usa nomes disponíveis ou o ticker
          // Mapear outros campos se necessário
        };
        this.stockCache.set(upperTicker, stockInfo);
        return stockInfo;
      } else {
        console.warn(`BrasilAPI: CNPJ not found in response for ${upperTicker}`);
        this.stockCache.set(upperTicker, null);
        return null;
      }
    } catch (error) {
      console.error(`BrasilAPI Error fetching stock info for ${upperTicker}:`, error);
      this.stockCache.set(upperTicker, null); // Cache a falha
      return null;
    }
  }

  // Implementar outros métodos (getFiiInfo, getCompanyInfo) se necessário
}
