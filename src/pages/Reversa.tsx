import React, { useState, useEffect } from 'react';
import Layout from "../components/Layout";
import { 
  Undo2, PackageX, AlertCircle, CheckCircle, Search, 
  RefreshCcw, ArrowRightLeft, Truck, PackageCheck, Filter, ChevronRight
} from 'lucide-react';

export default function Reversa() {
  const [isDark, setIsDark] = useState(document.documentElement.classList.contains('dark'));
  const [busca, setBusca] = useState("");
  const [filtroStatus, setFiltroStatus] = useState("TODOS");

  // Dados Simulados (Até você criar o endpoint no Java)
  const [devolucoes, setDevolucoes] = useState([
    { id: 1, caf: "CAF-99281", motorista: "ALAN KARLSON", motivo: "Cliente Ausente (3ª Tentativa)", status: "Aguardando Pátio", data: "15/05/2026 14:30" },
    { id: 2, caf: "CAF-88120", motorista: "JOSIAS TELES", motivo: "Endereço Não Localizado", status: "No Pátio", data: "16/05/2026 09:15" },
    { id: 3, caf: "CAF-77123", motorista: "EDMILSON ARAUJO", motivo: "Avaria no Transporte", status: "Devolvido Origem", data: "16/05/2026 10:00" },
    { id: 4, caf: "CAF-11234", motorista: "MARCIO BISPO", motivo: "Recusado pelo Recebedor", status: "Aguardando Pátio", data: "16/05/2026 11:45" },
  ]);

  useEffect(() => {
    const handleThemeChange = () => setIsDark(document.documentElement.classList.contains('dark'));
    window.addEventListener('themeChange', handleThemeChange);
    return () => window.removeEventListener('themeChange', handleThemeChange);
  }, []);

  // Função Simples de Ação
  const receberNoPatio = (id: number) => {
    setDevolucoes(prev => prev.map(d => d.id === id ? { ...d, status: "No Pátio" } : d));
  };

  const devolverOrigem = (id: number) => {
    setDevolucoes(prev => prev.map(d => d.id === id ? { ...d, status: "Devolvido Origem" } : d));
  };

  // KPIs
  const aguardando = devolucoes.filter(d => d.status === "Aguardando Pátio").length;
  const noPatio = devolucoes.filter(d => d.status === "No Pátio").length;
  const devolvidos = devolucoes.filter(d => d.status === "Devolvido Origem").length;

  const linhasFiltradas = devolucoes.filter(d => {
    const matchBusca = d.caf.toLowerCase().includes(busca.toLowerCase()) || d.motorista.toLowerCase().includes(busca.toLowerCase());
    const matchStatus = filtroStatus === "TODOS" || d.status === filtroStatus;
    return matchBusca && matchStatus;
  });

  return (
    <Layout titulo="Logística Reversa">
      <style>
        {`
          .custom-scrollbar::-webkit-scrollbar { width: 4px; height: 4px; }
          .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
          .custom-scrollbar::-webkit-scrollbar-thumb { background: #253555; border-radius: 4px; }
          .content-grid { display: flex; flex-direction: column; gap: 14px; width: 100%; height: 100%; }
          .banner-box { background: ${isDark ? '#0f1d33' : '#ffffff'}; border: 1px solid ${isDark ? '#1a2540' : '#e2e8f0'}; border-radius: 12px; padding: 20px; display: flex; align-items: center; justify-content: space-between; gap: 20px; flex-shrink: 0; position: relative; overflow: hidden; }
          .kpi-card { background: ${isDark ? '#0f1d33' : '#ffffff'}; border: 1px solid ${isDark ? '#1a2540' : '#e2e8f0'}; border-radius: 12px; padding: 16px; flex: 1; min-width: 0; display: flex; items-center; gap: 14px; }
        `}
      </style>

      <div className="content-grid">
        
        {/* BANNER SUPERIOR */}
        <div className="banner-box shadow-sm transition-colors">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#ef4444] opacity-5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
          
          <div className="flex items-center gap-4 z-10">
            <div className="w-[56px] h-[56px] bg-slate-50 dark:bg-[#1a2540] border border-slate-200 dark:border-[#253555] rounded-[10px] flex items-center justify-center shrink-0 transition-colors">
              <Undo2 size={24} className="text-[#ef4444]" />
            </div>
            <div>
              <h2 className="text-[18px] font-black text-slate-800 dark:text-[#f1f5f9] uppercase tracking-tight leading-tight">Logística Reversa</h2>
              <p className="text-[11px] font-medium text-slate-500 dark:text-[#94a3b8] mt-0.5 hidden md:block">Gestão de insucessos, avarias e retornos ao embarcador.</p>
            </div>
          </div>
        </div>

        {/* KPIs */}
        <div className="flex gap-[14px] shrink-0">
           <div className="kpi-card shadow-sm transition-colors">
              <div className="w-10 h-10 rounded-[8px] bg-[#f59e0b]/10 flex items-center justify-center text-[#f59e0b] shrink-0 border border-[#f59e0b]/20"><AlertCircle size={18}/></div>
              <div>
                <p className="text-[9px] font-black uppercase tracking-widest text-slate-500 dark:text-[#6b7280]">Aguardando Pátio</p>
                <h3 className="text-[18px] font-black text-slate-800 dark:text-[#f1f5f9] leading-tight mt-0.5">{aguardando}</h3>
              </div>
           </div>
           
           <div className="kpi-card shadow-sm transition-colors">
              <div className="w-10 h-10 rounded-[8px] bg-[#3b82f6]/10 flex items-center justify-center text-[#3b82f6] shrink-0 border border-[#3b82f6]/20"><WarehouseIcon size={18}/></div>
              <div>
                <p className="text-[9px] font-black uppercase tracking-widest text-slate-500 dark:text-[#6b7280]">Estocados (Reversa)</p>
                <h3 className="text-[18px] font-black text-slate-800 dark:text-[#f1f5f9] leading-tight mt-0.5">{noPatio}</h3>
              </div>
           </div>

           <div className="kpi-card shadow-sm transition-colors">
              <div className="w-10 h-10 rounded-[8px] bg-[#10b981]/10 flex items-center justify-center text-[#10b981] shrink-0 border border-[#10b981]/20"><PackageCheck size={18}/></div>
              <div>
                <p className="text-[9px] font-black uppercase tracking-widest text-slate-500 dark:text-[#6b7280]">Devolvidos Origem</p>
                <h3 className="text-[18px] font-black text-slate-800 dark:text-[#f1f5f9] leading-tight mt-0.5">{devolvidos}</h3>
              </div>
           </div>
        </div>

        {/* CONTROLES */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 shrink-0 mt-2">
          <div className="flex items-center bg-white dark:bg-[#0f1d33] border border-slate-200 dark:border-[#1a2540] rounded-[8px] overflow-hidden shadow-sm transition-colors w-full md:w-auto">
            <div className="px-3 py-2 border-r border-slate-200 dark:border-[#1a2540] bg-slate-50 dark:bg-[#1a2540]/30"><Filter size={14} className="text-slate-400 dark:text-[#6b7280]"/></div>
            <select value={filtroStatus} onChange={(e) => setFiltroStatus(e.target.value)} className="bg-transparent border-none text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-[#94a3b8] px-3 py-2 outline-none cursor-pointer flex-1">
                <option value="TODOS">Todos os Status</option>
                <option value="Aguardando Pátio">Aguardando Pátio</option>
                <option value="No Pátio">No Pátio</option>
                <option value="Devolvido Origem">Devolvido Origem</option>
            </select>
          </div>

          <div className="relative w-full md:w-[300px]">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-[#6b7280]" />
            <input type="text" value={busca} onChange={e=>setBusca(e.target.value)} placeholder="Pesquisar CAF ou Motorista..." className="w-full bg-white dark:bg-[#0f1d33] border border-slate-200 dark:border-[#1a2540] text-slate-800 dark:text-[#e2e8f0] px-3 py-2 pl-9 rounded-[8px] outline-none focus:border-[#ef4444] transition-colors text-[11px] font-bold shadow-sm"/>
          </div>
        </div>

        {/* TABELA */}
        <div className="flex-1 bg-white dark:bg-[#0f1d33] border border-slate-200 dark:border-[#1a2540] rounded-[12px] shadow-sm overflow-hidden flex flex-col min-h-0 transition-colors">
          <div className="flex-1 overflow-auto custom-scrollbar">
            <table className="w-full text-left min-w-[900px] border-collapse">
              <thead className="sticky top-0 z-20 bg-slate-50 dark:bg-[#070d1a] border-b border-slate-200 dark:border-[#1a2540] shadow-sm">
                <tr className="text-slate-500 dark:text-[#6b7280] text-[9px] uppercase font-black tracking-widest">
                  <th className="px-5 py-3">Código CAF</th>
                  <th className="px-3 py-3">Motorista Retornando</th>
                  <th className="px-3 py-3">Motivo Insucesso</th>
                  <th className="px-3 py-3">Data/Hora</th>
                  <th className="px-3 py-3 text-center">Status</th>
                  <th className="px-5 py-3 text-center">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-[#1a2540]">
                {linhasFiltradas.length === 0 ? (
                   <tr><td colSpan={6} className="text-center py-10 text-slate-400 dark:text-[#6b7280] font-bold text-[11px]">Nenhuma reversa encontrada.</td></tr>
                ) : (
                  linhasFiltradas.map((item) => (
                    <tr key={item.id} className="transition-colors group hover:bg-slate-50 dark:hover:bg-[#1a2540]/30">
                      <td className="px-5 py-3 font-mono font-bold text-slate-800 dark:text-[#e2e8f0] text-[12px]">{item.caf}</td>
                      <td className="px-3 py-3 text-[11px] font-bold text-slate-600 dark:text-[#94a3b8]">{item.motorista}</td>
                      <td className="px-3 py-3 text-[11px] font-semibold text-slate-500 dark:text-[#6b7280]">{item.motivo}</td>
                      <td className="px-3 py-3 text-[10px] font-bold text-slate-500 dark:text-[#6b7280]">{item.data}</td>
                      <td className="px-3 py-3 text-center">
                        <span className={`px-2 py-1 rounded-[4px] text-[9px] font-black uppercase tracking-widest border ${
                          item.status === 'Aguardando Pátio' ? 'bg-[#f59e0b]/10 text-[#f59e0b] border-[#f59e0b]/20' :
                          item.status === 'No Pátio' ? 'bg-[#3b82f6]/10 text-[#3b82f6] border-[#3b82f6]/20' :
                          'bg-[#10b981]/10 text-[#10b981] border-[#10b981]/20'
                        }`}>
                          {item.status}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-center">
                        <div className="flex items-center justify-center gap-2">
                          {item.status === 'Aguardando Pátio' && (
                            <button onClick={() => receberNoPatio(item.id)} className="px-3 py-1.5 bg-[#3b82f6] hover:bg-blue-600 text-white rounded-[6px] text-[9px] font-black uppercase tracking-widest shadow-sm transition-colors flex items-center gap-1"><ArrowRightLeft size={12}/> Receber</button>
                          )}
                          {item.status === 'No Pátio' && (
                            <button onClick={() => devolverOrigem(item.id)} className="px-3 py-1.5 bg-[#10b981] hover:bg-emerald-600 text-white rounded-[6px] text-[9px] font-black uppercase tracking-widest shadow-sm transition-colors flex items-center gap-1"><Truck size={12}/> Devolver Embarcador</button>
                          )}
                          {item.status === 'Devolvido Origem' && (
                            <span className="text-[10px] font-bold text-slate-400 dark:text-[#6b7280]"><CheckCircle size={14} className="inline mr-1"/> Baixado</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </Layout>
  );
}

// Icone extra pro WMS (já que a Lucide não exporta diretamente "Warehouse" no import padrão as vezes, usamos esse hack ou garantimos que a importação funciona)
const WarehouseIcon = ({ size, className }: { size?: number, className?: string }) => (
  <svg width={size || 24} height={size || 24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M22 8.35V20a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8.35A2 2 0 0 1 3.26 6.5l8-3.2a2 2 0 0 1 1.48 0l8 3.2A2 2 0 0 1 22 8.35Z"/><path d="M6 18h12"/><path d="M6 14h12"/><rect width="12" height="12" x="6" y="10"/></svg>
);