// components/BookingInlineModal.jsx
import React, { useEffect, useState } from 'react';
import { Modal, Spin, message } from 'antd';
import BookingForm from './BookingForm';
import { saveBookingViaWebhook } from '../apiCalls/forms';

export default function BookingInlineModal({ open, onClose, row, webhookUrl }) {
  const [loading, setLoading] = useState(false);
  const [initialValues, setInitialValues] = useState(null);

  const toNumber = (x) => Number(String(x ?? 0).replace(/[₹,\s]/g, '')) || 0;

  const normalizeFromPayload = (source = {}) => {
    const payload = source?.payload && typeof source.payload === 'object' ? source.payload : source;
    const values = source?.values && typeof source.values === 'object' ? source.values : {};
    const p = payload || {};
    const v = p.vehicle || {};
    const pick = (...vals) => vals.find((x) => x !== undefined && x !== null && x !== '');
    const purchaseType = String(
      pick(p.purchaseMode, p.purchaseType, values['Purchase Mode'], values.purchaseMode, values.purchaseType) || ''
    ).toLowerCase() || 'cash';
    // Normalize address proof types
    const apRaw = pick(p.addressProofTypes, values['Address Proof Types']);
    const apTypes = Array.isArray(apRaw)
      ? apRaw
      : String(apRaw || '')
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean);
    // Map split booking payments into form fields
    const payArr = Array.isArray(p.payments) ? p.payments : [];
    // Back-compat: some payloads might store a single bookingAmount/mode/reference
    if ((!payArr || payArr.length === 0) && (p.bookingAmount || p.paymentMode)) {
      const single = { amount: p.bookingAmount, mode: p.paymentMode, reference: p.paymentReference || p.utr || p.ref };
      if (Number(single.amount || 0) > 0 && single.mode) {
        payArr.push(single);
      }
    }
    const asNum = (x) => Number(String(x ?? '').replace(/[₹,\s]/g, '')) || 0;
    const split = [
      { cash: 0, online: 0, ref: undefined },
      { cash: 0, online: 0, ref: undefined },
      { cash: 0, online: 0, ref: undefined },
    ];
    const assignToPart = (pay, idxHint = 0) => {
      const mode = String(pay?.mode || '').toLowerCase();
      const amtVal = asNum(pay?.amount);
      if (!amtVal) return;
      const part =
        Number(pay?.part) && Number(pay?.part) >= 1 && Number(pay?.part) <= 3
          ? Number(pay.part) - 1
          : Math.min(Math.max(idxHint, 0), 2);
      if (mode === 'online') {
        split[part].online += amtVal;
        if (!split[part].ref) split[part].ref = pay?.reference || pay?.utr || pay?.ref;
      } else {
        split[part].cash += amtVal;
      }
    };
    payArr.forEach((pay, idx) => assignToPart(pay, idx));

    return {
      customerName: pick(p.customerName, p.name, values['Customer Name'], values.Customer_Name) || '',
      mobileNumber: String(pick(p.mobileNumber, p.mobile, values['Mobile Number'], values.Mobile, values.Phone) || ''),
      address: pick(p.address, values['Address']) || '',
      branch: pick(p.branch, values['Branch']) || '',
      executive: pick(p.executive, values['Executive']) || '',
      company: pick(v.company, p.company, values['Company']) || '',
      bikeModel: pick(v.model, p.model, p.bikeModel, values['Model']) || '',
      variant: pick(v.variant, p.variant, values['Variant']) || '',
      color: pick(v.color, p.color, values['Color'], values['Colour']) || undefined,
      chassisNo:
        pick(v.chassisNo, p.chassisNo, values['Chassis Number'], values['Chassis No']) ||
        (String(pick(v.availability, p.availability, values['Chassis Availability']) || '').toLowerCase() === 'allot'
          ? '__ALLOT__'
          : undefined),
      rtoOffice: pick(p.rtoOffice, values['RTO Office']) || 'KA',
      purchaseType,
      financier: purchaseType === 'loan' ? (pick(p.financier, values['Financier']) || undefined) : undefined,
      nohpFinancier: purchaseType === 'nohp' ? (pick(p.financier, p.nohpFinancier, values['Financier']) || undefined) : undefined,
      disbursementAmount:
        (purchaseType === 'loan' || purchaseType === 'nohp')
          ? (toNumber(pick(p.disbursementAmount, values['Disbursement Amount'])) || undefined)
          : undefined,
      addressProofMode: pick(p.addressProofMode, p.addressProof, values['Address Proof Mode']) || 'aadhaar',
      addressProofTypes: apTypes,
      // Split payments (prefill booking payments in form)
      bookingAmount1Cash: split[0].cash || undefined,
      bookingAmount1Online: split[0].online || undefined,
      paymentReference1: split[0].ref || undefined,
      bookingAmount2Cash: split[1].cash || undefined,
      bookingAmount2Online: split[1].online || undefined,
      paymentReference2: split[1].ref || undefined,
      bookingAmount3Cash: split[2].cash || undefined,
      bookingAmount3Online: split[2].online || undefined,
      paymentReference3: split[2].ref || undefined,
      // Legacy totals for completeness (not directly shown; computed in form too)
      bookingAmount: toNumber(pick(p.bookingAmount, values['Booking Amount']) ?? undefined) || undefined,
      downPayment: toNumber((p.dp && p.dp.downPayment) ?? p.downPayment),
      extraFittingAmount: toNumber((p.dp && p.dp.extraFittingAmount) ?? p.extraFittingAmount),
      discountAmount: toNumber((p.dp && p.dp.discountAmount) ?? p.discountAmount ?? p.discount),
      affidavitCharges: toNumber((p.dp && p.dp.affidavitCharges) ?? p.affidavitCharges),
    };
  };

  useEffect(() => {
    let active = true;
    const fetchPayload = async () => {
      if (!open || !row) return;
      setLoading(true);
      try {
        // Prefer webhook search by Booking ID
        if (webhookUrl && row.bookingId) {
          const resp = await saveBookingViaWebhook({ webhookUrl, method: 'GET', payload: { action: 'search', mode: 'booking', query: row.bookingId } });
          const j = resp?.data || resp;
          const source = Array.isArray(j?.rows) && j.rows.length ? j.rows[0] : null;
          if (active) setInitialValues(source ? normalizeFromPayload(source) : normalizeFromPayload({
            customerName: row.name,
            mobileNumber: row.mobile,
            branch: row.branch,
            vehicle: { company: row.company, model: row.model, variant: row.variant, chassisNo: row.chassis }
          }));
        } else {
          if (active) setInitialValues(normalizeFromPayload({
            customerName: row?.name,
            mobileNumber: row?.mobile,
            branch: row?.branch,
            vehicle: { company: row?.company, model: row?.model, variant: row?.variant, chassisNo: row?.chassis }
          }));
        }
      } catch  {
        if (active) {
          message.warning('Could not fetch full booking. Opening with available fields.');
          setInitialValues(normalizeFromPayload({
            customerName: row?.name,
            mobileNumber: row?.mobile,
            branch: row?.branch,
            vehicle: { company: row?.company, model: row?.model, variant: row?.variant, chassisNo: row?.chassis }
          }));
        }
      } finally { if (active) setLoading(false); }
    };
    fetchPayload();
    return () => { active = false; };
  }, [open, row, webhookUrl]);

  return (
    <Modal open={open} title="Prefilled Booking Form" onCancel={onClose} footer={null} width={980} destroyOnClose>
      {loading ? (
        <div style={{ display: 'grid', placeItems: 'center', height: 160 }}><Spin /></div>
      ) : (
        <div style={{ paddingTop: 8 }}>
          <BookingForm
            asModal
            initialValues={initialValues || {}}
            startPaymentsOnly={Boolean(row?.bookingId)}
            editRefDefault={row?.bookingId ? { bookingId: row.bookingId, mobile: row.mobile } : null}
          />
        </div>
      )}
    </Modal>
  );
}
