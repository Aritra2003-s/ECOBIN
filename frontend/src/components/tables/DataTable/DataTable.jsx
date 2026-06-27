import EmptyState from '../../common/EmptyState/EmptyState';
import Loader from '../../common/Loader/Loader';
import './DataTable.css'; // Import the CSS file

export default function DataTable({ columns, rows, loading, emptyTitle, emptyMessage, keyField = '_id' }) {
  if (loading) return <Loader />;
  if (!rows?.length) return <EmptyState title={emptyTitle} message={emptyMessage} />;

  return (
    <div className="data-table-wrapper">
      <table className="data-table">
        <thead>
          <tr className="data-table-head-row">
            {columns.map((col) => (
              <th key={col.key} className="data-table-header-cell">
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={row[keyField] || i} className="data-table-row">
              {columns.map((col) => (
                <td key={col.key} className="data-table-cell">
                  {col.render ? col.render(row[col.key], row) : (row[col.key] ?? '—')}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}