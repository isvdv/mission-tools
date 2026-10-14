export function Table({
  headers,
  rows,
  emptyLabel = 'NO DATA AVAILABLE'
}: {
  headers: string[];
  rows: React.ReactNode[][];
  emptyLabel?: string;
}) {
  return (
    <div className="overflow-x-auto rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface)]">
      <table className="w-full min-w-[680px] text-left text-sm">
        <thead className="border-b border-[var(--border)] bg-black/35 text-[var(--text-secondary)]">
          <tr>
            {headers.map((header) => (
              <th key={header} className="px-4 py-3 font-mono text-xs font-medium uppercase">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length ? rows.map((row, index) => (
            <tr key={index} className="border-t border-[var(--border)] transition duration-150 hover:bg-[var(--surface-secondary)]">
              {row.map((cell, cellIndex) => (
                <td key={cellIndex} className="px-4 py-3 align-top text-[var(--text-primary)]">
                  {cell}
                </td>
              ))}
            </tr>
          )) : (
            <tr>
              <td colSpan={headers.length} className="px-4 py-8 text-center">
                <span className="font-mono text-xs text-[var(--text-muted)]">{emptyLabel}</span>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
