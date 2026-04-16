import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Package, SquareX } from "lucide-react";
import BaseTable from "./BaseTable";
import ConfirmDialog from "../Models/ConfirmDialog";
import "./SalesProductBatchTable.css";

// Helper
function calcTotalStock(batches = []) {
  return batches.reduce((sum, b) => sum + Number(b.stock_amount || 0), 0);
}

function LowStock({ stock, minStock }) {
    const isLowStock = stock <= minStock;
  return (
    <span
      style={{
        color: isLowStock ? "#DC2626" : "inherit",
        fontWeight: isLowStock ? "bold" : "normal",
      }}
    >
      {stock}
    </span>
  );
}

function ActionButtons({ onViewBatches, onDelete }) {
  return (
    <div className="action-buttons">
      <button
        className="action-btn view-btn"
        onClick={onViewBatches}
        title="View Batches"
      >
        <Package size={23} />
      </button>
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
const ProductTable = ({ items = [], onDelete }) => {
  const navigate = useNavigate();
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    productId: null,
  });

  const grandTotalStock = useMemo(() => {
    return items.reduce((total, item) => {
      const currentItemStock = calcTotalStock(item.inventory_batches);
      return total + currentItemStock;
    }, 0);
  }, [items]);

  const columns = [
    { key: "id", label: "ID" },
    { key: "name", label: "Item" },
    { key: "brand", label: "Brand", render: (row) => row.brand ?? "—" },
    { key: "category", label: "Category", render: (row) => row.categories.name },
    {
      key: "stock",
      label: "Stock",
      render: (row) => (
        <LowStock
          stock={calcTotalStock(row.inventory_batches)}
          minStock={row.min_stock}
        />
      ),
    },
    {
      key: "price",
      label: "Unit Price (THB)",
      render: (row) =>
        Number(row.price).toLocaleString("th-TH", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }),
    },
    { key: "qr_code", label: "Item QR", render: (row) => row.qr_code ?? "—" },
    {
      key: "actions",
      label: "Actions",
      render: (row) => (
        <ActionButtons
          onViewBatches={() => navigate(`/inventory/${row.id}/batches`)}
          onDelete={() => setConfirmDialog({ isOpen: true, productId: row.id })}
        />
      ),
    },
  ];

  const footer = [
    {
      label: "Total Stock",
      value: `${grandTotalStock.toLocaleString("th-TH")} pcs`,
      highlight: true,
    },
  ];

  async function handleConfirmDelete() {
    await onDelete(confirmDialog.productId);
    setConfirmDialog({ isOpen: false, productId: null });
  }

  return (
    <>
      <BaseTable
        columns={columns}
        data={items}
        rowKey="id"
        rowText="No items found."
        footer={footer}
        pageSize={20}
      />

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title="Delete Product?"
        message="This will also delete all batches. This action cannot be undone."
        confirmLabel="Delete"
        onConfirm={handleConfirmDelete}
        onCancel={() => setConfirmDialog({ isOpen: false, productId: null })}
      />
    </>
  );
};

export default ProductTable;
