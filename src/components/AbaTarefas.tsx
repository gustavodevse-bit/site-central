import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { Megaphone, BellRing, AlertTriangle, Send, CheckCircle2, Clock, Users, Target, Trash2, ListTodo } from 'lucide-react';

export default function Tarefas() {
  const API_JAVA = 'http://localhost:8081/api';

  const [avisos, setAvisos] = useState<any[]>([]);
  const [carregando, setCarregando] = useState(false);

  // Estados do Formulário
  const [tipo, setTipo] = useState<'aviso' | 'tarefa'>('aviso');
  const [prioridade, setPrioridade] = useState<'normal' | 'alta' | 'urgente'>('normal');
  const [destino, setDestino] = useState('todos');
  const [titulo, setTitulo] = useState('');
  const [mensagem, setMensagem] = useState('');
  const [feedback, setFeedback] = useState<{ msg: string; tipo: 'sucesso' | 'erro' } | null>(null);

  // Simulando carregamento inicial (Aqui você ligará ao seu Java depois)
  useEffect(() => {
    // Exemplo de dados iniciais simulando os que viriam do Banco de Dados
    setAvisos([
      { id: 1, tipo: 'urgente', categoria: 'aviso', titulo: 'Parada no Sistema Loggi', mensagem: 'A API da Loggi está instável. Segurem a bipagem de saída deles até segunda ordem.', destino: 'todos', data: new Date().toISOString(), autor: 'Admin Master' },
      { id: 2, tipo: 'normal', categoria: 'tarefa', titulo: 'Limpeza da Doca 3', mensagem: 'Por favor, ao finalizar a triagem da Total Express, liberem o espaço da Doca 3 para a carreta da noite.', destino: 'logistica', data: new Date(Date.now() - 86400000).toISOString(), autor: 'Supervisão' }
    ]);
  }, []);

  const dispararAviso = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!titulo.trim() || !mensagem.trim()) {
      setFeedback({ msg: 'Preencha o título e a mensagem!', tipo: 'erro' });
      setTimeout(() => setFeedback(null), 3000);
      return;
    }

    setCarregando(true);

    const novoAviso = {
      id: Date.now(),
      tipo: prioridade,
      categoria: tipo,
      titulo,
      mensagem,
      destino,
      data: new Date().toISOString(),
      autor: 'Admin Master' // Puxar do AuthContext na vida real
    };

    // SIMULAÇÃO DE ENVIO PARA O BACKEND (JAVA)
    try {
      /* const res = await fetch(`${API_JAVA}/avisos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(novoAviso)
      });
      */
      
      // Simula um delay de rede
      await new Promise(resolve => setTimeout(resolve, 800));
      
      setAvisos([novoAviso, ...avisos]);
      setTitulo('');
      setMensagem('');
      setPrioridade('normal');
      setTipo('aviso');
      
      setFeedback({ msg: 'Mensagem disparada para a operação!', tipo: 'sucesso' });
    } catch (erro) {
      setFeedback({ msg: 'Erro ao conectar com o servidor.', tipo: 'erro' });
    } finally {
      setCarregando(false);
      setTimeout(() => setFeedback(null), 3000);
    }
  };

  const apagarAviso = (id: number) => {
    if (window.confirm('Tem certeza que deseja apagar este aviso do painel dos operadores?')) {
      setAvisos(avisos.filter(a => a.id !== id));
      // Aqui entraria a chamada DELETE para o Java
    }
  };

  return (
    <Layout titulo="Central de Comunicação">
      <div className="max-w-7xl mx-auto space-y-6 animate-fade-in pb-10">
        
        {/* Banner Superior */}
        <div className="bg-white dark:bg-[#111827] rounded-3xl p-8 border border-gray-200 dark:border-gray-800 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#FF7A00] opacity-5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
          
          <div className="relative z-10 flex items-center gap-5">
            <div className="w-16 h-16 bg-[#FF7A00]/10 text-[#FF7A00] rounded-2xl flex items-center justify-center border border-[#FF7A00]/20 shadow-inner">
               <Megaphone size={32} />
            </div>
            <div>
              <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">Transmissão Global</h2>
              <p className="text-sm font-medium text-gray-500 mt-1">Dispare avisos, alertas ou delegue tarefas diretamente para os painéis (TVs e PCs) da operação no galpão.</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* COLUNA ESQUERDA: FORMULÁRIO DE DISPARO */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white dark:bg-[#1f2937]/80 rounded-3xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                <Send size={18} className="text-[#FF7A00]" /> Nova Mensagem
              </h3>

              <form onSubmit={dispararAviso} className="space-y-5">
                
                {/* Tipo de Mensagem */}
                <div className="grid grid-cols-2 gap-3">
                  <button type="button" onClick={() => setTipo('aviso')} className={`p-3 rounded-xl border font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${tipo === 'aviso' ? 'bg-[#FF7A00] text-white border-[#FF7A00] shadow-md' : 'bg-gray-50 dark:bg-[#111827] text-gray-500 border-gray-200 dark:border-gray-700 hover:border-gray-400'}`}>
                    <BellRing size={16} /> Aviso
                  </button>
                  <button type="button" onClick={() => setTipo('tarefa')} className={`p-3 rounded-xl border font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${tipo === 'tarefa' ? 'bg-blue-600 text-white border-blue-600 shadow-md' : 'bg-gray-50 dark:bg-[#111827] text-gray-500 border-gray-200 dark:border-gray-700 hover:border-gray-400'}`}>
                    <ListTodo size={16} /> Tarefa
                  </button>
                </div>

                {/* Prioridade */}
                <div>
                  <label className="text-[10px] font-black uppercase text-gray-500 dark:text-gray-400 mb-2 block tracking-widest">Nível de Prioridade</label>
                  <div className="flex gap-2 bg-gray-50 dark:bg-[#111827] p-1.5 rounded-xl border border-gray-200 dark:border-gray-700">
                    {['normal', 'alta', 'urgente'].map((nivel) => (
                      <button 
                        key={nivel} type="button" onClick={() => setPrioridade(nivel as any)}
                        className={`flex-1 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                          prioridade === nivel 
                            ? nivel === 'urgente' ? 'bg-red-500 text-white shadow-sm' : nivel === 'alta' ? 'bg-amber-500 text-white shadow-sm' : 'bg-gray-200 dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                            : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                        }`}
                      >
                        {nivel}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Destino */}
                <div>
                  <label className="text-[10px] font-black uppercase text-gray-500 dark:text-gray-400 mb-2 flex items-center gap-1.5 tracking-widest"><Target size={14}/> Destinatários</label>
                  <select value={destino} onChange={(e) => setDestino(e.target.value)} className="w-full bg-gray-50 dark:bg-[#111827] border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white px-4 py-3 rounded-xl outline-none focus:border-[#FF7A00] transition-colors text-sm font-bold cursor-pointer">
                    <option value="todos">Todos os Painéis (Sino Global)</option>
                    <option value="logistica">Apenas Pátio Logístico (Conferentes)</option>
                    <option value="motoristas">Apenas App dos Motoristas</option>
                  </select>
                </div>

                {/* Título e Mensagem */}
                <div className="space-y-3 pt-2">
                  <input type="text" value={titulo} onChange={(e) => setTitulo(e.target.value)} placeholder="Título do Aviso (Ex: Caminhão Atrasado)" className="w-full bg-gray-50 dark:bg-[#111827] border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white px-4 py-3 rounded-xl outline-none focus:border-[#FF7A00] transition-colors text-sm font-bold placeholder:text-gray-400" />
                  <textarea value={mensagem} onChange={(e) => setMensagem(e.target.value)} placeholder="Detalhes da tarefa ou aviso que aparecerá no sininho deles..." className="w-full h-32 resize-none bg-gray-50 dark:bg-[#111827] border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white px-4 py-3 rounded-xl outline-none focus:border-[#FF7A00] transition-colors text-sm font-medium placeholder:text-gray-400" />
                </div>

                {/* Feedback */}
                {feedback && (
                  <div className={`p-3 rounded-xl text-xs font-bold flex items-center gap-2 ${feedback.tipo === 'sucesso' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>
                    {feedback.tipo === 'sucesso' ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
                    {feedback.msg}
                  </div>
                )}

                <button type="submit" disabled={carregando} className="w-full bg-gradient-to-r from-[#FF7A00] to-[#e65c00] hover:from-[#e65c00] hover:to-[#cc5200] text-white font-black py-4 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-[#FF7A00]/20 transition-all hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100">
                  {carregando ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <><Megaphone size={18} /> DISPARAR PARA OPERAÇÃO</>}
                </button>
              </form>
            </div>
          </div>

          {/* COLUNA DIREITA: HISTÓRICO DE MENSAGENS ATIVAS */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white dark:bg-[#111827] rounded-3xl p-6 border border-gray-200 dark:border-gray-800 shadow-sm min-h-[600px] flex flex-col">
              <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-200 dark:border-gray-800">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <Clock size={18} className="text-gray-400" /> Histórico de Disparos Ativos
                </h3>
                <span className="text-[10px] font-black bg-gray-100 dark:bg-gray-800 text-gray-500 px-3 py-1 rounded-full tracking-widest uppercase">
                  {avisos.length} Notificações no Ar
                </span>
              </div>

              <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-4">
                {avisos.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-gray-400 opacity-50">
                    <BellRing size={64} className="mb-4" />
                    <p className="font-bold">Nenhum aviso ativo no painel da operação.</p>
                  </div>
                ) : (
                  avisos.map((aviso) => (
                    <div key={aviso.id} className="relative bg-gray-50 dark:bg-[#1f2937]/50 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 group transition-all hover:border-gray-300 dark:hover:border-gray-600">
                      
                      {/* Badge Urgência */}
                      <div className={`absolute -top-3 -right-2 px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest shadow-md flex items-center gap-1 ${
                        aviso.tipo === 'urgente' ? 'bg-red-500 text-white' : 
                        aviso.tipo === 'alta' ? 'bg-amber-500 text-white' : 
                        'bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300 shadow-none'
                      }`}>
                        {aviso.tipo === 'urgente' && <AlertTriangle size={10} />}
                        {aviso.tipo}
                      </div>

                      <div className="flex items-start gap-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-inner ${aviso.categoria === 'tarefa' ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' : 'bg-[#FF7A00]/10 text-[#FF7A00]'}`}>
                          {aviso.categoria === 'tarefa' ? <ListTodo size={24} /> : <Megaphone size={24} />}
                        </div>
                        
                        <div className="flex-1">
                          <h4 className="text-lg font-black text-gray-900 dark:text-white leading-tight">{aviso.titulo}</h4>
                          <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mt-2 leading-relaxed">{aviso.mensagem}</p>
                          
                          <div className="flex items-center gap-4 mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
                            <span className="text-[10px] font-bold text-gray-500 flex items-center gap-1.5 uppercase tracking-widest">
                              <Clock size={12} /> {new Date(aviso.data).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })}
                            </span>
                            <span className="text-[10px] font-bold text-gray-500 flex items-center gap-1.5 uppercase tracking-widest">
                              <Users size={12} /> Destino: {aviso.destino}
                            </span>
                          </div>
                        </div>

                        <button onClick={() => apagarAviso(aviso.id)} className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-900/30 dark:hover:text-red-400 transition-colors shrink-0">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

        </div>
      </div>
    </Layout>
  );
}