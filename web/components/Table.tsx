export function Table({ headers, rows }: { headers: string[]; rows: React.ReactNode[][] }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-white/10">
      <table className="w-full min-w-[640px] text-left text-sm">
        <thead className="bg-white/10 text-slate-300">
          <tr>{headers.map((header) => <th key={header} className="px-4 py-3 font-medium">{header}</th>)}</tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={index} className="border-t border-white/10">
              {row.map((cell, cellIndex) => <td key={cellIndex} className="px-4 py-3 text-slate-200">{cell}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
