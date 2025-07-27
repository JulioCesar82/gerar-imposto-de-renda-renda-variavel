import { format, subYears } from 'date-fns';

// --- Interfaces based on Layout (Simplified for Generator) ---

interface FieldDefinition {
  name: string;
  start: number; // 1-based index
  end: number;
  size: number;
  decimals?: number;
  format: 'N' | 'NN' | 'A' | 'C' | 'I'; // Numeric, Numeric Negative, Alpha, Alphanumeric, Boolean (custom)
}

interface RecordDefinition {
  prefix: string;
  fields: FieldDefinition[];
  totalLength: number;
}

// --- Layout Definition (Partial, based on docs/IRPF-LeiauteTXT-2023.txt) ---

const layout: { [key: string]: RecordDefinition } = {
  IR: {
    prefix: 'IR',
    totalLength: 1203,
    fields: [
      { name: 'SISTEMA', start: 1, end: 8, size: 8, format: 'C' },
      { name: 'EXERCICIO', start: 9, end: 12, size: 4, format: 'N' },
      { name: 'ANO_BASE', start: 13, end: 16, size: 4, format: 'N' },
      { name: 'CODIGO_RECNET', start: 17, end: 20, size: 4, format: 'N' },
      { name: 'IN_RETIFICADORA', start: 21, end: 21, size: 1, format: 'C' },
      { name: 'NR_CPF', start: 22, end: 32, size: 11, format: 'C' },
      { name: 'NI_FILLER', start: 33, end: 35, size: 3, format: 'C' },
      { name: 'TIPO_NI', start: 36, end: 36, size: 1, format: 'N' },
      { name: 'NR_VERSAO', start: 37, end: 39, size: 3, format: 'N' },
      { name: 'NM_NOME', start: 40, end: 99, size: 60, format: 'A' },
      { name: 'SG_UF', start: 100, end: 101, size: 2, format: 'A' },
      { name: 'NR_HASH', start: 102, end: 111, size: 10, format: 'N' },
      { name: 'IN_CERTIFICAVEL', start: 112, end: 112, size: 1, format: 'N' },
      { name: 'DT_NASCIM', start: 113, end: 120, size: 8, format: 'N' },
      { name: 'IN_COMPLETA', start: 121, end: 121, size: 1, format: 'C' },
      { name: 'IN_RESULTADO_IMPOSTO', start: 122, end: 122, size: 1, format: 'C' },
      { name: 'IN_GERADA', start: 123, end: 123, size: 1, format: 'C' },
      { name: 'NR_RECIBO_ULTIMA_DEC_EX_ATUAL', start: 124, end: 133, size: 10, format: 'C' },
      { name: 'FILLER_134', start: 134, end: 134, size: 1, format: 'C' },
      { name: 'NOME_SO', start: 135, end: 148, size: 14, format: 'C' },
      { name: 'VERSAO_SO', start: 149, end: 155, size: 7, format: 'C' },
      { name: 'VERSAO_JVM', start: 156, end: 164, size: 9, format: 'C' },
      { name: 'NR_RECIBO_DECLARACAO_TRANSMITIDA', start: 165, end: 174, size: 10, format: 'C' },
      { name: 'CD_MUNICIP', start: 175, end: 178, size: 4, format: 'N' },
      { name: 'NR_CONJ', start: 179, end: 189, size: 11, format: 'C' },
      { name: 'IN_OBRIGAT_ENTREGA', start: 190, end: 190, size: 1, format: 'C' },
      { name: 'VR_IMPDEVIDO', start: 191, end: 203, size: 13, decimals: 2, format: 'N' },
      { name: 'NR_RECIBO_ULTIMA_DEC_EX_ANTERIOR', start: 204, end: 213, size: 10, format: 'C' },
      { name: 'IN_SEGURANCA', start: 214, end: 214, size: 1, format: 'N' },
      { name: 'IN_IMPOSTO_PAGO', start: 215, end: 216, size: 2, format: 'N' },
      { name: 'IN_IMPOSTO_ANTECIPADO', start: 217, end: 217, size: 1, format: 'N' },
      { name: 'IN_MUDA_ENDERECO', start: 218, end: 218, size: 1, format: 'N' },
      { name: 'NR_CEP', start: 219, end: 226, size: 8, format: 'N' },
      { name: 'IN_DEBITO_PRIMEIRA_QUOTA', start: 227, end: 227, size: 1, format: 'N' },
      { name: 'NR_BANCO', start: 228, end: 230, size: 3, format: 'N' },
      { name: 'NR_AGENCIA', start: 231, end: 234, size: 4, format: 'N' },
      { name: 'IN_SOBREPARTILHA', start: 235, end: 235, size: 1, format: 'C' },
      { name: 'DATA_TRANSITO_JULGADO_LAVRATURA', start: 236, end: 243, size: 8, format: 'N' },
      { name: 'VR__SOMA_IMPOSTO_PAGAR', start: 244, end: 256, size: 13, decimals: 2, format: 'N' },
      // ... (add remaining IR fields)
      { name: 'NR_CONTROLE', start: 1194, end: 1203, size: 10, format: 'N' },
    ],
  },
  '16': {
    prefix: '16',
    totalLength: 881,
    fields: [
      { name: 'NR_REG', start: 1, end: 2, size: 2, format: 'N' },
      { name: 'NR_CPF', start: 3, end: 13, size: 11, format: 'C' },
      { name: 'NM_NOME', start: 14, end: 73, size: 60, format: 'A' },
      { name: 'TIP_LOGRA', start: 74, end: 88, size: 15, format: 'A' },
      { name: 'NM_LOGRA', start: 89, end: 128, size: 40, format: 'C' },
      { name: 'NR_NUMERO', start: 129, end: 134, size: 6, format: 'C' },
      { name: 'NM_COMPLEM', start: 135, end: 155, size: 21, format: 'C' },
      { name: 'NM_BAIRRO', start: 156, end: 174, size: 19, format: 'C' },
      { name: 'NR_CEP', start: 175, end: 183, size: 9, format: 'C' }, // Note: Size 9 in layout
      { name: 'CD_MUNICIP', start: 184, end: 187, size: 4, format: 'N' },
      { name: 'NM_MUNICIP', start: 188, end: 227, size: 40, format: 'C' },
      { name: 'SG_UF', start: 228, end: 229, size: 2, format: 'A' },
      { name: 'CD_EX', start: 230, end: 232, size: 3, format: 'C' },
      { name: 'CD_PAIS', start: 233, end: 235, size: 3, format: 'C' },
      { name: 'NM_EMAIL', start: 236, end: 325, size: 90, format: 'C' },
      { name: 'NR_NITPISPASEP', start: 326, end: 336, size: 11, format: 'C' },
      { name: 'NR_CPF_CONJUGE', start: 337, end: 347, size: 11, format: 'C' },
      { name: 'NR_DDD_TELEFONE', start: 348, end: 351, size: 4, format: 'C' },
      { name: 'Filler_352', start: 352, end: 360, size: 9, format: 'C' },
      { name: 'DT_NASCIM', start: 361, end: 368, size: 8, format: 'N' },
      { name: 'NR_TITELEITOR', start: 369, end: 381, size: 13, format: 'C' },
      { name: 'CD_OCUP', start: 382, end: 384, size: 3, format: 'A' },
      { name: 'CD_NATUR', start: 385, end: 386, size: 2, format: 'A' },
      { name: 'NR_QUOTAS', start: 387, end: 387, size: 1, format: 'N' },
      { name: 'IN_COMPLETA', start: 388, end: 388, size: 1, format: 'C' },
      { name: 'IN_RETIFICADORA', start: 389, end: 389, size: 1, format: 'C' },
      { name: 'IN_GERADO', start: 390, end: 390, size: 1, format: 'C' },
      { name: 'IN_ENDERECO', start: 391, end: 391, size: 1, format: 'C' },
      { name: 'NR_CONTROLE_ORIGINAL', start: 392, end: 403, size: 12, format: 'C' },
      { name: 'NR_BANCO', start: 404, end: 406, size: 3, format: 'N' },
      { name: 'NR_AGENCIA', start: 407, end: 410, size: 4, format: 'N' },
      { name: 'IN_DOENCA_DEFICIENCIA', start: 411, end: 411, size: 1, format: 'C' },
      { name: 'IN_PREPREENCHIDA', start: 412, end: 412, size: 1, format: 'C' },
      { name: 'DT_DIA_UTIL_RECIBO', start: 413, end: 420, size: 8, format: 'N' },
      { name: 'Filler_421', start: 421, end: 425, size: 5, format: 'C' },
      { name: 'NR_DV_CONTA', start: 426, end: 427, size: 2, format: 'C' },
      { name: 'IN_DEBITO_AUTOM', start: 428, end: 428, size: 1, format: 'A' },
      { name: 'IN_DEBITO_PRIMEIRA_QUOTA', start: 429, end: 429, size: 1, format: 'N' },
      { name: 'NR_FONTE_PRINCIPAL', start: 430, end: 443, size: 14, format: 'C' },
      { name: 'NR_RECIBO_ULTIMA_DEC_ANO_ANTERIOR', start: 444, end: 453, size: 10, format: 'C' },
      { name: 'IN_TIPODECLARACAO', start: 454, end: 454, size: 1, format: 'C' },
      { name: 'NR_CPF_PROCURADOR', start: 455, end: 465, size: 11, format: 'C' },
      { name: 'NR_REGISTRO_PROFISSIONAL', start: 466, end: 485, size: 20, format: 'A' },
      { name: 'NR_DDD_CELULAR', start: 486, end: 487, size: 2, format: 'C' },
      { name: 'NR_CELULAR', start: 488, end: 496, size: 9, format: 'C' },
      { name: 'IN_CONJUGE', start: 497, end: 497, size: 1, format: 'C' },
      { name: 'NR_TELEFONE', start: 498, end: 508, size: 11, format: 'C' },
      { name: 'IN_TIPO_CONTA', start: 509, end: 509, size: 1, format: 'C' },
      { name: 'NR_CONTA', start: 510, end: 529, size: 20, format: 'C' },
      { name: 'NR_NUMERO_PROCESSO', start: 530, end: 546, size: 17, format: 'C' },
      { name: 'CPF_RESPONSAVEL', start: 547, end: 557, size: 11, format: 'C' },
      { name: 'NR_DATA_ORIGINAL_RETIFICADORA', start: 558, end: 565, size: 8, format: 'N' },
      { name: 'NR_HORA_ORIGINAL_RETIFICADORA', start: 566, end: 571, size: 6, format: 'N' },
      { name: 'TX_MENSAGEM_RECIBO', start: 572, end: 871, size: 300, format: 'C' },
      { name: 'NR_CONTROLE', start: 872, end: 881, size: 10, format: 'N' },
    ],
  },
  T9: {
    prefix: 'T9',
    totalLength: 449, // Adjust based on actual layout if different
    fields: [
      { name: 'NR_REG', start: 1, end: 2, size: 2, format: 'C' },
      { name: 'NR_CPF', start: 3, end: 13, size: 11, format: 'N' }, // Format N in doc, but CPF is usually C
      { name: 'QT_TOTAL', start: 14, end: 19, size: 6, format: 'N' },
      { name: 'QT_R16', start: 20, end: 24, size: 5, format: 'N' },
      { name: 'QT_R17', start: 25, end: 29, size: 5, format: 'N' },
      { name: 'QT_R18', start: 30, end: 34, size: 5, format: 'N' },
      { name: 'QT_R19', start: 35, end: 39, size: 5, format: 'N' },
      { name: 'QT_R20', start: 40, end: 44, size: 5, format: 'N' },
      { name: 'QT_R21', start: 45, end: 49, size: 5, format: 'N' },
      { name: 'QT_R22', start: 50, end: 54, size: 5, format: 'N' },
      { name: 'QT_R23', start: 55, end: 59, size: 5, format: 'N' },
      { name: 'QT_R24', start: 60, end: 64, size: 5, format: 'N' },
      { name: 'QT_R25', start: 65, end: 69, size: 5, format: 'N' },
      { name: 'QT_R26', start: 70, end: 74, size: 5, format: 'N' },
      { name: 'QT_R27', start: 75, end: 79, size: 5, format: 'N' },
      { name: 'QT_R28', start: 80, end: 84, size: 5, format: 'N' },
      // ... Add all QT_Rxx fields ...
      { name: 'QT_R92', start: 400, end: 404, size: 5, format: 'N' },
      // ... Fillers ...
      { name: 'NR_CONTROLE', start: 440, end: 449, size: 10, format: 'N' },
    ],
  },
  // ... Add definitions for other records (21, 22, 23, 24, 25, 26, 27, 28, etc.)
};

// --- Helper Functions ---

function generateRandomString(length: number): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ ';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

function generateRandomDigits(length: number): string {
  const digits = '0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += digits.charAt(Math.floor(Math.random() * digits.length));
  }
  return result;
}

function generateRandomCPF(): string {
    // Basic CPF format generation (doesn't calculate check digits)
    return generateRandomDigits(11);
}

function generateRandomCNPJ(): string {
    // Basic CNPJ format generation
    return generateRandomDigits(14);
}

function generateRandomDate(year: number): string {
  const month = Math.floor(Math.random() * 12) + 1;
  const day = Math.floor(Math.random() * 28) + 1; // Keep it simple, avoid month length issues
  return `${String(day).padStart(2, '0')}${String(month).padStart(2, '0')}${year}`;
}

function formatField(value: string | number | boolean | Date, definition: FieldDefinition): string {
  let stringValue = '';

  if (value instanceof Date) {
    stringValue = format(value, 'ddMMyyyy');
  } else {
    stringValue = String(value);
  }

  switch (definition.format) {
    case 'N': // Numeric, zero-padded
      if (definition.decimals) {
        const num = parseFloat(stringValue) || 0;
        stringValue = num.toFixed(definition.decimals).replace('.', '');
      }
      return stringValue.padStart(definition.size, '0');
    case 'NN': { // Numeric Negative, sign at start, zero-padded
        const numNN = parseFloat(stringValue) || 0;
        const isNegative = numNN < 0;
        let absValueStr = Math.abs(numNN).toFixed(definition.decimals ?? 0).replace('.', ''); // Added nullish coalescing for decimals
        absValueStr = absValueStr.padStart(definition.size - 1, '0');
        return (isNegative ? '-' : '+') + absValueStr; // Assuming '+' for positive in NN? Layout doc isn't explicit. Using '+' for consistency. Check real files if possible.
    }
    case 'A': // Alphabetic, space-padded right
      return stringValue.toUpperCase().padEnd(definition.size, ' ');
    case 'C': // Alphanumeric, space-padded right
      return stringValue.padEnd(definition.size, ' ');
    case 'I': // Boolean (custom interpretation: 'S'/'N')
      return value ? 'S' : 'N';
    default:
      return stringValue.padEnd(definition.size, ' ');
  }
}

function createRecordLine(recordPrefix: string, data: Record<string, any>): string {
  const definition = layout[recordPrefix];
  if (!definition) {
    throw new Error(`Layout definition not found for record prefix: ${recordPrefix}`);
  }

  let line = recordPrefix.padEnd(2, ' '); // Start with the prefix
  let currentPos = 3; // Start after prefix

  definition.fields.forEach(field => {
    // Fill gaps before the field starts (if any)
    if (field.start > currentPos) {
      line += ' '.repeat(field.start - currentPos);
    }

    const value = data[field.name] ?? getDefaultValue(field); // Use provided data or default
    const formattedValue = formatField(value, field);

    if (formattedValue.length !== field.size) {
        console.warn(`Formatted value length mismatch for ${recordPrefix}.${field.name}. Expected ${field.size}, got ${formattedValue.length}. Value: ${value}`);
        // Adjust length, though this might truncate data
        line += formattedValue.substring(0, field.size).padEnd(field.size, ' ');
    } else {
        line += formattedValue;
    }
    currentPos = field.end + 1;
  });

  // Pad the end of the line if necessary
  if (line.length < definition.totalLength) {
    line = line.padEnd(definition.totalLength, ' ');
  } else if (line.length > definition.totalLength) {
    console.warn(`Line length exceeds definition for ${recordPrefix}. Expected ${definition.totalLength}, got ${line.length}. Truncating.`);
    line = line.substring(0, definition.totalLength);
  }

  return line;
}

function getDefaultValue(field: FieldDefinition): string | number | boolean | Date {
    switch (field.format) {
        case 'N':
        case 'NN':
            return 0;
        case 'A':
        case 'C':
            return ''; // Will be space-padded by formatField
        case 'I':
            return false; // Will become 'N'
        default:
            return '';
    }
}

// --- Random Data Generation Logic ---

export class RandomDBKFileGenerator {
  private year: number;
  private baseYear: number;
  private recordCounts: Record<string, number> = {};

  constructor(year: number = new Date().getFullYear()) {
    this.year = year;
    this.baseYear = year - 1;
    this.resetCounts();
  }

  private resetCounts() {
    this.recordCounts = Object.keys(layout).reduce((acc, key) => {
      acc[key] = 0;
      return acc;
    }, {} as Record<string, number>);
    this.recordCounts['IR'] = 0; // Explicitly add IR if not in layout keys
    this.recordCounts['T9'] = 0; // Explicitly add T9 if not in layout keys
  }

  private incrementCount(recordPrefix: string) {
    if (this.recordCounts[recordPrefix] !== undefined) {
      this.recordCounts[recordPrefix]++;
    } else {
        // Handle prefixes like '16', '21' etc.
        const numericPrefix = recordPrefix.match(/^\d+$/);
        if (numericPrefix) {
            const key = `R${recordPrefix}`; // Match T9 format like QT_R16
             if (this.recordCounts[key] !== undefined) {
                 this.recordCounts[key]++;
             } else {
                 console.warn(`Record count key ${key} not found in T9 layout definition for prefix ${recordPrefix}`);
                 this.recordCounts[recordPrefix] = (this.recordCounts[recordPrefix] || 0) + 1; // Fallback
             }
        } else {
             console.warn(`Record count key not found for prefix ${recordPrefix}`);
             this.recordCounts[recordPrefix] = (this.recordCounts[recordPrefix] || 0) + 1; // Fallback
        }
    }
  }


  generateDeclaration(): string {
    this.resetCounts();
    const lines: string[] = [];
    const cpf = generateRandomCPF();
    const nome = `CONTRIBUINTE ${generateRandomString(15)}`.substring(0, 60);
    const isCompleta = Math.random() > 0.5;

    // --- Generate Header (IR) ---
    const headerData = {
      SISTEMA: 'IRPF    ',
      EXERCICIO: this.year,
      ANO_BASE: this.baseYear,
      CODIGO_RECNET: 3500, // Ajuste Anual (assuming)
      IN_RETIFICADORA: '0',
      NR_CPF: cpf,
      NI_FILLER: '   ',
      TIPO_NI: 1,
      NR_VERSAO: 100, // Example version
      NM_NOME: nome,
      SG_UF: 'SP',
      NR_HASH: generateRandomDigits(10), // Placeholder hash
      IN_CERTIFICAVEL: 0,
      DT_NASCIM: generateRandomDate(this.baseYear - 30),
      IN_COMPLETA: isCompleta ? 'S' : 'N',
      IN_RESULTADO_IMPOSTO: Math.floor(Math.random() * 4).toString(), // 0-3
      IN_GERADA: 'S',
      NR_RECIBO_ULTIMA_DEC_EX_ATUAL: ''.padEnd(10, ' '),
      FILLER_134: ' ',
      NOME_SO: 'WINDOWS 11'.padEnd(14, ' '),
      VERSAO_SO: '10.0'.padEnd(7, ' '),
      VERSAO_JVM: '11.0.15'.padEnd(9, ' '),
      NR_RECIBO_DECLARACAO_TRANSMITIDA: generateRandomDigits(10), // Placeholder
      CD_MUNICIP: 3550308, // Example: Sao Paulo
      NR_CONJ: ''.padEnd(11, ' '),
      IN_OBRIGAT_ENTREGA: '1',
      VR_IMPDEVIDO: Math.random() * 10000,
      NR_RECIBO_ULTIMA_DEC_EX_ANTERIOR: generateRandomDigits(10),
      IN_SEGURANCA: Math.floor(Math.random() * 3).toString(), // 0-2
      IN_IMPOSTO_PAGO: '00', // Example
      IN_IMPOSTO_ANTECIPADO: '0', // Example
      IN_MUDA_ENDERECO: '0',
      NR_CEP: generateRandomDigits(8),
      IN_DEBITO_PRIMEIRA_QUOTA: '0',
      NR_BANCO: '001', // Example Banco do Brasil
      NR_AGENCIA: generateRandomDigits(4),
      IN_SOBREPARTILHA: '0',
      DATA_TRANSITO_JULGADO_LAVRATURA: ''.padEnd(8, ' '),
      VR__SOMA_IMPOSTO_PAGAR: Math.random() * 11000,
      // ... fill other IR fields with random/default data
      NR_CONTROLE: generateRandomDigits(10),
    };
    lines.push(createRecordLine('IR', headerData));
    this.incrementCount('IR');


    // --- Generate Declarante (16) ---
     const declaranteData = {
        NR_REG: 16,
        NR_CPF: cpf,
        NM_NOME: nome,
        TIP_LOGRA: 'RUA'.padEnd(15, ' '),
        NM_LOGRA: `LOGRADOURO ${generateRandomString(10)}`.substring(0, 40),
        NR_NUMERO: generateRandomDigits(4).padEnd(6, ' '),
        NM_COMPLEM: `APTO ${generateRandomDigits(3)}`.padEnd(21, ' '),
        NM_BAIRRO: `BAIRRO ${generateRandomString(5)}`.substring(0, 19),
        NR_CEP: headerData.NR_CEP.padEnd(9, ' '), // Use same CEP as header
        CD_MUNICIP: headerData.CD_MUNICIP,
        NM_MUNICIP: 'SAO PAULO'.padEnd(40, ' '), // Example
        SG_UF: headerData.SG_UF,
        CD_EX: '   ',
        CD_PAIS: '105', // Brasil
        NM_EMAIL: `${nome.replace(/\s+/g, '.').toLowerCase()}@email.com`.substring(0, 90),
        NR_NITPISPASEP: generateRandomDigits(11),
        NR_CPF_CONJUGE: ''.padEnd(11, ' '),
        NR_DDD_TELEFONE: '11'.padEnd(4, ' '),
        Filler_352: ''.padEnd(9, ' '),
        DT_NASCIM: headerData.DT_NASCIM,
        NR_TITELEITOR: generateRandomDigits(13),
        CD_OCUP: '001', // Example code
        CD_NATUR: '10', // Example code
        NR_QUOTAS: 1,
        IN_COMPLETA: headerData.IN_COMPLETA,
        IN_RETIFICADORA: headerData.IN_RETIFICADORA,
        IN_GERADO: headerData.IN_GERADA,
        IN_ENDERECO: headerData.IN_MUDA_ENDERECO,
        NR_CONTROLE_ORIGINAL: ''.padEnd(12, ' '),
        NR_BANCO: headerData.NR_BANCO,
        NR_AGENCIA: headerData.NR_AGENCIA,
        IN_DOENCA_DEFICIENCIA: 'N',
        IN_PREPREENCHIDA: '0',
        DT_DIA_UTIL_RECIBO: format(new Date(), 'yyyyMMdd'), // Example
        Filler_421: ''.padEnd(5, ' '),
        NR_DV_CONTA: generateRandomDigits(2),
        IN_DEBITO_AUTOM: 'N',
        IN_DEBITO_PRIMEIRA_QUOTA: headerData.IN_DEBITO_PRIMEIRA_QUOTA,
        NR_FONTE_PRINCIPAL: generateRandomCNPJ(),
        NR_RECIBO_ULTIMA_DEC_ANO_ANTERIOR: headerData.NR_RECIBO_ULTIMA_DEC_EX_ANTERIOR,
        IN_TIPODECLARACAO: 'A', // Ajuste
        NR_CPF_PROCURADOR: ''.padEnd(11, ' '),
        NR_REGISTRO_PROFISSIONAL: ''.padEnd(20, ' '),
        NR_DDD_CELULAR: '11',
        NR_CELULAR: generateRandomDigits(9),
        IN_CONJUGE: 'N',
        NR_TELEFONE: generateRandomDigits(11),
        IN_TIPO_CONTA: '1', // Conta Corrente
        NR_CONTA: generateRandomDigits(10).padEnd(20, ' '),
        NR_NUMERO_PROCESSO: ''.padEnd(17, ' '),
        CPF_RESPONSAVEL: cpf,
        NR_DATA_ORIGINAL_RETIFICADORA: format(subYears(new Date(), 1), 'yyyyMMdd'), // Example
        NR_HORA_ORIGINAL_RETIFICADORA: format(new Date(), 'HHmmss'), // Example
        TX_MENSAGEM_RECIBO: ''.padEnd(300, ' '),
        NR_CONTROLE: generateRandomDigits(10),
     };
    lines.push(createRecordLine('16', declaranteData));
    this.incrementCount('16');

    // --- Generate other records randomly (Example: Add R21 if needed) ---
    // if (Math.random() > 0.3) { // Example: 70% chance of having R21
    //     const r21Data = { ... };
    //     lines.push(createRecordLine('21', r21Data));
    //     this.incrementCount('21');
    // }

    // --- Generate Trailer (T9) ---
    const trailerData: Record<string, any> = {
        NR_REG: 'T9',
        NR_CPF: cpf,
        QT_TOTAL: lines.length + 1, // +1 for the T9 itself (Header is counted in lines.length here)
    };
    // Populate QT_Rxx fields from recordCounts
    for (const key in this.recordCounts) {
        if (key.startsWith('R')) { // e.g., R16, R21
            trailerData[`QT_${key}`] = this.recordCounts[key];
        } else if (key === 'IR') {
             // Header is included in QT_TOTAL, not a separate QT_ field in T9
        }
         // Add specific handling if T9 layout uses different keys than Rxx
    }
     // Ensure all QT_Rxx fields defined in the layout exist, even if count is 0
     layout.T9.fields.forEach(field => {
         if (field.name.startsWith('QT_R') && !trailerData[field.name]) {
             trailerData[field.name] = 0;
         }
     });

    trailerData['NR_CONTROLE'] = generateRandomDigits(10);

    lines.push(createRecordLine('T9', trailerData));
    // Don't increment T9 count for itself

    return lines.join('\r\n') + '\r\n'; // Use CRLF line endings as is common
  }
}

// Example Usage (can be removed or used for testing)
// const generator = new RandomDBKFileGenerator(2025);
// const randomFileContent = generator.generateDeclaration();
// console.log(randomFileContent);
