import { getAuthorizationHeader, handleUnauthorized } from './authService';

const API_BASE_URL = 'http://127.0.0.1:8000';

export type Customer = {
  id: number;
  first_name: string;
  last_name: string;
  phone: string | null;
  email: string | null;
  address_line: string | null;
  address_reference: string | null;
  zone: string | null;
  notes: string | null;
  credit_limit: number | null;
  is_active: boolean;
};

export type CreateCustomerPayload = {
  first_name: string;
  last_name: string;
  phone?: string | null;
  email?: string | null;
  address_line?: string | null;
  address_reference?: string | null;
  zone?: string | null;
  notes?: string | null;
  credit_limit?: number | null;
  is_active?: boolean;
};

function buildHeaders(): HeadersInit {
  const authorization = getAuthorizationHeader();

  return {
    'Content-Type': 'application/json',
    ...(authorization ? { Authorization: authorization } : {}),
  };
}

export async function getCustomers(): Promise<Customer[]> {
  const response = await fetch(`${API_BASE_URL}/customers/`, {
    method: 'GET',
    headers: buildHeaders(),
  });

  handleUnauthorized(response);

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`No se pudieron obtener los clientes: ${errorText}`);
  }

  return response.json();
}

export async function createCustomer(
  payload: CreateCustomerPayload
): Promise<Customer> {
  const authorization = getAuthorizationHeader();

  if (!authorization) {
    throw new Error('No hay sesión activa o no existe token de autenticación');
  }

  const response = await fetch(`${API_BASE_URL}/customers/`, {
    method: 'POST',
    headers: buildHeaders(),
    body: JSON.stringify(payload),
  });

  handleUnauthorized(response);

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`No se pudo crear el cliente: ${errorText}`);
  }

  return response.json();
}

export async function updateCustomer(
  customerId: number,
  payload: CreateCustomerPayload
): Promise<Customer> {
  const authorization = getAuthorizationHeader();

  if (!authorization) {
    throw new Error('No hay sesión activa o no existe token de autenticación');
  }

  const response = await fetch(`${API_BASE_URL}/customers/${customerId}`, {
    method: 'PUT',
    headers: buildHeaders(),
    body: JSON.stringify(payload),
  });

  handleUnauthorized(response);

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`No se pudo actualizar el cliente: ${errorText}`);
  }

  return response.json();
}

export async function deleteCustomer(customerId: number): Promise<void> {
  const authorization = getAuthorizationHeader();

  if (!authorization) {
    throw new Error('No hay sesión activa o no existe token de autenticación');
  }

  const response = await fetch(`${API_BASE_URL}/customers/${customerId}`, {
    method: 'DELETE',
    headers: buildHeaders(),
  });

  handleUnauthorized(response);

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`No se pudo eliminar el cliente: ${errorText}`);
  }
}