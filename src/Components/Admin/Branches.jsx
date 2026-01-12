import React from "react";
import { Table, Button, Space, Modal, Form, Input, Select, message, Tag, Row, Col } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { listBranches, listBranchesPublic, createBranch, updateBranch, deleteBranch } from "../../apiCalls/branches";

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

const parseTeamEntries = (value) => {
  if (value === undefined || value === null) return [];
  const source = Array.isArray(value) ? value : String(value || "");
  const candidates = Array.isArray(source)
    ? source
    : source.split(/[\n,;]+/).map((s) => s.trim()).filter(Boolean);
  const seen = new Map();
  candidates.forEach((segment) => {
    if (!segment) return;
    if (typeof segment === "object") {
      const name = String(segment.name || segment.value || "").trim();
      if (!name) return;
      const phone = String(segment.phone || segment.contact || segment.mobile || "").replace(/\D/g, "");
      const key = name.toLowerCase();
      if (seen.has(key)) return;
      seen.set(key, phone ? { name, phone } : { name });
      return;
    }
    const raw = String(segment || "").trim();
    if (!raw) return;
    const parts = raw.split(/[|:]/).map((p) => p.trim()).filter(Boolean);
    const name = parts[0];
    if (!name) return;
    const phone = parts.slice(1).join("").replace(/\D/g, "");
    const key = name.toLowerCase();
    if (seen.has(key)) return;
    const entry = phone ? { name, phone } : { name };
    seen.set(key, entry);
  });
  return Array.from(seen.values());
};

const formatTeamEntries = (list) => {
  if (!Array.isArray(list) || !list.length) return "";
  return list
    .map((item) => {
      if (!item?.name) return "";
      return item.phone ? `${item.name} | ${item.phone}` : item.name;
    })
    .filter(Boolean)
    .join("\n");
};

const renderTeamCell = (list) => {
  if (!Array.isArray(list) || !list.length) return <span style={{ color: "#6b7280" }}>—</span>;
  const items = list.map((item) => item?.name).filter(Boolean);
  if (!items.length) return <span style={{ color: "#6b7280" }}>—</span>;
  const preview = items.slice(0, 2).join(", ");
  return (
    <span style={{ fontSize: 12 }}>
      {preview}
      {items.length > 2 ? ` + ${items.length - 2} more` : ""}
    </span>
  );
};

export default function Branches({ readOnly = false }) {
  const [loading, setLoading] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [items, setItems] = React.useState([]);
  const [total, setTotal] = React.useState(0);
  const [modalOpen, setModalOpen] = React.useState(false);
  const [editing, setEditing] = React.useState(null);
  const [form] = Form.useForm();
  const [q, setQ] = React.useState("");
  const [typeFilter, setTypeFilter] = React.useState("all");
  const [statusFilter, setStatusFilter] = React.useState("all");
  // Controlled pagination
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(25);

  const fetchList = React.useCallback(async () => {
    setLoading(true);
    try {
      if (readOnly) {
        const pub = await listBranchesPublic({ limit: 200 });
        if (pub?.success) {
          setItems(pub.data.items || []);
          setTotal(pub.data.total || 0);
        } else {
          message.error(pub?.message || "Failed to load branches");
        }
      } else {
        const res = await listBranches({ limit: 200 });
        if (res?._status === 401 || res?._status === 403) {
          const pub = await listBranchesPublic({ limit: 200 });
          if (pub?.success) {
            message.info("Showing public branch list (read-only). Sign in for management.");
            setItems(pub.data.items || []);
            setTotal(pub.data.total || 0);
          } else {
            message.warning("Please login again to manage branches.");
            setItems([]);
            setTotal(0);
          }
        } else if (res?.success) {
          setItems(res.data.items || []);
          setTotal(res.data.total || 0);
        } else {
          message.error(res?.message || "Failed to load branches");
        }
      }
    } catch (e) {
      message.error(e?.message || "Failed to load branches");
    } finally {
      setLoading(false);
    }
  }, [readOnly]);

  React.useEffect(() => { fetchList(); }, [fetchList]);

  // Derived filters + filtered data
  const filtered = React.useMemo(() => {
    const s = String(q || "").toLowerCase();
    return (items || []).filter((b) => {
      if (typeFilter !== 'all' && String(b.type || '') !== typeFilter) return false;
      if (statusFilter !== 'all' && String(b.status || '') !== statusFilter) return false;
      if (!s) return true;
      const hay = [b.code, b.name]
        .map((x)=>String(x||'').toLowerCase());
      return hay.some((x)=>x.includes(s));
    });
  }, [items, q, typeFilter, statusFilter]);

  // Reset page on filters/search change
  React.useEffect(() => { setPage(1); }, [q, typeFilter, statusFilter]);

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
      'Code', 'Name', 'Type', 'Status', 'Executives', 'Mechanics'
    ];
    const rows = filtered.map((b)=>[
      b.code||'', b.name||'', b.type||'', b.status||'', formatTeamEntries(b.team?.executives), formatTeamEntries(b.team?.mechanics)
    ]);
    const csv = [headers, ...rows].map(r => r.map(v => (String(v).includes(',') ? `"${String(v).replace(/"/g,'""')}"` : String(v))).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'branches.csv'; a.click();
    setTimeout(()=>URL.revokeObjectURL(url), 500);
  };

  const onCreate = () => {
    setEditing(null);
    setModalOpen(true);
    // Defer setting defaults until form is mounted in Modal
    setTimeout(() => {
      form.resetFields();
      form.setFieldsValue({ type: "sales & services", status: "active" });
    }, 0);
  };

  const onEdit = (row) => {
    setEditing(row);
    form.setFieldsValue({
      id: row.id,
      code: row.code,
      name: row.name,
      type: row.type,
      status: row.status,
      executives: formatTeamEntries(row.team?.executives),
      mechanics: formatTeamEntries(row.team?.mechanics),
      callboys: formatTeamEntries(row.team?.callboys),
    });
    setModalOpen(true);
  };

  const onDelete = async (row) => {
    Modal.confirm({
      title: `Delete ${row.name}?`,
      content: `This cannot be undone.`,
      okButtonProps: { danger: true },
      okText: "Delete",
      onOk: async () => {
        try {
          const res = await deleteBranch(row.id);
          if (res?.success) {
            message.success("Branch deleted");
            fetchList();
          } else {
            message.error(res?.message || "Delete failed");
          }
        } catch {
          message.error("Delete failed");
        }
      },
    });
  };

  const onSubmit = async () => {
    try {
      const vals = await form.validateFields();
      const payload = {
        code: vals.code,
        name: vals.name,
        type: vals.type,
        status: vals.status,
      };
      const team = {};
      const addTeamField = (key, value) => {
        const entries = parseTeamEntries(value);
        if (entries.length) team[key] = entries;
      };
      addTeamField('executives', vals.executives);
      addTeamField('mechanics', vals.mechanics);
      addTeamField('callboys', vals.callboys);
      if (Object.keys(team).length) payload.team = team;
      setSaving(true);
      let res;
      if (editing?.id) res = await updateBranch(editing.id, payload);
      else res = await createBranch(payload);
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
        message.error(res?.message || "Save failed");
      }
    } catch (e) {
      const msg = e?.response?.data?.message || e?.message || "Save failed";
      message.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const columns = [
    { title: "Code", dataIndex: "code", key: "code", width: 110, sorter: (a, b) => a.code.localeCompare(b.code) },
    { title: "Name", dataIndex: "name", key: "name", sorter: (a, b) => a.name.localeCompare(b.name) },
    { title: "Type", dataIndex: "type", key: "type", width: 150, render: (v) => {
      const color = v === 'sales' ? 'geekblue' : v === 'service' ? 'cyan' : 'blue';
      return <Tag color={color}>{v}</Tag>;
    } },
    { title: "Executives", dataIndex: "team", key: "executives", width: 180, render: (team) => renderTeamCell(team?.executives) },
    { title: "Mechanics", dataIndex: "team", key: "mechanics", width: 180, render: (team) => renderTeamCell(team?.mechanics) },
    { title: "Status", dataIndex: "status", key: "status", width: 160, render: (v) => (
      v === "active" ? <Tag color="green">Active</Tag> : v === "inactive" ? <Tag>Inactive</Tag> : <Tag color="orange">Under Maintenance</Tag>
    ) },
    ...(!readOnly ? [{
      title: "Actions",
      key: "actions",
      width: 180,
      render: (_, row) => (
        <Space>
          <Button size="small" onClick={() => onEdit(row)}>Edit</Button>
          <Button size="small" danger onClick={() => onDelete(row)}>Delete</Button>
        </Space>
      ),
    }] : []),
  ];

  return (
    <div>
      <div style={{ display: "flex", gap: 8, alignItems: 'center', marginBottom: 12, flexWrap: 'wrap' }}>
        <Space size={[8,8]} wrap>
          <Input.Search placeholder="Search code/name" allowClear value={q} onChange={(e)=>setQ(e.target.value)} style={{ minWidth: 220 }} />
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
        scroll={{ x: 'max-content' }}
        pagination={{
          current: page,
          pageSize,
          showSizeChanger: true,
          pageSizeOptions: ['10','25','50','100'],
          onChange: (p, ps) => { setPage(p); if (ps !== pageSize) setPageSize(ps); },
          showTotal: (total, range) => `${range[0]}-${range[1]} of ${total}`,
        }}
        size="middle"
      />

      <Modal
        title={editing ? `Edit Branch – ${editing.name}` : "New Branch"}
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
                <Input placeholder="e.g., BDRH" maxLength={10} />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item name="name" label="Name" rules={[{ required: true, message: "Name is required" }]}>
                <Input placeholder="e.g., Byadarahalli Branch" />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12}>
              <Form.Item name="type" label="Type" initialValue="sales & services" rules={[{ required: true }]}>
                <Select options={TYPE_OPTIONS} />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item name="status" label="Status" initialValue="active" rules={[{ required: true }]}>
                <Select options={STATUS_OPTIONS} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={[12, 8]}>
            <Col xs={24} sm={8}>
              <Form.Item name="executives" label="Executives">
                <Input.TextArea
                  placeholder="Name per line (optional phone e.g., 'Ravi | 9731...')"
                  rows={3}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={8}>
              <Form.Item name="mechanics" label="Mechanics">
                <Input.TextArea
                  placeholder="Mechanic name per line (phone optional)"
                  rows={3}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={8}>
              <Form.Item name="callboys" label="Callboys / Staff">
                <Input.TextArea
                  placeholder="Optional staff names (one per line)"
                  rows={3}
                />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </div>
  );
}
