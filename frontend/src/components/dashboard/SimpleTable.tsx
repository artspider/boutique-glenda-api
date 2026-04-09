import React from 'react';

type Column<T> = {
  key: keyof T;
  header: string;
};

type SimpleTableProps<T extends Record<string, React.ReactNode>> = {
  columns: readonly Column<T>[];
  rows: T[];
};

function SimpleTable<T extends Record<string, React.ReactNode>>({
  columns,
  rows,
}: SimpleTableProps<T>) {
  return (
    <div style={{ overflowX: 'auto' }}>
      <table
        style={{
          width: '100%',
          borderCollapse: 'collapse',
        }}
      >
        <thead>
          <tr>
            {columns.map((column) => (
              <th
                key={String(column.key)}
                style={{
                  textAlign: 'left',
                  padding: '0.75rem',
                  borderBottom: '1px solid #f0f0f0',
                  fontSize: '0.875rem',
                  color: '#595959',
                }}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {rows.map((row, index) => (
            <tr key={index}>
              {columns.map((column) => (
                <td
                  key={String(column.key)}
                  style={{
                    padding: '0.75rem',
                    borderBottom: '1px solid #f5f5f5',
                    fontSize: '0.95rem',
                    color: '#262626',
                  }}
                >
                  {row[column.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default SimpleTable;