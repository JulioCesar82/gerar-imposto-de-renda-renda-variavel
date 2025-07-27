import {
  StoragePort,
  StoredSession,
  StoredData,
  SessionStatus
} from '../../core/interfaces/StoragePort';
import { Transaction } from '../../core/domain/Transaction';
import { SpecialEvent } from '../../core/domain/SpecialEvent';
import { AssetPosition, MonthlyResult, IncomeRecord } from '../../core/domain/AssetPosition';
import { IRPFDeclaration } from '../../core/domain/IRPFDeclaration';

/**
 * Implementation of the StoragePort interface using IndexedDB
 */
export class IndexedDBStorage implements StoragePort {
  private readonly DB_NAME = 'IRPFGeneratorDB';
  private readonly DB_VERSION = 2;
  private readonly SESSIONS_STORE = 'sessions';
  private readonly TRANSACTIONS_STORE = 'transactions';
  private readonly SPECIAL_EVENTS_STORE = 'specialEvents';
  private readonly PROCESSED_DATA_STORE = 'processedData';
  private readonly DECLARATIONS_STORE = 'declarations';
  private readonly ORIGINAL_DBK_STORE = 'originalDBK';

  private db: IDBDatabase | null = null;

  /**
   * Constructor
   */
  constructor() {
    this.initDB();
  }

  /**
   * Initialize the database
   * @returns A promise that resolves when the database is initialized
   */
  private async initDB(): Promise<void> {
    if (this.db) {
      return;
    }

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.DB_NAME, this.DB_VERSION);

      request.onerror = event => {
        console.error('Error opening database:', event);
        reject(new Error('Error opening database'));
      };

      request.onsuccess = event => {
        this.db = (event.target as IDBOpenDBRequest).result;
        resolve();
      };

      request.onupgradeneeded = event => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Create sessions store
        if (!db.objectStoreNames.contains(this.SESSIONS_STORE)) {
          const sessionsStore = db.createObjectStore(this.SESSIONS_STORE, { keyPath: 'id' });
          sessionsStore.createIndex('year', 'year', { unique: false });
          sessionsStore.createIndex('status', 'status', { unique: false });
        }

        // Create transactions store
        if (!db.objectStoreNames.contains(this.TRANSACTIONS_STORE)) {
          const transactionsStore = db.createObjectStore(this.TRANSACTIONS_STORE, {
            keyPath: ['sessionId', 'id']
          });
          transactionsStore.createIndex('sessionId', 'sessionId', { unique: false });
          transactionsStore.createIndex('assetCode', 'assetCode', { unique: false });
          transactionsStore.createIndex('date', 'date', { unique: false });
        }

        // Create special events store
        if (!db.objectStoreNames.contains(this.SPECIAL_EVENTS_STORE)) {
          const specialEventsStore = db.createObjectStore(this.SPECIAL_EVENTS_STORE, {
            keyPath: ['sessionId', 'id']
          });
          specialEventsStore.createIndex('sessionId', 'sessionId', { unique: false });
          specialEventsStore.createIndex('assetCode', 'assetCode', { unique: false });
          specialEventsStore.createIndex('date', 'date', { unique: false });
        }

        // Create processed data store
        if (!db.objectStoreNames.contains(this.PROCESSED_DATA_STORE)) {
          const processedDataStore = db.createObjectStore(this.PROCESSED_DATA_STORE, {
            keyPath: 'sessionId'
          });
          processedDataStore.createIndex('sessionId', 'sessionId', { unique: true });
        }

        // Create declarations store
        if (!db.objectStoreNames.contains(this.DECLARATIONS_STORE)) {
          const declarationsStore = db.createObjectStore(this.DECLARATIONS_STORE, {
            keyPath: 'sessionId'
          });
          declarationsStore.createIndex('sessionId', 'sessionId', { unique: true });
        }

        // Create original DBK store
        if (!db.objectStoreNames.contains(this.ORIGINAL_DBK_STORE)) {
          const originalDBKStore = db.createObjectStore(this.ORIGINAL_DBK_STORE, {
            keyPath: 'sessionId'
          });
          originalDBKStore.createIndex('sessionId', 'sessionId', { unique: true });
        }
      };
    });
  }

  /**
   * Get a transaction
   * @param storeNames The store names
   * @param mode The transaction mode
   * @returns The transaction
   */
  private async getTransaction(
    storeNames: string | string[],
    mode: IDBTransactionMode = 'readonly'
  ): Promise<IDBTransaction> {
    await this.initDB();

    if (!this.db) {
      throw new Error('Database not initialized');
    }

    return this.db.transaction(storeNames, mode);
  }

  /**
   * Get a store
   * @param storeName The store name
   * @param mode The transaction mode
   * @returns The store
   */
  private async getStore<T>(
    storeName: string,
    mode: IDBTransactionMode = 'readonly'
  ): Promise<IDBObjectStore> {
    const transaction = await this.getTransaction(storeName, mode);
    return transaction.objectStore(storeName);
  }

  /**
   * Save a session
   * @param sessionId The ID of the session
   * @param description Optional description of the session
   * @param year The year of the session
   * @returns A promise that resolves when the session is saved
   */
  async saveSession(
    sessionId: string,
    description: string | undefined,
    year: number
  ): Promise<void> {
    try {
      // Initialize DB if needed
      await this.initDB();

      if (!this.db) {
        throw new Error('Database not initialized');
      }

      // Create a single transaction for the entire operation
      const transaction = this.db.transaction(this.SESSIONS_STORE, 'readwrite');
      const store = transaction.objectStore(this.SESSIONS_STORE);

      // Get existing session (if any) within the same transaction
      const existingSession = await new Promise<StoredSession | null>((resolve, reject) => {
        const request = store.get(sessionId);
        request.onsuccess = () => resolve(request.result || null);
        request.onerror = () => reject(new Error('Error getting session'));
      });

      const now = new Date();

      // Prepare session data
      let session: StoredSession;

      if (existingSession) {
        // Update existing session
        session = {
          ...existingSession,
          lastModified: now,
          description: description || existingSession.description,
          year: year || existingSession.year
        };
      } else {
        // Create new session
        session = {
          id: sessionId,
          createdAt: now,
          lastModified: now,
          year,
          description,
          status: SessionStatus.DRAFT
        };
      }

      // Save session within the same transaction
      return new Promise((resolve, reject) => {
        const request = existingSession ? store.put(session) : store.add(session);

        request.onsuccess = () => resolve();
        request.onerror = event => {
          console.error('Error saving session:', event);
          reject(new Error(existingSession ? 'Error updating session' : 'Error creating session'));
        };

        // Handle transaction completion
        transaction.oncomplete = () => resolve();
        transaction.onerror = event => {
          console.error('Transaction error:', event);
          reject(new Error('Transaction error'));
        };
      });
    } catch (error) {
      console.error('Error saving session:', error);
      throw error;
    }
  }

  /**
   * Save transactions
   * @param sessionId The ID of the session
   * @param transactions The transactions to save
   * @returns A promise that resolves when the transactions are saved
   */
  async saveTransactions(sessionId: string, transactions: Transaction[]): Promise<void> {
    try {
      // Initialize DB if needed
      await this.initDB();

      if (!this.db) {
        throw new Error('Database not initialized');
      }

      // First delete existing transactions
      await this.deleteTransactions(sessionId);

      // Create a single transaction for the entire operation
      const transaction = this.db.transaction(this.TRANSACTIONS_STORE, 'readwrite');
      const store = transaction.objectStore(this.TRANSACTIONS_STORE);

      // Add transactions with IDs
      const transactionsWithIds = transactions.map((transaction, index) => ({
        ...transaction,
        id: index.toString(),
        sessionId
      }));

      // Save transactions
      return new Promise((resolve, reject) => {
        // Handle transaction completion
        transaction.oncomplete = () => {
          this.updateSessionStatus(sessionId, SessionStatus.DRAFT).then(resolve).catch(reject);
        };

        transaction.onerror = event => {
          console.error('Transaction error:', event);
          reject(new Error('Error saving transactions'));
        };

        // Add all transactions within the same transaction
        for (const transaction of transactionsWithIds) {
          try {
            store.add(transaction);
          } catch (error) {
            console.error('Error adding transaction:', error);
            reject(error);
            return;
          }
        }
      });
    } catch (error) {
      console.error('Error saving transactions:', error);
      throw error;
    }
  }

  /**
   * Save special events
   * @param sessionId The ID of the session
   * @param specialEvents The special events to save
   * @returns A promise that resolves when the special events are saved
   */
  async saveSpecialEvents(sessionId: string, specialEvents: SpecialEvent[]): Promise<void> {
    try {
      // Initialize DB if needed
      await this.initDB();

      if (!this.db) {
        throw new Error('Database not initialized');
      }

      // First delete existing special events
      await this.deleteSpecialEvents(sessionId);

      // Create a single transaction for the entire operation
      const transaction = this.db.transaction(this.SPECIAL_EVENTS_STORE, 'readwrite');
      const store = transaction.objectStore(this.SPECIAL_EVENTS_STORE);

      // Add special events with IDs
      const specialEventsWithIds = specialEvents.map((event, index) => ({
        ...event,
        id: index.toString(),
        sessionId
      }));

      // Save special events
      return new Promise((resolve, reject) => {
        // Handle transaction completion
        transaction.oncomplete = () => {
          this.updateSessionStatus(sessionId, SessionStatus.DRAFT).then(resolve).catch(reject);
        };

        transaction.onerror = event => {
          console.error('Transaction error:', event);
          reject(new Error('Error saving special events'));
        };

        // Add all special events within the same transaction
        for (const event of specialEventsWithIds) {
          try {
            store.add(event);
          } catch (error) {
            console.error('Error adding special event:', error);
            reject(error);
            return;
          }
        }
      });
    } catch (error) {
      console.error('Error saving special events:', error);
      throw error;
    }
  }

  /**
   * Save processed data
   * @param sessionId The ID of the session
   * @param assetPositions The asset positions to save
   * @param monthlyResults The monthly results to save
   * @param incomeRecords The income records to save
   * @returns A promise that resolves when the processed data is saved
   */
  async saveProcessedData(
    sessionId: string,
    assetPositions: AssetPosition[],
    monthlyResults: MonthlyResult[],
    incomeRecords: IncomeRecord[]
  ): Promise<void> {
    try {
      // Initialize DB if needed
      await this.initDB();

      if (!this.db) {
        throw new Error('Database not initialized');
      }

      // Create a single transaction for the entire operation
      const transaction = this.db.transaction(this.PROCESSED_DATA_STORE, 'readwrite');
      const store = transaction.objectStore(this.PROCESSED_DATA_STORE);

      // Save processed data
      return new Promise((resolve, reject) => {
        const request = store.put({
          sessionId,
          assetPositions,
          monthlyResults,
          incomeRecords
        });

        // Handle request success
        request.onsuccess = () => {
          // Don't resolve here, wait for transaction to complete
        };

        request.onerror = event => {
          console.error('Error saving processed data:', event);
          reject(new Error('Error saving processed data'));
        };

        // Handle transaction completion
        transaction.oncomplete = () => {
          this.updateSessionStatus(sessionId, SessionStatus.PROCESSED).then(resolve).catch(reject);
        };

        transaction.onerror = event => {
          console.error('Transaction error:', event);
          reject(new Error('Transaction error'));
        };
      });
    } catch (error) {
      console.error('Error saving processed data:', error);
      throw error;
    }
  }

  /**
   * Save a declaration
   * @param sessionId The ID of the session
   * @param declaration The declaration to save
   * @returns A promise that resolves when the declaration is saved
   */
  async saveDeclaration(sessionId: string, declaration: IRPFDeclaration): Promise<void> {
    try {
      // Initialize DB if needed
      await this.initDB();

      if (!this.db) {
        throw new Error('Database not initialized');
      }

      // Create a single transaction for the entire operation
      const transaction = this.db.transaction(this.DECLARATIONS_STORE, 'readwrite');
      const store = transaction.objectStore(this.DECLARATIONS_STORE);

      // Save declaration
      return new Promise((resolve, reject) => {
        const request = store.put({
          sessionId,
          declaration,
        });

        // Handle request success
        request.onsuccess = () => {
          // Don't resolve here, wait for transaction to complete
        };

        request.onerror = event => {
          console.error('Error saving declaration:', event);
          reject(new Error('Error saving declaration'));
        };

        // Handle transaction completion
        transaction.oncomplete = () => {
          this.updateSessionStatus(sessionId, SessionStatus.GENERATED).then(resolve).catch(reject);
        };

        transaction.onerror = event => {
          console.error('Transaction error:', event);
          reject(new Error('Transaction error'));
        };
      });
    } catch (error) {
      console.error('Error saving declaration:', error);
      throw error;
    }
  }

  /**
   * Get all sessions
   * @returns A promise that resolves to an array of sessions
   */
  async getSessions(): Promise<StoredSession[]> {
    try {
      const store = await this.getStore(this.SESSIONS_STORE);

      return new Promise((resolve, reject) => {
        const request = store.getAll();

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(new Error('Error getting sessions'));
      });
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
      // Get session
      const session = await this.getSession(sessionId);

      if (!session) {
        return null;
      }

      // Get transactions
      const transactions = await this.getTransactions(sessionId);

      // Get special events
      const specialEvents = await this.getSpecialEvents(sessionId);

      // Get processed data
      const processedData = await this.getProcessedData(sessionId);

      // Get declaration
      const declaration = await this.getDeclaration(sessionId);

      return {
        sessionId,
        transactions,
        specialEvents,
        processedData: processedData
          ? {
              assetPositions: processedData.assetPositions,
              monthlyResults: processedData.monthlyResults,
              incomeRecords: processedData.incomeRecords,
            }
          : undefined,
        generatedDeclaration: declaration ? declaration.declaration : undefined
      };
    } catch (error) {
      console.error('Error getting session data:', error);
      throw error;
    }
  }

  /**
   * Save original DBK file content
   * @param sessionId The ID of the session
   * @param content The original DBK file content
   * @returns A promise that resolves when the content is saved
   */
  async saveOriginalDBK(sessionId: string, content: string): Promise<void> {
    try {
      console.log(`IndexedDBStorage: Saving original DBK file for session ${sessionId}`);

      // Initialize DB if needed
      await this.initDB();

      if (!this.db) {
        throw new Error('Database not initialized');
      }

      // Create a single transaction for the entire operation
      const transaction = this.db.transaction(this.ORIGINAL_DBK_STORE, 'readwrite');
      const store = transaction.objectStore(this.ORIGINAL_DBK_STORE);

      // Save original DBK content
      return new Promise((resolve, reject) => {
        const request = store.put({
          sessionId,
          content
        });

        // Handle request success
        request.onsuccess = () => {
          console.log(`IndexedDBStorage: Original DBK file saved successfully`);
          // Don't resolve here, wait for transaction to complete
        };

        request.onerror = event => {
          console.error('Error saving original DBK file:', event);
          reject(new Error('Error saving original DBK file'));
        };

        // Handle transaction completion
        transaction.oncomplete = () => {
          console.log(`IndexedDBStorage: Original DBK file save transaction completed`);
          resolve();
        };

        transaction.onerror = event => {
          console.error('Transaction error:', event);
          reject(new Error('Transaction error'));
        };
      });
    } catch (error) {
      console.error('Error saving original DBK file:', error);
      throw error;
    }
  }

  /**
   * Get original DBK file content
   * @param sessionId The ID of the session
   * @returns A promise that resolves to the original DBK file content or null if not found
   */
  async getOriginalDBK(sessionId: string): Promise<string | null> {
    try {
      console.log(`IndexedDBStorage: Getting original DBK file for session ${sessionId}`);

      const store = await this.getStore(this.ORIGINAL_DBK_STORE);

      return new Promise((resolve, reject) => {
        const request = store.get(sessionId);

        request.onsuccess = () => {
          if (request.result) {
            console.log(`IndexedDBStorage: Original DBK file found for session ${sessionId}`);
            resolve(request.result.content);
          } else {
            console.log(`IndexedDBStorage: No original DBK file found for session ${sessionId}`);
            resolve(null);
          }
        };

        request.onerror = event => {
          console.error('Error getting original DBK file:', event);
          reject(new Error('Error getting original DBK file'));
        };
      });
    } catch (error) {
      console.error('Error getting original DBK file:', error);
      throw error;
    }
  }

  /**
   * Delete original DBK file
   * @param sessionId The ID of the session
   * @returns A promise that resolves when the original DBK file is deleted
   */
  private async deleteOriginalDBK(sessionId: string): Promise<void> {
    try {
      const store = await this.getStore(this.ORIGINAL_DBK_STORE, 'readwrite');

      return new Promise((resolve, reject) => {
        const request = store.delete(sessionId);

        request.onsuccess = () => resolve();
        request.onerror = () => reject(new Error('Error deleting original DBK file'));
      });
    } catch (error) {
      console.error('Error deleting original DBK file:', error);
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
      // Delete session
      const sessionStore = await this.getStore(this.SESSIONS_STORE, 'readwrite');

      await new Promise<void>((resolve, reject) => {
        const request = sessionStore.delete(sessionId);

        request.onsuccess = () => resolve();
        request.onerror = () => reject(new Error('Error deleting session'));
      });

      // Delete transactions
      await this.deleteTransactions(sessionId);

      // Delete special events
      await this.deleteSpecialEvents(sessionId);

      // Delete processed data
      await this.deleteProcessedData(sessionId);

      // Delete declaration
      await this.deleteDeclaration(sessionId);

      // Delete original DBK file
      await this.deleteOriginalDBK(sessionId);
    } catch (error) {
      console.error('Error deleting session:', error);
      throw error;
    }
  }

  /**
   * Get a session
   * @param sessionId The ID of the session
   * @returns A promise that resolves to the session
   */
  private async getSession(sessionId: string): Promise<StoredSession | null> {
    try {
      const store = await this.getStore(this.SESSIONS_STORE);

      return new Promise((resolve, reject) => {
        const request = store.get(sessionId);

        request.onsuccess = () => resolve(request.result || null);
        request.onerror = () => reject(new Error('Error getting session'));
      });
    } catch (error) {
      console.error('Error getting session:', error);
      throw error;
    }
  }

  /**
   * Get transactions
   * @param sessionId The ID of the session
   * @returns A promise that resolves to an array of transactions
   */
  private async getTransactions(sessionId: string): Promise<Transaction[]> {
    try {
      const store = await this.getStore(this.TRANSACTIONS_STORE);
      const index = store.index('sessionId');

      return new Promise((resolve, reject) => {
        const request = index.getAll(sessionId);

        request.onsuccess = () => {
          // Remove sessionId and id from transactions
          const transactions = request.result.map(
            ({ sessionId, id, ...transaction }) => transaction
          );
          resolve(transactions);
        };

        request.onerror = () => reject(new Error('Error getting transactions'));
      });
    } catch (error) {
      console.error('Error getting transactions:', error);
      throw error;
    }
  }

  /**
   * Get special events
   * @param sessionId The ID of the session
   * @returns A promise that resolves to an array of special events
   */
  private async getSpecialEvents(sessionId: string): Promise<SpecialEvent[]> {
    try {
      const store = await this.getStore(this.SPECIAL_EVENTS_STORE);
      const index = store.index('sessionId');

      return new Promise((resolve, reject) => {
        const request = index.getAll(sessionId);

        request.onsuccess = () => {
          // Remove sessionId and id from special events
          const specialEvents = request.result.map(({ sessionId, id, ...event }) => event);
          resolve(specialEvents);
        };

        request.onerror = () => reject(new Error('Error getting special events'));
      });
    } catch (error) {
      console.error('Error getting special events:', error);
      throw error;
    }
  }

  /**
   * Get processed data
   * @param sessionId The ID of the session
   * @returns A promise that resolves to the processed data
   */
  private async getProcessedData(sessionId: string): Promise<{
    assetPositions: AssetPosition[];
    monthlyResults: MonthlyResult[];
    incomeRecords: IncomeRecord[];
  } | null> {
    try {
      const store = await this.getStore(this.PROCESSED_DATA_STORE);

      return new Promise((resolve, reject) => {
        const request = store.get(sessionId);

        request.onsuccess = () => resolve(request.result || null);
        request.onerror = () => reject(new Error('Error getting processed data'));
      });
    } catch (error) {
      console.error('Error getting processed data:', error);
      throw error;
    }
  }

  /**
   * Get a declaration
   * @param sessionId The ID of the session
   * @returns A promise that resolves to the declaration
   */
  private async getDeclaration(
    sessionId: string
  ): Promise<{ declaration: IRPFDeclaration } | null> {
    try {
      const store = await this.getStore(this.DECLARATIONS_STORE);

      return new Promise((resolve, reject) => {
        const request = store.get(sessionId);

        request.onsuccess = () => resolve(request.result || null);
        request.onerror = () => reject(new Error('Error getting declaration'));
      });
    } catch (error) {
      console.error('Error getting declaration:', error);
      throw error;
    }
  }

  /**
   * Delete transactions
   * @param sessionId The ID of the session
   * @returns A promise that resolves when the transactions are deleted
   */
  private async deleteTransactions(sessionId: string): Promise<void> {
    try {
      const store = await this.getStore(this.TRANSACTIONS_STORE, 'readwrite');
      const index = store.index('sessionId');

      return new Promise((resolve, reject) => {
        const request = index.openCursor(sessionId);

        request.onsuccess = event => {
          const cursor = (event.target as IDBRequest).result as IDBCursorWithValue;

          if (cursor) {
            cursor.delete();
            cursor.continue();
          } else {
            resolve();
          }
        };

        request.onerror = () => reject(new Error('Error deleting transactions'));
      });
    } catch (error) {
      console.error('Error deleting transactions:', error);
      throw error;
    }
  }

  /**
   * Delete special events
   * @param sessionId The ID of the session
   * @returns A promise that resolves when the special events are deleted
   */
  private async deleteSpecialEvents(sessionId: string): Promise<void> {
    try {
      const store = await this.getStore(this.SPECIAL_EVENTS_STORE, 'readwrite');
      const index = store.index('sessionId');

      return new Promise((resolve, reject) => {
        const request = index.openCursor(sessionId);

        request.onsuccess = event => {
          const cursor = (event.target as IDBRequest).result as IDBCursorWithValue;

          if (cursor) {
            cursor.delete();
            cursor.continue();
          } else {
            resolve();
          }
        };

        request.onerror = () => reject(new Error('Error deleting special events'));
      });
    } catch (error) {
      console.error('Error deleting special events:', error);
      throw error;
    }
  }

  /**
   * Delete processed data
   * @param sessionId The ID of the session
   * @returns A promise that resolves when the processed data is deleted
   */
  private async deleteProcessedData(sessionId: string): Promise<void> {
    try {
      const store = await this.getStore(this.PROCESSED_DATA_STORE, 'readwrite');

      return new Promise((resolve, reject) => {
        const request = store.delete(sessionId);

        request.onsuccess = () => resolve();
        request.onerror = () => reject(new Error('Error deleting processed data'));
      });
    } catch (error) {
      console.error('Error deleting processed data:', error);
      throw error;
    }
  }

  /**
   * Delete a declaration
   * @param sessionId The ID of the session
   * @returns A promise that resolves when the declaration is deleted
   */
  private async deleteDeclaration(sessionId: string): Promise<void> {
    try {
      const store = await this.getStore(this.DECLARATIONS_STORE, 'readwrite');

      return new Promise((resolve, reject) => {
        const request = store.delete(sessionId);

        request.onsuccess = () => resolve();
        request.onerror = () => reject(new Error('Error deleting declaration'));
      });
    } catch (error) {
      console.error('Error deleting declaration:', error);
      throw error;
    }
  }

  /**
   * Update a session status
   * @param sessionId The ID of the session
   * @param status The new status
   * @returns A promise that resolves when the session status is updated
   */
  private async updateSessionStatus(sessionId: string, status: SessionStatus): Promise<void> {
    try {
      console.log(`IndexedDBStorage: Updating session status for ${sessionId} to ${status}`);

      // Initialize DB if needed
      await this.initDB();

      if (!this.db) {
        throw new Error('Database not initialized');
      }

      // Get session first
      const session = await this.getSession(sessionId);

      if (!session) {
        console.error(`IndexedDBStorage: Session ${sessionId} not found`);
        throw new Error('Session not found');
      }

      console.log(`IndexedDBStorage: Current session status: ${session.status}`);

      // Create a single transaction for the entire operation
      const transaction = this.db.transaction(this.SESSIONS_STORE, 'readwrite');
      const store = transaction.objectStore(this.SESSIONS_STORE);

      // Create updated session object
      const updatedSession = {
        ...session,
        status,
        lastModified: new Date()
      };

      console.log(`IndexedDBStorage: Updating session with:`, updatedSession);

      // Update session status
      return new Promise((resolve, reject) => {
        const request = store.put(updatedSession);

        // Handle request success
        request.onsuccess = () => {
          console.log(`IndexedDBStorage: Session status update request successful`);
          // Don't resolve here, wait for transaction to complete
        };

        request.onerror = event => {
          console.error('Error updating session status:', event);
          reject(new Error('Error updating session status'));
        };

        // Handle transaction completion
        transaction.oncomplete = () => {
          console.log(`IndexedDBStorage: Session status update transaction completed`);
          resolve();
        };

        transaction.onerror = event => {
          console.error('Transaction error:', event);
          reject(new Error('Transaction error'));
        };
      });
    } catch (error) {
      console.error('Error updating session status:', error);
      throw error;
    }
  }
}
