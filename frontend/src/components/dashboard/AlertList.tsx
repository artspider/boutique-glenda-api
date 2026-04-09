import React from 'react';

type AlertItem = {
  title: string;
  description: string;
  tone?: 'danger' | 'warning' | 'info';
};

type AlertListProps = {
  items: AlertItem[];
};

const toneStyles = {
  danger: {
    backgroundColor: '#fff1f0',
    borderColor: '#ffa39e',
    titleColor: '#cf1322',
  },
  warning: {
    backgroundColor: '#fffbe6',
    borderColor: '#ffe58f',
    titleColor: '#ad6800',
  },
  info: {
    backgroundColor: '#e6f4ff',
    borderColor: '#91caff',
    titleColor: '#0958d9',
  },
};

const AlertList: React.FC<AlertListProps> = ({ items }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      {items.map((item, index) => {
        const tone = item.tone ?? 'warning';
        const styles = toneStyles[tone];

        return (
          <div
            key={index}
            style={{
              backgroundColor: styles.backgroundColor,
              border: `1px solid ${styles.borderColor}`,
              borderRadius: '10px',
              padding: '0.85rem',
            }}
          >
            <p
              style={{
                margin: 0,
                marginBottom: '0.35rem',
                fontWeight: 600,
                color: styles.titleColor,
              }}
            >
              {item.title}
            </p>
            <p style={{ margin: 0, color: '#595959', fontSize: '0.92rem' }}>
              {item.description}
            </p>
          </div>
        );
      })}
    </div>
  );
};

export default AlertList;