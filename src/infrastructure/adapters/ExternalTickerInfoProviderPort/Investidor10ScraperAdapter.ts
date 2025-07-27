import {
  ExternalTickerInfoProviderPort,
  StockInfo
} from '../../../core/interfaces/ExternalTickerInfoProviderPort';

export class Investidor10ScraperAdapter implements ExternalTickerInfoProviderPort {
  private readonly baseUrl = 'https://investidor10.com.br';
  // Cache simples para evitar múltiplas tentativas falhas ou buscas repetidas
  private scrapeCache = new Map<string, StockInfo | null>();

  async getStockInfo(ticker: string): Promise<StockInfo | null> {
    const upperTicker = ticker.toUpperCase();

    if (this.scrapeCache.has(upperTicker)) {
      const cachedData = this.scrapeCache.get(upperTicker);
      console.log(`[Cache Hit - Scraper] Info for ${upperTicker}:`, cachedData);
      return cachedData ?? null;
    }

    // URLs comuns para ações e FIIs no Investidor10
    const urlAcoes = `${this.baseUrl}/acoes/${upperTicker}/`;
    const urlFIIs = `${this.baseUrl}/fiis/${upperTicker}/`; // Tentar FIIs também

    console.log(`[Scraper Attempt] Trying to fetch info for ${upperTicker} from Investidor10...`);

    // Tenta buscar primeiro como Ação, depois como FII se falhar
    let stockInfo = await this.scrapeUrl(urlAcoes, upperTicker);
    if (!stockInfo) {
      console.log(`[Scraper Attempt] Failed fetching as Action, trying as FII for ${upperTicker}`);
      stockInfo = await this.scrapeUrl(urlFIIs, upperTicker);
    }

    // Armazena o resultado (sucesso ou falha) no cache
    this.scrapeCache.set(upperTicker, stockInfo);
    console.log(`[Scraper Result] Final result for ${upperTicker}:`, stockInfo);
    return stockInfo;
  }

  private async scrapeUrl(url: string, ticker: string): Promise<StockInfo | null> {
    try {
      // !!! ALERTA DE CORS !!!
      // Esta chamada fetch provavelmente falhará no navegador devido ao CORS.
      // O bloco catch lidará com isso, mas a extração não ocorrerá.
      const response = await fetch(url, {
        // Omitir 'mode: "no-cors"' pois impede ler a resposta.
        // Deixar o navegador tentar a requisição padrão e falhar com CORS.
      });

      if (!response.ok) {
        console.warn(`Investidor10Scraper: HTTP error fetching ${url}. Status: ${response.status}`);
        return null; // Não encontrado ou erro no servidor do Investidor10
      }

      const htmlText = await response.text();
      const parser = new DOMParser();
      const doc = parser.parseFromString(htmlText, 'text/html');

      // --- Lógica de Extração do CNPJ (FRÁGIL!) ---
      // Esta parte depende MUITO da estrutura HTML atual do Investidor10
      // Inspecione o HTML da página real para ajustar os seletores.

      let cnpj: string | null = null;
      let companyName: string | null = null;

      // Tentativa 1: Procurar por um elemento que contenha "CNPJ:" e pegar o próximo
      try {
        // Seleciona todos os elementos relevantes, por exemplo, divs dentro de um card
        const elements = doc.querySelectorAll('div._card-body div._card-line'); // << SELETOR FRÁGIL (Exemplo!)
        elements.forEach(element => {
          const labelElement = element.querySelector('span.label, div.label'); // << SELETOR FRÁGIL
          const valueElement = element.querySelector('span.value, div.value, span[title]'); // << SELETOR FRÁGIL

          if (labelElement?.textContent?.trim() === 'CNPJ:') {
            cnpj = valueElement?.textContent?.trim() || null;
          }
          if (labelElement?.textContent?.trim() === 'Nome da Empresa:') {
            companyName = valueElement?.textContent?.trim() || null;
          }
          // Adicionar mais seletores se necessário para outros layouts
        });

        // Tentativa 2: Buscar por um atributo específico se houver (ex: data-cnpj) - menos comum
        if (!cnpj) {
          const cnpjElement = doc.querySelector('[data-cnpj]'); // << SELETOR FRÁGIL (Exemplo!)
          if (cnpjElement) {
            cnpj = cnpjElement.getAttribute('data-cnpj');
          }
        }
      } catch (parseError) {
        console.error(`Investidor10Scraper: Error parsing HTML for ${ticker}:`, parseError);
        return null; // Erro ao analisar o HTML
      }
      // --- Fim da Lógica de Extração ---

      if (cnpj) {
        const cleanedCnpj = cnpj.replace(/[^\d]/g, ''); // Limpa formatação
        return {
          cnpj: cleanedCnpj,
          name: companyName || ticker, // Usa nome encontrado ou o ticker
        };
      } else {
        console.warn(`Investidor10Scraper: CNPJ not found in HTML for ${ticker} at ${url}`);
        return null;
      }
    } catch (error: any) {
      // Captura erros de rede e, mais provavelmente, o erro de CORS
      if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        console.error(`Investidor10Scraper: Failed to fetch ${url}. Likely a CORS policy violation or network error.`);

      } else {
        console.error(`Investidor10Scraper: Unexpected error fetching or parsing ${url}:`, error);
      }
      return null; // Retorna null em caso de erro (incluindo CORS)
    }
  }
}
