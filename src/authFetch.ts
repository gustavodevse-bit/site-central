const API_ORIGIN = (import.meta.env.VITE_API_URL || 'http://192.168.18.213:8081').replace(/\/+$/, '');
const API_BASE = `${API_ORIGIN}/api`;
const CHAVE_TOKEN = 'nordex_token';
const CHAVE_USUARIO = '@NordexAdminAuth';
const fetchOriginal = window.fetch.bind(window);

function urlDe(entrada: RequestInfo | URL): string {
  if (typeof entrada === 'string') return entrada;
  if (entrada instanceof URL) return entrada.href;
  return entrada.url;
}

function encerrarSessao() {
  localStorage.removeItem(CHAVE_TOKEN);
  localStorage.removeItem(CHAVE_USUARIO);
  window.location.hash = '#/';
  window.location.reload();
}

window.fetch = async (entrada: RequestInfo | URL, init?: RequestInit) => {
  const url = urlDe(entrada);
  if (!url.startsWith(API_BASE)) return fetchOriginal(entrada, init);

  const rotaDeAuth = url.startsWith(`${API_BASE}/auth/`);
  const token = localStorage.getItem(CHAVE_TOKEN);
  const headers = new Headers(init?.headers);
  if (token && !rotaDeAuth && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const resposta = await fetchOriginal(entrada, { ...init, headers });

  // Depois de validar o login, pede a sessão (token) com as mesmas credenciais.
  if (url === `${API_BASE}/auth/login` && resposta.ok && typeof init?.body === 'string') {
    const sessao = await fetchOriginal(`${API_BASE}/auth/session-token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: init.body,
    });
    const dados = (await sessao.json().catch(() => ({}))) as { token?: string };
    if (sessao.ok && dados.token) {
      localStorage.setItem(CHAVE_TOKEN, dados.token);
    } else {
      localStorage.removeItem(CHAVE_TOKEN);
      return new Response('Não foi possível criar sua sessão segura.', { status: 503 });
    }
  }

  // Sessão vencida ou ausente: volta para o login (só se havia sessão, para não entrar em loop).
  if (resposta.status === 401 && !rotaDeAuth && (token || localStorage.getItem(CHAVE_USUARIO))) {
    encerrarSessao();
  }
  return resposta;
};
