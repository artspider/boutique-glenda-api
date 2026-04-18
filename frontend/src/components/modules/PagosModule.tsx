import React, { useEffect, useMemo, useState } from 'react';
//import { formatCurrency } from '../../utils/formatters';
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
//import KpiCard from '../dashboard/KpiCard';
import DashboardPanel from '../dashboard/DashboardPanel';
//import StatusBadge from './ui/StatusBadge';
import PagosSummaryCards from './ui/PagosSummaryCards';
import PagosHistoryTable from './ui/PagosHistoryTable';
import PagosRegisterForm from './ui/PagosRegisterForm';
import PagosCreditSummary from './ui/PagosCreditSummary';
import { Alert } from '../ui';


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

  const [customerSearch, setCustomerSearch] = useState('');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error' | null; message: string }>({
    type: null,
    message: '',
  });

  const fetchCredits = async () => {
    try {
      const [creditsData, upcomingPaymentsData, customersData] =
        await Promise.all([
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

  const getPaymentStatusVariant = (
    dueDate: string
  ): 'success' | 'warning' | 'danger' | 'neutral' => {
    const label = getPaymentStatusLabel(dueDate);

    if (label === 'Vencido') return 'danger';
    if (label === 'Vence hoy') return 'warning';
    if (label === 'Próximo a vencer') return 'warning';

    return 'success';
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

  const getCustomerNameByCreditId = (creditId: number): string => {
    const credit = credits.find((item) => item.id === creditId);

    if (!credit) {
      return `Crédito #${creditId}`;
    }

    const customer = customers.find((item) => item.id === credit.customer_id);

    if (!customer) {
      return `Crédito #${creditId}`;
    }

    return `${customer.first_name} ${customer.last_name}`.trim();
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

    setFeedback({ type: null, message: '' });

    try {
      await registerPayment({
        credit_id: Number(formData.credit_id),
        user_id: 1,
        amount: Number(formData.amount),
      });

      const paidCreditId = Number(formData.credit_id);

      setFormData({
        credit_id: String(paidCreditId),
        amount: '',
      });

      setFeedback({
        type: 'success',
        message: 'Pago registrado correctamente.',
      });
      await fetchCredits();
      await fetchPaymentsByCredit(paidCreditId);
    } catch {
      setFeedback({
        type: 'error',
        message: 'Error al registrar pago.',
      });
    }
  };

  const estimatedBalance = selectedCredit
    ? Math.max(Number(selectedCredit.balance) - Number(formData.amount || 0), 0)
    : 0;

  const summary = useMemo(() => {
    const overdue = upcomingPayments.filter(
      (payment) => getPaymentStatusLabel(payment.due_date) === 'Vencido'
    ).length;

    const dueToday = upcomingPayments.filter(
      (payment) => getPaymentStatusLabel(payment.due_date) === 'Vence hoy'
    ).length;

    const dueSoon = upcomingPayments.filter(
      (payment) =>
        getPaymentStatusLabel(payment.due_date) === 'Próximo a vencer'
    ).length;

    const current = upcomingPayments.filter(
      (payment) => getPaymentStatusLabel(payment.due_date) === 'Al corriente'
    ).length;

    return {
      overdue,
      dueToday,
      dueSoon,
      current,
    };
  }, [upcomingPayments]);

  const upcomingQueue = upcomingPayments.slice(0, 6);

  const filteredCredits = credits.filter((credit) =>
    getCustomerNameByCreditId(credit.id)
      .toLowerCase()
      .includes(customerSearch.toLowerCase().trim())
  );
    const handleCreditChange = (selectedCreditId: string) => {
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
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      {feedback.type === 'success' ? (
        <Alert tone="success">{feedback.message}</Alert>
      ) : null}

      {feedback.type === 'error' ? (
        <Alert tone="danger">{feedback.message}</Alert>
      ) : null}

      <DashboardPanel title="">
        <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
          {selectedCredit
            ? `Cliente seleccionado: ${getCustomerNameByCreditId(selectedCredit.id)}`
            : 'Selecciona un cliente para comenzar.'}
        </p>

                <PagosSummaryCards
          overdue={summary.overdue}
          dueToday={summary.dueToday}
          dueSoon={summary.dueSoon}
          current={summary.current}
        />
      </DashboardPanel>

      {loading && (
        <DashboardPanel title="">
          <p style={{ margin: 0, color: '#8c8c8c' }}>Cargando créditos...</p>
        </DashboardPanel>
      )}

      {error && (
        <DashboardPanel title="">
          <p style={{ margin: 0, color: '#cf1322' }}>{error}</p>
        </DashboardPanel>
      )}

      {!loading && !error && (
        <>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
              gap: '0.75rem',
              alignItems: 'stretch',
            }}
          >
            <PagosCreditSummary
              selectedCredit={selectedCredit}
              selectedCustomer={selectedCustomer}
              nextScheduledPayment={nextScheduledPayment}
              totalInstallments={totalInstallments}
              estimatedBalance={estimatedBalance}
              upcomingQueue={upcomingQueue}
              credits={credits}
              customers={customers}
              formatDate={formatDate}
              getPaymentStatusLabel={getPaymentStatusLabel}
              getPaymentStatusVariant={getPaymentStatusVariant}
            />

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <DashboardPanel title="Registrar pago">
                                <PagosRegisterForm
                  customerSearch={customerSearch}
                  setCustomerSearch={setCustomerSearch}
                  filteredCredits={filteredCredits}
                  formData={formData}
                  formErrors={formErrors}
                  nextScheduledPayment={nextScheduledPayment}
                  onCreditChange={handleCreditChange}
                  onAmountChange={(value) => {
                    setFormData({ ...formData, amount: value });
                    setFormErrors({ ...formErrors, amount: '' });
                  }}
                  onUseSuggestedAmount={() =>
                    setFormData({
                      ...formData,
                      amount: nextScheduledPayment
                        ? String(nextScheduledPayment.amount_due)
                        : '',
                    })
                  }
                  onSubmit={handleRegisterPayment}
                  getCustomerNameByCreditId={getCustomerNameByCreditId}
                />
              </DashboardPanel>

              <PagosHistoryTable
                selectedCreditId={selectedCredit?.id}
                payments={payments}
                formatDate={formatDate}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default PagosModule;
