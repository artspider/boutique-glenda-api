import React, { useEffect, useState } from 'react';
import { formatCurrency } from '../../utils/formatters';
import {
  getActiveCredits,
  getUpcomingPayments,
  type Credit,
  type PaymentSchedule,
} from '../../services/creditService';
import { getPayments, type Payment } from '../../services/paymentService';
import KpiCard from '../dashboard/KpiCard';
import DashboardPanel from '../dashboard/DashboardPanel';
import SimpleTable from '../dashboard/SimpleTable';
import StatusBadge from '../dashboard/StatusBadge';
import AlertList from '../dashboard/AlertList';
import FeaturedProductCard from '../dashboard/FeaturedProductCard';
import MessageList from '../dashboard/MessageList';
import { getCustomers, type Customer } from '../../services/clientService';

const DashboardModule: React.FC = () => {
  const [activeCredits, setActiveCredits] = useState<Credit[]>([]);
  const [upcomingPayments, setUpcomingPayments] = useState<PaymentSchedule[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [customers, setCustomers] = useState<Customer[]>([]);

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
        setError(null);
        setCustomers(customersData);
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

  const alertItems = [
    ...(totalVencido > 0
      ? [
          {
            title: 'Pagos vencidos detectados',
            description: `Tienes ${formatCurrency(totalVencido)} en pagos vencidos por atender.`,
            tone: 'danger' as const,
          },
        ]
      : []),
    ...(upcomingPayments.some(
      (payment) =>
        payment.status.toLowerCase() !== 'paid' &&
        payment.due_date.split('T')[0] === todayDateString
    )
      ? [
          {
            title: 'Pagos programados para hoy',
            description: 'Hay clientes con pagos agendados para el día de hoy.',
            tone: 'warning' as const,
          },
        ]
      : []),
    {
      title: 'Seguimiento recomendado',
      description: 'Revisa los próximos pagos para anticipar la cobranza.',
      tone: 'info' as const,
    },
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
    return <p>Cargando dashboard...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <h2>Dashboard de cobranza</h2>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
          gap: '1rem',
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
          gridTemplateColumns: '2fr 1fr',
          gap: '1rem',
        }}
      >
        <DashboardPanel title="Próximos pagos">
          <SimpleTable
            columns={upcomingPaymentsColumns}
            rows={upcomingPaymentsRows}
          />
        </DashboardPanel>

        <DashboardPanel title="Alertas">
          <AlertList items={alertItems} />
        </DashboardPanel>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '1rem',
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