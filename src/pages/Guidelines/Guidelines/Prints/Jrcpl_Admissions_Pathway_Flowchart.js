import React, { forwardRef } from "react";
import { ProtocolWrapper } from "./ProtocolComponents";

const NAVY   = "#1e2d5a";
const BLUE   = "#2563eb";
const RED    = "#dc2626";
const GREEN  = "#16a34a";
const ORANGE = "#d97706";
const PURPLE = "#7c3aed";
const TEAL   = "#0f766e";
const GOLD   = "#c9a035";
const GRAY   = "#9ca3af";
const CONNECT = "#94a3b8";

const FormCircle = ({ num, color }) => (
  <div style={{
    width: 62, height: 62, borderRadius: "50%",
    border: `3px solid ${color}`,
    display: "flex", flexDirection: "column",
    alignItems: "center", justifyContent: "center",
    color, margin: "0 auto", background: "#fff",
  }}>
    <span style={{ fontSize: "1.45rem", fontWeight: 800, lineHeight: 1 }}>{num}</span>
    <span style={{ fontSize: "0.48rem", fontWeight: 700, letterSpacing: "0.12em" }}>FORM</span>
  </div>
);

const FlowBox = ({ children, color = NAVY, filled = false, style = {} }) => (
  <div style={{
    boxSizing: "border-box",
    border: `2px solid ${color}`,
    borderRadius: 8,
    padding: "7px 10px",
    background: filled ? color : "#fff",
    color: filled ? "#fff" : color,
    textAlign: "center",
    fontSize: "0.78rem",
    fontWeight: 600,
    lineHeight: 1.35,
    ...style,
  }}>
    {children}
  </div>
);

const Pill = ({ children, color = GREEN }) => (
  <div style={{
    border: `1.5px solid ${color}`,
    borderRadius: 20,
    padding: "2px 13px",
    color,
    fontSize: "0.7rem",
    fontWeight: 700,
    display: "inline-block",
    background: "#fff",
  }}>
    {children}
  </div>
);

const SmallNote = ({ children }) => (
  <div style={{ textAlign: "center", fontSize: "0.67rem", color: GRAY, fontStyle: "italic", margin: "2px 0" }}>
    {children}
  </div>
);

const JrcplAdmissionsPathwayFlowchart = forwardRef((props, ref) => (
  <ProtocolWrapper ref={ref} classnames={props.classnames}>
   <div style={{ boxSizing: "border-box", maxWidth: 760, width: "100%", margin: "0 auto" }}>

    {/* ── HEADER ── */}
    <div style={{ textAlign: "center", marginBottom: "1.4rem" }}>
      <div style={{ boxSizing: "border-box", background: NAVY, color: "#fff", padding: "8px 16px", borderRadius: "4px 4px 0 0" }}>
        <span style={{ fontSize: "0.6rem", fontWeight: 700, letterSpacing: "0.13em" }}>
          JAGRUTII REHAB CENTRE PVT. LTD. &nbsp;·&nbsp; 18 CENTRES ACROSS INDIA &nbsp;·&nbsp; CLINICAL EXCELLENCE FRAMEWORK
        </span>
      </div>
      <div style={{ boxSizing: "border-box", border: `2px solid ${NAVY}`, borderTop: "none", borderRadius: "0 0 4px 4px", padding: "14px 20px" }}>
        <div style={{ fontSize: "0.6rem", letterSpacing: "0.14em", color: GRAY, fontWeight: 600, textTransform: "uppercase", marginBottom: 5 }}>
          Clinical Reference Document
        </div>
        <h2 style={{ color: NAVY, fontWeight: 800, fontSize: "1.65rem", margin: "0 0 5px" }}>
          Admissions Pathway — JRCPL
        </h2>
        <p style={{ color: "#6b7280", fontSize: "0.72rem", letterSpacing: "0.1em", textTransform: "uppercase", margin: 0, fontWeight: 600 }}>
          Mental Healthcare Act 2017 &nbsp;·&nbsp; Statutory Forms 86 / 87 / 98 / 89 / 90
        </p>
      </div>
    </div>

    {/* ── LEGEND ── */}
    <div style={{ display: "flex", marginBottom: "0.7rem", fontSize: "0.72rem", color: "#6b7280", textAlign: "center", boxSizing: "border-box" }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        Independent Admission
        <div style={{ fontSize: "0.64rem", marginTop: 2 }}>Form 98 (Emergency Order)</div>
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        Emergency Admission
        <div style={{ fontSize: "0.64rem", marginTop: 2 }}>Form 89 (30-day Renewal)</div>
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        Supported Admission
        <div style={{ fontSize: "0.64rem", marginTop: 2 }}>Form 90 (90-day Review)</div>
      </div>
    </div>

    {/* ── TOP NODE ── */}
    <div style={{ display: "flex", justifyContent: "center" }}>
      <div style={{
        border: "1.5px solid #d1d5db", borderRadius: 12,
        padding: "8px 32px", color: "#6b7280",
        fontSize: "0.88rem", fontWeight: 600, background: "#f9fafb",
      }}>
        Admissions — JRCPL
      </div>
    </div>

    {/* ── BRANCH CONNECTOR ── */}
    {/* central stem down from top node */}
    <div style={{ display: "flex", justifyContent: "center" }}>
      <div style={{ width: 2, height: 14, background: CONNECT }} />
    </div>
    {/* horizontal bar spanning the three column centres (1/6, 3/6, 5/6) */}
    <div style={{ display: "flex", height: 16 }}>
      <div style={{ flex: 1 }} />
      <div style={{ flex: 2, borderTop: `2px solid ${CONNECT}`, borderLeft: `2px solid ${CONNECT}` }} />
      <div style={{ flex: 2, borderTop: `2px solid ${CONNECT}`, borderRight: `2px solid ${CONNECT}` }} />
      <div style={{ flex: 1 }} />
    </div>
    {/* arrowheads pointing down into each column */}
    <div style={{ display: "flex", marginTop: -9, marginBottom: 2 }}>
      <div style={{ flex: 1, textAlign: "center", color: CONNECT, fontSize: "0.72rem", lineHeight: 1 }}>▼</div>
      <div style={{ flex: 1, textAlign: "center", color: CONNECT, fontSize: "0.72rem", lineHeight: 1 }}>▼</div>
      <div style={{ flex: 1, textAlign: "center", color: CONNECT, fontSize: "0.72rem", lineHeight: 1 }}>▼</div>
    </div>

    {/* ── THREE COLUMNS ── */}
    <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>

      {/* LEFT — Independent Admission */}
      <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
        <FlowBox color={BLUE} style={{ width: "100%", fontSize: "0.84rem" }}>
          Independent<br />Admission
        </FlowBox>

        {/* split connector → Form 86 / Form 87 (verticals at 1/4 and 3/4) */}
        <div style={{ width: "100%" }}>
          <div style={{ display: "flex", justifyContent: "center" }}>
            <div style={{ width: 2, height: 8, background: CONNECT }} />
          </div>
          <div style={{ display: "flex", height: 9 }}>
            <div style={{ flex: 1 }} />
            <div style={{ flex: 2, borderTop: `2px solid ${CONNECT}`, borderLeft: `2px solid ${CONNECT}`, borderRight: `2px solid ${CONNECT}` }} />
            <div style={{ flex: 1 }} />
          </div>
        </div>

        <div style={{ display: "flex", gap: 10, justifyContent: "center", width: "100%" }}>
          {/* Form 86 */}
          <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
            <FormCircle num="86" color={BLUE} />
            <div style={{ fontSize: "0.63rem", color: "#4b5563", textAlign: "center", lineHeight: 1.3 }}>
              Capacity present<br />Long-term Admission
            </div>
            <Pill color={BLUE}>Capacity (Y)</Pill>
          </div>
          {/* Form 87 */}
          <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
            <FormCircle num="87" color={RED} />
            <div style={{ fontSize: "0.63rem", color: "#4b5563", textAlign: "center", lineHeight: 1.3 }}>
              No Capacity<br />Refusal of Treatment
            </div>
            <Pill color={RED}>Capacity (N)</Pill>
          </div>
        </div>

        <FlowBox color={RED} style={{ width: "100%", fontSize: "0.7rem" }}>
          Refusal of Treatment<br />→ Capacity Lacking
        </FlowBox>
        <SmallNote>↓ routes to Emergency</SmallNote>
      </div>

      {/* CENTER — Emergency */}
      <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
        <div style={{
          color: ORANGE, fontWeight: 800, fontSize: "0.7rem",
          letterSpacing: "0.04em", textTransform: "uppercase",
          textAlign: "center", lineHeight: 1.4,
        }}>
          Any Emergency<br />Admission
        </div>

        <div style={{
          width: 116, height: 116, borderRadius: "50%",
          border: `3px solid ${ORANGE}`,
          display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center",
          textAlign: "center", padding: 8, background: "#fffbeb",
        }}>
          <div style={{ fontSize: "0.9rem", marginBottom: 1 }}>🚨</div>
          <div style={{ color: RED, fontWeight: 800, fontSize: "0.8rem", lineHeight: 1 }}>Emergency</div>
          <div style={{ color: ORANGE, fontWeight: 700, fontSize: "0.6rem", lineHeight: 1.4, marginTop: 3 }}>
            72 HRS + 48 HRS<br />EXTENSION
          </div>
        </div>

        <FlowBox color={TEAL} style={{ width: "100%", fontSize: "0.78rem" }}>
          Capacity Lacking?
        </FlowBox>
        <SmallNote>↓ If YES</SmallNote>
        <Pill color={GREEN}>→ Proceeds to Form 89</Pill>
      </div>

      {/* RIGHT — Supported Admission */}
      <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
        <FlowBox color={GREEN} style={{ width: "100%", fontSize: "0.84rem" }}>
          Supported Admission
        </FlowBox>

        <FlowBox color={TEAL} filled style={{ width: "100%", fontSize: "0.75rem" }}>
          Capacity Lacking?<br />
          <span style={{ fontWeight: 400, fontSize: "0.68rem" }}>Assessment required</span>
        </FlowBox>

        <SmallNote>↓ If Lacking</SmallNote>
        <Pill color={GREEN}>→ Proceeds to Form 89</Pill>
      </div>
    </div>

    {/* ── RENEWAL BANNER ── */}
    <div style={{ textAlign: "center", margin: "1.5rem 0 0.75rem" }}>
      <div style={{ color: GOLD, fontSize: "1rem", marginBottom: 2 }}>▼</div>
      <div style={{ fontSize: "0.7rem", color: "#6b7280", letterSpacing: "0.1em", textTransform: "uppercase", fontWeight: 700 }}>
        Ongoing Capacity Review — Renewal Cycle
      </div>
    </div>

    {/* ── RENEWAL CYCLE ── */}
    <div style={{ boxSizing: "border-box", width: "100%", border: "1.5px solid #e5e7eb", borderRadius: 12, padding: "20px 24px", background: "#f9fafb" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>

        {/* Form 89 */}
        <div style={{ flex: "0 0 auto", width: 140, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
          <FormCircle num="89" color={GOLD} />
          <div style={{ fontSize: "0.74rem", fontWeight: 700, color: NAVY, textAlign: "center", lineHeight: 1.35 }}>
            Inpatient Admission<br />Capacity Lacking
          </div>
          <Pill color={GOLD}>Every 30 days</Pill>
          <div style={{ fontSize: "0.63rem", color: GRAY }}>Capacity re-assessed</div>
        </div>

        {/* Bidirectional arrows */}
        <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", alignItems: "stretch", padding: "0 12px" }}>
          {/* → Every 90 days */}
          <div style={{ display: "flex", alignItems: "center", marginBottom: 3 }}>
            <div style={{ flex: 1, height: 2, background: GOLD }} />
            <div style={{
              width: 0, height: 0,
              borderTop: "5px solid transparent",
              borderBottom: "5px solid transparent",
              borderLeft: `8px solid ${GOLD}`,
            }} />
          </div>
          <div style={{ fontSize: "0.65rem", color: "#6b7280", textAlign: "center", fontWeight: 600 }}>
            Every 90 days
          </div>
          {/* ← Capacity still lacking */}
          <div style={{ display: "flex", alignItems: "center", marginTop: 3 }}>
            <div style={{
              width: 0, height: 0,
              borderTop: "5px solid transparent",
              borderBottom: "5px solid transparent",
              borderRight: `8px solid ${PURPLE}`,
            }} />
            <div style={{ flex: 1, height: 2, background: PURPLE }} />
          </div>
          <div style={{ fontSize: "0.62rem", color: PURPLE, textAlign: "center", fontWeight: 600, lineHeight: 1.35, marginTop: 4 }}>
            Capacity still lacking<br />→ renew 89
          </div>
          <div style={{ marginTop: 10, textAlign: "center" }}>
            <div style={{ fontSize: "0.67rem", color: GREEN, fontWeight: 700 }}>Capacity regained</div>
            <div style={{ fontSize: "0.62rem", color: "#6b7280" }}>→ discharge / Form 86</div>
          </div>
        </div>

        {/* Form 90 */}
        <div style={{ flex: "0 0 auto", width: 140, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
          <FormCircle num="90" color={PURPLE} />
          <div style={{ fontSize: "0.74rem", fontWeight: 700, color: NAVY, textAlign: "center", lineHeight: 1.35 }}>
            Extended Inpatient<br />Review
          </div>
          <Pill color={PURPLE}>Every 90 days</Pill>
          <div style={{ fontSize: "0.63rem", color: GRAY }}>Capacity re-assessed</div>
        </div>
      </div>

      {/* Summary notes */}
      <div style={{ borderTop: "1px solid #e5e7eb", paddingTop: 12, marginTop: 16, display: "flex", flexDirection: "column", gap: 5 }}>
        <div style={{ fontSize: "0.77rem", color: GREEN, fontWeight: 700 }}>
          ✓ Capacity Regained → Transition to Form 86 (Independent) or Discharge
        </div>
        <div style={{ fontSize: "0.77rem", color: RED, fontWeight: 700 }}>
          ↺ Capacity Still Lacking → Renew Form 89 (30-day cycle continues)
        </div>
      </div>
    </div>

    {/* ── FOOTER ── */}
    <div style={{ marginTop: "1.2rem", borderTop: "1px solid #e5e7eb", paddingTop: 8, textAlign: "center", fontSize: "0.63rem", color: GRAY }}>
      JRCPL — Clinical Governance &nbsp;|&nbsp; Mental Healthcare Act 2017 &nbsp;|&nbsp; Forms: 86, 87, 89, 90 &nbsp;|&nbsp; Confidential — For Internal Use Only
    </div>

   </div>
  </ProtocolWrapper>
));

export default JrcplAdmissionsPathwayFlowchart;
