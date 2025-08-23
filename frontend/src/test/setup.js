// Configuração global para testes Vitest
import { vi } from 'vitest';

// Mock do console para evitar logs desnecessários durante os testes
global.console = {
  ...console,
  // Desabilitar logs durante os testes, mas manter error e warn
  log: vi.fn(),
  debug: vi.fn(),
  info: vi.fn(),
  warn: console.warn,
  error: console.error,
};

// Mock de APIs do navegador que podem não estar disponíveis no jsdom
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock do localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

// Mock do sessionStorage
const sessionStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(window, 'sessionStorage', {
  value: sessionStorageMock
});

// Mock de fetch para testes que fazem requisições HTTP
global.fetch = vi.fn();

// Configuração para limpar mocks entre testes
beforeEach(() => {
  vi.clearAllMocks();
});

// Configuração para restaurar mocks após todos os testes
afterAll(() => {
  vi.restoreAllMocks();
});