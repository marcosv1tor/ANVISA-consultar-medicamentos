const puppeteer = require('puppeteer');
const glob = require('glob');
const fs = require('fs');
const os = require('os');
const path = require('path');

class AnvisaScraper {
  constructor() {
    this.browser = null;
    this.page = null;
  }

  // Detectar automaticamente o executável do Chrome no Render
  findChromeExecutable() {
    const isProduction = process.env.NODE_ENV === 'production';
    
    if (!isProduction) {
      console.log('🔧 Ambiente de desenvolvimento - usando Chromium padrão do Puppeteer');
      return null; // Usar padrão do Puppeteer
    }

    console.log('🔍 Procurando executável do Chrome no Render...');
    
    // Caminhos possíveis do Chrome no Render
    const possiblePaths = [
      process.env.PUPPETEER_EXECUTABLE_PATH,
      process.env.PUPPETEER_CACHE_DIR ? `${process.env.PUPPETEER_CACHE_DIR}/chrome/linux-*/chrome-linux*/chrome` : null,
      '/home/render/.cache/puppeteer/chrome/linux-*/chrome-linux*/chrome',
      '/opt/render/project/.cache/puppeteer/chrome/linux-*/chrome-linux*/chrome',
      '/usr/bin/google-chrome-stable',
      '/usr/bin/google-chrome',
      '/usr/bin/chromium-browser',
      '/usr/bin/chromium'
    ];

    for (const chromePath of possiblePaths) {
      if (!chromePath) continue;
      
      try {
        // Se contém wildcard, usar glob
        if (chromePath.includes('*')) {
          const matches = glob.sync(chromePath);
          if (matches.length > 0 && fs.existsSync(matches[0])) {
            console.log(`✅ Chrome encontrado via glob: ${matches[0]}`);
            return matches[0];
          }
        } else if (fs.existsSync(chromePath)) {
          console.log(`✅ Chrome encontrado: ${chromePath}`);
          return chromePath;
        }
      } catch (error) {
        console.log(`❌ Erro ao verificar ${chromePath}:`, error.message);
      }
    }

    console.log('⚠️ Chrome não encontrado, usando configuração padrão');
    return null;
  }

  async initialize() {
    try {
      console.log('🚀 Inicializando navegador Puppeteer...');
      
      // Configurações específicas para produção (Render)
      const isProduction = process.env.NODE_ENV === 'production';
      const chromeExecutable = this.findChromeExecutable();
      
      const puppeteerConfig = {
        headless: 'new',
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--disable-gpu',
          '--disable-background-timer-throttling',
          '--disable-backgrounding-occluded-windows',
          '--disable-renderer-backgrounding',
          '--disable-features=TranslateUI',
          '--disable-ipc-flooding-protection',
          '--disable-web-security',
          '--disable-features=VizDisplayCompositor'
        ]
      };
      
      // Configurar executável do Chrome se encontrado
      if (chromeExecutable) {
        puppeteerConfig.executablePath = chromeExecutable;
        console.log(`🎯 Usando Chrome: ${chromeExecutable}`);
      } else {
        console.log('🔧 Usando Chromium padrão do Puppeteer');
      }
      
      // Log das configurações para debug
      console.log('⚙️ Configurações do Puppeteer:', {
        isProduction,
        executablePath: puppeteerConfig.executablePath || 'padrão',
        headless: puppeteerConfig.headless,
        argsCount: puppeteerConfig.args.length
      });
      
      this.browser = await puppeteer.launch(puppeteerConfig);

      this.page = await this.browser.newPage();
      
      // Configurar User-Agent realista
      await this.page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
      
      // Configurar viewport
      await this.page.setViewport({ width: 1366, height: 768 });
      
      // Navegar para a página principal da ANVISA
      console.log('🌐 Acessando site da ANVISA...');
      await this.page.goto('https://consultas.anvisa.gov.br/', {
        waitUntil: 'networkidle2',
        timeout: 30000
      });
      
      console.log('✅ Navegador inicializado com sucesso');
      return true;
    } catch (error) {
      console.error('❌ Erro ao inicializar navegador:', error.message);
      return false;
    }
  }

  async searchMedicines(nomeMedicamento) {
    try {
      if (!this.page) {
        throw new Error('Navegador não inicializado');
      }

      console.log(`🔍 Buscando medicamento: ${nomeMedicamento}`);
      
      // Fazer a requisição para a API usando o contexto do navegador
      const response = await this.page.evaluate(async (nome) => {
        const url = `https://consultas.anvisa.gov.br/api/consulta/bulario?filter%5BnomeProduto%5D=${encodeURIComponent(nome)}`;
        
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Authorization': 'Guest',
            'Accept': 'application/json, text/plain, */*',
            'Accept-Language': 'pt-BR,pt;q=0.9,en;q=0.8',
            'Referer': 'https://consultas.anvisa.gov.br/',
            'Origin': 'https://consultas.anvisa.gov.br',
            'Sec-Fetch-Dest': 'empty',
            'Sec-Fetch-Mode': 'cors',
            'Sec-Fetch-Site': 'same-origin'
          }
        });
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        return await response.json();
      }, nomeMedicamento);

      console.log(`✅ Encontrados ${response.content?.length || 0} medicamentos`);
      return response;
    } catch (error) {
      console.error('❌ Erro ao buscar medicamentos:', error.message);
      throw error;
    }
  }

  async getMedicineDetails(codigo) {
    try {
      if (!this.page) {
        throw new Error('Navegador não inicializado');
      }

      console.log(`📋 Buscando detalhes do medicamento: ${codigo}`);
      
      const response = await this.page.evaluate(async (codigo) => {
        const url = `https://consultas.anvisa.gov.br/api/consulta/medicamento/produtos/codigo/${codigo}`;
        
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Authorization': 'Guest',
            'Accept': 'application/json, text/plain, */*',
            'Accept-Language': 'pt-BR,pt;q=0.9,en;q=0.8',
            'Referer': 'https://consultas.anvisa.gov.br/',
            'Origin': 'https://consultas.anvisa.gov.br',
            'Sec-Fetch-Dest': 'empty',
            'Sec-Fetch-Mode': 'cors',
            'Sec-Fetch-Site': 'same-origin'
          }
        });
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        return await response.json();
      }, codigo);

      console.log('✅ Detalhes do medicamento obtidos com sucesso');
      return response;
    } catch (error) {
      console.error('❌ Erro ao buscar detalhes:', error.message);
      throw error;
    }
  }

  async downloadBulaPDF(codigo, tipo = 'paciente') {
    try {
      if (!this.page) {
        throw new Error('Navegador não inicializado');
      }

      console.log(`📄 Baixando bula PDF ${tipo}: ${codigo}`);
      
      const pdfBuffer = await this.page.evaluate(async (codigo, tipo) => {
        const url = `https://consultas.anvisa.gov.br/api/consulta/medicamentos/arquivo/bula/parecer/${codigo}/?Authorization=`;
        
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Authorization': 'Guest',
            'Accept': 'application/pdf,*/*',
            'Accept-Language': 'pt-BR,pt;q=0.9,en;q=0.8',
            'Referer': 'https://consultas.anvisa.gov.br/',
            'Origin': 'https://consultas.anvisa.gov.br',
            'Sec-Fetch-Dest': 'document',
            'Sec-Fetch-Mode': 'navigate',
            'Sec-Fetch-Site': 'same-origin'
          }
        });
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const arrayBuffer = await response.arrayBuffer();
        return Array.from(new Uint8Array(arrayBuffer));
      }, codigo, tipo);

      console.log(`✅ PDF ${tipo} baixado com sucesso`);
      return Buffer.from(pdfBuffer);
    } catch (error) {
      console.error(`❌ Erro ao baixar PDF ${tipo}:`, error.message);
      throw error;
    }
  }

  async close() {
    try {
      if (this.browser) {
        await this.browser.close();
        console.log('🔒 Navegador fechado');
      }
    } catch (error) {
      console.error('❌ Erro ao fechar navegador:', error.message);
    }
  }
}

module.exports = AnvisaScraper;