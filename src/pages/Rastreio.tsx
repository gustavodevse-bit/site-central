import React, { useState, useEffect } from 'react';
import Layout from "../components/Layout";
import { Search, MapPin, Package, Clock, User, Truck, ScanLine, Calendar, Barcode, Warehouse, Map, CheckCircle2 } from 'lucide-react';

export default function Rastreio() {
  const API_JAVA = `${import.meta.env.VITE_API_URL}/api`;
  const [transferencias, setTransferencias] = useState<any[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [busca, setBusca] = useState('');
  const [selecionada, setSelecionada] = useState<any | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`${API_JAVA}/logistica/transferencias`);
        if (res.ok) {
          const data = await res.json();
          setTransferencias(data);
        }
      } catch (e) {
        console.error("Erro ao buscar dados de rastreio", e);
      } finally {
        setCarregando(false);
      }
    };
    fetchData();
  }, []);

  const transferenciasFiltradas = transferencias.filter((t: any) => {
    if (!busca) return true;
    const termo = busca.toLowerCase();
    return t.caf?.toLowerCase().includes(termo) || t.cidade?.toLowerCase().includes(termo) || t.rota?.toLowerCase().includes(termo);
  }).sort((a: any, b: any) => new Date(b.data_criacao || 0).getTime() - new Date(a.data_criacao || 0).getTime());

  // CORES INTELIGENTES PARA CLARO/ESCURO
  const getStatusColor = (status: string) => {
    if (status === 'Finalizada' || status === 'Entregue (Mobile)') return 'text-emerald-600 dark:text-[#10b981] bg-emerald-50 dark:bg-[#10b981]/10 border-emerald-200 dark:border-[#10b981]/20';
    if (status === 'Em Conferência' || status === 'Aguardando Saída') return 'text-amber-600 dark:text-[#f59e0b] bg-amber-50 dark:bg-[#f59e0b]/10 border-amber-200 dark:border-[#f59e0b]/20';
    if (status === 'Em Liberação') return 'text-blue-600 dark:text-[#3b82f6] bg-blue-50 dark:bg-[#3b82f6]/10 border-blue-200 dark:border-[#3b82f6]/20';
    return 'text-slate-500 dark:text-[#6b7280] bg-slate-100 dark:bg-[#1a2540] border-slate-200 dark:border-[#253555]';
  };

  const calcularProgresso = (t: any) => {
    if (['Em Liberação', 'Finalizada', 'Entregue (Mobile)'].includes(t.status)) return 100;
    if (['Em Conferência', 'Aguardando Saída', 'Divergência'].includes(t.status) || t.conferente) return 60;
    return 20; 
  };

  return (
    <Layout titulo="Rastreamento Logístico">
      
      <div className="flex flex-col gap-[14px] w-full h-full">
        
        {/* 1. BARRA DE PESQUISA SUPERIOR */}
        <div className="bg-white dark:bg-[#0f1d33] border border-slate-200 dark:border-[#1a2540] rounded-[12px] p-5 flex items-center gap-[20px] shrink-0 relative overflow-hidden shadow-sm transition-colors">
            
            <div className="absolute -right-10 -top-10 opacity-5 pointer-events-none transform rotate-12">
              <Barcode size={250} className="text-slate-800 dark:text-white" />
            </div>
            
            <div className="w-[56px] h-[56px] bg-slate-50 dark:bg-[#1a2540] border border-slate-200 dark:border-[#253555] rounded-[10px] flex items-center justify-center shrink-0 z-10 transition-colors">
              <ScanLine size={24} className="text-[#06b6d4]" />
            </div>
            
            <div className="flex-1 z-10 hidden md:block">
              <h2 className="text-[18px] font-black text-slate-800 dark:text-[#f1f5f9] uppercase tracking-tight leading-tight">Radar de Rastreio</h2>
              <p className="text-[11px] font-medium text-slate-500 dark:text-[#94a3b8] mt-0.5">Localização de pacotes via Código de Barras (CAF) ou Destino.</p>
            </div>
            
            <div className="w-full md:w-[400px] relative z-10 shrink-0">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-[#6b7280]" />
              <input 
                type="text" 
                value={busca} 
                onChange={e => setBusca(e.target.value)} 
                placeholder="Ex: CAF-123456 ou Aracaju..." 
                className="w-full bg-slate-50 dark:bg-[#1a2540] border border-slate-200 dark:border-[#253555] focus:border-[#f97316] dark:focus:border-[#f97316] rounded-xl pl-[42px] pr-4 py-3 text-[13px] font-bold text-slate-800 dark:text-[#f1f5f9] outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-[#4b5563] uppercase"
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 bg-slate-200 dark:bg-[#253555] text-slate-500 dark:text-[#94a3b8] text-[9px] px-2 py-1 rounded font-bold">BUSCA RÁPIDA</div>
            </div>
        </div>

        {carregando ? (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-500 dark:text-[#6b7280] font-bold bg-white dark:bg-[#0f1d33] border border-slate-200 dark:border-[#1a2540] rounded-[12px] transition-colors shadow-sm">
             <div className="w-8 h-8 border-2 border-[#06b6d4] border-t-transparent rounded-full animate-spin mb-3"></div>
             Varrendo banco de dados...
          </div>
        ) : (
          <div className="flex gap-[14px] flex-1 min-h-0">
            
            {/* 2. PAINEL ESQUERDO: LISTA DE PACOTES */}
            <div className="w-[340px] bg-white dark:bg-[#0f1d33] border border-slate-200 dark:border-[#1a2540] rounded-[12px] flex flex-col overflow-hidden shrink-0 shadow-sm transition-colors">
                <div className="px-4 py-3 border-b border-slate-200 dark:border-[#1a2540] bg-slate-50 dark:bg-[#070d1a]/50 flex items-center justify-between shrink-0 transition-colors">
                  <span className="text-[12px] font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                    <Package size={14} className="text-[#06b6d4]" /> Resultados ({transferenciasFiltradas.length})
                  </span>
                </div>
                
                <div className="flex-1 overflow-y-auto custom-scrollbar p-2.5 flex flex-col gap-2">
                  {transferenciasFiltradas.map((t: any) => {
                     const isInclusao = t.caf.startsWith('[INCLUSÃO]');
                     const cafLimpo = t.caf.replace('[INCLUSÃO] ', '');
                     const isSelected = selecionada?.id === t.id;
                     const progresso = calcularProgresso(t);
                     
                     return (
                        <div 
                          key={t.id} 
                          onClick={() => setSelecionada(t)} 
                          className={`w-full text-left p-3 rounded-[10px] cursor-pointer transition-colors border ${isSelected ? 'bg-slate-100 dark:bg-[#1a2540] border-[#f97316] shadow-sm' : 'bg-slate-50 dark:bg-[#0f1d33] border-slate-200 dark:border-[#1a2540] hover:bg-slate-100 dark:hover:bg-[#1a2540] hover:border-slate-300 dark:hover:border-[#253555]'}`}
                        >
                            <div className="flex justify-between items-start mb-2">
                              <span className={`font-mono font-black text-[13px] tracking-widest ${isSelected ? 'text-slate-800 dark:text-[#f1f5f9]' : 'text-slate-600 dark:text-[#94a3b8]'}`}>{cafLimpo}</span>
                              {isInclusao && <span className="text-[8px] bg-red-50 dark:bg-[#ef4444]/10 text-red-600 dark:text-[#ef4444] border border-red-200 dark:border-[#ef4444]/20 px-1.5 py-0.5 rounded font-black uppercase">Extra</span>}
                            </div>
                            
                            <div className="text-[11px] font-semibold text-slate-500 dark:text-[#6b7280] flex items-center gap-1.5 mb-2.5 truncate">
                               <MapPin size={12} className="text-[#06b6d4] shrink-0"/> {t.cidade}
                            </div>
                            
                            {/* MINI BARRA DE PROGRESSO NO CARD */}
                            <div className="w-full bg-slate-200 dark:bg-[#1a2540] h-[4px] rounded-full overflow-hidden mb-2.5">
                               <div className={`h-full transition-all duration-500 ${progresso === 100 ? 'bg-[#10b981]' : progresso >= 60 ? 'bg-[#3b82f6]' : 'bg-[#f97316]'}`} style={{ width: `${progresso}%` }}></div>
                            </div>

                            <span className={`text-[9px] px-2 py-1 rounded-[4px] font-black uppercase border inline-block ${getStatusColor(t.status)}`}>{t.status}</span>
                        </div>
                     )
                  })}
                  {transferenciasFiltradas.length === 0 && (
                     <div className="flex-1 flex flex-col items-center justify-center text-slate-400 dark:text-[#4b5563]">
                       <Barcode size={32} className="mb-2 opacity-30" />
                       <p className="font-bold text-[11px]">Nenhuma carga encontrada.</p>
                     </div>
                  )}
                </div>
            </div>

            {/* 3. PAINEL DIREITO: DETALHES DA CARGA E TIMELINE */}
            <div className="flex-1 bg-white dark:bg-[#0f1d33] border border-slate-200 dark:border-[#1a2540] rounded-[12px] flex flex-col overflow-hidden min-w-0 shadow-sm transition-colors">
                {!selecionada ? (
                  <div className="flex flex-col items-center justify-center h-full text-slate-400 dark:text-[#4b5563]">
                      <Map size={48} className="mb-4 opacity-20 text-[#06b6d4]" />
                      <h3 className="text-[14px] font-black uppercase tracking-widest text-slate-500 dark:text-[#6b7280]">Radar inativo</h3>
                      <p className="text-[11px] font-bold mt-1">Selecione uma carga na lista para rastreá-la.</p>
                  </div>
                ) : (
                  <div className="flex flex-col h-full animate-in fade-in duration-300">
                      
                      {/* HEADER DO DETALHE DA CARGA */}
                      <div className="bg-slate-50 dark:bg-[#070d1a] p-5 border-b-[3px] border-[#f97316] shrink-0 transition-colors">
                         <div className="flex justify-between items-start mb-3">
                            <div>
                               <p className="text-[9px] font-black text-[#06b6d4] uppercase tracking-widest mb-0.5 flex items-center gap-1.5"><Barcode size={12}/> Código Rastreio</p>
                               <h2 className="text-[26px] font-mono font-black tracking-widest text-slate-800 dark:text-[#f1f5f9] leading-none">{selecionada.caf.replace('[INCLUSÃO] ', '')}</h2>
                            </div>
                            <div className="text-right">
                               <p className="text-[9px] font-black text-slate-500 dark:text-[#6b7280] uppercase tracking-widest mb-0.5">Status Geral</p>
                               <span className={`text-[11px] px-2.5 py-1 rounded-md font-black uppercase border inline-block ${getStatusColor(selecionada.status)}`}>{selecionada.status}</span>
                            </div>
                         </div>
                         
                         <div className="grid grid-cols-4 gap-3 mt-4">
                            <div className="bg-white dark:bg-[#1a2540] border border-slate-200 dark:border-[#253555] rounded-[8px] p-2.5 shadow-sm dark:shadow-none transition-colors">
                               <p className="text-[8px] text-slate-400 dark:text-[#6b7280] font-black uppercase tracking-widest">Origem</p>
                               <p className="text-[11px] font-bold text-slate-700 dark:text-[#e2e8f0] flex items-center gap-1.5 mt-0.5 truncate"><Warehouse size={12} className="text-[#06b6d4]"/> Nordex</p>
                            </div>
                            <div className="bg-white dark:bg-[#1a2540] border border-slate-200 dark:border-[#253555] rounded-[8px] p-2.5 shadow-sm dark:shadow-none transition-colors">
                               <p className="text-[8px] text-slate-400 dark:text-[#6b7280] font-black uppercase tracking-widest">Destino</p>
                               <p className="text-[11px] font-bold text-slate-700 dark:text-[#e2e8f0] flex items-center gap-1.5 mt-0.5 truncate"><MapPin size={12} className="text-[#10b981]"/> {selecionada.cidade}</p>
                            </div>
                            <div className="bg-white dark:bg-[#1a2540] border border-slate-200 dark:border-[#253555] rounded-[8px] p-2.5 shadow-sm dark:shadow-none transition-colors">
                               <p className="text-[8px] text-slate-400 dark:text-[#6b7280] font-black uppercase tracking-widest">Empresa</p>
                               <p className="text-[11px] font-bold text-slate-700 dark:text-[#e2e8f0] flex items-center gap-1.5 mt-0.5 truncate"><Package size={12} className="text-[#f97316]"/> {selecionada.empresa}</p>
                            </div>
                            <div className="bg-white dark:bg-[#1a2540] border border-slate-200 dark:border-[#253555] rounded-[8px] p-2.5 shadow-sm dark:shadow-none transition-colors">
                               <p className="text-[8px] text-slate-400 dark:text-[#6b7280] font-black uppercase tracking-widest">Início</p>
                               <p className="text-[11px] font-bold text-slate-700 dark:text-[#e2e8f0] flex items-center gap-1.5 mt-0.5 truncate"><Calendar size={12} className="text-[#8b5cf6]"/> {new Date(selecionada.data_criacao || Date.now()).toLocaleDateString('pt-BR')}</p>
                            </div>
                         </div>
                      </div>

                      {/* BARRA DE PROGRESSO MACRO */}
                      <div className="px-8 py-4 bg-slate-50 dark:bg-[#0a1122] border-b border-slate-200 dark:border-[#1a2540] shrink-0 transition-colors">
                         <div className="flex justify-between text-[9px] font-black uppercase text-slate-400 dark:text-[#6b7280] tracking-widest mb-1.5">
                            <span className="text-[#f97316]">1. Doca (Triagem)</span>
                            <span className={calcularProgresso(selecionada) >= 60 ? 'text-[#3b82f6]' : ''}>2. Pátio (Conferência)</span>
                            <span className={calcularProgresso(selecionada) === 100 ? 'text-[#10b981]' : ''}>3. Em Trânsito</span>
                         </div>
                         <div className="w-full bg-slate-200 dark:bg-[#1a2540] h-[6px] rounded-full overflow-hidden relative shadow-inner">
                            <div className={`absolute top-0 left-0 h-full transition-all duration-700 ease-out ${calcularProgresso(selecionada) === 100 ? 'bg-[#10b981]' : calcularProgresso(selecionada) >= 60 ? 'bg-[#3b82f6]' : 'bg-[#f97316]'}`} style={{ width: `${calcularProgresso(selecionada)}%` }}></div>
                         </div>
                      </div>

                      {/* LINHA DO TEMPO VERTICAL */}
                      <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
                         <div className="relative pl-6 space-y-6 before:absolute before:inset-0 before:ml-[35px] before:h-full before:w-[2px] before:bg-slate-200 dark:before:bg-[#1a2540]">
                            
                            {/* PASSO 1: INCLUSÃO */}
                            <div className="relative flex items-center group">
                                <div className="flex items-center justify-center w-8 h-8 rounded-full border-[3px] border-white dark:border-[#0f1d33] bg-[#f97316] text-white shadow-sm absolute left-[-16px] shrink-0 z-10 transition-colors">
                                  <Package size={14} />
                                </div>
                                <div className="w-full ml-8 bg-slate-50 dark:bg-[#1a2540] p-4 rounded-[10px] border border-slate-200 dark:border-[#253555] relative transition-colors shadow-sm dark:shadow-none">
                                  <h4 className="font-black text-slate-800 dark:text-[#e2e8f0] text-[12px] uppercase mb-0.5">Carga Recebida na Doca</h4>
                                  <p className="text-[10px] font-bold text-slate-500 dark:text-[#6b7280] mb-3 flex items-center gap-1.5"><Clock size={12}/> {new Date(selecionada.data_criacao || Date.now()).toLocaleString('pt-BR')}</p>
                                  <div className="bg-white dark:bg-[#0f1d33] p-2.5 rounded-[6px] border border-slate-200 dark:border-[#1a2540] shadow-sm dark:shadow-none">
                                      <p className="text-[8px] uppercase font-black text-slate-400 dark:text-[#6b7280] mb-0.5">Processado por</p>
                                      <p className="text-[11px] font-bold text-slate-600 dark:text-[#94a3b8] flex items-center gap-1.5"><User size={13} className="text-[#f97316]"/> {selecionada.criador || 'Sistema Interno'}</p>
                                  </div>
                                </div>
                            </div>

                            {/* PASSO 2: CONFERÊNCIA */}
                            {(!selecionada.caf.startsWith('[INCLUSÃO]') && calcularProgresso(selecionada) >= 60) && (
                              <div className="relative flex items-center group">
                                  <div className="flex items-center justify-center w-8 h-8 rounded-full border-[3px] border-white dark:border-[#0f1d33] bg-[#3b82f6] text-white shadow-sm absolute left-[-16px] shrink-0 z-10 transition-colors">
                                    <ScanLine size={14} />
                                  </div>
                                  <div className="absolute left-[34px] top-[-24px] bottom-full w-[2px] bg-[#3b82f6] -z-0"></div>
                                  <div className="w-full ml-8 bg-slate-50 dark:bg-[#1a2540] p-4 rounded-[10px] border border-slate-200 dark:border-[#253555] relative transition-colors shadow-sm dark:shadow-none">
                                    <h4 className="font-black text-slate-800 dark:text-[#e2e8f0] text-[12px] uppercase mb-0.5">Conferência no Pátio</h4>
                                    <p className="text-[10px] font-bold text-slate-500 dark:text-[#6b7280] mb-3">Validação de volumes e leitura de etiquetas.</p>
                                    <div className="bg-white dark:bg-[#0f1d33] p-2.5 rounded-[6px] border border-slate-200 dark:border-[#1a2540] shadow-sm dark:shadow-none">
                                        <p className="text-[8px] uppercase font-black text-slate-400 dark:text-[#6b7280] mb-0.5">Conferente Responsável</p>
                                        <p className="text-[11px] font-bold text-slate-600 dark:text-[#94a3b8] flex items-center gap-1.5"><ScanLine size={13} className="text-[#3b82f6]"/> {selecionada.conferente || 'Equipe Nordex'}</p>
                                    </div>
                                  </div>
                              </div>
                            )}

                            {/* PASSO 3: DESPACHO */}
                            {(calcularProgresso(selecionada) === 100) && (
                              <div className="relative flex items-center group">
                                  <div className="flex items-center justify-center w-8 h-8 rounded-full border-[3px] border-white dark:border-[#0f1d33] bg-[#10b981] text-white shadow-sm absolute left-[-16px] shrink-0 z-10 transition-colors">
                                    <Truck size={14} />
                                  </div>
                                  <div className="absolute left-[34px] top-[-24px] bottom-full w-[2px] bg-[#10b981] -z-0"></div>
                                  <div className="w-full ml-8 bg-emerald-50 dark:bg-[#10b981]/10 p-4 rounded-[10px] border border-emerald-200 dark:border-[#10b981]/30 relative transition-colors shadow-sm dark:shadow-none">
                                    <h4 className="font-black text-emerald-600 dark:text-[#10b981] text-[12px] uppercase mb-0.5 flex items-center gap-1.5">Mercadoria em Trânsito <CheckCircle2 size={14}/></h4>
                                    <p className="text-[10px] font-bold text-emerald-700/70 dark:text-[#10b981]/70 mb-3">Carga despachada e vinculada ao motorista.</p>
                                    <div className="bg-white dark:bg-[#0f1d33]/50 p-2.5 rounded-[6px] border border-emerald-100 dark:border-[#10b981]/20 shadow-sm dark:shadow-none">
                                        <div className="grid grid-cols-2 gap-3">
                                           <div>
                                              <p className="text-[8px] uppercase font-black text-emerald-600/50 dark:text-[#10b981]/50 mb-0.5">Liberado Por</p>
                                              <p className="text-[11px] font-bold text-emerald-700 dark:text-[#10b981] flex items-center gap-1.5"><User size={12}/> {selecionada.liberador || 'Expedição'}</p>
                                           </div>
                                           <div>
                                              <p className="text-[8px] uppercase font-black text-emerald-600/50 dark:text-[#10b981]/50 mb-0.5">Motorista Vinculado</p>
                                              <p className="text-[11px] font-bold text-emerald-700 dark:text-[#10b981] flex items-center gap-1.5"><Truck size={12}/> {selecionada.motorista_saida || selecionada.entregador}</p>
                                           </div>
                                        </div>
                                    </div>
                                  </div>
                              </div>
                            )}

                            {/* PASSO PENDENTE */}
                            {calcularProgresso(selecionada) < 100 && (
                               <div className="relative flex items-center group opacity-40">
                                   <div className="flex items-center justify-center w-5 h-5 rounded-full border-[3px] border-white dark:border-[#0f1d33] bg-slate-300 dark:bg-[#253555] absolute left-[-10px] shrink-0 z-10 transition-colors"></div>
                                   <div className="w-full ml-8 py-2">
                                     <h4 className="font-bold text-slate-500 dark:text-[#6b7280] text-[11px] uppercase transition-colors">Aguardando próximas etapas...</h4>
                                   </div>
                               </div>
                            )}

                         </div>
                      </div>
                  </div>
                )}
            </div>

          </div>
        )}
      </div>
    </Layout>
  );
}