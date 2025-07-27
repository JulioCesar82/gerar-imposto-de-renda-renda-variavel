import { Transaction } from '../domain/Transaction';
import { SpecialEvent } from '../domain/SpecialEvent';

/**
 * Interface for parsing B3 files
 */
export interface FileParserPort {
  /**
   * Parse a negotiation file (Excel) from B3
   * @param file The file to parse
   * @returns A promise that resolves to an array of transactions
   */
  parseNegotiationFile(file: File): Promise<Transaction[]>;

  /**
   * Parse a movement file (Excel) from B3
   * @param file The file to parse
   * @returns A promise that resolves to an array of special events
   */
  parseMovementFile(file: File): Promise<SpecialEvent[]>;
}
