import React from 'react';
import type { ClientesSummaryProps } from '../types';
import {
  cardStyle,
  sectionHeaderStyle,
  sectionTitleStyle,
  metaTextStyle,
  summaryGridStyle,
  softCardStyle,
  summaryValueStyle,
  summaryLabelStyle,
} from '../styles';

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
    <div style={cardStyle}>
      <div style={sectionHeaderStyle}>
        <div>
          <h3 style={sectionTitleStyle}>Resumen de clientes</h3>
          <p style={metaTextStyle}>
            Vista rápida del estado actual de la cartera registrada.
          </p>
        </div>
      </div>

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
    </div>
  );
};

export default ClientesSummary;