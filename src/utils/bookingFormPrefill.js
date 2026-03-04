const toDigits10 = (value) => String(value || "").replace(/\D/g, "").slice(-10);

const toNumber = (value) => {
  if (value === null || value === undefined || value === "") return 0;
  const cleaned = String(value).replace(/[,₹\s]/g, "");
  const num = Number(cleaned);
  return Number.isFinite(num) ? num : 0;
};

const firstDefined = (...values) => values.find((value) => value !== undefined && value !== null && value !== "");

const getFrom = (obj, keys = []) => {
  if (!obj || typeof obj !== "object") return undefined;
  for (let i = 0; i < keys.length; i++) {
    const v = obj[keys[i]];
    if (v !== undefined && v !== null && v !== "") return v;
  }
  return undefined;
};

const getPath = (obj, path = []) => {
  let cur = obj;
  for (let i = 0; i < path.length; i++) {
    if (!cur || typeof cur !== "object") return undefined;
    cur = cur[path[i]];
  }
  return cur;
};

const parseJsonSafe = (value) => {
  if (!value) return null;
  if (typeof value === "object") return value;
  if (typeof value !== "string") return null;
  try {
    const parsed = JSON.parse(value);
    return parsed && typeof parsed === "object" ? parsed : null;
  } catch {
    return null;
  }
};

const valueFromAny = ({ payload, values, row }, keys = []) =>
  firstDefined(getFrom(payload, keys), getFrom(values, keys), getFrom(row, keys));

const buildPaymentParts = (payments = []) => {
  const split = [
    { cash: 0, online: 0, ref: undefined },
    { cash: 0, online: 0, ref: undefined },
    { cash: 0, online: 0, ref: undefined },
  ];

  const assign = (payment, idxHint = 0) => {
    if (!payment) return;
    const amount = toNumber(payment.amount);
    if (!amount) return;
    const mode = String(payment.mode || "").toLowerCase();
    const part =
      Number(payment.part) && Number(payment.part) >= 1 && Number(payment.part) <= 3
        ? Number(payment.part) - 1
        : Math.min(Math.max(idxHint, 0), 2);
    if (mode === "online") {
      split[part].online += amount;
      if (!split[part].ref) {
        split[part].ref = payment.reference || payment.utr || payment.ref || "";
      }
    } else {
      split[part].cash += amount;
    }
  };

  payments.forEach((payment, idx) => assign(payment, idx));
  return split;
};

export const buildBookingFormPatch = (source = {}) => {
  const row = source || {};
  const values = (row && row.values && typeof row.values === "object") ? row.values : {};
  const p = (row && row.payload && typeof row.payload === "object") ? row.payload : row;
  const legacyRaw = parseJsonSafe(p?.rawPayload) || parseJsonSafe(values?.["Raw Payload"]) || parseJsonSafe(row?.["Raw Payload"]) || {};
  const vehicle = p.vehicle || {};

  const company = firstDefined(
    getPath(p, ["vehicle", "company"]),
    valueFromAny({ payload: p, values, row }, ["company", "Company"])
  ) || "";
  const model = firstDefined(
    getPath(p, ["vehicle", "model"]),
    valueFromAny({ payload: p, values, row }, ["bikeModel", "model", "Model"])
  ) || "";
  const variant = firstDefined(
    getPath(p, ["vehicle", "variant"]),
    valueFromAny({ payload: p, values, row }, ["variant", "Variant"])
  ) || "";
  const color = firstDefined(
    getPath(p, ["vehicle", "color"]),
    valueFromAny({ payload: p, values, row }, ["color", "colour", "Color", "Colour"])
  );
  const chassisNo = firstDefined(
    getPath(p, ["vehicle", "chassisNo"]),
    valueFromAny({ payload: p, values, row }, ["chassisNo", "chassis", "Chassis Number", "Chassis No", "Chassis"])
  );
  const availability = firstDefined(
    getPath(p, ["vehicle", "availability"]),
    valueFromAny({ payload: p, values, row }, ["availability", "Chassis Availability"])
  );

  const purchaseMode =
    String(
      firstDefined(
        valueFromAny({ payload: p, values, row }, ["purchaseMode", "purchaseType", "Purchase Mode"]),
        valueFromAny({ payload: legacyRaw, values, row }, ["purchaseMode", "purchaseType"])
      ) || ""
    ).toLowerCase() || "cash";

  const addressProofTypesRaw = valueFromAny(
    { payload: p, values, row },
    ["addressProofTypes", "Address Proof Types"]
  );
  const addressProofTypes = Array.isArray(addressProofTypesRaw)
    ? addressProofTypesRaw
    : String(addressProofTypesRaw || "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

  let payments = Array.isArray(p.payments) ? p.payments : [];
  const hasPayments =
    Array.isArray(payments) && payments.some((pay) => toNumber(pay?.amount) > 0);
  const parts = buildPaymentParts(payments);
  if (!hasPayments) {
    for (let idx = 0; idx < 3; idx++) {
      const cashKey = `bookingAmount${idx + 1}Cash`;
      const onlineKey = `bookingAmount${idx + 1}Online`;
      const cashVal = firstDefined(p[cashKey], values[cashKey], row[cashKey], values[`Booking Amount ${idx + 1} Cash`]);
      const onlineVal = firstDefined(p[onlineKey], values[onlineKey], row[onlineKey], values[`Booking Amount ${idx + 1} Online`]);
      parts[idx].cash = parts[idx].cash || toNumber(cashVal);
      parts[idx].online = parts[idx].online || toNumber(onlineVal);
      if (!parts[idx].ref) {
        parts[idx].ref =
          firstDefined(
            p[`paymentReference${idx + 1}`],
            values[`paymentReference${idx + 1}`],
            row[`paymentReference${idx + 1}`],
            p[`paymentRef${idx + 1}`],
            p[`utr${idx + 1}`],
            values[`UTR ${idx + 1}`],
            values["UTR / Reference"],
            p.utr
          ) ||
          undefined;
      }
    }
    parts[0].cash =
      parts[0].cash ||
      toNumber(p.bookingAmount1Cash) ||
      toNumber(values.bookingAmount1Cash) ||
      toNumber(p.bookingAmount) ||
      toNumber(values["Booking Amount"]) ||
      toNumber(row["Booking Amount"]) ||
      0;
    parts[0].online =
      parts[0].online ||
      toNumber(p.bookingAmount1Online) ||
      toNumber(values.bookingAmount1Online) ||
      (String(p.paymentMode || "").toLowerCase() === "online"
        ? toNumber(firstDefined(p.bookingAmount, values["Booking Amount"], row["Booking Amount"]))
        : 0);
  }

  const customerName = valueFromAny(
    { payload: p, values, row },
    ["customerName", "name", "Customer Name", "Customer_Name"]
  ) || "";
  const mobileNumber = toDigits10(
    valueFromAny({ payload: p, values, row }, ["mobileNumber", "mobile", "Mobile Number", "Mobile", "Phone"]) || ""
  );
  const branch = valueFromAny({ payload: p, values, row }, ["branch", "Branch"]) || undefined;
  const executive = valueFromAny({ payload: p, values, row }, ["executive", "Executive"]) || undefined;

  const patch = {
    executive,
    branch,
    customerName,
    mobileNumber,
    address: valueFromAny({ payload: p, values, row }, ["address", "Address"]) || "",
    company,
    bikeModel: model,
    variant,
    color: color || undefined,
    chassisNo:
      String(availability || "").toLowerCase() === "allot"
        ? "__ALLOT__"
        : chassisNo || undefined,
    rtoOffice: valueFromAny({ payload: p, values, row }, ["rtoOffice", "RTO Office"]) || "KA",
    purchaseType: purchaseMode,
    financier:
      purchaseMode === "loan"
        ? valueFromAny({ payload: p, values, row }, ["financier", "Financier"]) || undefined
        : undefined,
    nohpFinancier:
      purchaseMode === "nohp"
        ? valueFromAny({ payload: p, values, row }, ["financier", "nohpFinancier", "Financier"]) || undefined
        : undefined,
    disbursementAmount:
      purchaseMode === "loan" || purchaseMode === "nohp"
        ? toNumber(
            firstDefined(
              valueFromAny({ payload: p, values, row }, ["disbursementAmount", "disbursement", "disbursement_amount", "Disbursement Amount"]),
              valueFromAny({ payload: legacyRaw, values, row }, ["disbursementAmount", "disbursement", "disbursement_amount"]),
              getPath(p, ["loan", "disbursementAmount"]),
              getPath(legacyRaw, ["loan", "disbursementAmount"])
            )
          ) || undefined
        : undefined,
    emiAmount:
      purchaseMode === "loan" || purchaseMode === "nohp"
        ? toNumber(
            firstDefined(
              valueFromAny({ payload: p, values, row }, ["emiAmount", "emi", "emi_amount", "EMI Amount"]),
              valueFromAny({ payload: legacyRaw, values, row }, ["emiAmount", "emi", "emi_amount"]),
              getPath(p, ["loan", "emiAmount"]),
              getPath(legacyRaw, ["loan", "emiAmount"])
            )
          ) || undefined
        : undefined,
    tenure:
      purchaseMode === "loan" || purchaseMode === "nohp"
        ? toNumber(
            firstDefined(
              valueFromAny({ payload: p, values, row }, ["tenure", "tenureMonths", "months", "Tenure (Months)", "Tenure"]),
              valueFromAny({ payload: legacyRaw, values, row }, ["tenure", "tenureMonths", "months"]),
              getPath(p, ["loan", "tenure"]),
              getPath(legacyRaw, ["loan", "tenure"])
            )
          ) || undefined
        : undefined,
    addressProofMode:
      valueFromAny({ payload: p, values, row }, ["addressProofMode", "addressProof", "Address Proof Mode"]) || "aadhaar",
    addressProofTypes,
    bookingAmount1Cash: parts[0].cash || undefined,
    bookingAmount1Online: parts[0].online || undefined,
    paymentReference1: parts[0].ref || undefined,
    bookingAmount2Cash: parts[1].cash || undefined,
    bookingAmount2Online: parts[1].online || undefined,
    paymentReference2: parts[1].ref || undefined,
    bookingAmount3Cash: parts[2].cash || undefined,
    bookingAmount3Online: parts[2].online || undefined,
    paymentReference3: parts[2].ref || undefined,
    downPayment: toNumber(
      firstDefined(getPath(p, ["dp", "downPayment"]), valueFromAny({ payload: p, values, row }, ["downPayment"]))
    ),
    extraFittingAmount: toNumber(
      firstDefined(getPath(p, ["dp", "extraFittingAmount"]), valueFromAny({ payload: p, values, row }, ["extraFittingAmount"]))
    ),
    discountAmount: toNumber(
      firstDefined(
        getPath(p, ["dp", "discountAmount"]),
        valueFromAny({ payload: p, values, row }, ["discountAmount", "discount", "Discount", "Discount Amount"])
      )
    ),
    affidavitCharges: toNumber(
      firstDefined(getPath(p, ["dp", "affidavitCharges"]), valueFromAny({ payload: p, values, row }, ["affidavitCharges"]))
    ),
  };

  return {
    patch,
    metadata: {
      bookingId: valueFromAny({ payload: p, values, row }, ["bookingId", "serialNo", "Booking ID", "Booking_Id", "Booking Id"]) || undefined,
      mobile: mobileNumber,
      vehicle: {
        ...vehicle,
        company,
        model,
        variant,
        color: color || vehicle.color,
        chassisNo: chassisNo || vehicle.chassisNo,
        availability: availability || vehicle.availability,
      },
    },
  };
};
