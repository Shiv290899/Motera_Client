import React from "react";
import { Row, Col, Card, Typography, Tag, Divider, Button } from "antd";
import {
  RocketOutlined,
  TeamOutlined,
  EnvironmentOutlined,
  ToolOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import { Link } from "react-router-dom";
import { getOwnerOrgName } from "../utils/ownerConfig";

const { Title, Paragraph, Text } = Typography;

export default function About() {
  const orgName = getOwnerOrgName() || "Motera";

  const cards = [
    {
      icon: <ToolOutlined />,
      title: "What is Motera?",
      text: "Motera is showroom operations software for multi-brand two-wheeler showrooms. It helps teams handle quotation, job card, booking, stock and follow-up in one place.",
    },
    {
      icon: <TeamOutlined />,
      title: "Who built Motera?",
      text: "Built by a 6-member NITK founding team.",
    },
    {
      icon: <RocketOutlined />,
      title: "Why we started",
      text: "The idea came after visiting a real showroom and seeing manual work in daily operations. We built Motera to make showroom work simple and fast.",
    },
  ];

  const quickFacts = [
    ["Started", "August 2025"],
    ["Headquarters", "Bangalore"],
    ["Focus", "Multi-brand two-wheeler showrooms"],
    ["Team", "6 members (NITK)"],
    ["Type", "Showroom operations software"],
  ];

  const timeline = [
    {
      title: "Idea Stage",
      desc: "Showroom visit -> manual process pain points identified.",
    },
    {
      title: "Team Formation",
      desc: "6-member NITK team aligned on product vision.",
    },
    {
      title: "Build & Test",
      desc: "Core modules built: quotation, job card, stock, follow-up, user roles.",
    },
    {
      title: "Launch",
      desc: "Started in August 2025 with Bangalore as base.",
    },
  ];

  return (
    <main style={{ background: "#f8fafc", minHeight: "100vh" }}>
      <section
        style={{
          background:
            "linear-gradient(120deg, #0f172a 0%, #1e293b 45%, #1d4ed8 100%)",
          color: "#fff",
          padding: "54px 16px 40px",
        }}
      >
        <div style={{ maxWidth: 1120, margin: "0 auto" }}>
          <Tag color="gold" style={{ fontWeight: 700, marginBottom: 10 }}>
            About {orgName}
          </Tag>
          <Title level={1} style={{ color: "#fff", margin: 0 }}>
            Built for Real Showroom Work
          </Title>
          <Paragraph style={{ color: "#dbeafe", maxWidth: 880, marginTop: 10, fontSize: 16 }}>
            {orgName} is not a bike promotion website. It is operations software made for
            two-wheeler showroom teams to run daily business with clarity.
          </Paragraph>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 14 }}>
            <Tag color="processing">Quotations</Tag>
            <Tag color="processing">Job Cards</Tag>
            <Tag color="processing">Bookings</Tag>
            <Tag color="processing">Stock Updates</Tag>
            <Tag color="processing">Follow-ups</Tag>
          </div>
        </div>
      </section>

      <section style={{ padding: "30px 16px" }}>
        <div style={{ maxWidth: 1120, margin: "0 auto" }}>
          <Row gutter={[16, 16]}>
            {cards.map((c) => (
              <Col xs={24} md={8} key={c.title}>
                <Card
                  bordered={false}
                  style={{
                    borderRadius: 14,
                    height: "100%",
                    boxShadow: "0 12px 28px rgba(2,6,23,0.08)",
                    background: "linear-gradient(180deg, #ffffff, #f8fbff)",
                  }}
                >
                  <div style={{ color: "#2563eb", fontSize: 22, marginBottom: 8 }}>{c.icon}</div>
                  <Title level={4} style={{ marginTop: 0 }}>{c.title}</Title>
                  <Paragraph style={{ marginBottom: 0, color: "#334155" }}>{c.text}</Paragraph>
                </Card>
              </Col>
            ))}
          </Row>
        </div>
      </section>

      <section style={{ padding: "8px 16px 30px" }}>
        <div style={{ maxWidth: 1120, margin: "0 auto" }}>
          <Row gutter={[16, 16]} align="stretch">
            <Col xs={24} lg={10}>
              <Card
                title="Quick Facts"
                bordered={false}
                style={{
                  height: "100%",
                  borderRadius: 14,
                  boxShadow: "0 12px 28px rgba(2,6,23,0.08)",
                }}
              >
                {quickFacts.map(([label, value]) => (
                  <div
                    key={label}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      gap: 10,
                      padding: "8px 0",
                      borderBottom: "1px dashed #e2e8f0",
                    }}
                  >
                    <Text style={{ color: "#64748b" }}>{label}</Text>
                    <Text strong style={{ color: "#0f172a", textAlign: "right" }}>{value}</Text>
                  </div>
                ))}
              </Card>
            </Col>

            <Col xs={24} lg={14}>
              <Card
                title="Our Story"
                bordered={false}
                style={{
                  height: "100%",
                  borderRadius: 14,
                  boxShadow: "0 12px 28px rgba(2,6,23,0.08)",
                }}
              >
                <Paragraph style={{ color: "#334155", fontSize: 15 }}>
                  We started {orgName} in August 2025 from Bangalore.
                  The idea came from a real showroom experience where we saw teams managing
                  too many things manually.
                </Paragraph>
                <Paragraph style={{ color: "#334155", fontSize: 15 }}>
                  Built by a 6-member NITK founding team, this product was created as one practical
                  software solution for multi-brand two-wheeler showrooms.
                </Paragraph>
                <Paragraph style={{ color: "#334155", fontSize: 15, marginBottom: 0 }}>
                  Promise: <Text strong>Make daily showroom operations simple, trackable and reliable.</Text>
                </Paragraph>
                <Paragraph style={{ color: "#334155", fontSize: 15, marginBottom: 0 }}>
                  Vision: <Text strong>Become the most trusted operations software for two-wheeler showrooms.</Text>
                </Paragraph>
              </Card>
            </Col>
          </Row>
        </div>
      </section>

      <section style={{ padding: "0 16px 34px" }}>
        <div style={{ maxWidth: 1120, margin: "0 auto" }}>
          <Card
            title="How We Built It"
            bordered={false}
            style={{ borderRadius: 14, boxShadow: "0 12px 28px rgba(2,6,23,0.08)" }}
          >
            <Row gutter={[12, 12]}>
              {timeline.map((t, i) => (
                <Col xs={24} sm={12} key={t.title}>
                  <Card
                    size="small"
                    style={{
                      borderRadius: 10,
                      border: "1px solid #dbeafe",
                      background: "#f8fbff",
                    }}
                  >
                    <Text strong style={{ color: "#1d4ed8" }}>Step {i + 1}: {t.title}</Text>
                    <Paragraph style={{ marginTop: 6, marginBottom: 0, color: "#334155" }}>
                      {t.desc}
                    </Paragraph>
                  </Card>
                </Col>
              ))}
            </Row>
          </Card>
        </div>
      </section>

      <section style={{ padding: "0 16px 44px" }}>
        <div style={{ maxWidth: 1120, margin: "0 auto" }}>
          <Card
            bordered={false}
            style={{
              borderRadius: 14,
              background: "linear-gradient(135deg, #dcfce7, #dbeafe)",
              border: "1px solid #bfdbfe",
            }}
          >
            <Title level={3} style={{ marginTop: 0, marginBottom: 6 }}>
              Let us show {orgName} for your showroom
            </Title>
            <Paragraph style={{ color: "#1f2937", marginBottom: 14 }}>
              If you run a multi-brand two-wheeler showroom, we can set up a demo for your team.
            </Paragraph>
            <Divider style={{ margin: "10px 0 14px" }} />
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <Button type="primary" icon={<CheckCircleOutlined />}>
                <Link to="/contact" style={{ color: "#fff" }}>Contact Team</Link>
              </Button>
              <Button icon={<EnvironmentOutlined />}>
                Bangalore Headquarters
              </Button>
              <Button icon={<TeamOutlined />}>
                Team of 6 (NITK)
              </Button>
            </div>
          </Card>
        </div>
      </section>
    </main>
  );
}
