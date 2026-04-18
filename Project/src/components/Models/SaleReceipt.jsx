import { Check } from "lucide-react";
import "./SaleReceipt.css";

// Helpers
function formatPrice(value) {
  return Number(value).toLocaleString("th-TH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function formatDateTime(date) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Bangkok"
  }).format(date);
}

// Sub-components
function ReceiptHeader({ saleId, createdAt }) {
  return (
    <div className="receipt-header">
      <div className="receipt-check-icon" aria-hidden="true">
        <Check size={18} />
      </div>
      <h2 className="receipt-title">Checkout Successful</h2>
      <p className="receipt-meta">
        <span className="receipt-bill-no">Bill #{saleId}</span>
        <span>{formatDateTime(createdAt)}</span>
      </p>
    </div>
  );
}

function ReceiptItemRow({ item }) {
  const rowTotal = Number(item.price) * item.quantity;
  return (
    <tr>
      <td className="receipt-item-name">{item.name}</td>
      <td className="receipt-item-qty">×{item.quantity}</td>
      <td className="receipt-item-price">{formatPrice(rowTotal)}</td>
    </tr>
  );
}

function ReceiptTable({ items }) {
  return (
    <table className="receipt-table">
      <thead>
        <tr>
          <th>Item</th>
          <th>Quantity</th>
          <th>Amount (THB)</th>
        </tr>
      </thead>
      <tbody>
        {items.map((item) => (
          <ReceiptItemRow key={item.itemKey} item={item} />
        ))}
      </tbody>
    </table>
  );
}

function ReceiptFooter({ totalQuantity, totalAmount, onClose }) {
  return (
    <div className="receipt-footer">
      <div className="receipt-summary">
        <div className="receipt-summary-row">
          <span>Total Items</span>
          <span>
            {totalQuantity} {totalQuantity > 1 ? "pcs" : "pc"}
          </span>
        </div>
        <div className="receipt-summary-row total">
          <span>Total</span>
          <span className="receipt-grand-total">
            ฿{formatPrice(totalAmount)}
          </span>
        </div>
      </div>
      <button className="receipt-scan-btn" onClick={onClose}>
        Done
      </button>
    </div>
  );
}

// Core
/**
 * SaleReceipt
 * @param {Object}   receipt       
 * @param {number}   receipt.saleId
 * @param {Date}     receipt.createdAt
 * @param {Array}    receipt.items
 * @param {function} onClose        
 */
function SaleReceipt({ receipt, onClose }) {
  if (!receipt) return null;

  const { saleId, createdAt, items } = receipt;
  const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalAmount = items.reduce(
    (sum, item) => sum + Number(item.price) * item.quantity,
    0,
  );

  function handleBackdropClick(e) {
    if (e.target === e.currentTarget) onClose();
  }

  return (
    <div
      className="receipt-backdrop"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
    >
      <div className="receipt-modal">
        <ReceiptHeader saleId={saleId} createdAt={createdAt} />
        <div className="receipt-body">
          <ReceiptTable items={items} />
        </div>
        <ReceiptFooter
          totalQuantity={totalQuantity}
          totalAmount={totalAmount}
          onClose={onClose}
        />
      </div>
    </div>
  );
}

export default SaleReceipt;