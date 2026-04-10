import React, { useEffect, useMemo, useState } from 'react';
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
import SalesSectionCard from './ui/SalesSectionCard';
import StatusBadge from './ui/StatusBadge';

const PagosModule: React.FC = () => {
  const [credits, setCredits] = useState<Credit[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [upcomingPayments, setUpcomingPayments] = useState<PaymentSchedule[]>([]);
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

  const getPaymentStatusVariant = (dueDate: string) => {
    const label = getPaymentStatusLabel(dueDate);

    if (label === 'Vencido') return 'danger';
    if (label === 'Vence hoy') return 'warning';
    if (label === 'Próximo a vencer') return 'warning';

    return 'success';
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
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

      setPayments([]);
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

  const estimatedBalance = selectedCredit
    ? Math.max(Number(selectedCredit.balance) - Number(formData.amount || 0), 0)
    : 0;

  const summary = useMemo(() => {
    const overdue = upcomingPayments.filter(
      (payment) => getPaymentStatusLabel(payment.due_date) === 'Vencido'
    ).length;

    const dueSoon = upcomingPayments.filter((payment) => {
      const status = getPaymentStatusLabel(payment.due_date);
      return status === 'Vence hoy' || status === 'Próximo a vencer';
    }).length;

    const current = upcomingPayments.filter(
      (payment) => getPaymentStatusLabel(payment.due_date) === 'Al corriente'
    ).length;

    return {
      overdue,
      dueSoon,
      current,
    };
  }, [upcomingPayments]);

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-800">
              Pagos
            </h1>
            <p className="text-sm text-slate-500">
              Registra abonos, consulta saldos y da seguimiento a vencimientos
              de forma visual y operativa.
            </p>
          </div>

          <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
            {selectedCredit ? (
              <span>
                Crédito seleccionado: <strong>#{selectedCredit.id}</strong>
              </span>
            ) : (
              <span>Selecciona un crédito para comenzar.</span>
            )}
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <SalesSectionCard
          title="Vencidos"
          subtitle="Pagos que requieren atención inmediata"
        >
          <div className="text-3xl font-bold text-rose-600">
            {summary.overdue}
          </div>
        </SalesSectionCard>

        <SalesSectionCard
          title="Próximos a vencer"
          subtitle="Seguimiento preventivo de cobranza"
        >
          <div className="text-3xl font-bold text-amber-600">
            {summary.dueSoon}
          </div>
        </SalesSectionCard>

        <SalesSectionCard
          title="Al corriente"
          subtitle="Créditos con pagos estables"
        >
          <div className="text-3xl font-bold text-emerald-600">
            {summary.current}
          </div>
        </SalesSectionCard>
      </section>

      {loading && (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 text-sm text-slate-500 shadow-sm">
          Cargando créditos...
        </div>
      )}

      {error && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700 shadow-sm">
          {error}
        </div>
      )}

      {!loading && !error && (
        <>
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.15fr_0.85fr]">
            <SalesSectionCard
              title="Registrar pago"
              subtitle="Selecciona el crédito y captura el abono"
            >
              <div className="space-y-5">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Crédito
                  </label>
                  <select
                    value={formData.credit_id}
                    onChange={(e) => {
                      const selectedCreditId = e.target.value;

                      const upcomingPayment = upcomingPayments.find(
                        (payment) =>
                          payment.credit_id === Number(selectedCreditId)
                      );

                      setFormData({
                        ...formData,
                        credit_id: selectedCreditId,
                        amount: upcomingPayment
                          ? String(upcomingPayment.amount_due)
                          : '',
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
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                  >
                    <option value="">Selecciona un crédito</option>
                    {credits.map((credit) => (
                      <option key={credit.id} value={credit.id}>
                        Crédito #{credit.id} - Cliente {credit.customer_id} -
                        Saldo: {formatCurrency(Number(credit.balance))}
                      </option>
                    ))}
                  </select>
                  {formErrors.credit_id && (
                    <p className="mt-2 text-xs text-rose-600">
                      {formErrors.credit_id}
                    </p>
                  )}
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Monto del pago
                  </label>
                  <div className="flex flex-col gap-3 md:flex-row">
                    <input
                      type="number"
                      min="0.01"
                      step="0.01"
                      value={formData.amount}
                      onChange={(e) => {
                        setFormData({ ...formData, amount: e.target.value });
                        setFormErrors({ ...formErrors, amount: '' });
                      }}
                      className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                      placeholder="Ingresa el monto"
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
                        className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                      >
                        Usar monto pactado
                      </button>
                    )}
                  </div>

                  {nextScheduledPayment && formData.amount && (
                    <p className="mt-2 text-xs text-slate-500">
                      {Number(formData.amount) < Number(nextScheduledPayment.amount_due)
                        ? 'Pago menor al pactado'
                        : Number(formData.amount) > Number(nextScheduledPayment.amount_due)
                          ? 'Pago mayor al pactado'
                          : 'Pago exacto'}
                    </p>
                  )}

                  {formErrors.amount && (
                    <p className="mt-2 text-xs text-rose-600">
                      {formErrors.amount}
                    </p>
                  )}
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={handleRegisterPayment}
                    className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
                  >
                    Registrar pago
                  </button>
                </div>
              </div>
            </SalesSectionCard>

            <SalesSectionCard
              title="Resumen del crédito"
              subtitle="Información operativa del cliente y del próximo pago"
            >
              {!selectedCredit ? (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-sm text-slate-500">
                  Selecciona un crédito para visualizar su resumen.
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div className="rounded-2xl bg-slate-50 p-4">
                      <p className="text-xs uppercase tracking-wide text-slate-500">
                        Cliente
                      </p>
                      <p className="mt-1 text-sm font-semibold text-slate-800">
                        {selectedCustomer
                          ? `${selectedCustomer.first_name} ${selectedCustomer.last_name}`.trim()
                          : `Cliente ${selectedCredit.customer_id}`}
                      </p>
                    </div>

                    <div className="rounded-2xl bg-slate-50 p-4">
                      <p className="text-xs uppercase tracking-wide text-slate-500">
                        Estado
                      </p>
                      <p className="mt-1 text-sm font-semibold capitalize text-slate-800">
                        {selectedCredit.status}
                      </p>
                    </div>

                    <div className="rounded-2xl bg-slate-50 p-4">
                      <p className="text-xs uppercase tracking-wide text-slate-500">
                        Total del crédito
                      </p>
                      <p className="mt-1 text-sm font-semibold text-slate-800">
                        {formatCurrency(Number(selectedCredit.total_amount))}
                      </p>
                    </div>

                    <div className="rounded-2xl bg-slate-50 p-4">
                      <p className="text-xs uppercase tracking-wide text-slate-500">
                        Enganche
                      </p>
                      <p className="mt-1 text-sm font-semibold text-slate-800">
                        {formatCurrency(Number(selectedCredit.down_payment))}
                      </p>
                    </div>

                    <div className="rounded-2xl bg-slate-50 p-4">
                      <p className="text-xs uppercase tracking-wide text-slate-500">
                        Monto financiado
                      </p>
                      <p className="mt-1 text-sm font-semibold text-slate-800">
                        {formatCurrency(Number(selectedCredit.financed_amount))}
                      </p>
                    </div>

                    <div className="rounded-2xl bg-slate-50 p-4">
                      <p className="text-xs uppercase tracking-wide text-slate-500">
                        Saldo pendiente
                      </p>
                      <p className="mt-1 text-sm font-semibold text-rose-600">
                        {formatCurrency(Number(selectedCredit.balance))}
                      </p>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-white p-4">
                    <p className="text-xs uppercase tracking-wide text-slate-500">
                      Saldo estimado después del pago
                    </p>
                    <p className="mt-1 text-lg font-bold text-emerald-600">
                      {formatCurrency(estimatedBalance)}
                    </p>
                  </div>

                  {nextScheduledPayment ? (
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                      <div className="mb-3 flex flex-wrap items-center gap-2">
                        <StatusBadge
                          label={getPaymentStatusLabel(nextScheduledPayment.due_date)}
                          variant={getPaymentStatusVariant(nextScheduledPayment.due_date) as 'success' | 'warning' | 'danger'}
                        />
                      </div>

                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <div>
                          <p className="text-xs uppercase tracking-wide text-slate-500">
                            Próximo abono pactado
                          </p>
                          <p className="mt-1 text-sm font-semibold text-slate-800">
                            {formatCurrency(Number(nextScheduledPayment.amount_due))}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs uppercase tracking-wide text-slate-500">
                            Fecha próxima de pago
                          </p>
                          <p className="mt-1 text-sm font-semibold text-slate-800">
                            {formatDate(nextScheduledPayment.due_date)}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs uppercase tracking-wide text-slate-500">
                            Parcialidad
                          </p>
                          <p className="mt-1 text-sm font-semibold text-slate-800">
                            {nextScheduledPayment.installment_number} de {totalInstallments}
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-500">
                      No hay un próximo pago programado para este crédito.
                    </div>
                  )}
                </div>
              )}
            </SalesSectionCard>
          </div>

          <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_1fr]">
            <SalesSectionCard
              title="Historial de pagos"
              subtitle="Pagos registrados del crédito seleccionado"
            >
              {!selectedCredit ? (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-sm text-slate-500">
                  Selecciona un crédito para consultar sus pagos.
                </div>
              ) : payments.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-sm text-slate-500">
                  No hay pagos registrados para este crédito.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-slate-500">
                        <th className="px-4 py-3">ID</th>
                        <th className="px-4 py-3">Monto</th>
                        <th className="px-4 py-3">Método</th>
                        <th className="px-4 py-3">Referencia</th>
                        <th className="px-4 py-3">Fecha</th>
                      </tr>
                    </thead>
                    <tbody>
                      {payments.map((payment) => (
                        <tr
                          key={payment.id}
                          className="border-b border-slate-100 text-slate-700"
                        >
                          <td className="px-4 py-3 font-medium">{payment.id}</td>
                          <td className="px-4 py-3">
                            {formatCurrency(Number(payment.amount))}
                          </td>
                          <td className="px-4 py-3">{payment.payment_method}</td>
                          <td className="px-4 py-3">{payment.reference ?? '-'}</td>
                          <td className="px-4 py-3">{formatDate(payment.paid_at)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </SalesSectionCard>

            <SalesSectionCard
              title="Calendario / alertas operativas"
              subtitle="Base visual para vencimientos y seguimiento"
            >
              {upcomingPayments.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-sm text-slate-500">
                  No hay pagos programados para mostrar.
                </div>
              ) : (
                <div className="space-y-3">
                  {upcomingPayments.slice(0, 6).map((payment) => {
  const relatedCredit = credits.find(
    (credit) => credit.id === payment.credit_id
  );

  const customer = customers.find(
    (item) => item.id === relatedCredit?.customer_id
  );

  return (
    <div
      key={`${payment.credit_id}-${payment.installment_number}`}
      className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 md:flex-row md:items-center md:justify-between"
    >
      <div>
        <p className="text-sm font-semibold text-slate-800">
          {customer
            ? `${customer.first_name} ${customer.last_name}`.trim()
            : relatedCredit
              ? `Cliente ${relatedCredit.customer_id}`
              : `Crédito #${payment.credit_id}`}
        </p>
        <p className="text-xs text-slate-500">
          Crédito #{payment.credit_id} · Parcialidad{' '}
          {payment.installment_number}
        </p>
      </div>

                        <div className="flex flex-col gap-2 text-sm md:items-end">
                          <p className="font-semibold text-slate-800">
                            {formatCurrency(Number(payment.amount_due))}
                          </p>
                          <p className="text-slate-500">
                            {formatDate(payment.due_date)}
                          </p>
                          <div>
                            <StatusBadge
                              label={getPaymentStatusLabel(payment.due_date)}
                              variant={getPaymentStatusVariant(payment.due_date) as 'success' | 'warning' | 'danger'}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </SalesSectionCard>
          </div>

          <SalesSectionCard
            title="Créditos activos"
            subtitle="Vista general para selección y control"
          >
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-slate-500">
                    <th className="px-4 py-3">ID</th>
                    <th className="px-4 py-3">Cliente</th>
                    <th className="px-4 py-3">Total</th>
                    <th className="px-4 py-3">Financiado</th>
                    <th className="px-4 py-3">Saldo</th>
                    <th className="px-4 py-3">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {credits.map((credit) => (
                    <tr
                      key={credit.id}
                      className="border-b border-slate-100 text-slate-700"
                    >
                      <td className="px-4 py-3 font-medium">#{credit.id}</td>
                      <td className="px-4 py-3">
                        {(() => {
                          const customer = customers.find(
                            (item) => item.id === credit.customer_id
                          );

                          return customer
                            ? `${customer.first_name} ${customer.last_name}`.trim()
                            : `Cliente ${credit.customer_id}`;
                        })()}
                      </td>
                      <td className="px-4 py-3">
                        {formatCurrency(Number(credit.total_amount))}
                      </td>
                      <td className="px-4 py-3">
                        {formatCurrency(Number(credit.financed_amount))}
                      </td>
                      <td className="px-4 py-3">
                        {formatCurrency(Number(credit.balance))}
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge
                          label={credit.status}
                          variant="neutral"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </SalesSectionCard>
        </>
      )}
    </div>
  );
};

export default PagosModule;