// Updated normalizeKey to handle different date formats and event types consistently
export const normalizeKey = (ticker: string, eventType: string, date: Date): string => {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');

  // Normalize event type string (lowercase, remove accents, replace spaces with hyphens)
  const normalizedEventType = eventType
      .toLowerCase()
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // Remove accents
      .replace(/\s+/g, '-'); // Replace spaces with hyphens

  return `${normalizeTicker(ticker)}-${normalizedEventType}-${year}${month}${day}`;
};

const normalizeTicker = (ticker: string): string => {
  return ticker
    .trim()
    .toUpperCase()
    .replace(/[0-9]/g, ''); // Only letters
};

// --- Helper Functions for Special Event Prices ---
// Parse date from DD/MM/YYYY format
const parseDate = (dateStr: string): Date => {
  const [day, month, year] = dateStr.split('/').map(part => parseInt(part, 10));
  return new Date(year, month - 1, day); // Month is 0-indexed in JS Date
};

// Parse number from string, handling Brazilian number format (comma as decimal separator)
const parseNumber = (numStr: string): number => {
  if (!numStr || numStr === '0' || numStr === '-')
    return 0;

  // Remove any trailing commas and replace commas with dots for decimal
  const cleanedStr = numStr.trim().replace(/,$/, '').replace(',', '.');
  const parsed = parseFloat(cleanedStr);

  return isNaN(parsed) ? 0 : parsed;
};

// Extract ticker from product string (e.g., "BTHF11 - BTG PACTUAL..." -> "BTHF11")
const extractTicker = (productString: string): string => {
  if (!productString)
    return '';

  const match = productString.match(/^([A-Z0-9]+)/);

  return match ? match[1] : productString.split(' ')[0]; // Fallback to first word if no match
};

// --- Special Event Average Price Map ---
// Key format: Ticker-EventType-YYYYMMDD
export const specialEventAveragePriceMap = new Map<string, number>();

export const eventPrice = [
  // Atualização
  { date: "13/12/2024", type: "Atualização", ticker: "BTHF11 - BTG PACTUAL REAL ESTATE HEDGE FUND FII - RESP LTDA", unitPrice: "10,75165746" },
  { date: "13/12/2024", type: "Atualização", ticker: "BCFF11 - FII - FII BTG PACTUAL FUNDO DE FUNDOS RESPONS LTDA", unitPrice: "0" }, // Mudou para BTHF

  { date: "19/11/2024", type: "Atualização", ticker: "ISAE4 - CTEEP - CIA TRANSMISSÃO ENERGIA ELÉTRICA PAULISTA", unitPrice: "0" }, // Apenas renomeou de TRPL
  { date: "05/07/2023", type: "Atualização", ticker: "TRBL11 - FDO DE INVEST IMOB TELLUS RIO BRAVO RENDA LOGISTIC", unitPrice: "0" }, // Apenas renomeou de SDIL
 
  // Direito de Subscrição
  { date: "21/08/2023", type: "Direito de Subscrição", ticker: "ITSA2 - ITAUSA S/A", unitPrice: "6,70" },
  { date: "19/02/2025", type: "Direito de Subscrição", ticker: "ITSA2 - ITAUSA S/A", unitPrice: "6,70" },

  // Cessão de Direitos - Solicitada
  { date: "21/01/2025", type: "Cessão de Direitos - Solicitada", ticker: "HFOF12 - HEDGE TOP FOFII 3 FDO INV IMOB", unitPrice: "70,13" },
  { date: "03/10/2024", type: "Cessão de Direitos - Solicitada", ticker: "GGRC12 - GGR COVEPI RENDA FDO INV IMOB RESPONSAB LTDA", unitPrice: "11,31" },
  { date: "27/06/2024", type: "Cessão de Direitos - Solicitada", ticker: "MXRF12 - MAXI RENDA FDO INV IMOB - FII", unitPrice: "10,07" },
  { date: "04/06/2024", type: "Cessão de Direitos - Solicitada", ticker: "HSML12 - HSI MALL FDO INV IMOB", unitPrice: "97,76" },
  { date: "25/04/2024", type: "Cessão de Direitos - Solicitada", ticker: "GGRC12 - GGR COVEPI RENDA FDO INV IMOB RESPONSAB LTDA", unitPrice: "11,25" },
  { date: "18/01/2024", type: "Cessão de Direitos - Solicitada", ticker: "HSML12 - HSI MALL FDO INV IMOB", unitPrice: "94,34" },
  { date: "12/12/2023", type: "Cessão de Direitos - Solicitada", ticker: "MXRF12 - MAXI RENDA FUNDO DE INVESTIMENTO IMOBILIARIO - FII", unitPrice: "10,29" },
  { date: "29/11/2023", type: "Cessão de Direitos - Solicitada", ticker: "VISC12 - VINCI SHOPPING CENTERS FI IMOBILIÁRIO - FII", unitPrice: "117,47" },
  { date: "24/11/2023", type: "Cessão de Direitos - Solicitada", ticker: "TRBL12 - FDO DE INVEST IMOB TELLUS RIO BRAVO RENDA LOGISTIC", unitPrice: "97,84" },
  { date: "01/09/2023", type: "Cessão de Direitos - Solicitada", ticker: "GGRC12 - GGR COVEPI RENDA FDO INV IMOB", unitPrice: "115,50" },
  { date: "31/08/2023", type: "Cessão de Direitos - Solicitada", ticker: "HFOF12 - HEDGE TOP FOFII 3 FDO INV IMOB", unitPrice: "83,91" },
  { date: "11/07/2023", type: "Cessão de Direitos - Solicitada", ticker: "MXRF12 - MAXI RENDA FUNDO DE INVESTIMENTO IMOBILIARIO - FII", unitPrice: "10,36" },
  { date: "08/05/2023", type: "Cessão de Direitos - Solicitada", ticker: "HFOF12 - HEDGE TOP FOFII 3 FDO INV IMOB", unitPrice: "75,33" },
  { date: "01/12/2022", type: "Cessão de Direitos - Solicitada", ticker: "GGRC12 - GGR COVEPI RENDA FDO INV IMOB", unitPrice: "114,50" },
  { date: "01/11/2022", type: "Cessão de Direitos - Solicitada", ticker: "HFOF12 - HEDGE TOP FOFII 3 FDO INV IMOB", unitPrice: "86,97" },
  { date: "19/10/2022", type: "Cessão de Direitos - Solicitada", ticker: "VISC12 - VINCI SHOPPING CENTERS FI IMOBILIÁRIO - FII", unitPrice: "115,76" },
  { date: "14/01/2022", type: "Cessão de Direitos - Solicitada", ticker: "VINO12 - VINCI OFFICES FUNDO DE INVESTIMENTO IMOBILIARIO", unitPrice: "55,14" },
  { date: "28/10/2021", type: "Cessão de Direitos - Solicitada", ticker: "GGRC12 - GGR COVEPI RENDA FDO INV IMOB", unitPrice: "110,00" },
  { date: "31/03/2021", type: "Cessão de Direitos - Solicitada", ticker: "BCFF12 - FDO INV IMOB - FII BTG PACTUAL FUNDO DE FUNDOS", unitPrice: "84,39" },
];

// Populate the specialEventAveragePriceMap
eventPrice.forEach(example => {
  try {
    const ticker = extractTicker(example.ticker);
    const date = parseDate(example.date);
    const price = parseNumber(example.unitPrice);

    const eventType = example.type;
    const key = normalizeKey(ticker, eventType, date);
    
    //console.log(`Adding special event price: ${ticker}, ${eventType}, ${date.toISOString()}, ${price} -> key: ${key}`);
    specialEventAveragePriceMap.set(key, price);
  } catch (error) {
    console.error(`Error processing special event price example: ${JSON.stringify(example)}`, error);
  }
});
