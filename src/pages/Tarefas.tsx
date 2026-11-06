import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
// 🟢 AQUI ESTÁ A CORREÇÃO: AlertCircle adicionado na importação!
import { Megaphone, BellRing, AlertTriangle, Send, CheckCircle2, Clock, Users, Target, Trash2, ListTodo, User, AlertCircle } from 'lucide-react';

export default function Tarefas() {
  const API_JAVA = `${import.meta.env.VITE_API_URL}/api`;

  const [avisos, setAvisos] = useState<any[]>([]);
  const [usuariosCadastrados, setUsuariosCadastrados] = useState<any[]>([]); 
  const [carregando, setCarregando] = useState(false);

  // Estados do Formulário
  const [tipo, setTipo] = useState<'aviso' | 'tarefa'>('aviso');
  const [prioridade, setPrioridade] = useState<'normal' | 'alta' | 'urgente'>('normal');
  const [destino, setDestino] = useState('todos');
  const [destinoIndividual, setDestinoIndividual] = useState(''); 
  const [titulo, setTitulo] = useState('');
  const [mensagem, setMensagem] = useState('');
  const [feedback, setFeedback] = useState<{ msg: string; tipo: 'sucesso' | 'erro' } | null>(null);

  const [avisoParaExcluir, setAvisoParaExcluir] = useState<number | null>(null);

  const [isDark, setIsDark] = useState(document.documentElement.classList.contains('dark'));

  // =========================================================================
  // CARREGAR DADOS COM ANTI-CACHE
  // =========================================================================
  useEffect(() => {
    carregarAvisos();
    carregarUsuarios(); 
    
    const handleThemeChange = () => setIsDark(document.documentElement.classList.contains('dark'));
    window.addEventListener('themeChange', handleThemeChange);
    return () => window.removeEventListener('themeChange', handleThemeChange);
  }, []);

  const carregarAvisos = async () => {
    try {
      const time = new Date().getTime();
      const res = await fetch(`${API_JAVA}/avisos/ativos?t=${time}`, { cache: 'no-store' });
      if (res.ok) {
        const dados = await res.json();
        setAvisos(dados.sort((a: any, b: any) => new Date(b.data).getTime() - new Date(a.data).getTime()));
      }
    } catch (erro) { console.error("Erro ao buscar avisos:", erro); }
  };

  const carregarUsuarios = async () => {
    try {
      const time = new Date().getTime();
      const res = await fetch(`${API_JAVA}/supervisao/equipe?t=${time}`, { cache: 'no-store' });
      if (res.ok) { setUsuariosCadastrados(await res.json()); }
    } catch (erro) { console.error("Erro ao buscar usuários:", erro); }
  };

  // =========================================================================
  // DISPARAR MENSAGEM (Com atualização instantânea)
  // =========================================================================
  const dispararAviso = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!titulo.trim() || !mensagem.trim()) {
      setFeedback({ msg: 'Preencha o título e a mensagem!', tipo: 'erro' });
      setTimeout(() => setFeedback(null), 3000);
      return;
    }

    if (destino === 'individual' && !destinoIndividual.trim()) {
      setFeedback({ msg: 'Selecione um operador na lista para enviar!', tipo: 'erro' });
      setTimeout(() => setFeedback(null), 3000);
      return;
    }

    setCarregando(true);
    const destinoFinal = destino === 'individual' ? `INDIVIDUAL:${destinoIndividual.trim()}` : destino;

    const novoAviso = {
      tipo: prioridade, categoria: tipo, titulo, mensagem,
      destino: destinoFinal, data: new Date().toISOString(), autor: 'Supervisão' 
    };

    // 🟢 OPTIMISTIC UPDATE: Coloca na tela antes de ir pro banco
    const avisoProvisorio = { ...novoAviso, id: Date.now() };
    setAvisos(prev => [avisoProvisorio, ...prev]);

    // Limpa o formulário na hora
    setTitulo(''); setMensagem(''); setPrioridade('normal'); setTipo('aviso'); setDestinoIndividual('');
    setFeedback({ msg: 'Mensagem disparada com sucesso!', tipo: 'sucesso' });

    try {
      await fetch(`${API_JAVA}/avisos`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(novoAviso)
      });
      await new Promise(r => setTimeout(r, 400));
      await carregarAvisos(); // Puxa com o ID correto
    } catch (erro) {
      console.error(erro);
      setAvisos(prev => prev.filter(a => a.id !== avisoProvisorio.id)); // Reverte em erro
      setFeedback({ msg: 'Erro de conexão com o banco.', tipo: 'erro' });
    } finally {
      setCarregando(false);
      setTimeout(() => setFeedback(null), 4000);
    }
  };

  // =========================================================================
  // APAGAR MENSAGEM (Com Modal Personalizado)
  // =========================================================================
  const apagarAviso = async () => {
    if (avisoParaExcluir === null) return;
    const id = avisoParaExcluir;
    setAvisoParaExcluir(null); // Fecha o modal NA HORA

    // 🟢 OPTIMISTIC UPDATE: Tira da tela NA HORA
    setAvisos(prev => prev.filter(a => a.id !== id));

    try {
      await fetch(`${API_JAVA}/avisos/${id}`, { method: 'DELETE' });
      await new Promise(r => setTimeout(r, 400));
      await carregarAvisos();
    } catch (err) {
      console.error(err);
      await carregarAvisos(); // Se falhou, puxa do banco pra restaurar a tela
    }
  };

  return (
    <Layout titulo="Central de Comunicação">
      
      {/* 🚀 O MESMO GRID E ESTILO DO DASHBOARD */}
      <style>
        {`
          .custom-scrollbar::-webkit-scrollbar { width: 4px; }
          .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
          .custom-scrollbar::-webkit-scrollbar-thumb { background: #253555; border-radius: 4px; }
          .content-grid { display: flex; flex-direction: column; gap: 14px; width: 100%; height: 100%; }
          .banner-box { background: ${isDark ? '#0f1d33' : '#ffffff'}; border: 1px solid ${isDark ? '#1a2540' : '#e2e8f0'}; border-radius: 12px; padding: 20px; display: flex; align-items: center; gap: 20px; flex-shrink: 0; position: relative; overflow: hidden; }
          .main-split { display: flex; gap: 14px; flex: 1; min-height: 0; }
          .panel-col { flex: 1; background: ${isDark ? '#0f1d33' : '#ffffff'}; border: 1px solid ${isDark ? '#1a2540' : '#e2e8f0'}; border-radius: 12px; display: flex; flex-direction: column; overflow: hidden; min-w: 0; }
          .panel-header { padding: 16px 20px; border-bottom: 1px solid ${isDark ? '#1a2540' : '#e2e8f0'}; background: ${isDark ? 'rgba(7,13,26,0.5)' : '#f8fafc'}; flex-shrink: 0; }
        `}
      </style>

      <div className="content-grid">
        
        <datalist id="lista-usuarios-sistema">
          {usuariosCadastrados.map((u: any, index: number) => (
            <option key={index} value={`${u.nome} (${u.cargo || 'OPERACIONAL'})`} />
          ))}
        </datalist>

        {/* 1. BANNER SUPERIOR */}
        <div className="banner-box shadow-sm transition-colors">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#f97316] opacity-10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
          
          <div className="w-[56px] h-[56px] bg-slate-50 dark:bg-[#1a2540] border border-slate-200 dark:border-[#253555] rounded-[10px] flex items-center justify-center shrink-0 z-10 transition-colors">
             <Megaphone size={24} className="text-[#f97316]" />
          </div>
          <div className="flex-1 z-10">
            <h2 className="text-[18px] font-black text-slate-800 dark:text-[#f1f5f9] uppercase tracking-tight leading-tight">Transmissão Global</h2>
            <p className="text-[11px] font-medium text-slate-500 dark:text-[#94a3b8] mt-0.5">Dispare avisos, alertas ou delegue tarefas diretamente para os painéis da operação.</p>
          </div>
        </div>

        <div className="main-split">
          
          {/* COLUNA ESQUERDA: FORMULÁRIO DE DISPARO */}
          <div className="panel-col max-w-[400px] shadow-sm transition-colors">
            <div className="panel-header transition-colors">
              <h3 className="text-[13px] font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <Send size={16} className="text-[#f97316]" /> Nova Mensagem
              </h3>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-5">
              <form onSubmit={dispararAviso} className="space-y-5">
                
                {/* Tipo de Mensagem */}
                <div className="grid grid-cols-2 gap-3">
                  <button type="button" onClick={() => setTipo('aviso')} className={`p-2.5 rounded-[8px] border text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-1.5 transition-all ${tipo === 'aviso' ? 'bg-[#f97316] text-white border-[#f97316] shadow-sm' : 'bg-slate-50 dark:bg-[#1a2540] text-slate-500 dark:text-[#6b7280] border-slate-200 dark:border-[#253555] hover:border-[#f97316]/50'}`}>
                    <BellRing size={14} /> Aviso
                  </button>
                  <button type="button" onClick={() => setTipo('tarefa')} className={`p-2.5 rounded-[8px] border text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-1.5 transition-all ${tipo === 'tarefa' ? 'bg-[#3b82f6] text-white border-[#3b82f6] shadow-sm' : 'bg-slate-50 dark:bg-[#1a2540] text-slate-500 dark:text-[#6b7280] border-slate-200 dark:border-[#253555] hover:border-[#3b82f6]/50'}`}>
                    <ListTodo size={14} /> Tarefa
                  </button>
                </div>

                {/* Prioridade */}
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-500 dark:text-[#6b7280] mb-1.5 block tracking-widest">Nível de Prioridade</label>
                  <div className="flex gap-1.5 bg-slate-50 dark:bg-[#1a2540]/50 p-1.5 rounded-[8px] border border-slate-200 dark:border-[#253555]">
                    {['normal', 'alta', 'urgente'].map((nivel) => (
                      <button 
                        key={nivel} type="button" onClick={() => setPrioridade(nivel as any)}
                        className={`flex-1 py-1.5 rounded-[6px] text-[9px] font-black uppercase tracking-widest transition-all ${
                          prioridade === nivel 
                            ? nivel === 'urgente' ? 'bg-[#ef4444] text-white shadow-sm' : nivel === 'alta' ? 'bg-[#f59e0b] text-white shadow-sm' : 'bg-white dark:bg-[#253555] text-slate-800 dark:text-white shadow-sm border border-slate-200 dark:border-transparent'
                            : 'text-slate-500 dark:text-[#6b7280] hover:text-slate-700 dark:hover:text-[#94a3b8]'
                        }`}
                      >
                        {nivel}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Destino */}
                <div className="space-y-3">
                  <div>
                    <label className="text-[10px] font-black uppercase text-slate-500 dark:text-[#6b7280] mb-1.5 flex items-center gap-1 tracking-widest"><Target size={12}/> Destinatários</label>
                    <select value={destino} onChange={(e) => setDestino(e.target.value)} className="w-full bg-slate-50 dark:bg-[#1a2540] border border-slate-200 dark:border-[#253555] text-slate-800 dark:text-[#e2e8f0] px-3 py-2.5 rounded-[8px] outline-none focus:border-[#f97316] transition-colors text-[11px] font-bold cursor-pointer">
                      <option value="todos">Todos (Sino Global)</option>
                      <option value="logistica">Apenas Pátio Logístico</option>
                      <option value="motoristas">Apenas App dos Motoristas</option>
                      <option value="individual">Operador Específico (Individual)</option>
                    </select>
                  </div>

                  {/* Input COM DATALIST para Operador Específico */}
                  {destino === 'individual' && (
                    <div className="animate-in fade-in slide-in-from-top-2">
                      <div className="relative">
                        <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-[#6b7280]" />
                        <input 
                          type="text" 
                          list="lista-usuarios-sistema"
                          value={destinoIndividual} 
                          onChange={(e) => setDestinoIndividual(e.target.value)} 
                          placeholder="Pesquise o nome na lista..." 
                          className="w-full bg-white dark:bg-[#070d1a] border border-[#3b82f6]/30 text-slate-800 dark:text-[#f1f5f9] pl-9 pr-3 py-2.5 rounded-[8px] outline-none focus:border-[#3b82f6] transition-colors text-[11px] font-bold placeholder:text-slate-400 dark:placeholder:text-[#4b5563] shadow-inner" 
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Título e Mensagem */}
                <div className="space-y-3 pt-1">
                  <input type="text" value={titulo} onChange={(e) => setTitulo(e.target.value)} placeholder="Título do Aviso..." className="w-full bg-slate-50 dark:bg-[#1a2540] border border-slate-200 dark:border-[#253555] text-slate-800 dark:text-[#e2e8f0] px-3 py-2.5 rounded-[8px] outline-none focus:border-[#f97316] transition-colors text-[12px] font-bold placeholder:text-slate-400 dark:placeholder:text-[#4b5563]" />
                  <textarea value={mensagem} onChange={(e) => setMensagem(e.target.value)} placeholder="Detalhes da tarefa ou aviso..." className="w-full h-[100px] resize-none bg-slate-50 dark:bg-[#1a2540] border border-slate-200 dark:border-[#253555] text-slate-800 dark:text-[#e2e8f0] px-3 py-2.5 rounded-[8px] outline-none focus:border-[#f97316] transition-colors text-[11px] font-medium placeholder:text-slate-400 dark:placeholder:text-[#4b5563]" />
                </div>

                {/* Feedback */}
                {feedback && (
                  <div className={`p-2.5 rounded-[8px] text-[10px] font-bold flex items-center gap-2 ${feedback.tipo === 'sucesso' ? 'bg-[#10b981]/10 text-[#10b981] border border-[#10b981]/20' : 'bg-[#ef4444]/10 text-[#ef4444] border border-[#ef4444]/20'}`}>
                    {feedback.tipo === 'sucesso' ? <CheckCircle2 size={14} /> : <AlertTriangle size={14} />}
                    {feedback.msg}
                  </div>
                )}

                <button type="submit" disabled={carregando} className="w-full bg-[#f97316] hover:bg-[#ea580c] text-white font-black py-3 rounded-[8px] flex items-center justify-center gap-1.5 shadow-sm transition-colors uppercase tracking-widest text-[11px] disabled:opacity-50">
                  {carregando ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <><Megaphone size={14} /> DISPARAR PARA OPERAÇÃO</>}
                </button>
              </form>
            </div>
          </div>

          {/* COLUNA DIREITA: HISTÓRICO DE MENSAGENS ATIVAS */}
          <div className="panel-col shadow-sm transition-colors">
            <div className="panel-header transition-colors flex justify-between items-center">
              <h3 className="text-[13px] font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <Clock size={16} className="text-slate-400 dark:text-[#6b7280]" /> Histórico de Disparos Ativos
              </h3>
              <span className="text-[9px] font-black bg-slate-200 dark:bg-[#1a2540] text-slate-500 dark:text-[#94a3b8] px-2 py-1 rounded-md tracking-widest uppercase">
                {avisos.length} no Ar
              </span>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-5 space-y-3">
              {avisos.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-slate-400 dark:text-[#4b5563]">
                  <BellRing size={48} className="mb-3 opacity-20" />
                  <p className="font-bold text-[11px]">Nenhum aviso ativo no painel da operação.</p>
                </div>
              ) : (
                avisos.map((aviso) => {
                  const isIndividual = aviso.destino?.startsWith('INDIVIDUAL:');
                  const destinoTexto = isIndividual ? aviso.destino.split(':')[1] : aviso.destino;

                  return (
                    <div key={aviso.id} className="relative bg-slate-50 dark:bg-[#1a2540]/30 rounded-[10px] border border-slate-200 dark:border-[#253555]/50 p-4 group transition-colors hover:border-slate-300 dark:hover:border-[#3b82f6]/50">
                      
                      {/* BADGE DE PRIORIDADE */}
                      <div className={`absolute -top-2.5 -right-2 px-2 py-0.5 rounded-[4px] text-[8px] font-black uppercase tracking-widest flex items-center gap-1 ${
                        aviso.tipo === 'urgente' ? 'bg-[#ef4444] text-white' : 
                        aviso.tipo === 'alta' ? 'bg-[#f59e0b] text-white' : 
                        'bg-slate-200 dark:bg-[#253555] text-slate-600 dark:text-[#94a3b8]'
                      }`}>
                        {aviso.tipo === 'urgente' && <AlertTriangle size={8} />}
                        {aviso.tipo}
                      </div>

                      <div className="flex items-start gap-3">
                        <div className={`w-10 h-10 rounded-[8px] flex items-center justify-center shrink-0 border ${aviso.categoria === 'tarefa' ? 'bg-[#3b82f6]/10 text-[#3b82f6] border-[#3b82f6]/20' : 'bg-[#f97316]/10 text-[#f97316] border-[#f97316]/20'}`}>
                          {aviso.categoria === 'tarefa' ? <ListTodo size={18} /> : <Megaphone size={18} />}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <h4 className="text-[13px] font-black text-slate-800 dark:text-[#e2e8f0] leading-tight truncate pr-4">{aviso.titulo}</h4>
                          <p className="text-[11px] font-medium text-slate-600 dark:text-[#94a3b8] mt-1.5 leading-relaxed">{aviso.mensagem}</p>
                          
                          <div className="flex flex-wrap items-center gap-3 mt-3 pt-2.5 border-t border-slate-200 dark:border-[#1a2540]">
                            <span className="text-[9px] font-bold text-slate-500 dark:text-[#6b7280] flex items-center gap-1 uppercase tracking-widest">
                              <Clock size={10} /> {new Date(aviso.data).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })}
                            </span>
                            <span className={`text-[9px] font-bold flex items-center gap-1 uppercase tracking-widest px-1.5 py-0.5 rounded-[4px] ${isIndividual ? 'bg-[#3b82f6]/10 text-[#3b82f6]' : 'text-slate-500 dark:text-[#6b7280]'}`}>
                              {isIndividual ? <User size={10} /> : <Users size={10} />} Destino: {destinoTexto}
                            </span>
                          </div>
                        </div>

                        {/* 🟢 CHAMA O NOVO MODAL */}
                        <button onClick={() => setAvisoParaExcluir(aviso.id)} className="w-7 h-7 rounded-[6px] flex items-center justify-center text-slate-400 hover:bg-[#ef4444]/10 hover:text-[#ef4444] transition-colors shrink-0 opacity-0 group-hover:opacity-100">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>

        </div>
      </div>

      {/* 🛑 MODAL DE CONFIRMAÇÃO DE EXCLUSÃO (Igual ao da Frota) */}
      {avisoParaExcluir !== null && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/70 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#0f1d33] border border-slate-200 dark:border-[#1a2540] rounded-[16px] w-[350px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 text-center">
              <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-500/10 flex items-center justify-center mx-auto mb-4">
                <AlertCircle size={24} className="text-[#ef4444]" />
              </div>
              <h3 className="text-[14px] font-black text-slate-800 dark:text-white mb-2">Remover do Painel</h3>
              <p className="text-[12px] text-slate-500 dark:text-[#94a3b8] mb-6">
                Tem certeza que deseja apagar este aviso? Ele deixará de aparecer para a operação.
              </p>
              <div className="flex gap-3">
                <button onClick={() => setAvisoParaExcluir(null)} className="flex-1 py-2.5 bg-slate-100 dark:bg-[#1a2540] hover:bg-slate-200 dark:hover:bg-[#253555] text-slate-700 dark:text-white rounded-[8px] font-bold text-[12px] transition-colors">Cancelar</button>
                <button onClick={apagarAviso} className="flex-1 py-2.5 bg-[#ef4444] hover:bg-red-600 text-white rounded-[8px] font-bold text-[12px] transition-colors shadow-sm">Sim, Apagar</button>
              </div>
            </div>
          </div>
        </div>
      )}

    </Layout>
  );
}