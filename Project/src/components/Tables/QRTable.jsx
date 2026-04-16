import BaseTable from "./BaseTable";
import "./QRtable.css";

// Quantity Control
const QuantityControl = ({ item, onQuantityChange }) => {
  return (
    <div className="quantity-control">
      <button
        className="qty-btn minus-btn"
        onClick={() => onQuantityChange(item.itemKey, item.quantity - 1)}
      >
        −
      </button>
      <input
        type="number"
        className="quantity-input"
        value={item.quantity}
        min={0}
        max={item.maxStock}
        onChange={(e) => onQuantityChange(item.itemKey, Number(e.target.value))}
      />
      <button
        className="qty-btn plus-btn"
        onClick={() => onQuantityChange(item.itemKey, item.quantity + 1)}
        disabled={item.quantity >= item.maxStock}
      >
        +
      </button>
    </div>
  );
};

// Main Component
function QRTable({ items = [], onQuantityChange }) {
  const totalQuantity = items.reduce(
    (sum, row) => sum + Number(row.quantity ?? 0),
    0,
  );
  const totalPrice = items.reduce(
    (sum, row) => sum + Number(row.price ?? 0) * Number(row.quantity ?? 0),
    0,
  );

  const columns = [
    { key: "name", label: "Item" },
    {
      key: "quantity",
      label: "Quantity",
      render: (row) => (
        <QuantityControl item={row} onQuantityChange={onQuantityChange} />
      ),
    },
    {
      key: "price",
      label: "Unit Price (THB)",
      render: (row) => Number(row.price).toLocaleString(),
    },
    {
      key: "total",
      label: "Amount (THB)",
      render: (row) =>
        (Number(row.price ?? 0) * Number(row.quantity ?? 0)).toLocaleString(
          undefined,
          { minimumFractionDigits: 2, maximumFractionDigits: 2 },
        ),
    },
  ];

  const footer = [
    { label: "Total Items", value: totalQuantity, highlight: true,},
    {
      label: "Total (THB)",
      value: totalPrice.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }),
      highlight: true,
    },
  ];

  return (
    <BaseTable
      columns={columns}
      data={items}
      rowKey="itemKey"
      rowText="Scan QR Code to add items"
      footer={footer}
    />
  );
}

export default QRTable;