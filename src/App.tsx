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

const RotaPrivada = ({ children }: { children: React.ReactElement }) => {
  const { usuario } = useAuth();
  return usuario ? children : <Navigate replace to="/" />;
};

function App() {
  return (
    <AuthProvider>
      <HashRouter>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/dashboard" element={<RotaPrivada><Dashboard /></RotaPrivada>} />
          <Route path="/rastreio" element={<RotaPrivada><Rastreio /></RotaPrivada>} /> 
          <Route path="/frota" element={<RotaPrivada><Frota /></RotaPrivada>} />
          
          {/* 🟢 ROTA DE CUSTOS ADICIONADA AQUI */}
          <Route path="/custos" element={
            <RotaPrivada>
              <Layout titulo="Gestão de Custos e Relatórios">
                <Custos />
              </Layout>
            </RotaPrivada>
          } />
          
          <Route path="/pagamentos" element={<RotaPrivada><Pagamentos /></RotaPrivada>} />
          <Route path="/supervisao" element={<RotaPrivada><Supervisao /></RotaPrivada>} />
          <Route path="/perfil" element={<RotaPrivada><Perfil /></RotaPrivada>} />
          <Route path="/tarefas" element={<RotaPrivada><Tarefas /></RotaPrivada>} /> 
          <Route path="/reversa" element={<RotaPrivada><Reversa /></RotaPrivada>} />
          
          <Route path="/advertencias" element={
            <RotaPrivada>
              <Layout titulo="Registro de Punições">
                <Advertencias />
              </Layout>
            </RotaPrivada>
          } />
          
          <Route path="/avisos" element={<RotaPrivada><Avisos /></RotaPrivada>} /> 
        </Routes>
      </HashRouter>
    </AuthProvider>
  );
}

export default App;