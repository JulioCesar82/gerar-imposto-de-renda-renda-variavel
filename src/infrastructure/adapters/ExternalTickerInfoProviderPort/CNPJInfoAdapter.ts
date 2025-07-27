import {
  ExternalTickerInfoProviderPort,
  StockInfo
} from '../../../core/interfaces/ExternalTickerInfoProviderPort';

export class CNPJInfoAdapter implements ExternalTickerInfoProviderPort {
  private readonly baseUrl = 'http://cnpj.info';
  private stockCache = new Map<string, StockInfo | null>(); // Cache simples

  async getStockInfo(companyName: string): Promise<StockInfo | null> {
    const upperCompanyName = companyName.toUpperCase();
    if (this.stockCache.has(upperCompanyName)) {
      console.log(`[Cache Hit] Stock info for ${upperCompanyName}`);
      return this.stockCache.get(upperCompanyName) ?? null;
    }
    console.log(`[API Call] Fetching stock info for ${upperCompanyName}`);

    let normalizedTicker = companyName.replaceAll(' ', '-').replaceAll('.', '-');
    if (normalizedTicker.endsWith('-'))
      normalizedTicker = normalizedTicker.slice(0, normalizedTicker.length - 1);

    try {
      const response = await fetch(`${this.baseUrl}/${normalizedTicker}`);
      if (!response.ok) {
        // Se a resposta não for OK (e.g., 404 Not Found), retorna null
        console.warn(`CNPJInfo: Stock ${normalizedTicker} not found or error ${response.status}`);
        this.stockCache.set(upperCompanyName, null); // Cache a falha para evitar re-tentativas
        return null;
      }

      const cnpj = this.tryGetCNPJFromHTML(await response.text());

      // Verifica se a resposta contém o CNPJ esperado
      if (cnpj) {
        const stockInfo: StockInfo = {
          cnpj: cnpj.replace(/[^\d]/g, ''), // Limpa formatação do CNPJ
          name: companyName, // Usa nomes disponíveis ou o ticker
          // Mapear outros campos se necessário
        };

        this.stockCache.set(upperCompanyName, stockInfo);
        return stockInfo;
      } else {
        console.warn(`CNPJInfo: CNPJ not found in response for ${upperCompanyName}`);
        this.stockCache.set(upperCompanyName, null);
        return null;
      }
    } catch (error) {
      console.error(`CNPJInfo Error fetching stock info for ${upperCompanyName}:`, error);
      this.stockCache.set(upperCompanyName, null); // Cache a falha
      return null;
    }
  }

  tryGetCNPJFromHTML(htmlString: string): string | null {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlString, 'text/html');

    // Agora você pode utilizar os comandos JavaScript para manipular o documento HTML
    const tabela = doc.querySelector('table');
    if (!tabela) throw new Error('Unexpected error while loading HTML page');

    const linhas = tabela.querySelectorAll('tr');

    let cnpj = null;

    linhas.forEach(linha => {
      const celulas = linha.querySelectorAll('td');
      const keyCell = celulas[0];
      const valueCell = celulas[1];

      if (keyCell && keyCell.textContent?.trim() === 'CNPJ') {
        cnpj = valueCell.textContent?.trim().split('[')[0].trim();
      }
    });

    return cnpj;
  }

  // Implementar outros métodos (getFiiInfo, getCompanyInfo) se necessário
}
