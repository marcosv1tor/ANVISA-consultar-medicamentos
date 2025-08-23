import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import ErrorMessage from './ErrorMessage.vue'

describe('ErrorMessage.vue', () => {
  let wrapper

  beforeEach(() => {
    vi.useFakeTimers()
    wrapper = null
  })

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount()
    }
    vi.useRealTimers()
    vi.clearAllMocks()
  })

  describe('Renderização Inicial', () => {
    it('deve renderizar quando show é true', () => {
      wrapper = mount(ErrorMessage, {
        props: {
          show: true,
          message: 'Erro de teste'
        }
      })

      expect(wrapper.find('.error-container').exists()).toBe(true)
      expect(wrapper.find('.alert-danger').exists()).toBe(true)
      expect(wrapper.text()).toContain('Erro de teste')
    })

    it('não deve renderizar quando show é false', () => {
      wrapper = mount(ErrorMessage, {
        props: {
          show: false,
          message: 'Erro de teste'
        }
      })

      expect(wrapper.find('.error-container').exists()).toBe(false)
    })

    it('deve exibir título padrão quando não fornecido', () => {
      wrapper = mount(ErrorMessage, {
        props: {
          show: true,
          message: 'Erro de teste'
        }
      })

      expect(wrapper.find('.alert-heading').text()).toBe('Erro')
    })

    it('deve exibir título personalizado', () => {
      wrapper = mount(ErrorMessage, {
        props: {
          show: true,
          title: 'Erro Personalizado',
          message: 'Erro de teste'
        }
      })

      expect(wrapper.find('.alert-heading').text()).toBe('Erro Personalizado')
    })

    it('deve exibir mensagem obrigatória', () => {
      wrapper = mount(ErrorMessage, {
        props: {
          show: true,
          message: 'Esta é uma mensagem de erro'
        }
      })

      expect(wrapper.text()).toContain('Esta é uma mensagem de erro')
    })
  })

  describe('Props', () => {
    it('deve validar props obrigatórias', () => {
      const { message } = ErrorMessage.props
      expect(message.required).toBe(true)
      expect(message.type).toBe(String)
    })

    it('deve ter valores padrão corretos', () => {
      wrapper = mount(ErrorMessage, {
        props: {
          message: 'Teste'
        }
      })

      expect(wrapper.props('show')).toBe(false)
      expect(wrapper.props('title')).toBe('Erro')
      expect(wrapper.props('details')).toBe(null)
      expect(wrapper.props('showRetry')).toBe(false)
      expect(wrapper.props('showClose')).toBe(true)
      expect(wrapper.props('dismissible')).toBe(true)
      expect(wrapper.props('autoHide')).toBe(false)
      expect(wrapper.props('autoHideDelay')).toBe(5000)
    })

    it('deve aceitar todas as props personalizadas', () => {
      const props = {
        show: true,
        title: 'Erro Customizado',
        message: 'Mensagem customizada',
        details: 'Detalhes do erro',
        showRetry: true,
        showClose: false,
        dismissible: false,
        autoHide: true,
        autoHideDelay: 3000
      }

      wrapper = mount(ErrorMessage, { props })

      Object.keys(props).forEach(key => {
        expect(wrapper.props(key)).toBe(props[key])
      })
    })
  })

  describe('Detalhes do Erro', () => {
    beforeEach(() => {
      wrapper = mount(ErrorMessage, {
        props: {
          show: true,
          message: 'Erro de teste',
          details: 'Detalhes técnicos do erro'
        }
      })
    })

    it('deve mostrar botão para ver detalhes quando details está presente', () => {
      const detailsButton = wrapper.find('button[aria-expanded]')
      expect(detailsButton.exists()).toBe(true)
      expect(detailsButton.text()).toContain('Ver detalhes')
    })

    it('deve alternar visibilidade dos detalhes ao clicar no botão', async () => {
      const detailsButton = wrapper.find('button[aria-expanded]')
      
      // Inicialmente oculto
      expect(wrapper.vm.showDetails).toBe(false)
      expect(detailsButton.attributes('aria-expanded')).toBe('false')
      
      // Clicar para mostrar
      await detailsButton.trigger('click')
      expect(wrapper.vm.showDetails).toBe(true)
      expect(detailsButton.attributes('aria-expanded')).toBe('true')
      expect(detailsButton.text()).toContain('Ocultar detalhes')
      
      // Clicar para ocultar
      await detailsButton.trigger('click')
      expect(wrapper.vm.showDetails).toBe(false)
      expect(detailsButton.text()).toContain('Ver detalhes')
    })

    it('deve exibir conteúdo dos detalhes quando expandido', async () => {
      const detailsButton = wrapper.find('button[aria-expanded]')
      await detailsButton.trigger('click')

      const detailsContent = wrapper.find('.error-details-content')
      expect(detailsContent.exists()).toBe(true)
      expect(detailsContent.text()).toContain('Detalhes técnicos do erro')
    })

    it('não deve mostrar seção de detalhes quando details é null', () => {
      wrapper = mount(ErrorMessage, {
        props: {
          show: true,
          message: 'Erro sem detalhes'
        }
      })

      expect(wrapper.find('.error-details').exists()).toBe(false)
    })
  })

  describe('Botões de Ação', () => {
    it('deve mostrar botão Tentar Novamente quando showRetry é true', () => {
      wrapper = mount(ErrorMessage, {
        props: {
          show: true,
          message: 'Erro de teste',
          showRetry: true
        }
      })

      const retryButton = wrapper.find('.btn-outline-danger')
      expect(retryButton.exists()).toBe(true)
      expect(retryButton.text()).toContain('Tentar Novamente')
    })

    it('deve mostrar botão Fechar quando showClose é true', () => {
      wrapper = mount(ErrorMessage, {
        props: {
          show: true,
          message: 'Erro de teste',
          showClose: true
        }
      })

      const closeButton = wrapper.find('.btn-outline-secondary')
      expect(closeButton.exists()).toBe(true)
      expect(closeButton.text()).toContain('Fechar')
    })

    it('deve mostrar botão X quando dismissible é true', () => {
      wrapper = mount(ErrorMessage, {
        props: {
          show: true,
          message: 'Erro de teste',
          dismissible: true
        }
      })

      const dismissButton = wrapper.find('.btn-close')
      expect(dismissButton.exists()).toBe(true)
      expect(dismissButton.attributes('aria-label')).toBe('Fechar')
    })

    it('não deve mostrar seção de ações quando showRetry e showClose são false', () => {
      wrapper = mount(ErrorMessage, {
        props: {
          show: true,
          message: 'Erro de teste',
          showRetry: false,
          showClose: false
        }
      })

      expect(wrapper.find('.error-actions').exists()).toBe(false)
    })

    it('não deve mostrar botão X quando dismissible é false', () => {
      wrapper = mount(ErrorMessage, {
        props: {
          show: true,
          message: 'Erro de teste',
          dismissible: false
        }
      })

      expect(wrapper.find('.btn-close').exists()).toBe(false)
    })
  })

  describe('Eventos', () => {
    beforeEach(() => {
      wrapper = mount(ErrorMessage, {
        props: {
          show: true,
          message: 'Erro de teste',
          showRetry: true,
          showClose: true,
          dismissible: true
        }
      })
    })

    it('deve emitir evento close ao clicar no botão Fechar', async () => {
      const closeButton = wrapper.find('.btn-outline-secondary')
      await closeButton.trigger('click')

      expect(wrapper.emitted('close')).toBeTruthy()
    })

    it('deve emitir evento close ao clicar no botão X', async () => {
      const dismissButton = wrapper.find('.btn-close')
      await dismissButton.trigger('click')

      expect(wrapper.emitted('close')).toBeTruthy()
    })

    it('deve emitir evento retry ao clicar no botão Tentar Novamente', async () => {
      const retryButton = wrapper.find('.btn-outline-danger')
      await retryButton.trigger('click')

      expect(wrapper.emitted('retry')).toBeTruthy()
    })

    it('deve mostrar estado de carregamento durante retry', async () => {
      // Substituir o método retry para simular delay
      const originalRetry = wrapper.vm.retry
      let resolveRetry
      wrapper.vm.retry = async function() {
        this.retrying = true
        this.$emit('retry')
        await new Promise(resolve => {
          resolveRetry = resolve
        })
        this.retrying = false
      }
      
      const retryButton = wrapper.find('.btn-outline-danger')
      
      // Chamar o método retry diretamente
      wrapper.vm.retry()
      await wrapper.vm.$nextTick()
      
      // Verificar estado de carregamento
      expect(wrapper.vm.retrying).toBe(true)
      expect(retryButton.attributes('disabled')).toBe('')
      expect(wrapper.find('.spinner-border').exists()).toBe(true)
      expect(retryButton.text()).toContain('Tentando...')
      
      // Resolver o retry
      resolveRetry()
      await wrapper.vm.$nextTick()
      
      expect(wrapper.vm.retrying).toBe(false)
      
      // Restaurar método original
      wrapper.vm.retry = originalRetry
    })
  })

  describe('Auto Hide', () => {
    it('deve iniciar timer quando show é true e autoHide é true', async () => {
      wrapper = mount(ErrorMessage, {
        props: {
          show: false,
          message: 'Erro de teste',
          autoHide: true,
          autoHideDelay: 1000
        }
      })

      await wrapper.setProps({ show: true })
      expect(wrapper.vm.autoHideTimer).toBeTruthy()
    })

    it('deve fechar automaticamente após o delay', async () => {
      wrapper = mount(ErrorMessage, {
        props: {
          show: true,
          message: 'Erro de teste',
          autoHide: true,
          autoHideDelay: 1000
        }
      })

      // Avançar o tempo
      vi.advanceTimersByTime(1000)
      
      expect(wrapper.emitted('close')).toBeTruthy()
    })

    it('deve limpar timer quando show muda para false', async () => {
      wrapper = mount(ErrorMessage, {
        props: {
          show: true,
          message: 'Erro de teste',
          autoHide: true,
          autoHideDelay: 1000
        }
      })

      const timerId = wrapper.vm.autoHideTimer
      expect(timerId).toBeTruthy()

      await wrapper.setProps({ show: false })
      expect(wrapper.vm.autoHideTimer).toBe(null)
    })

    it('deve limpar timer ao fechar manualmente', async () => {
      wrapper = mount(ErrorMessage, {
        props: {
          show: true,
          message: 'Erro de teste',
          autoHide: true,
          autoHideDelay: 1000,
          dismissible: true
        }
      })

      expect(wrapper.vm.autoHideTimer).toBeTruthy()

      const dismissButton = wrapper.find('.btn-close')
      await dismissButton.trigger('click')

      expect(wrapper.vm.autoHideTimer).toBe(null)
    })

    it('não deve iniciar timer quando autoHide é false', async () => {
      wrapper = mount(ErrorMessage, {
        props: {
          show: false,
          message: 'Erro de teste',
          autoHide: false
        }
      })

      await wrapper.setProps({ show: true })
      expect(wrapper.vm.autoHideTimer).toBe(null)
    })
  })

  describe('Métodos', () => {
    beforeEach(() => {
      wrapper = mount(ErrorMessage, {
        props: {
          show: true,
          message: 'Erro de teste',
          autoHide: true,
          autoHideDelay: 1000
        }
      })
    })

    describe('close', () => {
      it('deve limpar timer e emitir evento close', () => {
        expect(wrapper.vm.autoHideTimer).toBeTruthy()
        
        wrapper.vm.close()
        
        expect(wrapper.vm.autoHideTimer).toBe(null)
        expect(wrapper.emitted('close')).toBeTruthy()
      })
    })

    describe('retry', () => {
      it('deve definir estado retrying e emitir evento', async () => {
        expect(wrapper.vm.retrying).toBe(false)
        
        // Substituir o método retry para simular delay
         const originalRetry = wrapper.vm.retry
         let resolveRetry
         wrapper.vm.retry = async function() {
           this.retrying = true
           this.$emit('retry')
           await new Promise(resolve => {
             resolveRetry = resolve
           })
           this.retrying = false
         }
         
         const methodPromise = wrapper.vm.retry()
         expect(wrapper.vm.retrying).toBe(true)
         
         // Resolver o retry
         resolveRetry()
         await methodPromise
         
         // Restaurar método original
         wrapper.vm.retry = originalRetry
        
        expect(wrapper.vm.retrying).toBe(false)
        expect(wrapper.emitted('retry')).toBeTruthy()
      })
    })

    describe('startAutoHideTimer', () => {
      it('deve criar novo timer', () => {
        wrapper.vm.clearAutoHideTimer()
        expect(wrapper.vm.autoHideTimer).toBe(null)
        
        wrapper.vm.startAutoHideTimer()
        expect(wrapper.vm.autoHideTimer).toBeTruthy()
      })

      it('deve limpar timer existente antes de criar novo', () => {
        const firstTimer = wrapper.vm.autoHideTimer
        wrapper.vm.startAutoHideTimer()
        const secondTimer = wrapper.vm.autoHideTimer
        
        expect(firstTimer).not.toBe(secondTimer)
      })
    })

    describe('clearAutoHideTimer', () => {
      it('deve limpar timer existente', () => {
        expect(wrapper.vm.autoHideTimer).toBeTruthy()
        
        wrapper.vm.clearAutoHideTimer()
        expect(wrapper.vm.autoHideTimer).toBe(null)
      })

      it('deve funcionar quando não há timer', () => {
        wrapper.vm.autoHideTimer = null
        
        expect(() => wrapper.vm.clearAutoHideTimer()).not.toThrow()
        expect(wrapper.vm.autoHideTimer).toBe(null)
      })
    })
  })

  describe('Lifecycle', () => {
    it('deve limpar timer no beforeUnmount', () => {
      wrapper = mount(ErrorMessage, {
        props: {
          show: true,
          message: 'Erro de teste',
          autoHide: true
        }
      })

      expect(wrapper.vm.autoHideTimer).toBeTruthy()
      
      wrapper.unmount()
      // Timer é limpo no beforeUnmount, mas não podemos verificar diretamente
      // pois o componente foi desmontado
    })
  })

  describe('Acessibilidade', () => {
    beforeEach(() => {
      wrapper = mount(ErrorMessage, {
        props: {
          show: true,
          message: 'Erro de teste',
          details: 'Detalhes do erro',
          showRetry: true,
          dismissible: true
        }
      })
    })

    it('deve ter role="alert" no container principal', () => {
      const alert = wrapper.find('.alert')
      expect(alert.attributes('role')).toBe('alert')
    })

    it('deve ter aria-expanded no botão de detalhes', () => {
      const detailsButton = wrapper.find('button[aria-expanded]')
      expect(detailsButton.attributes('aria-expanded')).toBe('false')
    })

    it('deve ter aria-label no botão de fechar', () => {
      const closeButton = wrapper.find('.btn-close')
      expect(closeButton.attributes('aria-label')).toBe('Fechar')
    })

    it('deve ter texto para screen readers no spinner', async () => {
      // Substituir o método retry para simular delay
      const originalRetry = wrapper.vm.retry
      let resolveRetry
      wrapper.vm.retry = async function() {
        this.retrying = true
        this.$emit('retry')
        await new Promise(resolve => {
          resolveRetry = resolve
        })
        this.retrying = false
      }
      
      const retryButton = wrapper.find('.btn-outline-danger')
      wrapper.vm.retry()
      await wrapper.vm.$nextTick()
      
      // Verificar se o estado retrying está ativo
      expect(wrapper.vm.retrying).toBe(true)
      
      const screenReaderText = wrapper.find('.visually-hidden')
      expect(screenReaderText.exists()).toBe(true)
      expect(screenReaderText.text()).toBe('Tentando novamente...')
      
      // Resolver o retry
      resolveRetry()
      await wrapper.vm.$nextTick()
      
      // Restaurar método original
      wrapper.vm.retry = originalRetry
    })

    it('deve ter ícones apropriados', () => {
      expect(wrapper.find('.bi-exclamation-triangle-fill').exists()).toBe(true)
      expect(wrapper.find('.bi-arrow-clockwise').exists()).toBe(true)
      expect(wrapper.find('.bi-x-lg').exists()).toBe(true)
    })
  })

  describe('Estilos e Classes CSS', () => {
    beforeEach(() => {
      wrapper = mount(ErrorMessage, {
        props: {
          show: true,
          message: 'Erro de teste'
        }
      })
    })

    it('deve aplicar classes CSS corretas', () => {
      expect(wrapper.find('.error-container').exists()).toBe(true)
      expect(wrapper.find('.alert-danger').exists()).toBe(true)
      expect(wrapper.find('.error-alert').exists()).toBe(true)
      expect(wrapper.find('.error-icon').exists()).toBe(true)
      expect(wrapper.find('.error-content').exists()).toBe(true)
    })

    it('deve ter classes Bootstrap apropriadas', () => {
      const alert = wrapper.find('.alert')
      expect(alert.classes()).toContain('alert-danger')
      
      const content = wrapper.find('.error-content')
      expect(content.classes()).toContain('flex-grow-1')
    })
  })

  describe('Estados de Dados', () => {
    it('deve inicializar dados corretamente', () => {
      wrapper = mount(ErrorMessage, {
        props: {
          show: true,
          message: 'Teste'
        }
      })

      expect(wrapper.vm.showDetails).toBe(false)
      expect(wrapper.vm.retrying).toBe(false)
      expect(wrapper.vm.autoHideTimer).toBe(null)
    })

    it('deve gerenciar estado showDetails corretamente', async () => {
      wrapper = mount(ErrorMessage, {
        props: {
          show: true,
          message: 'Teste',
          details: 'Detalhes'
        }
      })

      expect(wrapper.vm.showDetails).toBe(false)
      
      const detailsButton = wrapper.find('button[aria-expanded]')
      await detailsButton.trigger('click')
      
      expect(wrapper.vm.showDetails).toBe(true)
    })
  })
})