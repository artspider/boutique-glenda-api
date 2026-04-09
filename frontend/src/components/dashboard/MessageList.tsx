import React from 'react';

type MessageItem = {
  customerName: string;
  channel: 'WhatsApp' | 'Instagram';
  preview: string;
  time: string;
};

type MessageListProps = {
  items: MessageItem[];
};

const getChannelStyles = (channel: MessageItem['channel']) => {
  if (channel === 'WhatsApp') {
    return {
      backgroundColor: '#f6ffed',
      borderColor: '#b7eb8f',
      textColor: '#389e0d',
    };
  }

  return {
    backgroundColor: '#fff0f6',
    borderColor: '#ffadd2',
    textColor: '#c41d7f',
  };
};

const MessageList: React.FC<MessageListProps> = ({ items }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
      {items.map((item, index) => {
        const channelStyles = getChannelStyles(item.channel);

        return (
          <div
            key={index}
            style={{
              border: '1px solid #f0f0f0',
              borderRadius: '10px',
              padding: '0.85rem',
              backgroundColor: '#ffffff',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: '0.75rem',
                marginBottom: '0.5rem',
              }}
            >
              <strong style={{ color: '#262626' }}>{item.customerName}</strong>

              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  padding: '0.18rem 0.55rem',
                  borderRadius: '999px',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  backgroundColor: channelStyles.backgroundColor,
                  border: `1px solid ${channelStyles.borderColor}`,
                  color: channelStyles.textColor,
                }}
              >
                {item.channel}
              </span>
            </div>

            <p
              style={{
                margin: 0,
                marginBottom: '0.45rem',
                color: '#595959',
                fontSize: '0.93rem',
              }}
            >
              {item.preview}
            </p>

            <p
              style={{
                margin: 0,
                fontSize: '0.8rem',
                color: '#8c8c8c',
              }}
            >
              {item.time}
            </p>
          </div>
        );
      })}
    </div>
  );
};

export default MessageList;