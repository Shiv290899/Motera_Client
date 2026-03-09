// src/pages/Contact.jsx
import React from "react";
import { Card, Space, Typography, Divider, Button } from "antd";
import { MailOutlined, ClockCircleOutlined, PhoneOutlined, WhatsAppOutlined } from "@ant-design/icons";
import {
  CONTACT_EMAIL,
  BUSINESS_HOURS,
  SALES_DISPLAY,
  SALES_TEL_LINK,
  SALES_WHATSAPP_LINK,
} from "../data/contactInfo";
import { getOwnerOrgName } from "../utils/ownerConfig";

const { Title, Text } = Typography;

export default function Contact() {
  const org = getOwnerOrgName() || "Motera";
  const whatsappHref =
    SALES_WHATSAPP_LINK
      ? `${SALES_WHATSAPP_LINK}?text=${encodeURIComponent(`Hi ${org}, I want a demo for my showroom.`)}`
      : "";

  return (
    <div
      style={{
        maxWidth: 980,
        margin: "0 auto",
        padding: "24px 16px 56px",
        color: "#e5e7eb",
      }}
    >
      <Space direction="vertical" size={4} style={{ width: "100%" }}>
        <Title level={2} style={{ marginBottom: 0, color: "#f8fafc" }}>Contact {org}</Title>
        <Text style={{ color: "#94a3b8" }}>
          Call, WhatsApp, or email us. We will help you with demo and setup.
        </Text>
      </Space>

      <Divider style={{ margin: "24px 0" }} />

      <Card
        bordered={false}
        style={{
          borderRadius: 18,
          background:
            "linear-gradient(135deg, rgba(30,41,59,0.9), rgba(15,23,42,0.88) 42%, rgba(30,64,175,0.34) 100%)",
          boxShadow: "0 24px 56px rgba(0,0,0,0.35)",
          border: "1px solid rgba(148,163,184,0.22)",
        }}
      >
        <Space direction="vertical" size={12} style={{ width: "100%" }}>
          <Text strong style={{ color: "#f8fafc" }}><PhoneOutlined /> Call / WhatsApp</Text>
          <Text style={{ color: "#e2e8f0", fontSize: 16, fontWeight: 700 }}>
            {SALES_DISPLAY || "+91 90198 44809"}
          </Text>
          <Space wrap>
            <Button
              type="primary"
              icon={<PhoneOutlined />}
              href={SALES_TEL_LINK || undefined}
              target="_self"
              style={{
                borderRadius: 10,
                background: "linear-gradient(90deg, #2563eb, #1d4ed8)",
                border: 0,
              }}
            >
              Call Now
            </Button>
            <Button
              icon={<WhatsAppOutlined />}
              href={whatsappHref || undefined}
              target="_blank"
              style={{
                borderRadius: 10,
                border: "1px solid rgba(34,197,94,0.45)",
                color: "#bbf7d0",
                background: "rgba(22,163,74,0.14)",
              }}
            >
              WhatsApp
            </Button>
          </Space>

          <Divider style={{ margin: "10px 0", borderColor: "rgba(148,163,184,0.25)" }} />

          <Text strong style={{ color: "#f8fafc" }}><MailOutlined /> Email</Text>
          <Text style={{ color: "#e2e8f0" }}>{CONTACT_EMAIL || "—"}</Text>
          <Divider style={{ margin: "8px 0" }} />
          <Text strong style={{ color: "#f8fafc" }}><ClockCircleOutlined /> Business Hours</Text>
          <Text style={{ color: "#cbd5e1" }}>{BUSINESS_HOURS || "—"}</Text>
        </Space>
      </Card>
    </div>
  );
}
