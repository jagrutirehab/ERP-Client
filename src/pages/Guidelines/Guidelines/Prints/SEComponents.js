import React from "react";

export const NAVY = "#1e2d5a";
export const GOLD = "#c9a035";
export const BLUE = "#1a3a6b";
export const RED  = "#c0392b";
export const AMBER = "#e67e22";

export const cell    = { border: "1px solid #c8cfd8", padding: "6px 10px", verticalAlign: "top" };
export const headCell = { ...cell, background: NAVY, color: "#fff", fontWeight: "bold" };
export const altCell  = { ...cell, background: "#f5f7fb" };


export const SectionHeader = ({ children }) => (
  <div style={{ background: NAVY, padding: "8px 14px", marginTop: "1.5rem", marginBottom: "0.75rem" }}>
    <span style={{ color: GOLD, fontWeight: "bold", fontSize: "0.95rem", letterSpacing: "0.05em" }}>{children}</span>
  </div>
);

export const SubTitle = ({ children }) => (
  <div style={{ color: BLUE, fontWeight: "bold", fontSize: "0.95rem", borderBottom: `2px solid ${BLUE}`, paddingBottom: "3px", marginTop: "1rem", marginBottom: "0.5rem" }}>
    {children}
  </div>
);

export const BulletList = ({ items }) => (
  <ul style={{ paddingLeft: "1.25rem", margin: "0 0 0.75rem" }}>
    {items.map((item, i) => <li key={i} style={{ marginBottom: "3px" }}>{item}</li>)}
  </ul>
);

export const NumberedList = ({ items, start = 1 }) => (
  <ol start={start} style={{ paddingLeft: "1.4rem", margin: "0 0 0.75rem" }}>
    {items.map((item, i) => <li key={i} style={{ marginBottom: "4px" }}>{item}</li>)}
  </ol>
);


export const DataTable = ({ cols, rows }) => (
  <table style={{ borderCollapse: "collapse", width: "100%", marginBottom: "0.75rem" }}>
    <thead>
      <tr>{cols.map((c, i) => <th key={i} style={{ ...headCell, width: c.width }}>{c.label}</th>)}</tr>
    </thead>
    <tbody>
      {rows.map((row, i) => (
        <tr key={i}>
          {row.map((val, j) => (
            <td key={j} style={{ ...(i % 2 === 0 ? cell : altCell), ...(j === 0 ? { fontWeight: "bold" } : {}) }}>{val}</td>
          ))}
        </tr>
      ))}
    </tbody>
  </table>
);

export const ControlTable = ({ rows }) => (
  <table style={{ borderCollapse: "collapse", width: "100%", marginBottom: "1rem" }}>
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


export const WarningBox = ({ title, children, color = AMBER }) => (
  <div style={{ border: `2px solid ${color}`, borderRadius: "4px", padding: "8px 12px", background: color === RED ? "#fff5f5" : "#fffbf0", marginBottom: "0.75rem" }}>
    {title && <div style={{ fontWeight: "bold", color, marginBottom: "4px" }}>⚠ {title}</div>}
    <div style={{ color: color === RED ? RED : "#7a4f00" }}>{children}</div>
  </div>
);

export const AlertBox = ({ title, children }) => (
  <div style={{ background: "#fff3cd", border: "1px solid #ffc107", borderRadius: "4px", padding: "8px 12px", marginBottom: "0.75rem" }}>
    <div style={{ fontWeight: "bold", color: "#856404", marginBottom: "4px" }}>{title}</div>
    <div style={{ color: "#533f03" }}>{children}</div>
  </div>
);

export const CalloutBox = ({ title, children }) => (
  <div style={{ background: "#fdf3f3", border: `1px solid ${RED}`, borderRadius: "4px", padding: "10px 14px", marginBottom: "1rem" }}>
    <div style={{ fontWeight: "bold", color: RED, marginBottom: "4px" }}>● {title}</div>
    <div>{children}</div>
  </div>
);


export const ResponseStep = ({ num, title, items, titleColor = BLUE }) => (
  <div style={{ display: "flex", gap: "12px", marginBottom: "0.75rem", border: "1px solid #c8cfd8", borderRadius: "4px", overflow: "hidden" }}>
    <div style={{ background: NAVY, color: "#fff", fontWeight: "bold", fontSize: "1.1rem", minWidth: "48px", display: "flex", alignItems: "center", justifyContent: "center" }}>{num}</div>
    <div style={{ padding: "8px 10px", flex: 1 }}>
      <div style={{ color: titleColor, fontWeight: "bold", marginBottom: "4px" }}>{title}</div>
      <ul style={{ paddingLeft: "1.1rem", margin: 0 }}>
        {items.map((item, i) => <li key={i} style={{ marginBottom: "2px" }}>{item}</li>)}
      </ul>
    </div>
  </div>
);


export const SEDocHeader = ({ docCode, title, tagline, version = "Version 2.0" }) => (
  <div>
    <div style={{ display: "flex", alignItems: "stretch", border: `2px solid ${NAVY}`, marginBottom: "1rem" }}>
      <div style={{ background: NAVY, padding: "12px 16px", flex: 1 }}>
        <div style={{ color: GOLD, fontWeight: "bold", fontSize: "1rem" }}>JAGRUTII REHAB CENTRE PVT. LTD.</div>
        <div style={{ color: "#fff", fontWeight: "bold", fontSize: "0.85rem" }}>Clinical Excellence Framework — Standard Operating Procedure</div>
      </div>
      <div style={{ background: GOLD, padding: "12px 20px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minWidth: "80px" }}>
        <div style={{ color: NAVY, fontWeight: "bold", fontSize: "1.6rem", lineHeight: 1 }}>{docCode}</div>
        <div style={{ color: NAVY, fontSize: "0.75rem", fontWeight: "bold" }}>{version}</div>
      </div>
    </div>
    <div style={{ border: `1px solid ${NAVY}`, background: "#f5f7fb", padding: "10px", textAlign: "center", marginBottom: "1rem" }}>
      <div style={{ fontSize: "0.85rem", color: NAVY, fontWeight: "bold", letterSpacing: "0.05em" }}>STANDARD OPERATING PROCEDURE</div>
      <div style={{ fontSize: "1.4rem", fontWeight: "bold", color: NAVY }}>{title}</div>
      {tagline && <div style={{ fontSize: "0.8rem", color: "#555", marginTop: "4px" }}>{tagline}</div>}
    </div>
  </div>
);


export const SEAuthorisation = ({ docCode, version = "2.0", date = "June 2025" }) => (
  <>
    <table style={{ borderCollapse: "collapse", width: "100%", marginBottom: "1rem" }}>
      <thead>
        <tr>
          <th style={{ ...headCell, width: "33.33%" }}>Prepared By</th>
          <th style={{ ...headCell, width: "33.33%" }}>Reviewed By</th>
          <th style={{ ...headCell, width: "33.33%" }}>Approved By</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td style={cell}>
            <div style={{ fontWeight: "bold" }}>Dr. Amar Shinde</div>
            <div>Clinical Director</div>
            <div>Jagrutii Rehab Centre Pvt. Ltd.</div>
            <div style={{ marginTop: "8px" }}>Date: _______________</div>
          </td>
          <td style={cell}>
            <div style={{ fontWeight: "bold" }}>Dr. Bharat Mali</div>
            <div>Regional Head</div>
            <div>Jagrutii Rehab Centre Pvt. Ltd.</div>
            <div style={{ marginTop: "8px" }}>Date: _______________</div>
          </td>
          <td style={cell}>
            <div style={{ fontWeight: "bold" }}>Dr. Amar Shinde</div>
            <div>Founder &amp; Clinical Director</div>
            <div>Jagrutii Rehab Centre Pvt. Ltd.</div>
            <div style={{ marginTop: "8px" }}>Date: _______________</div>
          </td>
        </tr>
      </tbody>
    </table>
    <p className="text-muted text-center" style={{ fontSize: "0.8rem", fontStyle: "italic", marginTop: "1rem" }}>
      {docCode} | Version {version} | {date} | Jagrutii Rehab Centre Pvt. Ltd. | CONFIDENTIAL
    </p>
    <p className="text-muted text-center" style={{ fontSize: "0.8rem", fontStyle: "italic" }}>
      This is a controlled clinical document of Jagrutii Rehab Centre Pvt. Ltd. Any reproduction or distribution without written authorisation from the Clinical Director is prohibited. Governed under MHCA 2017 and NABH standards.
    </p>
  </>
);
