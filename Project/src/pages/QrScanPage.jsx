import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import Scan from "../components/Scan";
import QRTable from "../components/Tables/QRTable";
import SaleReceipt from "../components/Models/SaleReceipt";
import Button from "../components/Button";
import { supabase } from "../lib/supabase";
import "./QrScanPage.css";

const SCAN_COOLDOWN_MS = 1500;

async function resolveScannedCode(code) {
  const { data: batchData, error: batchError } = await supabase
    .from("inventory_batches")
    .select("*")
    .eq("batch_qr", code)
    .maybeSingle();;

  if (batchError && batchError.code !== "PGRST116") throw new Error(batchError.message);

  if (batchData) {
    const { data: productData } = await supabase
      .from("products")
      .select("*")
      .eq("id", batchData.product_id)
      .single();
    return {
      product: productData,
      batches: [batchData],
      isBatchScan: true,
    };
  }

  const { data: productData, error: productError } = await supabase
    .from("products")
    .select("id, name, price")
    .eq("qr_code", code)
    .single();

  if (productError && productError.code !== "PGRST116") throw new Error(productError.message);
  if (!productData) return null;

  const { data: batches } = await supabase
    .from("inventory_batches")
    .select("id, stock_amount, expiry_date")
    .eq("product_id", productData.id);

  return {
    product: productData,
    batches: batches ?? [],
    isBatchScan: false,
  };
}

function calcTotalStock(batches) {
  return batches.reduce((sum, b) => sum + Number(b.stock_amount), 0);
}

function buildItemKey(productId, batchId = null) {
  return batchId ? `batch_${batchId}` : `product_${productId}`;
}

function QRScan() {
  const [items, setItems] = useState([]);
  const [receipt, setReceipt] = useState(null);
  const lastScanTime = useRef(0);
  const itemsRef = useRef([]);

  useEffect(() => {
    itemsRef.current = items;
  }, [items]);

  const handleScanResult = useCallback(async (code) => {
    const now = Date.now();
    if (now - lastScanTime.current < SCAN_COOLDOWN_MS) return;
    lastScanTime.current = now;

    try {
      const resolved = await resolveScannedCode(code);
      if (!resolved) { alert(`Product not found: ${code}`); return; }

      const { product, batches, isBatchScan } = resolved;
      const totalStock = calcTotalStock(batches);
      if (totalStock === 0) { alert("Product out of stock!"); return; }

      const itemKey = buildItemKey(product.id, isBatchScan ? batches[0].id : null);
      const existing = itemsRef.current.find((item) => item.itemKey === itemKey);
      if (existing && existing.quantity + 1 > totalStock) {
        alert(`Exceeds available stock! (Only ${totalStock} left)`);
        return;
      }

      setItems((prev) => {
        const existingIndex = prev.findIndex((item) => item.itemKey === itemKey);
        if (existingIndex > -1) {
          return prev.map((item, i) =>
            i === existingIndex ? { ...item, quantity: item.quantity + 1 } : item
          );
        }
        return [
          ...prev,
          {
            itemKey,
            product_id: product.id,
            name: product.name,
            price: product.price,
            quantity: 1,
            maxStock: totalStock,
            batches,
          },
        ];
      });
    } catch (err) {
      console.error("handleScanResult error:", err);
      alert("Scan failed. Please try again.");
    }
  }, []);

  const handleUpdateQuantity = useCallback((itemKey, newQty) => {
    if (newQty < 0) return;
    setItems((prev) =>
      prev
        .map((item) => {
          if (item.itemKey !== itemKey) return item;
          if (newQty > item.maxStock) {
            alert(`Quantity exceeds stock! (Only ${item.maxStock} available)`);
            return { ...item, quantity: item.maxStock };
          }
          return { ...item, quantity: newQty };
        })
        .filter((item) => item.quantity > 0)
    );
  }, []);

  const handleCheckout = useCallback(async () => {
    const currentItems = itemsRef.current;
    if (currentItems.length === 0) { alert("Cart is empty"); return; }

    try {
      const payload = currentItems.map((item) => ({
        product_id: item.product_id,
        price: item.price,
        quantity: item.quantity,
        batches: item.batches.map((b) => ({
          id: b.id,
          stock_amount: b.stock_amount,
          expiry_date: b.expiry_date ?? null,
        })),
      }));

      const { data, error } = await supabase.rpc("process_checkout", {
        p_items: payload,
      });
      if (error) throw error;

      setReceipt({
        saleId: data.sale_id,
        createdAt: new Date(),
        items: [...currentItems],
      });
      setItems([]);
    } catch (err) {
      console.error("handleCheckout error:", err);
      alert("Checkout failed: " + err.message);
    }
  }, []);

  const handleCloseReceipt = useCallback(() => setReceipt(null), []);

  const memoizedScanner = useMemo(
    () => <Scan onScanResult={handleScanResult} />,
    [handleScanResult]
  );

  return (
    <div className="page">
      <h1>QR Scan</h1>
      <div className="scan-layout">{memoizedScanner}</div>
      <div className="table-layout">
        <QRTable items={items} onQuantityChange={handleUpdateQuantity} />
      </div>
      <div className="checkout-layout">
        <Button label="Checkout" onClick={handleCheckout} style={{ padding: "14px 25%" }} />
      </div>
      <SaleReceipt receipt={receipt} onClose={handleCloseReceipt} />
    </div>
  );
}

export default QRScan;