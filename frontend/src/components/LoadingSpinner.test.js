import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import LoadingSpinner from './LoadingSpinner.vue'

describe('LoadingSpinner.vue', () => {
  let wrapper
  let originalBodyStyle

  beforeEach(() => {
    // Salvar estilo original do body
    originalBodyStyle = document.body.style.overflow
    wrapper = null
  })

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount()
    }
    // Restaurar estilo original do body
    document.body.style.overflow = originalBodyStyle
    vi.clearAllMocks()
  })

  describe('Renderização Inicial', () => {
    it('deve renderizar quando show é true', () => {
      wrapper = mount(LoadingSpinner, {
        props: {
          show: true
        }
      })

      expect(wrapper.find('.loading-overlay').exists()).toBe(true)
      expect(wrapper.find('.custom-spinner').exists()).toBe(true)
      expect(wrapper.find('.loading-text').exists()).toBe(true)
    })

    it('não deve renderizar quando show é false', () => {
      wrapper = mount(LoadingSpinner, {
        props: {
          show: false
        }
      })

      expect(wrapper.find('.loading-overlay').exists()).toBe(false)
    })

    it('deve exibir título padrão', () => {
      wrapper = mount(LoadingSpinner, {
        props: {
          show: true
        }
      })

      expect(wrapper.find('h5').text()).toBe('Carregando...')
    })

    it('deve exibir mensagem padrão', () => {
      wrapper = mount(LoadingSpinner, {
        props: {
          show: true
        }
      })

      expect(wrapper.find('p').text()).toBe('Por favor, aguarde')
    })

    it('deve exibir título personalizado', () => {
      wrapper = mount(LoadingSpinner, {
        props: {
          show: true,
          title: 'Processando dados...'
        }
      })

      expect(wrapper.find('h5').text()).toBe('Processando dados...')
    })

    it('deve exibir mensagem personalizada', () => {
      wrapper = mount(LoadingSpinner, {
        props: {
          show: true,
          message: 'Isso pode levar alguns minutos'
        }
      })

      expect(wrapper.find('p').text()).toBe('Isso pode levar alguns minutos')
    })
  })

  describe('Props', () => {
    it('deve ter valores padrão corretos', () => {
      wrapper = mount(LoadingSpinner)

      expect(wrapper.props('show')).toBe(false)
      expect(wrapper.props('title')).toBe('Carregando...')
      expect(wrapper.props('message')).toBe('Por favor, aguarde')
      expect(wrapper.props('fullscreen')).toBe(false)
      expect(wrapper.props('showProgress')).toBe(false)
      expect(wrapper.props('progress')).toBe(0)
    })

    it('deve aceitar todas as props personalizadas', () => {
      const props = {
        show: true,
        title: 'Título Customizado',
        message: 'Mensagem customizada',
        fullscreen: true,
        showProgress: true,
        progress: 50
      }

      wrapper = mount(LoadingSpinner, { props })

      Object.keys(props).forEach(key => {
        expect(wrapper.props(key)).toBe(props[key])
      })
    })

    it('deve validar prop progress entre 0 e 100', () => {
      const { progress } = LoadingSpinner.props
      
      expect(progress.type).toBe(Number)
      expect(progress.default).toBe(0)
      expect(progress.validator).toBeDefined()
      
      // Testar validador
      expect(progress.validator(0)).toBe(true)
      expect(progress.validator(50)).toBe(true)
      expect(progress.validator(100)).toBe(true)
      expect(progress.validator(-1)).toBe(false)
      expect(progress.validator(101)).toBe(false)
    })
  })

  describe('Modo Fullscreen', () => {
    it('deve aplicar classe overlay-fullscreen quando fullscreen é true', () => {
      wrapper = mount(LoadingSpinner, {
        props: {
          show: true,
          fullscreen: true
        }
      })

      const overlay = wrapper.find('.loading-overlay')
      expect(overlay.classes()).toContain('overlay-fullscreen')
    })

    it('não deve aplicar classe overlay-fullscreen quando fullscreen é false', () => {
      wrapper = mount(LoadingSpinner, {
        props: {
          show: true,
          fullscreen: false
        }
      })

      const overlay = wrapper.find('.loading-overlay')
      expect(overlay.classes()).not.toContain('overlay-fullscreen')
    })

    it('deve definir overflow hidden no body quando show e fullscreen são true', async () => {
      wrapper = mount(LoadingSpinner, {
        props: {
          show: false,
          fullscreen: true
        }
      })

      await wrapper.setProps({ show: true })
      expect(document.body.style.overflow).toBe('hidden')
    })

    it('deve restaurar overflow do body quando show muda para false', async () => {
      wrapper = mount(LoadingSpinner, {
        props: {
          show: true,
          fullscreen: true
        }
      })

      await wrapper.vm.$nextTick()
      expect(document.body.style.overflow).toBe('hidden')

      await wrapper.setProps({ show: false })
      await wrapper.vm.$nextTick()
      expect(document.body.style.overflow).toBe('')
    })

    it('não deve alterar overflow do body quando fullscreen é false', async () => {
      wrapper = mount(LoadingSpinner, {
        props: {
          show: false,
          fullscreen: false
        }
      })

      await wrapper.setProps({ show: true })
      expect(document.body.style.overflow).toBe('')
    })
  })

  describe('Barra de Progresso', () => {
    it('deve mostrar barra de progresso quando showProgress é true', () => {
      wrapper = mount(LoadingSpinner, {
        props: {
          show: true,
          showProgress: true,
          progress: 30
        }
      })

      expect(wrapper.find('.progress-container').exists()).toBe(true)
      expect(wrapper.find('.progress').exists()).toBe(true)
      expect(wrapper.find('.progress-bar').exists()).toBe(true)
    })

    it('não deve mostrar barra de progresso quando showProgress é false', () => {
      wrapper = mount(LoadingSpinner, {
        props: {
          show: true,
          showProgress: false
        }
      })

      expect(wrapper.find('.progress-container').exists()).toBe(false)
    })

    it('deve exibir porcentagem correta na barra de progresso', () => {
      wrapper = mount(LoadingSpinner, {
        props: {
          show: true,
          showProgress: true,
          progress: 75
        }
      })

      const progressBar = wrapper.find('.progress-bar')
      expect(progressBar.attributes('style')).toContain('width: 75%')
      expect(progressBar.attributes('aria-valuenow')).toBe('75')
      expect(progressBar.text()).toBe('75%')
    })

    it('deve ter atributos ARIA corretos na barra de progresso', () => {
      wrapper = mount(LoadingSpinner, {
        props: {
          show: true,
          showProgress: true,
          progress: 40
        }
      })

      const progressBar = wrapper.find('.progress-bar')
      expect(progressBar.attributes('role')).toBe('progressbar')
      expect(progressBar.attributes('aria-valuenow')).toBe('40')
      expect(progressBar.attributes('aria-valuemin')).toBe('0')
      expect(progressBar.attributes('aria-valuemax')).toBe('100')
    })

    it('deve atualizar barra de progresso quando prop progress muda', async () => {
      wrapper = mount(LoadingSpinner, {
        props: {
          show: true,
          showProgress: true,
          progress: 20
        }
      })

      let progressBar = wrapper.find('.progress-bar')
      expect(progressBar.attributes('style')).toContain('width: 20%')
      expect(progressBar.text()).toBe('20%')

      await wrapper.setProps({ progress: 80 })
      progressBar = wrapper.find('.progress-bar')
      expect(progressBar.attributes('style')).toContain('width: 80%')
      expect(progressBar.text()).toBe('80%')
    })
  })

  describe('Spinner Customizado', () => {
    beforeEach(() => {
      wrapper = mount(LoadingSpinner, {
        props: {
          show: true
        }
      })
    })

    it('deve renderizar spinner com 4 anéis', () => {
      const spinnerRings = wrapper.findAll('.spinner-ring')
      expect(spinnerRings).toHaveLength(4)
    })

    it('deve ter container do spinner', () => {
      expect(wrapper.find('.spinner-container').exists()).toBe(true)
      expect(wrapper.find('.custom-spinner').exists()).toBe(true)
    })
  })

  describe('Conteúdo de Carregamento', () => {
    beforeEach(() => {
      wrapper = mount(LoadingSpinner, {
        props: {
          show: true,
          title: 'Carregando dados',
          message: 'Aguarde um momento'
        }
      })
    })

    it('deve ter estrutura de conteúdo correta', () => {
      expect(wrapper.find('.loading-content').exists()).toBe(true)
      expect(wrapper.find('.loading-text').exists()).toBe(true)
    })

    it('deve exibir título e mensagem fornecidos', () => {
      expect(wrapper.find('h5').text()).toBe('Carregando dados')
      expect(wrapper.find('p').text()).toBe('Aguarde um momento')
    })

    it('deve ter classes CSS apropriadas no texto', () => {
      const title = wrapper.find('h5')
      const message = wrapper.find('p')
      
      expect(title.classes()).toContain('mb-2')
      expect(message.classes()).toContain('mb-0')
      expect(message.classes()).toContain('text-muted')
    })
  })

  describe('Lifecycle', () => {
    it('deve restaurar overflow do body no beforeUnmount', async () => {
      wrapper = mount(LoadingSpinner, {
        props: {
          show: true,
          fullscreen: true
        }
      })

      await wrapper.vm.$nextTick()
      expect(document.body.style.overflow).toBe('hidden')
      
      wrapper.unmount()
      expect(document.body.style.overflow).toBe('')
    })

    it('deve funcionar corretamente quando não há alteração no body', () => {
      wrapper = mount(LoadingSpinner, {
        props: {
          show: true,
          fullscreen: false
        }
      })

      expect(() => wrapper.unmount()).not.toThrow()
    })
  })

  describe('Watchers', () => {
    it('deve reagir a mudanças na prop show', async () => {
      wrapper = mount(LoadingSpinner, {
        props: {
          show: false,
          fullscreen: true
        }
      })

      expect(document.body.style.overflow).toBe('')

      await wrapper.setProps({ show: true })
      expect(document.body.style.overflow).toBe('hidden')

      await wrapper.setProps({ show: false })
      expect(document.body.style.overflow).toBe('')
    })

    it('deve reagir apenas quando fullscreen é true', async () => {
      wrapper = mount(LoadingSpinner, {
        props: {
          show: false,
          fullscreen: false
        }
      })

      await wrapper.setProps({ show: true })
      expect(document.body.style.overflow).toBe('')

      await wrapper.setProps({ show: false })
      expect(document.body.style.overflow).toBe('')
    })
  })

  describe('Estilos e Classes CSS', () => {
    beforeEach(() => {
      wrapper = mount(LoadingSpinner, {
        props: {
          show: true
        }
      })
    })

    it('deve aplicar classes CSS corretas', () => {
      expect(wrapper.find('.loading-overlay').exists()).toBe(true)
      expect(wrapper.find('.loading-content').exists()).toBe(true)
      expect(wrapper.find('.spinner-container').exists()).toBe(true)
      expect(wrapper.find('.custom-spinner').exists()).toBe(true)
      expect(wrapper.find('.loading-text').exists()).toBe(true)
    })

    it('deve ter classes condicionais baseadas em props', () => {
      const overlay = wrapper.find('.loading-overlay')
      expect(overlay.classes()).not.toContain('overlay-fullscreen')

      wrapper = mount(LoadingSpinner, {
        props: {
          show: true,
          fullscreen: true
        }
      })

      const fullscreenOverlay = wrapper.find('.loading-overlay')
      expect(fullscreenOverlay.classes()).toContain('overlay-fullscreen')
    })
  })

  describe('Casos Extremos', () => {
    it('deve lidar com progress 0', () => {
      wrapper = mount(LoadingSpinner, {
        props: {
          show: true,
          showProgress: true,
          progress: 0
        }
      })

      const progressBar = wrapper.find('.progress-bar')
      expect(progressBar.attributes('style')).toContain('width: 0%')
      expect(progressBar.text()).toBe('0%')
    })

    it('deve lidar com progress 100', () => {
      wrapper = mount(LoadingSpinner, {
        props: {
          show: true,
          showProgress: true,
          progress: 100
        }
      })

      const progressBar = wrapper.find('.progress-bar')
      expect(progressBar.attributes('style')).toContain('width: 100%')
      expect(progressBar.text()).toBe('100%')
    })

    it('deve lidar com strings vazias em title e message', () => {
      wrapper = mount(LoadingSpinner, {
        props: {
          show: true,
          title: '',
          message: ''
        }
      })

      expect(wrapper.find('h5').text()).toBe('')
      expect(wrapper.find('p').text()).toBe('')
    })

    it('deve funcionar com múltiplas mudanças rápidas de show', async () => {
      wrapper = mount(LoadingSpinner, {
        props: {
          show: false,
          fullscreen: true
        }
      })

      await wrapper.setProps({ show: true })
      await wrapper.setProps({ show: false })
      await wrapper.setProps({ show: true })
      await wrapper.setProps({ show: false })

      expect(document.body.style.overflow).toBe('')
    })
  })

  describe('Acessibilidade', () => {
    it('deve ter atributos ARIA apropriados na barra de progresso', () => {
      wrapper = mount(LoadingSpinner, {
        props: {
          show: true,
          showProgress: true,
          progress: 60
        }
      })

      const progressBar = wrapper.find('.progress-bar')
      expect(progressBar.attributes('role')).toBe('progressbar')
      expect(progressBar.attributes('aria-valuenow')).toBe('60')
      expect(progressBar.attributes('aria-valuemin')).toBe('0')
      expect(progressBar.attributes('aria-valuemax')).toBe('100')
    })

    it('deve ter estrutura semântica apropriada', () => {
      wrapper = mount(LoadingSpinner, {
        props: {
          show: true
        }
      })

      expect(wrapper.find('h5').exists()).toBe(true)
      expect(wrapper.find('p').exists()).toBe(true)
    })

    it('deve ter classes para screen readers quando necessário', () => {
      wrapper = mount(LoadingSpinner, {
        props: {
          show: true,
          showProgress: true
        }
      })

      // Verificar se há elementos com classes de acessibilidade
      const progressBar = wrapper.find('.progress-bar')
      expect(progressBar.classes()).toContain('progress-bar-striped')
      expect(progressBar.classes()).toContain('progress-bar-animated')
    })
  })

  describe('Responsividade', () => {
    beforeEach(() => {
      wrapper = mount(LoadingSpinner, {
        props: {
          show: true,
          showProgress: true,
          progress: 45
        }
      })
    })

    it('deve ter estrutura responsiva', () => {
      // Verificar se os elementos principais existem para responsividade
      expect(wrapper.find('.loading-content').exists()).toBe(true)
      expect(wrapper.find('.spinner-container').exists()).toBe(true)
      expect(wrapper.find('.loading-text').exists()).toBe(true)
      expect(wrapper.find('.progress-container').exists()).toBe(true)
    })
  })
})