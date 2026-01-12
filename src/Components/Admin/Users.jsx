import React from "react";
import { Table, Button, Space, Modal, Form, Input, Select, message, Tag, Row, Col } from "antd";
import { listUsers, listUsersPublic, updateUser, deleteUser, createUser } from "../../apiCalls/adminUsers";
import { listBranchesPublic } from "../../apiCalls/branches";
import { exportToCsv } from "../../utils/csvExport";

const ROLE_OPTIONS = [
  { label: "Admin", value: "admin" },
  { label: "Owner", value: "owner" },
  { label: "Staff", value: "staff" },
  { label: "Mechanic", value: "mechanic" },
  { label: "Call Boy", value: "callboy" },
  { label: "Employees", value: "employees" },
  { label: "User", value: "user" },
  { label: "Backend", value: "backend" },
];

const STATUS_OPTIONS = [
  { label: "Active", value: "active" },
  { label: "Inactive", value: "inactive" },
  { label: "Suspended", value: "suspended" },
];

export default function Users({ readOnly = false }) {
  const [loading, setLoading] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [items, setItems] = React.useState([]);
  const [total, setTotal] = React.useState(0);
  const [modalOpen, setModalOpen] = React.useState(false);
  const [editing, setEditing] = React.useState(null);
  const [branches, setBranches] = React.useState([]);
  const [form] = Form.useForm();

  // Quick filters
  const [qText, setQText] = React.useState(""); // input value
  const [q, setQ] = React.useState("");        // applied query
  const [roleFilter, setRoleFilter] = React.useState();
  const [statusFilter, setStatusFilter] = React.useState();
  const [branchFilter, setBranchFilter] = React.useState();
  // Controlled pagination (client-side)
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(25);

  const fetchBranches = React.useCallback(async () => {
    const res = await listBranchesPublic({ limit: 500, status: 'active' });
    if (res?.success) setBranches(res.data.items || []);
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
  React.useEffect(() => { fetchList(); }, [fetchList]);
  React.useEffect(() => { setPage(1); }, [q, roleFilter, statusFilter, branchFilter]);

  const roleValue = Form.useWatch("role", form);
  const needsBranch = ["staff", "mechanic", "callboy"].includes(String(roleValue || "").toLowerCase());
  const isOwnerRole = String(roleValue || "").toLowerCase() === "owner";

  const onCreate = () => {
    setEditing(null);
    form.resetFields();
    form.setFieldsValue({ role: "staff", status: "active" });
    setModalOpen(true);
  };

  const onEdit = (row) => {
    setEditing(row);
    form.resetFields();
    form.setFieldsValue({
      id: row.id,
      name: row.name,
      email: row.email,
      phone: row.phone,
      role: row.role,
      status: row.status,
      branchId: row.branchId || row.primaryBranch?._id || row.primaryBranch?.id || row.primaryBranch || undefined,
      maxBranches: row.owner?.maxBranches || undefined,
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
          const res = await deleteUser(row.id);
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
      const role = String(vals.role || "").toLowerCase();
      const branchId = vals.branchId || undefined;
      const payload = {
        name: vals.name,
        email: vals.email,
        ...(vals.phone ? { phone: vals.phone } : {}),
        role,
        status: vals.status,
        ...(branchId ? { branchId } : {}),
        ...(vals.password ? { password: vals.password } : {}),
        ...(vals.maxBranches ? { maxBranches: Number(vals.maxBranches) } : {}),
      };
      if (role === "backend") {
        delete payload.branchId;
      }
      setSaving(true);
      const res = editing?.id ? await updateUser(editing.id, payload) : await createUser(payload);
      if (res?._status === 401 || res?._status === 403) {
        message.warning("Please login again to continue.");
        return;
      }
      if (res?.success) {
        message.success(editing?.id ? "User updated" : "User created");
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

  const branchOptions = branches.map((b) => ({ label: b.name, value: b.id }));

  const columns = [
    { title: "Name", dataIndex: "name", key: "name", sorter: (a, b) => a.name.localeCompare(b.name) },
    { title: "Email", dataIndex: "email", key: "email", width: 220 },
    { title: "Phone", dataIndex: "phone", key: "phone", width: 140 },
    { title: "Role", dataIndex: "role", key: "role", width: 130, render: (v) => <Tag color={v === 'admin' ? 'red' : v === 'owner' ? 'gold' : v === 'backend' ? 'purple' : v === 'mechanic' ? 'cyan' : v === 'callboy' ? 'magenta' : v === 'staff' ? 'blue' : 'default'}>{v}</Tag> },
    { title: "Branch", key: "branch", width: 180, render: (_, r) => r.primaryBranch?.name || r.formDefaults?.branchName || "—" },
    { title: "Status", dataIndex: "status", key: "status", width: 130, render: (v) => (
      v === "active" ? <Tag color="green">Active</Tag> : v === "inactive" ? <Tag>Inactive</Tag> : <Tag color="orange">Suspended</Tag>
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
      { key: 'primaryBranch', label: 'Branch' },
      { key: 'maxBranches', label: 'Max Branches' },
    ];
    const rowsForCsv = items.map((u) => {
      return {
        name: u.name,
        email: u.email,
        phone: u.phone,
        role: u.role,
        status: u.status,
        primaryBranch: (typeof u.primaryBranch === 'string' ? u.primaryBranch : u.primaryBranch?.name) || u.formDefaults?.branchName || '',
        maxBranches: u.owner?.maxBranches || '',
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
            options={branches.map((b) => ({ label: b.name, value: b.id }))}
            style={{ width: 220 }}
          />
          {!readOnly && <Button type="primary" onClick={onCreate}>Add User</Button>}
          <Button onClick={handleExportCsv}>Export CSV</Button>
          <Button onClick={fetchList}>Refresh</Button>
          <Button onClick={() => { setQText(""); setQ(""); setRoleFilter(undefined); setStatusFilter(undefined); setBranchFilter(undefined); }}>Reset</Button>
        </div>
      </div>
      <Table
        rowKey={(r) => r.id}
        dataSource={items}
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
              <Form.Item name="role" label="Role" initialValue="user" rules={[{ required: true }]}>
                <Select options={ROLE_OPTIONS} />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12}>
              <Form.Item name="status" label="Status" initialValue="active" rules={[{ required: true }]}>
                <Select options={STATUS_OPTIONS} />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                name="password"
                label={editing ? "Reset Password" : "Password"}
                rules={[{ required: !editing, message: "Password is required" }]}
              >
                <Input.Password placeholder={editing ? "Leave blank to keep existing" : "Set a password"} />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12}>
              <Form.Item
                name="branchId"
                label="Branch"
                hidden={!needsBranch}
                rules={[{ required: needsBranch, message: "Branch is required for staff/mechanic/callboy" }]}
              >
                <Select allowClear options={branchOptions} placeholder="Select branch" />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12}>
              <Form.Item
                name="maxBranches"
                label="Max Branches"
                hidden={!isOwnerRole}
                rules={isOwnerRole ? [{ required: true, message: "Max branches is required" }] : []}
              >
                <Input type="number" min={1} placeholder="e.g., 1" />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </div>
  );
}
