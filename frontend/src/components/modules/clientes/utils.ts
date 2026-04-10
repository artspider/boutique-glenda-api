import type { Customer, CustomerFormData, CustomerFormErrors } from './types';

/**
 * Valores iniciales del formulario.
 * Se centralizan para evitar duplicación en el contenedor y componentes.
 */
export const INITIAL_FORM_DATA: CustomerFormData = {
  first_name: '',
  last_name: '',
  phone: '',
  email: '',
  zone: '',
  address_line: '',
  address_reference: '',
  credit_limit: '0',
  notes: '',
};

/**
 * Valores iniciales de errores visuales del formulario.
 */
export const INITIAL_FORM_ERRORS: CustomerFormErrors = {
  first_name: '',
  last_name: '',
  phone: '',
  email: '',
  credit_limit: '',
};

/**
 * Devuelve el nombre completo del cliente.
 * Maneja valores nulos o vacíos con un fallback legible.
 */
export function getCustomerFullName(customer: Customer): string {
  return `${customer.first_name ?? ''} ${customer.last_name ?? ''}`.trim() || 'Sin nombre';
}

/**
 * Formatea el límite de crédito en moneda MXN.
 */
export function formatCreditLimit(value: number | null | undefined): string {
  if (value === null || value === undefined) return '-';

  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    maximumFractionDigits: 2,
  }).format(value);
}

/**
 * Limpia un string para permitir solo números.
 * Se utiliza principalmente en el teléfono.
 */
export function sanitizePhone(value: string): string {
  return value.replace(/\D/g, '');
}

/**
 * Normaliza el valor del límite de crédito para entrada de texto numérica.
 * Permite dígitos y un punto decimal.
 */
export function sanitizeCreditLimit(value: string): string {
  const sanitized = value.replace(/[^0-9.]/g, '');

  const parts = sanitized.split('.');

  if (parts.length <= 2) {
    return sanitized;
  }

  return `${parts[0]}.${parts.slice(1).join('')}`;
}