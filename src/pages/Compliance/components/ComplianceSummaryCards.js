import React from "react";
import { Row, Col, Card, CardBody } from "reactstrap";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

// Renders the stat-card row from a getComplianceSummary() response
// ({ total, current, score, byStatus }) — used on CenterDetail.js and
// Overview.js.
const ComplianceSummaryCards = ({ summary, loading = false }) => {
  const byStatus = summary?.byStatus || {};

  const cards = [
    { label: "Compliance score", value: summary ? `${summary.score}%` : "—", color: "#1F4E8C" },
    { label: "Items tracked", value: summary?.total ?? "—", color: "#3E4A46" },
    { label: "Expired", value: byStatus.EXPIRED ?? "—", color: "#9A2418" },
    { label: "Due in 30 days", value: byStatus.DUE_30 ?? "—", color: "#7A4300" },
    { label: "Due in 90 days", value: byStatus.DUE_90 ?? "—", color: "#1F4E8C" },
    { label: "Valid", value: byStatus.VALID ?? "—", color: "#1D5A41" },
    { label: "No expiry", value: byStatus.NO_EXPIRY ?? "—", color: "#1D5A41" },
    { label: "Doc missing", value: byStatus.DOC_MISSING ?? "—", color: "#9A2418" },
    { label: "In renewal", value: byStatus.IN_RENEWAL ?? "—", color: "#5A3E8F" },
  ];

  return (
    <Row className="g-2 g-md-3 mb-3">
      {cards.map((c) => (
        <Col xs={6} sm={4} md={3} lg={true} key={c.label}>
          <Card className="h-100 shadow-sm mb-0 border-0" style={{ borderLeft: `3px solid ${c.color}` }}>
            <CardBody className="p-2">
              <div
                className="text-uppercase mb-1 text-truncate"
                style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.03em", color: c.color }}
              >
                {c.label}
              </div>
              <div className="fs-5 fw-bold" style={{ color: c.color }}>
                {loading ? <Skeleton width={36} height={18} /> : c.value}
              </div>
            </CardBody>
          </Card>
        </Col>
      ))}
    </Row>
  );
};

export default ComplianceSummaryCards;
