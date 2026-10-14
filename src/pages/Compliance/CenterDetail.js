import React, { useMemo, useState } from "react";
import { Row, Col, Card, CardHeader, CardBody, Button } from "reactstrap";
import { useNavigate, useParams } from "react-router-dom";
import { Download, Plus, ChevronDown, ChevronRight, Eye, FileText, Check } from "lucide-react";
import Select from "react-select";
import StatusBadge from "./StatusBadge";
import { getCategoryIcon, GROUP_COLORS } from "./icons";
import {
  CENTRES,
  STATUS,
  TODAY,
  centreItems,
  centreCategoryItems,
  worstStatus,
  validityProgress,
  centreScore,
  formatDate,
} from "./data";

const GROUP_ORDER = ["Statutory registration", "Safety & environment", "Pharmacy", "Premises & insurance"];
const ATTENTION_KEYS = ["expired", "due30", "due90", "renewal", "missing"];
const CHECKLIST_STEPS = [
  "Prerequisites gathered (inspection reports, prior certificate)",
  "Application submitted on authority portal",
  "Fee paid · challan uploaded",
  "Inspection / authority visit completed",
  "Renewed certificate uploaded & verified",
];
const CHECKLIST_PROGRESS = { renewal: 2, due30: 1, expired: 1, due90: 0, valid: 0 };

const CenterDetail = () => {
  const { centreId = "pune" } = useParams();
  const navigate = useNavigate();

  const centre = CENTRES.find((c) => c.id === centreId) || CENTRES[0];
  const categories = useMemo(() => centreItems(centre.id), [centre.id]);

  // Each category can track more than one compliance record (e.g. a Fire NOC
  // per building) — flatten those out so every record is addressable/selectable.
  const categoryRecords = useMemo(() => {
    const map = new Map();
    categories.forEach((cat) => map.set(cat.categoryId, centreCategoryItems(centre.id, cat.categoryId)));
    return map;
  }, [categories, centre.id]);

  const allRecords = useMemo(() => categories.flatMap((cat) => categoryRecords.get(cat.categoryId)), [categories, categoryRecords]);

  const [selectedId, setSelectedId] = useState(
    allRecords.find((i) => !["valid", "lt", "na"].includes(i.statusKey))?.id || allRecords[0].id,
  );
  const selected = allRecords.find((i) => i.id === selectedId) || allRecords[0];

  const [expanded, setExpanded] = useState(() => new Set([selected.categoryId]));
  const toggleExpanded = (categoryId) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(categoryId) ? next.delete(categoryId) : next.add(categoryId);
      return next;
    });

  const counts = {
    total: allRecords.filter((i) => i.statusKey !== "na").length,
    expired: allRecords.filter((i) => i.statusKey === "expired").length,
    due30: allRecords.filter((i) => i.statusKey === "due30").length,
    ok: allRecords.filter((i) => ["valid", "lt", "due90"].includes(i.statusKey)).length,
  };

  const groups = GROUP_ORDER.map((g) => {
    const items = categories.filter((i) => i.group === g);
    const groupRecords = items.flatMap((i) => categoryRecords.get(i.categoryId) || []);
    return {
      name: g,
      items,
      needAttention: groupRecords.filter((r) => ATTENTION_KEYS.includes(r.statusKey)).length,
    };
  }).filter((g) => g.items.length);

  const centreOptions = CENTRES.map((c) => ({ value: c.id, label: c.name }));

  const renderValidityMeta = (record) => {
    const progress = validityProgress(record);
    if (record.statusKey === "lt") {
      return <div className="text-muted mt-1" style={{ fontSize: 11 }}>No expiry · No renewal needed</div>;
    }
    if (!progress) return null;
    const barColor = STATUS[record.statusKey]?.fg || "#1D5A41";
    return (
      <div className="mt-1">
        <div className="progress" style={{ height: 4, background: "#EDEFEC" }}>
          <div
            className="progress-bar"
            style={{ width: `${progress.percentUsed}%`, background: barColor }}
          />
        </div>
        <div className="text-muted mt-1" style={{ fontSize: 11 }}>{progress.percentUsed}% of validity used</div>
      </div>
    );
  };

  return (
    <div className="p-3 p-lg-4">
      <div className="mb-3">
        <h5 className="mb-1 fw-semibold">{centre.name} centre</h5>
        <p className="text-muted mb-0 fs-13">
          Licences, NOCs and registrations tracked at this centre.
        </p>
      </div>

        <div className="d-flex flex-column flex-sm-row align-items-stretch align-items-sm-center justify-content-between gap-2 mb-3">
          <div style={{ minWidth: 220 }}>
            <Select
              classNamePrefix="react-select"
              options={centreOptions}
              value={centreOptions.find((o) => o.value === centre.id)}
              onChange={(option) => navigate(`/compliance/centres/${option?.value}`)}
            />
          </div>
          <div className="d-flex gap-2">
            <Button color="light" className="border flex-fill flex-sm-grow-0" size="sm">
              <Download size={14} className="me-1" /> Download all (ZIP)
            </Button>
            <Button
              color="success"
              className="text-white flex-fill flex-sm-grow-0"
              size="sm"
              onClick={() => navigate(`/compliance/upload?centre=${centre.id}`)}
            >
              <Plus size={14} className="me-1" /> Add item
            </Button>
          </div>
        </div>

        <Row className="g-2 g-md-3 mb-3">
          {[
            { label: "Compliance score", value: `${centreScore(centre.id)}%`, color: "#1F4E8C" },
            { label: "Items tracked", value: counts.total, color: "#3E4A46" },
            { label: "Expired", value: counts.expired, color: "#9A2418" },
            { label: "Due in 30 days", value: counts.due30, color: "#7A4300" },
            { label: "Valid / no expiry", value: counts.ok, color: "#1D5A41" },
          ].map((c) => (
            <Col xs={6} md={4} lg key={c.label}>
              <Card
                className="h-100 shadow-sm mb-0 border-0"
                style={{ borderLeft: `3px solid ${c.color}` }}
              >
                <CardBody className="p-3">
                  <div
                    className="text-uppercase mb-2"
                    style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.03em", color: c.color }}
                  >
                    {c.label}
                  </div>
                  <div className="fs-4 fw-bold" style={{ color: c.color }}>
                    {c.value}
                  </div>
                </CardBody>
              </Card>
            </Col>
          ))}
        </Row>

        <Row className="g-3">
          <Col lg={5}>
            <div className="d-flex flex-column gap-3">
              {groups.map((group) => {
                const groupColor = GROUP_COLORS[group.name] || { bg: "#F1F2EF", fg: "#3E4A46" };
                return (
                  <Card className="shadow-sm mb-0 border-0" key={group.name}>
                    <CardHeader className="bg-white d-flex justify-content-between align-items-center">
                      <h6 className="mb-0">{group.name}</h6>
                      <span className="text-muted" style={{ fontSize: 12 }}>
                        {group.items.length} items
                        {group.needAttention > 0 ? ` · ${group.needAttention} need attention` : ""}
                      </span>
                    </CardHeader>
                    <CardBody>
                      <div className="d-flex flex-column gap-2">
                        {group.items.map((item) => {
                          const records = categoryRecords.get(item.categoryId) || [];
                          const isMulti = records.length > 1;
                          const isOpen = expanded.has(item.categoryId);
                          const Icon = getCategoryIcon(item.categoryId);
                          const summaryStatus = worstStatus(records);

                          if (!isMulti) {
                            const record = records[0];
                            const isSelected = record.id === selected.id;
                            return (
                              <button
                                key={item.categoryId}
                                type="button"
                                onClick={() => setSelectedId(record.id)}
                                className={`border rounded p-2 text-start ${
                                  isSelected ? "border-success" : "bg-white"
                                }`}
                                style={{
                                  borderWidth: isSelected ? 2 : 1,
                                  background: isSelected ? "#F3FAF6" : undefined,
                                }}
                              >
                                <div className="d-flex justify-content-between align-items-center gap-2">
                                  <span className="fw-medium d-flex align-items-center gap-2" style={{ fontSize: 14 }}>
                                    <span
                                      className="d-inline-flex align-items-center justify-content-center rounded-circle flex-shrink-0"
                                      style={{ width: 24, height: 24, background: groupColor.bg, color: groupColor.fg }}
                                    >
                                      <Icon size={13} />
                                    </span>
                                    {item.categoryName}
                                  </span>
                                  <StatusBadge statusKey={record.statusKey} />
                                </div>
                                <div className="text-muted" style={{ fontSize: 12 }}>
                                  {record.authority} · {record.licenceNo || "—"}
                                </div>
                                {renderValidityMeta(record)}
                              </button>
                            );
                          }

                          return (
                            <div key={item.categoryId} className="border rounded" style={{ overflow: "hidden" }}>
                              <button
                                type="button"
                                onClick={() => toggleExpanded(item.categoryId)}
                                className="d-flex justify-content-between align-items-center gap-2 w-100 p-2 text-start bg-white border-0"
                              >
                                <span className="fw-medium d-flex align-items-center gap-2" style={{ fontSize: 14 }}>
                                  {isOpen ? (
                                    <ChevronDown size={14} className="text-muted flex-shrink-0" />
                                  ) : (
                                    <ChevronRight size={14} className="text-muted flex-shrink-0" />
                                  )}
                                  <span
                                    className="d-inline-flex align-items-center justify-content-center rounded-circle flex-shrink-0"
                                    style={{ width: 24, height: 24, background: groupColor.bg, color: groupColor.fg }}
                                  >
                                    <Icon size={13} />
                                  </span>
                                  {item.categoryName}
                                  <span className="text-muted" style={{ fontSize: 12, fontWeight: 400 }}>
                                    ({records.length})
                                  </span>
                                </span>
                                <StatusBadge statusKey={summaryStatus} />
                              </button>
                              {isOpen && (
                                <div className="d-flex flex-column gap-1 p-2 pt-0">
                                  {records.map((record) => {
                                    const isSelected = record.id === selected.id;
                                    return (
                                      <button
                                        key={record.id}
                                        type="button"
                                        onClick={() => setSelectedId(record.id)}
                                        className={`border rounded p-2 text-start ${
                                          isSelected ? "border-success" : "bg-white"
                                        }`}
                                        style={{
                                          borderWidth: isSelected ? 2 : 1,
                                          background: isSelected ? "#F3FAF6" : undefined,
                                        }}
                                      >
                                        <div className="d-flex justify-content-between align-items-center gap-2">
                                          <span style={{ fontSize: 13 }}>{record.recordLabel}</span>
                                          <StatusBadge statusKey={record.statusKey} />
                                        </div>
                                        <div className="text-muted" style={{ fontSize: 12 }}>
                                          {record.authority} · {record.licenceNo || "—"}
                                        </div>
                                        {renderValidityMeta(record)}
                                      </button>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </CardBody>
                  </Card>
                );
              })}
            </div>
          </Col>

          <Col lg={7}>
            <Card className="shadow-sm mb-0 border-0">
              <CardBody>
                <span
                  className="d-inline-flex align-items-center gap-1 text-uppercase mb-2 px-2 py-1 rounded"
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    letterSpacing: "0.04em",
                    background: (GROUP_COLORS[selected.group] || {}).bg,
                    color: (GROUP_COLORS[selected.group] || {}).fg,
                  }}
                >
                  {React.createElement(getCategoryIcon(selected.categoryId), { size: 13 })}
                  {selected.group}
                </span>
                <div className="d-flex flex-wrap justify-content-between align-items-start gap-2">
                  <div>
                    <h4 className="mb-0">{selected.categoryName}</h4>
                    {categoryRecords.get(selected.categoryId)?.length > 1 && (
                      <div className="text-muted mb-2" style={{ fontSize: 13 }}>
                        {selected.recordLabel}
                      </div>
                    )}
                  </div>
                  <StatusBadge statusKey={selected.statusKey} />
                </div>

                <Row className="g-3 mb-3">
                  <Col sm={6}>
                    <div className="text-muted small">Licence / reg. no.</div>
                    <div className="fw-medium" style={{ fontFamily: "monospace" }}>
                      {selected.licenceNo || "—"}
                    </div>
                  </Col>
                  <Col sm={6}>
                    <div className="text-muted small">Issuing authority</div>
                    <div className="fw-medium">{selected.authority}</div>
                  </Col>
                  <Col sm={6}>
                    <div className="text-muted small">Valid till</div>
                    <div className="fw-medium">
                      {selected.validTill
                        ? `${formatDate(selected.validTill)} · ${
                            selected.daysLeft < 0 ? `${Math.abs(selected.daysLeft)}d overdue` : `${selected.daysLeft}d left`
                          }`
                        : selected.statusKey === "lt"
                        ? "No expiry"
                        : "—"}
                    </div>
                  </Col>
                  <Col sm={6}>
                    <div className="text-muted small">Owner</div>
                    <div className="fw-medium">{selected.owner}</div>
                  </Col>
                  {selected.statusKey !== "lt" && selected.statusKey !== "na" && (
                    <Col sm={6}>
                      <div className="text-muted small">Renewal lead time</div>
                      <div className="fw-medium">60 days</div>
                    </Col>
                  )}
                </Row>

                <div className="d-flex flex-wrap gap-2 mb-4">
                  <Button
                    color="success"
                    className="text-white"
                    size="sm"
                    onClick={() =>
                      navigate(`/compliance/upload?centre=${centre.id}&category=${selected.categoryId}`)
                    }
                  >
                    {selected.statusKey === "missing" ? "Upload document" : "Upload renewed document"}
                  </Button>
                  <Button color="light" size="sm" className="border">
                    Mark as applied for renewal
                  </Button>
                </div>

                {selected.statusKey !== "missing" && selected.statusKey !== "na" && (
                  <div className="mb-4">
                    <h6 className="mb-2">Current document</h6>
                    <div
                      className="d-flex align-items-center gap-3 rounded p-2"
                      style={{ background: "#F8F9FA", border: "1px solid #E9ECEF" }}
                    >
                      <div
                        className="d-flex align-items-center justify-content-center rounded flex-shrink-0"
                        style={{ width: 36, height: 36, background: "#E6EEF8", color: "#1F4E8C" }}
                      >
                        <FileText size={16} />
                      </div>
                      <div className="flex-grow-1" style={{ minWidth: 0 }}>
                        <div className="fw-medium text-truncate">
                          {selected.categoryId.toUpperCase()}_{centre.code}_v{selected.documentVersion}.pdf
                        </div>
                        <div className="text-muted" style={{ fontSize: 12 }}>
                          PDF · 1.4 MB · v{selected.documentVersion} · verified by {selected.owner}
                        </div>
                      </div>
                      <Button color="light" className="border p-2" size="sm">
                        <Eye size={14} />
                      </Button>
                      <Button color="light" className="border p-2" size="sm">
                        <Download size={14} />
                      </Button>
                    </div>
                  </div>
                )}

                {["expired", "due30", "due90", "renewal"].includes(selected.statusKey) && (
                  <div className="mb-4">
                    <h6 className="mb-2">Renewal checklist</h6>
                    <div className="d-flex flex-column gap-2">
                      {CHECKLIST_STEPS.map((step, idx) => {
                        const done = idx < (CHECKLIST_PROGRESS[selected.statusKey] || 0);
                        return (
                          <div key={step} className="d-flex align-items-center gap-2">
                            <span
                              className="d-flex align-items-center justify-content-center rounded flex-shrink-0"
                              style={{
                                width: 18,
                                height: 18,
                                border: `1px solid ${done ? "#1D5A41" : "#C9CFCB"}`,
                                background: done ? "#1D5A41" : "transparent",
                              }}
                            >
                              {done && <Check size={12} color="#fff" />}
                            </span>
                            <span className={done ? "" : "text-muted"} style={{ fontSize: 13 }}>
                              {step}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {selected.validTill && selected.statusKey !== "lt" && (
                  <div className="mb-4">
                    <h6 className="mb-2">Reminder schedule</h6>
                    <Row className="g-2">
                      {[90, 60, 30, 7].map((d) => {
                        const date = new Date(selected.validTill.getTime() - d * 86400000);
                        const sent = date <= TODAY;
                        return (
                          <Col xs={6} sm={3} key={d}>
                            <div className="border rounded p-2 h-100">
                              <div className="fw-semibold" style={{ fontSize: 13 }}>
                                {d} days
                              </div>
                              <div className="text-muted" style={{ fontSize: 12 }}>
                                {formatDate(date)}
                              </div>
                              <div style={{ fontSize: 11, fontWeight: 600, color: sent ? "#1D5A41" : "#9AA39E" }}>
                                {sent ? "Sent" : "Scheduled"}
                              </div>
                            </div>
                          </Col>
                        );
                      })}
                    </Row>
                    <div className="text-muted mt-2" style={{ fontSize: 12 }}>
                      {/* Email + WhatsApp to owner and Centre Head; escalates to {selected.group === "Pharmacy" ? "Pharmacist-in-charge" : "Admin & Legal"} at 7 days and on expiry. */}
                    </div>
                  </div>
                )}

                {selected.documentVersion > 1 && selected.validTill && (
                  <div>
                    <h6 className="mb-2">Version history</h6>
                    <div className="d-flex flex-column gap-2">
                      {[selected.documentVersion, selected.documentVersion - 1].map((v, idx) => {
                        const to = new Date(selected.validTill.getTime() - idx * selected.termDays * 86400000);
                        const from = new Date(to.getTime() - selected.termDays * 86400000);
                        return (
                          <div
                            key={v}
                            className="d-flex justify-content-between align-items-center rounded p-2"
                            style={{
                              background: idx === 0 ? "#E4F1EA" : "#F8F9FA",
                              border: `1px solid ${idx === 0 ? "#CFE6DA" : "#E9ECEF"}`,
                            }}
                          >
                            <span style={{ fontSize: 13 }}>
                              v{v} · {formatDate(from)} → {formatDate(to)}
                            </span>
                            <span
                              className="px-2 py-1 rounded"
                              style={{
                                fontSize: 11,
                                fontWeight: 600,
                                background: idx === 0 ? "#1D5A41" : "#E9ECEF",
                                color: idx === 0 ? "#fff" : "#66706C",
                              }}
                            >
                              {idx === 0 ? "Current" : "Superseded"}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </CardBody>
            </Card>
          </Col>
        </Row>
    </div>
  );
};

export default CenterDetail;
