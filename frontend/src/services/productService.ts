import { getAuthorizationHeader, handleUnauthorized } from './authService';

const API_BASE_URL = 'http://127.0.0.1:8000';

export type Product = {
  id: number;
  name: string;
  sku: string;
  description: string | null;
  cost_price: number;
  sale_price: number;
  stock: number;
  minimum_stock: number;
  category_id: number;
  is_active: boolean;
};

function buildHeaders(): HeadersInit {
  const authorization = getAuthorizationHeader();

  return {
    'Content-Type': 'application/json',
    ...(authorization ? { Authorization: authorization } : {}),
  };
}

export async function getProducts(): Promise<Product[]> {
  const response = await fetch(`${API_BASE_URL}/products/`, {
    method: 'GET',
    headers: buildHeaders(),
  });

  handleUnauthorized(response);

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`No se pudieron obtener los productos: ${errorText}`);
  }

  return response.json();
}

export type CreateProductPayload = {
  name: string;
  cost_price: number;
  sale_price: number;
  stock: number;
  category_id: number;
  sku: string;
  description?: string | null;
  minimum_stock: number;
};

export async function createProduct(
  payload: CreateProductPayload
): Promise<Product> {
  const authorization = getAuthorizationHeader();

  if (!authorization) {
    throw new Error('No hay sesión activa o no existe token de autenticación');
  }

  const response = await fetch(`${API_BASE_URL}/products/`, {
    method: 'POST',
    headers: buildHeaders(),
    body: JSON.stringify(payload),
  });

  handleUnauthorized(response);

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`No se pudo crear el producto: ${errorText}`);
  }

  return response.json();
}

export async function updateProduct(
  productId: number,
  payload: CreateProductPayload
): Promise<Product> {
  const authorization = getAuthorizationHeader();

  if (!authorization) {
    throw new Error('No hay sesión activa o no existe token de autenticación');
  }

  const response = await fetch(`${API_BASE_URL}/products/${productId}`, {
    method: 'PUT',
    headers: buildHeaders(),
    body: JSON.stringify(payload),
  });

  handleUnauthorized(response);

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`No se pudo actualizar el producto: ${errorText}`);
  }

  return response.json();
}

export async function deleteProduct(productId: number): Promise<void> {
  const authorization = getAuthorizationHeader();

  if (!authorization) {
    throw new Error('No hay sesión activa o no existe token de autenticación');
  }

  const response = await fetch(`${API_BASE_URL}/products/${productId}`, {
    method: 'DELETE',
    headers: buildHeaders(),
  });

  handleUnauthorized(response);

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`No se pudo eliminar el producto: ${errorText}`);
  }
}