import { IRPFDeclaration, TaxPayerInfo } from '../domain/IRPFDeclaration';
import { ProcessedDataSummary } from '../../core/domain/AssetPosition';

/**
 * Interface for generating IRPF files
 */
export interface IRPFGeneratorPort {
  /**
   * Generate an IRPF declaration from asset positions, monthly results, and income records
   * @param taxPayerInfo The taxpayer information
   * @param year The year of the declaration
   * @param includeInitialPosition Whether to include the initial position
   * @returns A promise that resolves to an IRPF declaration
   */
  generateDeclaration(
    processedDataSummary: ProcessedDataSummary,
    taxPayerInfo: TaxPayerInfo,
    year: number
  ): Promise<IRPFDeclaration>;

  /**
   * Generate a file from an IRPF declaration
   * @param declaration The IRPF declaration to generate the file from
   * @param originalContent Optional original content to use as a base
   * @returns A promise that resolves to a Blob containing the file
   */
  generateFile(declaration: IRPFDeclaration, originalContent?: string): Promise<Blob>;
}
