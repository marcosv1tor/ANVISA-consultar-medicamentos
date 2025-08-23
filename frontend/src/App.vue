<template>
  <div id="app">
    <!-- Header -->
    <nav class="navbar navbar-expand-lg navbar-dark bg-primary">
      <div class="container">
        <a class="navbar-brand" href="#">
          <i class="bi bi-capsule me-2"></i>
          MEDWARE
        </a>
        <span class="navbar-text">
          Consulta de Medicamentos ANVISA
        </span>
      </div>
    </nav>

    <!-- Main Content -->
    <div class="container mt-4">
      <div class="row">
        <div class="col-12">
          <!-- Search Component -->
          <MedicineSearch 
            @search="handleSearch" 
            :loading="loading"
          />
        </div>
      </div>

      <!-- Results Section -->
      <div class="row mt-4" v-if="searchResults.length > 0 || error">
        <div class="col-12">
          <!-- Error Message -->
          <ErrorMessage
            v-if="error"
            :show="!!error"
            title="Erro na Busca"
            :message="error"
            :show-retry="true"
            @close="clearError"
            @retry="retryLastSearch"
          />

          <!-- Results List -->
          <MedicineList 
            v-if="!error"
            :medicines="searchResults"
            @select="handleMedicineSelect"
          />
        </div>
      </div>

      <!-- Medicine Details Modal -->
      <MedicineDetails 
        v-if="selectedMedicine"
        :medicine="selectedMedicine"
        :show="showDetails"
        @close="handleCloseDetails"
        @download-pdf="handleDownloadPDF"
      />
    </div>

    <!-- Footer -->
    <footer class="bg-light mt-5 py-4">
      <div class="container text-center">
        <p class="mb-0 text-muted">
          <i class="bi bi-info-circle me-2"></i>
          Dados fornecidos pela API pública da ANVISA
        </p>
      </div>
    </footer>
  </div>
</template>

<script>
import MedicineSearch from './components/MedicineSearch.vue'
import MedicineList from './components/MedicineList.vue'
import MedicineDetails from './components/MedicineDetails.vue'
import LoadingSpinner from './components/LoadingSpinner.vue'
import ErrorMessage from './components/ErrorMessage.vue'
import { anvisaApi } from './services/anvisaApi.js'

export default {
  name: 'App',
  components: {
    MedicineSearch,
    MedicineList,
    MedicineDetails,
    LoadingSpinner,
    ErrorMessage
  },
  data() {
    return {
      searchResults: [],
      selectedMedicine: null,
      showDetails: false,
      loading: false,
      error: null,
      lastSearchTerm: null
    }
  },
  methods: {
    async handleSearch(searchTerm) {
      this.loading = true
      this.error = null
      this.searchResults = []
      this.lastSearchTerm = searchTerm
      
      try {
        const results = await anvisaApi.searchMedicines(searchTerm)
        this.searchResults = results
        
        if (results.length === 0) {
          this.error = 'Nenhum medicamento encontrado com esse nome.'
        }
      } catch (error) {
        console.error('Erro na busca:', error)
        this.error = error.message || 'Erro ao buscar medicamentos. Tente novamente.'
      } finally {
        this.loading = false
      }
    },
    
    async handleMedicineSelect(medicine) {
      this.loading = true
      this.error = null
      
      try {
        const details = await anvisaApi.getMedicineDetails(medicine.codigo)
        this.selectedMedicine = details
        this.showDetails = true
      } catch (error) {
        console.error('Erro ao buscar detalhes:', error)
        this.error = 'Erro ao carregar detalhes do medicamento.'
      } finally {
        this.loading = false
      }
    },
    
    handleCloseDetails() {
      this.showDetails = false
      this.selectedMedicine = null
    },
    
    async handleDownloadPDF(codigo, tipo = 'paciente') {
      try {
        await anvisaApi.downloadBulaPDF(codigo, tipo)
      } catch (error) {
        console.error('Erro no download:', error)
        this.error = 'Erro ao fazer download da bula.'
      }
    },
    
    clearError() {
      this.error = null
    },
    
    async retryLastSearch() {
      if (this.lastSearchTerm) {
        await this.handleSearch(this.lastSearchTerm)
      }
    }
  }
}
</script>

<style>
#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.container {
  flex: 1;
}

.navbar-brand {
  font-weight: bold;
  font-size: 1.5rem;
}

.btn {
  border-radius: 8px;
}

.card {
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.alert {
  border-radius: 8px;
}

@media (max-width: 768px) {
  .container {
    padding: 0 15px;
  }
}
</style>