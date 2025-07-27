import { StoragePort, StoredSession, StoredData, SessionStatus } from '../interfaces/StoragePort';

/**
 * Use case for managing sessions
 */
export class SessionManagementUseCase {
  constructor(private storage: StoragePort) {}

  /**
   * Get all sessions
   * @returns A promise that resolves to an array of sessions
   */
  async getSessions(): Promise<StoredSession[]> {
    try {
      return await this.storage.getSessions();
    } catch (error) {
      console.error('Error getting sessions:', error);
      throw error;
    }
  }

  /**
   * Get a session by ID
   * @param sessionId The ID of the session
   * @returns A promise that resolves to the session data
   */
  async getSessionData(sessionId: string): Promise<StoredData | null> {
    try {
      return await this.storage.getSessionData(sessionId);
    } catch (error) {
      console.error('Error getting session data:', error);
      throw error;
    }
  }

  /**
   * Delete a session
   * @param sessionId The ID of the session
   * @returns A promise that resolves when the session is deleted
   */
  async deleteSession(sessionId: string): Promise<void> {
    try {
      await this.storage.deleteSession(sessionId);
    } catch (error) {
      console.error('Error deleting session:', error);
      throw error;
    }
  }

  /**
   * Archive a session
   * @param sessionId The ID of the session
   * @returns A promise that resolves when the session is archived
   */
  async archiveSession(sessionId: string): Promise<void> {
    try {
      // Get session data
      const sessionData = await this.storage.getSessionData(sessionId);
      if (!sessionData) {
        throw new Error('Dados da sessão não encontrados');
      }

      // Get all sessions
      const sessions = await this.storage.getSessions();

      // Find the session to archive
      const session = sessions.find(s => s.id === sessionId);
      if (!session) {
        throw new Error('Sessão não encontrada');
      }

      // Update session status
      session.status = SessionStatus.ARCHIVED;

      // Save session
      await this.storage.saveSession(session.id, session.description, session.year);
    } catch (error) {
      console.error('Error archiving session:', error);
      throw error;
    }
  }

  /**
   * Export session data
   * @param sessionId The ID of the session
   * @returns A promise that resolves to a JSON string containing the session data
   */
  async exportSessionData(sessionId: string): Promise<string> {
    try {
      // Get session data
      const sessionData = await this.storage.getSessionData(sessionId);
      if (!sessionData) {
        throw new Error('Dados da sessão não encontrados');
      }

      // Convert dates to ISO strings for JSON serialization
      const serializedData = JSON.stringify(
        sessionData,
        (key, value) => {
          if (value instanceof Date) {
            return value.toISOString();
          }
          return value;
        },
        2
      );

      return serializedData;
    } catch (error) {
      console.error('Error exporting session data:', error);
      throw error;
    }
  }

  /**
   * Import session data
   * @param sessionData The session data to import
   * @returns A promise that resolves to the ID of the imported session
   */
  async importSessionData(sessionData: string): Promise<string> {
    try {
      // Parse session data
      const parsedData = JSON.parse(sessionData, (key, value) => {
        if (
          typeof value === 'string' &&
          /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/.test(value)
        ) {
          return new Date(value);
        }
        return value;
      }) as StoredData;

      // Generate a new session ID
      const newSessionId = crypto.randomUUID();

      // Save session
      await this.storage.saveSession(
        newSessionId,
        `Importado em ${new Date().toLocaleDateString()}`,
        parsedData.transactions.length > 0
          ? parsedData.transactions[0].year
          : new Date().getFullYear() - 1
      );

      // Save transactions
      await this.storage.saveTransactions(newSessionId, parsedData.transactions);

      // Save special events
      await this.storage.saveSpecialEvents(newSessionId, parsedData.specialEvents);

      // Save processed data if available
      if (parsedData.processedData) {
        await this.storage.saveProcessedData(
          newSessionId,
          parsedData.processedData.assetPositions,
          parsedData.processedData.monthlyResults,
          parsedData.processedData.incomeRecords
        );
      }

      // Save declaration if available
      if (parsedData.generatedDeclaration) {
        await this.storage.saveDeclaration(newSessionId, parsedData.generatedDeclaration);
      }

      return newSessionId;
    } catch (error) {
      console.error('Error importing session data:', error);
      throw error;
    }
  }
}
