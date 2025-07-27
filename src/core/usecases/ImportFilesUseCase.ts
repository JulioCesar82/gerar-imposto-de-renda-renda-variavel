import { FileParserPort } from '../interfaces/FileParserPort';
import { StoragePort } from '../interfaces/StoragePort';
import { Transaction } from '../domain/Transaction';
import { SpecialEvent } from '../domain/SpecialEvent';

/**
 * Use case for importing files
 */
export class ImportFilesUseCase {
  constructor(private fileParser: FileParserPort, private storage: StoragePort) {}

  /**
   * Import files and save to storage
   * @param sessionId The ID of the session
   * @param negotiationFile The negotiation file to import
   * @param movementFile Optional movement file to import
   * @param year The year of the session
   * @param description Optional description of the session
   * @returns A promise that resolves when the files are imported
   */
  async execute(
    sessionId: string,
    negotiationFile: File,
    movementFile: File | null,
    year: number,
    description?: string
  ): Promise<{ transactions: Transaction[]; specialEvents: SpecialEvent[] }> {
    try {
      // Initialize storage
      await this.storage.saveSession(sessionId, description, year);

      // Parse negotiation file
      const transactions = await this.fileParser.parseNegotiationFile(negotiationFile);

      // Save transactions
      await this.storage.saveTransactions(sessionId, transactions);

      // Parse movement file if provided
      let specialEvents: SpecialEvent[] = [];
      if (movementFile) {
        specialEvents = await this.fileParser.parseMovementFile(movementFile);

        // Save special events
        await this.storage.saveSpecialEvents(sessionId, specialEvents);
      }

      return { transactions, specialEvents };
    } catch (error) {
      console.error('Error importing files:', error);
      throw error;
    }
  }
}
