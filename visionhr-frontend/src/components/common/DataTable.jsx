import Card from './Card';
import Spinner from './Spinner';
import EmptyState from './EmptyState';

export default function DataTable({
  columns,
  data,
  isLoading,
  emptyTitle = 'No data found',
  emptyDescription = 'There is no data to display right now.',
  onRowClick,
}) {
  return (
    <Card className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-canvas border-b border-line">
            <tr>
              {columns.map((col, i) => (
                <th
                  key={i}
                  className={`px-5 py-3 text-xs font-medium uppercase tracking-wider text-ink-faint ${
                    col.className || ''
                  }`}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={columns.length} className="p-8 text-center">
                  <Spinner className="justify-center" />
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="p-8">
                  <EmptyState title={emptyTitle} description={emptyDescription} />
                </td>
              </tr>
            ) : (
              data.map((row, rowIndex) => (
                <tr
                  key={row._id || rowIndex}
                  onClick={() => onRowClick?.(row)}
                  className={`border-b border-line last:border-0 ${
                    onRowClick ? 'cursor-pointer table-row-hover' : ''
                  }`}
                >
                  {columns.map((col, colIndex) => (
                    <td
                      key={colIndex}
                      className={`px-5 py-3.5 text-ink-soft ${
                        col.cellClassName || ''
                      }`}
                    >
                      {col.accessor ? row[col.accessor] : col.render?.(row)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
