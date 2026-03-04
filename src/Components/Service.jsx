import React from "react";
import {
  Button,
  Card,
  Col,
  Divider,
  Form,
  Input,
  Row,
  Space,
  Table,
  Typography,
  message,
  Tag,
} from "antd";
import {
  AimOutlined,
  EnvironmentFilled,
  PhoneFilled,
  WhatsAppOutlined,
  ClockCircleOutlined,
  ToolOutlined,
  SafetyCertificateOutlined,
  CarOutlined,
  CheckCircleFilled,
} from "@ant-design/icons";
import { BUSINESS_HOURS } from "../data/contactInfo";
import { getOwnerOrgName } from "../utils/ownerConfig";

const { Title, Paragraph, Text } = Typography;

export default function Service() {
  const [form] = Form.useForm();

  const onSubmit = async () => {
    message.success("Service request submitted. We will call you shortly.");
    form.resetFields();
  };

  const tableScooter = {
    columns: [
      { title: "Plan", dataIndex: "plan" },
      { title: "Extra Months", dataIndex: "months", width: 140 },
      { title: "Extra KMs", dataIndex: "kms", width: 140 },
    ],
    data: [
      { key: 1, plan: "3Y + 1Y", months: 12, kms: "12,000" },
      { key: 2, plan: "3Y + 2Y", months: 24, kms: "24,000" },
      { key: 3, plan: "3Y + 3Y", months: 36, kms: "36,000" },
    ],
  };

  const tableMotorcycle = {
    columns: [
      { title: "Plan", dataIndex: "plan" },
      { title: "Extra Months", dataIndex: "months", width: 140 },
      { title: "Extra KMs", dataIndex: "kms", width: 140 },
    ],
    data: [
      { key: 1, plan: "3Y + 1Y", months: 12, kms: "16,000" },
      { key: 2, plan: "3Y + 2Y", months: 24, kms: "28,000" },
      { key: 3, plan: "3Y + 3Y", months: 36, kms: "40,000" },
    ],
  };

  const org = getOwnerOrgName() || "Motera";
  const container = { maxWidth: 1140, margin: "0 auto", padding: "0 16px" };
  const section = { padding: "72px 0" };
  const glassCard = {
    background: "rgba(255,255,255,0.88)",
    border: "1px solid rgba(255,255,255,0.62)",
    boxShadow: "0 18px 42px rgba(2, 6, 23, 0.09)",
    borderRadius: 22,
  };
  const softCard = {
    border: "1px solid #e5e7eb",
    borderRadius: 18,
    boxShadow: "0 12px 34px rgba(15, 23, 42, 0.06)",
    height: "100%",
  };
  const heroImgSrc = "/about-bike.jpg";

  return (
    <div style={{ background: "linear-gradient(180deg,#fff 0%,#fff 45%,#f8fbff 100%)" }}>
      <style>{`
        .service-heading {
          font-family: "Avenir Next", "Montserrat", sans-serif;
          letter-spacing: 0.3px;
        }
        .service-animate {
          animation: service-fade-up .55s ease both;
        }
        .service-hover {
          transition: transform .28s ease, box-shadow .28s ease;
        }
        .service-hover:hover {
          transform: translateY(-4px);
          box-shadow: 0 16px 36px rgba(15, 23, 42, 0.12);
        }
        @keyframes service-fade-up {
          from { opacity: 0; transform: translateY(14px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div style={{ background: "linear-gradient(90deg,#0b1f38,#133768 55%,#fc6b1a)" }}>
        <div style={container}>
          <Row align="middle" justify="space-between" gutter={12} style={{ padding: "10px 0" }}>
            <Col>
              <Text style={{ color: "#fff", fontWeight: 600 }}>
                <EnvironmentFilled /> {org} Service Hub
              </Text>
            </Col>
            <Col>
              <Text style={{ color: "#eaf2ff" }}>
                <ClockCircleOutlined /> {BUSINESS_HOURS.replaceAll("-", "•")}
              </Text>
            </Col>
          </Row>
        </div>
      </div>

      <section id="service" style={{ ...section, paddingTop: 56, paddingBottom: 48 }}>
        <div style={container}>
          <Row gutter={[24, 24]} align="middle">
            <Col xs={24} md={13} className="service-animate">
              <Tag color="blue" style={{ borderRadius: 999, padding: "6px 12px", marginBottom: 14 }}>
                PREMIUM AFTER-SALES CARE
              </Tag>
              <Title level={1} className="service-heading" style={{ marginBottom: 0 }}>
                Ride Hard.
              </Title>
              <Title level={1} className="service-heading" style={{ marginTop: 0, color: "#0f3e9d" }}>
                We Keep It Perfect.
              </Title>
              <Paragraph style={{ color: "#334155", fontSize: 16, maxWidth: 620 }}>
                {org} workshop brings trained technicians, genuine spare parts, and
                transparent updates together in one fast, reliable experience.
              </Paragraph>
              <Space size="middle" wrap>
                <Button type="primary" size="large" icon={<AimOutlined />} href="#book">
                  Book a Slot
                </Button>
                <Button size="large" icon={<WhatsAppOutlined />} href="#whatsapp">
                  WhatsApp Service
                </Button>
              </Space>
              <Space size={[8, 8]} wrap style={{ marginTop: 18 }}>
                {["OEM Certified", "Quick Turnaround", "Live Updates", "Genuine Parts"].map((item) => (
                  <Tag key={item} color="default" style={{ borderRadius: 999, padding: "4px 12px" }}>
                    {item}
                  </Tag>
                ))}
              </Space>
            </Col>
            <Col xs={24} md={11} className="service-animate">
              <Card bordered={false} style={{ ...glassCard, overflow: "hidden" }}>
                <img
                  src={heroImgSrc}
                  alt="Workshop"
                  style={{ width: "100%", height: 285, objectFit: "cover", borderRadius: 14 }}
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
                <Row gutter={[12, 12]} style={{ marginTop: 14 }}>
                  <Col span={12}>
                    <Card bordered={false} style={{ background: "#eef6ff", borderRadius: 14 }}>
                      <Text strong><ToolOutlined /> Advanced Diagnostics</Text>
                    </Card>
                  </Col>
                  <Col span={12}>
                    <Card bordered={false} style={{ background: "#fff5eb", borderRadius: 14 }}>
                      <Text strong><SafetyCertificateOutlined /> Warranty-Safe Repairs</Text>
                    </Card>
                  </Col>
                </Row>
              </Card>
            </Col>
          </Row>
        </div>
      </section>

      <section style={{ ...section, paddingTop: 42 }}>
        <div style={container}>
          <Title level={2} className="service-heading">Know more about our service</Title>
          <Paragraph type="secondary" style={{ maxWidth: 900, fontSize: 15 }}>
            Every vehicle goes through OEM-aligned checklists, with quality checks before delivery.
            You get clear estimates, faster updates, and first-time-right repair quality.
          </Paragraph>
          <Row gutter={[16, 16]} style={{ marginTop: 8 }}>
            <Col xs={24} md={12}>
              <Card bordered={false} className="service-hover" style={softCard}>
                <Title level={4} className="service-heading" style={{ marginTop: 0 }}>What we offer</Title>
                <Space direction="vertical" size={10} style={{ width: "100%" }}>
                  {[
                    "Online service booking",
                    "Doorstep pick-up & drop",
                    "Roadside assistance",
                    "Periodic service + wear & tear repairs",
                    "Accident / body repairs",
                    "Customization & accessories fitment",
                    "Insurance claim support",
                  ].map((item) => (
                    <Text key={item}><CheckCircleFilled style={{ color: "#16a34a" }} /> {item}</Text>
                  ))}
                </Space>
              </Card>
            </Col>
            <Col xs={24} md={12}>
              <Card bordered={false} className="service-hover" style={softCard}>
                <Title level={4} className="service-heading" style={{ marginTop: 0 }}>Why choose us</Title>
                <Space direction="vertical" size={10} style={{ width: "100%" }}>
                  {[
                    "OEM-approved methods & torque specs",
                    "Transparent estimates and progress updates",
                    "Warranty-safe procedures and genuine parts",
                    "Quick-service lanes for regular maintenance",
                    "Dedicated support team",
                  ].map((item) => (
                    <Text key={item}><CheckCircleFilled style={{ color: "#0ea5e9" }} /> {item}</Text>
                  ))}
                </Space>
              </Card>
            </Col>
          </Row>
        </div>
      </section>

      <section style={{ ...section, background: "linear-gradient(180deg,#f6faff 0%,#f8fafc 100%)" }}>
        <div style={container}>
          <Title level={2} className="service-heading">Extended Warranty</Title>
          <Paragraph type="secondary">
            Protect your two-wheeler after standard warranty with broader component and labour coverage.
          </Paragraph>
          <Row gutter={[16, 16]} style={{ marginTop: 12 }}>
            <Col xs={24} md={12}>
              <Card bordered={false} style={softCard}>
                <Title level={4} style={{ marginTop: 0 }}><CarOutlined /> For Scooters</Title>
                <Table size="small" pagination={false} columns={tableScooter.columns} dataSource={tableScooter.data} />
              </Card>
            </Col>
            <Col xs={24} md={12}>
              <Card bordered={false} style={softCard}>
                <Title level={4} style={{ marginTop: 0 }}><CarOutlined /> For Motorcycles</Title>
                <Table size="small" pagination={false} columns={tableMotorcycle.columns} dataSource={tableMotorcycle.data} />
              </Card>
            </Col>
          </Row>

          <Row gutter={[16, 16]} style={{ marginTop: 12 }}>
            {[
              "Major parts covered at minimal cost",
              "Pan-India validity (as per OEM policy)",
              "Transferable on resale",
              "Lower lifetime ownership cost",
            ].map((item) => (
              <Col xs={24} sm={12} md={6} key={item}>
                <Card bordered={false} className="service-hover" style={{ ...softCard, textAlign: "center" }}>
                  <Text strong>{item}</Text>
                </Card>
              </Col>
            ))}
          </Row>
        </div>
      </section>

      <section id="amc" style={{ ...section, paddingBottom: 56 }}>
        <div style={container}>
          <Title level={2} className="service-heading">Annual Maintenance Contract (AMC)</Title>
          <Paragraph type="secondary">
            Bundle maintenance into one yearly plan and reduce both cost and service stress.
          </Paragraph>
          <Row gutter={[16, 16]} style={{ marginTop: 12 }}>
            {[
              { big: "30%", sub: "Savings (up to)" },
              { big: "4", sub: "Maintenance visits" },
              { big: "2", sub: "Complimentary washes" },
              { big: "10%", sub: "Labour discount" },
              { big: "5%", sub: "Parts & oil discount" },
            ].map((k) => (
              <Col xs={12} md={4} key={k.sub}>
                <Card bordered={false} className="service-hover" style={{ ...softCard, textAlign: "center" }}>
                  <div style={{ fontSize: 30, fontWeight: 800, color: "#0f3e9d" }}>{k.big}</div>
                  <div style={{ color: "#64748b", marginTop: 6 }}>{k.sub}</div>
                </Card>
              </Col>
            ))}
          </Row>
        </div>
      </section>

      <section id="rsa" style={{ ...section, background: "#f8fafc", paddingTop: 56 }}>
        <div style={container}>
          <Title level={2} className="service-heading">Roadside Assistance</Title>
          <Paragraph type="secondary">
            Puncture, breakdown, no-start or battery issue? Call us for quick triage, roadside fix, or towing.
          </Paragraph>
          <Row gutter={[16, 16]} style={{ marginTop: 12 }}>
            {[
              { h: "Phone Support", p: "Immediate call guidance and fault triage." },
              { h: "On-Road Repairs", p: "Minor mechanical and electrical fixes at your location." },
              { h: "Towing & Fuel", p: "Tow to nearest workshop and emergency fuel help." },
            ].map((x) => (
              <Col xs={24} md={8} key={x.h}>
                <Card bordered={false} className="service-hover" style={softCard}>
                  <Title level={4} style={{ marginTop: 0 }}>{x.h}</Title>
                  <Paragraph type="secondary">{x.p}</Paragraph>
                </Card>
              </Col>
            ))}
          </Row>
          <Paragraph type="secondary" style={{ fontSize: 12, marginTop: 10 }}>
            Fuel charged as per actuals. Coverage radius may vary by branch.
          </Paragraph>
        </div>
      </section>

      <section id="engine-health" style={{ ...section, paddingTop: 54 }}>
        <div style={container}>
          <Title level={2} className="service-heading">Engine Health Assurance</Title>
          <Paragraph type="secondary">
            Assurance on engine work completed at {org}, beyond the standard or extended warranty period.
          </Paragraph>
          <Row gutter={[16, 16]} style={{ marginTop: 12 }}>
            {[
              { big: "1 Year", sub: "or 12,000 km (whichever earlier)" },
              { big: "1 Free", sub: "Engine service" },
              { big: "Genuine", sub: "OEM parts and procedures" },
            ].map((k) => (
              <Col xs={24} md={8} key={k.sub}>
                <Card bordered={false} style={{ ...softCard, textAlign: "center" }}>
                  <div style={{ fontSize: 26, fontWeight: 800, color: "#0f3e9d" }}>{k.big}</div>
                  <div style={{ color: "#64748b", marginTop: 6 }}>{k.sub}</div>
                </Card>
              </Col>
            ))}
          </Row>
        </div>
      </section>

      <section id="terms" style={{ ...section, background: "#f8fafc", paddingTop: 52, paddingBottom: 44 }}>
        <div style={container}>
          <Title level={2} className="service-heading">Terms & Conditions</Title>
          <ul style={{ paddingLeft: 18, marginTop: 12 }}>
            {[
              "Programs and benefits vary by OEM and model. Check exact coverage with your branch.",
              "Images are illustrative and vehicle visuals may differ.",
              "Prices, plans and discounts are indicative and may change without notice.",
            ].map((t) => (
              <li key={t} style={{ marginBottom: 8 }}>{t}</li>
            ))}
          </ul>
        </div>
      </section>

      <section id="book" style={{ ...section, paddingTop: 52 }}>
        <div style={container}>
          <Card
            bordered={false}
            style={{
              background: "linear-gradient(105deg,#0f2d57 0%,#0f3e9d 52%,#fb6a1f 100%)",
              color: "#fff",
              borderRadius: 24,
              boxShadow: "0 20px 44px rgba(30, 58, 138, 0.28)",
            }}
          >
            <Title level={2} style={{ color: "#fff", marginTop: 0 }} className="service-heading">
              Book Your Service
            </Title>
            <Paragraph style={{ color: "#e2e8f0" }}>
              Share details once. Our team confirms your slot quickly over call or WhatsApp.
            </Paragraph>
            <Form form={form} layout="vertical" onFinish={onSubmit} style={{ marginTop: 12 }}>
              <Row gutter={[12, 12]}>
                <Col xs={24} sm={12} md={8}>
                  <Form.Item name="name" label={<Text style={{ color: "#fff" }}>Full Name</Text>} rules={[{ required: true }]}>
                    <Input placeholder="Full Name" size="large" />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12} md={8}>
                  <Form.Item name="mobile" label={<Text style={{ color: "#fff" }}>Mobile Number</Text>} rules={[{ required: true }]}>
                    <Input placeholder="Mobile Number" size="large" prefix={<PhoneFilled style={{ color: "#94a3b8" }} />} />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12} md={8}>
                  <Form.Item name="model" label={<Text style={{ color: "#fff" }}>Vehicle Model</Text>}>
                    <Input placeholder="Vehicle Model" size="large" />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12} md={16}>
                  <Form.Item name="date" label={<Text style={{ color: "#fff" }}>Preferred Date</Text>}>
                    <Input placeholder="DD-MM-YYYY HH:mm" size="large" />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12} md={8}>
                  <Form.Item label={<span />} colon={false}>
                    <Button htmlType="submit" size="large" type="default" block>
                      Submit Request
                    </Button>
                  </Form.Item>
                </Col>
              </Row>
            </Form>
          </Card>
        </div>
      </section>

      <div style={{ padding: "18px 0 36px" }}>
        <div style={container}>
          <Divider style={{ marginTop: 0 }} />
          <Space size="large" wrap>
            <Text>© {new Date().getFullYear()} {org}</Text>
            <a href="#terms">Terms & Conditions</a>
            <a href="#">Privacy</a>
          </Space>
        </div>
      </div>
    </div>
  );
}
