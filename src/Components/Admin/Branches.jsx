import React from "react";
import { Table, Button, Space, Modal, Form, Input, Select, message, Tag, Row, Col, Typography, Tooltip, Grid } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { listBranches, createBranch, updateBranch } from "../../apiCalls/branches";
import { getOwnerOrgName } from "../../utils/ownerConfig";

const TYPE_OPTIONS = [
  { label: "Sales & Services", value: "sales & services" },
  { label: "Sales", value: "sales" },
  { label: "Service", value: "service" },
];

const STATUS_OPTIONS = [
  { label: "Active", value: "active" },
  { label: "Inactive", value: "inactive" },
  { label: "Under Maintenance", value: "under_maintenance" },
];

export default function Branches({ readOnly = false }) {
  const screens = Grid.useBreakpoint();
  const isMobile = !screens.md;
  const [loading, setLoading] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [items, setItems] = React.useState([]);
  const [total, setTotal] = React.useState(0);
  const [modalOpen, setModalOpen] = React.useState(false);
  const [editing, setEditing] = React.useState(null);
  const [form] = Form.useForm();
  const [isOwner, setIsOwner] = React.useState(false);
  const [isAdmin, setIsAdmin] = React.useState(false);
  const [branchLimit, setBranchLimit] = React.useState(1);
  const [limitReached, setLimitReached] = React.useState(false);
  const [q, setQ] = React.useState("");
  const [cityFilter, setCityFilter] = React.useState("all");
  const [typeFilter, setTypeFilter] = React.useState("all");
  const [statusFilter, setStatusFilter] = React.useState("all");
  // Controlled pagination
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(25);
  const toUpper = (v) => (typeof v === "string" ? v.toUpperCase() : v);

  const fetchList = React.useCallback(async () => {
    setLoading(true);
    try {
      if (readOnly) {
        const pub = await listBranches({ limit: 200 });
        if (pub?.success) {
          const nextItems = pub.data.items || [];
          setItems(nextItems);
          setTotal(pub.data.total || 0);
          if (isOwner) setLimitReached(nextItems.length >= branchLimit);
        } else {
          message.error(pub?.message || "Failed to load branches");
        }
      } else {
        const res = await listBranches({ limit: 200 });
        if (res?._status === 401 || res?._status === 403) {
          const pub = await listBranches({ limit: 200 });
          if (pub?.success) {
            message.info("Showing public branch list (read-only). Sign in for management.");
            const nextItems = pub.data.items || [];
            setItems(nextItems);
            setTotal(pub.data.total || 0);
            if (isOwner) setLimitReached(nextItems.length >= branchLimit);
          } else {
            message.warning("Please login again to manage branches.");
            setItems([]);
            setTotal(0);
          }
        } else if (res?.success) {
          const nextItems = res.data.items || [];
          setItems(nextItems);
          setTotal(res.data.total || 0);
          if (isOwner) setLimitReached(nextItems.length >= branchLimit);
        } else {
          message.error(res?.message || "Failed to load branches");
        }
      }
    } catch (e) {
      message.error(e?.message || "Failed to load branches");
    } finally {
      setLoading(false);
    }
  }, [readOnly, isOwner, branchLimit]);

  React.useEffect(() => {
    const u = (() => { try { return JSON.parse(localStorage.getItem('user')||'null'); } catch { return null; } })();
    const role = String(u?.role || '').toLowerCase();
    const limit = Number.isFinite(u?.ownerLimits?.branchLimit) ? Math.max(0, Math.floor(u.ownerLimits.branchLimit)) : 1;
    setIsOwner(role === 'owner');
    setIsAdmin(role === 'admin');
    setBranchLimit(limit);
  }, []);

  React.useEffect(() => { fetchList(); }, [fetchList]);

  // Derived filters + filtered data
  const cities = React.useMemo(() => {
    const s = new Set((items || []).map((b) => (b.address?.city ? String(b.address.city).trim() : "")).filter(Boolean));
    return ["all", ...Array.from(s).sort((a,b)=>a.localeCompare(b))];
  }, [items]);
  const filtered = React.useMemo(() => {
    const s = String(q || "").toLowerCase();
    return (items || []).filter((b) => {
      if (cityFilter !== 'all' && (String(b.address?.city || '') !== cityFilter)) return false;
      if (typeFilter !== 'all' && String(b.type || '') !== typeFilter) return false;
      if (statusFilter !== 'all' && String(b.status || '') !== statusFilter) return false;
      if (!s) return true;
      const hay = [b.code, b.name, b.phone, b.email, b.address?.line1, b.address?.line2, b.address?.area, b.address?.city, b.address?.state]
        .map((x)=>String(x||'').toLowerCase());
      return hay.some((x)=>x.includes(s));
    });
  }, [items, q, cityFilter, typeFilter, statusFilter]);

  // Reset page on filters/search change
  React.useEffect(() => { setPage(1); }, [q, cityFilter, typeFilter, statusFilter]);

  const stats = React.useMemo(() => {
    const by = (key) => {
      const m = new Map();
      filtered.forEach((b)=>{ const k = String(b[key] || ''); m.set(k, (m.get(k)||0)+1); });
      return Array.from(m.entries()).sort((a,b)=>b[1]-a[1]);
    };
    return { byType: by('type'), byStatus: by('status') };
  }, [filtered]);

  const exportCsv = () => {
    const headers = [
      'Code','Name','Type','Area','City','State','Pincode'
    ];
    const rows = filtered.map((b)=>[
      b.code||'', b.name||'', b.type||'',
      b.address?.area||'', b.address?.city||'', b.address?.state||'', b.address?.pincode||'',
    ]);
    const csv = [headers, ...rows].map(r => r.map(v => (String(v).includes(',') ? `"${String(v).replace(/"/g,'""')}"` : String(v))).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'branches.csv'; a.click();
    setTimeout(()=>URL.revokeObjectURL(url), 500);
  };

  const onCreate = () => {
    if (isOwner && limitReached) {
      message.warning(`Branch limit reached (${branchLimit}). Contact admin to increase.`);
      return;
    }
    setEditing(null);
    setModalOpen(true);
    // Defer setting defaults until form is mounted in Modal
    setTimeout(() => {
      form.resetFields();
      form.setFieldsValue({ type: "sales & services" });
    }, 0);
  };

  const onEdit = (row) => {
    setEditing(row);
    form.setFieldsValue({
      code: row.code,
      name: row.name,
      type: row.type,
      area: row.address?.area,
      city: row.address?.city,
      state: row.address?.state,
      pincode: row.address?.pincode,
    });
    setModalOpen(true);
  };

  const onSubmit = async () => {
    const setCodeFieldError = (msg) => {
      const text = String(msg || "").toLowerCase();
      if (!text) return false;
      if (text.includes("branch code") || text.includes("code already exists") || text.includes("duplicate code")) {
        form.setFields([{ name: "code", errors: [msg || "Branch code already exists"] }]);
        return true;
      }
      return false;
    };
    try {
      const vals = await form.validateFields();
      form.setFields([{ name: "code", errors: [] }]);
      const payload = {
        code: toUpper(vals.code),
        name: toUpper(vals.name),
        type: vals.type,
        address: {
          area: toUpper(vals.area),
          city: toUpper(vals.city),
          state: toUpper(vals.state),
          pincode: vals.pincode,
        },
        status: "active",
      };
      setSaving(true);
      let res;
      if (!editing && isOwner && limitReached) {
        message.warning(`Branch limit reached (${branchLimit}). Contact admin to increase.`);
        return;
      }
      res = editing ? await updateBranch(editing.id || editing._id, payload) : await createBranch(payload);
      if (res?._status === 401 || res?._status === 403) {
        message.warning("Please login again to continue.");
        return;
      }
      if (res?.success) {
        message.success(editing ? "Branch updated" : "Branch created");
        setModalOpen(false);
        setEditing(null);
        form.resetFields();
        fetchList();
      } else {
        const errMsg = res?.message || "Save failed";
        if (!setCodeFieldError(errMsg)) message.error(errMsg);
      }
    } catch (e) {
      const msg = e?.response?.data?.message || e?.message || "Save failed";
      if (!setCodeFieldError(msg)) message.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const mapUrl = (b) => {
    const parts = [b.address?.line1, b.address?.line2, b.address?.area, b.address?.city, b.address?.state, b.address?.pincode]
      .filter(Boolean).join(', ');
    if (!parts) return null; return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(parts)}`;
  };

  const columns = [
    { title: "Code", dataIndex: "code", key: "code", width: 80, sorter: (a, b) => a.code.localeCompare(b.code) },
    { title: "Name", dataIndex: "name", key: "name", width: 180, ellipsis: true, sorter: (a, b) => a.name.localeCompare(b.name), render: (v,r)=> (
      <span>
        {v}{' '}
        {r.isDefault && <Tag color="gold" style={{ marginLeft: 6 }}>Default</Tag>}
        <Tooltip title="Open in Google Maps">
          {mapUrl(r) && <a href={mapUrl(r)} target="_blank" rel="noopener" style={{ fontSize: 12, marginLeft: 4 }}>Map</a>}
        </Tooltip>
      </span>
    ) },
    { title: "Type", dataIndex: "type", key: "type", width: 110, render: (v) => {
      const color = v === 'sales' ? 'geekblue' : v === 'service' ? 'cyan' : 'blue';
      return <Tag color={color}>{v}</Tag>;
    } },
    { title: "City", key: "city", width: 110, ellipsis: true, render: (_, r) => r.address?.city || "—" },
    ...(isAdmin && !readOnly ? [{
      title: "Actions",
      key: "actions",
      width: 90,
      render: (_, row) => (
        <Button size="small" onClick={() => onEdit(row)}>Edit</Button>
      ),
    }] : []),
  ];

  return (
    <div>
      <div style={{ display: "flex", gap: 8, alignItems: 'center', marginBottom: 12, flexWrap: 'wrap' }}>
        <Space size={[8,8]} wrap>
          <Input.Search placeholder="Search code/name/city" allowClear value={q} onChange={(e)=>setQ(e.target.value)} style={{ minWidth: 220 }} />
          <Select value={cityFilter} onChange={setCityFilter} style={{ minWidth: 160 }} options={cities.map(c=>({ value: c, label: c==='all'?'All Cities':c }))} />
          <Select value={typeFilter} onChange={setTypeFilter} style={{ minWidth: 160 }} options={[{value:'all',label:'All Types'},...TYPE_OPTIONS]} />
          <Select value={statusFilter} onChange={setStatusFilter} style={{ minWidth: 180 }} options={[{value:'all',label:'All Status'},...STATUS_OPTIONS]} />
          <Button onClick={fetchList}>Refresh</Button>
          <Button onClick={exportCsv}>Export CSV</Button>
        </Space>
        <div style={{ flex: 1 }} />
        {!readOnly && (
          <Button type="primary" icon={<PlusOutlined />} onClick={onCreate}>
            New Branch
          </Button>
        )}
        {isOwner && (
          <Tag color={limitReached ? "red" : "blue"}>
            Limit: {items.length}/{branchLimit}
          </Tag>
        )}
      </div>

      {/* Stats badges */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 8 }}>
        {stats.byStatus.map(([k,v]) => (
          <Tag key={`st-${k||'unknown'}`} color={k==='active'?'green':k==='inactive'?'default':'orange'}>{(k||'unknown')}: {v}</Tag>
        ))}
        {stats.byType.map(([k,v]) => (
          <Tag key={`tp-${k||'unknown'}`} color={k==='sales'?'geekblue':k==='service'?'cyan':'blue'}>{(k||'unknown')}: {v}</Tag>
        ))}
        <Tag color="blue">Total: {filtered.length} / {total}</Tag>
      </div>
      <Table
        rowKey={(r) => r.id}
        dataSource={filtered}
        columns={columns}
        loading={loading}
        tableLayout={isMobile ? "auto" : "fixed"}
        pagination={{
          current: page,
          pageSize,
          showSizeChanger: true,
          pageSizeOptions: ['10','25','50','100'],
          onChange: (p, ps) => { setPage(p); if (ps !== pageSize) setPageSize(ps); },
          showTotal: (total, range) => `${range[0]}-${range[1]} of ${total}`,
        }}
        size={isMobile ? "small" : "middle"}
        scroll={isMobile ? { x: 'max-content' } : undefined}
      />

      <Modal
        title={editing ? `Edit Branch - ${editing?.name || ""}` : "New Branch"}
        open={modalOpen}
        onCancel={() => { setModalOpen(false); setEditing(null); }}
        onOk={onSubmit}
        okText={editing ? "Save" : "Create"}
        confirmLoading={saving}
        forceRender
        destroyOnClose
      >
        <Form form={form} layout="vertical">
          <Row gutter={[12, 8]}>
            <Col xs={24} sm={12}>
              <Form.Item name="code" label="Code" rules={[{ required: true, message: "Code is required" }]}>
                <Input placeholder="e.g., BDRH" maxLength={10} style={{ textTransform: "uppercase" }} onChange={(e)=>form.setFieldValue("code", toUpper(e?.target?.value || ""))} />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item name="name" label="Name" rules={[{ required: true, message: "Name is required" }]}>
                <Input placeholder={`e.g., ${(getOwnerOrgName() || "Motera")} Branch`} style={{ textTransform: "uppercase" }} onChange={(e)=>form.setFieldValue("name", toUpper(e?.target?.value || ""))} />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12}>
              <Form.Item name="type" label="Type" initialValue="sales & services" rules={[{ required: true }]}>
                <Select options={TYPE_OPTIONS} />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item name="area" label="Area">
                <Input style={{ textTransform: "uppercase" }} onChange={(e)=>form.setFieldValue("area", toUpper(e?.target?.value || ""))} />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item name="city" label="City" rules={[{ required: true, message: "City is required" }]}>
                <Input style={{ textTransform: "uppercase" }} onChange={(e)=>form.setFieldValue("city", toUpper(e?.target?.value || ""))} />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12}>
              <Form.Item name="state" label="State">
                <Input style={{ textTransform: "uppercase" }} onChange={(e)=>form.setFieldValue("state", toUpper(e?.target?.value || ""))} />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item name="pincode" label="Pincode">
                <Input />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </div>
  );
}
