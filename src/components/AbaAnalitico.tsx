import React from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Package, CheckCircle, Clock, FileText, AlertCircle, Target, Zap } from 'lucide-react';

// BURLANDO A VALIDAÇÃO DO TYPESCRIPT PARA A BIBLIOTECA DE GRÁFICOS
const RContainer = ResponsiveContainer as any;
const PCell = Cell as any;

interface AbaAnaliticoProps {
  transferencias: any[];
  tarefas: any[];
  tickets: any[];
}

const CORES_PIE = ['#f59e0b', '#3b82f6', '#10b981']; // Amber, Blue, Emerald

export const AbaAnalitico: React.FC<AbaAnaliticoProps> = ({ transferencias, tarefas, tickets }) => {
  
  const totalCargas = transferencias.length;
  const finalizadas = transferencias.filter(t => t.status === 'Finalizada').length;
  const pendentes = totalCargas - finalizadas;
  const taxaSucesso = totalCargas > 0 ? Math.round((finalizadas / totalCargas) * 100) : 0;

  // DADOS GRÁFICO 1: O "Funil" transformado em uma linha contínua
  const dataCargas = [
    { name: 'Criadas', value: transferencias.filter(t => t.status === 'Aguardando Cards').length },
    { name: 'Cards Atrib.', value: transferencias.filter(t => t.status === 'Aguardando Conferência').length },
    { name: 'Conferência', value: transferencias.filter(t => t.status === 'Em Conferência' || t.status === 'Divergência').length },
    { name: 'Aguard. Saída', value: transferencias.filter(t => t.status === 'Aguardando Saída').length },
    { name: 'Liberação', value: transferencias.filter(t => t.status === 'Em Liberação').length },
    { name: 'Finalizadas', value: finalizadas },
  ];

  // DADOS GRÁFICO 2: Tarefas (Pendente, Análise, Concluída)
  const qtdPendentes = tarefas.filter(t => t.status === 'Pendente').length;
  const qtdAnalise = tarefas.filter(t => t.status === 'Aguardando Aprovação').length;
  const qtdConcluidas = tarefas.filter(t => t.status === 'Concluída').length;
  
  const dataTarefas = [
    { name: 'Pendentes', value: qtdPendentes },
    { name: 'Em Análise', value: qtdAnalise },
    { name: 'Concluídas', value: qtdConcluidas },
  ];

  // Barras de Progresso de Status
  const statusBars = [
    { label: 'Aguardando', count: transferencias.filter(t => t.status === 'Aguardando Cards').length, color: 'bg-zinc-500' },
    { label: 'Em Conferência', count: transferencias.filter(t => t.status.includes('Conferência') || t.status === 'Divergência').length, color: 'bg-amber-500' },
    { label: 'Em Liberação', count: transferencias.filter(t => t.status.includes('Liberação') || t.status === 'Aguardando Saída').length, color: 'bg-blue-500' },
    { label: 'Finalizadas', count: finalizadas, color: 'bg-emerald-500' },
  ];

  // Mini Cards de Totais Operacionais
  const totalSacas = transferencias.reduce((acc, curr) => acc + (curr.total_sacas || 0), 0);
  const totalAvulsos = transferencias.reduce((acc, curr) => acc + (curr.avulsos || 0), 0);
  const totalRevistas = transferencias.reduce((acc, curr) => acc + (curr.revistas || 0), 0);
  const totalEletro = transferencias.reduce((acc, curr) => acc + (curr.eletronicos || 0), 0);

  return (
    <div className="animate-in fade-in duration-500 max-w-7xl mx-auto">
      
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        
        {/* COLUNA ESQUERDA */}
        <div className="xl:col-span-4 flex flex-col gap-6">
          
          <div className="relative overflow-hidden rounded-[2rem] p-8 shadow-[0_20px_40px_rgba(241,90,36,0.15)] bg-gradient-to-br from-[#f15a24] to-[#c23e15] border border-[#f15a24]/50 flex flex-col justify-between min-h-[220px] dark:shadow-[0_20px_40px_rgba(241,90,36,0.08)]">
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-white opacity-10 rounded-full blur-3xl pointer-events-none"></div>
            
            <div className="flex justify-between items-start relative z-10">
               <div>
                 <div className="flex items-center gap-2 text-white/80 font-black uppercase tracking-widest text-[10px] mb-2">
                   <Target size={14} /> Desempenho Hoje
                 </div>
                 <h2 className="text-5xl font-black text-white tracking-tighter">{taxaSucesso}%</h2>
                 <p className="text-white/90 text-sm font-medium mt-1">Cargas finalizadas com sucesso</p>
               </div>
               <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-md text-white">
                 <Zap size={24} />
               </div>
            </div>

            <div className="flex gap-4 mt-8 relative z-10">
               <div className="flex-1 bg-black/20 rounded-xl p-3 backdrop-blur-sm border border-white/10">
                 <p className="text-white/70 text-[10px] font-black uppercase tracking-widest">Total</p>
                 <p className="text-xl font-black text-white">{totalCargas}</p>
               </div>
               <div className="flex-1 bg-black/20 rounded-xl p-3 backdrop-blur-sm border border-white/10">
                 <p className="text-white/70 text-[10px] font-black uppercase tracking-widest">Faltam</p>
                 <p className="text-xl font-black text-white">{pendentes}</p>
               </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div className="bg-white dark:bg-[#111113] p-5 rounded-[1.5rem] border border-zinc-200/80 dark:border-zinc-800/80 shadow-sm transition hover:border-[#f15a24]/50 group">
               <div className="flex items-center gap-2 text-zinc-500 mb-2 group-hover:text-[#f15a24] transition-colors"><Package size={14}/><span className="text-[10px] font-black uppercase tracking-widest">Sacas</span></div>
               <p className="text-2xl font-black text-zinc-900 dark:text-white">{totalSacas}</p>
             </div>
             <div className="bg-white dark:bg-[#111113] p-5 rounded-[1.5rem] border border-zinc-200/80 dark:border-zinc-800/80 shadow-sm transition hover:border-amber-500/50 group">
               <div className="flex items-center gap-2 text-zinc-500 mb-2 group-hover:text-amber-500 transition-colors"><FileText size={14}/><span className="text-[10px] font-black uppercase tracking-widest">Avulsos</span></div>
               <p className="text-2xl font-black text-zinc-900 dark:text-white">{totalAvulsos}</p>
             </div>
             <div className="bg-white dark:bg-[#111113] p-5 rounded-[1.5rem] border border-zinc-200/80 dark:border-zinc-800/80 shadow-sm transition hover:border-green-500/50 group">
               <div className="flex items-center gap-2 text-zinc-500 mb-2 group-hover:text-green-500 transition-colors"><FileText size={14}/><span className="text-[10px] font-black uppercase tracking-widest">Revistas</span></div>
               <p className="text-2xl font-black text-zinc-900 dark:text-white">{totalRevistas}</p>
             </div>
             <div className="bg-white dark:bg-[#111113] p-5 rounded-[1.5rem] border border-zinc-200/80 dark:border-zinc-800/80 shadow-sm transition hover:border-purple-500/50 group">
               <div className="flex items-center gap-2 text-zinc-500 mb-2 group-hover:text-purple-500 transition-colors"><FileText size={14}/><span className="text-[10px] font-black uppercase tracking-widest">Eletro</span></div>
               <p className="text-2xl font-black text-zinc-900 dark:text-white">{totalEletro}</p>
             </div>
          </div>

        </div>

        {/* COLUNA DIREITA */}
        <div className="xl:col-span-8 flex flex-col gap-6">
          
          <div className="bg-white dark:bg-[#111113] p-6 rounded-[2rem] border border-zinc-200/80 dark:border-zinc-800/80 shadow-sm h-[320px] flex flex-col">
             <div className="flex justify-between items-center mb-4">
                <div>
                   <h3 className="text-sm font-black text-zinc-900 dark:text-white flex items-center gap-2"><TrendingUp size={16} className="text-[#f15a24]"/> Fluxo da Operação (WMS)</h3>
                   <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mt-1">Cargas por etapa da esteira</p>
                </div>
             </div>
             
             <div className="flex-1 w-full min-h-0">
               <RContainer width="100%" height="100%">
                  <AreaChart data={dataCargas} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f15a24" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#f15a24" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="name" tick={{fontSize: 10, fill: '#888', fontWeight: 'bold'}} axisLine={false} tickLine={false} dy={10} />
                    <YAxis tick={{fontSize: 10, fill: '#888', fontWeight: 'bold'}} axisLine={false} tickLine={false} />
                    <Tooltip 
                       cursor={{stroke: '#f15a24', strokeWidth: 1, strokeDasharray: '4 4'}} 
                       contentStyle={{backgroundColor: '#111113', borderRadius: '1rem', border: '1px solid #333', color: '#fff', fontWeight: 'bold', boxShadow: '0 10px 30px rgba(0,0,0,0.2)'}} 
                       itemStyle={{color: '#f15a24'}}
                    />
                    <Area type="monotone" dataKey="value" stroke="#f15a24" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" activeDot={{r: 6, fill: '#f15a24', stroke: '#fff', strokeWidth: 2}} />
                  </AreaChart>
               </RContainer>
             </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1">
             
             <div className="bg-white dark:bg-[#111113] p-6 rounded-[2rem] border border-zinc-200/80 dark:border-zinc-800/80 shadow-sm flex flex-col items-center justify-center relative min-h-[220px]">
                <h3 className="text-sm font-black text-zinc-900 dark:text-white self-start w-full absolute top-6 left-6">Tarefas da Equipe</h3>
                
                <div className="h-[140px] w-full mt-4 relative">
                  <RContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={dataTarefas} cx="50%" cy="50%" innerRadius={45} outerRadius={65} paddingAngle={4} dataKey="value" stroke="none" cornerRadius={4}>
                        {dataTarefas.map((entry, index) => ( <PCell key={`cell-${index}`} fill={CORES_PIE[index % CORES_PIE.length]} /> ))}
                      </Pie>
                      <Tooltip contentStyle={{borderRadius: '1rem', border: 'none', backgroundColor: '#111113', color: '#fff', fontWeight: 'bold'}} itemStyle={{color: '#fff'}} />
                    </PieChart>
                  </RContainer>
                  
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                     <span className="text-2xl font-black text-zinc-900 dark:text-white">{tarefas.length}</span>
                     <span className="text-[8px] font-bold text-zinc-400 uppercase tracking-widest">Total</span>
                  </div>
                </div>

                <div className="flex gap-4 mt-2">
                  <div className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-wider text-zinc-500"><span className="w-2 h-2 rounded-full bg-amber-500"></span> Pendente</div>
                  <div className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-wider text-zinc-500"><span className="w-2 h-2 rounded-full bg-blue-500"></span> Análise</div>
                  <div className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-wider text-zinc-500"><span className="w-2 h-2 rounded-full bg-emerald-500"></span> Feito</div>
                </div>
             </div>

             <div className="bg-white dark:bg-[#111113] p-6 rounded-[2rem] border border-zinc-200/80 dark:border-zinc-800/80 shadow-sm flex flex-col min-h-[220px]">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-sm font-black text-zinc-900 dark:text-white">Gargalo WMS</h3>
                  <span className="bg-zinc-100 dark:bg-zinc-900 text-zinc-500 px-2 py-1 rounded text-[9px] font-bold uppercase tracking-widest">Hoje</span>
                </div>
                
                <div className="flex-1 space-y-4">
                  {statusBars.map((status, i) => (
                    <div key={i}>
                      <div className="flex justify-between items-center mb-1.5">
                        <span className="text-xs font-bold text-zinc-600 dark:text-zinc-400">{status.label}</span>
                        <span className="text-xs font-black text-zinc-900 dark:text-white">{status.count} <span className="text-zinc-500 font-medium">cargas</span></span>
                      </div>
                      <div className="w-full bg-zinc-100 dark:bg-[#1a1a1f] h-2 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${status.color} transition-all duration-1000`} style={{ width: `${totalCargas > 0 ? (status.count / totalCargas) * 100 : 0}%` }}></div>
                      </div>
                    </div>
                  ))}
                </div>
             </div>

          </div>
        </div>

      </div>
    </div>
  );
};
