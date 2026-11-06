import React, { useState, useEffect } from 'react';
import { 
  Save, Paperclip, Printer, Search, ArrowLeft, 
  User, ShieldAlert, FolderOpen, Check, Calendar 
} from 'lucide-react';

const historicoMock = [
  {
    nome: "Alan Karlson", iniciais: "AK", corAvatar: "bg-amber-500", status: "EM ATENÇÃO", departamento: "Operações / Entrega",
    advertencias: [
      { id: 1, data: "10/05/2026", tipo: "Advertência Verbal", motivo: "Atraso de 40 minutos na chegada para carregamento sem justificativa prévia." },
      { id: 2, data: "15/05/2026", tipo: "Advertência Escrita", motivo: "Falta de uso de EPI (botas de segurança e colete) durante a movimentação no pátio logístico." }
    ]
  },
  {
    nome: "Josias Teles", iniciais: "JT", corAvatar: "bg-blue-600", status: "REGULAR", departamento: "Frota",
    advertencias: [
      { id: 3, data: "02/03/2026", tipo: "Advertência Verbal", motivo: "Não preenchimento do checklist do veículo ao final do turno diário." }
    ]
  },
  {
    nome: "Marcio Bispo", iniciais: "MB", corAvatar: "bg-red-500", status: "CRÍTICO", departamento: "Operações / Entrega",
    advertencias: [
      { id: 4, data: "20/04/2026", tipo: "Suspensão Disciplinar", motivo: "Excesso de velocidade com o veículo da empresa registrado na telemetria (acima de 110km/h em via de 80km/h)." },
      { id: 5, data: "22/04/2026", tipo: "Advertência Escrita", motivo: "Discussão com a equipe de pátio." },
      { id: 6, data: "25/04/2026", tipo: "Suspensão Disciplinar", motivo: "Falta injustificada." }
    ]
  }
];

export default function Advertencias() {
  const [abaAtiva, setAbaAtiva] = useState<'novo' | 'historico'>('historico');
  const [pastaSelecionada, setPastaSelecionada] = useState<string | null>(null);
  const [busca, setBusca] = useState('');
  
  const [historicoReal, setHistoricoReal] = useState<any[]>(historicoMock);

  const [nome, setNome] = useState('');
  const [tipo, setTipo] = useState('');
  const [motivo, setMotivo] = useState('');
  const [arquivo, setArquivo] = useState<File | null>(null);

  const [dadosImpressao, setDadosImpressao] = useState({ nome: '', tipo: '', motivo: '', data: '' });

  const carregarDados = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/advertencias/listar`);
      if (response.ok) {
        const dados = await response.json();
        
        const mapAgrupado = new Map<string, any>();
        dados.forEach((d: any) => {
          if (!mapAgrupado.has(d.nomeColaborador)) {
            mapAgrupado.set(d.nomeColaborador, {
              nome: d.nomeColaborador,
              iniciais: d.nomeColaborador.substring(0, 2).toUpperCase(),
              departamento: "Operações",
              advertencias: []
            });
          }
          const obj = mapAgrupado.get(d.nomeColaborador);
          obj.advertencias.push({
            id: d.id,
            data: new Date(d.dataRegistro).toLocaleDateString('pt-BR'),
            tipo: d.tipo,
            motivo: d.motivo
          });
        });

        const listaFinal = Array.from(mapAgrupado.values()).map((item: any) => {
          if (item.advertencias.length >= 3) { item.status = "CRÍTICO"; item.corAvatar = "bg-red-500"; }
          else if (item.advertencias.length === 2) { item.status = "EM ATENÇÃO"; item.corAvatar = "bg-amber-500"; }
          else { item.status = "REGULAR"; item.corAvatar = "bg-blue-600"; }
          return item;
        });

        if (listaFinal.length > 0) setHistoricoReal(listaFinal);
      }
    } catch (error) {
      console.log("Usando simulador.");
    }
  };

  useEffect(() => { carregarDados(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { nomeColaborador: nome, tipo, motivo };

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/advertencias/gravar`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
      });
      if (response.ok) {
        alert('Registro disciplinar gravado com sucesso no Banco de Dados!');
        carregarDados();
        setNome(''); setTipo(''); setMotivo(''); setArquivo(null);
      }
    } catch (error) {
      alert('Registro salvo! (Modo Simulação ativado, servidor backend off-line).');
      setNome(''); setTipo(''); setMotivo(''); setArquivo(null);
    }
  };

  const dispararImpressao = (nomeImp: string, tipoImp: string, motivoImp: string, dataImp: string) => {
    setDadosImpressao({ nome: nomeImp, tipo: tipoImp, motivo: motivoImp, data: dataImp });
    setTimeout(() => window.print(), 100);
  };

  const handleImprimirNovo = () => {
    if (!nome || !tipo || !motivo) return alert('Preencha os dados.');
    const dataAtual = new Date().toLocaleDateString('pt-BR');
    dispararImpressao(nome, tipo, motivo, dataAtual);
  };

  const pastaDetalhes = historicoReal.find(h => h.nome === pastaSelecionada);
  const historicoFiltrado = historicoReal.filter(h => h.nome.toLowerCase().includes(busca.toLowerCase()));

  return (
    // 🟢 MUDANÇA AQUI: Adicionado "print:block print:h-auto print:overflow-visible" para liberar o papel
    <div className="w-full h-full overflow-y-auto custom-scrollbar pr-2 pb-12 flex flex-col font-sans text-slate-800 dark:text-slate-200 print:block print:h-auto print:overflow-visible print:p-0">
      
      {/* 🟢 COMANDO MÁGICO PARA REMOVER URL/IP DA IMPRESSÃO */}
      <style>
        {`
          @media print {
            @page { margin: 0; size: auto; }
            body { padding: 1.5cm; } 
          }
        `}
      </style>

      {/* HEADER */}
      <div className="print:hidden shrink-0 mt-2">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-red-500 p-2 rounded-lg shadow-sm shadow-red-500/20">
            <ShieldAlert className="text-white h-5 w-5" strokeWidth={2} />
          </div>
          <div>
            <h1 className="text-[19px] font-black tracking-tight uppercase leading-none text-slate-800 dark:text-[#f1f5f9]">
              Controle Disciplinar de RH
            </h1>
            <span className="text-[12px] font-medium text-slate-500 dark:text-[#94a3b8] mt-1 block">
              Emissão de termos corporativos e dossiê de colaboradores
            </span>
          </div>
        </div>

        <div className="flex border-b border-slate-200 dark:border-[#1a2540]">
          <button
            onClick={() => setAbaAtiva('novo')}
            className={`px-5 py-2.5 text-[12px] font-bold border-b-2 transition-colors -mb-[1px] ${
              abaAtiva === 'novo' ? 'border-red-500 text-red-500' : 'border-transparent text-slate-500 dark:text-[#6b7280] hover:text-slate-700'
            }`}
          >
            Emitir Novo Termo
          </button>
          <button
            onClick={() => { setAbaAtiva('historico'); setPastaSelecionada(null); }}
            className={`px-5 py-2.5 text-[12px] font-bold border-b-2 transition-colors -mb-[1px] ${
              abaAtiva === 'historico' ? 'border-red-500 text-red-500' : 'border-transparent text-slate-500 dark:text-[#6b7280] hover:text-slate-700'
            }`}
          >
            Base de Dados / Histórico
          </button>
        </div>
      </div>

      {/* ABA 1 */}
      {abaAtiva === 'novo' && (
        <div className="print:hidden bg-white dark:bg-[#0c1428] border border-slate-300 dark:border-[#1a2540] rounded-[8px] shadow-sm flex-1 mt-6 mb-6">
          <div className="px-5 py-4 border-b border-slate-200 dark:border-[#1a2540] bg-slate-50 dark:bg-[#0f1d33] flex items-center justify-between rounded-t-[8px]">
            <h2 className="text-[12px] font-black uppercase tracking-wider text-slate-700 dark:text-[#f1f5f9]">Dados da Infração</h2>
            <button type="button" onClick={handleImprimirNovo} className="flex items-center gap-2 bg-white dark:bg-[#1a2540] border border-slate-300 dark:border-[#253555] hover:bg-slate-50 dark:hover:bg-[#253555] text-slate-700 dark:text-[#e2e8f0] px-4 py-1.5 rounded-[6px] text-[11px] font-bold transition-all shadow-sm">
              <Printer size={13} /> Imprimir Rascunho
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="flex flex-col">
                <label className="text-[10px] font-bold text-slate-600 dark:text-[#94a3b8] uppercase tracking-widest mb-1.5">Colaborador Infrator *</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User size={14} className="text-slate-400" />
                  </div>
                  <input
                    type="text" required value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Busque ou digite o nome completo..."
                    className="w-full pl-9 pr-3 py-2 bg-white dark:bg-[#0f1d33] border border-slate-300 dark:border-[#253555] rounded-[6px] focus:ring-1 focus:ring-red-500 outline-none text-[12px] text-slate-800 dark:text-[#f1f5f9] font-medium"
                  />
                </div>
              </div>

              <div className="flex flex-col">
                <label className="text-[10px] font-bold text-slate-600 dark:text-[#94a3b8] uppercase tracking-widest mb-1.5">Classificação da Medida *</label>
                <select
                  required value={tipo} onChange={(e) => setTipo(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-[#0f1d33] border border-slate-300 dark:border-[#253555] rounded-[6px] focus:ring-1 focus:ring-red-500 outline-none text-[12px] text-slate-800 dark:text-[#f1f5f9] font-medium"
                >
                  <option value="" disabled>Selecione a gravidade...</option>
                  <option value="Advertência Verbal">Advertência Verbal</option>
                  <option value="Advertência Escrita">Advertência Escrita</option>
                  <option value="Suspensão Disciplinar">Suspensão Disciplinar</option>
                  <option value="Demissão por Justa Causa">Demissão por Justa Causa</option>
                </select>
              </div>
            </div>

            <div className="flex flex-col mb-6">
              <label className="text-[10px] font-bold text-slate-600 dark:text-[#94a3b8] uppercase tracking-widest mb-1.5">Parecer / Fundamentação Legal *</label>
              <textarea
                required rows={4} value={motivo} onChange={(e) => setMotivo(e.target.value)} placeholder="Descreva o fato objetivo ocorrido..."
                className="w-full px-4 py-3 bg-white dark:bg-[#0f1d33] border border-slate-300 dark:border-[#253555] rounded-[6px] focus:ring-1 focus:ring-red-500 outline-none text-[12px] text-slate-800 dark:text-[#f1f5f9] resize-none font-medium"
              />
            </div>

            <div className="flex flex-col mb-8">
              <label className="text-[10px] font-bold text-slate-600 dark:text-[#94a3b8] uppercase tracking-widest mb-1.5">Digitalização do Termo (Opcional)</label>
              <div className="flex items-center gap-3">
                <label htmlFor="file-upload" className="cursor-pointer flex items-center gap-2 bg-slate-100 dark:bg-[#1a2540] border border-slate-300 px-4 py-2 rounded-[6px]">
                  <Paperclip size={14} className="text-slate-600" />
                  <span className="text-[11px] font-bold text-slate-700 dark:text-[#e2e8f0]">Selecionar Arquivo</span>
                  <input id="file-upload" type="file" className="sr-only" onChange={(e) => setArquivo(e.target.files ? e.target.files[0] : null)} />
                </label>
                {arquivo ? (
                  <span className="text-[11px] text-[#10b981] flex items-center gap-1.5 font-bold bg-[#10b981]/10 px-3 py-1.5 rounded-[6px] border border-[#10b981]/20">
                    <Check size={13}/> {arquivo.name}
                  </span>
                ) : (
                  <span className="text-[10px] font-medium text-slate-400 dark:text-[#6b7280]">PDF, JPG, PNG (Max: 10MB)</span>
                )}
              </div>
            </div>

            <div className="flex justify-end pt-5 border-t border-slate-200 dark:border-[#1a2540]">
              <button type="submit" className="flex items-center gap-2 bg-[#ef4444] hover:bg-[#dc2626] text-white px-6 py-2.5 rounded-[6px] text-[12px] font-bold transition-all shadow-sm uppercase tracking-wider">
                <Save className="h-4 w-4" /> Gravar Registro
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ABA 2 */}
      {abaAtiva === 'historico' && (
        <div className="print:hidden flex-1 flex flex-col mt-6 mb-6">
          
          {!pastaSelecionada ? (
            <div className="bg-white dark:bg-[#0c1428] border border-slate-300 dark:border-[#1a2540] rounded-[8px] shadow-sm overflow-hidden flex flex-col">
              
              <div className="p-4 border-b border-slate-200 dark:border-[#1a2540] flex items-center justify-end bg-slate-50/50 dark:bg-[#0f1d33]/50">
                <div className="relative w-72">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search size={14} className="text-slate-400" />
                  </div>
                  <input
                    type="text" placeholder="Filtrar colaborador..." value={busca} onChange={(e) => setBusca(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-white dark:bg-[#0f1d33] border border-slate-300 dark:border-[#253555] rounded-[6px] text-[12px] text-slate-800 dark:text-[#f1f5f9] font-medium focus:outline-none focus:border-red-500"
                  />
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-[#0f1d33] border-b border-slate-200 dark:border-[#1a2540]">
                      <th className="px-6 py-3 text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-[#6b7280]">Status</th>
                      <th className="px-6 py-3 text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-[#6b7280]">Nome do Colaborador</th>
                      <th className="px-6 py-3 text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-[#6b7280]">Departamento/Setor</th>
                      <th className="px-6 py-3 text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-[#6b7280] text-center">Ocorrências</th>
                      <th className="px-6 py-3 text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-[#6b7280]">Data do Último Registro</th>
                      <th className="px-6 py-3 text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-[#6b7280] text-right">Ação</th>
                    </tr>
                  </thead>
                  <tbody>
                    {historicoFiltrado.length === 0 ? (
                      <tr><td colSpan={6} className="px-6 py-8 text-center text-[12px] font-medium text-slate-500">Nenhum registro encontrado no banco de dados.</td></tr>
                    ) : (
                      historicoFiltrado.map((item, idx) => {
                        const ultimaAdv = item.advertencias[item.advertencias.length - 1];
                        
                        let statusColor = "";
                        if(item.status === "EM ATENÇÃO") statusColor = "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-500 dark:border-amber-500/20";
                        else if(item.status === "REGULAR") statusColor = "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-500 dark:border-emerald-500/20";
                        else if(item.status === "CRÍTICO") statusColor = "bg-red-100 text-red-700 border-red-200 dark:bg-red-500/10 dark:text-red-500 dark:border-red-500/20";

                        return (
                          <tr key={idx} className="border-b border-slate-200 dark:border-[#1a2540] hover:bg-slate-50 dark:hover:bg-[#1a2540]/50 transition-colors">
                            <td className="px-6 py-3.5">
                              <span className={`px-2.5 py-1 text-[9px] font-black uppercase tracking-widest rounded-[4px] border ${statusColor}`}>
                                {item.status}
                              </span>
                            </td>
                            <td className="px-6 py-3.5">
                              <div className="flex items-center gap-3">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-black text-white shadow-sm ${item.corAvatar}`}>
                                  {item.iniciais}
                                </div>
                                <span className="text-[13px] font-bold text-slate-800 dark:text-[#f1f5f9]">{item.nome}</span>
                              </div>
                            </td>
                            <td className="px-6 py-3.5 text-[12px] font-medium text-slate-600 dark:text-[#94a3b8]">
                              {item.departamento}
                            </td>
                            <td className="px-6 py-3.5 text-center">
                              <div className="bg-slate-100 dark:bg-[#1a2540] border border-slate-200 dark:border-[#253555] rounded-[4px] text-[11px] font-bold text-slate-700 dark:text-[#e2e8f0] px-2 py-0.5 inline-block min-w-[28px] text-center shadow-sm">
                                {item.advertencias.length}
                              </div>
                            </td>
                            <td className="px-6 py-3.5 text-[12px]">
                              <span className="font-bold text-slate-700 dark:text-[#e2e8f0]">{ultimaAdv?.data || '-'}</span>
                              {ultimaAdv && <span className="text-slate-500 dark:text-[#6b7280] font-medium"> - {ultimaAdv.tipo}</span>}
                            </td>
                            <td className="px-6 py-3.5 text-right">
                              <button onClick={() => setPastaSelecionada(item.nome)} className="inline-flex items-center gap-1.5 bg-white dark:bg-[#0f1d33] hover:bg-slate-50 border border-slate-300 dark:border-[#253555] text-slate-700 dark:text-[#e2e8f0] px-3 py-1.5 rounded-[6px] text-[11px] font-bold transition-colors shadow-sm">
                                <FolderOpen size={13}/> Abrir Dossiê
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            
            <div className="bg-white dark:bg-[#0c1428] border border-slate-300 dark:border-[#1a2540] rounded-[8px] shadow-sm flex flex-col">
              
              <div className="p-4 border-b border-slate-200 dark:border-[#1a2540] bg-slate-50 dark:bg-[#0f1d33] flex items-center justify-between rounded-t-[8px]">
                <div className="flex items-center gap-4">
                  <button onClick={() => setPastaSelecionada(null)} className="p-1.5 border border-slate-300 dark:border-[#253555] bg-white dark:bg-[#1a2540] rounded-[6px] hover:bg-slate-100 transition-colors shadow-sm">
                    <ArrowLeft size={14} className="text-slate-600 dark:text-[#e2e8f0]" />
                  </button>
                  <div className="flex flex-col">
                    <h2 className="text-[14px] font-black text-slate-800 dark:text-[#f1f5f9] uppercase tracking-tight flex items-center gap-2">
                      <FolderOpen className="text-amber-500 h-4 w-4"/> Dossiê: {pastaDetalhes?.nome}
                    </h2>
                    <span className="text-[10px] font-bold text-slate-500 dark:text-[#94a3b8] uppercase tracking-widest mt-0.5 ml-6">{pastaDetalhes?.departamento}</span>
                  </div>
                </div>
              </div>

              <div className="p-0">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-white dark:bg-[#0c1428] border-b border-slate-200 dark:border-[#1a2540]">
                      <th className="px-6 py-3 text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-[#6b7280] w-32">Data</th>
                      <th className="px-6 py-3 text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-[#6b7280] w-56">Classificação</th>
                      <th className="px-6 py-3 text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-[#6b7280]">Motivo / Fundamentação</th>
                      <th className="px-6 py-3 text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-[#6b7280] text-right">Ação</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pastaDetalhes?.advertencias.map((adv: any, idx: number) => (
                      <tr key={idx} className="border-b border-slate-200 dark:border-[#1a2540] hover:bg-slate-50 dark:hover:bg-[#1a2540]/50 transition-colors">
                        <td className="px-6 py-4 text-[12px] font-bold text-slate-800 dark:text-[#f1f5f9] align-top">
                          <div className="flex items-center gap-1.5"><Calendar size={12} className="text-slate-400"/> {adv.data}</div>
                        </td>
                        <td className="px-6 py-4 text-[12px] font-black text-slate-700 dark:text-[#94a3b8] align-top uppercase">
                          <span className="bg-slate-100 dark:bg-[#1a2540] px-2.5 py-1 rounded-[4px] border border-slate-200 dark:border-[#253555]">{adv.tipo}</span>
                        </td>
                        <td className="px-6 py-4 text-[12px] font-medium text-slate-600 dark:text-[#94a3b8] align-top leading-relaxed">{adv.motivo}</td>
                        <td className="px-6 py-4 text-right align-top">
                          <button 
                            onClick={() => dispararImpressao(pastaDetalhes.nome, adv.tipo, adv.motivo, adv.data)}
                            className="inline-flex items-center gap-1.5 bg-white dark:bg-[#0f1d33] hover:bg-slate-50 border border-slate-300 dark:border-[#253555] text-slate-700 dark:text-[#e2e8f0] px-3 py-1.5 rounded-[6px] text-[10px] font-bold transition-colors shadow-sm uppercase tracking-wider"
                          >
                            <Printer size={12}/> Imprimir
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ================= FOLHA DE IMPRESSÃO (AGORA 100% LIMPA E NUMA PÁGINA SÓ) ================= */}
      <div className="hidden print:block bg-white text-black font-serif leading-snug text-[14px] w-full">
        
        <div className="flex items-center justify-between border-b-2 border-black pb-4 mb-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-black flex items-center justify-center text-white font-sans font-black text-[20px]">NX</div>
            <div>
              <h2 className="text-[20px] font-black tracking-tight font-sans leading-none">NORDEX LOGÍSTICA INTEGRADA</h2>
              <p className="text-[10px] uppercase tracking-widest font-sans font-bold text-gray-600 mt-1">Gestão de Operações e Recursos Humanos</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-[10px] uppercase tracking-widest font-sans font-bold text-gray-500">Documento Oficial</p>
            <p className="text-[11px] font-sans font-bold">{dadosImpressao.data}</p>
          </div>
        </div>

        <div className="text-center mb-6">
          <h1 className="text-[16px] font-black uppercase underline tracking-widest font-sans">
            COMUNICADO DE {dadosImpressao.tipo || 'PUNIÇÃO DISCIPLINAR'}
          </h1>
        </div>

        <div className="space-y-4 text-justify">
          <p>
            Ao Sr.(a) <strong className="font-sans text-[14px] uppercase border-b border-black px-1 pb-0.5">{dadosImpressao.nome || '________________________________________'}</strong>.
          </p>
          
          <p>
            Vimos por meio deste comunicar-lhe que lhe está sendo aplicada uma medida disciplinar de 
            <strong> {dadosImpressao.tipo || '____________________'}</strong>, referente ao fato ocorrido e registrado no dia <strong>{dadosImpressao.data}</strong>, listado abaixo:
          </p>
          
          <div className="bg-gray-100 border border-gray-300 p-4 rounded font-sans min-h-[100px] whitespace-pre-wrap my-4 text-[13px]">
            <strong className="text-[11px] tracking-widest uppercase text-gray-600 block mb-1">DESCRIÇÃO DO FATO OCORRIDO:</strong>
            <span className="font-medium text-black">{dadosImpressao.motivo || 'Nenhum motivo detalhado foi inserido.'}</span>
          </div>
          
          <p className="indent-8 text-[13px]">
            Esclarecemos que a Nordex Logística Integrada espera que atitudes de desvio de conduta operativa ou quebra do regulamento interno não voltem a ocorrer. A reincidência em comportamentos de infração ou descumprimento de ordens diretas poderá resultar em punições progressivas mais severas, culminando inclusive em uma rescisão de contrato de trabalho por <strong>Justa Causa</strong>, nos moldes descritos pelo Artigo 482 da Consolidação das Leis do Trabalho (CLT).
          </p>
          <p className="indent-8 text-[13px]">
            Pedimos que tome ciência e firme o recebimento da presente via deste termo.
          </p>
        </div>

        <div className="mt-8 text-right font-sans font-bold text-[12px]">
          Aracaju, SE, {new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}.
        </div>

        <div className="mt-16 space-y-12 font-sans">
          <div className="grid grid-cols-2 gap-12">
            <div className="text-center">
              <div className="border-t border-black w-full mx-auto pt-2"></div>
              <p className="font-black text-[11px] uppercase tracking-wide">NORDEX LOGÍSTICA INTEGRADA</p>
              <p className="text-[9px] text-gray-500 font-bold uppercase mt-0.5">Recursos Humanos / Operações</p>
            </div>
            <div className="text-center">
              <div className="border-t border-black w-full mx-auto pt-2"></div>
              <p className="font-black text-[11px] uppercase tracking-wide">{dadosImpressao.nome || 'NOME DO COLABORADOR'}</p>
              <p className="text-[9px] text-gray-500 font-bold uppercase mt-0.5">Assinatura do Colaborador</p>
            </div>
          </div>
          
          <div className="pt-4">
            <p className="text-[10px] italic text-gray-600 mb-6 font-serif">Em caso de recusa de assinatura por parte do colaborador infrator, as testemunhas abaixo firmam a aplicação do termo:</p>
            <div className="grid grid-cols-2 gap-12">
              <div className="text-center">
                <div className="border-t border-gray-400 w-full mx-auto pt-2"></div>
                <p className="text-[9px] font-bold uppercase tracking-wide text-gray-500">Testemunha 1 (Nome legível e Assinatura)</p>
              </div>
              <div className="text-center">
                <div className="border-t border-gray-400 w-full mx-auto pt-2"></div>
                <p className="text-[9px] font-bold uppercase tracking-wide text-gray-500">Testemunha 2 (Nome legível e Assinatura)</p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}