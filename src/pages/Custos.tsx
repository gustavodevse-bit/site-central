import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { TrendingDown, Plus, Download, FileText, Fuel, Briefcase, Trash2, Building2, CreditCard, Paperclip, FileCheck, CheckCircle, AlertTriangle, CalendarDays, XCircle, Search, Printer, Wallet, Pencil, BellRing, PieChart, Activity, Eye, EyeOff } from 'lucide-react';

export default function Custos() {
  const [custos, setCustos] = useState<any[]>([]);
  const [carregando, setCarregando] = useState(true);

  // 🟢 ESTADO PARA OCULTAR O DASHBOARD (Gráficos)
  const [mostrarDashboard, setMostrarDashboard] = useState(true);

  // Estados Modal Lançamento
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editandoId, setEditandoId] = useState<number | null>(null); 
  const [novoCusto, setNovoCusto] = useState({ 
    descricao: '', 
    empresaPagadora: '', 
    nomeFornecedor: '',     // 🟢 Separado do CNPJ
    documentoFornecedor: '', // 🟢 Campo com Máscara
    categoria: 'Operacional', 
    valor: '', data: '', status: 'Pendente', formaPagamento: ''
  });
  const [arquivoComprovante, setArquivoComprovante] = useState<File | null>(null);

  // ESTADOS DO PARCELAMENTO
  const [isParcelado, setIsParcelado] = useState(false);
  const [qtdParcelas, setQtdParcelas] = useState(2);

  // Estados Relatório
  const [modalRelatorio, setModalRelatorio] = useState(false);
  const [relDataInicio, setRelDataInicio] = useState('');
  const [relDataFim, setRelDataFim] = useState('');
  const [relCategoria, setRelCategoria] = useState('');
  const [relStatus, setRelStatus] = useState('');
  const [relEmpresa, setRelEmpresa] = useState('');
  const [exibirImpressao, setExibirImpressao] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : 'http://192.168.18.213:8081/api';

  const categoriasDiversificadas = [
    "Operacional", "Combustível", "Manutenção (Veículos)", "Manutenção Predial", "Pedágio", 
    "RH / Pagamentos", "Impostos / Taxas", "Alimentação", "Limpeza / Conservação",
    "Equipamentos / TI", "Material de Escritório", "Aluguel / Água / Luz", 
    "Marketing / Publicidade", "Seguros / IPVA", "Contabilidade / Jurídico", "Outros"
  ];

  const formasPagamento = ["PIX", "Boleto Bancário", "Cartão de Crédito", "Cartão de Débito", "Transferência TED/DOC", "Dinheiro"];

  const carregarCustos = async () => {
    try {
      setCarregando(true);
      const res = await fetch(`${API_URL}/custos`);
      const dados = await res.json();
      setCustos(dados);
    } catch (error) { console.error("Erro ao buscar custos", error); } 
    finally { setCarregando(false); }
  };

  useEffect(() => { carregarCustos(); }, []);

  // MEMÓRIA DE EMPRESAS
  const minhasEmpresasSalvas = useMemo(() => Array.from(new Set(custos.map(c => c.empresaPagadora).filter(Boolean))), [custos]);
  const fornecedoresSalvos = useMemo(() => {
    return Array.from(new Set(custos.map(c => {
       if(!c.empresa) return '';
       return c.empresa.split(' - ')[0]; // Puxa só o nome para a memória
    }).filter(Boolean)));
  }, [custos]);

  const todasEmpresas = useMemo(() => {
    const pagadoras = custos.map(c => c.empresaPagadora).filter(Boolean);
    const recebedoras = custos.map(c => c.empresa).filter(Boolean);
    return Array.from(new Set([...pagadoras, ...recebedoras])).sort();
  }, [custos]);

  // 🟢 FUNÇÃO DE MÁSCARA INTELIGENTE (CPF E CNPJ)
  const aplicarMascaraDocumento = (valor: string) => {
    let v = valor.replace(/\D/g, ''); // Remove tudo que não é número
    if (v.length <= 11) {
      // Máscara de CPF
      v = v.replace(/(\d{3})(\d)/, '$1.$2');
      v = v.replace(/(\d{3})(\d)/, '$1.$2');
      v = v.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    } else {
      // Máscara de CNPJ
      v = v.substring(0, 14); // Limita em 14 números
      v = v.replace(/^(\d{2})(\d)/, '$1.$2');
      v = v.replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3');
      v = v.replace(/\.(\d{3})(\d)/, '.$1/$2');
      v = v.replace(/(\d{4})(\d)/, '$1-$2');
    }
    return v;
  };

  const handleEditClick = (custo: any) => {
    setEditandoId(custo.id);
    setIsParcelado(false);
    
    // Separa o Nome e o CNPJ que estão salvos juntos no Java
    let nome = custo.empresa || '';
    let doc = '';
    if(nome.includes(' - ')) {
      const parts = nome.split(' - ');
      nome = parts[0];
      doc = parts[1];
    }

    setNovoCusto({
      descricao: custo.descricao || '', 
      empresaPagadora: custo.empresaPagadora || '', 
      nomeFornecedor: nome,
      documentoFornecedor: doc,
      categoria: custo.categoria || 'Operacional', 
      valor: custo.valor ? String(custo.valor) : '', 
      data: custo.data || '',
      status: custo.status || 'Pendente', 
      formaPagamento: custo.formaPagamento || ''
    });
    setArquivoComprovante(null); setIsModalOpen(true);
  };

  const handleNovoCustoClick = () => {
    setEditandoId(null); setIsParcelado(false); setQtdParcelas(2);
    setNovoCusto({ descricao: '', empresaPagadora: '', nomeFornecedor: '', documentoFornecedor: '', categoria: 'Operacional', valor: '', data: '', status: 'Pendente', formaPagamento: '' });
    setArquivoComprovante(null); setIsModalOpen(true);
  };

  const handleSalvar = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setCarregando(true);
      const valorTotal = parseFloat(novoCusto.valor.replace(',', '.'));
      
      // 🟢 Junta o nome e o documento para enviar ao Java num campo só
      const empresaFormatada = novoCusto.documentoFornecedor 
            ? `${novoCusto.nomeFornecedor} - ${novoCusto.documentoFornecedor}` 
            : novoCusto.nomeFornecedor;
      
      if (isParcelado && !editandoId && qtdParcelas > 1) {
          const valorParcela = valorTotal / qtdParcelas;
          const dataBase = new Date(novoCusto.data + 'T12:00:00'); 
          
          const promessas = [];
          for(let i = 1; i <= qtdParcelas; i++) {
              const dataDaParcela = new Date(dataBase);
              dataDaParcela.setMonth(dataDaParcela.getMonth() + (i - 1));
              
              const dadosParcela = {
                  descricao: `${novoCusto.descricao} (Parc. ${i}/${qtdParcelas})`,
                  empresaPagadora: novoCusto.empresaPagadora, 
                  empresa: empresaFormatada,
                  categoria: novoCusto.categoria, valor: valorParcela,
                  data: dataDaParcela.toISOString().split('T')[0],
                  status: 'Pendente', formaPagamento: ''
              };
              promessas.push(fetch(`${API_URL}/custos`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(dadosParcela) }));
          }
          await Promise.all(promessas);
      } 
      else {
          const dadosCusto = {
              descricao: novoCusto.descricao, 
              empresaPagadora: novoCusto.empresaPagadora, 
              empresa: empresaFormatada,
              categoria: novoCusto.categoria, valor: valorTotal, data: novoCusto.data,
              status: novoCusto.status, formaPagamento: novoCusto.status === 'Pago' ? novoCusto.formaPagamento : ''
          };
          const res = await fetch(editandoId ? `${API_URL}/custos/${editandoId}` : `${API_URL}/custos`, {
              method: editandoId ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(dadosCusto)
          });
          if (res.ok && arquivoComprovante) {
              const c = await res.json();
              const idUpload = editandoId ? editandoId : c.id;
              const formData = new FormData(); formData.append("file", arquivoComprovante);
              await fetch(`${API_URL}/custos/${idUpload}/comprovante`, { method: "POST", body: formData }).catch(e => console.log(e));
          }
      }

      setIsModalOpen(false); carregarCustos(); 
    } catch (error) { alert("Erro ao salvar o custo no banco de dados!"); }
  };

  const handleExcluir = async (id: number) => {
    if(window.confirm("Deseja realmente apagar esta despesa?")) {
      try { await fetch(`${API_URL}/custos/${id}`, { method: 'DELETE' }); carregarCustos(); } catch(e) { alert("Erro ao excluir."); }
    }
  };

  const gerarRelatorio = () => {
    if(!relDataInicio || !relDataFim) {
      alert("Por favor, preencha a Data Inicial e Final.");
      return;
    }
    setModalRelatorio(false);
    setExibirImpressao(true);
    setTimeout(() => {
      window.print();
      setExibirImpressao(false);
    }, 500);
  };

  const removerAcentos = (str: string) => {
    return str ? str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim() : "";
  };

  // ================= CÁLCULOS E GRÁFICOS =================
  const totalMes = custos.reduce((acc, curr) => acc + (Number(curr.valor) || 0), 0);
  const totalPendente = custos.filter(c => c.status === 'Pendente').reduce((acc, curr) => acc + (Number(curr.valor) || 0), 0);
  
  const rankCategorias = useMemo(() => {
    const agrupado: Record<string, number> = {};
    custos.forEach(c => { agrupado[c.categoria] = (agrupado[c.categoria] || 0) + Number(c.valor || 0); });
    return Object.entries(agrupado)
      .map(([nome, valor]) => ({ nome, valor }))
      .sort((a, b) => b.valor - a.valor)
      .slice(0, 5); 
  }, [custos]);
  const maiorValorGrafico = rankCategorias.length > 0 ? Math.max(...rankCategorias.map(c => c.valor)) : 1;

  const alertasVencimento = useMemo(() => {
    const hoje = new Date(); hoje.setHours(0,0,0,0);
    const daqui7Dias = new Date(hoje); daqui7Dias.setDate(daqui7Dias.getDate() + 7);
    
    return custos.filter(c => {
       if (c.status === 'Pago') return false;
       const d = new Date(c.data + 'T12:00:00');
       return d <= daqui7Dias;
    }).sort((a,b) => new Date(a.data).getTime() - new Date(b.data).getTime());
  }, [custos]);

  const custosRelatorio = custos.filter((c: any) => {
      const d = new Date(c.data); 
      const start = new Date(relDataInicio + 'T00:00:00'); 
      const end = new Date(relDataFim + 'T23:59:59');
      
      if (relDataInicio && relDataFim && (d < start || d > end)) return false;
      if (relCategoria && removerAcentos(c.categoria) !== removerAcentos(relCategoria)) return false;
      if (relStatus && c.status !== relStatus) return false;
      if (relEmpresa && !c.empresa?.toLowerCase().includes(relEmpresa.toLowerCase()) && !c.empresaPagadora?.toLowerCase().includes(relEmpresa.toLowerCase())) return false;
      
      return true;
  }).sort((a, b) => new Date(a.data).getTime() - new Date(b.data).getTime());

  const totalRelatorio = custosRelatorio.reduce((acc, curr) => acc + (Number(curr.valor) || 0), 0);
  const totalRelatorioPago = custosRelatorio.filter(c => c.status === 'Pago').reduce((acc, curr) => acc + (Number(curr.valor) || 0), 0);
  const totalRelatorioPendente = custosRelatorio.filter(c => c.status === 'Pendente').reduce((acc, curr) => acc + (Number(curr.valor) || 0), 0);

  return (
    <div className="w-full h-full flex flex-col gap-6 animate-in fade-in duration-300">
      
      <datalist id="lista-minhas-empresas">{minhasEmpresasSalvas.map(emp => <option key={emp as string} value={emp as string} />)}</datalist>
      <datalist id="lista-fornecedores">{fornecedoresSalvos.map(emp => <option key={emp as string} value={emp as string} />)}</datalist>

      {/* HEADER DE AÇÕES */}
      <div className="flex justify-between items-center bg-white dark:bg-[#0f1d33] p-5 rounded-2xl shadow-sm border border-slate-200 dark:border-[#1a2540] print:hidden">
        <div>
           <h1 className="text-xl font-black text-slate-800 dark:text-white flex items-center gap-2"><TrendingDown className="text-red-500"/> Gestão Financeira</h1>
           <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">Controle de Despesas, Parcelas e Pagamentos</p>
        </div>
        <div className="flex gap-3">
          
          {/* 🟢 BOTÃO DE OCULTAR/MOSTRAR DASHBOARD */}
          <button onClick={() => setMostrarDashboard(!mostrarDashboard)} className={`px-5 py-3 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 shadow-sm transition-all border ${mostrarDashboard ? 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50' : 'bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100'}`}>
            {mostrarDashboard ? <EyeOff size={16} /> : <Eye size={16} />}
            {mostrarDashboard ? 'Ocultar Resumo' : 'Mostrar Resumo'}
          </button>

          <button onClick={() => setModalRelatorio(true)} className="bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 px-5 py-3 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 shadow-sm transition-all">
            <FileText size={16} /> Relatórios
          </button>
          
          <button onClick={handleNovoCustoClick} className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 shadow-lg hover:shadow-red-600/30 transition-all hover:scale-105">
            <Plus size={18} /> Novo Lançamento
          </button>
        </div>
      </div>

      {/* 🟢 DASHBOARD (Ocultável) */}
      {mostrarDashboard && (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 print:hidden animate-in slide-in-from-top-4 fade-in duration-300">
          <div className="xl:col-span-1 flex flex-col gap-4">
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-6 rounded-3xl shadow-xl text-white relative overflow-hidden flex flex-col justify-center min-h-[160px]">
                <div className="absolute -right-6 -top-6 opacity-20"><Wallet size={120} /></div>
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1 relative z-10">Total de Custos (Acumulado)</p>
                <h3 className="text-4xl font-black text-white relative z-10 tracking-tight">
                  {totalMes.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </h3>
            </div>
            
            <div className="bg-white dark:bg-[#0f1d33] p-6 rounded-3xl shadow-sm border border-slate-200 dark:border-[#1a2540] flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-black text-red-500 uppercase tracking-widest mb-1 flex items-center gap-1"><AlertTriangle size={12}/> Títulos Pendentes</p>
                  <h3 className="text-2xl font-black text-slate-800 dark:text-white">
                    {totalPendente.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </h3>
                </div>
                <div className="w-14 h-14 bg-red-50 dark:bg-red-900/20 text-red-500 rounded-2xl flex items-center justify-center"><Briefcase size={24}/></div>
            </div>
          </div>

          <div className="xl:col-span-1 bg-white dark:bg-[#0f1d33] p-6 rounded-3xl shadow-sm border border-slate-200 dark:border-[#1a2540]">
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-500 flex items-center gap-2 mb-6"><PieChart size={14}/> Maiores Despesas por Categoria</h3>
            <div className="space-y-4">
                {rankCategorias.length === 0 ? <p className="text-slate-400 text-xs font-bold text-center mt-10">Sem dados suficientes.</p> : rankCategorias.map((cat, i) => (
                  <div key={i} className="flex flex-col gap-1.5">
                    <div className="flex justify-between items-end">
                        <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase truncate pr-2">{cat.nome}</span>
                        <span className="text-[11px] font-black text-blue-600">{cat.valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-[#1a2540] h-2.5 rounded-full overflow-hidden">
                        <div className="bg-blue-500 h-full rounded-full transition-all duration-1000" style={{ width: `${(cat.valor / maiorValorGrafico) * 100}%` }} />
                    </div>
                  </div>
                ))}
            </div>
          </div>

          <div className="xl:col-span-1 bg-white dark:bg-[#0f1d33] p-6 rounded-3xl shadow-sm border border-slate-200 dark:border-[#1a2540] flex flex-col">
            <h3 className="text-xs font-black uppercase tracking-widest text-red-500 flex items-center gap-2 mb-4"><BellRing size={14}/> Vencem nos próximos 7 dias</h3>
            <div className="flex-1 overflow-auto custom-scrollbar pr-2 space-y-3">
                {alertasVencimento.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-slate-400 opacity-70">
                      <CheckCircle size={40} className="mb-2"/>
                      <p className="text-xs font-black uppercase tracking-widest text-center">Tudo em dia!</p>
                  </div>
                ) : alertasVencimento.map(c => {
                  const dataVenc = new Date(c.data + 'T12:00:00');
                  const hoje = new Date(); hoje.setHours(0,0,0,0);
                  const diasRestantes = Math.ceil((dataVenc.getTime() - hoje.getTime()) / (1000 * 3600 * 24));
                  
                  const isAtrasado = diasRestantes < 0;
                  const badgeColor = isAtrasado ? 'bg-red-100 text-red-700 border-red-200' : (diasRestantes === 0 ? 'bg-orange-100 text-orange-700 border-orange-200' : 'bg-amber-50 text-amber-600 border-amber-200');
                  const badgeText = isAtrasado ? `${Math.abs(diasRestantes)} dias atrasado` : (diasRestantes === 0 ? 'Vence HOJE' : `Faltam ${diasRestantes} dias`);

                  return (
                    <div key={c.id} className="p-3 border border-slate-200 dark:border-[#253555] rounded-2xl flex items-center justify-between gap-3 bg-slate-50 dark:bg-[#1a2540]/30 transition-transform hover:-translate-x-1">
                        <div className="flex-1 min-w-0">
                          <p className="text-[11px] font-bold text-slate-800 dark:text-white truncate">{c.descricao}</p>
                          <p className="text-[9px] font-black uppercase text-slate-500 truncate mt-0.5">{c.empresa || c.categoria}</p>
                        </div>
                        <div className="flex flex-col items-end shrink-0 gap-1.5">
                          <span className="text-[11px] font-black text-slate-800 dark:text-white">{Number(c.valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                          <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-md border shadow-sm ${badgeColor}`}>{badgeText}</span>
                        </div>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      )}

      {/* TABELA DE REGISTOS */}
      <div className="flex-1 bg-white dark:bg-[#0f1d33] rounded-3xl border border-slate-200 dark:border-[#1a2540] shadow-sm flex flex-col overflow-hidden print:hidden transition-all duration-300">
        <div className="p-5 border-b border-slate-200 dark:border-[#1a2540] flex items-center justify-between bg-slate-50 dark:bg-[#1a2540]/30">
          <div className="flex items-center gap-2">
             <Activity size={18} className="text-blue-500" />
             <h3 className="font-black text-slate-800 dark:text-white uppercase tracking-widest text-sm">Extrato Geral</h3>
          </div>
        </div>
        
        <div className="flex-1 overflow-auto custom-scrollbar">
          {carregando ? (
            <div className="flex justify-center items-center h-64 text-slate-500 font-bold animate-pulse">Sincronizando com o Banco de Dados...</div>
          ) : (
            <table className="w-full text-left border-collapse min-w-[1000px]">
              <thead>
                <tr className="bg-white dark:bg-[#0f1d33] text-[9px] uppercase font-black tracking-widest text-slate-400 border-b-2 border-slate-100 dark:border-[#1a2540]">
                  <th className="p-4">Descrição da Despesa</th>
                  <th className="p-4">Origem & Destino</th>
                  <th className="p-4">Categoria</th>
                  <th className="p-4 text-center">Data Vencimento</th>
                  <th className="p-4 text-right">Valor (R$)</th>
                  <th className="p-4 text-center">Situação</th>
                  <th className="p-4 text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="text-xs font-medium text-slate-700 dark:text-slate-300 divide-y divide-slate-100 dark:divide-[#1a2540]">
                {custos.length === 0 ? (
                  <tr><td colSpan={7} className="text-center p-10 text-slate-400 font-bold">Nenhum custo registado ainda.</td></tr>
                ) : custos.sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime()).map((custo) => (
                  <tr key={custo.id} className="hover:bg-slate-50 dark:hover:bg-[#1a2540]/50 transition-colors group">
                    <td className="p-4">
                       <p className="font-bold text-slate-900 dark:text-white max-w-[250px] truncate" title={custo.descricao}>{custo.descricao}</p>
                    </td>
                    
                    <td className="p-4">
                      <div className="flex flex-col gap-1.5">
                         <div className="flex flex-col">
                            <span className="text-[8px] font-black uppercase text-blue-600 tracking-widest">Pago Por</span>
                            <span className="font-bold text-slate-800 dark:text-slate-300 truncate max-w-[200px]">{custo.empresaPagadora || '---'}</span>
                         </div>
                         <div className="flex flex-col border-t border-slate-100 dark:border-slate-700 pt-1">
                            <span className="text-[8px] font-black uppercase text-slate-500 tracking-widest">Fornecedor</span>
                            <span className="font-bold text-slate-600 dark:text-slate-400 truncate max-w-[200px]">{custo.empresa || '---'}</span>
                         </div>
                      </div>
                    </td>

                    <td className="p-4">
                      <span className="bg-slate-100 dark:bg-[#253555] px-2.5 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-transparent">
                        {custo.categoria}
                      </span>
                    </td>
                    <td className="p-4 text-center font-bold text-slate-500">{custo.data?.split('-').reverse().join('/')}</td>
                    <td className="p-4 text-right font-black text-slate-800 dark:text-white text-sm">
                      {Number(custo.valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </td>
                    <td className="p-4">
                       <div className="flex flex-col items-center justify-center gap-1">
                          <span className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest border shadow-sm ${
                            custo.status === 'Pago' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-red-50 text-red-600 border-red-200'
                          }`}>
                            {custo.status}
                          </span>
                          {custo.status === 'Pago' && custo.formaPagamento && (
                             <span className="text-[8px] font-black uppercase tracking-widest text-slate-400">{custo.formaPagamento}</span>
                          )}
                       </div>
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex items-center justify-center gap-2 opacity-100 xl:opacity-0 group-hover:opacity-100 transition-opacity">
                        {custo.status === 'Pago' && custo.caminhoComprovante && (
                          <button className="text-blue-500 hover:text-white bg-blue-50 hover:bg-blue-600 p-2 rounded-xl border border-blue-200 shadow-sm transition-all" title="Ver Comprovante">
                             <Paperclip size={14} />
                          </button>
                        )}
                        <button onClick={() => handleEditClick(custo)} className="text-slate-500 hover:text-white bg-slate-50 hover:bg-slate-600 p-2 rounded-xl border border-slate-200 shadow-sm transition-all" title="Editar">
                          <Pencil size={14} />
                        </button>
                        <button onClick={() => handleExcluir(custo.id)} className="text-red-500 hover:text-white bg-red-50 hover:bg-red-600 p-2 rounded-xl border border-red-200 shadow-sm transition-all" title="Excluir">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* 🛑 MODAL DE LANÇAMENTO (CRIAR / EDITAR) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm print:hidden p-4">
          <form onSubmit={handleSalvar} className="bg-white dark:bg-[#0f1d33] w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 dark:border-[#1a2540] overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 dark:border-[#1a2540] bg-slate-50 dark:bg-[#070d1a] flex justify-between items-center">
              <h2 className="font-black text-lg text-slate-800 dark:text-white uppercase tracking-widest flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center"><Wallet size={20}/></div>
                {editandoId ? 'Editar Despesa' : 'Lançamento Financeiro'}
              </h2>
              <button type="button" onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-red-500 transition-colors"><XCircle size={24}/></button>
            </div>
            
            <div className="p-8 space-y-6 max-h-[75vh] overflow-y-auto custom-scrollbar">
              
              <div className="col-span-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-2 block">Descrição da Despesa</label>
                <input required type="text" value={novoCusto.descricao} onChange={e => setNovoCusto({...novoCusto, descricao: e.target.value})} className="w-full px-4 py-3 bg-white dark:bg-[#1a2540] border-2 border-slate-200 dark:border-[#253555] rounded-xl text-sm font-bold text-slate-800 dark:text-white outline-none focus:border-blue-500 transition-all shadow-sm" placeholder="Ex: Conserto do Motor Van 03" />
              </div>

              <div className="col-span-2">
                 <label className="text-[10px] font-black uppercase tracking-widest text-blue-600 dark:text-blue-400 mb-2 flex items-center gap-1"><Building2 size={14}/> Nossa Empresa (Pagador)</label>
                 <input required list="lista-minhas-empresas" type="text" value={novoCusto.empresaPagadora} onChange={e => setNovoCusto({...novoCusto, empresaPagadora: e.target.value})} className="w-full px-4 py-3 bg-white dark:bg-[#1a2540] border-2 border-slate-200 dark:border-[#253555] rounded-xl text-sm font-bold text-slate-800 dark:text-white outline-none focus:border-blue-500 transition-all shadow-sm" placeholder="Ex: Nordex Matriz / CNPJ..." />
              </div>

              <div className="grid grid-cols-2 gap-5 p-4 bg-slate-50 dark:bg-[#1a2540]/30 rounded-2xl border border-slate-200 dark:border-[#253555]">
                <div className="col-span-2">
                   <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-4 flex items-center gap-1"><Briefcase size={14}/> Dados do Fornecedor (Recebedor)</p>
                </div>
                
                {/* 🟢 NOME DO FORNECEDOR */}
                <div className="col-span-1">
                  <label className="text-[9px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-1.5 block">Nome da Empresa / Pessoa</label>
                  <input required list="lista-fornecedores" type="text" value={novoCusto.nomeFornecedor} onChange={e => setNovoCusto({...novoCusto, nomeFornecedor: e.target.value})} className="w-full px-4 py-2.5 bg-white dark:bg-[#1a2540] border-2 border-slate-200 dark:border-[#253555] rounded-xl text-sm font-bold text-slate-800 dark:text-white outline-none focus:border-blue-500 transition-all shadow-sm" placeholder="Ex: Posto Ipiranga..." />
                </div>

                {/* 🟢 CNPJ / CPF (MASCARADO E OPCIONAL) */}
                <div className="col-span-1">
                  <label className="text-[9px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-1.5 flex justify-between items-end">
                     <span>CPF / CNPJ</span>
                     <span className="text-[8px] text-slate-400">(Opcional)</span>
                  </label>
                  <input type="text" maxLength={18} value={novoCusto.documentoFornecedor} onChange={e => setNovoCusto({...novoCusto, documentoFornecedor: aplicarMascaraDocumento(e.target.value)})} className="w-full px-4 py-2.5 bg-white dark:bg-[#1a2540] border-2 border-slate-200 dark:border-[#253555] rounded-xl text-sm font-bold text-slate-800 dark:text-white outline-none focus:border-blue-500 transition-all shadow-sm" placeholder="000.000.000-00" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-5">
                <div className="col-span-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-2 block">Categoria</label>
                  <select value={novoCusto.categoria} onChange={e => setNovoCusto({...novoCusto, categoria: e.target.value})} className="w-full px-4 py-3 bg-white dark:bg-[#1a2540] border-2 border-slate-200 dark:border-[#253555] rounded-xl text-sm font-bold text-slate-800 dark:text-white outline-none focus:border-blue-500 transition-all shadow-sm cursor-pointer">
                    {categoriasDiversificadas.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                <div className="col-span-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-2 block">Data de Vencimento/Emissão</label>
                  <input required type="date" value={novoCusto.data} onChange={e => setNovoCusto({...novoCusto, data: e.target.value})} className="w-full px-4 py-3 bg-white dark:bg-[#1a2540] border-2 border-slate-200 dark:border-[#253555] rounded-xl text-sm font-bold text-slate-800 dark:text-white outline-none focus:border-blue-500 transition-all shadow-sm" />
                </div>
              </div>

              {/* INTELIGÊNCIA DE VALOR E PARCELAMENTO */}
              <div className="bg-slate-50 dark:bg-[#1a2540]/50 p-5 rounded-2xl border border-slate-200 dark:border-[#253555]">
                 <div className="flex justify-between items-center mb-4">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Valor Total (R$)</label>
                    {!editandoId && (
                       <label className="flex items-center gap-2 cursor-pointer">
                         <input type="checkbox" checked={isParcelado} onChange={e => setIsParcelado(e.target.checked)} className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500" />
                         <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-widest">Compra Parcelada?</span>
                       </label>
                    )}
                 </div>

                 <div className="grid grid-cols-2 gap-4">
                    <input required type="text" value={novoCusto.valor} onChange={e => setNovoCusto({...novoCusto, valor: e.target.value})} className={`w-full px-4 py-3 bg-white dark:bg-[#1a2540] border-2 rounded-xl text-xl font-black outline-none transition-all shadow-sm ${isParcelado ? 'col-span-1 border-slate-200 text-slate-800 focus:border-blue-500' : 'col-span-2 border-blue-200 text-blue-600 focus:border-blue-600 bg-blue-50/50'}`} placeholder="0.00" />
                    
                    {isParcelado && (
                      <div className="col-span-1 flex flex-col justify-center">
                         <label className="text-[9px] font-black uppercase tracking-widest text-blue-600 mb-1">Qtd. Parcelas (Meses)</label>
                         <input required type="number" min="2" max="120" value={qtdParcelas} onChange={e => setQtdParcelas(Number(e.target.value))} className="w-full px-4 py-3 bg-white dark:bg-[#1a2540] border-2 border-blue-200 rounded-xl text-lg font-black text-blue-600 outline-none focus:border-blue-500 transition-all shadow-sm" />
                      </div>
                    )}
                 </div>
                 {isParcelado && (
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-3 flex items-center gap-1.5"><AlertTriangle size={12} className="text-amber-500"/> O sistema dividirá o valor e criará {qtdParcelas} contas pendentes com vencimentos mensais.</p>
                 )}
              </div>

              {/* STATUS DO TÍTULO E PAGAMENTO */}
              {!isParcelado && (
                <div className="bg-slate-50 dark:bg-[#1a2540]/50 p-5 rounded-2xl border border-slate-200 dark:border-[#253555] space-y-4">
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-2 block">Status do Lançamento</label>
                    <select value={novoCusto.status} onChange={e => setNovoCusto({...novoCusto, status: e.target.value})} className={`w-full px-4 py-3 border-2 rounded-xl text-sm font-black outline-none transition-all shadow-sm cursor-pointer ${novoCusto.status === 'Pago' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-red-50 border-red-200 text-red-700'}`}>
                      <option value="Pendente">⏳ A PAGAR / PENDENTE</option>
                      <option value="Pago">✅ PAGO / BAIXADO</option>
                    </select>
                  </div>

                  {novoCusto.status === 'Pago' && (
                    <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-200 dark:border-[#253555] animate-in fade-in slide-in-from-top-2">
                      <div className="col-span-1">
                        <label className="text-[10px] font-black uppercase tracking-widest text-emerald-600 mb-2 flex items-center gap-1"><CreditCard size={14}/> Forma de Pagamento</label>
                        <select required value={novoCusto.formaPagamento} onChange={e => setNovoCusto({...novoCusto, formaPagamento: e.target.value})} className="w-full px-4 py-3 bg-white dark:bg-[#1a2540] border-2 border-emerald-200 rounded-xl text-sm font-bold text-slate-800 dark:text-white outline-none focus:border-emerald-500 transition-all shadow-sm cursor-pointer">
                          <option value="">Selecione...</option>
                          {formasPagamento.map(f => <option key={f} value={f}>{f}</option>)}
                        </select>
                      </div>
                      <div className="col-span-1">
                        <label className="text-[10px] font-black uppercase tracking-widest text-emerald-600 mb-2 flex items-center gap-1"><Paperclip size={14}/> Comprovante</label>
                        <div className="w-full h-[46px] border-2 border-dashed border-emerald-300 rounded-xl bg-emerald-50 hover:bg-emerald-100 transition-colors cursor-pointer relative flex items-center justify-center">
                            <input type="file" accept="image/*,.pdf" onChange={(e) => setArquivoComprovante(e.target.files ? e.target.files[0] : null)} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                            {arquivoComprovante ? <span className="text-[10px] font-black text-emerald-700 truncate px-4">{arquivoComprovante.name}</span> : <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">Anexar Ficheiro</span>}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

            </div>
            
            <div className="p-6 border-t border-slate-100 dark:border-[#1a2540] bg-white dark:bg-[#070d1a] flex justify-end gap-3">
              <button type="button" onClick={() => setIsModalOpen(false)} className="px-8 py-3.5 bg-slate-100 text-slate-600 font-black uppercase tracking-widest rounded-xl hover:bg-slate-200 transition-colors shadow-sm text-xs">Cancelar</button>
              <button type="submit" className="px-8 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-black uppercase tracking-widest rounded-xl transition-colors shadow-lg flex items-center justify-center gap-2 text-xs">
                <CheckCircle size={18}/> {editandoId ? 'Atualizar Despesa' : 'Processar Lançamento'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 🛑 MODAL DE RELATÓRIO AVANÇADO */}
      {modalRelatorio && document.body && createPortal(
         <div className="fixed inset-0 z-[999999] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm print:hidden p-4">
           <div className="bg-white p-8 rounded-[2rem] w-full max-w-md shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-300">
             <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-6 mx-auto"><FileText size={32} /></div>
             <h3 className="font-black text-2xl mb-1 text-center text-slate-800">Relatório de Custos</h3>
             <p className="text-slate-500 text-center text-sm mb-6">Filtre os lançamentos financeiros para gerar a impressão.</p>

             <div className="space-y-4">
                <div className="flex gap-3">
                  <div className="flex-1">
                    <label className="text-[10px] font-black uppercase text-slate-500 ml-2 mb-1 block">Data Inicial</label>
                    <input type="date" value={relDataInicio} onChange={e=>setRelDataInicio(e.target.value)} className="w-full bg-slate-50 text-slate-800 px-4 py-3 rounded-xl outline-none border border-slate-200 font-bold focus:border-blue-500 transition-colors" />
                  </div>
                  <div className="flex-1">
                    <label className="text-[10px] font-black uppercase text-slate-500 ml-2 mb-1 block">Data Final</label>
                    <input type="date" value={relDataFim} onChange={e=>setRelDataFim(e.target.value)} className="w-full bg-slate-50 text-slate-800 px-4 py-3 rounded-xl outline-none border border-slate-200 font-bold focus:border-blue-500 transition-colors" />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase text-slate-500 ml-2 mb-1 block">Filtrar Categoria (Opcional)</label>
                  <select value={relCategoria} onChange={e=>setRelCategoria(e.target.value)} className="w-full bg-slate-50 text-slate-800 px-4 py-3 rounded-xl outline-none border border-slate-200 font-bold cursor-pointer focus:border-blue-500 transition-colors">
                    <option value="">Todas as Categorias</option>
                    {categoriasDiversificadas.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase text-slate-500 ml-2 mb-1 block">Buscar Empresa/CNPJ (Opcional)</label>
                  <select value={relEmpresa} onChange={e=>setRelEmpresa(e.target.value)} className="w-full bg-slate-50 text-slate-800 px-4 py-3 rounded-xl outline-none border border-slate-200 font-bold cursor-pointer focus:border-blue-500 transition-colors">
                    <option value="">Todas as Empresas</option>
                    {todasEmpresas.map(emp => <option key={emp as string} value={emp as string}>{emp}</option>)}
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase text-slate-500 ml-2 mb-1 block">Status</label>
                  <select value={relStatus} onChange={e=>setRelStatus(e.target.value)} className="w-full bg-slate-50 text-slate-800 px-4 py-3 rounded-xl outline-none border border-slate-200 font-bold cursor-pointer focus:border-blue-500 transition-colors">
                    <option value="">Ambos (Pagos e Pendentes)</option>
                    <option value="Pago">Somente Pagos</option>
                    <option value="Pendente">Somente Pendentes</option>
                  </select>
                </div>
             </div>

             <div className="flex gap-3 mt-8">
               <button onClick={() => setModalRelatorio(false)} className="flex-1 bg-white border border-slate-200 text-slate-600 font-bold py-4 rounded-xl text-sm hover:bg-slate-50 transition">Cancelar</button>
               <button onClick={gerarRelatorio} className="flex-[2] bg-blue-600 hover:bg-blue-700 text-white font-black py-4 rounded-xl shadow-md flex items-center justify-center gap-2 transition-colors uppercase tracking-widest text-xs">
                 <Printer size={16} /> Gerar PDF
               </button>
             </div>
           </div>
         </div>, document.body
      )}

      {/* 🖨️ TELA DE IMPRESSÃO DO RELATÓRIO A4 */}
      {exibirImpressao && document.body && createPortal(
         <div id="relatorio-custos" className="fixed inset-0 z-[9999999] flex flex-col bg-white text-black overflow-y-auto p-8 print:p-0 print:static print:block w-full h-full">
            <style type="text/css" media="print">
               {`
                 @page { size: A4 portrait; margin: 15mm; }
                 #root { display: none !important; }
                 html, body { background: white !important; margin: 0 !important; padding: 0 !important; height: auto !important; }
                 .print-controls { display: none !important; }
               `}
            </style>
            
            <div className="w-full max-w-[210mm] mx-auto bg-white p-8 shadow-2xl print:shadow-none print:p-0">
               <div className="flex justify-between items-end border-b-4 border-slate-800 pb-4 mb-6">
                 <div>
                   <h1 className="text-3xl font-black uppercase tracking-tight text-slate-900">Relatório Financeiro</h1>
                   <p className="text-sm font-bold uppercase tracking-widest text-slate-500 mt-1">NORDEX LOGÍSTICA</p>
                 </div>
                 <div className="text-right">
                    <h2 className="text-lg font-bold border-2 border-slate-200 px-4 py-1.5 rounded-lg bg-slate-50">
                      {relDataInicio ? `${relDataInicio.split('-').reverse().join('/')} até ${relDataFim.split('-').reverse().join('/')}` : 'Geral (Sem filtro de data)'}
                    </h2>
                 </div>
               </div>

               {/* RESUMO DOS CÁLCULOS */}
               <div className="flex justify-between gap-4 mb-8">
                  <div className="border-2 border-slate-800 p-4 rounded-xl flex-1 text-center bg-slate-50">
                     <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Total de Despesas</p>
                     <p className="text-2xl font-black mt-1">{totalRelatorio.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
                  </div>
                  <div className="border-2 border-emerald-600 p-4 rounded-xl flex-1 text-center bg-emerald-50">
                     <p className="text-[10px] font-black uppercase tracking-widest text-emerald-700">Total Pago</p>
                     <p className="text-2xl font-black mt-1 text-emerald-700">{totalRelatorioPago.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
                  </div>
                  <div className="border-2 border-red-600 p-4 rounded-xl flex-1 text-center bg-red-50">
                     <p className="text-[10px] font-black uppercase tracking-widest text-red-700">Total Pendente</p>
                     <p className="text-2xl font-black mt-1 text-red-700">{totalRelatorioPendente.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
                  </div>
               </div>

               <table className="w-full border-collapse border border-slate-800 text-xs">
                 <thead>
                   <tr className="bg-slate-200 text-slate-900 uppercase">
                     <th className="border border-slate-800 px-3 py-2 text-left">Data</th>
                     <th className="border border-slate-800 px-3 py-2 text-left w-1/3">Origem & Destino</th>
                     <th className="border border-slate-800 px-3 py-2 text-left">Descrição</th>
                     <th className="border border-slate-800 px-3 py-2 text-center">Categoria</th>
                     <th className="border border-slate-800 px-3 py-2 text-center">Pagamento</th>
                     <th className="border border-slate-800 px-3 py-2 text-right">Valor</th>
                   </tr>
                 </thead>
                 <tbody>
                   {custosRelatorio.map((c: any) => (
                     <tr key={c.id} className="border-b border-slate-400">
                        <td className="border border-slate-800 px-3 py-2 text-left font-bold">{c.data.split('-').reverse().join('/')}</td>
                        <td className="border border-slate-800 px-3 py-2 text-left uppercase text-[10px]">
                          <span className="font-bold text-slate-500">PAGO POR:</span> <br/>{c.empresaPagadora || '---'} <br/>
                          <span className="font-bold text-slate-500 mt-1 block">DESTINO:</span> {c.empresa || '---'}
                        </td>
                        <td className="border border-slate-800 px-3 py-2 text-left uppercase text-[10px] font-bold">{c.descricao}</td>
                        <td className="border border-slate-800 px-3 py-2 text-center text-[10px] uppercase font-bold text-slate-600">{c.categoria}</td>
                        <td className="border border-slate-800 px-3 py-2 text-center">
                           <span className={`font-black uppercase text-[10px] ${c.status === 'Pago' ? 'text-emerald-700' : 'text-red-600'}`}>{c.status}</span>
                           {c.status === 'Pago' && <span className="block text-[8px] text-slate-500 font-bold">{c.formaPagamento}</span>}
                        </td>
                        <td className="border border-slate-800 px-3 py-2 text-right font-black whitespace-nowrap">
                           {Number(c.valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </td>
                     </tr>
                   ))}
                   {custosRelatorio.length === 0 && (
                     <tr><td colSpan={6} className="text-center py-10 font-bold text-slate-400 border border-slate-800">Nenhuma despesa encontrada para este filtro.</td></tr>
                   )}
                 </tbody>
               </table>

               <div className="mt-16 flex justify-around w-full">
                  <div className="text-center w-[40%]">
                     <div className="border-t-2 border-black pt-2 font-black uppercase text-xs">Visto da Diretoria / Finanças</div>
                  </div>
               </div>
            </div>

            <div className="print-controls fixed bottom-10 right-10 flex gap-4">
               <button onClick={() => setExibirImpressao(false)} className="bg-slate-800 text-white p-4 rounded-full shadow-lg hover:scale-105 transition-all"><XCircle size={24}/></button>
               <button onClick={() => window.print()} className="bg-blue-600 text-white px-6 py-4 rounded-full font-black shadow-lg hover:scale-105 transition-all flex items-center gap-2"><Printer size={20}/> Confirmar Impressão</button>
            </div>
         </div>, document.body
      )}

    </div>
  );
}