const { join } = require('path');

/**
 * @type {import("puppeteer").Configuration}
 */
module.exports = {
  // Define o diretório de cache do Puppeteer para o projeto
  cacheDirectory: join(__dirname, '.cache', 'puppeteer'),
};