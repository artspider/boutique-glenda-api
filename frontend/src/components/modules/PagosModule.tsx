import React, { useEffect, useMemo, useState } from 'react';
import { formatCurrency } from '../../utils/formatters';
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
import StatusBadge from './ui/StatusBadge';
import PagosSummaryCards from './ui/PagosSummaryCards';

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

      alert('Pago registrado correctamente');
      await fetchCredits();
      await fetchPaymentsByCredit(paidCreditId);
    } catch {
      alert('Error al registrar pago');
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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
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

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <DashboardPanel title="Registrar pago">
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
                    <label style={{ fontWeight: 600, fontSize: '0.92rem' }}>Monto del pago</label>

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
                        onChange={(e) => {
                          setFormData({ ...formData, amount: e.target.value });
                          setFormErrors({ ...formErrors, amount: '' });
                        }}
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
                          onClick={() =>
                            setFormData({
                              ...formData,
                              amount: String(nextScheduledPayment.amount_due),
                            })
                          }
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
                        {Number(formData.amount) <
                        Number(nextScheduledPayment.amount_due)
                          ? 'Pago menor al pactado'
                          : Number(formData.amount) >
                              Number(nextScheduledPayment.amount_due)
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
                      onClick={handleRegisterPayment}
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
              </DashboardPanel>

              <DashboardPanel title="Historial de pagos">
                {!selectedCredit ? (
                  <p style={{ margin: 0, color: '#8c8c8c' }}>
                    Selecciona un cliente para consultar sus pagos.
                  </p>
                ) : payments.length === 0 ? (
                  <p style={{ margin: 0, color: '#8c8c8c' }}>
                    No hay pagos registrados para este crédito.
                  </p>
                ) : (
                  <div
                    style={{
                      overflowX: 'auto',
                      overflowY: 'auto',
                      maxHeight: '280px',
                      border: '1px solid #f0f0f0',
                      borderRadius: '10px',
                    }}
                  >
                    <table
                      style={{
                        width: '100%',
                        minWidth: '560px',
                        borderCollapse: 'collapse',
                        fontSize: '0.92rem',
                      }}
                    >
                      <thead>
                        <tr
                          style={{
                            textAlign: 'left',
                            borderBottom: '1px solid #f0f0f0',
                            background: '#fafafa',
                            position: 'sticky',
                            top: 0,
                            zIndex: 1,
                          }}
                        >
                          <th style={{ padding: '0.6rem 0.5rem' }}>ID</th>
                          <th style={{ padding: '0.6rem 0.5rem' }}>Monto</th>
                          <th style={{ padding: '0.6rem 0.5rem' }}>Método</th>
                          <th style={{ padding: '0.6rem 0.5rem' }}>Referencia</th>
                          <th style={{ padding: '0.6rem 0.5rem' }}>Fecha</th>
                        </tr>
                      </thead>
                      <tbody>
                        {payments.map((payment) => (
                          <tr
                            key={payment.id}
                            style={{ borderBottom: '1px solid #f5f5f5' }}
                          >
                            <td style={{ padding: '0.6rem 0.5rem' }}>{payment.id}</td>
                            <td style={{ padding: '0.6rem 0.5rem' }}>
                              {formatCurrency(Number(payment.amount))}
                            </td>
                            <td style={{ padding: '0.6rem 0.5rem' }}>
                              {payment.payment_method}
                            </td>
                            <td style={{ padding: '0.6rem 0.5rem' }}>
                              {payment.reference ?? '-'}
                            </td>
                            <td style={{ padding: '0.6rem 0.5rem' }}>
                              {formatDate(payment.paid_at)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </DashboardPanel>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default PagosModule;