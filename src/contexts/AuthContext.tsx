import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext<any>(null);

// Regras padrão caso seja a primeira vez abrindo o sistema
const MATRIZ_PADRAO = {
  'Operação': { 'ADMIN': true, 'ADMINISTRADOR': true, 'SUPERVISOR': true, 'LIDER_OPERACIONAL': true, 'OPERACIONAL': true },
  'Gestão de Frota': { 'ADMIN': true, 'ADMINISTRADOR': true, 'SUPERVISOR': true, 'LIDER_OPERACIONAL': true, 'OPERACIONAL': false },
  'Financeiro': { 'ADMIN': true, 'ADMINISTRADOR': true, 'SUPERVISOR': false, 'LIDER_OPERACIONAL': false, 'OPERACIONAL': false },
  'Supervisão': { 'ADMIN': true, 'ADMINISTRADOR': true, 'SUPERVISOR': true, 'LIDER_OPERACIONAL': false, 'OPERACIONAL': false },
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

  // 2. MATRIZ DE PERMISSÕES (O truque para funcionar sem o Java por enquanto)
  const [permissoesGlobais, setPermissoesGlobais] = useState(() => {
    const permSalvas = localStorage.getItem('@NordexPermissoes');
    return permSalvas ? JSON.parse(permSalvas) : MATRIZ_PADRAO;
  });

  // Salva no navegador sempre que as permissões mudarem
  useEffect(() => {
    localStorage.setItem('@NordexPermissoes', JSON.stringify(permissoesGlobais));
  }, [permissoesGlobais]);

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
      permissoesGlobais, setPermissoesGlobais, temAcesso 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);