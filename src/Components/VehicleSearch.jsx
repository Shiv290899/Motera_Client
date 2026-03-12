import React, { useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Alert,
  Button,
  Card,
  Col,
  Descriptions,
  Empty,
  Input,
  List,
  Modal,
  Radio,
  Row,
  Space,
  Tag,
  Typography,
  message,
  Grid,
} from "antd";
import dayjs from "dayjs";
import { saveBookingViaWebhook, saveJobcardViaWebhook } from "../apiCalls/forms";
import { resolveUnifiedGasUrl } from '../utils/ownerConfig';
import PostServiceSheet from "./PostServiceSheet";
import { handleSmartPrint } from "../utils/printUtils";
import { exportToCsv } from "../utils/csvExport";

const { Text } = Typography;

const DEFAULT_BOOKING_GAS_URL =
  "https://script.google.com/macros/s/AKfycbz_DoNoD0XTx3RNMOSZfypbMqWVN4yTy3ct96aE4LhJ9yb_YvKr0GRbO_GA3Fgkwptb/exec?module=booking";
const DEFAULT_JOBCARD_GAS_URL =
  "https://script.google.com/macros/s/AKfycbz_DoNoD0XTx3RNMOSZfypbMqWVN4yTy3ct96aE4LhJ9yb_YvKr0GRbO_GA3Fgkwptb/exec?module=jobcard";
const GAS_SECRET = import.meta.env.VITE_JOBCARD_GAS_SECRET || "";
const BOOKING_SECRET = import.meta.env.VITE_BOOKING_GAS_SECRET || "";

const getBookingGasUrl = () =>
  resolveUnifiedGasUrl('booking', import.meta.env.VITE_BOOKING_GAS_URL || DEFAULT_BOOKING_GAS_URL);
const getJobcardGasUrl = () =>
  resolveUnifiedGasUrl('jobcard', import.meta.env.VITE_JOBCARD_GAS_URL || DEFAULT_JOBCARD_GAS_URL);

const ordinal = (n) => {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return `${n}${s[(v - 20) % 10] || s[v] || s[0]}`;
};

const normalizeMobile = (x) => String(x || "").replace(/\D/g, "").slice(-10);
const isMobileLike = (x) => normalizeMobile(x).length === 10;
const normalizeReg = (x) => String(x || "").toUpperCase().replace(/\s+/g, "");
const VEHICLE_FULL_RX = /^[A-Z]{2}\d{2}[A-Z]{2}\d{4}$/;
const isVehiclePartial = (val) => {
  const v = String(val || "").toUpperCase();
  if (!/^[A-Z0-9]*$/.test(v)) return false;
  const stages = [
    /^[A-Z]{0,2}$/,
    /^[A-Z]{2}\d{0,2}$/,
    /^[A-Z]{2}\d{2}[A-Z]{0,2}$/,
    /^[A-Z]{2}\d{2}[A-Z]{2}\d{0,4}$/,
  ];
  return stages.some((rx) => rx.test(v));
};

// Optional mechanic contacts (disabled)
const MECHANIC_CONTACTS = {};

const getMechanicContact = (name) => {
  const key = String(name || "").trim();
  if (!key) return "";
  return MECHANIC_CONTACTS[key] || MECHANIC_CONTACTS[key.toUpperCase()] || "";
};

const parseDate = (val) => {
  const d = dayjs(val);
  return d.isValid() ? d : null;
};

const _pick = (obj = {}, keys = []) =>
  String(keys.map((k) => obj?.[k] ?? "").find((v) => v !== "") || "").trim();

const parseBookingRow = (row) => {
  const vTop = row?.values || {};
  const p = row?.payload || row || {};
  const v = p.vehicle || {};
  const mobile = normalizeMobile(p.mobileNumber || p.mobile || "");
  const when = parseDate(p.ts || p.createdAt);
  const attachments = [
    ...(Array.isArray(p.attachments) ? p.attachments : []),
    ...(Array.isArray(p.files) ? p.files : []),
  ];
  const pickDirect = (obj, keys) =>
    keys
      .map((k) => obj?.[k])
      .find((v) => v != null && String(v).trim() !== "");

  const invoiceUrl =
    p.invoiceFileUrl ||
    row?.invoiceFileUrl ||
    pickDirect(vTop, ["Invoice File URL", "Invoice_File_URL", "invoiceFileUrl", "invoice_file_url"]) ||
    pickDirect(p, ["Invoice File URL", "Invoice_File_URL", "invoiceFileUrl", "invoice_file_url"]) ||
    vTop?.invoiceFileUrl ||
    vTop?.["Invoice File URL"] ||
    p["Invoice File URL"] ||
    null;
  const insuranceUrl =
    p.insuranceFileUrl ||
    row?.insuranceFileUrl ||
    pickDirect(vTop, ["Insurance File URL", "Insurance_File_URL", "insuranceFileUrl", "insurance_file_url"]) ||
    pickDirect(p, ["Insurance File URL", "Insurance_File_URL", "insuranceFileUrl", "insurance_file_url"]) ||
    vTop?.insuranceFileUrl ||
    vTop?.["Insurance File URL"] ||
    p["Insurance File URL"] ||
    null;
  const docsUrl =
    attachments?.[0]?.url ||
    attachments?.[0]?.fileId ||
    p.file?.url ||
    p.file?.fileId ||
    vTop?.file?.url ||
    vTop?.file?.fileId ||
    null;
  const billLink =
    invoiceUrl ||
    p.bookingSheetUrl ||
    p.file?.url ||
    p.file?.fileId ||
    vTop?.bookingSheetUrl ||
    vTop?.file?.url ||
    vTop?.file?.fileId ||
    attachments?.[0]?.url ||
    null;
  return {
    id: p.bookingId || p.serialNo || p.id || "",
    customerName: p.customerName || p.name || "",
    mobile,
    vehicle: [v.company, v.model, v.variant].filter(Boolean).join(" "),
    color: v.color || "",
    chassis: v.chassisNo || "",
    branch: p.branch || "",
    purchaseMode: p.purchaseMode || p.purchaseType || "",
    createdAt: when,
    raw: p,
    billLink,
    invoiceUrl,
    insuranceUrl,
    docsUrl,
  };
};

const parseJobRow = (row) => {
  const root = row || {};
  const p = row?.payload || row?.values || root;
  const fv = p.formValues || p.values || {};
  const custName =
    fv.custName ||
    p.custName ||
    p.customerName ||
    p["Customer Name"] ||
    p.name ||
    "";
  const mobile = normalizeMobile(
    fv.custMobile ||
      p.custMobile ||
      p.mobile ||
      p["Mobile Number"] ||
      p["Mobile"] ||
      ""
  );
  const postServiceAt =
    p.postServiceAt ||
    p.postService_at ||
    p.Post_Service_At ||
    p["Post Service At"] ||
    p["Post_Service_At"] ||
    fv.postServiceAt ||
    fv.postService_at ||
    fv["Post Service At"] ||
    root.postServiceAt ||
    root.postService_at ||
    root.Post_Service_At ||
    root["Post Service At"] ||
    root["Post_Service_At"] ||
    "";
  const ts =
    postServiceAt ||
    p.ts ||
    p.timestamp ||
    p.createdAt ||
    p["Created At"] ||
    fv.createdAt ||
    fv.created_at ||
    fv.timestamp ||
    "";
  const regNo =
    fv.regNo ||
    fv.vehicleNo ||
    fv.registrationNumber ||
    p.RegNo ||
    p["Vehicle No"] ||
    p["Registration Number"] ||
    "";
  const billLink =
    p.billUrl ||
    p.billLink ||
    p.bill?.url ||
    p.file?.url ||
    (Array.isArray(p.attachments) ? p.attachments[0]?.url : null) ||
    null;
  return {
    jcNo:
      fv.jcNo ||
      p.jcNo ||
      p["JC No"] ||
      p["Job Card No"] ||
      p["JC Number"] ||
      "",
    serviceType:
      fv.serviceType || p.serviceType || p["Service Type"] || p.Service || "",
    regNo,
    model: fv.model || p.model || "",
    company: fv.company || p.company || "",
    color: fv.color || p.color || "",
    colour: fv.colour || p.colour || p.color || "",
    custName,
    amount:
      (p.totals && p.totals.grand) ||
      p.amount ||
      p["Service Amount"] ||
      p["Collected Amount"] ||
      "",
    paymentMode:
      p.paymentMode ||
      p["Payment Mode"] ||
      p.Payment_Mode ||
      fv.paymentMode ||
      "",
    branch: fv.branch || p.branch || "",
    mechanic: fv.mechanic || p.mechanic || "",
    executive: fv.executive || p.executive || "",
    remarks:
      p.remark ||
      p.Remarks ||
      p.remarkText ||
      p["Remark Text"] ||
      fv.remarks ||
      root.remarks ||
      root.Remarks ||
      root.remarkText ||
      root["Remark Text"] ||
      "",
    km: (() => {
      const raw =
        fv.km ||
        p.km ||
        p.KM ||
        p["KM"] ||
        p["Odometer Reading"] ||
        p["Odometer"] ||
        (p.totals && p.totals.km) ||
        (p.payload && p.payload.km) ||
        (p.payload && p.payload.formValues && p.payload.formValues.km) ||
        root.KM ||
        root["KM"] ||
        (root.values && (root.values.KM || root.values["KM"] || root.values["Odometer Reading"] || root.values["Odometer"]));
      const digits = String(raw || "").replace(/\D/g, "");
      return digits || raw || "";
    })(),
    serviceNo:
      (() => {
        const sn =
          p.serviceNo ||
          p.serviceNumber ||
          p.visitNo ||
          p.visit ||
          fv.serviceNo ||
          p["Service No"] ||
          p["Service #"] ||
          p["Visit No"] ||
          "";
        const n = Number.parseInt(sn, 10);
        return Number.isFinite(n) ? n : null;
      })() || null,
    mobile,
    createdAt: parseDate(ts),
    billLink,
    raw: p,
  };
};

export default function VehicleSearch() {
  const BOOKING_GAS_URL = getBookingGasUrl();
  const JOBCARD_GAS_URL = getJobcardGasUrl();
  const screens = Grid.useBreakpoint();
  const isMobile = !screens.md;
  const navigate = useNavigate();
  const [mode, setMode] = useState("vehicle"); // mobile | vehicle
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [bookings, setBookings] = useState([]);
  const [services, setServices] = useState([]);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [serviceLoading, setServiceLoading] = useState(false);
  const [error, setError] = useState("");
  const [invoiceOpen, setInvoiceOpen] = useState(false);
  const [invoiceData, setInvoiceData] = useState(null);
  const [docPreview, setDocPreview] = useState({ open: false, title: "", url: "", mobile: "" });
  const invoiceRef = useRef(null);
  const searchSeqRef = useRef(0);
  const serviceQualityRef = useRef(0);
  const bookingQualityRef = useRef(0);

  const mainBooking = bookings[0] || null;
  const serviceTimeline = useMemo(() => {
    const sorted = [...services].sort((a, b) => {
      const ta = a.createdAt ? a.createdAt.valueOf() : 0;
      const tb = b.createdAt ? b.createdAt.valueOf() : 0;
      if (ta !== tb) return ta - tb;
      const sa = Number.isFinite(a.serviceNo) ? a.serviceNo : 0;
      const sb = Number.isFinite(b.serviceNo) ? b.serviceNo : 0;
      return sa - sb;
    });
    return sorted;
  }, [services]);

  const fetchServiceHistory = async (searchQuery) => {
    if (!JOBCARD_GAS_URL) return [];
    const payload = GAS_SECRET
      ? { action: "getServiceHistory", query: searchQuery, mode, secret: GAS_SECRET }
      : { action: "getServiceHistory", query: searchQuery, mode };
    const call = async (method) => {
      const resp = await saveJobcardViaWebhook({
        webhookUrl: JOBCARD_GAS_URL,
        method,
        payload,
      });
      const js = resp?.data || resp;
      return Array.isArray(js?.rows) ? js.rows : [];
    };
    try {
      let rows = [];
      try {
        rows = await call("GET");
      } catch (e) {
        console.warn("Service history GET failed", e);
      }
      if (!rows.length) {
        try {
          rows = await call("POST");
        } catch (e) {
          console.warn("Service history POST failed", e);
        }
      }
      return rows;
    } catch (e) {
      console.warn("Service history fetch failed", e);
      return [];
    }
  };

  const runSearch = async () => {
    const qRaw = String(query || "").trim();
    if (!qRaw) {
      message.warning("Enter mobile or vehicle number to search");
      return;
    }
    // Validate/normalize based on mode
    let q = qRaw;
    if (mode === "mobile") {
      const digits = normalizeMobile(qRaw);
      if (digits.length !== 10) {
        message.error("Enter a valid 10-digit mobile number.");
        return;
      }
      q = digits;
    } else {
      const reg = normalizeReg(qRaw);
      if (!VEHICLE_FULL_RX.test(reg)) {
        message.error("Enter vehicle as KA03AB1234 (AA##AA####).");
        return;
      }
      q = reg;
    }
    const searchSeq = ++searchSeqRef.current;
    const isActiveSearch = () => searchSeqRef.current === searchSeq;
    serviceQualityRef.current = 0;
    bookingQualityRef.current = 0;
    setLoading(true);
    setBookingLoading(true);
    setServiceLoading(true);
    setBookings([]);
    setServices([]);
    setError("");
    try {
      let nextBookings = [];
      let nextServices = [];
      const searchQuery = mode === "mobile" ? normalizeMobile(q) || q : normalizeReg(q);
      const fetchBookings = async (payload, method = "GET") => {
        const resp = await saveBookingViaWebhook({
          webhookUrl: BOOKING_GAS_URL,
          method,
          payload,
        });
        const js = resp?.data || resp;
        return Array.isArray(js?.rows) ? js.rows : [];
      };
      const fetchJobRows = async (payload, method = "GET") => {
        const resp = await saveJobcardViaWebhook({
          webhookUrl: JOBCARD_GAS_URL,
          method,
          payload,
        });
        const js = resp?.data || resp;
        return Array.isArray(js?.rows) ? js.rows : [];
      };

      const bookingTasks = [];
      const serviceTasks = [];
      let bookingPending = 0;
      let servicePending = 0;

      const scoreBookingRows = (rows = []) =>
        rows.reduce((sum, r) => {
          if (!r) return sum;
          return (
            sum +
            (r.customerName ? 1 : 0) +
            (r.mobile ? 1 : 0) +
            (r.vehicle ? 1 : 0) +
            (r.branch ? 1 : 0) +
            (r.chassis ? 1 : 0) +
            (r.color ? 1 : 0)
          );
        }, 0);

      const scoreServiceRows = (rows = []) =>
        rows.reduce((sum, r) => {
          if (!r) return sum;
          return (
            sum +
            (r.jcNo ? 1 : 0) +
            (r.custName ? 1 : 0) +
            (r.mobile ? 1 : 0) +
            (r.model ? 1 : 0) +
            (r.company ? 1 : 0) +
            (r.branch ? 1 : 0) +
            (r.executive ? 1 : 0) +
            (r.serviceType ? 1 : 0) +
            (r.colour || r.color ? 1 : 0) +
            (r.km ? 1 : 0)
          );
        }, 0);

      const applyBookings = (rows) => {
        const parsed = (rows || []).map((r) => parseBookingRow(r));
        if (!parsed.length) return;
        const quality = scoreBookingRows(parsed);
        if (
          !nextBookings.length ||
          parsed.length > nextBookings.length ||
          (parsed.length === nextBookings.length && quality >= bookingQualityRef.current)
        ) {
          bookingQualityRef.current = quality;
          nextBookings = parsed;
          if (isActiveSearch()) setBookings(parsed);
        }
        if (isActiveSearch()) setBookingLoading(false);
      };

      const applyServices = (rows) => {
        const parsed = (rows || []).map((r) => parseJobRow(r));
        if (!parsed.length) return;
        const quality = scoreServiceRows(parsed);
        if (
          !nextServices.length ||
          parsed.length > nextServices.length ||
          (parsed.length === nextServices.length && quality >= serviceQualityRef.current)
        ) {
          serviceQualityRef.current = quality;
          nextServices = parsed;
          if (isActiveSearch()) setServices(parsed);
        }
        if (isActiveSearch()) setServiceLoading(false);
      };

      const queueBooking = (payload, method, label) => {
        bookingPending += 1;
        bookingTasks.push(
          fetchBookings(payload, method)
            .then((rows) => applyBookings(rows))
            .catch((e) => console.warn(`Booking ${label} failed`, e))
            .finally(() => {
              bookingPending -= 1;
              if (bookingPending === 0 && isActiveSearch()) setBookingLoading(false);
            })
        );
      };

      const queueService = (payload, method, label) => {
        servicePending += 1;
        serviceTasks.push(
          fetchJobRows(payload, method)
            .then((rows) => applyServices(rows))
            .catch((e) => console.warn(`Service ${label} failed`, e))
            .finally(() => {
              servicePending -= 1;
              if (servicePending === 0 && isActiveSearch()) setServiceLoading(false);
            })
        );
      };

      // Fire booking webhook variants in parallel.
      if (BOOKING_GAS_URL) {
        if (q.toUpperCase().startsWith("BK-")) {
          const payload = BOOKING_SECRET
            ? { action: "search", mode: "booking", query: q.toUpperCase(), secret: BOOKING_SECRET }
            : { action: "search", mode: "booking", query: q.toUpperCase() };
          queueBooking(payload, "GET", "booking GET");
          queueBooking(payload, "POST", "booking POST");
        } else if (mode === "vehicle" && !isMobileLike(q)) {
          const regQuery = normalizeReg(q);
          const payloadVehicle = BOOKING_SECRET
            ? { action: "search", mode: "vehicle", query: regQuery, secret: BOOKING_SECRET }
            : { action: "search", mode: "vehicle", query: regQuery };
          const payloadReg = BOOKING_SECRET
            ? { action: "search", mode: "reg", query: regQuery, secret: BOOKING_SECRET }
            : { action: "search", mode: "reg", query: regQuery };
          queueBooking(payloadVehicle, "GET", "vehicle GET");
          queueBooking(payloadVehicle, "POST", "vehicle POST");
          queueBooking(payloadReg, "GET", "reg GET");
          queueBooking(payloadReg, "POST", "reg POST");
        } else {
          const mobileQuery = normalizeMobile(q) || q;
          const payloadMobile = BOOKING_SECRET
            ? { action: "search", mode: "mobile", query: mobileQuery, secret: BOOKING_SECRET }
            : { action: "search", mode: "mobile", query: mobileQuery };
          queueBooking(payloadMobile, "GET", "mobile GET");
          queueBooking(payloadMobile, "POST", "mobile POST");
        }
      } else if (isActiveSearch()) {
        setBookingLoading(false);
      }

      // Fire service history + search mode variants in parallel.
      if (JOBCARD_GAS_URL) {
        const historyPayload = GAS_SECRET
          ? { action: "getServiceHistory", query: searchQuery, mode, secret: GAS_SECRET }
          : { action: "getServiceHistory", query: searchQuery, mode };
        queueService(historyPayload, "GET", "history GET");
        queueService(historyPayload, "POST", "history POST");

        const jobModes = mode === "vehicle" && !isMobileLike(q) ? ["reg", "vehicle"] : ["mobile", "reg"];
        jobModes.forEach((m) => {
          const payload = GAS_SECRET
            ? { action: "search", mode: m, query: searchQuery, secret: GAS_SECRET }
            : { action: "search", mode: m, query: searchQuery };
          queueService(payload, "GET", `search ${m} GET`);
          queueService(payload, "POST", `search ${m} POST`);
        });
      } else if (isActiveSearch()) {
        setServiceLoading(false);
      }

      await Promise.allSettled([...bookingTasks, ...serviceTasks]);

      if (isActiveSearch() && !nextBookings.length && !nextServices.length) {
        setError("No records found. Check the number and try again.");
      }
    } finally {
      if (isActiveSearch()) {
        setLoading(false);
        setBookingLoading(false);
        setServiceLoading(false);
      }
    }
  };

  const bookingMeta = mainBooking
    ? [
        { label: "Customer", value: mainBooking.customerName || "-" },
        { label: "Mobile", value: mainBooking.mobile || "-" },
        { label: "Vehicle", value: mainBooking.vehicle || "-" },
        { label: "Color", value: mainBooking.color || "-" },
        { label: "Chassis", value: mainBooking.chassis || "-" },
        { label: "Branch", value: mainBooking.branch || "-" },
        {
          label: "Mode",
          value: (mainBooking.purchaseMode || "").toUpperCase() || "-",
        },
        {
          label: "Created",
          value: mainBooking.createdAt
            ? mainBooking.createdAt.format("DD-MM-YYYY HH:mm")
            : "-",
        },
      ]
    : [];

  const newJobcardQuery = useMemo(() => {
    const latestService =
      serviceTimeline && serviceTimeline.length
        ? serviceTimeline[serviceTimeline.length - 1]
        : null;
    const source = latestService || mainBooking;
    if (!source) return "";
    const params = new URLSearchParams();
    const regNo = source.regNo || source.vehicle || "";
    const model = source.model || source.company || source.vehicle || "";
    const colour = source.colour || source.color || source.colour || "";
    const custName = source.custName || source.customerName || "";
    const mobileVal = source.mobile || source.custMobile || "";
    if (regNo) params.set("regNo", regNo);
    if (model) params.set("model", model);
    if (colour) params.set("colour", colour);
    if (custName) params.set("custName", custName);
    if (mobileVal) params.set("custMobile", mobileVal);
    return params.toString();
  }, [serviceTimeline, mainBooking]);

  const handleNewJobcard = () => {
    if (newJobcardQuery) {
      navigate(`/jobcard?${newJobcardQuery}`);
    } else {
      navigate("/jobcard");
    }
  };

  const buildInvoicePayload = (s) => {
    if (!s) return null;
    const payload = s?.raw?.payload || s?.raw || {};
    const fv = payload.formValues || s?.raw?.formValues || {};
    const labourRows = Array.isArray(payload.labourRows) ? payload.labourRows : [];
    const totalsIn = payload.totals || {};
    const computedSub = labourRows.reduce(
      (sum, r) => sum + (Number(r?.qty || 0) * Number(r?.rate || 0)),
      0
    );
    const totals = {
      labourSub: totalsIn.labourSub ?? computedSub,
      labourGST: totalsIn.labourGST ?? 0,
      labourDisc: totalsIn.labourDisc ?? 0,
      grand: totalsIn.grand ?? computedSub,
    };
    const createdAt =
      (s.createdAt && s.createdAt.toDate && s.createdAt.toDate()) ||
      s.createdAt ||
      payload.postServiceAt ||
      payload.createdAt ||
      new Date();
    return {
      vals: {
        jcNo: s.jcNo || fv.jcNo || "",
        regNo: s.regNo || fv.regNo || "",
        custName: s.custName || fv.custName || "",
        custMobile: s.mobile || fv.custMobile || "",
        km: fv.km || "",
        model: s.model || fv.model || "",
        colour: s.colour || fv.colour || "",
        branch: s.branch || fv.branch || "",
        executive: s.executive || fv.executive || "",
        createdAt,
        labourRows,
        gstLabour: totalsIn.gstLabour || totalsIn.labourGST || 0,
      },
      totals,
    };
  };

  const handleInvoice = (s) => {
    const built = buildInvoicePayload(s);
    if (!built) return;
    setInvoiceData(built);
    setInvoiceOpen(true);
    setTimeout(() => {
      try {
        handleSmartPrint(invoiceRef.current);
      } catch {
        /* ignore */
      }
      setTimeout(() => setInvoiceOpen(false), 500);
    }, 50);
  };

  const handleExportCsv = () => {
    const fmt = (v) => {
      const d = dayjs(v);
      return d.isValid() ? d.format("DD-MM-YYYY HH:mm") : "";
    };
    const rowsForCsv = [];
    bookings.forEach((b, idx) => {
      rowsForCsv.push({
        type: "Booking",
        ref: b.id || `booking-${idx + 1}`,
        customer: b.customerName,
        mobile: b.mobile,
        vehicle: b.vehicle,
        color: b.color,
        chassis: b.chassis,
        branch: b.branch,
        createdAt: fmt(b.createdAt),
      });
    });
    serviceTimeline.forEach((s, idx) => {
      rowsForCsv.push({
        type: "Service",
        ref: s.jcNo || `service-${idx + 1}`,
        customer: s.custName || s.customerName,
        mobile: s.mobile,
        vehicle: s.model || s.company,
        color: s.colour || s.color,
        chassis: s.regNo,
        branch: s.branch,
        createdAt: fmt(s.createdAt),
      });
    });
    if (!rowsForCsv.length) {
      message.info("No search results to export");
      return;
    }
    const headers = [
      { key: "type", label: "Type" },
      { key: "ref", label: "Reference" },
      { key: "customer", label: "Customer" },
      { key: "mobile", label: "Mobile" },
      { key: "vehicle", label: "Vehicle" },
      { key: "color", label: "Color" },
      { key: "chassis", label: "Chassis / Reg No" },
      { key: "branch", label: "Branch" },
      { key: "createdAt", label: "Created At" },
    ];
    exportToCsv({ filename: "vehicle-search.csv", headers, rows: rowsForCsv });
    message.success(`Exported ${rowsForCsv.length} records`);
  };

  const openDocPreview = (title, url, mobile = "") => {
    const safeUrl = String(url || "").trim();
    if (!safeUrl) return;
    setDocPreview({ open: true, title: title || "Preview", url: safeUrl, mobile: String(mobile || "") });
  };

  const handlePreviewPrint = () => {
    const url = String(docPreview?.url || "").trim();
    if (!url) return;
    try {
      const frame = document.getElementById("vehicle-search-doc-preview-frame");
      if (frame?.contentWindow) {
        frame.contentWindow.focus();
        frame.contentWindow.print();
        return;
      }
    } catch {
      // Fallback below for cross-origin iframe restrictions.
    }
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const handlePreviewDownload = () => {
    const url = String(docPreview?.url || "").trim();
    if (!url) return;
    const a = document.createElement("a");
    a.href = url;
    a.target = "_blank";
    a.rel = "noreferrer";
    a.download = "";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handlePreviewCopyLink = async () => {
    const url = String(docPreview?.url || "").trim();
    if (!url) return;
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(url);
      } else {
        const ta = document.createElement("textarea");
        ta.value = url;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
      }
      message.success("Link copied");
    } catch {
      message.error("Could not copy link");
    }
  };

  const getWhatsAppPhone = (mobileRaw) => {
    const digits = String(mobileRaw || "").replace(/\D/g, "");
    if (!digits) return "";
    if (digits.length === 10) return `91${digits}`;
    if (digits.length === 12 && digits.startsWith("91")) return digits;
    return digits;
  };

  const handlePreviewWhatsApp = () => {
    const url = String(docPreview?.url || "").trim();
    if (!url) return;
    const phone = getWhatsAppPhone(docPreview?.mobile || mainBooking?.mobile || query);
    if (!phone) {
      message.warning("Customer mobile number not available for WhatsApp share.");
      return;
    }
    const text = `${docPreview?.title || "File"}: ${url}`;
    const waUrl = `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
    window.open(waUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <>
    <div
      style={{
        padding: isMobile ? 12 : 24,
        maxWidth: "100%",
        margin: isMobile ? "12px 0" : "24px 0",
        borderRadius: isMobile ? 16 : 24,
        background: "radial-gradient(circle at top, #0f172a 0%, #020617 40%, #020617 100%)",
        boxShadow: "0 24px 60px rgba(15, 23, 42, 0.8)",
        border: "1px solid rgba(148, 163, 184, 0.2)",
      }}
    >
      <Card
        title={
          <Space align="center" size={8}>
            <span
              style={{
                fontSize: 22,
                color: "#ef4444",
              }}
            >
              🏍️
            </span>
            <span>Vehicle Search</span>
          </Space>
        }
        extra={
          <Space>
            <Button
              size="small"
              onClick={handleExportCsv}
              disabled={!bookings.length && !services.length}
            >
              Export CSV
            </Button>
            <Radio.Group
              value={mode}
              onChange={(e) => {
                const next = e.target.value;
                setMode(next);
                setQuery("");
              }}
              size="small"
            >
              <Radio.Button value="vehicle">Vehicle No</Radio.Button>
              <Radio.Button value="mobile">Mobile</Radio.Button>
            </Radio.Group>
          </Space>
        }
        bodyStyle={{ padding: isMobile ? 12 : 16, paddingBottom: isMobile ? 10 : 12 }}
        style={{
          borderRadius: isMobile ? 16 : 20,
          boxShadow: "0 18px 45px rgba(15, 23, 42, 0.25)",
          border: "1px solid rgba(148, 163, 184, 0.3)",
          overflow: "hidden",
        }}
        headStyle={{
          background: "linear-gradient(135deg, #0f172a 0%, #1d4ed8 60%, #22c55e 100%)",
          color: "#ffffff",
          borderBottom: "none",
          fontSize: isMobile ? 16 : 18,
          fontWeight: 700,
          letterSpacing: 0.4,
        }}
      >
        <Space.Compact style={{ width: "100%" }}>
          <Input
            size={isMobile ? "middle" : "large"}
            placeholder={
              mode === "mobile"
                ? "Enter mobile number"
                : "Enter vehicle number (e.g., KA03AB1234)"
            }
            value={query}
            onChange={(e) => {
              const val = e.target.value || "";
              if (mode === "mobile") {
                const digits = val.replace(/\D/g, "").slice(0, 10);
                setQuery(digits);
                return;
              }
              const up = val.toUpperCase().replace(/[^A-Z0-9]/g, "");
              if (!isVehiclePartial(up)) return;
              setQuery(up);
            }}
            onPressEnter={runSearch}
            allowClear
            style={{
              borderRadius: 999,
              boxShadow: "0 10px 30px rgba(15, 23, 42, 0.2)",
              border: "1px solid rgba(148, 163, 184, 0.5)",
            }}
          />
          <Button
            type="primary"
            size={isMobile ? "middle" : "large"}
            loading={loading}
            onClick={runSearch}
            style={{
              borderRadius: 999,
              paddingInline: isMobile ? 18 : 28,
              boxShadow: "0 12px 30px rgba(37, 99, 235, 0.45)",
              fontWeight: 600,
            }}
          >
            Search
          </Button>
        </Space.Compact>
        {error && (
          <Alert
            style={{ marginTop: 12 }}
            type="warning"
            message={error}
            showIcon
          />
        )}
      </Card>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} md={12}>
          <Card
            title={
              <Space align="center" size={6}>
                <span style={{ fontSize: 18 }}>📒</span>
                <span>Booking Details</span>
              </Space>
            }
            extra={
              <Tag color={bookings.length ? "green" : "default"}>
                {bookingLoading ? "Searching..." : bookings.length ? `${bookings.length} found` : "None"}
              </Tag>
            }
            style={{
              borderRadius: 16,
              boxShadow: "0 8px 24px rgba(15, 23, 42, 0.06)",
              border: "none",
              height: "100%",
            }}
            headStyle={{
              fontWeight: 600,
              borderBottom: "1px solid #e5e7eb",
            }}
            bodyStyle={{ padding: 16 }}
          >
            {!bookings.length ? (
              <Empty description="No booking data" />
            ) : (
              <>
                <Descriptions
                  size="small"
                  column={1}
                  colon
                  bordered
                  items={bookingMeta.map((m) => ({
                    key: m.label,
                    label: m.label,
                    children: m.value || "-",
                  }))}
                />
                <Space wrap style={{ marginTop: 8 }}>
                  {mainBooking.invoiceUrl ? (
                    <Button
                      size="small"
                      type="default"
                      onClick={() => openDocPreview("Invoice Preview", mainBooking.invoiceUrl, mainBooking.mobile)}
                    >
                      Invoice
                    </Button>
                  ) : null}
                  {mainBooking.insuranceUrl ? (
                    <Button
                      size="small"
                      type="default"
                      onClick={() => openDocPreview("Insurance Preview", mainBooking.insuranceUrl, mainBooking.mobile)}
                    >
                      Insurance
                    </Button>
                  ) : null}
                  {mainBooking.docsUrl ? (
                    <Button
                      size="small"
                      type="default"
                      onClick={() => openDocPreview("Docs Preview", mainBooking.docsUrl, mainBooking.mobile)}
                    >
                      Docs
                    </Button>
                  ) : null}
                </Space>
                {bookings.length > 1 && (
                  <List
                    style={{ marginTop: 12 }}
                    size="small"
                    bordered
                    dataSource={bookings.slice(1)}
                    renderItem={(b) => (
                      <List.Item>
                        <Space direction="vertical" size={2}>
                          <Text strong>{b.customerName || "Booking"}</Text>
                          <Text type="secondary">
                            {b.vehicle || "-"} • {b.mobile || "-"}
                          </Text>
                        </Space>
                      </List.Item>
                    )}
                  />
                )}
              </>
            )}
          </Card>
        </Col>

        <Col xs={24} md={12}>
          <Card
            title={
              <Space align="center" size={6}>
                <span style={{ fontSize: 18 }}>🔧</span>
                <span>Service History</span>
              </Space>
            }
            extra={
              <Space size="small">
                <Button size="small" onClick={handleNewJobcard}>
                  New Jobcard
                </Button>
                <Tag color={services.length ? "blue" : "default"}>
                  {serviceLoading ? "Searching..." : services.length ? `${services.length} found` : "None"}
                </Tag>
              </Space>
            }
            style={{
              borderRadius: 16,
              boxShadow: "0 8px 24px rgba(15, 23, 42, 0.06)",
              border: "none",
              height: "100%",
            }}
            headStyle={{
              fontWeight: 600,
              borderBottom: "1px solid #e5e7eb",
            }}
            bodyStyle={{ padding: 16 }}
          >
            {!services.length ? (
              <Empty description="No service history" />
            ) : (
              <List
                size="small"
                dataSource={serviceTimeline}
                renderItem={(s, idx) => (
                  <List.Item>
                    <div
                      style={{
                        width: "100%",
                        border: "1px solid #e5e7eb",
                        borderRadius: 14,
                        padding: 18,
                        background: "linear-gradient(135deg, #f9fafb 0%, #e5e7eb 100%)",
                        minWidth: 0,
                        boxShadow: "0 6px 16px rgba(15, 23, 42, 0.06)",
                      }}
                    >
                      <div style={{ display: "flex", flexDirection: "column", gap: 8, alignItems: "flex-start" }}>
                        <Tag color="gold" style={{ fontWeight: 600 }}>
                          {s.createdAt ? s.createdAt.format("DD-MM-YYYY HH:mm") : "-"}
                        </Tag>
                        <Space wrap size={[8, 8]}>
                          <Tag color="geekblue">{ordinal(s.serviceNo || idx + 1)} Service</Tag>
                          {s.serviceType ? <Tag color="cyan">{s.serviceType}</Tag> : null}
                          {s.branch ? <Tag color="purple">{s.branch}</Tag> : null}
                          {s.jcNo ? <Tag color="green">JC #{s.jcNo}</Tag> : null}
                        </Space>
                      </div>
                      <div style={{ marginTop: 10, display: "grid", gridTemplateColumns: "1.2fr 1fr 0.6fr", gap: 10 }}>
                        <div style={{ fontSize: 16, }}>{s.model || s.company || "-"}</div>
                        <div style={{ fontSize: 16 }}>{s.colour || s.color || "-"}</div>
                        <div style={{ fontSize: 16 }}>{s.km ? `${s.km} KM` : "-"}</div>
                      </div>
                      <div style={{ marginTop: 8, display: "grid", gridTemplateColumns: "1fr 1fr auto", gap: 10, alignItems: "center" }}>
                        <div style={{ fontSize: 15, fontWeight: 600 }}>{s.custName || s.customerName || "-"}</div>
                        <div style={{ fontSize: 15 }}>
                          {s.mechanic || "-"}
                          {getMechanicContact(s.mechanic)
                            ? ` • ${getMechanicContact(s.mechanic)}`
                            : ""}
                        </div>
                        <Button
                          key="invoice"
                          size="small"
                          type="primary"
                          ghost
                          onClick={() => handleInvoice(s)}
                        >
                          Service Invoice
                        </Button>
                      </div>
                      <div style={{ marginTop: 10, display: "flex", justifyContent: "flex-end", gap: 8 }}>
                        {s.billLink ? (
                          <Button
                            key="bill"
                            size="small"
                            type="link"
                            href={s.billLink}
                            target="_blank"
                            rel="noreferrer"
                          >
                            View Bill
                          </Button>
                        ) : null}
                      </div>
                      {s.remarks ? (
                        <div style={{ marginTop: 6 }}>
                          <Text strong>Remarks:</Text> <Text type="secondary">{s.remarks}</Text>
                        </div>
                      ) : null}
                    </div>
                  </List.Item>
                )}
              />
            )}
          </Card>
        </Col>
      </Row>
    </div>

      <PostServiceSheet
        ref={invoiceRef}
        active={invoiceOpen}
        vals={invoiceData?.vals || {}}
        totals={invoiceData?.totals || {}}
      />

      <Modal
        open={docPreview.open}
        title={docPreview.title || "Preview"}
        width={isMobile ? "96vw" : 980}
        onCancel={() => setDocPreview({ open: false, title: "", url: "", mobile: "" })}
        destroyOnClose
        footer={[
          <Button key="whatsapp" type="primary" onClick={handlePreviewWhatsApp}>
            WhatsApp
          </Button>,
          <Button key="print" onClick={handlePreviewPrint}>
            Print
          </Button>,
          <Button key="download" onClick={handlePreviewDownload}>
            Download
          </Button>,
          <Button key="copy" onClick={handlePreviewCopyLink}>
            Copy Link
          </Button>,
          <Button key="newtab" type="default" href={docPreview.url} target="_blank" rel="noreferrer">
            Open in new tab
          </Button>,
          <Button key="close" onClick={() => setDocPreview({ open: false, title: "", url: "", mobile: "" })}>
            Close
          </Button>,
        ]}
      >
        {docPreview.url ? (
          <iframe
            id="vehicle-search-doc-preview-frame"
            title={docPreview.title || "File preview"}
            src={docPreview.url}
            style={{ width: "100%", height: isMobile ? "70vh" : "72vh", border: "1px solid #e5e7eb", borderRadius: 8 }}
          />
        ) : null}
      </Modal>
    </>
  );
}
