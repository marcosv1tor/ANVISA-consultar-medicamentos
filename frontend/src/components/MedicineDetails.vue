<template>
  <!-- Modal -->
  <div 
    class="modal fade" 
    :class="{ show: show }" 
    :style="{ display: show ? 'block' : 'none' }"
    tabindex="-1" 
    aria-labelledby="medicineDetailsLabel" 
    :aria-hidden="!show"
    @click.self="closeModal"
  >
    <div class="modal-dialog modal-xl modal-dialog-scrollable">
      <div class="modal-content">
        <!-- Modal Header -->
        <div class="modal-header bg-primary text-white">
          <h1 class="modal-title fs-4" id="medicineDetailsLabel">
            <i class="bi bi-info-circle me-2"></i>
            Detalhes do Medicamento
          </h1>
          <button 
            type="button" 
            class="btn-close btn-close-white" 
            @click="closeModal"
            aria-label="Fechar"
          ></button>
        </div>
        
        <!-- Modal Body -->
        <div class="modal-body">
          <div v-if="medicine" class="medicine-details">
            <!-- Medicine Header -->
            <div class="medicine-header mb-4">
              <div class="row">
                <div class="col-12">
                  <h2 class="text-primary mb-3">
                    <i class="bi bi-capsule-pill me-2"></i>
                    {{ medicine.nomeProduto }}
                  </h2>
                </div>
              </div>
            </div>
            
            <!-- Main Information Grid -->
            <div class="row g-4">
              <!-- Left Column -->
              <div class="col-lg-6">
                <!-- Basic Information -->
                <div class="info-section mb-4">
                  <h5 class="section-title">
                    <i class="bi bi-info-square me-2"></i>
                    Informações Básicas
                  </h5>
                  <div class="info-grid">
                    <div class="info-item">
                      <label>Nome Comercial:</label>
                      <span>{{ medicine.nomeComercial || medicine.nomeProduto || 'Não informado' }}</span>
                    </div>
                    
                    <div class="info-item" v-if="medicine.codigoProduto">
                      <label>Código do Produto:</label>
                      <span class="font-monospace">{{ medicine.codigoProduto }}</span>
                    </div>
                    
                    <div class="info-item" v-if="medicine.numeroRegistro">
                      <label>Número de Registro:</label>
                      <span class="font-monospace">{{ medicine.numeroRegistro }}</span>
                    </div>
                    
                    <div class="info-item" v-if="medicine.principioAtivo">
                      <label>Princípio Ativo:</label>
                      <span>{{ medicine.principioAtivo }}</span>
                    </div>
                    
                    <div class="info-item" v-if="medicine.medicamentoReferencia">
                      <label>Medicamento de Referência:</label>
                      <span>{{ medicine.medicamentoReferencia }}</span>
                    </div>
                    
                    <div class="info-item" v-if="medicine.categoriaRegulatoria">
                      <label>Categoria Regulatória:</label>
                      <span class="badge bg-info">{{ medicine.categoriaRegulatoria }}</span>
                    </div>
                    
                    <div class="info-item" v-if="medicine.tipoProduto">
                      <label>Tipo de Produto:</label>
                      <span>{{ medicine.tipoProduto }}</span>
                    </div>
                  </div>
                </div>
                
                <!-- Classes Terapêuticas -->
                <div class="info-section mb-4" v-if="medicine.classesTerapeuticas && medicine.classesTerapeuticas.length">
                  <h5 class="section-title">
                    <i class="bi bi-tags me-2"></i>
                    Classes Terapêuticas
                  </h5>
                  <div class="info-content">
                    <div class="d-flex flex-wrap gap-2">
                      <span 
                        v-for="classe in medicine.classesTerapeuticas" 
                        :key="classe"
                        class="badge bg-secondary"
                      >
                        {{ classe }}
                      </span>
                    </div>
                  </div>
                </div>
                
                <!-- Datas Importantes -->
                <div class="info-section mb-4">
                  <h5 class="section-title">
                    <i class="bi bi-calendar me-2"></i>
                    Datas Importantes
                  </h5>
                  <div class="info-grid">
                    <div class="info-item" v-if="medicine.dataProduto">
                      <label>Data do Produto:</label>
                      <span>{{ formatDate(medicine.dataProduto) }}</span>
                    </div>
                    
                    <div class="info-item" v-if="medicine.dataVencimento">
                      <label>Data de Vencimento:</label>
                      <span>{{ formatDate(medicine.dataVencimento) }}</span>
                    </div>
                    
                    <div class="info-item" v-if="medicine.dataVencimentoRegistro">
                      <label>Vencimento do Registro:</label>
                      <span>{{ formatDate(medicine.dataVencimentoRegistro) }}</span>
                    </div>
                    
                    <div class="info-item" v-if="medicine.mesAnoVencimento">
                      <label>Mês/Ano Vencimento:</label>
                      <span class="font-monospace">{{ medicine.mesAnoVencimento }}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <!-- Right Column -->
              <div class="col-lg-6">
                <!-- Empresa -->
                <div class="info-section mb-4" v-if="medicine.empresa">
                  <h5 class="section-title">
                    <i class="bi bi-building me-2"></i>
                    Empresa
                  </h5>
                  <div class="info-grid">
                    <div class="info-item" v-if="medicine.empresa.razaoSocial">
                      <label>Razão Social:</label>
                      <span>{{ medicine.empresa.razaoSocial }}</span>
                    </div>
                    
                    <div class="info-item" v-if="medicine.empresa.cnpj">
                      <label>CNPJ:</label>
                      <span class="font-monospace">{{ formatCNPJ(medicine.empresa.cnpj) }}</span>
                    </div>
                    
                    <div class="info-item" v-if="medicine.empresa.numeroAutorizacao">
                      <label>Número de Autorização:</label>
                      <span class="font-monospace">{{ medicine.empresa.numeroAutorizacao }}</span>
                    </div>
                  </div>
                </div>
                
                <!-- Processo -->
                <div class="info-section mb-4" v-if="medicine.processo">
                  <h5 class="section-title">
                    <i class="bi bi-file-earmark-text me-2"></i>
                    Processo
                  </h5>
                  <div class="info-grid">
                    <div class="info-item" v-if="medicine.processo.numero">
                      <label>Número do Processo:</label>
                      <span class="font-monospace">{{ medicine.processo.numero }}</span>
                    </div>
                    
                    <div class="info-item" v-if="medicine.processo.situacao">
                      <label>Situação:</label>
                      <span class="badge bg-success">{{ medicine.processo.situacao }}</span>
                    </div>
                  </div>
                </div>
                
                <!-- Códigos de Bula -->
                <div class="info-section mb-4" v-if="medicine.codigoBulaPaciente || medicine.codigoBulaProfissional">
                  <h5 class="section-title">
                    <i class="bi bi-file-pdf me-2"></i>
                    Bulas Disponíveis
                  </h5>
                  <div class="info-grid">
                    <div class="info-item" v-if="medicine.codigoBulaPaciente">
                      <label>Bula do Paciente:</label>
                      <span class="badge bg-primary">Disponível</span>
                    </div>
                    
                    <div class="info-item" v-if="medicine.codigoBulaProfissional">
                      <label>Bula do Profissional:</label>
                      <span class="badge bg-primary">Disponível</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Apresentações -->
            <div class="row g-4 mt-2" v-if="medicine.apresentacoes && medicine.apresentacoes.length">
              <div class="col-12">
                <div class="info-section mb-4">
                  <h5 class="section-title">
                    <i class="bi bi-box-seam me-2"></i>
                    Apresentações ({{ medicine.apresentacoes.length }})
                  </h5>
                  <div class="apresentacoes-container">
                    <div 
                      v-for="(apresentacao, index) in medicine.apresentacoes" 
                      :key="apresentacao.codigo || index"
                      class="apresentacao-card mb-3"
                    >
                      <div class="card">
                        <div class="card-header bg-light">
                          <h6 class="mb-0">
                            <i class="bi bi-capsule me-2"></i>
                            Apresentação {{ apresentacao.numero || (index + 1) }}
                            <span v-if="apresentacao.tarja" class="badge ms-2" :class="getTargaClass(apresentacao.tarja)">
                              Tarja {{ apresentacao.tarja }}
                            </span>
                          </h6>
                        </div>
                        <div class="card-body">
                          <div class="row g-3">
                            <div class="col-md-6">
                              <div class="info-grid">
                                <div class="info-item" v-if="apresentacao.apresentacao">
                                  <label>Descrição:</label>
                                  <span>{{ apresentacao.apresentacao }}</span>
                                </div>
                                
                                <div class="info-item" v-if="apresentacao.registro">
                                  <label>Registro:</label>
                                  <span class="font-monospace">{{ apresentacao.registro }}</span>
                                </div>
                                
                                <div class="info-item" v-if="apresentacao.qtdUnidadeMedida">
                                  <label>Quantidade:</label>
                                  <span>{{ apresentacao.qtdUnidadeMedida }}</span>
                                </div>
                                
                                <div class="info-item" v-if="apresentacao.validade">
                                  <label>Validade:</label>
                                  <span>{{ apresentacao.validade }} {{ apresentacao.tipoValidade === '2' ? 'meses' : 'anos' }}</span>
                                </div>
                              </div>
                            </div>
                            
                            <div class="col-md-6">
                              <div class="info-grid">
                                <div class="info-item" v-if="apresentacao.formasFarmaceuticas && apresentacao.formasFarmaceuticas.length">
                                  <label>Forma Farmacêutica:</label>
                                  <span>{{ apresentacao.formasFarmaceuticas.join(', ') }}</span>
                                </div>
                                
                                <div class="info-item" v-if="apresentacao.viasAdministracao && apresentacao.viasAdministracao.length">
                                  <label>Via de Administração:</label>
                                  <span>{{ apresentacao.viasAdministracao.join(', ') }}</span>
                                </div>
                                
                                <div class="info-item" v-if="apresentacao.principiosAtivos && apresentacao.principiosAtivos.length">
                                  <label>Princípios Ativos:</label>
                                  <span>{{ apresentacao.principiosAtivos.join(', ') }}</span>
                                </div>
                                
                                <div class="info-item" v-if="apresentacao.tipoAutorizacao">
                                  <label>Tipo de Autorização:</label>
                                  <span class="badge bg-success">{{ apresentacao.tipoAutorizacao }}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          <!-- Restrições -->
                          <div class="mt-3" v-if="apresentacao.restricaoPrescricao || apresentacao.restricaoUso">
                            <h6 class="text-warning">
                              <i class="bi bi-exclamation-triangle me-2"></i>
                              Restrições
                            </h6>
                            <div class="d-flex flex-wrap gap-2">
                              <span 
                                v-for="restricao in apresentacao.restricaoPrescricao" 
                                :key="restricao"
                                class="badge bg-warning text-dark"
                              >
                                {{ restricao }}
                              </span>
                              <span 
                                v-for="restricao in apresentacao.restricaoUso" 
                                :key="restricao"
                                class="badge bg-info text-dark"
                              >
                                {{ restricao }}
                              </span>
                            </div>
                          </div>
                          
                          <!-- Conservação -->
                          <div class="mt-3" v-if="apresentacao.conservacao && apresentacao.conservacao.length">
                            <h6 class="text-info">
                              <i class="bi bi-thermometer me-2"></i>
                              Conservação
                            </h6>
                            <ul class="list-unstyled mb-0">
                              <li v-for="instrucao in apresentacao.conservacao" :key="instrucao" class="small">
                                <i class="bi bi-dot"></i> {{ instrucao }}
                              </li>
                            </ul>
                          </div>
                          
                          <!-- Fabricantes -->
                          <div class="mt-3" v-if="apresentacao.fabricantesNacionais && apresentacao.fabricantesNacionais.length">
                            <h6 class="text-success">
                              <i class="bi bi-geo-alt me-2"></i>
                              Fabricantes
                            </h6>
                            <div class="fabricantes-list">
                              <div 
                                v-for="fabricante in apresentacao.fabricantesNacionais" 
                                :key="fabricante.cnpj"
                                class="small mb-1"
                              >
                                <strong>{{ fabricante.fabricante }}</strong>
                                <span v-if="fabricante.cidade && fabricante.uf"> - {{ fabricante.cidade }}/{{ fabricante.uf }}</span>
                                <br>
                                <span class="text-muted">{{ fabricante.etapaFabricacao }}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Clinical Information -->
            <div class="row g-4 mt-2">
              <div class="col-12">
                <!-- Indications -->
                <div class="info-section mb-4" v-if="medicine.indicacoes">
                  <h5 class="section-title">
                    <i class="bi bi-check-circle me-2"></i>
                    Indicações
                  </h5>
                  <div class="info-content">
                    <p class="mb-0">{{ medicine.indicacoes }}</p>
                  </div>
                </div>
                
                <!-- Contraindications -->
                <div class="info-section mb-4" v-if="medicine.contraindicacoes">
                  <h5 class="section-title text-danger">
                    <i class="bi bi-x-circle me-2"></i>
                    Contraindicações
                  </h5>
                  <div class="info-content alert alert-danger">
                    <p class="mb-0">{{ medicine.contraindicacoes }}</p>
                  </div>
                </div>
                
                <!-- Precautions -->
                <div class="info-section mb-4" v-if="medicine.precaucoes">
                  <h5 class="section-title text-warning">
                    <i class="bi bi-exclamation-triangle me-2"></i>
                    Precauções
                  </h5>
                  <div class="info-content alert alert-warning">
                    <p class="mb-0">{{ medicine.precaucoes }}</p>
                  </div>
                </div>
                
                <!-- Drug Interactions -->
                <div class="info-section mb-4" v-if="medicine.interacoes">
                  <h5 class="section-title">
                    <i class="bi bi-arrow-left-right me-2"></i>
                    Interações Medicamentosas
                  </h5>
                  <div class="info-content">
                    <p class="mb-0">{{ medicine.interacoes }}</p>
                  </div>
                </div>
                
                <!-- Posology -->
                <div class="info-section mb-4" v-if="medicine.posologia">
                  <h5 class="section-title">
                    <i class="bi bi-clock me-2"></i>
                    Posologia
                  </h5>
                  <div class="info-content">
                    <p class="mb-0">{{ medicine.posologia }}</p>
                  </div>
                </div>
                
                <!-- Overdose -->
                <div class="info-section mb-4" v-if="medicine.superdosagem">
                  <h5 class="section-title text-danger">
                    <i class="bi bi-shield-exclamation me-2"></i>
                    Superdosagem
                  </h5>
                  <div class="info-content alert alert-danger">
                    <p class="mb-0">{{ medicine.superdosagem }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Loading State -->
          <div v-else class="text-center py-5">
            <div class="spinner-border text-primary" role="status">
              <span class="visually-hidden">Carregando...</span>
            </div>
            <p class="mt-3 text-muted">Carregando detalhes do medicamento...</p>
          </div>
        </div>
        
        <!-- Modal Footer -->
        <div class="modal-footer">
          <div class="d-flex justify-content-between w-100">
            <div>
              <small class="text-muted">
                <i class="bi bi-hash me-1"></i>
                Código: {{ medicine?.codigoProduto || 'N/A' }}
              </small>
              <br>
              <small class="text-muted" v-if="medicine?.numeroRegistro">
                <i class="bi bi-file-earmark-text me-1"></i>
                Registro: {{ medicine.numeroRegistro }}
              </small>
            </div>
            <div>
              <button 
                type="button" 
                class="btn btn-success me-2"
                @click="downloadPDF('patient')"
                :disabled="!medicine || !medicine.codigoBulaPaciente"
              >
                <i class="bi bi-download me-2"></i>
                Bula Paciente (PDF)
              </button>
              <button 
                type="button" 
                class="btn btn-info me-2"
                @click="downloadPDF('professional')"
                :disabled="!medicine || !medicine.codigoBulaProfissional"
              >
                <i class="bi bi-download me-2"></i>
                Bula Profissional (PDF)
              </button>
              <button 
                type="button" 
                class="btn btn-secondary"
                @click="closeModal"
              >
                <i class="bi bi-x-lg me-2"></i>
                Fechar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  
  <!-- Modal Backdrop -->
  <div 
    v-if="show" 
    class="modal-backdrop fade show"
    @click="closeModal"
  ></div>
</template>

<script>
export default {
  name: 'MedicineDetails',
  props: {
    medicine: {
      type: Object,
      default: null
    },
    show: {
      type: Boolean,
      default: false
    }
  },
  emits: ['close', 'download-pdf'],
  watch: {
    show(newVal) {
      if (newVal) {
        document.body.classList.add('modal-open')
      } else {
        document.body.classList.remove('modal-open')
      }
    }
  },
  beforeUnmount() {
    document.body.classList.remove('modal-open')
  },
  methods: {
    closeModal() {
      this.$emit('close')
    },
    
    downloadPDF(type) {
      if (!this.medicine) return
      
      let codigo = null
      let tipoDownload = null
      
      if (type === 'patient' && this.medicine.codigoBulaPaciente) {
        codigo = this.medicine.codigoBulaPaciente
        tipoDownload = 'paciente'
      } else if (type === 'professional' && this.medicine.codigoBulaProfissional) {
        codigo = this.medicine.codigoBulaProfissional
        tipoDownload = 'profissional'
      }
      
      if (codigo && tipoDownload) {
        this.$emit('download-pdf', codigo, tipoDownload)
      }
    },
    
    formatDate(dateString) {
      if (!dateString) return 'Não informado'
      
      try {
        const date = new Date(dateString)
        return date.toLocaleDateString('pt-BR')
      } catch (error) {
        return dateString
      }
    },
    
    formatCNPJ(cnpj) {
      if (!cnpj) return 'Não informado'
      
      // Remove caracteres não numéricos
      const numbers = cnpj.replace(/\D/g, '')
      
      // Aplica a máscara XX.XXX.XXX/XXXX-XX
      if (numbers.length === 14) {
        return numbers.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5')
      }
      
      return cnpj
    },
    
    getTargaClass(tarja) {
      switch (tarja?.toLowerCase()) {
        case 'vermelha':
          return 'bg-danger'
        case 'amarela':
          return 'bg-warning text-dark'
        case 'preta':
          return 'bg-dark'
        default:
          return 'bg-secondary'
      }
    }
  }
}
</script>

<style scoped>
.modal {
  z-index: 1055;
}

.modal-backdrop {
  z-index: 1050;
}

.medicine-details {
  font-size: 0.95rem;
}

.section-title {
  color: #003770;
  font-weight: 600;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid #e9ecef;
}

.info-section {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 1.5rem;
  border-left: 4px solid #003770;
}

.info-grid {
  display: grid;
  gap: 1rem;
}

.info-item {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 0.5rem;
  align-items: start;
}

.info-item label {
  font-weight: 600;
  color: #495057;
  margin: 0;
}

.info-item span {
  color: #212529;
  word-break: break-word;
}

.info-content {
  line-height: 1.6;
}

.info-content p {
  text-align: justify;
}

.font-monospace {
  font-family: 'Courier New', Courier, monospace;
  background: #e9ecef;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.9em;
}

.badge {
  font-size: 0.8em;
}

.alert {
  margin: 0;
  border-radius: 6px;
}

.modal-header {
  border-bottom: none;
}

.modal-footer {
  border-top: 1px solid #dee2e6;
  background: #f8f9fa;
}

.btn {
  border-radius: 6px;
  font-weight: 500;
}

.btn-success {
  background-color: #198754;
  border-color: #198754;
}

.btn-info {
  background-color: #0dcaf0;
  border-color: #0dcaf0;
  color: #000;
}

/* Responsive adjustments */
@media (max-width: 992px) {
  .modal-dialog {
    margin: 1rem;
  }
  
  .info-item {
    grid-template-columns: 1fr;
    gap: 0.25rem;
  }
  
  .info-item label {
    font-size: 0.9rem;
  }
}

@media (max-width: 768px) {
  .modal-dialog {
    margin: 0.5rem;
  }
  
  .info-section {
    padding: 1rem;
  }
  
  .modal-footer {
    flex-direction: column;
    gap: 1rem;
  }
  
  .modal-footer .d-flex {
    flex-direction: column;
    gap: 1rem;
  }
  
  .modal-footer .btn {
    width: 100%;
  }
}

/* Apresentações */
.apresentacoes-container {
  max-height: 600px;
  overflow-y: auto;
}

.apresentacao-card .card {
  border: 1px solid #dee2e6;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  transition: box-shadow 0.2s ease;
}

.apresentacao-card .card:hover {
  box-shadow: 0 4px 8px rgba(0,0,0,0.15);
}

.apresentacao-card .card-header {
  background-color: #f8f9fa !important;
  border-bottom: 1px solid #dee2e6;
  border-radius: 8px 8px 0 0 !important;
}

.apresentacao-card .card-body {
  padding: 1.25rem;
}

.fabricantes-list {
  background: #f8f9fa;
  border-radius: 6px;
  padding: 0.75rem;
  border-left: 3px solid #28a745;
}

/* Badges personalizados */
.badge {
  font-size: 0.75em;
  font-weight: 500;
}

.badge.bg-warning.text-dark {
  background-color: #ffc107 !important;
  color: #000 !important;
}

.badge.bg-info.text-dark {
  background-color: #0dcaf0 !important;
  color: #000 !important;
}

/* Melhorias gerais */
.info-grid {
  gap: 0.75rem;
}

.info-item label {
  font-size: 0.9rem;
  font-weight: 600;
  color: #495057;
  margin-bottom: 0.25rem;
}

.info-item span {
  font-size: 0.9rem;
  line-height: 1.4;
}

/* Scrollbar personalizada */
.apresentacoes-container::-webkit-scrollbar {
  width: 6px;
}

.apresentacoes-container::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.apresentacoes-container::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.apresentacoes-container::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

/* Animation */
.modal.show {
  animation: modalFadeIn 0.3s ease-out;
}

@keyframes modalFadeIn {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
</style>