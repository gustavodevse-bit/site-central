import React, { useState, useEffect } from 'react';
import Layout from "../components/Layout";
import { 
  Shield, ShieldAlert, UserPlus, Trash2, CheckCircle, 
  XCircle, AlertTriangle, Users, Key, Save, X, ShieldCheck, 
  Mail, Briefcase, Activity, Search, ChevronDown, Lock
} from 'lucide-react';
import { useAuth } from "../contexts/AuthContext"; // 🟢 IMPORTAÇÃO DO CONTEXTO AQUI!

const API_URL = `${import.meta.env.VITE_API_URL}/api/supervisao`;

export default function Supervisao() {
  // 🟢 PUXANDO A MATRIZ DE PERMISSÕES DO "CÉREBRO" DO SISTEMA
  const { permissoesGlobais, setPermissoesGlobais } = useAuth();

  // ESTADOS DOS DADOS
  const [equipe, setEquipe] = useState<any[]>([]);
  const [usuariosPendentes, setUsuariosPendentes] = useState<any[]>([]);
  const [solicitacoesExclusao, setSolicitacoesExclusao] = useState<any[]>([]);
  const [carregando, setCarregando] = useState(false);

  // CONTROLES DE TELA
  const [abaAtiva, setAbaAtiva] = useState<'equipe' | 'auditoria' | 'permissoes'>('equipe');
  const [buscaEquipe, setBuscaEquipe] = useState('');
  const [isDark, setIsDark] = useState(document.documentElement.classList.contains('dark'));
  const [menuCargoAberto, setMenuCargoAberto] = useState<number | null>(null);

  const cargosHead = ['ADMIN', 'ADMINISTRADOR', 'SUPERVISOR', 'LIDER_OPERACIONAL', 'OPERACIONAL'];

  // ESTADOS DE MODAIS
  const [modalNovoUsuario, setModalNovoUsuario] = useState(false);
  const [novoUsuarioNome, setNovoUsuarioNome] = useState('');
  const [novoUsuarioEmail, setNovoUsuarioEmail] = useState('');
  const [novoUsuarioCargo, setNovoUsuarioCargo] = useState('OPERACIONAL');
  
  const [usuarioEditando, setUsuarioEditando] = useState<any>(null);
  const [novoEmail, setNovoEmail] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  
  const [itemParaExcluir, setItemParaExcluir] = useState<{ id: number, nome: string } | null>(null);

  // Notificações
  const [toasts, setToasts] = useState<{id: number, msg: string, tipo: string}[]>([]);
  const showToast = (msg: string, tipo: string) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, msg, tipo }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3500);
  };

  useEffect(() => {
    carregarDados();
    const handleThemeChange = () => setIsDark(document.documentElement.classList.contains('dark'));
    window.addEventListener('themeChange', handleThemeChange);
    return () => window.removeEventListener('themeChange', handleThemeChange);
  }, []);

  // 🟢 CARREGAMENTO COM ANTI-CACHE
  const carregarDados = async () => {
    setCarregando(true);
    try {
      const time = Date.now();
      const [resEquipe, resPendentes, resExclusoes] = await Promise.all([
        fetch(`${API_URL}/equipe?t=${time}`, { cache: 'no-store' }),
        fetch(`${API_URL}/pendentes?t=${time}`, { cache: 'no-store' }),
        fetch(`${API_URL}/exclusoes?t=${time}`, { cache: 'no-store' })
      ]);

      if (resEquipe.ok) setEquipe(await resEquipe.json());
      if (resPendentes.ok) setUsuariosPendentes(await resPendentes.json());
      if (resExclusoes.ok) setSolicitacoesExclusao(await resExclusoes.json());
    } catch (erro) {
      console.error("Erro ao carregar:", erro);
      showToast("Falha de conexão com Servidor Java.", "erro");
    } finally {
      setCarregando(false);
    }
  };

  // 🟢 AÇÕES DE AUDITORIA (Com Optimistic UI)
  const aprovarAcesso = async (id: number) => { 
    setUsuariosPendentes(prev => prev.filter(u => u.id !== id));
    try {
      await fetch(`${API_URL}/acessos/${id}/aprovar`, { method: "POST" });
      showToast('Acesso Aprovado!', 'sucesso');
      await carregarDados();
    } catch (e) { showToast('Erro ao aprovar.', 'erro'); await carregarDados(); }
  };

  const rejeitarAcesso = async (id: number) => { 
    setUsuariosPendentes(prev => prev.filter(u => u.id !== id));
    try {
      await fetch(`${API_URL}/acessos/${id}/rejeitar`, { method: "POST" });
      showToast('Acesso Recusado!', 'aviso');
      await carregarDados();
    } catch (e) { showToast('Erro ao rejeitar.', 'erro'); await carregarDados(); }
  };

  const aprovarExclusaoTransferencia = async (dados: any, idSolicitacao: number) => { 
    setSolicitacoesExclusao(prev => prev.filter(s => s.id !== idSolicitacao));
    try {
      await fetch(`${API_URL}/exclusoes/aprovar`, { 
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...dados, usuario: 'Admin' })
      });
      showToast('Exclusão aprovada com sucesso!', 'sucesso');
      await carregarDados();
    } catch (e) { showToast('Erro ao aprovar.', 'erro'); await carregarDados(); }
  };

  const rejeitarExclusaoTransferencia = async (dados: any, idSolicitacao: number) => { 
    setSolicitacoesExclusao(prev => prev.filter(s => s.id !== idSolicitacao));
    try {
      await fetch(`${API_URL}/exclusoes/rejeitar`, { 
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...dados, usuario: 'Admin' })
      });
      showToast('Exclusão cancelada e mantida na base.', 'aviso');
      await carregarDados();
    } catch (e) { showToast('Erro ao rejeitar.', 'erro'); await carregarDados(); }
  };
  
  // 🟢 AÇÕES DA EQUIPE
  const adicionarUsuario = async (e: React.FormEvent) => { 
    e.preventDefault(); 
    if(!novoUsuarioNome || !novoUsuarioEmail) return showToast('Preencha os dados!', 'erro'); 
    
    setModalNovoUsuario(false);
    try {
      await fetch(`${API_URL}/equipe`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome: novoUsuarioNome, email: novoUsuarioEmail, cargo: novoUsuarioCargo })
      });
      setNovoUsuarioNome(''); setNovoUsuarioEmail(''); 
      showToast('Conta criada com sucesso!', 'sucesso');
      await carregarDados();
    } catch (e) { showToast('Erro ao criar conta.', 'erro'); }
  };
  
  const confirmarExclusaoUsuario = async () => {
    if (!itemParaExcluir) return;
    const { id } = itemParaExcluir;
    setItemParaExcluir(null);
    setEquipe(prev => prev.filter(u => u.id !== id));
    
    try {
      await fetch(`${API_URL}/equipe/${id}`, { method: "DELETE" });
      showToast('Conta removida do sistema.', 'aviso');
      await carregarDados();
    } catch (e) { showToast('Erro ao excluir conta.', 'erro'); await carregarDados(); }
  };

  const mudarCargo = async (id: number, novoCargo: string) => { 
    setEquipe(prev => prev.map(u => u.id === id ? { ...u, cargo: novoCargo } : u));
    try {
      await fetch(`${API_URL}/equipe/${id}/cargo`, {
        method: "PUT", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cargo: novoCargo })
      });
      showToast(`Permissões atualizadas!`, 'sucesso');
    } catch (e) { showToast('Erro ao atualizar cargo.', 'erro'); await carregarDados(); }
  };

  const salvarLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!usuarioEditando || !novoEmail) return;
    
    setEquipe(prev => prev.map(u => u.id === usuarioEditando.id ? { ...u, email: novoEmail } : u));
    setUsuarioEditando(null);
    
    try {
      await fetch(`${API_URL}/equipe/${usuarioEditando.id}/credenciais`, {
        method: "PUT", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: novoEmail, senha: novaSenha || undefined })
      });
      showToast('Credenciais de acesso atualizadas!', 'sucesso');
      await carregarDados();
    } catch (e) { showToast('Erro ao atualizar credenciais.', 'erro'); await carregarDados(); }
  };

  // 🟢 AÇÕES DE PERMISSÕES (Agora usando o Contexto)
  const togglePermissao = (modulo: string, cargo: string) => {
    setPermissoesGlobais((prev: any) => ({
      ...prev,
      [modulo]: {
        ...prev[modulo],
        [cargo]: !prev[modulo][cargo]
      }
    }));
  };

  const salvarPermissoesNoServidor = () => {
    // Como o useEffect no AuthContext já salva no localStorage, 
    // aqui é só mostrar a mensagem (futuramente ligamos ao Java aqui)
    showToast('Matriz de permissões atualizada!', 'sucesso');
  };

  const equipeFiltrada = equipe.filter(u => u.nome?.toLowerCase().includes(buscaEquipe.toLowerCase()) || u.email?.toLowerCase().includes(buscaEquipe.toLowerCase()));

  return (
    <Layout titulo="Auditoria & Supervisão">
      
      <style>
        {`
          .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
          .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
          .custom-scrollbar::-webkit-scrollbar-thumb { background: #3b82f640; border-radius: 6px; }
          .custom-scrollbar:hover::-webkit-scrollbar-thumb { background: #3b82f680; }
        `}
      </style>

      <div className="flex flex-col gap-[14px] w-full h-full min-h-0 overflow-hidden">
        
        {/* TOASTS FLUTUANTES */}
        <div className="fixed bottom-6 right-6 z-[9999] flex flex-col items-end gap-2 pointer-events-none">
          {toasts.map(t => (
            <div key={t.id} className={`flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg text-[11px] font-bold tracking-widest uppercase transition-all animate-in slide-in-from-bottom-5 ${t.tipo === 'sucesso' ? 'bg-[#10b981] text-white' : t.tipo === 'erro' ? 'bg-[#ef4444] text-white' : 'bg-[#f97316] text-white'}`}>
              {t.tipo === 'sucesso' ? <CheckCircle size={14} /> : <AlertTriangle size={14} />} {t.msg}
            </div>
          ))}
        </div>

        {/* 1. BANNER SUPERIOR */}
        <div className="bg-white dark:bg-[#0f1d33] border border-slate-200 dark:border-[#1a2540] rounded-[12px] p-5 flex items-center justify-between gap-5 shrink-0 relative overflow-hidden shadow-sm transition-colors">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#3b82f6] opacity-5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
          
          <div className="flex items-center gap-4 z-10">
            <div className="w-[56px] h-[56px] bg-slate-50 dark:bg-[#1a2540] border border-slate-200 dark:border-[#253555] rounded-[10px] flex items-center justify-center shrink-0 transition-colors">
              <ShieldCheck size={24} className="text-[#3b82f6]" />
            </div>
            <div>
              <h2 className="text-[18px] font-black text-slate-800 dark:text-[#f1f5f9] uppercase tracking-tight leading-tight">Painel de Supervisão</h2>
              <p className="text-[11px] font-medium text-slate-500 dark:text-[#94a3b8] mt-0.5 hidden md:block">Gerencie credenciais e audite ações operacionais do sistema.</p>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2 z-10">
            <button onClick={() => setModalNovoUsuario(true)} className="bg-[#3b82f6] hover:bg-blue-600 text-white px-4 py-2.5 rounded-[8px] font-bold text-[10px] uppercase tracking-widest flex items-center gap-1.5 shadow-sm transition-colors">
              <UserPlus size={14} /> Adicionar Usuário
            </button>
          </div>
        </div>

        {/* 2. PAINEL DE KPIs */}
        <div className="flex gap-[14px] shrink-0">
           <div className="bg-white dark:bg-[#0f1d33] border border-slate-200 dark:border-[#1a2540] rounded-[12px] p-4 flex-1 min-w-0 flex items-center gap-[14px] shadow-sm transition-colors">
              <div className="w-10 h-10 rounded-[8px] bg-[#3b82f6]/10 flex items-center justify-center text-[#3b82f6] shrink-0 border border-[#3b82f6]/20"><Users size={18}/></div>
              <div>
                <p className="text-[9px] font-black uppercase tracking-widest text-slate-500 dark:text-[#6b7280]">Equipe Cadastrada</p>
                <h3 className="text-[18px] font-black text-slate-800 dark:text-[#f1f5f9] leading-tight mt-0.5">{equipe.length} Operadores</h3>
              </div>
           </div>
           
           <div className="bg-white dark:bg-[#0f1d33] border border-slate-200 dark:border-[#1a2540] rounded-[12px] p-4 flex-1 min-w-0 flex items-center gap-[14px] shadow-sm transition-colors">
              <div className="w-10 h-10 rounded-[8px] bg-[#f59e0b]/10 flex items-center justify-center text-[#f59e0b] shrink-0 border border-[#f59e0b]/20"><Shield size={18}/></div>
              <div>
                <p className="text-[9px] font-black uppercase tracking-widest text-slate-500 dark:text-[#6b7280]">Acessos Pendentes</p>
                <h3 className="text-[18px] font-black text-slate-800 dark:text-[#f1f5f9] leading-tight mt-0.5">{usuariosPendentes.length} Aguardando</h3>
              </div>
           </div>

           <div className="bg-white dark:bg-[#0f1d33] border border-slate-200 dark:border-[#1a2540] rounded-[12px] p-4 flex-1 min-w-0 flex items-center gap-[14px] shadow-sm transition-colors">
              <div className="w-10 h-10 rounded-[8px] bg-[#ef4444]/10 flex items-center justify-center text-[#ef4444] shrink-0 border border-[#ef4444]/20"><AlertTriangle size={18}/></div>
              <div>
                <p className="text-[9px] font-black uppercase tracking-widest text-slate-500 dark:text-[#6b7280]">Alertas Operacionais</p>
                <h3 className="text-[18px] font-black text-slate-800 dark:text-[#f1f5f9] leading-tight mt-0.5">{solicitacoesExclusao.length} Exclusões</h3>
              </div>
           </div>
        </div>

        {/* 3. CONTROLES / TABS / BUSCA */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 shrink-0 mt-2">
          
          <div className="flex p-1 bg-white dark:bg-[#0f1d33] border border-slate-200 dark:border-[#1a2540] rounded-[10px] w-full md:w-auto shadow-sm transition-colors">
            <button onClick={() => setAbaAtiva("equipe")} className={`flex-1 md:flex-none px-6 py-2 rounded-[6px] text-[11px] font-bold transition-all uppercase tracking-widest flex items-center gap-2 ${abaAtiva === "equipe" ? "bg-[#3b82f6] text-white shadow-sm" : "text-slate-500 hover:text-slate-800 dark:text-[#6b7280] dark:hover:text-[#94a3b8]"}`}>
              <Users size={12}/> Gestão de Contas
            </button>
            <button onClick={() => setAbaAtiva("auditoria")} className={`flex-1 md:flex-none px-6 py-2 rounded-[6px] text-[11px] font-bold transition-all uppercase tracking-widest flex items-center justify-center gap-2 ${abaAtiva === "auditoria" ? "bg-[#f97316] text-white shadow-sm" : "text-slate-500 hover:text-slate-800 dark:text-[#6b7280] dark:hover:text-[#94a3b8]"}`}>
              <Activity size={12}/> Auditoria
              {(usuariosPendentes.length > 0 || solicitacoesExclusao.length > 0) && (
                <span className="bg-[#ef4444] text-white text-[8px] px-1.5 py-0.5 rounded-sm animate-pulse ml-1">{usuariosPendentes.length + solicitacoesExclusao.length}</span>
              )}
            </button>
            <button onClick={() => setAbaAtiva("permissoes")} className={`flex-1 md:flex-none px-6 py-2 rounded-[6px] text-[11px] font-bold transition-all uppercase tracking-widest flex items-center justify-center gap-2 ${abaAtiva === "permissoes" ? "bg-purple-600 text-white shadow-sm" : "text-slate-500 hover:text-slate-800 dark:text-[#6b7280] dark:hover:text-[#94a3b8]"}`}>
              <Lock size={12}/> Acessos Globais
            </button>
          </div>

          {abaAtiva === 'equipe' && (
            <div className="relative w-full md:w-[250px]">
               <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-[#6b7280]" />
               <input type="text" value={buscaEquipe} onChange={e=>setBuscaEquipe(e.target.value)} placeholder="Pesquisar equipe..." className="w-full bg-white dark:bg-[#0f1d33] border border-slate-200 dark:border-[#1a2540] text-slate-800 dark:text-[#e2e8f0] px-3 py-2 pl-9 rounded-[8px] outline-none focus:border-[#3b82f6] transition-colors text-[11px] font-bold placeholder:text-slate-400 dark:placeholder:text-[#4b5563] shadow-sm"/>
            </div>
          )}
        </div>

        {/* CONTEÚDO PRINCIPAL */}
        <div className="flex-1 flex flex-col min-h-0">
          
          {abaAtiva === 'equipe' ? (
            <div className="flex-1 bg-white dark:bg-[#0f1d33] border border-slate-200 dark:border-[#1a2540] rounded-[12px] p-4 shadow-sm transition-colors overflow-y-auto custom-scrollbar">
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                 {equipeFiltrada.map(user => (
                    <div key={user.id} className="bg-slate-50 dark:bg-[#1a2540]/40 border border-slate-200 dark:border-[#253555]/50 rounded-[12px] p-4 flex flex-col transition-all hover:border-[#3b82f6]/50 group relative">
                       
                       <div className="absolute top-3 right-3 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                         <button onClick={() => { setUsuarioEditando(user); setNovoEmail(user.email); setNovaSenha(''); }} className="w-6 h-6 rounded-[6px] bg-[#3b82f6]/10 text-[#3b82f6] flex items-center justify-center hover:bg-[#3b82f6] hover:text-white transition-colors"><Key size={12}/></button>
                         <button onClick={() => setItemParaExcluir({ id: user.id, nome: user.nome })} className="w-6 h-6 rounded-[6px] bg-[#ef4444]/10 text-[#ef4444] flex items-center justify-center hover:bg-[#ef4444] hover:text-white transition-colors"><Trash2 size={12}/></button>
                       </div>

                       <div className="w-10 h-10 rounded-[8px] bg-slate-200 dark:bg-[#0f1d33] flex items-center justify-center font-black text-slate-500 dark:text-[#94a3b8] mb-3 border border-slate-300 dark:border-[#1a2540]">
                         {user.nome?.charAt(0).toUpperCase()}
                       </div>
                       
                       <h4 className="font-black text-slate-800 dark:text-[#f1f5f9] text-[13px] truncate pr-12">{user.nome}</h4>
                       <p className="text-[10px] font-bold text-slate-500 dark:text-[#6b7280] truncate mb-3">{user.email}</p>

                       {/* CUSTOM DROPDOWN */}
                       <div className="mt-auto relative w-full">
                          <button
                            onClick={() => setMenuCargoAberto(menuCargoAberto === user.id ? null : user.id)}
                            className={`w-full px-2 py-1.5 rounded-[6px] text-[9px] font-black uppercase tracking-widest outline-none border transition-all shadow-sm flex justify-between items-center
                              ${user.cargo === 'ADMIN' ? 'bg-purple-100 text-purple-700 border-purple-300 dark:bg-purple-500/10 dark:text-purple-400 dark:border-purple-500/30' 
                              : user.cargo === 'SUPERVISOR' ? 'bg-blue-100 text-blue-700 border-blue-300 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/30' 
                              : user.cargo === 'ADMINISTRADOR' ? 'bg-[#10b981]/10 text-[#10b981] border-[#10b981]/30' 
                              : user.cargo === 'LIDER_OPERACIONAL' ? 'bg-[#f97316]/10 text-[#f97316] border-[#f97316]/30'
                              : 'bg-white text-slate-600 border-slate-300 dark:bg-[#0f1d33] dark:text-[#94a3b8] dark:border-[#253555]'}`}
                          >
                            <span className="truncate pr-2">
                              {user.cargo === 'ADMINISTRADOR' ? 'Administração'
                                : user.cargo === 'SUPERVISOR' ? 'Supervisor'
                                : user.cargo === 'LIDER_OPERACIONAL' ? 'Líder Oper'
                                : user.cargo === 'ADMIN' ? 'Admin'
                                : 'Operador'}
                            </span>
                            <ChevronDown size={12} className={`shrink-0 transition-transform duration-200 ${menuCargoAberto === user.id ? 'rotate-180' : ''}`} />
                          </button>

                          {menuCargoAberto === user.id && (
                            <>
                              <div className="fixed inset-0 z-[90]" onClick={() => setMenuCargoAberto(null)}></div>
                              <div className="absolute left-0 top-full mt-1 w-full bg-white dark:bg-[#0f1d33] border border-slate-200 dark:border-[#253555] rounded-[8px] shadow-xl z-[100] overflow-hidden flex flex-col py-1 animate-in fade-in slide-in-from-top-2 duration-150">
                                {[
                                  { val: 'OPERACIONAL', label: 'Operador' },
                                  { val: 'LIDER_OPERACIONAL', label: 'Líder Operacional' },
                                  { val: 'SUPERVISOR', label: 'Supervisor' },
                                  { val: 'ADMINISTRADOR', label: 'Administração' },
                                  { val: 'ADMIN', label: 'Admin' }
                                ].map(op => (
                                  <button
                                    key={op.val}
                                    onClick={() => { mudarCargo(user.id, op.val); setMenuCargoAberto(null); }}
                                    className={`px-3 py-2 text-[9px] font-black uppercase tracking-widest text-left transition-colors
                                      ${user.cargo === op.val 
                                        ? 'bg-[#3b82f6]/10 text-[#3b82f6]' 
                                        : 'text-slate-600 dark:text-[#94a3b8] hover:bg-slate-50 dark:hover:bg-[#1a2540] hover:text-slate-800 dark:hover:text-white'
                                      }`}
                                  >
                                    {op.label}
                                  </button>
                                ))}
                              </div>
                            </>
                          )}
                       </div>
                    </div>
                 ))}
               </div>
            </div>
          ) : abaAtiva === 'auditoria' ? (
            <div className="flex gap-[14px] flex-1 min-h-0 flex-col lg:flex-row">
              
              {/* AUDITORIA: ACESSOS */}
              <div className="flex-1 bg-white dark:bg-[#0f1d33] border border-slate-200 dark:border-[#1a2540] rounded-[12px] flex flex-col min-w-0 shadow-sm transition-colors overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-200 dark:border-[#1a2540] bg-slate-50 dark:bg-[#070d1a]/50 flex justify-between items-center shrink-0">
                  <span className="text-[13px] font-bold text-slate-800 dark:text-[#e2e8f0] flex items-center gap-2"><ShieldAlert size={16} className="text-[#f59e0b]"/> Aprovar Acessos</span>
                  <span className="text-[9px] bg-slate-200 dark:bg-[#1a2540] text-slate-600 dark:text-[#94a3b8] px-2 py-0.5 rounded font-black">{usuariosPendentes.length} Pendentes</span>
                </div>
                <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-2">
                  {usuariosPendentes.length === 0 && <p className="text-[11px] text-slate-400 dark:text-[#6b7280] text-center py-6 font-bold">Nenhum acesso pendente.</p>}
                  {usuariosPendentes.map(user => (
                    <div key={user.id} className="bg-slate-50 dark:bg-[#1a2540]/30 border border-slate-200 dark:border-[#253555]/50 rounded-[10px] p-3 flex items-center justify-between transition-colors hover:border-[#f59e0b]/50">
                       <div className="min-w-0 pr-2">
                          <p className="text-[12px] font-bold text-slate-800 dark:text-[#f1f5f9] truncate flex items-center gap-1.5"><UserPlus size={12} className="text-[#f59e0b]"/> {user.nome}</p>
                          <p className="text-[10px] text-slate-500 dark:text-[#6b7280] truncate">{user.email}</p>
                       </div>
                       <div className="flex gap-1.5 shrink-0">
                          <button onClick={() => aprovarAcesso(user.id)} className="w-7 h-7 bg-[#10b981]/10 text-[#10b981] hover:bg-[#10b981] hover:text-white rounded-[6px] flex items-center justify-center transition-colors"><CheckCircle size={14}/></button>
                          <button onClick={() => rejeitarAcesso(user.id)} className="w-7 h-7 bg-[#ef4444]/10 text-[#ef4444] hover:bg-[#ef4444] hover:text-white rounded-[6px] flex items-center justify-center transition-colors"><XCircle size={14}/></button>
                       </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* AUDITORIA: EXCLUSÕES */}
              <div className="flex-1 bg-white dark:bg-[#0f1d33] border border-slate-200 dark:border-[#1a2540] rounded-[12px] flex flex-col min-w-0 shadow-sm transition-colors overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-200 dark:border-[#1a2540] bg-slate-50 dark:bg-[#070d1a]/50 flex justify-between items-center shrink-0">
                  <span className="text-[13px] font-bold text-slate-800 dark:text-[#e2e8f0] flex items-center gap-2"><AlertTriangle size={16} className="text-[#ef4444]"/> Exclusões Operacionais</span>
                  <span className="text-[9px] bg-slate-200 dark:bg-[#1a2540] text-slate-600 dark:text-[#94a3b8] px-2 py-0.5 rounded font-black">{solicitacoesExclusao.length} Pendentes</span>
                </div>
                <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-2">
                  {solicitacoesExclusao.length === 0 && <p className="text-[11px] text-slate-400 dark:text-[#6b7280] text-center py-6 font-bold">Sem pedidos de exclusão.</p>}
                  {solicitacoesExclusao.map(sol => (
                    <div key={sol.id} className="bg-red-50 dark:bg-[#ef4444]/5 border border-red-200 dark:border-[#ef4444]/20 rounded-[10px] p-3 flex flex-col gap-3 transition-colors hover:border-[#ef4444]/40">
                       <div className="flex justify-between items-start">
                          <div>
                            <p className="text-[10px] text-red-600 dark:text-[#ef4444]/80 font-black uppercase tracking-widest mb-0.5">Apagar CAF</p>
                            <p className="text-[12px] font-black text-red-700 dark:text-[#ef4444] bg-red-100 dark:bg-[#ef4444]/10 px-1.5 py-0.5 rounded w-fit">{sol.caf}</p>
                          </div>
                          <span className="text-[9px] text-slate-500 dark:text-[#6b7280] font-bold text-right">Por: {sol.solicitante}</span>
                       </div>
                       <div className="flex gap-2">
                          <button onClick={() => aprovarExclusaoTransferencia({ transferencia_id: sol.transferencia_id, solicitacao_id: sol.id }, sol.id)} className="flex-1 py-1.5 bg-[#ef4444] hover:bg-red-600 text-white rounded-[6px] text-[10px] font-black uppercase tracking-widest shadow-sm transition-colors">Autorizar</button>
                          <button onClick={() => rejeitarExclusaoTransferencia({ solicitacao_id: sol.id }, sol.id)} className="flex-1 py-1.5 bg-slate-200 dark:bg-[#1a2540] hover:bg-slate-300 dark:hover:bg-[#253555] text-slate-700 dark:text-[#e2e8f0] rounded-[6px] text-[10px] font-black uppercase tracking-widest transition-colors">Recusar</button>
                       </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          ) : (
            // ============================================================
            // TELA NOVA: MATRIZ DE PERMISSÕES
            // ============================================================
            <div className="flex-1 bg-white dark:bg-[#0f1d33] border border-slate-200 dark:border-[#1a2540] rounded-[12px] shadow-sm transition-colors flex flex-col overflow-hidden">
               <div className="p-5 border-b border-slate-200 dark:border-[#1a2540] flex justify-between items-center bg-slate-50 dark:bg-[#070d1a]/50 shrink-0">
                  <div>
                    <h3 className="text-[14px] font-black text-slate-800 dark:text-[#f1f5f9] flex items-center gap-2"><Lock size={16} className="text-purple-500"/> Matriz de Acessos</h3>
                    <p className="text-[11px] text-slate-500 dark:text-[#94a3b8]">Defina quais módulos cada cargo da Nordex pode visualizar e operar.</p>
                  </div>
                  <button onClick={salvarPermissoesNoServidor} className="bg-purple-600 hover:bg-purple-700 text-white px-5 py-2 rounded-[8px] font-bold text-[11px] uppercase tracking-widest flex items-center gap-2 transition-colors shadow-sm">
                    <Save size={14}/> Salvar Matriz
                  </button>
               </div>
               
               <div className="flex-1 overflow-auto custom-scrollbar p-5">
                  <table className="w-full text-left border-collapse min-w-[700px]">
                     <thead>
                       <tr>
                         <th className="pb-4 pt-2 px-4 border-b border-slate-200 dark:border-[#253555] font-black text-[10px] uppercase tracking-widest text-slate-400 dark:text-[#6b7280]">Módulos do Sistema</th>
                         {cargosHead.map(cargo => (
                            <th key={cargo} className="pb-4 pt-2 px-4 border-b border-slate-200 dark:border-[#253555] font-black text-[10px] uppercase tracking-widest text-slate-600 dark:text-[#94a3b8] text-center w-[120px]">
                               {cargo.replace('_', ' ')}
                            </th>
                         ))}
                       </tr>
                     </thead>
                     <tbody>
                       {permissoesGlobais && Object.keys(permissoesGlobais).map(modulo => (
                          <tr key={modulo} className="hover:bg-slate-50 dark:hover:bg-[#1a2540]/30 transition-colors">
                             <td className="py-3 px-4 border-b border-slate-100 dark:border-[#1a2540]/50 text-[12px] font-bold text-slate-700 dark:text-[#e2e8f0]">{modulo}</td>
                             
                             {cargosHead.map(cargo => (
                               <td key={cargo} className="py-3 px-4 border-b border-slate-100 dark:border-[#1a2540]/50 text-center">
                                  <button 
                                     onClick={() => togglePermissao(modulo, cargo)}
                                     disabled={cargo === 'ADMIN'} // ADMIN SEMPRE TEM ACESSO
                                     className={`w-5 h-5 rounded-[4px] border flex items-center justify-center transition-all mx-auto
                                       ${permissoesGlobais[modulo][cargo] 
                                         ? 'bg-[#10b981] border-[#10b981] text-white shadow-sm' 
                                         : 'bg-slate-100 dark:bg-[#0f1d33] border-slate-300 dark:border-[#253555] text-transparent hover:border-[#3b82f6]'
                                       }
                                       ${cargo === 'ADMIN' ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:scale-110'}
                                     `}
                                  >
                                     <CheckCircle size={12} strokeWidth={4} />
                                  </button>
                               </td>
                             ))}
                          </tr>
                       ))}
                     </tbody>
                  </table>
               </div>
            </div>
          )}

        </div>
      </div>

      {/* MODAL: ADICIONAR USUÁRIO */}
      {modalNovoUsuario && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#0f1d33] border border-slate-200 dark:border-[#1a2540] rounded-[16px] w-full max-w-sm shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-5 py-4 border-b border-slate-200 dark:border-[#1a2540] bg-slate-50 dark:bg-[#070d1a]/50 flex justify-between items-center">
              <h3 className="text-[13px] font-bold text-slate-800 dark:text-[#e2e8f0] uppercase tracking-widest flex items-center gap-1.5"><UserPlus size={14} className="text-[#3b82f6]"/> Criar Acesso</h3>
              <button onClick={() => setModalNovoUsuario(false)} className="text-slate-400 hover:text-red-500"><X size={16}/></button>
            </div>
            
            <form onSubmit={adicionarUsuario} className="p-5 space-y-4">
              <div>
                <label className="text-[9px] font-black uppercase tracking-widest text-slate-500 dark:text-[#6b7280] block mb-1">Nome Completo</label>
                <div className="relative">
                   <Briefcase size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                   <input required type="text" value={novoUsuarioNome} onChange={e=>setNovoUsuarioNome(e.target.value)} placeholder="Ex: Ana Silva" className="w-full bg-slate-50 dark:bg-[#1a2540] border border-slate-200 dark:border-[#253555] rounded-[8px] px-3 py-2 pl-8 text-[11px] font-bold text-slate-800 dark:text-[#e2e8f0] outline-none focus:border-[#3b82f6] placeholder:font-normal" />
                </div>
              </div>
              <div>
                <label className="text-[9px] font-black uppercase tracking-widest text-slate-500 dark:text-[#6b7280] block mb-1">E-mail Corporativo</label>
                <div className="relative">
                   <Mail size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                   <input required type="email" value={novoUsuarioEmail} onChange={e=>setNovoUsuarioEmail(e.target.value)} placeholder="nome@nordex.com" className="w-full bg-slate-50 dark:bg-[#1a2540] border border-slate-200 dark:border-[#253555] rounded-[8px] px-3 py-2 pl-8 text-[11px] font-bold text-slate-800 dark:text-[#e2e8f0] outline-none focus:border-[#3b82f6] placeholder:font-normal" />
                </div>
              </div>
              <div>
                <label className="text-[9px] font-black uppercase tracking-widest text-slate-500 dark:text-[#6b7280] block mb-1">Privilégio</label>
                <select value={novoUsuarioCargo} onChange={e=>setNovoUsuarioCargo(e.target.value)} className="w-full bg-slate-50 dark:bg-[#1a2540] border border-slate-200 dark:border-[#253555] rounded-[8px] px-3 py-2 text-[11px] font-bold text-slate-800 dark:text-[#e2e8f0] outline-none focus:border-[#3b82f6] cursor-pointer">
                  <option value="OPERACIONAL">Operador (Padrão)</option>
                  <option value="LIDER_OPERACIONAL">Líder Operacional</option>
                  <option value="SUPERVISOR">Supervisor (Logística)</option>
                  <option value="ADMINISTRADOR">Administração (Escritório)</option>
                  <option value="ADMIN">Admin (Diretoria)</option>
                </select>
              </div>
              <div className="pt-2">
                 <button type="submit" className="w-full py-2.5 bg-[#3b82f6] hover:bg-blue-600 text-white font-black text-[11px] uppercase tracking-widest rounded-[8px] flex items-center justify-center gap-1.5 transition-colors shadow-sm">Registrar Membro</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EDITAR LOGIN */}
      {usuarioEditando && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#0f1d33] border border-slate-200 dark:border-[#1a2540] rounded-[16px] w-full max-w-sm shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-5 py-4 border-b border-slate-200 dark:border-[#1a2540] bg-slate-50 dark:bg-[#070d1a]/50 flex justify-between items-center">
              <h3 className="text-[13px] font-bold text-slate-800 dark:text-[#e2e8f0] uppercase tracking-widest flex items-center gap-1.5"><Key size={14} className="text-[#3b82f6]"/> Credenciais</h3>
              <button onClick={() => setUsuarioEditando(null)} className="text-slate-400 hover:text-red-500"><X size={16}/></button>
            </div>
            
            <form onSubmit={salvarLogin} className="p-5 space-y-4">
              <div className="mb-4">
                <p className="text-[12px] font-black text-slate-800 dark:text-[#f1f5f9] text-center">{usuarioEditando.nome}</p>
                <p className="text-[9px] text-slate-500 dark:text-[#6b7280] uppercase tracking-widest text-center">{usuarioEditando.cargo}</p>
              </div>
              <div>
                <label className="text-[9px] font-black uppercase tracking-widest text-slate-500 dark:text-[#6b7280] block mb-1">E-mail Corporativo</label>
                <input required type="email" value={novoEmail} onChange={e=>setNovoEmail(e.target.value)} className="w-full bg-slate-50 dark:bg-[#1a2540] border border-slate-200 dark:border-[#253555] rounded-[8px] px-3 py-2 text-[11px] font-bold text-slate-800 dark:text-[#e2e8f0] outline-none focus:border-[#3b82f6]" />
              </div>
              <div>
                <label className="text-[9px] font-black uppercase tracking-widest text-slate-500 dark:text-[#6b7280] block mb-1">Nova Senha (Opcional)</label>
                <input type="password" value={novaSenha} onChange={e=>setNovaSenha(e.target.value)} placeholder="Deixe em branco para manter a atual" className="w-full bg-slate-50 dark:bg-[#1a2540] border border-slate-200 dark:border-[#253555] rounded-[8px] px-3 py-2 text-[11px] font-bold text-slate-800 dark:text-[#e2e8f0] outline-none focus:border-[#3b82f6] placeholder:font-normal" />
              </div>
              <div className="pt-2">
                 <button type="submit" className="w-full py-2.5 bg-[#3b82f6] hover:bg-blue-600 text-white font-black text-[11px] uppercase tracking-widest rounded-[8px] flex items-center justify-center gap-1.5 transition-colors shadow-sm"><Save size={14}/> Salvar Acesso</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 🛑 MODAL DE EXCLUSÃO DE CONTA */}
      {itemParaExcluir && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/70 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#0f1d33] border border-slate-200 dark:border-[#1a2540] rounded-[16px] w-[350px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 text-center">
              <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-500/10 flex items-center justify-center mx-auto mb-4">
                <AlertTriangle size={24} className="text-[#ef4444]" />
              </div>
              <h3 className="text-[14px] font-black text-slate-800 dark:text-white mb-2">Excluir Acesso</h3>
              <p className="text-[12px] text-slate-500 dark:text-[#94a3b8] mb-6">
                Tem certeza que deseja apagar a conta de <strong>{itemParaExcluir.nome}</strong>? O acesso dele ao sistema será revogado imediatamente.
              </p>
              <div className="flex gap-3">
                <button onClick={() => setItemParaExcluir(null)} className="flex-1 py-2.5 bg-slate-100 dark:bg-[#1a2540] hover:bg-slate-200 dark:hover:bg-[#253555] text-slate-700 dark:text-white rounded-[8px] font-bold text-[12px] transition-colors">Cancelar</button>
                <button onClick={confirmarExclusaoUsuario} className="flex-1 py-2.5 bg-[#ef4444] hover:bg-red-600 text-white rounded-[8px] font-bold text-[12px] transition-colors shadow-sm">Sim, Excluir</button>
              </div>
            </div>
          </div>
        </div>
      )}

    </Layout>
  );
}