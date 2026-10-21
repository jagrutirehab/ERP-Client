import React, { useMemo } from "react";
import { Row, Col, Card, CardHeader, CardBody, Button } from "reactstrap";
import { Link, useNavigate } from "react-router-dom";
import StatusBadge from "../components/StatusBadge";
import { CENTRES, CATEGORIES, ITEMS, STATUS, formatDate, overviewStats, centreScore } from "../data";

const ACTION_ORDER = { expired: 0, missing: 1, renewal: 2 };

const Overview = () => {
  const navigate = useNavigate();

  const stats = useMemo(() => overviewStats(), []);

  const upcoming = useMemo(
    () =>
      ITEMS.filter((i) => i.statusKey === "due30" || i.statusKey === "due90")
        .sort((a, b) => a.daysLeft - b.daysLeft)
        .slice(0, 9),
    [],
  );

  const actionNeeded = useMemo(
    () =>
      ITEMS.filter((i) => i.statusKey in ACTION_ORDER)
        .sort(
          (a, b) =>
            ACTION_ORDER[a.statusKey] - ACTION_ORDER[b.statusKey] ||
            (a.daysLeft || 0) - (b.daysLeft || 0),
        )
        .slice(0, 6),
    [],
  );

  const actionCta = (item) =>
    item.statusKey === "missing" ? "Upload document" : item.statusKey === "renewal" ? "Update status" : "Start renewal";

  const goToUpload = (item) =>
    navigate(`/compliance/upload?centre=${item.centreId}&category=${item.categoryId}`);

  return (
    <div className="p-3 p-lg-4">
        <div className="d-flex flex-column flex-sm-row align-items-start align-items-sm-center justify-content-between gap-3 mb-3">
          <div>
            <h5 className="mb-1 fw-semibold">Overview</h5>
            <p className="text-muted mb-0 fs-13">
              Registrations, NOCs, licences and their documents across all {CENTRES.length} centres.
            </p>
          </div>
          <div className="d-flex gap-2 w-100 w-sm-auto">
            <Button color="light" className="border flex-fill flex-sm-grow-0" size="sm">
              Export
            </Button>
            <Button
              color="success"
              className="text-white flex-fill flex-sm-grow-0"
              size="sm"
              onClick={() => navigate("/compliance/upload")}
            >
              Add item
            </Button>
          </div>
        </div>

        {/* Summary cards */}
        <Row className="g-2 g-md-3 mb-3">
          {[
            {
              label: "Compliance score",
              value: `${stats.score}%`,
              sub: `${stats.compliant} of ${stats.total} items current`,
              color: "#1D5A41",
            },
            {
              label: "Expired",
              value: stats.expired,
              sub: "Operating without valid cover",
              color: "#9A2418",
            },
            {
              label: "Due in 30 days",
              value: stats.due30,
              sub: "Start renewal now",
              color: "#7A4300",
            },
            {
              label: "Due in 31–90 days",
              value: stats.due90,
              sub: "Plan inspections & fees",
              color: "#1F4E8C",
            },
            {
              label: "In renewal",
              value: stats.renewal,
              sub: "Applied, awaiting authority",
              color: "#5A3E8F",
            },
            {
              label: "Document missing",
              value: stats.missing,
              sub: "Record exists, no file on file",
              color: "#9A2418",
            },
          ].map((c) => (
            <Col xs={6} md={4} lg={2} key={c.label}>
              <Card
                className="h-100 shadow-sm mb-0 border-0"
                style={{ borderLeft: `3px solid ${c.color}` }}
              >
                <CardBody className="p-3">
                  <div
                    className="text-uppercase text-truncate mb-2"
                    style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.04em", color: c.color }}
                  >
                    {c.label}
                  </div>
                  <div className="fs-3 fw-bold lh-1 mt-1" style={{ color: c.color }}>
                    {c.value}
                  </div>
                  <div className="text-muted mt-2" style={{ fontSize: 12 }}>
                    {c.sub}
                  </div>
                </CardBody>
              </Card>
            </Col>
          ))}
        </Row>

        {/* Centre x compliance matrix */}
        <Card className="shadow-sm mb-3 border-0">
          <CardHeader className="bg-white d-flex flex-wrap justify-content-between align-items-center gap-2">
            <div>
              <h5 className="mb-0">Centre × compliance matrix</h5>
              <span className="text-muted" style={{ fontSize: 13 }}>
                Tap a centre to open its full register.
              </span>
            </div>
            <div className="d-none d-lg-flex flex-wrap gap-2">
              {["valid", "due90", "due30", "expired", "renewal", "missing", "lt"].map((k) => (
                <StatusBadge key={k} statusKey={k} />
              ))}
            </div>
          </CardHeader>
          <CardBody>
            {/* Desktop/tablet: full matrix table */}
            <div className="table-responsive d-none d-md-block">
              <table className="table table-borderless table-sm mb-0" style={{ minWidth: 980 }}>
                <thead>
                  <tr className="text-muted" style={{ fontSize: 12 }}>
                    <th style={{ width: 140 }}>Centre</th>
                    {CATEGORIES.map((c) => (
                      <th key={c.id}>{c.short}</th>
                    ))}
                    <th className="text-end">Score</th>
                  </tr>
                </thead>
                <tbody>
                  {CENTRES.map((centre) => (
                    <tr key={centre.id}>
                      <td>
                        <Link to={`/compliance/centres/${centre.id}`} className="text-decoration-none">
                          <div className="fw-semibold text-dark">{centre.name}</div>
                          <div className="text-muted" style={{ fontSize: 12 }}>
                            {centre.state === "MH" ? "Maharashtra" : centre.state}
                          </div>
                        </Link>
                      </td>
                      {CATEGORIES.map((cat) => {
                        const item = ITEMS.find((i) => i.centreId === centre.id && i.categoryId === cat.id);
                        const s = STATUS[item.statusKey];
                        return (
                          <td key={cat.id}>
                            <div
                              className="rounded p-2"
                              style={{
                                background: s.bg,
                                color: s.fg,
                                border: `1px ${s.dashed ? "dashed" : "solid"} ${s.border}`,
                                minHeight: 44,
                              }}
                            >
                              <div style={{ fontSize: 12, fontWeight: 600 }}>
                                {item.statusKey === "na" ? "Not applicable" : s.label}
                              </div>
                              <div style={{ fontSize: 11, fontFamily: "monospace" }}>
                                {item.validTill
                                  ? formatDate(item.validTill)
                                  : item.statusKey === "missing"
                                  ? "No file"
                                  : item.statusKey === "lt"
                                  ? "Lifetime"
                                  : ""}
                              </div>
                            </div>
                          </td>
                        );
                      })}
                      <td className="text-end fw-semibold align-middle">{centreScore(centre.id)}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile: one card per centre, status chips wrap */}
            <div className="d-md-none d-flex flex-column gap-2">
              {CENTRES.map((centre) => (
                <Link
                  key={centre.id}
                  to={`/compliance/centres/${centre.id}`}
                  className="text-decoration-none text-dark"
                >
                  <div className="border rounded p-2">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <div>
                        <div className="fw-semibold">{centre.name}</div>
                        <div className="text-muted" style={{ fontSize: 12 }}>
                          {centre.state === "MH" ? "Maharashtra" : centre.state}
                        </div>
                      </div>
                      <div className="fw-semibold">{centreScore(centre.id)}%</div>
                    </div>
                    <div className="d-flex flex-wrap gap-1">
                      {CATEGORIES.map((cat) => {
                        const item = ITEMS.find((i) => i.centreId === centre.id && i.categoryId === cat.id);
                        if (item.statusKey === "na") return null;
                        return <StatusBadge key={cat.id} statusKey={item.statusKey} />;
                      })}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </CardBody>
        </Card>

        <Row className="g-3 mb-3">
          <Col lg={7}>
            <Card className="shadow-sm h-100 mb-0 border-0">
              <CardHeader className="bg-white d-flex flex-wrap justify-content-between align-items-baseline gap-2">
                <h5 className="mb-0">Renewals due · next 90 days</h5>
                <span className="text-muted" style={{ fontSize: 13 }}>
                  Reminders handled by SOP module
                </span>
              </CardHeader>
              <CardBody>
                <div className="d-flex flex-column">
                  {upcoming.map((u) => (
                    <div
                      key={u.id}
                      className="d-flex flex-wrap justify-content-between align-items-center gap-2 py-2 border-top"
                    >
                      <div className="d-flex flex-column">
                        <span className="text-dark fw-medium">{u.categoryName}</span>
                        <span className="text-muted" style={{ fontSize: 13 }}>
                          {u.centreName} · {u.authority} · Owner: {u.owner}
                        </span>
                      </div>
                      <StatusBadge statusKey={u.statusKey === "due30" ? "due30" : "due90"} />
                    </div>
                  ))}
                </div>
              </CardBody>
            </Card>
          </Col>

          <Col lg={5}>
            <Card className="shadow-sm h-100 mb-0 border-0">
              <CardHeader className="bg-white">
                <h5 className="mb-0">Action needed</h5>
              </CardHeader>
              <CardBody>
                <div className="d-flex flex-column gap-2">
                  {actionNeeded.map((a) => (
                    <div
                      key={a.id}
                      className="border rounded p-2"
                      style={{ borderLeft: `3px solid ${STATUS[a.statusKey].fg}` }}
                    >
                      <div className="d-flex justify-content-between align-items-start gap-2 mb-2">
                        <div>
                          <div className="fw-semibold" style={{ fontSize: 14 }}>
                            {a.categoryName}
                          </div>
                          <div className="text-muted" style={{ fontSize: 13 }}>
                            {a.centreName}
                            {a.daysLeft != null ? ` · ${Math.abs(a.daysLeft)} days overdue` : ""}
                          </div>
                        </div>
                        <StatusBadge statusKey={a.statusKey} />
                      </div>
                      <div className="d-flex gap-2">
                        <Button color="success" className="text-white" size="sm" onClick={() => goToUpload(a)}>
                          {actionCta(a)}
                        </Button>
                        <Button color="light" size="sm" className="border">
                          Assign
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </div>
  );
};

export default Overview;
