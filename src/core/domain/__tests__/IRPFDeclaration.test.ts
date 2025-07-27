import { 
  IRPFDeclaration, 
  TaxPayerInfo, 
  Address, 
  DeclarationSection, 
  DeclarationItem 
} from '../IRPFDeclaration';
import { AssetPosition, MonthlyResult, IncomeRecord } from '../AssetPosition';
import { AssetCategory, MarketType } from '../Transaction';

describe('IRPFDeclaration', () => {
  describe('IRPFDeclaration object structure', () => {
    it('should create a valid IRPF declaration', () => {
      const taxPayerInfo: TaxPayerInfo = {
        name: 'João da Silva',
        cpf: '12345678900',
        dateOfBirth: new Date('1980-01-01'),
        address: {
          street: 'Rua das Flores',
          number: '123',
          complement: 'Apto 101',
          neighborhood: 'Centro',
          city: 'São Paulo',
          state: 'SP',
          zipCode: '01234567',
          country: 'Brasil'
        },
        phone: '11999998888',
        email: 'joao@example.com',
        occupation: 'Engenheiro'
      };

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

      const sections: DeclarationSection[] = [
        {
          code: 'BENS',
          name: 'Bens e Direitos',
          description: 'Declaração de bens e direitos',
          items: [
            {
              code: '31',
              description: 'Ações - PETR4',
              value: 2750,
              details: '100 ações PETROBRAS PN'
            }
          ]
        },
        {
          code: 'RENDIMENTOS',
          name: 'Rendimentos',
          description: 'Declaração de rendimentos',
          items: [
            {
              code: '10',
              description: 'Dividendos - PETR4',
              value: 250,
              details: 'Dividendos recebidos de PETROBRAS PN'
            }
          ]
        }
      ];

      const declaration: IRPFDeclaration = {
        taxPayerInfo,
        year: 2023,
        assetPositions,
        monthlyResults,
        incomeRecords,
        totalTaxDue: 13.2,
        totalTaxWithheld: 41.5,
        totalTaxToPay: 0,
        remainingLoss: 0,
        totalAssetsValue: 2750,
        totalIncome: 250,
        generationDate: new Date('2024-03-15'),
        sections
      };

      expect(declaration).toBeDefined();
      expect(declaration.taxPayerInfo).toEqual(taxPayerInfo);
      expect(declaration.year).toBe(2023);
      expect(declaration.assetPositions).toEqual(assetPositions);
      expect(declaration.monthlyResults).toEqual(monthlyResults);
      expect(declaration.incomeRecords).toEqual(incomeRecords);
      expect(declaration.totalTaxDue).toBe(13.2);
      expect(declaration.totalTaxWithheld).toBe(41.5);
      expect(declaration.totalTaxToPay).toBe(0);
      expect(declaration.remainingLoss).toBe(0);
      expect(declaration.totalAssetsValue).toBe(2750);
      expect(declaration.totalIncome).toBe(250);
      expect(declaration.generationDate).toEqual(new Date('2024-03-15'));
      expect(declaration.sections).toEqual(sections);
    });
  });

  describe('TaxPayerInfo object structure', () => {
    it('should create a valid taxpayer info', () => {
      const taxPayerInfo: TaxPayerInfo = {
        name: 'João da Silva',
        cpf: '12345678900',
        dateOfBirth: new Date('1980-01-01'),
        address: {
          street: 'Rua das Flores',
          number: '123',
          complement: 'Apto 101',
          neighborhood: 'Centro',
          city: 'São Paulo',
          state: 'SP',
          zipCode: '01234567',
          country: 'Brasil'
        },
        phone: '11999998888',
        email: 'joao@example.com',
        occupation: 'Engenheiro'
      };

      expect(taxPayerInfo).toBeDefined();
      expect(taxPayerInfo.name).toBe('João da Silva');
      expect(taxPayerInfo.cpf).toBe('12345678900');
      expect(taxPayerInfo.dateOfBirth).toEqual(new Date('1980-01-01'));
      expect(taxPayerInfo.address).toBeDefined();
      expect(taxPayerInfo.phone).toBe('11999998888');
      expect(taxPayerInfo.email).toBe('joao@example.com');
      expect(taxPayerInfo.occupation).toBe('Engenheiro');
    });
  });

  describe('Address object structure', () => {
    it('should create a valid address', () => {
      const address: Address = {
        street: 'Rua das Flores',
        number: '123',
        complement: 'Apto 101',
        neighborhood: 'Centro',
        city: 'São Paulo',
        state: 'SP',
        zipCode: '01234567',
        country: 'Brasil'
      };

      expect(address).toBeDefined();
      expect(address.street).toBe('Rua das Flores');
      expect(address.number).toBe('123');
      expect(address.complement).toBe('Apto 101');
      expect(address.neighborhood).toBe('Centro');
      expect(address.city).toBe('São Paulo');
      expect(address.state).toBe('SP');
      expect(address.zipCode).toBe('01234567');
      expect(address.country).toBe('Brasil');
    });
  });

  describe('DeclarationSection object structure', () => {
    it('should create a valid declaration section', () => {
      const section: DeclarationSection = {
        code: 'BENS',
        name: 'Bens e Direitos',
        description: 'Declaração de bens e direitos',
        items: [
          {
            code: '31',
            description: 'Ações - PETR4',
            value: 2750,
            details: '100 ações PETROBRAS PN'
          }
        ]
      };

      expect(section).toBeDefined();
      expect(section.code).toBe('BENS');
      expect(section.name).toBe('Bens e Direitos');
      expect(section.description).toBe('Declaração de bens e direitos');
      expect(section.items).toHaveLength(1);
      expect(section.items[0].code).toBe('31');
      expect(section.items[0].description).toBe('Ações - PETR4');
      expect(section.items[0].value).toBe(2750);
      expect(section.items[0].details).toBe('100 ações PETROBRAS PN');
    });
  });

  describe('DeclarationItem object structure', () => {
    it('should create a valid declaration item', () => {
      const item: DeclarationItem = {
        code: '31',
        description: 'Ações - PETR4',
        value: 2750,
        details: '100 ações PETROBRAS PN'
      };

      expect(item).toBeDefined();
      expect(item.code).toBe('31');
      expect(item.description).toBe('Ações - PETR4');
      expect(item.value).toBe(2750);
      expect(item.details).toBe('100 ações PETROBRAS PN');
    });
  });
});
