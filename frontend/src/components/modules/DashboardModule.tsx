import React, { useEffect, useState } from 'react';
import { formatCurrency } from '../../utils/formatters';
import {
  getActiveCredits,
  getUpcomingPayments,
  type Credit,
  type PaymentSchedule,
} from '../../services/creditService';
import { getPayments, type Payment } from '../../services/paymentService';
import { getCustomers, type Customer } from '../../services/clientService';
import KpiCard from '../dashboard/KpiCard';
import DashboardPanel from '../dashboard/DashboardPanel';
import SimpleTable from '../dashboard/SimpleTable';
import StatusBadge from '../dashboard/StatusBadge';
import AlertList from '../dashboard/AlertList';
import FeaturedProductCard from '../dashboard/FeaturedProductCard';
import MessageList from '../dashboard/MessageList';
import { Alert, SectionHeader } from '../ui';

const DashboardModule: React.FC = () => {
  const [activeCredits, setActiveCredits] = useState<Credit[]>([]);
  const [upcomingPayments, setUpcomingPayments] = useState<PaymentSchedule[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [creditsData, upcomingData, paymentsData, customersData] =
          await Promise.all([
            getActiveCredits(),
            getUpcomingPayments(),
            getPayments(),
            getCustomers(),
          ]);

        setActiveCredits(creditsData);
        setUpcomingPayments(upcomingData);
        setPayments(paymentsData);
        setCustomers(customersData);
        setError(null);
      } catch {
        setError('No se pudieron cargar los datos del dashboard');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const today = new Date();
  const todayDateString = today.toISOString().split('T')[0];

  const totalPorCobrar = activeCredits.reduce(
    (sum, credit) => sum + credit.balance,
    0
  );

  const totalVencido = upcomingPayments
    .filter(
      (payment) =>
        payment.status.toLowerCase() !== 'paid' &&
        payment.due_date.split('T')[0] < todayDateString
    )
    .reduce((sum, payment) => sum + payment.amount_due, 0);

  const pagosDelDia = payments
    .filter((payment) => payment.paid_at.split('T')[0] === todayDateString)
    .reduce((sum, payment) => sum + payment.amount, 0);

  const totalProximosPagos = upcomingPayments
    .filter((payment) => payment.due_date.split('T')[0] >= todayDateString)
    .reduce((sum, payment) => sum + payment.amount_due, 0);

  const getCustomerNameByCreditId = (creditId: number): string => {
    const credit = activeCredits.find((item) => item.id === creditId);

    if (!credit) {
      return `Crédito #${creditId}`;
    }

    const customer = customers.find((item) => item.id === credit.customer_id);

    if (!customer) {
      return `Crédito #${creditId}`;
    }

    return `${customer.first_name} ${customer.last_name}`.trim();
  };

  const upcomingPaymentsColumns = [
    { key: 'cliente', header: 'Cliente' },
    { key: 'fecha', header: 'Fecha' },
    { key: 'monto', header: 'Monto' },
    { key: 'estatus', header: 'Estatus' },
  ] as const;

  const upcomingPaymentsRows = upcomingPayments.slice(0, 5).map((payment) => ({
    cliente: getCustomerNameByCreditId(payment.credit_id),
    fecha: new Date(payment.due_date).toLocaleDateString('es-MX'),
    monto: formatCurrency(payment.amount_due),
    estatus:
      payment.status.toLowerCase() === 'paid' ? (
        <StatusBadge
          label="Pagado"
          backgroundColor="#f6ffed"
          textColor="#389e0d"
          borderColor="#b7eb8f"
        />
      ) : payment.due_date.split('T')[0] < todayDateString ? (
        <StatusBadge
          label="Vencido"
          backgroundColor="#fff1f0"
          textColor="#cf1322"
          borderColor="#ffa39e"
        />
      ) : (
        <StatusBadge label="Pendiente" />
      ),
  }));

  const vencidos = upcomingPayments.filter(
    (payment) =>
      payment.status.toLowerCase() !== 'paid' &&
      payment.due_date.split('T')[0] < todayDateString
  );

  const pagosHoy = upcomingPayments.filter(
    (payment) =>
      payment.status.toLowerCase() !== 'paid' &&
      payment.due_date.split('T')[0] === todayDateString
  );

  const proximosInmediatos = upcomingPayments.filter((payment) => {
    if (payment.status.toLowerCase() === 'paid') return false;

    const dueDate = new Date(payment.due_date);
    const diffMs = dueDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    return diffDays > 0 && diffDays <= 3;
  });

  const alertItems = [
    ...vencidos.slice(0, 2).map((payment) => ({
      title: 'Pago vencido detectado',
      description: `${getCustomerNameByCreditId(payment.credit_id)} tiene un pago vencido por ${formatCurrency(payment.amount_due)}.`,
      tone: 'danger' as const,
    })),
    ...pagosHoy.slice(0, 2).map((payment) => ({
      title: 'Pago programado para hoy',
      description: `${getCustomerNameByCreditId(payment.credit_id)} tiene un pago programado hoy por ${formatCurrency(payment.amount_due)}.`,
      tone: 'warning' as const,
    })),
    ...proximosInmediatos.slice(0, 1).map((payment) => ({
      title: 'Pago próximo a vencer',
      description: `${getCustomerNameByCreditId(payment.credit_id)} tiene un pago próximo por ${formatCurrency(payment.amount_due)}.`,
      tone: 'info' as const,
    })),
  ];

  const messageItems = [
    {
      customerName: 'María López',
      channel: 'WhatsApp' as const,
      preview: 'Hola, ¿puedo pagar mañana mi parcialidad?',
      time: 'Hace 10 min',
    },
    {
      customerName: 'José Ramírez',
      channel: 'Instagram' as const,
      preview: '¿Tienen disponible el modelo en talla M?',
      time: 'Hace 1 hora',
    },
    {
      customerName: 'Ana Torres',
      channel: 'WhatsApp' as const,
      preview: 'Ya hice el pago, ¿me confirmas?',
      time: 'Hace 3 horas',
    },
  ];

  if (loading) {
    return <Alert tone="info">Cargando dashboard...</Alert>;
  }

  if (error) {
    return <Alert tone="danger">{error}</Alert>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <SectionHeader
        title="Dashboard de cobranza"
        subtitle="Resumen financiero y operativo del estado de cobranza."
      />

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '0.85rem',
        }}
      >
        <KpiCard
          title="Total por cobrar"
          value={formatCurrency(totalPorCobrar)}
          backgroundColor="#e6f4ff"
          borderColor="#91caff"
        />

        <KpiCard
          title="Total vencido"
          value={formatCurrency(totalVencido)}
          backgroundColor="#fff1f0"
          borderColor="#ffa39e"
          valueColor="#cf1322"
        />

        <KpiCard
          title="Pagos del día"
          value={formatCurrency(pagosDelDia)}
          backgroundColor="#f6ffed"
          borderColor="#b7eb8f"
          valueColor="#389e0d"
        />

        <KpiCard
          title="Próximos pagos"
          value={formatCurrency(totalProximosPagos)}
          backgroundColor="#fffbe6"
          borderColor="#ffe58f"
        />
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '0.85rem',
        }}
      >
        <DashboardPanel title="Próximos pagos">
          <SimpleTable
            columns={upcomingPaymentsColumns}
            rows={upcomingPaymentsRows}
          />
        </DashboardPanel>

        <DashboardPanel title="Alertas">
          {alertItems.length > 0 ? (
            <AlertList items={alertItems} />
          ) : (
            <p style={{ margin: 0, color: '#8c8c8c' }}>
              No hay alertas activas por el momento.
            </p>
          )}
        </DashboardPanel>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '0.85rem',
        }}
      >
        <DashboardPanel title="Producto estrella">
          <FeaturedProductCard
            name="Vestido floral azul"
            category="Vestidos"
            unitsSold={18}
            revenue={6480}
          />
        </DashboardPanel>

        <DashboardPanel title="Mensajes recientes">
          <MessageList items={messageItems} />
        </DashboardPanel>
      </div>
    </div>
  );
};

export default DashboardModule;
