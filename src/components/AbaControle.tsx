import React, { useEffect, useState } from 'react';
import { Package, Truck, Users, Box, CheckCircle, AlertTriangle, ScanBarcode, Activity } from 'lucide-react';
import { AreaChart, Area, XAxis, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

import { MapContainer, TileLayer, Marker, Polyline, Tooltip as LeafletTooltip, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

interface AbaControleProps {
  logs: any[];
  transferencias: any[];
}

// ─── COMPONENTE SENSOR DE ZOOM (NOVO) ───
// Fica escutando o scroll do mouse para saber se estamos perto ou longe
function SensorDeZoom({ onZoomChange }: { onZoomChange: (zoom: number) => void }) {
  const map = useMapEvents({
    zoomend: () => {
      onZoomChange(map.getZoom());
    },
  });
  return null;
}

// ─── ÍCONES (Tamanho reduzido para não poluir) ───
const criarIconeCaminhao = (corHex: string) => {
  return new L.DivIcon({
    html: `<div style="width: 18px; height: 18px; background-color: ${corHex}; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 10px ${corHex}; border: 2px solid rgba(255,255,255,0.8);"><svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#1e293b" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M10 17h4V5H2v12h3"/><path d="M20 17h2v-9h-4V5h-4v12h3"/><path d="M7 17a2 2 0 1 0 4 0 2 2 0 1 0-4 0Z"/><path d="M17 17a2 2 0 1 0 4 0 2 2 0 1 0-4 0Z"/></svg></div>`,
    className: '', iconSize: [18, 18], iconAnchor: [9, 9],
  });
};

const iconeMatriz = new L.DivIcon({
  html: `<div style="width: 22px; height: 22px; background-color: #1e293b; border-radius: 6px; display: flex; align-items: center; justify-content: center; border: 2px solid #ef4444; box-shadow: 0 0 20px rgba(239,68,68,0.8);"><svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg></div>`,
  className: '', iconSize: [22, 22], iconAnchor: [11, 11],
});

// ─── DICIONÁRIO DE COORDENADAS ───
const DICIONARIO_GPS: Record<string, [number, number]> = {
  'ARACAJU': [-10.9472, -37.0731], 'SOCORRO': [-10.8545, -37.1264], 'ESTANCIA': [-11.2687, -37.4384],
  'LAGARTO': [-10.9167, -37.6667], 'ITABAIANA': [-10.6833, -37.4167], 'CRISTOVAO': [-11.0147, -37.2064],
  'GLORIA': [-10.2167, -37.4167], 'SIMAO DIAS': [-10.7388, -37.8106], 'ITAPORANGA': [-11.0000, -37.3100],
  'CAPELA': [-10.5000, -37.0500], 'PROPRIA': [-10.2000, -36.8333], 'TOBIAS BARRETO': [-11.1833, -37.9833],
  'CANINDE': [-9.6667, -37.7833], 'AREIA BRANCA': [-10.7500, -37.3167], 'DORES': [-10.4833, -37.2000],
  'BOQUIM': [-11.1488, -37.6205], 'UMBAUBA': [-11.3833, -37.6500], 'POCO REDONDO': [-9.8000, -37.6833],
  'CARMOPOLIS': [-10.6483, -36.9858], 'RIBEIROPOLIS': [-10.5400, -37.4300], 'NEOPOLIS': [-10.3167, -36.5833],
  'AQUIDABA': [-10.2833, -37.0500], 'JAPARATUBA': [-10.5833, -36.9333], 'LARANJEIRAS': [-10.8000, -37.1667],
  'CRISTINAPOLIS': [-11.4833, -37.7500], 'INDIAROBA': [-11.5167, -37.5167], 'MACAMBIRA': [-10.6667, -37.5333],
  'MOITA BONITA': [-10.5667, -37.3500], 'FREI PAULO': [-10.5500, -37.5333], 'MARUIM': [-10.7333, -36.9833],
  'SALGADO': [-11.0333, -37.4833], 'POCO VERDE': [-10.7000, -38.1833], 'APARECIDA': [-10.4500, -37.3833],
  'ALEIXO': [-10.4000, -37.3833], 'SANTA LUZIA': [-11.3500, -37.4500], 'PIRAMBU': [-10.7333, -36.8500],
  'PARIPIRANGA': [-10.6833, -37.8667], 'MONTE ALEGRE': [-10.0167, -37.5667], 'MALHADOR': [-10.6500, -37.3000],
  'LOURDES': [-10.0667, -37.0500], 'PORTO DA FOLHA': [-9.9167, -37.2667], 'AMARO': [-10.8167, -37.0500],
  'RIACHUELO': [-10.7333, -37.1833], 'MURIBECA': [-10.4167, -36.9500], 'TELHA': [-10.2000, -36.8833],
  'CEDRO': [-10.2500, -36.8833], 'ILHA DAS FLORES': [-10.4333, -36.5333], 'MALHADA DOS BOIS': [-10.3500, -36.9167],
  'PACATUBA': [-10.4500, -36.6500], 'GERU': [-11.3667, -37.8333], 'ITABAIANINHA': [-11.2667, -37.7833],
  'ARAUA': [-11.2667, -37.6167], 'PINHAO': [-10.5667, -37.7167], 'GRACCHO': [-10.2333, -37.2000],
  'CUMBE': [-10.3500, -37.1833], 'CARIRA': [-10.3667, -37.7000], 'SAO DOMINGOS': [-10.5333, -37.5667],
  'RIACHAO DO DANTAS': [-11.0667, -37.7333], 'CAMPO DO BRITO': [-10.7333, -37.4833], 'PEDRA MOLE': [-10.6167, -37.7167],
  'PEDRINHAS': [-11.1833, -37.6667], 'JAPOATA': [-10.3500, -36.8000]
};

const obterCoordenadas = (nomeCidade: string): [number, number] => {
  if (!nomeCidade) return [-10.9472, -37.0731];
  const nom = nomeCidade.toUpperCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  const chave = Object.keys(DICIONARIO_GPS).find(c => nom.includes(c));
  if (chave) return DICIONARIO_GPS[chave];
  return [-10.9472 + (Math.random() * 0.1), -37.0731 - (Math.random() * 0.1)]; 
};

const calcularRotaSequencial = (pontoInicial: [number, number], cidades: any[]) => {
  let caminho = [pontoInicial];
  let pendentes = cidades.map(c => ({ ...c, coord: obterCoordenadas(c.cidade) }));
  let atual = pontoInicial;

  while (pendentes.length > 0) {
    let maisProximoIdx = 0;
    let menorDistancia = Infinity;
    for (let i = 0; i < pendentes.length; i++) {
      const dist = Math.pow(pendentes[i].coord[0] - atual[0], 2) + Math.pow(pendentes[i].coord[1] - atual[1], 2);
      if (dist < menorDistancia) { menorDistancia = dist; maisProximoIdx = i; }
    }
    atual = pendentes[maisProximoIdx].coord;
    caminho.push(atual);
    pendentes.splice(maisProximoIdx, 1);
  }
  return caminho;
};

const CORES_ROTAS = ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#06B6D4', '#EC4899', '#EF4444', '#14B8A6'];
const coordMatriz: [number, number] = [-10.9472, -37.0731];

export const AbaControle: React.FC<AbaControleProps> = ({ logs = [], transferencias = [] }) => {

  const [rotasNoBanco, setRotasNoBanco] = useState<any[]>([]);
  const [vinculosNoBanco, setVinculosNoBanco] = useState<any[]>([]);
  
  // ESTADO QUE GUARDA O ZOOM DO MAPA (Começa no nível 9)
  const [zoomAtual, setZoomAtual] = useState(9);

  useEffect(() => {
    // ⬇️ ALTERAÇÃO FEITA AQUI: Usando o IP da variável de ambiente com crases! ⬇️
    Promise.all([
      fetch(`${import.meta.env.VITE_API_URL}/api/frota/rotas`).then(r => r.json()),
      fetch(`${import.meta.env.VITE_API_URL}/api/frota/vinculos`).then(r => r.json())
    ]).then(([rotasData, vinculosData]) => {
      setRotasNoBanco(rotasData);
      setVinculosNoBanco(vinculosData);
    }).catch(err => console.error("Erro ao puxar dados da frota para o mapa:", err));
  }, []);

  const rotasDinamicas = rotasNoBanco.map((rota, index) => {
    const cidadesDestaRota = vinculosNoBanco.filter(v => v.rotaId === rota.id);
    const trajeto = calcularRotaSequencial(coordMatriz, cidadesDestaRota);
    return {
      id: rota.id, nome: rota.nome, cor: CORES_ROTAS[index % CORES_ROTAS.length],
      cidades: cidadesDestaRota, trajeto: trajeto
    };
  }).filter(r => r.cidades.length > 0);

  const rotasAtivas = rotasDinamicas.length > 0 ? rotasDinamicas.length : (new Set(transferencias.map((t: any) => t.rota)).size || 18);
  const totalPacotes = transferencias.reduce((acc: number, curr: any) => acc + (Number(curr.total_sacas) || 0) + (Number(curr.total_saquinhos) || 0) + (Number(curr.avulsos) || 0), 0) || 1245;
  const totalSacasHoje = transferencias.reduce((acc: number, curr: any) => acc + (Number(curr.total_sacas) || 0), 0) || 3562;

  const dadosSemana = [
    { name: 'Seg', pacotes: 500 }, { name: 'Ter', pacotes: 1200 },
    { name: 'Qua', pacotes: 900 }, { name: 'Qui', pacotes: 1500 },
    { name: 'Sex', pacotes: 800 }, { name: 'Sáb', pacotes: 400 },
    { name: 'Dom', pacotes: 300 },
  ];

  const cardBase = "bg-[#151924] border border-[#222b3d] rounded-2xl p-5 shadow-lg relative overflow-hidden";

  return (
    <div className="max-w-[1600px] mx-auto space-y-5 animate-in fade-in duration-700 text-slate-300 pb-10">
      
      <style>{`
        .custom-tooltip { background-color: #0c101a !important; border: 1px solid #222b3d !important; color: #f1f5f9 !important; font-weight: 900 !important; text-transform: uppercase; letter-spacing: 0.1em; font-size: 8px !important; box-shadow: 0 4px 15px rgba(0,0,0,0.5) !important; padding: 2px 6px !important;}
        .custom-tooltip::before { border-top-color: #222b3d !important; }
        .custom-tooltip.leaflet-tooltip-bottom::before { border-bottom-color: #222b3d !important; border-top-color: transparent !important; }
        .leaflet-container { background: #0c101a !important; font-family: inherit; z-index: 10; }
        .linha-rota-leaflet { stroke-dasharray: 8, 12; animation: dashLeaflet 2s linear infinite; }
        @keyframes dashLeaflet { to { stroke-dashoffset: -20; } }
      `}</style>

      {/* CABEÇALHO */}
      <div className="mb-6">
        <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">Painel de Controle</h1>
        <p className="text-sm font-medium text-gray-500">Visão geral das operações e Roteirização Inteligente de Frota</p>
      </div>

      {/* CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
        <div className={cardBase}>
          <div className="flex justify-between items-start">
            <div className="flex gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-600/10 flex items-center justify-center text-blue-500 border border-blue-600/20"><Box size={24} /></div>
              <div><p className="text-xs font-bold text-slate-400 mb-1">Total de Itens (Pátio)</p><h3 className="text-3xl font-black text-white">{totalPacotes.toLocaleString('pt-BR')}</h3></div>
            </div>
          </div>
        </div>
        <div className={cardBase}>
          <div className="flex justify-between items-start">
            <div className="flex gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-600/10 flex items-center justify-center text-emerald-500 border border-emerald-600/20"><Truck size={24} /></div>
              <div><p className="text-xs font-bold text-slate-400 mb-1">Rotas Planejadas</p><h3 className="text-3xl font-black text-white">{rotasAtivas}</h3></div>
            </div>
          </div>
        </div>
        <div className={cardBase}>
          <div className="flex justify-between items-start">
            <div className="flex gap-4">
              <div className="w-12 h-12 rounded-xl bg-purple-600/10 flex items-center justify-center text-purple-500 border border-purple-600/20"><Users size={24} /></div>
              <div><p className="text-xs font-bold text-slate-400 mb-1">Motoristas em Rota</p><h3 className="text-3xl font-black text-white">{transferencias.filter(t => t.status === 'Finalizada').length || 14}</h3></div>
            </div>
          </div>
        </div>
        <div className={cardBase}>
          <div className="flex justify-between items-start">
            <div className="flex gap-4">
              <div className="w-12 h-12 rounded-xl bg-amber-600/10 flex items-center justify-center text-amber-500 border border-amber-600/20"><Package size={24} /></div>
              <div><p className="text-xs font-bold text-slate-400 mb-1">Sacas Hoje</p><h3 className="text-3xl font-black text-white">{totalSacasHoje.toLocaleString('pt-BR')}</h3></div>
            </div>
          </div>
        </div>
      </div>

      {/* MAPA INTERATIVO */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        <div className="xl:col-span-2 bg-[#151924] border border-[#222b3d] rounded-2xl p-5 shadow-lg flex flex-col relative">
          <div className="flex justify-between items-center mb-4 z-20 relative">
            <div className="flex items-center gap-3">
              <h2 className="text-base font-bold text-white">Mapa Logístico (Sergipe)</h2>
              <span className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-500 uppercase tracking-widest bg-emerald-500/10 px-2 py-1 rounded-md border border-emerald-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> Roteirização Ativa
              </span>
            </div>
          </div>

          <div className="flex-1 rounded-xl overflow-hidden border border-[#222b3d] min-h-[450px] relative">
            <MapContainer center={[-10.6500, -37.3500]} zoom={9} style={{ height: '100%', width: '100%' }} zoomControl={false} attributionControl={false}>
              
              {/* ATIVA O SENSOR DE ZOOM AQUI */}
              <SensorDeZoom onZoomChange={setZoomAtual} />
              
              <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />

              <Marker position={coordMatriz} icon={iconeMatriz}>
                {zoomAtual >= 9 && (
                  <LeafletTooltip direction="bottom" offset={[0, 15]} opacity={1} permanent className="custom-tooltip text-red-400">CD NORDEX</LeafletTooltip>
                )}
              </Marker>

              {rotasDinamicas.map(rota => {
                const iconCaminhao = criarIconeCaminhao(rota.cor);
                
                return (
                  <React.Fragment key={rota.id}>
                    {/* Linha Contínua Traçando o Caminho da Rota */}
                    <Polyline positions={rota.trajeto} color={rota.cor} weight={3} className="linha-rota-leaflet" />
                    
                    {/* Pontos das Cidades */}
                    {rota.cidades.map((vinculo: any) => {
                      const coordenadas = obterCoordenadas(vinculo.cidade);
                      return (
                        <Marker key={vinculo.id} position={coordenadas} icon={iconCaminhao}>
                          
                          {/* SÓ MOSTRA O NOME DA CIDADE SE O ZOOM FOR MAIOR OU IGUAL A 9 */}
                          {zoomAtual >= 9 && (
                            <LeafletTooltip direction="top" offset={[0, -10]} opacity={1} permanent className="custom-tooltip" style={{ color: rota.cor }}>
                              {vinculo.cidade.split(' ')[0]}
                            </LeafletTooltip>
                          )}

                        </Marker>
                      );
                    })}
                  </React.Fragment>
                );
              })}

            </MapContainer>
            <div className="absolute inset-0 bg-[#0c101a] mix-blend-color opacity-30 pointer-events-none z-[400]"></div>
          </div>
        </div>

        {/* COLUNA DIREITA */}
        <div className="xl:col-span-1 space-y-5 flex flex-col">
          <div className={`${cardBase} flex-1`}>
            <h2 className="text-base font-bold text-white mb-4">Legenda de Rotas</h2>
            <div className="space-y-3 overflow-y-auto max-h-[160px] custom-scrollbar pr-2">
              {rotasDinamicas.map(rota => (
                <div key={rota.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full shadow-lg" style={{ backgroundColor: rota.cor }}></span>
                    <span className="text-xs font-bold text-slate-300">{rota.nome}</span>
                  </div>
                  <span className="text-[10px] font-medium text-slate-500 bg-slate-800 px-2 py-0.5 rounded-full">{rota.cidades.length} cidades</span>
                </div>
              ))}
              {rotasDinamicas.length === 0 && <p className="text-xs text-slate-500">Nenhuma rota configurada no sistema.</p>}
            </div>
          </div>

          <div className={`${cardBase} flex-1 overflow-y-auto max-h-[220px] custom-scrollbar`}>
            <h2 className="text-base font-bold text-white mb-4">Em Trânsito</h2>
            <div className="space-y-4">
              {transferencias.filter(t => t.status === 'Finalizada').slice(0, 5).map((t, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-black text-white shrink-0">
                      {(t.motorista_saida || 'M').charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white leading-tight truncate w-24">{t.motorista_saida || 'Motorista'}</p>
                      <p className="text-[10px] text-slate-500">{t.rota}</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-blue-500 bg-blue-500/10 px-2 py-0.5 rounded">Em Rota</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* LINHA 3 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className={cardBase + " flex flex-col"}>
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-base font-bold text-white">Volume Semanal</h2>
          </div>
          <div className="h-[120px] w-full mt-2 relative -ml-3">
            {/* @ts-ignore */}
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dadosSemana}>
                <defs>
                  <linearGradient id="colorPacotes" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" tick={{fontSize: 9, fill: '#64748B'}} axisLine={false} tickLine={false} dy={5} />
                <RechartsTooltip contentStyle={{backgroundColor: '#111827', border: '1px solid #1F2937', borderRadius: '8px', fontSize: '12px'}} itemStyle={{color: '#3B82F6'}} />
                <Area type="monotone" dataKey="pacotes" stroke="#3B82F6" strokeWidth={2} fillOpacity={1} fill="url(#colorPacotes)" activeDot={{r: 4, fill: '#3B82F6', stroke: '#151924', strokeWidth: 2}} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className={cardBase}>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-base font-bold text-white">Últimas Atividades</h2>
          </div>
          <div className="space-y-4 max-h-[120px] overflow-y-auto custom-scrollbar pr-2">
            {logs.slice(0, 4).map((log: any, i: number) => (
              <div key={i} className="flex items-start gap-3">
                <Activity size={16} className="text-emerald-500 mt-0.5 shrink-0" />
                <div className="flex-1">
                  <p className="text-xs font-bold text-white">{log.acao}</p>
                  <p className="text-[10px] text-slate-500">{log.usuario}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};