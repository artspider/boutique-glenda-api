import React, { useEffect, useState } from 'react';
import ClientesModule from './modules/ClientesModule';
import ProductosModule from './modules/ProductosModule';
import VentasModule from './modules/VentasModule';
import PagosModule from './modules/PagosModule';
import InventarioModule from './modules/InventarioModule';
import CreditosModule from './modules/CreditosModule';
import { useNavigate } from 'react-router-dom';
import { getAccessToken } from '../services/authService';

type ActiveModule =
  | 'clientes'
  | 'productos'
  | 'ventas'
  | 'pagos'
  | 'inventario'
  | 'creditos';

const Header: React.FC = () => (
  <header style={{ padding: '1rem', backgroundColor: '#eee' }}>
    <h1>Boutique Glenda</h1>
  </header>
);

type NavbarProps = {
  activeModule: ActiveModule;
  onChangeModule: (module: ActiveModule) => void;
};

const Navbar: React.FC<NavbarProps> = ({ activeModule, onChangeModule }) => (
  <nav
    style={{
      padding: '1rem',
      backgroundColor: '#ddd',
      minWidth: '200px',
      flexShrink: 0,
    }}
  >
    <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
      <li>
        <button type="button" onClick={() => onChangeModule('clientes')}>
          Clientes {activeModule === 'clientes' ? '•' : ''}
        </button>
      </li>
      <li>
        <button type="button" onClick={() => onChangeModule('productos')}>
          Productos {activeModule === 'productos' ? '•' : ''}
        </button>
      </li>
      <li>
        <button type="button" onClick={() => onChangeModule('ventas')}>
          Ventas {activeModule === 'ventas' ? '•' : ''}
        </button>
      </li>
      <li>
        <button type="button" onClick={() => onChangeModule('pagos')}>
          Pagos {activeModule === 'pagos' ? '•' : ''}
        </button>
      </li>
      <li>
        <button type="button" onClick={() => onChangeModule('inventario')}>
          Inventario {activeModule === 'inventario' ? '•' : ''}
        </button>
      </li>
      <li>
        <button type="button" onClick={() => onChangeModule('creditos')}>
          Créditos {activeModule === 'creditos' ? '•' : ''}
        </button>
      </li>
    </ul>
  </nav>
);

const LayoutBase: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const [activeModule, setActiveModule] = useState<ActiveModule>('clientes');
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
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header />
      <div style={{ display: 'flex', flex: 1, flexWrap: 'wrap' }}>
        <Navbar activeModule={activeModule} onChangeModule={setActiveModule} />
        <main
          style={{
            flex: 1,
            padding: '1rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
            minWidth: '0',
          }}
        >
          {activeModule === 'clientes' && <ClientesModule />}
          {activeModule === 'productos' && <ProductosModule />}
          {activeModule === 'ventas' && <VentasModule />}
          {activeModule === 'pagos' && <PagosModule />}
          {activeModule === 'inventario' && <InventarioModule />}
          {activeModule === 'creditos' && <CreditosModule />}
          {children && <div>{children}</div>}
        </main>
      </div>
    </div>
  );
};

export default LayoutBase;