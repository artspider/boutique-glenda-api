import React, { useEffect, useState } from 'react';
import ClientesModule from './modules/ClientesModule';
import ProductosModule from './modules/ProductosModule';
import VentasModule from './modules/VentasModule';
import PagosModule from './modules/PagosModule';
import InventarioModule from './modules/InventarioModule';
import CreditosModule from './modules/CreditosModule';
import DashboardModule from './modules/DashboardModule';
import { useNavigate } from 'react-router-dom';
import { getAccessToken } from '../services/authService';

type ActiveModule =
  | 'dashboard'
  | 'clientes'
  | 'productos'
  | 'ventas'
  | 'pagos'
  | 'inventario'
  | 'creditos';

type NavItem = {
  key: ActiveModule;
  label: string;
  description: string;
};

const navItems: NavItem[] = [
  {
    key: 'dashboard',
    label: 'Dashboard',
    description: 'Resumen general',
  },
  {
    key: 'clientes',
    label: 'Clientes',
    description: 'Gestión de clientes',
  },
  {
    key: 'productos',
    label: 'Productos',
    description: 'Catálogo y precios',
  },
  {
    key: 'ventas',
    label: 'Ventas',
    description: 'Registro de ventas',
  },
  {
    key: 'pagos',
    label: 'Pagos',
    description: 'Cobranza y abonos',
  },
  {
    key: 'inventario',
    label: 'Inventario',
    description: 'Control de stock',
  },
  {
    key: 'creditos',
    label: 'Créditos',
    description: 'Seguimiento financiero',
  },
];

const moduleTitles: Record<ActiveModule, string> = {
  dashboard: 'Dashboard',
  clientes: 'Clientes',
  productos: 'Productos',
  ventas: 'Ventas',
  pagos: 'Pagos',
  inventario: 'Inventario',
  creditos: 'Créditos',
};

const moduleDescriptions: Record<ActiveModule, string> = {
  dashboard: 'Vista general del negocio y cobranza',
  clientes: 'Administra la información de tus clientes',
  productos: 'Consulta y actualiza el catálogo de productos',
  ventas: 'Registra ventas y consulta movimientos comerciales',
  pagos: 'Controla pagos realizados y seguimiento de cobranza',
  inventario: 'Supervisa existencias y movimientos de inventario',
  creditos: 'Revisa saldos, pagos programados y estado de créditos',
};

const Header: React.FC<{ activeModule: ActiveModule }> = ({ activeModule }) => (
  <header
    style={{
      height: '72px',
      backgroundColor: '#ffffff',
      borderBottom: '1px solid #e5e7eb',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 1.5rem',
      position: 'sticky',
      top: 0,
      zIndex: 10,
    }}
  >
    <div>
      <p
        style={{
          margin: 0,
          fontSize: '0.8rem',
          fontWeight: 600,
          color: '#2563eb',
          textTransform: 'uppercase',
          letterSpacing: '0.04em',
        }}
      >
        Boutique Glenda
      </p>
      <h1
        style={{
          margin: '0.2rem 0 0 0',
          fontSize: '1.35rem',
          color: '#111827',
        }}
      >
        {moduleTitles[activeModule]}
      </h1>
    </div>

    <div
      style={{
        textAlign: 'right',
      }}
    >
      <p
        style={{
          margin: 0,
          fontSize: '0.88rem',
          color: '#6b7280',
        }}
      >
        Sistema de gestión comercial
      </p>
      <p
        style={{
          margin: '0.2rem 0 0 0',
          fontSize: '0.82rem',
          color: '#9ca3af',
        }}
      >
        MVP operativo
      </p>
    </div>
  </header>
);

type SidebarProps = {
  activeModule: ActiveModule;
  onChangeModule: (module: ActiveModule) => void;
};

const Sidebar: React.FC<SidebarProps> = ({ activeModule, onChangeModule }) => (
  <aside
    style={{
      width: '280px',
      backgroundColor: '#111827',
      color: '#ffffff',
      display: 'flex',
      flexDirection: 'column',
      padding: '1.25rem 1rem',
      gap: '1rem',
      minHeight: 'calc(100vh - 72px)',
    }}
  >
    <div
      style={{
        padding: '0.5rem 0.5rem 1rem 0.5rem',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
      }}
    >
      <h2
        style={{
          margin: 0,
          fontSize: '1rem',
          color: '#f9fafb',
        }}
      >
        Panel principal
      </h2>
      <p
        style={{
          margin: '0.4rem 0 0 0',
          fontSize: '0.86rem',
          color: '#9ca3af',
          lineHeight: 1.4,
        }}
      >
        Accede rápidamente a las áreas clave del sistema.
      </p>
    </div>

    <nav>
      <ul
        style={{
          listStyle: 'none',
          padding: 0,
          margin: 0,
          display: 'flex',
          flexDirection: 'column',
          gap: '0.55rem',
        }}
      >
        {navItems.map((item) => {
          const isActive = activeModule === item.key;

          return (
            <li key={item.key}>
              <button
                type="button"
                onClick={() => onChangeModule(item.key)}
                style={{
                  width: '100%',
                  textAlign: 'left',
                  border: isActive
                    ? '1px solid #60a5fa'
                    : '1px solid rgba(255,255,255,0.06)',
                  backgroundColor: isActive ? '#1d4ed8' : '#1f2937',
                  color: '#ffffff',
                  borderRadius: '12px',
                  padding: '0.85rem 0.9rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: '0.75rem',
                  }}
                >
                  <span
                    style={{
                      fontWeight: 600,
                      fontSize: '0.95rem',
                    }}
                  >
                    {item.label}
                  </span>

                  {isActive && (
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        minWidth: '22px',
                        height: '22px',
                        borderRadius: '999px',
                        backgroundColor: '#dbeafe',
                        color: '#1d4ed8',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                      }}
                    >
                      •
                    </span>
                  )}
                </div>

                <p
                  style={{
                    margin: '0.35rem 0 0 0',
                    fontSize: '0.8rem',
                    color: isActive ? '#dbeafe' : '#9ca3af',
                    lineHeight: 1.35,
                  }}
                >
                  {item.description}
                </p>
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  </aside>
);

const LayoutBase: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const [activeModule, setActiveModule] = useState<ActiveModule>('dashboard');
  const navigate = useNavigate();

  useEffect(() => {
    const checkSession = () => {
      const token = getAccessToken();

      if (!token) {
        navigate('/login', { replace: true });
      }
    };

    window.addEventListener('storage', checkSession);
    window.addEventListener('focus', checkSession);

    checkSession();

    return () => {
      window.removeEventListener('storage', checkSession);
      window.removeEventListener('focus', checkSession);
    };
  }, [navigate]);

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#f3f4f6',
      }}
    >
      <Header activeModule={activeModule} />

      <div
        style={{
          display: 'flex',
          minHeight: 'calc(100vh - 72px)',
        }}
      >
        <Sidebar activeModule={activeModule} onChangeModule={setActiveModule} />

        <main
          style={{
            flex: 1,
            padding: '1.5rem',
            minWidth: 0,
          }}
        >
          <section
            style={{
              backgroundColor: '#ffffff',
              border: '1px solid #e5e7eb',
              borderRadius: '18px',
              padding: '1.25rem 1.25rem 1.5rem 1.25rem',
              marginBottom: '1rem',
              boxShadow: '0 1px 2px rgba(0, 0, 0, 0.04)',
            }}
          >
            <h2
              style={{
                margin: 0,
                fontSize: '1.05rem',
                color: '#111827',
              }}
            >
              {moduleTitles[activeModule]}
            </h2>
            <p
              style={{
                margin: '0.45rem 0 0 0',
                color: '#6b7280',
                fontSize: '0.92rem',
              }}
            >
              {moduleDescriptions[activeModule]}
            </p>
          </section>

          <section
            style={{
              backgroundColor: '#ffffff',
              border: '1px solid #e5e7eb',
              borderRadius: '18px',
              padding: '1.25rem',
              boxShadow: '0 1px 2px rgba(0, 0, 0, 0.04)',
            }}
          >
            {activeModule === 'dashboard' && <DashboardModule />}
            {activeModule === 'clientes' && <ClientesModule />}
            {activeModule === 'productos' && <ProductosModule />}
            {activeModule === 'ventas' && <VentasModule />}
            {activeModule === 'pagos' && <PagosModule />}
            {activeModule === 'inventario' && <InventarioModule />}
            {activeModule === 'creditos' && <CreditosModule />}
            {children && <div>{children}</div>}
          </section>
        </main>
      </div>
    </div>
  );
};

export default LayoutBase;