import React from 'react';

/**
 * =========================================================
 * styles.ts
 * ---------------------------------------------------------
 * Tokens visuales del módulo Clientes
 * - paleta homogénea con otros módulos
 * - cards compactas
 * - inputs consistentes
 * - botones jerárquicos
 * - badges de estado
 * - tabla compacta y legible
 * =========================================================
 */

/**
 * Paleta base homogénea con ProductosModule.
 * Se conserva el mismo lenguaje visual para dar continuidad
 * a toda la aplicación.
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
 * Tipografía base del módulo.
 * Se usa la misma familia genérica del resto del frontend,
 * priorizando consistencia visual y legibilidad.
 */
export const fontFamily = {
  base: `'Inter', 'Segoe UI', Roboto, Helvetica, Arial, sans-serif`,
};

/**
 * Badge base reutilizable.
 */
export const pillBase: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: 999,
  padding: '2px 8px',
  fontSize: 11,
  fontWeight: 700,
  lineHeight: 1.2,
  whiteSpace: 'nowrap',
  fontFamily: fontFamily.base,
};

/**
 * Contenedor principal del módulo.
 */
export const moduleContainerStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 12,
  background: 'transparent',
  fontFamily: fontFamily.base,
};

/**
 * Encabezado principal del módulo.
 */
export const moduleHeaderStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  gap: 10,
  flexWrap: 'wrap',
};

/**
 * Bloque de título y subtítulo.
 */
export const titleBlockStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 2,
};

export const titleStyle: React.CSSProperties = {
  margin: 0,
  fontSize: 18,
  fontWeight: 800,
  color: colors.text,
  lineHeight: 1.2,
  fontFamily: fontFamily.base,
};

export const subtitleStyle: React.CSSProperties = {
  margin: 0,
  fontSize: 12,
  color: colors.textMuted,
  lineHeight: 1.35,
  fontFamily: fontFamily.base,
};

/**
 * Card compacta principal.
 */
export const cardStyle: React.CSSProperties = {
  background: colors.cardBg,
  border: `1px solid ${colors.border}`,
  borderRadius: 12,
  padding: 10,
  boxShadow: '0 1px 2px rgba(15, 23, 42, 0.03)',
};

/**
 * Variante de card suave para bloques secundarios.
 */
export const softCardStyle: React.CSSProperties = {
  background: colors.cardBgSoft,
  border: `1px solid ${colors.borderSoft}`,
  borderRadius: 10,
  padding: 8,
};

/**
 * Fila superior interna de cards.
 */
export const sectionHeaderStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  gap: 8,
  flexWrap: 'wrap',
  marginBottom: 10,
};

/**
 * Título de sección o card.
 */
export const sectionTitleStyle: React.CSSProperties = {
  margin: 0,
  fontSize: 13,
  fontWeight: 800,
  color: colors.text,
  lineHeight: 1.25,
  fontFamily: fontFamily.base,
};

/**
 * Texto meta o auxiliar de sección.
 */
export const metaTextStyle: React.CSSProperties = {
  margin: 0,
  fontSize: 11,
  color: colors.textMuted,
  lineHeight: 1.3,
  fontFamily: fontFamily.base,
};

/**
 * Grid del formulario.
 */
export const formGridStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
  gap: 10,
};

/**
 * Grupo de campo individual.
 */
export const fieldGroupStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
};

/**
 * Label compacta.
 */
export const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: 11,
  fontWeight: 700,
  color: colors.textSoft,
  marginBottom: 4,
  letterSpacing: 0.1,
  fontFamily: fontFamily.base,
};

/**
 * Input compacto base.
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
  fontFamily: fontFamily.base,
};

/**
 * Estado visual sugerido para input con foco.
 */
export const inputFocusStyle: React.CSSProperties = {
  border: `1px solid ${colors.focus}`,
  boxShadow: `0 0 0 3px ${colors.focusRing}`,
  background: '#ffffff',
};

/**
 * Estado visual para input con error.
 */
export const inputErrorStyle: React.CSSProperties = {
  border: `1px solid ${colors.dangerBorder}`,
  boxShadow: '0 0 0 3px rgba(185, 28, 28, 0.08)',
  background: '#fffdfd',
};

/**
 * Texto auxiliar.
 */
export const helperTextStyle: React.CSSProperties = {
  fontSize: 10,
  color: colors.textMuted,
  marginTop: 3,
  fontFamily: fontFamily.base,
};

/**
 * Texto de error.
 */
export const errorTextStyle: React.CSSProperties = {
  fontSize: 11,
  color: colors.dangerText,
  marginTop: 3,
  fontWeight: 600,
  fontFamily: fontFamily.base,
};

/**
 * Contenedor de acciones del formulario.
 */
export const formActionsStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'flex-end',
  gap: 8,
  marginTop: 12,
  flexWrap: 'wrap',
};

/**
 * Botón primario.
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
  fontFamily: fontFamily.base,
};

/**
 * Botón secundario.
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
  fontFamily: fontFamily.base,
};

/**
 * Botón de éxito para guardar/actualizar.
 */
export const successButtonStyle: React.CSSProperties = {
  border: 'none',
  borderRadius: 10,
  padding: '8px 12px',
  fontSize: 12,
  fontWeight: 700,
  cursor: 'pointer',
  background: colors.successText,
  color: '#ffffff',
  transition: 'transform 0.15s ease, opacity 0.15s ease, background 0.15s ease',
  fontFamily: fontFamily.base,
};

/**
 * Botón de edición.
 */
export const editButtonStyle: React.CSSProperties = {
  border: `1px solid ${colors.infoBg}`,
  borderRadius: 10,
  padding: '6px 10px',
  fontSize: 11,
  fontWeight: 700,
  cursor: 'pointer',
  background: '#ffffff',
  color: colors.infoText,
  transition: 'transform 0.15s ease, opacity 0.15s ease, border-color 0.15s ease',
  fontFamily: fontFamily.base,
};

/**
 * Botón de peligro para eliminar.
 */
export const dangerButtonStyle: React.CSSProperties = {
  border: `1px solid ${colors.dangerBorder}`,
  borderRadius: 10,
  padding: '6px 10px',
  fontSize: 11,
  fontWeight: 700,
  cursor: 'pointer',
  background: '#ffffff',
  color: colors.dangerText,
  transition: 'transform 0.15s ease, opacity 0.15s ease, border-color 0.15s ease',
  fontFamily: fontFamily.base,
};

/**
 * Encabezado de tabla.
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
  fontFamily: fontFamily.base,
};

/**
 * Celdas de tabla.
 */
export const tdStyle: React.CSSProperties = {
  padding: '10px 10px',
  verticalAlign: 'middle',
  whiteSpace: 'nowrap',
  color: colors.text,
  fontSize: 12,
  borderBottom: `1px solid ${colors.borderSoft}`,
  fontFamily: fontFamily.base,
};

/**
 * Contenedor de tabla con scroll horizontal para móvil/tablet.
 */
export const tableContainerStyle: React.CSSProperties = {
  width: '100%',
  overflowX: 'auto',
};

/**
 * Tabla compacta base.
 */
export const tableStyle: React.CSSProperties = {
  width: '100%',
  minWidth: 860,
  borderCollapse: 'collapse',
  background: colors.cardBg,
};

/**
 * Nombre principal del cliente en tabla.
 */
export const namePrimaryStyle: React.CSSProperties = {
  fontSize: 12,
  fontWeight: 700,
  color: colors.text,
  lineHeight: 1.25,
  fontFamily: fontFamily.base,
};

/**
 * Texto secundario bajo nombre.
 */
export const nameSecondaryStyle: React.CSSProperties = {
  fontSize: 10,
  color: colors.textMuted,
  marginTop: 2,
  lineHeight: 1.25,
  fontFamily: fontFamily.base,
};

/**
 * Grupo de acciones por fila.
 */
export const rowActionsStyle: React.CSSProperties = {
  display: 'flex',
  gap: 6,
  flexWrap: 'wrap',
};

/**
 * Badge activo.
 */
export const badgeActiveStyle: React.CSSProperties = {
  ...pillBase,
  background: colors.successBg,
  color: colors.successText,
};

/**
 * Badge inactivo.
 */
export const badgeInactiveStyle: React.CSSProperties = {
  ...pillBase,
  background: colors.inactiveBg,
  color: colors.inactiveText,
};

/**
 * Alerta de éxito.
 */
export const successAlertStyle: React.CSSProperties = {
  background: colors.successBg,
  color: colors.successText,
  padding: '8px 10px',
  borderRadius: 10,
  border: `1px solid ${colors.borderSoft}`,
  fontSize: 12,
  fontWeight: 700,
  fontFamily: fontFamily.base,
};

/**
 * Alerta de error.
 */
export const errorAlertStyle: React.CSSProperties = {
  background: colors.dangerBg,
  color: colors.dangerText,
  padding: '8px 10px',
  borderRadius: 10,
  border: `1px solid ${colors.dangerBorder}`,
  fontSize: 12,
  fontWeight: 700,
  fontFamily: fontFamily.base,
};

/**
 * Estado vacío.
 */
export const emptyStateStyle: React.CSSProperties = {
  padding: '14px 10px',
  textAlign: 'center',
  fontSize: 12,
  color: colors.textMuted,
  fontWeight: 600,
  fontFamily: fontFamily.base,
};

/**
 * Tarjeta de resumen de métricas.
 */
export const summaryGridStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
  gap: 8,
};

export const summaryValueStyle: React.CSSProperties = {
  margin: 0,
  fontSize: 18,
  fontWeight: 800,
  color: colors.text,
  lineHeight: 1.1,
  fontFamily: fontFamily.base,
};

export const summaryLabelStyle: React.CSSProperties = {
  margin: '2px 0 0 0',
  fontSize: 10,
  fontWeight: 700,
  color: colors.textMuted,
  textTransform: 'uppercase',
  letterSpacing: 0.3,
  fontFamily: fontFamily.base,
};