import React from "react";
import { Link } from "react-router-dom";
import { FaWhatsapp } from "react-icons/fa";
import { BUSINESS_HOURS, CONTACT_EMAIL } from "../data/contactInfo";
import { getOwnerOrgName } from "../utils/ownerConfig";

export default function Home() {
  const orgName = getOwnerOrgName() || "Motera";
  const [width, setWidth] = React.useState(
    typeof window !== "undefined" ? window.innerWidth : 1280
  );

  React.useEffect(() => {
    const onResize = () => setWidth(window.innerWidth);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const isMobile = width <= 640;
  const isTablet = width > 640 && width <= 1024;

  const styles = {
    page: {
      minHeight: "100vh",
      background:
        "radial-gradient(1200px 700px at 15% -10%, rgba(14,165,233,0.18), transparent 62%), radial-gradient(1100px 650px at 88% 0%, rgba(249,115,22,0.16), transparent 58%), linear-gradient(180deg, #0b1220 0%, #0f172a 52%, #111827 100%)",
      color: "#e5e7eb",
      fontFamily: "Sora, Manrope, Segoe UI, sans-serif",
    },
    container: {
      maxWidth: 1180,
      margin: "0 auto",
      padding: isMobile ? "14px" : "18px 22px",
    },
    hero: {
      marginTop: 12,
      borderRadius: 24,
      padding: isMobile ? 18 : 28,
      border: "1px solid rgba(148,163,184,0.22)",
      background:
        "linear-gradient(140deg, rgba(17,24,39,0.86), rgba(15,23,42,0.8) 40%, rgba(30,58,138,0.42) 100%)",
      boxShadow: "0 28px 80px rgba(0,0,0,0.4)",
      display: "grid",
      gridTemplateColumns: isMobile ? "1fr" : "1.2fr 0.8fr",
      gap: 18,
      position: "relative",
      overflow: "hidden",
    },
    heroGlow: {
      position: "absolute",
      inset: -100,
      pointerEvents: "none",
      background:
        "radial-gradient(500px 240px at 10% 20%, rgba(14,165,233,0.2), transparent 65%), radial-gradient(450px 220px at 90% 80%, rgba(251,146,60,0.2), transparent 60%)",
      filter: "blur(10px)",
      opacity: 0.9,
    },
    badgeRow: { display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 10 },
    badge: {
      fontSize: 12,
      fontWeight: 800,
      letterSpacing: 0.3,
      padding: "5px 10px",
      borderRadius: 999,
      color: "#cbd5e1",
      border: "1px solid rgba(148,163,184,0.28)",
      background: "rgba(15,23,42,0.52)",
    },
    title: {
      margin: 0,
      fontSize: isMobile ? 30 : isTablet ? 44 : 58,
      lineHeight: 1.02,
      fontWeight: 900,
      letterSpacing: -0.4,
      color: "#f8fafc",
      textWrap: "balance",
    },
    titleEm: {
      color: "#f59e0b",
      textShadow: "0 0 24px rgba(245,158,11,0.4)",
    },
    subtitle: {
      marginTop: 12,
      marginBottom: 0,
      fontSize: isMobile ? 14 : 17,
      maxWidth: 670,
      lineHeight: 1.6,
      color: "#cbd5e1",
    },
    ctaRow: {
      marginTop: 18,
      display: "flex",
      flexWrap: "wrap",
      gap: 10,
      alignItems: "center",
    },
    ctaPrimary: {
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      padding: isMobile ? "11px 15px" : "12px 18px",
      borderRadius: 12,
      background: "linear-gradient(90deg, #f97316, #ef4444)",
      color: "#fff",
      textDecoration: "none",
      fontWeight: 900,
      letterSpacing: 0.3,
      boxShadow: "0 16px 36px rgba(239,68,68,0.35)",
    },
    ctaGhost: {
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      padding: isMobile ? "11px 15px" : "12px 18px",
      borderRadius: 12,
      border: "1px solid rgba(148,163,184,0.35)",
      color: "#e2e8f0",
      textDecoration: "none",
      fontWeight: 800,
      background: "rgba(2,6,23,0.35)",
    },
    heroPanel: {
      borderRadius: 16,
      padding: 16,
      border: "1px solid rgba(148,163,184,0.26)",
      background: "rgba(2,6,23,0.45)",
      display: "grid",
      gap: 12,
      alignContent: "start",
    },
    panelTitle: { margin: 0, fontSize: 16, fontWeight: 800, color: "#f8fafc" },
    panelList: { margin: 0, padding: 0, listStyle: "none", display: "grid", gap: 10 },
    panelItem: {
      fontSize: 13,
      color: "#cbd5e1",
      border: "1px solid rgba(148,163,184,0.22)",
      borderRadius: 10,
      padding: "9px 10px",
      background: "rgba(15,23,42,0.5)",
    },
    panelVisualGrid: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: 10,
    },
    panelVisual: {
      borderRadius: 10,
      border: "1px solid rgba(148,163,184,0.2)",
      background: "linear-gradient(160deg, rgba(15,23,42,0.75), rgba(30,64,175,0.32))",
      padding: 10,
      textAlign: "center",
      minHeight: 82,
      display: "grid",
      placeItems: "center",
      color: "#dbeafe",
      fontWeight: 800,
      fontSize: 12,
      lineHeight: 1.3,
    },
    section: { paddingTop: isMobile ? 28 : 42 },
    sectionTitle: { margin: 0, fontSize: isMobile ? 22 : 30, fontWeight: 900, color: "#f8fafc" },
    sectionSub: { marginTop: 8, marginBottom: 0, color: "#94a3b8", fontSize: isMobile ? 13 : 15 },
    grid4: {
      marginTop: 16,
      display: "grid",
      gridTemplateColumns: isMobile ? "1fr" : isTablet ? "repeat(2, 1fr)" : "repeat(4, 1fr)",
      gap: 14,
    },
    card: {
      borderRadius: 14,
      padding: 14,
      border: "1px solid rgba(148,163,184,0.2)",
      background: "linear-gradient(180deg, rgba(30,41,59,0.55), rgba(15,23,42,0.5))",
      boxShadow: "0 16px 38px rgba(0,0,0,0.28)",
      height: "100%",
    },
    cardIcon: { fontSize: 22 },
    cardTitle: { margin: "10px 0 6px 0", fontSize: 16, fontWeight: 800, color: "#f8fafc" },
    cardText: { margin: 0, fontSize: 13, lineHeight: 1.55, color: "#cbd5e1" },
    strip: {
      marginTop: 26,
      borderRadius: 16,
      border: "1px solid rgba(251,146,60,0.3)",
      background: "linear-gradient(90deg, rgba(194,65,12,0.24), rgba(234,88,12,0.16), rgba(30,64,175,0.2))",
      padding: isMobile ? "16px 14px" : "20px 22px",
      display: "flex",
      flexDirection: isMobile ? "column" : "row",
      gap: 10,
      alignItems: isMobile ? "flex-start" : "center",
      justifyContent: "space-between",
    },
    stripText: { margin: 0, fontSize: isMobile ? 15 : 19, fontWeight: 800, color: "#ffedd5" },
    rolesGrid: {
      marginTop: 16,
      display: "grid",
      gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)",
      gap: 14,
    },
    roleBox: {
      borderRadius: 14,
      border: "1px solid rgba(148,163,184,0.2)",
      background: "rgba(15,23,42,0.55)",
      padding: 14,
    },
    roleHead: { margin: 0, fontSize: 15, fontWeight: 900, color: "#f8fafc" },
    roleLine: { marginTop: 7, color: "#cbd5e1", fontSize: 13, lineHeight: 1.5 },
    stack: {
      marginTop: 16,
      display: "grid",
      gridTemplateColumns: isMobile ? "1fr" : "repeat(2, 1fr)",
      gap: 12,
    },
    stackItem: {
      borderRadius: 12,
      border: "1px dashed rgba(148,163,184,0.35)",
      padding: "11px 12px",
      background: "rgba(2,6,23,0.35)",
      fontSize: 13,
      color: "#dbeafe",
    },
    stackTitle: { color: "#fbbf24", fontWeight: 800 },
    footerBlock: {
      marginTop: 30,
      marginBottom: 12,
      borderRadius: 16,
      border: "1px solid rgba(148,163,184,0.24)",
      background: "linear-gradient(180deg, rgba(15,23,42,0.75), rgba(2,6,23,0.75))",
      padding: isMobile ? 14 : 18,
      display: "grid",
      gap: 10,
    },
    footerTitle: { margin: 0, fontSize: isMobile ? 18 : 22, fontWeight: 900 },
    footerMeta: { margin: 0, fontSize: 13, color: "#cbd5e1" },
    footerNote: { marginTop: 2, marginBottom: 0, fontSize: 12, color: "#94a3b8" },
    floatWa: {
      position: "fixed",
      right: 16,
      bottom: 16,
      zIndex: 60,
      height: 56,
      width: 56,
      borderRadius: "50%",
      textDecoration: "none",
      background: "#25D366",
      display: "grid",
      placeItems: "center",
      color: "#fff",
      boxShadow: "0 18px 38px rgba(37,211,102,0.45)",
    },
  };

  const capabilities = [
    {
      icon: "🧑‍💼",
      title: "Handle Customer Enquiries",
      text: "Track enquiry, quotation, and follow-up in one place. No missed customer.",
    },
    {
      icon: "🛠️",
      title: "Run Daily Service Work",
      text: "Create job cards, update status, and share invoice/updates quickly.",
    },
    {
      icon: "📦",
      title: "Manage Stock Movement",
      text: "See in-stock, transfer, and booked vehicles with branch visibility.",
    },
    {
      icon: "📊",
      title: "Know Branch Performance",
      text: "Owner gets collection and activity view to make quick business decisions.",
    },
  ];

  const roles = [
    {
      title: "Owner",
      text: "View collections, analytics, branch performance, catalog and configuration from one place.",
    },
    {
      title: "Backend",
      text: "Manage users, assign branches, monitor quotation/job card flow and keep records clean.",
    },
    {
      title: "Staff",
      text: "Create quotations and job cards faster, update stock movement, and close daily work reliably.",
    },
  ];

  const stack = [
    ["Quotation", "Fast quote + pending case reopen + follow-up updates"],
    ["Job Card", "Pre-service to post-service with print + WhatsApp flow"],
    ["Bookings", "Search, status updates and branch-level operations"],
    ["Stock Update", "Movement logs, transfer flow and current stock visibility"],
    ["Vehicle Catalog", "Owner-specific company/model/variant data source"],
    ["Analytics", "Daily collections and operational conversion signals"],
  ];

  const contactHref = "/contact";
  const whatsappNumber = "919019844809";
  const whatsAppHref =
    `https://wa.me/${whatsappNumber}?text=` +
    encodeURIComponent(
      `Hi ${orgName}, I want a demo for my showroom.`
    );

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <section style={styles.hero}>
          <div style={styles.heroGlow} />
          <div style={{ position: "relative", zIndex: 2 }}>
            <div style={styles.badgeRow}>
              <span style={styles.badge}>Built for Multi-Brand Two-Wheeler Showrooms</span>
              <span style={styles.badge}>Operations + Follow-up + Collections</span>
              <span style={styles.badge}>Owner-Controlled Configuration</span>
            </div>
            <h1 style={styles.title}>
              MOTERA is a <span style={styles.titleEm}>Showroom Operations Software</span>
            </h1>
            <p style={styles.subtitle}>
              Motera is made for two-wheeler showrooms. Your team can handle quotation, job card,
              bookings, stock updates, follow-up and daily tracking from one simple software.
            </p>
            <div style={styles.ctaRow}>
              <Link to={contactHref} style={styles.ctaPrimary}>Request Demo</Link>
              <Link to="/register" style={styles.ctaGhost}>Start Trial</Link>
              <span style={{ fontSize: 12, color: "#94a3b8" }}>Simple setup for single branch and multi-branch showrooms</span>
            </div>
          </div>

          <aside style={{ ...styles.heroPanel, position: "relative", zIndex: 2 }}>
            <h3 style={styles.panelTitle}>See what Motera does in simple way</h3>
            <div style={styles.panelVisualGrid}>
              <div style={styles.panelVisual}>🧾<br />Quotation &<br />Follow-up</div>
              <div style={styles.panelVisual}>🔧<br />Job Card &<br />Service Flow</div>
              <div style={styles.panelVisual}>🏬<br />Branch &<br />Staff Access</div>
              <div style={styles.panelVisual}>📈<br />Daily Tracking &<br />Reports</div>
            </div>
            <ul style={styles.panelList}>
              <li style={styles.panelItem}>1. Save customer details and track pending cases</li>
              <li style={styles.panelItem}>2. Generate quotation and job card quickly</li>
              <li style={styles.panelItem}>3. Control access branch-wise for team members</li>
              <li style={styles.panelItem}>4. Monitor daily operations from owner dashboard</li>
            </ul>
            <p style={{ margin: 0, fontSize: 12, color: "#94a3b8" }}>
              Goal: less manual work, better follow-up, and faster daily execution.
            </p>
          </aside>
        </section>

        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>What Motera Does For Showrooms</h2>
          <p style={styles.sectionSub}>
            Easy to understand. Easy to use. Built for daily showroom work.
          </p>
          <div style={styles.grid4}>
            {capabilities.map((item) => (
              <article key={item.title} style={styles.card}>
                <div style={styles.cardIcon}>{item.icon}</div>
                <h3 style={styles.cardTitle}>{item.title}</h3>
                <p style={styles.cardText}>{item.text}</p>
              </article>
            ))}
          </div>

          <div style={styles.strip}>
            <p style={styles.stripText}>
              If your team uses WhatsApp + Sheets + manual notes, Motera puts everything in one place.
            </p>
            <Link to={contactHref} style={styles.ctaGhost}>Talk to Motera Team</Link>
          </div>
        </section>

        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>Role-Based, Not One-Size-Fits-All</h2>
          <p style={styles.sectionSub}>
            Every user sees only what they need to operate.
          </p>
          <div style={styles.rolesGrid}>
            {roles.map((r) => (
              <article key={r.title} style={styles.roleBox}>
                <h3 style={styles.roleHead}>{r.title}</h3>
                <p style={styles.roleLine}>{r.text}</p>
              </article>
            ))}
          </div>
        </section>

        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>Daily Operational Stack</h2>
          <p style={styles.sectionSub}>
            Core modules used by multi-brand two-wheeler teams every day.
          </p>
          <div style={styles.stack}>
            {stack.map(([title, desc]) => (
              <div key={title} style={styles.stackItem}>
                <span style={styles.stackTitle}>{title}:</span> {desc}
              </div>
            ))}
          </div>
        </section>

        <section style={styles.section}>
          <div style={styles.footerBlock}>
            <h2 style={styles.footerTitle}>Bring MOTERA to Your Showroom</h2>
            <p style={styles.footerMeta}>
              Demo-driven onboarding for two-wheeler multi-brand dealerships.
            </p>
            <p style={styles.footerMeta}>Business Hours: {BUSINESS_HOURS}</p>
            <p style={styles.footerMeta}>Email: {CONTACT_EMAIL || "kumarmar869@gmail.com"}</p>
            <p style={styles.footerNote}>
              Need branch-wise setup, role permissions and template alignment? Contact us and we will configure it with your process.
            </p>
            <div style={{ ...styles.ctaRow, marginTop: 4 }}>
              <Link to={contactHref} style={styles.ctaPrimary}>Get Implementation Plan</Link>
              <a href={whatsAppHref} target="_blank" rel="noreferrer" style={styles.ctaGhost}>Message on WhatsApp</a>
            </div>
          </div>
        </section>
      </div>

      <a href={whatsAppHref} target="_blank" rel="noreferrer" style={styles.floatWa} aria-label="Chat on WhatsApp">
        <FaWhatsapp size={30} />
      </a>
    </div>
  );
}
