// Use the newly created Reader for the 2025 (based on 2023 layout) structure
import { ReaderDBKFileEditor } from './LayoutDBK2025/ReaderDBKFileEditor';

import { TaxPayerInfo, IRPFDeclaration } from '../../core/domain/IRPFDeclaration';
import { AssetPosition } from '../../core/domain/AssetPosition';
import { AssetCategory, MarketType } from '../../core/domain/Transaction';

/**
 * Parser for DBK files
 */
export class DBKFileParser {
  // Regex para detectar quebras de linha (CRLF ou LF)
  // private lineEndingRegex = /\r?\n/;

  /**
   * Parse a DBK file
   * @param file The DBK file to parse
   * @returns A promise that resolves to an object containing the taxPayer info, optionally a declaration, and the original content
   */
  async parseDBKFile(file: File): Promise<{
    taxPayerInfo: TaxPayerInfo;
    declaration?: Partial<IRPFDeclaration>;
    originalContent: string;
  }> {
    try {
      // Read file content
      const content = await this.readFileContent(file);

      // Check if this is an official Receita Federal file
      if (content.startsWith('IRPF')) {
        // Official Receita Federal format - Use the new ReaderDBKFileEditor
        console.log('Parsing official DBK format using LayoutDBK2025 Reader...');
        const result = this.parseOfficialDBKWithReader(content);
        return {
          ...result, // Contains taxPayerInfo and declaration
          originalContent: content
        };
      }
      // console.log('Parsing standard/unknown DBK format...');
      // const result = this.parseStandardDBK(content);
      throw new Error(`Arquivo DBK não reconhecido ou não suportado`); // Retorna erro se não for reconhecido
    } catch (error) {
      console.error('Error parsing DBK file:', error);
      throw new Error(`Erro ao analisar arquivo DBK: ${(error as Error).message}`);
    }
  }

  /**
   * Read file content
   * @param file The file to read
   * @returns A promise that resolves to the file content
   */
  private async readFileContent(file: File): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = event => {
        if (event.target?.result) {
          resolve(event.target.result as string);
        } else {
          reject(new Error('Falha ao ler o conteúdo do arquivo'));
        }
      };

      reader.onerror = () => {
        reject(new Error('Erro ao ler o arquivo'));
      };

      // É importante definir a codificação correta, especialmente para arquivos brasileiros
      // ISO-8859-1 (Latin-1) é comum para arquivos legados. Teste com 'utf-8' também.
      reader.readAsText(file, 'ISO-8859-1'); // Ou 'windows-1252' ou 'utf-8'
    });
  }

  /**
   * Parse an official Receita Federal DBK file using ReaderDBKFileEditor
   * @param content The file content
   * @returns The taxpayer info and declaration
   */
  private parseOfficialDBKWithReader(content: string): {
    taxPayerInfo: TaxPayerInfo;
    declaration?: Partial<IRPFDeclaration>; // Declaration might be partial if not all records are parsed
  } {
    const reader = new ReaderDBKFileEditor(content); // Instantiate the new reader

    // Extract taxPayer info using reader methods
    const headerInfo = reader.getHeaderInfo(); // Assuming method names are the same
    const declaranteInfo = reader.getDadosDeclarante(); // Assuming method names are the same

    // The new reader already returns Date objects or null for date fields
    // No need for the separate parseDateStringToDate helper here

    const taxPayerInfo: TaxPayerInfo = {
      // Prioriza dados do registro 16, com fallback para o Header
      // Use nullish coalescing for cleaner fallbacks
      name: declaranteInfo?.nmNome ?? headerInfo?.nmNome ?? '',
      cpf: declaranteInfo?.nrCpf ?? headerInfo?.nrCpf ?? '',
      dateOfBirth: declaranteInfo?.dtNascim ?? headerInfo?.dtNascim ?? new Date(0), // Use Epoch if null
      address: {
        street: `${declaranteInfo?.tipLogra ?? ''} ${declaranteInfo?.nmLogra ?? ''}`.trim(),
        number: declaranteInfo?.nrNumero ?? '',
        complement: declaranteInfo?.nmComplem ?? '',
        neighborhood: declaranteInfo?.nmBairro ?? '',
        city: declaranteInfo?.nmMunicip ?? '',
        state: declaranteInfo?.sgUf ?? headerInfo?.sgUf ?? '',
        zipCode: declaranteInfo?.nrCep ?? headerInfo?.nrCep ?? '', // Assuming cep is string
        country:
          declaranteInfo?.cdPais ?? 'Brasil',
      },
      phone: `${declaranteInfo?.nrDddCelular ?? ''}${declaranteInfo?.nrCelular ?? ''}`,
      email: declaranteInfo?.nmEmail ?? '',
      occupation: declaranteInfo?.cdOcup ?? '', // Assuming codigoOcupacao is string
    };

    // Extract declaration data (parcialmente, como exemplo)
    const declaration: Partial<IRPFDeclaration> = {
      year: headerInfo?.anoBase ?? new Date().getFullYear() - 1,
      assetPositions: this.mapBensToAssetPositions(reader.getBensDireitos()),
      monthlyResults: [], // Implementar leitura dos registros 40, 41, 42, 43 se necessário
      incomeRecords: [], // Implementar leitura dos registros 21, 22, 23, 24, etc. se necessário
      totalTaxDue: headerInfo?.vrImpdevido ?? 0, // Assuming impostoDevido is number
      totalTaxWithheld: 0, // TODO: Implement summing from relevant records using the reader
      totalTaxToPay: 0, // Will be calculated below
      remainingLoss: 0, // TODO: Implement reading from Renda Variável records using the reader
      totalAssetsValue: reader
        .getBensDireitos() // Assuming method name is the same
        .reduce((sum, bem) => sum + (bem.valorAnoAtual ?? 0), 0), // Assuming valorAnoAtual is number
      totalIncome: 0, // TODO: Implement summing from relevant income records using the reader
      generationDate: new Date(), // Use current date as generation date
    };

    // Calculate totalTaxToPay (simple calculation for now)
    declaration.totalTaxToPay = Math.max(
      0,
      (declaration.totalTaxDue ?? 0) - (declaration.totalTaxWithheld ?? 0)
    );

    return {
      taxPayerInfo,
      declaration,
    };
  }

  /**
   * Mapeia os dados lidos do registro 27 para o formato AssetPosition.
   * @param bens - Array de objetos de bens lidos pelo ReaderDBKFileEditor.
   * @returns {AssetPosition[]} - Array de AssetPosition.
   * @private
   */
  // Assuming the ReaderDBKFileEditor returns objects compatible with the BemDireitoData interface used here
  private mapBensToAssetPositions(bens: any[]): AssetPosition[] {
    return bens.map((bem: any) => {
      // Add type annotation for bem if possible
      const category = this.getCategoryFromCode(String(bem.codigoBem || '')); // Ensure code is string

      // Attempt to extract quantity and calculate average price from description
      let quantity = 1;
      let averagePrice = bem.valorAnoAtual ?? 0;
      const desc = bem.discriminacao || ''; // Use discriminacao field
      
      const quantityMatch = desc.match(/(\d+)\s+QUOTAS|\s+(\d+)\s+AÇÕES/i); // Example regex
      if (quantityMatch) {
        const parsedQuantity = parseInt(quantityMatch[1] || quantityMatch[2], 10);
        if (!isNaN(parsedQuantity) && parsedQuantity > 0) {
          quantity = parsedQuantity;
          averagePrice = (bem.valorAnoAtual ?? 0) / quantity;
        }
      }

      const assetPosition: AssetPosition = {
        assetCode: String(bem.codigoBem || 'UNKNOWN'), // Ensure string
        assetName: desc || `Bem Código ${bem.codigoBem || 'N/A'}`,
        assetCategory: category,
        quantity: quantity,
        averagePrice: isNaN(averagePrice) ? 0 : averagePrice,
        totalCost: bem.valorAnoAtual ?? 0, // DBK usually has final value, not detailed cost
        currentValue: bem.valorAnoAtual ?? 0,
        acquisitionDate: bem.dataAquisicao ?? new Date(0), // Use date from reader or Epoch
        lastUpdateDate: new Date(), // Date of parsing
        marketType: MarketType.SPOT, // Assume SPOT market
        brokerName: bem.cpfCnpjRelacionado
          ? `Relacionado: ${bem.cpfCnpjRelacionado}`
          : 'Não informado', // Example using a different field
        brokerCode: bem.bancoCodigo || '000', // Example using bancoCodigo
        transactionsHistory: [], // History not available in DBK
      };

      return assetPosition;
    });
  }

  /**
   * Get asset category from code (helper for standard DBK)
   * @param code The code
   * @returns The asset category
   */
  private getCategoryFromCode(code: string): AssetCategory {
    // Mapeamento simplificado baseado nos códigos comuns do IRPF
    const codeNum = parseInt(code, 10);
    if (isNaN(codeNum)) return AssetCategory.OTHER;

    if (codeNum === 31) return AssetCategory.STOCK; // Ações (inclusive as listadas no exterior)
    if (codeNum === 32) return AssetCategory.STOCK; // Quotas ou quinhões de capital (pode ser Fundo, mas Ações é mais comum aqui)
    // if (codeNum === 41) return AssetCategory.SAVINGS; // Caderneta de poupança
    // if (codeNum === 45) return AssetCategory.FIXED_INCOME; // Aplicação de Renda Fixa (CDB, RDB, etc.)
    // if (codeNum === 46) return AssetCategory.FIXED_INCOME; // Aplicação em operações de SWAP
    if (codeNum === 47) return AssetCategory.STOCK; // Mercado futuro (ações, etc.) - Pode ser considerado Renda Variável
    // if (codeNum === 49) return AssetCategory.FIXED_INCOME; // Outras aplicações e investimentos
    // if (codeNum === 51) return AssetCategory.CHECKING_ACCOUNT; // Crédito em trânsito ou depósito bancário
    // if (codeNum === 52) return AssetCategory.FUND; // Fundo de Curto Prazo
    // if (codeNum === 71) return AssetCategory.FUND; // Fundo de Investimento Imobiliário (FII)
    // if (codeNum === 72) return AssetCategory.FUND; // Fundo de Investimento em Ações e Fundos Mútuos de Privatização - FGTS
    if (codeNum === 73) return AssetCategory.FII; // Fundo de Investimento Imobiliário (FII) - (Repetido?)
    // if (codeNum === 74) return AssetCategory.FUND; // Fundo de Investimento em Participações (FIP)...
    // if (codeNum === 79) return AssetCategory.FUND; // Outros fundos
    // if (codeNum === 91 || codeNum === 92 || codeNum === 93 || codeNum === 94)
    // return AssetCategory.CRYPTO; // Criptoativos
    if (codeNum === 99) return AssetCategory.OTHER; // Outros bens e direitos

    // Códigos de grupos (menos específicos)
    // if (code === '01') return AssetCategory.REAL_ESTATE;
    // if (code === '02') return AssetCategory.REAL_ESTATE; // Bens móveis
    if (code === '03') return AssetCategory.STOCK; // Participações Societárias
    // if (code === '04') return AssetCategory.FIXED_INCOME; // Aplicações e Investimentos
    if (code === '05') return AssetCategory.OTHER; // Créditos
    // if (code === '06') return AssetCategory.CHECKING_ACCOUNT; // Depósito à vista e Numerário
    // if (code === '07') return AssetCategory.FUND; // Fundos
    // if (code === '08') return AssetCategory.CRYPTO; // Criptoativos
    if (code === '99') return AssetCategory.OTHER; // Demais Bens e Direitos

    return AssetCategory.OTHER;
  }
}
