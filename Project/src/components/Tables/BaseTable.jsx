import { useState, useEffect, useMemo } from "react";
import { ChevronLeft, ChevronsLeft, ChevronRight, ChevronsRight } from "lucide-react";
import "./BaseTable.css";

// Sub-components
function EmptyRow({ colSpan, rowText }) {
  return (
    <tr>
      <td colSpan={colSpan} className="empty-row">
        {rowText}
      </td>
    </tr>
  );
}

function getPages(totalPages, currentPage, range = 2) {
  return Array.from({ length: totalPages }, (_, i) => i + 1)
    .filter(
      (p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= range,
    )
    .reduce((acc, p, idx, arr) => {
      if (idx > 0 && p - arr[idx - 1] > 1) acc.push("...");
      acc.push(p);
      return acc;
    }, []);
}

function Pagination({
  currentPage,
  totalPages,
  totalRows,
  pageSize,
  onPageChange,
}) {
  if (totalPages <= 1) return null;

  const from = (currentPage - 1) * pageSize + 1;
  const to = Math.min(currentPage * pageSize, totalRows);

  return (
    <div className="pagination">
      <span className="pagination-info">
        {from} - {to} of {totalRows}
      </span>
      <div className="pagination-controls">
        <button
          className="page-btn"
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
        >
          <ChevronsLeft size={15} />
        </button>
        <button
          className="page-btn"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          <ChevronLeft size={15} />
        </button>

        {getPages(totalPages, currentPage).map((p, i) =>
          p === "..." ? (
            <span key={`ellipsis-${i}`} className="page-ellipsis">
              …
            </span>
          ) : (
            <button
              key={p}
              className={`page-btn ${p === currentPage ? "page-active" : ""}`}
              onClick={() => onPageChange(p)}
            >
              {p}
            </button>
          ),
        )}

        <button
          className="page-btn"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          <ChevronRight size={15} />
        </button>
        <button
          className="page-btn"
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
        >
          <ChevronsRight size={15} />
        </button>
      </div>
    </div>
  );
}

// Main Component
/**
 * @param {Array} columns - [{ key, label, render? }]
 * @param {Array}  data
 * @param {string} rowKey
 * @param {string} rowText
 * @param {Array}  footer
 * @param {number} pageSize
 */
const BaseTable = ({
  columns = [],
  data = [],
  rowKey = "id",
  rowText = "No data available",
  footer = [],
  pageSize = 15,
}) => {
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    setCurrentPage(1);
  }, [data]);

  const usePagination = pageSize > 0;
  const totalPages = usePagination ? Math.ceil(data.length / pageSize) : 1;
  const visibleData = useMemo(() => {
    return usePagination
      ? data.slice((currentPage - 1) * pageSize, currentPage * pageSize)
      : data;
  }, [data, currentPage, pageSize, usePagination]);

  return (
    <>
      <div className="base-table-container">
        <table className="base-table">
          <thead className="base-table-head">
            <tr>
              {columns.map((col) => (
                <th key={col.key}>{col.label}</th>
              ))}
            </tr>
          </thead>

          <tbody className="base-table-body">
            {visibleData.length > 0 ? (
              visibleData.map((row) => (
                <tr key={row[rowKey]}>
                  {columns.map((col) => (
                    <td key={col.key}>
                      {col.render ? col.render(row) : (row[col.key] ?? "—")}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <EmptyRow colSpan={columns.length} rowText={rowText} />
            )}
          </tbody>

          {footer.length > 0 && (
            <tfoot className="base-table-footer">
              <tr>
                <th colSpan={columns.length}>
                  <div className="footer-row">
                    {footer.map((stat) => (
                      <div key={stat.label} className="footer-stat">
                        <span className="footer-label">{stat.label}:</span>
                        <span
                          className={`footer-value ${stat.highlight ? "grand-total-cell" : ""}`}
                        >
                          {` ${stat.value}`}
                        </span>
                      </div>
                    ))}
                  </div>
                </th>
              </tr>
            </tfoot>
          )}
        </table>
      </div>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalRows={data.length}
        pageSize={pageSize}
        onPageChange={setCurrentPage}
      />
    </>
  );
};

export default BaseTable;
