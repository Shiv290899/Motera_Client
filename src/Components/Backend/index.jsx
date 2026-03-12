import React from 'react'
import { Tabs, Grid } from 'antd'
import { useSearchParams } from 'react-router-dom'
import InStockUpdate from '../InStockUpdate'
import Branches from '../Admin/Branches'
import StockUpdate from '../StockUpdate'
import Bookings from '../Bookings'
import Quotations from '../Quotations'
import Jobcards from '../Jobcards'
import Announcements from '../Announcements'
import useAnnouncementBadge from '../../hooks/useAnnouncementBadge'
import Users from '../Admin/Users'
import VehicleSearch from '../VehicleSearch'
import VehicleCatalogManager from '../VehicleCatalogManager'
// Announcements tab/banner removed as requested

// Owner dashboard: Analytics & Reports in tabs
export default function Backend() {
  const [searchParams, setSearchParams] = useSearchParams()
  const screens = Grid.useBreakpoint()
  const isMobile = !screens.md
  const styles = {
    wrap: { width: '100%', maxWidth: '100%', margin: 0, padding: isMobile ? 12 : 16 },
    h1: { fontSize: 28, marginBottom: 4 },
    sub: { color: '#6b7280', marginBottom: 16 },
    panel: { background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 16 },
    h2: { fontSize: 18, fontWeight: 600, margin: '0 0 8px' },
    p: { color: '#4b5563', margin: 0 },
  }

  


  const { hasNew, latestItem } = useAnnouncementBadge()
  const pillColor = (t) => (t === 'alert' ? '#fa541c' : t === 'warning' ? '#faad14' : '#2f54eb')
  const NewPill = () => hasNew ? (
    <span style={{ marginLeft:6, padding:'0 6px', borderRadius:10, fontSize:11, color:'#fff', fontWeight:700, background:pillColor(latestItem?.type), display:'inline-block', animation:'annPulse 1.6s ease-in-out infinite' }}>NEW</span>
  ) : null
  const items = [
    // 1) Quotation (form), 2) Quotations (list), 3) Job Cards, 4) Bookings
    { key: 'quotations', label: 'Quotations', children: <Quotations /> },
    { key: 'jobcards', label: 'Job Cards', children: <Jobcards /> },
    { key: 'bookings', label: 'Bookings', children: <Bookings /> },
    { key: 'vehiclesearch', label: 'Vehicle Search', children: <VehicleSearch /> },
    { key: 'vehiclecatalog', label: 'Vehicle Catalog', children: <VehicleCatalogManager /> },
    // 4) Stock Update, 5) In-Stock Update
   { key: 'stock', label: 'Stock Movements', children: <StockUpdate /> },
       { key: 'instock', label: 'Display Vehicles', children: <InStockUpdate /> },
    // 6) Branches, 7) Users, 8) Announcements
    { key: 'branches', label: 'Branches', children: <Branches readOnly /> },
    { key: 'users', label: 'Users', children: <Users readOnly /> },
    { key: 'announcements', label: (<><style>{`@keyframes annPulse{0%{transform:scale(1);}60%{transform:scale(1.05);}100%{transform:scale(1);}}`}</style><span>Announcements<NewPill/></span></>), children: <Announcements /> },
    
  ]
  const validTabKeys = React.useMemo(() => items.map((it) => it.key), [items])
  const requestedTab = searchParams.get('tab')
  const activeTab = validTabKeys.includes(requestedTab) ? requestedTab : 'quotations'

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
