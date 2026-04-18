import { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import SearchComponent from "../components/Search";
import BatchTable from "../components/Tables/BatchTable";
import Button from "../components/Button";
import AddBatchModal from "../components/Models/AddBatchModal";
import { supabase } from "../lib/supabase";
import "./InventoryPage.css";

async function fetchBatchData(productId) {
  const { data, error } = await supabase
    .from("inventory_batches")
    .select("*, products(name, brand)")
    .eq("product_id", productId)
    .order("id", { ascending: true });
  if (error) {
    console.error("Error fetching data:", error);
    throw error;
  }
  return data;
}

function InventoryBatch() {
  const navigate = useNavigate();
  const { id: productId } = useParams();

  const [batches, setBatches] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await fetchBatchData(productId);
      setBatches(data);
    } catch (err) {
      console.error("loadData error:", err);
      alert(
        "Failed to load item data. Please check your connection and try again.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [productId]);

  const handleDelete = async (batchId) => {
    try {
      const { error } = await supabase
        .from("inventory_batches")
        .delete()
        .eq("id", batchId);
      if (error) throw error;
      setBatches((prev) => prev.filter((b) => b.id !== batchId));
    } catch (err) {
      console.error("Error deleting batch:", err);
      alert("Failed to delete batch.");
    }
  };

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filteredBatches = useMemo(() => {
    if (!searchQuery) return batches;
    const lowerCaseQuery = searchQuery.toLowerCase();
    return batches.filter((batch) => {
      const formatDate = (dateStr) =>
        dateStr
          ? new Date(dateStr)
              .toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })
              .toLowerCase()
          : "";

      return (
        batch.batch_number?.toString().toLowerCase().includes(lowerCaseQuery) ||
        batch.batch_qr?.toString().toLowerCase().includes(lowerCaseQuery) ||
        batch.stock_amount.toString().includes(lowerCaseQuery) ||
        formatDate(batch.received_date).includes(lowerCaseQuery) ||
        formatDate(batch.expiry_date).includes(lowerCaseQuery)
      );
    });
  }, [batches, searchQuery]);

  const firstBatch = batches[0] || {};
  const displayProductName =
    firstBatch.products?.name || "Not Available Product";
  const displayProductBrand = firstBatch.products?.brand || "";

  return (
    <div className="page">
      <h1>Inventory Batch Management</h1>
      <div className="layout">
        <div className="top-layout">
          <SearchComponent value={searchQuery} onChange={setSearchQuery} />
          <Button
            label="Add Batch"
            style={{ padding: "12px 24px" }}
            className="add-button"
            onClick={() => setIsAddModalOpen(true)}
          />
        </div>
        <div className="body-layout">
          {isLoading ? (
            <div className="loading-container">
              <div className="spinner"></div>
              <span className="loading-text">Loading batches...</span>
            </div>
          ) : (
            <BatchTable
              items={filteredBatches}
              productName={displayProductName}
              productBrand={displayProductBrand}
              onBack={() => navigate(-1)}
              onDelete={handleDelete}
            />
          )}
        </div>
      </div>

      <AddBatchModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={loadData}
        productId={productId}
        productName={displayProductName}
        productBrand={displayProductBrand}
      />
    </div>
  );
}

export default InventoryBatch;
