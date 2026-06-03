import React, { forwardRef } from "react";

export const NAVY = "#1e2d5a";
export const GOLD = "#c9a035";

export const cell = { border: "1px solid #c8cfd8", padding: "6px 10px", verticalAlign: "top" };
export const headCell = { ...cell, background: NAVY, color: "#fff", fontWeight: "bold" };
export const altCell = { ...cell, background: "#f5f7fb" };

export const ModuleHeader = ({ children }) => (
  <div style={{ background: NAVY, padding: "8px 14px", marginTop: "1.5rem", marginBottom: "0.75rem", textAlign: "center" }}>
    <span style={{ color: GOLD, fontWeight: "bold", fontSize: "0.95rem", letterSpacing: "0.05em" }}>{children}</span>
  </div>
);

export const SectionTitle = ({ children }) => (
  <div style={{ color: NAVY, fontWeight: "bold", fontSize: "1rem", borderBottom: `2px solid ${NAVY}`, paddingBottom: "3px", marginTop: "1rem", marginBottom: "0.5rem" }}>
    {children}
  </div>
);

export const BulletList = ({ items }) => (
  <ul style={{ paddingLeft: "1.25rem", margin: "0.5rem 0 0.75rem" }}>
    {items.map((item, i) => <li key={i} style={{ marginBottom: "4px" }}>{item}</li>)}
  </ul>
);

export const WarningBox = ({ children }) => (
  <div style={{ border: "2px solid #e6a800", borderRadius: "4px", padding: "8px 12px", background: "#fffbf0", color: "#7a4f00", fontWeight: "bold", marginBottom: "0.75rem" }}>
    {children}
  </div>
);

export const CalloutBox = ({ children }) => (
  <div style={{ background: "#eef4ff", borderLeft: "4px solid #0d6efd", padding: "10px 12px", margin: "12px 0", fontStyle: "italic" }}>
    {children}
  </div>
);

export const Table = ({ cols, rows }) => (
  <table className="w-100" style={{ borderCollapse: "collapse", marginBottom: "0.75rem" }}>
    <thead>
      <tr>
        {cols.map((c, i) => (
          <th key={i} style={{ ...headCell, width: c.width, ...(c.center ? { textAlign: "center" } : {}) }}>
            {c.label}
          </th>
        ))}
      </tr>
    </thead>
    <tbody>
      {rows.map((row, i) => (
        <tr key={i}>
          {row.map((cell_, j) => (
            <td
              key={j}
              style={{
                ...(i % 2 === 0 ? cell : altCell),
                ...(j === 0 ? { fontWeight: "bold" } : {}),
                ...(cols[j]?.center ? { textAlign: "center" } : {}),
              }}
            >
              {cell_}
            </td>
          ))}
        </tr>
      ))}
    </tbody>
  </table>
);


export const ProtocolHeader = ({ heading, clCode, title, icdLine }) => (
  <div className={`${heading} mb-4`}>
    <div style={{ display: "flex", alignItems: "stretch", border: `2px solid ${NAVY}`, marginBottom: "1rem" }}>
      <div style={{ background: NAVY, padding: "12px 16px", flex: 1 }}>
        <div style={{ color: GOLD, fontWeight: "bold", fontSize: "1rem" }}>JAISWAL REHABILITATION CENTRE</div>
        <div style={{ color: "#fff", fontWeight: "bold", fontSize: "0.9rem" }}>FOR PSYCHIATRIC &amp; LIFESTYLE (JRCPL)</div>
        <div style={{ color: "#ccc", fontSize: "0.8rem" }}>Clinical Excellence Framework — Treatment Protocol</div>
      </div>
      <div style={{ background: GOLD, padding: "12px 20px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minWidth: "80px" }}>
        <div style={{ color: NAVY, fontWeight: "bold", fontSize: "1.6rem", lineHeight: 1 }}>{clCode}</div>
        <div style={{ color: NAVY, fontSize: "0.75rem", fontWeight: "bold" }}>Version 2.0</div>
      </div>
    </div>
    <div style={{ border: `1px solid ${NAVY}`, background: "#f5f7fb", padding: "10px", textAlign: "center", marginBottom: "1rem" }}>
      <div style={{ fontSize: "0.85rem", color: NAVY, fontWeight: "bold", letterSpacing: "0.05em" }}>CLINICAL TREATMENT PROTOCOL</div>
      <div style={{ fontSize: "1.4rem", fontWeight: "bold", color: NAVY }}>{title}</div>
      <div style={{ fontSize: "0.8rem", color: "#555", marginTop: "4px" }}>{icdLine}</div>
    </div>
  </div>
);

export const ProtocolControlTable = ({ rows }) => (
  <table className="w-100" style={{ borderCollapse: "collapse", marginBottom: "1rem" }}>
    <tbody>
      {rows.map(([label, value], i) => (
        <tr key={label}>
          <td style={{ ...cell, background: i % 2 === 0 ? "#eef1f8" : "#f8f9fc", color: NAVY, fontWeight: "bold", width: "22%" }}>{label}</td>
          <td style={{ ...cell, background: i % 2 === 0 ? "#fafbfd" : "#fff" }}>{value}</td>
        </tr>
      ))}
    </tbody>
  </table>
);

export const ProtocolApproval = ({ docCode, docTitle }) => (
  <>
    <SectionTitle>Approval &amp; Authorisation</SectionTitle>
    <table className="w-100" style={{ borderCollapse: "collapse", marginBottom: "1rem" }}>
      <thead>
        <tr>
          <th style={headCell}>Prepared By</th>
          <th style={headCell}>COO</th>
          <th style={headCell}>Approved By</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td style={cell}>Dr. Amar Shinde, Clinical Director</td>
          <td style={cell}>Mr. Surjit, COO, JRCPL</td>
          <td style={cell}>Dr. Bharat Mali, Cluster Head Psychiatrist</td>
        </tr>
      </tbody>
    </table>
    <p className="text-muted text-center" style={{ fontSize: "0.8rem", fontStyle: "italic" }}>
      This is a controlled clinical document of Jaiswal Rehabilitation Centre for Psychiatric &amp; Lifestyle (JRCPL). Any reproduction or distribution without written authorisation from the Clinical Director is prohibited. Governed under MHCA 2017 and NABH standards.
    </p>
    <p className="text-muted text-center" style={{ fontSize: "0.8rem" }}>
      JRCPL — {docCode} {docTitle} v2.0 &nbsp;|&nbsp; CONFIDENTIAL — Clinical Use Only
    </p>
  </>
);

export const ProtocolWrapper = forwardRef(({ classnames, children }, ref) => (
  <div ref={ref} className={`${classnames} px-6 py-10 absolute -z-10`}>
    {children}
  </div>
));
