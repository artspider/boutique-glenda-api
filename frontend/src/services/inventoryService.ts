import { getAuthorizationHeader, handleUnauthorized } from './authService';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';
const NETWORK_ERROR_MESSAGE =
  'No se pudo conectar con el backend de inventario. Verifica que FastAPI esté activo en http://127.0.0.1:8000 o http://localhost:8000.';

export type InventoryStatus = 'healthy' | 'low_stock' | 'out_of_stock' | 'inactive';
export type InventoryMovementType = 'in' | 'out' | 'adjustment';

export type InventoryItem = {
  product_id: number;
  name: string;
  sku: string | null;
  category: string | null;
  stock: number;
  minimum_stock: number;
  is_active: boolean;
  last_movement_at: string | null;
  status: InventoryStatus;
};

export type InventoryMovement = {
  id: number;
  product_id: number;
  quantity: number;
  movement_type: InventoryMovementType;
  reference: string | null;
  notes: string | null;
  product_name: string | null;
  sku: string | null;
  user_name: string | null;
  created_at: string;
};

export type CreateInventoryMovementPayload = {
  product_id: number;
  movement_type: InventoryMovementType;
  quantity: number;
  reference?: string | null;
  notes?: string | null;
};

function getApiBaseCandidates(): string[] {
  const candidates = new Set<string>();
  candidates.add(API_BASE_URL);

  if (API_BASE_URL.includes('127.0.0.1')) {
    candidates.add(API_BASE_URL.replace('127.0.0.1', 'localhost'));
  }

  if (API_BASE_URL.includes('localhost')) {
    candidates.add(API_BASE_URL.replace('localhost', '127.0.0.1'));
  }

  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    if (host === 'localhost' || host === '127.0.0.1') {
      candidates.add(`http://${host}:8000`);
    }
  }

  return Array.from(candidates);
}

async function fetchInventoryWithFallback(
  endpoint: string,
  init: RequestInit
): Promise<Response> {
  const bases = getApiBaseCandidates();
  let lastNetworkError: unknown = null;

  for (const base of bases) {
    try {
      return await fetch(`${base}${endpoint}`, init);
    } catch (errorValue) {
      lastNetworkError = errorValue;
    }
  }

  if (lastNetworkError instanceof Error) {
    throw new Error(NETWORK_ERROR_MESSAGE);
  }

  throw new Error(NETWORK_ERROR_MESSAGE);
}

function buildHeaders(): HeadersInit {
  const authorization = getAuthorizationHeader();

  return {
    'Content-Type': 'application/json',
    ...(authorization ? { Authorization: authorization } : {}),
  };
}

async function parseError(response: Response): Promise<string> {
  try {
    const data = await response.json();
    if (typeof data?.detail === 'string' && data.detail.trim()) {
      return data.detail;
    }
    if (typeof data?.message === 'string' && data.message.trim()) {
      return data.message;
    }
  } catch {
    const text = await response.text();
    if (text.trim()) {
      return text;
    }
  }

  return 'No se pudo completar la operación.';
}

export async function getInventoryItems(includeInactive = true): Promise<InventoryItem[]> {
  const response = await fetchInventoryWithFallback(
    `/inventory/items?include_inactive=${includeInactive ? 'true' : 'false'}`,
    {
      method: 'GET',
      headers: buildHeaders(),
    }
  );

  handleUnauthorized(response);

  if (!response.ok) {
    throw new Error(await parseError(response));
  }

  return response.json();
}

export async function getInventoryMovements(limit = 50): Promise<InventoryMovement[]> {
  const response = await fetchInventoryWithFallback(`/inventory/movements?limit=${limit}`, {
    method: 'GET',
    headers: buildHeaders(),
  });

  handleUnauthorized(response);

  if (!response.ok) {
    throw new Error(await parseError(response));
  }

  return response.json();
}

export async function getProductInventoryMovements(
  productId: number,
  limit = 50
): Promise<InventoryMovement[]> {
  const response = await fetchInventoryWithFallback(
    `/inventory/products/${productId}/movements?limit=${limit}`,
    {
      method: 'GET',
      headers: buildHeaders(),
    }
  );

  handleUnauthorized(response);

  if (!response.ok) {
    throw new Error(await parseError(response));
  }

  return response.json();
}

export async function createInventoryMovement(
  payload: CreateInventoryMovementPayload
): Promise<InventoryMovement> {
  const authorization = getAuthorizationHeader();

  if (!authorization) {
    throw new Error('No hay sesión activa o no existe token de autenticación');
  }

  const response = await fetchInventoryWithFallback(`/inventory/movements`, {
    method: 'POST',
    headers: buildHeaders(),
    body: JSON.stringify(payload),
  });

  handleUnauthorized(response);

  if (!response.ok) {
    throw new Error(await parseError(response));
  }

  return response.json();
}
