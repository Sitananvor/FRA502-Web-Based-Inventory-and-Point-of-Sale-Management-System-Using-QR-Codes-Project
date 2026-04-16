import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  TextAlignJustify,
  LayoutDashboard,
  ScanLine,
  Warehouse,
} from "lucide-react";
import myLogo from "/logo.png";
import "./Sidebar.css";

function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const menus = [
    { name: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
    { name: "QR Scan", icon: ScanLine, path: "/qrscan" },
    { name: "Inventory", icon: Warehouse, path: "/inventory" },
  ];

  return (
    <div className={`sidebar ${isOpen ? "open" : "closed"}`}>
      <div className="sidebar-control">
        <TextAlignJustify size={24} onClick={() => setIsOpen(!isOpen)} />
      </div>

      <div className="sidebar-header">
        <img src={myLogo} className="sidebar-logo" alt="logo" />
        {isOpen && (
          <span className="sidebar-title">
            POS<span className="sidebar-title-highlight">tock</span>
          </span>
        )}
      </div>
      <hr />

      <ul className="sidebar-list">
        {menus.map((menu) => {
          const Icon = menu.icon;
          const isActive = location.pathname.startsWith(menu.path);
          return (
            <li key={menu.name}>
              <Link
                to={menu.path}
                className={`sidebar-item ${isActive ? "active" : ""}`}
              >
                <Icon size={23} />
                <span>{menu.name}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default Sidebar;
