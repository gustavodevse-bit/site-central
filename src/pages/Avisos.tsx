import React, { useState, useEffect } from 'react';
import { Megaphone, Send, AlertTriangle, Info, Trash2, BellRing, Clock } from 'lucide-react';
import Layout from '../components/Layout'; // 🟢 IMPORTAÇÃO DO LAYOUT NORDEX AQUI!

export default function Avisos() {
  const [titulo, setTitulo] = useState('');
  const [mensagem, setMensagem] = useState('');
  const [tipo, setTipo] = useState('INFORMATIVO');
  const [carregando, setCarregando] = useState(false);
  const [avisosAtivos, setAvisosAtivos] = useState<any[]>([]);

  // 1. FUNÇÃO PARA PUXAR OS AVISOS DO BANCO DE DADOS
  const carregarAvisos = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/avisos/ativos`);
      if (res.ok) {
        const data = await res.json();
        // Inverte para o mais recente aparecer primeiro
        setAvisosAtivos(data.reverse());
      }
    } catch (err) {
      console.error("Erro ao carregar avisos:", err);
    }
  };

  // Carrega logo que a tela abre
  useEffect(() => {
    carregarAvisos();
  }, []);

  // 2. FUNÇÃO PARA CRIAR UM NOVO AVISO
  const enviarAviso = async () => {
    if (!titulo || !mensagem) {
      alert("Por favor, preencha o título e a mensagem do aviso!");
      return;
    }

    setCarregando(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/avisos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          titulo: titulo,
          mensagem: mensagem,
          tipo: tipo,
          autor: localStorage.getItem("nordexUserNome") || "Central Nordex",
          categoria: "GERAL",
          destino: "TODOS"
        })
      });

      if (res.ok) {
        setTitulo('');
        setMensagem('');
        setTipo('INFORMATIVO');
        carregarAvisos(); // Recarrega a lista na mesma hora!
      } else {
        alert("❌ Erro ao enviar o aviso.");
      }
    } catch (err) {
      alert("❌ Erro de conexão com o servidor.");
    } finally {
      setCarregando(false);
    }
  };

  // 3. FUNÇÃO PARA APAGAR UM AVISO
  const apagarAviso = async (id: number) => {
    if (!window.confirm("Tem certeza que deseja apagar este comunicado? Ele vai sumir dos aplicativos imediatamente.")) return;

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/avisos/${id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        carregarAvisos(); // Atualiza a tela após deletar
      } else {
        alert("Erro ao apagar o aviso no servidor.");
      }
    } catch (err) {
      alert("Erro de conexão ao tentar apagar o aviso.");
    }
  };

  return (
    // 🟢 ENCAIXAMOS O LAYOUT BRUTO DA NORDEX AQUI!
    <Layout titulo="Mural de Avisos">
      <div className="flex flex-col h-full animate-in fade-in pb-8 overflow-y-auto pr-2 custom-scrollbar">
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 h-full">
          
          {/* COLUNA DA ESQUERDA: FORMULÁRIO DE CRIAÇÃO */}
          <div className="xl:col-span-1 flex flex-col gap-6">
            <div className="bg-white dark:bg-[#070d1a] border border-slate-200 dark:border-[#1a2540] rounded-[16px] p-6 shadow-sm">
              
              <div className="flex items-center gap-3 mb-6 border-b border-slate-100 dark:border-[#1a2540] pb-4">
                <div className="w-10 h-10 bg-[#f97316]/10 text-[#f97316] rounded-[10px] flex items-center justify-center">
                  <Megaphone size={20} />
                </div>
                <div>
                  <h2 className="text-[16px] font-black text-slate-800 dark:text-[#f1f5f9] tracking-tight">Novo Comunicado</h2>
                  <p className="text-[11px] font-medium text-slate-500 dark:text-[#94a3b8]">Disparo imediato para o App Motorista.</p>
                </div>
              </div>

              <div className="space-y-5">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-[#6b7280] block mb-1.5">Título do Aviso</label>
                  <input 
                    type="text" 
                    value={titulo}
                    onChange={(e) => setTitulo(e.target.value)}
                    placeholder="Ex: Rota Sul com Atraso"
                    className="w-full bg-slate-50 dark:bg-[#1a2540] border border-slate-200 dark:border-[#253555] rounded-[10px] px-4 py-3 text-[12px] font-bold text-slate-800 dark:text-[#f1f5f9] outline-none focus:border-[#f97316] transition-colors placeholder:font-medium placeholder:text-slate-400 dark:placeholder:text-[#6b7280]"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-[#6b7280] block mb-1.5">Nível de Urgência</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button 
                      onClick={() => setTipo('INFORMATIVO')}
                      className={`flex items-center justify-center gap-2 py-3 rounded-[10px] border-2 transition-all ${tipo === 'INFORMATIVO' ? 'bg-[#3b82f6]/10 border-[#3b82f6] text-[#3b82f6]' : 'bg-slate-50 dark:bg-[#1a2540] border-transparent text-slate-500 dark:text-[#94a3b8] hover:bg-slate-100 dark:hover:bg-[#253555]'}`}
                    >
                      <Info size={16} />
                      <span className="text-[11px] font-black uppercase tracking-widest">Informativo</span>
                    </button>
                    
                    <button 
                      onClick={() => setTipo('URGENTE')}
                      className={`flex items-center justify-center gap-2 py-3 rounded-[10px] border-2 transition-all ${tipo === 'URGENTE' ? 'bg-[#ef4444]/10 border-[#ef4444] text-[#ef4444]' : 'bg-slate-50 dark:bg-[#1a2540] border-transparent text-slate-500 dark:text-[#94a3b8] hover:bg-slate-100 dark:hover:bg-[#253555]'}`}
                    >
                      <AlertTriangle size={16} />
                      <span className="text-[11px] font-black uppercase tracking-widest">Urgente</span>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-[#6b7280] block mb-1.5">Conteúdo da Mensagem</label>
                  <textarea 
                    value={mensagem}
                    onChange={(e) => setMensagem(e.target.value)}
                    placeholder="Escreva os detalhes aqui..."
                    className="w-full h-32 bg-slate-50 dark:bg-[#1a2540] border border-slate-200 dark:border-[#253555] rounded-[10px] px-4 py-3 text-[12px] font-bold text-slate-800 dark:text-[#f1f5f9] outline-none focus:border-[#f97316] transition-colors resize-none placeholder:font-medium placeholder:text-slate-400 dark:placeholder:text-[#6b7280]"
                  ></textarea>
                </div>

                <button 
                  onClick={enviarAviso}
                  disabled={carregando}
                  className="w-full bg-[#f97316] hover:bg-[#ea580c] text-white font-black text-[12px] py-4 rounded-[10px] flex items-center justify-center gap-2 uppercase tracking-widest shadow-md disabled:opacity-70 transition-all active:scale-95 mt-2"
                >
                  {carregando ? 'Disparando...' : <><Send size={16} /> Disparar para a Frota</>}
                </button>
              </div>
            </div>
          </div>

          {/* COLUNA DA DIREITA: LISTA DE AVISOS ATIVOS */}
          <div className="xl:col-span-2 flex flex-col gap-6">
            <div className="bg-white dark:bg-[#070d1a] border border-slate-200 dark:border-[#1a2540] rounded-[16px] p-6 shadow-sm flex-1">
              
              <div className="flex items-center gap-3 mb-6 border-b border-slate-100 dark:border-[#1a2540] pb-4">
                <div className="w-10 h-10 bg-[#3b82f6]/10 text-[#3b82f6] rounded-[10px] flex items-center justify-center">
                  <BellRing size={20} />
                </div>
                <div>
                  <h2 className="text-[16px] font-black text-slate-800 dark:text-[#f1f5f9] tracking-tight">Mural de Avisos Ativos</h2>
                  <p className="text-[11px] font-medium text-slate-500 dark:text-[#94a3b8]">Comunicados visíveis nos aplicativos neste momento.</p>
                </div>
              </div>

              <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1 custom-scrollbar">
                {avisosAtivos.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-slate-400 dark:text-[#6b7280]">
                    <BellRing size={48} className="mb-4 opacity-20" />
                    <p className="text-[12px] font-bold">Nenhum aviso ativo no momento.</p>
                    <p className="text-[11px]">Use o painel ao lado para disparar comunicados.</p>
                  </div>
                ) : (
                  avisosAtivos.map((aviso) => (
                    <div key={aviso.id} className="relative bg-slate-50 dark:bg-[#1a2540]/30 border border-slate-200 dark:border-[#253555] p-5 rounded-[12px] hover:border-slate-300 dark:hover:border-[#3b4a6b] transition-colors group">
                      
                      <div className={`absolute left-0 top-0 bottom-0 w-[5px] rounded-l-[12px] ${aviso.tipo === 'URGENTE' ? 'bg-[#ef4444]' : 'bg-[#3b82f6]'}`}></div>
                      
                      <div className="flex justify-between items-start pl-2">
                        <div className="flex-1 pr-6">
                          <div className="flex items-center gap-3 mb-2">
                            <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-[6px] ${aviso.tipo === 'URGENTE' ? 'bg-[#ef4444]/10 text-[#ef4444]' : 'bg-[#3b82f6]/10 text-[#3b82f6]'}`}>
                              {aviso.tipo}
                            </span>
                            <span className="text-[10px] text-slate-400 dark:text-[#6b7280] font-bold flex items-center gap-1">
                              <Clock size={10} /> {new Date(aviso.data).toLocaleString('pt-BR')}
                            </span>
                          </div>
                          <h3 className="text-[14px] font-black text-slate-800 dark:text-white mb-2 leading-tight">{aviso.titulo}</h3>
                          <p className="text-[12px] text-slate-500 dark:text-[#94a3b8] leading-relaxed mb-3">{aviso.mensagem}</p>
                          <p className="text-[10px] text-slate-400 dark:text-[#6b7280] font-bold uppercase">
                            Autor: <span className="text-slate-600 dark:text-[#e2e8f0]">{aviso.autor}</span>
                          </p>
                        </div>

                        {/* BOTÃO DE DELETAR COM DESIGN NORDEX */}
                        <button 
                          onClick={() => apagarAviso(aviso.id)}
                          title="Apagar Aviso"
                          className="w-8 h-8 rounded-[8px] bg-white dark:bg-[#1a2540] border border-slate-200 dark:border-[#253555] flex items-center justify-center text-slate-400 hover:text-[#ef4444] hover:bg-[#ef4444]/10 hover:border-[#ef4444]/30 transition-all opacity-0 group-hover:opacity-100 shadow-sm"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
              
            </div>
          </div>

        </div>
      </div>
    </Layout>
  );
}