import React, { forwardRef } from "react";

export const tableCellStyle = {
  border: "1px solid #6c757d",
  padding: "6px 10px",
  verticalAlign: "top",
};
export const tableHeadStyle = {
  ...tableCellStyle,
  background: "#f1f3f5",
  fontWeight: "bold",
};

export const SectionHeader = ({ children, color = "#1a3c5e" }) => (
  <div
    style={{
      background: color,
      color: "#fff",
      padding: "8px 12px",
      fontWeight: "bold",
      fontSize: "1rem",
      marginBottom: "0",
    }}
  >
    {children}
  </div>
);

export const ChecklistItem = ({ children, tick = false }) => (
  <div
    style={{
      display: "flex",
      alignItems: "flex-start",
      border: "1px solid #dee2e6",
      borderTop: "none",
      padding: "10px 12px",
      gap: "12px",
    }}
  >
    {tick ? (
      <span
        style={{
          marginTop: "1px",
          flexShrink: 0,
          width: "18px",
          height: "18px",
          borderRadius: "50%",
          background: "#1e7e34",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#fff",
          fontSize: "11px",
          fontWeight: "bold",
          lineHeight: 1,
        }}
      >
        ✓
      </span>
    ) : (
      <span
        style={{
          marginTop: "6px",
          flexShrink: 0,
          width: "8px",
          height: "8px",
          borderRadius: "50%",
          background: "#1a3c5e",
          display: "inline-block",
        }}
      />
    )}
    <span>{children}</span>
  </div>
);

export const EscalationBox = ({ children }) => (
  <div
    style={{
      border: "2px solid #dc3545",
      borderRadius: "4px",
      padding: "10px 14px",
      margin: "16px 0",
      color: "#dc3545",
      fontWeight: "bold",
    }}
  >
    {children}
  </div>
);

export const WorkflowFooter = () => (
  <p className="text-muted text-center" style={{ fontSize: "0.85rem" }}>
    CONFIDENTIAL — FOR INTERNAL USE ONLY · Approved: Dr. Amar Shinde — Clinical
    Director · JAGRUTII REHAB CENTRE PVT. LTD. · 18 Centres Across India
  </p>
);


export const WorkflowHeader = ({ heading, title, subtitle, docId, version, effectiveDate }) => (
  <div className={`${heading} mb-4`}>
    <h1 className="text-3xl m-auto text-center font-extrabold mb-2">
      JAGRUTII REHAB CENTRE PVT. LTD.
    </h1>
    <p className="text-center mb-3">JRCPL Clinical Workflow — Document Control</p>
    <h2 className="text-2xl font-semibold text-center mb-1">{title}</h2>
    <p className="text-center text-muted">
      {docId} | {version} | Effective: {effectiveDate}
    </p>
    {subtitle && (
      <p className="text-center text-muted" style={{ fontSize: "0.9rem" }}>
        {subtitle}
      </p>
    )}
  </div>
);

export const DocumentControlTable = ({ rows }) => (
  <table
    className="w-100 mb-4"
    style={{ borderCollapse: "collapse", marginBottom: "1.25rem" }}
  >
    <tbody>
      {rows.map(({ label, value }) => (
        <tr key={label}>
          <td style={tableHeadStyle}>{label}</td>
          <td style={tableCellStyle}>{value}</td>
        </tr>
      ))}
    </tbody>
  </table>
);

export const NumberedStepsTable = ({ items }) => (
  <table className="w-100" style={{ borderCollapse: "collapse", marginTop: "0" }}>
    <tbody>
      {items.map((item) => (
        <tr key={item.step}>
          <td
            style={{
              ...tableCellStyle,
              width: "4%",
              fontWeight: "bold",
              textAlign: "center",
              background: "#eef4ff",
              color: "#1a3c5e",
            }}
          >
            {item.step}
          </td>
          <td style={{ ...tableCellStyle, width: "22%", fontWeight: "bold" }}>
            {item.action}
          </td>
          <td style={tableCellStyle}>{item.detail}</td>
        </tr>
      ))}
    </tbody>
  </table>
);

export const WorkflowWrapper = forwardRef(({ classnames, children }, ref) => (
  <div ref={ref} className={`${classnames} px-6 py-10 absolute -z-10`}>
    {children}
  </div>
));
