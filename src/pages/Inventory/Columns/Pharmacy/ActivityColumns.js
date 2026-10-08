import React from "react";
import moment from "moment";
import { ExpandableText } from "../../../../Components/Common/ExpandableText";

export const MODULE_OPTIONS = [
  { value: "INVENTORY", label: "Inventory" },
  { value: "GIVE_MEDICINE", label: "Give Medicine" },
  { value: "APPROVAL", label: "Medicine Approval" },
  { value: "RETURN", label: "Medicine Return" },
  { value: "REQUISITION", label: "Medicine Requisition" },
  { value: "INTERNAL_TRANSFER", label: "Internal Transfer" },
  { value: "SAREYAAN_ORDER", label: "Sareyaan Orders" },
  { value: "EXPIRED_STOCK", label: "Expired Stock" },
  { value: "AUDIT", label: "Audit" },
  { value: "BILL_UPLOAD_HISTORY", label: "Bill Upload History" },
  { value: "SAREYAAN_INVENTORY", label: "Sareyaan Inventory" },
];

const moduleLabel = (value) =>
  MODULE_OPTIONS.find((m) => m.value === value)?.label || value;

const ACTION_COLORS = {
  CREATE: { bg: "#d4edda", color: "#155724" },
  UPDATE: { bg: "#cce5ff", color: "#004085" },
  DELETE: { bg: "#f8d7da", color: "#721c24" },
  APPROVE: { bg: "#d4edda", color: "#155724" },
  REJECT: { bg: "#f8d7da", color: "#721c24" },
  DISCARD: { bg: "#f8d7da", color: "#721c24" },
  IMPORT: { bg: "#e2d9f3", color: "#432874" },
  DISPATCH: { bg: "#fff3cd", color: "#856404" },
  RECEIVE: { bg: "#d1ecf1", color: "#0c5460" },
  REVIEW: { bg: "#e2e3e5", color: "#383d41" },
};

const pill = (text, colors = { bg: "#e2e3e5", color: "#383d41" }) => (
  <span
    style={{
      borderRadius: 20,
      padding: "1px 8px",
      fontSize: 10,
      fontWeight: 700,
      whiteSpace: "nowrap",
      background: colors.bg,
      color: colors.color,
    }}
  >
    {text}
  </span>
);

export const getActivityColumns = () => [
  {
    key: "createdAt",
    header: "Date & Time",
    render: (row) => moment(row.createdAt).format("DD MMM YY, hh:mm A"),
    minWidth: 130,
  },
    {
    key: "center",
    header: "Center",
    render: (row) => (row.centerIds || []).map((c) => c?.title).filter(Boolean).join(", ") || "—",
    minWidth: 110,
  },
  {
    key: "module",
    header: "Module",
    render: (row) => pill(moduleLabel(row.module)),
    minWidth: 130,
  },
  {
    key: "action",
    header: "Action",
    render: (row) => pill(row.action, ACTION_COLORS[row.action]),
    minWidth: 80,
  },
  {
    key: "summary",
    header: "Activity",
    render: (row) => (
      <div style={{ whiteSpace: "normal", width: 340, padding: "2px 0" }}>
        <ExpandableText text={row.summary} limit={90} />
      </div>
    ),
    minWidth: 340,
  },
  {
    key: "actor",
    header: "By",
    render: (row) => row.actor?.name || "—",
    minWidth: 110,
  },
];
