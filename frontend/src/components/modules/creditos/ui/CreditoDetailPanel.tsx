import React from 'react';
import DashboardPanel from '../../../dashboard/DashboardPanel';
import type { CreditItem, CreditStatus } from '../types';

interface CreditoDetailPanelProps {
  selectedCredit: CreditItem | null;
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    minimumFractionDigits: 2,
  }).format(value);
};

const getStatusLabel = (status: CreditStatus): string => {
  switch (status) {
    case 'active':
      return 'Activo';
    case 'overdue':
      return 'Vencido';
    case 'paid':
      return 'Liquidado';
    default:
      return 'Desconocido';
  }
};

const getStatusStyles = (status: CreditStatus): React.CSSProperties => {
  switch (status) {
    case 'active':
      return {
        backgroundColor: '#eaf4ff',
        color: '#1677ff',
        border: '1px solid #91caff',
      };
    case 'overdue':
      return {
        backgroundColor: '#fff1f0',
        color: '#cf1322',
        border: '1px solid #ffaca3',
      };
    case 'paid':
      return {
        backgroundColor: '#f6ffed',
        color: '#389e0d',
        border: '1px solid #b7eb8f',
      };
    default:
      return {
        backgroundColor: '#fafafa',
        color: '#595959',
        border: '1px solid #d9d9d9',
      };
  }
};

const getProgressPercentage = (paid: number, total: number) => {
  if (!total || total <= 0) return 0;
  return Math.min((paid / total) * 100, 100);
};

const metricCardStyle: React.CSSProperties = {
  border: '1px solid #f0f0f0',
  borderRadius: '12px',
  padding: '0.85rem',
  background: '#ffffff',
};

const labelStyle: React.CSSProperties = {
  margin: 0,
  fontSize: '0.82rem',
  color: '#8c8c8c',
};

const valueStyle: React.CSSProperties = {
  margin: '0.35rem 0 0 0',
  fontSize: '1.05rem',
  fontWeight: 700,
  color: '#262626',
};

const CreditoDetailPanel: React.FC<CreditoDetailPanelProps> = ({
  selectedCredit,
}) => {
  if (!selectedCredit) {
    return (
      <DashboardPanel title="Detalle">
        <div
          style={{
            minHeight: '280px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            padding: '1.25rem',
          }}
        >
          <div style={{ maxWidth: '460px' }}>
            <div
              style={{
                width: '56px',
                height: '56px',
                margin: '0 auto 0.9rem auto',
                borderRadius: '14px',
                background: '#f5f5f5',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.5rem',
              }}
            >
              💳
            </div>

            <h3
              style={{
                margin: 0,
                fontSize: '1.2rem',
                fontWeight: 700,
                color: '#262626',
              }}
            >
              Sin selección
            </h3>

            <p
              style={{
                margin: '0.7rem 0 0 0',
                color: '#8c8c8c',
                lineHeight: 1.6,
                fontSize: '0.9rem',
              }}
            >
              Aquí verás el resumen financiero, el avance y las alertas del crédito elegido.
            </p>

            <div
              style={{
                marginTop: '1rem',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
                gap: '0.6rem',
              }}
            >
              <div
                style={{
                  background: '#fafafa',
                  borderRadius: '12px',
                  padding: '0.8rem',
                }}
              >
                <p
                  style={{
                    margin: 0,
                    fontWeight: 600,
                    color: '#262626',
                    fontSize: '0.85rem',
                  }}
                >
                  Monto
                </p>
                <p
                  style={{
                    margin: '0.25rem 0 0 0',
                    color: '#8c8c8c',
                    fontSize: '0.75rem',
                  }}
                >
                  Resumen
                </p>
              </div>

              <div
                style={{
                  background: '#fafafa',
                  borderRadius: '12px',
                  padding: '0.8rem',
                }}
              >
                <p
                  style={{
                    margin: 0,
                    fontWeight: 600,
                    color: '#262626',
                    fontSize: '0.85rem',
                  }}
                >
                  Estado
                </p>
                <p
                  style={{
                    margin: '0.25rem 0 0 0',
                    color: '#8c8c8c',
                    fontSize: '0.75rem',
                  }}
                >
                  Alertas
                </p>
              </div>

              <div
                style={{
                  background: '#fafafa',
                  borderRadius: '12px',
                  padding: '0.8rem',
                }}
              >
                <p
                  style={{
                    margin: 0,
                    fontWeight: 600,
                    color: '#262626',
                    fontSize: '0.85rem',
                  }}
                >
                  Avance
                </p>
                <p
                  style={{
                    margin: '0.25rem 0 0 0',
                    color: '#8c8c8c',
                    fontSize: '0.75rem',
                  }}
                >
                  Pagos
                </p>
              </div>
            </div>
          </div>
        </div>
      </DashboardPanel>
    );
  }

  const progress = getProgressPercentage(
    selectedCredit.installmentsPaid,
    selectedCredit.installmentsTotal
  );

  return (
    <DashboardPanel title="Detalle">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
        <div
          style={{
            border: '1px solid #f0f0f0',
            borderRadius: '12px',
            padding: '0.9rem 1rem',
            background: '#fafafa',
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
              <p
                style={{
                  margin: 0,
                  fontSize: '1.15rem',
                  fontWeight: 700,
                  color: '#262626',
                }}
              >
                {selectedCredit.customerName}
              </p>

              <p
                style={{
                  margin: '0.3rem 0 0 0',
                  fontSize: '0.82rem',
                  color: '#8c8c8c',
                }}
              >
                Expediente del crédito
              </p>
            </div>

            <span
              style={{
                ...getStatusStyles(selectedCredit.status),
                borderRadius: '999px',
                padding: '0.22rem 0.65rem',
                fontSize: '0.72rem',
                fontWeight: 600,
                whiteSpace: 'nowrap',
              }}
            >
              {getStatusLabel(selectedCredit.status)}
            </span>
          </div>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
            gap: '0.6rem',
          }}
        >
          <div style={metricCardStyle}>
            <p style={labelStyle}>Total</p>
            <p style={valueStyle}>{formatCurrency(selectedCredit.totalAmount)}</p>
          </div>

          <div style={metricCardStyle}>
            <p style={labelStyle}>Enganche</p>
            <p style={valueStyle}>{formatCurrency(selectedCredit.downPayment)}</p>
          </div>

          <div style={metricCardStyle}>
            <p style={labelStyle}>Financiado</p>
            <p style={valueStyle}>{formatCurrency(selectedCredit.financedAmount)}</p>
          </div>

          <div
            style={{
              ...metricCardStyle,
              background: '#fffbe6',
              border: '1px solid #f5d66f',
            }}
          >
            <p style={labelStyle}>Saldo</p>
            <p style={valueStyle}>{formatCurrency(selectedCredit.balance)}</p>
          </div>
        </div>

        <div
          style={{
            border: '1px solid #f0f0f0',
            borderRadius: '12px',
            padding: '0.9rem 1rem',
            background: '#ffffff',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: '0.75rem',
              flexWrap: 'wrap',
              marginBottom: '0.6rem',
            }}
          >
            <div>
              <p
                style={{
                  margin: 0,
                  fontSize: '0.88rem',
                  fontWeight: 600,
                  color: '#262626',
                }}
              >
                Avance
              </p>
              <p
                style={{
                  margin: '0.25rem 0 0 0',
                  color: '#8c8c8c',
                  fontSize: '0.78rem',
                }}
              >
                {selectedCredit.installmentsPaid}/{selectedCredit.installmentsTotal} pagos
              </p>
            </div>

            <span
              style={{
                fontSize: '0.95rem',
                fontWeight: 700,
                color: '#595959',
              }}
            >
              {Math.round(progress)}%
            </span>
          </div>

          <div
            style={{
              width: '100%',
              height: '8px',
              background: '#f0f0f0',
              borderRadius: '999px',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                width: `${progress}%`,
                height: '100%',
                background: '#595959',
                borderRadius: '999px',
              }}
            />
          </div>
        </div>

        <div
          style={{
            border: '1px solid #ffe58f',
            background: '#fffbe6',
            borderRadius: '12px',
            padding: '0.9rem 1rem',
          }}
        >
          <p
            style={{
              margin: 0,
              fontSize: '0.88rem',
              fontWeight: 700,
              color: '#ad6800',
            }}
          >
            Alertas
          </p>

          <div
            style={{
              marginTop: '0.6rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.35rem',
              color: '#8c8c8c',
              fontSize: '0.82rem',
            }}
          >
            <p style={{ margin: 0 }}>Próximo: {selectedCredit.nextPaymentDate}</p>
            <p style={{ margin: 0 }}>Estado: {getStatusLabel(selectedCredit.status)}</p>
            <p style={{ margin: 0 }}>Seguimiento pendiente</p>
          </div>
        </div>
      </div>
    </DashboardPanel>
  );
};

export default CreditoDetailPanel;