import React from 'react';

type SummaryCardKey = 'overdue' | 'today' | 'soon' | 'current';
type SummaryCardVariant = 'success' | 'warning' | 'danger' | 'neutral';

type SummaryCardItem = {
  key: SummaryCardKey;
  label: string;
  value: number;
  variant: SummaryCardVariant;
};

type PaymentSummaryCardsProps = {
  overdue: number;
  dueToday: number;
  dueSoon: number;
  current: number;
  selectedFilter?: SummaryCardKey | null;
  onFilterSelect?: (filter: SummaryCardKey) => void;
};

const variantClasses: Record<SummaryCardVariant, string> = {
  success: 'border border-emerald-200 bg-emerald-50',
  warning: 'border border-amber-200 bg-amber-50',
  danger: 'border border-rose-200 bg-rose-50',
  neutral: 'border border-sky-200 bg-sky-50',
};

const valueClasses: Record<SummaryCardVariant, string> = {
  success: 'text-emerald-700',
  warning: 'text-amber-700',
  danger: 'text-rose-700',
  neutral: 'text-slate-800',
};

const activeClasses: Record<SummaryCardVariant, string> = {
  success: 'ring-1 ring-emerald-300',
  warning: 'ring-1 ring-amber-300',
  danger: 'ring-1 ring-rose-300',
  neutral: 'ring-1 ring-sky-300',
};

const PaymentSummaryCards: React.FC<PaymentSummaryCardsProps> = ({
  overdue,
  dueToday,
  dueSoon,
  current,
  selectedFilter = null,
  onFilterSelect,
}) => {
  const cards: SummaryCardItem[] = [
    {
      key: 'overdue',
      label: 'Total vencido',
      value: overdue,
      variant: 'danger',
    },
    {
      key: 'today',
      label: 'Pagos del día',
      value: dueToday,
      variant: 'success',
    },
    {
      key: 'soon',
      label: 'Próximos pagos',
      value: dueSoon,
      variant: 'warning',
    },
    {
      key: 'current',
      label: 'Al corriente',
      value: current,
      variant: 'neutral',
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => {
        const isActive = selectedFilter === card.key;
        const clickable = Boolean(onFilterSelect);

        return (
          <div
            key={card.key}
            onClick={() => {
              if (onFilterSelect) {
                onFilterSelect(card.key);
              }
            }}
            className={`rounded-2xl px-6 py-5 shadow-sm transition ${variantClasses[card.variant]} ${valueClasses[card.variant]} ${isActive ? activeClasses[card.variant] : ''} ${clickable ? 'cursor-pointer hover:shadow-md' : ''}`}
          >
            <p className="text-sm font-medium text-slate-700">{card.label}</p>

            <p className={`mt-3 text-4xl font-bold leading-none ${valueClasses[card.variant]}`}>
              {card.value}
            </p>
          </div>
        );
      })}
    </div>
  );
};

export default PaymentSummaryCards;