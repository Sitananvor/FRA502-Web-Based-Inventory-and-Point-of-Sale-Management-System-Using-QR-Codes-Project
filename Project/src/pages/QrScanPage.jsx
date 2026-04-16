import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import Scan from "../components/Scan";
import QRTable from "../components/Tables/QRTable";
import SaleReceipt from "../components/Models/SaleReceipt";
import Button from "../components/Button";
import { supabase } from "../lib/supabase";
import "./QrScanPage.css";

// Constants
const SCAN_COOLDOWN_MS = 1500;

// Helpers
async function resolveScannedCode(code) {
  const { data: batchData } = await supabase
    .from("inventory_batches")
    .select("*, products(*)")
    .eq("batch_qr", code)
    .single();
  if (batchData) {
    return {
      product: batchData.products,
      batches: [batchData],
      isBatchScan: true,
    };
  }

  const { data: productData, error } = await supabase
    .from("products")
    .select("id, name, price, inventory_batches(id, stock_amount, expiry_date)")
    .eq("qr_code", code)
    .single();
  if (error || !productData) return null;
  return {
    product: productData,
    batches: productData.inventory_batches ?? [],
    isBatchScan: false,
  };
}

function calcTotalStock(batches) {
  return batches.reduce((sum, b) => sum + Number(b.stock_amount), 0);
}

function buildItemKey(productId, batchId = null) {
  return batchId ? `batch_${batchId}` : `product_${productId}`;
}

async function deductStockAndInsertSalesItems(saleId, item) {
  let remaining = item.quantity;

  const sortedBatches = [...item.batches]
    .filter((b) => b.stock_amount > 0)
    .sort(
      (a, b) => new Date(a.expiry_date ?? 0) - new Date(b.expiry_date ?? 0),
    );

  for (const batch of sortedBatches) {
    if (remaining <= 0) break;

    const deduct = Math.min(batch.stock_amount, remaining);
    const { error: stockError } = await supabase.rpc("decrement_stock", {
      p_batch_id: batch.id,
      p_amount: deduct,
    });
    if (stockError) throw stockError;

    const { error: itemError } = await supabase.from("sales_items").insert([
      {
        sale_id: saleId,
        product_id: item.product_id,
        batch_id: batch.id,
        quantity: deduct,
        price_at_time: item.price,
      },
    ]);
    if (itemError) throw itemError;

    remaining -= deduct;
  }
}

// Main Component
function QRScan() {
  const [items, setItems] = useState([]);
  const [receipt, setReceipt] = useState(null);
  const lastScanTime = useRef(0);

  const itemsRef = useRef([]);
  useEffect(() => {
    itemsRef.current = items;
  }, [items]);

  // Scan handler
  const handleScanResult = useCallback(async (code) => {
    const now = Date.now();
    if (now - lastScanTime.current < SCAN_COOLDOWN_MS) return;
    lastScanTime.current = now;

    try {
      const resolved = await resolveScannedCode(code);
      if (!resolved) {
        alert(`Product not found: ${code}`);
        return;
      }

      const { product, batches, isBatchScan } = resolved;
      const totalStock = calcTotalStock(batches);
      if (totalStock === 0) {
        alert("Product out of stock!");
        return;
      }

      const itemKey = buildItemKey(
        product.id,
        isBatchScan ? batches[0].id : null,
      );
      const existing = itemsRef.current.find(
        (item) => item.itemKey === itemKey,
      );
      if (existing && existing.quantity + 1 > totalStock) {
        alert(`Exceeds available stock! (Only ${totalStock} left)`);
        return;
      }

      setItems((prev) => {
        const existingIndex = prev.findIndex(
          (item) => item.itemKey === itemKey,
        );
        if (existingIndex > -1) {
          return prev.map((item, i) =>
            i === existingIndex
              ? { ...item, quantity: item.quantity + 1 }
              : item,
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

  // Quantity update
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
        .filter((item) => item.quantity > 0),
    );
  }, []);

  // Checkout
  const handleCheckout = useCallback(async () => {
    const currentItems = itemsRef.current;
    if (currentItems.length === 0) {
      alert("Cart is empty");
      return;
    }

    try {
      const totalAmount = currentItems.reduce(
        (sum, item) => sum + Number(item.price) * item.quantity,
        0,
      );

      const { data: newSale, error: saleError } = await supabase
        .from("sales")
        .insert([{ total_amount: totalAmount }])
        .select()
        .single();
      if (saleError) throw saleError;

      for (const item of currentItems) {
        await deductStockAndInsertSalesItems(newSale.id, item);
      }

      setReceipt({
        saleId: newSale.id,
        createdAt: new Date(),
        items: [...currentItems],
      });
      setItems([]);
    } catch (err) {
      console.error("handleCheckout error:", err);
      alert("Checkout failed. Please try again.");
    }
  }, []);

  const handleCloseReceipt = useCallback(() => setReceipt(null), []);

  const memoizedScanner = useMemo(
    () => <Scan onScanResult={handleScanResult} />,
    [handleScanResult],
  );

  return (
    <div className="page">
      <h1>QR Scan</h1>
      <div className="scan-layout">{memoizedScanner}</div>
      <div className="table-layout">
        <QRTable items={items} onQuantityChange={handleUpdateQuantity} />
      </div>
      <div className="checkout-layout">
        <Button
          label="Checkout"
          onClick={handleCheckout}
          style={{ padding: "14px 25%" }}
        />
      </div>

      <SaleReceipt receipt={receipt} onClose={handleCloseReceipt} />
    </div>
  );
}

export default QRScan;
