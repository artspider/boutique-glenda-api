import type { CSSProperties, SelectHTMLAttributes } from 'react';

export type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  label?: string;
  error?: string;
  helperText?: string;
  containerStyle?: CSSProperties;
};

export default function Select({
  id,
  label,
  error,
  helperText,
  containerStyle,
  style,
  children,
  ...props
}: SelectProps) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '0.3rem',
        ...containerStyle,
      }}
    >
      {label ? (
        <label
          htmlFor={id}
          style={{
            fontSize: 'var(--font-size-xs)',
            color: 'var(--color-text-secondary)',
            fontWeight: 'var(--font-weight-bold)',
          }}
        >
          {label}
        </label>
      ) : null}

      <select
        id={id}
        {...props}
        style={{
          width: '100%',
          borderRadius: 'var(--radius-sm)',
          border: error
            ? '1px solid var(--color-danger-border)'
            : '1px solid var(--color-border-strong)',
          background: 'var(--color-surface-0)',
          color: 'var(--color-text-primary)',
          padding: '0.5rem 0.65rem',
          fontSize: 'var(--font-size-sm)',
          transition:
            'border-color var(--duration-fast) var(--easing-standard), box-shadow var(--duration-fast) var(--easing-standard)',
          ...style,
        }}
      >
        {children}
      </select>

      {error ? (
        <p
          style={{
            color: 'var(--color-danger-text)',
            fontSize: 'var(--font-size-xs)',
            fontWeight: 'var(--font-weight-semibold)',
          }}
        >
          {error}
        </p>
      ) : helperText ? (
        <p
          style={{
            color: 'var(--color-text-muted)',
            fontSize: 'var(--font-size-xs)',
          }}
        >
          {helperText}
        </p>
      ) : null}
    </div>
  );
}
