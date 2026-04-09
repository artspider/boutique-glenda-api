import React from 'react';
import { formatCurrency } from '../../utils/formatters';

type FeaturedProductCardProps = {
  name: string;
  category: string;
  unitsSold: number;
  revenue: number;
};

const FeaturedProductCard: React.FC<FeaturedProductCardProps> = ({
  name,
  category,
  unitsSold,
  revenue,
}) => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem',
        padding: '0.5rem 0',
      }}
    >
      <div>
        <p
          style={{
            margin: 0,
            fontSize: '0.9rem',
            color: '#8c8c8c',
          }}
        >
          Producto destacado
        </p>
        <h4
          style={{
            margin: '0.25rem 0 0 0',
            fontSize: '1.15rem',
            color: '#262626',
          }}
        >
          {name}
        </h4>
        <p
          style={{
            margin: '0.25rem 0 0 0',
            color: '#595959',
          }}
        >
          Categoría: {category}
        </p>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '0.75rem',
        }}
      >
        <div
          style={{
            backgroundColor: '#fafafa',
            border: '1px solid #f0f0f0',
            borderRadius: '10px',
            padding: '0.75rem',
          }}
        >
          <p style={{ margin: 0, fontSize: '0.85rem', color: '#8c8c8c' }}>
            Unidades vendidas
          </p>
          <p
            style={{
              margin: '0.35rem 0 0 0',
              fontSize: '1.1rem',
              fontWeight: 600,
              color: '#262626',
            }}
          >
            {unitsSold}
          </p>
        </div>

        <div
          style={{
            backgroundColor: '#f6ffed',
            border: '1px solid #d9f7be',
            borderRadius: '10px',
            padding: '0.75rem',
          }}
        >
          <p style={{ margin: 0, fontSize: '0.85rem', color: '#8c8c8c' }}>
            Ingreso generado
          </p>
          <p
            style={{
              margin: '0.35rem 0 0 0',
              fontSize: '1.1rem',
              fontWeight: 600,
              color: '#389e0d',
            }}
          >
            {formatCurrency(revenue)}
          </p>
        </div>
      </div>
    </div>
  );
};

export default FeaturedProductCard;