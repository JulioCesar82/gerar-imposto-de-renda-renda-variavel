import { AssetProcessorPort } from '../interfaces/AssetProcessorPort';
import { StoragePort } from '../interfaces/StoragePort';
import {
  ProcessedDataSummaryWithInconsistencies,
  ProcessedDataSummaryWithSourceData
} from '../domain/AssetPosition';

/**
 * Use case for processing assets
 */
export class ProcessAssetsUseCase {
  constructor(private assetProcessor: AssetProcessorPort, private storage: StoragePort) {}

  /**
   * Process assets and save results to storage
   * @param sessionId The ID of the session
   * @param includeInitialPosition Whether to include the initial position (Default value is true)
   * @returns A promise that resolves to the processing results
   */
  async execute(
    sessionId: string,
    includeInitialPosition: boolean = true
  ): Promise<ProcessedDataSummaryWithInconsistencies> {
    try {
      console.log(`ProcessAssetsUseCase: Processing assets for session ${sessionId}`);

      // Get session data
      const sessionData = await this.storage.getSessionData(sessionId);
      if (!sessionData) {
        console.error(`ProcessAssetsUseCase: Session data not found for ${sessionId}`);
        throw new Error('Dados da sessão não encontrados');
      }

      // Get session to get the year
      const sessions = await this.storage.getSessions();
      const session = sessions.find(s => s.id === sessionId);
      if (!session) {
        console.error(`ProcessAssetsUseCase: Session not found for ${sessionId}`);
        throw new Error('Sessão não encontrada');
      }

      // Validate data
      console.log(`ProcessAssetsUseCase: Validating data`);
      const inconsistencies = await this.assetProcessor.validateData(
        sessionData.transactions,
        sessionData.specialEvents
      );
      console.log(`ProcessAssetsUseCase: Found ${inconsistencies.length} inconsistencies`);

      // Check for critical inconsistencies
      const criticalInconsistencies = inconsistencies.filter(i => i.type === 'error');
      console.log(`ProcessAssetsUseCase: Found ${criticalInconsistencies.length} critical inconsistencies`);

      // if (criticalInconsistencies.length > 0) {
      //   console.warn(`ProcessAssetsUseCase: Critical inconsistencies found, aborting processing`);
      //   return {
      //     assetPositions: [],
      //     monthlyResults: [],
      //     incomeRecords: [],
      //     inconsistencies
      //   };
      // }

      const processedDataSummary = await this.assetProcessor.analyzeTransactionsAndSpecialEvents(
        sessionData.transactions,
        sessionData.specialEvents,
        //sessionData.initialPositions
        session.year,
        includeInitialPosition
      );

      // Save processed data
      console.log(`ProcessAssetsUseCase: Saving processed data`);
      await this.storage.saveProcessedData(
        sessionId,
        processedDataSummary.assetPositions,
        processedDataSummary.monthlyResults,
        processedDataSummary.incomeRecords
      );
      console.log(`ProcessAssetsUseCase: Processed data saved successfully`);

      // Verify saved data
      console.log(`ProcessAssetsUseCase: Verifying saved data`);
      const verifyData = await this.storage.getSessionData(sessionId);
      console.log(`ProcessAssetsUseCase: Verified data:`, verifyData?.processedData);

      return {
        assetPositions: processedDataSummary.assetPositions,
        monthlyResults: processedDataSummary.monthlyResults,
        incomeRecords: processedDataSummary.incomeRecords,
        inconsistencies,
      };
    } catch (error) {
      console.error('Error processing assets:', error);
      throw error;
    }
  }

  /**
   * Get processed data from storage
   * @param sessionId The ID of the session
   * @returns A promise that resolves to the processed data
   */
  async getProcessedData(sessionId: string): Promise<ProcessedDataSummaryWithSourceData | null> {
    try {
      // Get session data
      const sessionData = await this.storage.getSessionData(sessionId);
      if (!sessionData || !sessionData.processedData) {
        return null;
      }

      return {
        assetPositions: sessionData.processedData.assetPositions,
        monthlyResults: sessionData.processedData.monthlyResults,
        incomeRecords: sessionData.processedData.incomeRecords,
        transactions: sessionData.transactions,
        specialEvents: sessionData.specialEvents
      };
    } catch (error) {
      console.error('Error getting processed data:', error);
      throw error;
    }
  }
}
