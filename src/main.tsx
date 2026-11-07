import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import './authFetch'

// =========================================================
// 🟢 HACK DE SEGURANÇA: FURA O BLOQUEIO DA TELA AZUL DO NGROK
// =========================================================
const originalFetch = window.fetch;
window.fetch = async (...args) => {
  let [resource, config] = args;
  if (!config) config = {};
  
  // Se os headers não existirem, cria um objeto vazio
  if (!config.headers) {
    config.headers = {};
  }

  // Adiciona a chave mestra que o Ngrok exige para liberar a API
  if (config.headers instanceof Headers) {
    config.headers.append('ngrok-skip-browser-warning', 'true');
  } else {
    config.headers['ngrok-skip-browser-warning'] = 'true';
  }
  
  return originalFetch(resource, config);
};
// =========================================================

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)