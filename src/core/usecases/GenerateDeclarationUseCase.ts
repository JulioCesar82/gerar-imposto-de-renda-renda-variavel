import { IRPFGeneratorPort } from '../interfaces/IRPFGeneratorPort';
import { StoragePort } from '../interfaces/StoragePort';
import { IRPFDeclaration, TaxPayerInfo } from '../domain/IRPFDeclaration';
import { AssetProcessorPort } from '../interfaces/AssetProcessorPort';

/**
 * Use case for generating IRPF declarations
 */
export class GenerateDeclarationUseCase {
  constructor(
    // private irpfGenerator: IRPFGeneratorPort,
    private assetProcessor: AssetProcessorPort,
    private storage: StoragePort
  ) {}

  /**
   * Generate an IRPF declaration and save it to storage
   * @param sessionId The ID of the session
   * @param taxPayerInfo The taxpayer information
   * @param includeInitialPosition Whether to include the initial position
   * @returns A promise that resolves to the generated declaration
   */
  async execute(
    sessionId: string,
    taxPayerInfo: TaxPayerInfo,
    includeInitialPosition: boolean,
    generator: IRPFGeneratorPort,
    year: number
  ): Promise<IRPFDeclaration> {
    try {
      // Get session data
      const sessionData = await this.storage.getSessionData(sessionId);
      if (!sessionData) {
        console.error(`ProcessAssetsUseCase: Session data not found for ${sessionId}`);
        throw new Error('Dados da sessão não encontrados');
      }

      const processedDataSummary = await this.assetProcessor.analyzeTransactionsAndSpecialEvents(
        sessionData.transactions,
        sessionData.specialEvents,
        year,
        includeInitialPosition
      );

      // Generate declaration
      const declaration = await generator.generateDeclaration(
        processedDataSummary,
        taxPayerInfo,
        year
      );

      // Save declaration
      await this.storage.saveDeclaration(sessionId, declaration);

      return declaration;
    } catch (error) {
      console.error('Error generating declaration:', error);
      throw error;
    }
  }

  /**
   * Generate a file from a declaration
   * @param declaration The declaration to generate the file from
   * @param fileType The type of file to generate ('DEC' or 'DBK')
   * @param generator Optional generator to use (defaults to the injected irpfGenerator)
   * @param sessionId Optional session ID to retrieve original DBK content
   * @returns A promise that resolves to a Blob containing the file
   */
  async generateFile(
    declaration: IRPFDeclaration,
    generator: IRPFGeneratorPort,
    sessionId?: string
  ): Promise<Blob> {
    try {
      // const effectiveGenerator = generator || this.irpfGenerator;

      // If we have a session ID, try to retrieve the original DBK content
      let originalContent: string | undefined;
      if (sessionId) {
        try {
          console.log('GenerateDeclarationUseCase: Retrieving original DBK content for session', sessionId);
          originalContent = (await this.storage.getOriginalDBK(sessionId)) || undefined;
          if (originalContent) {
            console.log('GenerateDeclarationUseCase: Original DBK content found');
          } else {
            console.log('GenerateDeclarationUseCase: No original DBK content found');
          }
        } catch (error) {
          console.error('Error retrieving original DBK content:', error);
          // Continue without original content
        }
      }

      return await generator.generateFile(declaration, originalContent);
    } catch (error) {
      console.error(`Error generating file:`, error);
      throw error;
    }
  }

  /**
   * Get a declaration from storage
   * @param sessionId The ID of the session
   * @returns A promise that resolves to the declaration
   */
  async getDeclaration(sessionId: string): Promise<IRPFDeclaration | null> {
    try {
      const sessionData = await this.storage.getSessionData(sessionId);
      return sessionData?.generatedDeclaration || null;
    } catch (error) {
      console.error('Error getting declaration:', error);
      throw error;
    }
  }
}
