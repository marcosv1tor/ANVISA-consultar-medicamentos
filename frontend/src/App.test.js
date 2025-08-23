import { describe, test, expect, beforeEach, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import App from './App.vue';
import { anvisaApi } from './services/anvisaApi.js';

// Mock do anvisaApi
vi.mock('./services/anvisaApi.js', () => ({
  anvisaApi: {
    searchMedicines: vi.fn(),
    getMedicineDetails: vi.fn(),
    downloadBulaPDF: vi.fn()
  }
}));

// Mock dos componentes filhos para focar na lógica do App
vi.mock('./components/MedicineSearch.vue', () => ({
  default: {
    name: 'MedicineSearch',
    template: '<div data-testid="medicine-search"><slot /></div>',
    props: ['loading'],
    emits: ['search']
  }
}));

vi.mock('./components/MedicineList.vue', () => ({
  default: {
    name: 'MedicineList',
    template: '<div data-testid="medicine-list"><slot /></div>',
    props: ['medicines'],
    emits: ['select']
  }
}));

vi.mock('./components/MedicineDetails.vue', () => ({
  default: {
    name: 'MedicineDetails',
    template: '<div data-testid="medicine-details"><slot /></div>',
    props: ['medicine', 'show'],
    emits: ['close', 'download-pdf']
  }
}));

vi.mock('./components/ErrorMessage.vue', () => ({
  default: {
    name: 'ErrorMessage',
    template: '<div data-testid="error-message"><slot /></div>',
    props: ['show', 'title', 'message', 'showRetry'],
    emits: ['close', 'retry']
  }
}));

vi.mock('./components/LoadingSpinner.vue', () => ({
  default: {
    name: 'LoadingSpinner',
    template: '<div data-testid="loading-spinner"><slot /></div>'
  }
}));

describe('App.vue', () => {
  let wrapper;

  beforeEach(() => {
    vi.clearAllMocks();
    wrapper = mount(App);
  });

  describe('Renderização inicial', () => {
    test('deve renderizar o header com título correto', () => {
      expect(wrapper.find('.navbar-brand').text()).toContain('MEDWARE');
      expect(wrapper.find('.navbar-text').text()).toBe('Consulta de Medicamentos ANVISA');
    });

    test('deve renderizar o componente de busca', () => {
      expect(wrapper.findComponent({ name: 'MedicineSearch' }).exists()).toBe(true);
    });

    test('deve renderizar o footer', () => {
      const footer = wrapper.find('footer');
      expect(footer.exists()).toBe(true);
      expect(footer.text()).toContain('Dados fornecidos pela API pública da ANVISA');
    });

    test('deve ter estado inicial correto', () => {
      expect(wrapper.vm.searchResults).toEqual([]);
      expect(wrapper.vm.selectedMedicine).toBe(null);
      expect(wrapper.vm.showDetails).toBe(false);
      expect(wrapper.vm.loading).toBe(false);
      expect(wrapper.vm.error).toBe(null);
      expect(wrapper.vm.lastSearchTerm).toBe(null);
    });
  });

  describe('Funcionalidade de busca', () => {
    test('deve realizar busca com sucesso', async () => {
      // Arrange
      const mockResults = [
        { codigo: 123456, nomeProduto: 'PARACETAMOL 500MG' },
        { codigo: 789012, nomeProduto: 'PARACETAMOL 750MG' }
      ];
      anvisaApi.searchMedicines.mockResolvedValue(mockResults);

      // Act
      await wrapper.vm.handleSearch('paracetamol');

      // Assert
      expect(anvisaApi.searchMedicines).toHaveBeenCalledWith('paracetamol');
      expect(wrapper.vm.searchResults).toEqual(mockResults);
      expect(wrapper.vm.loading).toBe(false);
      expect(wrapper.vm.error).toBe(null);
      expect(wrapper.vm.lastSearchTerm).toBe('paracetamol');
    });

    test('deve mostrar mensagem quando nenhum resultado é encontrado', async () => {
      // Arrange
      anvisaApi.searchMedicines.mockResolvedValue([]);

      // Act
      await wrapper.vm.handleSearch('medicamentoInexistente');

      // Assert
      expect(wrapper.vm.searchResults).toEqual([]);
      expect(wrapper.vm.error).toBe('Nenhum medicamento encontrado com esse nome.');
    });

    test('deve tratar erro na busca', async () => {
      // Arrange
      const errorMessage = 'Erro de rede';
      anvisaApi.searchMedicines.mockRejectedValue(new Error(errorMessage));

      // Act
      await wrapper.vm.handleSearch('teste');

      // Assert
      expect(wrapper.vm.error).toBe(errorMessage);
      expect(wrapper.vm.searchResults).toEqual([]);
      expect(wrapper.vm.loading).toBe(false);
    });

    test('deve definir loading como true durante a busca', async () => {
      // Arrange
      let resolvePromise;
      const promise = new Promise(resolve => {
        resolvePromise = resolve;
      });
      anvisaApi.searchMedicines.mockReturnValue(promise);

      // Act
      const searchPromise = wrapper.vm.handleSearch('teste');
      
      // Assert - loading deve ser true durante a busca
      expect(wrapper.vm.loading).toBe(true);
      
      // Resolve a promise
      resolvePromise([]);
      await searchPromise;
      
      // Assert - loading deve ser false após a busca
      expect(wrapper.vm.loading).toBe(false);
    });

    test('deve limpar resultados anteriores ao iniciar nova busca', async () => {
      // Arrange
      wrapper.vm.searchResults = [{ codigo: 123, nomeProduto: 'TESTE' }];
      wrapper.vm.error = 'Erro anterior';
      anvisaApi.searchMedicines.mockResolvedValue([]);

      // Act
      await wrapper.vm.handleSearch('nova-busca');

      // Assert
      expect(wrapper.vm.error).toBe('Nenhum medicamento encontrado com esse nome.');
    });
  });

  describe('Seleção de medicamento', () => {
    test('deve carregar detalhes do medicamento selecionado', async () => {
      // Arrange
      const medicine = { codigo: 123456 };
      const mockDetails = {
        codigoProduto: 123456,
        nomeComercial: 'PARACETAMOL 500MG',
        principioAtivo: 'PARACETAMOL'
      };
      anvisaApi.getMedicineDetails.mockResolvedValue(mockDetails);

      // Act
      await wrapper.vm.handleMedicineSelect(medicine);

      // Assert
      expect(anvisaApi.getMedicineDetails).toHaveBeenCalledWith(123456);
      expect(wrapper.vm.selectedMedicine).toEqual(mockDetails);
      expect(wrapper.vm.showDetails).toBe(true);
      expect(wrapper.vm.loading).toBe(false);
    });

    test('deve tratar erro ao carregar detalhes', async () => {
      // Arrange
      const medicine = { codigo: 123456 };
      anvisaApi.getMedicineDetails.mockRejectedValue(new Error('Erro ao carregar'));

      // Act
      await wrapper.vm.handleMedicineSelect(medicine);

      // Assert
      expect(wrapper.vm.error).toBe('Erro ao carregar detalhes do medicamento.');
      expect(wrapper.vm.selectedMedicine).toBe(null);
      expect(wrapper.vm.showDetails).toBe(false);
    });
  });

  describe('Modal de detalhes', () => {
    test('deve fechar modal de detalhes', () => {
      // Arrange
      wrapper.vm.selectedMedicine = { codigo: 123 };
      wrapper.vm.showDetails = true;

      // Act
      wrapper.vm.handleCloseDetails();

      // Assert
      expect(wrapper.vm.showDetails).toBe(false);
      expect(wrapper.vm.selectedMedicine).toBe(null);
    });

    test('deve renderizar modal quando há medicamento selecionado', async () => {
      // Arrange
      wrapper.vm.selectedMedicine = { codigo: 123 };
      wrapper.vm.showDetails = true;
      await wrapper.vm.$nextTick();

      // Assert
      expect(wrapper.findComponent({ name: 'MedicineDetails' }).exists()).toBe(true);
    });
  });

  describe('Download de bula', () => {
    test('deve fazer download da bula com sucesso', async () => {
      // Arrange
      const codigo = 'eyJhbGciOiJIUzUxMiJ9...';
      const tipo = 'paciente';
      anvisaApi.downloadBulaPDF.mockResolvedValue();

      // Act
      await wrapper.vm.handleDownloadPDF(codigo, tipo);

      // Assert
      expect(anvisaApi.downloadBulaPDF).toHaveBeenCalledWith(codigo, tipo);
      expect(wrapper.vm.error).toBe(null);
    });

    test('deve usar tipo padrão "paciente" quando não especificado', async () => {
      // Arrange
      const codigo = 'eyJhbGciOiJIUzUxMiJ9...';
      anvisaApi.downloadBulaPDF.mockResolvedValue();

      // Act
      await wrapper.vm.handleDownloadPDF(codigo);

      // Assert
      expect(anvisaApi.downloadBulaPDF).toHaveBeenCalledWith(codigo, 'paciente');
    });

    test('deve tratar erro no download', async () => {
      // Arrange
      const codigo = 'codigo-invalido';
      anvisaApi.downloadBulaPDF.mockRejectedValue(new Error('Bula não encontrada'));

      // Act
      await wrapper.vm.handleDownloadPDF(codigo);

      // Assert
      expect(wrapper.vm.error).toBe('Erro ao fazer download da bula.');
    });
  });

  describe('Tratamento de erros', () => {
    test('deve limpar erro', () => {
      // Arrange
      wrapper.vm.error = 'Algum erro';

      // Act
      wrapper.vm.clearError();

      // Assert
      expect(wrapper.vm.error).toBe(null);
    });

    test('deve repetir última busca', async () => {
      // Arrange
      wrapper.vm.lastSearchTerm = 'paracetamol';
      anvisaApi.searchMedicines.mockResolvedValue([]);
      const handleSearchSpy = vi.spyOn(wrapper.vm, 'handleSearch');

      // Act
      await wrapper.vm.retryLastSearch();

      // Assert
      expect(handleSearchSpy).toHaveBeenCalledWith('paracetamol');
    });

    test('não deve fazer nada se não há termo de busca anterior', async () => {
      // Arrange
      wrapper.vm.lastSearchTerm = null;
      const handleSearchSpy = vi.spyOn(wrapper.vm, 'handleSearch');

      // Act
      await wrapper.vm.retryLastSearch();

      // Assert
      expect(handleSearchSpy).not.toHaveBeenCalled();
    });
  });

  describe('Renderização condicional', () => {
    test('deve mostrar lista de medicamentos quando há resultados', async () => {
      // Arrange
      wrapper.vm.searchResults = [{ codigo: 123, nomeProduto: 'TESTE' }];
      await wrapper.vm.$nextTick();

      // Assert
      expect(wrapper.findComponent({ name: 'MedicineList' }).exists()).toBe(true);
    });

    test('deve mostrar mensagem de erro quando há erro', async () => {
      // Arrange
      wrapper.vm.error = 'Erro de teste';
      await wrapper.vm.$nextTick();

      // Assert
      expect(wrapper.findComponent({ name: 'ErrorMessage' }).exists()).toBe(true);
    });

    test('não deve mostrar lista quando há erro', async () => {
      // Arrange
      wrapper.vm.searchResults = [{ codigo: 123, nomeProduto: 'TESTE' }];
      wrapper.vm.error = 'Erro de teste';
      await wrapper.vm.$nextTick();

      // Assert
      expect(wrapper.findComponent({ name: 'MedicineList' }).exists()).toBe(false);
    });
  });

  describe('Métodos de manipulação de eventos', () => {
    test('handleSearch deve chamar searchMedicines com termo correto', async () => {
      // Arrange
      const searchTerm = 'paracetamol';
      anvisaApi.searchMedicines.mockResolvedValue([
        { codigo: 123, nomeProduto: 'PARACETAMOL 500MG' }
      ]);

      // Act
      await wrapper.vm.handleSearch(searchTerm);

      // Assert
      expect(anvisaApi.searchMedicines).toHaveBeenCalledWith(searchTerm);
      expect(wrapper.vm.searchResults).toHaveLength(1);
      expect(wrapper.vm.searchResults[0].nomeProduto).toBe('PARACETAMOL 500MG');
    });

    test('handleMedicineSelect deve chamar getMedicineDetails com medicamento correto', async () => {
      // Arrange
      const medicine = { codigo: 123, nomeProduto: 'TESTE' };
      const mockDetails = { codigo: 123, detalhes: 'Detalhes do medicamento' };
      anvisaApi.getMedicineDetails.mockResolvedValue(mockDetails);

      // Act
      await wrapper.vm.handleMedicineSelect(medicine);

      // Assert
      expect(anvisaApi.getMedicineDetails).toHaveBeenCalledWith(medicine.codigo);
      expect(wrapper.vm.selectedMedicine).toEqual(mockDetails);
    });
  });
});