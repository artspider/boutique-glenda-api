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
import {
  LayoutDashboard,
  Users,
  Package,
  ShoppingCart,
  Wallet,
  Boxes,
  BadgeDollarSign,
} from 'lucide-react';

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
  icon: React.ReactNode;
};

const navItems: NavItem[] = [
  {
    key: 'dashboard',
    label: 'Dashboard',
    description: 'Resumen general',
    icon: <LayoutDashboard size={18} />,
  },
  {
    key: 'clientes',
    label: 'Clientes',
    description: 'Gestión de clientes',
    icon: <Users size={18} />,
  },
  {
    key: 'productos',
    label: 'Productos',
    description: 'Catálogo y precios',
    icon: <Package size={18} />,
  },
  {
    key: 'ventas',
    label: 'Ventas',
    description: 'Registro de ventas',
    icon: <ShoppingCart size={18} />,
  },
  {
    key: 'pagos',
    label: 'Pagos',
    description: 'Cobranza y abonos',
    icon: <Wallet size={18} />,
  },
  {
    key: 'inventario',
    label: 'Inventario',
    description: 'Control de stock',
    icon: <Boxes size={18} />,
  },
  {
    key: 'creditos',
    label: 'Créditos',
    description: 'Seguimiento financiero',
    icon: <BadgeDollarSign size={18} />,
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
      height: '60px',
      backgroundColor: '#ffffff',
      borderBottom: '1px solid #e5e7eb',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 1rem',
      position: 'sticky',
      top: 0,
      zIndex: 10,
    }}
  >
    <div>
      <p
        style={{
          margin: 0,
          fontSize: '0.75rem',
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
          margin: '0.1rem 0 0 0',
          fontSize: '1.15rem',
          color: '#111827',
          lineHeight: 1.2,
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
          fontSize: '0.82rem',
          color: '#6b7280',
        }}
      >
        Sistema de gestión comercial
      </p>
      <p
        style={{
          margin: '0.15rem 0 0 0',
          fontSize: '0.76rem',
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
  isCompact: boolean;
};

const Sidebar: React.FC<SidebarProps> = ({
  activeModule,
  onChangeModule,
  isCompact,
}) => (
  <aside
    style={{
      width: isCompact ? '88px' : '240px',
      backgroundColor: '#111827',
      color: '#ffffff',
      display: 'flex',
      flexDirection: 'column',
      padding: isCompact ? '1rem 0.5rem' : '1rem 0.75rem',
      gap: '1rem',
      minHeight: 'calc(100vh - 60px)',
      transition: 'width 0.2s ease, padding 0.2s ease',
      flexShrink: 0,
    }}
  >
    {!isCompact && (
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
    )}

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
                title={isCompact ? item.label : undefined}
                style={{
                  width: '100%',
                  textAlign: 'left',
                  border: isActive
                    ? '1px solid #60a5fa'
                    : '1px solid rgba(255,255,255,0.06)',
                  backgroundColor: isActive ? '#1d4ed8' : '#1f2937',
                  color: '#ffffff',
                  borderRadius: '12px',
                  padding: '0.65rem 0.75rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: isCompact ? 'center' : 'space-between',
                    alignItems: 'center',
                    gap: '0.75rem',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: isCompact ? '0' : '0.65rem',
                      minWidth: 0,
                    }}
                  >
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: isActive ? '#dbeafe' : '#cbd5e1',
                      }}
                    >
                      {item.icon}
                    </span>

                    {!isCompact && (
                      <span
                        style={{
                          fontWeight: 600,
                          fontSize: '0.95rem',
                        }}
                      >
                        {item.label}
                      </span>
                    )}
                  </div>

                  {isActive && !isCompact && (
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

                {!isCompact && (
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
                )}
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
  const [isCompactSidebar, setIsCompactSidebar] = useState(false);
  const [isMobileView, setIsMobileView] = useState(false);
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

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;

      setIsCompactSidebar(width <= 1100);
      setIsMobileView(width <= 768);
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

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
          minHeight: 'calc(100vh - 60px)',
        }}
      >
        {!isMobileView && (
          <Sidebar
            activeModule={activeModule}
            onChangeModule={setActiveModule}
            isCompact={isCompactSidebar}
          />
        )}

        <main
          style={{
            flex: 1,
            padding: isMobileView ? '0.75rem' : '1rem',
            minWidth: 0,
            width: '100%',
          }}
        >
          <section
            style={{
              backgroundColor: '#ffffff',
              border: '1px solid #e5e7eb',
              borderRadius: isMobileView ? '12px' : '14px',
              padding: isMobileView ? '0.85rem' : '1rem',
              marginBottom: '0.85rem',
              boxShadow: '0 1px 2px rgba(0, 0, 0, 0.04)',
            }}
          >
            <h2
              style={{
                margin: 0,
                fontSize: '1rem',
                color: '#111827',
              }}
            >
              {moduleTitles[activeModule]}
            </h2>
            <p
              style={{
                margin: '0.35rem 0 0 0',
                color: '#6b7280',
                fontSize: '0.88rem',
              }}
            >
              {moduleDescriptions[activeModule]}
            </p>
          </section>

          <section
            style={{
              backgroundColor: '#ffffff',
              border: '1px solid #e5e7eb',
              borderRadius: isMobileView ? '12px' : '14px',
              padding: isMobileView ? '0.75rem' : '1rem',
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