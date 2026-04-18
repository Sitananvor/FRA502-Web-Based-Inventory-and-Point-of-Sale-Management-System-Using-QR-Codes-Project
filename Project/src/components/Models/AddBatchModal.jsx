import { useState } from "react";
import { X } from "lucide-react";
import { FormField } from ".././Form";
import { supabase } from "../../lib/supabase";
import "./AddModal.css";

const INITIAL_FORM = {
  batch_number: "",
  batch_qr: "",
  stock_amount: "",
  received_date: "",
  expiry_date: "",
};

const AddBatchModal = ({
  isOpen,
  productName = "Product",
  productBrand,
  productId,
  onClose,
  onSuccess,
}) => {
  const [form, setForm] = useState(INITIAL_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validate = () => {
    const { stock_amount, received_date, expiry_date } = form;
    const newErrors = {};
    if (!stock_amount || isNaN(stock_amount) || Number(stock_amount) < 0) {
      newErrors.stock_amount = "Please enter a valid stock amount";
    }
    if (!received_date) {
      newErrors.received_date = "Please select a received date";
    }
    if (expiry_date && received_date && expiry_date < received_date) {
      newErrors.expiry_date = "Please select a received date first";
    }
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0)
      return setErrors(validationErrors);

    setIsSubmitting(true);
    try {
      const {
        batch_number,
        batch_qr,
        stock_amount,
        received_date,
        expiry_date,
      } = form;
      const payload = {
        product_id: productId,
        stock_amount: Number(stock_amount),
        batch_number: batch_number || null,
        batch_qr: batch_qr || null,
        received_date: received_date || null,
        expiry_date: expiry_date || null,
      };

      const { error } = await supabase
        .from("inventory_batches")
        .insert([payload]);
      if (error) throw error;

      setForm(INITIAL_FORM);
      setErrors({});
      onSuccess?.();
      onClose();
    } catch (err) {
      console.error("Error:", err);
      alert("Failed to add batch. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="modal-overlay"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="modal-container">
        <div className="modal-header">
          <div>
            <h2 className="modal-title">Add New Batch</h2>
            <p className="modal-subtitle">
              {productName} {productBrand && `(${productBrand})`}
            </p>
          </div>
          <button className="modal-close-btn" onClick={onClose} type="button">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-grid">
            <FormField label="Batch Number">
              <input
                className="form-input"
                type="text"
                name="batch_number"
                value={form.batch_number}
                onChange={handleChange}
                placeholder="e.g. BT-2026-001"
              />
            </FormField>
            <FormField label="Batch QR">
              <input
                className="form-input"
                type="text"
                name="batch_qr"
                value={form.batch_qr}
                onChange={handleChange}
                placeholder="Batch QR code"
              />
            </FormField>
            <FormField
              label="Stock Quantity"
              required
              error={errors.stock_amount}
            >
              <input
                className={`form-input ${errors.stock_amount ? "input-error" : ""}`}
                type="number"
                name="stock_amount"
                value={form.stock_amount}
                onChange={handleChange}
                placeholder="0"
                min="0"
              />
            </FormField>
            <FormField
              label="Received Date"
              required
              error={errors.received_date}
            >
              <input
                className={`form-input ${errors.received_date ? "input-error" : ""}`}
                type="date"
                name="received_date"
                value={form.received_date}
                onChange={handleChange}
              />
            </FormField>
            <FormField label="Expiry Date" error={errors.expiry_date}>
              <input
                className={`form-input ${errors.expiry_date ? "input-error" : ""}`}
                type="date"
                name="expiry_date"
                value={form.expiry_date}
                onChange={handleChange}
              />
            </FormField>
          </div>
          <div className="modal-footer">
            <button
              type="button"
              className="btn-cancel"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-confirm"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Saving..." : "Add"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddBatchModal;