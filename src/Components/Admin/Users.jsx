import React from "react";
import dayjs from "dayjs";
import { Table, Button, Space, Modal, Form, Input, Select, message, Tag, Checkbox, Row, Col, Grid, InputNumber, Popover } from "antd";
import { listUsers, listUsersPublic, updateUser, deleteUser } from "../../apiCalls/adminUsers";
import { listBranches } from "../../apiCalls/branches";
import { exportToCsv } from "../../utils/csvExport";

const ROLE_OPTIONS = [
  { label: "Owner", value: "owner" },
  { label: "Staff", value: "staff" },
  { label: "Mechanic", value: "mechanic" },
  { label: "User", value: "user" },
  { label: "Backend", value: "backend" },
];

const STATUS_OPTIONS = [
  { label: "Active", value: "active" },
  { label: "Inactive", value: "inactive" },
  { label: "Suspended", value: "suspended" },
];

export default function Users({ readOnly = false }) {
  const screens = Grid.useBreakpoint();
  const isMobile = !screens.md;
  const [loading, setLoading] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [items, setItems] = React.useState([]);
  const [total, setTotal] = React.useState(0);
  const [modalOpen, setModalOpen] = React.useState(false);
  const [editing, setEditing] = React.useState(null);
  const [branches, setBranches] = React.useState([]);
  const [owners, setOwners] = React.useState([]);
  const [form] = Form.useForm();
  const roleValue = Form.useWatch("role", form);
  const ownerBranchLimitValue = Form.useWatch("ownerBranchLimit", form);
  const isOwnerRole = String(roleValue || "").toLowerCase() === "owner";
  const getRowId = React.useCallback((row) => row?.id || row?._id || row?.userId || null, []);

  // Quick filters
  const [qText, setQText] = React.useState(""); // input value
  const [q, setQ] = React.useState("");        // applied query
  const [roleFilter, setRoleFilter] = React.useState();
  const [statusFilter, setStatusFilter] = React.useState();
  const [branchFilter, setBranchFilter] = React.useState();
  // Controlled pagination (client-side)
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(25);
  const objectIdRe = /^[0-9a-fA-F]{24}$/;
  const toId = (v) => {
    if (!v) return undefined;
    if (typeof v === "string") return v;
    if (typeof v === "object") return String(v._id || v.id || "");
    return String(v);
  };
  const resolveBranchId = React.useCallback((branchLike) => {
    if (!branchLike) return undefined;
    const raw = typeof branchLike === "object"
      ? String(branchLike._id || branchLike.id || branchLike.name || "").trim()
      : String(branchLike).trim();
    if (!raw) return undefined;
    if (objectIdRe.test(raw)) return raw;
    const byName = branches.find((b) => String(b.name || "").trim().toLowerCase() === raw.toLowerCase());
    return byName ? String(byName.id || byName._id || "") : undefined;
  }, [branches]);

  const fetchBranches = React.useCallback(async () => {
    const res = await listBranches({ limit: 500, status: 'active' });
    if (res?.success) setBranches(res.data.items || []);
  }, []);

  const fetchOwners = React.useCallback(async () => {
    const res = await listUsers({ role: 'owner', limit: 500, page: 1 });
    if (res?.success) setOwners(res.data.items || []);
  }, []);

  const fetchList = React.useCallback(async () => {
    setLoading(true);
    try {
      if (readOnly) {
        const pub = await listUsersPublic({
          limit: 100000,
          page: 1,
          ...(q ? { q } : {}),
          ...(roleFilter ? { role: roleFilter } : {}),
          ...(statusFilter ? { status: statusFilter } : {}),
          ...(branchFilter ? { branch: branchFilter } : {}),
        });
        if (pub?.success) {
          setItems(pub.data.items || []);
          setTotal(pub.data.total || (pub.data.items?.length || 0));
        } else {
          message.error(pub?.message || "Failed to load users");
          setItems([]); setTotal(0);
        }
      } else {
        const res = await listUsers({
          limit: 100000,
          page: 1,
          ...(q ? { q } : {}),
          ...(roleFilter ? { role: roleFilter } : {}),
          ...(statusFilter ? { status: statusFilter } : {}),
          ...(branchFilter ? { branch: branchFilter } : {}),
        });
        if (res?.success) {
          setItems(res.data.items || []);
          setTotal(res.data.total || (res.data.items?.length || 0));
        } else if (res?._status === 401 || res?._status === 403) {
          // Fallback to public list (read-only) similar to branches
          const pub = await listUsersPublic({
            limit: 100000,
            page: 1,
            ...(q ? { q } : {}),
            ...(roleFilter ? { role: roleFilter } : {}),
            ...(statusFilter ? { status: statusFilter } : {}),
            ...(branchFilter ? { branch: branchFilter } : {}),
          })
          if (pub?.success) {
            message.info("Showing public user list (read-only). Sign in for management.");
            setItems(pub.data.items || []);
            setTotal(pub.data.total || (pub.data.items?.length || 0));
          } else {
            message.error(res?.message || "Failed to load users");
            setItems([]); setTotal(0);
          }
        } else {
          message.error(res?.message || "Failed to load users");
        }
      }
    } catch (e) {
      message.error(e?.message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  }, [q, roleFilter, statusFilter, branchFilter, readOnly]);

  React.useEffect(() => { fetchBranches(); }, [fetchBranches]);
  React.useEffect(() => { fetchOwners(); }, [fetchOwners]);
  React.useEffect(() => { fetchList(); }, [fetchList]);
  React.useEffect(() => { setPage(1); }, [q, roleFilter, statusFilter, branchFilter]);

  const onEdit = (row) => {
    const rowId = getRowId(row);
    if (!rowId) {
      message.error("User ID missing. Please refresh and try again.");
      return;
    }
    setEditing({ ...row, id: rowId });
    form.setFieldsValue({
      id: rowId,
      name: row.name,
      email: row.email,
      phone: row.phone,
      role: row.role,
      status: row.status,
      primaryBranch: resolveBranchId(row.primaryBranch),
      branches: Array.isArray(row.branches)
        ? row.branches.map((b) => resolveBranchId(b)).filter(Boolean)
        : undefined,
      canSwitchBranch: !!row.canSwitchBranch,
      ownerBranchLimit: row.ownerLimits?.branchLimit ?? undefined,
      owner: row.owner?._id || row.owner || undefined,
    });
    setModalOpen(true);
  };

  const onDelete = async (row) => {
    const rowId = getRowId(row);
    if (!rowId) {
      message.error("User ID missing. Please refresh and try again.");
      return;
    }
    Modal.confirm({
      title: `Delete ${row.name}?`,
      content: `This cannot be undone.`,
      okButtonProps: { danger: true },
      okText: "Delete",
      onOk: async () => {
        try {
          const res = await deleteUser(rowId);
          if (res?.success) {
            message.success("User deleted");
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
      const primaryBranch = vals.primaryBranch || undefined;
      const additionalBranches = Array.isArray(vals.branches)
        ? vals.branches.filter((b) => b && b !== primaryBranch)
        : [];
      const assignedBranchIds = Array.from(new Set([...(primaryBranch ? [primaryBranch] : []), ...additionalBranches]));
      const limitNum = vals.ownerBranchLimit == null ? undefined : Number(vals.ownerBranchLimit);
      if (isOwnerRole && Number.isFinite(limitNum) && limitNum >= 0 && assignedBranchIds.length > limitNum) {
        const errMsg = `Selected branches (${assignedBranchIds.length}) exceed owner branch limit (${limitNum})`;
        form.setFields([{ name: "branches", errors: [errMsg] }]);
        message.error(errMsg);
        return;
      }
      const payload = {
        name: vals.name,
        email: vals.email,
        ...(vals.phone ? { phone: vals.phone } : {}),
        role: vals.role,
        status: vals.status,
        ...(primaryBranch ? { primaryBranch } : {}),
        ...(Array.isArray(additionalBranches) ? { branches: additionalBranches } : {}),
        ...(vals.owner ? { owner: vals.owner } : {}),
        canSwitchBranch: !!vals.canSwitchBranch,
        ...(vals.ownerBranchLimit != null ? { ownerLimits: { branchLimit: vals.ownerBranchLimit } } : {}),
      };
      setSaving(true);
      const editingId = getRowId(editing);
      if (!editingId) {
        message.error("Cannot create users here. Use registration.");
        return;
      }
      const res = await updateUser(editingId, payload);
      if (res?._status === 401 || res?._status === 403) {
        message.warning("Please login again to continue.");
        return;
      }
      if (res?.success) {
        message.success("User updated");
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

  const branchOptions = branches.map((b) => ({ label: b.name, value: String(b.id || b._id || "") })).filter((o) => o.value);
  const branchNameById = React.useMemo(() => {
    const m = new Map();
    branches.forEach((b) => {
      const id = String(b.id || b._id || "");
      if (id) m.set(id, b.name || id);
    });
    return m;
  }, [branches]);
  const getBranchLabel = React.useCallback((branchLike) => {
    if (!branchLike) return "—";
    if (typeof branchLike === "object") {
      return branchLike.name || branchNameById.get(String(branchLike._id || branchLike.id || "")) || "—";
    }
    return branchNameById.get(String(branchLike)) || String(branchLike);
  }, [branchNameById]);
  const renderBranchTags = React.useCallback((names = [], maxVisible = 2) => {
    if (!names.length) return "—";
    const visible = names.slice(0, maxVisible);
    const hidden = names.slice(maxVisible);
    return (
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
        {visible.map((name) => (
          <Tag key={name} color="blue" style={{ marginInlineEnd: 0 }}>
            {name}
          </Tag>
        ))}
        {hidden.length ? (
          <Popover
            trigger="click"
            content={
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, maxWidth: 240 }}>
                {hidden.map((name) => (
                  <Tag key={`more-${name}`} color="blue" style={{ marginInlineEnd: 0 }}>
                    {name}
                  </Tag>
                ))}
              </div>
            }
          >
            <Tag color="gold" style={{ cursor: "pointer", marginInlineEnd: 0 }}>+{hidden.length} more</Tag>
          </Popover>
        ) : null}
      </div>
    );
  }, []);

  const columns = [
    { title: "Name", dataIndex: "name", key: "name", width: 160, ellipsis: true, sorter: (a, b) => a.name.localeCompare(b.name) },
    { title: "Email", dataIndex: "email", key: "email", width: 180, ellipsis: true },
    { title: "Phone", dataIndex: "phone", key: "phone", width: 110, ellipsis: true },
    { title: "Role", dataIndex: "role", key: "role", width: 100, render: (v) => <Tag color={v === 'admin' ? 'red' : v === 'owner' ? 'gold' : v === 'backend' ? 'purple' : v === 'mechanic' ? 'cyan' : v === 'staff' ? 'blue' : 'default'}>{v}</Tag> },
    { title: "Primary Branch", key: "primaryBranch", width: 140, ellipsis: true, render: (_, r) => getBranchLabel(r.primaryBranch) },
    {
      title: "Additional Branches",
      key: "branches",
      width: 280,
      ellipsis: true,
      render: (_, r) => {
        const primaryId = toId(r.primaryBranch);
        const names = (Array.isArray(r.branches) ? r.branches : [])
          .filter((b) => toId(b) !== primaryId)
          .map((b) => getBranchLabel(b))
          .filter((n) => n && n !== "—");
        return renderBranchTags(names, 2);
      },
    },
    { title: "Branch Limit", key: "branchLimit", width: 120, render: (_, r) => r?.ownerLimits?.branchLimit ?? "—" },
    { title: "Status", dataIndex: "status", key: "status", width: 90, render: (v) => (
      v === "active" ? <Tag color="green">Active</Tag> : v === "inactive" ? <Tag>Inactive</Tag> : <Tag color="orange">Suspended</Tag>
    ) },
    { title: "Last Login", dataIndex: "lastLoginAt", key: "lastLoginAt", width: 140, render: (v) => v ? dayjs(v).format("DD-MM-YYYY HH:mm") : "—" },
    ...(!readOnly ? [{
      title: "Actions",
      key: "actions",
      width: 160,
      render: (_, row) => (
        <Space size={4} wrap>
          <Button size="small" onClick={(e) => { e.stopPropagation(); onEdit(row); }}>Edit</Button>
          <Button size="small" danger onClick={(e) => { e.stopPropagation(); onDelete(row); }}>Delete</Button>
        </Space>
      ),
    }] : []),
  ];

  const handleExportCsv = () => {
    if (!items.length) {
      message.info('No users to export for current filters');
      return;
    }
    const headers = [
      { key: 'name', label: 'Name' },
      { key: 'email', label: 'Email' },
      { key: 'phone', label: 'Phone' },
      { key: 'role', label: 'Role' },
      { key: 'status', label: 'Status' },
      { key: 'primaryBranch', label: 'Primary Branch' },
      { key: 'branches', label: 'Additional Branches' },
      { key: 'lastLoginAt', label: 'Last Login' },
    ];
    const rowsForCsv = items.map((u) => {
      const branchNames = Array.isArray(u.branches)
        ? u.branches.map((b) => (typeof b === 'string' ? b : (b?.name || b?.branchName || ''))).filter(Boolean).join('; ')
        : '';
      return {
        name: u.name,
        email: u.email,
        phone: u.phone,
        role: u.role,
        status: u.status,
        primaryBranch: (typeof u.primaryBranch === 'string' ? u.primaryBranch : u.primaryBranch?.name) || '',
        branches: branchNames,
        lastLoginAt: u.lastLoginAt,
      };
    });
    exportToCsv({ filename: 'users.csv', headers, rows: rowsForCsv });
    message.success(`Exported ${rowsForCsv.length} users`);
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12, gap: 12, alignItems: "center", flexWrap: "wrap" }}>
        <div>
          <strong>Total:</strong> {total}
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
          <Input.Search
            placeholder="Search name/email/phone"
            allowClear
            value={qText}
            onChange={(e) => setQText(e.target.value)}
            onSearch={(val) => setQ((val || "").trim())}
            style={{ width: 240 }}
          />
          <Select
            placeholder="Role"
            allowClear
            value={roleFilter}
            onChange={(v) => setRoleFilter(v)}
            options={ROLE_OPTIONS}
            style={{ width: 140 }}
          />
          <Select
            placeholder="Status"
            allowClear
            value={statusFilter}
            onChange={(v) => setStatusFilter(v)}
            options={STATUS_OPTIONS}
            style={{ width: 140 }}
          />
          <Select
            placeholder="Branch"
            allowClear
            showSearch
            optionFilterProp="label"
            value={branchFilter}
            onChange={(v) => setBranchFilter(v)}
            options={branches.map((b) => ({ label: b.name, value: String(b.id || b._id || "") })).filter((o) => o.value)}
            style={{ width: 220 }}
          />
          <Button onClick={handleExportCsv}>Export CSV</Button>
          <Button onClick={fetchList}>Refresh</Button>
          <Button onClick={() => { setQText(""); setQ(""); setRoleFilter(undefined); setStatusFilter(undefined); setBranchFilter(undefined); }}>Reset</Button>
        </div>
      </div>
      {isMobile ? (
        <div style={{ marginBottom: 8 }}>
          <Tag color="processing">Swipe left/right to view all columns</Tag>
        </div>
      ) : null}
      <Table
        rowKey={(r) => getRowId(r) || `${r.email || ''}-${r.phone || ''}-${r.name || ''}`}
        dataSource={items}
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
        bordered
        sticky
        scroll={{ x: 1600 }}
      />

      <Modal
        title={editing ? `Edit User – ${editing.name}` : "New User"}
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
              <Form.Item name="name" label="Name" rules={[{ required: true, message: "Name is required" }]}>
                <Input placeholder="Full name" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item name="email" label="Email" rules={[{ required: true, message: "Email is required" }, { type: 'email', message: 'Enter a valid email' }]}>
                <Input placeholder="name@example.com" />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12}>
              <Form.Item name="phone" label="Phone">
                <Input placeholder="Mobile number" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              {/* No user creation here; password changes are handled elsewhere */}
              <Form.Item name="role" label="Role" initialValue="user" rules={[{ required: true }]}>
                <Select options={ROLE_OPTIONS} />
              </Form.Item>
            </Col>
            {["staff", "mechanic"].includes(String(roleValue || "").toLowerCase()) ? (
              <Col xs={24} sm={12}>
                <Form.Item name="owner" label="Owner" rules={[{ required: true, message: "Owner is required" }]}>
                  <Select options={owners.map(o => ({ label: `${o.name} (${o.email})`, value: o._id }))} placeholder="Select owner" />
                </Form.Item>
              </Col>
            ) : null}

            <Col xs={24} sm={12}>
              <Form.Item name="status" label="Status" initialValue="active" rules={[{ required: true }]}>
                <Select options={STATUS_OPTIONS} />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item name="ownerBranchLimit" label="Owner Branch Limit">
                <InputNumber min={0} style={{ width: "100%" }} placeholder="Set branch limit" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                name="primaryBranch"
                label="Primary Branch"
                rules={isOwnerRole ? [{ required: true, message: "Primary Branch is required for owner assignment" }] : undefined}
              >
                <Select
                  allowClear
                  showSearch
                  optionFilterProp="label"
                  options={branchOptions}
                  placeholder="Select primary branch"
                />
              </Form.Item>
            </Col>

            <Col span={24}>
              <Form.Item
                name="branches"
                label="Additional Branches"
                extra={
                  isOwnerRole && ownerBranchLimitValue != null
                    ? `Total assigned (primary + additional) must be <= ${ownerBranchLimitValue}`
                    : undefined
                }
              >
                <Select
                  mode="multiple"
                  allowClear
                  showSearch
                  optionFilterProp="label"
                  options={branchOptions}
                  placeholder="Select additional branches"
                />
              </Form.Item>
            </Col>

            <Col span={24}>
              <Form.Item name="canSwitchBranch" valuePropName="checked">
                <Checkbox>Can switch branches</Checkbox>
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </div>
  );
}
