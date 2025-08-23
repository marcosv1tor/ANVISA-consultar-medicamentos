# MEDWARE - Consulta de Medicamentos ANVISA

Uma Single Page Application (SPA) desenvolvida em Vue.js 3 para consulta de medicamentos utilizando a API pública da ANVISA.

## 📋 Funcionalidades

- **Busca de Medicamentos**: Pesquise medicamentos por nome
- **Listagem Responsiva**: Visualize resultados em cards responsivos
- **Detalhes Completos**: Veja informações detalhadas de cada medicamento
- **Download de Bulas**: Baixe bulas em PDF (paciente e profissional)
- **Histórico de Buscas**: Acesse suas pesquisas recentes
- **Tratamento de Erros**: Sistema robusto de tratamento de erros
- **Estados de Carregamento**: Indicadores visuais durante operações

## 🛠️ Tecnologias Utilizadas

- **Vue.js 3** - Framework JavaScript progressivo
- **Bootstrap 5** - Framework CSS para design responsivo
- **Axios** - Cliente HTTP para requisições à API
- **Node.js** - Ambiente de execução JavaScript

## 📦 Pré-requisitos

Antes de executar o projeto, certifique-se de ter instalado:

- [Node.js](https://nodejs.org/) (versão 16 ou superior)
- [npm](https://www.npmjs.com/) (geralmente vem com o Node.js)

## 🚀 Instalação e Execução

### 1. Clone ou baixe o projeto

```bash
# Se usando Git
git clone <url-do-repositorio>
cd MEDWARE

# Ou extraia os arquivos do projeto na pasta MEDWARE
```

### 2. Instale as dependências

```bash
npm install
```

### 3. Execute o projeto em modo de desenvolvimento

```bash
npm run dev
```

### 4. Acesse a aplicação

Abra seu navegador e acesse: `http://localhost:5173`

## 📁 Estrutura do Projeto

```
MEDWARE/
├── public/
│   └── index.html
├── src/
│   ├── assets/
│   │   └── styles/
│   │       └── custom.css
│   ├── components/
│   │   ├── ErrorMessage.vue
│   │   ├── LoadingSpinner.vue
│   │   ├── MedicineDetails.vue
│   │   ├── MedicineList.vue
│   │   └── MedicineSearch.vue
│   ├── services/
│   │   └── anvisaApi.js
│   ├── App.vue
│   └── main.js
├── package.json
└── README.md
```

## 🔧 Scripts Disponíveis

- `npm run dev` - Executa o projeto em modo de desenvolvimento
- `npm run build` - Gera build de produção
- `npm run preview` - Visualiza o build de produção localmente

## 📖 Como Usar

1. **Buscar Medicamentos**:
   - Digite o nome do medicamento no campo de busca
   - Clique em "Buscar" ou pressione Enter
   - Os resultados aparecerão em cards abaixo

2. **Ver Detalhes**:
   - Clique em "Ver Detalhes" em qualquer medicamento
   - Uma modal será aberta com informações completas

3. **Download de Bulas**:
   - Na modal de detalhes, clique em "Baixar Bula do Paciente" ou "Baixar Bula Profissional"
   - O PDF será baixado automaticamente

4. **Histórico de Buscas**:
   - Suas últimas 5 buscas ficam salvas e podem ser acessadas rapidamente

## 🌐 API ANVISA

Este projeto consome a API pública da ANVISA para:

- **Busca de Medicamentos**: `https://consultas.anvisa.gov.br/api/consulta/medicamentos`
- **Detalhes do Medicamento**: `https://consultas.anvisa.gov.br/api/consulta/medicamentos/produto/`
- **Download de Bulas**: `https://consultas.anvisa.gov.br/api/consulta/medicamentos/arquivo/bula/parecer/`

## 🎨 Design e Responsividade

- Interface moderna e intuitiva
- Totalmente responsiva (mobile, tablet, desktop)
- Componentes reutilizáveis
- Feedback visual para todas as ações
- Tratamento de estados de erro e carregamento

## 🔍 Funcionalidades Técnicas

- **Componentização**: Arquitetura baseada em componentes Vue.js
- **Gerenciamento de Estado**: Estado local com reatividade do Vue
- **Tratamento de Erros**: Sistema robusto com retry automático
- **Performance**: Carregamento otimizado e lazy loading
- **Acessibilidade**: Componentes acessíveis com ARIA labels

## 📝 Observações

- A aplicação depende da disponibilidade da API da ANVISA
- Alguns medicamentos podem não ter bulas disponíveis para download
- O histórico de buscas é salvo localmente no navegador
- A aplicação funciona melhor em navegadores modernos

## 🤝 Contribuição

Para contribuir com o projeto:

1. Faça um fork do repositório
2. Crie uma branch para sua feature (`git checkout -b feature/nova-feature`)
3. Commit suas mudanças (`git commit -am 'Adiciona nova feature'`)
4. Push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo LICENSE para mais detalhes.

---

**Desenvolvido com ❤️ para facilitar a consulta de medicamentos da ANVISA**