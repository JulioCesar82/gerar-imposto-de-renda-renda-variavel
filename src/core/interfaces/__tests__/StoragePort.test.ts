import { StoragePort, StoredSession, StoredData, SessionStatus } from '../StoragePort';
import { Transaction } from '../../domain/Transaction';
import { SpecialEvent, SpecialEventType } from '../../domain/SpecialEvent';
import { AssetPosition, MonthlyResult, IncomeRecord } from '../../domain/AssetPosition';
import { IRPFDeclaration } from '../../domain/IRPFDeclaration';
import { AssetCategory, MarketType } from '../../domain/Transaction';

// Create a mock implementation of StoragePort for testing
class MockStorage implements StoragePort {
  
  private sessions: Map<string, StoredSession> = new Map();
  private data: Map<string, StoredData> = new Map();
  private originalDbk: Map<string, string> = new Map();

  async getOriginalDBK(sessionId: string): Promise<string | null> {
    return this.originalDbk.get(sessionId) || null;
  }

  async saveOriginalDBK(sessionId: string, content: string): Promise<void> {
    this.originalDbk.set(sessionId, content);
  }

  async getSessions(): Promise<StoredSession[]> {
    return Array.from(this.sessions.values());
  }

  async getSessionData(sessionId: string): Promise<StoredData | null> {
    return this.data.get(sessionId) || null;
  }

  async saveSession(sessionId: string, description?: string, year?: number): Promise<void> {
    this.sessions.set(sessionId, {
      id: sessionId,
      description: description || '',
      year: year || new Date().getFullYear(),
      createdAt: new Date(),
      lastModified: new Date(),
      status: SessionStatus.DRAFT
    });

    if (!this.data.has(sessionId)) {
      this.data.set(sessionId, {
        sessionId,
        transactions: [],
        specialEvents: [],
        processedData: undefined,
        generatedDeclaration: undefined
      });
    }
  }

  async saveTransactions(sessionId: string, transactions: Transaction[]): Promise<void> {
    const data = this.data.get(sessionId);
    if (data) {
      data.transactions = transactions;
      this.data.set(sessionId, data);
    }

    const session = this.sessions.get(sessionId);
    if (session) {
      session.lastModified = new Date();
      session.status = SessionStatus.DRAFT;
      this.sessions.set(sessionId, session);
    }
  }

  async saveSpecialEvents(sessionId: string, specialEvents: SpecialEvent[]): Promise<void> {
    const data = this.data.get(sessionId);
    if (data) {
      data.specialEvents = specialEvents;
      this.data.set(sessionId, data);
    }

    const session = this.sessions.get(sessionId);
    if (session) {
      session.lastModified = new Date();
      this.sessions.set(sessionId, session);
    }
  }

  async saveProcessedData(
    sessionId: string,
    assetPositions: AssetPosition[],
    monthlyResults: MonthlyResult[],
    incomeRecords: IncomeRecord[]
  ): Promise<void> {
    const data = this.data.get(sessionId);
    if (data) {
      data.processedData = {
        assetPositions,
        monthlyResults,
        incomeRecords
      };
      this.data.set(sessionId, data);
    }

    const session = this.sessions.get(sessionId);
    if (session) {
      session.lastModified = new Date();
      session.status = SessionStatus.PROCESSED;
      this.sessions.set(sessionId, session);
    }
  }

  async saveDeclaration(sessionId: string, declaration: IRPFDeclaration): Promise<void> {
    const data = this.data.get(sessionId);
    if (data) {
      data.generatedDeclaration = declaration;
      this.data.set(sessionId, data);
    }

    const session = this.sessions.get(sessionId);
    if (session) {
      session.lastModified = new Date();
      session.status = SessionStatus.GENERATED;
      this.sessions.set(sessionId, session);
    }
  }

  async deleteSession(sessionId: string): Promise<void> {
    this.sessions.delete(sessionId);
    this.data.delete(sessionId);
  }
}

describe('StoragePort', () => {
  let storage: StoragePort;
  const sessionId = 'test-session-id';
  const description = 'Test Session';
  const year = 2023;

  beforeEach(() => {
    storage = new MockStorage();
  });

  describe('Session management', () => {
    it('should save and retrieve a session', async () => {
      await storage.saveSession(sessionId, description, year);
      
      const sessions = await storage.getSessions();
      expect(sessions).toHaveLength(1);
      expect(sessions[0].id).toBe(sessionId);
      expect(sessions[0].description).toBe(description);
      expect(sessions[0].year).toBe(year);
      expect(sessions[0].status).toBe(SessionStatus.DRAFT);
    });

    it('should delete a session', async () => {
      await storage.saveSession(sessionId, description, year);
      await storage.deleteSession(sessionId);
      
      const sessions = await storage.getSessions();
      expect(sessions).toHaveLength(0);
      
      const sessionData = await storage.getSessionData(sessionId);
      expect(sessionData).toBeNull();
    });
  });

  describe('Data storage', () => {
    it('should save and retrieve transactions', async () => {
      await storage.saveSession(sessionId, description, year);
      
      const transactions: Transaction[] = [
        {
          date: new Date('2023-01-15'),
          year: 2023,
          month: 1,
          type: 'buy',
          marketType: MarketType.SPOT,
          assetCode: 'PETR4',
          assetName: 'PETROBRAS PN',
          quantity: 100,
          unitPrice: 25.5,
          totalValue: 2550,
          fees: 10,
          taxes: 5,
          netValue: 2565,
          assetCategory: AssetCategory.STOCK,
          brokerName: 'XP Investimentos',
          brokerCode: '102'
        }
      ];
      
      await storage.saveTransactions(sessionId, transactions);
      
      const sessionData = await storage.getSessionData(sessionId);
      expect(sessionData).not.toBeNull();
      expect(sessionData?.transactions).toHaveLength(1);
      expect(sessionData?.transactions[0].assetCode).toBe('PETR4');
    });

    it('should save and retrieve special events', async () => {
      await storage.saveSession(sessionId, description, year);
      
      const specialEvents: SpecialEvent[] = [
        {
          date: new Date('2023-01-15'),
          year: 2023,
          month: 1,
          type: SpecialEventType.DIVIDEND,
          assetCode: 'PETR4',
          assetName: 'PETROBRAS PN',
          quantity: 100,
          unitPrice: 2.5,
          totalValue: 250,
          fees: 0,
          taxes: 37.5,
          netValue: 212.5,
          assetCategory: 'STOCK',
          brokerName: 'XP Investimentos',
          brokerCode: '102'
        }
      ];
      
      await storage.saveSpecialEvents(sessionId, specialEvents);
      
      const sessionData = await storage.getSessionData(sessionId);
      expect(sessionData).not.toBeNull();
      expect(sessionData?.specialEvents).toHaveLength(1);
      expect(sessionData?.specialEvents[0].assetCode).toBe('PETR4');
    });

    it('should save and retrieve processed data', async () => {
      await storage.saveSession(sessionId, description, year);
      
      const assetPositions: AssetPosition[] = [
        {
          assetCode: 'PETR4',
          assetName: 'PETROBRAS PN',
          assetCategory: AssetCategory.STOCK,
          marketType: MarketType.SPOT,
          quantity: 100,
          averagePrice: 25.5,
          totalCost: 2550,
          currentPrice: 27.5,
          currentValue: 2750,
          acquisitionDate: new Date('2023-01-15'),
          lastUpdateDate: new Date('2023-12-31'),
          brokerName: 'XP Investimentos',
          brokerCode: '102',
          transactionsHistory: []
        }
      ];
      
      const monthlyResults: MonthlyResult[] = [
        {
          month: 2,
          year: 2023,
          totalSalesValue: 1375,
          totalProfit: 100,
          totalLoss: 12,
          netResult: 88,
          compensatedLoss: 0,
          taxableProfit: 88,
          taxRate: 15,
          taxDue: 13.2,
          taxWithheld: 4,
          taxToPay: 9.2,
          remainingLoss: 0,
          tradeResults: []
        }
      ];
      
      const incomeRecords: IncomeRecord[] = [
        {
          assetCode: 'PETR4',
          assetName: 'PETROBRAS PN',
          assetCategory: 'STOCK',
          incomeType: 'DIVIDEND',
          date: new Date('2023-01-15'),
          month: 1,
          year: 2023,
          grossValue: 250,
          taxWithheld: 37.5,
          netValue: 212.5,
          brokerName: 'XP Investimentos',
          brokerCode: '102'
        }
      ];
      
      await storage.saveProcessedData(sessionId, assetPositions, monthlyResults, incomeRecords);
      
      const sessionData = await storage.getSessionData(sessionId);
      expect(sessionData).not.toBeNull();
      expect(sessionData?.processedData).toBeDefined();
      expect(sessionData?.processedData?.assetPositions).toHaveLength(1);
      expect(sessionData?.processedData?.monthlyResults).toHaveLength(1);
      expect(sessionData?.processedData?.incomeRecords).toHaveLength(1);
      
      // Check session status
      const sessions = await storage.getSessions();
      expect(sessions[0].status).toBe(SessionStatus.PROCESSED);
    });
  });

  describe('SessionStatus enum', () => {
    it('should have the correct values', () => {
      expect(SessionStatus.DRAFT).toBe('DRAFT');
      expect(SessionStatus.PROCESSED).toBe('PROCESSED');
      expect(SessionStatus.GENERATED).toBe('GENERATED');
      expect(SessionStatus.ARCHIVED).toBe('ARCHIVED');
    });
  });
});
