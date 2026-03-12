import React from "react";
import { useNavigate } from "react-router-dom";

const TAB_CONFIG = {
  owner: {
    base: "/owner",
    items: [
      { key: "quotations", label: "Quotations" },
      { key: "jobcards", label: "Job Cards" },
      { key: "bookings", label: "Bookings" },
      { key: "vehiclesearch", label: "Vehicle Search" },
      { key: "stock", label: "Stock Movements" },
      { key: "instock", label: "Display Vehicles" },
      { key: "branches", label: "Branches" },
      { key: "users", label: "Users" },
      { key: "vehiclecatalog", label: "Vehicle Catalog" },
      { key: "collections", label: "Daily Collections" },
    ],
  },
  staff: {
    base: "/staff",
    items: [
      { key: "quotation", label: "Quotation" },
      { key: "jobcard", label: "Job Card" },
      { key: "followups", label: "Follow-ups" },
      { key: "booking", label: "Booking" },
      { key: "vehicle-search", label: "Vehicle Search" },
      { key: "stock-update", label: "Stock Update" },
      { key: "minorsales", label: "Minor Sales" },
      { key: "account", label: "Account" },
      { key: "announcements", label: "Announcements" },
    ],
  },
  backend: {
    base: "/backend",
    items: [
      { key: "quotations", label: "Quotations" },
      { key: "jobcards", label: "Job Cards" },
      { key: "bookings", label: "Bookings" },
      { key: "vehiclesearch", label: "Vehicle Search" },
      { key: "vehiclecatalog", label: "Vehicle Catalog" },
      { key: "stock", label: "Stock Movements" },
      { key: "instock", label: "Display Vehicles" },
      { key: "branches", label: "Branches" },
      { key: "users", label: "Users" },
      { key: "announcements", label: "Announcements" },
    ],
  },
  admin: {
    base: "/admin",
    items: [
      { key: "branches", label: "Branches" },
      { key: "users", label: "Users" },
      { key: "announcements", label: "Announcements" },
    ],
  },
};

function getCurrentRole_() {
  try {
    const raw = localStorage.getItem("user");
    if (!raw) return "owner";
    const user = JSON.parse(raw);
    const role = String(user?.role || "").toLowerCase();
    return TAB_CONFIG[role] ? role : "owner";
  } catch {
    return "owner";
  }
}

export default function DashboardQuickNav({ currentLabel = "Quotation Form" }) {
  const navigate = useNavigate();
  const role = getCurrentRole_();
  const cfg = TAB_CONFIG[role] || TAB_CONFIG.owner;

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        overflowX: "auto",
        padding: "8px 10px",
        border: "1px solid #e2e8f0",
        borderRadius: 12,
        background: "linear-gradient(180deg, #ffffff 0%, #f8fbff 100%)",
        marginBottom: 10,
      }}
    >
      <span
        style={{
          whiteSpace: "nowrap",
          borderRadius: 999,
          padding: "6px 12px",
          fontSize: 12,
          fontWeight: 700,
          color: "#fff",
          background: "linear-gradient(90deg, #2563eb 0%, #1d4ed8 100%)",
        }}
      >
        {currentLabel}
      </span>
      {cfg.items.map((item) => (
        <button
          key={item.key}
          type="button"
          onClick={() => navigate(`${cfg.base}?tab=${encodeURIComponent(item.key)}`)}
          style={{
            whiteSpace: "nowrap",
            borderRadius: 999,
            border: "1px solid #cbd5e1",
            padding: "5px 11px",
            fontSize: 12,
            fontWeight: 600,
            color: "#1f2937",
            background: "#fff",
            cursor: "pointer",
          }}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}

