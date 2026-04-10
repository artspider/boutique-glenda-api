import { getAuthorizationHeader, handleUnauthorized } from './authService';

const API_BASE_URL = 'http://127.0.0.1:8000';

/**
 * Representa una categoría de producto devuelta por el backend.
 */
export type ProductCategory = {
  id: number;
  name: string;
  description: string | null;
};

/**
 * Payload para crear una categoría.
 */
export type CreateProductCategoryPayload = {
  name: string;
  description?: string | null;
};

/**
 * Payload para actualizar una categoría.
 * Todos los campos son opcionales para permitir actualización parcial.
 */
export type UpdateProductCategoryPayload = {
  name?: string;
  description?: string | null;
};

/**
 * Construye headers comunes para requests autenticadas.
 */
function buildHeaders(): HeadersInit {
  const authorization = getAuthorizationHeader();

  return {
    'Content-Type': 'application/json',
    ...(authorization ? { Authorization: authorization } : {}),
  };
}

/**
 * Obtiene todas las categorías registradas.
 */
export async function getProductCategories(): Promise<ProductCategory[]> {
  const response = await fetch(`${API_BASE_URL}/product-categories`, {
    method: 'GET',
    headers: buildHeaders(),
  });

  handleUnauthorized(response);

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`No se pudieron obtener las categorías: ${errorText}`);
  }

  return response.json();
}

/**
 * Obtiene una categoría por su id.
 */
export async function getProductCategoryById(
  categoryId: number
): Promise<ProductCategory> {
  const response = await fetch(`${API_BASE_URL}/product-categories/${categoryId}`, {
    method: 'GET',
    headers: buildHeaders(),
  });

  handleUnauthorized(response);

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`No se pudo obtener la categoría: ${errorText}`);
  }

  return response.json();
}

/**
 * Crea una nueva categoría.
 */
export async function createProductCategory(
  payload: CreateProductCategoryPayload
): Promise<ProductCategory> {
  const authorization = getAuthorizationHeader();

  if (!authorization) {
    throw new Error('No hay sesión activa o no existe token de autenticación');
  }

  const response = await fetch(`${API_BASE_URL}/product-categories`, {
    method: 'POST',
    headers: buildHeaders(),
    body: JSON.stringify(payload),
  });

  handleUnauthorized(response);

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`No se pudo crear la categoría: ${errorText}`);
  }

  return response.json();
}

/**
 * Actualiza una categoría existente.
 */
export async function updateProductCategory(
  categoryId: number,
  payload: UpdateProductCategoryPayload
): Promise<ProductCategory> {
  const authorization = getAuthorizationHeader();

  if (!authorization) {
    throw new Error('No hay sesión activa o no existe token de autenticación');
  }

  const response = await fetch(`${API_BASE_URL}/product-categories/${categoryId}`, {
    method: 'PUT',
    headers: buildHeaders(),
    body: JSON.stringify(payload),
  });

  handleUnauthorized(response);

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`No se pudo actualizar la categoría: ${errorText}`);
  }

  return response.json();
}

/**
 * Elimina una categoría existente.
 */
export async function deleteProductCategory(categoryId: number): Promise<void> {
  const authorization = getAuthorizationHeader();

  if (!authorization) {
    throw new Error('No hay sesión activa o no existe token de autenticación');
  }

  const response = await fetch(`${API_BASE_URL}/product-categories/${categoryId}`, {
    method: 'DELETE',
    headers: buildHeaders(),
  });

  handleUnauthorized(response);

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`No se pudo eliminar la categoría: ${errorText}`);
  }
}