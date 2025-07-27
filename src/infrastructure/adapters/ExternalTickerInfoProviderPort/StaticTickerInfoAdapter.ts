import {
  ExternalTickerInfoProviderPort,
  StockInfo
} from '../../../core/interfaces/ExternalTickerInfoProviderPort';
import { cnpjDataMap, normalizeTicker } from '../../data/staticTickerInfoData';

/**
 * Adapter that provides Stock Information based on a static, pre-compiled list.
 *
 * This adapter reads data from `src/infrastructure/data/staticCnpjData.ts`.
 * It does NOT make external API calls or perform web scraping.
 *
 * IMPORTANT: The data is static and reflects the information available at the time
 * it was extracted. It may become outdated and requires manual updates to the
 * `staticCnpjData.ts` file to reflect changes in the market (new companies,
 * CNPJ changes, etc.).
 */
export class StaticTickerInfoAdapter implements ExternalTickerInfoProviderPort {
  /**
   * Retrieves stock information (CNPJ and name) for a given ticker from the static map.
   * @param ticker The stock ticker symbol (e.g., "PETR4", "VALE3"). Case-insensitive.
   * @returns A Promise resolving to a StockInfo object if the ticker is found in the
   *          static map, or null otherwise.
   */
  async getStockInfo(ticker: string): Promise<StockInfo | null> {
    const normalizedTicker = normalizeTicker(ticker);

    const staticInfo: StockInfo | undefined = cnpjDataMap.get(normalizedTicker);

    if (staticInfo) {
      const stockInfo: StockInfo = {
        cnpj: staticInfo.cnpj, // Already cleaned in the map generation
        name: staticInfo.name,
        // escriturador is available in staticInfo.escriturador if needed elsewhere
      };

      console.log(`[Static Stock Data Hit] Found info for ${normalizedTicker}:`, stockInfo);
      return stockInfo;
    }

    console.warn(`[Static Stock Data Miss] Stock info for ${normalizedTicker} not found in the static list.`);

    return null;
  }
}
