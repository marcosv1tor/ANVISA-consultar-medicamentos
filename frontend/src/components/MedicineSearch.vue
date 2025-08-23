<template>
  <div class="medicine-search">
    <div class="card">
      <div class="card-body">
        <h2 class="card-title text-center mb-4">
          <i class="bi bi-search me-2"></i>
          Buscar Medicamentos
        </h2>
        
        <form @submit.prevent="handleSearch" class="search-form">
          <div class="row g-3">
            <div class="col-md-8">
              <div class="input-group input-group-lg">
                <span class="input-group-text">
                  <i class="bi bi-capsule"></i>
                </span>
                <input
                  type="text"
                  class="form-control"
                  placeholder="Digite o nome do medicamento..."
                  v-model="searchTerm"
                  :disabled="loading"
                  required
                  minlength="2"
                  maxlength="100"
                  autocomplete="off"
                >
              </div>
              <div class="form-text">
                Digite pelo menos 2 caracteres para buscar
              </div>
            </div>
            
            <div class="col-md-4">
              <button 
                type="submit" 
                class="btn btn-primary btn-lg w-100"
                :disabled="loading || searchTerm.length < 2"
              >
                <span v-if="loading" class="spinner-border spinner-border-sm me-2" role="status">
                  <span class="visually-hidden">Carregando...</span>
                </span>
                <i v-else class="bi bi-search me-2"></i>
                {{ loading ? 'Buscando...' : 'Buscar' }}
              </button>
            </div>
          </div>
        </form>
        
        <!-- Search Tips -->
        <div class="mt-4">
          <div class="row">
            <div class="col-12">
              <div class="alert alert-info" role="alert">
                <h6 class="alert-heading">
                  <i class="bi bi-lightbulb me-2"></i>
                  Dicas de busca:
                </h6>
                <ul class="mb-0">
                  <li>Use o nome comercial do medicamento (ex: "Dipirona")</li>
                  <li>Você pode buscar pelo princípio ativo (ex: "Paracetamol")</li>
                  <li>A busca não diferencia maiúsculas de minúsculas</li>
                  <li>Use termos específicos para melhores resultados</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Recent Searches -->
        <div v-if="recentSearches.length > 0" class="mt-3">
          <h6 class="text-muted mb-2">
            <i class="bi bi-clock-history me-2"></i>
            Buscas recentes:
          </h6>
          <div class="d-flex flex-wrap gap-2">
            <button
              v-for="search in recentSearches"
              :key="search"
              type="button"
              class="btn btn-outline-secondary btn-sm"
              @click="selectRecentSearch(search)"
              :disabled="loading"
            >
              {{ search }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'MedicineSearch',
  props: {
    loading: {
      type: Boolean,
      default: false
    }
  },
  emits: ['search'],
  data() {
    return {
      searchTerm: '',
      recentSearches: []
    }
  },
  mounted() {
    this.loadRecentSearches()
    // Focus no campo de busca quando o componente é montado
    this.$nextTick(() => {
      const input = this.$el.querySelector('input[type="text"]')
      if (input) {
        input.focus()
      }
    })
  },
  methods: {
    handleSearch() {
      const term = this.searchTerm.trim()
      
      if (term.length < 2) {
        return
      }
      
      // Adicionar à lista de buscas recentes
      this.addToRecentSearches(term)
      
      // Emitir evento de busca
      this.$emit('search', term)
    },
    
    selectRecentSearch(search) {
      this.searchTerm = search
      this.handleSearch()
    },
    
    addToRecentSearches(search) {
      // Remove se já existe
      const index = this.recentSearches.indexOf(search)
      if (index > -1) {
        this.recentSearches.splice(index, 1)
      }
      
      // Adiciona no início
      this.recentSearches.unshift(search)
      
      // Mantém apenas os últimos 5
      if (this.recentSearches.length > 5) {
        this.recentSearches = this.recentSearches.slice(0, 5)
      }
      
      // Salva no localStorage
      this.saveRecentSearches()
    },
    
    loadRecentSearches() {
      try {
        const saved = localStorage.getItem('medware_recent_searches')
        if (saved) {
          this.recentSearches = JSON.parse(saved)
        }
      } catch (error) {
        console.error('Erro ao carregar buscas recentes:', error)
        this.recentSearches = []
      }
    },
    
    saveRecentSearches() {
      try {
        localStorage.setItem('medware_recent_searches', JSON.stringify(this.recentSearches))
      } catch (error) {
        console.error('Erro ao salvar buscas recentes:', error)
      }
    }
  }
}
</script>

<style scoped>
.medicine-search {
  margin-bottom: 2rem;
}

.card {
  border: none;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.card-title {
  color: #0d6efd;
  font-weight: 600;
}

.input-group-text {
  background-color: #f8f9fa;
  border-color: #dee2e6;
}

.form-control:focus {
  border-color: #0d6efd;
  box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.25);
}

.btn-primary {
  background-color: #0d6efd;
  border-color: #0d6efd;
  font-weight: 500;
}

.btn-primary:hover {
  background-color: #0b5ed7;
  border-color: #0a58ca;
}

.btn-primary:disabled {
  opacity: 0.6;
}

.alert-info {
  background-color: #e7f3ff;
  border-color: #b8daff;
  color: #055160;
}

.btn-outline-secondary {
  font-size: 0.875rem;
}

.btn-outline-secondary:hover {
  background-color: #6c757d;
  border-color: #6c757d;
}

@media (max-width: 768px) {
  .input-group-lg .form-control {
    font-size: 1rem;
  }
  
  .btn-lg {
    font-size: 1rem;
    padding: 0.75rem 1rem;
  }
  
  .card-body {
    padding: 1.5rem;
  }
}

@media (max-width: 576px) {
  .card-body {
    padding: 1rem;
  }
  
  .card-title {
    font-size: 1.5rem;
  }
}
</style>