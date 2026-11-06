import React, { useEffect, useState } from "react";
import Layout from "../components/Layout";
// 🟢 CORREÇÃO: O ícone XCircle foi adicionado na linha abaixo para a tela não ficar branca!
import { Car, Map, UserPlus, Route, Users, Search, Trash2, Edit3, Plus, Settings2, ShieldCheck, MapPin, AlertCircle, XCircle } from "lucide-react";

export default function Frota() {
  const [entregadores, setEntregadores] = useState<any[]>([]);
  const [rotas, setRotas] = useState<any[]>([]);
  const [cidadesRota, setCidadesRota] = useState<any[]>([]);
  const [carregando, setCarregando] = useState(false);
  const [termoPesquisa, setTermoPesquisa] = useState("");

  const [novoNome, setNovoNome] = useState("");
  const [novaBase, setNovaBase] = useState("");
  const [novaEmpresa, setNovaEmpresa] = useState("Total Express"); 
  
  const [novaRota, setNovaRota] = useState("");
  const [rotaSelecionada, setRotaSelecionada] = useState("");
  const [entregadorSelecionado, setEntregadorSelecionado] = useState("");
  
  const [entregadorEditando, setEntregadorEditando] = useState<any>(null);
  const [rotaEditando, setRotaEditando] = useState<any>(null);
  const [itemParaExcluir, setItemParaExcluir] = useState<{ id: number, tipo: 'entregador' | 'rota' | 'vinculo', nome: string } | null>(null);

  const API_URL = `${import.meta.env.VITE_API_URL}/api/frota`;
  const [isDark, setIsDark] = useState(document.documentElement.classList.contains('dark'));

  useEffect(() => {
    carregarDados();
    const handleThemeChange = () => setIsDark(document.documentElement.classList.contains('dark'));
    window.addEventListener('themeChange', handleThemeChange);
    return () => window.removeEventListener('themeChange', handleThemeChange);
  }, []);

  const carregarDados = async () => {
    setCarregando(true);
    try {
      const time = new Date().getTime(); 
      const [resEntregadores, resRotas, resVinculos] = await Promise.all([
        fetch(`${API_URL}/entregadores?t=${time}`, { cache: 'no-store' }),
        fetch(`${API_URL}/rotas?t=${time}`, { cache: 'no-store' }),
        fetch(`${API_URL}/vinculos?t=${time}`, { cache: 'no-store' })
      ]);
      
      const dadosEntregadores = await resEntregadores.json();
      const dadosRotas = await resRotas.json();
      const dadosVinculos = await resVinculos.json();
      
      setEntregadores(dadosEntregadores);
      setRotas(dadosRotas);
      setCidadesRota(dadosVinculos.map((v: any) => ({ ...v, rota_id: v.rotaId })));
    } catch (erro) {
      console.error("Erro ao carregar dados do banco Java:", erro);
    } finally {
      setCarregando(false);
    }
  };

  const addEntregador = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!novoNome) return;
    
    const idProv = Date.now();
    const novo = { id: idProv, nome: novoNome, cidade: novaBase, empresa: novaEmpresa };
    setEntregadores(prev => [...prev, novo]); 
    setNovoNome(""); setNovaBase(""); setNovaEmpresa("Total Express");

    try {
      await fetch(`${API_URL}/entregadores`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome: novo.nome, cidade: novo.cidade, empresa: novo.empresa })
      });
      await new Promise(r => setTimeout(r, 400)); 
      await carregarDados(); 
    } catch (erro) { console.error(erro); await carregarDados(); }
  };

  const addRota = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!novaRota) return;
    
    const idProv = Date.now();
    const nova = { id: idProv, nome: novaRota };
    setRotas(prev => [...prev, nova]); 
    setNovaRota("");

    try {
      await fetch(`${API_URL}/rotas`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome: nova.nome })
      });
      await new Promise(r => setTimeout(r, 400));
      await carregarDados();
    } catch (erro) { console.error(erro); await carregarDados(); }
  };

  const addCidadeRota = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rotaSelecionada || !entregadorSelecionado) return;
    
    const ent = entregadores.find(e => e.id === Number(entregadorSelecionado));
    if (ent) {
      const idProv = Date.now();
      const novoVinc = { id: idProv, rota_id: Number(rotaSelecionada), cidade: ent.cidade, entregador: ent.nome };
      setCidadesRota(prev => [...prev, novoVinc]);
      setEntregadorSelecionado("");

      try {
        await fetch(`${API_URL}/vinculos`, {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ rotaId: rotaSelecionada, cidade: ent.cidade, entregador: ent.nome })
        });
        await new Promise(r => setTimeout(r, 400));
        await carregarDados();
      } catch (erro) { console.error(erro); await carregarDados(); }
    }
  };

  const confirmarExclusao = async () => {
    if (!itemParaExcluir) return;
    const { id, tipo } = itemParaExcluir; 
    setItemParaExcluir(null); 

    try {
      if (tipo === 'entregador') {
        setEntregadores(prev => prev.filter(e => e.id !== id));
        await fetch(`${API_URL}/entregadores/${id}`, { method: "DELETE" });
      } 
      else if (tipo === 'rota') {
        setRotas(prev => prev.filter(r => r.id !== id));
        setCidadesRota(prev => prev.filter(v => v.rota_id !== id));
        await fetch(`${API_URL}/rotas/${id}`, { method: "DELETE" });
      } 
      else if (tipo === 'vinculo') {
        setCidadesRota(prev => prev.filter(v => v.id !== id));
        await fetch(`${API_URL}/vinculos/${id}`, { method: "DELETE" });
      }
      
      await new Promise(r => setTimeout(r, 400)); 
      await carregarDados(); 
    } catch (e) {
      console.error("Erro na exclusão:", e);
      await carregarDados(); 
    }
  };

  const salvarEdicaoEntregador = async (e: React.FormEvent) => {
    e.preventDefault();
    setEntregadores(prev => prev.map(ent => ent.id === entregadorEditando.id ? entregadorEditando : ent));
    
    // Pega os dados antes de fechar o modal
    const dadosParaSalvar = { ...entregadorEditando };
    setEntregadorEditando(null); 
    
    try {
      await fetch(`${API_URL}/entregadores/${dadosParaSalvar.id}`, { 
        method: "PUT", 
        headers: { "Content-Type": "application/json" }, 
        body: JSON.stringify(dadosParaSalvar) 
      });
      await new Promise(r => setTimeout(r, 400));
      await carregarDados();
    } catch(e) { console.error(e); await carregarDados(); }
  };

  const salvarEdicaoRota = async (e: React.FormEvent) => {
    e.preventDefault();
    setRotas(prev => prev.map(r => r.id === rotaEditando.id ? rotaEditando : r));
    
    const dadosParaSalvar = { ...rotaEditando };
    setRotaEditando(null); 
    
    try {
      await fetch(`${API_URL}/rotas/${dadosParaSalvar.id}`, { 
        method: "PUT", 
        headers: { "Content-Type": "application/json" }, 
        body: JSON.stringify(dadosParaSalvar) 
      });
      await new Promise(r => setTimeout(r, 400));
      await carregarDados();
    } catch(e) { console.error(e); await carregarDados(); }
  };

  const termo = termoPesquisa.toLowerCase();
  const entregadoresFiltrados = entregadores.filter(e => e.nome?.toLowerCase().includes(termo) || e.cidade?.toLowerCase().includes(termo) || e.empresa?.toLowerCase().includes(termo));
  const rotasFiltradas = rotas.filter(r => {
    if (r.nome?.toLowerCase().includes(termo)) return true;
    const cidadesDestaRota = cidadesRota.filter(c => c.rota_id === r.id);
    return cidadesDestaRota.some(c => c.cidade?.toLowerCase().includes(termo) || c.entregador?.toLowerCase().includes(termo));
  });

  return (
    <Layout titulo="Gestão de Frota">
      <style>
        {`
          .custom-scrollbar::-webkit-scrollbar { width: 4px; }
          .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
          .custom-scrollbar::-webkit-scrollbar-thumb { background: #253555; border-radius: 4px; }
          .content-grid { display: flex; flex-direction: column; gap: 14px; width: 100%; height: 100%; }
          .search-bar-box { background: ${isDark ? '#0f1d33' : '#ffffff'}; border: 1px solid ${isDark ? '#1a2540' : '#e2e8f0'}; border-radius: 12px; padding: 20px; display: flex; align-items: center; gap: 20px; flex-shrink: 0; position: relative; overflow: hidden; }
          .main-split { display: flex; gap: 14px; flex: 1; min-height: 0; }
          .panel-col { flex: 1; background: ${isDark ? '#0f1d33' : '#ffffff'}; border: 1px solid ${isDark ? '#1a2540' : '#e2e8f0'}; border-radius: 12px; display: flex; flex-direction: column; overflow: hidden; min-w: 0; }
          .panel-header { padding: 16px 20px; border-bottom: 1px solid ${isDark ? '#1a2540' : '#e2e8f0'}; background: ${isDark ? 'rgba(7,13,26,0.5)' : '#f8fafc'}; flex-shrink: 0; }
          .panel-form { padding: 16px; border-bottom: 1px solid ${isDark ? '#1a2540' : '#e2e8f0'}; background: ${isDark ? '#0f1d33' : '#ffffff'}; flex-shrink: 0; }
        `}
      </style>

      <div className="content-grid">
        <div className="search-bar-box shadow-sm transition-colors">
            <div className="w-[56px] h-[56px] bg-slate-50 dark:bg-[#1a2540] border border-slate-200 dark:border-[#253555] rounded-[10px] flex items-center justify-center shrink-0 z-10">
              <Car size={24} className="text-[#06b6d4]" />
            </div>
            <div className="flex-1 z-10 hidden md:block">
              <h2 className="text-[18px] font-black text-slate-800 dark:text-[#f1f5f9] uppercase tracking-tight leading-tight">Radar de Frota</h2>
              <p className="text-[11px] font-medium text-slate-500 dark:text-[#94a3b8] mt-0.5">Gerenciamento de Entregadores, Veículos e Rotas Mapeadas.</p>
            </div>
            <div className="w-full md:w-[400px] relative z-10 shrink-0">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-[#6b7280]" />
              <input type="text" value={termoPesquisa} onChange={e => setTermoPesquisa(e.target.value)} placeholder="Buscar entregador ou rota..." className="w-full bg-slate-50 dark:bg-[#1a2540] border border-slate-200 dark:border-[#253555] focus:border-[#f97316] rounded-xl pl-[42px] pr-4 py-3 text-[13px] font-bold text-slate-800 dark:text-[#f1f5f9] outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-[#4b5563] shadow-inner" />
            </div>
        </div>

        {carregando && entregadores.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-500 dark:text-[#6b7280] font-bold bg-white dark:bg-[#0f1d33] border border-slate-200 dark:border-[#1a2540] rounded-[12px] shadow-sm">
             <div className="w-8 h-8 border-2 border-[#06b6d4] border-t-transparent rounded-full animate-spin mb-3"></div> Varrendo banco de dados logístico...
          </div>
        ) : (
          <div className="main-split">
            {/* COLUNA 1: ENTREGADORES */}
            <div className="panel-col shadow-sm transition-colors">
               <div className="panel-header transition-colors">
                  <span className="text-[13px] font-bold text-slate-800 dark:text-slate-100 flex items-center justify-between">
                    <span className="flex items-center gap-2"><Users size={16} className="text-[#3b82f6]" /> Gestão de Entregadores</span>
                    <span className="text-[10px] text-[#3b82f6] bg-[#3b82f6]/10 px-2 py-1 rounded-md">{entregadoresFiltrados.length} Ativos</span>
                  </span>
               </div>
               <div className="panel-form transition-colors">
                  <form onSubmit={addEntregador} className="flex flex-col gap-3">
                    <div className="flex gap-2">
                      <input required type="text" value={novoNome} onChange={e => setNovoNome(e.target.value)} placeholder="Nome" className="flex-1 bg-slate-50 dark:bg-[#1a2540] border border-slate-200 dark:border-[#253555] rounded-[8px] px-3 py-2 text-[12px] font-semibold text-slate-800 dark:text-[#e2e8f0] outline-none focus:border-[#3b82f6] transition-colors placeholder:font-normal" />
                      <input required type="text" value={novaBase} onChange={e => setNovaBase(e.target.value)} placeholder="Cidade" className="w-[100px] bg-slate-50 dark:bg-[#1a2540] border border-slate-200 dark:border-[#253555] rounded-[8px] px-3 py-2 text-[12px] font-semibold text-slate-800 dark:text-[#e2e8f0] outline-none focus:border-[#3b82f6] transition-colors placeholder:font-normal" />
                      <select required value={novaEmpresa} onChange={e => setNovaEmpresa(e.target.value)} className="w-[120px] bg-slate-50 dark:bg-[#1a2540] border border-slate-200 dark:border-[#253555] rounded-[8px] px-2 py-2 text-[11px] font-semibold text-slate-800 dark:text-[#e2e8f0] outline-none focus:border-[#3b82f6] cursor-pointer">
                        <option value="Total Express">Total Exp.</option>
                        <option value="Loggi">Loggi</option>
                      </select>
                    </div>
                    <button type="submit" className="w-full bg-slate-800 dark:bg-[#253555] hover:bg-slate-700 dark:hover:bg-[#3b82f6] text-white text-[11px] font-bold py-2 rounded-[8px] transition-colors flex items-center justify-center gap-1.5 uppercase tracking-widest">
                       <UserPlus size={13} /> Registrar Novo Entregador
                    </button>
                  </form>
               </div>
               <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-2">
                 {entregadoresFiltrados.map(e => {
                    const isLoggi = e.empresa === 'Loggi' || String(e.empresa).toUpperCase().includes('LOGGI');
                    return (
                    <div key={e.id} className="flex items-center justify-between p-3 rounded-[8px] bg-slate-50 dark:bg-[#1a2540]/50 border border-slate-200 dark:border-[#253555]/50 group hover:border-[#3b82f6]/50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[12px] font-black shrink-0 border ${isLoggi ? 'bg-emerald-100 text-emerald-600 border-emerald-200 dark:bg-emerald-500/10' : 'bg-[#3b82f6]/10 text-[#3b82f6] border-[#3b82f6]/20'}`}>
                          {e.nome?.substring(0, 2).toUpperCase() || 'NA'}
                        </div>
                        <div>
                          <div className="text-[12px] font-semibold text-slate-800 dark:text-[#f1f5f9] leading-tight group-hover:text-[#3b82f6] transition-colors flex items-center gap-2">
                            {e.nome}
                            <span className={`text-[8px] uppercase font-black px-1.5 py-0.5 rounded ${isLoggi ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'}`}>
                              {e.empresa || 'Total Exp.'}
                            </span>
                          </div>
                          <div className="text-[10px] text-slate-500 dark:text-[#6b7280] leading-tight flex items-center gap-1 mt-0.5"><MapPin size={10} className="text-[#10b981]"/> {e.cidade}</div>
                        </div>
                      </div>
                      <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => setEntregadorEditando(e)} className="text-slate-400 hover:text-[#3b82f6] p-1.5 rounded-md hover:bg-[#3b82f6]/10 transition-colors"><Edit3 size={13} /></button>
                        <button onClick={() => setItemParaExcluir({ id: e.id, tipo: 'entregador', nome: e.nome })} className="text-slate-400 hover:text-red-500 p-1.5 rounded-md hover:bg-red-500/10 transition-colors"><Trash2 size={13} /></button>
                      </div>
                    </div>
                 )})}
               </div>
            </div>

            {/* COLUNA 2: ROTAS */}
            <div className="panel-col shadow-sm transition-colors">
               <div className="panel-header transition-colors">
                  <span className="text-[13px] font-bold text-slate-800 dark:text-slate-100 flex items-center justify-between">
                    <span className="flex items-center gap-2"><Route size={16} className="text-[#f97316]" /> Gestão de Rotas Operacionais</span>
                    <span className="text-[10px] text-[#f97316] bg-[#f97316]/10 px-2 py-1 rounded-md">{rotasFiltradas.length} Rotas</span>
                  </span>
               </div>
               <div className="panel-form space-y-4 transition-colors">
                  <form onSubmit={addRota} className="flex gap-3">
                    <input required type="text" value={novaRota} onChange={e => setNovaRota(e.target.value)} placeholder="Nome da Rota Ex: Litoral Sul" className="flex-1 bg-slate-50 dark:bg-[#1a2540] border border-slate-200 dark:border-[#253555] rounded-[8px] px-3 py-2 text-[12px] font-semibold text-slate-800 dark:text-[#e2e8f0] outline-none focus:border-[#f97316] transition-colors placeholder:font-normal" />
                    <button type="submit" className="bg-slate-800 dark:bg-[#253555] hover:bg-slate-700 dark:hover:bg-[#f97316] text-white text-[11px] font-bold px-4 rounded-[8px] transition-colors uppercase tracking-widest flex items-center gap-1"><Plus size={13}/> Criar</button>
                  </form>
                  <div className="bg-slate-50 dark:bg-[#1a2540]/30 border border-slate-200 dark:border-[#1a2540] p-3 rounded-[10px]">
                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-500 dark:text-[#6b7280] mb-2 flex items-center gap-1.5"><ShieldCheck size={12}/> Vincular Entregador a uma Rota</p>
                    <form onSubmit={addCidadeRota} className="flex gap-2">
                       <select required value={rotaSelecionada} onChange={e => setRotaSelecionada(e.target.value)} className="flex-1 bg-white dark:bg-[#1a2540] border border-slate-200 dark:border-[#253555] rounded-[6px] px-2 py-1.5 text-[11px] text-slate-800 dark:text-[#e2e8f0] outline-none focus:border-[#10b981] cursor-pointer">
                          <option value="">Selecione a Rota</option>
                          {rotas.map(r => <option key={r.id} value={r.id}>{r.nome}</option>)}
                       </select>
                       <select required value={entregadorSelecionado} onChange={e => setEntregadorSelecionado(e.target.value)} className="flex-1 bg-white dark:bg-[#1a2540] border border-slate-200 dark:border-[#253555] rounded-[6px] px-2 py-1.5 text-[11px] text-slate-800 dark:text-[#e2e8f0] outline-none focus:border-[#10b981] cursor-pointer">
                          <option value="">Selecione Entregador</option>
                          {entregadores.map(e => <option key={e.id} value={e.id}>{e.nome}</option>)}
                       </select>
                       <button type="submit" className="bg-slate-800 dark:bg-[#10b981]/20 hover:bg-slate-700 dark:hover:bg-[#10b981] text-white dark:text-[#10b981] dark:hover:text-white border border-transparent dark:border-[#10b981]/50 text-[10px] font-bold px-3 rounded-[6px] transition-all">Vincular</button>
                    </form>
                  </div>
               </div>

               <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-3">
                 {rotasFiltradas.map(rota => {
                    const cidades = cidadesRota.filter(c => c.rota_id === rota.id);
                    return (
                      <div key={rota.id} className="bg-white dark:bg-[#1a2540]/30 border border-slate-200 dark:border-[#253555]/50 rounded-[10px] overflow-hidden">
                        <div className="bg-slate-50 dark:bg-[#1a2540]/80 px-3 py-2 flex justify-between items-center border-b border-slate-200 dark:border-[#253555]/50 group">
                           <div className="flex items-center gap-2"><Map size={13} className="text-[#f97316]"/><span className="text-[12px] font-bold text-slate-800 dark:text-[#e2e8f0]">{rota.nome}</span></div>
                           <div className="flex items-center gap-2">
                             <span className="text-[9px] font-bold text-slate-500 dark:text-[#6b7280] bg-slate-200 dark:bg-[#0f1d33] px-1.5 py-0.5 rounded">{cidades.length} vinc.</span>
                             <button onClick={() => setRotaEditando(rota)} className="text-slate-400 hover:text-[#3b82f6] opacity-0 group-hover:opacity-100 transition-opacity"><Settings2 size={12}/></button>
                             <button onClick={() => setItemParaExcluir({ id: rota.id, tipo: 'rota', nome: rota.nome })} className="text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={12}/></button>
                           </div>
                        </div>
                        <div className="p-2 space-y-1">
                           {cidades.map(c => (
                               <div key={c.id} className="flex justify-between items-center px-2 py-1.5 bg-slate-50 dark:bg-[#0f1d33]/50 border border-slate-100 dark:border-[#1a2540] rounded-[6px] group/vinculo">
                                  <div className="flex items-center gap-1.5">
                                    <div className="w-1.5 h-1.5 rounded-full bg-[#10b981]"></div>
                                    <span className="text-[11px] font-semibold text-slate-700 dark:text-[#94a3b8]">{c.entregador}</span><span className="text-[9px] text-slate-400 dark:text-[#6b7280] ml-1">({c.cidade})</span>
                                  </div>
                                  <button onClick={() => setItemParaExcluir({ id: c.id, tipo: 'vinculo', nome: `Vínculo de ${c.entregador}` })} className="text-slate-400 hover:text-red-500 opacity-0 group-hover/vinculo:opacity-100 transition-opacity"><Trash2 size={11}/></button>
                               </div>
                           ))}
                        </div>
                      </div>
                    )
                 })}
               </div>
            </div>
          </div>
        )}
      </div>

      {/* 🛑 MODAIS RESTANTES (Exclusão e Edição) */}
      {itemParaExcluir && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/70 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#0f1d33] border border-slate-200 dark:border-[#1a2540] rounded-[16px] w-[350px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 text-center">
              <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-500/10 flex items-center justify-center mx-auto mb-4"><AlertCircle size={24} className="text-red-500" /></div>
              <h3 className="text-[14px] font-black text-slate-800 dark:text-white mb-2">Confirmar Exclusão</h3>
              <p className="text-[12px] text-slate-500 dark:text-[#94a3b8] mb-6">
                Tem certeza que deseja excluir <strong>{itemParaExcluir.nome}</strong>? <br />
                {itemParaExcluir.tipo === 'rota' && "Isso apagará todos os vínculos dessa rota."}
              </p>
              <div className="flex gap-3">
                <button onClick={() => setItemParaExcluir(null)} className="flex-1 py-2.5 bg-slate-100 dark:bg-[#1a2540] hover:bg-slate-200 text-slate-700 dark:text-white rounded-[8px] font-bold text-[12px] transition-colors">Cancelar</button>
                <button onClick={confirmarExclusao} className="flex-1 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-[8px] font-bold text-[12px] transition-colors shadow-sm">Sim, Excluir</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 🟢 TELA DE EDIÇÃO QUE TAVA FICANDO BRANCA ESTÁ 100% CORRIGIDA AQUI */}
      {(entregadorEditando || rotaEditando) && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#0f1d33] border border-slate-200 dark:border-[#1a2540] rounded-[16px] w-[350px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-5 py-4 border-b border-slate-200 dark:border-[#1a2540] bg-slate-50 dark:bg-[#070d1a]/50 flex justify-between items-center">
              <span className="text-[13px] font-bold text-slate-800 dark:text-[#e2e8f0]">Editar Registro</span>
              <button onClick={() => { setEntregadorEditando(null); setRotaEditando(null); }} className="text-slate-500 hover:text-red-500">
                 <XCircle size={18} />
              </button>
            </div>
            
            {entregadorEditando && (
              <form onSubmit={salvarEdicaoEntregador} className="p-5 flex flex-col gap-4">
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-500 dark:text-[#6b7280] mb-1.5 block">Nome</label>
                  <input required type="text" value={entregadorEditando.nome || ''} onChange={e => setEntregadorEditando({...entregadorEditando, nome: e.target.value})} className="w-full bg-slate-50 dark:bg-[#1a2540] border border-slate-200 dark:border-[#253555] rounded-[8px] px-3 py-2 text-[12px] font-semibold text-slate-800 dark:text-[#e2e8f0] outline-none focus:border-[#3b82f6]" />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-500 dark:text-[#6b7280] mb-1.5 block">Cidade</label>
                  <input required type="text" value={entregadorEditando.cidade || ''} onChange={e => setEntregadorEditando({...entregadorEditando, cidade: e.target.value})} className="w-full bg-slate-50 dark:bg-[#1a2540] border border-slate-200 dark:border-[#253555] rounded-[8px] px-3 py-2 text-[12px] font-semibold text-slate-800 dark:text-[#e2e8f0] outline-none focus:border-[#3b82f6]" />
                </div>
                {/* 🟢 EDIÇÃO DA EMPRESA */}
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-500 dark:text-[#6b7280] mb-1.5 block">Empresa</label>
                  <select required value={entregadorEditando.empresa || 'Total Express'} onChange={e => setEntregadorEditando({...entregadorEditando, empresa: e.target.value})} className="w-full bg-slate-50 dark:bg-[#1a2540] border border-slate-200 dark:border-[#253555] rounded-[8px] px-3 py-2 text-[12px] font-semibold text-slate-800 dark:text-[#e2e8f0] outline-none focus:border-[#3b82f6] cursor-pointer">
                    <option value="Total Express">Total Express</option>
                    <option value="Loggi">Loggi</option>
                  </select>
                </div>
                <button type="submit" className="w-full bg-[#3b82f6] hover:bg-blue-600 text-white font-bold text-[12px] py-2.5 rounded-[8px] mt-2 transition-colors">Salvar</button>
              </form>
            )}

            {rotaEditando && (
              <form onSubmit={salvarEdicaoRota} className="p-5 flex flex-col gap-4">
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-500 dark:text-[#6b7280] mb-1.5 block">Nome da Rota</label>
                  <input required type="text" value={rotaEditando.nome || ''} onChange={e => setRotaEditando({...rotaEditando, nome: e.target.value})} className="w-full bg-slate-50 dark:bg-[#1a2540] border border-slate-200 dark:border-[#253555] rounded-[8px] px-3 py-2 text-[12px] font-semibold text-slate-800 dark:text-[#e2e8f0] outline-none focus:border-[#f97316]" />
                </div>
                <button type="submit" className="w-full bg-[#f97316] hover:bg-orange-600 text-white font-bold text-[12px] py-2.5 rounded-[8px] mt-2 transition-colors">Salvar Rota</button>
              </form>
            )}
          </div>
        </div>
      )}

    </Layout>
  );
}