<template>
  <div v-if="show" class="loading-overlay" :class="{ 'overlay-fullscreen': fullscreen }">
    <div class="loading-content">
      <!-- Spinner -->
      <div class="spinner-container">
        <div class="custom-spinner">
          <div class="spinner-ring"></div>
          <div class="spinner-ring"></div>
          <div class="spinner-ring"></div>
          <div class="spinner-ring"></div>
        </div>
      </div>
      
      <!-- Loading Text -->
      <div class="loading-text">
        <h5 class="mb-2">{{ title }}</h5>
        <p class="mb-0 text-muted">{{ message }}</p>
      </div>
      
      <!-- Progress Bar (optional) -->
      <div v-if="showProgress" class="progress-container mt-3">
        <div class="progress">
          <div 
            class="progress-bar progress-bar-striped progress-bar-animated" 
            role="progressbar" 
            :style="{ width: progress + '%' }"
            :aria-valuenow="progress" 
            aria-valuemin="0" 
            aria-valuemax="100"
          >
            {{ progress }}%
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'LoadingSpinner',
  props: {
    show: {
      type: Boolean,
      default: false
    },
    title: {
      type: String,
      default: 'Carregando...'
    },
    message: {
      type: String,
      default: 'Por favor, aguarde'
    },
    fullscreen: {
      type: Boolean,
      default: false
    },
    showProgress: {
      type: Boolean,
      default: false
    },
    progress: {
      type: Number,
      default: 0,
      validator: (value) => value >= 0 && value <= 100
    }
  },
  mounted() {
    if (this.show && this.fullscreen) {
      document.body.style.overflow = 'hidden'
    }
  },
  watch: {
    show(newVal) {
      if (newVal && this.fullscreen) {
        document.body.style.overflow = 'hidden'
      } else {
        document.body.style.overflow = ''
      }
    }
  },
  beforeUnmount() {
    document.body.style.overflow = ''
  }
}
</script>

<style scoped>
.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(2px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  border-radius: 12px;
}

.overlay-fullscreen {
  position: fixed;
  z-index: 9999;
  border-radius: 0;
}

.loading-content {
  text-align: center;
  padding: 2rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
  max-width: 300px;
  width: 90%;
}

.spinner-container {
  margin-bottom: 1.5rem;
}

.custom-spinner {
  display: inline-block;
  position: relative;
  width: 64px;
  height: 64px;
}

.spinner-ring {
  box-sizing: border-box;
  display: block;
  position: absolute;
  width: 51px;
  height: 51px;
  margin: 6px;
  border: 6px solid #003770;
  border-radius: 50%;
  animation: spinner-ring 1.2s cubic-bezier(0.5, 0, 0.5, 1) infinite;
  border-color: #003770 transparent transparent transparent;
}

.spinner-ring:nth-child(1) {
  animation-delay: -0.45s;
}

.spinner-ring:nth-child(2) {
  animation-delay: -0.3s;
}

.spinner-ring:nth-child(3) {
  animation-delay: -0.15s;
}

@keyframes spinner-ring {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.loading-text h5 {
  color: #003770;
  font-weight: 600;
}

.loading-text p {
  font-size: 0.9rem;
}

.progress-container {
  width: 100%;
}

.progress {
  height: 8px;
  border-radius: 4px;
  background-color: #e9ecef;
}

.progress-bar {
  background: linear-gradient(90deg, #003770 0%, #002a5c 100%);
  border-radius: 4px;
  transition: width 0.3s ease;
}

/* Responsive */
@media (max-width: 576px) {
  .loading-content {
    padding: 1.5rem;
    max-width: 250px;
  }
  
  .custom-spinner {
    width: 48px;
    height: 48px;
  }
  
  .spinner-ring {
    width: 38px;
    height: 38px;
    margin: 5px;
    border-width: 4px;
  }
  
  .loading-text h5 {
    font-size: 1.1rem;
  }
  
  .loading-text p {
    font-size: 0.8rem;
  }
}
</style>