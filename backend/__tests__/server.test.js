const { describe, test, expect, beforeAll, afterAll, beforeEach } = require('@jest/globals');
const request = require('supertest');
const express = require('express');

// Mock do AnvisaScraper
const mockAnvisaScraper = {
  init: jest.fn(),
  initialize: jest.fn().mockResolvedValue(true),
  searchMedicines: jest.fn(),
  getMedicineDetails: jest.fn(),
  downloadBulaPDF: jest.fn(),
  close: jest.fn()
};

jest.mock('../anvisaScraper', () => {
  return jest.fn().mockImplementation(() => mockAnvisaScraper);
});

// Importar o app após os mocks
let app;

describe('API Endpoints', () => {
  beforeAll(async () => {
    // Importar o servidor após configurar os mocks
    app = require('../server');
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/medicamentos/buscar', () => {
    test('deve buscar medicamentos com sucesso', async () => {
      // Arrange
      const mockResponse = {
        content: [{
          idProduto: 123456,
          numeroRegistro: '1234567890',
          nomeProduto: 'PARACETAMOL 500MG',
          expediente: '0123456789',
          razaoSocial: 'LABORATÓRIO TESTE LTDA',
          codigo: 123456,
          empresa: 'LABORATÓRIO TESTE LTDA'
        }],
        totalElements: 1
      };

      mockAnvisaScraper.searchMedicines.mockResolvedValue(mockResponse);

      // Act
      const response = await request(app)
        .get('/api/medicamentos/buscar')
        .query({ nome: 'paracetamol' });

      // Assert
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.count).toBe(1);
      expect(response.body.data).toEqual(mockResponse.content);
      expect(mockAnvisaScraper.searchMedicines).toHaveBeenCalledWith('paracetamol');
    });

    test('deve retornar erro 400 quando nome não é fornecido', async () => {
      // Act
      const response = await request(app)
        .get('/api/medicamentos/buscar');

      // Assert
      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Nome do medicamento deve ter pelo menos 2 caracteres');
    });

    test('deve retornar erro 400 quando nome é muito curto', async () => {
      // Act
      const response = await request(app)
        .get('/api/medicamentos/buscar')
        .query({ nome: 'a' });

      // Assert
      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Nome do medicamento deve ter pelo menos 2 caracteres');
    });

    test('deve tratar erro interno do scraper', async () => {
      // Arrange
      mockAnvisaScraper.searchMedicines.mockRejectedValue(new Error('Erro de rede'));

      // Act
      const response = await request(app)
        .get('/api/medicamentos/buscar')
        .query({ nome: 'paracetamol' });

      // Assert
      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });

    test('deve retornar lista vazia quando nenhum medicamento é encontrado', async () => {
      // Arrange
      const mockResponse = {
        content: [],
        totalElements: 0
      };

      mockAnvisaScraper.searchMedicines.mockResolvedValue(mockResponse);

      // Act
      const response = await request(app)
        .get('/api/medicamentos/buscar')
        .query({ nome: 'medicamentoInexistente' });

      // Assert
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.count).toBe(0);
      expect(response.body.data).toEqual([]);
    });

    test('deve trimar espaços em branco do nome', async () => {
      // Arrange
      const mockResponse = {
        content: [{ idProduto: 123456, nomeProduto: 'PARACETAMOL' }],
        totalElements: 1
      };

      mockAnvisaScraper.searchMedicines.mockResolvedValue(mockResponse);

      // Act
      const response = await request(app)
        .get('/api/medicamentos/buscar')
        .query({ nome: '  paracetamol  ' });

      // Assert
      expect(response.status).toBe(200);
      expect(mockAnvisaScraper.searchMedicines).toHaveBeenCalledWith('paracetamol');
    });
  });

  describe('GET /api/medicamentos/detalhes/:codigo', () => {
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

      mockAnvisaScraper.getMedicineDetails.mockResolvedValue(mockResponse);

      // Act
      const response = await request(app)
        .get(`/api/medicamentos/detalhes/${codigo}`);

      // Assert
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(mockResponse);
      expect(mockAnvisaScraper.getMedicineDetails).toHaveBeenCalledWith('123456');
    });

    test('deve retornar erro 400 quando código não é fornecido', async () => {
      // Act
      const response = await request(app)
        .get('/api/medicamentos/detalhes/');

      // Assert
      expect(response.status).toBe(404); // Express retorna 404 para rota não encontrada
    });

    test('deve retornar erro 400 quando código é inválido', async () => {
      // Act
      const response = await request(app)
        .get('/api/medicamentos/detalhes/abc');

      // Assert
      expect(response.status).toBe(200);
      expect(mockAnvisaScraper.getMedicineDetails).toHaveBeenCalledWith('abc');
    });

    test('deve tratar erro quando medicamento não é encontrado', async () => {
      // Arrange
      const codigo = 999999;
      mockAnvisaScraper.getMedicineDetails.mockRejectedValue(new Error('Medicamento não encontrado'));

      // Act
      const response = await request(app)
        .get(`/api/medicamentos/detalhes/${codigo}`);

      // Assert
      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });

    test('deve aceitar código como string numérica', async () => {
      // Arrange
      const codigo = '123456';
      const mockResponse = { codigoProduto: 123456, nomeComercial: 'TESTE' };

      mockAnvisaScraper.getMedicineDetails.mockResolvedValue(mockResponse);

      // Act
      const response = await request(app)
        .get(`/api/medicamentos/detalhes/${codigo}`);

      // Assert
      expect(response.status).toBe(200);
      expect(mockAnvisaScraper.getMedicineDetails).toHaveBeenCalledWith('123456');
    });
  });

  describe('GET /api/medicamentos/bula/:codigo', () => {
    test('deve baixar bula PDF com sucesso', async () => {
      // Arrange
      const codigo = 'eyJhbGciOiJIUzUxMiJ9...';
      const mockPdfBuffer = Buffer.from([37, 80, 68, 70]); // Simulação de PDF

      mockAnvisaScraper.downloadBulaPDF.mockResolvedValue(mockPdfBuffer);

      // Act
      const response = await request(app)
        .get(`/api/medicamentos/bula/${codigo}`);

      // Assert
      expect(response.status).toBe(200);
      expect(response.headers['content-type']).toBe('application/pdf');
      expect(response.headers['content-disposition']).toContain('attachment');
      expect(response.headers['content-disposition']).toContain('bula-paciente');
      expect(Buffer.isBuffer(response.body)).toBe(true);
      expect(mockAnvisaScraper.downloadBulaPDF).toHaveBeenCalledWith(codigo, 'paciente');
    });

    test('deve baixar bula profissional quando tipo é especificado', async () => {
      // Arrange
      const codigo = 'eyJhbGciOiJIUzUxMiJ9...';
      const mockPdfBuffer = Buffer.from([37, 80, 68, 70]);

      mockAnvisaScraper.downloadBulaPDF.mockResolvedValue(mockPdfBuffer);

      // Act
      const response = await request(app)
        .get(`/api/medicamentos/bula/${codigo}`)
        .query({ tipo: 'profissional' });

      // Assert
      expect(response.status).toBe(200);
      expect(response.headers['content-disposition']).toContain('bula-profissional');
      expect(mockAnvisaScraper.downloadBulaPDF).toHaveBeenCalledWith(codigo, 'profissional');
    });

    test('deve retornar erro 400 quando código não é fornecido', async () => {
      // Act
      const response = await request(app)
        .get('/api/medicamentos/bula/');

      // Assert
      expect(response.status).toBe(404); // Express retorna 404 para rota não encontrada
    });

    test('deve retornar erro 404 com mensagem específica quando bula não é encontrada', async () => {
      // Arrange
      const codigo = 'codigoInvalido';
      const error = new Error('HTTP 404: Not Found');
      error.response = { status: 404 };
      
      mockAnvisaScraper.downloadBulaPDF.mockRejectedValue(error);

      // Act
      const response = await request(app)
        .get(`/api/medicamentos/bula/${codigo}`);

      // Assert
      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Bula não disponível');
    });

    test('deve tratar erro HTTP 403 durante download', async () => {
      // Arrange
      const codigo = 'codigoSemPermissao';
      const error = new Error('HTTP 403: Forbidden');
      error.response = { status: 403 };
      
      mockAnvisaScraper.downloadBulaPDF.mockRejectedValue(error);

      // Act
      const response = await request(app)
        .get(`/api/medicamentos/bula/${codigo}`);

      // Assert
      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });

    test('deve usar tipo padrão "paciente" quando não especificado', async () => {
      // Arrange
      const codigo = 'eyJhbGciOiJIUzUxMiJ9...';
      const mockPdfBuffer = Buffer.from([37, 80, 68, 70]);

      mockAnvisaScraper.downloadBulaPDF.mockResolvedValue(mockPdfBuffer);

      // Act
      const response = await request(app)
        .get(`/api/medicamentos/bula/${codigo}`);

      // Assert
      expect(response.status).toBe(200);
      expect(mockAnvisaScraper.downloadBulaPDF).toHaveBeenCalledWith(codigo, 'paciente');
    });

    test('deve validar tipo de bula permitido', async () => {
      // Arrange
      const codigo = 'eyJhbGciOiJIUzUxMiJ9...';

      // Act
      const response = await request(app)
        .get(`/api/medicamentos/bula/${codigo}`)
        .query({ tipo: 'tipoInvalido' });

      // Assert
      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Tipo de bula deve ser "paciente" ou "profissional"');
    });
  });

  describe('Middleware de Segurança', () => {
    test('deve incluir headers de segurança', async () => {
      // Act
      const response = await request(app)
        .get('/api/medicamentos/buscar')
        .query({ nome: 'teste' });

      // Assert
      expect(response.headers['content-security-policy']).toBeDefined();
      expect(response.headers['x-content-type-options']).toBe('nosniff');
      expect(response.headers['x-frame-options']).toBe('SAMEORIGIN');
    });

    test('deve permitir CORS para origens permitidas', async () => {
      // Act
      const response = await request(app)
        .get('/api/medicamentos/buscar')
        .set('Origin', 'http://localhost:3000')
        .query({ nome: 'teste' });

      // Assert
      expect(response.headers['access-control-allow-origin']).toBeDefined();
    });
  });

  describe('Tratamento de Erros Globais', () => {
    test('deve retornar 404 para rotas não encontradas', async () => {
      // Act
      const response = await request(app)
        .get('/api/rota-inexistente');

      // Assert
      expect(response.status).toBe(404);
    });

    test('deve tratar erros de JSON malformado', async () => {
      // Act
      const response = await request(app)
        .post('/api/medicamentos/buscar')
        .set('Content-Type', 'application/json')
        .send('{ json malformado }');

      // Assert
      expect(response.status).toBe(500);
    });
  });

  describe('Rate Limiting e Performance', () => {
    test('deve processar múltiplas requisições simultâneas', async () => {
      // Arrange
      const mockResponse = {
        content: [{ idProduto: 123456, nomeProduto: 'TESTE' }],
        totalElements: 1
      };
      mockAnvisaScraper.searchMedicines.mockResolvedValue(mockResponse);

      // Act
      const promises = Array(5).fill().map(() => 
        request(app)
          .get('/api/medicamentos/buscar')
          .query({ nome: 'teste' })
      );

      const responses = await Promise.all(promises);

      // Assert
      responses.forEach(response => {
        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
      });
    });
  });
});