import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import MedicineDetails from './MedicineDetails.vue'

describe('MedicineDetails.vue', () => {
  let wrapper
  const mockMedicine = {
    codigoProduto: '12345',
    nomeProduto: 'Paracetamol 500mg',
    nomeComercial: 'Tylenol',
    numeroRegistro: 'MS-1.0123.0456',
    principioAtivo: 'Paracetamol',
    medicamentoReferencia: 'Tylenol Original',
    categoriaRegulatoria: 'Medicamento Similar',
    tipoProduto: 'Medicamento',
    classesTerapeuticas: ['Analgésico', 'Antipirético'],
    dataProduto: '2023-01-15',
    dataVencimento: '2025-01-15',
    dataVencimentoRegistro: '2028-01-15',
    mesAnoVencimento: '01/2025',
    empresa: {
      razaoSocial: 'Farmácia ABC Ltda',
      cnpj: '12345678000199',
      endereco: 'Rua das Flores, 123'
    },
    codigoBulaPaciente: 'BP123',
    codigoBulaProfissional: 'BF123',
    indicacoes: 'Indicado para dor e febre',
    contraindicacoes: 'Não usar em caso de alergia',
    posologia: 'Tomar 1 comprimido a cada 6 horas',
    superdosagem: 'Em caso de superdosagem, procurar ajuda médica'
  }

  beforeEach(() => {
    // Mock document.body.classList
    document.body.classList = {
      add: vi.fn(),
      remove: vi.fn()
    }
    wrapper = null
  })

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount()
    }
    // Recriar os mocks após limpar
    vi.clearAllMocks()
    document.body.classList = {
      add: vi.fn(),
      remove: vi.fn()
    }
  })

  describe('Renderização Inicial', () => {
    it('deve renderizar modal quando show é true', () => {
      wrapper = mount(MedicineDetails, {
        props: {
          medicine: mockMedicine,
          show: true
        }
      })

      expect(wrapper.find('.modal').exists()).toBe(true)
      expect(wrapper.find('.modal').classes()).toContain('show')
      expect(wrapper.find('.modal-backdrop').exists()).toBe(true)
    })

    it('não deve renderizar modal quando show é false', () => {
      wrapper = mount(MedicineDetails, {
        props: {
          medicine: mockMedicine,
          show: false
        }
      })

      expect(wrapper.find('.modal').exists()).toBe(true)
      expect(wrapper.find('.modal').classes()).not.toContain('show')
      expect(wrapper.find('.modal-backdrop').exists()).toBe(false)
    })

    it('deve exibir estado de carregamento quando medicine é null', () => {
      wrapper = mount(MedicineDetails, {
        props: {
          medicine: null,
          show: true
        }
      })

      expect(wrapper.find('.spinner-border').exists()).toBe(true)
      expect(wrapper.text()).toContain('Carregando detalhes do medicamento...')
    })

    it('deve exibir detalhes do medicamento quando medicine está presente', () => {
      wrapper = mount(MedicineDetails, {
        props: {
          medicine: mockMedicine,
          show: true
        }
      })

      expect(wrapper.find('.medicine-details').exists()).toBe(true)
      expect(wrapper.text()).toContain('Paracetamol 500mg')
      expect(wrapper.find('.spinner-border').exists()).toBe(false)
    })
  })

  describe('Props', () => {
    it('deve aceitar prop medicine como objeto', () => {
      wrapper = mount(MedicineDetails, {
        props: {
          medicine: mockMedicine,
          show: true
        }
      })

      expect(wrapper.props('medicine')).toEqual(mockMedicine)
    })

    it('deve aceitar prop show como boolean', () => {
      wrapper = mount(MedicineDetails, {
        props: {
          medicine: mockMedicine,
          show: true
        }
      })

      expect(wrapper.props('show')).toBe(true)
    })

    it('deve usar valores padrão para props', () => {
      wrapper = mount(MedicineDetails)
      
      expect(wrapper.props('medicine')).toBe(null)
      expect(wrapper.props('show')).toBe(false)
    })

    it('deve validar tipos das props', () => {
      const { medicine, show } = MedicineDetails.props
      
      expect(medicine.type).toBe(Object)
      expect(medicine.default).toBe(null)
      expect(show.type).toBe(Boolean)
      expect(show.default).toBe(false)
    })
  })

  describe('Renderização de Dados', () => {
    beforeEach(() => {
      wrapper = mount(MedicineDetails, {
        props: {
          medicine: mockMedicine,
          show: true
        }
      })
    })

    it('deve exibir nome do produto no cabeçalho', () => {
      expect(wrapper.find('h2').text()).toContain('Paracetamol 500mg')
    })

    it('deve exibir informações básicas', () => {
      expect(wrapper.text()).toContain('Nome Comercial:')
      expect(wrapper.text()).toContain('Tylenol')
      expect(wrapper.text()).toContain('Código do Produto:')
      expect(wrapper.text()).toContain('12345')
      expect(wrapper.text()).toContain('Número de Registro:')
      expect(wrapper.text()).toContain('MS-1.0123.0456')
    })

    it('deve exibir classes terapêuticas como badges', () => {
      const badges = wrapper.findAll('.badge.bg-secondary')
      expect(badges).toHaveLength(2)
      expect(badges[0].text()).toBe('Analgésico')
      expect(badges[1].text()).toBe('Antipirético')
    })

    it('deve exibir datas formatadas', () => {
      expect(wrapper.text()).toContain('Data do Produto:')
      // Usar regex para ser mais flexível com formatação de data
      expect(wrapper.text()).toMatch(/1[45]\/01\/2023/)
    })

    it('deve exibir informações da empresa', () => {
      expect(wrapper.text()).toContain('Razão Social:')
      expect(wrapper.text()).toContain('Farmácia ABC Ltda')
    })

    it('deve exibir código no footer', () => {
      expect(wrapper.find('.modal-footer').text()).toContain('Código: 12345')
      expect(wrapper.find('.modal-footer').text()).toContain('Registro: MS-1.0123.0456')
    })
  })

  describe('Renderização Condicional', () => {
    it('deve ocultar seções quando dados não estão disponíveis', () => {
      const medicineWithoutOptionalFields = {
        codigoProduto: '12345',
        nomeProduto: 'Medicamento Teste'
      }

      wrapper = mount(MedicineDetails, {
        props: {
          medicine: medicineWithoutOptionalFields,
          show: true
        }
      })

      expect(wrapper.text()).not.toContain('Classes Terapêuticas')
      expect(wrapper.text()).not.toContain('Empresa')
    })

    it('deve exibir "Não informado" para campos obrigatórios ausentes', () => {
      const medicineWithMissingFields = {
        codigoProduto: '12345'
        // Sem nomeComercial nem nomeProduto para testar o fallback
      }

      wrapper = mount(MedicineDetails, {
        props: {
          medicine: medicineWithMissingFields,
          show: true
        }
      })

      expect(wrapper.text()).toContain('Não informado')
    })

    it('deve mostrar classes terapêuticas apenas quando disponíveis', () => {
      const medicineWithClasses = {
        ...mockMedicine,
        classesTerapeuticas: ['Teste']
      }

      wrapper = mount(MedicineDetails, {
        props: {
          medicine: medicineWithClasses,
          show: true
        }
      })

      expect(wrapper.text()).toContain('Classes Terapêuticas')
      expect(wrapper.find('.badge.bg-secondary').text()).toBe('Teste')
    })
  })

  describe('Eventos e Interações', () => {
    beforeEach(() => {
      wrapper = mount(MedicineDetails, {
        props: {
          medicine: mockMedicine,
          show: true
        }
      })
    })

    it('deve emitir evento close ao clicar no botão fechar', async () => {
      const closeButton = wrapper.find('.btn-close')
      await closeButton.trigger('click')

      expect(wrapper.emitted('close')).toBeTruthy()
    })

    it('deve emitir evento close ao clicar no botão Fechar', async () => {
      const closeButton = wrapper.find('.btn-secondary')
      await closeButton.trigger('click')

      expect(wrapper.emitted('close')).toBeTruthy()
    })

    it('deve emitir evento close ao clicar no backdrop', async () => {
      const backdrop = wrapper.find('.modal-backdrop')
      await backdrop.trigger('click')

      expect(wrapper.emitted('close')).toBeTruthy()
    })

    it('deve emitir evento close ao clicar na área do modal', async () => {
      const modal = wrapper.find('.modal')
      await modal.trigger('click')

      expect(wrapper.emitted('close')).toBeTruthy()
    })

    it('deve emitir evento download-pdf para bula do paciente', async () => {
      const patientButton = wrapper.find('.btn-success')
      await patientButton.trigger('click')

      expect(wrapper.emitted('download-pdf')).toBeTruthy()
      expect(wrapper.emitted('download-pdf')[0]).toEqual(['BP123', 'paciente'])
    })

    it('deve emitir evento download-pdf para bula profissional', async () => {
      const professionalButton = wrapper.find('.btn-info')
      await professionalButton.trigger('click')

      expect(wrapper.emitted('download-pdf')).toBeTruthy()
      expect(wrapper.emitted('download-pdf')[0]).toEqual(['BF123', 'profissional'])
    })

    it('deve desabilitar botões de download quando códigos não estão disponíveis', () => {
      const medicineWithoutCodes = {
        ...mockMedicine,
        codigoBulaPaciente: null,
        codigoBulaProfissional: null
      }

      wrapper = mount(MedicineDetails, {
        props: {
          medicine: medicineWithoutCodes,
          show: true
        }
      })

      const patientButton = wrapper.find('.btn-success')
      const professionalButton = wrapper.find('.btn-info')

      expect(patientButton.attributes('disabled')).toBeDefined()
      expect(professionalButton.attributes('disabled')).toBeDefined()
    })
  })

  describe('Métodos', () => {
    beforeEach(() => {
      wrapper = mount(MedicineDetails, {
        props: {
          medicine: mockMedicine,
          show: true
        }
      })
    })

    describe('closeModal', () => {
      it('deve emitir evento close', () => {
        wrapper.vm.closeModal()
        expect(wrapper.emitted('close')).toBeTruthy()
      })
    })

    describe('downloadPDF', () => {
      it('deve emitir evento para download de bula do paciente', () => {
        wrapper.vm.downloadPDF('patient')
        expect(wrapper.emitted('download-pdf')).toBeTruthy()
        expect(wrapper.emitted('download-pdf')[0]).toEqual(['BP123', 'paciente'])
      })

      it('deve emitir evento para download de bula profissional', () => {
        wrapper.vm.downloadPDF('professional')
        expect(wrapper.emitted('download-pdf')).toBeTruthy()
        expect(wrapper.emitted('download-pdf')[0]).toEqual(['BF123', 'profissional'])
      })

      it('não deve emitir evento quando medicine é null', () => {
        wrapper = mount(MedicineDetails, {
          props: {
            medicine: null,
            show: true
          }
        })

        wrapper.vm.downloadPDF('patient')
        expect(wrapper.emitted('download-pdf')).toBeFalsy()
      })

      it('não deve emitir evento quando código não está disponível', () => {
        const medicineWithoutCode = {
          ...mockMedicine,
          codigoBulaPaciente: null
        }

        wrapper = mount(MedicineDetails, {
          props: {
            medicine: medicineWithoutCode,
            show: true
          }
        })

        wrapper.vm.downloadPDF('patient')
        expect(wrapper.emitted('download-pdf')).toBeFalsy()
      })
    })

    describe('formatDate', () => {
      it('deve formatar data corretamente', () => {
        const result = wrapper.vm.formatDate('2023-01-15')
        // toLocaleDateString pode retornar diferentes formatos dependendo do ambiente
        expect(result).toMatch(/\d{1,2}\/\d{1,2}\/\d{4}/)
      })

      it('deve retornar "Não informado" para data null/undefined', () => {
        expect(wrapper.vm.formatDate(null)).toBe('Não informado')
        expect(wrapper.vm.formatDate(undefined)).toBe('Não informado')
        expect(wrapper.vm.formatDate('')).toBe('Não informado')
      })

      it('deve retornar "Invalid Date" para data inválida', () => {
        const invalidDate = 'data-inválida'
        const result = wrapper.vm.formatDate(invalidDate)
        expect(result).toBe('Invalid Date')
      })
    })

    describe('formatCNPJ', () => {
      it('deve formatar CNPJ corretamente', () => {
        const result = wrapper.vm.formatCNPJ('12345678000199')
        expect(result).toBe('12.345.678/0001-99')
      })

      it('deve formatar CNPJ com caracteres especiais', () => {
        const result = wrapper.vm.formatCNPJ('12.345.678/0001-99')
        expect(result).toBe('12.345.678/0001-99')
      })

      it('deve retornar "Não informado" para CNPJ null/undefined', () => {
        expect(wrapper.vm.formatCNPJ(null)).toBe('Não informado')
        expect(wrapper.vm.formatCNPJ(undefined)).toBe('Não informado')
        expect(wrapper.vm.formatCNPJ('')).toBe('Não informado')
      })

      it('deve retornar CNPJ original se não tiver 14 dígitos', () => {
        const shortCNPJ = '123456789'
        const result = wrapper.vm.formatCNPJ(shortCNPJ)
        expect(result).toBe(shortCNPJ)
      })
    })

    describe('getTargaClass', () => {
      it('deve retornar classe correta para tarja vermelha', () => {
        const result = wrapper.vm.getTargaClass('vermelha')
        expect(result).toBe('bg-danger')
      })

      it('deve retornar classe correta para tarja amarela', () => {
        const result = wrapper.vm.getTargaClass('amarela')
        expect(result).toBe('bg-warning text-dark')
      })

      it('deve retornar classe correta para tarja preta', () => {
        const result = wrapper.vm.getTargaClass('preta')
        expect(result).toBe('bg-dark')
      })

      it('deve retornar classe padrão para tarja desconhecida', () => {
        const result = wrapper.vm.getTargaClass('azul')
        expect(result).toBe('bg-secondary')
      })

      it('deve retornar classe padrão para tarja null/undefined', () => {
        expect(wrapper.vm.getTargaClass(null)).toBe('bg-secondary')
        expect(wrapper.vm.getTargaClass(undefined)).toBe('bg-secondary')
      })

      it('deve ser case insensitive', () => {
        expect(wrapper.vm.getTargaClass('VERMELHA')).toBe('bg-danger')
        expect(wrapper.vm.getTargaClass('Amarela')).toBe('bg-warning text-dark')
      })
    })
  })

  describe('Watchers e Lifecycle', () => {
    let addSpy, removeSpy

    beforeEach(() => {
      // Criar spies
      addSpy = vi.fn()
      removeSpy = vi.fn()
      
      // Mock do document.body.classList usando Object.defineProperty
      Object.defineProperty(document.body, 'classList', {
        value: {
          add: addSpy,
          remove: removeSpy
        },
        writable: true,
        configurable: true
      })
    })

    it('deve adicionar classe modal-open ao body quando show muda para true', async () => {
      wrapper = mount(MedicineDetails, {
        props: {
          medicine: mockMedicine,
          show: false
        }
      })

      await wrapper.setProps({ show: true })
      expect(addSpy).toHaveBeenCalledWith('modal-open')
    })

    it('deve remover classe modal-open ao body quando show muda para false', async () => {
      wrapper = mount(MedicineDetails, {
        props: {
          medicine: mockMedicine,
          show: false
        }
      })

      // Primeiro definir como true
      await wrapper.setProps({ show: true })
      expect(addSpy).toHaveBeenCalledWith('modal-open')
      
      // Limpar chamadas anteriores
      addSpy.mockClear()
      removeSpy.mockClear()

      // Depois definir como false
      await wrapper.setProps({ show: false })
      expect(removeSpy).toHaveBeenCalledWith('modal-open')
    })

    it('deve remover classe modal-open do body no beforeUnmount', async () => {
      wrapper = mount(MedicineDetails, {
        props: {
          medicine: mockMedicine,
          show: false
        }
      })

      // Primeiro definir como true para que haja algo para remover
      await wrapper.setProps({ show: true })
      expect(addSpy).toHaveBeenCalledWith('modal-open')
      
      // Limpar chamadas anteriores
      addSpy.mockClear()
      removeSpy.mockClear()

      wrapper.unmount()
      expect(removeSpy).toHaveBeenCalledWith('modal-open')
    })
  })

  describe('Acessibilidade', () => {
    beforeEach(() => {
      wrapper = mount(MedicineDetails, {
        props: {
          medicine: mockMedicine,
          show: true
        }
      })
    })

    it('deve ter atributos ARIA corretos', () => {
      const modal = wrapper.find('.modal')
      expect(modal.attributes('aria-labelledby')).toBe('medicineDetailsLabel')
      expect(modal.attributes('aria-hidden')).toBe('false')
      expect(modal.attributes('tabindex')).toBe('-1')
    })

    it('deve ter botão de fechar com aria-label', () => {
      const closeButton = wrapper.find('.btn-close')
      expect(closeButton.attributes('aria-label')).toBe('Fechar')
    })

    it('deve ter spinner com texto para screen readers', () => {
      wrapper = mount(MedicineDetails, {
        props: {
          medicine: null,
          show: true
        }
      })

      const spinner = wrapper.find('.spinner-border')
      expect(spinner.attributes('role')).toBe('status')
      expect(wrapper.find('.visually-hidden').text()).toBe('Carregando...')
    })

    it('deve ter ícones apropriados para cada seção', () => {
      expect(wrapper.find('.bi-info-circle').exists()).toBe(true)
      expect(wrapper.find('.bi-capsule-pill').exists()).toBe(true)
      expect(wrapper.find('.bi-info-square').exists()).toBe(true)
      expect(wrapper.find('.bi-download').exists()).toBe(true)
    })
  })

  describe('Estilos e Classes CSS', () => {
    beforeEach(() => {
      wrapper = mount(MedicineDetails, {
        props: {
          medicine: mockMedicine,
          show: true
        }
      })
    })

    it('deve aplicar classes CSS corretas', () => {
      expect(wrapper.find('.modal').exists()).toBe(true)
      expect(wrapper.find('.modal-dialog').exists()).toBe(true)
      expect(wrapper.find('.modal-content').exists()).toBe(true)
      expect(wrapper.find('.medicine-details').exists()).toBe(true)
    })

    it('deve ter classes Bootstrap apropriadas', () => {
      const modal = wrapper.find('.modal')
      expect(modal.classes()).toContain('fade')
      
      const dialog = wrapper.find('.modal-dialog')
      expect(dialog.classes()).toContain('modal-xl')
      expect(dialog.classes()).toContain('modal-dialog-scrollable')
    })

    it('deve aplicar estilos condicionais baseados no estado show', async () => {
      const modal = wrapper.find('.modal')
      expect(modal.classes()).toContain('show')
      expect(modal.attributes('style')).toContain('display: block')

      await wrapper.setProps({ show: false })
      expect(modal.classes()).not.toContain('show')
      expect(modal.attributes('style')).toContain('display: none')
    })
  })
})