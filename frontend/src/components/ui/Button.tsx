import type { ButtonHTMLAttributes, CSSProperties } from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  fullWidth?: boolean;
};

const variantStyleMap: Record<ButtonVariant, CSSProperties> = {
  primary: {
    background: 'var(--color-brand-700)',
    color: 'var(--color-surface-0)',
    border: '1px solid var(--color-brand-700)',
  },
  secondary: {
    background: 'var(--color-surface-0)',
    color: 'var(--color-text-secondary)',
    border: '1px solid var(--color-border-strong)',
  },
  danger: {
    background: 'var(--color-danger-bg)',
    color: 'var(--color-danger-text)',
    border: '1px solid var(--color-danger-border)',
  },
  ghost: {
    background: 'transparent',
    color: 'var(--color-text-secondary)',
    border: '1px solid transparent',
  },
};

const sizeStyleMap: Record<ButtonSize, CSSProperties> = {
  sm: {
    minHeight: '2rem',
    fontSize: 'var(--font-size-xs)',
    padding: '0.35rem 0.65rem',
  },
  md: {
    minHeight: '2.25rem',
    fontSize: 'var(--font-size-sm)',
    padding: '0.5rem 0.85rem',
  },
  lg: {
    minHeight: '2.6rem',
    fontSize: 'var(--font-size-md)',
    padding: '0.65rem 1rem',
  },
};

export default function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  fullWidth = false,
  disabled,
  style,
  children,
  ...props
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <button
      type="button"
      {...props}
      disabled={isDisabled}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.4rem',
        borderRadius: 'var(--radius-md)',
        fontWeight: 'var(--font-weight-bold)',
        lineHeight: '1',
        transition:
          'background var(--duration-fast) var(--easing-standard), border-color var(--duration-fast) var(--easing-standard), opacity var(--duration-fast) var(--easing-standard)',
        cursor: isDisabled ? 'not-allowed' : 'pointer',
        width: fullWidth ? '100%' : undefined,
        ...variantStyleMap[variant],
        ...sizeStyleMap[size],
        ...style,
      }}
    >
      {loading ? 'Procesando...' : children}
    </button>
  );
}
