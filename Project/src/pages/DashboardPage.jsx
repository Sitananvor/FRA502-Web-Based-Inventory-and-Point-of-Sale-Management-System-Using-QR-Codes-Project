import { useState, useEffect, useCallback, useMemo } from "react";
import {
  TrendingUp,
  PackageMinus,
  ClockAlert,
  PackageOpen,
} from "lucide-react";
import { supabase } from "../lib/supabase";
import Cards from "../components/Cards";
import ChartContainer from "../components/Charts/ChartContainer";
import TopChart from "../components/Charts/TopChart";
import SalesChart from "../components/Charts/SalesChart";
import SalesTable from "../components/Tables/SalesTable";
import "./DashboardPage.css";

// Helpers
const formatPrice = (value) =>
  Number(value).toLocaleString("th-TH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const calcTotalStock = (batches = []) =>
  batches.reduce((sum, b) => sum + Number(b.stock_amount || 0), 0);

const calcTodaySales = (sales = []) => {
  const todayStr = new Date().toISOString().split("T")[0];
  return sales.reduce((sum, order) => {
    if (order.created_at?.startsWith(todayStr)) {
      return sum + Number(order.total_amount || 0);
    }
    return sum;
  }, 0);
};

const getLowStockCount = (products = []) =>
  products.filter((p) => {
    const stock = calcTotalStock(p.inventory_batches);
    return stock > 0 && stock <= Number(p.min_stock || 0);
  }).length;

const getExpiringCount = (products = []) => {
  const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;
  const now = new Date();
  return products.filter((p) =>
    p.inventory_batches?.some((b) => {
      if (!b.expiry_date) return false;
      const exp = new Date(b.expiry_date);
      const diff = exp - now;
      return diff > 0 && diff <= THIRTY_DAYS_MS;
    }),
  ).length;
};

const getStartDate = (filter) => {
  const d = new Date();
  if (filter === "week") d.setDate(d.getDate() - d.getDay());
  else if (filter === "month") d.setDate(1);
  else if (filter === "year") d.setMonth(0, 1);
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
};

const getWidestFilter = (f1, f2) => {
  const rank = { week: 1, month: 2, year: 3 };
  return rank[f1] >= rank[f2] ? f1 : f2;
};

const TIME_OPTIONS = [
  { value: "week", label: "This Week" },
  { value: "month", label: "This Month" },
  { value: "year", label: "This Year" },
];

// Main Component
function Dashboard() {
  const [products, setProducts] = useState([]);
  const [sales, setSales] = useState([]);
  const [todaySales, setTodaySales] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const [salesFilter, setSalesFilter] = useState("month");
  const [topItemsFilter, setTopItemsFilter] = useState("month");

  const loadProducts = useCallback(async () => {
    const { data } = await supabase
      .from("products")
      .select(
        "id, name, min_stock, inventory_batches(stock_amount, expiry_date)",
      );
    setProducts(data || []);
  }, []);

  const loadTodaySales = useCallback(async () => {
    const todayStr = new Date().toISOString().split("T")[0];
    const { data } = await supabase
      .from("sales")
      .select("total_amount")
      .gte("created_at", `${todayStr}T00:00:00`)
      .lte("created_at", `${todayStr}T23:59:59`);
    const total = (data || []).reduce(
      (sum, s) => sum + Number(s.total_amount || 0),
      0,
    );
    setTodaySales(total);
  }, []);

  const loadSales = useCallback(async (salesFilter, topItemsFilter) => {
    const widest = getWidestFilter(salesFilter, topItemsFilter);
    const startDate = getStartDate(widest);
    const { data } = await supabase
      .from("sales")
      .select(
        "id, created_at, total_amount, sales_items(quantity, products(name))",
      )
      .gte("created_at", startDate)
      .order("created_at", { ascending: false });
    setSales(data || []);
  }, []);

  useEffect(() => {
    const init = async () => {
      setIsLoading(true);
      await Promise.all([
        loadProducts(),
        loadTodaySales(),
        loadSales(salesFilter, topItemsFilter),
      ]);
      setIsLoading(false);
    };
    init();
  }, []);

  useEffect(() => {
    loadSales(salesFilter, topItemsFilter);
  }, [salesFilter, topItemsFilter, loadSales]);

  const handleDeleteReceipt = async (id) => {
  try {
    const { error } = await supabase.rpc("delete_sale", { p_sale_id: id });
    if (error) throw error;
    setSales((prev) => prev.filter((s) => s.id !== id));
    loadTodaySales();
  } catch (error) {
    console.error("Error deleting receipt:", error.message);
    alert("Failed to delete receipt.");
  }
};

  const filteredSalesData = useMemo(() => {
    const now = new Date();
    const grouped = {};

    if (salesFilter === "week") {
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - now.getDay());

      for (let i = 0; i < 7; i++) {
        const d = new Date(startOfWeek);
        d.setDate(d.getDate() + i);
        const dateKey = d.toISOString().split("T")[0];
        const label = d.toLocaleDateString("en-GB", { weekday: "short" });
        grouped[dateKey] = { name: label, total: 0 };
      }
    } else if (salesFilter === "month") {
      for (let i = 1; i <= 5; i++) {
        grouped[`W${i}`] = { name: `Week ${i}`, total: 0 };
      }
    } else if (salesFilter === "year") {
      const currentYear = now.getFullYear();
      for (let i = 0; i < 12; i++) {
        const d = new Date(currentYear, i, 1);
        const monthKey = d.toISOString().substring(0, 7);
        const label = d.toLocaleDateString("en-GB", { month: "short" });
        grouped[monthKey] = { name: label, total: 0 };
      }
    }

    sales.forEach((curr) => {
      const saleDate = new Date(curr.created_at);
      const fullDateStr = curr.created_at.split("T")[0];

      if (salesFilter === "week") {
        if (
          grouped[fullDateStr] &&
          saleDate.getFullYear() === now.getFullYear()
        ) {
          grouped[fullDateStr].total += Number(curr.total_amount);
        }
      } else if (salesFilter === "month") {
        if (
          saleDate.getMonth() === now.getMonth() &&
          saleDate.getFullYear() === now.getFullYear()
        ) {
          const weekNum = Math.ceil(saleDate.getDate() / 7);
          grouped[`W${weekNum}`].total += Number(curr.total_amount);
        }
      } else if (salesFilter === "year") {
        const monthKey = fullDateStr.substring(0, 7);
        if (grouped[monthKey] && saleDate.getFullYear() === now.getFullYear()) {
          grouped[monthKey].total += Number(curr.total_amount);
        }
      }
    });

    return Object.values(grouped).map((item) => ({
      name: item.name,
      sales: item.total,
    }));
  }, [sales, salesFilter]);

  const filteredTopItemsData = useMemo(() => {
    const now = new Date();
    const cutoff = new Date(now);

    if (topItemsFilter === "week") {
      cutoff.setDate(now.getDate() - now.getDay());
      cutoff.setHours(0, 0, 0, 0);
    } else if (topItemsFilter === "month") {
      cutoff.setDate(1);
      cutoff.setHours(0, 0, 0, 0);
    } else if (topItemsFilter === "year") {
      cutoff.setMonth(0, 1);
      cutoff.setHours(0, 0, 0, 0);
    }

    const itemMap = {};
    sales
      .filter((s) => new Date(s.created_at) >= cutoff)
      .forEach((bill) => {
        bill.sales_items?.forEach((item) => {
          const name = item.products?.name || "Unknown Item";
          itemMap[name] = (itemMap[name] || 0) + item.quantity;
        });
      });

    return Object.keys(itemMap)
      .map((name) => ({ name, value: itemMap[name] }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
  }, [sales, topItemsFilter]);

  const totalInventory = useMemo(
    () => products.reduce((t, p) => t + calcTotalStock(p.inventory_batches), 0),
    [products],
  );

  const stats = [
    {
      id: 1,
      title: "Today's Sales",
      value: `฿${formatPrice(todaySales)}`,
      color: "#0FC843",
      icon: TrendingUp,
    },
    {
      id: 2,
      title: "Low Stock Items",
      value: getLowStockCount(products),
      color: "#EF8225",
      icon: PackageMinus,
    },
    {
      id: 3,
      title: "Expiring Soon",
      value: getExpiringCount(products),
      color: "#DB3935",
      icon: ClockAlert,
    },
    {
      id: 4,
      title: "Total Inventory",
      value: `${totalInventory.toLocaleString()} Pcs`,
      color: "#0EA5E9",
      icon: PackageOpen,
    },
  ];

  return (
    <div className="page">
      <h1>Dashboard Overview</h1>
      {isLoading ? (
        <div className="loading-container">
          <div className="spinner"></div>
          <span className="loading-text">Loading dashboard...</span>
        </div>
      ) : (
        <>
          <div className="cards-layout">
            {stats.map((item) => (
              <Cards
                key={item.id}
                title={item.title}
                value={item.value}
                bgColor={item.color}
                icon={item.icon}
              />
            ))}
          </div>

          <div className="charts-layout">
            <ChartContainer
              title="Sales Trends"
              filterValue={salesFilter}
              onFilterChange={setSalesFilter}
              filterOptions={TIME_OPTIONS}
            >
              <SalesChart sales={filteredSalesData} />
            </ChartContainer>

            <ChartContainer
              title="Top 5 Best Sellers"
              filterValue={topItemsFilter}
              onFilterChange={setTopItemsFilter}
              filterOptions={TIME_OPTIONS}
            >
              <TopChart salesItems={filteredTopItemsData} />
            </ChartContainer>
          </div>

          <div className="sales-table-layout">
            <SalesTable sales={sales} onDelete={handleDeleteReceipt} />
          </div>
        </>
      )}
    </div>
  );
}

export default Dashboard;