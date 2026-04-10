import type { CreditItem } from './types';

/**
 * ============================================================
 * Datos mock temporales del módulo de créditos
 * ============================================================
 * Estos datos permiten construir y validar la UX antes de
 * conectar la pantalla al backend real.
 */

export const MOCK_CREDITS: CreditItem[] = [
  {
    id: 101,
    customerName: 'María López',
    totalAmount: 1850,
    downPayment: 350,
    financedAmount: 1500,
    balance: 900,
    nextPaymentDate: '2026-04-15',
    status: 'active',
    installmentsPaid: 4,
    installmentsTotal: 8,
  },
  {
    id: 102,
    customerName: 'José Ramírez',
    totalAmount: 2400,
    downPayment: 400,
    financedAmount: 2000,
    balance: 1200,
    nextPaymentDate: '2026-04-10',
    status: 'overdue',
    installmentsPaid: 3,
    installmentsTotal: 10,
  },
  {
    id: 103,
    customerName: 'Ana Torres',
    totalAmount: 1300,
    downPayment: 300,
    financedAmount: 1000,
    balance: 0,
    nextPaymentDate: 'Sin pagos pendientes',
    status: 'paid',
    installmentsPaid: 6,
    installmentsTotal: 6,
  },
  {
    id: 104,
    customerName: 'Carlos Mendoza',
    totalAmount: 3200,
    downPayment: 700,
    financedAmount: 2500,
    balance: 1750,
    nextPaymentDate: '2026-04-18',
    status: 'active',
    installmentsPaid: 2,
    installmentsTotal: 10,
  },
];