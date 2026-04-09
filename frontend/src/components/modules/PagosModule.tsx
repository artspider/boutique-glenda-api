import React, { useEffect, useState } from 'react';
import {
  getActiveCredits,
  getUpcomingPayments,
} from '../../services/creditService';
import type {
  Credit,
  PaymentSchedule,
} from '../../services/creditService';
import { getPayments, registerPayment } from '../../services/paymentService';
import type { Payment } from '../../services/paymentService';
import { getCustomers } from '../../services/clientService';
import type { Customer } from '../../services/clientService';

const PagosModule: React.FC = () => {
  const [credits, setCredits] = useState<Credit[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [upcomingPayments, setUpcomingPayments] = useState<PaymentSchedule[]>(
    []
  );
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    credit_id: '',
    amount: '',
  });

  const [formErrors, setFormErrors] = useState({
    credit_id: '',
    amount: '',
  });

  const fetchCredits = async () => {
    try {
      const [creditsData, upcomingPaymentsData, customersData] = await Promise.all([
  getActiveCredits(),
  getUpcomingPayments(),
  getCustomers(),
]);

setCredits(creditsData);
setUpcomingPayments(upcomingPaymentsData);
setCustomers(customersData);

      setError(null);
    } catch {
      setError('Error al cargar créditos activos');
    } finally {
      setLoading(false);
    }
  };

  const fetchPaymentsByCredit = async (creditId: number) => {
  try {
    const data = await getPayments(creditId);
    setPayments(data);
  } catch {
    setPayments([]);
  }
};

  useEffect(() => {
    fetchCredits();
  }, []);

  const getPaymentStatusLabel = (dueDate: string) => {
  const today = new Date();
  const paymentDate = new Date(dueDate);

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
    return 'Próximo a vencer';
  }

  return 'Al corriente';
};

  const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
  }).format(value);
};

  const validateForm = () => {
    const errors = {
      credit_id: '',
      amount: '',
    };

    if (!formData.credit_id) {
      errors.credit_id = 'Debes seleccionar un crédito';
    }

    if (!formData.amount || Number(formData.amount) <= 0) {
      errors.amount = 'El monto debe ser mayor a 0';
    }



    if (
      selectedCredit &&
      Number(formData.amount) > Number(selectedCredit.balance)
    ) {
      errors.amount = 'El pago no puede ser mayor al saldo pendiente';
    }

    setFormErrors(errors);

    return !errors.credit_id && !errors.amount;
  };

  const handleRegisterPayment = async () => {
    if (!validateForm()) return;

    try {
      await registerPayment({
        credit_id: Number(formData.credit_id),
        user_id: 1,
        amount: Number(formData.amount),
      });

      setFormData({
        credit_id: '',
        amount: '',
      });

      alert('Pago registrado correctamente');
      await fetchCredits();
    } catch {
      alert('Error al registrar pago');
    }
  };

  const selectedCredit = credits.find(
    (credit) => credit.id === Number(formData.credit_id)
  );

  const selectedCustomer = customers.find(
  (customer) => customer.id === selectedCredit?.customer_id
);

  const nextScheduledPayment = upcomingPayments.find(
    (payment) => payment.credit_id === Number(formData.credit_id)
  );

  const totalInstallments = Math.max(
  0,
  ...upcomingPayments
    .filter((payment) => payment.credit_id === Number(formData.credit_id))
    .map((payment) => payment.installment_number)
);

  return (
    <div>
      <h2>Pagos</h2>

      {loading && <p>Cargando créditos...</p>}
      {error && <p>{error}</p>}

      {!loading && !error && (
        <div>
          <div>
            <label>Crédito</label>
            <select
              value={formData.credit_id}
              onChange={(e) => {
  const selectedCreditId = e.target.value;

  const upcomingPayment = upcomingPayments.find(
    (payment) => payment.credit_id === Number(selectedCreditId)
  );

  setFormData({
    ...formData,
    credit_id: selectedCreditId,
    amount: upcomingPayment ? String(upcomingPayment.amount_due) : '',
  });

  setFormErrors({
    ...formErrors,
    credit_id: '',
    amount: '',
  });

  if (selectedCreditId) {
  fetchPaymentsByCredit(Number(selectedCreditId));
} else {
  setPayments([]);
}
}}
            >
              <option value="">Selecciona un crédito</option>
              {credits.map((credit) => (
                <option key={credit.id} value={credit.id}>
                  Crédito #{credit.id} - Cliente {credit.customer_id} - Saldo: $
                  {credit.balance}
                </option>
              ))}
            </select>
            {formErrors.credit_id && <p>{formErrors.credit_id}</p>}
          </div>

          {selectedCredit && (
            <div>
              <p>
  Cliente: {selectedCustomer
    ? `${selectedCustomer.first_name} ${selectedCustomer.last_name}`.trim()
    : `Cliente ${selectedCredit.customer_id}`}
</p>
              <p>Total del crédito: ${selectedCredit.total_amount}</p>
              <p>Enganche: ${selectedCredit.down_payment}</p>
              <p>Monto financiado: ${selectedCredit.financed_amount}</p>
              <p>Saldo pendiente: {formatCurrency(Number(selectedCredit.balance))}</p>
              <p>
  Saldo estimado después de este pago: $
  {Math.max(Number(selectedCredit.balance) - Number(formData.amount || 0), 0)}
</p>
              {nextScheduledPayment && (
                <>
                  <p>
                    Próximo abono pactado: ${nextScheduledPayment.amount_due}
                  </p>
                  <p>Fecha próxima de pago: {nextScheduledPayment.due_date}</p>
                  <p>Estatus del próximo pago: {getPaymentStatusLabel(nextScheduledPayment.due_date)}</p>
                  <p>
  Número de parcialidad: {nextScheduledPayment.installment_number} de{' '}
  {totalInstallments}
</p>
                </>
              )}

              <p>Estado: {selectedCredit.status}</p>
            </div>
          )}

          <div>
            <label>Monto del pago</label>
            <input
              type="number"
              min="0.01"
              step="0.01"
              value={formData.amount}
              onChange={(e) => {
                setFormData({ ...formData, amount: e.target.value });
                setFormErrors({ ...formErrors, amount: '' });
              }}
            />
            {nextScheduledPayment && (
  <button
    type="button"
    onClick={() =>
      setFormData({
        ...formData,
        amount: String(nextScheduledPayment.amount_due),
      })
    }
  >
    Usar monto pactado
  </button>
)}
            {nextScheduledPayment && formData.amount && (
  <p>
    {Number(formData.amount) < Number(nextScheduledPayment.amount_due)
      ? 'Pago menor al pactado'
      : Number(formData.amount) > Number(nextScheduledPayment.amount_due)
        ? 'Pago mayor al pactado'
        : 'Pago exacto'}
  </p>
)}
            {formErrors.amount && <p>{formErrors.amount}</p>}
          </div>

          <button onClick={handleRegisterPayment}>Registrar pago</button>

          {selectedCredit && (
  <div style={{ marginTop: '1rem' }}>
    <h3>Historial de pagos</h3>

    {payments.length === 0 ? (
      <p>No hay pagos registrados para este crédito.</p>
    ) : (
      <table style={{ width: '100%', marginTop: '1rem' }}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Monto</th>
            <th>Método</th>
            <th>Referencia</th>
            <th>Fecha</th>
          </tr>
        </thead>
        <tbody>
          {payments.map((payment) => (
            <tr key={payment.id}>
              <td>{payment.id}</td>
              <td>{payment.amount}</td>
              <td>{payment.payment_method}</td>
              <td>{payment.reference ?? '-'}</td>
              <td>{payment.paid_at}</td>
            </tr>
          ))}
        </tbody>
      </table>
    )}
  </div>
)}

          <h3>Créditos activos</h3>

          <table style={{ width: '100%', marginTop: '1rem' }}>
            <thead>
              <tr>
                <th>ID</th>
                <th>Cliente</th>
                <th>Total</th>
                <th>Financiado</th>
                <th>Saldo</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {credits.map((credit) => (
                <tr key={credit.id}>
                  <td>{credit.id}</td>
                  <td>{credit.customer_id}</td>
                  <td>{credit.total_amount}</td>
                  <td>{credit.financed_amount}</td>
                  <td>{credit.balance}</td>
                  <td>{credit.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default PagosModule;