import React from 'react';
import type { Payment } from '../../../services/paymentService';
import { formatCurrency } from '../../../utils/formatters';
import DashboardPanel from '../../dashboard/DashboardPanel';

type PagosHistoryTableProps = {
  selectedCreditId?: number;
  payments: Payment[];
  formatDate: (value: string) => string;
};

const PagosHistoryTable: React.FC<PagosHistoryTableProps> = ({
  selectedCreditId,
  payments,
  formatDate,
}) => {
  return (
    <DashboardPanel title="Historial de pagos">
      {!selectedCreditId ? (
        <p style={{ margin: 0, color: '#8c8c8c' }}>
          Selecciona un cliente para consultar sus pagos.
        </p>
      ) : payments.length === 0 ? (
        <p style={{ margin: 0, color: '#8c8c8c' }}>
          No hay pagos registrados para este crédito.
        </p>
      ) : (
        <div
          style={{
            overflowX: 'auto',
            overflowY: 'auto',
            maxHeight: '280px',
            border: '1px solid #f0f0f0',
            borderRadius: '10px',
          }}
        >
          <table
            style={{
              width: '100%',
              minWidth: '560px',
              borderCollapse: 'collapse',
              fontSize: '0.92rem',
            }}
          >
            <thead>
              <tr
                style={{
                  textAlign: 'left',
                  borderBottom: '1px solid #f0f0f0',
                  background: '#fafafa',
                  position: 'sticky',
                  top: 0,
                  zIndex: 1,
                }}
              >
                <th style={{ padding: '0.6rem 0.5rem' }}>ID</th>
                <th style={{ padding: '0.6rem 0.5rem' }}>Monto</th>
                <th style={{ padding: '0.6rem 0.5rem' }}>Método</th>
                <th style={{ padding: '0.6rem 0.5rem' }}>Referencia</th>
                <th style={{ padding: '0.6rem 0.5rem' }}>Fecha</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((payment) => (
                <tr
                  key={payment.id}
                  style={{ borderBottom: '1px solid #f5f5f5' }}
                >
                  <td style={{ padding: '0.6rem 0.5rem' }}>{payment.id}</td>
                  <td style={{ padding: '0.6rem 0.5rem' }}>
                    {formatCurrency(Number(payment.amount))}
                  </td>
                  <td style={{ padding: '0.6rem 0.5rem' }}>
                    {payment.payment_method}
                  </td>
                  <td style={{ padding: '0.6rem 0.5rem' }}>
                    {payment.reference ?? '-'}
                  </td>
                  <td style={{ padding: '0.6rem 0.5rem' }}>
                    {formatDate(payment.paid_at)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </DashboardPanel>
  );
};

export default PagosHistoryTable;