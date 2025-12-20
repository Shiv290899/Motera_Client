import React from "react";
import { Tabs, Grid, Typography } from "antd";
import Branches from "./Branches";
import StockUpdate from "../StockUpdate";
import InStockUpdate from "../InStockUpdate";
import Users from "./Users";
import Bookings from "../Bookings";
import Quotations from "../Quotations";
import Jobcards from "../Jobcards";
import AdminDailyCollections from '../AdminDailyCollections'
import VehicleSearch from '../VehicleSearch'
import VehicleCatalogManager from '../VehicleCatalogManager'

const { Title, Paragraph } = Typography;

export default function Admin() {
  const screens = Grid.useBreakpoint();
  const isMobile = !screens.md;
  const container = { maxWidth: 1200, margin: "0 auto", padding: isMobile ? 12 : 16 };

  const Placeholder = ({ title, desc }) => (
    <div style={{ padding: 12 }}>
      <Title level={4} style={{ marginTop: 0 }}>{title}</Title>
      <Paragraph style={{ marginBottom: 0 }}>{desc}</Paragraph>
    </div>
  );

  const items = [
    // 1) Quotations, 2) Job Cards, 3) Bookings
    { key: "quotations", label: "Quotations", children: <Quotations /> },
    { key: "jobcards", label: "Job Cards", children: <Jobcards /> },
    { key: "bookings", label: "Bookings", children: <Bookings /> },
    { key: "vehiclesearch", label: "Vehicle Search", children: <VehicleSearch /> },
    // 4) Stock Update, 5) In-Stock Update
   { key: 'stock', label: 'Stock Movements', children: <StockUpdate /> },
       { key: 'instock', label: 'Display Vehicles', children: <InStockUpdate /> },
    { key: 'collections', label: 'Daily Collections', children: <AdminDailyCollections /> },
    // 6) Branches, 7) Users
    { key: "branches", label: "Branches", children: <Branches /> },
    { key: "users", label: "Users", children: <Users /> },
    { key: 'vehiclecatalog', label: 'Vehicle Catalog', children: <VehicleCatalogManager csvFallbackUrl={import.meta.env.VITE_VEHICLE_SHEET_CSV_URL || "https://docs.google.com/spreadsheets/d/e/2PACX-1vQYGuNPY_2ivfS7MTX4bWiu1DWdF2mrHSCnmTznZVEHxNmsrgcGWjVZN4UDUTOzQQdXTnbeM-ylCJbB/pub?gid=408799621&single=true&output=csv"} /> },
    // 9) Analytics & Reports, 10) Branch-level Sales, 11) Multi-branch Compare, 12) Sales Performance
    /*{ key: "analytics", label: "Analytics & Reports", children: (
        <Placeholder title="Analytics & Reports" desc="KPIs, trends, and printable/exportable reports. (UI coming soon)" />
      ) },
    { key: "branchSales", label: "Branch-level Sales", children: (
        <Placeholder title="Branch-level Sales" desc="Sales metrics per branch with filters. (UI coming soon)" />
      ) },
    { key: "multiBranch", label: "Multi-branch Compare", children: (
        <Placeholder title="Multi-branch Comparison" desc="Compare branches across time periods. (UI coming soon)" />
      ) },
    { key: "performance", label: "Sales Performance", children: (
        <Placeholder title="Sales Performance Tracking" desc="Targets vs actuals and leaderboards. (UI coming soon)" />
      ) },   */
  ];

  return (
    <div style={container}>
     
      <Tabs
        defaultActiveKey="quotations"
        items={items}
        destroyInactiveTabPane
        size={isMobile ? "small" : "middle"}
        tabBarGutter={isMobile ? 8 : 16}
        tabBarStyle={{ marginBottom: isMobile ? 8 : 12 }}
        style={{ width: "100%" }}
      />
    </div>
  );
}
