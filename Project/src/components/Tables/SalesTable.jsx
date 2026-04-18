import { useState } from "react";
import { SquareX } from "lucide-react";
import BaseTable from "./BaseTable";
import ConfirmDialog from "../Models/ConfirmDialog";
import "./SalesProductBatchTable.css";

// Helpers
function formatDateTime(dateStr) {
  if (!dateStr) return "—";
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Bangkok"
  }).format(new Date(dateStr));
}

function ActionButtons({ onDelete }) {
  return (
    <div className="action-buttons">
      <button
        className="action-btn delete-btn"
        onClick={onDelete}
      >
        <SquareX size={23} strokeWidth={2} />
      </button>
    </div>
  );
}

// Main Component
const SalesTable = ({ sales = [], onDelete }) => {
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    saleId: null,
  });

  const grandTotal = sales.reduce(
    (sum, sale) => sum + Number(sale.total_amount || 0),
    0
  );

  const columns = [
    {
      key: "id",
      label: "Receipt ID",
      render: (row) => `#${row.id}`,
    },
    {
      key: "created_at",
      label: "Date & Time",
      render: (row) => formatDateTime(row.created_at),
    },
    {
      key: "total_amount",
      label: "Total Amount (THB)",
      render: (row) =>
        Number(row.total_amount).toLocaleString("th-TH", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }),
    },
    {
      key: "actions",
      label: "Actions",
      render: (row) => (
        <ActionButtons
          onDelete={() => setConfirmDialog({ isOpen: true, saleId: row.id })}
        />
      ),
    },
  ];

  const footer = [
    {
      label: "Total Revenue",
      value: `${grandTotal.toLocaleString("th-TH", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })} THB`,
      highlight: true,
    },
  ];

  async function handleConfirmDelete() {
    await onDelete(confirmDialog.saleId);
    setConfirmDialog({ isOpen: false, saleId: null });
  }

  return (
    <div className="batch-page-container">
      <div className="batch-page-header">
        <div className="batch-header-left">
          <h2 className="sales-history-title">Sales History</h2>
        </div>
      </div>

      <BaseTable
        columns={columns}
        data={sales} 
        rowKey="id"
        rowText="No sales records found."
        footer={footer}
        pageSize={15}
      />

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title="Delete Receipt?"
        message="Are you sure you want to delete this receipt? This action cannot be undone."
        confirmLabel="Delete"
        onConfirm={handleConfirmDelete}
        onCancel={() => setConfirmDialog({ isOpen: false, saleId: null })}
      />
    </div>
  );
};

export default SalesTable;