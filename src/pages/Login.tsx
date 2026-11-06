import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function Login() {
  const navigate = useNavigate(); 
  const { login } = useAuth(); 

  const [isRegistro, setIsRegistro] = useState(false);

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [nome, setNome] = useState("");
  const [dataNascimento, setDataNascimento] = useState("");
  const [cpf, setCpf] = useState("");
  const [telefone, setTelefone] = useState("");

  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [carregando, setCarregando] = useState(false);
  const [mensagemErro, setMensagemErro] = useState("");
  const [mensagemSucesso, setMensagemSucesso] = useState("");

  const API_URL = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : 'http://192.168.18.213:8081/api';

  const mascaraCpf = (valor: string) => {
    let v = valor.replace(/\D/g, "");
    if (v.length <= 11) {
      v = v.replace(/(\d{3})(\d)/, "$1.$2");
      v = v.replace(/(\d{3})(\d)/, "$1.$2");
      v = v.replace(/(\d{3})(\d{1,2})$/, "$1-$2");
      setCpf(v);
    }
  };

  const mascaraTelefone = (valor: string) => {
    let v = valor.replace(/\D/g, "");
    if (v.length <= 11) {
      v = v.replace(/^(\d{2})(\d)/g, "($1) $2");
      v = v.replace(/(\d{5})(\d)/, "$1-$2");
      setTelefone(v);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMensagemErro("");
    setMensagemSucesso("");
    setCarregando(true);

    try {
      if (!isRegistro) {
        const resposta = await fetch(`${API_URL}/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, senha }),
        });

        const textoResposta = await resposta.text();

        setTimeout(() => {
          setCarregando(false);
          if (resposta.ok) {
            // 🟢 Tenta ler o NOME REAL vindo do banco de dados (JSON)
            let nomeReal = email.split('@')[0].toUpperCase();
            let cargoReal = textoResposta;
            
            try {
               const dados = JSON.parse(textoResposta);
               if (dados.nome) nomeReal = dados.nome;
               if (dados.cargo) cargoReal = dados.cargo;
            } catch(e) {
               // Se o backend enviar só o texto puro, ele ignora o erro
            }

            login({ nome: nomeReal, cargo: cargoReal, email: email });
            navigate("/dashboard");
          } else {
            setMensagemErro(textoResposta);
          }
        }, 2000);
      } else {
        const resposta = await fetch(
          `${API_URL}/auth/registro`, 
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              nome: nome,
              email: email,
              senha: senha,
              cpf: cpf,
              telefone: telefone,
              dataNascimento: dataNascimento,
            }),
          },
        );

        const textoResposta = await resposta.text();

        setTimeout(() => {
          setCarregando(false);
          if (resposta.ok) {
            setMensagemSucesso("Conta criada com sucesso! Faça login para continuar.");
            setIsRegistro(false);
            setSenha(""); setCpf(""); setTelefone(""); setDataNascimento(""); setNome("");
          } else {
            setMensagemErro(textoResposta);
          }
        }, 2000);
      }
    } catch (error) {
      setCarregando(false);
      setMensagemErro("Erro de conexão com o servidor. Verifique o backend.");
    }
  };

  return (
    <>
      <style>
        {`
          input:-webkit-autofill, input:-webkit-autofill:hover, input:-webkit-autofill:focus, input:-webkit-autofill:active {
              -webkit-box-shadow: 0 0 0 30px #111827 inset !important;
              -webkit-text-fill-color: white !important;
              transition: background-color 5000s ease-in-out 0s;
          }
          .scrollbar-hide::-webkit-scrollbar { display: none; }
          .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
        `}
      </style>

      <div className="min-h-screen flex bg-[#0b1121] font-sans relative">
        
        {carregando && (
          <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-[#070d19]/95 backdrop-blur-md transition-all duration-500">
            <div className="relative flex items-center justify-center mb-8">
              <div className="absolute w-24 h-24 bg-[#FF7A00]/20 rounded-full blur-xl animate-pulse"></div>
              <div className="absolute w-40 h-40 border-2 border-slate-800/80 rounded-full border-t-[#FF7A00] animate-spin"></div>
              <div className="absolute w-32 h-32 border border-slate-800/60 rounded-full border-b-[#FF7A00]/80 animate-[spin_1.5s_linear_infinite_reverse]"></div>
              <img src="/logo-nordex.png" alt="Nordex Logo" className="h-10 relative z-10 animate-pulse drop-shadow-[0_0_15px_rgba(255,122,0,0.6)]" />
            </div>
            <div className="text-center">
              <p className="text-[#FF7A00] font-black text-sm tracking-[0.2em] uppercase animate-pulse drop-shadow-md">
                {isRegistro ? "Criando Conta Nordex..." : "Acessando Sistema..."}
              </p>
              <p className="text-slate-500 text-[10px] mt-2 tracking-[0.3em] uppercase">Estabelecendo conexão segura</p>
            </div>
          </div>
        )}

        <div className="hidden lg:flex w-3/5 relative items-center justify-center overflow-hidden bg-[#0b1121] shadow-[inset_-20px_0_40px_rgba(0,0,0,0.6)]">
          <div className="absolute inset-0 bg-cover bg-center opacity-30" style={{ backgroundImage: "url('/4239318_90419.svg')" }}></div>
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-[#FF7A00]/5 to-transparent"></div>

          <div className="relative z-10 flex flex-col items-start max-w-xl px-10">
            <img src="/logo-nordex.png" alt="Nordex Logo" className="h-28 mb-10 drop-shadow-2xl" />
            <h1 className="text-6xl font-extrabold text-white mb-6 leading-tight">
              Gestão inteligente para sua <span className="text-[#FF7A00]">distribuidora.</span>
            </h1>
            <p className="text-xl text-gray-400">
              Controle de ponta a ponta. Do setor financeiro ao painel de administração, tudo em uma única plataforma de alta performance.
            </p>
          </div>
        </div>

        <div className="w-full lg:w-2/5 flex items-center justify-center p-8 sm:p-12 relative h-screen overflow-y-auto scrollbar-hide">
          <div className="w-full max-w-sm space-y-6 my-auto">
            <div>
              <img src="/logo-nordex.png" alt="Nordex Logo" className="h-10 mb-8 lg:hidden" />
              <h2 className="text-3xl font-bold text-white">{isRegistro ? "Criar nova conta" : "Bem-vindo de volta"}</h2>
              <p className="text-sm text-gray-400 mt-2">{isRegistro ? "Preencha seus dados para solicitar acesso." : "Insira suas credenciais para acessar o painel."}</p>
            </div>

            {mensagemErro && <div className="p-3 bg-red-500/10 border-l-4 border-red-500 text-red-400 rounded text-sm">{mensagemErro}</div>}
            {mensagemSucesso && <div className="p-3 bg-green-500/10 border-l-4 border-green-500 text-green-400 rounded text-sm">{mensagemSucesso}</div>}

            <form onSubmit={handleSubmit} className="space-y-4">
              {isRegistro && (
                <>
                  <div>
                    <label className="text-xs font-medium text-gray-400">Nome Completo</label>
                    <input type="text" required className="w-full px-4 py-3 mt-1 rounded-lg bg-[#111827] border border-gray-700 text-white focus:outline-none focus:border-[#FF7A00] focus:ring-1 focus:ring-[#FF7A00]" value={nome} onChange={(e) => setNome(e.target.value)} />
                  </div>

                  <div className="flex gap-4">
                    <div className="w-1/2">
                      <label className="text-xs font-medium text-gray-400">Data de Nasc.</label>
                      <input type="date" required className="w-full px-4 py-3 mt-1 rounded-lg bg-[#111827] border border-gray-700 text-white focus:outline-none focus:border-[#FF7A00] focus:ring-1 focus:ring-[#FF7A00]" value={dataNascimento} onChange={(e) => setDataNascimento(e.target.value)} />
                    </div>
                    <div className="w-1/2">
                      <label className="text-xs font-medium text-gray-400">Telefone</label>
                      <input type="text" placeholder="(00) 00000-0000" required className="w-full px-4 py-3 mt-1 rounded-lg bg-[#111827] border border-gray-700 text-white focus:outline-none focus:border-[#FF7A00] focus:ring-1 focus:ring-[#FF7A00]" value={telefone} onChange={(e) => mascaraTelefone(e.target.value)} />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-gray-400">CPF</label>
                    <input type="text" placeholder="000.000.000-00" required className="w-full px-4 py-3 mt-1 rounded-lg bg-[#111827] border border-gray-700 text-white focus:outline-none focus:border-[#FF7A00] focus:ring-1 focus:ring-[#FF7A00]" value={cpf} onChange={(e) => mascaraCpf(e.target.value)} />
                  </div>
                </>
              )}

              <div>
                <label className="text-xs font-medium text-gray-400">E-mail corporativo</label>
                <input type="email" required className="w-full px-4 py-3 mt-1 rounded-lg bg-[#111827] border border-gray-700 text-white focus:outline-none focus:border-[#FF7A00] focus:ring-1 focus:ring-[#FF7A00]" placeholder="nome@nordex.com" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-gray-400">Senha</label>
                  {!isRegistro && <a href="#" className="text-xs text-[#FF7A00] hover:text-white transition-colors">Esqueceu a senha?</a>}
                </div>

                <div className="relative mt-1">
                  <input type={mostrarSenha ? "text" : "password"} required className="w-full pl-4 pr-12 py-3 rounded-lg bg-[#111827] border border-gray-700 text-white focus:outline-none focus:border-[#FF7A00] focus:ring-1 focus:ring-[#FF7A00]" placeholder="••••••••" value={senha} onChange={(e) => setSenha(e.target.value)} />
                  <button type="button" className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-[#FF7A00]" onClick={() => setMostrarSenha(!mostrarSenha)}>
                    {mostrarSenha ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                    )}
                  </button>
                </div>
              </div>

              <button type="submit" className="w-full py-3.5 mt-6 bg-[#FF7A00] hover:bg-[#e66a00] text-white font-bold rounded-lg transition-all duration-300 shadow-[0_4px_14px_rgba(255,122,0,0.3)]">
                {isRegistro ? "CADASTRAR" : "ACESSAR SISTEMA"}
              </button>
            </form>

            <div className="text-center mt-6">
              <p className="text-sm text-gray-400">
                {isRegistro ? "Já possui uma conta?" : "Ainda não tem acesso?"}
                <button onClick={() => { setIsRegistro(!isRegistro); setMensagemErro(""); setMensagemSucesso(""); }} className="ml-2 text-[#FF7A00] hover:text-white font-semibold transition-colors">
                  {isRegistro ? "Faça login" : "Solicitar cadastro"}
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}