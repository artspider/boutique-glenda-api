import { getAuthorizationHeader, handleUnauthorized } from './authService';

const API_BASE_URL = 'http://127.0.0.1:8000';

export type SaleItemPayload = {
  product_id: number;
  quantity: number;
  unit_price: number;
};

export type CreateSalePayload = {
  customer_id: number;
  user_id: number;
  payment_type: string;
  items: SaleItemPayload[];
  is_credit: boolean;
  down_payment: number;
  number_of_payments: number;
  payment_frequency: string;
};

function buildHeaders(): HeadersInit {
  const authorization = getAuthorizationHeader();

  return {
    'Content-Type': 'application/json',
    ...(authorization ? { Authorization: authorization } : {}),
  };
}

export async function createSale(
  payload: CreateSalePayload
): Promise<unknown> {
  const authorization = getAuthorizationHeader();

  if (!authorization) {
    throw new Error('No hay sesión activa o no existe token de autenticación');
  }

  const response = await fetch(`${API_BASE_URL}/sales/`, {
    method: 'POST',
    headers: buildHeaders(),
    body: JSON.stringify(payload),
  });

  handleUnauthorized(response);

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`No se pudo registrar la venta: ${errorText}`);
  }

  return response.json();
}

export type Sale = {
  id: number;
  customer_id: number | null;
  user_id: number;
  total_amount: number;
  status: string;
  created_at: string;
  customer: {
    id: number;
    first_name: string;
    last_name: string | null;
  } | null;
  items: Array<{
    id: number;
    product_id: number;
    quantity: number;
    unit_price: number;
    subtotal: number;
    product: {
      id: number;
      name: string;
      sku: string;
    };
  }>;
};

export async function getSales(): Promise<Sale[]> {
  const response = await fetch(`${API_BASE_URL}/sales/`, {
    method: 'GET',
    headers: buildHeaders(),
  });

  handleUnauthorized(response);

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`No se pudieron obtener las ventas: ${errorText}`);
  }

  return response.json();
}