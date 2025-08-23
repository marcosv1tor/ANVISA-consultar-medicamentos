<template>
  <div v-if="show" class="error-container">
    <div class="alert alert-danger error-alert" role="alert">
      <div class="d-flex align-items-start">
        <!-- Error Icon -->
        <div class="error-icon me-3">
          <i class="bi bi-exclamation-triangle-fill"></i>
        </div>
        
        <!-- Error Content -->
        <div class="error-content flex-grow-1">
          <h6 class="alert-heading mb-2">
            <strong>{{ title }}</strong>
          </h6>
          
          <p class="mb-2">{{ message }}</p>
          
          <!-- Error Details (collapsible) -->
          <div v-if="details" class="error-details">
            <button 
              class="btn btn-link btn-sm p-0 text-decoration-none"
              type="button"
              @click="showDetails = !showDetails"
              :aria-expanded="showDetails"
            >
              <i class="bi" :class="showDetails ? 'bi-chevron-up' : 'bi-chevron-down'"></i>
              {{ showDetails ? 'Ocultar detalhes' : 'Ver detalhes' }}
            </button>
            
            <div v-show="showDetails" class="mt-2">
              <div class="error-details-content">
                <small class="text-muted">{{ details }}</small>
              </div>
            </div>
          </div>
          
          <!-- Action Buttons -->
          <div v-if="showRetry || showClose" class="error-actions mt-3">
            <button 
              v-if="showRetry"
              type="button" 
              class="btn btn-outline-danger btn-sm me-2"
              @click="retry"
              :disabled="retrying"
            >
              <span v-if="retrying" class="spinner-border spinner-border-sm me-2" role="status">
                <span class="visually-hidden">Tentando novamente...</span>
              </span>
              <i v-else class="bi bi-arrow-clockwise me-2"></i>
              {{ retrying ? 'Tentando...' : 'Tentar Novamente' }}
            </button>
            
            <button 
              v-if="showClose"
              type="button" 
              class="btn btn-outline-secondary btn-sm"
              @click="close"
            >
              <i class="bi bi-x-lg me-2"></i>
              Fechar
            </button>
          </div>
        </div>
        
        <!-- Close Button -->
        <button 
          v-if="dismissible"
          type="button" 
          class="btn-close"
          @click="close"
          aria-label="Fechar"
        ></button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ErrorMessage',
  props: {
    show: {
      type: Boolean,
      default: false
    },
    title: {
      type: String,
      default: 'Erro'
    },
    message: {
      type: String,
      required: true
    },
    details: {
      type: String,
      default: null
    },
    showRetry: {
      type: Boolean,
      default: false
    },
    showClose: {
      type: Boolean,
      default: true
    },
    dismissible: {
      type: Boolean,
      default: true
    },
    autoHide: {
      type: Boolean,
      default: false
    },
    autoHideDelay: {
      type: Number,
      default: 5000
    }
  },
  emits: ['close', 'retry'],
  data() {
    return {
      showDetails: false,
      retrying: false,
      autoHideTimer: null
    }
  },
  mounted() {
    if (this.show && this.autoHide) {
      this.startAutoHideTimer()
    }
  },
  watch: {
    show(newVal) {
      if (newVal && this.autoHide) {
        this.startAutoHideTimer()
      } else {
        this.clearAutoHideTimer()
      }
    }
  },
  beforeUnmount() {
    this.clearAutoHideTimer()
  },
  methods: {
    close() {
      this.clearAutoHideTimer()
      this.$emit('close')
    },
    
    async retry() {
      this.retrying = true
      try {
        await this.$emit('retry')
      } finally {
        this.retrying = false
      }
    },
    
    startAutoHideTimer() {
      this.clearAutoHideTimer()
      this.autoHideTimer = setTimeout(() => {
        this.close()
      }, this.autoHideDelay)
    },
    
    clearAutoHideTimer() {
      if (this.autoHideTimer) {
        clearTimeout(this.autoHideTimer)
        this.autoHideTimer = null
      }
    }
  }
}
</script>

<style scoped>
.error-container {
  margin: 1rem 0;
}

.error-alert {
  border: none;
  border-left: 4px solid #dc3545;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(220, 53, 69, 0.15);
  background: linear-gradient(135deg, #f8d7da 0%, #f1aeb5 100%);
  animation: slideInDown 0.3s ease-out;
}

.error-icon {
  font-size: 1.5rem;
  color: #dc3545;
  margin-top: 0.125rem;
}

.error-content {
  min-width: 0;
}

.alert-heading {
  color: #721c24;
  font-size: 1rem;
}

.error-alert p {
  color: #58151c;
  margin-bottom: 0.5rem;
  line-height: 1.5;
}

.error-details-content {
  background: rgba(255, 255, 255, 0.7);
  border-radius: 4px;
  padding: 0.75rem;
  border-left: 3px solid #dc3545;
  font-family: 'Courier New', Courier, monospace;
  font-size: 0.8rem;
  word-break: break-word;
  max-height: 150px;
  overflow-y: auto;
}

.error-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.btn-outline-danger {
  border-color: #dc3545;
  color: #dc3545;
}

.btn-outline-danger:hover {
  background-color: #dc3545;
  border-color: #dc3545;
  color: white;
}

.btn-outline-secondary {
  border-color: #6c757d;
  color: #6c757d;
}

.btn-outline-secondary:hover {
  background-color: #6c757d;
  border-color: #6c757d;
  color: white;
}

.btn-link {
  color: #dc3545;
  font-weight: 500;
}

.btn-link:hover {
  color: #b02a37;
}

.btn-close {
  margin-top: 0.125rem;
}

/* Animations */
@keyframes slideInDown {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Responsive */
@media (max-width: 576px) {
  .error-alert {
    margin: 0.5rem 0;
  }
  
  .error-icon {
    font-size: 1.25rem;
  }
  
  .alert-heading {
    font-size: 0.9rem;
  }
  
  .error-alert p {
    font-size: 0.85rem;
  }
  
  .error-actions {
    flex-direction: column;
  }
  
  .error-actions .btn {
    width: 100%;
  }
  
  .error-details-content {
    font-size: 0.75rem;
    max-height: 100px;
  }
}

/* High contrast mode */
@media (prefers-contrast: high) {
  .error-alert {
    border-width: 3px;
    border-color: #dc3545;
  }
  
  .error-icon {
    font-weight: bold;
  }
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  .error-alert {
    animation: none;
  }
}
</style>