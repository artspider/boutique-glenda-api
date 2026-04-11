//const API_BASE_URL = 'http://127.0.0.1:8000';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';

export type LoginPayload = {
  username?: string;
  email?: string;
  password: string;
};

export type LoginResponse = {
  access_token: string;
  token_type: string;
};

const ACCESS_TOKEN_KEY = 'access_token';
const TOKEN_TYPE_KEY = 'token_type';

export async function login(payload: LoginPayload): Promise<LoginResponse> {
  const body = new URLSearchParams();
  body.append('username', payload.username ?? payload.email ?? '');
  body.append('password', payload.password);

  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: body.toString(),
  });

  if (!response.ok) {
    throw new Error('No se pudo iniciar sesión');
  }

  const data: LoginResponse = await response.json();

  localStorage.setItem(ACCESS_TOKEN_KEY, data.access_token);
  localStorage.setItem(TOKEN_TYPE_KEY, data.token_type);

  return data;
}

export function getAccessToken(): string | null {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function getTokenType(): string {
  return localStorage.getItem(TOKEN_TYPE_KEY) || 'bearer';
}

export function getAuthorizationHeader(): string | null {
  const token = getAccessToken();

  if (!token) {
    return null;
  }

  return `Bearer ${token}`;
}

export function logout(): void {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(TOKEN_TYPE_KEY);
}

export async function loginUser(payload: LoginPayload): Promise<LoginResponse> {
  return login(payload);
}

export function handleUnauthorized(response: Response): void {
  if (response.status === 401) {
    logout();
    window.location.href = '/login';
  }
}