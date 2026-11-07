import React from 'react';
import { HashRouter, Route, Routes, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Layout from './components/Layout';

import Dashboard from './pages/Dashboard';
import Custos from './pages/Custos'; // 🟢 IMPORT DA NOSSA NOVA PÁGINA
import Frota from './pages/Frota';
import Login from './pages/Login';
import Pagamentos from './pages/Pagamentos';
import Perfil from './pages/Perfil';
import Supervisao from './pages/Supervisao';
import Tarefas from './pages/Tarefas';
import Rastreio from './pages/Rastreio';
import Reversa from "./pages/Reversa";
import Avisos from "./pages/Avisos"; 
import Advertencias from './pages/Advertencias';

const ROTA_INICIAL = (temAcesso: (modulo: string, cargo: string) => boolean, cargo: string) => {
  if (temAcesso('Operação', cargo)) return '/dashboard';
  if (temAcesso('Gestão de Frota', cargo)) return '/frota';
  if (temAcesso('Financeiro', cargo)) return '/pagamentos';
  if (temAcesso('Supervisão', cargo)) return '/supervisao';
  return '/perfil';
};

const RotaPrivada = ({ children, modulo }: { children: React.ReactElement; modulo?: string }) => {
  const { usuario, temAcesso, carregandoPermissoes } = useAuth();
  if (!usuario) return <Navigate replace to="/" />;
  if (modulo && carregandoPermissoes) return <div className="w-full h-screen flex items-center justify-center text-sm text-slate-500">Carregando permissões...</div>;
  const cargo = String(usuario.cargo || 'OPERACIONAL').toUpperCase();
  if (modulo && !temAcesso(modulo, cargo)) {
    return <Navigate replace to={ROTA_INICIAL(temAcesso, cargo)} />;
  }
  return children;
};

function App() {
  return (
    <AuthProvider>
      <HashRouter>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/dashboard" element={<RotaPrivada modulo="Operação"><Dashboard /></RotaPrivada>} />
          <Route path="/rastreio" element={<RotaPrivada modulo="Operação"><Rastreio /></RotaPrivada>} /> 
          <Route path="/frota" element={<RotaPrivada modulo="Gestão de Frota"><Frota /></RotaPrivada>} />
          
          {/* 🟢 ROTA DE CUSTOS ADICIONADA AQUI */}
          <Route path="/custos" element={
            <RotaPrivada modulo="Financeiro">
              <Layout titulo="Gestão de Custos e Relatórios">
                <Custos />
              </Layout>
            </RotaPrivada>
          } />
          
          <Route path="/pagamentos" element={<RotaPrivada modulo="Financeiro"><Pagamentos /></RotaPrivada>} />
          <Route path="/supervisao" element={<RotaPrivada modulo="Supervisão"><Supervisao /></RotaPrivada>} />
          <Route path="/perfil" element={<RotaPrivada><Perfil /></RotaPrivada>} />
          <Route path="/tarefas" element={<RotaPrivada modulo="Operação"><Tarefas /></RotaPrivada>} /> 
          <Route path="/reversa" element={<RotaPrivada modulo="Operação"><Reversa /></RotaPrivada>} />
          
          <Route path="/advertencias" element={
            <RotaPrivada modulo="Supervisão">
              <Layout titulo="Registro de Punições">
                <Advertencias />
              </Layout>
            </RotaPrivada>
          } />
          
          <Route path="/avisos" element={<RotaPrivada modulo="Operação"><Avisos /></RotaPrivada>} /> 
        </Routes>
      </HashRouter>
    </AuthProvider>
  );
}

export default App;
