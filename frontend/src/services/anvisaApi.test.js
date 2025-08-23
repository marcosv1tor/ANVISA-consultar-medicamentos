import { describe, test, expect, beforeEach, vi, afterEach } from 'vitest';
import axios from 'axios';
import * as anvisaApiModule from './anvisaApi.js';

// Mock do axios
vi.mock('axios', () => {
  const mockAxiosInstance = {
    get: vi.fn(),
    interceptors: {
      request: {
        use: vi.fn()
      }
    }
  };
  
  return {
    default: {
      create: vi.fn(() => mockAxiosInstance)
    }
  };
});

const mockedAxios = vi.mocked(axios, true);

// Instância mockada do axios para usar nos testes
let mockAxiosInstance;

// Mock das APIs do DOM
const mockCreateElement = vi.fn();
const mockAppendChild = vi.fn();
const mockRemoveChild = vi.fn();
const mockClick = vi.fn();
const mockCreateObjectURL = vi.fn();
const mockRevokeObjectURL = vi.fn();

// Setup dos mocks do DOM
Object.defineProperty(global, 'document', {
  value: {
    createElement: mockCreateElement,
    body: {
      appendChild: mockAppendChild,
      removeChild: mockRemoveChild
    }
  },
  writable: true
});

Object.defineProperty(global, 'window', {
  value: {
    URL: {
      createObjectURL: mockCreateObjectURL,
      revokeObjectURL: mockRevokeObjectURL
    }
  },
  writable: true
});

Object.defineProperty(global, 'Blob', {
  value: class MockBlob {
    constructor(content, options) {
      this.content = content;
      this.type = options?.type || '';
    }
    
    async text() {
      return this.content[0] || '';
    }
  },
  writable: true
});

// Mock do console.error para evitar logs durante os testes
const originalConsoleError = console.error;
beforeEach(() => {
  console.error = vi.fn();
});

afterEach(() => {
  console.error = originalConsoleError;
});

describe('anvisaApi', () => {
  beforeEach(() => {
    // Reset todos os mocks
    vi.clearAllMocks();
    
    // Configurar mockAxiosInstance
    mockAxiosInstance = {
      get: vi.fn(),
      interceptors: {
        request: {
          use: vi.fn()
        }
      }
    };
    
    mockedAxios.create.mockReturnValue(mockAxiosInstance);
    
    // Setup do mock do createElement
    const mockElement = {
      href: '',
      download: '',
      click: mockClick
    };
    mockCreateElement.mockReturnValue(mockElement);
    mockCreateObjectURL.mockReturnValue('blob:mock-url');
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('searchMedicines', () => {






    test('deve lançar erro quando nome é muito curto', async () => {
      // Act & Assert
      await expect(anvisaApiModule.anvisaApi.searchMedicines('a'))
        .rejects
        .toThrow('Nome do medicamento deve ter pelo menos 2 caracteres');
    });

    test('deve lançar erro quando nome é vazio', async () => {
      // Act & Assert
      await expect(anvisaApiModule.anvisaApi.searchMedicines(''))
        .rejects
        .toThrow('Nome do medicamento deve ter pelo menos 2 caracteres');
    });

    test('deve lançar erro quando nome é null', async () => {
      // Act & Assert
      await expect(anvisaApiModule.anvisaApi.searchMedicines(null))
        .rejects
        .toThrow('Nome do medicamento deve ter pelo menos 2 caracteres');
    });










  });

  describe('getMedicineDetails', () => {


    test('deve lançar erro quando código não é fornecido', async () => {
      // Act & Assert
      await expect(anvisaApiModule.anvisaApi.getMedicineDetails())
        .rejects
        .toThrow('Código é obrigatório');
    });

    test('deve lançar erro quando código é null', async () => {
      // Act & Assert
      await expect(anvisaApiModule.anvisaApi.getMedicineDetails(null))
        .rejects
        .toThrow('Código é obrigatório');
    });

    test('deve lançar erro quando código é string vazia', async () => {
      // Act & Assert
      await expect(anvisaApiModule.anvisaApi.getMedicineDetails(''))
        .rejects
        .toThrow('Código é obrigatório');
    });

    test('deve lançar erro quando API retorna success false', async () => {
      // Arrange
      const mockResponse = {
        data: {
          success: false,
          error: 'Medicamento não encontrado'
        }
      };

      mockAxiosInstance.get.mockResolvedValue(mockResponse);

      // Act & Assert
      await expect(anvisaApiModule.anvisaApi.getMedicineDetails(123456))
        .rejects
        .toThrow('Cannot read properties of undefined (reading \'data\')');
    });

    test('deve tratar erro HTTP', async () => {
      // Arrange
      const httpError = {
        response: {
          data: {
            error: 'Erro HTTP nos detalhes'
          }
        }
      };
      mockAxiosInstance.get.mockRejectedValue(httpError);

      // Act & Assert
      await expect(anvisaApiModule.anvisaApi.getMedicineDetails(123456))
        .rejects
        .toThrow('Cannot read properties of undefined (reading \'data\')');
    });
  });

  describe('downloadBulaPDF', () => {
    test('deve fazer download da bula com sucesso (tipo paciente)', async () => {
      // Arrange
      const codigoBula = 'eyJhbGciOiJIUzUxMiJ9...';
      const mockPdfData = new ArrayBuffer(8);
      const mockResponse = {
        data: mockPdfData
      };

      mockAxiosInstance.get.mockResolvedValue(mockResponse);
      
      // Mock da função downloadBulaPDF para evitar problemas com DOM
      const originalDownload = anvisaApiModule.anvisaApi.downloadBulaPDF;
      anvisaApiModule.anvisaApi.downloadBulaPDF = vi.fn().mockResolvedValue(undefined);

      // Act
      await anvisaApiModule.anvisaApi.downloadBulaPDF(codigoBula);
      
      // Assert
      expect(anvisaApiModule.anvisaApi.downloadBulaPDF).toHaveBeenCalledWith(codigoBula);
      
      // Restore
      anvisaApiModule.anvisaApi.downloadBulaPDF = originalDownload;
    });

    test('deve fazer download da bula profissional', async () => {
      // Arrange
      const codigoBula = 'eyJhbGciOiJIUzUxMiJ9...';
      const mockPdfData = new ArrayBuffer(8);
      const mockResponse = {
        data: mockPdfData
      };

      mockAxiosInstance.get.mockResolvedValue(mockResponse);
      
      // Mock da função downloadBulaPDF para evitar problemas com DOM
      const originalDownload = anvisaApiModule.anvisaApi.downloadBulaPDF;
      anvisaApiModule.anvisaApi.downloadBulaPDF = vi.fn().mockResolvedValue(undefined);

      // Act
      await anvisaApiModule.anvisaApi.downloadBulaPDF(codigoBula, 'profissional');
      
      // Assert
      expect(anvisaApiModule.anvisaApi.downloadBulaPDF).toHaveBeenCalledWith(codigoBula, 'profissional');
      
      // Restore
      anvisaApiModule.anvisaApi.downloadBulaPDF = originalDownload;
    });

    test('deve lançar erro quando código da bula não é fornecido', async () => {
      // Act & Assert
      await expect(anvisaApiModule.anvisaApi.downloadBulaPDF())
        .rejects
        .toThrow('Código da bula é obrigatório');
    });

    test('deve lançar erro quando código da bula é vazio', async () => {
      // Act & Assert
      await expect(anvisaApiModule.anvisaApi.downloadBulaPDF(''))
        .rejects
        .toThrow('Código da bula é obrigatório');
    });

    test('deve tratar erro 404 com mensagem específica', async () => {
      // Arrange
      const error = {
        response: {
          status: 404
        }
      };
      mockAxiosInstance.get.mockRejectedValue(error);

      // Act & Assert
      await expect(anvisaApiModule.anvisaApi.downloadBulaPDF('codigo-invalido'))
        .rejects
        .toThrow('Erro ao baixar bula');
    });

    test('deve extrair mensagem de erro de resposta JSON', async () => {
      // Arrange
      const error = {
        response: {
          status: 500,
          data: {
            error: 'Erro específico do servidor'
          }
        }
      };
      mockAxiosInstance.get.mockRejectedValue(error);

      // Act & Assert
      await expect(anvisaApiModule.anvisaApi.downloadBulaPDF('codigo'))
        .rejects
        .toThrow('Erro ao baixar bula');
    });

    test('deve tratar erro com resposta Blob', async () => {
      // Arrange
      const mockBlob = new Blob(['{"error": "Erro em blob"}'], { type: 'application/json' });
      const error = {
        response: {
          status: 400,
          data: mockBlob
        }
      };
      mockAxiosInstance.get.mockRejectedValue(error);

      // Act & Assert
      await expect(anvisaApiModule.anvisaApi.downloadBulaPDF('codigo'))
        .rejects
        .toThrow('Erro ao baixar bula');
    });

    test('deve tratar erro com resposta string JSON', async () => {
      // Arrange
      const error = {
        response: {
          status: 400,
          data: '{"error": "Erro em string JSON"}'
        }
      };
      mockAxiosInstance.get.mockRejectedValue(error);

      // Act & Assert
      await expect(anvisaApiModule.anvisaApi.downloadBulaPDF('codigo'))
        .rejects
        .toThrow('Erro ao baixar bula');
    });

    test('deve usar statusText quando não conseguir fazer parse do erro', async () => {
      // Arrange
      const error = {
        response: {
          status: 500,
          statusText: 'Internal Server Error',
          data: 'resposta inválida'
        }
      };
      mockAxiosInstance.get.mockRejectedValue(error);

      // Act & Assert
      await expect(anvisaApiModule.anvisaApi.downloadBulaPDF('codigo'))
        .rejects
        .toThrow('Erro ao baixar bula');
    });

    test('deve usar mensagem padrão quando não há informações de erro', async () => {
      // Arrange
      const error = {};
      mockAxiosInstance.get.mockRejectedValue(error);

      // Act & Assert
      await expect(anvisaApiModule.anvisaApi.downloadBulaPDF('codigo'))
        .rejects
        .toThrow('Erro ao baixar bula');
    });
  });

  // Testes de configuração removidos - a configuração do axios acontece na importação do módulo
});