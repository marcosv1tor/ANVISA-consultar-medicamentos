const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const AnvisaScraper = require('./anvisaScraper');

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares
app.use(helmet());

// Configuração de CORS para produção
const corsOptions = {
  origin: [
    'http://localhost:3000',
    'http://localhost:5173',
    'https://anvisa-consultar-medicamentos.vercel.app',
    'https://anvisa-consultar-medicamentos-git-main-marcosvitors-projects.vercel.app',
    'https://anvisa-consultar-medicamentos-marcosvitors-projects.vercel.app'
  ],
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(morgan('combined'));
app.use(express.json());

// Instância do scraper ANVISA
const anvisaScraper = new AnvisaScraper();

// Inicializar scraper
const initializeScraper = async () => {
  const success = await anvisaScraper.initialize();
  if (!success) {
    console.log('⚠️ Falha ao inicializar scraper, tentando novamente em 10 segundos...');
    setTimeout(initializeScraper, 10000);
  }
};

// Inicializar scraper ao iniciar o servidor
initializeScraper();

// Handler para fechar o scraper quando o servidor for encerrado
process.on('SIGINT', async () => {
  console.log('\n🔄 Encerrando servidor...');
  await anvisaScraper.close();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n🔄 Encerrando servidor...');
  await anvisaScraper.close();
  process.exit(0);
});

// Rotas

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Buscar medicamentos
app.get('/api/medicamentos/buscar', async (req, res) => {
  try {
    const { nome } = req.query;
    
    if (!nome || nome.trim().length < 2) {
      return res.status(400).json({
        error: 'Nome do medicamento deve ter pelo menos 2 caracteres'
      });
    }

    console.log(`🔍 Buscando medicamento: ${nome}`);
    
    const response = await anvisaScraper.searchMedicines(nome.trim());

    const data = response?.content || response || [];
    
    const medicamentos = data.map(item => ({
      idProduto: item.idProduto,
      numeroRegistro: item.numeroRegistro,
      nomeProduto: item.nomeProduto,
      expediente: item.expediente,
      razaoSocial: item.razaoSocial,
      cnpj: item.cnpj,
      numeroTransacao: item.numeroTransacao,
      data: item.data,
      numProcesso: item.numProcesso,
      idBulaPacienteProtegido: item.idBulaPacienteProtegido,
      idBulaProfissionalProtegido: item.idBulaProfissionalProtegido,
      dataAtualizacao: item.dataAtualizacao,
      // Campos adicionais para compatibilidade
      codigo: item.idProduto,
      empresa: item.razaoSocial,
      codigoBulaPaciente: item.idBulaPacienteProtegido,
      codigoBulaProfissional: item.idBulaProfissionalProtegido
    }));

    console.log(`📋 Encontrados ${medicamentos.length} medicamentos`);
    
    res.json({
      success: true,
      count: medicamentos.length,
      data: medicamentos
    });
    
  } catch (error) {
    console.error('❌ Erro na busca:', error.message);
    
    res.status(error.response?.status || 500).json({
      success: false,
      error: error.response?.data?.error || 'Erro ao buscar medicamentos',
      message: error.message
    });
  }
});


// idProduto": 1081105,
//             "numeroRegistro": "102351216",
//             "nomeProduto": "ANASTROZOL",
//             "expediente": "1342985249",
//             "razaoSocial": "EMS S/A",
//             "cnpj": "57507378000365",
//             "numeroTransacao": "10673842024",
//             "data": "2024-09-30T17:57:57.000-0300",
//             "numProcesso": "25351702528201501",
//             "idBulaPacienteProtegido": "eyJhbGciOiJIUzUxMiJ9.eyJqdGkiOiIyNjA0ODMzMiIsIm5iZiI6MTc1NTk3ODgyMSwiZXhwIjoxNzU1OTc5MTIxfQ.SVaWITUK5pnQfClWUgvQ5T73cEL4GTHfnqAYFP8uC1ePcRlP_TGnsUkkvfs0BOser7TX9lvRk4GDKNtVxyEGFw",
//             "idBulaProfissionalProtegido": "eyJhbGciOiJIUzUxMiJ9.eyJqdGkiOiIyNjA0ODMzMyIsIm5iZiI6MTc1NTk3ODgyMSwiZXhwIjoxNzU1OTc5MTIxfQ.wx9w4CiTHg-6Aq-sVeRaYE_mkkZotUrW-L0DtRI5VKf17PkxB5v3Pwb5U80SAEFhSXpbKzVfu5vfS3DNBewJ-Q",
//             "dataAtualizacao": "2025-08-22T00:00:00.000-0300"

// Detalhes do medicamento
app.get('/api/medicamentos/detalhes/:codigo', async (req, res) => {
  try {
    const { codigo } = req.params;
    
    if (!codigo) {
      return res.status(400).json({
        error: 'Código do medicamento é obrigatório'
      });
    }

    console.log(`📄 Buscando detalhes do medicamento: ${codigo}`);
    
    const response = await anvisaScraper.getMedicineDetails(codigo);
    
    res.json({
      success: true,
      data: response
    });
    
  } catch (error) {
    console.error('❌ Erro nos detalhes:', error.message);
    
    res.status(error.response?.status || 500).json({
      success: false,
      error: error.response?.data?.error || 'Erro ao buscar detalhes do medicamento',
      message: error.message
    });
  }
});

// Download de bula
app.get('/api/medicamentos/bula/:codigo', async (req, res) => {
  try {
    const { codigo } = req.params;
    const { tipo = 'paciente' } = req.query;
    
    if (!codigo) {
      return res.status(400).json({
        error: 'Código da bula é obrigatório'
      });
    }

    // Validar tipo de bula
    if (!['paciente', 'profissional'].includes(tipo)) {
      return res.status(400).json({
        error: 'Tipo de bula deve ser "paciente" ou "profissional"'
      });
    }

    console.log(`📥 Download bula ${tipo}: ${codigo}`);
    
    const pdfBuffer = await anvisaScraper.downloadBulaPDF(codigo, tipo);

    // Configurar headers para download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="bula-${tipo}-${codigo}.pdf"`);
    res.setHeader('Content-Length', pdfBuffer.length);
    
    // Enviar o buffer PDF
    res.send(pdfBuffer);
    
  } catch (error) {
    console.error('❌ Erro no download:', error.message);
    
    // Verificar se é erro 404 da ANVISA
    if (error.message.includes('404')) {
      return res.status(404).json({
        success: false,
        error: 'Bula não disponível',
        message: 'A bula solicitada não está disponível no momento. Isso pode ocorrer devido a limitações temporárias da API da ANVISA ou porque a bula não foi encontrada.',
        suggestion: 'Tente novamente mais tarde ou verifique se o medicamento possui bula disponível.'
      });
    }
    
    res.status(error.response?.status || 500).json({
      success: false,
      error: error.response?.data?.error || 'Erro ao fazer download da bula',
      message: error.message
    });
  }
});

// Middleware de erro global
app.use((error, req, res, next) => {
  console.error('❌ Erro não tratado:', error);
  res.status(500).json({
    success: false,
    error: 'Erro interno do servidor'
  });
});

// Middleware para rotas não encontradas
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Rota não encontrada'
  });
});

// Iniciar servidor apenas se não estiver em ambiente de teste
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`🚀 Servidor MEDWARE API rodando na porta ${PORT}`);
    console.log(`📍 Health check: http://localhost:${PORT}/health`);
    console.log(`🔍 Buscar medicamentos: http://localhost:${PORT}/api/medicamentos/buscar?nome=paracetamol`);
  });
}

module.exports = app;