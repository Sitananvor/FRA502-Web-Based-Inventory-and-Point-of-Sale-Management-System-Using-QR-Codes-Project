import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import "./App.css";
import Layout from "./layout/Layout";
import Dashboard from "./pages/DashboardPage";
import QRScan from "./pages/QrScanPage";
import Inventory from "./pages/InventoryPage";
import InventoryBatch from "./pages/InventoryBatchPage";

function App() {
  return (
    <BrowserRouter basename="/fibo6658/Project">
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="qrscan" element={<QRScan />} />
          <Route path="inventory" element={<Inventory />} />
          <Route path="inventory/:id/batches" element={<InventoryBatch />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;