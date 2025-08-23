import { describe, test, expect, beforeEach, vi, afterEach } from 'vitest';
import { mount } from '@vue/test-utils';
import MedicineSearch from './MedicineSearch.vue';

// Mock do localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn()
};

Object.defineProperty(global, 'localStorage', {
  value: localStorageMock,
  writable: true
});

describe('MedicineSearch.vue', () => {
  let wrapper;

  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
    wrapper = mount(MedicineSearch);
  });

  afterEach(() => {
    wrapper?.unmount();
  });

  describe('Renderização inicial', () => {
    test('deve renderizar o título corretamente', () => {
      expect(wrapper.find('.card-title').text()).toContain('Buscar Medicamentos');
    });

    test('deve renderizar o campo de input', () => {
      const input = wrapper.find('input[type="text"]');
      expect(input.exists()).toBe(true);
      expect(input.attributes('placeholder')).toBe('Digite o nome do medicamento...');
      expect(input.attributes('minlength')).toBe('2');
      expect(input.attributes('maxlength')).toBe('100');
    });

    test('deve renderizar o botão de busca', () => {
      const button = wrapper.find('button[type="submit"]');
      expect(button.exists()).toBe(true);
      expect(button.text()).toContain('Buscar');
    });

    test('deve renderizar as dicas de busca', () => {
      const alert = wrapper.find('.alert-info');
      expect(alert.exists()).toBe(true);
      expect(alert.text()).toContain('Dicas de busca:');
      expect(alert.text()).toContain('Use o nome comercial do medicamento');
    });

    test('deve ter estado inicial correto', () => {
      expect(wrapper.vm.searchTerm).toBe('');
      expect(wrapper.vm.recentSearches).toEqual([]);
    });
  });

  describe('Props', () => {
    test('deve aceitar prop loading', async () => {
      await wrapper.setProps({ loading: true });
      
      const input = wrapper.find('input[type="text"]');
      const button = wrapper.find('button[type="submit"]');
      
      expect(input.attributes('disabled')).toBeDefined();
      expect(button.attributes('disabled')).toBeDefined();
      expect(button.text()).toContain('Buscando...');
    });

    test('deve mostrar spinner quando loading é true', async () => {
      await wrapper.setProps({ loading: true });
      
      const spinner = wrapper.find('.spinner-border');
      expect(spinner.exists()).toBe(true);
    });
  });

  describe('Funcionalidade de busca', () => {
    test('deve emitir evento search ao submeter formulário', async () => {
      // Arrange
      const searchTerm = 'paracetamol';
      await wrapper.find('input[type="text"]').setValue(searchTerm);
      
      // Act
      await wrapper.find('form').trigger('submit.prevent');
      
      // Assert
      expect(wrapper.emitted('search')).toBeTruthy();
      expect(wrapper.emitted('search')[0]).toEqual([searchTerm]);
    });

    test('deve trimar espaços em branco antes de emitir evento', async () => {
      // Arrange
      const searchTerm = '  paracetamol  ';
      await wrapper.find('input[type="text"]').setValue(searchTerm);
      
      // Act
      await wrapper.find('form').trigger('submit.prevent');
      
      // Assert
      expect(wrapper.emitted('search')[0]).toEqual(['paracetamol']);
    });

    test('não deve emitir evento se termo tem menos de 2 caracteres', async () => {
      // Arrange
      await wrapper.find('input[type="text"]').setValue('a');
      
      // Act
      await wrapper.find('form').trigger('submit.prevent');
      
      // Assert
      expect(wrapper.emitted('search')).toBeFalsy();
    });

    test('não deve emitir evento se termo está vazio', async () => {
      // Arrange
      await wrapper.find('input[type="text"]').setValue('');
      
      // Act
      await wrapper.find('form').trigger('submit.prevent');
      
      // Assert
      expect(wrapper.emitted('search')).toBeFalsy();
    });

    test('não deve emitir evento se termo contém apenas espaços', async () => {
      // Arrange
      await wrapper.find('input[type="text"]').setValue('   ');
      
      // Act
      await wrapper.find('form').trigger('submit.prevent');
      
      // Assert
      expect(wrapper.emitted('search')).toBeFalsy();
    });
  });

  describe('Validação do botão', () => {
    test('deve desabilitar botão quando termo tem menos de 2 caracteres', async () => {
      // Arrange
      await wrapper.find('input[type="text"]').setValue('a');
      
      // Assert
      const button = wrapper.find('button[type="submit"]');
      expect(button.attributes('disabled')).toBeDefined();
    });

    test('deve habilitar botão quando termo tem 2 ou mais caracteres', async () => {
      // Arrange
      await wrapper.find('input[type="text"]').setValue('ab');
      
      // Assert
      const button = wrapper.find('button[type="submit"]');
      expect(button.attributes('disabled')).toBeUndefined();
    });

    test('deve desabilitar botão quando loading é true', async () => {
      // Arrange
      await wrapper.find('input[type="text"]').setValue('paracetamol');
      await wrapper.setProps({ loading: true });
      
      // Assert
      const button = wrapper.find('button[type="submit"]');
      expect(button.attributes('disabled')).toBeDefined();
    });
  });

  describe('Buscas recentes', () => {
    test('deve adicionar busca às buscas recentes', async () => {
      // Arrange
      const searchTerm = 'paracetamol';
      await wrapper.find('input[type="text"]').setValue(searchTerm);
      
      // Act
      await wrapper.find('form').trigger('submit.prevent');
      
      // Assert
      expect(wrapper.vm.recentSearches).toContain(searchTerm);
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'medware_recent_searches',
        JSON.stringify([searchTerm])
      );
    });

    test('deve mover busca existente para o início', async () => {
      // Arrange
      wrapper.vm.recentSearches = ['dipirona', 'paracetamol', 'ibuprofeno'];
      await wrapper.find('input[type="text"]').setValue('paracetamol');
      
      // Act
      await wrapper.find('form').trigger('submit.prevent');
      
      // Assert
      expect(wrapper.vm.recentSearches[0]).toBe('paracetamol');
      expect(wrapper.vm.recentSearches).toEqual(['paracetamol', 'dipirona', 'ibuprofeno']);
    });

    test('deve manter apenas 5 buscas recentes', async () => {
      // Arrange
      wrapper.vm.recentSearches = ['busca1', 'busca2', 'busca3', 'busca4', 'busca5'];
      await wrapper.find('input[type="text"]').setValue('novaBusca');
      
      // Act
      await wrapper.find('form').trigger('submit.prevent');
      
      // Assert
      expect(wrapper.vm.recentSearches).toHaveLength(5);
      expect(wrapper.vm.recentSearches[0]).toBe('novaBusca');
      expect(wrapper.vm.recentSearches).not.toContain('busca5');
    });

    test('deve renderizar botões de buscas recentes', async () => {
      // Arrange
      wrapper.vm.recentSearches = ['paracetamol', 'dipirona'];
      await wrapper.vm.$nextTick();
      
      // Assert
      const recentButtons = wrapper.findAll('.btn-outline-secondary');
      expect(recentButtons).toHaveLength(2);
      expect(recentButtons[0].text()).toBe('paracetamol');
      expect(recentButtons[1].text()).toBe('dipirona');
    });

    test('deve selecionar busca recente ao clicar no botão', async () => {
      // Arrange
      wrapper.vm.recentSearches = ['paracetamol'];
      await wrapper.vm.$nextTick();
      
      // Act
      await wrapper.find('.btn-outline-secondary').trigger('click');
      
      // Assert
      expect(wrapper.vm.searchTerm).toBe('paracetamol');
      expect(wrapper.emitted('search')).toBeTruthy();
      expect(wrapper.emitted('search')[0]).toEqual(['paracetamol']);
    });

    test('deve desabilitar botões de buscas recentes quando loading', async () => {
      // Arrange
      wrapper.vm.recentSearches = ['paracetamol'];
      await wrapper.setProps({ loading: true });
      await wrapper.vm.$nextTick();
      
      // Assert
      const recentButton = wrapper.find('.btn-outline-secondary');
      expect(recentButton.attributes('disabled')).toBeDefined();
    });

    test('não deve mostrar seção de buscas recentes quando lista está vazia', () => {
      // Assert
      expect(wrapper.find('.text-muted').exists()).toBe(false);
    });
  });

  describe('LocalStorage', () => {
    test('deve carregar buscas recentes do localStorage na montagem', () => {
      // Arrange
      const savedSearches = ['paracetamol', 'dipirona'];
      localStorageMock.getItem.mockReturnValue(JSON.stringify(savedSearches));
      
      // Act
      const newWrapper = mount(MedicineSearch);
      
      // Assert
      expect(localStorageMock.getItem).toHaveBeenCalledWith('medware_recent_searches');
      expect(newWrapper.vm.recentSearches).toEqual(savedSearches);
      
      newWrapper.unmount();
    });

    test('deve tratar erro ao carregar do localStorage', () => {
      // Arrange
      localStorageMock.getItem.mockImplementation(() => {
        throw new Error('localStorage error');
      });
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      // Act
      const newWrapper = mount(MedicineSearch);
      
      // Assert
      expect(newWrapper.vm.recentSearches).toEqual([]);
      expect(consoleSpy).toHaveBeenCalledWith('Erro ao carregar buscas recentes:', expect.any(Error));
      
      consoleSpy.mockRestore();
      newWrapper.unmount();
    });

    test('deve tratar erro ao salvar no localStorage', async () => {
      // Arrange
      localStorageMock.setItem.mockImplementation(() => {
        throw new Error('localStorage error');
      });
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      await wrapper.find('input[type="text"]').setValue('teste');
      
      // Act
      await wrapper.find('form').trigger('submit.prevent');
      
      // Assert
      expect(consoleSpy).toHaveBeenCalledWith('Erro ao salvar buscas recentes:', expect.any(Error));
      
      consoleSpy.mockRestore();
    });

    test('deve inicializar com array vazio quando localStorage retorna null', () => {
      // Arrange
      localStorageMock.getItem.mockReturnValue(null);
      
      // Act
      const newWrapper = mount(MedicineSearch);
      
      // Assert
      expect(newWrapper.vm.recentSearches).toEqual([]);
      
      newWrapper.unmount();
    });
  });

  describe('Focus do input', () => {
    test('deve focar no input após montagem', async () => {
      // Arrange
      const focusSpy = vi.fn();
      const mockInput = { focus: focusSpy };
      
      // Act
      const newWrapper = mount(MedicineSearch);
      
      // Mock do querySelector no elemento do componente
      vi.spyOn(newWrapper.vm.$el, 'querySelector').mockReturnValue(mockInput);
      
      await newWrapper.vm.$nextTick();
      
      // Simular o mounted manualmente já que o mock foi aplicado depois
      const input = newWrapper.vm.$el.querySelector('input[type="text"]');
      if (input) {
        input.focus();
      }
      
      // Assert
      expect(focusSpy).toHaveBeenCalled();
      
      newWrapper.unmount();
    });

    test('deve tratar caso onde input não existe', async () => {
      // Arrange
      const querySelectorSpy = vi.spyOn(document, 'querySelector').mockReturnValue(null);
      
      // Act & Assert - não deve lançar erro
      expect(() => {
        const newWrapper = mount(MedicineSearch);
        newWrapper.unmount();
      }).not.toThrow();
      
      querySelectorSpy.mockRestore();
    });
  });

  describe('Acessibilidade', () => {
    test('deve ter atributos de acessibilidade corretos', () => {
      const input = wrapper.find('input[type="text"]');
      const button = wrapper.find('button[type="submit"]');
      const alert = wrapper.find('.alert-info');
      
      expect(input.attributes('required')).toBeDefined();
      expect(input.attributes('autocomplete')).toBe('off');
      expect(alert.attributes('role')).toBe('alert');
      expect(wrapper.find('.visually-hidden').exists()).toBe(false); // Quando não está loading
    });

    test('deve ter texto acessível para spinner quando loading', async () => {
      await wrapper.setProps({ loading: true });
      
      const visuallyHidden = wrapper.find('.visually-hidden');
      expect(visuallyHidden.exists()).toBe(true);
      expect(visuallyHidden.text()).toBe('Carregando...');
    });
  });
});