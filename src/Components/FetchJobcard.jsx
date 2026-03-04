// FetchJobcard.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Alert, Button, Modal, Input, List, Space, Spin, message, Radio } from "antd";
import { saveBookingViaWebhook, saveJobcardViaWebhook } from "../apiCalls/forms";
import dayjs from "dayjs";
import FetchQuot from "./FetchQuot"; // NEW: for fetching saved quotations
import { resolveUnifiedGasUrl } from "../utils/ownerConfig";

/**
 * Props:
 * - form
 * - sheetUrl
 * - parseCSV
 * - formatReg
 * - buildRows
 * - defaultGstLabour
 * - lists: { BRANCHES, MECHANIC, EXECUTIVES, VEHICLE_TYPES, SERVICE_TYPES }
 * - setServiceTypeLocal
 * - setVehicleTypeLocal
 * - setRegDisplay
 */
export default function FetchJobcard({
  form,
  formatReg,
  buildRows,
  defaultGstLabour = 0,
  lists,
  setServiceTypeLocal,
  setVehicleTypeLocal,
  setRegDisplay,
  webhookUrl, // NEW: Apps Script Web App URL
  setFollowUpEnabled,
  setFollowUpAt,
  setFollowUpNotes,
  setPostServiceLock,
  autoSearch,
  prefillMode = "full", // full | basic
  onAutoSearchStatusChange,
}) {
  const JOB_SECRET = import.meta.env?.VITE_JOBCARD_GAS_SECRET || '';
  const BOOKING_SECRET = import.meta.env?.VITE_BOOKING_GAS_SECRET || '';
  const DEFAULT_BOOKING_GAS_URL =
    "https://script.google.com/macros/s/AKfycbz_DoNoD0XTx3RNMOSZfypbMqWVN4yTy3ct96aE4LhJ9yb_YvKr0GRbO_GA3Fgkwptb/exec?module=booking";
  const BOOKING_GAS_URL = resolveUnifiedGasUrl(
    "booking",
    import.meta.env?.VITE_BOOKING_GAS_URL || DEFAULT_BOOKING_GAS_URL
  );
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState("mobile"); // mobile | vehicle
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [matches, setMatches] = useState([]);
  const [notFoundText, setNotFoundText] = useState("");
  const [, setApplyPrefillMode] = useState(prefillMode);
  const applyModeRef = useRef(prefillMode);

  const { BRANCHES, MECHANIC, EXECUTIVES, VEHICLE_TYPES, SERVICE_TYPES } =
    useMemo(() => lists || {}, [lists]);
  useEffect(() => {
    applyModeRef.current = prefillMode;
    setApplyPrefillMode(prefillMode);
  }, [prefillMode]);

  // ---------- Column synonyms ----------
  const COL = useMemo(
    () => ({
      Branch: ["Branch"],
      Mechanic: ["Allotted Mechanic", "Mechanic", "Allocated Mechanic"],
      Executive: ["Executive"],
      ExpectedDelivery: ["Expected Delivery Date", "Expected Delivery", "Expected_Delivery_Date"],
      RegNo: [
        "Vehicle No", "Vehicle_No",
        "Vehicle Number",
        "Registration Number",
        "Reg No",
        "RegNo",
      ],
      ChassisNo: ["Chassis No", "Chassis_No", "Chassis Number", "Chassis"],
      Model: ["Model"],
      Colour: ["Colour", "Color"],
      KM: ["Odometer Reading", "Odomete Reading", "KM", "Odometer"],
      CustName: ["Customer Name", "Name", "Customer_Name"],
      Mobile: ["Mobile", "Mobile No", "Mobile Number", "Phone", "Phone Number"],
      Obs: ["Customer Observation", "Customer_Observation", "Observation", "Notes"],
      VehicleType: ["Vehicle Type", "Type of Vehicle", "Vehicle_Type"],
      ServiceType: ["Service Type", "Service", "Service_Type"],
      FloorMat: ["Floor Mat"],
      Amount: ["Collected Amount", "Amount"],
      JCNo: ["JC No", "JCNo", "Job Card No", "JC Number", "JC No."],
      CreatedAt: [
        "Created At",
        "Timestamp",
        "Form Timestamp",
        "Submission Time",
        "Submitted At",
      ],
    }),
    []
  );

  // ---------- helpers ----------
  const pick = (row, names) => {
    for (const n of names) {
      if (Object.prototype.hasOwnProperty.call(row, n)) {
        const v = row[n];
        if (v !== undefined && v !== null && String(v).trim() !== "")
          return String(v).trim();
      }
    }
    return "";
  };

  const tenDigits = (x) => String(x || "").replace(/\D/g, "").slice(-10);
  const normalizeReg = (x) => String(x || "").toUpperCase().replace(/[^A-Z0-9]/g, "");
  const VEH_RX = /^[A-Z]{2}\d{2}[A-Z]{2}\d{4}$/;
  const isVehiclePartial = (val) => {
    const v = normalizeReg(val);
    if (v.length > 10) return false;
    if (!/^[A-Z0-9]*$/.test(v)) return false;
    const stages = [
      /^[A-Z]{0,2}$/,
      /^[A-Z]{2}\d{0,2}$/,
      /^[A-Z]{2}\d{2}[A-Z]{0,2}$/,
      /^[A-Z]{2}\d{2}[A-Z]{2}\d{0,4}$/,
    ];
    return stages.some((rx) => rx.test(v));
  };

  const showNotFoundModal = (opts = {}) => {
    const source = opts?.source;
    const isInline = source === "inline";
    const pretty =
      mode === "vehicle"
        ? normalizeReg(query)
        : tenDigits(query) || String(query || "").trim();
    const label = mode === "vehicle" ? "vehicle number" : "mobile number";
    const txt = pretty
      ? `No records found for ${label} "${pretty}".`
      : "No records found.";
    setNotFoundText(txt);
    Modal.warning({
      centered: true,
      title: isInline ? "No records found" : "No job card found",
      content: txt,
      okText: "Got it",
    });
  };

  const parseDDMMYYYY = (s) => {
    const t = String(s || "").trim();
    if (!t) return null;
    const d = dayjs(
      t,
      [
        "DD-MM-YYYY HH:mm",
        "D-M-YYYY HH:mm",
        "DD/MM/YYYY HH:mm",
        "D/M/YYYY HH:mm",
        "DD-MM-YYYY",
        "D-M-YYYY",
        "DD/MM/YYYY",
        "D/M/YYYY",
        "YYYY-MM-DD",
        dayjs.ISO_8601,
      ],
      true
    );
    return d.isValid() ? d : null;
  };

  const parseTimestamp = (row) => {
    const t = pick(row, COL.CreatedAt);
    const d = dayjs(
      t,
      [
        dayjs.ISO_8601,
        "M/D/YYYY H:mm:ss",
        "D/M/YYYY H:mm:ss",
        "DD/MM/YYYY H:mm:ss",
        "DD/MM/YYYY",
        "D-M-YYYY H:mm:ss",
        "DD-MM-YYYY H:mm:ss",
        "DD-MM-YYYY HH:mm",
        "DD-MM-YYYY",
      ],
      false
    );
    return d.isValid() ? d : dayjs(0);
  };

  const payloadTimestampMs = (payload) => {
    const p = payload || {};
    const fv = p.formValues || {};
    const raw =
      p.savedAt ||
      p.createdAt ||
      p.ts ||
      p.timestamp ||
      p.postServiceAt ||
      fv.createdAt ||
      fv.savedAt ||
      fv.timestamp ||
      fv.submittedAt ||
      fv.expectedDelivery ||
      "";
    const d = dayjs(raw);
    return d.isValid() ? d.valueOf() : 0;
  };

  const buildPostLockState = (payloadMaybe, valuesMaybe) => {
    const p = (payloadMaybe && payloadMaybe.payload) ? payloadMaybe.payload : (payloadMaybe || {});
    const v = valuesMaybe || payloadMaybe?._values || payloadMaybe?.values || {};
    const postAt =
      p?.postServiceAt ||
      p?.postService_at ||
      p?.formValues?.postServiceAt ||
      p?.formValues?.postService_at ||
      v?.Post_Service_At ||
      v?.Post_Service_at ||
      v?.Post_Service ||
      "";
    const mobileFromPayload =
      p?.formValues?.custMobile ||
      p?.custMobile ||
      v?.Mobile ||
      v?.["Mobile Number"] ||
      v?.Phone ||
      v?.["Phone Number"] ||
      "";
    const mobile10 = tenDigits(mobileFromPayload);
    const locked = Boolean(p?.postServiceLogged) || Boolean(postAt);
    return {
      locked,
      at: postAt || null,
      mobile: mobile10 || null,
      amount: p?.postServiceAmount ?? null,
      mode: p?.postServiceMode || p?.paymentMode || null,
    };
  };

  const updatePostLock = (payloadMaybe, valuesMaybe) => {
    if (!setPostServiceLock) return;
    const info = buildPostLockState(payloadMaybe, valuesMaybe);
    setPostServiceLock(info);
  };

  const bookingRowTsMs = (row) => {
    const values = row?.values || {};
    const p = row?.payload || row || {};
    const raw =
      p?.ts ||
      p?.createdAt ||
      p?.savedAt ||
      values?.["Submitted At"] ||
      values?.Timestamp ||
      values?.Time ||
      values?.Date ||
      row?.Timestamp ||
      "";
    const d = dayjs(raw);
    return d.isValid() ? d.valueOf() : 0;
  };

  const applyBookingRowToForm = (row, options = {}) => {
    const values = row?.values || {};
    const p = row?.payload || row || {};
    const v = p?.vehicle || {};
    const first = (...vals) => {
      for (const vv of vals) {
        if (vv === undefined || vv === null) continue;
        const s = String(vv).trim();
        if (s) return s;
      }
      return "";
    };
    const regNoRaw = first(
      v?.regNo,
      v?.registrationNumber,
      p?.vehicleNo,
      p?.regNo,
      values?.["Vehicle No"],
      values?.Vehicle_No,
      values?.RegNo,
      values?.["Reg No"],
      values?.["Registration Number"]
    );
    const resolvedRegNo = formatReg(regNoRaw, "");
    const forcedRegNo = formatReg(options?.preserveRegNo || "", "");
    const regNo = forcedRegNo || resolvedRegNo;
    const branch = first(p?.branch, values?.Branch);
    const executive = first(
      p?.executive,
      p?.staffName,
      values?.Executive,
      values?.["Executive Name"]
    );
    const company = String(first(v?.company, p?.company, values?.Company)).toUpperCase();
    const model = String(first(v?.model, p?.model, values?.Model)).toUpperCase();
    const colour = first(v?.color, p?.color, values?.Colour, values?.Color);
    const chassisNo = String(first(v?.chassisNo, p?.chassisNo, values?.["Chassis Number"], values?.["Chassis No"])).toUpperCase().replace(/[^A-Z0-9]/g, "");
    const custName = first(p?.customerName, p?.name, values?.["Customer Name"], values?.Name);
    const custMobile = String(first(p?.mobileNumber, p?.mobile, values?.["Mobile Number"], values?.Mobile)).replace(/\D/g, "").slice(-10);
    const notes = first(p?.notes, values?.Notes);
    form.setFieldsValue({
      branch: branch || undefined,
      executive: executive || undefined,
      regNo,
      company,
      model,
      colour: colour || undefined,
      chassisNo: chassisNo || undefined,
      custName: custName || undefined,
      custMobile: custMobile || undefined,
      obs: notes ? String(notes).toUpperCase() : undefined,
    });
    setRegDisplay?.(regNo);
    message.success("Details filled from Booking.");
  };

  const fetchBookingRowsInline = async (queryText, modeNow) => {
    if (!BOOKING_GAS_URL) return [];
    const reg = normalizeReg(queryText);
    const mobile = tenDigits(queryText);
    const payloads = [];
    if (modeNow === "vehicle") {
      payloads.push({ action: "search", mode: "vehicle", query: reg });
      payloads.push({ action: "search", mode: "reg", query: reg });
    } else {
      payloads.push({ action: "search", mode: "mobile", query: mobile || queryText });
    }
    for (const base of payloads) {
      const payload = BOOKING_SECRET ? { ...base, secret: BOOKING_SECRET } : base;
      try {
        const resp = await saveBookingViaWebhook({ webhookUrl: BOOKING_GAS_URL, method: "GET", payload });
        const js = resp?.data || resp;
        const rows = Array.isArray(js?.rows) ? js.rows : (Array.isArray(js?.data) ? js.data : []);
        if (rows.length) return rows;
      } catch {
        // try next mode
      }
    }
    return [];
  };

  // smarter match: exact → startsWith → contains; ignore case/spaces
  const norm = (s) => String(s || "").toLowerCase().replace(/\s+/g, "");
  const chooseBest = (list, val) => {
    if (!val || !list?.length) return undefined;
    const v = norm(val);
    let hit = list.find((x) => norm(x) === v);
    if (hit) return hit;
    hit = list.find((x) => norm(x).startsWith(v));
    if (hit) return hit;
    hit = list.find((x) => norm(x).includes(v));
    return hit; // may be undefined
  };

  // canonicalize service/vehicle strings from the sheet
  const canonServiceType = (val) => {
    const s = String(val || "").toLowerCase();
    if (s.includes("free")) return "Free";
    if (s.includes("paid")) return "Paid";
    if (s.includes("minor")) return "Minor";
    if (s.includes("accid")) return "Accidental";
    return chooseBest(SERVICE_TYPES || [], val);
  };
  const canonVehicleType = (val) => {
    const s = String(val || "").toLowerCase();
    if (s.includes("scoot")) return "Scooter";
    if (s.includes("scooty")) return "Scooter";
    if (s.includes("bike")) return "Motorcycle";
    if (s.includes("motor")) return "Motorcycle";
    return chooseBest(VEHICLE_TYPES || [], val);
  };

  // ---------- Fetch rows (Webhook only) ----------
  const fetchRows = async (queryOverride, modeOverride) => {
    if (!webhookUrl) throw new Error("Webhook URL not configured");
    const modeNow = modeOverride || mode;
    const payloadMode = modeNow === 'vehicle' ? 'reg' : (modeNow === 'jc' ? 'jc' : 'mobile');
    const qStr = String(queryOverride ?? query ?? '');
    const basePayload = JOB_SECRET
      ? { action: 'search', mode: payloadMode, query: qStr, secret: JOB_SECRET }
      : { action: 'search', mode: payloadMode, query: qStr };
    let rows = [];
    try {
      const resp = await saveJobcardViaWebhook({ webhookUrl, method: 'GET', payload: basePayload });
      const j = resp?.data || resp;
      rows = Array.isArray(j?.rows) ? j.rows : [];
    } catch (e) {
      console.warn('Webhook search failed:', e);
    }
    // If no rows and vehicle mode, try literal "vehicle"
    if (!rows.length && modeNow === 'vehicle') {
      try {
        const altPayload = JOB_SECRET
          ? { action: 'search', mode: 'vehicle', query: qStr, secret: JOB_SECRET }
          : { action: 'search', mode: 'vehicle', query: qStr };
        const resp = await saveJobcardViaWebhook({ webhookUrl, method: 'GET', payload: altPayload });
        const j = resp?.data || resp;
        rows = Array.isArray(j?.rows) ? j.rows : [];
      } catch (e) {
        console.warn('Vehicle search fallback failed:', e);
      }
    }

    // Normalize rows: merge sheet values into payload.formValues so all fields reflect
    const norm = rows.map((r) => {
      const v = r && r.values ? r.values : {};
      const firstNonEmpty = (...vals) => {
        for (const vv of vals) {
          if (vv === undefined || vv === null) continue;
          const s = String(vv).trim();
          if (s) return s;
        }
        return "";
      };
      const postAtFromValues = String(v.Post_Service_At || v.Post_Service_at || v.Post_Service || '').trim();
      const fvFromValues = {
        jcNo: firstNonEmpty(v['JC No.'], v['JC No'], v.JCNo),
        branch: firstNonEmpty(v.Branch),
        regNo: formatReg(firstNonEmpty(v.Vehicle_No, v['Vehicle No'], v['Registration Number'], v.RegNo), ''),
        company: String(firstNonEmpty(v.Company, v.company) || '').toUpperCase(),
        model: String(firstNonEmpty(v.Model) || '').toUpperCase(),
        colour: firstNonEmpty(v.Colour, v.Color),
        chassisNo: String(firstNonEmpty(v.Chassis_No, v['Chassis No'], v.ChassisNo, v.Chassis) || '').toUpperCase().replace(/[^A-Z0-9]/g, ""),
        km: String(firstNonEmpty(v.KM, v['Odometer Reading'], v['Odomete Reading']) || '').replace(/\D/g,'') || '',
        fuelLevel: firstNonEmpty(v.Fuel_Level, v['Fuel Level']),
        serviceType: firstNonEmpty(v.Service_Type, v['Service Type']),
        vehicleType: firstNonEmpty(v.Vehicle_Type, v['Vehicle Type']),
        custName: firstNonEmpty(v.Customer_Name, v['Customer Name'], v.Name),
        custMobile: String(firstNonEmpty(v.Mobile, v['Mobile Number'], v.Phone) || '').replace(/\D/g,'').slice(-10),
        obs: firstNonEmpty(v.Customer_Observation, v['Customer Observation'], v.Observation, v.Notes),
        expectedDelivery: firstNonEmpty(v.Expected_Delivery_Date, v['Expected Delivery Date'], v['Expected Delivery']),
        amount: firstNonEmpty(v.Collected_Amount, v['Collected Amount'], v.Amount),
        paymentMode: firstNonEmpty(v.Payment_Mode, v['Payment Mode']),
        executive: firstNonEmpty(v.Executive, v['Executive Name']),
        mechanic: firstNonEmpty(v.Allotted_Mechanic, v['Allotted Mechanic'], v.Mechanic),
      };
      if (r && r.payload && typeof r.payload === 'object') {
        const p = r.payload || {};
        const merged = { ...fvFromValues, ...(p.formValues || {}) };
        return {
          payload: {
            ...p,
            formValues: merged,
            postServiceAt: p.postServiceAt || p.postService_at || postAtFromValues || undefined,
            postServiceLogged: p.postServiceLogged || Boolean(p.postServiceAt || p.postService_at || postAtFromValues),
            _values: v,
          }
        };
      }
      return {
          payload: {
            formValues: fvFromValues,
            labourRows: [],
            totals: {},
            paymentMode: fvFromValues.paymentMode || undefined,
            postServiceAt: postAtFromValues || undefined,
            postServiceLogged: Boolean(postAtFromValues),
            _values: v,
          }
        };
    });
    return { mode: 'webhook', rows: norm };
  };

  // ---------- map & apply ----------
  const mapRowToForm = (row) => {
    const branch = pick(row, COL.Branch);
    const mechanicRaw = pick(row, COL.Mechanic);
    const executiveRaw = pick(row, COL.Executive);
    const expectedDelivery = parseDDMMYYYY(pick(row, COL.ExpectedDelivery));
    const regNo = formatReg(pick(row, COL.RegNo), "");
    const chassisNo = String(pick(row, COL.ChassisNo) || "").toUpperCase().replace(/[^A-Z0-9]/g, "");
    const model = String(pick(row, COL.Model) || "").toUpperCase();
    const colour = pick(row, COL.Colour);
    const kmDigits = pick(row, COL.KM).replace(/\D/g, "");
    const custName = pick(row, COL.CustName);
    const custMobile10 = tenDigits(pick(row, COL.Mobile));
   const obsRaw = pick(row, COL.Obs);
 const obsMultiline = (() => {
   const s = String(obsRaw || "").trim();
   if (!s) return "";
   // If the row uses our separator, split → multiline; otherwise preserve existing newlines.
   if (s.includes("#")) {
     return s
       .split(/\s*#\s*/g)
       .map(x => x.trim())
       .filter(Boolean)
       .join("\n");
   }
   // fallback: normalize any stray CRLFs to LF
   return s.replace(/\r\n/g, "\n");
 })();
    const vehicleType = canonVehicleType(pick(row, COL.VehicleType));
    const serviceType = canonServiceType(pick(row, COL.ServiceType));
    const floorMat = pick(row, COL.FloorMat); // "Yes"/"No"
    const jcNo = pick(row, COL.JCNo);

    const mechanic = chooseBest(MECHANIC, mechanicRaw);
    const executive = chooseBest(
      (EXECUTIVES || []).map((e) => e.name),
      executiveRaw
    );

    const fields = {
      jcNo, // ← ensure JC No updates
      branch: chooseBest(BRANCHES, branch) || branch || undefined,
      mechanic: mechanic || mechanicRaw || undefined,
      executive: executive || executiveRaw || undefined,
      expectedDelivery: expectedDelivery || null,
      regNo,
      chassisNo,
      model,
      colour,
      km: kmDigits ? `${kmDigits} KM` : "",
      custName,
      custMobile: custMobile10,
      obs: obsMultiline,  // ← expand back to multiline for the form
      vehicleType,
      serviceType,
      floorMat: floorMat === "Yes" || floorMat === "No" ? floorMat : undefined,
      discounts: { labour: 0 },
      gstLabour: defaultGstLabour,
    };

    return { fields, serviceType, vehicleType };
  };

  const applyBasicFields = (fields = {}) => {
    const next = {};
    const regNo = formatReg(fields.regNo || "", "");
    const mobile = String(fields.custMobile || "").replace(/\D/g, "").slice(-10);
    if (regNo) next.regNo = regNo;
    if (mobile) next.custMobile = mobile;
    if (String(fields.custName || "").trim()) next.custName = fields.custName;
    if (String(fields.company || "").trim()) next.company = String(fields.company).toUpperCase();
    if (String(fields.model || "").trim()) next.model = String(fields.model).toUpperCase();
    if (String(fields.colour || "").trim()) next.colour = fields.colour;
    if (String(fields.chassisNo || "").trim()) next.chassisNo = String(fields.chassisNo).toUpperCase();
    if (Object.keys(next).length) form.setFieldsValue(next);
    if (regNo) setRegDisplay?.(regNo);
    if (setPostServiceLock) {
      setPostServiceLock({ locked: false, at: null, mobile: null, amount: null, mode: null });
    }
    message.success("Customer details pre-filled.");
    setOpen(false);
    setMatches([]);
    setQuery("");
  };

  const applyRowToForm = (row) => {
    const { fields, serviceType, vehicleType } = mapRowToForm(row);
    try {
      const createdAt = parseTimestamp(row);
      if (createdAt && createdAt.isValid && createdAt.isValid()) {
        fields.savedAt = createdAt.toISOString();
      }
    } catch { /* ignore */ }

    if (applyModeRef.current === "basic") {
      applyBasicFields(fields);
      return;
    }

    // sync UI toggles first (controls visibility)
    setServiceTypeLocal?.(serviceType || null);
    setVehicleTypeLocal?.(vehicleType || null);

    // push values
    form.setFieldsValue(fields);
    setRegDisplay?.(fields.regNo || "");

    // rebuild labour from presets when both types are known
    if (serviceType && vehicleType) {
      form.setFieldsValue({
        labourRows: buildRows(serviceType, vehicleType),
        gstLabour: defaultGstLabour,
        discounts: { labour: 0 },
      });
    }

    updatePostLock(row);

    message.success("Details filled from sheet.");
    setOpen(false);
    setMatches([]);
    setQuery("");
  };

  // Apply using our saved payload JSON (when fetched via webhook)
  const applyPayloadToForm = (p, options = {}) => {
    try {
      const values = p?._values || {};
      const firstNonEmpty = (...vals) => {
        for (const vv of vals) {
          if (vv === undefined || vv === null) continue;
          const s = String(vv).trim();
          if (s) return s;
        }
        return "";
      };
      const fv = p?.formValues || {};
      const resolved = {
        jcNo: firstNonEmpty(fv.jcNo, values['JC No.'], values['JC No'], values.JCNo),
        branch: firstNonEmpty(fv.branch, values.Branch),
        mechanic: firstNonEmpty(fv.mechanic, values.Allotted_Mechanic, values['Allotted Mechanic'], values.Mechanic),
        executive: firstNonEmpty(fv.executive, values.Executive, values['Executive Name']),
        expectedDelivery: firstNonEmpty(fv.expectedDelivery, values.Expected_Delivery_Date, values['Expected Delivery Date'], values['Expected Delivery']),
        regNo: firstNonEmpty(fv.regNo, values.Vehicle_No, values['Vehicle No'], values['Registration Number'], values.RegNo),
        company: firstNonEmpty(fv.company, values.Company),
        model: firstNonEmpty(fv.model, values.Model),
        colour: firstNonEmpty(fv.colour, fv.color, values.Colour, values.Color),
        chassisNo: firstNonEmpty(fv.chassisNo, fv.chassis, values.Chassis_No, values['Chassis No'], values.ChassisNo, values.Chassis),
        km: firstNonEmpty(fv.km, values.KM, values['Odometer Reading'], values['Odomete Reading']),
        fuelLevel: firstNonEmpty(fv.fuelLevel, values.Fuel_Level, values['Fuel Level']),
        callStatus: firstNonEmpty(fv.callStatus),
        custName: firstNonEmpty(fv.custName, values.Customer_Name, values['Customer Name'], values.Name),
        custMobile: firstNonEmpty(fv.custMobile, values.Mobile, values['Mobile Number'], values.Phone),
        obs: firstNonEmpty(fv.obs, values.Customer_Observation, values['Customer Observation'], values.Observation, values.Notes),
        vehicleType: firstNonEmpty(fv.vehicleType, values.Vehicle_Type, values['Vehicle Type']),
        serviceType: firstNonEmpty(fv.serviceType, values.Service_Type, values['Service Type']),
        floorMat: firstNonEmpty(fv.floorMat, values.Floor_Mat, values['Floor Mat']),
        paymentMode: firstNonEmpty(fv.paymentMode, p?.paymentMode, values.Payment_Mode, values['Payment Mode']),
      };

      const forcedRegNo = formatReg(options?.preserveRegNo || "", "");
      const appliedRegNo = forcedRegNo || formatReg(resolved.regNo || "", "");
      if (applyModeRef.current === "basic") {
        applyBasicFields({
          regNo: appliedRegNo,
          custMobile: String(resolved.custMobile || "").replace(/\D/g, "").slice(-10),
          custName: resolved.custName || "",
          company: resolved.company || "",
          chassisNo: resolved.chassisNo || "",
          model: String(resolved.model || "").toUpperCase(),
          colour: resolved.colour || "",
        });
        return;
      }
      const savedAtRaw =
        p?.savedAt ||
        p?.createdAt ||
        p?.ts ||
        p?.timestamp ||
        fv.savedAt ||
        fv.createdAt ||
        fv.timestamp ||
        '';
      const updatedAtRaw = p?.updatedAt || fv.updatedAt || '';
      const savedAt = (() => {
        const d = dayjs(savedAtRaw);
        return d.isValid() ? d.toISOString() : savedAtRaw;
      })();
      const updatedAt = (() => {
        const d = dayjs(updatedAtRaw);
        return d.isValid() ? d.toISOString() : updatedAtRaw;
      })();
      const serviceType = resolved.serviceType || null;
      const vehicleType = resolved.vehicleType || null;

      setServiceTypeLocal?.(serviceType);
      setVehicleTypeLocal?.(vehicleType);

      // Derive GST % from saved totals when available
      const sub = Number(p?.totals?.labourSub || 0) || 0;
      const gstAmt = Number(p?.totals?.labourGST || 0) || 0;
      const derivedGstPct = sub > 0 && gstAmt > 0 ? Math.round((gstAmt / sub) * 100) : defaultGstLabour;
      const savedDiscount = Number(p?.totals?.labourDisc || 0) || 0;

      form.setFieldsValue({
        jcNo: resolved.jcNo || '',
        branch: resolved.branch || undefined,
        mechanic: resolved.mechanic || undefined,
        executive: resolved.executive || undefined,
        expectedDelivery: resolved.expectedDelivery ? dayjs(resolved.expectedDelivery, ["DD-MM-YYYY HH:mm","DD-MM-YYYY","DD/MM/YYYY","YYYY-MM-DD", dayjs.ISO_8601], true) : null,
        regNo: appliedRegNo,
        company: String(resolved.company || "").toUpperCase(),
        model: String(resolved.model || "").toUpperCase(),
        colour: resolved.colour || '',
        chassisNo: String(resolved.chassisNo || '').toUpperCase(),
        km: resolved.km ? `${String(resolved.km).replace(/\D/g,'')} KM` : '',
        fuelLevel: resolved.fuelLevel || undefined,
        callStatus: resolved.callStatus || '',
        custName: resolved.custName || '',
        custMobile: String(resolved.custMobile || '').replace(/\D/g,'').slice(-10),
        obs: String(resolved.obs || '').replace(/\s*#\s*/g, "\n"),
        vehicleType: vehicleType || undefined,
        serviceType: serviceType || undefined,
        floorMat: resolved.floorMat === 'Yes' ? 'Yes' : resolved.floorMat === 'No' ? 'No' : undefined,
        paymentMode: resolved.paymentMode || undefined,
        discounts: { labour: savedDiscount },
        gstLabour: derivedGstPct,
        labourRows: Array.isArray(p?.labourRows) && p.labourRows.length ? p.labourRows : buildRows(serviceType, vehicleType),
        savedAt: savedAt || undefined,
        updatedAt: updatedAt || undefined,
      });
      setRegDisplay?.(appliedRegNo);
      // Restore follow-up settings if provided in saved payload
      if (p?.followUp) {
        try {
          const fu = p.followUp;
          if (typeof fu.enabled !== 'undefined') setFollowUpEnabled?.(!!fu.enabled);
          if (fu.at) {
            const d = dayjs(fu.at);
            if (d.isValid()) setFollowUpAt?.(d);
          }
          if (typeof fu.notes !== 'undefined') setFollowUpNotes?.(String(fu.notes || ''));
        } catch { /* noop */ }
      }
      updatePostLock(p, values);
      message.success('Details filled from saved Job Card.');
      setOpen(false); setMatches([]); setQuery('');
    } catch (e) {
      console.warn('applyPayloadToForm error:', e);
      message.error('Could not apply fetched Job Card.');
    }
  };

  const applyMatch = (item) => {
    const isPayload = item && item.formValues;
    if (isPayload) applyPayloadToForm(item);
    else applyRowToForm(item);
  };

  // ---------- search ----------
  const runSearch = async (overrideQuery, modeOverride, prefillOverride, options = {}) => {
    const modeNow = modeOverride || mode;
    const nextPrefillMode = (typeof prefillOverride === "string" && prefillOverride) ? prefillOverride : prefillMode;
    applyModeRef.current = nextPrefillMode;
    setApplyPrefillMode(nextPrefillMode);
    const autoPickLatest = !!options?.autoPickLatest;
    const source = options?.source;
    const isInline = source === "inline";
    const rawOverride =
      typeof overrideQuery === "string" || typeof overrideQuery === "number"
        ? String(overrideQuery)
        : undefined;
    const raw = (rawOverride ?? query ?? "").trim();
    if (!raw) {
      message.warning(modeNow === "vehicle" ? "Enter vehicle no. (KA03AB1234)" : modeNow === "jc" ? "Enter a valid Job Card number." : "Enter a valid 10-digit mobile number.");
      if (isInline) onAutoSearchStatusChange?.(false, source);
      return;
    }
    let qNorm = raw;
    if (modeNow === "vehicle") {
      const reg = normalizeReg(raw);
      if (!VEH_RX.test(reg)) {
        message.warning("Enter vehicle no. as KA03AB1234.");
        if (isInline) onAutoSearchStatusChange?.(false, source);
        return;
      }
      qNorm = reg;
      setQuery(reg);
    } else if (modeNow === "jc") {
      qNorm = raw;
      setQuery(raw);
    } else {
      const digits = tenDigits(raw);
      if (!digits || digits.length !== 10) {
        message.warning("Enter a valid 10-digit mobile number.");
        if (isInline) onAutoSearchStatusChange?.(false, source);
        return;
      }
      qNorm = digits;
      setQuery(digits);
    }
    setNotFoundText("");
    setLoading(true);
    if (isInline) onAutoSearchStatusChange?.(true, source);
    try {
      if (isInline && (modeNow === "mobile" || modeNow === "vehicle")) {
        const pickInlineJobcard = async () => {
          const result = await fetchRows(qNorm, modeNow);
          if (!result || !Array.isArray(result.rows) || !result.rows.length) return null;
          const payloads = result.rows.map((r) => r?.payload || r).filter(Boolean);
          if (!payloads.length) return null;
          const sorted = [...payloads].sort((a, b) => payloadTimestampMs(b) - payloadTimestampMs(a));
          return { type: "jobcard", data: sorted[0] };
        };
        const pickInlineBooking = async () => {
          const rows = await fetchBookingRowsInline(qNorm, modeNow);
          if (!rows.length) return null;
          const sorted = [...rows].sort((a, b) => bookingRowTsMs(b) - bookingRowTsMs(a));
          return { type: "booking", data: sorted[0] };
        };
        const raceWrap = (fn) =>
          fn().then((r) => (r ? r : Promise.reject(new Error("empty"))));
        let winner = null;
        try {
          winner = await Promise.any([raceWrap(pickInlineJobcard), raceWrap(pickInlineBooking)]);
        } catch {
          winner = null;
        }
        const inlineRegOverride = modeNow === "vehicle" ? qNorm : "";
        if (winner?.type === "jobcard") {
          applyPayloadToForm(winner.data, { preserveRegNo: inlineRegOverride });
          return;
        }
        if (winner?.type === "booking") {
          applyBookingRowToForm(winner.data, { preserveRegNo: inlineRegOverride });
          return;
        }
      }

      const result = await fetchRows(qNorm, modeNow);
      if (!result) throw new Error('No result');
      if (result.mode === 'webhook') {
        const rows = result.rows || [];
        if (!rows.length) {
          showNotFoundModal({ source });
          setMatches([]);
          return;
        }
        const payloads = rows.map((r) => r?.payload || r);
        if (autoPickLatest) {
          const sorted = [...payloads].sort((a, b) => payloadTimestampMs(b) - payloadTimestampMs(a));
          applyPayloadToForm(sorted[0]);
          return;
        }
        if (payloads.length === 1) {
          const p = payloads[0];
          applyPayloadToForm(p);
          return;
        }
        setMatches(payloads.slice(0, 10));
        message.info(`Found ${rows.length} matches. Pick one.`);
        return;
      }
      const rows = result.rows;
      let candidates = [];
      if (modeNow === "jc") {
        // exact JC match
        candidates = rows.filter((r) => pick(r, COL.JCNo) === raw);
      } else {
        // mobile: exact 10-digit OR partial suffix (as requested)
        const q = tenDigits(raw) || raw.replace(/\D/g, "");
        candidates = rows.filter((r) => {
          const m = tenDigits(pick(r, COL.Mobile));
          if (!q) return false;
          if (q.length < 10) return m.endsWith(q);
          return m === q;
        });
      }

      if (!candidates.length) {
        showNotFoundModal({ source });
        setMatches([]);
        return;
      }

      // newest first
      candidates.sort(
        (a, b) => parseTimestamp(b).valueOf() - parseTimestamp(a).valueOf()
      );

      if (autoPickLatest) {
        applyRowToForm(candidates[0]);
        return;
      }

      if (candidates.length === 1) {
        applyRowToForm(candidates[0]);
        return;
      }

      setMatches(candidates.slice(0, 10));
      message.info(`Found ${candidates.length} matches. Pick one.`);
    } catch (e) {
      console.error(e);
      message.error("Could not fetch job cards. Check the Apps Script/CSV link.");
    } finally {
      setLoading(false);
      if (isInline) onAutoSearchStatusChange?.(false, source);
    }
  };

  const lastAutoKeyRef = useRef("");
  useEffect(() => {
    const rawQuery = String(autoSearch?.query || "").trim();
    if (!rawQuery) return;
    const nextMode = (autoSearch?.mode === "vehicle" || autoSearch?.mode === "jc") ? autoSearch.mode : "mobile";
    const nextKey = `${nextMode}:${rawQuery}:${autoSearch?.token || ""}`;
    if (lastAutoKeyRef.current === nextKey) return;
    lastAutoKeyRef.current = nextKey;
    setMode(nextMode);
    setQuery(rawQuery);
    const shouldOpen = autoSearch?.openModal !== false;
    setOpen(shouldOpen);
    setTimeout(() => {
      runSearch(rawQuery, nextMode, autoSearch?.prefill, { autoPickLatest: autoSearch?.autoPickLatest, source: autoSearch?.source });
    }, 0);
  }, [autoSearch]);

  return (
    <>
     <Button
  type="primary"
  style={{ background: "#52c41a", borderColor: "#52c41a" }} // AntD green-6
  onClick={() => {
    setNotFoundText("");
    setOpen(true);
  }}
>
  Fetch Details
</Button>


      <Modal
        title="Fetch Job Card"
        open={open}
        onCancel={() => {
          setOpen(false);
          setMatches([]);
          setNotFoundText("");
        }}
        footer={[
          <Button
            key="close"
            onClick={() => {
              setOpen(false);
              setMatches([]);
              setNotFoundText("");
            }}
          >
            Close
          </Button>,
          <Button key="search" type="primary" loading={loading} onClick={() => runSearch()}>
            Search
          </Button>,
        ]}
      >
        <Space direction="vertical" style={{ width: "100%" }}>
          <Radio.Group
            value={mode}
            onChange={(e) => {
              setMode(e.target.value);
              setQuery("");
            }}
          >
            <Radio.Button value="mobile">By Mobile</Radio.Button>
            <Radio.Button value="vehicle">By Vehicle No</Radio.Button>
            <Radio.Button value="jc">By JC No</Radio.Button>
          </Radio.Group>
          <Input
            placeholder={mode === "vehicle" ? "Enter Vehicle No (KA03AB1234)" : mode === "jc" ? "Enter JC No" : "Enter Mobile (10-digit)"}
            value={query}
            inputMode={mode === "vehicle" || mode === "jc" ? "text" : "numeric"}
            onChange={(e) => {
              const val = e.target.value || "";
              if (mode === "vehicle") {
                const reg = val.toUpperCase().replace(/[^A-Z0-9]/g, "");
                if (!isVehiclePartial(reg)) return;
                setQuery(reg);
              } else if (mode === "jc") {
                setQuery(String(val || "").toUpperCase());
              } else {
                const digits = String(val || "").replace(/\D/g, "").slice(0, 10);
                setQuery(digits);
              }
            }}
            onPressEnter={() => runSearch()}
            allowClear
          />

          {notFoundText && (
            <Alert
              type="warning"
              showIcon
              message={notFoundText}
            />
          )}

          {loading && <Spin />}

          {matches.length > 1 && (
            <List
              size="small"
              bordered
              dataSource={matches}
              renderItem={(item) => {
                // item may be a row object (CSV) or payload (webhook)
                const isPayload = item && item.formValues;
                const fv = isPayload ? item.formValues : null;
                const jc = isPayload ? (fv.jcNo || '—') : (pick(item, COL.JCNo) || '—');
                const nm = isPayload ? (fv.custName || '—') : (pick(item, COL.CustName) || '—');
                const mb = isPayload ? (String(fv.custMobile || '').replace(/\D/g,'').slice(-10) || '—') : (tenDigits(pick(item, COL.Mobile)) || '—');
                const rn = isPayload ? (fv.regNo || '—') : (pick(item, COL.RegNo) || '—');
                const exp = isPayload ? parseDDMMYYYY(fv.expectedDelivery) : null;
                const ts = isPayload
                  ? (exp ? exp.format("DD-MM-YYYY HH:mm") : (fv.expectedDelivery || '-'))
                  : (parseTimestamp(item).format("DD-MM-YYYY HH:mm"));
                return (
                  <List.Item
                    role="button"
                    tabIndex={0}
                    onClick={() => applyMatch(item)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') applyMatch(item);
                    }}
                    style={{ cursor: 'pointer' }}
                    actions={[
                      <Button
                        type="link"
                        onClick={(e) => {
                          e.stopPropagation();
                          applyMatch(item);
                        }}
                      >
                        Use
                      </Button>,
                    ]}
                  >
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", width: "100%" }}>
                      <div><b>JC:</b> {jc} &nbsp; <b>Name:</b> {nm}</div>
                      <div><b>Mobile:</b> {mb} &nbsp; <b>Vehicle:</b> {rn}</div>
                      <div style={{ gridColumn: "1 / span 2", color: "#999" }}>
                        <b>{isPayload ? 'Expected Delivery' : 'Timestamp'}:</b> {ts}
                      </div>
                    </div>
                  </List.Item>
                );
              }}
            />
          )}
        </Space>
      </Modal>
    </>
  );
}
