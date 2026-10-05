import React, { useState, useEffect } from "react";
import DataTable from "react-data-table-component";
import { Button, Input, Label, Row, Col } from "reactstrap";
import { toast } from "react-toastify";
import { getAssetTags, createAssetTags } from "../../../../helpers/backend_helper";
import { useAuthError } from "../../../../Components/Hooks/useAuthError";
import { usePermissions } from "../../../../Components/Hooks/useRoles.js";
import "../../UnitOfMeasurement/uom.scss";

const dateFmt = (d) => (d ? new Date(d).toLocaleDateString("en-IN") : "—");

const STATUS_META = {
  available: { label: "Available", cls: "status-active" },
  used: { label: "Used", cls: "status-draft" },
  damaged: { label: "Damaged", cls: "status-blacklisted" },
};

const StatusPill = ({ status }) => {
  const s = STATUS_META[status] || STATUS_META.available;
  return (
    <span className={`uom-status-pill ${s.cls}`}>
      <span className="dot"></span> {s.label}
    </span>
  );
};

const AssetTag = () => {
  const handleAuthError = useAuthError();
  const token = JSON.parse(localStorage.getItem("micrologin"))?.token;
  const { hasPermission } = usePermissions(token);
  const canCreate = hasPermission("MASTERDATA", "ASSET_TAG", "WRITE");

  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [refreshFlag, setRefreshFlag] = useState(0);

  const [tagType, setTagType] = useState("temp");
  const [createAsBatch, setCreateAsBatch] = useState(false);
  const [batchCount, setBatchCount] = useState(10);
  const [epcCode, setEpcCode] = useState("");
  const [category, setCategory] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getAssetTags({ search })
      .then((res) => {
        if (!cancelled) setTags(res?.data || []);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [search, refreshFlag]);

  const handleSubmit = async () => {
    if (tagType === "fixed" && !createAsBatch && !epcCode.trim()) {
      return toast.error("Enter an EPC code for a FIXED (RFID) tag, or leave blank for a placeholder");
    }
    setSubmitting(true);
    try {
      const res = await createAssetTags({
        tagType,
        epcCode: tagType === "fixed" ? epcCode : undefined,
        category: category || undefined,
        batchCount: createAsBatch ? Number(batchCount) : 1,
        notes,
      });
      toast.success(res?.message || "Tag(s) created successfully");
      setEpcCode("");
      setCategory("");
      setNotes("");
      setRefreshFlag((f) => f + 1);
    } catch (error) {
      if (!handleAuthError(error)) {
        toast.error(error?.response?.data?.message || error?.message || "Something went wrong");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const columns = [
    { name: "Tag Code", selector: (row) => row.tagCode, sortable: true, width: "160px" },
    {
      name: "Type",
      width: "90px",
      cell: (row) => (
        <span className="text-uppercase small fw-semibold">
          {row.tagType === "fixed" ? "RFID" : "QR"}
        </span>
      ),
    },
    {
      name: "EPC Code",
      cell: (row) => <span className="uom-cell-muted small">{row.epcCode || "—"}</span>,
    },
    {
      name: "Category",
      cell: (row) => <span className="uom-cell-muted">{row.category || "Any category"}</span>,
    },
    { name: "Status", width: "120px", cell: (row) => <StatusPill status={row.status} /> },
    {
      name: "Batch",
      cell: (row) => <span className="uom-cell-muted small">{row.batchId || "—"}</span>,
    },
    {
      name: "Created",
      cell: (row) => <span className="uom-cell-muted">{dateFmt(row.createdAt)}</span>,
    },
  ];

  return (
    <div className="uom-page">
      <div className="uom-list-header">
        <div>
          <h4>Create Tags</h4>
          <p>TEMP tags feed GRN putaway · FIXED tags are permanent RFID</p>
        </div>
      </div>

      {canCreate && (
        <div className="uom-table-card p-4 mb-4">
          <h6 className="fw-semibold mb-3">Tag Configuration</h6>

          <Label>
            Tag Type <span className="text-danger">*</span>
          </Label>
          <div className="d-flex gap-2 mb-3">
            <Button
              color={tagType === "temp" ? "primary" : "light"}
              onClick={() => setTagType("temp")}
              style={{ flex: 1 }}
            >
              <div className="fw-semibold">TEMP</div>
              <div className="small" style={{ opacity: 0.8 }}>
                QR · putaway ready
              </div>
            </Button>
            <Button
              color={tagType === "fixed" ? "primary" : "light"}
              onClick={() => setTagType("fixed")}
              style={{ flex: 1 }}
            >
              <div className="fw-semibold">FIXED</div>
              <div className="small" style={{ opacity: 0.8 }}>
                RFID · requires EPC
              </div>
            </Button>
          </div>

          {tagType === "fixed" && (
            <>
              <Label>EPC Code (leave blank for a placeholder until hardware is scanned)</Label>
              <Input
                className="mb-3"
                value={epcCode}
                onChange={(e) => setEpcCode(e.target.value)}
                placeholder="24-digit hex, or leave blank"
              />
            </>
          )}

          <div className="form-check form-switch mb-3">
            <input
              className="form-check-input"
              type="checkbox"
              checked={createAsBatch}
              onChange={(e) => setCreateAsBatch(e.target.checked)}
              id="batchSwitch"
            />
            <label className="form-check-label" htmlFor="batchSwitch">
              Create as numbered batch (auto-increment series, max 1,000)
            </label>
          </div>

          {createAsBatch && (
            <Row>
              <Col md={4} className="mb-3">
                <Label>Batch Count</Label>
                <Input
                  type="number"
                  min={1}
                  max={1000}
                  value={batchCount}
                  onChange={(e) => setBatchCount(e.target.value)}
                />
              </Col>
            </Row>
          )}

          <Label>Category (optional — reserves this tag for a category)</Label>
          <Input
            className="mb-3"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder="Leave blank to keep usable for any category"
          />

          <Label>Notes</Label>
          <Input
            type="textarea"
            rows={2}
            className="mb-3"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Optional notes for this batch..."
          />

          <div className="text-muted small mb-3">
            TEMP tags are scanned during GRN putaway. After approval they move to Used and link to
            the putaway record automatically.
          </div>

          <Button color="primary" onClick={handleSubmit} disabled={submitting}>
            {submitting ? "Creating..." : createAsBatch ? "Create Batch" : "Create Tag"}
          </Button>
        </div>
      )}

      <div className="uom-search-wrap mb-3">
        <i className="bx bx-search"></i>
        <Input placeholder="Search tag code..." value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      <div className="uom-table-card">
        <DataTable
          columns={columns}
          data={tags}
          progressPending={loading}
          pagination
          highlightOnHover
          noDataComponent={<div className="uom-empty-state">No tags created yet</div>}
        />
      </div>
    </div>
  );
};

export default AssetTag;