import React from 'react';
import type { ClientesSummaryProps } from '../types';
import {
  summaryGridStyle,
  softCardStyle,
  summaryValueStyle,
  summaryLabelStyle,
} from '../styles';
import { Card, SectionHeader } from '../../../ui';

/**
 * =========================================================
 * ClientesSummary
 * ---------------------------------------------------------
 * Componente visual de métricas rápidas del módulo Clientes.
 * Responsabilidades:
 * - mostrar indicadores simples
 * - mantener una visualización compacta y homogénea
 *
 * No contiene lógica de negocio.
 * Solo presenta datos recibidos por props.
 * =========================================================
 */
const ClientesSummary: React.FC<ClientesSummaryProps> = ({
  totalClientes,
  activeClientes,
  inactiveClientes,
}) => {
  return (
    <Card>
      <SectionHeader
        title="Resumen de clientes"
        subtitle="Vista rapida del estado actual de la cartera registrada."
        style={{ marginBottom: 10 }}
      />

      <div style={summaryGridStyle}>
        <div style={softCardStyle}>
          <p style={summaryValueStyle}>{totalClientes}</p>
          <p style={summaryLabelStyle}>Total clientes</p>
        </div>

        <div style={softCardStyle}>
          <p style={summaryValueStyle}>{activeClientes}</p>
          <p style={summaryLabelStyle}>Activos</p>
        </div>

        <div style={softCardStyle}>
          <p style={summaryValueStyle}>{inactiveClientes}</p>
          <p style={summaryLabelStyle}>Inactivos</p>
        </div>
      </div>
    </Card>
  );
};

export default ClientesSummary;
