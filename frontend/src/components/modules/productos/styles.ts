import React from 'react';

/**
 * =========================================================
 * styles.ts
 * ---------------------------------------------------------
 * Tokens visuales del módulo Productos
 * - paleta
 * - superficies
 * - inputs
 * - botones
 * - badges
 * - tabla
 * =========================================================
 */

/**
 * Paleta base del módulo
 * Jerarquía:
 * - fondo general muy suave
 * - cards blancas
 * - azul petróleo / índigo para foco
 * - neutros compactos para texto
 */
export const colors = {
  // Fondos
  pageBg: '#f8fafc',
  cardBg: '#ffffff',
  cardBgSoft: '#f8fafc',
  headerBg: '#f8fafc',
  tableHeadBg: '#f8fafc',

  // Bordes
  border: '#e2e8f0',
  borderSoft: '#edf2f7',
  borderStrong: '#cbd5e1',

  // Texto
  text: '#0f172a',
  textSoft: '#334155',
  textMuted: '#64748b',
  textLight: '#94a3b8',

  // Marca / foco
  primary: '#334155',
  primaryStrong: '#1e293b',
  primarySoft: '#e2e8f0',
  focus: '#475569',
  focusRing: 'rgba(71, 85, 105, 0.18)',

  // Estados
  successText: '#166534',
  successBg: '#dcfce7',

  warningText: '#b45309',
  warningBg: '#fef3c7',

  dangerText: '#b91c1c',
  dangerBg: '#fee2e2',
  dangerBorder: '#fecaca',

  infoText: '#1d4ed8',
  infoBg: '#dbeafe',

  inactiveText: '#475569',
  inactiveBg: '#e2e8f0',
};

/**
 * Badge base reutilizable
 */
export const pillBase: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: 999,
  padding: '2px 8px',
  fontSize: '11px',
  fontWeight: 700,
  lineHeight: 1.2,
  whiteSpace: 'nowrap',
};

/**
 * Card compacta
 */
export const cardStyle: React.CSSProperties = {
  background: colors.cardBg,
  border: `1px solid ${colors.border}`,
  borderRadius: 12,
  padding: 10,
  boxShadow: '0 1px 2px rgba(15, 23, 42, 0.03)',
};

/**
 * Variante de card suave para métricas internas
 */
export const softCardStyle: React.CSSProperties = {
  background: colors.cardBgSoft,
  border: `1px solid ${colors.borderSoft}`,
  borderRadius: 10,
  padding: 8,
};

/**
 * Input compacto base
 * Nota:
 * el foco real se aplicará inline desde el componente
 * con onFocus / onBlur en el siguiente paso si lo deseas.
 */
export const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '7px 9px',
  borderRadius: 8,
  border: `1px solid ${colors.borderStrong}`,
  fontSize: 12,
  outline: 'none',
  boxSizing: 'border-box',
  background: colors.cardBg,
  color: colors.text,
  transition: 'border-color 0.18s ease, box-shadow 0.18s ease, background 0.18s ease',
};

/**
 * Estado visual sugerido para input con foco
 */
export const inputFocusStyle: React.CSSProperties = {
  border: `1px solid ${colors.focus}`,
  boxShadow: `0 0 0 3px ${colors.focusRing}`,
  background: '#ffffff',
};

/**
 * Estado visual para input con error
 */
export const inputErrorStyle: React.CSSProperties = {
  border: `1px solid ${colors.dangerBorder}`,
  boxShadow: '0 0 0 3px rgba(185, 28, 28, 0.08)',
  background: '#fffdfd',
};

/**
 * Label compacta
 */
export const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: 11,
  fontWeight: 700,
  color: colors.textSoft,
  marginBottom: 4,
  letterSpacing: 0.1,
};

/**
 * Texto auxiliar
 */
export const helperTextStyle: React.CSSProperties = {
  fontSize: 10,
  color: colors.textMuted,
  marginTop: 3,
};

/**
 * Texto de error
 */
export const errorTextStyle: React.CSSProperties = {
  fontSize: 11,
  color: colors.dangerText,
  marginTop: 3,
  fontWeight: 600,
};

/**
 * Botón primario
 */
export const primaryButtonStyle: React.CSSProperties = {
  border: 'none',
  borderRadius: 10,
  padding: '8px 12px',
  fontSize: 12,
  fontWeight: 700,
  cursor: 'pointer',
  background: colors.primaryStrong,
  color: '#ffffff',
  transition: 'transform 0.15s ease, opacity 0.15s ease, background 0.15s ease',
};

/**
 * Botón secundario
 */
export const secondaryButtonStyle: React.CSSProperties = {
  border: `1px solid ${colors.borderStrong}`,
  borderRadius: 10,
  padding: '8px 12px',
  fontSize: 12,
  fontWeight: 700,
  cursor: 'pointer',
  background: colors.cardBg,
  color: colors.textSoft,
  transition: 'transform 0.15s ease, opacity 0.15s ease, border-color 0.15s ease',
};

/**
 * Encabezado de tabla
 */
export const thStyle: React.CSSProperties = {
  textAlign: 'left',
  padding: '10px 10px',
  fontSize: 11,
  fontWeight: 800,
  color: colors.textSoft,
  borderBottom: `1px solid ${colors.border}`,
  whiteSpace: 'nowrap',
  background: colors.tableHeadBg,
};

/**
 * Celdas de tabla
 */
export const tdStyle: React.CSSProperties = {
  padding: '10px 10px',
  verticalAlign: 'middle',
  whiteSpace: 'nowrap',
  color: colors.text,
};