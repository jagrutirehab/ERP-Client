import React, { useEffect, useRef, useState } from "react";
import { Card, CardBody, Row, Col, Button, Input } from "reactstrap";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import Select from "react-select";
import { Eye } from "lucide-react";
import DataTableComponent from "../../../Components/Common/DataTable";
import RefreshButton from "../../../Components/Common/RefreshButton";
import ConfirmationModal from "../../../Components/Common/ConfirmationModal";
import StatusBadge from "../components/StatusBadge";
import RenewalBadge from "../components/RenewalBadge";
import ItemDetailModal from "../components/ItemDetailModal";
import {
  getComplianceRecordById,
  markComplianceInRenewal,
} from "../../../helpers/backend_helper";
import { fetchComplianceRecords } from "../../../store/features/compliance/complianceSlice";
import { useCenterOptions } from "../../../Components/Hooks/useCenterOptions";
import { useAuthError } from "../../../Components/Hooks/useAuthError";
import { usePermissions } from "../../../Components/Hooks/useRoles";
import CheckPermission from "../../../Components/HOC/CheckPermission";

// Backend status -> key used by StatusBadge (colours/labels live in data.js STATUS)
export const STATUS_KEY = {
  VALID: "valid",
  DUE_30: "due30",
  DUE_90: "due90",
  EXPIRED: "expired",
  IN_RENEWAL: "renewal",
  DOC_MISSING: "missing",
  NO_EXPIRY: "lt",
};

// Filter chip -> what the API expects
const STATUS_OPTIONS = [
  { value: "NEEDS_ATTENTION", label: "Needs attention" },
  { value: "ALL", label: "All" },
  { value: "EXPIRED", label: "Expired" },
  { value: "DUE_30", label: "Due ≤30 days" },
  { value: "DUE_90", label: "Due ≤90 days" },
  { value: "IN_RENEWAL", label: "In renewal" },
  { value: "VALID", label: "Valid" },
  { value: "NO_EXPIRY", label: "No expiry" },
];

const centreLabel = (c) => c?.displayName || c?.title || c?.name || "—";
const formatDate = (d) =>
  d ? new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—";
const daysLabel = (n) => (n == null ? "—" : n < 0 ? `${Math.abs(n)}d overdue` : `${n}d`);

const Register = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const handleAuthError = useAuthError();
  const microUser = localStorage.getItem("micrologin");
  const token = microUser ? JSON.parse(microUser).token : null;
  const { roles } = usePermissions(token);
  const { records, recordsLoading, recordsTotal, recordsOverallTotal } = useSelector(
    (state) => state.Compliance,
  );
  const user = useSelector((state) => state.User);
  const centreOptions = useCenterOptions();

  const [centreFilter, setCentreFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("NEEDS_ATTENTION");
  const [query, setQuery] = useState("");
  const [detailId, setDetailId] = useState(null);
  const [startingRenewalId, setStartingRenewalId] = useState(null);
  const [markingId, setMarkingId] = useState(null);
  const [confirmingRow, setConfirmingRow] = useState(null);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [debouncedQuery, setDebouncedQuery] = useState("");

  const requestRef = useRef(null);

  const loadRecords = async () => {
    requestRef.current?.abort();
    const centerParam =
      centreFilter === "ALL"
        ? (user?.centerAccess || []).map((c) => c?._id || c).join(",")
        : centreFilter;
    const promise = dispatch(
      fetchComplianceRecords({
        center: centerParam,
        status: statusFilter,
        search: debouncedQuery.trim() || undefined,
        page,
        limit,
      }),
    );
    requestRef.current = promise;
    try {
      await promise.unwrap();
    } catch (error) {
      if (error?.aborted) return;
      if (!handleAuthError(error)) {
        toast.error(error?.message || "Failed to load register");
      }
    }
  };

  useEffect(() => {
    if (centreFilter !== "ALL" && !user?.centerAccess?.includes(centreFilter)) {
      setCentreFilter("ALL");
      setPage(1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.centerAccess]);

  // page, limit, any filter, or the user's centre access: reload from the server
  useEffect(() => {
    loadRecords();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [centreFilter, statusFilter, page, limit, debouncedQuery, user?.centerAccess]);

  // search: wait until typing stops, then go back to page 1
  const firstSearch = useRef(true);
  useEffect(() => {
    if (firstSearch.current) {
      firstSearch.current = false;
      return;
    }
    const t = setTimeout(() => {
      setDebouncedQuery(query);
      setPage(1);
    }, 500);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  const actionCta = (row) =>
    row.status === "DOC_MISSING" ? "Upload document" : row.status === "IN_RENEWAL" ? "Update status" : "Start renewal";

  // The list row is minimal (no owner/escalateTo/issuingAuthority — see
  // LIST_FIELDS server-side), so fetch the full record on click and prefill
  // from that instead of whatever happens to already be on the row.
  const goToUpload = async (row) => {
    setStartingRenewalId(row._id);
    try {
      const res = await getComplianceRecordById(row._id);
      const full = res?.data || {};
      navigate(`/compliance/upload?centre=${row.center?._id || ""}&type=${row.complianceType?._id || ""}`, {
        state: {
          prefill: {
            licenceNumber: full.licenceNumber,
            issuingAuthority: full.issuingAuthority,
            owner: full.responsibleOwner,
            escalateTo: full.escalateTo,
          },
        },
      });
    } catch (error) {
      if (!handleAuthError(error)) {
        toast.error(error?.response?.data?.message || error?.message || "Failed to load item details");
      }
    } finally {
      setStartingRenewalId(null);
    }
  };

  const handleMarkInRenewal = async () => {
    if (!confirmingRow) return;
    const row = confirmingRow;
    setMarkingId(row._id);
    try {
      const res = await markComplianceInRenewal(row._id);
      toast.success(res?.message || "Marked as applied for renewal.");
      setConfirmingRow(null);
      loadRecords();
    } catch (error) {
      if (!handleAuthError(error)) {
        toast.error(error?.response?.data?.message || error?.message || "Failed to mark as applied for renewal");
      }
    } finally {
      setMarkingId(null);
    }
  };

  const columns = [
    {
      name: <div>Compliance item</div>,
      cell: (row) => (
        <div className="py-1">
          <div className="fw-medium text-capitalize">{row.complianceType?.name || "—"}</div>
          <div className="text-muted" style={{ fontSize: 12, fontFamily: "monospace" }}>
            {row.licenceNumber || "—"}
          </div>
        </div>
      ),
      wrap: true,
      minWidth: "190px",
    },
    {
      name: <div>Centre</div>,
      selector: (row) => centreLabel(row.center),
      wrap: true,
      minWidth: "110px",
    },
    {
      name: <div>Issued on</div>,
      selector: (row) => formatDate(row.issueDate),
      wrap: true,
      minWidth: "110px",
    },
    {
      name: <div>Valid till</div>,
      selector: (row) => (row.noExpiry ? "No expiry" : formatDate(row.expiryDate)),
      wrap: true,
      minWidth: "110px",
    },
    {
      name: <div>Days left</div>,
      selector: (row) => (row.daysLeft == null ? 99999 : row.daysLeft),
      format: (row) => daysLabel(row.daysLeft),
      sortable: true,
      wrap: true,
      minWidth: "100px",
    },
    {
      name: <div>Status</div>,
      cell: (row) => (
        <div className="d-flex flex-wrap align-items-center gap-1">
          <StatusBadge statusKey={STATUS_KEY[row.status]} />
          <RenewalBadge inRenewal={row.inRenewal} />
        </div>
      ),
      wrap: true,
      minWidth: "120px",
    },
    {
      name: <div>Actions</div>,
      cell: (row) => (
        <div className="d-flex flex-wrap align-items-center gap-2">
          <button
            type="button"
            className="btn btn-sm btn-outline-primary"
            onClick={() => setDetailId(row._id)}
            title="View"
          >
            <Eye size={14} />
          </button>
          <CheckPermission accessRolePermission={roles?.permissions} subAccess="REGISTER" permission="edit">
            <Button
              color="success"
              className="text-white text-nowrap"
              size="sm"
              disabled={startingRenewalId === row._id}
              onClick={() => goToUpload(row)}
            >
              {startingRenewalId === row._id ? "Loading..." : actionCta(row)}
            </Button>
            {!row.noExpiry && row.status !== "DOC_MISSING" && !row.inRenewal && (
              <Button
                color="secondary"
                outline
                className="text-nowrap"
                size="sm"
                disabled={markingId === row._id}
                onClick={() => setConfirmingRow(row)}
              >
                {markingId === row._id ? "Marking..." : "Apply for renewal"}
              </Button>
            )}
          </CheckPermission>
        </div>
      ),
      ignoreRowClick: true,
      allowOverflow: true,
      button: true,
      minWidth: "280px",
    },
  ];

  return (
    <div className="p-3 p-lg-4">
      <div className="d-flex flex-column flex-sm-row align-items-start align-items-sm-center justify-content-between gap-3 mb-3">
        <div>
          <h5 className="mb-1 fw-semibold">Register</h5>
          <p className="text-muted mb-0 fs-13">
            Track every licence, NOC and registration across centres. {recordsTotal} of {recordsOverallTotal}{" "}
            items match.
          </p>
        </div>
        <RefreshButton onRefresh={() => loadRecords()} loading={recordsLoading} />
      </div>

      <Card className="mb-3 shadow-sm border-0" style={{ borderRadius: "0 0 8px 8px" }}>
        <CardBody className="py-3">
          <Row className="g-2 align-items-center">
            <Col sm={6} md={4} lg={3}>
              <Select
                classNamePrefix="react-select"
                options={centreOptions}
                value={centreOptions.find((o) => o.value === centreFilter) || centreOptions[0]}
                onChange={(option) => {
                  setCentreFilter(option?.value || "ALL");
                  setPage(1);
                }}
              />
            </Col>
            <Col sm={6} md={4} lg={3}>
              <Select
                classNamePrefix="react-select"
                options={STATUS_OPTIONS}
                value={STATUS_OPTIONS.find((o) => o.value === statusFilter)}
                onChange={(option) => {
                  setStatusFilter(option?.value || "NEEDS_ATTENTION");
                  setPage(1);
                }}
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

      <Card className="shadow-sm border-0">
        <CardBody className="p-0">
          <DataTableComponent
            columns={columns}
            data={records}
            loading={recordsLoading}
            fixedHeader={false}
            page={page}
            setPage={setPage}
            limit={limit}
            setLimit={setLimit}
            pagination={{ totalDocs: recordsTotal }}
            noDataComponent="No items match these filters."
          />
        </CardBody>
      </Card>

      <ItemDetailModal isOpen={!!detailId} toggle={() => setDetailId(null)} recordId={detailId} />

      <ConfirmationModal
        isOpen={!!confirmingRow}
        toggle={() => setConfirmingRow(null)}
        title="Mark as applied for renewal"
        message={`Mark "${confirmingRow?.complianceType?.name || "this item"}" at ${centreLabel(
          confirmingRow?.center,
        )} as applied for renewal? It'll be flagged as in renewal until a new document is approved.`}
        confirmText="Mark as applied"
        confirmColor="success"
        confirmDisabled={markingId === confirmingRow?._id}
        onConfirm={handleMarkInRenewal}
      />
    </div>
  );
};

export default Register;