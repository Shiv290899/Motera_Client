import React from "react";
import { Link } from "react-router-dom";
import { FaWhatsapp } from "react-icons/fa";

import { findShowroomById, PRIMARY_SHOWROOM } from "../data/showrooms";
import {
  SALES_DISPLAY,
  SALES_TEL_LINK,
  SALES_WHATSAPP_LINK,
  BUSINESS_HOURS,
  CONTACT_EMAIL,
} from "../data/contactInfo";

/**
 * Motera - Heroic Home (Upgraded)
 * Changes:
 *  - Removed Google Reviews section
 *  - Added premium "Rider Stories" (testimonials style) + "Trust Strip"
 *  - Added FAQ section
 *  - Improved section separators + visual depth
 */
export default function Home() {
  const useScreen = () => {
    const [width, setWidth] = React.useState(
      typeof window !== "undefined" ? window.innerWidth : 1280
    );
    React.useEffect(() => {
      const onResize = () => setWidth(window.innerWidth);
      window.addEventListener("resize", onResize);
      return () => window.removeEventListener("resize", onResize);
    }, []);
    const isMobile = width <= 480;
    const isTablet = width > 480 && width <= 1024;
    const isDesktop = width > 1024;
    return { width, isMobile, isTablet, isDesktop };
  };

  const { isMobile, isTablet } = useScreen();

  const muddinapalya = findShowroomById("muddinapalya") || PRIMARY_SHOWROOM;

  const toEmbed = (url) => {
    if (!url) return null;
    try {
      const parsed = new URL(url);
      if (!parsed.searchParams.has("output")) parsed.searchParams.set("output", "embed");
      return parsed.toString();
    } catch (err) {
      console.error("Failed to format map URL", err);
      return null;
    }
  };

  const mapEmbedUrl =
    toEmbed(muddinapalya?.mapUrl) ||
    "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3888.251083025643!2d77.54763557508214!3d12.956528587360554!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bae3da9b0d76597%3A0x4788d4bcee66216b!2sRajajinagar%2C%20Bengaluru!5e0!3m2!1sen!2sin!4v1700000000000";

  const containerPad = isMobile ? 14 : 22;
  const heroHeight = isMobile ? 540 : isTablet ? 640 : 740;
  const heroTitleSize = isMobile ? 34 : isTablet ? 50 : 64;
  const heroSubSize = isMobile ? 14 : isTablet ? 16 : 18;

  const gridCols =
    isMobile ? "1fr" : isTablet ? "repeat(2, 1fr)" : "repeat(3, 1fr)";
  
  const highlightCols =
    isMobile ? "1fr" : isTablet ? "repeat(2, 1fr)" : "repeat(4, 1fr)";
  const modelCols =
    isMobile ? "1fr" : isTablet ? "repeat(2, 1fr)" : "repeat(3, 1fr)";
  const journeyCols = isMobile ? "1fr" : "repeat(4, minmax(0, 1fr))";
  const mapHeight = isMobile ? 240 : isTablet ? 300 : 340;

  const styles = {
    root: {
      background: "#060913",
      color: "#e5e7eb",
      minHeight: "100vh",
    },
    container: {
      maxWidth: 1240,
      margin: "0 auto",
      padding: `0 ${containerPad}px`,
    },
    navWrap: {
      position: "sticky",
      top: 0,
      zIndex: 50,
      backdropFilter: "blur(12px)",
      background:
        "linear-gradient(180deg, rgba(6,9,19,0.90), rgba(6,9,19,0.40))",
      borderBottom: "1px solid rgba(148,163,184,0.12)",
    },
    nav: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      height: 64,
    },
    logo: {
      fontWeight: 900,
      letterSpacing: 0.8,
      background: "linear-gradient(92deg,#22d3ee,#a78bfa,#f472b6)",
      WebkitBackgroundClip: "text",
      backgroundClip: "text",
      color: "transparent",
      fontSize: isMobile ? 18 : 22,
    },
    burger: {
      display: isMobile ? "flex" : "none",
      height: 40,
      width: 44,
      alignItems: "center",
      justifyContent: "center",
      border: "1px solid rgba(148,163,184,0.3)",
      borderRadius: 10,
      background: "rgba(255,255,255,0.92)",
      cursor: "pointer",
      boxShadow: "0 2px 10px rgba(0,0,0,0.18)",
    },

    heroWrap: {
      position: "relative",
      height: heroHeight,
      borderRadius: 24,
      overflow: "hidden",
      boxShadow: "0 30px 90px rgba(0,0,0,0.55)",
      marginTop: 12,
      isolation: "isolate",
    },
    heroAurora: {
      position: "absolute",
      inset: -120,
      background:
        "radial-gradient(700px 300px at 20% 10%, rgba(99,102,241,0.25), transparent 60%)," +
        "radial-gradient(700px 300px at 80% 20%, rgba(16,185,129,0.20), transparent 60%)," +
        "radial-gradient(700px 300px at 50% 85%, rgba(236,72,153,0.25), transparent 60%)",
      filter: "blur(10px)",
    },
    heroNoise: {
      position: "absolute",
      inset: 0,
      background:
        "url('data:image/svg+xml;utf8,<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"160\" height=\"160\"><filter id=\"n\"><feTurbulence type=\"fractalNoise\" baseFrequency=\"0.7\" numOctaves=\"2\" stitchTiles=\"stitch\"/></filter><rect width=\"100%\" height=\"100%\" filter=\"url(%23n)\" opacity=\"0.05\"/></svg>')",
      opacity: 0.35,
      mixBlendMode: "overlay",
    },
    heroImg: {
      position: "absolute",
      inset: 0,
      background:
        "url('https://images.unsplash.com/photo-1517602302552-471fe67acf66?q=80&w=1600&auto=format&fit=crop') center/cover no-repeat",
      filter: "brightness(0.45) saturate(1.25)",
      transform: "scale(1.06)",
    },
    heroOverlay: {
      position: "absolute",
      inset: 0,
      background:
        "radial-gradient(ellipse at 50% 100%, rgba(6,9,19,0) 18%, rgba(6,9,19,0.68) 72%)",
    },
    heroContent: {
      position: "relative",
      zIndex: 2,
      height: "100%",
      display: "grid",
      gridTemplateColumns: isMobile ? "1fr" : "1.05fr 0.95fr",
      gap: 18,
      alignItems: "center",
      padding: isMobile ? 14 : 26,
    },
    heroTitle: {
      fontSize: heroTitleSize,
      fontWeight: 900,
      lineHeight: 1.02,
      margin: 0,
      letterSpacing: -0.6,
      background:
        "linear-gradient(90deg,#38bdf8,#a78bfa 35%,#f472b6 65%,#22d3ee)",
      WebkitBackgroundClip: "text",
      backgroundClip: "text",
      color: "transparent",
      textShadow: "0 10px 40px rgba(34,211,238,0.22)",
    },
    heroUnderline: {
      height: 4,
      borderRadius: 999,
      background:
        "linear-gradient(90deg, rgba(56,189,248,0) 0%, rgba(56,189,248,1) 20%, rgba(167,139,250,1) 50%, rgba(244,114,182,1) 80%, rgba(34,211,238,0) 100%)",
      marginTop: 10,
      width: "62%",
      animation: "slideGlow 5s ease-in-out infinite",
    },
    heroSub: {
      fontSize: heroSubSize,
      color: "#cbd5e1",
      marginTop: 12,
      maxWidth: 560,
      lineHeight: 1.6,
    },
    ctaDock: {
      marginTop: 16,
      display: "flex",
      gap: 12,
      flexWrap: "wrap",
      alignItems: "center",
      padding: 12,
      borderRadius: 14,
      background: "rgba(2,6,23,0.60)",
      border: "1px solid rgba(148,163,184,0.22)",
      boxShadow: "0 12px 36px rgba(0,0,0,0.40)",
      backdropFilter: "blur(10px)",
      width: "max-content",
    },
    ctaPrimary: {
      background: "linear-gradient(90deg,#ef4444,#e11d48,#a21caf)",
      color: "white",
      padding: isMobile ? "12px 16px" : "12px 22px",
      borderRadius: 12,
      border: 0,
      cursor: "pointer",
      fontWeight: 900,
      letterSpacing: 0.3,
      boxShadow: "0 12px 28px rgba(225,29,72,0.38)",
      transition: "transform .15s ease, box-shadow .15s ease",
    },
    ctaGhost: {
      background: "transparent",
      color: "#e5e7eb",
      padding: isMobile ? "12px 16px" : "12px 22px",
      borderRadius: 12,
      border: "1px solid rgba(148,163,184,0.55)",
      cursor: "pointer",
      fontWeight: 900,
      letterSpacing: 0.3,
      transition: "transform .15s ease, box-shadow .15s ease",
    },

    heroRightCard: {
      alignSelf: "center",
      justifySelf: "center",
      width: "100%",
      maxWidth: 520,
      borderRadius: 18,
      padding: 16,
      background:
        "linear-gradient(180deg, rgba(255,255,255,0.08), rgba(255,255,255,0.02))",
      border: "1px solid rgba(148,163,184,0.24)",
      boxShadow: "0 18px 55px rgba(0,0,0,0.38)",
      transform: "perspective(1000px) rotateX(2deg) rotateY(-2deg)",
    },

    stats: {
      display: "grid",
      gridTemplateColumns: isMobile ? "repeat(2,1fr)" : "repeat(4,1fr)",
      gap: 14,
      marginTop: 14,
    },
    statCard: {
      background:
        "linear-gradient(180deg, rgba(255,255,255,0.07), rgba(255,255,255,0.02))",
      border: "1px solid rgba(148,163,184,0.22)",
      borderRadius: 14,
      padding: 14,
      textAlign: "center",
    },

    marquee: {
      display: "flex",
      gap: 28,
      overflow: "hidden",
      maskImage:
        "linear-gradient(90deg, transparent, #000 10%, #000 90%, transparent)",
      WebkitMaskImage:
        "linear-gradient(90deg, transparent, #000 10%, #000 90%, transparent)",
      borderTop: "1px dashed rgba(148,163,184,0.22)",
      borderBottom: "1px dashed rgba(148,163,184,0.22)",
      padding: "12px 0",
      marginTop: 16,
    },

    section: { padding: isMobile ? "34px 0" : "48px 0" },
    sectionTitle: { fontSize: isMobile ? 22 : 28, fontWeight: 900, marginBottom: 12 },
    sectionSub: { color: "#93a4c3", marginBottom: 16, fontSize: isMobile ? 13 : 14 },

    highlightGrid: {
      display: "grid",
      gridTemplateColumns: highlightCols,
      gap: 16,
      marginTop: 26,
    },
    highlightCard: {
      position: "relative",
      borderRadius: 18,
      padding: 18,
      background:
        "linear-gradient(180deg, rgba(255,255,255,0.09), rgba(255,255,255,0.02))",
      border: "1px solid rgba(148,163,184,0.25)",
      boxShadow: "0 18px 48px rgba(0,0,0,0.32)",
      overflow: "hidden",
    },
    highlightGlow: {
      position: "absolute",
      inset: -40,
      opacity: 0.55,
      filter: "blur(14px)",
      mixBlendMode: "screen",
      pointerEvents: "none",
    },
    highlightIcon: { fontSize: 28, marginBottom: 12 },
    highlightTitle: { fontWeight: 800, fontSize: 16, color: "#e2e8f0", marginBottom: 6 },
    highlightText: { fontSize: 13, color: "#cbd5e1", lineHeight: 1.6 },

    ribbon: {
      marginTop: 12,
      borderRadius: 18,
      padding: isMobile ? "18px 20px" : "26px 32px",
      display: "flex",
      flexDirection: isMobile ? "column" : "row",
      alignItems: isMobile ? "flex-start" : "center",
      justifyContent: "space-between",
      gap: 14,
      background: "linear-gradient(95deg,#0f172a 0%,#1d4ed8 45%,#be123c 100%)",
      boxShadow: "0 24px 70px rgba(29,78,216,0.55)",
      border: "1px solid rgba(59,130,246,0.35)",
    },
    ribbonText: {
      color: "#e2e8f0",
      fontWeight: 900,
      fontSize: isMobile ? 18 : 24,
      lineHeight: 1.2,
    },
    ribbonSub: { color: "#cbd5e1", fontSize: 13, marginTop: 6, maxWidth: 560 },
    ribbonCta: {
      display: "inline-flex",
      alignItems: "center",
      gap: 10,
      background: "rgba(15,23,42,0.88)",
      color: "#f8fafc",
      padding: "12px 20px",
      borderRadius: 12,
      fontWeight: 900,
      textDecoration: "none",
      border: "1px solid rgba(226,232,240,0.25)",
      boxShadow: "0 14px 34px rgba(15,23,42,0.45)",
    },

    grid3: { display: "grid", gridTemplateColumns: gridCols, gap: 18 },
    cardWrap: {
      position: "relative",
      padding: 2,
      borderRadius: 18,
      background:
        "conic-gradient(from 180deg at 50% 50%, #22d3ee, #a78bfa, #f472b6, #22c55e, #22d3ee)",
    },
    card: {
      borderRadius: 16,
      padding: 18,
      background:
        "linear-gradient(180deg, rgba(255,255,255,0.07), rgba(255,255,255,0.02))",
      border: "1px solid rgba(148,163,184,0.22)",
      boxShadow: "0 12px 38px rgba(0,0,0,0.3)",
      height: "100%",
      transition: "transform .2s ease, box-shadow .2s ease",
    },

    modelsGrid: {
      display: "grid",
      gridTemplateColumns: modelCols,
      gap: 18,
      marginTop: 18,
    },
    modelCard: {
      position: "relative",
      borderRadius: 20,
      padding: 18,
      background:
        "linear-gradient(180deg, rgba(15,23,42,0.92), rgba(15,23,42,0.62))",
      border: "1px solid rgba(148,163,184,0.26)",
      boxShadow: "0 24px 60px rgba(0,0,0,0.38)",
      display: "grid",
      gap: 14,
      overflow: "hidden",
    },
    modelBadge: {
      alignSelf: "start",
      fontSize: 12,
      padding: "4px 10px",
      borderRadius: 999,
      background: "rgba(56,189,248,0.16)",
      color: "#38bdf8",
      fontWeight: 900,
      width: "max-content",
    },
    modelImageWrap: {
      position: "relative",
      borderRadius: 16,
      overflow: "hidden",
      background:
        "linear-gradient(135deg, rgba(56,189,248,0.18), rgba(244,114,182,0.12))",
    },
    modelImage: {
      width: "100%",
      height: isMobile ? 160 : 200,
      objectFit: "cover",
      display: "block",
      borderRadius: 16,
    },
    modelTitle: { fontWeight: 900, fontSize: 18, color: "#f8fafc" },
    modelMeta: {
      display: "flex",
      justifyContent: "space-between",
      color: "#cbd5e1",
      fontSize: 13,
      gap: 12,
    },
    modelCta: {
      display: "inline-flex",
      gap: 8,
      alignItems: "center",
      padding: "10px 16px",
      borderRadius: 12,
      border: "1px solid rgba(148,163,184,0.35)",
      textDecoration: "none",
      color: "#93c5fd",
      fontWeight: 900,
      background: "rgba(15,23,42,0.55)",
      width: "max-content",
    },

    journeyGrid: {
      display: "grid",
      gridTemplateColumns: journeyCols,
      gap: 18,
      marginTop: 22,
    },
    journeyCard: {
      position: "relative",
      borderRadius: 18,
      padding: 18,
      background:
        "linear-gradient(180deg, rgba(255,255,255,0.07), rgba(15,23,42,0.5))",
      border: "1px solid rgba(148,163,184,0.25)",
      boxShadow: "0 18px 50px rgba(0,0,0,0.32)",
      display: "grid",
      gap: 12,
    },
    journeyMarker: { display: "flex", alignItems: "center", gap: 12 },
    journeyDot: {
      height: 14,
      width: 14,
      borderRadius: "50%",
      background: "linear-gradient(135deg,#38bdf8,#f472b6)",
      boxShadow: "0 0 12px rgba(244,114,182,0.6)",
    },
    journeyLine: {
      flex: 1,
      height: 2,
      background:
        "linear-gradient(90deg, rgba(56,189,248,0.1), rgba(244,114,182,0.6), rgba(56,189,248,0.1))",
    },
    journeyStage: { color: "#e2e8f0", fontWeight: 900, fontSize: 15 },
    journeyText: { color: "#cbd5e1", fontSize: 13, lineHeight: 1.6 },

    visitGrid: {
      display: "grid",
      gridTemplateColumns: isMobile ? "1fr" : "1.1fr 0.9fr",
      gap: 18,
      alignItems: "stretch",
      marginTop: 18,
    },
    mapFrame: {
      width: "100%",
      border: "none",
      borderRadius: 18,
      height: mapHeight,
      boxShadow: "0 22px 50px rgba(0,0,0,0.35)",
      filter: "saturate(1.2) contrast(1.05)",
    },
    visitCard: {
      borderRadius: 18,
      padding: 18,
      background:
        "linear-gradient(180deg, rgba(15,23,42,0.90), rgba(15,23,42,0.55))",
      border: "1px solid rgba(148,163,184,0.28)",
      boxShadow: "0 22px 60px rgba(0,0,0,0.38)",
      display: "grid",
      gap: 14,
    },
    visitRow: {
      display: "flex",
      gap: 12,
      alignItems: "center",
      color: "#cbd5e1",
      fontSize: 13,
    },
    visitIcon: {
      height: 36,
      width: 36,
      borderRadius: 12,
      background: "rgba(71,85,105,0.28)",
      display: "grid",
      placeItems: "center",
      fontSize: 18,
    },
    qrImage: {
      width: 120,
      height: 120,
      objectFit: "contain",
      borderRadius: 12,
      alignSelf: "center",
      background: "rgba(15,23,42,0.6)",
      border: "1px solid rgba(148,163,184,0.25)",
      padding: 10,
    },

    // NEW: Premium "Rider Stories" cards
    storiesGrid: {
      display: "grid",
      gridTemplateColumns: isMobile ? "1fr" : isTablet ? "repeat(2, 1fr)" : "repeat(3, 1fr)",
      gap: 18,
      marginTop: 18,
    },
    storyCard: {
      borderRadius: 18,
      padding: 18,
      background:
        "linear-gradient(180deg, rgba(255,255,255,0.08), rgba(255,255,255,0.02))",
      border: "1px solid rgba(148,163,184,0.22)",
      boxShadow: "0 14px 45px rgba(0,0,0,0.32)",
      display: "grid",
      gap: 10,
      overflow: "hidden",
      position: "relative",
    },
    storyGlow: {
      position: "absolute",
      inset: -60,
      background:
        "radial-gradient(closest-side at 30% 20%, rgba(56,189,248,0.25), transparent 60%)," +
        "radial-gradient(closest-side at 80% 70%, rgba(244,114,182,0.18), transparent 60%)",
      filter: "blur(18px)",
      opacity: 0.9,
      pointerEvents: "none",
    },
    storyTop: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 },
    storyName: { fontWeight: 900, color: "#e2e8f0" },
    storyTag: {
      fontSize: 12,
      padding: "4px 10px",
      borderRadius: 999,
      background: "rgba(34,211,238,0.14)",
      color: "#67e8f9",
      fontWeight: 900,
      width: "max-content",
    },
    storyText: { color: "#cbd5e1", fontSize: 13, lineHeight: 1.65, marginTop: 2 },
    storyStars: { color: "#fbbf24", fontWeight: 900, letterSpacing: 1 },

    // NEW: FAQ
    faqWrap: {
      marginTop: 18,
      display: "grid",
      gap: 12,
    },
    faqItem: {
      borderRadius: 16,
      padding: 16,
      background:
        "linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))",
      border: "1px solid rgba(148,163,184,0.20)",
      boxShadow: "0 12px 34px rgba(0,0,0,0.25)",
    },
    faqQ: { fontWeight: 900, color: "#e2e8f0", marginBottom: 6 },
    faqA: { color: "#cbd5e1", fontSize: 13, lineHeight: 1.65 },

    footer: {
      marginTop: 36,
      padding: "22px 0",
      color: "#8b9bb7",
      borderTop: "1px solid rgba(148,163,184,0.18)",
      fontSize: 14,
      textAlign: "center",
    },

    whatsapp: {
      position: "fixed",
      right: 16,
      bottom: 16,
      height: 62,
      width: 62,
      borderRadius: "50%",
      background: "#25D366",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: "white",
      boxShadow: "0 24px 60px rgba(37,211,102,0.5)",
      cursor: "pointer",
      textDecoration: "none",
      animation: "pulse 2.2s infinite",
      zIndex: 60,
    },
  };

  const highlightCards = [
    {
      icon: "🛠️",
      title: "On-Demand Service",
      text: "Quick pick-up, doorstep delivery and live job card tracking.",
      glow: "linear-gradient(135deg, rgba(14,165,233,0.6), rgba(129,140,248,0.1))",
    },
    {
      icon: "💡",
      title: "Transparent Pricing",
      text: "Upfront estimates, genuine spares and no surprise billing.",
      glow: "linear-gradient(135deg, rgba(192,132,252,0.6), rgba(244,114,182,0.12))",
    },
    {
      icon: "⚡",
      title: "EV Expertise",
      text: "Certified EV bays, diagnostics and charging guidance.",
      glow: "linear-gradient(135deg, rgba(45,212,191,0.6), rgba(56,189,248,0.12))",
    },
    {
      icon: "🤝",
      title: "Relationship First",
      text: "Personal advisors, loyalty rewards and custom finance help.",
      glow: "linear-gradient(135deg, rgba(248,113,113,0.6), rgba(251,191,36,0.12))",
    },
  ];

  const modelCards = [
    {
      name: "Honda Shine",
      badge: "Hot Seller",
      price: "Starts Rs 87K",
      range: "65 kmpl city mileage",
      image:
        "https://imgd.aeplcdn.com/664x374/n/cw/ec/1/versions/honda-shine-drum1751549564957.jpg?q=80",
    },
    {
      name: "TVS iQube ST",
      badge: "EV Ready",
      price: "Starts Rs 1.24L",
      range: "145 km certified range",
      image:
        "https://www.tvsmotor.com/electric-scooters/tvs-iqube/-/media/Vehicles/Feature/Iqube/Variant/TVS-iQube/Vehicle-Highlights/Ride-In-style/v-tg-matte.webp",
    },
    {
      name: "Yamaha MT-15",
      badge: "Performance",
      price: "Starts Rs 1.67L",
      range: "155 cc - Liquid cooled",
      image:
        "https://imgd.aeplcdn.com/664x374/n/bw/models/colors/yamaha-select-model-metallic-black-2023-1680847548270.png?q=80",
    },
  ];

  const journeySteps = [
    { stage: "Discover", copy: "Browse 40+ two-wheelers, compare on-road pricing and explore EMI calculators online." },
    { stage: "Experience", copy: "Instant test rides scheduled from your nearest Motera experience center." },
    { stage: "Purchase", copy: "Paperwork, insurance and delivery handled in a single sitting with digital updates." },
    { stage: "Care", copy: "Scheduled service reminders, free health checks and priority support for loyal riders." },
  ];

  const visitRows = [
    { icon: "📍", text: muddinapalya?.address || "Muddinapalya, Bengaluru" },
    { icon: "⏰", text: BUSINESS_HOURS },
    { icon: "📞", text: `Sales: ${SALES_DISPLAY}` },
    { icon: "✉️", text: CONTACT_EMAIL },
  ];

  // NEW: Rider Stories (premium alternative to Google reviews)
  const riderStories = [
    {
      name: "Ravi K.",
      tag: "Fast Delivery",
      stars: 5,
      text: "Booked in the morning, delivery was smooth and the team handled insurance & paperwork without hassle.",
    },
    {
      name: "Meghana S.",
      tag: "Service Quality",
      stars: 5,
      text: "Job card updates were clear, the estimate matched the bill, and the bike felt brand-new after service.",
    },
    {
      name: "Imran A.",
      tag: "Transparent Pricing",
      stars: 4,
      text: "Very straightforward pricing and genuine spares. No hidden add-ons. Good experience overall.",
    },
  ];

  const faq = [
    {
      q: "Do you support multi-brand service and genuine spares?",
      a: "Yes. We support major brands and use genuine spares where available (or verified OEM-grade alternatives with your approval).",
    },
    {
      q: "Can I book a service slot on WhatsApp?",
      a: "Yes. Click the WhatsApp button and our advisor will schedule your slot and share the estimate quickly.",
    },
    {
      q: "Do you provide doorstep pick-up and drop?",
      a: "In selected areas, yes. Availability depends on your location and time slot.",
    },
    {
      q: "Do you offer finance/EMI options for bikes?",
      a: "Yes. We can share EMI plans and required documents instantly after you choose a model.",
    },
  ];

  return (
    <div style={styles.root}>
      <style>{`
        @keyframes pulse { 0%,100%{transform:scale(1)} 50%{transform:scale(1.06)} }
        @keyframes scrollX { from{ transform: translateX(0) } to{ transform: translateX(-50%) } }
        @keyframes slideGlow { 0%,100%{ opacity:.6 } 50%{ opacity:1 } }
        .tilt:hover { transform: translateY(-2px); box-shadow: 0 18px 70px rgba(0,0,0,.55) }
        .cta:hover { transform: translateY(-1px); box-shadow: 0 14px 38px rgba(0,0,0,.38) }
        .marquee-track { display:flex; gap:28px; width:max-content; animation: scrollX 24s linear infinite }
      `}</style>

      {!isMobile && (
        <div style={styles.navWrap}>
          <div style={{ ...styles.container, ...styles.nav }}>
            <div style={styles.logo}>MOTERA</div>
            <button
              type="button"
              style={styles.burger}
              onClick={() =>
                document.getElementById("offerings")?.scrollIntoView({ behavior: "smooth" })
              }
            >
              <div style={{ display: "grid", gap: 4 }}>
                <span style={{ height: 2, width: 20, background: "#131417", display: "block" }} />
                <span style={{ height: 2, width: 16, background: "#131417", display: "block" }} />
                <span style={{ height: 2, width: 20, background: "#131417", display: "block" }} />
              </div>
            </button>
          </div>
        </div>
      )}

      <div style={styles.container}>
        <section style={styles.heroWrap} role="img" aria-label="Motorcycle hero">
          <div style={styles.heroImg} />
          <div style={styles.heroAurora} />
          <div style={styles.heroNoise} />
          <div style={styles.heroOverlay} />

          <div style={styles.heroContent}>
            <div>
              <h1 style={styles.heroTitle}>Ride Bold. Service Smart. Save More.</h1>
              <div style={styles.heroUnderline} />
              <p style={styles.heroSub}>
                Bengaluru’s multi-brand hub for bikes & scooters — transparent pricing, expert service and genuine spares
                with fast turnaround.
              </p>

              <div style={styles.ctaDock}>
                <button
                  className="cta"
                  style={styles.ctaPrimary}
                  onClick={() => document.getElementById("enquiry")?.scrollIntoView({ behavior: "smooth" })}
                >
                  Book a Test Ride
                </button>
                <button
                  className="cta"
                  style={styles.ctaGhost}
                  onClick={() => document.getElementById("products")?.scrollIntoView({ behavior: "smooth" })}
                >
                  Browse Products
                </button>
                <span style={{ color: "#93a4c3", fontSize: 12 }}>
                  No spam — Instant WhatsApp assistance
                </span>
              </div>
            </div>

            <aside style={styles.heroRightCard} className="tilt">
              <div style={{ display: "grid", gap: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontWeight: 900 }}>Today’s Highlights</span>
                  <span style={{ fontSize: 12, color: "#93a4c3" }}>Live</span>
                </div>

                <div style={styles.stats}>
                  {[
                    { k: "Showrooms", v: "10+" },
                    { k: "Happy Riders", v: "25k+" },
                    { k: "Avg. Rating", v: "4.7★" },
                    { k: "Genuine Parts", v: "100%" },
                  ].map((stat) => (
                    <div key={stat.k} style={styles.statCard}>
                      <div style={{ fontSize: 18, fontWeight: 900 }}>{stat.v}</div>
                      <div style={{ fontSize: 12, color: "#9fb0cf" }}>{stat.k}</div>
                    </div>
                  ))}
                </div>

                <div style={{ fontSize: 12, color: "#9fb0cf" }}>
                  Trusted across Bengaluru — quick service, transparent costs and verified parts.
                </div>
              </div>
            </aside>
          </div>

          <div style={{ position: "absolute", left: 0, right: 0, bottom: 0 }}>
            <div style={{ ...styles.container, ...styles.marquee }}>
              <div className="marquee-track">
                {[
                  "Honda","TVS","Yamaha","Bajaj","Hero","Ather","KTM","Royal Enfield",
                  "Honda","TVS","Yamaha","Bajaj","Hero","Ather","KTM","Royal Enfield",
                ].map((brand, index) => (
                  <span key={`${brand}-${index}`} style={{ fontWeight: 900, color: "#cbd5e1" }}>
                    {brand}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>

      <div style={styles.container}>
        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>Why Riders Choose Motera</h2>
          <p style={styles.sectionSub}>
            A premium dealership journey built on trust, transparency and tech-enabled service.
          </p>

          <div style={styles.highlightGrid}>
            {highlightCards.map((card) => (
              <div key={card.title} style={styles.highlightCard} className="tilt">
                <span style={{ ...styles.highlightGlow, background: card.glow }} />
                <div style={{ position: "relative", display: "grid", gap: 12 }}>
                  <span style={styles.highlightIcon} aria-hidden>{card.icon}</span>
                  <h3 style={styles.highlightTitle}>{card.title}</h3>
                  <p style={styles.highlightText}>{card.text}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      <div style={styles.container}>
        <section style={{ ...styles.section, paddingTop: 0 }}>
          <div style={styles.ribbon}>
            <div>
              <div style={styles.ribbonText}>Upgrade your ride with launch offers and instant delivery slots.</div>
              <p style={styles.ribbonSub}>
                Speak with an advisor now — curated vehicle options, EMI plans and service packages shared in minutes.
              </p>
            </div>
            <a href={SALES_TEL_LINK || "tel:+919731366921"} style={styles.ribbonCta}>
              Call Sales Desk
            </a>
          </div>
        </section>
      </div>

      <div style={styles.container}>
        <section style={styles.section} id="offerings">
          <h2 style={styles.sectionTitle}>We Do - We Offer - We Prefer</h2>
          <p style={styles.sectionSub}>
            End-to-end dealership services focused on sales, service, safety and genuine spares.
          </p>

          <div style={styles.grid3}>
            {[
              { title: "Sales", text: "Latest multi-branded bikes and EVs with on-road prices and flexible EMI options." },
              { title: "Service", text: "Multi-point inspection, maintenance and quick turnaround by certified technicians." },
              { title: "Safety", text: "Ride assured with verified spares, helmets and curated accessories." },
            ].map((card) => (
              <div key={card.title} style={styles.cardWrap}>
                <article style={styles.card} className="tilt">
                  <h3 style={{ marginTop: 4, color: "#e2e8f0", fontWeight: 900 }}>{card.title}</h3>
                  <p style={{ color: "#cbd5e1", lineHeight: 1.6 }}>{card.text}</p>
                </article>
              </div>
            ))}
          </div>
        </section>
      </div>

      <div style={styles.container}>
        <section style={styles.section} id="products">
          <h2 style={styles.sectionTitle}>Featured Two-Wheelers</h2>
          <p style={styles.sectionSub}>
            Handpicked machines ready for immediate delivery with finance and exchange support.
          </p>

          <div style={styles.modelsGrid}>
            {modelCards.map((item) => (
              <article key={item.name} style={styles.modelCard} className="tilt">
                <span style={styles.modelBadge}>{item.badge}</span>
                <div style={styles.modelImageWrap}>
                  <img src={item.image} alt={item.name} style={styles.modelImage} />
                </div>
                <h3 style={styles.modelTitle}>{item.name}</h3>
                <div style={styles.modelMeta}>
                  <span>{item.price}</span>
                  <span>{item.range}</span>
                </div>
                <Link to="/quotation" style={styles.modelCta}>
                  Get On-Road Price  &rarr;
                </Link>
              </article>
            ))}
          </div>
        </section>
      </div>

      <div style={styles.container}>
        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>Your Motera Journey</h2>
          <p style={styles.sectionSub}>
            We stay with you at every milestone — from first test ride to scheduled service.
          </p>

          <div style={styles.journeyGrid}>
            {journeySteps.map((step) => (
              <article key={step.stage} style={styles.journeyCard}>
                <div style={styles.journeyMarker}>
                  <span style={styles.journeyDot} />
                  <div style={styles.journeyLine} />
                </div>
                <h3 style={styles.journeyStage}>{step.stage}</h3>
                <p style={styles.journeyText}>{step.copy}</p>
              </article>
            ))}
          </div>
        </section>
      </div>

      {/* ✅ NEW Premium replacement section (instead of Google Reviews) */}
      <div style={styles.container}>
        <section style={styles.section} id="stories">
          <h2 style={styles.sectionTitle}>Rider Stories</h2>
          <p style={styles.sectionSub}>Real experiences — fast service, clear estimates, and a smoother ride.</p>

          <div style={styles.storiesGrid}>
            {riderStories.map((s) => (
              <article key={s.name} style={styles.storyCard} className="tilt">
                <div style={styles.storyGlow} />
                <div style={{ position: "relative", display: "grid", gap: 10 }}>
                  <div style={styles.storyTop}>
                    <div style={styles.storyName}>{s.name}</div>
                    <div style={styles.storyTag}>{s.tag}</div>
                  </div>
                  <div style={styles.storyStars}>
                    {"★".repeat(Math.floor(s.stars))}
                    {"☆".repeat(5 - Math.floor(s.stars))}
                  </div>
                  <div style={styles.storyText}>{s.text}</div>
                </div>
              </article>
            ))}
          </div>

          {/* Trust strip */}
          <div style={{ marginTop: 18, display: "grid", gap: 12 }}>
            <div
              style={{
                borderRadius: 16,
                padding: 16,
                background:
                  "linear-gradient(90deg, rgba(34,211,238,0.12), rgba(167,139,250,0.10), rgba(244,114,182,0.10))",
                border: "1px solid rgba(148,163,184,0.22)",
                boxShadow: "0 14px 42px rgba(0,0,0,0.25)",
                display: "flex",
                gap: 12,
                flexWrap: "wrap",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div style={{ fontWeight: 900, color: "#e2e8f0" }}>
                ✅ Verified spares • ✅ Upfront estimates • ✅ Digital updates
              </div>
              <div style={{ color: "#cbd5e1", fontSize: 13 }}>
                Need help now? Tap WhatsApp — we respond quickly.
              </div>
            </div>
          </div>
        </section>
      </div>

      <div style={styles.container}>
        <section style={styles.section} id="enquiry">
          <h2 style={styles.sectionTitle}>Visit & Connect</h2>
          <p style={styles.sectionSub}>
            Drop by our flagship outlet or book a callback. We respond within 15 minutes.
          </p>

          <div style={styles.visitGrid}>
            <iframe
              style={styles.mapFrame}
              title="Motera Map"
              loading="lazy"
              src={mapEmbedUrl}
              allowFullScreen
              referrerPolicy="no-referrer-when-downgrade"
            />

            <aside style={styles.visitCard}>
              <div style={{ display: "grid", gap: 12 }}>
                {visitRows.map((row) => (
                  <div key={row.text} style={styles.visitRow}>
                    <span style={styles.visitIcon}>{row.icon}</span>
                    <span>{row.text}</span>
                  </div>
                ))}
              </div>

              <div style={{ borderTop: "1px solid rgba(148,163,184,0.22)", paddingTop: 14, display: "grid", gap: 10 }}>
                <strong style={{ color: "#e2e8f0" }}>Quick Links</strong>
                <Link to="/bookingform" style={{ color: "#93c5fd", textDecoration: "none", fontWeight: 900 }}>
                  Book a Service Slot  &rarr;
                </Link>
                <Link to="/jobcard" style={{ color: "#93c5fd", textDecoration: "none", fontWeight: 900 }}>
                  Create Job Card  &rarr;
                </Link>
                <Link to="/quotation" style={{ color: "#93c5fd", textDecoration: "none", fontWeight: 900 }}>
                  Request Quotation  &rarr;
                </Link>
              </div>

              <img src="/location-qr.png" alt="Location QR" style={styles.qrImage} />
            </aside>
          </div>
        </section>
      </div>

      {/* ✅ NEW FAQ section */}
      <div style={styles.container}>
        <section style={styles.section} id="faq">
          <h2 style={styles.sectionTitle}>FAQ</h2>
          <p style={styles.sectionSub}>Quick answers — so your booking becomes faster.</p>

          <div style={styles.faqWrap}>
            {faq.map((item) => (
              <div key={item.q} style={styles.faqItem} className="tilt">
                <div style={styles.faqQ}>{item.q}</div>
                <div style={styles.faqA}>{item.a}</div>
              </div>
            ))}
          </div>
        </section>
      </div>

      <div style={styles.container}>
        <footer style={styles.footer}>
          <div>© {new Date().getFullYear()} Motera. All rights reserved.</div>
        </footer>
      </div>

      <a
        style={styles.whatsapp}
        href={SALES_WHATSAPP_LINK || "https://wa.me/919731366921"}
        target="_blank"
        rel="noreferrer"
        aria-label="Chat on WhatsApp"
        title="Chat on WhatsApp"
      >
        <FaWhatsapp size={28} />
      </a>
    </div>
  );
}
