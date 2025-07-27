import { EventInfo } from '../../core/interfaces/ExternalEventInfoProviderPort';
import { normalizeKey } from './staticAveragePriceEventInfoData';

// Data extracted from https://statusinvest.com.br/carteira/configuracao (grupamentos / desdobramentos)
// IMPORTANT: This data is static and may become outdated. Manual updates are required.

const normalizeDateMonth = (month: number): number => {
  return month - 1;
};

const normalizeDateDay = (day: number): number => {
  return day + 2; // B3 Portal and Status Invest have this difference..
};

// Helper function to split tickers and create map entries
const addEntries = (
  map: Map<string, EventInfo>, 
  eventInfo: EventInfo
) => {
  const normalizedKey = normalizeKey(eventInfo.ticker, eventInfo.type, eventInfo.date);

  if (normalizedKey) { // Ensure ticker is not empty after trimming
    map.set(normalizedKey, eventInfo);
    //console.log(`Added EventInfo ${normalizedKey}`);
  }
};

export const specialEventFactorPriceMap = new Map<string, EventInfo>();

// == Populate with Data ==
addEntries(specialEventFactorPriceMap, { ticker: 'WEGE3', type: 'Desdobro', date: new Date(2021, normalizeDateMonth(4), normalizeDateDay(27)), factor: 2 }); // 2 para 1
addEntries(specialEventFactorPriceMap, { ticker: 'VINO11', type: 'Desdobro', date: new Date(2023, normalizeDateMonth(8), normalizeDateDay(4) + 2/* Talvez rolou algum Delay lá no sistema da B3*/), factor: 5 }); // 5 para 1
addEntries(specialEventFactorPriceMap, { ticker: 'GGRC11', type: 'Desdobro', date: new Date(2024, normalizeDateMonth(3), normalizeDateDay(5)), factor: 10 }); // 10 para 1
addEntries(specialEventFactorPriceMap, { ticker: 'BCFF11', type: 'Desdobro', date: new Date(2023, normalizeDateMonth(11), normalizeDateDay(28)), factor: 8 }); // 8 para 1
addEntries(specialEventFactorPriceMap, { ticker: 'BBAS3', type: 'Desdobro', date: new Date(2024, normalizeDateMonth(4), normalizeDateDay(15)), factor: 2 }); // 2 para 1
