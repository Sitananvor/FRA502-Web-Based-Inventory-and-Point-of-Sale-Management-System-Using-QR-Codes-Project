import { useState } from "react";
import { SquareX, ArrowLeft } from "lucide-react";
import BaseTable from "./BaseTable";
import ConfirmDialog from "../Models/ConfirmDialog";
import "./SalesProductBatchTable.css";

// Helpers
function formatDate(dateStr) {
  if (!dateStr) return "—";
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(dateStr));
}

function ExpiryCell({ date }) {
  if (!date) return <span style={{ color: "#94a3b8" }}>—</span>;

  const timeDiff = new Date(date) - new Date();
  const daysLeft = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));

  let statusStyle = { color: "inherit", fontWeight: "normal" };
  if (daysLeft < 0) {
    statusStyle = { color: "#DC2626", fontWeight: "bold" };
  } else if (daysLeft <= 30) {
    statusStyle = { color: "#F59E0B", fontWeight: "bold" };
  }

  return <span style={statusStyle}>{formatDate(date)}</span>;
}

function ActionButtons({ onDelete }) {
  return (
    <div className="action-buttons">
      <button
        className="action-btn delete-btn"
        onClick={onDelete}
        title="Delete"
      >
        <SquareX size={23} />
      </button>
    </div>
  );
}

// Main Component
const BatchTable = ({
  items = [],
  productName = "Product",
  productBrand,
  onBack,
  onDelete,
}) => {
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    batchId: null,
  });

  const totalStock = items.reduce(
    (sum, b) => sum + Number(b.stock_amount || 0),
    0,
  );

  const columns = [
    {
      key: "batch_number",
      label: "Batch No.",
      render: (row) => row.batch_number ?? "—",
    },
    {
      key: "batch_qr",
      label: "Batch QR",
      render: (row) => row.batch_qr ?? "—",
    },
    { key: "stock_amount", label: "Stock" },
    {
      key: "expiry_date",
      label: "Expiry Date",
      render: (row) => <ExpiryCell date={row.expiry_date} />,
    },
    {
      key: "received_date",
      label: "Received",
      render: (row) => formatDate(row.received_date),
    },
    {
      key: "actions",
      label: "Actions",
      render: (row) => (
        <ActionButtons
          onDelete={() => setConfirmDialog({ isOpen: true, batchId: row.id })}
        />
      ),
    },
  ];

  const footer = [
    { label: "Total Stock", value: `${totalStock} pcs`, highlight: true },
  ];

  async function handleConfirmDelete() {
    await onDelete(confirmDialog.batchId);
    setConfirmDialog({ isOpen: false, batchId: null });
  }

  return (
    <div className="batch-page-container">
      <div className="batch-page-header">
        <div className="batch-header-left">
          <button className="back-btn" onClick={onBack} title="Go Back">
            <ArrowLeft size={25} strokeWidth={3}/>
          </button>
          <h2 className="product-title">
            {productName} {productBrand ? `(${productBrand})` : ""}
          </h2>
        </div>
      </div>

      <BaseTable
        columns={columns}
        data={items}
        rowKey="id"
        rowText="No batches found."
        footer={footer}
        pageSize={20}
      />

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title="Delete This Batch?"
        message="Stock from this batch will be removed. This action cannot be undone."
        confirmLabel="Delete"
        onConfirm={handleConfirmDelete}
        onCancel={() => setConfirmDialog({ isOpen: false, batchId: null })}
      />
    </div>
  );
};

export default BatchTable;
