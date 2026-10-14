// Mock data for the Compliance module demo (client-side only, no backend yet).
// Shaped so it can be swapped for API responses later without touching the UI.

export const TODAY = new Date(2026, 9, 12);
const M = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export const STATES = { MH: "Maharashtra", HR: "Haryana", KA: "Karnataka", TG: "Telangana" };

export const CENTRES = [
  { id: "pune", name: "Pune", code: "PUN", state: "MH" },
  { id: "thane", name: "Thane", code: "THN", state: "MH" },
  { id: "mumbai", name: "Mumbai", code: "MUM", state: "MH" },
  { id: "gurugram", name: "Gurugram", code: "GGN", state: "HR" },
  { id: "bengaluru", name: "Bengaluru", code: "BLR", state: "KA" },
  { id: "hyderabad", name: "Hyderabad", code: "HYD", state: "TG" },
  { id: "nagpur", name: "Nagpur", code: "NGP", state: "MH" },
  { id: "nashik", name: "Nashik", code: "NSK", state: "MH" },
];

export const CATEGORIES = [
  {
    id: "mhe",
    short: "MHE registration",
    name: "Mental Health Establishment registration",
    group: "Statutory registration",
    pre: "SMHA",
    owner: "Centre Head",
    termDays: 1825,
    authority: { MH: "Maharashtra SMHA", HR: "Haryana SMHA", KA: "Karnataka SMHA", TG: "Telangana SMHA" },
  },
  {
    id: "fire",
    short: "Fire NOC",
    name: "Fire NOC",
    group: "Safety & environment",
    pre: "FIRE",
    owner: "Facility Manager",
    termDays: 365,
    authority: { MH: "Municipal Fire Brigade", HR: "Haryana Fire Services", KA: "KSFES", TG: "Telangana Fire Services" },
  },
  {
    id: "bmw",
    short: "BMW authorisation",
    name: "Bio-medical waste authorisation",
    group: "Safety & environment",
    pre: "BMW",
    owner: "Facility Manager",
    termDays: 1825,
    authority: { MH: "MPCB", HR: "HSPCB", KA: "KSPCB", TG: "TGPCB" },
  },
  {
    id: "drug",
    short: "Drug licence",
    name: "Retail drug licence (Form 20/21)",
    group: "Pharmacy",
    pre: "DL",
    owner: "Pharmacist-in-charge",
    termDays: 1825,
    authority: { MH: "FDA Maharashtra", HR: "FDA Haryana", KA: "Drugs Control Dept, KA", TG: "DCA Telangana" },
  },
  {
    id: "ndps",
    short: "NDPS licence",
    name: "NDPS / narcotic drugs licence",
    group: "Pharmacy",
    pre: "NDPS",
    owner: "Pharmacist-in-charge",
    termDays: 1095,
    authority: { MH: "State Excise, MH", HR: "Excise & Taxation, HR", KA: "Excise Dept, KA", TG: "Prohibition & Excise, TG" },
  },
  {
    id: "se",
    short: "Shops & Est.",
    name: "Shops & Establishment registration",
    group: "Statutory registration",
    pre: "S&E",
    owner: "Admin & Legal",
    termDays: 1825,
    authority: { MH: "Labour Dept, MH", HR: "Labour Dept, HR", KA: "Labour Dept, KA", TG: "Labour Dept, TG" },
  },
  {
    id: "cto",
    short: "Pollution CTO",
    name: "Consent to Operate (Air/Water)",
    group: "Safety & environment",
    pre: "CTO",
    owner: "Facility Manager",
    termDays: 1825,
    authority: { MH: "MPCB", HR: "HSPCB", KA: "KSPCB", TG: "TGPCB" },
  },
  {
    id: "lease",
    short: "Premises lease",
    name: "Premises lease agreement",
    group: "Premises & insurance",
    pre: "LEASE",
    owner: "Admin & Legal",
    termDays: 1825,
    authority: { MH: "Sub-Registrar", HR: "Sub-Registrar", KA: "Sub-Registrar", TG: "Sub-Registrar" },
  },
];

// v = validity date (YYYY-MM-DD), "NA" = not applicable, "LT" = lifetime (no expiry),
// "M" = document missing, "R:<date>" = applied for renewal (date is prior expiry)
const RAW = {
  pune: ["2028-03-31", "2026-10-28", "2027-06-30", "2027-12-31", "2027-03-31", "LT", "2026-12-15", "2029-05-31"],
  thane: ["2027-08-15", "2027-01-20", "R:2026-09-30", "2028-02-28", "NA", "LT", "2027-04-30", "2027-11-30"],
  mumbai: ["2026-11-05", "2027-07-10", "2027-03-31", "2026-10-20", "2026-12-31", "LT", "2027-09-30", "2026-12-31"],
  gurugram: ["2028-01-31", "2026-09-18", "2027-05-31", "2027-10-31", "NA", "2027-02-28", "M", "2028-06-30"],
  bengaluru: ["2027-11-30", "2027-04-15", "2026-11-20", "2028-04-30", "2027-06-30", "LT", "2027-08-31", "2027-01-31"],
  hyderabad: ["M", "2027-02-10", "2027-09-30", "2027-05-31", "2026-10-31", "LT", "2027-03-31", "2028-09-30"],
  nagpur: ["2027-06-30", "2026-08-31", "2027-01-15", "NA", "NA", "LT", "2027-12-31", "2027-04-30"],
  nashik: ["2028-05-31", "2027-03-15", "2027-07-31", "2027-09-30", "NA", "LT", "R:2026-10-01", "2026-11-30"],
};

export const STATUS = {
  valid: { label: "Valid", bg: "#E4F1EA", fg: "#1D5A41", border: "#E4F1EA", dashed: false },
  due90: { label: "Due ≤90 days", bg: "#E6EEF8", fg: "#1F4E8C", border: "#E6EEF8", dashed: false },
  due30: { label: "Due ≤30 days", bg: "#FDE9CC", fg: "#7A4300", border: "#F2C98A", dashed: false },
  expired: { label: "Expired", bg: "#F9DEDA", fg: "#9A2418", border: "#E7A79E", dashed: false },
  renewal: { label: "In renewal", bg: "#ECE6F6", fg: "#5A3E8F", border: "#ECE6F6", dashed: false },
  missing: { label: "Doc missing", bg: "#FFFFFF", fg: "#9A2418", border: "#C9776D", dashed: true },
  lt: { label: "No expiry", bg: "#F1F2EF", fg: "#3E4A46", border: "#F1F2EF", dashed: false },
  na: { label: "Not applicable", bg: "#FFFFFF", fg: "#66706C", border: "#E3E6E2", dashed: true },
};

function parseDate(s) {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function formatDate(d) {
  return `${d.getDate()} ${M[d.getMonth()]} ${d.getFullYear()}`;
}

// Flattened list of every (centre x category) compliance item, with derived status.
export const ITEMS = (() => {
  const items = [];
  CENTRES.forEach((centre, ci) => {
    RAW[centre.id].forEach((raw, ki) => {
      const cat = CATEGORIES[ki];
      let key;
      let date = null;
      let days = null;

      if (raw === "NA") key = "na";
      else if (raw === "LT") key = "lt";
      else if (raw === "M") key = "missing";
      else {
        const isRenewal = raw.indexOf("R:") === 0;
        date = parseDate(isRenewal ? raw.slice(2) : raw);
        days = Math.round((date - TODAY) / 86400000);
        if (isRenewal) key = "renewal";
        else if (days < 0) key = "expired";
        else if (days <= 30) key = "due30";
        else if (days <= 90) key = "due90";
        else key = "valid";
      }

      items.push({
        id: `${centre.id}-${cat.id}`,
        centreId: centre.id,
        centreName: centre.name,
        centreState: STATES[centre.state],
        categoryId: cat.id,
        categoryName: cat.name,
        categoryShort: cat.short,
        group: cat.group,
        authority: cat.authority[centre.state],
        owner: cat.owner,
        termDays: cat.termDays,
        licenceNo: key === "na" ? null : `${cat.pre}/${centre.code}/${1040 + ci * 131 + ki * 57}`,
        statusKey: key,
        validTill: date,
        daysLeft: days,
        documentVersion: 1 + ((ci + ki) % 3),
      });
    });
  });
  return items;
})();

export const GROUPS = ["Statutory registration", "Safety & environment", "Pharmacy", "Premises & insurance"];

// Default renewal checklist steps, used to seed a new Compliance Type and as the
// fallback wherever an item's type doesn't define its own steps yet.
export const DEFAULT_CHECKLIST_STEPS = [
  "Prerequisites gathered (inspection reports, prior certificate)",
  "Application submitted on authority portal",
  "Fee paid · challan uploaded",
  "Inspection / authority visit completed",
  "Renewed certificate uploaded & verified",
];

// Seed data for the "Compliance type" admin screen — one row per category,
// derived from the matrix above so "applicable centres" matches what's actually tracked.
export const DEFAULT_COMPLIANCE_TYPES = CATEGORIES.map((cat, ki) => {
  const applicableCentreIds = CENTRES.filter((centre) => RAW[centre.id][ki] !== "NA").map((c) => c.id);
  const hasExpiry = applicableCentreIds.some((id) => RAW[id][ki] !== "LT");
  return {
    id: cat.id,
    name: cat.name,
    shortName: cat.short,
    group: cat.group,
    hasExpiry,
    defaultLeadDays: 60,
    applicableCentreIds,
    issuingAuthorityHint: cat.authority.MH,
    active: true,
  };
});

export function getItem(centreId, categoryId) {
  return ITEMS.find((i) => i.centreId === centreId && i.categoryId === categoryId);
}

export function centreItems(centreId) {
  return ITEMS.filter((i) => i.centreId === centreId);
}

// Demo-only: a handful of (centre, category) pairs that actually track more than
// one compliance record under the same category — e.g. a separate Fire NOC per
// building, or separate retail/wholesale drug licences. Everything else still
// has exactly one record per category, same as the flat ITEMS list above.
const MULTI_RAW = {
  "pune-fire": [
    { label: "Fire NOC — Main building", validTill: "2026-10-28" },
    { label: "Fire NOC — Annex building", validTill: "2026-12-05" },
  ],
  "mumbai-bmw": [
    { label: "BMW authorisation — OPD block", validTill: "2027-03-31" },
    { label: "BMW authorisation — IPD block", validTill: "2026-11-02" },
  ],
  "gurugram-drug": [
    { label: "Drug licence — Retail (Form 20)", validTill: "2027-10-31" },
    { label: "Drug licence — Wholesale (Form 21)", validTill: "2026-11-20" },
  ],
  "bengaluru-cto": [
    { label: "Consent to Operate — Air", validTill: "2027-08-31" },
    { label: "Consent to Operate — Water", validTill: "2026-10-05" },
    { label: "Consent to Operate — Hazardous waste", validTill: "2027-01-31" },
  ],
};

const STATUS_SEVERITY = ["missing", "expired", "due30", "renewal", "due90", "valid", "lt", "na"];

// Every individual compliance record tracked under one category at one centre
// (almost always a list of one — see MULTI_RAW for the categories that track more).
export function centreCategoryItems(centreId, categoryId) {
  const base = getItem(centreId, categoryId);
  if (!base) return [];

  const multi = MULTI_RAW[`${centreId}-${categoryId}`];
  if (!multi) return [{ ...base, recordLabel: base.categoryShort }];

  return multi.map((m, idx) => {
    const date = parseDate(m.validTill);
    const days = Math.round((date - TODAY) / 86400000);
    const statusKey = days < 0 ? "expired" : days <= 30 ? "due30" : days <= 90 ? "due90" : "valid";
    return {
      ...base,
      id: `${base.id}-${idx + 1}`,
      recordLabel: m.label,
      licenceNo: `${base.licenceNo}-${idx + 1}`,
      statusKey,
      validTill: date,
      daysLeft: days,
    };
  });
}

// Worst status across all records under one category, used for the collapsed
// accordion header badge (e.g. 2 Fire NOCs, one expired — show "Expired").
export function worstStatus(items) {
  return items.reduce(
    (worst, i) =>
      STATUS_SEVERITY.indexOf(i.statusKey) < STATUS_SEVERITY.indexOf(worst) ? i.statusKey : worst,
    "na",
  );
}

export function centreScore(centreId) {
  const items = centreItems(centreId).filter((i) => i.statusKey !== "na");
  const ok = items.filter((i) => ["valid", "lt", "due90", "due30"].includes(i.statusKey)).length;
  return items.length ? Math.round((ok / items.length) * 100) : 100;
}

// % of the licence's typical term already elapsed, for the progress bar on
// each compliance item. Returns null where a bar doesn't make sense (no
// expiry, document missing, or not applicable).
export function validityProgress(item) {
  if (!item.termDays || item.daysLeft == null) return null;
  if (["lt", "na", "missing"].includes(item.statusKey)) return null;
  const percentUsed = Math.min(100, Math.max(0, Math.round(((item.termDays - item.daysLeft) / item.termDays) * 100)));
  return { percentUsed };
}

export function overviewStats() {
  const live = ITEMS.filter((i) => i.statusKey !== "na");
  const count = (key) => live.filter((i) => i.statusKey === key).length;
  const compliant = live.filter((i) => ["valid", "lt", "due90", "due30"].includes(i.statusKey)).length;
  return {
    total: live.length,
    compliant,
    score: Math.round((compliant / live.length) * 100),
    expired: count("expired"),
    due30: count("due30"),
    due90: count("due90"),
    renewal: count("renewal"),
    missing: count("missing"),
  };
}
