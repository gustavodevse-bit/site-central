import React, { useState } from "react";
import Layout from "../components/Layout";

// Dados dos gráficos (Resumo)
const dadosGrafico = [
  { categoria: 'Logística', valor: 45000 },
  { categoria: 'Estoque', valor: 32000 },
  { categoria: 'Marketing', valor: 12000 },
  { categoria: 'Salários', valor: 85000 },
  { categoria: 'Outros', valor: 8000 },
];

const COLORS = ['#FF7A00', '#0ea5e9', '#22c55e', '#8b5cf6', '#f43f5e'];

const despesasIniciais = [
  { id: 1, data: '24 Abr 2026', descricao: 'Abastecimento Frota Caminhões', categoria: 'Logística', valor: 'R$ 4.500,00', status: 'Pago' },
  { id: 2, data: '23 Abr 2026', descricao: 'Compra Embalagens Papelão', categoria: 'Estoque', valor: 'R$ 8.200,00', status: 'Pendente' },
];

export default function Despesas() {
  const [listaDespesas, setListaDespesas] = useState(despesasIniciais);
  
  // --- ESTADOS DO MODAL (POP-UP) ---
  const [modalAberto, setModalAberto] = useState(false);
  const [novaDescricao, setNovaDescricao] = useState("");
  const [novoValor, setNovoValor] = useState("");
  const [novaCategoria, setNovaCategoria] = useState("Outros");
  const [novaData, setNovaData] = useState("");
  const [novoStatus, setNovoStatus] = useState("Pendente");

  // Função para deletar
  const removerDespesa = (id: number) => {
    const novaLista = listaDespesas.filter(despesa => despesa.id !== id);
    setListaDespesas(novaLista);
  };

  // Função para SALVAR a nova despesa
  const salvarDespesa = (e: React.FormEvent) => {
    e.preventDefault(); // Evita que a página recarregue

    // Formata a data (de AAAA-MM-DD para DD/MM/AAAA)
    const partesData = novaData.split('-');
    const dataFormatada = partesData.length === 3 ? `${partesData[2]}/${partesData[1]}/${partesData[0]}` : novaData;

    // Formata o valor para dinheiro (ex: 150.50 vira R$ 150,50)
    const valorFormatado = `R$ ${parseFloat(novoValor).toFixed(2).replace('.', ',')}`;

    // Cria o novo objeto
    const novaDespesaObj = {
      id: Date.now(), // Gera um ID único baseado na hora
      data: dataFormatada,
      descricao: novaDescricao,
      categoria: novaCategoria,
      valor: valorFormatado,
      status: novoStatus
    };

    // Adiciona no topo da lista
    setListaDespesas([novaDespesaObj, ...listaDespesas]);

    // Limpa o formulário e fecha o modal
    setNovaDescricao("");
    setNovoValor("");
    setNovaData("");
    setModalAberto(false);
  };

  return (
    <Layout titulo="Gestão de Despesas">
      <div className="space-y-6 animate-fade-right pb-10">
        
        {/* --- CABEÇALHO DE IA (DEEPSEEK) --- */}
        <div className="bg-gradient-to-r from-[#131d2f] to-[#FF7A00]/10 border border-[#FF7A00]/30 p-6 rounded-2xl shadow-lg relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-20 group-hover:opacity-40 transition-opacity">
             <div className="animate-ping h-8 w-8 rounded-full bg-[#FF7A00]"></div>
          </div>
          <div className="flex flex-col md:flex-row items-center gap-6 relative z-10">
            <div className="h-16 w-16 bg-[#0b1121] border border-[#FF7A00] rounded-xl flex items-center justify-center shadow-[0_0_15px_rgba(255,122,0,0.3)]">
               <span className="text-[#FF7A00] font-black text-xl">DS</span>
            </div>
            <div className="flex-1 text-center md:text-left">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">DeepSeek Intelligence</h2>
              <p className="text-gray-500 dark:text-gray-400 text-sm mt-1 italic">
                "Análise concluída. Notei uma economia de 12% em Logística nesta quinzena. Sugiro renegociar os contratos da categoria 'Outros' para aumentar a margem."
              </p>
            </div>
            <button className="bg-[#FF7A00] hover:bg-[#e66a00] text-white px-6 py-3 rounded-xl font-bold text-sm transition-all transform hover:-translate-y-1 shadow-lg">
              GERAR RELATÓRIO IA
            </button>
          </div>
        </div>

        {/* --- GRID E GRÁFICOS OCULTADOS AQUI PARA ENCURTAR (Mantenha igual ao seu) --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-[#1f2937]/80 border border-gray-200 dark:border-gray-700 p-6 rounded-2xl shadow-sm dark:shadow-lg transition-colors duration-300">
            <p className="text-gray-500 text-xs font-bold uppercase">Total de Despesas (Mês)</p>
            <h4 className="text-3xl font-black mt-2 text-red-500">R$ 182.000</h4>
          </div>
          <div className="bg-white dark:bg-[#1f2937]/80 border border-gray-200 dark:border-gray-700 p-6 rounded-2xl shadow-sm dark:shadow-lg transition-colors duration-300">
            <p className="text-gray-500 text-xs font-bold uppercase">Pagamentos Pendentes</p>
            <h4 className="text-3xl font-black mt-2 text-orange-500">14 Contas</h4>
          </div>
          <div className="bg-white dark:bg-[#1f2937]/80 border border-gray-200 dark:border-gray-700 p-6 rounded-2xl shadow-sm dark:shadow-lg transition-colors duration-300">
            <p className="text-gray-500 text-xs font-bold uppercase">Economia Gerada</p>
            <h4 className="text-3xl font-black mt-2 text-green-500">R$ 14.250</h4>
          </div>
        </div>

        {/* --- LISTA DE DESPESAS --- */}
        <div className="bg-white dark:bg-[#1f2937]/80 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-sm dark:shadow-lg backdrop-blur-sm transition-colors duration-300 overflow-hidden relative z-0">
          
          <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
             <h3 className="text-lg font-bold text-gray-900 dark:text-white">Lançamentos Recentes</h3>
             {/* BOTÃO QUE ABRE O POP-UP */}
             <button 
                onClick={() => setModalAberto(true)} 
                className="flex items-center gap-2 bg-[#FF7A00] hover:bg-[#e65c00] text-white px-4 py-2 rounded-lg font-semibold text-sm transition-colors shadow-md"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                Nova Despesa
             </button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-800/50 text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider">
                  <th className="px-6 py-4 font-semibold">Data</th>
                  <th className="px-6 py-4 font-semibold">Descrição</th>
                  <th className="px-6 py-4 font-semibold">Categoria</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                  <th className="px-6 py-4 font-semibold text-right">Valor</th>
                  <th className="px-6 py-4 font-semibold text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {listaDespesas.map((despesa) => (
                  <tr key={despesa.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/20 transition-colors">
                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">{despesa.data}</td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">{despesa.descricao}</td>
                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">{despesa.categoria}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold border ${despesa.status === 'Pago' ? 'bg-green-100 dark:bg-green-500/10 text-green-700 dark:text-green-400 border-green-200 dark:border-green-500/20' : 'bg-orange-100 dark:bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-200 dark:border-orange-500/20'}`}>
                        {despesa.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-red-500 text-right">-{despesa.valor}</td>
                    <td className="px-6 py-4 text-center">
                      <button onClick={() => removerDespesa(despesa.id)} className="text-gray-400 hover:text-red-500 transition-colors p-2 rounded-full hover:bg-red-50 dark:hover:bg-red-500/10" title="Remover">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* ==========================================================
          MODAL (POP-UP) DE NOVA DESPESA
          ========================================================== */}
      {modalAberto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-right">
          
          <div className="bg-white dark:bg-[#1f2937] border border-gray-200 dark:border-gray-700 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
            
            {/* Cabeçalho do Pop-up */}
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-[#111827]">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Registrar Despesa</h3>
              <button onClick={() => setModalAberto(false)} className="text-gray-400 hover:text-red-500 transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            {/* Formulário */}
            <form onSubmit={salvarDespesa} className="p-6 space-y-4">
              
              <div>
                <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Descrição</label>
                <input type="text" required value={novaDescricao} onChange={(e) => setNovaDescricao(e.target.value)} placeholder="Ex: Conta de Luz" className="w-full mt-1 px-4 py-3 rounded-xl bg-gray-50 dark:bg-[#111827] border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white focus:border-[#FF7A00] focus:ring-1 focus:ring-[#FF7A00] outline-none transition-all" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Valor (R$)</label>
                  <input type="number" step="0.01" required value={novoValor} onChange={(e) => setNovoValor(e.target.value)} placeholder="0.00" className="w-full mt-1 px-4 py-3 rounded-xl bg-gray-50 dark:bg-[#111827] border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white focus:border-[#FF7A00] focus:ring-1 focus:ring-[#FF7A00] outline-none transition-all" />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Data</label>
                  <input type="date" required value={novaData} onChange={(e) => setNovaData(e.target.value)} className="w-full mt-1 px-4 py-3 rounded-xl bg-gray-50 dark:bg-[#111827] border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white focus:border-[#FF7A00] focus:ring-1 focus:ring-[#FF7A00] outline-none transition-all" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Categoria</label>
                  <select value={novaCategoria} onChange={(e) => setNovaCategoria(e.target.value)} className="w-full mt-1 px-4 py-3 rounded-xl bg-gray-50 dark:bg-[#111827] border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white focus:border-[#FF7A00] outline-none transition-all">
                    <option>Logística</option>
                    <option>Estoque</option>
                    <option>Marketing</option>
                    <option>Salários</option>
                    <option>Outros</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Status</label>
                  <select value={novoStatus} onChange={(e) => setNovoStatus(e.target.value)} className="w-full mt-1 px-4 py-3 rounded-xl bg-gray-50 dark:bg-[#111827] border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white focus:border-[#FF7A00] outline-none transition-all">
                    <option>Pendente</option>
                    <option>Pago</option>
                  </select>
                </div>
              </div>

              {/* Botões do Rodapé */}
              <div className="flex gap-4 pt-4 mt-6 border-t border-gray-200 dark:border-gray-700">
                <button type="button" onClick={() => setModalAberto(false)} className="w-1/2 py-3 rounded-xl font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                  Cancelar
                </button>
                <button type="submit" className="w-1/2 py-3 rounded-xl font-bold text-white bg-[#FF7A00] hover:bg-[#e65c00] shadow-lg transition-colors">
                  Salvar Despesa
                </button>
              </div>

            </form>
          </div>
        </div>
      )}
    </Layout>
  );
}