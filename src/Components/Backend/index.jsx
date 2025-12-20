import React from 'react'
import { Tabs, Grid } from 'antd'
import InStockUpdate from '../InStockUpdate'
import StockUpdate from '../StockUpdate'
import Bookings from '../Bookings'
import Quotations from '../Quotations'
import Jobcards from '../Jobcards'
import Branches from '../Admin/Branches'
import Users from '../Admin/Users'
import VehicleSearch from '../VehicleSearch'
import VehicleCatalogManager from '../VehicleCatalogManager'

// Owner dashboard: Analytics & Reports in tabs
export default function Backend() {
  const screens = Grid.useBreakpoint()
  const isMobile = !screens.md
  const styles = {
    wrap: { maxWidth: 1200, margin: '0 auto', padding: isMobile ? 12 : 16 },
    h1: { fontSize: 28, marginBottom: 4 },
    sub: { color: '#6b7280', marginBottom: 16 },
    panel: { background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 16 },
    h2: { fontSize: 18, fontWeight: 600, margin: '0 0 8px' },
    p: { color: '#4b5563', margin: 0 },
  }

  


  const items = [
    // 1) Quotation (form), 2) Quotations (list), 3) Job Cards, 4) Bookings
    { key: 'quotations', label: 'Quotations', children: <Quotations /> },
    { key: 'jobcards', label: 'Job Cards', children: <Jobcards /> },
    { key: 'bookings', label: 'Bookings', children: <Bookings /> },
    { key: 'vehiclesearch', label: 'Vehicle Search', children: <VehicleSearch /> },
    { key: 'vehiclecatalog', label: 'Vehicle Catalog', children: <VehicleCatalogManager csvFallbackUrl={import.meta.env.VITE_VEHICLE_SHEET_CSV_URL || "https://docs.google.com/spreadsheets/d/e/2PACX-1vQYGuNPY_2ivfS7MTX4bWiu1DWdF2mrHSCnmTznZVEHxNmsrgcGWjVZN4UDUTOzQQdXTnbeM-ylCJbB/pub?gid=408799621&single=true&output=csv"} /> },
    // 4) Stock Update, 5) In-Stock Update
   { key: 'stock', label: 'Stock Movements', children: <StockUpdate /> },
       { key: 'instock', label: 'Display Vehicles', children: <InStockUpdate /> },
    // 6) Branches, 7) Users
    { key: 'branches', label: 'Branches', children: <Branches readOnly /> },
    { key: 'users', label: 'Users', children: <Users readOnly /> },
    
  ]

  return (
    <div style={styles.wrap}>
      
      <Tabs
        defaultActiveKey="quotations"
        items={items}
        animated
        size={isMobile ? 'small' : 'middle'}
        tabBarGutter={isMobile ? 8 : 16}
        tabBarStyle={{ marginBottom: isMobile ? 8 : 12 }}
        style={{ width: '100%' }}
        destroyInactiveTabPane
      />
    </div>
  )
}
