import React from 'react';
import { formatCurrency } from '../../utils/formatters';
import KpiCard from '../dashboard/KpiCard';
import DashboardPanel from '../dashboard/DashboardPanel';
import SimpleTable from '../dashboard/SimpleTable';
import StatusBadge from '../dashboard/StatusBadge';
import AlertList from '../dashboard/AlertList';
import FeaturedProductCard from '../dashboard/FeaturedProductCard';
import MessageList from '../dashboard/MessageList';

const upcomingPaymentsColumns = [
  { key: 'cliente', header: 'Cliente' },
  { key: 'fecha', header: 'Fecha' },
  { key: 'monto', header: 'Monto' },
  { key: 'estatus', header: 'Estatus' },
] as const;

const upcomingPaymentsRows = [
  {
    cliente: 'María López',
    fecha: '10/04/2026',
    monto: formatCurrency(350),
    estatus: <StatusBadge label="Pendiente" />,
  },
  {
    cliente: 'José Ramírez',
    fecha: '11/04/2026',
    monto: formatCurrency(420),
    estatus: <StatusBadge label="Pendiente" />,
  },
  {
    cliente: 'Ana Torres',
    fecha: '12/04/2026',
    monto: formatCurrency(280),
    estatus: <StatusBadge label="Pendiente" />,
  },
];

const alertItems = [
  {
    title: 'Pago vencido detectado',
    description: 'María López tiene un pago vencido desde hace 2 días.',
    tone: 'danger' as const,
  },
  {
    title: 'Pago próximo a vencer',
    description: 'José Ramírez debe pagar mañana su parcialidad.',
    tone: 'warning' as const,
  },
  {
    title: 'Seguimiento recomendado',
    description: 'Ana Torres no ha respondido el último recordatorio.',
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

const DashboardModule: React.FC = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

      <h2>Dashboard de cobranza</h2>

      {/* 🔵 FILA 1 — KPIs */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
          gap: '1rem',
        }}
      >
        <KpiCard
          title="Total por cobrar"
          value={formatCurrency(0)}
          backgroundColor="#e6f4ff"
          borderColor="#91caff"
        />

        <KpiCard
          title="Total vencido"
          value={formatCurrency(0)}
          backgroundColor="#fff1f0"
          borderColor="#ffa39e"
          valueColor="#cf1322"
        />

        <KpiCard
          title="Pagos del día"
          value={formatCurrency(0)}
          backgroundColor="#f6ffed"
          borderColor="#b7eb8f"
          valueColor="#389e0d"
        />

        <KpiCard
          title="Próximos pagos"
          value={formatCurrency(0)}
          backgroundColor="#fffbe6"
          borderColor="#ffe58f"
        />
      </div>

      {/* 🟣 FILA 2 — LISTA + ALERTAS */}
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



      {/* 🟢 FILA 3 — PRODUCTO + MENSAJES */}
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
