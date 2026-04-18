import type { CSSProperties, TextareaHTMLAttributes } from 'react';

export type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label?: string;
  error?: string;
  helperText?: string;
  containerStyle?: CSSProperties;
};

export default function Textarea({
  id,
  label,
  error,
  helperText,
  containerStyle,
  style,
  ...props
}: TextareaProps) {
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

      <textarea
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
          resize: 'vertical',
          ...style,
        }}
      />

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
