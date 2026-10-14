import React, { useMemo, useState } from "react";
import { Card, CardBody, Row, Col, Button, Input } from "reactstrap";
import { useNavigate } from "react-router-dom";
import DataTableComponent from "../../../Components/Common/DataTable";
import Select from "react-select";
import { Eye } from "lucide-react";
import StatusBadge from "../components/StatusBadge";
import ItemDetailModal from "../components/ItemDetailModal";
import { CENTRES, ITEMS, formatDate } from "../data";

const getIssuedOn = (item) =>
  item.validTill && item.termDays ? new Date(item.validTill.getTime() - item.termDays * 86400000) : null;

const ATTENTION_KEYS = ["expired", "due30", "due90", "renewal", "missing"];

const STATUS_OPTIONS = [
  { value: "attention", label: "Needs attention" },
  { value: "all", label: "All" },
  { value: "expired", label: "Expired" },
  { value: "due30", label: "Due ≤30 days" },
  { value: "due90", label: "Due ≤90 days" },
  { value: "renewal", label: "In renewal" },
  { value: "missing", label: "Doc missing" },
  { value: "valid", label: "Valid" },
  { value: "lt", label: "No expiry" },
];

const Register = () => {
  const navigate = useNavigate();
  const [centreFilter, setCentreFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("attention");
  const [query, setQuery] = useState("");
  const [detailItem, setDetailItem] = useState(null);

  const rows = useMemo(() => {
    return ITEMS.filter((i) => i.statusKey !== "na")
      .filter((i) => centreFilter === "all" || i.centreId === centreFilter)
      .filter((i) =>
        statusFilter === "attention"
          ? ATTENTION_KEYS.includes(i.statusKey)
          : statusFilter === "all" || i.statusKey === statusFilter,
      )
      .filter((i) => {
        if (!query) return true;
        const t = `${i.categoryName} ${i.licenceNo || ""} ${i.centreName}`.toLowerCase();
        return t.includes(query.toLowerCase());
      })
      .sort((a, b) => (a.daysLeft ?? 99999) - (b.daysLeft ?? 99999));
  }, [centreFilter, statusFilter, query]);

  const actionCta = (item) =>
    item.statusKey === "missing" ? "Upload document" : item.statusKey === "renewal" ? "Update status" : "Start renewal";

  const goToUpload = (item) =>
    navigate(`/compliance/upload?centre=${item.centreId}&category=${item.categoryId}`);

  const columns = [
    {
      name: <div>Compliance item</div>,
      cell: (row) => (
        <div className="py-1">
          <div className="fw-medium">{row.categoryName}</div>
          <div className="text-muted" style={{ fontSize: 12, fontFamily: "monospace" }}>
            {row.licenceNo || "—"}
          </div>
        </div>
      ),
      wrap: true,
      minWidth: "190px",
    },
    {
      name: <div>Centre</div>,
      selector: (row) => row.centreName,
      wrap: true,
      minWidth: "110px",
    },
    {
      name: <div>Issued on</div>,
      selector: (row) => {
        const issuedOn = getIssuedOn(row);
        return issuedOn ? formatDate(issuedOn) : "—";
      },
      wrap: true,
      minWidth: "110px",
    },
    {
      name: <div>Valid till</div>,
      selector: (row) => (row.validTill ? formatDate(row.validTill) : "—"),
      wrap: true,
      minWidth: "110px",
    },
    {
      name: <div>Days left</div>,
      selector: (row) =>
        row.daysLeft == null ? "—" : row.daysLeft < 0 ? `${Math.abs(row.daysLeft)}d overdue` : `${row.daysLeft}d`,
      sortable: true,
      wrap: true,
      minWidth: "100px",
    },
    {
      name: <div>Status</div>,
      cell: (row) => <StatusBadge statusKey={row.statusKey} />,
      wrap: true,
      minWidth: "110px",
    },
    {
      name: <div>Actions</div>,
      cell: (row) => (
        <div className="d-flex align-items-center gap-2">
          <Button color="light" className="border p-2" size="sm" onClick={() => setDetailItem(row)}>
            <Eye size={14} />
          </Button>
          <Button color="link" size="sm" className="p-0" onClick={() => goToUpload(row)}>
            {actionCta(row)}
          </Button>
        </div>
      ),
      ignoreRowClick: true,
      allowOverflow: true,
      button: true,
      minWidth: "170px",
    },
  ];

  return (
    <div className="p-3 p-lg-4">
      <div className="d-flex flex-column flex-sm-row align-items-start align-items-sm-center justify-content-between gap-3 mb-3">
        <div>
          <h5 className="mb-1 fw-semibold">Register</h5>
          <p className="text-muted mb-0 fs-13">
            Track every licence, NOC and registration across centres. {rows.length} of{" "}
            {ITEMS.filter((i) => i.statusKey !== "na").length} items match.
          </p>
        </div>
      </div>

      {/* Filters */}
      <Card className="mb-3 shadow-sm border-0" style={{ borderRadius: "0 0 8px 8px" }}>
        <CardBody className="py-3">
          <Row className="g-2 align-items-center">
            <Col sm={6} md={4} lg={3}>
              <Select
                classNamePrefix="react-select"
                options={[{ value: "all", label: "All centres" }, ...CENTRES.map((c) => ({ value: c.id, label: c.name }))]}
                value={
                  centreFilter === "all"
                    ? { value: "all", label: "All centres" }
                    : { value: centreFilter, label: CENTRES.find((c) => c.id === centreFilter)?.name }
                }
                onChange={(option) => setCentreFilter(option?.value || "all")}
              />
            </Col>
            <Col sm={6} md={4} lg={3}>
              <Select
                classNamePrefix="react-select"
                options={STATUS_OPTIONS}
                value={STATUS_OPTIONS.find((o) => o.value === statusFilter)}
                onChange={(option) => setStatusFilter(option?.value || "attention")}
              />
            </Col>
            <Col md={4} lg={6}>
              <Input
                type="search"
                bsSize="sm"
                placeholder="Search item or licence no."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </Col>
          </Row>
        </CardBody>
      </Card>

      {/* Table */}
      <Card className="shadow-sm border-0">
        <CardBody className="p-0">
          <DataTableComponent
            columns={columns}
            data={rows}
            noDataComponent="No items match these filters."
          />
        </CardBody>
      </Card>

      <ItemDetailModal
        isOpen={!!detailItem}
        toggle={() => setDetailItem(null)}
        item={detailItem}
      />
    </div>
  );
};

export default Register;
