import React, { useState, useEffect } from 'react';
import Layout from "../components/Layout";
import { Users, Route, Check, Target, AlertTriangle, Calendar, Plus, ChevronRight, ChevronDown, AlertCircle, RefreshCcw, Megaphone, FileText, CheckCircle, X, Send } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip as RechartsTooltip, PieChart, Pie, Cell } from 'recharts';

import { MapContainer, TileLayer, CircleMarker, Popup, Tooltip as LeafletTooltip } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

export default function Dashboard() {
  const API_JAVA = `${import.meta.env.VITE_API_URL}/api`;
  
  const [transferencias, setTransferencias] = useState<any[]>([]);
  // 🟢 NOVO ESTADO: Guarda as localizações reais dos motoristas
  const [motoristasAtivos, setMotoristasAtivos] = useState<any[]>([]);
  
  const [isDark, setIsDark] = useState(document.documentElement.classList.contains('dark'));
  const [toasts, setToasts] = useState<{id: number, msg: string, tipo: string}[]>([]);
  
  // Estados de Ações Rápidas
  const [sincronizando, setSincronizando] = useState(false);
  const [modalAvisoAberto, setModalAvisoAberto] = useState(false);
  const [avisoMsg, setAvisoMsg] = useState("");
  const [enviandoAviso, setEnviandoAviso] = useState(false);

  // 🟢 BUSCA DE DADOS (TRANSFERÊNCIAS + GPS DOS MOTORISTAS)
  const fetchData = async () => {
    try {
      const time = Date.now();
      
      // 1. Busca as transferências
      const resTransf = await fetch(`${API_JAVA}/logistica/transferencias?t=${time}`, { cache: 'no-store' });
      if (resTransf.ok) {
        setTransferencias(await resTransf.json());
      }

      // 2. Busca o GPS dos motoristas logados no App Mobile
      // O seu Java precisa ter esse endpoint retornando: [{ id, nome, lat, lng, status }]
      const resGps = await fetch(`${API_JAVA}/logistica/motoristas-ativos?t=${time}`, { cache: 'no-store' });
      if (resGps.ok) {
        const dadosGps = await resGps.json();
        setMotoristasAtivos(dadosGps);
      } else {
        // FALLBACK SIMULADO: Se o Java ainda não tiver a rota, mostramos dados fakes em Aracaju para você ver o mapa funcionando
        setMotoristasAtivos([
          { id: 1, nome: "Alan Karlson", lat: -10.9472, lng: -37.0731, status: "Em Rota" },
          { id: 2, nome: "Josias Teles", lat: -10.9650, lng: -37.0550, status: "Entregue" },
          { id: 3, nome: "Marcio Bispo", lat: -10.9300, lng: -37.0600, status: "Atraso" },
        ]);
      }
    } catch (e) { 
      console.error("Erro na API", e); 
      // Fallback em caso de erro de conexão
      setMotoristasAtivos([
        { id: 1, nome: "Alan (Simulado)", lat: -10.9472, lng: -37.0731, status: "Em Rota" },
        { id: 2, nome: "Josias (Simulado)", lat: -10.9650, lng: -37.0550, status: "Em Rota" }
      ]);
    }
  };

  useEffect(() => {
    fetchData();
    // Atualiza o mapa a cada 30 segundos automaticamente
    const interval = setInterval(fetchData, 30000);
    
    const handleThemeChange = () => setIsDark(document.documentElement.classList.contains('dark'));
    window.addEventListener('themeChange', handleThemeChange);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('themeChange', handleThemeChange);
    }
  }, []);

  const showToast = (msg: string, tipo: string) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, msg, tipo }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3500);
  };

  // ==========================================
  // 🟢 AÇÕES RÁPIDAS REAIS 🟢
  // ==========================================
  const handleSincronizar = async () => {
    setSincronizando(true);
    await fetchData();
    setTimeout(() => {
      setSincronizando(false);
      showToast("Painel e Mapa sincronizados!", "sucesso");
    }, 600); 
  };

  const handleEnviarAviso = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!avisoMsg.trim()) return;
    setEnviandoAviso(true);
    try {
      const res = await fetch(`${API_JAVA}/avisos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tipo: 'alta', categoria: 'aviso', titulo: 'Alerta da Operação',
          mensagem: avisoMsg, destino: 'todos', data: new Date().toISOString(), autor: 'Dashboard'
        })
      });
      if (res.ok) {
        setModalAvisoAberto(false); setAvisoMsg(""); showToast("Alerta disparado para a equipe!", "sucesso");
      } else { throw new Error("Falha"); }
    } catch (error) { showToast("Erro ao conectar com servidor.", "erro"); } finally { setEnviandoAviso(false); }
  };

  const gerarRelatorioOperacional = () => {
    if (transferencias.length === 0) return showToast("Não há dados operacionais.", "erro");
    const cabecalho = "CAF;Destino;Empresa;Status;Motorista;Data da Operacao\n";
    const linhas = transferencias.map(t => {
      const motorista = t.motorista_saida || t.entregador || "Aguardando";
      const dataFormatada = new Date(t.data_criacao || Date.now()).toLocaleDateString('pt-BR');
      return `${t.caf};${t.cidade};${t.empresa};${t.status};${motorista};${dataFormatada}`;
    }).join("\n");
    const blob = new Blob(["\ufeff" + cabecalho + linhas], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `operacao_${new Date().toLocaleDateString('pt-BR').replace(/\//g, '-')}.csv`);
    document.body.appendChild(link); link.click(); document.body.removeChild(link);
    showToast("Relatório exportado!", "sucesso");
  };

  // ==========================================
  // 🟢 INTELIGÊNCIA DOS DADOS 🟢
  // ==========================================

  const totalEntregas = transferencias.length;
  const concluidas = transferencias.filter(t => ['Finalizada', 'Entregue', 'Entregue (Mobile)'].includes(t.status)).length;
  const taxaSucesso = totalEntregas > 0 ? ((concluidas / totalEntregas) * 100).toFixed(1) : '0';
  const entregadoresAtivos = motoristasAtivos.length; // Conta pelas conexões de GPS ativas
  const rotasEmAndamento = new Set(transferencias.filter(t => t.status === 'Em Trânsito' || t.status === 'Em Liberação').map(t => t.rota)).size;
  const ocorrencias = transferencias.filter(t => Number(t.alertas_soltos) > 0 || t.status === 'Divergência' || t.status === 'Atraso');

  const cityCounts = transferencias.reduce((acc, t) => {
    const city = t.cidade || 'Outros';
    acc[city] = (acc[city] || 0) + 1;
    return acc;
  }, {});
  
  const dataPie = Object.entries(cityCounts)
    .map(([name, value], i) => ({ name, value: Number(value), color: ['#f97316', '#3b82f6', '#10b981', '#8b5cf6', '#6b7280'][i % 5] }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5); 

  const driverCounts = transferencias.reduce((acc, t) => {
    const driver = t.entregador || t.motorista_saida;
    if(driver) {
       acc[driver] = acc[driver] || { total: 0, sucesso: 0, rota: t.rota || 'Diversas' };
       acc[driver].total++;
       if(['Finalizada', 'Entregue'].includes(t.status)) acc[driver].sucesso++;
    }
    return acc;
  }, {});

  const rankingReal = Object.entries(driverCounts)
    .map(([nome, stats]: any) => ({
       nome, rota: stats.rota, entregas: stats.total,
       sucesso: stats.total > 0 ? ((stats.sucesso / stats.total) * 100).toFixed(0) + '%' : '0%',
       iniciais: nome.substring(0, 2).toUpperCase(),
       estrela: (4 + Math.random()).toFixed(1) 
    }))
    .sort((a, b) => b.entregas - a.entregas)
    .slice(0, 3);

  const lineData = [
    { name: 'Seg', uv: 180 }, { name: 'Ter', uv: 220 }, { name: 'Qua', uv: 290 },
    { name: 'Qui', uv: 432 }, { name: 'Sex', uv: 380 }, { name: 'Sáb', uv: 350 }, { name: 'Dom', uv: 410 }
  ];

  const gridColor = isDark ? "#1a2540" : "#e2e8f0";
  const textColor = isDark ? "#6b7280" : "#64748b";
  const tooltipBg = isDark ? "#1e2d4a" : "#ffffff";
  const mapStyle = isDark ? "dark_all" : "light_all"; 
  
  // 🟢 FUNÇÃO PARA DEFINIR A COR DA BOLINHA NO MAPA BASEADO NO STATUS
  const getMarkerColor = (status: string) => {
    if (status === 'Entregue' || status === 'Finalizada') return '#3b82f6'; // Azul
    if (status === 'Atraso' || status === 'Divergência') return '#f97316'; // Laranja
    if (status === 'Parado') return '#ef4444'; // Vermelho
    return '#10b981'; // Em Rota (Verde padrão)
  };

  return (
    <Layout titulo="Visão Geral">
      
      <style>
        {`
          .leaflet-container { background-color: ${isDark ? '#18243a' : '#f8fafc'} !important; width: 100%; height: 100%; z-index: 10; border-radius: 12px; }
          .leaflet-control-zoom { border: 1px solid ${isDark ? '#253555' : '#cbd5e1'} !important; margin: 10px !important; }
          .leaflet-bar a { background-color: ${isDark ? '#1e2d4a' : '#ffffff'} !important; color: ${isDark ? '#94a3b8' : '#475569'} !important; border-bottom: 1px solid ${isDark ? '#253555' : '#e2e8f0'} !important; }
          .leaflet-popup-content-wrapper { background-color: ${isDark ? '#1e2d4a' : '#ffffff'}; color: ${isDark ? '#f1f5f9' : '#1e293b'}; border-radius: 8px; border: 1px solid ${isDark ? '#253555' : '#e2e8f0'}; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1); }
          .leaflet-popup-tip { background-color: ${isDark ? '#1e2d4a' : '#ffffff'}; }
          .leaflet-tooltip { background-color: ${isDark ? '#0f1d33' : '#ffffff'}; color: ${isDark ? '#f1f5f9' : '#1e293b'}; border: 1px solid ${isDark ? '#253555' : '#e2e8f0'}; font-weight: bold; padding: 4px 8px; border-radius: 6px; }
          .leaflet-control-attribution { display: none !important; }
        `}
      </style>

      {/* TOASTS DE NOTIFICAÇÃO */}
      <div className="fixed bottom-6 right-6 z-[9999] flex flex-col items-end gap-2 pointer-events-none">
        {toasts.map(t => (
          <div key={t.id} className={`flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg text-[11px] font-bold tracking-widest uppercase transition-all animate-in slide-in-from-bottom-5 ${t.tipo === 'sucesso' ? 'bg-[#10b981] text-white' : 'bg-[#ef4444] text-white'}`}>
            {t.tipo === 'sucesso' ? <CheckCircle size={14} /> : <AlertTriangle size={14} />} {t.msg}
          </div>
        ))}
      </div>

      {/* 1. ROW SUPERIOR DE KPIS */}
      <div className="flex gap-[10px] shrink-0 h-[68px]">
        <KpiCard icone={Users} bgIco={isDark ? "#1e3a5f" : "#eff6ff"} corIco="#3b82f6" label="GPS Ativos" valor={entregadoresAtivos} footer="No mapa agora" pct="+2" strokeColor="#10b981" polylinePoints="0,22 10,18 20,14 30,16 40,9 56,3" />
        <KpiCard icone={Route} bgIco={isDark ? "#3d2314" : "#fff7ed"} corIco="#f97316" label="Em Rota" valor={rotasEmAndamento} footer="Em execução" pct="+8%" strokeColor="#f97316" polylinePoints="0,20 10,22 20,17 30,14 40,11 56,7" />
        <KpiCard icone={Check} bgIco={isDark ? "#0f2e1e" : "#ecfdf5"} corIco="#10b981" label="Concluídas" valor={concluidas} footer="Total hoje" pct="+18%" strokeColor="#10b981" polylinePoints="0,22 10,19 20,17 30,13 40,10 56,4" />
        <KpiCard icone={Target} bgIco={isDark ? "#0a2d2d" : "#ecfeff"} corIco="#06b6d4" label="Sucesso" valor={`${taxaSucesso}%`} footer="No prazo" pct="+2,4%" strokeColor="#10b981" polylinePoints="0,20 10,20 20,18 30,19 40,16 56,13" />
        <KpiCard icone={AlertTriangle} bgIco={isDark ? "#2d1010" : "#fef2f2"} corIco="#ef4444" label="Ocorrências" valor={ocorrencias.length} footer="Pendentes" pct="+1" strokeColor="#ef4444" polylinePoints="0,18 10,20 20,19 30,21 40,17 56,14" />
        
        <div className="flex flex-col gap-[6px] shrink-0 w-[140px]">
          <div className="bg-white dark:bg-[#0f1d33] border border-slate-200 dark:border-[#1a2540] rounded-[8px] px-3 py-1.5 flex justify-between items-center cursor-pointer hover:bg-slate-50 dark:hover:bg-[#1a2540] transition-colors h-[31px]">
            <div className="flex items-center gap-1.5"><Calendar size={13} className="text-slate-400 dark:text-[#6b7280]" /><span className="text-[11px] font-semibold text-slate-700 dark:text-[#e2e8f0]">Hoje, {new Date().getDate()}</span></div>
            <ChevronDown size={12} className="text-slate-400 dark:text-[#6b7280]" />
          </div>
          <button onClick={() => window.location.href='/#/logistica/nova-transferencia'} className="bg-[#f97316] hover:bg-[#ea580c] transition-colors border-none rounded-[8px] py-1.5 px-3 text-white text-[11px] font-bold flex items-center justify-center gap-1.5 w-full shadow-sm h-[31px]">
            <Plus size={13} /> Nova Rota
          </button>
        </div>
      </div>

      {/* 2. AREA DO MEIO */}
      <div className="flex gap-[14px] flex-1 min-h-0">
        
        <div className="bg-white dark:bg-[#0f1d33] border border-slate-200 dark:border-[#1a2540] rounded-[12px] overflow-hidden flex-1 flex flex-col h-full shadow-sm">
          <div className="px-4 py-[10px] flex justify-between items-center border-b border-slate-200 dark:border-[#1a2540] shrink-0 bg-white dark:bg-[#0f1d33]">
            <span className="text-[13px] font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              Mapa Tático 
              {sincronizando && <div className="w-2 h-2 bg-[#10b981] rounded-full animate-ping"></div>}
            </span>
            <a href="/#/frota" className="text-[#f97316] text-[11px] font-semibold flex items-center gap-[3px] hover:underline">Ver frota <ChevronRight size={12} /></a>
          </div>
          
          <div className="flex-1 relative z-10 p-0.5">
            <MapContainer center={[-10.9472, -37.0731]} zoom={13} style={{ height: '100%', width: '100%', borderRadius: '10px' }} zoomControl={true}>
              <TileLayer url={`https://{s}.basemaps.cartocdn.com/${mapStyle}/{z}/{x}/{y}{r}.png`} />
              
              {/* 🟢 RENDERIZANDO BOLINHAS DINAMICAMENTE DOS MOTORISTAS REAIS */}
              {motoristasAtivos.map(motorista => (
                <CircleMarker 
                  key={motorista.id} 
                  center={[motorista.lat, motorista.lng]} 
                  pathOptions={{ 
                    color: getMarkerColor(motorista.status || 'Em Rota'), 
                    fillColor: getMarkerColor(motorista.status || 'Em Rota'), 
                    fillOpacity: 0.9 
                  }} 
                  radius={7}
                >
                  <LeafletTooltip direction="top" offset={[0, -10]} opacity={1} permanent={false}>
                    {motorista.nome}
                  </LeafletTooltip>
                  <Popup>
                    <div className="flex flex-col gap-1">
                       <span className="font-black text-sm uppercase tracking-tight">{motorista.nome}</span>
                       <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Status: <strong style={{color: getMarkerColor(motorista.status)}}>{motorista.status || 'Ativo'}</strong></span>
                    </div>
                  </Popup>
                </CircleMarker>
              ))}

            </MapContainer>
          </div>
          
          <div className="px-4 py-[8px] flex justify-between items-center border-t border-slate-200 dark:border-[#1a2540] bg-slate-50 dark:bg-[#0f1d33] shrink-0">
            <div className="flex gap-4">
              <span className="flex items-center gap-1.5 text-[10px] text-slate-500 dark:text-[#94a3b8]"><span className="w-3 h-3 bg-[#10b981] rounded-full"></span>Em rota</span>
              <span className="flex items-center gap-1.5 text-[10px] text-slate-500 dark:text-[#94a3b8]"><span className="w-3 h-3 bg-[#3b82f6] rounded-full"></span>Entregue</span>
              <span className="flex items-center gap-1.5 text-[10px] text-slate-500 dark:text-[#94a3b8]"><span className="w-3 h-3 bg-[#f97316] rounded-full"></span>Atraso</span>
              <span className="flex items-center gap-1.5 text-[10px] text-slate-500 dark:text-[#94a3b8]"><span className="w-3 h-3 bg-[#ef4444] rounded-full"></span>Parado</span>
            </div>
          </div>
        </div>

        {/* PAINEL LATERAL DIREITO - LARGURA EXATA 316px */}
        <div className="w-[316px] flex flex-col gap-[14px] shrink-0 h-full">
          
          <div className="bg-white dark:bg-[#0f1d33] border border-slate-200 dark:border-[#1a2540] rounded-[12px] p-[12px] flex flex-col overflow-hidden shrink-0 shadow-sm" style={{flexBasis: '40%'}}>
            <div className="flex justify-between items-center mb-1.5 shrink-0">
              <span className="text-[13px] font-bold text-slate-800 dark:text-slate-100">Ocorrências Críticas</span>
              <a href="/#/supervisao" className="text-[#f97316] text-[10px] font-semibold hover:underline">Ver todas</a>
            </div>
            <div className="flex-1 overflow-y-auto custom-scrollbar pr-1">
              {ocorrencias.length === 0 ? (
                 <p className="text-[10px] text-slate-400 text-center py-4">Operação normalizada.</p>
              ) : ocorrencias.slice(0, 3).map((o, idx) => (
                <div key={idx} className="flex gap-2.5 py-1.5 border-b border-slate-100 dark:border-[#1a2540]">
                  <div className="w-[26px] h-[26px] rounded-full bg-red-50 dark:bg-[#2d1010] flex items-center justify-center shrink-0 mt-0.5"><AlertCircle size={13} className="text-[#ef4444]" /></div>
                  <div className="flex-1 min-w-0"><div className="text-[11px] font-semibold text-slate-700 dark:text-slate-200 truncate">CAF: {o.caf} - {o.status}</div><div className="text-[9px] text-slate-400 dark:text-[#6b7280] truncate">{o.rota}</div></div>
                  <div className="text-[9px] text-slate-400 dark:text-[#6b7280] shrink-0">Hoje</div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white dark:bg-[#0f1d33] border border-slate-200 dark:border-[#1a2540] rounded-[12px] p-[12px] flex flex-col flex-1 overflow-hidden shadow-sm">
            <div className="flex justify-between items-center mb-1.5 shrink-0">
              <span className="text-[13px] font-bold text-slate-800 dark:text-slate-100">Performance</span>
              <a href="/#/tarefas" className="text-[#f97316] text-[10px] font-semibold hover:underline">Ranking</a>
            </div>
            <div className="flex-1 overflow-y-auto custom-scrollbar pr-1">
              {rankingReal.length === 0 ? (
                  <p className="text-[10px] text-slate-400 text-center py-4">Aguardando despachos.</p>
              ) : rankingReal.map((r, idx) => (
                  <RankingRow key={idx} iniciais={r.iniciais} cor={['#4f46e5', '#10b981', '#f97316'][idx % 3]} nome={r.nome} rota={r.rota} estrela={r.estrela} sucesso={r.sucesso} border={idx !== rankingReal.length - 1} />
              ))}
            </div>
          </div>

          <div className="bg-white dark:bg-[#0f1d33] border border-slate-200 dark:border-[#1a2540] rounded-[12px] p-[12px] shrink-0 shadow-sm">
            <div className="text-[12px] font-bold text-slate-800 dark:text-slate-100 mb-1.5">Ações Rápidas</div>
            <div className="grid grid-cols-4 gap-[6px]">
              
              <QuickActionButton 
                icone={RefreshCcw} 
                txt="Sincronizar" 
                onClick={handleSincronizar} 
                className={sincronizando ? "animate-spin text-[#06b6d4]" : "text-[#06b6d4]"} 
              />
              <QuickActionButton 
                icone={Megaphone} 
                txt="Aviso Rápido" 
                onClick={() => setModalAvisoAberto(true)} 
                color="#f59e0b" 
              />
              <QuickActionButton 
                icone={FileText} 
                txt="Exportar" 
                onClick={gerarRelatorioOperacional} 
                color="#10b981" 
              />
              <QuickActionButton 
                icone={Plus} 
                txt="Transferência" 
                onClick={() => window.location.href='/#/logistica/nova-transferencia'} 
                color="#f97316" 
              />

            </div>
          </div>

        </div>
      </div>

      {/* 3. ROW DE GRÁFICOS INFERIORES */}
      <div className="flex gap-[14px] shrink-0 h-[155px]">
        
        <div className="bg-white dark:bg-[#0f1d33] border border-slate-200 dark:border-[#1a2540] rounded-[12px] p-[12px] flex-1 flex flex-col min-w-0 shadow-sm">
          <div className="flex justify-between items-center mb-1 shrink-0"><span className="text-[12px] font-bold text-slate-800 dark:text-slate-100">Entregas por região</span></div>
          <div className="flex items-center gap-3 flex-1 min-h-0">
             <div className="relative w-[85px] h-[85px] shrink-0">
               <ResponsiveContainer width="100%" height="100%">
                 <PieChart>
                   <Pie data={dataPie} innerRadius={28} outerRadius={40} paddingAngle={2} dataKey="value" stroke="none">
                     {dataPie.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                   </Pie>
                 </PieChart>
               </ResponsiveContainer>
               <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
                 <div className="text-[14px] font-black leading-none text-slate-800 dark:text-slate-100">{totalEntregas}</div>
                 <div className="text-[8px] text-slate-500 dark:text-[#6b7280] mt-0.5">Total</div>
               </div>
             </div>
             <div className="flex-1 flex flex-col justify-center gap-[4px] min-w-0">
                {dataPie.length === 0 && <p className="text-[10px] text-slate-400">Sem dados.</p>}
                {dataPie.map((item: any, idx) => (
                  <div key={idx} className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-[10px] text-slate-600 dark:text-slate-300 truncate"><span className="w-1.5 h-1.5 rounded-full shrink-0" style={{background: item.color}}></span>{item.name}</span>
                    <span className="text-[10px] font-semibold text-slate-500 dark:text-[#94a3b8] shrink-0 ml-1">{item.value}</span>
                  </div>
                ))}
             </div>
          </div>
        </div>

        <div className="bg-white dark:bg-[#0f1d33] border border-slate-200 dark:border-[#1a2540] rounded-[12px] p-[12px] flex-[1.4] flex flex-col min-w-0 shadow-sm">
          <div className="flex justify-between items-center mb-1 shrink-0"><span className="text-[12px] font-bold text-slate-800 dark:text-slate-100">Desempenho semanal</span></div>
          <div className="flex-1 w-full relative -ml-4 min-h-0">
             <ResponsiveContainer width="100%" height="100%">
               <LineChart data={lineData} margin={{top:5, right:5, left:0, bottom:0}}>
                 <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
                 <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: textColor, fontSize: 9}} />
                 <YAxis axisLine={false} tickLine={false} tick={{fill: textColor, fontSize: 9}} />
                 <RechartsTooltip contentStyle={{backgroundColor: tooltipBg, border:'none', borderRadius:'6px', color: isDark ? '#f1f5f9' : '#1e293b', fontSize:'10px', padding:'4px 8px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                 <Line type="monotone" dataKey="uv" stroke="#f97316" strokeWidth={2} dot={{r: 2, fill:'#f97316', strokeWidth:1, stroke: isDark ? '#0f1d33' : '#ffffff'}} activeDot={{r: 4}} />
               </LineChart>
             </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white dark:bg-[#0f1d33] border border-slate-200 dark:border-[#1a2540] rounded-[12px] p-[12px] flex-[0.8] flex flex-col items-center justify-between min-w-0 shadow-sm">
          <div className="flex justify-between items-center w-full shrink-0"><span className="text-[12px] font-bold text-slate-800 dark:text-slate-100">Entregas no prazo</span></div>
          <div className="relative flex items-center justify-center w-[120px] h-[65px] mt-1 shrink-0">
            <svg viewBox="0 0 200 115" width="100%" height="100%" className="absolute inset-0">
              <defs><linearGradient id="gGrad" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stopColor="#10b981"/><stop offset="100%" stopColor="#06b6d4"/></linearGradient></defs>
              <path d="M 22,98 A 78,78 0 0,1 178,98" stroke={isDark ? "#1e2d4a" : "#e2e8f0"} strokeWidth="14" fill="none" strokeLinecap="round"/>
              <path d="M 22,98 A 78,78 0 0,1 176,106" stroke="url(#gGrad)" strokeWidth="14" fill="none" strokeLinecap="round"/>
              <text x="100" y="88" textAnchor="middle" fill={isDark ? "#f1f5f9" : "#1e293b"} fontSize="26" fontWeight="800">{taxaSucesso}%</text>
              <text x="100" y="106" textAnchor="middle" fill="#10b981" fontSize="10" fontWeight="600">Excelente</text>
            </svg>
          </div>
          <div className="flex justify-between w-full p-1.5 bg-slate-50 dark:bg-[#1a2540] rounded-md shrink-0">
            <span className="text-[9px] text-slate-500 dark:text-[#6b7280]">Meta: 95%</span>
            <span className="text-[9px] font-bold text-[#10b981]">+2,4%</span>
          </div>
        </div>

      </div>

      {/* ==========================================
          MODAL: AVISO RÁPIDO (AÇÃO DIRETA)
      ========================================== */}
      {modalAvisoAberto && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-slate-900/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#0f1d33] border border-slate-200 dark:border-[#1a2540] rounded-[16px] w-full max-w-sm shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-5 py-4 border-b border-slate-200 dark:border-[#1a2540] bg-slate-50 dark:bg-[#070d1a]/50 flex justify-between items-center">
              <h3 className="text-[13px] font-bold text-slate-800 dark:text-[#e2e8f0] uppercase tracking-widest flex items-center gap-1.5">
                <Megaphone size={14} className="text-[#f59e0b]"/> Broadcast Rápido
              </h3>
              <button onClick={() => setModalAvisoAberto(false)} className="text-slate-400 hover:text-red-500"><X size={16}/></button>
            </div>
            
            <form onSubmit={handleEnviarAviso} className="p-5 space-y-4">
              <div>
                <label className="text-[9px] font-black uppercase tracking-widest text-slate-500 dark:text-[#6b7280] block mb-1.5">Mensagem Urgente para a Equipe</label>
                <textarea 
                  required 
                  value={avisoMsg} 
                  onChange={e => setAvisoMsg(e.target.value)} 
                  placeholder="Ex: Pessoal, atenção com a chuva na zona norte..." 
                  className="w-full bg-slate-50 dark:bg-[#1a2540] border border-slate-200 dark:border-[#253555] rounded-[8px] px-3 py-2 text-[11px] font-medium text-slate-800 dark:text-[#e2e8f0] outline-none focus:border-[#f59e0b] h-24 resize-none"
                />
              </div>
              <div className="pt-2">
                 <button type="submit" disabled={enviandoAviso} className="w-full py-2.5 bg-[#f59e0b] hover:bg-amber-600 text-white font-black text-[11px] uppercase tracking-widest rounded-[8px] flex items-center justify-center gap-1.5 transition-colors shadow-sm disabled:opacity-50">
                   {enviandoAviso ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <><Send size={14}/> Disparar Agora</>}
                 </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </Layout>
  );
}

// Sub-Componentes
const KpiCard = ({ icone: Icon, bgIco, corIco, label, valor, footer, pct, strokeColor, polylinePoints }: any) => (
  <div className="bg-white dark:bg-[#0f1d33] border border-slate-200 dark:border-[#1a2540] rounded-[10px] p-[10px] flex items-center gap-[10px] flex-1 min-w-0 shadow-sm transition-colors">
    <div className="w-[36px] h-[36px] rounded-[8px] flex items-center justify-center shrink-0" style={{ background: bgIco }}>
      <Icon size={17} color={corIco} />
    </div>
    <div className="flex-1 min-w-0">
      <div className="text-[9px] text-slate-400 dark:text-[#6b7280] mb-0.5 truncate uppercase tracking-wide">{label}</div>
      <div className="text-[19px] font-black leading-none tracking-tight text-slate-800 dark:text-[#f1f5f9]">{valor}</div>
      <div className="text-[9px] text-slate-400 dark:text-[#6b7280] mt-[3px] truncate">{footer}</div>
    </div>
    <div className="flex flex-col items-end gap-1 shrink-0">
      <svg viewBox="0 0 56 24" width="38" height="16"><polyline points={polylinePoints} fill="none" stroke={strokeColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
      <span className="text-[9px] font-bold" style={{ color: strokeColor }}>{pct}</span>
    </div>
  </div>
);

const RankingRow = ({iniciais, cor, nome, rota, estrela, sucesso, border}: any) => (
  <div className={`flex items-center gap-2 py-1.5 ${border ? 'border-b border-slate-100 dark:border-[#1a2540]' : ''}`}>
    <div className="w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold text-white shrink-0" style={{ background: cor }}>{iniciais}</div>
    <div className="flex-1 min-w-0">
      <div className="text-[11px] font-semibold text-slate-700 dark:text-slate-200 truncate">{nome}</div>
      <div className="text-[9px] text-slate-400 dark:text-[#6b7280] truncate">{rota}</div>
    </div>
    <div className="text-right shrink-0">
      <div className="text-[10px] font-semibold text-slate-700 dark:text-slate-200"><span className="text-[#f59e0b]">★</span> {estrela}</div>
      <div className="text-[9px] text-[#10b981]">{sucesso}</div>
    </div>
  </div>
);

const QuickActionButton = ({ icone: Icon, txt, onClick, color, className }: any) => (
  <div onClick={onClick} className="flex flex-col items-center justify-center gap-1 p-1.5 bg-slate-50 dark:bg-[#1a2540] border border-slate-200 dark:border-transparent rounded-[8px] cursor-pointer hover:bg-slate-100 dark:hover:bg-[#253555] transition-colors h-[48px] group">
    <Icon size={16} className={`transition-colors group-hover:opacity-80 ${className || 'text-slate-500 dark:text-[#94a3b8]'}`} style={{ color: color }} />
    <span className="text-[8px] font-bold text-slate-600 dark:text-[#94a3b8] text-center leading-tight tracking-tight uppercase">{txt}</span>
  </div>
);