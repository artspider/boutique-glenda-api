import React from 'react';
import type { Credit, PaymentSchedule } from '../../../services/creditService';
import { Button, Input, Select } from '../../ui';

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

      <Input
        id="pagos-search"
        label="Cliente"
        type="text"
        value={customerSearch}
        onChange={(e) => setCustomerSearch(e.target.value)}
        placeholder="Buscar cliente por nombre"
      />

      <Select
        id="pagos-credit"
        value={formData.credit_id}
        onChange={(e) => onCreditChange(e.target.value)}
        error={formErrors.credit_id}
      >
          <option value="">Selecciona un cliente</option>
          {filteredCredits.map((credit) => (
            <option key={credit.id} value={credit.id}>
              {getCustomerNameByCreditId(credit.id)}
            </option>
          ))}
      </Select>

      {filteredCredits.length === 0 && (
        <p style={{ margin: 0, color: '#8c8c8c', fontSize: '0.82rem' }}>
          No hay clientes que coincidan con la búsqueda.
        </p>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: nextScheduledPayment ? '1fr auto' : '1fr',
            gap: '0.5rem',
          }}
        >
          <Input
            id="pagos-amount"
            label="Monto del pago"
            type="number"
            min="0.01"
            step="0.01"
            value={formData.amount}
            onChange={(e) => onAmountChange(e.target.value)}
            placeholder="Ingresa el monto"
            error={formErrors.amount}
          />

          {nextScheduledPayment && (
            <Button
              type="button"
              onClick={onUseSuggestedAmount}
              variant="secondary"
              size="sm"
              style={{ alignSelf: 'end', whiteSpace: 'nowrap' }}
            >
              Monto pactado
            </Button>
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

      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Button onClick={onSubmit} fullWidth>
          Registrar pago
        </Button>
      </div>
    </div>
  );
};

export default PagosRegisterForm;
