import { ExternalTickerInfoProviderPort, StockInfo } from '../../../core/interfaces/ExternalTickerInfoProviderPort';

export class BrapiAdapter implements ExternalTickerInfoProviderPort {
  private readonly baseUrl = 'https://brapi.dev/api';
  private readonly apiToken: string;
  private stockCache = new Map<string, StockInfo | null>(); // Cache simples em memória

  constructor() {
    const token = process.env.REACT_APP_BRAPI_TOKEN; // Read from environment variable
    if (!token) {
      throw new Error('BRAPI_TOKEN environment variable is not set.');
    }
    this.apiToken = token;
    console.log('BrapiAdapter initialized. Token loaded from environment variable.'); // Log confirmation (optional)
  }

  async getStockInfo(ticker: string): Promise<StockInfo | null> {
    const upperTicker = ticker.toUpperCase();
    if (this.stockCache.has(upperTicker)) {
      const cachedData = this.stockCache.get(upperTicker);
      console.log(`[Cache Hit] Stock info for ${upperTicker}:`, cachedData);
      // Retorna o valor cacheado, mesmo que seja null (indicando falha anterior)
      return cachedData ?? null;
    }

    console.log(`[API Call] Fetching stock info for ${upperTicker} from brapi.dev`);

    // Construct URL without the token query parameter
    //const url = `${this.baseUrl}/quote/${upperTicker}?modules=summaryProfile`;
    const url = `${this.baseUrl}/quote/${upperTicker}?token=${this.apiToken}&modules=summaryProfile`;

    try {
      // Send token via Authorization header
      const response = await fetch(url, /*{
        headers: {
          'Authorization': `Bearer ${this.apiToken}`
        }
      }*/);

      if (!response.ok) {
        // Trata erros como 404 (Não encontrado) ou outros erros HTTP
        console.warn(`BrapiAdapter: API request failed for ${upperTicker}. Status: ${response.status} ${response.statusText}`);
        // Cache a falha para evitar re-tentativas na mesma sessão
        this.stockCache.set(upperTicker, null);
        return null;
      }

      const data = await response.json();

      // A API brapi.dev retorna um array 'results'
      if (data && data.results && data.results.length > 0) {
        const result = data.results[0];
     
        // Verifica se o CNPJ existe no resultado
        if (result.cnpj) {
          const stockInfo: StockInfo = {
            name: result.longName || result.shortName || ticker, // Usa nomes disponíveis
            cnpj: result.cnpj.replace(/[^\d]/g, '') // Limpa formatação do CNPJ
            // Mapear outros campos se necessário da resposta da API
          };

          console.log(`[API Success] Stock info for ${upperTicker}:`, stockInfo);
          this.stockCache.set(upperTicker, stockInfo); // Cache sucesso
          return stockInfo;
        } else {
          console.warn(`BrapiAdapter: CNPJ not found in response for ${upperTicker}. Response:`, result);
          this.stockCache.set(upperTicker, null); // Cache falha (CNPJ ausente)
          return null;
        }
      } else {
         console.warn(`BrapiAdapter: No results found in API response for ${upperTicker}.`);
         this.stockCache.set(upperTicker, null); // Cache falha (sem resultados)
         return null;
      }
    } catch (error) {
      console.error(`BrapiAdapter: Network or parsing error fetching stock info for ${upperTicker}:`, error);
      this.stockCache.set(upperTicker, null); // Cache falha (erro de rede/parse)
      return null;
    }
  }

  // TODO: Implementar outros métodos se necessário (getFiiInfo, etc.)
  //      Verificar se a brapi.dev oferece endpoints adequados para FIIs por ticker
  //      ou para buscar fontes pagadoras por nome.
}
