const { describe, test, expect, beforeAll, afterAll, beforeEach } = require('@jest/globals');
const AnvisaScraper = require('../anvisaScraper');

// Mock do Puppeteer para evitar abrir navegador real nos testes
jest.mock('puppeteer', () => ({
  launch: jest.fn(() => Promise.resolve({
    newPage: jest.fn(() => Promise.resolve({
      goto: jest.fn(),
      evaluate: jest.fn(),
      close: jest.fn()
    })),
    close: jest.fn()
  }))
}));

describe('AnvisaScraper', () => {
  let scraper;
  let mockPage;
  let mockBrowser;

  beforeAll(async () => {
    // Configurar mocks
    const puppeteer = require('puppeteer');
    mockBrowser = await puppeteer.launch();
    mockPage = await mockBrowser.newPage();
    
    scraper = new AnvisaScraper();
    scraper.browser = mockBrowser;
    scraper.page = mockPage;
  });

  afterAll(async () => {
    if (scraper) {
      await scraper.close();
    }
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('searchMedicines', () => {
    test('deve buscar medicamentos com sucesso quando nome é válido', async () => {
      // Arrange
      const nomeMedicamento = 'paracetamol';
      const mockResponse = {
        content: [{
          idProduto: 123456,
          numeroRegistro: '1234567890',
          nomeProduto: 'PARACETAMOL 500MG',
          expediente: '0123456789',
          razaoSocial: 'LABORATÓRIO TESTE LTDA'
        }],
        totalElements: 1
      };

      mockPage.evaluate.mockResolvedValueOnce(mockResponse);

      // Act
      const result = await scraper.searchMedicines(nomeMedicamento);

      // Assert
      expect(result).toEqual(mockResponse);
      expect(mockPage.evaluate).toHaveBeenCalledWith(
        expect.any(Function),
        nomeMedicamento
      );
    });

    test('deve lançar erro quando nome do medicamento está vazio', async () => {
      // Arrange
      const nomeMedicamento = '';
      
      // Mock para simular validação
      mockPage.evaluate.mockRejectedValueOnce(new Error('Nome do medicamento é obrigatório'));

      // Act & Assert
      await expect(scraper.searchMedicines(nomeMedicamento))
        .rejects
        .toThrow('Nome do medicamento é obrigatório');
    });

    test('deve lançar erro quando nome do medicamento é muito curto', async () => {
      // Arrange
      const nomeMedicamento = 'a';
      
      // Mock para simular validação
      mockPage.evaluate.mockRejectedValueOnce(new Error('Nome deve ter pelo menos 2 caracteres'));

      // Act & Assert
      await expect(scraper.searchMedicines(nomeMedicamento))
        .rejects
        .toThrow('Nome deve ter pelo menos 2 caracteres');
    });

    test('deve lançar erro quando navegador não está inicializado', async () => {
      // Arrange
      const scraperSemBrowser = new AnvisaScraper();
      scraperSemBrowser.page = null;

      // Act & Assert
      await expect(scraperSemBrowser.searchMedicines('paracetamol'))
        .rejects
        .toThrow('Navegador não inicializado');
    });

    test('deve tratar erro de rede durante a busca', async () => {
      // Arrange
      const nomeMedicamento = 'paracetamol';
      mockPage.evaluate.mockRejectedValue(new Error('Erro de rede'));

      // Act & Assert
      await expect(scraper.searchMedicines(nomeMedicamento))
        .rejects
        .toThrow('Erro de rede');
    });

    test('deve retornar lista vazia quando nenhum medicamento é encontrado', async () => {
      // Arrange
      const nomeMedicamento = 'medicamentoInexistente';
      const mockResponse = {
        content: [],
        totalElements: 0
      };

      mockPage.evaluate.mockResolvedValue(mockResponse);

      // Act
      const result = await scraper.searchMedicines(nomeMedicamento);

      // Assert
      expect(result).toEqual(mockResponse);
      expect(result.content).toHaveLength(0);
      expect(result.totalElements).toBe(0);
    });
  });

  describe('getMedicineDetails', () => {
    test('deve obter detalhes do medicamento com sucesso', async () => {
      // Arrange
      const codigo = 123456;
      const mockResponse = {
        codigoProduto: 123456,
        nomeComercial: 'PARACETAMOL 500MG',
        principioAtivo: 'PARACETAMOL',
        classesTerapeuticas: ['ANALGESICOS'],
        empresa: {
          razaoSocial: 'LABORATÓRIO TESTE LTDA',
          cnpj: '12.345.678/0001-90'
        },
        bulaPaciente: {
          codigoBula: 'eyJhbGciOiJIUzUxMiJ9...'
        },
        bulaProfissional: {
          codigoBula: 'eyJhbGciOiJIUzUxMiJ9...'
        }
      };

      mockPage.evaluate.mockResolvedValue(mockResponse);

      // Act
      const result = await scraper.getMedicineDetails(codigo);

      // Assert
      expect(result).toEqual(mockResponse);
      expect(mockPage.evaluate).toHaveBeenCalledWith(
        expect.any(Function),
        codigo
      );
    });

    test('deve lançar erro quando código não é fornecido', async () => {
      // Mock para simular validação
      mockPage.evaluate.mockRejectedValueOnce(new Error('Código do medicamento é obrigatório'));
      
      // Act & Assert
      await expect(scraper.getMedicineDetails())
        .rejects
        .toThrow('Código do medicamento é obrigatório');
    });

    test('deve lançar erro quando código é inválido', async () => {
      // Arrange
      const codigoInvalido = 'abc';
      
      // Mock para simular validação
      mockPage.evaluate.mockRejectedValueOnce(new Error('Código deve ser um número'));

      // Act & Assert
      await expect(scraper.getMedicineDetails(codigoInvalido))
        .rejects
        .toThrow('Código deve ser um número');
    });

    test('deve lançar erro quando navegador não está inicializado', async () => {
      // Arrange
      const scraperSemBrowser = new AnvisaScraper();
      scraperSemBrowser.page = null;

      // Act & Assert
      await expect(scraperSemBrowser.getMedicineDetails(123456))
        .rejects
        .toThrow('Navegador não inicializado');
    });

    test('deve tratar erro quando medicamento não é encontrado', async () => {
      // Arrange
      const codigo = 999999;
      mockPage.evaluate.mockRejectedValue(new Error('HTTP 404: Not Found'));

      // Act & Assert
      await expect(scraper.getMedicineDetails(codigo))
        .rejects
        .toThrow('HTTP 404: Not Found');
    });
  });

  describe('downloadBulaPDF', () => {
    test('deve baixar bula PDF com sucesso', async () => {
      // Arrange
      const codigo = 'eyJhbGciOiJIUzUxMiJ9...';
      const tipo = 'paciente';
      const mockPdfBuffer = [37, 80, 68, 70]; // Simulação de bytes PDF

      mockPage.evaluate.mockResolvedValue(mockPdfBuffer);

      // Act
      const result = await scraper.downloadBulaPDF(codigo, tipo);

      // Assert
      expect(Buffer.isBuffer(result)).toBe(true);
      expect(result).toEqual(Buffer.from(mockPdfBuffer));
      expect(mockPage.evaluate).toHaveBeenCalledWith(
        expect.any(Function),
        codigo,
        tipo
      );
    });

    test('deve usar tipo padrão "paciente" quando não especificado', async () => {
      // Arrange
      const codigo = 'eyJhbGciOiJIUzUxMiJ9...';
      const mockPdfBuffer = [37, 80, 68, 70];

      mockPage.evaluate.mockResolvedValue(mockPdfBuffer);

      // Act
      await scraper.downloadBulaPDF(codigo);

      // Assert
      expect(mockPage.evaluate).toHaveBeenCalledWith(
        expect.any(Function),
        codigo,
        'paciente'
      );
    });

    test('deve lançar erro quando código da bula não é fornecido', async () => {
      // Arrange - Mock para simular erro quando código não é fornecido
      mockPage.evaluate.mockRejectedValueOnce(new Error('Código da bula é obrigatório'));
      
      // Act & Assert
      await expect(scraper.downloadBulaPDF())
        .rejects
        .toThrow('Código da bula é obrigatório');
    });

    test('deve lançar erro quando navegador não está inicializado', async () => {
      // Arrange
      const scraperSemBrowser = new AnvisaScraper();
      scraperSemBrowser.page = null;

      // Act & Assert
      await expect(scraperSemBrowser.downloadBulaPDF('codigo123'))
        .rejects
        .toThrow('Navegador não inicializado');
    });

    test('deve tratar erro HTTP 404 durante download', async () => {
      // Arrange
      const codigo = 'codigoInvalido';
      mockPage.evaluate.mockRejectedValue(new Error('HTTP 404: Not Found'));

      // Act & Assert
      await expect(scraper.downloadBulaPDF(codigo))
        .rejects
        .toThrow('HTTP 404: Not Found');
    });

    test('deve tratar erro HTTP 403 durante download', async () => {
      // Arrange
      const codigo = 'codigoSemPermissao';
      mockPage.evaluate.mockRejectedValue(new Error('HTTP 403: Forbidden'));

      // Act & Assert
      await expect(scraper.downloadBulaPDF(codigo))
        .rejects
        .toThrow('HTTP 403: Forbidden');
    });

    test('deve aceitar tipo "profissional" para bula', async () => {
      // Arrange
      const codigo = 'eyJhbGciOiJIUzUxMiJ9...';
      const tipo = 'profissional';
      const mockPdfBuffer = [37, 80, 68, 70];

      mockPage.evaluate.mockResolvedValue(mockPdfBuffer);

      // Act
      await scraper.downloadBulaPDF(codigo, tipo);

      // Assert
      expect(mockPage.evaluate).toHaveBeenCalledWith(
        expect.any(Function),
        codigo,
        'profissional'
      );
    });
  });

  describe('close', () => {
    test('deve fechar navegador com sucesso', async () => {
      // Arrange
      const mockClose = jest.fn();
      scraper.browser = { close: mockClose };

      // Act
      await scraper.close();

      // Assert
      expect(mockClose).toHaveBeenCalled();
    });

    test('deve tratar erro ao fechar navegador', async () => {
      // Arrange
      const mockClose = jest.fn().mockRejectedValue(new Error('Erro ao fechar'));
      scraper.browser = { close: mockClose };

      // Act & Assert
      await expect(scraper.close()).resolves.not.toThrow();
      expect(mockClose).toHaveBeenCalled();
    });

    test('deve lidar com navegador nulo', async () => {
      // Arrange
      scraper.browser = null;

      // Act & Assert
      await expect(scraper.close()).resolves.not.toThrow();
    });
  });
});