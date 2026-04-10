import React from 'react';
import type { Credit, PaymentSchedule } from '../../../services/creditService';
import type { Customer } from '../../../services/clientService';
import { formatCurrency } from '../../../utils/formatters';
import DashboardPanel from '../../dashboard/DashboardPanel';
import StatusBadge from './StatusBadge';

type PagosCreditSummaryProps = {
  selectedCredit?: Credit;
  selectedCustomer?: Customer;
  nextScheduledPayment?: PaymentSchedule;
  totalInstallments: number;
  estimatedBalance: number;
  upcomingQueue: PaymentSchedule[];
  credits: Credit[];
  customers: Customer[];
  formatDate: (value: string) => string;
  getPaymentStatusLabel: (dueDate: string) => string;
  getPaymentStatusVariant: (
    dueDate: string
  ) => 'success' | 'warning' | 'danger' | 'neutral';
};

const PagosCreditSummary: React.FC<PagosCreditSummaryProps> = ({
  selectedCredit,
  selectedCustomer,
  nextScheduledPayment,
  totalInstallments,
  estimatedBalance,
  upcomingQueue,
  credits,
  customers,
  formatDate,
  getPaymentStatusLabel,
  getPaymentStatusVariant,
}) => {
  return (
    <DashboardPanel title="Resumen del crédito">
      {!selectedCredit ? (
        <p style={{ margin: 0, color: '#8c8c8c' }}>
          Selecciona un cliente para visualizar su resumen.
        </p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
              gap: '0.55rem',
            }}
          >
            <div>
              <p style={{ margin: 0, fontSize: '0.78rem', color: '#8c8c8c' }}>
                Cliente
              </p>
              <p style={{ margin: '0.15rem 0 0 0', fontWeight: 600 }}>
                {selectedCustomer
                  ? `${selectedCustomer.first_name} ${selectedCustomer.last_name}`.trim()
                  : `Cliente ${selectedCredit.customer_id}`}
              </p>
            </div>

            <div>
              <p style={{ margin: 0, fontSize: '0.78rem', color: '#8c8c8c' }}>
                Estado
              </p>
              <p style={{ margin: '0.15rem 0 0 0', fontWeight: 600 }}>
                {selectedCredit.status}
              </p>
            </div>

            <div>
              <p style={{ margin: 0, fontSize: '0.78rem', color: '#8c8c8c' }}>
                Total del crédito
              </p>
              <p style={{ margin: '0.15rem 0 0 0', fontWeight: 600 }}>
                {formatCurrency(Number(selectedCredit.total_amount))}
              </p>
            </div>

            <div>
              <p style={{ margin: 0, fontSize: '0.78rem', color: '#8c8c8c' }}>
                Enganche
              </p>
              <p style={{ margin: '0.15rem 0 0 0', fontWeight: 600 }}>
                {formatCurrency(Number(selectedCredit.down_payment))}
              </p>
            </div>

            <div>
              <p style={{ margin: 0, fontSize: '0.78rem', color: '#8c8c8c' }}>
                Monto financiado
              </p>
              <p style={{ margin: '0.15rem 0 0 0', fontWeight: 600 }}>
                {formatCurrency(Number(selectedCredit.financed_amount))}
              </p>
            </div>

            <div>
              <p style={{ margin: 0, fontSize: '0.78rem', color: '#8c8c8c' }}>
                Saldo pendiente
              </p>
              <p style={{ margin: '0.15rem 0 0 0', fontWeight: 700, color: '#cf1322' }}>
                {formatCurrency(Number(selectedCredit.balance))}
              </p>
            </div>
          </div>

          <div
            style={{
              padding: '0.7rem 0.8rem',
              borderRadius: '10px',
              border: '1px solid #d9d9d9',
              background: '#fafafa',
            }}
          >
            <p style={{ margin: 0, fontSize: '0.78rem', color: '#8c8c8c' }}>
              Saldo estimado después del pago
            </p>
            <p
              style={{
                margin: '0.2rem 0 0 0',
                fontSize: '1.05rem',
                fontWeight: 700,
                color: '#389e0d',
              }}
            >
              {formatCurrency(estimatedBalance)}
            </p>
          </div>

          {nextScheduledPayment ? (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0.55rem',
                padding: '0.7rem 0.8rem',
                borderRadius: '10px',
                border: '1px solid #f0f0f0',
                background: '#fafafa',
              }}
            >
              <div>
                <StatusBadge
                  label={getPaymentStatusLabel(nextScheduledPayment.due_date)}
                  variant={getPaymentStatusVariant(nextScheduledPayment.due_date)}
                />
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
                  gap: '0.55rem',
                }}
              >
                <div>
                  <p style={{ margin: 0, fontSize: '0.78rem', color: '#8c8c8c' }}>
                    Próximo abono pactado
                  </p>
                  <p style={{ margin: '0.15rem 0 0 0', fontWeight: 600 }}>
                    {formatCurrency(Number(nextScheduledPayment.amount_due))}
                  </p>
                </div>

                <div>
                  <p style={{ margin: 0, fontSize: '0.78rem', color: '#8c8c8c' }}>
                    Fecha próxima de pago
                  </p>
                  <p style={{ margin: '0.15rem 0 0 0', fontWeight: 600 }}>
                    {formatDate(nextScheduledPayment.due_date)}
                  </p>
                </div>

                <div>
                  <p style={{ margin: 0, fontSize: '0.78rem', color: '#8c8c8c' }}>
                    Parcialidad
                  </p>
                  <p style={{ margin: '0.15rem 0 0 0', fontWeight: 600 }}>
                    {nextScheduledPayment.installment_number} de {totalInstallments}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <p style={{ margin: 0, color: '#8c8c8c' }}>
              No hay un próximo pago programado para este crédito.
            </p>
          )}

          <div
            style={{
              marginTop: '0.15rem',
              padding: '0.65rem 0.75rem',
              borderRadius: '10px',
              border: '1px solid #e6f4ff',
              background: '#f7fbff',
            }}
          >
            <p
              style={{
                margin: '0 0 0.45rem 0',
                fontWeight: 600,
                fontSize: '0.9rem',
                color: '#3b5b7a',
              }}
            >
              Referencia rápida de próximos vencimientos
            </p>

            {upcomingQueue.length === 0 ? (
              <p style={{ margin: 0, color: '#8c8c8c' }}>
                No hay pagos programados para mostrar.
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                {upcomingQueue.map((payment) => {
                  const relatedCredit = credits.find(
                    (credit) => credit.id === payment.credit_id
                  );

                  const customer = customers.find(
                    (item) => item.id === relatedCredit?.customer_id
                  );

                  return (
                    <div
                      key={`${payment.credit_id}-${payment.installment_number}`}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        gap: '0.7rem',
                        padding: '0.55rem 0.65rem',
                        border: '1px solid #d6e4ff',
                        borderRadius: '8px',
                        background: '#ffffff',
                      }}
                    >
                      <div>
                        <p style={{ margin: 0, fontWeight: 600, fontSize: '0.88rem' }}>
                          {customer
                            ? `${customer.first_name} ${customer.last_name}`.trim()
                            : relatedCredit
                              ? `Cliente ${relatedCredit.customer_id}`
                              : `Crédito #${payment.credit_id}`}
                        </p>
                        <p
                          style={{
                            margin: '0.18rem 0 0 0',
                            color: '#8c8c8c',
                            fontSize: '0.8rem',
                          }}
                        >
                          {formatDate(payment.due_date)}
                        </p>
                      </div>

                      <div style={{ textAlign: 'right' }}>
                        <p style={{ margin: 0, fontWeight: 600, fontSize: '0.88rem' }}>
                          {formatCurrency(Number(payment.amount_due))}
                        </p>
                        <div style={{ marginTop: '0.15rem' }}>
                          <StatusBadge
                            label={getPaymentStatusLabel(payment.due_date)}
                            variant={getPaymentStatusVariant(payment.due_date)}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </DashboardPanel>
  );
};

export default PagosCreditSummary;