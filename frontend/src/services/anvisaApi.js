import axios from 'axios'

// Instância do axios configurada para nossa API intermediária
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api',
  timeout: 10000,
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  }
})

// Interceptor para log
api.interceptors.request.use(
  (config) => {
    console.log('➡️ Requisição:', config.method?.toUpperCase(), config.url)
    return config
  },
  (error) => Promise.reject(error)
)

export const anvisaApi = {
  /**
   * Busca medicamentos pelo nome
   */
  async searchMedicines(nomeMedicamento) {
    if (!nomeMedicamento || nomeMedicamento.trim().length < 2) {
      throw new Error('Nome do medicamento deve ter pelo menos 2 caracteres')
    }

    try {
      const response = await api.get('/medicamentos/buscar', {
        params: { nome: nomeMedicamento.trim() }
      })

      if (!response.data.success) {
        throw new Error(response.data.error || 'Erro na busca')
      }

      return response.data.data || []
    } catch (error) {
      console.error('❌ Erro na busca:', error)
      throw new Error(error.response?.data?.error || error.message || 'Erro ao buscar medicamentos')
    }
  },

  /**
   * Detalhes do medicamento
   */
  async getMedicineDetails(codigo) {
    if (!codigo) throw new Error('Código é obrigatório')

    try {
      const response = await api.get(`/medicamentos/detalhes/${codigo}`)
      
      if (!response.data.success) {
        throw new Error(response.data.error || 'Erro ao buscar detalhes')
      }
      
      return response.data.data
    } catch (error) {
      console.error('❌ Erro detalhes:', error)
      throw new Error(error.response?.data?.error || error.message || 'Erro ao buscar detalhes')
    }
  },

  /**
   * Download da bula
   */
  async downloadBulaPDF(codigoBula, tipo = 'paciente') {
    if (!codigoBula) throw new Error('Código da bula é obrigatório')

    try {
      const response = await api.get(`/medicamentos/bula/${codigoBula}`, {
        params: { tipo: tipo },
        responseType: 'blob'
      })

      // Criar link para download (somente em browser)
      const blob = new Blob([response.data], { type: 'application/pdf' })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `bula_${tipo}_${codigoBula}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)

    } catch (error) {
      console.error('❌ Erro download:', error)
      
      // Tratamento específico para erro 404
      if (error.response?.status === 404) {
        throw new Error('Bula não encontrada. A ANVISA pode não ter disponibilizado esta bula ou o código pode estar inválido.')
      }
      
      // Tentar extrair mensagem de erro do JSON retornado pela API
      let errorMessage = 'Erro ao baixar bula'
      if (error.response?.data) {
        try {
          // Se a resposta for um blob, converter para texto
          if (error.response.data instanceof Blob) {
            const text = await error.response.data.text()
            const errorData = JSON.parse(text)
            errorMessage = errorData.error || errorMessage
          } else if (typeof error.response.data === 'string') {
            const errorData = JSON.parse(error.response.data)
            errorMessage = errorData.error || errorMessage
          } else if (error.response.data.error) {
            errorMessage = error.response.data.error
          }
        } catch (parseError) {
          // Se não conseguir fazer parse, usar mensagem padrão
          errorMessage = error.response?.statusText || error.message || errorMessage
        }
      }
      
      throw new Error(errorMessage)
    }
  }
}

export default anvisaApi
