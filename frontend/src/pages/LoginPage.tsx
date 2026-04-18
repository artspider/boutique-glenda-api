import { useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginUser } from '../services/authService';
import { Alert, Button, Card, Input } from '../components/ui';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage('');
    setIsSubmitting(true);

    try {
      await loginUser({ email, password });
      navigate('/app', { replace: true });
    } catch {
      setErrorMessage('No pudimos iniciar sesión. Verifica tus credenciales.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'grid',
        placeItems: 'center',
        padding: 'clamp(1rem, 3vw, 2rem)',
      }}
    >
      <Card
        style={{
          width: 'min(100%, 420px)',
          borderRadius: 'var(--radius-xl)',
          boxShadow: 'var(--shadow-md)',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            <p
              style={{
                fontSize: 'var(--font-size-xs)',
                fontWeight: 'var(--font-weight-bold)',
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                color: 'var(--color-brand-700)',
              }}
            >
              Boutique Glenda
            </p>
            <h1>Iniciar sesión</h1>
            <p
              style={{
                fontSize: 'var(--font-size-sm)',
                color: 'var(--color-text-muted)',
              }}
            >
              Accede al panel principal para gestionar ventas, pagos y clientes.
            </p>
          </div>

          {errorMessage ? <Alert tone="danger">{errorMessage}</Alert> : null}

          <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '0.8rem' }}>
            <Input
              id="login-email"
              type="email"
              label="Correo electrónico"
              placeholder="Ingresa tu email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="email"
              required
            />

            <Input
              id="login-password"
              type="password"
              label="Contraseña"
              placeholder="Ingresa tu contraseña"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="current-password"
              required
            />

            <Button type="submit" loading={isSubmitting} fullWidth size="lg">
              Ingresar
            </Button>
          </form>
        </div>
      </Card>
    </main>
  );
}

export default LoginPage;
