// src/pages/Contact.jsx
import React from "react";
import { Card, Space, Typography, Divider } from "antd";
import { MailOutlined, ClockCircleOutlined } from "@ant-design/icons";
import { CONTACT_EMAIL, BUSINESS_HOURS } from "../data/contactInfo";
import { getOwnerOrgName } from "../utils/ownerConfig";

const { Title, Text } = Typography;

export default function Contact() {
  return (
    <div style={{ maxWidth: 960, margin: "0 auto", padding: "24px 16px 56px" }}>
      <Space direction="vertical" size={4} style={{ width: "100%" }}>
        <Title level={2} style={{ marginBottom: 0 }}>Contact</Title>
        <Text type="secondary">Reach the {getOwnerOrgName() || "Motera"} team anytime.</Text>
      </Space>

      <Divider style={{ margin: "24px 0" }} />

      <Card bordered style={{ borderRadius: 16 }}>
        <Space direction="vertical" size={12} style={{ width: "100%" }}>
          <Text strong><MailOutlined /> Email</Text>
          <Text>{CONTACT_EMAIL || "—"}</Text>
          <Divider style={{ margin: "8px 0" }} />
          <Text strong><ClockCircleOutlined /> Business Hours</Text>
          <Text>{BUSINESS_HOURS || "—"}</Text>
        </Space>
      </Card>
    </div>
  );
}
