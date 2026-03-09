import React from "react";
import { Link } from "react-router-dom";
import { Card, Col, Row, Typography, Tag, Button, Space } from "antd";
import {
  SettingOutlined,
  TeamOutlined,
  DeploymentUnitOutlined,
  SafetyCertificateOutlined,
  BarChartOutlined,
  WhatsAppOutlined,
  PhoneOutlined,
  MailOutlined,
  RocketOutlined,
} from "@ant-design/icons";
import {
  BUSINESS_HOURS,
  CONTACT_EMAIL,
  SALES_DISPLAY,
  SALES_TEL_LINK,
  SALES_WHATSAPP_LINK,
} from "../data/contactInfo";
import { getOwnerOrgName } from "../utils/ownerConfig";

const { Title, Paragraph, Text } = Typography;

export default function Service() {
  const org = getOwnerOrgName() || "Motera";
  const whatsappHref = SALES_WHATSAPP_LINK
    ? `${SALES_WHATSAPP_LINK}?text=${encodeURIComponent(`Hi ${org}, I want to understand your software services for my showroom.`)}`
    : "";

  const offerings = [
    {
      icon: <DeploymentUnitOutlined />,
      title: "Showroom Setup Service",
      text: "We configure your branches, users, and roles so your team can start quickly.",
      color: "#2563eb",
    },
    {
      icon: <SettingOutlined />,
      title: "Module Configuration",
      text: "Quotation, job card, bookings, stock update, follow-up and dashboards set to your process.",
      color: "#0ea5e9",
    },
    {
      icon: <TeamOutlined />,
      title: "Team Onboarding",
      text: "Simple training for owner, backend, and staff with real daily workflow examples.",
      color: "#7c3aed",
    },
    {
      icon: <BarChartOutlined />,
      title: "Operations Review",
      text: "We help you read branch-level data and improve conversion and daily execution.",
      color: "#16a34a",
    },
    {
      icon: <SafetyCertificateOutlined />,
      title: "Support & Reliability",
      text: "Guided support for updates, role permissions, and workflow corrections.",
      color: "#ea580c",
    },
    {
      icon: <RocketOutlined />,
      title: "Scale to Multi-Branch",
      text: "As you add branches, Motera scales with standardized controls and visibility.",
      color: "#dc2626",
    },
  ];

  return (
    <main
      style={{
        minHeight: "100vh",
        background:
          "radial-gradient(1200px 700px at 10% -5%, rgba(37,99,235,0.14), transparent 58%), radial-gradient(900px 540px at 90% 2%, rgba(249,115,22,0.14), transparent 52%), linear-gradient(180deg, #f8fbff, #f8fafc)",
      }}
    >
      <section style={{ maxWidth: 1160, margin: "0 auto", padding: "30px 16px 18px" }}>
        <Tag color="blue" style={{ borderRadius: 999, padding: "5px 12px", fontWeight: 700 }}>
          Software Services
        </Tag>
        <Title level={1} style={{ marginTop: 10, marginBottom: 8 }}>
          {org} Services For Showrooms
        </Title>
        <Paragraph style={{ color: "#334155", maxWidth: 920, fontSize: 16 }}>
          This page is about the services we provide for implementing {org} software in your two-wheeler showroom.
          We help setup, onboarding, process alignment, and operational support.
        </Paragraph>

        <Space wrap size={10}>
          <Button type="primary" icon={<WhatsAppOutlined />} href={whatsappHref || undefined} target="_blank">
            WhatsApp Us
          </Button>
          <Button icon={<PhoneOutlined />} href={SALES_TEL_LINK || undefined}>Call {SALES_DISPLAY || "Now"}</Button>
          <Button icon={<MailOutlined />} href={CONTACT_EMAIL ? `mailto:${CONTACT_EMAIL}` : undefined}>Email</Button>
        </Space>
      </section>

      <section style={{ maxWidth: 1160, margin: "0 auto", padding: "8px 16px 10px" }}>
        <Row gutter={[14, 14]}>
          {offerings.map((item) => (
            <Col xs={24} md={12} lg={8} key={item.title}>
              <Card
                bordered={false}
                style={{
                  borderRadius: 16,
                  height: "100%",
                  border: "1px solid rgba(148,163,184,0.22)",
                  boxShadow: "0 14px 34px rgba(15,23,42,0.08)",
                  background: "linear-gradient(180deg, #ffffff, #f8fbff)",
                }}
              >
                <div style={{ color: item.color, fontSize: 24, marginBottom: 10 }}>{item.icon}</div>
                <Title level={4} style={{ marginTop: 0, marginBottom: 8 }}>{item.title}</Title>
                <Paragraph style={{ marginBottom: 0, color: "#334155" }}>{item.text}</Paragraph>
              </Card>
            </Col>
          ))}
        </Row>
      </section>

      <section style={{ maxWidth: 1160, margin: "0 auto", padding: "14px 16px 42px" }}>
        <Card
          bordered={false}
          style={{
            borderRadius: 16,
            border: "1px solid rgba(59,130,246,0.22)",
            background: "linear-gradient(135deg, rgba(30,64,175,0.08), rgba(14,116,144,0.08), rgba(249,115,22,0.08))",
          }}
        >
          <Title level={3} style={{ marginTop: 0, marginBottom: 6 }}>
            Need demo + setup plan?
          </Title>
          <Paragraph style={{ marginBottom: 10, color: "#334155" }}>
            We can share a simple implementation plan for your showroom in one call.
          </Paragraph>
          <Space wrap size={10}>
            <Link to="/contact">
              <Button type="primary">Contact Team</Button>
            </Link>
            <Link to="/about-us">
              <Button>Know About {org}</Button>
            </Link>
          </Space>
          <div style={{ marginTop: 14 }}>
            <Text style={{ color: "#475569" }}>Business Hours: {BUSINESS_HOURS}</Text>
          </div>
        </Card>
      </section>
    </main>
  );
}
