import { useState, useEffect, useMemo, useCallback } from "react";
import SearchComponent from "../components/Search";
import ProductTable from "../components/Tables/ProductTable";
import Button from "../components/Button";
import AddProductModal from "../components/Models/AddProductModal";
import { supabase } from "../lib/supabase";
import "./InventoryPage.css";

async function fetchInventoryData() {
  const { data, error } = await supabase
    .from("products")
    .select("*, inventory_batches(id, stock_amount), categories(name)")
    .order("id", { ascending: true });

  if (error) {
    console.error("Error fetching data:", error);
    throw error;
  }
  return data;
}

function Inventory() {
  const [products, setProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await fetchInventoryData();
      setProducts(data);
    } catch (err) {
      console.error("loadData error:", err);
      alert(
        "Failed to load item data. Please check your connection and try again.",
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleDelete = async (id) => {
    try {
      const { error } = await supabase.from("products").delete().eq("id", id);
      if (error) throw error;
      setProducts((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      console.error("Error deleting product:", err);
      alert("Failed to delete the item.");
    }
  };

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filteredProducts = useMemo(() => {
    if (!searchQuery) return products;
    const lowerCaseQuery = searchQuery.toLowerCase();
    return products.filter((item) => {
      const isMatchInBatches = item.inventory_batches?.some((batch) =>
        batch.stock_amount?.toString().includes(lowerCaseQuery),
      );

      return (
        item.id?.toString().includes(lowerCaseQuery) ||
        item.name?.toLowerCase().includes(lowerCaseQuery) ||
        item.brand?.toLowerCase().includes(lowerCaseQuery) ||
        isMatchInBatches ||
        item.categories?.name?.toLowerCase().includes(lowerCaseQuery) ||
        item.qr_code?.toLowerCase().includes(lowerCaseQuery) ||
        (item.price != null &&
          Number(item.price).toFixed(2).includes(lowerCaseQuery)) ||
        item.price?.toString().includes(lowerCaseQuery)
      );
    });
  }, [products, searchQuery]);

  return (
    <div className="page">
      <h1>Inventory Management</h1>
      <div className="layout">
        <div className="top-layout">
          <SearchComponent value={searchQuery} onChange={setSearchQuery} />

          <div className="action-buttons">
            <Button
              label="Add Product"
              style={{ padding: "12px 23px" }}
              onClick={() => setIsAddModalOpen(true)}
            />
          </div>
        </div>
        <div className="body-layout">
          {isLoading ? (
            <div className="loading-container">
              <div className="spinner"></div>
              <span className="loading-text">Loading inventory...</span>
            </div>
          ) : (
            <ProductTable items={filteredProducts} onDelete={handleDelete} />
          )}
        </div>
      </div>

      <AddProductModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={loadData}
        supabase={supabase}
      />
    </div>
  );
}

export default Inventory;
