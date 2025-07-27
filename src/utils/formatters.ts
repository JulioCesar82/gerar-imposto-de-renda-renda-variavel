/**
 * Format a number as currency
 * @param value The value to format
 * @returns The formatted value
 */
export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

/**
 * Format a number as percentage
 * @param value The value to format
 * @returns The formatted value
 */
export const formatPercentage = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'percent',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value / 100);
};

/**
 * Format a date
 * @param date The date to format
 * @returns The formatted date
 */
export const formatDate = (date: Date): string => {
  return date.toLocaleDateString('pt-BR');
};

/**
 * Format a date as month and year
 * @param date The date to format
 * @returns The formatted date
 */
export const formatMonthYear = (date: Date): string => {
  return date.toLocaleDateString('pt-BR', {
    month: 'long',
    year: 'numeric',
  });
};

/**
 * Format a number
 * @param value The value to format
 * @returns The formatted value
 */
export const formatNumber = (value: number): string => {
  return new Intl.NumberFormat('pt-BR').format(value);
};

/**
 * Format a number with a fixed number of decimal places
 * @param value The value to format
 * @param decimals The number of decimal places
 * @returns The formatted value
 */
export const formatNumberWithDecimals = (value: number, decimals: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
};



export const getAssetKey = (assetCode: string): string => {
    const ticker: string = assetCode?.split(' - ')[0].toUpperCase().trim() || 'UNKNOWN';
    // return ticker.endsWith('F') ? ticker.slice(0, -1) : ticker;

    return ticker
    .trim()
    .toUpperCase()
    .replace(/[0-9]/g, ''); // Only letters
}