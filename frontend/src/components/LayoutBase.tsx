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
  Menu,
  X,
} from 'lucide-react';
import { Card, SectionHeader } from './ui';

/* =========================================================
   TIPOS
========================================================= */

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

/* =========================================================
   CONSTANTES
========================================================= */

const ACTIVE_MODULE_STORAGE_KEY = 'boutique_glenda_active_module';
const MOBILE_NAV_ID = 'app-mobile-sidebar-nav';

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

/* =========================================================
   HELPERS
========================================================= */

/**
 * Valida si una cadena corresponde a un módulo permitido.
 */
const isValidActiveModule = (value: string): value is ActiveModule => {
  return [
    'dashboard',
    'clientes',
    'productos',
    'ventas',
    'pagos',
    'inventario',
    'creditos',
  ].includes(value);
};

/**
 * Recupera desde localStorage el último módulo activo válido.
 */
const getStoredActiveModule = (): ActiveModule => {
  const storedValue = localStorage.getItem(ACTIVE_MODULE_STORAGE_KEY);

  if (storedValue && isValidActiveModule(storedValue)) {
    return storedValue;
  }

  return 'dashboard';
};

/* =========================================================
   HEADER
========================================================= */

type HeaderProps = {
  activeModule: ActiveModule;
  isMobileView: boolean;
  isMobileSidebarOpen: boolean;
  onToggleMobileSidebar: () => void;
};

const Header: React.FC<HeaderProps> = ({
  activeModule,
  isMobileView,
  isMobileSidebarOpen,
  onToggleMobileSidebar,
}) => (
  <header
    style={{
      height: isMobileView ? '52px' : '60px',
      backgroundColor: 'var(--color-surface-0)',
      borderBottom: '1px solid var(--color-border-soft)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: isMobileView ? '0 0.65rem' : '0 1rem',
      position: 'sticky',
      top: 0,
      zIndex: 40,
      gap: '0.75rem',
    }}
  >
    {/* =====================================================
        LADO IZQUIERDO DEL HEADER
    ===================================================== */}
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.65rem',
        minWidth: 0,
      }}
    >
      {/* ===================================================
          BOTÓN MENÚ MÓVIL
      =================================================== */}
      {isMobileView && (
        <button
          type="button"
          onClick={onToggleMobileSidebar}
          aria-label={isMobileSidebarOpen ? 'Cerrar menú' : 'Abrir menú'}
          aria-expanded={isMobileSidebarOpen}
          aria-controls={MOBILE_NAV_ID}
          style={{
            border: '1px solid var(--color-border-strong)',
            backgroundColor: 'var(--color-surface-0)',
            color: 'var(--color-text-primary)',
            borderRadius: 'var(--radius-md)',
            width: '34px',
            height: '34px',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            flexShrink: 0,
          }}
        >
          {isMobileSidebarOpen ? <X size={18} /> : <Menu size={18} />}
        </button>
      )}

      {/* ===================================================
          MARCA Y TÍTULO
      =================================================== */}
      <div style={{ minWidth: 0 }}>
        <p
          style={{
            margin: 0,
            fontSize: isMobileView ? '0.6rem' : '0.75rem',
            fontWeight: 600,
            color: 'var(--color-brand-700)',
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
          }}
        >
          Boutique Glenda
        </p>

        <h1
          style={{
            margin: '0.05rem 0 0 0',
            fontSize: isMobileView ? '0.95rem' : '1.15rem',
            color: 'var(--color-text-primary)',
            lineHeight: 1.2,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {moduleTitles[activeModule]}
        </h1>
      </div>
    </div>

    {/* =====================================================
        LADO DERECHO DEL HEADER
    ===================================================== */}
    {!isMobileView && (
      <div style={{ textAlign: 'right' }}>
        <p
          style={{
            margin: 0,
            fontSize: '0.82rem',
            color: 'var(--color-text-muted)',
          }}
        >
          Sistema de gestión comercial
        </p>
        <p
          style={{
            margin: '0.15rem 0 0 0',
            fontSize: '0.76rem',
            color: 'var(--color-text-muted)',
          }}
        >
          MVP operativo
        </p>
      </div>
    )}
  </header>
);

/* =========================================================
   SIDEBAR
========================================================= */

type SidebarProps = {
  activeModule: ActiveModule;
  onChangeModule: (module: ActiveModule) => void;
  isCompact: boolean;
  isMobileDrawer?: boolean;
  onCloseMobileDrawer?: () => void;
};

const Sidebar: React.FC<SidebarProps> = ({
  activeModule,
  onChangeModule,
  isCompact,
  isMobileDrawer = false,
  onCloseMobileDrawer,
}) => (
  <aside
    style={{
      width: isCompact ? '70px' : '240px',
      backgroundColor: '#0f172a',
      color: '#ffffff',
      display: 'flex',
      flexDirection: 'column',
      padding: isCompact ? '0.75rem 0.4rem' : '1rem 0.75rem',
      gap: '1rem',
      minHeight: isMobileDrawer ? '100%' : 'calc(100vh - 60px)',
      flexShrink: 0,
      boxSizing: 'border-box',
    }}
  >
    {/* =====================================================
        CABECERA DEL SIDEBAR
    ===================================================== */}
    {!isCompact && (
      <div
        style={{
          padding: '0.5rem 0.5rem 1rem 0.5rem',
          borderBottom: '1px solid rgba(255,255,255,0.12)',
        }}
      >
        <h2
          style={{
            margin: 0,
            fontSize: '1rem',
            color: '#f8fafc',
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

    {/* =====================================================
        NAVEGACIÓN
    ===================================================== */}
    <nav id={isMobileDrawer ? MOBILE_NAV_ID : undefined} aria-label="Navegación principal">
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
                onClick={() => {
                  onChangeModule(item.key);
                  if (isMobileDrawer && onCloseMobileDrawer) {
                    onCloseMobileDrawer();
                  }
                }}
                title={isCompact ? item.label : undefined}
                aria-current={isActive ? 'page' : undefined}
                style={{
                  width: '100%',
                  textAlign: 'left',
                  border: isActive
                    ? '1px solid #93c5fd'
                    : '1px solid rgba(255,255,255,0.06)',
                  backgroundColor: isActive ? '#1d4ed8' : '#172030',
                  color: '#ffffff',
                  borderRadius: 'var(--radius-md)',
                  padding: isCompact ? '0.6rem 0.5rem' : '0.65rem 0.75rem',
                  cursor: 'pointer',
                  transition: 'all var(--duration-fast) var(--easing-standard)',
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

/* =========================================================
   LAYOUT PRINCIPAL
========================================================= */

const LayoutBase: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  /* =======================================================
      ESTADOS PRINCIPALES
  ======================================================= */
  const [activeModule, setActiveModule] = useState<ActiveModule>(() =>
    getStoredActiveModule()
  );
  const [isCompactSidebar, setIsCompactSidebar] = useState(false);
  const [isMobileView, setIsMobileView] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const navigate = useNavigate();

  /* =======================================================
      CONTROL DE SESIÓN
  ======================================================= */
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

  /* =======================================================
      PERSISTENCIA DEL MÓDULO ACTIVO
  ======================================================= */
  useEffect(() => {
    localStorage.setItem(ACTIVE_MODULE_STORAGE_KEY, activeModule);
  }, [activeModule]);

  /* =======================================================
      MANEJO RESPONSIVE
  ======================================================= */
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;

      setIsCompactSidebar(width <= 1100);
      setIsMobileView(width <= 768);

      if (width > 768) {
        setIsMobileSidebarOpen(false);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  /* =======================================================
      BLOQUEO DE SCROLL CUANDO DRAWER ESTÁ ABIERTO
  ======================================================= */
  useEffect(() => {
    if (isMobileView && isMobileSidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileView, isMobileSidebarOpen]);

  useEffect(() => {
    if (!isMobileSidebarOpen) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsMobileSidebarOpen(false);
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isMobileSidebarOpen]);

  /* =======================================================
      FUNCIONES DE APOYO
  ======================================================= */
  const toggleMobileSidebar = () => {
    setIsMobileSidebarOpen((prev) => !prev);
  };

  const closeMobileSidebar = () => {
    setIsMobileSidebarOpen(false);
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: 'var(--color-surface-50)',
      }}
    >
      {/* ===================================================
          HEADER
      =================================================== */}
      <Header
        activeModule={activeModule}
        isMobileView={isMobileView}
        isMobileSidebarOpen={isMobileSidebarOpen}
        onToggleMobileSidebar={toggleMobileSidebar}
      />

      <div
        style={{
          display: 'flex',
          minHeight: 'calc(100vh - var(--header-height))',
        }}
      >
        {/* =================================================
            SIDEBAR ESCRITORIO / TABLET
        ================================================= */}
        {!isMobileView && (
          <Sidebar
            activeModule={activeModule}
            onChangeModule={setActiveModule}
            isCompact={isCompactSidebar}
          />
        )}

        {/* =================================================
            DRAWER MÓVIL - OVERLAY
        ================================================= */}
        {isMobileView && isMobileSidebarOpen && (
          <div
            onClick={closeMobileSidebar}
            onKeyDown={(event) => {
              if (event.key === 'Escape' || event.key === 'Enter') {
                closeMobileSidebar();
              }
            }}
            role="button"
            aria-label="Cerrar menú lateral"
            tabIndex={0}
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(17, 24, 39, 0.45)',
              zIndex: 45,
            }}
          />
        )}

        {/* =================================================
            DRAWER MÓVIL - PANEL
        ================================================= */}
        {isMobileView && (
          <div
            style={{
              position: 'fixed',
              top: '52px',
              left: 0,
              bottom: 0,
              width: '240px',
              transform: isMobileSidebarOpen
                ? 'translateX(0)'
                : 'translateX(-100%)',
              transition: 'transform var(--duration-normal) var(--easing-standard)',
              zIndex: 50,
              boxShadow: isMobileSidebarOpen
                ? '4px 0 16px rgba(0,0,0,0.18)'
                : 'none',
            }}
          >
            <Sidebar
              activeModule={activeModule}
              onChangeModule={setActiveModule}
              isCompact={false}
              isMobileDrawer
              onCloseMobileDrawer={closeMobileSidebar}
            />
          </div>
        )}

        {/* =================================================
            CONTENIDO PRINCIPAL
        ================================================= */}
        <main
          style={{
            flex: 1,
            padding: isMobileView ? '0.75rem' : '1rem 1.1rem',
            minWidth: 0,
          }}
        >
          {/* ===============================================
              CABECERA DEL MÓDULO ACTIVO
          =============================================== */}
          <Card
            variant="default"
            padding="md"
            style={{
              marginBottom: '0.85rem',
            }}
          >
            <SectionHeader
              title={moduleTitles[activeModule]}
              subtitle={moduleDescriptions[activeModule]}
            />
          </Card>

          {/* ===============================================
              CONTENEDOR DEL MÓDULO
          =============================================== */}
          <Card variant="default" padding={isMobileView ? 'sm' : 'md'}>
            {activeModule === 'dashboard' && <DashboardModule />}
            {activeModule === 'clientes' && <ClientesModule />}
            {activeModule === 'productos' && <ProductosModule />}
            {activeModule === 'ventas' && <VentasModule />}
            {activeModule === 'pagos' && <PagosModule />}
            {activeModule === 'inventario' && <InventarioModule />}
            {activeModule === 'creditos' && <CreditosModule />}
            {children && <div>{children}</div>}
          </Card>
        </main>
      </div>
    </div>
  );
};

export default LayoutBase;
