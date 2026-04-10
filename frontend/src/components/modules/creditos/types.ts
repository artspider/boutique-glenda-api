/**
 * ============================================================
 * Tipos base del módulo de créditos
 * ============================================================
 * Este archivo concentra los contratos visuales temporales
 * del frontend para trabajar la UX del módulo sin depender
 * todavía del backend.
 */

/**
 * Estados visuales del crédito dentro del módulo.
 */
export type CreditStatus = 'active' | 'overdue' | 'paid';

/**
 * Entidad base temporal para renderizar un crédito.
 * Más adelante podrá alinearse al contrato real del backend.
 */
export interface CreditItem {
  id: number;
  customerName: string;
  totalAmount: number;
  downPayment: number;
  financedAmount: number;
  balance: number;
  nextPaymentDate: string;
  status: CreditStatus;
  installmentsPaid: number;
  installmentsTotal: number;
}