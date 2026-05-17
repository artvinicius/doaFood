import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../config';

const SESSION_KEY = '@doafood:session';

async function getToken() {
  const raw = await AsyncStorage.getItem(SESSION_KEY);
  return raw ? JSON.parse(raw).token : null;
}

async function request(method, path, body) {
  const token = await getToken();
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.erro || 'Erro na requisição.');
  return data;
}

export const login         = (email, senha) => request('POST', '/auth/login', { email, senha });
export const cadastro      = (data)         => request('POST', '/auth/cadastro', data);

export const listarUsuarios  = ()       => request('GET',    '/api/usuarios');
export const criarUsuario    = (data)   => request('POST',   '/api/usuarios', data);
export const atualizarUsuario= (id, d)  => request('PUT',    `/api/usuarios/${id}`, d);
export const excluirUsuario  = (id)     => request('DELETE', `/api/usuarios/${id}`);

export const getDoadores   = (busca, cidade) => request('GET', `/api/doadores?busca=${busca || ''}&cidade=${cidade || ''}`);
export const getReceptores = (busca, cidade) => request('GET', `/api/receptores?busca=${busca || ''}&cidade=${cidade || ''}`);
export const getOngs       = (busca)         => request('GET', `/api/ongs?busca=${busca || ''}`);
export const getPontosColeta      = ()       => request('GET',    '/api/pontos-coleta');
export const criarPontoColeta     = (data)   => request('POST',   '/api/pontos-coleta', data);
export const atualizarPontoColeta = (id, d)  => request('PUT',    `/api/pontos-coleta/${id}`, d);
export const excluirPontoColeta   = (id)     => request('DELETE', `/api/pontos-coleta/${id}`);
