import { getAuthorizationHeader, handleUnauthorized } from './authService';

const API_BASE_URL = 'http://127.0.0.1:8000';

/**
 * =========================================================
 * Tipos del módulo de clientes
 * =========================================================
 */

/**
 * Entidad Customer tal como se consume en frontend.
 */
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

/**
 * Payload base para crear clientes.
 * Se conserva flexible para no romper el flujo actual del formulario
 * ni futuras ampliaciones del módulo.
 */
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

/**
 * Payload para actualización de clientes.
 * Por ahora reutiliza la misma estructura base, ya que el backend
 * acepta también is_active dentro del schema de actualización.
 */
export type UpdateCustomerPayload = {
  first_name: string;
  last_name?: string | null;
  phone?: string | null;
  email?: string | null;
  address_line?: string | null;
  address_reference?: string | null;
  zone?: string | null;
  notes?: string | null;
  credit_limit?: number | null;
  is_active?: boolean;
};

/**
 * =========================================================
 * Helpers internos
 * =========================================================
 */

/**
 * Construye headers comunes con autenticación.
 */
function buildHeaders(): HeadersInit {
  const authorization = getAuthorizationHeader();

  return {
    'Content-Type': 'application/json',
    ...(authorization ? { Authorization: authorization } : {}),
  };
}

/**
 * Valida que exista sesión activa antes de operaciones protegidas.
 */
function ensureAuthorization(): void {
  const authorization = getAuthorizationHeader();

  if (!authorization) {
    throw new Error('No hay sesión activa o no existe token de autenticación');
  }
}

/**
 * =========================================================
 * API - Clientes
 * =========================================================
 */

/**
 * Obtiene la lista completa de clientes.
 */
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

/**
 * Crea un nuevo cliente.
 */
export async function createCustomer(
  payload: CreateCustomerPayload
): Promise<Customer> {
  ensureAuthorization();

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

/**
 * Actualiza un cliente existente.
 * Soporta también cambios de estado mediante is_active.
 */
export async function updateCustomer(
  customerId: number,
  payload: UpdateCustomerPayload
): Promise<Customer> {
  ensureAuthorization();

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

/**
 * Elimina un cliente.
 */
export async function deleteCustomer(customerId: number): Promise<void> {
  ensureAuthorization();

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