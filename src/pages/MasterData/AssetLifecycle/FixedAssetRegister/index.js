import React, { useState, useEffect } from "react";
import DataTable from "react-data-table-component";
import { Button, Input, Modal, ModalBody } from "reactstrap";
import { toast } from "react-toastify";
import {
  getFixedAssets,
  getFixedAsset,
  updateFixedAsset,
  createFixedAsset,
  assignFixedAsset,
  returnFixedAsset,
  searchEmployeesForAsset,
} from "../../../../helpers/backend_helper";
import { useAuthError } from "../../../../Components/Hooks/useAuthError";
import { usePermissions } from "../../../../Components/Hooks/useRoles.js";
import "../../UnitOfMeasurement/uom.scss";

const dateFmt = (d) => (d ? new Date(d).toLocaleDateString("en-IN") : "—");
const money = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;

// Each category gets its own label for the identifier field
const ASSET_CATEGORIES = [
  { name: "Laptop", idLabel: "Serial number", idHint: "e.g. SN123456" },
  { name: "Phone", idLabel: "IMEI number", idHint: "15-digit IMEI" },
  { name: "SIM Card", idLabel: "SIM number", idHint: "SIM / mobile number" },
  { name: "Debit Card", idLabel: "Card number (last 4 digits)", idHint: "e.g. 4321" },
  { name: "Uniform", idLabel: "Size / details", idHint: "e.g. Size L, 2 sets" },
];

const STATUS_META = {
  active: {
    label: "Active",
    cls: "status-active",
    icon: "bx-check-circle",
    color: "#12b76a",
  },
  under_maintenance: {
    label: "Under Maintenance",
    cls: "status-draft",
    icon: "bx-wrench",
    color: "#f79009",
  },
  written_off: {
    label: "Written Off",
    cls: "status-blacklisted",
    icon: "bx-x-circle",
    color: "#f04438",
  },
};

const StatusPill = ({ status }) => {
  const s = STATUS_META[status] || STATUS_META.active;
  return (
    <span className={`uom-status-pill ${s.cls}`}>
      <span className="dot"></span> {s.label}
    </span>
  );
};

const FixedAssetRegister = () => {
  const handleAuthError = useAuthError();
  const token = JSON.parse(localStorage.getItem("micrologin"))?.token;
  const { hasPermission } = usePermissions(token);
  const canEdit = hasPermission("MASTERDATA", "FIXED_ASSET", "WRITE");

  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [refreshFlag, setRefreshFlag] = useState(0);
  const [catFilter, setCatFilter] = useState("ALL");
  const [assignFilter, setAssignFilter] = useState("ALL"); // ALL | assigned | in_stock

  const [detailModal, setDetailModal] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  // Add asset
  const EMPTY_FORM = {
    assetName: "",
    category: "",
    serialNumber: "",
    purchaseCost: "",
    purchaseDate: "",
    remarks: "",
  };
  const [addModal, setAddModal] = useState(false);
  const [addForm, setAddForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  // Assign / return
  const [empQuery, setEmpQuery] = useState("");
  const [empResults, setEmpResults] = useState([]);
  const [assignRemarks, setAssignRemarks] = useState("");
  const [returnCondition, setReturnCondition] = useState("good");
  const [returnRemarks, setReturnRemarks] = useState("");
  const [assigning, setAssigning] = useState(false);

  useEffect(() => {
    if (empQuery.trim().length < 2) {
      setEmpResults([]);
      return undefined;
    }
    const t = setTimeout(() => {
      searchEmployeesForAsset(empQuery.trim())
        .then((res) => setEmpResults(res?.data || []))
        .catch(() => setEmpResults([]));
    }, 400);
    return () => clearTimeout(t);
  }, [empQuery]);

  const fail = (error, fallback) => {
    if (!handleAuthError(error)) {
      toast.error(error?.response?.data?.message || error?.message || fallback);
    }
  };

  const openDetail = (row) => {
    setEmpQuery("");
    setEmpResults([]);
    setAssignRemarks("");
    setReturnCondition("good");
    setReturnRemarks("");
    setDetailModal(row);
    // The list does not carry the assignment history, so load the full record
    getFixedAsset(row._id)
      .then((res) => res?.data && setDetailModal(res.data))
      .catch(() => {});
  };

  const handleCreate = async () => {
    const f = addForm;
    if (!f.assetName.trim() || !f.category.trim() || f.purchaseCost === "" || !f.purchaseDate) {
      toast.error("Name, category, cost and purchase date are required");
      return;
    }
    setSaving(true);
    try {
      await createFixedAsset({
        ...f,
        purchaseCost: Number(f.purchaseCost),
      });
      toast.success("Asset added");
      setAddModal(false);
      setAddForm(EMPTY_FORM);
      setRefreshFlag((n) => n + 1);
    } catch (error) {
      fail(error, "Couldn't add asset.");
    } finally {
      setSaving(false);
    }
  };

  const handleAssign = async (asset, employee) => {
    setAssigning(true);
    try {
      await assignFixedAsset(asset._id, {
        employeeId: employee._id,
        remarks: assignRemarks,
      });
      toast.success(`Assigned to ${employee.name}`);
      setDetailModal(null);
      setRefreshFlag((n) => n + 1);
    } catch (error) {
      fail(error, "Couldn't assign.");
    } finally {
      setAssigning(false);
    }
  };

  const handleReturn = async (asset) => {
    setAssigning(true);
    try {
      await returnFixedAsset(asset._id, {
        condition: returnCondition,
        remarks: returnRemarks,
      });
      toast.success("Asset received back");
      setDetailModal(null);
      setRefreshFlag((n) => n + 1);
    } catch (error) {
      fail(error, "Couldn't mark as returned.");
    } finally {
      setAssigning(false);
    }
  };

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getFixedAssets({ search })
      .then((res) => {
        if (!cancelled) setAssets(res?.data || []);
      })
      .catch((error) => {
        if (cancelled) return;
        if (!handleAuthError(error)) {
          toast.error(
            error?.response?.data?.message ||
              error?.message ||
              "Couldn't load assets.",
          );
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, refreshFlag]);

  const handleStatusChange = async (asset, newStatus) => {
    if (asset.status === newStatus) return;
    setUpdatingStatus(true);
    try {
      const res = await updateFixedAsset(asset._id, { status: newStatus });
      toast.success("Asset status updated");
      // The update response has no populated employee / history, so reload the full record
      const full = await getFixedAsset(asset._id).catch(() => null);
      setDetailModal(full?.data || res?.data || { ...asset, status: newStatus });
      setRefreshFlag((f) => f + 1);
    } catch (error) {
      if (!handleAuthError(error)) {
        toast.error(
          error?.response?.data?.message ||
            error?.message ||
            "Couldn't update.",
        );
      }
    } finally {
      setUpdatingStatus(false);
    }
  };

  const visible = assets.filter(
    (a) =>
      (catFilter === "ALL" || a.category === catFilter) &&
      (assignFilter === "ALL" ||
        (assignFilter === "assigned" ? !!a.assignedTo : !a.assignedTo)),
  );
  const stats = [
    { label: "Total assets", value: assets.length },
    { label: "In stock", value: assets.filter((a) => !a.assignedTo && a.status === "active").length },
    { label: "Assigned", value: assets.filter((a) => a.assignedTo).length },
    { label: "Under maintenance", value: assets.filter((a) => a.status === "under_maintenance").length },
  ];

  const columns = [
    {
      name: "Asset",
      sortable: true,
      sortFunction: (x, y) => x.assetName.localeCompare(y.assetName),
      minWidth: "280px",
      cell: (row) => {
        return (
          <div className="py-2">
            <div style={{ minWidth: 0 }}>
              <div className="fw-semibold text-truncate">{row.assetName}</div>
              <div className="text-muted" style={{ fontSize: 12, fontFamily: "monospace" }}>
                {row.assetTag}
                {row.serialNumber ? ` · ${row.serialNumber}` : ""}
              </div>
            </div>
          </div>
        );
      },
    },
    {
      name: "Category",
      sortable: true,
      selector: (row) => row.category,
      width: "130px",
      cell: (row) => (
        <span
          style={{ background: "#f5f6fa", color: "#495057", fontSize: 12, fontWeight: 600, padding: "3px 10px", borderRadius: 999 }}
        >
          {row.category}
        </span>
      ),
    },
    {
      name: "Assigned To",
      minWidth: "200px",
      cell: (row) =>
        row.assignedTo ? (
          <div>
            <div style={{ lineHeight: 1.2 }}>
              <div className="fw-semibold" style={{ fontSize: 13 }}>{row.assignedTo.name}</div>
              <div className="text-muted" style={{ fontSize: 11 }}>
                {row.assignedTo.eCode} · since {dateFmt(row.assignedAt)}
              </div>
            </div>
          </div>
        ) : (
          <span className="text-muted" style={{ fontSize: 13 }}>
            In stock
          </span>
        ),
    },
    {
      name: "Site",
      selector: (row) => row.centerId?.title || "",
      sortable: true,
      cell: (row) => (
        <span className="uom-cell-muted">{row.centerId?.title || "—"}</span>
      ),
    },
    {
      name: "Purchased",
      selector: (row) => row.purchaseDate,
      sortable: true,
      width: "120px",
      cell: (row) => (
        <span className="uom-cell-muted">{dateFmt(row.purchaseDate)}</span>
      ),
    },
    {
      name: "Cost",
      selector: (row) => row.purchaseCost,
      sortable: true,
      right: true,
      width: "120px",
      cell: (row) => (
        <span className="uom-cell-primary">{money(row.purchaseCost)}</span>
      ),
    },
    {
      name: "Status",
      width: "170px",
      cell: (row) => <StatusPill status={row.status} />,
    },
    {
      name: "",
      width: "90px",
      right: true,
      cell: (row) => (
        <Button size="sm" color="light" onClick={() => openDetail(row)}>
          View
        </Button>
      ),
    },
  ];

  return (
    <div className="uom-page">
      <div className="uom-list-header">
        <div>
          <h4>Fixed Assets Register</h4>
          <p>
            Permanent record of every capitalized asset — cost, location, and
            status
          </p>
        </div>
        {canEdit && (
          <Button color="primary" onClick={() => setAddModal(true)}>
            Add Asset
          </Button>
        )}
      </div>

      {/* Summary */}
      <div
        className="d-grid gap-3 mb-4"
        style={{ gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))" }}
      >
        {stats.map((st) => (
          <div
            key={st.label}
            className="p-3"
            style={{ border: "1px solid #eef0f3", borderRadius: 12, background: "#fff" }}
          >
            <div>
              <div className="fs-4 fw-bold" style={{ lineHeight: 1.1 }}>{st.value}</div>
              <div className="text-muted" style={{ fontSize: 12 }}>{st.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="d-flex flex-wrap align-items-center gap-3 mb-3">
        <div className="uom-search-wrap" style={{ maxWidth: 300 }}>
          <i className="bx bx-search"></i>
          <Input
            placeholder="Search name, tag or serial..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="d-flex flex-wrap gap-2">
          {["ALL", ...ASSET_CATEGORIES.map((c) => c.name)].map((name) => {
            const on = catFilter === name;
            return (
              <button
                key={name}
                type="button"
                onClick={() => setCatFilter(name)}
                style={{
                  border: `1px solid ${on ? "#4f46e5" : "#e5e7eb"}`,
                  background: on ? "#eef2ff" : "#fff",
                  color: on ? "#4f46e5" : "#495057",
                  borderRadius: 999,
                  padding: "4px 14px",
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                {name === "ALL" ? "All" : name}
              </button>
            );
          })}
        </div>
        <Input
          type="select"
          style={{ width: 160 }}
          className="ms-md-auto"
          value={assignFilter}
          onChange={(e) => setAssignFilter(e.target.value)}
        >
          <option value="ALL">All assets</option>
          <option value="assigned">Assigned</option>
          <option value="in_stock">In stock</option>
        </Input>
      </div>

      <div className="uom-table-card">
        <DataTable
          columns={columns}
          data={visible}
          progressPending={loading}
          pagination
          highlightOnHover
          pointerOnHover
          onRowClicked={openDetail}
          customStyles={{
            headCells: {
              style: {
                backgroundColor: "#f8f9fa",
                fontWeight: 600,
                fontSize: 12,
                textTransform: "uppercase",
                letterSpacing: 0.3,
                color: "#6c757d",
              },
            },
            rows: { style: { minHeight: 62 } },
          }}
          noDataComponent={
            <div className="uom-empty-state">
              <p className="uom-empty-title">
                {assets.length === 0 ? "No assets registered yet" : "No assets match these filters"}
              </p>
              <p className="uom-empty-sub">
                {assets.length === 0
                  ? "Add an asset (laptop, phone, SIM...) or capitalize one from Asset Capitalization."
                  : "Try a different category or clear the search."}
              </p>
            </div>
          }
        />
      </div>

      {/* Detail Modal */}
      <Modal
        isOpen={!!detailModal}
        toggle={() => setDetailModal(null)}
        centered
        size="lg"
      >
        <ModalBody className="p-0">
          {detailModal && (() => {
            const d = detailModal;
            const cat = ASSET_CATEGORIES.find((c) => c.name === d.category);
            const sectionTitle = {
              fontSize: 12,
              fontWeight: 600,
              letterSpacing: 0.3,
              color: "#6c757d",
            };
            const history = [...(d.assignmentHistory || [])].reverse();
            const idLabel = cat?.idLabel || "Serial / IMEI / SIM";
            const Field = ({ label, value }) => (
              <div className="col-sm-6">
                <div className="text-muted" style={{ fontSize: 12 }}>{label}</div>
                <div className="fw-semibold" style={{ fontSize: 14 }}>{value}</div>
              </div>
            );
            return (
              <>
                {/* Header */}
                <div
                  className="d-flex align-items-center gap-3 p-4"
                  style={{ borderBottom: "1px solid #f1f3f5" }}
                >
                  <div className="flex-grow-1">
                    <h5 className="mb-1">{d.assetName}</h5>
                    <div className="d-flex align-items-center gap-2 flex-wrap">
                      <span
                        className="text-muted"
                        style={{ fontFamily: "monospace", fontSize: 13, background: "#f5f6fa", padding: "2px 8px", borderRadius: 6 }}
                      >
                        {d.assetTag}
                      </span>
                      <StatusPill status={d.status} />
                    </div>
                  </div>
                  <div className="text-end">
                    <div className="text-muted" style={{ fontSize: 12 }}>Purchase Cost</div>
                    <div className="fs-4 fw-bold text-primary">{money(d.purchaseCost)}</div>
                  </div>
                  <button type="button" className="btn-close ms-2" aria-label="Close" onClick={() => setDetailModal(null)} />
                </div>

                <div className="p-4">
                  {/* Who has it */}
                  <div
                    className="p-3 mb-4"
                    style={{
                      borderRadius: 10,
                      border: `1px solid ${d.assignedTo ? "#c7d2fe" : "#d1fadf"}`,
                      background: d.assignedTo ? "#eef2ff" : "#ecfdf3",
                    }}
                  >
                    <div>
                      <div className="text-muted" style={{ fontSize: 12 }}>Currently with</div>
                      <div className="fw-semibold">
                        {d.assignedTo
                          ? `${d.assignedTo.name} (${d.assignedTo.eCode})`
                          : "In stock, not assigned to anyone"}
                      </div>
                      {d.assignedTo && (
                        <div className="text-muted" style={{ fontSize: 12 }}>
                          Since {dateFmt(d.assignedAt)}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Details */}
                  <div style={sectionTitle} className="mb-2">DETAILS</div>
                  <div className="row g-3 mb-4">
                    <Field label="Category" value={d.category} />
                    <Field label={idLabel} value={d.serialNumber || "—"} />
                    <Field label="Purchase Date" value={dateFmt(d.purchaseDate)} />
                    <Field label="Site" value={d.centerId?.title || "—"} />
                    {d.storageLocationId && (
                      <Field
                        label="Location"
                        value={`${d.storageLocationId?.name || ""} (${d.storageLocationId?.code || ""})`}
                      />
                    )}
                    <div className="col-12">
                      <Field label="Remarks" value={d.remarks || "—"} />
                    </div>
                  </div>

                  {/* Assign / return */}
                  {canEdit && d.status !== "written_off" && (
                    <div className="mb-4">
                      <div style={sectionTitle} className="mb-2">
                        {d.assignedTo ? "TAKE BACK FROM EMPLOYEE" : "ASSIGN TO EMPLOYEE"}
                      </div>
                      <div className="p-3" style={{ border: "1px solid #e5e7eb", borderRadius: 10 }}>
                        {d.assignedTo ? (
                          <div className="row g-2 align-items-end">
                            <div className="col-md-4">
                              <label className="mb-1 text-muted" style={{ fontSize: 12 }}>Condition</label>
                              <Input type="select" value={returnCondition} onChange={(e) => setReturnCondition(e.target.value)}>
                                <option value="good">Good</option>
                                <option value="needs_repair">Needs repair</option>
                                <option value="damaged">Damaged</option>
                                <option value="lost">Lost</option>
                              </Input>
                            </div>
                            <div className="col-md-5">
                              <label className="mb-1 text-muted" style={{ fontSize: 12 }}>Remarks</label>
                              <Input placeholder="Optional" value={returnRemarks} onChange={(e) => setReturnRemarks(e.target.value)} />
                            </div>
                            <div className="col-md-3">
                              <Button color="success" className="w-100" disabled={assigning} onClick={() => handleReturn(d)}>
                                Receive
                              </Button>
                            </div>
                          </div>
                        ) : d.status === "active" ? (
                          <>
                            <div className="row g-2">
                              <div className="col-md-7">
                                <div className="input-group">
                                                                    <Input
                                    placeholder="Search employee by name or code..."
                                    value={empQuery}
                                    onChange={(e) => setEmpQuery(e.target.value)}
                                  />
                                </div>
                              </div>
                              <div className="col-md-5">
                                <Input placeholder="Remarks (optional)" value={assignRemarks} onChange={(e) => setAssignRemarks(e.target.value)} />
                              </div>
                            </div>
                            {empQuery.trim().length >= 2 && empResults.length === 0 && (
                              <div className="text-muted mt-2" style={{ fontSize: 13 }}>No employee found</div>
                            )}
                            {empResults.length > 0 && (
                              <div className="mt-2" style={{ maxHeight: 170, overflowY: "auto", border: "1px solid #f1f3f5", borderRadius: 8 }}>
                                {empResults.map((emp) => (
                                  <div
                                    key={emp._id}
                                    className="d-flex justify-content-between align-items-center px-3 py-2"
                                    style={{ borderBottom: "1px solid #f8f9fa" }}
                                  >
                                    <div>
                                      <span className="fw-semibold" style={{ fontSize: 13 }}>{emp.name}</span>
                                      <span className="text-muted ms-2" style={{ fontSize: 12 }}>{emp.eCode}</span>
                                    </div>
                                    <Button size="sm" color="primary" disabled={assigning} onClick={() => handleAssign(d, emp)}>
                                      Assign
                                    </Button>
                                  </div>
                                ))}
                              </div>
                            )}
                          </>
                        ) : (
                          <span className="text-muted" style={{ fontSize: 13 }}>
                            Only an active asset can be assigned.
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* History */}
                  <div style={sectionTitle} className="mb-2">ASSIGNMENT HISTORY</div>
                  {history.length === 0 ? (
                    <div className="text-muted mb-4" style={{ fontSize: 13 }}>
                      This asset has not been assigned yet.
                    </div>
                  ) : (
                    <div className="mb-4" style={{ borderLeft: "2px solid #e5e7eb", marginLeft: 6 }}>
                      {history.map((h) => (
                        <div key={h._id} className="ps-3 pb-3 position-relative">
                          <span
                            style={{
                              position: "absolute", left: -6, top: 4, width: 10, height: 10, borderRadius: "50%",
                              background: h.returnedAt ? "#12b76a" : "#4f46e5",
                            }}
                          />
                          <div className="fw-semibold" style={{ fontSize: 13 }}>
                            {h.employeeId?.name || "Employee"}{" "}
                            <span className="text-muted fw-normal">{h.employeeId?.eCode}</span>
                          </div>
                          <div className="text-muted" style={{ fontSize: 12 }}>
                            Given {dateFmt(h.assignedAt)}
                            {h.returnedAt
                              ? ` · Returned ${dateFmt(h.returnedAt)} (${String(h.returnCondition || "good").replace("_", " ")})`
                              : " · Still with employee"}
                          </div>
                          {h.remarks && (
                            <div className="text-muted" style={{ fontSize: 12 }}>{h.remarks}</div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Status */}
                  {canEdit && (
                    <>
                      <div style={sectionTitle} className="mb-2">UPDATE STATUS</div>
                      <div className="d-flex gap-2 flex-wrap">
                        {Object.entries(STATUS_META).map(([key, meta]) => (
                          <Button
                            key={key}
                            size="sm"
                            outline={d.status !== key}
                            style={
                              d.status === key
                                ? { backgroundColor: meta.color, borderColor: meta.color, color: "#fff" }
                                : { borderColor: meta.color, color: meta.color }
                            }
                            disabled={updatingStatus || d.status === key}
                            onClick={() => handleStatusChange(d, key)}
                          >
                            {meta.label}
                          </Button>
                        ))}
                      </div>
                    </>
                  )}
                </div>

                <div
                  className="d-flex justify-content-end px-4 py-3"
                  style={{ background: "#fafbfc", borderTop: "1px solid #f1f3f5" }}
                >
                  <Button color="light" onClick={() => setDetailModal(null)}>Close</Button>
                </div>
              </>
            );
          })()}
        </ModalBody>
      </Modal>
      <Modal isOpen={addModal} toggle={() => setAddModal(false)} centered size="lg">
        <ModalBody className="p-0">
          {(() => {
            const cat = ASSET_CATEGORIES.find((c) => c.name === addForm.category);
            const label = { fontSize: 12, fontWeight: 600, color: "#495057" };
            const set = (key) => (e) =>
              setAddForm((f) => ({ ...f, [key]: e.target.value }));
            return (
              <>
                {/* Header */}
                <div
                  className="d-flex align-items-center gap-3 p-4"
                  style={{ borderBottom: "1px solid #f1f3f5" }}
                >
                  <div className="flex-grow-1">
                    <h5 className="mb-0">Add Asset</h5>
                    <div className="text-muted" style={{ fontSize: 13 }}>
                      Register an item that can be given to an employee
                    </div>
                  </div>
                  <button
                    type="button"
                    className="btn-close"
                    aria-label="Close"
                    onClick={() => setAddModal(false)}
                  />
                </div>

                <div className="p-4">
                  {/* Category tiles */}
                  <div style={label} className="mb-2">
                    WHAT ARE YOU ADDING? <span className="text-danger">*</span>
                  </div>
                  <div
                    className="d-grid gap-2 mb-4"
                    style={{ gridTemplateColumns: "repeat(auto-fit, minmax(110px, 1fr))" }}
                  >
                    {ASSET_CATEGORIES.map((c) => {
                      const active = addForm.category === c.name;
                      return (
                        <button
                          key={c.name}
                          type="button"
                          onClick={() => setAddForm((f) => ({ ...f, category: c.name }))}
                          className="d-flex align-items-center justify-content-center py-3"
                          style={{
                            borderRadius: 10,
                            cursor: "pointer",
                            border: `1.5px solid ${active ? "#4f46e5" : "#e5e7eb"}`,
                            background: active ? "#eef2ff" : "#fff",
                            color: active ? "#4f46e5" : "#495057",
                            fontWeight: 600,
                            fontSize: 13,
                            transition: "all .15s",
                          }}
                        >
                          {c.name}
                        </button>
                      );
                    })}
                  </div>

                  {/* Fields */}
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="mb-1" style={label}>
                        Asset name <span className="text-danger">*</span>
                      </label>
                      <Input
                        placeholder={cat ? `e.g. ${cat.name === "Laptop" ? "Dell Latitude 5420" : cat.name === "Phone" ? "Samsung Galaxy A15" : cat.name === "SIM Card" ? "Airtel corporate SIM" : cat.name === "Debit Card" ? "HDFC Debit Card" : "Staff uniform set"}` : "Asset name"}
                        value={addForm.assetName}
                        onChange={set("assetName")}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="mb-1" style={label}>
                        {cat ? cat.idLabel : "Serial / IMEI / SIM no."}
                      </label>
                      <Input
                        placeholder={cat ? cat.idHint : "Pick a category first"}
                        value={addForm.serialNumber}
                        onChange={set("serialNumber")}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="mb-1" style={label}>
                        Cost <span className="text-danger">*</span>
                      </label>
                      <div className="input-group">
                        <span className="input-group-text">₹</span>
                        <Input
                          type="number"
                          min={0}
                          placeholder="0"
                          value={addForm.purchaseCost}
                          onChange={set("purchaseCost")}
                        />
                      </div>
                    </div>
                    <div className="col-md-6">
                      <label className="mb-1" style={label}>
                        Purchase date <span className="text-danger">*</span>
                      </label>
                      <Input
                        type="date"
                        value={addForm.purchaseDate}
                        onChange={set("purchaseDate")}
                      />
                    </div>
                    <div className="col-12">
                      <label className="mb-1" style={label}>Remarks</label>
                      <Input
                        type="textarea"
                        rows={2}
                        placeholder="Anything worth noting (optional)"
                        value={addForm.remarks}
                        onChange={set("remarks")}
                      />
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div
                  className="d-flex justify-content-end gap-2 px-4 py-3"
                  style={{ background: "#fafbfc", borderTop: "1px solid #f1f3f5" }}
                >
                  <Button color="light" onClick={() => setAddModal(false)}>
                    Cancel
                  </Button>
                  <Button color="primary" disabled={saving} onClick={handleCreate}>
                    {saving ? "Saving..." : "Add Asset"}
                  </Button>
                </div>
              </>
            );
          })()}
        </ModalBody>
      </Modal>
    </div>
  );
};

export default FixedAssetRegister;
