import { useSyncExternalStore } from "react";
import { CENTRES, CATEGORIES, getItem } from "./data";

// Tiny in-memory store for "submitted for verification" compliance documents.
// Stands in for the real API — same shape a backend list endpoint would
// return, so swapping this for a fetch later doesn't touch the UI.

let nextId = 1;
const makeId = () => `sub-${nextId++}`;

const now = new Date(2026, 9, 12);
const daysAgo = (n) => new Date(now.getTime() - n * 86400000);

function seedSubmission({ centreId, categoryId, daysBack, status, note }) {
  const item = getItem(centreId, categoryId);
  const centre = CENTRES.find((c) => c.id === centreId);
  const category = CATEGORIES.find((c) => c.id === categoryId);
  return {
    id: makeId(),
    centreId,
    centreName: centre.name,
    categoryId,
    categoryName: category.name,
    submittedBy: category.owner,
    submittedAt: daysAgo(daysBack),
    issuingAuthority: category.authority?.[centre.state] || "—",
    licenceNo: item?.licenceNo || "—",
    issuedOn: item?.issuedOn || null,
    validTill: item?.validTill || null,
    noExpiry: !item?.validTill,
    leadDays: 60,
    owner: category.owner,
    escalateTo: "Centre Head + Admin & Legal",
    notes: note && status === "rejected" ? "" : "",
    fileNames: ["Certificate.pdf"],
    status, // "pending" | "approved" | "rejected"
    note: note || "",
  };
}

let submissions = [
  seedSubmission({ centreId: "thane", categoryId: "bmw", daysBack: 2, status: "pending" }),
  seedSubmission({ centreId: "nashik", categoryId: "cto", daysBack: 1, status: "pending" }),
  seedSubmission({ centreId: "gurugram", categoryId: "fire", daysBack: 0, status: "pending" }),
  seedSubmission({ centreId: "pune", categoryId: "fire", daysBack: 10, status: "approved" }),
  seedSubmission({ centreId: "mumbai", categoryId: "drug", daysBack: 14, status: "approved" }),
  seedSubmission({ centreId: "bengaluru", categoryId: "bmw", daysBack: 20, status: "approved" }),
  seedSubmission({ centreId: "hyderabad", categoryId: "ndps", daysBack: 25, status: "approved" }),
  seedSubmission({ centreId: "nagpur", categoryId: "fire", daysBack: 30, status: "rejected", note: "Certificate illegible, re-upload requested." }),
  seedSubmission({ centreId: "pune", categoryId: "cto", daysBack: 35, status: "approved" }),
  seedSubmission({ centreId: "mumbai", categoryId: "mhe", daysBack: 40, status: "approved" }),
  seedSubmission({ centreId: "thane", categoryId: "lease", daysBack: 45, status: "approved" }),
  seedSubmission({ centreId: "nashik", categoryId: "lease", daysBack: 50, status: "approved" }),
  seedSubmission({ centreId: "gurugram", categoryId: "drug", daysBack: 55, status: "rejected", note: "Licence number mismatch." }),
  seedSubmission({ centreId: "bengaluru", categoryId: "se", daysBack: 60, status: "approved" }),
];

const listeners = new Set();
const notify = () => listeners.forEach((l) => l());

export function useSubmissions() {
  return useSyncExternalStore(
    (onChange) => {
      listeners.add(onChange);
      return () => listeners.delete(onChange);
    },
    () => submissions,
  );
}

export function addSubmission({
  centreId,
  categoryId,
  fileNames,
  issuingAuthority,
  licenceNo,
  issuedOn,
  validTill,
  noExpiry,
  leadDays,
  owner,
  escalateTo,
  notes,
}) {
  const centre = CENTRES.find((c) => c.id === centreId);
  const category = CATEGORIES.find((c) => c.id === categoryId);
  const entry = {
    id: makeId(),
    centreId,
    centreName: centre?.name,
    categoryId,
    categoryName: category?.name,
    submittedBy: category?.owner,
    submittedAt: now,
    issuingAuthority: issuingAuthority || category?.authority?.[centre?.state] || "—",
    licenceNo: licenceNo || "—",
    issuedOn: issuedOn || null,
    validTill: validTill || null,
    noExpiry: !!noExpiry,
    leadDays: leadDays || 60,
    owner: owner || category?.owner,
    escalateTo: escalateTo || "Centre Head + Admin & Legal",
    notes: notes || "",
    fileNames: fileNames?.length ? fileNames : ["Certificate.pdf"],
    status: "pending",
    note: "",
  };
  submissions = [entry, ...submissions];
  notify();
  return entry;
}

export function decideSubmission(id, status, note = "") {
  submissions = submissions.map((s) => (s.id === id ? { ...s, status, note } : s));
  notify();
}
