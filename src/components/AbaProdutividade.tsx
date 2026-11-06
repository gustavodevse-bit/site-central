import React, { useState, useMemo } from 'react';
import { Activity, PackageCheck, PackageOpen, Truck, Search, User, MapPin, Barcode, History, Filter, PieChart as PieChartIcon } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell } from 'recharts';

interface AbaProdutividadeProps {
  equipe: any[];
  transferencias: any[];
  logs: any[];
}

export const AbaProdutividade: React.FC<AbaProdutividadeProps> = ({ equipe, transferencias, logs }) => {
  const [filtroUsuario, setFiltroUsuario] = useState('Todos');
  const [buscaLivre, setBuscaLivre] = useState('');

  // ==========================================
  // 1. DADOS DA TABELA DE RAIO-X (O "Tudinho")
  // ==========================================
  const historicoDetalhado = useMemo(() => {
    let atividades: any[] = [];
    
    // Varre todas as cargas e divide as ações de cada pessoa
    transferencias.forEach(t => {
      // Quem emitiu/criou a CAF?
      if (t.criador) {
        atividades.push({ id: `cria-${t.id}`, tipo: 'Emissão de CAF', usuario: t.criador, caf: t.caf, cidade: t.cidade, status: t.status, icone: PackageOpen, corTexto: 'text-purple-500', corBg: 'bg-purple-500/10', corBorda: 'border-purple-500/20' });
      }
      // Quem conferiu no pátio?
      if (t.conferente) {
        atividades.push({ id: `conf-${t.id}`, tipo: 'Conferência de Pátio', usuario: t.conferente, caf: t.caf, cidade: t.cidade, status: t.status, icone: PackageCheck, corTexto: 'text-amber-500', corBg: 'bg-amber-500/10', corBorda: 'border-amber-500/20' });
      }
      // Quem despachou o caminhão?
      if (t.liberador) {
        atividades.push({ id: `lib-${t.id}`, tipo: 'Expedição de Rota', usuario: t.liberador, caf: t.caf, cidade: t.cidade, status: t.status, icone: Truck, corTexto: 'text-emerald-500', corBg: 'bg-emerald-500/10', corBorda: 'border-emerald-500/20' });
      }
    });

    // 🔍 Filtro 1: Dropdown de Usuário
    if (filtroUsuario !== 'Todos') {
      atividades = atividades.filter(a => a.usuario?.includes(filtroUsuario));
    }

    // 🔍 Filtro 2: Barra de Pesquisa (Busca por CAF, Cidade ou Nome)
    if (buscaLivre.trim() !== '') {
      const termo = buscaLivre.toLowerCase();
      atividades = atividades.filter(a => 
        a.caf?.toLowerCase().includes(termo) || 
        a.cidade?.toLowerCase().includes(termo) || 
        a.usuario?.toLowerCase().includes(termo)
      );
    }

    return atividades.reverse(); // Mais recentes no topo
  }, [transferencias, filtroUsuario, buscaLivre]);

  // ==========================================
  // 2. CONTAGENS PARA OS CARDS E GRÁFICO DE ROSCA
  // ==========================================
  const totalLancadas = historicoDetalhado.filter(a => a.tipo === 'Emissão de CAF').length;
  const totalConferidas = historicoDetalhado.filter(a => a.tipo === 'Conferência de Pátio').length;
  const totalLiberadas = historicoDetalhado.filter(a => a.tipo === 'Expedição de Rota').length;
  const totalGeral = historicoDetalhado.length;

  const dadosGraficoRosca = [
    { name: 'Emissões', value: totalLancadas, color: '#8b5cf6' }, // Roxo
    { name: 'Conferências', value: totalConferidas, color: '#f59e0b' }, // Laranja
    { name: 'Expedições', value: totalLiberadas, color: '#10b981' } // Verde
  ].filter(d => d.value > 0);

  // ==========================================
  // 3. DADOS PARA O GRÁFICO DE BARRAS (Produtividade)
  // ==========================================
  const dadosGerais = useMemo(() => {
    let dados = equipe.map(user => {
      const conferidas = transferencias.filter(t => t.conferente?.includes(user.nome)).length;
      const liberadas = transferencias.filter(t => t.liberador?.includes(user.nome)).length;
      const lancadas = transferencias.filter(t => t.criador?.includes(user.nome)).length;

      return {
        nome: user.nome,
        Conferidas: conferidas,
        Liberadas: liberadas,
        Lancadas: lancadas,
        Total: conferidas + liberadas + lancadas
      };
    });

    if (filtroUsuario !== 'Todos') {
      dados = dados.filter(d => d.nome === filtroUsuario);
    } else {
      dados = dados.filter(d => d.Total > 0);
    }

    return dados.sort((a, b) => b.Total - a.Total).slice(0, 10); // Top 10 mais produtivos
  }, [equipe, transferencias, filtroUsuario]);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* CABEÇALHO E FILTROS AVANÇADOS */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center bg-white dark:bg-[#111113] p-6 rounded-[2rem] shadow-sm border border-zinc-100 dark:border-zinc-800 gap-6">
        <div>
          <h2 className="text-3xl font-black flex items-center gap-3"><Activity className="text-[#FF7A00]"/> Raio-X Operacional</h2>
          <p className="text-sm font-medium text-zinc-500 mt-1">Monitore quem emitiu, conferiu e despachou cada carga em tempo real.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full xl:w-auto">
          {/* Barra de Pesquisa de CAF */}
          <div className="flex items-center gap-3 bg-[#f8f9fc] dark:bg-[#1a1a1f] px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-800 w-full xl:w-72 focus-within:border-[#FF7A00] transition-colors">
            <Search size={18} className="text-zinc-400 shrink-0" />
            <input 
              type="text" 
              placeholder="Pesquisar CAF, Cidade ou Nome..." 
              value={buscaLivre}
              onChange={(e) => setBuscaLivre(e.target.value)}
              className="bg-transparent font-bold text-sm outline-none w-full dark:text-white placeholder:text-zinc-500"
            />
          </div>

          {/* Filtro de Usuário */}
          <div className="flex items-center gap-3 bg-[#f8f9fc] dark:bg-[#1a1a1f] px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-800 w-full xl:w-auto focus-within:border-[#FF7A00] transition-colors">
            <Filter size={18} className="text-zinc-400 shrink-0" />
            <select value={filtroUsuario} onChange={(e) => setFiltroUsuario(e.target.value)} className="bg-transparent font-bold text-sm outline-none w-full min-w-[180px] cursor-pointer dark:text-white">
              <option value="Todos" className="bg-white dark:bg-[#111113]">🌍 Toda a Equipe</option>
              <optgroup label="Colaboradores" className="bg-white dark:bg-[#111113]">
                {equipe.map(u => (
                  <option key={u.id} value={u.nome} className="bg-white dark:bg-[#111113]">{u.nome}</option>
                ))}
              </optgroup>
            </select>
          </div>
        </div>
      </div>

      {/* CARDS DE RESUMO INTELIGENTES (Eles mudam conforme a pesquisa) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-[#111113] p-6 rounded-[1.5rem] border border-zinc-100 dark:border-zinc-800 shadow-sm relative overflow-hidden">
           <div className="absolute -right-4 -top-4 text-zinc-500/5"><Activity size={100} /></div>
           <p className="text-xs font-black uppercase tracking-widest text-zinc-500 mb-2">Ações Encontradas</p>
           <h3 className="text-4xl font-black text-zinc-800 dark:text-white">{totalGeral}</h3>
        </div>
        <div className="bg-white dark:bg-[#111113] p-6 rounded-[1.5rem] border border-zinc-100 dark:border-zinc-800 shadow-sm relative overflow-hidden">
           <div className="absolute -right-4 -top-4 text-purple-500/5"><PackageOpen size={100} /></div>
           <p className="text-xs font-black uppercase tracking-widest text-zinc-500 mb-2">CAFs Emitidos</p>
           <h3 className="text-4xl font-black text-purple-500">{totalLancadas}</h3>
        </div>
        <div className="bg-white dark:bg-[#111113] p-6 rounded-[1.5rem] border border-zinc-100 dark:border-zinc-800 shadow-sm relative overflow-hidden">
           <div className="absolute -right-4 -top-4 text-amber-500/5"><PackageCheck size={100} /></div>
           <p className="text-xs font-black uppercase tracking-widest text-zinc-500 mb-2">Cargas Conferidas</p>
           <h3 className="text-4xl font-black text-amber-500">{totalConferidas}</h3>
        </div>
        <div className="bg-white dark:bg-[#111113] p-6 rounded-[1.5rem] border border-zinc-100 dark:border-zinc-800 shadow-sm relative overflow-hidden">
           <div className="absolute -right-4 -top-4 text-emerald-500/5"><Truck size={100} /></div>
           <p className="text-xs font-black uppercase tracking-widest text-zinc-500 mb-2">Caminhões Despachados</p>
           <h3 className="text-4xl font-black text-emerald-500">{totalLiberadas}</h3>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* GRÁFICO 1: DISTRIBUIÇÃO DE AÇÕES (ROSCA) */}
        <div className="bg-white dark:bg-[#111113] p-8 rounded-[2rem] shadow-sm border border-zinc-100 dark:border-zinc-800 xl:col-span-1 flex flex-col">
          <h3 className="text-lg font-black mb-2 text-zinc-800 dark:text-zinc-200 flex items-center gap-2">
            <PieChartIcon className="text-[#FF7A00]" /> Divisão do Trabalho
          </h3>
          <p className="text-xs font-bold text-zinc-500 mb-6">Proporção das etapas operacionais</p>
          
          <div className="flex-1 flex flex-col items-center justify-center min-h-[300px]">
            {totalGeral === 0 ? (
              <p className="text-zinc-500 font-bold text-sm">Sem dados para o gráfico</p>
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie data={dadosGraficoRosca} cx="50%" cy="50%" innerRadius={70} outerRadius={100} paddingAngle={5} dataKey="value" stroke="none">
                    {dadosGraficoRosca.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#111113', borderRadius: '12px', border: '1px solid #27272a', color: '#fff', fontWeight: 'bold' }} itemStyle={{ color: '#fff' }} />
                  {/* @ts-ignore */}
                  <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontWeight: 'bold', fontSize: '12px' }}/>
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* GRÁFICO 2: PRODUTIVIDADE POR FUNCIONÁRIO (BARRAS) */}
        <div className="bg-white dark:bg-[#111113] p-8 rounded-[2rem] shadow-sm border border-zinc-100 dark:border-zinc-800 xl:col-span-2 flex flex-col">
          <h3 className="text-lg font-black mb-2 text-zinc-800 dark:text-zinc-200 flex items-center gap-2">
            <User className="text-[#FF7A00]" /> Ranking da Equipe
          </h3>
          <p className="text-xs font-bold text-zinc-500 mb-6">Volume de cargas movimentadas por colaborador (Top 10)</p>
          
          <div className="flex-1 min-h-[300px]">
            {dadosGerais.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-zinc-400">
                <User size={48} className="mb-4 opacity-30" />
                <p className="font-bold text-sm">Nenhum funcionário encontrado nos filtros.</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dadosGerais} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#3f3f46" opacity={0.1} vertical={false} />
                  <XAxis dataKey="nome" tick={{ fill: '#71717a', fontWeight: 'bold', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#71717a', fontWeight: 'bold', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip cursor={{ fill: '#3f3f46', opacity: 0.1 }} contentStyle={{ backgroundColor: '#111113', borderRadius: '12px', border: '1px solid #27272a', color: '#fff', fontWeight: 'bold' }} />
                  {/* @ts-ignore */}
                  <Legend wrapperStyle={{ paddingTop: '10px', fontWeight: 'bold', fontSize: '11px' }} />
                  
                  <Bar dataKey="Lancadas" name="Emitiu CAF" stackId="a" fill="#8b5cf6" radius={[0, 0, 4, 4]} maxBarSize={50} />
                  <Bar dataKey="Conferidas" name="Conferiu Pátio" stackId="a" fill="#f59e0b" maxBarSize={50} />
                  <Bar dataKey="Liberadas" name="Despachou" stackId="a" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={50} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

      </div>

      {/* NOVA TABELA: HISTÓRICO "TUDINHO" ESTILO FEED */}
      <div className="bg-white dark:bg-[#111113] p-8 rounded-[2rem] shadow-sm border border-zinc-100 dark:border-zinc-800 flex flex-col h-[600px]">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-xl font-black text-zinc-800 dark:text-zinc-200 flex items-center gap-2">
              <History className="text-[#FF7A00]" /> Linha do Tempo Operacional
            </h3>
            <p className="text-xs font-bold text-zinc-500 mt-1">Exibindo cada etapa das transferências.</p>
          </div>
          <span className="hidden sm:block text-xs font-bold bg-[#FF7A00]/10 text-[#FF7A00] px-4 py-2 rounded-full border border-[#FF7A00]/20">
            {historicoDetalhado.length} Registros no Filtro
          </span>
        </div>

        <div className="flex-1 overflow-hidden relative border border-zinc-200 dark:border-zinc-800 rounded-2xl bg-[#f8f9fc] dark:bg-[#0b0e14]">
          <div className="absolute inset-0 overflow-y-auto p-4 custom-scrollbar space-y-3">
            {historicoDetalhado.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-zinc-400">
                <Search size={48} className="mb-4 opacity-30" />
                <p className="font-bold text-sm">Nenhuma atividade corresponde à sua pesquisa.</p>
              </div>
            ) : (
              historicoDetalhado.map((acao) => {
                const Icone = acao.icone;
                return (
                  <div key={acao.id} className="bg-white dark:bg-[#16161a] border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center gap-4 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors shadow-sm">
                    
                    {/* Ícone da Ação */}
                    <div className={`w-14 h-14 rounded-xl flex items-center justify-center shrink-0 border shadow-inner ${acao.corBg} ${acao.corTexto} ${acao.corBorda}`}>
                      <Icone size={26} />
                    </div>

                    {/* Informações da Ação */}
                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                      <p className={`text-[10px] font-black uppercase tracking-widest mb-1 ${acao.corTexto}`}>
                        {acao.tipo}
                      </p>
                      <h4 className="text-base font-black text-zinc-900 dark:text-white uppercase truncate flex items-center gap-2">
                        <User size={16} className="text-zinc-400" /> {acao.usuario}
                      </h4>
                    </div>

                    {/* Dados da Carga (CAF e Cidade) */}
                    <div className="sm:text-right border-t sm:border-t-0 sm:border-l border-zinc-200 dark:border-zinc-800 pt-3 sm:pt-0 sm:pl-6 flex flex-col justify-center">
                      <p className="text-sm font-black text-zinc-800 dark:text-zinc-200 flex items-center sm:justify-end gap-1.5 uppercase">
                        <Barcode size={16} className="text-[#FF7A00]" /> {acao.caf}
                      </p>
                      <p className="text-xs font-bold text-zinc-500 flex items-center sm:justify-end gap-1.5 uppercase mt-1 truncate">
                        <MapPin size={14} /> {acao.cidade}
                      </p>
                    </div>

                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

    </div>
  );
};