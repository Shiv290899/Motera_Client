import React from 'react'
import { Tabs, Grid, Form, Input, Button, message } from 'antd'
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
import { GetCurrentUser, UpdateOwnerProfile } from '../../apiCalls/users'

// Owner dashboard: Analytics & Reports in tabs
export default function OwnerIndex() {
  const screens = Grid.useBreakpoint()
  const isMobile = !screens.md
  const [profileForm] = Form.useForm()
  const [profileSaving, setProfileSaving] = React.useState(false)
  const styles = {
    wrap: { maxWidth: 1200, margin: '0 auto', padding: isMobile ? 12 : 16 },
    h1: { fontSize: 28, marginBottom: 4 },
    sub: { color: '#6b7280', marginBottom: 16 },
    panel: { background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 16 },
    h2: { fontSize: 18, fontWeight: 600, margin: '0 0 8px' },
    p: { color: '#4b5563', margin: 0 },
  }

  React.useEffect(() => {
    (async () => {
      let user = null
      try {
        const raw = localStorage.getItem('user')
        user = raw ? JSON.parse(raw) : null
      } catch {
        user = null
      }
      if (!user) {
        const resp = await GetCurrentUser().catch(() => null)
        if (resp?.success && resp?.data) user = resp.data
      }
      if (user) {
        profileForm.setFieldsValue({
          name: user.name || '',
          phone: user.phone || '',
          webAppUrl: user.owner?.webAppUrl || '',
          logoUrl: user.owner?.logoUrl || '',
          maxBranches: user.owner?.maxBranches || '',
        })
      }
    })()
  }, [profileForm])

  const saveProfile = async () => {
    try {
      const vals = await profileForm.validateFields()
      setProfileSaving(true)
      const res = await UpdateOwnerProfile({
        name: vals.name,
        phone: vals.phone,
        webAppUrl: vals.webAppUrl,
        logoUrl: vals.logoUrl,
      })
      if (res?.success) {
        message.success('Profile updated')
        if (res?.data) {
          try { localStorage.setItem('user', JSON.stringify(res.data)) } catch { /* ignore */ }
        }
        try {
          window.dispatchEvent(new Event('owner-profile-updated'))
        } catch {
          // ignore
        }
      } else {
        message.error(res?.message || 'Profile update failed')
      }
    } catch (err) {
      message.error(err?.message || 'Profile update failed')
    } finally {
      setProfileSaving(false)
    }
  }

  const OwnerProfile = () => (
    <div style={styles.panel}>
      <div style={styles.h2}>Owner Profile</div>
      <Form form={profileForm} layout="vertical">
        <Form.Item name="name" label="Owner Name" rules={[{ required: true, message: 'Name is required' }]}>
          <Input placeholder="Your full name" />
        </Form.Item>
        <Form.Item name="phone" label="Phone">
          <Input placeholder="Contact number" />
        </Form.Item>
        <Form.Item
          name="webAppUrl"
          label="Unified Web App URL"
          rules={[{ required: true, message: 'Web app URL is required' }]}
        >
          <Input placeholder="https://script.google.com/macros/s/.../exec" />
        </Form.Item>
        <Form.Item name="logoUrl" label="Logo URL">
          <Input placeholder="https://.../logo.png (optional)" />
        </Form.Item>
        <Form.Item name="maxBranches" label="Branch Limit">
          <Input readOnly />
        </Form.Item>
        <Button type="primary" onClick={saveProfile} loading={profileSaving}>
          Save Profile
        </Button>
      </Form>
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
    { key: 'profile', label: 'Profile', children: <OwnerProfile /> },
    { key: 'collections', label: 'Daily Collections', children: <AdminDailyCollections /> },
    
    { key: 'quotations', label: 'Quotations', children: <Quotations /> },
    
    { key: 'jobcards', label: 'Job Cards', children: <Jobcards /> },
    { key: 'bookings', label: 'Bookings', children: <Bookings /> },
    { key: 'vehiclesearch', label: 'Vehicle Search', children: <VehicleSearch /> },
    
    // 4) Stock Update, 5) In-Stock Update
    { key: 'stock', label: 'Stock Movements', children: <StockUpdate /> },
    { key: 'instock', label: 'Display Vehicles', children: <InStockUpdate /> },
   
    
    
    // 6) Branches, 7) Users
    { key: 'branches', label: 'Branches', children: <Branches /> },
    { key: 'users', label: 'Users', children: <Users /> },
    { key: 'vehiclecatalog', label: 'Vehicle Catalog', children: <VehicleCatalogManager csvFallbackUrl={import.meta.env.VITE_VEHICLE_SHEET_CSV_URL || "https://docs.google.com/spreadsheets/d/e/2PACX-1vQYGuNPY_2ivfS7MTX4bWiu1DWdF2mrHSCnmTznZVEHxNmsrgcGWjVZN4UDUTOzQQdXTnbeM-ylCJbB/pub?gid=408799621&single=true&output=csv"} /> },
    // 9) Analytics & Reports, 10) Branch-level Sales, 11) Multi-branch Compare, 12) Sales Performance
    /* { key: 'analytics', label: 'Analytics & Reports', children: <AnalyticsReports /> },
    { key: 'branch', label: 'Branch-level Sales', children: <BranchSales /> },
    { key: 'compare', label: 'Multi-branch Compare', children: <MultiBranchCompare /> },
    { key: 'performance', label: 'Sales Performance', children: <SalesPerformance /> },*/
  ]

  return (
    <div style={styles.wrap}>
     
      <Tabs
        defaultActiveKey="collections"
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
