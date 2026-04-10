import React, { useEffect, useMemo, useState } from 'react';
import DashboardPanel from '../../../dashboard/DashboardPanel';
import type { CreditItem, CreditStatus } from '../types';

interface CreditosListProps {
  credits: CreditItem[];
  selectedCreditId: number | null;
  onSelectCredit: (creditId: number) => void;
}

const ITEMS_PER_PAGE = 7;

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

const getCardStyles = (
  status: CreditStatus,
  isSelected: boolean
): React.CSSProperties => {
  if (isSelected) {
    switch (status) {
      case 'active':
        return {
          background: '#f3f9ff',
          border: '1px solid #69b1ff',
        };
      case 'overdue':
        return {
          background: '#fff5f5',
          border: '1px solid #ff7875',
        };
      case 'paid':
        return {
          background: '#f6ffed',
          border: '1px solid #95de64',
        };
      default:
        return {
          background: '#f5f5f5',
          border: '1px solid #595959',
        };
    }
  }

  return {
    background: '#ffffff',
    border: '1px solid #f0f0f0',
  };
};

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    minimumFractionDigits: 2,
  }).format(value);
};

const getProgressPercentage = (paid: number, total: number) => {
  if (!total || total <= 0) return 0;
  return Math.min((paid / total) * 100, 100);
};

const parsePaymentDate = (value: string): number => {
  const parsed = new Date(value).getTime();
  return Number.isNaN(parsed) ? Number.MAX_SAFE_INTEGER : parsed;
};

const getPriorityWeight = (credit: CreditItem): number => {
  if (credit.status === 'overdue') return 0;
  if (credit.status === 'active') return 1;
  if (credit.status === 'paid') return 2;
  return 3;
};

const CreditosList: React.FC<CreditosListProps> = ({
  credits,
  selectedCreditId,
  onSelectCredit,
}) => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');

  const sortedCredits = useMemo(() => {
    return [...credits].sort((a, b) => {
      const priorityDiff = getPriorityWeight(a) - getPriorityWeight(b);

      if (priorityDiff !== 0) {
        return priorityDiff;
      }

      return parsePaymentDate(a.nextPaymentDate) - parsePaymentDate(b.nextPaymentDate);
    });
  }, [credits]);

  const filteredCredits = useMemo(() => {
    const normalizedSearch = search.toLowerCase().trim();

    if (!normalizedSearch) {
      return sortedCredits;
    }

    return sortedCredits.filter((credit) =>
      credit.customerName.toLowerCase().includes(normalizedSearch)
    );
  }, [search, sortedCredits]);

  const totalPages = Math.max(1, Math.ceil(filteredCredits.length / ITEMS_PER_PAGE));
  const currentPage = Math.min(page, totalPages);

  const paginatedCredits = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE;
    return filteredCredits.slice(start, end);
  }, [currentPage, filteredCredits]);

  useEffect(() => {
    setPage(1);
  }, [search]);

  const handlePreviousPage = () => {
    setPage((prev) => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setPage((prev) => Math.min(prev + 1, totalPages));
  };

  return (
    <DashboardPanel title="Créditos">
      <div
        style={{
          marginTop: 0,
          marginBottom: '0.6rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '0.75rem',
          flexWrap: 'wrap',
        }}
      >
        <p style={{ margin: 0, color: '#8c8c8c', fontSize: '0.9rem' }}>
          Prioridad de cobranza.
        </p>

        <p style={{ margin: 0, color: '#8c8c8c', fontSize: '0.8rem' }}>
          {filteredCredits.length} registros
        </p>
      </div>

      <div style={{ marginBottom: '0.75rem' }}>
        <input
          type="text"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Buscar cliente"
          style={{
            width: '100%',
            border: '1px solid #d9d9d9',
            borderRadius: '10px',
            padding: '0.7rem 0.85rem',
            fontSize: '0.9rem',
            color: '#262626',
            outline: 'none',
            background: '#ffffff',
            boxSizing: 'border-box',
          }}
        />
      </div>

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '0.6rem',
        }}
      >
        {paginatedCredits.length === 0 && (
          <div
            style={{
              border: '1px dashed #d9d9d9',
              borderRadius: '12px',
              padding: '1rem',
              background: '#fafafa',
              textAlign: 'center',
            }}
          >
            <p
              style={{
                margin: 0,
                fontSize: '0.88rem',
                color: '#8c8c8c',
              }}
            >
              No se encontraron créditos para esa búsqueda.
            </p>
          </div>
        )}

        {paginatedCredits.map((credit) => {
          const isSelected = credit.id === selectedCreditId;
          const progress = getProgressPercentage(
            credit.installmentsPaid,
            credit.installmentsTotal
          );

          return (
            <button
              key={credit.id}
              type="button"
              onClick={() => onSelectCredit(credit.id)}
              style={{
                width: '100%',
                textAlign: 'left',
                borderRadius: '12px',
                padding: '0.85rem',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.6rem',
                transition: 'all 0.2s ease',
                ...getCardStyles(credit.status, isSelected),
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  gap: '0.6rem',
                  flexWrap: 'wrap',
                }}
              >
                <div style={{ minWidth: 0 }}>
                  <p
                    style={{
                      margin: 0,
                      fontSize: '0.95rem',
                      fontWeight: 700,
                      color: '#262626',
                    }}
                  >
                    {credit.customerName}
                  </p>

                  <p
                    style={{
                      margin: '0.25rem 0 0 0',
                      fontSize: '0.8rem',
                      color: '#8c8c8c',
                    }}
                  >
                    {credit.installmentsPaid}/{credit.installmentsTotal} pagos
                  </p>
                </div>

                <span
                  style={{
                    ...getStatusStyles(credit.status),
                    borderRadius: '999px',
                    padding: '0.2rem 0.6rem',
                    fontSize: '0.72rem',
                    fontWeight: 600,
                    whiteSpace: 'nowrap',
                  }}
                >
                  {getStatusLabel(credit.status)}
                </span>
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
                  gap: '0.6rem',
                }}
              >
                <div>
                  <p
                    style={{
                      margin: 0,
                      fontSize: '0.7rem',
                      color: '#8c8c8c',
                      textTransform: 'uppercase',
                      letterSpacing: '0.03em',
                    }}
                  >
                    Saldo
                  </p>
                  <p
                    style={{
                      margin: '0.2rem 0 0 0',
                      fontSize: '0.88rem',
                      fontWeight: 600,
                      color: '#262626',
                    }}
                  >
                    {formatCurrency(credit.balance)}
                  </p>
                </div>

                <div>
                  <p
                    style={{
                      margin: 0,
                      fontSize: '0.7rem',
                      color: '#8c8c8c',
                      textTransform: 'uppercase',
                      letterSpacing: '0.03em',
                    }}
                  >
                    Próximo
                  </p>
                  <p
                    style={{
                      margin: '0.2rem 0 0 0',
                      fontSize: '0.88rem',
                      fontWeight: 600,
                      color: '#262626',
                    }}
                  >
                    {credit.nextPaymentDate}
                  </p>
                </div>
              </div>

              <div>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '0.3rem',
                    gap: '0.5rem',
                  }}
                >
                  <span
                    style={{
                      fontSize: '0.75rem',
                      color: '#8c8c8c',
                    }}
                  >
                    Avance
                  </span>
                  <span
                    style={{
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      color: '#595959',
                    }}
                  >
                    {Math.round(progress)}%
                  </span>
                </div>

                <div
                  style={{
                    width: '100%',
                    height: '6px',
                    background: '#f0f0f0',
                    borderRadius: '999px',
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      width: `${progress}%`,
                      height: '100%',
                      background: isSelected ? '#262626' : '#8c8c8c',
                      borderRadius: '999px',
                    }}
                  />
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {totalPages > 1 && (
        <div
          style={{
            marginTop: '0.9rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '0.75rem',
            flexWrap: 'wrap',
          }}
        >
          <button
            type="button"
            onClick={handlePreviousPage}
            disabled={currentPage === 1}
            style={{
              border: '1px solid #d9d9d9',
              background: currentPage === 1 ? '#fafafa' : '#ffffff',
              color: currentPage === 1 ? '#bfbfbf' : '#262626',
              borderRadius: '10px',
              padding: '0.45rem 0.8rem',
              cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
              fontSize: '0.85rem',
              fontWeight: 500,
            }}
          >
            Anterior
          </button>

          <p style={{ margin: 0, fontSize: '0.82rem', color: '#8c8c8c' }}>
            Página {currentPage} de {totalPages}
          </p>

          <button
            type="button"
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
            style={{
              border: '1px solid #d9d9d9',
              background: currentPage === totalPages ? '#fafafa' : '#ffffff',
              color: currentPage === totalPages ? '#bfbfbf' : '#262626',
              borderRadius: '10px',
              padding: '0.45rem 0.8rem',
              cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
              fontSize: '0.85rem',
              fontWeight: 500,
            }}
          >
            Siguiente
          </button>
        </div>
      )}
    </DashboardPanel>
  );
};

export default CreditosList;