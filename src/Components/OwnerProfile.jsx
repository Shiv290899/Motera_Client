import React from "react";
import dayjs from "dayjs";
import { Card, Form, Input, InputNumber, Button, Typography, Space, message, Select, Divider, Checkbox } from "antd";
import { GetCurrentUser, UpdateOwnerProfile, CreateInviteLink } from "../apiCalls/users";
import { listBranches } from "../apiCalls/branches";
import { applyTemplatePlaceholders, normalizeImageUrl, normalizeOwnerFreeFittingsConfig, normalizeQuotationWhatsAppTemplate, resolveLocationQrImageUrl, toGoogleImageFallbackUrl, toRenderableImageUrl } from "../utils/ownerConfig";

const { Title, Text } = Typography;
const ORG_FONT_FAMILY_OPTIONS = [
  { label: "Arial", value: "Arial, sans-serif" },
  { label: "Helvetica", value: "Helvetica, Arial, sans-serif" },
  { label: "Times New Roman", value: "\"Times New Roman\", Times, serif" },
  { label: "Georgia", value: "Georgia, serif" },
  { label: "Verdana", value: "Verdana, sans-serif" },
  { label: "Trebuchet MS", value: "\"Trebuchet MS\", sans-serif" },
  { label: "Tahoma", value: "Tahoma, sans-serif" },
  { label: "Garamond", value: "Garamond, serif" },
  { label: "Noto Sans", value: "\"Noto Sans\", sans-serif" },
  { label: "Noto Sans Kannada", value: "\"Noto Sans Kannada\", sans-serif" },
];
const ORG_NAME_COLOR_OPTIONS = [
  { label: "Black", value: "#000000" },
  { label: "Dark Gray", value: "#1f2937" },
  { label: "Navy", value: "#1e3a8a" },
  { label: "Maroon", value: "#7f1d1d" },
  { label: "Green", value: "#14532d" },
];

const readUser = () => {
  try { return JSON.parse(localStorage.getItem("user") || "null"); } catch { return null; }
};
const normalizeMechanics = (raw) => {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((item) => {
      const name = String(item?.name || item || "").trim();
      const phone = String(item?.phone || item?.mobile || item?.contact || "").replace(/\D/g, "").slice(-10);
      return name ? { name, ...(phone ? { phone } : {}) } : null;
    })
    .filter(Boolean);
};

const toLineBlock = (value) => {
  if (Array.isArray(value)) return value.map((v) => String(v || "").trim()).filter(Boolean).join("\n");
  return String(value || "").trim();
};

const normalizeWebhookUrl = (value) => {
  let raw = String(value || "").trim();
  if (!raw) return "";
  if (/^tps:\/\//i.test(raw)) raw = `h${raw}`;
  if (/^https\/\//i.test(raw)) raw = raw.replace(/^https\/\//i, "https://");
  if (/^http\/\//i.test(raw)) raw = raw.replace(/^http\/\//i, "http://");
  if (/^http:\/\//i.test(raw)) raw = raw.replace(/^http:\/\//i, "https://");
  if (/^script\.google\.com\/macros\/s\//i.test(raw)) raw = `https://${raw}`;
  return raw;
};

const isValidAppsScriptWebhookUrl = (value) => {
  const v = normalizeWebhookUrl(value);
  return /^https:\/\/script\.google\.com\/macros\/s\/[^/]+\/exec(?:\?.*)?$/i.test(v);
};

const getDefaultWaIntroLines = () => normalizeQuotationWhatsAppTemplate({}).introLines.join("\n");

const getDefaultWaLocations = (orgAddress) => {
  const fromAddress = String(orgAddress || "")
    .split(/\r?\n/g)
    .map((v) => String(v || "").trim())
    .filter(Boolean)
    .join("\n");
  return fromAddress || "{Organization Address}";
};

const resolveWaIntroValue = (ownerConfig) => {
  const raw = String(ownerConfig?.quotationWaIntroLine || "").trim();
  return raw || getDefaultWaIntroLines();
};

const resolveWaLocationsValue = (ownerConfig, orgAddress) => {
  const raw = toLineBlock(ownerConfig?.quotationWaLocations);
  return raw || getDefaultWaLocations(orgAddress);
};

const toUniqueLines = (value) => {
  const seen = new Set();
  return String(value || "")
    .split(/\r?\n/g)
    .map((v) => String(v || "").trim())
    .filter(Boolean)
    .filter((v) => {
      const k = v.toLowerCase();
      if (seen.has(k)) return false;
      seen.add(k);
      return true;
    });
};

const resolveFreeFittingsOptionsValue = (ownerConfig) => {
  const cfg = normalizeOwnerFreeFittingsConfig(ownerConfig || {});
  return cfg.options.join("\n");
};

const resolveFreeFittingsDefaultSelected = (ownerConfig) => {
  const cfg = normalizeOwnerFreeFittingsConfig(ownerConfig || {});
  return cfg.defaultSelected;
};

const forceUpper = (value) => String(value || "").toUpperCase();

export default function OwnerProfile() {
  const [form] = Form.useForm();
  const [saving, setSaving] = React.useState(false);
  const [user, setUser] = React.useState(() => readUser());
  const logoPreview = toRenderableImageUrl(Form.useWatch("logoUrl", form));
  const locationQrPreview = resolveLocationQrImageUrl(Form.useWatch("locationQrUrl", form));
  const [logoPreviewFailed, setLogoPreviewFailed] = React.useState(false);
  const [locationQrPreviewFailed, setLocationQrPreviewFailed] = React.useState(false);
  const handleImagePreviewError = React.useCallback((e, setFailed) => {
    const img = e.currentTarget;
    const current = String(img?.currentSrc || img?.src || "").trim();
    const next = toGoogleImageFallbackUrl(current);
    if (next && next !== current && img?.dataset?.fallbackTried !== "1") {
      img.dataset.fallbackTried = "1";
      img.src = next;
      return;
    }
    setFailed(true);
  }, []);
  const orgNamePreview = Form.useWatch("orgName", form);
  const ownerNamePreview = Form.useWatch("name", form);
  const orgNameRegionalPreview = Form.useWatch("orgNameRegional", form);
  const orgAddrPreview = Form.useWatch("orgAddress", form);
  const orgAddressFontSizePtPreview = Form.useWatch("orgAddressFontSizePt", form);
  const orgAddressFontWeightPreview = Form.useWatch("orgAddressFontWeight", form);
  const orgMobilesPreview = Form.useWatch("orgMobiles", form);
  const orgNameFontFamilyPreview = Form.useWatch("orgNameFontFamily", form);
  const orgNameRegionalFontFamilyPreview = Form.useWatch("orgNameRegionalFontFamily", form);
  const orgNameFontSizePtPreview = Form.useWatch("orgNameFontSizePt", form);
  const orgNameRegionalFontSizePtPreview = Form.useWatch("orgNameRegionalFontSizePt", form);
  const orgNameFontWeightPreview = Form.useWatch("orgNameFontWeight", form);
  const orgNameRegionalFontWeightPreview = Form.useWatch("orgNameRegionalFontWeight", form);
  const orgNameFontColorPreview = Form.useWatch("orgNameFontColor", form);
  const quotationWaIntroLinePreview = Form.useWatch("quotationWaIntroLine", form);
  const quotationWaLocationsPreview = Form.useWatch("quotationWaLocations", form);
  const freeFittingsOptionsPreview = Form.useWatch("freeFittingsOptions", form);
  const freeFittingsDefaultSelectedPreview = Form.useWatch("freeFittingsDefaultSelected", form);
  const [inviteRole, setInviteRole] = React.useState("staff");
  const [inviteBranchId, setInviteBranchId] = React.useState("");
  const [inviteUrl, setInviteUrl] = React.useState("");
  const [inviteLoading, setInviteLoading] = React.useState(false);
  const [branchOptions, setBranchOptions] = React.useState([]);
  const [copyingInvite, setCopyingInvite] = React.useState(false);
  const [sharingInvite, setSharingInvite] = React.useState(false);

  const copyInviteLink = React.useCallback(async () => {
    const link = String(inviteUrl || "").trim();
    if (!link) {
      message.warning("Create invite link first");
      return;
    }
    setCopyingInvite(true);
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(link);
      } else {
        const temp = document.createElement("textarea");
        temp.value = link;
        temp.setAttribute("readonly", "");
        temp.style.position = "absolute";
        temp.style.left = "-9999px";
        document.body.appendChild(temp);
        temp.select();
        document.execCommand("copy");
        document.body.removeChild(temp);
      }
      message.success("Invite link copied");
    } catch {
      message.error("Failed to copy invite link");
    } finally {
      setCopyingInvite(false);
    }
  }, [inviteUrl]);

  const shareInviteLink = React.useCallback(async () => {
    const link = String(inviteUrl || "").trim();
    if (!link) {
      message.warning("Create invite link first");
      return;
    }
    if (!navigator?.share) {
      message.info("Share not supported on this device. Use Copy Link.");
      return;
    }
    setSharingInvite(true);
    try {
      await navigator.share({
        title: "Motera Staff Invite",
        text: "Use this invite link to join our Motera team.",
        url: link,
      });
    } catch {
      // Ignore user-cancel share silently
    } finally {
      setSharingInvite(false);
    }
  }, [inviteUrl]);

  React.useEffect(() => {
    setLogoPreviewFailed(false);
  }, [logoPreview]);

  React.useEffect(() => {
    setLocationQrPreviewFailed(false);
  }, [locationQrPreview]);

  React.useEffect(() => {
    const options = toUniqueLines(freeFittingsOptionsPreview);
    const selected = Array.isArray(freeFittingsDefaultSelectedPreview)
      ? freeFittingsDefaultSelectedPreview
      : [];
    const filtered = selected.filter((v) => options.includes(String(v || "").trim()));
    if (selected.length !== filtered.length) {
      form.setFieldsValue({ freeFittingsDefaultSelected: filtered });
    }
  }, [freeFittingsOptionsPreview, freeFittingsDefaultSelectedPreview, form]);

  const isOwner = String(user?.role || "").toLowerCase() === "owner";
  const branchLimit = user?.ownerLimits?.branchLimit ?? "—";

  React.useEffect(() => {
    const load = async () => {
      const res = await GetCurrentUser();
      if (res?.success && res?.data) {
        localStorage.setItem("user", JSON.stringify(res.data));
        setUser(res.data);
          form.setFieldsValue({
            name: forceUpper(res.data?.name || ""),
            orgName: forceUpper(res.data?.ownerConfig?.orgName || ""),
            orgNameRegional: res.data?.ownerConfig?.orgNameRegional || "",
            orgNameFontFamily: res.data?.ownerConfig?.orgNameFontFamily || "",
            orgNameRegionalFontFamily: res.data?.ownerConfig?.orgNameRegionalFontFamily || "",
            orgNameFontSizePt: res.data?.ownerConfig?.orgNameFontSizePt ?? 22,
            orgNameRegionalFontSizePt: res.data?.ownerConfig?.orgNameRegionalFontSizePt ?? 23,
            orgNameFontWeight: res.data?.ownerConfig?.orgNameFontWeight ?? 800,
            orgNameRegionalFontWeight: res.data?.ownerConfig?.orgNameRegionalFontWeight ?? 800,
            orgNameFontColor: res.data?.ownerConfig?.orgNameFontColor || "#000000",
            orgAddress: res.data?.ownerConfig?.orgAddress || "",
            orgAddressFontSizePt: res.data?.ownerConfig?.orgAddressFontSizePt ?? 12,
            orgAddressFontWeight: res.data?.ownerConfig?.orgAddressFontWeight ?? 600,
            mechanics: normalizeMechanics(res.data?.ownerConfig?.mechanics),
            orgMobiles: Array.isArray(res.data?.ownerConfig?.orgMobiles)
              ? res.data.ownerConfig.orgMobiles.join(" / ")
              : (res.data?.ownerConfig?.orgMobiles || ""),
            logoUrl: res.data?.ownerConfig?.logoUrl || "",
            locationQrUrl: res.data?.ownerConfig?.locationQrUrl || "",
            webhookUrl: res.data?.ownerConfig?.webhookUrl || "",
            processingFee: res.data?.ownerConfig?.processingFee ?? 8000,
            flatInterestRate: res.data?.ownerConfig?.flatInterestRate ?? 11,
            quotationWaIntroLine: resolveWaIntroValue(res.data?.ownerConfig),
            quotationWaLocations: resolveWaLocationsValue(
              res.data?.ownerConfig,
              res.data?.ownerConfig?.orgAddress
            ),
            freeFittingsOptions: resolveFreeFittingsOptionsValue(res.data?.ownerConfig),
            freeFittingsDefaultSelected: resolveFreeFittingsDefaultSelected(res.data?.ownerConfig),
          });
      } else {
        const u = readUser();
        if (u) {
          setUser(u);
          form.setFieldsValue({
            name: forceUpper(u?.name || ""),
            orgName: forceUpper(u?.ownerConfig?.orgName || ""),
            orgNameRegional: u?.ownerConfig?.orgNameRegional || "",
            orgNameFontFamily: u?.ownerConfig?.orgNameFontFamily || "",
            orgNameRegionalFontFamily: u?.ownerConfig?.orgNameRegionalFontFamily || "",
            orgNameFontSizePt: u?.ownerConfig?.orgNameFontSizePt ?? 22,
            orgNameRegionalFontSizePt: u?.ownerConfig?.orgNameRegionalFontSizePt ?? 23,
            orgNameFontWeight: u?.ownerConfig?.orgNameFontWeight ?? 800,
            orgNameRegionalFontWeight: u?.ownerConfig?.orgNameRegionalFontWeight ?? 800,
            orgNameFontColor: u?.ownerConfig?.orgNameFontColor || "#000000",
            orgAddress: u?.ownerConfig?.orgAddress || "",
            orgAddressFontSizePt: u?.ownerConfig?.orgAddressFontSizePt ?? 12,
            orgAddressFontWeight: u?.ownerConfig?.orgAddressFontWeight ?? 600,
            mechanics: normalizeMechanics(u?.ownerConfig?.mechanics),
            orgMobiles: Array.isArray(u?.ownerConfig?.orgMobiles)
              ? u.ownerConfig.orgMobiles.join(" / ")
              : (u?.ownerConfig?.orgMobiles || ""),
            logoUrl: u?.ownerConfig?.logoUrl || "",
            locationQrUrl: u?.ownerConfig?.locationQrUrl || "",
            webhookUrl: u?.ownerConfig?.webhookUrl || "",
            processingFee: u?.ownerConfig?.processingFee ?? 8000,
            flatInterestRate: u?.ownerConfig?.flatInterestRate ?? 11,
            quotationWaIntroLine: resolveWaIntroValue(u?.ownerConfig),
            quotationWaLocations: resolveWaLocationsValue(
              u?.ownerConfig,
              u?.ownerConfig?.orgAddress
            ),
            freeFittingsOptions: resolveFreeFittingsOptionsValue(u?.ownerConfig),
            freeFittingsDefaultSelected: resolveFreeFittingsDefaultSelected(u?.ownerConfig),
          });
        }
      }
    };
    load();
  }, [form]);

  React.useEffect(() => {
    const loadBranches = async () => {
      const res = await listBranches({ status: 'active', limit: 500 });
      const items = res?.data?.items || [];
      const next = items
        .map((b) => {
          const id = String(b?.id || b?._id || "").trim();
          if (!id) return null;
          return { label: `${b.name}${b.code ? ` (${b.code})` : ''}`, value: id };
        })
        .filter(Boolean);
      setBranchOptions(next);
    };
    loadBranches();
  }, []);

  const onSave = async () => {
    try {
      const vals = await form.validateFields();
      const freeFittingsOptions = toUniqueLines(vals.freeFittingsOptions);
      setSaving(true);
      const res = await UpdateOwnerProfile({
        name: forceUpper(vals.name),
        orgName: forceUpper(vals.orgName),
        orgNameRegional: vals.orgNameRegional,
        orgNameFontFamily: vals.orgNameFontFamily,
        orgNameRegionalFontFamily: vals.orgNameRegionalFontFamily,
        orgNameFontSizePt: vals.orgNameFontSizePt,
        orgNameRegionalFontSizePt: vals.orgNameRegionalFontSizePt,
        orgNameFontWeight: vals.orgNameFontWeight,
        orgNameRegionalFontWeight: vals.orgNameRegionalFontWeight,
        orgNameFontColor: vals.orgNameFontColor || "#000000",
        orgAddress: vals.orgAddress,
        orgAddressFontSizePt: vals.orgAddressFontSizePt,
        orgAddressFontWeight: vals.orgAddressFontWeight,
        mechanics: normalizeMechanics(vals.mechanics),
        orgMobiles: String(vals.orgMobiles || "")
          .split(/[,\n;/|]+/g)
          .map((v) => String(v || "").trim())
          .filter(Boolean),
        logoUrl: normalizeImageUrl(vals.logoUrl),
        locationQrUrl: normalizeImageUrl(vals.locationQrUrl),
        webhookUrl: normalizeWebhookUrl(vals.webhookUrl),
        processingFee: vals.processingFee,
        flatInterestRate: vals.flatInterestRate,
        quotationWaIntroLine: vals.quotationWaIntroLine,
        quotationWaLocations: String(vals.quotationWaLocations || "")
          .split(/\r?\n/g)
          .map((v) => String(v || "").trim())
          .filter(Boolean),
        freeFittingsOptions,
        freeFittingsDefaultSelected: (Array.isArray(vals.freeFittingsDefaultSelected) ? vals.freeFittingsDefaultSelected : [])
          .map((v) => String(v || "").trim())
          .filter((v) => freeFittingsOptions.includes(v)),
      });
      if (!res?.success) {
        message.error(res?.message || "Save failed");
        return;
      }
      if (res?.data) {
        localStorage.setItem("user", JSON.stringify(res.data));
        setUser(res.data);
      }
      message.success("Profile updated. Reloading to apply webhook changes...");
      setTimeout(() => window.location.reload(), 500);
    } catch (e) {
      message.error(e?.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  if (!user) {
    return (
      <div style={{ maxWidth: 900, margin: "0 auto", padding: 24 }}>
        <Card>
          <Title level={3}>Edit Profile</Title>
          <Text>Please login to edit your profile.</Text>
        </Card>
      </div>
    );
  }

  if (!isOwner) {
    return (
      <div style={{ maxWidth: 900, margin: "0 auto", padding: 24 }}>
        <Card>
          <Title level={3}>Edit Profile</Title>
          <Text>Only owners can edit these settings.</Text>
        </Card>
      </div>
    );
  }

  const mobilePreviewLine = String(orgMobilesPreview || "")
    .split(/[,\n;/|]+/g)
    .map((v) => String(v || "").trim())
    .filter(Boolean)
    .join(" / ");

  const waTemplatePreview = normalizeQuotationWhatsAppTemplate({
    introLines: quotationWaIntroLinePreview,
    locations: quotationWaLocationsPreview,
  });
  const orgNamePreviewUpper = forceUpper(orgNamePreview || "Organization Name");
  const ownerNamePreviewUpper = forceUpper(ownerNamePreview || "Owner");
  const sectionStyle = {
    border: "1px solid #e6edf5",
    borderRadius: 12,
    padding: 14,
    background: "#fff",
    marginBottom: 12,
  };

  const waPreviewTokens = {
    customerName: "Ravi",
    showroomName: orgNamePreviewUpper,
    orgMobiles: mobilePreviewLine || "974242387 / 9834798524 / 9937476635",
    organizationAddress: String(orgAddrPreview || "").trim() || "Organization Address",
    "Organization Address": String(orgAddrPreview || "").trim() || "Organization Address",
    quotationDate: dayjs().format("DD-MM-YYYY HH:mm"),
    executiveName: "Sales Executive",
    executivePhone: "9876543210",
  };

  const waPreviewText = [
    applyTemplatePlaceholders(waTemplatePreview.greetingLine, waPreviewTokens),
    ...waTemplatePreview.introLines.map((line) => applyTemplatePlaceholders(line, waPreviewTokens)),
    applyTemplatePlaceholders(waTemplatePreview.contactLine, waPreviewTokens),
    "",
    `• *Quotation Date:* ${waPreviewTokens.quotationDate}`,
    "",
    "*Vehicle 1:*",
    "• *Vehicle:* Honda Activa 125 Disc",
    "• *On-Road Price:* ₹1,12,000",
    "• *EMI Options (approx.):*",
    "   – Down Payment: ₹20,000",
    "   – 12 months: ₹8,525",
    "   – 18 months: ₹5,859",
    "   – 24 months: ₹4,525",
    "",
    "• *Sales Executive:* Sales Executive (9876543210)",
    applyTemplatePlaceholders(waTemplatePreview.locationsTitle, waPreviewTokens),
    ...waTemplatePreview.locations.map((line) => applyTemplatePlaceholders(line, waPreviewTokens)),
    "",
    applyTemplatePlaceholders(waTemplatePreview.noteLine, waPreviewTokens),
    "",
    applyTemplatePlaceholders(waTemplatePreview.closingLine, waPreviewTokens),
  ].join("\n");

  const parsedFreeFittingsOptions = toUniqueLines(freeFittingsOptionsPreview);

  return (
    <div style={{ maxWidth: 1560, margin: "0 auto", padding: "14px 18px 24px" }}>
      <style>{`
        @media (max-width: 1100px) {
          .owner-profile-grid {
            grid-template-columns: 1fr !important;
          }
          .owner-preview-sticky {
            position: static !important;
          }
        }
      `}</style>
      <Card
        style={{
          borderRadius: 14,
          border: "1px solid #e5e7eb",
          boxShadow: "0 8px 22px rgba(15, 23, 42, 0.06)",
          background: "linear-gradient(180deg, #ffffff 0%, #fbfdff 100%)",
        }}
      >
        <Space direction="vertical" size={8} style={{ width: "100%" }}>
          <Title level={3} style={{ margin: 0 }}>Edit Profile</Title>
        </Space>

        <Form
          form={form}
          layout="vertical"
          style={{ marginTop: 14 }}
          initialValues={{
            name: forceUpper(user?.name || ""),
            orgName: forceUpper(user?.ownerConfig?.orgName || ""),
            orgNameRegional: user?.ownerConfig?.orgNameRegional || "",
            orgNameFontFamily: user?.ownerConfig?.orgNameFontFamily || "",
            orgNameRegionalFontFamily: user?.ownerConfig?.orgNameRegionalFontFamily || "",
            orgNameFontSizePt: user?.ownerConfig?.orgNameFontSizePt ?? 22,
            orgNameRegionalFontSizePt: user?.ownerConfig?.orgNameRegionalFontSizePt ?? 23,
            orgNameFontWeight: user?.ownerConfig?.orgNameFontWeight ?? 800,
            orgNameRegionalFontWeight: user?.ownerConfig?.orgNameRegionalFontWeight ?? 800,
            orgNameFontColor: user?.ownerConfig?.orgNameFontColor || "#000000",
            orgAddress: user?.ownerConfig?.orgAddress || "",
            orgAddressFontSizePt: user?.ownerConfig?.orgAddressFontSizePt ?? 12,
            orgAddressFontWeight: user?.ownerConfig?.orgAddressFontWeight ?? 600,
            mechanics: normalizeMechanics(user?.ownerConfig?.mechanics),
            orgMobiles: Array.isArray(user?.ownerConfig?.orgMobiles)
              ? user.ownerConfig.orgMobiles.join(" / ")
              : (user?.ownerConfig?.orgMobiles || ""),
            logoUrl: user?.ownerConfig?.logoUrl || "",
            locationQrUrl: user?.ownerConfig?.locationQrUrl || "",
            webhookUrl: user?.ownerConfig?.webhookUrl || "",
            processingFee: user?.ownerConfig?.processingFee ?? 8000,
            flatInterestRate: user?.ownerConfig?.flatInterestRate ?? 11,
            quotationWaIntroLine: resolveWaIntroValue(user?.ownerConfig),
            quotationWaLocations: resolveWaLocationsValue(
              user?.ownerConfig,
              user?.ownerConfig?.orgAddress
            ),
            freeFittingsOptions: resolveFreeFittingsOptionsValue(user?.ownerConfig),
            freeFittingsDefaultSelected: resolveFreeFittingsDefaultSelected(user?.ownerConfig),
          }}
        >
          <div className="owner-profile-grid" style={{ display: "grid", gridTemplateColumns: "1.35fr 0.9fr", gap: 16, alignItems: "start" }}>
            <div>
              <div style={sectionStyle}>
                <Title level={5} style={{ marginBottom: 6 }}>Basic Details</Title>
                <Text type="secondary" style={{ display: "block", marginBottom: 10 }}>
                  Keep naming consistent across quotations and printouts.
                </Text>
                <Form.Item
                  label="Owner Name"
                  name="name"
                  normalize={forceUpper}
                  rules={[{ required: true, message: "Name is required" }]}
                >
                  <Input placeholder="OWNER NAME" style={{ textTransform: "uppercase" }} />
                </Form.Item>

                <Form.Item
                  label="Organization Name"
                  name="orgName"
                  normalize={forceUpper}
                  rules={[{ required: true, message: "Organization name is required" }]}
                >
                  <Input placeholder="ORGANIZATION NAME" style={{ textTransform: "uppercase" }} />
                </Form.Item>

                <Title level={5} style={{ margin: "4px 0 8px" }}>Organization Name Style</Title>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(130px, 1fr))", gap: 10, marginBottom: 8 }}>
                  <Form.Item label="Font Size (pt)" name="orgNameFontSizePt" style={{ marginBottom: 0 }}>
                    <InputNumber min={8} max={64} step={0.5} style={{ width: "100%" }} />
                  </Form.Item>
                  <Form.Item label="Font Weight" name="orgNameFontWeight" style={{ marginBottom: 0 }}>
                    <Select options={[100, 200, 300, 400, 500, 600, 700, 800, 900].map((w) => ({ label: String(w), value: w }))} />
                  </Form.Item>
                  <Form.Item label="Font Family" name="orgNameFontFamily" style={{ marginBottom: 0 }}>
                    <Select options={ORG_FONT_FAMILY_OPTIONS} />
                  </Form.Item>
                  <Form.Item label="Font Color" name="orgNameFontColor" style={{ marginBottom: 0 }}>
                    <Select options={ORG_NAME_COLOR_OPTIONS} />
                  </Form.Item>
                </div>

                <Form.Item label="Organization Name (Regional Language)" name="orgNameRegional">
                  <Input placeholder="ಉದಾ: ಶ್ರೀ ಬಾಲಾಜಿ ಮೋಟರ್ಸ್" />
                </Form.Item>
                {String(orgNameRegionalPreview || "").trim() ? (
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(130px, 1fr))", gap: 10, marginBottom: 8 }}>
                    <Form.Item label="Regional Size (pt)" name="orgNameRegionalFontSizePt" style={{ marginBottom: 0 }}>
                      <InputNumber min={8} max={64} step={0.5} style={{ width: "100%" }} />
                    </Form.Item>
                    <Form.Item label="Regional Weight" name="orgNameRegionalFontWeight" style={{ marginBottom: 0 }}>
                      <Select options={[100, 200, 300, 400, 500, 600, 700, 800, 900].map((w) => ({ label: String(w), value: w }))} />
                    </Form.Item>
                    <Form.Item label="Regional Family" name="orgNameRegionalFontFamily" style={{ marginBottom: 0 }}>
                      <Select options={ORG_FONT_FAMILY_OPTIONS} />
                    </Form.Item>
                  </div>
                ) : (
                  <Text type="secondary" style={{ display: "block", marginTop: -8, marginBottom: 10 }}>
                    Add a regional organization name to unlock regional font controls.
                  </Text>
                )}

                <Divider style={{ margin: "14px 0 10px" }} />
                <Title level={5} style={{ marginBottom: 8 }}>Contact & Address</Title>
                <Form.Item label="Organization Address" name="orgAddress">
                  <Input.TextArea rows={2} placeholder="Organization address (print header)" />
                </Form.Item>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(130px, 1fr))", gap: 10, marginBottom: 8 }}>
                  <Form.Item label="Address Size (pt)" name="orgAddressFontSizePt" style={{ marginBottom: 0 }}>
                    <InputNumber min={8} max={64} step={0.5} style={{ width: "100%" }} />
                  </Form.Item>
                  <Form.Item label="Address Weight" name="orgAddressFontWeight" style={{ marginBottom: 0 }}>
                    <Select options={[100, 200, 300, 400, 500, 600, 700, 800, 900].map((w) => ({ label: String(w), value: w }))} />
                  </Form.Item>
                </div>

                <Form.Item label="Organization Mobile Numbers" name="orgMobiles">
                  <Input.TextArea rows={2} placeholder="e.g. 9742192972 / 9901925546 / 9035131806" />
                </Form.Item>

                <Form.List name="mechanics">
                  {(fields, { add, remove }) => (
                    <div style={{ marginBottom: 10 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                        <Text strong>Mechanics (for Job Card allotted mechanic)</Text>
                        <Button type="dashed" onClick={() => add({ name: "", phone: "" })}>+ Add Mechanic</Button>
                      </div>
                      {fields.map(({ key, name, ...restField }) => (
                        <div key={key} style={{ display: "grid", gridTemplateColumns: "1fr 1fr auto", gap: 8, marginBottom: 8 }}>
                          <Form.Item
                            {...restField}
                            name={[name, "name"]}
                            rules={[{ required: true, message: "Enter mechanic name" }]}
                            style={{ marginBottom: 0 }}
                          >
                            <Input placeholder="Mechanic name" />
                          </Form.Item>
                          <Form.Item
                            {...restField}
                            name={[name, "phone"]}
                            normalize={(v) => String(v || "").replace(/\D/g, "").slice(0, 10)}
                            style={{ marginBottom: 0 }}
                          >
                            <Input placeholder="Phone (optional)" maxLength={10} />
                          </Form.Item>
                          <Button danger onClick={() => remove(name)}>Delete</Button>
                        </div>
                      ))}
                    </div>
                  )}
                </Form.List>

                <Divider style={{ margin: "14px 0 10px" }} />
                <Title level={5} style={{ marginBottom: 8 }}>Branding & Integration</Title>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 90px", gap: 12 }}>
                  <Form.Item label="Logo URL" name="logoUrl" rules={[{ type: "url", message: "Enter a valid URL" }]} style={{ marginBottom: 0 }}>
                    <Input placeholder="https://..." />
                  </Form.Item>
                  <div style={{ alignSelf: "end", justifySelf: "center", marginBottom: 2 }}>
                    {logoPreview && !logoPreviewFailed ? (
                      <img
                        key={logoPreview}
                        src={logoPreview}
                        alt="Logo preview"
                        style={{ width: 70, height: 52, objectFit: "contain", border: "1px solid #e5e7eb", borderRadius: 8, padding: 4, background: "#fff" }}
                        onError={(e) => handleImagePreviewError(e, setLogoPreviewFailed)}
                      />
                    ) : <div style={{ width: 70, height: 52, border: "1px dashed #cbd5e1", borderRadius: 8 }} />}
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 90px", gap: 12, marginTop: 10 }}>
                  <Form.Item label="Location QR URL" name="locationQrUrl" rules={[{ type: "url", message: "Enter a valid URL" }]} style={{ marginBottom: 0 }}>
                    <Input placeholder="https://... (QR image for Scan for Location)" />
                  </Form.Item>
                  <div style={{ alignSelf: "end", justifySelf: "center", marginBottom: 2 }}>
                    {locationQrPreview && !locationQrPreviewFailed ? (
                      <img
                        key={locationQrPreview}
                        src={locationQrPreview}
                        alt="Location QR preview"
                        style={{ width: 62, height: 62, objectFit: "contain", border: "1px solid #e5e7eb", borderRadius: 8, padding: 4, background: "#fff" }}
                        onError={(e) => handleImagePreviewError(e, setLocationQrPreviewFailed)}
                      />
                    ) : <div style={{ width: 62, height: 62, border: "1px dashed #cbd5e1", borderRadius: 8 }} />}
                  </div>
                </div>

                <Form.Item
                  label="Webhook URL"
                  name="webhookUrl"
                  rules={[
                    { type: "url", message: "Enter a valid URL" },
                    {
                      validator: (_, value) => {
                        const v = String(value || "").trim();
                        if (!v) return Promise.resolve();
                        if (isValidAppsScriptWebhookUrl(v)) return Promise.resolve();
                        return Promise.reject(new Error("Use Apps Script Web app URL: https://script.google.com/macros/s/.../exec"));
                      },
                    },
                  ]}
                  style={{ marginTop: 10 }}
                >
                  <Input placeholder="https://script.google.com/macros/s/AKfycbz_DoNoD0XTx3RNMOSZfypbMqWVN4yTy3ct96aE4LhJ9yb_YvKr0GRbO_GA3Fgkwptb/exec" />
                </Form.Item>

                <Divider style={{ margin: "14px 0 10px" }} />
                <Title level={5} style={{ marginBottom: 8 }}>Quotation Finance Defaults</Title>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <Form.Item
                    label="Quotation Processing Fee"
                    name="processingFee"
                    rules={[{ type: "number", min: 0, message: "Enter a valid amount" }]}
                    style={{ marginBottom: 0 }}
                  >
                    <InputNumber min={0} style={{ width: "100%" }} placeholder="e.g. 8000" />
                  </Form.Item>
                  <Form.Item
                    label="Flat Interest Rate (%)"
                    name="flatInterestRate"
                    rules={[{ type: "number", min: 0, max: 100, message: "Enter 0 to 100" }]}
                    style={{ marginBottom: 0 }}
                  >
                    <InputNumber min={0} max={100} step={0.1} style={{ width: "100%" }} placeholder="e.g. 11" />
                  </Form.Item>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 12 }}>
                  <Form.Item label="Branch Limit (set by admin)" style={{ marginBottom: 0 }}>
                    <Input value={branchLimit} readOnly />
                  </Form.Item>
                </div>

                <Divider style={{ margin: "16px 0 12px" }} />
                <Title level={5} style={{ marginBottom: 8 }}>WhatsApp Quotation Template</Title>
                <Text type="secondary" style={{ display: "block", marginBottom: 10 }}>
                  Fixed lines: Greeting, Contact, Locations title, Note, Closing. Editable sections: Intro lines and Locations.
                </Text>
                <Form.Item label="Intro Lines (one per line)" name="quotationWaIntroLine" style={{ marginBottom: 8 }}>
                  <Input.TextArea rows={3} placeholder={"Multi-brand two-wheeler sales...\nFinance & insurance support..."} />
                </Form.Item>
                <Form.Item label="Locations (one per line)" name="quotationWaLocations" style={{ marginBottom: 8 }}>
                  <Input.TextArea rows={3} placeholder={"Muddinapalya • Hegganahalli\nKadabagere • Channenahalli"} />
                </Form.Item>

                <Divider style={{ margin: "16px 0 12px" }} />
                <Title level={5} style={{ marginBottom: 8 }}>Free Extra Fittings</Title>
                <Text type="secondary" style={{ display: "block", marginBottom: 10 }}>
                  Manage fittings catalog and choose which ones should be ticked by default on quotation page.
                </Text>
                <Form.Item label="Fittings Catalog (one per line)" name="freeFittingsOptions" style={{ marginBottom: 8 }}>
                  <Input.TextArea
                    rows={6}
                    placeholder={"All Round Guard\nSide Stand\nGrip Cover\nFloor Mat\nISI Helmet"}
                  />
                </Form.Item>
                <Form.Item label="Default Selected Fittings" name="freeFittingsDefaultSelected" style={{ marginBottom: 8 }}>
                  <Checkbox.Group style={{ width: "100%" }}>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(140px, 1fr))", gap: 6 }}>
                      {parsedFreeFittingsOptions.map((item) => (
                        <Checkbox key={item} value={item}>{item}</Checkbox>
                      ))}
                    </div>
                  </Checkbox.Group>
                </Form.Item>

                <div style={{ marginTop: 16 }}>
                  <Button type="primary" onClick={onSave} loading={saving}>
                    Save Changes
                  </Button>
                </div>
              </div>

              <Divider />

              <Title level={4} style={{ marginBottom: 8 }}>Staff Invite Link</Title>
              <Text type="secondary">
                Create invite links for staff, mechanics, or call boys. They will be linked to your organization automatically.
              </Text>
              <Space style={{ marginTop: 12 }} wrap>
                <Select
                  value={inviteRole}
                  onChange={setInviteRole}
                  style={{ minWidth: 180 }}
                  options={[
                    { label: "Staff", value: "staff" },
                    { label: "Mechanic", value: "mechanic" },
                  ]}
                />
                <Select
                  allowClear
                  placeholder="Optional branch"
                  style={{ minWidth: 220 }}
                  value={inviteBranchId || undefined}
                  onChange={(v) => setInviteBranchId(String(v || "").trim())}
                  options={branchOptions}
                />
                <Button
                  onClick={async () => {
                    setInviteLoading(true);
                    const selectedBranchId = String(inviteBranchId || "").trim();
                    const res = await CreateInviteLink({ role: inviteRole, ...(selectedBranchId ? { branchId: selectedBranchId } : {}) });
                    if (!res?.success) {
                      message.error(res?.message || "Failed to create invite");
                    } else {
                      let nextInviteUrl = String(res?.data?.inviteUrl || "").trim();
                      const branchInResponse = String(res?.data?.branchId || selectedBranchId || "").trim();
                      if (nextInviteUrl && branchInResponse) {
                        try {
                          const u = new URL(nextInviteUrl);
                          if (!u.searchParams.get("branchId")) u.searchParams.set("branchId", branchInResponse);
                          nextInviteUrl = u.toString();
                        } catch {
                          if (!/([?&])branchId=/.test(nextInviteUrl)) {
                            nextInviteUrl += `${nextInviteUrl.includes("?") ? "&" : "?"}branchId=${encodeURIComponent(branchInResponse)}`;
                          }
                        }
                      }
                      setInviteUrl(nextInviteUrl);
                      message.success("Invite link created");
                    }
                    setInviteLoading(false);
                  }}
                  loading={inviteLoading}
                  type="dashed"
                >
                  Create Invite Link
                </Button>
              </Space>
              <div style={{ marginTop: 12 }}>
                <Input value={inviteUrl} readOnly placeholder="Invite link will appear here" />
                <Space style={{ marginTop: 8 }} wrap>
                  <Button onClick={copyInviteLink} loading={copyingInvite} disabled={!inviteUrl}>
                    Copy Link
                  </Button>
                  <Button onClick={shareInviteLink} loading={sharingInvite} disabled={!inviteUrl}>
                    Share Link
                  </Button>
                </Space>
              </div>
            </div>

            <div className="owner-preview-sticky" style={{ position: "sticky", top: 12 }}>
              <Card
                size="small"
                title={<span style={{ fontWeight: 700 }}>Quotation Preview</span>}
                style={{
                  borderRadius: 12,
                  border: "1px solid #dbeafe",
                  boxShadow: "0 8px 18px rgba(30, 64, 175, 0.08)",
                  background: "#f8fbff",
                }}
                bodyStyle={{ padding: 12 }}
              >
                <div style={{ borderBottom: "2px solid #111", marginBottom: 10, paddingBottom: 8 }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 120px", gap: 10 }}>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: 11, color: "#64748b", marginBottom: 2 }}>
                        Owner: {ownerNamePreviewUpper}
                      </div>
                      {orgNameRegionalPreview ? (
                        <div
                          style={{
                            fontSize: `${Number(orgNameRegionalFontSizePtPreview || 23)}pt`,
                            fontWeight: Number(orgNameRegionalFontWeightPreview || 800),
                            fontFamily: String(orgNameRegionalFontFamilyPreview || "").trim() || undefined,
                            lineHeight: 1.1,
                            marginBottom: 3,
                          }}
                        >
                          {orgNameRegionalPreview}
                        </div>
                      ) : null}
                      <div
                        style={{
                          fontSize: `${Number(orgNameFontSizePtPreview || 22)}pt`,
                          fontWeight: Number(orgNameFontWeightPreview || 800),
                          fontFamily: String(orgNameFontFamilyPreview || "").trim() || undefined,
                          color: String(orgNameFontColorPreview || "#000000").trim() || "#000000",
                          lineHeight: 1.1,
                          marginBottom: 4,
                        }}
                      >
                        {orgNamePreviewUpper}
                      </div>
                      {orgAddrPreview ? (
                        <div
                          style={{
                            fontSize: `${Number(orgAddressFontSizePtPreview || 12)}pt`,
                            fontWeight: Number(orgAddressFontWeightPreview || 600),
                            lineHeight: 1.25,
                            whiteSpace: "pre-wrap",
                          }}
                        >
                          {orgAddrPreview}
                        </div>
                      ) : null}
                      {mobilePreviewLine ? <div style={{ marginTop: 4, fontSize: "10pt", fontWeight: 700 }}>Mob: {mobilePreviewLine}</div> : null}
                    </div>
                    <div style={{ border: "1px solid #111", borderRadius: 6, overflow: "hidden", minHeight: 120, display: "flex", alignItems: "center", justifyContent: "center", background: "#fff" }}>
                      {logoPreview && !logoPreviewFailed ? (
                        <img
                          key={`main-${logoPreview}`}
                          src={logoPreview}
                          alt="Logo preview"
                          style={{ width: "100%", height: "100%", objectFit: "contain" }}
                          onError={(e) => handleImagePreviewError(e, setLogoPreviewFailed)}
                        />
                      ) : <Text type="secondary">Logo</Text>}
                    </div>
                  </div>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", gap: 8, alignItems: "center" }}>
                  <div style={{ fontSize: 12, color: "#4b5563" }}>Live updates while typing</div>
                  <div style={{ border: "1px solid #e5e7eb", borderRadius: 8, width: 58, height: 58, display: "flex", alignItems: "center", justifyContent: "center", background: "#fff" }}>
                    {locationQrPreview && !locationQrPreviewFailed ? (
                      <img
                        key={`main-qr-${locationQrPreview}`}
                        src={locationQrPreview}
                        alt="QR preview"
                        style={{ width: 52, height: 52, objectFit: "contain" }}
                        onError={(e) => handleImagePreviewError(e, setLocationQrPreviewFailed)}
                      />
                    ) : <Text type="secondary" style={{ fontSize: 11 }}>QR</Text>}
                  </div>
                </div>

                <Divider style={{ margin: "12px 0 10px" }} />
                <div style={{ fontSize: 12, color: "#4b5563", marginBottom: 6 }}>WhatsApp Message Preview</div>
                <div
                  style={{
                    border: "1px solid #d1d5db",
                    borderRadius: 8,
                    background: "#ffffff",
                    padding: 10,
                    whiteSpace: "pre-wrap",
                    fontSize: 12,
                    lineHeight: 1.45,
                    maxHeight: 300,
                    overflow: "auto",
                  }}
                >
                  {waPreviewText}
                </div>
              </Card>
            </div>
          </div>
        </Form>
      </Card>
    </div>
  );
}
