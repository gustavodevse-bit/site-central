import React, { useState, useEffect } from "react";
import Layout from "../components/Layout";
import { useAuth } from "../contexts/AuthContext";
import { 
  User, Mail, Phone, Lock, Save, Shield, 
  Bell, Activity, MapPin, CheckCircle, AlertTriangle, Key, Smartphone
} from "lucide-react";

export default function Perfil() {
  const { usuario } = useAuth();
  
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [telefone, setTelefone] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [salvando, setSalvando] = useState(false);

  // Toggles de Notificação
  const [notifSistema, setNotifSistema] = useState(true);
  const [notifEmail, setNotifEmail] = useState(true);
  const [notifRelatorios, setNotifRelatorios] = useState(false);

  // Tema
  const [isDark, setIsDark] = useState(document.documentElement.classList.contains('dark'));

  // Notificações
  const [toasts, setToasts] = useState<{id: number, msg: string, tipo: string}[]>([]);
  const showToast = (msg: string, tipo: string) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, msg, tipo }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3500);
  };

  useEffect(() => {
    // Ao carregar, preenche com os dados reais do usuário logado
    if (usuario) {
      setNome(usuario.nome || "");
      setEmail(usuario.email || "");
      setTelefone(usuario.telefone || "");
    }
    
    const handleThemeChange = () => setIsDark(document.documentElement.classList.contains('dark'));
    window.addEventListener('themeChange', handleThemeChange);
    return () => window.removeEventListener('themeChange', handleThemeChange);
  }, [usuario]);

  const handleSalvar = async (e: React.FormEvent) => {
    e.preventDefault();
    setSalvando(true);
    
    // Simulando uma requisição para a sua API Java
    try {
      await new Promise(r => setTimeout(r, 600)); // Delay falso
      // Aqui você pode plugar o fetch para o backend atualizar os dados
      showToast("Dados do perfil atualizados com sucesso!", "sucesso");
      setNovaSenha(""); // Limpa o campo de senha após salvar
    } catch (err) {
      showToast("Erro ao atualizar o perfil.", "erro");
    } finally {
      setSalvando(false);
    }
  };

  const cargoReal = usuario?.cargo || "OPERACIONAL";
  const iniciais = nome.substring(0, 2).toUpperCase() || "OP";

  return (
    <Layout titulo="Configurações da Conta">
      
      <style>
        {`
          .custom-scrollbar::-webkit-scrollbar { width: 4px; height: 4px; }
          .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
          .custom-scrollbar::-webkit-scrollbar-thumb { background: #253555; border-radius: 4px; }
          .content-grid { display: flex; flex-direction: column; gap: 14px; width: 100%; height: 100%; }
          .panel-col { flex: 1; background: ${isDark ? '#0f1d33' : '#ffffff'}; border: 1px solid ${isDark ? '#1a2540' : '#e2e8f0'}; border-radius: 12px; display: flex; flex-direction: column; overflow: hidden; min-w: 0; }
          .panel-header { padding: 16px 20px; border-bottom: 1px solid ${isDark ? '#1a2540' : '#e2e8f0'}; background: ${isDark ? 'rgba(7,13,26,0.5)' : '#f8fafc'}; flex-shrink: 0; }
          
          /* Corrige o fundo amarelo do Autofill do Chrome no Modo Escuro */
          input:-webkit-autofill {
              -webkit-box-shadow: 0 0 0 30px ${isDark ? '#1a2540' : '#f8fafc'} inset !important;
              -webkit-text-fill-color: ${isDark ? '#f1f5f9' : '#1e293b'} !important;
          }
        `}
      </style>

      <div className="content-grid overflow-y-auto custom-scrollbar pb-6">
        
        {/* TOASTS */}
        <div className="fixed bottom-6 right-6 z-[9999] flex flex-col items-end gap-2 pointer-events-none">
          {toasts.map(t => (
            <div key={t.id} className={`flex items-center gap-3 px-4 py-3 rounded-[8px] shadow-lg text-[11px] font-bold tracking-widest uppercase transition-all animate-in slide-in-from-bottom-5 ${t.tipo === 'sucesso' ? 'bg-[#10b981] text-white' : 'bg-[#ef4444] text-white'}`}>
              {t.tipo === 'sucesso' ? <CheckCircle size={14} /> : <AlertTriangle size={14} />} {t.msg}
            </div>
          ))}
        </div>

        {/* 1. BANNER DO PERFIL (Estilo Credencial) */}
        <div className="bg-white dark:bg-[#0f1d33] border border-slate-200 dark:border-[#1a2540] rounded-[12px] shadow-sm relative overflow-hidden transition-colors shrink-0">
          <div className="h-28 bg-gradient-to-r from-slate-200 dark:from-[#070d1a] to-[#f97316]/20"></div>
          
          <div className="px-8 pb-6 relative flex flex-col md:flex-row md:items-end gap-5">
            <div className="absolute -top-12 border-[4px] border-white dark:border-[#0f1d33] h-24 w-24 bg-[#f97316] rounded-[16px] flex items-center justify-center font-black text-white text-3xl shadow-sm transition-colors z-10 rotate-3">
              {iniciais}
            </div>
            
            <div className="mt-14 md:mt-0 ml-0 md:ml-[110px] flex-1">
              <h2 className="text-[20px] font-black text-slate-800 dark:text-[#f1f5f9] leading-none mb-1">{nome}</h2>
              <div className="flex items-center gap-3 mt-2">
                <span className="text-[10px] font-bold text-slate-500 dark:text-[#94a3b8] flex items-center gap-1"><Mail size={12}/> {email}</span>
                <span className="text-[10px] font-bold text-[#f97316] bg-[#f97316]/10 px-2 py-0.5 rounded-[4px] border border-[#f97316]/20 flex items-center gap-1"><Shield size={12}/> {cargoReal}</span>
              </div>
            </div>
            
            <div className="flex flex-col items-end gap-1">
              <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 dark:text-[#6b7280]">Status da Conta</span>
              <span className="px-3 py-1.5 bg-[#10b981]/10 text-[#10b981] border border-[#10b981]/20 text-[10px] font-black uppercase tracking-widest rounded-[6px] flex items-center gap-1.5 shadow-sm">
                <CheckCircle size={12}/> Operante
              </span>
            </div>
          </div>
        </div>

        {/* 2. CONTEÚDO DIVIDIDO */}
        <div className="flex flex-col lg:flex-row gap-[14px]">
          
          {/* LADO ESQUERDO: DADOS PESSOAIS */}
          <div className="panel-col shadow-sm transition-colors flex-[1.5]">
            <div className="panel-header transition-colors">
              <h3 className="text-[13px] font-bold text-slate-800 dark:text-[#e2e8f0] flex items-center gap-2 uppercase tracking-widest">
                <User size={14} className="text-[#3b82f6]"/> Dados Cadastrais
              </h3>
            </div>
            
            <form onSubmit={handleSalvar} className="p-6 space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="text-[9px] font-black uppercase tracking-widest text-slate-500 dark:text-[#6b7280] block mb-1.5">Nome de Operador</label>
                  <div className="relative">
                    <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-[#6b7280]" />
                    <input type="text" value={nome} onChange={e=>setNome(e.target.value)} required className="w-full bg-slate-50 dark:bg-[#1a2540] border border-slate-200 dark:border-[#253555] rounded-[8px] px-3 py-2.5 pl-9 text-[12px] font-bold text-slate-800 dark:text-[#e2e8f0] outline-none focus:border-[#3b82f6] transition-colors" />
                  </div>
                </div>
                <div>
                  <label className="text-[9px] font-black uppercase tracking-widest text-slate-500 dark:text-[#6b7280] block mb-1.5">E-mail Corporativo</label>
                  <div className="relative">
                    <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-[#6b7280]" />
                    <input type="email" value={email} disabled className="w-full bg-slate-100 dark:bg-[#070d1a] border border-slate-200 dark:border-[#1a2540] rounded-[8px] px-3 py-2.5 pl-9 text-[12px] font-bold text-slate-400 dark:text-[#6b7280] outline-none cursor-not-allowed transition-colors" />
                  </div>
                  <p className="text-[8px] text-slate-400 mt-1">E-mail bloqueado. Peça alteração ao administrador.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="text-[9px] font-black uppercase tracking-widest text-slate-500 dark:text-[#6b7280] block mb-1.5">Telefone / WhatsApp</label>
                  <div className="relative">
                    <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-[#6b7280]" />
                    <input type="text" value={telefone} onChange={e=>setTelefone(e.target.value)} placeholder="(00) 00000-0000" className="w-full bg-slate-50 dark:bg-[#1a2540] border border-slate-200 dark:border-[#253555] rounded-[8px] px-3 py-2.5 pl-9 text-[12px] font-bold text-slate-800 dark:text-[#e2e8f0] outline-none focus:border-[#3b82f6] transition-colors placeholder:font-normal" />
                  </div>
                </div>
                <div>
                  <label className="text-[9px] font-black uppercase tracking-widest text-slate-500 dark:text-[#6b7280] block mb-1.5">Atualizar Senha</label>
                  <div className="relative">
                    <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-[#6b7280]" />
                    <input type="password" value={novaSenha} onChange={e=>setNovaSenha(e.target.value)} placeholder="Deixe em branco para manter" className="w-full bg-slate-50 dark:bg-[#1a2540] border border-slate-200 dark:border-[#253555] rounded-[8px] px-3 py-2.5 pl-9 text-[12px] font-bold text-slate-800 dark:text-[#e2e8f0] outline-none focus:border-[#f97316] transition-colors placeholder:font-normal" />
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200 dark:border-[#1a2540] flex justify-end">
                <button type="submit" disabled={salvando} className="bg-[#f97316] hover:bg-[#ea580c] text-white font-black py-2.5 px-6 rounded-[8px] flex items-center gap-2 transition-colors uppercase tracking-widest text-[11px] shadow-sm disabled:opacity-50">
                  {salvando ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <><Save size={14}/> Gravar Alterações</>}
                </button>
              </div>
            </form>
          </div>

          {/* LADO DIREITO: PREFERÊNCIAS E SEGURANÇA */}
          <div className="flex flex-col gap-[14px] flex-1">
            
            {/* Preferências */}
            <div className="panel-col shadow-sm transition-colors h-auto">
              <div className="panel-header transition-colors">
                <h3 className="text-[13px] font-bold text-slate-800 dark:text-[#e2e8f0] flex items-center gap-2 uppercase tracking-widest">
                  <Bell size={14} className="text-[#f59e0b]"/> Alertas & Relatórios
                </h3>
              </div>
              <div className="p-5 space-y-4">
                 
                 <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[11px] font-bold text-slate-800 dark:text-[#f1f5f9]">Avisos do Sistema</p>
                      <p className="text-[9px] text-slate-500 dark:text-[#6b7280]">Receber notificações push no painel.</p>
                    </div>
                    <button type="button" onClick={()=>setNotifSistema(!notifSistema)} className={`w-9 h-5 rounded-full relative transition-colors ${notifSistema ? 'bg-[#10b981]' : 'bg-slate-300 dark:bg-[#253555]'}`}>
                      <div className={`w-3.5 h-3.5 bg-white rounded-full absolute top-[3px] transition-all ${notifSistema ? 'left-[22px]' : 'left-[3px]'}`}></div>
                    </button>
                 </div>

                 <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[11px] font-bold text-slate-800 dark:text-[#f1f5f9]">Alertas por E-mail</p>
                      <p className="text-[9px] text-slate-500 dark:text-[#6b7280]">Falhas em rotas e entregas atrasadas.</p>
                    </div>
                    <button type="button" onClick={()=>setNotifEmail(!notifEmail)} className={`w-9 h-5 rounded-full relative transition-colors ${notifEmail ? 'bg-[#10b981]' : 'bg-slate-300 dark:bg-[#253555]'}`}>
                      <div className={`w-3.5 h-3.5 bg-white rounded-full absolute top-[3px] transition-all ${notifEmail ? 'left-[22px]' : 'left-[3px]'}`}></div>
                    </button>
                 </div>

                 <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[11px] font-bold text-slate-800 dark:text-[#f1f5f9]">Resumo Diário</p>
                      <p className="text-[9px] text-slate-500 dark:text-[#6b7280]">Planilha de fechamento via e-mail.</p>
                    </div>
                    <button type="button" onClick={()=>setNotifRelatorios(!notifRelatorios)} className={`w-9 h-5 rounded-full relative transition-colors ${notifRelatorios ? 'bg-[#10b981]' : 'bg-slate-300 dark:bg-[#253555]'}`}>
                      <div className={`w-3.5 h-3.5 bg-white rounded-full absolute top-[3px] transition-all ${notifRelatorios ? 'left-[22px]' : 'left-[3px]'}`}></div>
                    </button>
                 </div>

              </div>
            </div>

            {/* Log de Segurança */}
            <div className="panel-col shadow-sm transition-colors flex-1">
              <div className="panel-header transition-colors">
                <h3 className="text-[13px] font-bold text-slate-800 dark:text-[#e2e8f0] flex items-center gap-2 uppercase tracking-widest">
                  <Activity size={14} className="text-[#10b981]"/> Auditoria de Acesso
                </h3>
              </div>
              <div className="p-5 space-y-3">
                 <div className="bg-slate-50 dark:bg-[#1a2540]/30 border border-slate-200 dark:border-[#253555] rounded-[8px] p-3 flex gap-3 items-center">
                    <div className="w-8 h-8 rounded-[6px] bg-[#10b981]/10 text-[#10b981] flex items-center justify-center shrink-0 border border-[#10b981]/20"><Smartphone size={14}/></div>
                    <div className="flex-1 min-w-0">
                       <p className="text-[11px] font-bold text-slate-800 dark:text-[#f1f5f9]">Sessão Atual</p>
                       <p className="text-[9px] text-slate-500 dark:text-[#6b7280] truncate">IP: 192.168.1.100 • Aracaju, SE</p>
                    </div>
                    <span className="text-[9px] text-[#10b981] font-black uppercase tracking-widest">Agora</span>
                 </div>

                 <div className="bg-slate-50 dark:bg-[#1a2540]/30 border border-slate-200 dark:border-[#253555] rounded-[8px] p-3 flex gap-3 items-center opacity-70">
                    <div className="w-8 h-8 rounded-[6px] bg-slate-200 dark:bg-[#0f1d33] text-slate-500 dark:text-[#94a3b8] flex items-center justify-center shrink-0 border border-slate-300 dark:border-[#253555]"><Key size={14}/></div>
                    <div className="flex-1 min-w-0">
                       <p className="text-[11px] font-bold text-slate-800 dark:text-[#f1f5f9]">Login no Sistema</p>
                       <p className="text-[9px] text-slate-500 dark:text-[#6b7280] truncate">Navegador Chrome • Windows 10</p>
                    </div>
                    <span className="text-[9px] text-slate-500 font-bold">Há 2h</span>
                 </div>
              </div>
            </div>

          </div>
        </div>

      </div>
    </Layout>
  );
}