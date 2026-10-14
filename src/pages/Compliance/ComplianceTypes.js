import React, { useState } from "react";
import { Row, Col, Card, CardBody, Button, Badge } from "reactstrap";
import { useNavigate } from "react-router-dom";
import { Plus, Pencil } from "lucide-react";
import { getCategoryIcon, GROUP_COLORS } from "./icons";
import Pagination from "./Pagination";
import usePagination from "./usePagination";
import { CENTRES, DEFAULT_COMPLIANCE_TYPES } from "./data";

const PAGE_SIZE = 6;

const ComplianceTypes = () => {
  const navigate = useNavigate();
  const [types, setTypes] = useState(DEFAULT_COMPLIANCE_TYPES);
  const { page, setPage, pageCount, pageItems, totalCount, pageSize } = usePagination(
    types,
    PAGE_SIZE,
  );

  const toggleActive = (id) =>
    setTypes((prev) => prev.map((t) => (t.id === id ? { ...t, active: !t.active } : t)));

  const centreLabel = (type) => {
    if (type.applicableCentreIds.length === CENTRES.length) return "All centres";
    return type.applicableCentreIds
      .map((id) => CENTRES.find((c) => c.id === id)?.name)
      .filter(Boolean)
      .join(", ");
  };

  return (
    <div className="p-3 p-lg-4">
        <div className="d-flex flex-column flex-sm-row align-items-start align-items-sm-center justify-content-between gap-3 mb-3">
          <div>
            <h5 className="mb-1 fw-semibold">Compliance types</h5>
            <p className="text-muted mb-0 fs-13">
              Master list of licence categories tracked across centres. New types don&apos;t
              automatically create items for every centre — add them per centre from the centre
              register.
            </p>
          </div>
          <Button
            color="success"
            size="sm"
            className="text-white text-nowrap"
            onClick={() => navigate("/compliance/types/new")}
          >
            <Plus size={14} className="me-1" /> Add type
          </Button>
        </div>

        <div className="d-flex flex-column gap-2">
          {pageItems.map((type) => {
            const groupColor = GROUP_COLORS[type.group] || { bg: "#F1F2EF", fg: "#3E4A46" };
            const Icon = getCategoryIcon(type.id);
            return (
            <Card className={`shadow-sm mb-0 border-0 ${!type.active ? "opacity-75" : ""}`} key={type.id}>
              <CardBody>
                <Row className="align-items-center g-2">
                  <Col xs={12} md={5}>
                    <div className="d-flex align-items-center gap-2">
                      <span
                        className="d-inline-flex align-items-center justify-content-center rounded-circle flex-shrink-0"
                        style={{ width: 32, height: 32, background: groupColor.bg, color: groupColor.fg }}
                      >
                        <Icon size={15} />
                      </span>
                      <div>
                        <div className="d-flex align-items-center gap-2">
                          <span className="fw-semibold">{type.name}</span>
                          {!type.active && (
                            <Badge color="secondary" pill>
                              Inactive
                            </Badge>
                          )}
                        </div>
                        <div className="text-muted" style={{ fontSize: 12 }}>
                          {type.group} · {type.hasExpiry ? `${type.defaultLeadDays}d renewal lead` : "No expiry"}
                        </div>
                      </div>
                    </div>
                  </Col>
                  <Col xs={12} md={5}>
                    <div className="text-muted" style={{ fontSize: 13 }}>
                      {centreLabel(type)}
                    </div>
                  </Col>
                  <Col xs={12} md={2} className="d-flex justify-content-md-end gap-2">
                    <Button
                      color="light"
                      className="border"
                      size="sm"
                      onClick={() => navigate(`/compliance/types/${type.id}/edit`)}
                    >
                      <Pencil size={13} className="me-1" /> Edit
                    </Button>
                    <Button
                      color="light"
                      className="border"
                      size="sm"
                      onClick={() => toggleActive(type.id)}
                    >
                      {type.active ? "Deactivate" : "Activate"}
                    </Button>
                  </Col>
                </Row>
              </CardBody>
            </Card>
            );
          })}
        </div>

        <Pagination
          page={page}
          pageCount={pageCount}
          onChange={setPage}
          totalCount={totalCount}
          pageSize={pageSize}
        />
    </div>
  );
};

export default ComplianceTypes;
