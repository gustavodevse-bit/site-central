import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext<any>(null);
const API_BASE = `${(import.meta.env.VITE_API_URL || 'http://192.168.18.213:8081').replace(/\/+$/, '')}/api`;

// Fallback local até a matriz oficial do servidor carregar
const MATRIZ_PADRAO = {
  'Operação': { 'ADMIN': true, 'ADMINISTRADOR': true, 'SUPERVISOR': true, 'LIDER_OPERACIONAL': true, 'OPERACIONAL': true, 'FINANCEIRO': false, 'ENTREGADOR': true },
  'Gestão de Frota': { 'ADMIN': true, 'ADMINISTRADOR': true, 'SUPERVISOR': true, 'LIDER_OPERACIONAL': true, 'OPERACIONAL': false, 'FINANCEIRO': false, 'ENTREGADOR': false },
  'Financeiro': { 'ADMIN': true, 'ADMINISTRADOR': true, 'SUPERVISOR': false, 'LIDER_OPERACIONAL': false, 'OPERACIONAL': false, 'FINANCEIRO': true, 'ENTREGADOR': false },
  'Supervisão': { 'ADMIN': true, 'ADMINISTRADOR': true, 'SUPERVISOR': true, 'LIDER_OPERACIONAL': false, 'OPERACIONAL': false, 'FINANCEIRO': false, 'ENTREGADOR': false },
  'Área de Sorteio': { 'ADMIN': true, 'ADMINISTRADOR': true, 'SUPERVISOR': true, 'LIDER_OPERACIONAL': true, 'OPERACIONAL': true, 'FINANCEIRO': false, 'ENTREGADOR': false },
};

export const AuthProvider = ({ children }: any) => {
  
  // 1. DADOS DO USUÁRIO
  const [usuario, setUsuario] = useState(() => {
    const userSalvo = localStorage.getItem('@NordexAdminAuth');
    if (userSalvo && userSalvo !== 'undefined' && userSalvo !== 'null') {
      try { return JSON.parse(userSalvo); } catch { return null; }
    }
    return null;
  });

  // Matriz em cache local; o servidor é a fonte oficial das permissões.
  const [permissoesGlobais, setPermissoesGlobais] = useState(() => {
    const permSalvas = localStorage.getItem('@NordexPermissoes');
    return permSalvas ? JSON.parse(permSalvas) : MATRIZ_PADRAO;
  });
  const [carregandoPermissoes, setCarregandoPermissoes] = useState(false);

  // Salva no navegador sempre que as permissões mudarem
  useEffect(() => {
    localStorage.setItem('@NordexPermissoes', JSON.stringify(permissoesGlobais));
  }, [permissoesGlobais]);

  useEffect(() => {
    if (!usuario) {
      setCarregandoPermissoes(false);
      return;
    }
    let ativo = true;
    setCarregandoPermissoes(true);
    fetch(`${API_BASE}/permissoes`, { cache: 'no-store' })
      .then(resposta => resposta.ok ? resposta.json() : null)
      .then(matriz => {
        if (ativo && matriz && typeof matriz === 'object') setPermissoesGlobais(matriz);
      })
      .catch(erro => console.error('Não foi possível carregar as permissões do servidor:', erro))
      .finally(() => { if (ativo) setCarregandoPermissoes(false); });
    return () => { ativo = false; };
  }, [usuario]);

  const login = (dadosUsuario: any) => {
    setUsuario(dadosUsuario);
    localStorage.setItem('@NordexAdminAuth', JSON.stringify(dadosUsuario));
  };

  const logout = () => {
    setUsuario(null);
    localStorage.removeItem('@NordexAdminAuth');
    localStorage.removeItem('nordex_token');
    window.location.hash = '#/';
  };

  // FUNÇÃO MÁGICA: O Layout vai perguntar pra ela se mostra o botão ou não
  const temAcesso = (modulo: string, cargo: string) => {
    if (cargo === 'ADMIN') return true; // Diretor supremo sempre vê tudo
    if (!permissoesGlobais[modulo]) return false;
    return permissoesGlobais[modulo][cargo] === true;
  };

  return (
    <AuthContext.Provider value={{ 
      usuario, login, logout, 
      permissoesGlobais, setPermissoesGlobais, temAcesso, carregandoPermissoes
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
