import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import MedicineList from './MedicineList.vue'

describe('MedicineList.vue', () => {
  let wrapper
  const mockMedicines = [
    {
      codigo: '12345',
      nomeProduto: 'Paracetamol 500mg',
      principioAtivo: 'Paracetamol',
      empresa: 'Farmácia ABC',
      categoria: 'Analgésico',
      registro: 'MS-1.0123.0456'
    },
    {
      codigo: '67890',
      nomeComercial: 'Aspirina',
      principioAtivo: 'Ácido Acetilsalicílico',
      empresa: 'Farmácia XYZ',
      categoria: 'Anti-inflamatório',
      registro: 'MS-1.0789.0123'
    },
    {
      codigo: '11111',
      nomeProduto: 'Dipirona 500mg',
      principioAtivo: 'Dipirona Sódica',
      empresa: 'Laboratório DEF'
    }
  ]

  beforeEach(() => {
    wrapper = null
  })

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount()
    }
  })

  describe('Renderização Inicial', () => {
    it('deve renderizar corretamente com medicamentos', () => {
      wrapper = mount(MedicineList, {
        props: {
          medicines: mockMedicines
        }
      })

      expect(wrapper.find('.medicine-list').exists()).toBe(true)
      expect(wrapper.find('h3').text()).toContain('Resultados da Busca')
      expect(wrapper.findAll('.medicine-card')).toHaveLength(3)
    })

    it('deve exibir o contador correto de medicamentos', () => {
      wrapper = mount(MedicineList, {
        props: {
          medicines: mockMedicines
        }
      })

      const badge = wrapper.find('.badge')
      expect(badge.text()).toBe('3 medicamentos encontrados')
    })

    it('deve exibir contador no singular para um medicamento', () => {
      wrapper = mount(MedicineList, {
        props: {
          medicines: [mockMedicines[0]]
        }
      })

      const badge = wrapper.find('.badge')
      expect(badge.text()).toBe('1 medicamento encontrado')
    })

    it('deve renderizar estado vazio quando não há medicamentos', () => {
      wrapper = mount(MedicineList, {
        props: {
          medicines: []
        }
      })

      expect(wrapper.find('.empty-state').exists()).toBe(true)
      expect(wrapper.find('.empty-state h4').text()).toBe('Nenhum medicamento encontrado')
      expect(wrapper.findAll('.medicine-card')).toHaveLength(0)
    })
  })

  describe('Props', () => {
    it('deve aceitar prop medicines como array', () => {
      wrapper = mount(MedicineList, {
        props: {
          medicines: mockMedicines
        }
      })

      expect(wrapper.props('medicines')).toEqual(mockMedicines)
    })

    it('deve usar array vazio como padrão para medicines', () => {
      wrapper = mount(MedicineList)
      expect(wrapper.props('medicines')).toEqual([])
    })

    it('deve validar que medicines é um array', () => {
      const { medicines } = MedicineList.props
      expect(medicines.type).toBe(Array)
      expect(medicines.required).toBe(true)
    })
  })

  describe('Renderização de Dados do Medicamento', () => {
    beforeEach(() => {
      wrapper = mount(MedicineList, {
        props: {
          medicines: mockMedicines
        }
      })
    })

    it('deve exibir nome do produto ou nome comercial', () => {
      const cards = wrapper.findAll('.medicine-card')
      
      expect(cards[0].find('.card-title').text()).toContain('Paracetamol 500mg')
      expect(cards[1].find('.card-title').text()).toContain('Aspirina')
    })

    it('deve exibir princípio ativo quando disponível', () => {
      const cards = wrapper.findAll('.medicine-card')
      
      expect(cards[0].text()).toContain('Princípio Ativo:')
      expect(cards[0].text()).toContain('Paracetamol')
    })

    it('deve exibir empresa quando disponível', () => {
      const cards = wrapper.findAll('.medicine-card')
      
      expect(cards[0].text()).toContain('Fabricante:')
      expect(cards[0].text()).toContain('Farmácia ABC')
    })

    it('deve exibir categoria quando disponível', () => {
      const cards = wrapper.findAll('.medicine-card')
      
      expect(cards[0].text()).toContain('Categoria:')
      expect(cards[0].text()).toContain('Analgésico')
    })

    it('deve exibir registro quando disponível', () => {
      const cards = wrapper.findAll('.medicine-card')
      
      expect(cards[0].text()).toContain('Registro:')
      expect(cards[0].text()).toContain('MS-1.0123.0456')
    })

    it('deve exibir código do medicamento no footer', () => {
      const cards = wrapper.findAll('.medicine-card')
      
      expect(cards[0].find('.card-footer').text()).toContain('Código: 12345')
    })

    it('deve lidar com campos opcionais ausentes', () => {
      const medicineWithMissingFields = {
        codigo: '99999',
        nomeProduto: 'Medicamento Teste'
      }

      wrapper = mount(MedicineList, {
        props: {
          medicines: [medicineWithMissingFields]
        }
      })

      const card = wrapper.find('.medicine-card')
      expect(card.text()).not.toContain('Princípio Ativo:')
      expect(card.text()).not.toContain('Fabricante:')
      expect(card.text()).not.toContain('Categoria:')
      expect(card.text()).not.toContain('Registro:')
    })
  })

  describe('Interações', () => {
    beforeEach(() => {
      wrapper = mount(MedicineList, {
        props: {
          medicines: mockMedicines
        }
      })
    })

    it('deve emitir evento select ao clicar no card', async () => {
      const firstCard = wrapper.find('.medicine-card')
      await firstCard.trigger('click')

      expect(wrapper.emitted('select')).toBeTruthy()
      expect(wrapper.emitted('select')[0]).toEqual([mockMedicines[0]])
    })

    it('deve emitir evento select ao clicar no botão Ver Detalhes', async () => {
      const button = wrapper.find('.btn-outline-primary')
      await button.trigger('click')

      expect(wrapper.emitted('select')).toBeTruthy()
      expect(wrapper.emitted('select')[0]).toEqual([mockMedicines[0]])
    })

    it('deve chamar método selectMedicine com medicamento correto', async () => {
      const selectMedicineSpy = vi.spyOn(wrapper.vm, 'selectMedicine')
      
      const firstCard = wrapper.find('.medicine-card')
      await firstCard.trigger('click')

      expect(selectMedicineSpy).toHaveBeenCalledWith(mockMedicines[0])
    })

    it('deve emitir eventos para medicamentos diferentes', async () => {
      const cards = wrapper.findAll('.medicine-card')
      
      await cards[0].trigger('click')
      await cards[1].trigger('click')

      expect(wrapper.emitted('select')).toHaveLength(2)
      expect(wrapper.emitted('select')[0]).toEqual([mockMedicines[0]])
      expect(wrapper.emitted('select')[1]).toEqual([mockMedicines[1]])
    })
  })

  describe('Métodos', () => {
    beforeEach(() => {
      wrapper = mount(MedicineList, {
        props: {
          medicines: mockMedicines
        }
      })
    })

    describe('selectMedicine', () => {
      it('deve emitir evento select com medicamento', () => {
        const medicine = mockMedicines[0]
        wrapper.vm.selectMedicine(medicine)

        expect(wrapper.emitted('select')).toBeTruthy()
        expect(wrapper.emitted('select')[0]).toEqual([medicine])
      })
    })

    describe('truncateText', () => {
      it('deve retornar texto original se menor que maxLength', () => {
        const result = wrapper.vm.truncateText('Texto curto', 50)
        expect(result).toBe('Texto curto')
      })

      it('deve truncar texto se maior que maxLength', () => {
        const longText = 'Este é um texto muito longo que deve ser truncado'
        const result = wrapper.vm.truncateText(longText, 20)
        expect(result).toBe('Este é um texto muit...')
      })

      it('deve retornar string vazia para texto null/undefined', () => {
        expect(wrapper.vm.truncateText(null)).toBe('')
        expect(wrapper.vm.truncateText(undefined)).toBe('')
        expect(wrapper.vm.truncateText('')).toBe('')
      })

      it('deve usar maxLength padrão de 50', () => {
        const longText = 'a'.repeat(60)
        const result = wrapper.vm.truncateText(longText)
        expect(result).toHaveLength(53) // 50 + '...'
        expect(result.endsWith('...')).toBe(true)
      })
    })
  })

  describe('Renderização Condicional', () => {
    it('deve mostrar paginação quando há mais de 12 medicamentos', () => {
      const manyMedicines = Array.from({ length: 15 }, (_, i) => ({
        codigo: `code${i}`,
        nomeProduto: `Medicamento ${i}`,
        principioAtivo: `Princípio ${i}`
      }))

      wrapper = mount(MedicineList, {
        props: {
          medicines: manyMedicines
        }
      })

      expect(wrapper.find('.pagination').exists()).toBe(true)
    })

    it('não deve mostrar paginação quando há 12 ou menos medicamentos', () => {
      wrapper = mount(MedicineList, {
        props: {
          medicines: mockMedicines
        }
      })

      expect(wrapper.find('.pagination').exists()).toBe(false)
    })
  })

  describe('Acessibilidade', () => {
    beforeEach(() => {
      wrapper = mount(MedicineList, {
        props: {
          medicines: mockMedicines
        }
      })
    })

    it('deve ter ícones apropriados para cada seção', () => {
      const card = wrapper.find('.medicine-card')
      
      expect(card.find('.bi-capsule-pill').exists()).toBe(true)
      expect(card.find('.bi-flask').exists()).toBe(true)
      expect(card.find('.bi-building').exists()).toBe(true)
      expect(card.find('.bi-eye').exists()).toBe(true)
    })

    it('deve ter aria-label na navegação de paginação', () => {
      const manyMedicines = Array.from({ length: 15 }, (_, i) => ({
        codigo: `code${i}`,
        nomeProduto: `Medicamento ${i}`
      }))

      wrapper = mount(MedicineList, {
        props: {
          medicines: manyMedicines
        }
      })

      const nav = wrapper.find('nav')
      expect(nav.attributes('aria-label')).toBe('Navegação de resultados')
    })

    it('deve ter botões com texto descritivo', () => {
      const button = wrapper.find('.btn-outline-primary')
      expect(button.text()).toContain('Ver Detalhes')
    })
  })

  describe('Estilos e Classes CSS', () => {
    beforeEach(() => {
      wrapper = mount(MedicineList, {
        props: {
          medicines: mockMedicines
        }
      })
    })

    it('deve aplicar classes CSS corretas', () => {
      expect(wrapper.find('.medicine-list').exists()).toBe(true)
      expect(wrapper.find('.medicine-card').exists()).toBe(true)
      expect(wrapper.find('.card-title').exists()).toBe(true)
      expect(wrapper.find('.info-item').exists()).toBe(true)
    })

    it('deve ter classes Bootstrap apropriadas', () => {
      const card = wrapper.find('.medicine-card')
      expect(card.classes()).toContain('card')
      expect(card.classes()).toContain('h-100')
      
      const button = wrapper.find('.btn-outline-primary')
      expect(button.classes()).toContain('btn')
      expect(button.classes()).toContain('w-100')
    })
  })
})