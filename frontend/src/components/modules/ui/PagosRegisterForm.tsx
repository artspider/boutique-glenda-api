import React from 'react';
import type { Credit, PaymentSchedule } from '../../../services/creditService';

type PagosRegisterFormProps = {
  customerSearch: string;
  setCustomerSearch: (value: string) => void;
  filteredCredits: Credit[];
  formData: {
    credit_id: string;
    amount: string;
  };
  formErrors: {
    credit_id: string;
    amount: string;
  };
  nextScheduledPayment?: PaymentSchedule;
  onCreditChange: (creditId: string) => void;
  onAmountChange: (value: string) => void;
  onUseSuggestedAmount: () => void;
  onSubmit: () => void;
  getCustomerNameByCreditId: (creditId: number) => string;
};

const PagosRegisterForm: React.FC<PagosRegisterFormProps> = ({
  customerSearch,
  setCustomerSearch,
  filteredCredits,
  formData,
  formErrors,
  nextScheduledPayment,
  onCreditChange,
  onAmountChange,
  onUseSuggestedAmount,
  onSubmit,
  getCustomerNameByCreditId,
}) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.7rem' }}>
      <p style={{ margin: 0, color: '#595959', fontSize: '0.92rem' }}>
        Busca y selecciona a la persona para registrar su abono
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
        <label style={{ fontWeight: 600, fontSize: '0.92rem' }}>Cliente</label>

        <input
          type="text"
          value={customerSearch}
          onChange={(e) => setCustomerSearch(e.target.value)}
          placeholder="Buscar cliente por nombre"
          style={{
            padding: '0.55rem 0.75rem',
            borderRadius: '8px',
            border: '1px solid #d9d9d9',
            fontSize: '0.92rem',
            width: '100%',
            boxSizing: 'border-box',
          }}
        />

        <select
          value={formData.credit_id}
          onChange={(e) => onCreditChange(e.target.value)}
          style={{
            padding: '0.55rem 0.75rem',
            borderRadius: '8px',
            border: '1px solid #d9d9d9',
            fontSize: '0.92rem',
            width: '100%',
          }}
        >
          <option value="">Selecciona un cliente</option>
          {filteredCredits.map((credit) => (
            <option key={credit.id} value={credit.id}>
              {getCustomerNameByCreditId(credit.id)}
            </option>
          ))}
        </select>

        {filteredCredits.length === 0 && (
          <p style={{ margin: 0, color: '#8c8c8c', fontSize: '0.82rem' }}>
            No hay clientes que coincidan con la búsqueda.
          </p>
        )}

        {formErrors.credit_id && (
          <p style={{ margin: 0, color: '#cf1322', fontSize: '0.82rem' }}>
            {formErrors.credit_id}
          </p>
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
        <label style={{ fontWeight: 600, fontSize: '0.92rem' }}>
          Monto del pago
        </label>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: nextScheduledPayment ? '1fr auto' : '1fr',
            gap: '0.5rem',
          }}
        >
          <input
            type="number"
            min="0.01"
            step="0.01"
            value={formData.amount}
            onChange={(e) => onAmountChange(e.target.value)}
            placeholder="Ingresa el monto"
            style={{
              padding: '0.55rem 0.75rem',
              borderRadius: '8px',
              border: '1px solid #d9d9d9',
              fontSize: '0.92rem',
              width: '100%',
              boxSizing: 'border-box',
            }}
          />

          {nextScheduledPayment && (
            <button
              type="button"
              onClick={onUseSuggestedAmount}
              style={{
                padding: '0.55rem 0.8rem',
                borderRadius: '8px',
                border: '1px solid #d9d9d9',
                background: '#fafafa',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '0.88rem',
                whiteSpace: 'nowrap',
              }}
            >
              Monto pactado
            </button>
          )}
        </div>

        {nextScheduledPayment && formData.amount && (
          <p style={{ margin: 0, color: '#8c8c8c', fontSize: '0.82rem' }}>
            {Number(formData.amount) < Number(nextScheduledPayment.amount_due)
              ? 'Pago menor al pactado'
              : Number(formData.amount) > Number(nextScheduledPayment.amount_due)
                ? 'Pago mayor al pactado'
                : 'Pago exacto'}
          </p>
        )}

        {formErrors.amount && (
          <p style={{ margin: 0, color: '#cf1322', fontSize: '0.82rem' }}>
            {formErrors.amount}
          </p>
        )}
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button
          onClick={onSubmit}
          style={{
            padding: '0.65rem 0.95rem',
            borderRadius: '8px',
            border: 'none',
            background: '#1677ff',
            color: '#fff',
            fontWeight: 700,
            cursor: 'pointer',
            fontSize: '0.92rem',
            width: '100%',
          }}
        >
          Registrar pago
        </button>
      </div>
    </div>
  );
};

export default PagosRegisterForm;