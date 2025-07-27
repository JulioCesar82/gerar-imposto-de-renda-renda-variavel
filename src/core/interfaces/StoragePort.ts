import { Transaction } from '../domain/Transaction';
import { SpecialEvent } from '../domain/SpecialEvent';
import {
  AssetPosition,
  MonthlyResult,
  IncomeRecord,
  ProcessedDataSummary
} from '../domain/AssetPosition';
import { IRPFDeclaration } from '../domain/IRPFDeclaration';

/**
 * Interface for storing and retrieving data
 */
export interface StoragePort {
  /**
   * Save a session
   * @param sessionId The ID of the session
   * @param description Optional description of the session
   * @param year The year of the session
   * @returns A promise that resolves when the session is saved
   */
  saveSession(sessionId: string, description: string | undefined, year: number): Promise<void>;

  /**
   * Save original DBK file content
   * @param sessionId The ID of the session
   * @param content The original DBK file content
   * @returns A promise that resolves when the content is saved
   */
  saveOriginalDBK(sessionId: string, content: string): Promise<void>;

  /**
   * Get original DBK file content
   * @param sessionId The ID of the session
   * @returns A promise that resolves to the original DBK file content or null if not found
   */
  getOriginalDBK(sessionId: string): Promise<string | null>;

  /**
   * Save transactions
   * @param sessionId The ID of the session
   * @param transactions The transactions to save
   * @returns A promise that resolves when the transactions are saved
   */
  saveTransactions(sessionId: string, transactions: Transaction[]): Promise<void>;

  /**
   * Save special events
   * @param sessionId The ID of the session
   * @param specialEvents The special events to save
   * @returns A promise that resolves when the special events are saved
   */
  saveSpecialEvents(sessionId: string, specialEvents: SpecialEvent[]): Promise<void>;

  /**
   * Save processed data
   * @param sessionId The ID of the session
   * @param assetPositions The asset positions to save
   * @param monthlyResults The monthly results to save
   * @param incomeRecords The income records to save
   * @returns A promise that resolves when the processed data is saved
   */
  saveProcessedData(
    sessionId: string,
    assetPositions: AssetPosition[],
    monthlyResults: MonthlyResult[],
    incomeRecords: IncomeRecord[]
  ): Promise<void>;

  /**
   * Save a declaration
   * @param sessionId The ID of the session
   * @param declaration The declaration to save
   * @returns A promise that resolves when the declaration is saved
   */
  saveDeclaration(sessionId: string, declaration: IRPFDeclaration): Promise<void>;

  /**
   * Get all sessions
   * @returns A promise that resolves to an array of sessions
   */
  getSessions(): Promise<StoredSession[]>;

  /**
   * Get a session by ID
   * @param sessionId The ID of the session
   * @returns A promise that resolves to the session data
   */
  getSessionData(sessionId: string): Promise<StoredData | null>;

  /**
   * Delete a session
   * @param sessionId The ID of the session
   * @returns A promise that resolves when the session is deleted
   */
  deleteSession(sessionId: string): Promise<void>;
}

/**
 * Represents a stored session
 */
export interface StoredSession {
  id: string;
  createdAt: Date;
  lastModified: Date;
  year: number;
  description?: string;
  status: SessionStatus;
}

/**
 * Represents stored data
 */
export interface StoredData {
  sessionId: string;
  transactions: Transaction[];
  specialEvents: SpecialEvent[];
  initialPositions?: AssetPosition[];
  processedData?: ProcessedDataSummary;
  generatedDeclaration?: IRPFDeclaration;
}

/**
 * Status of a session
 */
export enum SessionStatus {
  DRAFT = "DRAFT",               // Rascunho (incompleto)
  PROCESSED = "PROCESSED",       // Processado
  GENERATED = "GENERATED",       // Arquivo gerado
  ARCHIVED = "ARCHIVED"          // Arquivado
}
