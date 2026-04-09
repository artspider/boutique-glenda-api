import { getAuthorizationHeader, handleUnauthorized } from './authService';

const API_BASE_URL = 'http://127.0.0.1:8000';

export type PaymentCreatePayload = {
  credit_id: number;
  user_id: number;
  amount: number;
};

function buildHeaders(): HeadersInit {
  const authorization = getAuthorizationHeader();

  return {
    'Content-Type': 'application/json',
    ...(authorization ? { Authorization: authorization } : {}),
  };
}

export async function registerPayment(
  payload: PaymentCreatePayload
): Promise<unknown> {
  const authorization = getAuthorizationHeader();

  if (!authorization) {
    throw new Error('No hay sesión activa o no existe token de autenticación');
  }

  const response = await fetch(`${API_BASE_URL}/payments`, {
    method: 'POST',
    headers: buildHeaders(),
    body: JSON.stringify(payload),
  });

  handleUnauthorized(response);

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`No se pudo registrar el pago: ${errorText}`);
  }

  return response.json();
}

export type Payment = {
  id: number;
  credit_id: number;
  user_id: number;
  amount: number;
  payment_method: string;
  reference: string | null;
  paid_at: string;
};

export async function getPayments(creditId?: number): Promise<Payment[]> {
  const query = creditId ? `?credit_id=${creditId}` : '';

  const response = await fetch(`${API_BASE_URL}/payments${query}`, {
    method: 'GET',
    headers: buildHeaders(),
  });

  handleUnauthorized(response);

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`No se pudieron obtener los pagos: ${errorText}`);
  }

  return response.json();
}