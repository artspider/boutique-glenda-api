import { getAuthorizationHeader, handleUnauthorized } from './authService';

//const API_BASE_URL = 'http://127.0.0.1:8000';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';

export type Credit = {
  id: number;
  sale_id: number;
  customer_id: number;
  total_amount: number;
  down_payment: number;
  financed_amount: number;
  balance: number;
  status: string;
  created_at: string;
};

function buildHeaders(): HeadersInit {
  const authorization = getAuthorizationHeader();

  return {
    'Content-Type': 'application/json',
    ...(authorization ? { Authorization: authorization } : {}),
  };
}

export async function getActiveCredits(): Promise<Credit[]> {
  const response = await fetch(`${API_BASE_URL}/credits/active`, {
    method: 'GET',
    headers: buildHeaders(),
  });

  handleUnauthorized(response);

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`No se pudieron obtener los créditos activos: ${errorText}`);
  }

  return response.json();
}

export type PaymentSchedule = {
  id: number;
  credit_id: number;
  installment_number: number;
  due_date: string;
  amount_due: number;
  status: string;
};

export async function getUpcomingPayments(): Promise<PaymentSchedule[]> {
  const response = await fetch(`${API_BASE_URL}/credits/upcoming-payments`, {
    method: 'GET',
    headers: buildHeaders(),
  });

  handleUnauthorized(response);

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`No se pudieron obtener los próximos pagos: ${errorText}`);
  }

  return response.json();
}