<template>
  <div class="medicine-list">
    <!-- Results Header -->
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h3 class="mb-0">
        <i class="bi bi-list-ul me-2"></i>
        Resultados da Busca
      </h3>
      <span class="badge bg-primary fs-6">
        {{ medicines.length }} {{ medicines.length === 1 ? 'medicamento encontrado' : 'medicamentos encontrados' }}
      </span>
    </div>

    <!-- Medicine Cards -->
    <div class="row g-3">
      <div 
        v-for="medicine in medicines" 
        :key="medicine.codigo"
        class="col-12 col-md-6 col-lg-4"
      >
        <div class="card medicine-card h-100" @click="selectMedicine(medicine)">
          <div class="card-body d-flex flex-column">
            <!-- Medicine Name -->
            <h5 class="card-title text-primary mb-2">
              <i class="bi bi-capsule-pill me-2"></i>
              {{ medicine.nomeProduto || medicine.nomeComercial }}
            </h5>
            
            <!-- Medicine Info -->
            <div class="medicine-info flex-grow-1">
              <!-- Active Principle -->
              <div v-if="medicine.principioAtivo" class="info-item mb-2">
                <small class="text-muted d-block">
                  <i class="bi bi-flask me-1"></i>
                  Princípio Ativo:
                </small>
                <span class="fw-medium">{{ medicine.principioAtivo }}</span>
              </div>
              
              <!-- Manufacturer -->
              <div v-if="medicine.empresa" class="info-item mb-2">
                <small class="text-muted d-block">
                  <i class="bi bi-building me-1"></i>
                  Fabricante:
                </small>
                <span class="fw-medium">{{ medicine.empresa }}</span>
              </div>
              
              <!-- Category -->
              <div v-if="medicine.categoria" class="info-item mb-2">
                <small class="text-muted d-block">
                  <i class="bi bi-tag me-1"></i>
                  Categoria:
                </small>
                <span class="fw-medium">{{ medicine.categoria }}</span>
              </div>
              
              <!-- Registration Number -->
              <div v-if="medicine.registro" class="info-item mb-2">
                <small class="text-muted d-block">
                  <i class="bi bi-card-text me-1"></i>
                  Registro:
                </small>
                <span class="fw-medium font-monospace">{{ medicine.registro }}</span>
              </div>
            </div>
            
            <!-- Action Button -->
            <div class="mt-3">
              <button 
                type="button" 
                class="btn btn-outline-primary w-100"
                @click.stop="selectMedicine(medicine)"
              >
                <i class="bi bi-eye me-2"></i>
                Ver Detalhes
              </button>
            </div>
          </div>
          
          <!-- Card Footer with Code -->
          <div class="card-footer bg-light">
            <small class="text-muted">
              <i class="bi bi-hash me-1"></i>
              Código: {{ medicine.codigo }}
            </small>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Empty State -->
    <div v-if="medicines.length === 0" class="text-center py-5">
      <div class="empty-state">
        <i class="bi bi-search display-1 text-muted mb-3"></i>
        <h4 class="text-muted">Nenhum medicamento encontrado</h4>
        <p class="text-muted mb-0">
          Tente buscar com termos diferentes ou verifique a ortografia.
        </p>
      </div>
    </div>
    
    <!-- Pagination (if needed in the future) -->
    <div v-if="medicines.length > 12" class="d-flex justify-content-center mt-4">
      <nav aria-label="Navegação de resultados">
        <ul class="pagination">
          <li class="page-item disabled">
            <span class="page-link">Anterior</span>
          </li>
          <li class="page-item active">
            <span class="page-link">1</span>
          </li>
          <li class="page-item">
            <a class="page-link" href="#">2</a>
          </li>
          <li class="page-item">
            <a class="page-link" href="#">3</a>
          </li>
          <li class="page-item">
            <a class="page-link" href="#">Próximo</a>
          </li>
        </ul>
      </nav>
    </div>
  </div>
</template>

<script>
export default {
  name: 'MedicineList',
  props: {
    medicines: {
      type: Array,
      required: true,
      default: () => []
    }
  },
  emits: ['select'],
  methods: {
    selectMedicine(medicine) {
      this.$emit('select', medicine)
    },
    
    truncateText(text, maxLength = 50) {
      if (!text) return ''
      if (text.length <= maxLength) return text
      return text.substring(0, maxLength) + '...'
    }
  }
}
</script>

<style scoped>
.medicine-list {
  margin-top: 2rem;
}

.medicine-card {
  cursor: pointer;
  transition: all 0.3s ease;
  border: 1px solid #dee2e6;
  border-radius: 12px;
}

.medicine-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  border-color: #0d6efd;
}

.medicine-card .card-title {
  font-size: 1.1rem;
  font-weight: 600;
  line-height: 1.3;
}

.medicine-card .card-body {
  padding: 1.25rem;
}

.medicine-card .card-footer {
  padding: 0.75rem 1.25rem;
  border-top: 1px solid #dee2e6;
}

.info-item {
  border-left: 3px solid #e9ecef;
  padding-left: 0.75rem;
}

.info-item:hover {
  border-left-color: #0d6efd;
}

.btn-outline-primary {
  border-width: 2px;
  font-weight: 500;
  transition: all 0.2s ease;
}

.btn-outline-primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(13, 110, 253, 0.3);
}

.badge {
  font-weight: 500;
}

.empty-state {
  padding: 3rem 1rem;
}

.empty-state .display-1 {
  font-size: 4rem;
  opacity: 0.5;
}

.font-monospace {
  font-family: 'Courier New', Courier, monospace;
  font-size: 0.9em;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .medicine-card .card-title {
    font-size: 1rem;
  }
  
  .medicine-card .card-body {
    padding: 1rem;
  }
  
  .medicine-card .card-footer {
    padding: 0.5rem 1rem;
  }
  
  .info-item {
    margin-bottom: 0.75rem !important;
  }
  
  .empty-state {
    padding: 2rem 1rem;
  }
  
  .empty-state .display-1 {
    font-size: 3rem;
  }
}

@media (max-width: 576px) {
  .medicine-list h3 {
    font-size: 1.3rem;
  }
  
  .badge {
    font-size: 0.8rem;
  }
  
  .medicine-card:hover {
    transform: translateY(-2px);
  }
}

/* Animation for card entrance */
.medicine-card {
  animation: fadeInUp 0.5s ease-out;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Stagger animation for multiple cards */
.medicine-card:nth-child(1) { animation-delay: 0.1s; }
.medicine-card:nth-child(2) { animation-delay: 0.2s; }
.medicine-card:nth-child(3) { animation-delay: 0.3s; }
.medicine-card:nth-child(4) { animation-delay: 0.4s; }
.medicine-card:nth-child(5) { animation-delay: 0.5s; }
.medicine-card:nth-child(6) { animation-delay: 0.6s; }
</style>