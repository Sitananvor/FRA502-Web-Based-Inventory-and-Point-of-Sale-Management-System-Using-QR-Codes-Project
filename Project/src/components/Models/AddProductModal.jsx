import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { FormField } from "../Form";
import { supabase } from "../../lib/supabase";
import "./AddModal.css";

const INITIAL_FORM = {
  name: "", brand: "", category_id: "", price: "", min_stock: "", qr_code: "",
};

const AddProductModal = ({ isOpen, onClose, onSuccess }) => {
  const [form, setForm] = useState(INITIAL_FORM);
  const [categories, setCategories] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!isOpen) return;
    const fetchCategories = async () => {
      const { data, error } = await supabase
        .from("categories")
        .select("id, name")
        .order("name", { ascending: true });
      if (!error) setCategories(data ?? []);
    };
    fetchCategories();
  }, [isOpen, supabase]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validate = () => {
    const { name, category_id, price, min_stock } = form;
    const newErrors = {};
    if (!name.trim()) newErrors.name = "Product name is required";
    if (!category_id) newErrors.category_id = "Please select a category";
    if (!price || isNaN(price) || Number(price) < 0) newErrors.price = "Please enter a valid price";
    if (!min_stock || isNaN(min_stock) || Number(min_stock) < 0) newErrors.min_stock = "Please enter a valid min stock";
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) return setErrors(validationErrors);
    setIsSubmitting(true);
    try {
      const { name, brand, category_id, price, min_stock, qr_code } = form;
      const payload = {
        name: name.trim(),
        brand: brand.trim() || null,
        category_id: Number(category_id),
        price: Number(price),
        min_stock: Number(min_stock),
        qr_code: qr_code.trim() || null,
      };

      const { error } = await supabase.from("products").insert([payload]);
      if (error) throw error;

      setForm(INITIAL_FORM);
      setErrors({});
      onSuccess?.();
      onClose();
    } catch (err) {
      console.error("Error:", err);
      alert("Failed to add product. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-container">
        <div className="modal-header">
          <div>
            <h2 className="modal-title">Add New Product</h2>
            <p className="modal-subtitle">Enter the details of the product to add</p>
          </div>
          <button className="modal-close-btn" onClick={onClose} type="button">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-grid">
            <FormField label="Product Name" required error={errors.name}>
              <input 
                className={`form-input ${errors.name ? "input-error" : ""}`} 
                type="text" 
                name="name" 
                value={form.name} 
                onChange={handleChange} 
                placeholder="e.g. Paracetamol 500mg" 
              />
            </FormField>
            
            <FormField label="Brand">
              <input 
                className="form-input" 
                type="text" 
                name="brand" 
                value={form.brand} 
                onChange={handleChange} 
                placeholder="e.g. Tylenol" 
              />
            </FormField>
            
            <FormField label="Category" required error={errors.category_id}>
              <select 
                className={`form-input form-select ${errors.category_id ? "input-error" : ""}`} 
                name="category_id" 
                value={form.category_id} 
                onChange={handleChange}
              >
                <option value="">Select Category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </FormField>
            
            <FormField label="Price (THB)" required error={errors.price}>
              <input 
                className={`form-input ${errors.price ? "input-error" : ""}`} 
                type="number" 
                name="price" 
                value={form.price} 
                onChange={handleChange} 
                placeholder="0.00" 
                min="0" 
                step="0.01" 
              />
            </FormField>
            
            <FormField label="Min Stock" error={errors.min_stock}>
              <input 
                className={`form-input ${errors.min_stock ? "input-error" : ""}`} 
                type="number" 
                name="min_stock" 
                value={form.min_stock} 
                onChange={handleChange} 
                placeholder="0" 
                min="0" 
              />
            </FormField>
            
            <FormField label="Item QR">
              <input 
                className="form-input" 
                type="text" 
                name="qr_code" 
                value={form.qr_code} 
                onChange={handleChange} 
                placeholder="Product QR code" 
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

export default AddProductModal;