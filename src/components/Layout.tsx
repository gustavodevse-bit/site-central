import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, Truck, Car, Users, Receipt, ShieldCheck, 
  User, Bell, Moon, Sun, Undo2, AlertTriangle, Box, TrendingDown
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext"; 

export default function Layout({ children, titulo }: { children: React.ReactNode; titulo?: string }) {
  const location = useLocation();
  const { usuario, logout, temAcesso } = useAuth(); 

  const [temaEscuro, setTemaEscuro] = useState(() => {
    const salvo = localStorage.getItem("temaNordex");
    return salvo !== null ? salvo === "escuro" : true; 
  });

  useEffect(() => {
    localStorage.setItem("temaNordex", temaEscuro ? "escuro" : "claro");
    if (temaEscuro) {
      document.documentElement.classList.add('dark');
      window.dispatchEvent(new Event('themeChange')); 
    } else {
      document.documentElement.classList.remove('dark');
      window.dispatchEvent(new Event('themeChange')); 
    }
  }, [temaEscuro]);

  const isActive = (caminho: string) => location.pathname === caminho;

  const cargoSalvo = (usuario?.cargo || "OPERACIONAL").toUpperCase();
  const nomeReal = usuario?.nome || "Admin";
  const iniciais = nomeReal.substring(0, 1).toUpperCase();

  const podeVerOperacao = temAcesso('Operação', cargoSalvo);
  const podeVerFrota = temAcesso('Gestão de Frota', cargoSalvo);
  const podeVerFinanceiro = temAcesso('Financeiro', cargoSalvo);
  const podeVerSupervisao = temAcesso('Supervisão', cargoSalvo);

  return (
    <div className="flex w-full h-screen bg-slate-100 dark:bg-[#0c1428] text-slate-800 dark:text-[#e2e8f0] text-[13px] font-sans overflow-hidden transition-colors duration-300 print:h-auto print:overflow-visible print:bg-white print:text-black">
      
      <aside className="w-[180px] bg-white dark:bg-[#070d1a] border-r border-slate-200 dark:border-[#1a2540] flex flex-col shrink-0 z-20 h-screen transition-colors duration-300 print:hidden">
        <div className="px-4 h-[62px] border-b border-slate-200 dark:border-[#1a2540] flex items-center shrink-0">
          <div className="flex items-center gap-2 select-none cursor-default">
            <div className="w-7 h-7 bg-gradient-to-br from-[#f97316] to-[#ea580c] rounded-md flex items-center justify-center shadow-sm">
               <Box size={16} className="text-white" />
            </div>
            <div className="text-[20px] font-black tracking-tight leading-none">
              <span className="text-slate-800 dark:text-[#f1f5f9]">NORD</span><span className="text-[#f97316]">EX</span>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 overflow-y-auto custom-scrollbar space-y-1">
          <Link to="/dashboard" className={`flex items-center gap-[10px] px-3 py-2 rounded-lg transition-all ${isActive("/dashboard") ? 'bg-[#f97316] text-white shadow-sm' : 'text-slate-500 dark:text-[#94a3b8] hover:bg-slate-100 dark:hover:bg-[#1a2540] hover:text-slate-900 dark:hover:text-[#f1f5f9]'}`}>
            <LayoutDashboard size={15} />
            <span className="text-[12px] font-bold">Visão Geral</span>
          </Link>
          
          {podeVerOperacao && (
            <>
              <div className="text-[9px] font-black text-slate-400 dark:text-[#4b5563] tracking-widest uppercase px-3 pt-4 pb-1.5">OPERAÇÃO</div>
              <Link to="/rastreio" className={`flex items-center gap-[10px] px-3 py-2 rounded-lg transition-all ${isActive("/rastreio") ? 'bg-[#f97316] text-white shadow-sm' : 'text-slate-500 dark:text-[#94a3b8] hover:bg-slate-100 dark:hover:bg-[#1a2540] hover:text-slate-900 dark:hover:text-[#f1f5f9]'}`}>
                <Truck size={15} />
                <span className="text-[12px] font-bold">Painel Logístico</span>
              </Link>
              <Link to="/reversa" className={`flex items-center gap-[10px] px-3 py-2 rounded-lg transition-all ${isActive("/reversa") ? 'bg-[#f97316] text-white shadow-sm' : 'text-slate-500 dark:text-[#94a3b8] hover:bg-slate-100 dark:hover:bg-[#1a2540] hover:text-slate-900 dark:hover:text-[#f1f5f9]'}`}>
                <Undo2 size={15} />
                <span className="text-[12px] font-bold">Log. Reversa</span>
              </Link>
              <Link to="/tarefas" className={`flex items-center gap-[10px] px-3 py-2 rounded-lg transition-all ${isActive("/tarefas") ? 'bg-[#f97316] text-white shadow-sm' : 'text-slate-500 dark:text-[#94a3b8] hover:bg-slate-100 dark:hover:bg-[#1a2540] hover:text-slate-900 dark:hover:text-[#f1f5f9]'}`}>
                <Users size={15} />
                <span className="text-[12px] font-bold">Comunicação</span>
              </Link>
              <Link to="/avisos" className={`flex items-center gap-[10px] px-3 py-2 rounded-lg transition-all ${isActive("/avisos") ? 'bg-[#f97316] text-white shadow-sm' : 'text-slate-500 dark:text-[#94a3b8] hover:bg-slate-100 dark:hover:bg-[#1a2540] hover:text-slate-900 dark:hover:text-[#f1f5f9]'}`}>
                <Bell size={15} />
                <span className="text-[12px] font-bold">Mural de Avisos</span>
              </Link>
            </>
          )}

          {podeVerFrota && (
            <>
              <div className="text-[9px] font-black text-slate-400 dark:text-[#4b5563] tracking-widest uppercase px-3 pt-4 pb-1.5">FROTA & PÁTIO</div>
              <Link to="/frota" className={`flex items-center gap-[10px] px-3 py-2 rounded-lg transition-all ${isActive("/frota") ? 'bg-[#f97316] text-white shadow-sm' : 'text-slate-500 dark:text-[#94a3b8] hover:bg-slate-100 dark:hover:bg-[#1a2540] hover:text-slate-900 dark:hover:text-[#f1f5f9]'}`}>
                <Car size={15} />
                <span className="text-[12px] font-bold">Gestão de Frota</span>
              </Link>
            </>
          )}

          {podeVerFinanceiro && (
            <>
              <div className="text-[9px] font-black text-slate-400 dark:text-[#4b5563] tracking-widest uppercase px-3 pt-4 pb-1.5">FINANCEIRO</div>
              <Link to="/pagamentos" className={`flex items-center gap-[10px] px-3 py-2 rounded-lg transition-all ${isActive("/pagamentos") ? 'bg-[#f97316] text-white shadow-sm' : 'text-slate-500 dark:text-[#94a3b8] hover:bg-slate-100 dark:hover:bg-[#1a2540] hover:text-slate-900 dark:hover:text-[#f1f5f9]'}`}>
                <Receipt size={15} />
                <span className="text-[12px] font-bold">Acerto Contas</span>
              </Link>
              {/* 🟢 NOVA ABA DE CUSTOS AQUI */}
              <Link to="/custos" className={`flex items-center gap-[10px] px-3 py-2 rounded-lg transition-all ${isActive("/custos") ? 'bg-[#f97316] text-white shadow-sm' : 'text-slate-500 dark:text-[#94a3b8] hover:bg-slate-100 dark:hover:bg-[#1a2540] hover:text-slate-900 dark:hover:text-[#f1f5f9]'}`}>
                <TrendingDown size={15} />
                <span className="text-[12px] font-bold">Gestão de Custos</span>
              </Link>
            </>
          )}

          {podeVerSupervisao && (
            <>
              <div className="text-[9px] font-black text-slate-400 dark:text-[#4b5563] tracking-widest uppercase px-3 pt-4 pb-1.5">AUDITORIA & RH</div>
              <Link to="/supervisao" className={`flex items-center gap-[10px] px-3 py-2 rounded-lg transition-all ${isActive("/supervisao") ? 'bg-[#f97316] text-white shadow-sm' : 'text-slate-500 dark:text-[#94a3b8] hover:bg-slate-100 dark:hover:bg-[#1a2540] hover:text-slate-900 dark:hover:text-[#f1f5f9]'}`}>
                <ShieldCheck size={15} />
                <span className="text-[12px] font-bold">Monitoramento</span>
              </Link>
              <Link to="/advertencias" className={`flex items-center gap-[10px] px-3 py-2 rounded-lg transition-all ${isActive("/advertencias") ? 'bg-red-500 text-white shadow-sm' : 'text-slate-500 dark:text-[#94a3b8] hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400'}`}>
                <AlertTriangle size={15} className={isActive("/advertencias") ? "text-white" : "text-red-500 dark:text-red-400"} />
                <span className="text-[12px] font-bold">Advertências</span>
              </Link>
            </>
          )}

          <div className="text-[9px] font-black text-slate-400 dark:text-[#4b5563] tracking-widest uppercase px-3 pt-4 pb-1.5">SISTEMA</div>
          <Link to="/perfil" className={`flex items-center gap-[10px] px-3 py-2 rounded-lg transition-all ${isActive("/perfil") ? 'bg-[#f97316] text-white shadow-sm' : 'text-slate-500 dark:text-[#94a3b8] hover:bg-slate-100 dark:hover:bg-[#1a2540] hover:text-slate-900 dark:hover:text-[#f1f5f9]'}`}>
            <User size={15} />
            <span className="text-[12px] font-bold">Meu Perfil</span>
          </Link>
        </nav>

        <div className="p-3 border-t border-slate-200 dark:border-[#1a2540] flex items-center gap-2 cursor-pointer hover:bg-slate-50 dark:hover:bg-[#1a2540] transition-colors shrink-0" onClick={logout}>
          <div className="w-8 h-8 rounded-[8px] bg-[#f97316] flex items-center justify-center text-[12px] font-bold text-white shrink-0 shadow-sm">
            {iniciais}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[12px] font-bold text-slate-800 dark:text-[#f1f5f9] leading-tight truncate">{nomeReal.split(" ")[0]}</div>
            <div className="text-[9px] font-medium text-slate-500 dark:text-[#6b7280] leading-tight mt-0.5 truncate">{cargoSalvo}</div>
          </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden h-screen relative print:overflow-visible print:h-auto print:block print:w-full">
        <header className="flex justify-between items-center px-[22px] py-[13px] border-b border-slate-200 dark:border-[#1a2540] bg-white dark:bg-[#070d1a] shrink-0 h-[62px] transition-colors duration-300 print:hidden">
          <div>
            <div className="text-[16px] font-black text-slate-800 dark:text-[#f1f5f9] leading-tight uppercase tracking-tight">
              {titulo ? titulo : `Bem-vindo, ${nomeReal.split(" ")[0]} 👋`}
            </div>
          </div>
          <div className="flex items-center gap-2.5">
            <div 
              onClick={() => setTemaEscuro(!temaEscuro)} 
              className="w-[34px] h-[34px] bg-slate-50 dark:bg-[#1a2540] border border-slate-200 dark:border-[#253555] rounded-[8px] flex items-center justify-center cursor-pointer hover:bg-slate-100 dark:hover:bg-[#253555] transition-colors shadow-sm"
            >
              {temaEscuro ? <Sun size={15} className="text-[#f97316]" /> : <Moon size={15} className="text-slate-500" />}
            </div>
          </div>
        </header>

        <div className="w-full h-[calc(100vh-62px)] bg-slate-100 dark:bg-[#0c1428] px-[22px] py-[16px] overflow-hidden flex flex-col gap-[14px] transition-colors duration-300 print:h-auto print:overflow-visible print:p-0 print:block print:bg-white print:text-black">
          {children}
        </div>
      </main>
    </div>
  );
}