import React from 'react';
import DashboardPanel from '../../../dashboard/DashboardPanel';
import type { PaymentSchedule } from '../../../../services/creditService';
import type { Payment } from '../../../../services/paymentService';
import type { CreditItem } from '../types';

interface CreditoSchedulePanelProps {
  selectedCredit: CreditItem | null;
  payments: Payment[];
  schedules: PaymentSchedule[];
}

const cardStyle: React.CSSProperties = {
  border: '1px solid #f0f0f0',
  borderRadius: '12px',
  padding: '0.85rem',
  background: '#ffffff',
};

const titleStyle: React.CSSProperties = {
  margin: 0,
  fontSize: '0.88rem',
  fontWeight: 600,
  color: '#262626',
};

const textStyle: React.CSSProperties = {
  margin: '0.3rem 0 0 0',
  fontSize: '0.8rem',
  color: '#8c8c8c',
  lineHeight: 1.5,
};

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    minimumFractionDigits: 2,
  }).format(value);
};

const formatDate = (value: string) => {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat('es-MX', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
};

const getPaymentStatusLabel = (dueDate: string) => {
  if (!dueDate || dueDate === 'Sin fecha') {
    return 'Sin fecha';
  }

  const today = new Date();
  const paymentDate = new Date(dueDate);

  if (Number.isNaN(paymentDate.getTime())) {
    return 'Sin fecha';
  }

  today.setHours(0, 0, 0, 0);
  paymentDate.setHours(0, 0, 0, 0);

  const diffInMs = paymentDate.getTime() - today.getTime();
  const diffInDays = Math.ceil(diffInMs / (1000 * 60 * 60 * 24));

  if (diffInDays < 0) {
    return 'Vencido';
  }

  if (diffInDays === 0) {
    return 'Vence hoy';
  }

  if (diffInDays <= 3) {
    return 'Próximo';
  }

  return 'Al corriente';
};

const getStatusCardStyles = (status: string): React.CSSProperties => {
  switch (status) {
    case 'Vencido':
      return {
        background: '#fff1f0',
        border: '1px solid #ffaca3',
      };
    case 'Vence hoy':
      return {
        background: '#fff7e6',
        border: '1px solid #ffd591',
      };
    case 'Próximo':
      return {
        background: '#fffbe6',
        border: '1px solid #f5d66f',
      };
    case 'Al corriente':
      return {
        background: '#f6ffed',
        border: '1px solid #b7eb8f',
      };
    default:
      return {
        background: '#fafafa',
        border: '1px solid #d9d9d9',
      };
  }
};

const getStatusTextColor = (status: string): string => {
  switch (status) {
    case 'Vencido':
      return '#cf1322';
    case 'Vence hoy':
      return '#d46b08';
    case 'Próximo':
      return '#ad6800';
    case 'Al corriente':
      return '#389e0d';
    default:
      return '#595959';
  }
};

const getPriorityRank = (status: string): number => {
  switch (status) {
    case 'Vencido':
      return 0;
    case 'Vence hoy':
      return 1;
    case 'Próximo':
      return 2;
    case 'Al corriente':
      return 3;
    default:
      return 4;
  }
};

const CreditoSchedulePanel: React.FC<CreditoSchedulePanelProps> = ({
  selectedCredit,
  payments,
  schedules,
}) => {
  if (!selectedCredit) {
    return (
      <DashboardPanel title="Calendario">
        <div
          style={{
            minHeight: '250px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            padding: '1.1rem',
          }}
        >
          <div style={{ maxWidth: '420px' }}>
            <div
              style={{
                width: '52px',
                height: '52px',
                margin: '0 auto 0.85rem auto',
                borderRadius: '14px',
                background: '#f5f5f5',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.4rem',
              }}
            >
              📅
            </div>

            <h3
              style={{
                margin: 0,
                fontSize: '1.1rem',
                fontWeight: 700,
                color: '#262626',
              }}
            >
              Sin selección
            </h3>

            <p
              style={{
                margin: '0.65rem 0 0 0',
                color: '#8c8c8c',
                lineHeight: 1.55,
                fontSize: '0.88rem',
              }}
            >
              Aquí aparecerán las fechas clave, el cronograma y el seguimiento del crédito.
            </p>
          </div>
        </div>
      </DashboardPanel>
    );
  }

  const recentPayments = payments.slice(0, 3);
  const nextPaymentStatus = getPaymentStatusLabel(selectedCredit.nextPaymentDate);

  const visibleSchedules = schedules.slice(0, 5);

  const urgentScheduleId =
    visibleSchedules.length > 0
      ? [...visibleSchedules]
          .sort((a, b) => {
            const aStatus = getPaymentStatusLabel(a.due_date);
            const bStatus = getPaymentStatusLabel(b.due_date);

            const priorityDiff = getPriorityRank(aStatus) - getPriorityRank(bStatus);

            if (priorityDiff !== 0) {
              return priorityDiff;
            }

            return a.installment_number - b.installment_number;
          })[0].id
      : null;

  return (
    <DashboardPanel title="Calendario">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <div
          style={{
            border: '1px dashed #d9d9d9',
            borderRadius: '12px',
            padding: '0.85rem',
            background: '#fafafa',
          }}
        >
          <p style={titleStyle}>Cronograma</p>
          <p style={textStyle}>Cuotas pendientes del crédito seleccionado.</p>
        </div>

        <div
          style={{
            ...cardStyle,
            background: '#eaf4ff',
            border: '1px solid #91caff',
          }}
        >
          <p style={titleStyle}>Próximo pago</p>
          <p style={textStyle}>{selectedCredit.nextPaymentDate}</p>
        </div>

        <div
          style={{
            ...cardStyle,
            ...getStatusCardStyles(nextPaymentStatus),
          }}
        >
          <p style={titleStyle}>Estado</p>
          <p
            style={{
              margin: '0.3rem 0 0 0',
              fontSize: '0.9rem',
              fontWeight: 700,
              color: getStatusTextColor(nextPaymentStatus),
            }}
          >
            {nextPaymentStatus}
          </p>
        </div>

        <div style={cardStyle}>
          <p style={titleStyle}>Plan</p>
          <p style={textStyle}>
            {selectedCredit.installmentsPaid} de {selectedCredit.installmentsTotal} cuotas
          </p>
        </div>

        <div style={cardStyle}>
          <p style={titleStyle}>Cuotas pendientes</p>

          {visibleSchedules.length === 0 ? (
            <p style={textStyle}>Sin cuotas pendientes para este crédito.</p>
          ) : (
            <div
              style={{
                marginTop: '0.6rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.55rem',
              }}
            >
              {visibleSchedules.map((schedule) => {
                const scheduleStatus = getPaymentStatusLabel(schedule.due_date);
                const isUrgent = schedule.id === urgentScheduleId;

                return (
                  <div
                    key={schedule.id}
                    style={{
                      background: isUrgent ? '#fffbe6' : '#fafafa',
                      borderRadius: '10px',
                      padding: '0.7rem',
                      border: isUrgent
                        ? '1px solid #f5d66f'
                        : '1px solid #f0f0f0',
                      boxShadow: isUrgent
                        ? '0 0 0 1px rgba(245, 214, 111, 0.15)'
                        : 'none',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        gap: '0.75rem',
                        flexWrap: 'wrap',
                      }}
                    >
                      <div>
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.45rem',
                            flexWrap: 'wrap',
                          }}
                        >
                          <p
                            style={{
                              margin: 0,
                              fontSize: '0.82rem',
                              fontWeight: 700,
                              color: '#262626',
                            }}
                          >
                            Cuota {schedule.installment_number}
                          </p>

                          {isUrgent && (
                            <span
                              style={{
                                fontSize: '0.68rem',
                                fontWeight: 700,
                                color: '#ad6800',
                                background: '#fff7e6',
                                border: '1px solid #ffd591',
                                borderRadius: '999px',
                                padding: '0.1rem 0.45rem',
                              }}
                            >
                              Prioritaria
                            </span>
                          )}
                        </div>

                        <p style={textStyle}>{formatDate(schedule.due_date)}</p>
                      </div>

                      <div style={{ textAlign: 'right' }}>
                        <p
                          style={{
                            margin: 0,
                            fontSize: '0.82rem',
                            fontWeight: 700,
                            color: '#262626',
                          }}
                        >
                          {formatCurrency(Number(schedule.amount_due))}
                        </p>
                        <p
                          style={{
                            margin: '0.25rem 0 0 0',
                            fontSize: '0.76rem',
                            fontWeight: 600,
                            color: getStatusTextColor(scheduleStatus),
                          }}
                        >
                          {scheduleStatus}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div
          style={{
            ...cardStyle,
            background: '#fffbe6',
            border: '1px solid #f5d66f',
          }}
        >
          <p style={titleStyle}>Seguimiento</p>
          <p style={textStyle}>Recordatorios y control de cobranza.</p>
        </div>

        <div style={cardStyle}>
          <p style={titleStyle}>Pagos recientes</p>

          {recentPayments.length === 0 ? (
            <p style={textStyle}>Sin pagos registrados para este crédito.</p>
          ) : (
            <div
              style={{
                marginTop: '0.6rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.55rem',
              }}
            >
              {recentPayments.map((payment) => (
                <div
                  key={payment.id}
                  style={{
                    background: '#fafafa',
                    borderRadius: '10px',
                    padding: '0.7rem',
                    border: '1px solid #f0f0f0',
                  }}
                >
                  <p
                    style={{
                      margin: 0,
                      fontSize: '0.82rem',
                      fontWeight: 600,
                      color: '#262626',
                    }}
                  >
                    {formatCurrency(Number(payment.amount))}
                  </p>
                  <p style={textStyle}>{formatDate(payment.paid_at)}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardPanel>
  );
};

export default CreditoSchedulePanel;