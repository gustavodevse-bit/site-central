import React, { useState, useRef, useEffect } from "react";
import Layout from "../components/Layout";
import { 
  CheckCircle, AlertTriangle, UploadCloud, FileCheck, 
  DollarSign, Receipt, Edit3, Save, 
  Download, RefreshCcw, X, Search, Plus, 
  TrendingUp, Wallet, Filter, CreditCard, Trash2
} from "lucide-react";

export default function Pagamentos() {
  const [abaAtiva, setAbaAtiva] = useState<"entregadores" | "historico">("entregadores");
  const [modalCadastroAberto, setModalCadastroAberto] = useState(false);
  const [editandoId, setEditandoId] = useState<number | null>(null);
  
  const [modalPagamento, setModalPagamento] = useState<{aberto: boolean, fechamentoId: number | null, nome: string}>({ aberto: false, fechamentoId: null, nome: "" });
  const [arquivoComprovante, setArquivoComprovante] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const fileImportRef = useRef<HTMLInputElement>(null);
  const [importando, setImportando] = useState(false);

  const [carregandoUpload, setCarregandoUpload] = useState(false);
  const [carregando, setCarregando] = useState(false);
  
  const [buscaTabela, setBuscaTabela] = useState("");
  const [filtroRegiao, setFiltroRegiao] = useState<"TODAS" | "CAP" | "INTER">("TODAS");

  const [folhaAtiva, setFolhaAtiva] = useState<any[]>([]);

  const API_URL = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : 'http://192.168.18.213:8081/api';

  const [isDark, setIsDark] = useState(document.documentElement.classList.contains('dark'));

  const listaMestraEntregadores = [
    { nome: "ADRYAN JADIEL DOS SANTOS LIMA", regiao: "INTER" }, { nome: "AILTON SANTANA DA SILVA", regiao: "INTER" }, { nome: "ALAN KARLSON DA SILVA VASCO", regiao: "INTER" },
    { nome: "ALESSANDRO DO NASCIMENTO LESSA (SGE)", regiao: "CAP" }, { nome: "ALEXANDRE DO NASCIMENTO LESSA (SGE)", regiao: "CAP" }, { nome: "ALISSON SILVA BRUNO (SGE)", regiao: "INTER" },
    { nome: "ANA ALICE SILVA DE ALMEIDA PEREIRA (SGE)", regiao: "INTER" }, { nome: "ANA ANGÉLICA DOS REIS SILVA (SGE)", regiao: "INTER" }, { nome: "ANALY BRITO DOS SANTOS (SGE)", regiao: "CAP" },
    { nome: "ANDREIA CRUZ BRITO (SGE)", regiao: "CAP" }, { nome: "ANGELO LEMOS DOS SANTOS", regiao: "INTER" }, { nome: "ANTONIO ALFREDO MENEZES ARAUJO (SGE)", regiao: "INTER" },
    { nome: "ANTONIO CARLOS SANTOS", regiao: "INTER" }, { nome: "ANTONIO JORGE DOS SANTOS JUNIOR", regiao: "CAP" }, { nome: "CESAR DUARTE SANTOS (SGE)", regiao: "CAP" },
    { nome: "CLEVERTON DOS SANTOS SILVA (SGE)", regiao: "INTER" }, { nome: "DANIEL DOS SANTOS SILVEIRA (SGE)", regiao: "INTER" }, { nome: "DANILO DOS SANTOS BRITO", regiao: "INTER" },
    { nome: "DARLAN COSTA SOUZA (SGE)", regiao: "INTER" }, { nome: "DEBORA TAIS MONTEIRO SANTANA (SGE)", regiao: "INTER" }, { nome: "DOUGLAS MANOEL CUNHA SILVA (SGE)", regiao: "INTER" },
    { nome: "EDILSON SILVA NASCIMENTO (SGE)", regiao: "INTER" }, { nome: "EDIVANILSON DE JESUS SANTOS", regiao: "CAP" }, { nome: "EDMILSON ARAUJO DAS SANTOS", regiao: "INTER" },
    { nome: "EDVALDO SANTANA DOS SANTOS", regiao: "INTER" }, { nome: "ELIZIARIO MOTA DOS SANTOS", regiao: "INTER" }, { nome: "ELTON DOS SANTOS (SGE)", regiao: "INTER" },
    { nome: "EMERSON DOS SANTOS SALES", regiao: "INTER" }, { nome: "ERINALDO DA MACENA", regiao: "CAP" }, { nome: "ERIVALDO ALVES SANTOS", regiao: "CAP" },
    { nome: "ERNANDES FRANCISCO DOS SANTOS (SGE)", regiao: "INTER" }, { nome: "EVELLY MARIA SOUZA ALVES DIAS (SGE)", regiao: "INTER" }, { nome: "EVERTON FARIAS SANTOS CAMPOS (SGE)", regiao: "INTER" },
    { nome: "FABIANA MACEDO DOS SANTOS", regiao: "CAP" }, { nome: "FRANCIELIO DE OLIVEIRA FRANCA JUNIOR", regiao: "INTER" }, { nome: "FRANCISCO GABRIEL SANTOS SOUZA", regiao: "CAP" },
    { nome: "GEANDRO FONTES ROSA (SGE)", regiao: "INTER" }, { nome: "GEOVANISON LEOCADIO AZEVEDO DOS SANTOS", regiao: "CAP" }, { nome: "GILDERLAN CARDOSO", regiao: "INTER" },
    { nome: "GLADISON ANDRADE DE SA", regiao: "INTER" }, { nome: "HESLANCEY DOS SANTOS", regiao: "INTER" }, { nome: "HIGOR BARRETO DOS SANTOS (SGE)", regiao: "INTER" },
    { nome: "JELDO SILVA DO NASCIMENTO", regiao: "CAP" }, { nome: "JOAO DOS SANTOS NETO", regiao: "INTER" }, { nome: "JOHON CLERISTON ALVES DOS SANTOS (SGE)", regiao: "INTER" },
    { nome: "JOSE DOMINGOS SANTOS FONTES", regiao: "INTER" }, { nome: "JOSE LEONARDO DORIA", regiao: "INTER" }, { nome: "JOSE LUCIANO CALISTO DOS SANTOS", regiao: "INTER" },
    { nome: "JOSE RAIMUNDO BASTOS", regiao: "INTER" }, { nome: "JOSIAS TELES", regiao: "INTER" }, { nome: "JOSIVAN RIBEIRO DOS SANTOS (SGE)", regiao: "INTER" },
    { nome: "JOSÉ LEANDRO DOS SANTOS", regiao: "INTER" }, { nome: "JUSSIE DA CRUZ NUNES", regiao: "INTER" }, { nome: "KLEIDISON DE SANTANA CAVALCANTE", regiao: "INTER" },
    { nome: "LAIS RANGEL DOS SANTOS SILVA (SGE)", regiao: "INTER" }, { nome: "LAISA MIRELLE GOES DE OLIVEIRA (SGE)", regiao: "INTER" }, { nome: "LUIS FERNANDO DOS SANTOS", regiao: "INTER" },
    { nome: "MARCIO BISPO DOS SANTOS", regiao: "INTER" }, { nome: "MARCIO FELIPE CARVALHO OLIVEIRA", regiao: "CAP" }, { nome: "MARIA TAYNARA SANTOS SOUZA (SGE)", regiao: "INTER" },
    { nome: "MARISE BARBOSA SANTOS (SGE)", regiao: "INTER" }, { nome: "MARIZETE SANTOS DE MELO (SGE)", regiao: "INTER" }, { nome: "MATEUS GOMES DOS SANTOS", regiao: "INTER" },
    { nome: "MATEUS SOUZA DOS SANTOS (SGE)", regiao: "CAP" }, { nome: "MATHEUS DOS SANTOS", regiao: "INTER" }, { nome: "MATHEUS TEIXEIRA SANTOS", regiao: "INTER" },
    { nome: "MAYKON SANTANA CALIXTO", regiao: "INTER" }, { nome: "MICAELA VIEIRA BRAZ (SGE)", regiao: "INTER" }, { nome: "MICHAEL SANTANA DOS SANTOS", regiao: "INTER" },
    { nome: "NAUA AIAC APOSTOLO FERREIRA CARDOSO (SGE)", regiao: "INTER" }, { nome: "NORMAN COSTA FELIX", regiao: "INTER" }, { nome: "PEDRO CAMILO DOS SANTOS NETO", regiao: "CAP" },
    { nome: "PEDRO HENRIQUE SANTOS RODRIGUES", regiao: "INTER" }, { nome: "RAYÇA SAMARA RAMOS DE SANTANA", regiao: "INTER" }, { nome: "RODRIGO DOS SANTOS", regiao: "CAP" },
    { nome: "ROSIMARE DOS SANTOS", regiao: "INTER" }, { nome: "SILVANA ALVES DOS SANTOS (SGE)", regiao: "CAP" }, { nome: "SIMONE DE JESUS RODRIGUES BEZERRA", regiao: "CAP" },
    { nome: "VINICIUS LEO SANTOS DA SILVA", regiao: "INTER" }, { nome: "VITORIA GABRIELA MACEDO CARDOSO (SGE)", regiao: "INTER" }, { nome: "WELLINGTON PEREIRA DOS SANTOS JUNIOR (SGE)", regiao: "CAP" },
    { nome: "YTALO REIS DE OLIVEIRA (SGE)", regiao: "INTER" }
  ];

  const [nomeSelecionado, setNomeSelecionado] = useState("");
  const [regiaoAutomatica, setRegiaoAutomatica] = useState("");
  const [ate5, setAte5] = useState(0);
  const [ate20, setAte20] = useState(0);
  const [ate999, setAte999] = useState(0);
  const [revista, setRevista] = useState(0);
  const [cards, setCards] = useState(0);
  const [desconto, setDesconto] = useState(0);

  const [toasts, setToasts] = useState<{id: number, msg: string, tipo: string}[]>([]);
  const showToast = (msg: string, tipo: string) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, msg, tipo }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3500);
  };

  const obterTaxas = (regiao: string) => {
    if (regiao === "CAP") return { ATE_5: 2.50, ATE_20: 3.50, ATE_999: 4.50, REVISTA: 0.50, CARDS: 2.00 };
    return { ATE_5: 3.00, ATE_20: 4.50, ATE_999: 6.00, REVISTA: 0.50, CARDS: 2.00 };
  };

  const calcularTotalEntregador = (e: any, regiao: string) => {
    const taxas = obterTaxas(regiao);
    return ((e.ate5 * taxas.ATE_5) + (e.ate20 * taxas.ATE_20) + (e.ate999 * taxas.ATE_999) + (e.revista * taxas.REVISTA) + (e.cards * taxas.CARDS)) - e.desconto;
  };

  useEffect(() => {
    carregarDados();
    const handleThemeChange = () => setIsDark(document.documentElement.classList.contains('dark'));
    window.addEventListener('themeChange', handleThemeChange);
    return () => window.removeEventListener('themeChange', handleThemeChange);
  }, []);

  const carregarDados = async () => {
    setCarregando(true);
    try {
      const time = new Date().getTime(); 
      const res = await fetch(`${API_URL}/pagamentos?t=${time}`, { cache: 'no-store' });
      const data = await res.json();
      setFolhaAtiva(data);
    } catch (err) {
      console.error("Erro ao puxar folha do servidor", err);
    } finally {
      setCarregando(false);
    }
  };

  const aoMudarNome = (nome: string) => {
    setNomeSelecionado(nome);
    const enc = listaMestraEntregadores.find(e => e.nome === nome);
    if(enc) setRegiaoAutomatica(enc.regiao);
  };

  const handleSalvar = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const dadosEnvio = {
      ...(editandoId ? { id: editandoId } : {}),
      nomeEntregador: nomeSelecionado,
      regiao: regiaoAutomatica,
      ate5, ate20, ate999, revista, cards, desconto,
      totalPago: calcularTotalEntregador({ate5, ate20, ate999, revista, cards, desconto}, regiaoAutomatica),
      pago: false
    };
    
    setModalCadastroAberto(false);
    setEditandoId(null);
    limparCampos();

    try {
      const res = await fetch(`${API_URL}/pagamentos${editandoId ? `/${editandoId}` : ''}`, {
        method: editandoId ? "PUT" : "POST", 
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dadosEnvio) 
      });
      
      if (!res.ok && res.status === 405 && editandoId) {
          await fetch(`${API_URL}/pagamentos`, {
            method: "POST", 
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({...dadosEnvio, id: editandoId}) 
          });
      }

      await carregarDados(); 
      showToast("Lançamento salvo com sucesso!", "sucesso");
    } catch (err) {
      showToast("Erro ao sincronizar com o banco.", "erro");
      await carregarDados(); 
    }
  };

  // =========================================================================
  // 🟢 IMPORTADOR INTELIGENTE (CAÇADOR DE TOTAIS DA TABELA DINÂMICA)
  // =========================================================================
  const handleImportarCSV = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImportando(true);
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const texto = e.target?.result as string;
        const linhas = texto.split('\n');
        let currentMotorista = "";
        const agregados: Record<string, any> = {};

        const separador = texto.includes(';') ? ';' : ',';

        for (let i = 0; i < linhas.length; i++) {
          const colunas = linhas[i].split(separador).map(c => c.replace(/"/g, '').trim());
          if (colunas.length < 4) continue;

          const col0 = colunas[0]; 
          const col1 = colunas[1]; 
          // Se a tabela mudar o tamanho, tenta sempre pegar o valor na coluna 3 ou a última
          const col3 = colunas[3] || colunas[colunas.length - 1]; 

          // Ignora cabeçalhos
          if (col0 === 'NOME_MOT' || col0 === 'DT_HR' || col0 === 'CAF') continue;

          const nomeUpper = col0 ? col0.toUpperCase() : "";

          // Se a coluna 0 tem o nome do Motorista (e NÃO é a linha final de "Soma/Total Geral")
          if (col0 && col0 !== "" && !nomeUpper.includes('TOTAL') && !nomeUpper.includes('RESULTADO') && !nomeUpper.includes('SOMA')) {
            currentMotorista = col0;
            if (!agregados[currentMotorista]) {
              const enc = listaMestraEntregadores.find(ent => ent.nome === currentMotorista);
              const regiaoAuto = enc ? enc.regiao : "INTER"; 

              agregados[currentMotorista] = {
                nomeEntregador: currentMotorista,
                regiao: regiaoAuto,
                ate5: 0, ate20: 0, ate999: 0, revista: 0, cards: 0, desconto: 0
              };
            }
          }

          // 🟢 O PULO DO GATO: Se for a linha mágica do Excel ("CAR Total" ou "STD Resultado")
          const servicoUpper = col1 ? col1.toUpperCase() : "";
          if (currentMotorista && (servicoUpper.includes('TOTAL') || servicoUpper.includes('RESULTADO'))) {
            const valor = parseInt(col3) || 0;
            
            if (servicoUpper.includes('CAR')) agregados[currentMotorista].cards += valor;
            else if (servicoUpper.includes('LPT')) agregados[currentMotorista].revista += valor;
            else if (servicoUpper.includes('STD') || servicoUpper.includes('LPD')) agregados[currentMotorista].ate5 += valor;
          }
        }

        // Filtra só quem teve produção de facto
        const motoristasParaSalvar = Object.values(agregados).filter((mot: any) => 
           mot.ate5 > 0 || mot.ate20 > 0 || mot.ate999 > 0 || mot.revista > 0 || mot.cards > 0
        );

        let sucessos = 0;

        for (const mot of motoristasParaSalvar) {
           mot.totalPago = calcularTotalEntregador(mot, mot.regiao);
           const res = await fetch(`${API_URL}/pagamentos`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ ...mot, pago: false }) 
           });
           if (res.ok) sucessos++;
        }

        if (sucessos > 0) {
            showToast(`Mágica feita! ${sucessos} entregadores importados.`, "sucesso");
        } else {
            showToast("Nenhum dado válido foi encontrado na planilha.", "erro");
        }
        
        await carregarDados(); 

      } catch (err) {
        console.error(err);
        showToast("Erro ao processar o arquivo CSV. Verifique o formato.", "erro");
      } finally {
        setImportando(false);
        if (fileImportRef.current) fileImportRef.current.value = ""; 
      }
    };
    reader.readAsText(file, 'UTF-8'); 
  };

  const handleExcluir = async (id: number) => {
    if (!window.confirm("Deseja realmente apagar este lançamento?")) return;
    setFolhaAtiva(prev => prev.filter(f => f.id !== id));
    try {
      const res = await fetch(`${API_URL}/pagamentos/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error("Erro ao excluir no servidor");
      showToast("Lançamento excluído com sucesso!", "sucesso");
    } catch (error) {
      showToast("Erro ao excluir lançamento.", "erro");
      await carregarDados(); 
    }
  };

  const limparCampos = () => {
    setNomeSelecionado(""); setRegiaoAutomatica(""); setAte5(0); setAte20(0); setAte999(0); setRevista(0); setCards(0); setDesconto(0);
  };

  const prepararEdicao = (ent: any) => {
    setEditandoId(ent.id); setNomeSelecionado(ent.nomeEntregador); setRegiaoAutomatica(ent.regiao);
    setAte5(ent.ate5); setAte20(ent.ate20); setAte999(ent.ate999); setRevista(ent.revista); setCards(ent.cards); setDesconto(ent.desconto);
    setModalCadastroAberto(true);
  };

  const confirmarPagamento = async () => {
    if (!arquivoComprovante && !window.confirm("Confirmar baixa SEM anexar comprovante?")) return;
    
    const pagamentoAtual = folhaAtiva.find(f => f.id === modalPagamento.fechamentoId);
    setFolhaAtiva(prev => prev.map(f => f.id === modalPagamento.fechamentoId ? {...f, pago: true} : f));
    
    const idParaBaixar = modalPagamento.fechamentoId;
    const nomeParaUpload = modalPagamento.nome;
    
    setModalPagamento({ aberto: false, fechamentoId: null, nome: "" });
    setCarregandoUpload(true);

    try {
      let res;
      if (arquivoComprovante) {
        const formData = new FormData();
        formData.append("file", arquivoComprovante);
        formData.append("nomeEntregador", nomeParaUpload);
        res = await fetch(`${API_URL}/pagamentos/${idParaBaixar}/comprovante`, { method: "POST", body: formData });
      } else {
        res = await fetch(`${API_URL}/pagamentos/${idParaBaixar}`, { 
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...pagamentoAtual, pago: true })
        });
      }

      if (res.ok) {
        showToast("Pagamento baixado com sucesso!", "sucesso");
        await new Promise(r => setTimeout(r, 400));
        await carregarDados();
      } else { throw new Error("Erro upload"); }
    } catch (err) {
      showToast("Falha na comunicação com o servidor.", "erro");
      await carregarDados();
    } finally {
      setCarregandoUpload(false);
      setArquivoComprovante(null);
    }
  };

  const exportarParaExcel = () => {
    const cabecalho = "Entregador;Regiao;Ate 5;Ate 20;Ate 999;Revista;Cards;Desconto;Total;Status\n";
    const linhas = folhaAtiva.map(ent => 
      `${ent.nomeEntregador};${ent.regiao};${ent.ate5};${ent.ate20};${ent.ate999};${ent.revista};${ent.cards};${ent.desconto};${ent.totalPago.toFixed(2)};${ent.pago ? 'PAGO' : 'PENDENTE'}`
    ).join("\n");
    
    const blob = new Blob(["\ufeff" + cabecalho + linhas], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url; link.setAttribute("download", `pagamentos_nordex_${new Date().toLocaleDateString()}.csv`); link.click();
  };

  const totalPendente = folhaAtiva.filter(f => !f.pago).reduce((acc, curr) => acc + curr.totalPago, 0);
  const totalPagoVal = folhaAtiva.filter(f => f.pago).reduce((acc, curr) => acc + curr.totalPago, 0);
  const totalDescontos = folhaAtiva.reduce((acc, curr) => acc + curr.desconto, 0);
  const progressoFechamento = folhaAtiva.length > 0 ? (folhaAtiva.filter(f => f.pago).length / folhaAtiva.length) * 100 : 0;

  const termo = buscaTabela.toLowerCase();
  let linhasExibicao = abaAtiva === "entregadores" ? folhaAtiva.filter(f => !f.pago) : folhaAtiva.filter(f => f.pago);
  
  if (filtroRegiao !== "TODAS") {
    linhasExibicao = linhasExibicao.filter(f => f.regiao === filtroRegiao);
  }
  if (termo) {
    linhasExibicao = linhasExibicao.filter(f => f.nomeEntregador?.toLowerCase().includes(termo));
  }
  
  const taxasAtuais = obterTaxas(regiaoAutomatica);

  return (
    <Layout titulo="Gestão de Pagamentos">
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
        
        <div className="fixed bottom-6 right-6 z-[9999] flex flex-col items-end gap-2 pointer-events-none">
          {toasts.map(t => (
            <div key={t.id} className={`flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg text-[11px] font-bold tracking-widest uppercase transition-all animate-in slide-in-from-bottom-5 ${t.tipo === 'sucesso' ? 'bg-[#10b981] text-white' : 'bg-[#ef4444] text-white'}`}>
              {t.tipo === 'sucesso' ? <CheckCircle size={14} /> : <AlertTriangle size={14} />} {t.msg}
            </div>
          ))}
        </div>

        <datalist id="lista-mestra-nomes">
          {listaMestraEntregadores.map((u, i) => <option key={i} value={u.nome} />)}
        </datalist>

        <div className="banner-box shadow-sm transition-colors">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#10b981] opacity-5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
          
          <div className="flex items-center gap-4 z-10">
            <div className="w-[56px] h-[56px] bg-slate-50 dark:bg-[#1a2540] border border-slate-200 dark:border-[#253555] rounded-[10px] flex items-center justify-center shrink-0 transition-colors">
              <Receipt size={24} className="text-[#10b981]" />
            </div>
            <div>
              <h2 className="text-[18px] font-black text-slate-800 dark:text-[#f1f5f9] uppercase tracking-tight leading-tight">Módulo Financeiro</h2>
              <p className="text-[11px] font-medium text-slate-500 dark:text-[#94a3b8] mt-0.5 hidden md:block">Controle de produtividade, descontos e emissão de recibos.</p>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2 z-10">
            
            <input type="file" accept=".csv" ref={fileImportRef} className="hidden" onChange={handleImportarCSV} />
            <button onClick={() => fileImportRef.current?.click()} disabled={importando} className="bg-[#3b82f6] hover:bg-[#2563eb] text-white px-4 py-2.5 rounded-[8px] font-bold text-[10px] uppercase tracking-widest flex items-center gap-1.5 shadow-sm transition-colors disabled:opacity-50">
              {importando ? <RefreshCcw size={14} className="animate-spin"/> : <UploadCloud size={14} />} Importar Planilha
            </button>

            <button onClick={exportarParaExcel} className="bg-slate-100 dark:bg-[#1a2540] hover:bg-slate-200 dark:hover:bg-[#253555] text-slate-700 dark:text-[#94a3b8] border border-slate-200 dark:border-[#253555] px-4 py-2.5 rounded-[8px] font-bold text-[10px] uppercase tracking-widest flex items-center gap-1.5 transition-colors">
              <Download size={14} /> Exportar Folha
            </button>

            <button onClick={() => { setEditandoId(null); limparCampos(); setModalCadastroAberto(true); }} className="bg-[#f97316] hover:bg-[#ea580c] text-white px-5 py-2.5 rounded-[8px] font-bold text-[10px] uppercase tracking-widest flex items-center gap-1.5 shadow-sm transition-colors">
              <Plus size={14} /> Lançar Avulso
            </button>
          </div>
        </div>

        <div className="flex gap-[14px] shrink-0">
           <div className="kpi-card shadow-sm transition-colors">
              <div className="w-10 h-10 rounded-[8px] bg-[#ef4444]/10 flex items-center justify-center text-[#ef4444] shrink-0 border border-[#ef4444]/20"><DollarSign size={18}/></div>
              <div>
                <p className="text-[9px] font-black uppercase tracking-widest text-slate-500 dark:text-[#6b7280]">Total Pendente</p>
                <h3 className="text-[18px] font-black text-slate-800 dark:text-[#f1f5f9] leading-tight mt-0.5">R$ {totalPendente.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</h3>
              </div>
           </div>
           
           <div className="kpi-card shadow-sm transition-colors">
              <div className="w-10 h-10 rounded-[8px] bg-[#10b981]/10 flex items-center justify-center text-[#10b981] shrink-0 border border-[#10b981]/20"><Wallet size={18}/></div>
              <div>
                <p className="text-[9px] font-black uppercase tracking-widest text-slate-500 dark:text-[#6b7280]">Histórico Pago</p>
                <h3 className="text-[18px] font-black text-slate-800 dark:text-[#f1f5f9] leading-tight mt-0.5">R$ {totalPagoVal.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</h3>
              </div>
           </div>

           <div className="kpi-card shadow-sm transition-colors">
              <div className="w-10 h-10 rounded-[8px] bg-[#f59e0b]/10 flex items-center justify-center text-[#f59e0b] shrink-0 border border-[#f59e0b]/20"><TrendingUp size={18}/></div>
              <div>
                <p className="text-[9px] font-black uppercase tracking-widest text-slate-500 dark:text-[#6b7280]">Descontos Aplicados</p>
                <h3 className="text-[18px] font-black text-slate-800 dark:text-[#f1f5f9] leading-tight mt-0.5">R$ {totalDescontos.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</h3>
              </div>
           </div>

           <div className="kpi-card shadow-sm transition-colors flex-col items-start justify-center gap-2">
              <div className="flex justify-between items-center w-full">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-[#94a3b8]">Progresso do Fechamento</span>
                <span className="text-[11px] font-bold text-[#10b981]">{progressoFechamento.toFixed(0)}%</span>
              </div>
              <div className="w-full h-[6px] bg-slate-100 dark:bg-[#1a2540] rounded-full overflow-hidden shadow-inner">
                 <div className="h-full bg-[#10b981] transition-all duration-700 ease-out" style={{ width: `${progressoFechamento}%` }}></div>
              </div>
           </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center gap-4 shrink-0 mt-2">
          <div className="flex p-1 bg-white dark:bg-[#0f1d33] border border-slate-200 dark:border-[#1a2540] rounded-[10px] w-full md:w-auto shadow-sm transition-colors">
            <button onClick={() => setAbaAtiva("entregadores")} className={`flex-1 md:flex-none px-6 py-2 rounded-[6px] text-[11px] font-bold transition-all uppercase tracking-widest flex items-center gap-2 ${abaAtiva === "entregadores" ? "bg-[#f97316] text-white shadow-sm" : "text-slate-500 hover:text-slate-800 dark:text-[#6b7280] dark:hover:text-[#94a3b8]"}`}>
              <AlertTriangle size={12}/> Lançados ({folhaAtiva.filter(f=>!f.pago).length})
            </button>
            <button onClick={() => setAbaAtiva("historico")} className={`flex-1 md:flex-none px-6 py-2 rounded-[6px] text-[11px] font-bold transition-all uppercase tracking-widest flex items-center justify-center gap-2 ${abaAtiva === "historico" ? "bg-[#10b981] text-white shadow-sm" : "text-slate-500 hover:text-slate-800 dark:text-[#6b7280] dark:hover:text-[#94a3b8]"}`}>
              <CheckCircle size={12}/> Pagos ({folhaAtiva.filter(f=>f.pago).length})
            </button>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
             <div className="flex items-center bg-white dark:bg-[#0f1d33] border border-slate-200 dark:border-[#1a2540] rounded-[8px] overflow-hidden shadow-sm transition-colors">
                <div className="px-3 py-2 border-r border-slate-200 dark:border-[#1a2540] bg-slate-50 dark:bg-[#1a2540]/30"><Filter size={14} className="text-slate-400 dark:text-[#6b7280]"/></div>
                <select value={filtroRegiao} onChange={(e) => setFiltroRegiao(e.target.value as any)} className="bg-transparent border-none text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-[#94a3b8] px-3 py-2 outline-none cursor-pointer">
                   <option value="TODAS">Todas Regiões</option>
                   <option value="CAP">Capital (CAP)</option>
                   <option value="INTER">Interior (INTER)</option>
                </select>
             </div>

             <div className="relative flex-1 md:w-[250px]">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-[#6b7280]" />
                <input type="text" value={buscaTabela} onChange={e=>setBuscaTabela(e.target.value)} placeholder="Pesquisar motorista..." className="w-full bg-white dark:bg-[#0f1d33] border border-slate-200 dark:border-[#1a2540] text-slate-800 dark:text-[#e2e8f0] px-3 py-2 pl-9 rounded-[8px] outline-none focus:border-[#f97316] transition-colors text-[11px] font-bold placeholder:text-slate-400 dark:placeholder:text-[#4b5563] shadow-sm"/>
             </div>
          </div>
        </div>

        <div className="flex-1 bg-white dark:bg-[#0f1d33] border border-slate-200 dark:border-[#1a2540] rounded-[12px] shadow-sm overflow-hidden flex flex-col min-h-0 transition-colors">
          <div className="flex-1 overflow-auto custom-scrollbar">
            <table className="w-full text-left min-w-[1000px] border-collapse">
              <thead className="sticky top-0 z-20 bg-slate-50 dark:bg-[#070d1a] border-b border-slate-200 dark:border-[#1a2540] shadow-sm transition-colors">
                <tr className="text-slate-500 dark:text-[#6b7280] text-[9px] uppercase font-black tracking-widest">
                  <th className="px-5 py-3">Operador(a) Logístico</th>
                  <th className="px-3 py-3 text-center">Até 5</th>
                  <th className="px-3 py-3 text-center">Até 20</th>
                  <th className="px-3 py-3 text-center">Até 999</th>
                  <th className="px-3 py-3 text-center">Revista</th>
                  <th className="px-3 py-3 text-center">Cards</th>
                  <th className="px-3 py-3 text-center text-[#ef4444]">Desconto</th>
                  <th className="px-5 py-3 text-right text-[#10b981]">Total Gerado</th>
                  <th className="px-5 py-3 text-center">Status / Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-[#1a2540]">
                {carregando && folhaAtiva.length === 0 ? (
                   <tr><td colSpan={9} className="text-center py-10 text-slate-400 dark:text-[#6b7280] font-bold text-[11px]"><RefreshCcw size={16} className="inline animate-spin mr-2"/> Sincronizando com Banco de Dados...</td></tr>
                ) : linhasExibicao.length === 0 ? (
                   <tr><td colSpan={9} className="text-center py-10 text-slate-400 dark:text-[#6b7280] font-bold text-[11px]">Nenhum registro encontrado com estes filtros.</td></tr>
                ) : (
                  linhasExibicao.map((ent) => (
                    <tr key={ent.id} className="transition-colors group hover:bg-slate-50 dark:hover:bg-[#1a2540]/30">
                      <td className="px-5 py-3">
                        <p className="font-bold text-slate-800 dark:text-[#f1f5f9] text-[12px] truncate max-w-[200px]">{ent.nomeEntregador}</p>
                        <p className={`text-[8px] font-black uppercase tracking-widest mt-0.5 w-fit px-1.5 py-0.5 rounded ${ent.regiao === 'INTER' ? 'bg-[#3b82f6]/10 text-[#3b82f6]' : 'bg-[#f97316]/10 text-[#f97316]'}`}>{ent.regiao}</p>
                      </td>
                      <td className="px-3 py-3 text-center font-mono font-bold text-slate-600 dark:text-[#94a3b8] text-[11px]">{ent.ate5}</td>
                      <td className="px-3 py-3 text-center font-mono font-bold text-slate-600 dark:text-[#94a3b8] text-[11px]">{ent.ate20}</td>
                      <td className="px-3 py-3 text-center font-mono font-bold text-slate-600 dark:text-[#94a3b8] text-[11px]">{ent.ate999}</td>
                      <td className="px-3 py-3 text-center font-mono font-bold text-slate-600 dark:text-[#94a3b8] text-[11px]">{ent.revista}</td>
                      <td className="px-3 py-3 text-center font-mono font-bold text-slate-600 dark:text-[#94a3b8] text-[11px]">{ent.cards}</td>
                      <td className="px-3 py-3 text-center font-bold text-[#ef4444] text-[11px]">{ent.desconto > 0 ? `- R$ ${ent.desconto.toFixed(2)}` : '-'}</td>
                      <td className="px-5 py-3 text-right font-black text-slate-900 dark:text-[#e2e8f0] text-[13px]">R$ {ent.totalPago.toFixed(2)}</td>
                      <td className="px-5 py-3 text-center">
                        <div className="flex items-center justify-center gap-2">
                          {!ent.pago ? (
                            <>
                              <button onClick={() => prepararEdicao(ent)} className="p-1.5 text-slate-400 hover:text-[#3b82f6] hover:bg-[#3b82f6]/10 rounded-md transition-colors" title="Editar">
                                <Edit3 size={14}/>
                              </button>
                              
                              <button onClick={() => handleExcluir(ent.id)} className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-500/10 rounded-md transition-colors" title="Excluir Lançamento">
                                <Trash2 size={14}/>
                              </button>

                              <button onClick={() => {setArquivoComprovante(null); setModalPagamento({aberto: true, fechamentoId: ent.id, nome: ent.nomeEntregador})}} className="px-3 py-1.5 bg-[#f97316] hover:bg-[#ea580c] text-white rounded-[6px] text-[9px] font-black uppercase tracking-widest shadow-sm transition-colors flex items-center gap-1.5">
                                <CreditCard size={12}/> BAIXAR
                              </button>
                            </>
                          ) : (
                            <div className="flex flex-col items-center justify-center">
                               <span className="px-2 py-0.5 bg-[#10b981]/10 text-[#10b981] border border-[#10b981]/20 rounded-[4px] text-[8px] font-black uppercase flex items-center gap-1"><CheckCircle size={10}/> PAGO E ARQUIVADO</span>
                            </div>
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

      {modalCadastroAberto && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#0f1d33] border border-slate-200 dark:border-[#1a2540] rounded-[16px] w-full max-w-xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-5 py-4 border-b border-slate-200 dark:border-[#1a2540] bg-slate-50 dark:bg-[#070d1a]/50 flex justify-between items-center">
              <h3 className="text-[13px] font-bold text-slate-800 dark:text-[#e2e8f0] uppercase tracking-widest">{editandoId ? "Editar Lançamento" : "Nova Folha de Produção"}</h3>
              <button onClick={() => setModalCadastroAberto(false)} className="text-slate-400 hover:text-red-500"><X size={16}/></button>
            </div>
            
            <form onSubmit={handleSalvar} className="p-6 space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[9px] font-black uppercase tracking-widest text-slate-500 dark:text-[#6b7280] block mb-1.5">Operador(a) da Lista</label>
                  <input required type="text" list="lista-mestra-nomes" value={nomeSelecionado} onChange={(e) => aoMudarNome(e.target.value)} placeholder="Digite o nome..." className="w-full bg-slate-50 dark:bg-[#1a2540] border border-slate-200 dark:border-[#253555] rounded-[8px] px-3 py-2.5 text-[11px] font-bold text-slate-800 dark:text-[#e2e8f0] outline-none focus:border-[#f97316] placeholder:font-normal" />
                </div>
                <div>
                  <label className="text-[9px] font-black uppercase tracking-widest text-slate-500 dark:text-[#6b7280] block mb-1.5">Região da Base</label>
                  <input required value={regiaoAutomatica} onChange={e=>setRegiaoAutomatica(e.target.value)} className="w-full bg-slate-100 dark:bg-[#1a2540]/50 border border-slate-200 dark:border-[#253555] rounded-[8px] px-3 py-2.5 text-[11px] font-bold text-slate-800 dark:text-[#94a3b8] outline-none" readOnly />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div><label className="text-[9px] font-bold text-slate-500 dark:text-[#6b7280] block mb-1">Até 5 <span className="text-[#3b82f6]">(R${taxasAtuais.ATE_5.toFixed(2)})</span></label><input type="number" min="0" value={ate5} onChange={e=>setAte5(Number(e.target.value))} className="w-full bg-white dark:bg-[#1a2540] border border-slate-200 dark:border-[#253555] rounded-[8px] p-2 text-center text-[12px] font-mono font-bold dark:text-[#f1f5f9] outline-none focus:border-[#3b82f6]" /></div>
                <div><label className="text-[9px] font-bold text-slate-500 dark:text-[#6b7280] block mb-1">Até 20 <span className="text-[#3b82f6]">(R${taxasAtuais.ATE_20.toFixed(2)})</span></label><input type="number" min="0" value={ate20} onChange={e=>setAte20(Number(e.target.value))} className="w-full bg-white dark:bg-[#1a2540] border border-slate-200 dark:border-[#253555] rounded-[8px] p-2 text-center text-[12px] font-mono font-bold dark:text-[#f1f5f9] outline-none focus:border-[#3b82f6]" /></div>
                <div><label className="text-[9px] font-bold text-slate-500 dark:text-[#6b7280] block mb-1">Até 999 <span className="text-[#3b82f6]">(R${taxasAtuais.ATE_999.toFixed(2)})</span></label><input type="number" min="0" value={ate999} onChange={e=>setAte999(Number(e.target.value))} className="w-full bg-white dark:bg-[#1a2540] border border-slate-200 dark:border-[#253555] rounded-[8px] p-2 text-center text-[12px] font-mono font-bold dark:text-[#f1f5f9] outline-none focus:border-[#3b82f6]" /></div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div><label className="text-[9px] font-bold text-slate-500 dark:text-[#6b7280] block mb-1">Revista <span className="text-[#10b981]">(R${taxasAtuais.REVISTA.toFixed(2)})</span></label><input type="number" min="0" value={revista} onChange={e=>setRevista(Number(e.target.value))} className="w-full bg-white dark:bg-[#1a2540] border border-slate-200 dark:border-[#253555] rounded-[8px] p-2 text-center text-[12px] font-mono font-bold dark:text-[#f1f5f9] outline-none focus:border-[#10b981]" /></div>
                <div><label className="text-[9px] font-bold text-slate-500 dark:text-[#6b7280] block mb-1">Cards <span className="text-[#10b981]">(R${taxasAtuais.CARDS.toFixed(2)})</span></label><input type="number" min="0" value={cards} onChange={e=>setCards(Number(e.target.value))} className="w-full bg-white dark:bg-[#1a2540] border border-slate-200 dark:border-[#253555] rounded-[8px] p-2 text-center text-[12px] font-mono font-bold dark:text-[#f1f5f9] outline-none focus:border-[#10b981]" /></div>
                <div><label className="text-[9px] font-bold text-[#ef4444] block mb-1">Descontos (R$)</label><input type="number" min="0" step="0.01" value={desconto} onChange={e=>setDesconto(Number(e.target.value))} className="w-full bg-red-50 dark:bg-[#ef4444]/10 border border-red-200 dark:border-[#ef4444]/30 rounded-[8px] p-2 text-center text-[12px] font-mono font-bold text-[#ef4444] outline-none focus:border-[#ef4444]" /></div>
              </div>

              <div className="pt-2">
                 <button type="submit" className="w-full py-3 bg-[#f97316] hover:bg-[#ea580c] text-white font-black text-[11px] uppercase tracking-widest rounded-[8px] flex items-center justify-center gap-1.5 transition-colors shadow-sm">
                   <Save size={14}/> PROCESSAR LANÇAMENTO
                 </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {modalPagamento.aberto && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#0f1d33] border border-slate-200 dark:border-[#1a2540] rounded-[16px] w-full max-w-sm shadow-2xl p-6 text-center animate-in zoom-in-95 duration-200">
            <div className="w-12 h-12 rounded-full bg-[#10b981]/10 flex items-center justify-center mx-auto mb-3">
              <Receipt size={24} className="text-[#10b981]" />
            </div>
            <h3 className="text-[14px] font-black text-slate-800 dark:text-white uppercase tracking-widest mb-1">Confirmar Transferência</h3>
            <p className="text-[11px] font-bold text-slate-500 dark:text-[#94a3b8] mb-5 truncate px-2">{modalPagamento.nome}</p>

            <div onClick={() => !carregandoUpload && fileInputRef.current?.click()} className={`border-2 border-dashed rounded-[12px] p-6 mb-5 transition-colors ${arquivoComprovante ? 'border-[#10b981] bg-[#10b981]/5' : 'border-slate-300 dark:border-[#253555] hover:bg-slate-50 dark:hover:bg-[#1a2540] cursor-pointer'}`}>
              <input type="file" ref={fileInputRef} className="hidden" accept="image/*, application/pdf" onChange={(e) => setArquivoComprovante(e.target.files ? e.target.files[0] : null)}/>
              {arquivoComprovante ? (
                <div className="text-[#10b981] font-bold flex flex-col items-center"><FileCheck size={28} className="mb-2"/><span className="text-[10px] break-all text-center">{arquivoComprovante.name}</span></div>
              ) : (
                <div className="text-slate-400 dark:text-[#6b7280] flex flex-col items-center"><UploadCloud size={28} className="mb-2"/><p className="text-[9px] font-black uppercase tracking-widest text-slate-600 dark:text-[#94a3b8]">Anexar Comprovante PIX</p><p className="text-[9px] mt-1">(Imagem ou PDF)</p></div>
              )}
            </div>

            <div className="flex flex-col gap-2">
               <button onClick={confirmarPagamento} disabled={carregandoUpload} className="w-full bg-[#10b981] hover:bg-emerald-600 text-white font-black text-[11px] uppercase tracking-widest py-3 rounded-[8px] flex items-center justify-center gap-2 shadow-sm transition-colors disabled:opacity-50">
                 {carregandoUpload ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : "Concluir Pagamento"}
               </button>
               <button onClick={() => setModalPagamento({aberto: false, fechamentoId: null, nome: ""})} disabled={carregandoUpload} className="w-full py-2 text-slate-500 hover:text-slate-800 dark:text-[#6b7280] dark:hover:text-white text-[10px] font-bold uppercase tracking-widest transition-colors">Cancelar Operação</button>
            </div>
          </div>
        </div>
      )}

    </Layout>
  );
}