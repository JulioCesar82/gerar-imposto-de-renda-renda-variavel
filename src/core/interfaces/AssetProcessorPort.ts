import { Transaction } from '../domain/Transaction';
import { SpecialEvent } from '../domain/SpecialEvent';
import {
  ProcessedDataSummary,
  AssetPosition,
  TradeResult,
  MonthlyResult,
  IncomeRecord,
  Inconsistency
} from '../domain/AssetPosition';

/**
 * Interface for processing assets
 */
export interface AssetProcessorPort {
  analyzeTransactionsAndSpecialEvents(
    transactions: Transaction[],
    specialEvents: SpecialEvent[],
    selectedYear: number,
    includeInitialPosition: boolean
  ): Promise<ProcessedDataSummary>;

  /**
   * Process transactions and special events to calculate asset positions
   * @param transactions The transactions to process
   * @param specialEvents The special events to process
   * @param initialPositions Optional initial positions
   * @returns A promise that resolves to an array of asset positions
   */
  processAssets(
    transactions: Transaction[],
    specialEvents: SpecialEvent[],
    initialPositions?: AssetPosition[]
  ): Promise<AssetPosition[]>;

  /**
   * Calculate trade results from asset positions
   * @param assetPositions The asset positions to calculate trade results from
   * @param selectedYear Year to filter results by
   * @returns A promise that resolves to an array of trade results
   */
  calculateTradeResults(
    assetPositions: AssetPosition[],
    selectedYear: number
  ): Promise<TradeResult[]>;

  /**
   * Calculate monthly results from trade results
   * @param tradeResults The trade results to calculate monthly results from
   * @param selectedYear Year to filter results by
   * @returns A promise that resolves to an array of monthly results
   */
  calculateMonthlyResults(
    tradeResults: TradeResult[],
    selectedYear: number
  ): Promise<MonthlyResult[]>;

  /**
   * Extract income records from special events
   * @param specialEvents The special events to extract income records from
   * @returns A promise that resolves to an array of income records
   */
  extractIncomeRecords(specialEvents: SpecialEvent[]): Promise<IncomeRecord[]>;

  /**
   * Validate data for inconsistencies
   * @param transactions The transactions to validate
   * @param specialEvents The special events to validate
   * @returns A promise that resolves to an array of inconsistencies
   */
  validateData(
    transactions: Transaction[],
    specialEvents: SpecialEvent[]
  ): Promise<Inconsistency[]>;
}
