import React from 'react'
import { Tabs, Grid, Empty, Alert } from 'antd'
import { useSearchParams } from 'react-router-dom'
import InStockUpdate from '../InStockUpdate'
import StockUpdate from '../StockUpdate'
import Bookings from '../Bookings'
import Quotations from '../Quotations'
import Quotation from '../Quotation'
import Jobcards from '../Jobcards'
import JobCard from '../JobCard'
import Branches from '../Admin/Branches'
import Users from '../Admin/Users'
import AdminDailyCollections from '../AdminDailyCollections'
import VehicleSearch from '../VehicleSearch'
import VehicleCatalogManager from '../VehicleCatalogManager'
import { hasOwnerWebhookUrlConfigured } from '../../utils/ownerConfig'

// Owner dashboard: Analytics & Reports in tabs
export default function OwnerIndex() {
  const [searchParams, setSearchParams] = useSearchParams()
  const screens = Grid.useBreakpoint()
  const isMobile = !screens.md
  const hasWebhook = hasOwnerWebhookUrlConfigured()
  const styles = {
    wrap: { width: '100%', maxWidth: '100%', margin: 0, padding: isMobile ? 12 : 16 },
    h1: { fontSize: 28, marginBottom: 4 },
    sub: { color: '#6b7280', marginBottom: 16 },
    panel: { background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 16 },
    h2: { fontSize: 18, fontWeight: 600, margin: '0 0 8px' },
    p: { color: '#4b5563', margin: 0 },
  }
  const noDataView = (
    <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 20 }}>
      <Alert
        type="warning"
        showIcon
        message="Owner web app URL is not configured"
        description="No operational data will be shown until webhook URL is set in Owner Profile."
        style={{ marginBottom: 16 }}
      />
      <Empty description="No data" />
    </div>
  )

  const AnalyticsReports = () => (
    <div style={styles.panel}>
      <div style={styles.h2}>Analytics & Reports</div>
      <p style={styles.p}>KPIs, trends, and printable/exportable reports.</p>
    </div>
  )

  const BranchSales = () => (
    <div style={styles.panel}>
      <div style={styles.h2}>Branch-level Sales</div>
      <p style={styles.p}>Track sales and revenue by each branch. Add filters for branch, date range, and product lines.</p>
    </div>
  )

  const MultiBranchCompare = () => (
    <div style={styles.panel}>
      <div style={styles.h2}>Multi-branch Compare</div>
      <p style={styles.p}>Compare KPIs across branches over time. Useful for ranking and benchmarking.</p>
    </div>
  )

  const SalesPerformance = () => (
    <div style={styles.panel}>
      <div style={styles.h2}>Sales Performance</div>
      <p style={styles.p}>See top performers and conversion trends. Start with total bookings → quotations → job cards.</p>
    </div>
  )

  const items = [
    // 1) Quotation (form), 2) Quotations (list), 3) Job Cards, 4) Bookings
    
    
    { key: 'quotations', label: 'Quotations', children: hasWebhook ? <Quotations /> : noDataView },
    
    { key: 'jobcards', label: 'Job Cards', children: hasWebhook ? <Jobcards /> : noDataView },
    { key: 'bookings', label: 'Bookings', children: hasWebhook ? <Bookings /> : noDataView },
    { key: 'vehiclesearch', label: 'Vehicle Search', children: hasWebhook ? <VehicleSearch /> : noDataView },
    
    // 4) Stock Update, 5) In-Stock Update
    { key: 'stock', label: 'Stock Movements', children: hasWebhook ? <StockUpdate /> : noDataView },
    { key: 'instock', label: 'Display Vehicles', children: hasWebhook ? <InStockUpdate /> : noDataView },
   
    
    
    // 6) Branches, 7) Users
    { key: 'branches', label: 'Branches', children: hasWebhook ? <Branches /> : noDataView },
    { key: 'users', label: 'Users', children: hasWebhook ? <Users /> : noDataView },
    { key: 'vehiclecatalog', label: 'Vehicle Catalog', children: hasWebhook ? <VehicleCatalogManager /> : noDataView },
    { key: 'collections', label: 'Daily Collections', children: hasWebhook ? <AdminDailyCollections /> : noDataView },
    // 9) Analytics & Reports, 10) Branch-level Sales, 11) Multi-branch Compare, 12) Sales Performance
    /* { key: 'analytics', label: 'Analytics & Reports', children: <AnalyticsReports /> },
    { key: 'branch', label: 'Branch-level Sales', children: <BranchSales /> },
    { key: 'compare', label: 'Multi-branch Compare', children: <MultiBranchCompare /> },
    { key: 'performance', label: 'Sales Performance', children: <SalesPerformance /> },*/
  ]
  const validTabKeys = React.useMemo(() => items.map((it) => it.key), [items])
  const requestedTab = searchParams.get('tab')
  const activeTab = validTabKeys.includes(requestedTab) ? requestedTab : 'collections'

  return (
    <div style={styles.wrap}>
     
      <Tabs
        activeKey={activeTab}
        onChange={(key) => {
          const next = new URLSearchParams(searchParams)
          next.set('tab', key)
          setSearchParams(next, { replace: true })
        }}
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
