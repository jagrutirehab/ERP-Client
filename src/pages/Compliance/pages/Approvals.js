import React, { useEffect, useMemo, useRef, useState } from "react";
import { Card, CardBody, Nav, NavItem, NavLink, Button, Input } from "reactstrap";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import DataTableComponent from "../../../Components/Common/DataTable";
import RefreshButton from "../../../Components/Common/RefreshButton";
import Select from "react-select";
import { ClipboardCheck, Eye } from "lucide-react";
import { renderStatusBadge } from "../../../Components/Common/renderStatusBadge";
import ReviewModal from "../components/ReviewModal";
import { formatDateTime } from "../../../utils/time";
import { getAllCenters } from "../../../helpers/backend_helper";
import {
  fetchComplianceSubmissions,
  approveSubmission,
  rejectSubmission,
} from "../../../store/features/compliance/complianceSlice";
import { useAuthError } from "../../../Components/Hooks/useAuthError";
import { usePermissions } from "../../../Components/Hooks/useRoles";
import CheckPermission from "../../../Components/HOC/CheckPermission";

const STATUS_OPTIONS = [
  { value: "PENDING", label: "Pending" },
  { value: "APPROVED", label: "Approved" },
  { value: "REJECTED", label: "Rejected" },
];

const centreLabel = (c) => c?.displayName || c?.title || c?.name || "—";

// Backend record -> the shape the table and ReviewModal already use
const toRow = (s) => ({
  id: s._id,
  centreId: s.center?._id,
  centreName: centreLabel(s.center),
  categoryName: s.complianceType?.name || "—",
  submittedBy: s.submittedBy?.name || s.submittedBy?.email || "—",
  submittedAt: s.submittedAt,
  issuingAuthority: s.issuingAuthority,
  licenceNo: s.licenceNumber,
  issuedOn: s.issueDate,
  validTill: s.expiryDate,
  noExpiry: s.noExpiry,
  leadDays: s.renewalLeadDays,
  owner: s.responsibleOwner,
  escalateTo: s.escalateTo,
  notes: s.notes,
  files: s.documents || [],
  fileNames: (s.documents || []).map((d) => d.originalName || d.name),
  status: String(s.status || "").toLowerCase(), // "pending" | "approved" | "rejected"
  note: s.reviewComment,
});

const Approvals = () => {
  const dispatch = useDispatch();
  const handleAuthError = useAuthError();
  const microUser = localStorage.getItem("micrologin");
  const token = microUser ? JSON.parse(microUser).token : null;
  const { roles } = usePermissions(token);
  const { submissions, submissionCounts, submissionsLoading, submissionsTotal, submissionReviewing } = useSelector(
    (state) => state.Compliance,
  );

  const [statusFilter, setStatusFilter] = useState("PENDING");
  const [centreFilter, setCentreFilter] = useState("all");
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [reviewing, setReviewing] = useState(null);
  const [viewingReadOnly, setViewingReadOnly] = useState(false);
  const [centres, setCentres] = useState([]);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  // centres for the filter dropdown
  useEffect(() => {
    const loadCentres = async () => {
      try {
        const res = await getAllCenters();
        const list = Array.isArray(res)
          ? res
          : Array.isArray(res?.data)
          ? res.data
          : Array.isArray(res?.payload)
          ? res.payload
          : Array.isArray(res?.data?.data)
          ? res.data.data
          : [];
        setCentres(list);
      } catch (error) {
        if (!handleAuthError(error)) {
          toast.error(error?.response?.data?.message || error?.message || "Failed to load centres");
        }
      }
    };
    loadCentres();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadSubmissions = async () => {
    try {
      await dispatch(
        fetchComplianceSubmissions({
          status: statusFilter,
          center: centreFilter === "all" ? undefined : centreFilter,
          search: debouncedQuery.trim() || undefined,
          page,
          limit,
        }),
      ).unwrap();
    } catch (error) {
      if (error?.aborted) return;
      if (!handleAuthError(error)) {
        toast.error(error?.message || "Failed to load submissions");
      }
    }
  };

  // reload whenever the tab, centre filter, page or limit changes
  useEffect(() => {
    loadSubmissions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, centreFilter, page, limit, debouncedQuery]);

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

  const rows = useMemo(() => (submissions || []).map(toRow), [submissions]);
  const pendingCount = submissionCounts?.PENDING || 0;

  const centreOptions = [
    { value: "all", label: "All centres" },
    ...centres.map((c) => ({ value: c._id, label: centreLabel(c) })),
  ];

  const columns = [
    {
      name: <div>Submitted</div>,
      selector: (row) => formatDateTime(row.submittedAt),
      wrap: true,
      minWidth: "150px",
    },
    {
      name: <div>Centre</div>,
      selector: (row) => row.centreName,
      wrap: true,
      minWidth: "110px",
    },
    {
      name: <div>Compliance type</div>,
      selector: (row) => row.categoryName,
      wrap: true,
      minWidth: "150px",
    },
    {
      name: <div>Submitted by</div>,
      selector: (row) => row.submittedBy,
      wrap: true,
      minWidth: "120px",
    },
    {
      name: <div>Files</div>,
      selector: (row) => (row.fileNames.length ? `${row.fileNames.length} file(s)` : "—"),
      wrap: true,
      minWidth: "90px",
    },
    {
      name: <div>Status</div>,
      selector: (row) => row.status,
      cell: (row) => renderStatusBadge(row.status.toUpperCase()),
      wrap: true,
      minWidth: "100px",
    },
    {
      name: <div>Actions</div>,
      cell: (row) =>
        statusFilter === "PENDING" ? (
          <div className="d-flex align-items-center gap-2">
            <button
              type="button"
              className="btn btn-sm btn-outline-primary"
              onClick={() => {
                setViewingReadOnly(true);
                setReviewing(row);
              }}
              title="View"
            >
              <Eye size={14} />
            </button>
            <CheckPermission accessRolePermission={roles?.permissions} subAccess="APPROVALS" permission="edit">
              <Button
                color="success"
                className="text-white"
                size="sm"
                onClick={() => {
                  setViewingReadOnly(false);
                  setReviewing(row);
                }}
              >
                <ClipboardCheck size={14} className="me-1" /> Review
              </Button>
            </CheckPermission>
          </div>
        ) : (
          <Button
            color="light"
            className="border"
            size="sm"
            onClick={() => {
              setViewingReadOnly(true);
              setReviewing(row);
            }}
          >
            <ClipboardCheck size={14} className="me-1" /> View
          </Button>
        ),
      ignoreRowClick: true,
      allowOverflow: true,
      button: true,
      minWidth: "100px",
    },
  ];

  // Both return true on success so the modal knows when to close
  const approve = async (id, comment) => {
    try {
      const res = await dispatch(approveSubmission({ id, comment })).unwrap();
      toast.success(res?.message || "Approved.");
      return true;
    } catch (error) {
      if (!handleAuthError(error)) {
        toast.error(error?.message || "Failed to approve");
        loadSubmissions(); // someone else may have reviewed it already
      }
      return false;
    }
  };

  const reject = async (id, reason) => {
    try {
      await dispatch(rejectSubmission({ id, reason })).unwrap();
      toast.success("Submission rejected.");
      return true;
    } catch (error) {
      if (!handleAuthError(error)) {
        toast.error(error?.message || "Failed to reject");
        loadSubmissions();
      }
      return false;
    }
  };

  return (
    <div className="p-3 p-lg-4">
      <div className="d-flex flex-column flex-sm-row align-items-start align-items-sm-center justify-content-between gap-3 mb-3">
        <div>
          <h5 className="mb-1 fw-semibold">Approvals</h5>
          <p className="text-muted mb-0 fs-13">
            Review centre-submitted compliance documents and approve or reject them. {pendingCount} pending.
          </p>
        </div>
        <RefreshButton onRefresh={loadSubmissions} loading={submissionsLoading} />
      </div>

      <Nav tabs className="flex-wrap mb-0" style={{ borderBottom: "1px solid #dee2e6" }}>
        {STATUS_OPTIONS.map((status) => {
          const isActive = statusFilter === status.value;
          return (
            <NavItem key={status.value}>
              <NavLink
                href="#"
                active={isActive}
                onClick={(e) => {
                  e.preventDefault();
                  setStatusFilter(status.value);
                  setPage(1);
                }}
                style={{
                  fontSize: 13,
                  fontWeight: isActive ? 700 : 500,
                  cursor: "pointer",
                  color: isActive ? "#212529" : "#1B4D47",
                  background: isActive ? "#fff" : "transparent",
                  border: isActive ? "1px solid #dee2e6" : "none",
                  borderBottom: isActive ? "1px solid #fff" : "none",
                  borderRadius: isActive ? "4px 4px 0 0" : 0,
                  padding: "6px 14px",
                  marginBottom: -1,
                  textDecoration: "none",
                }}
              >
                {status.label}
                {status.value === "PENDING" && pendingCount > 0 && (
                  <span className="ms-2 badge rounded-pill bg-danger" style={{ fontSize: 11 }}>
                    {pendingCount}
                  </span>
                )}
              </NavLink>
            </NavItem>
          );
        })}
      </Nav>

      <Card className="mb-3 shadow-sm border-0" style={{ borderRadius: "0 0 8px 8px" }}>
        <CardBody className="py-3">
          <div className="d-flex flex-wrap gap-2">
            <div style={{ maxWidth: 260, minWidth: 200 }}>
              <Select
                classNamePrefix="react-select"
                options={centreOptions}
                value={centreOptions.find((o) => o.value === centreFilter) || centreOptions[0]}
                onChange={(option) => {
                  setCentreFilter(option?.value || "all");
                  setPage(1);
                }}
              />
            </div>
            <div style={{ maxWidth: 280, minWidth: 200 }}>
              <Input
                type="search"
                placeholder="Search by compliance type..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
          </div>
        </CardBody>
      </Card>

      <Card className="shadow-sm border-0">
        <CardBody className="p-0">
          <DataTableComponent
            columns={columns}
            data={rows}
            loading={submissionsLoading}
            fixedHeader={false}
            page={page}
            setPage={setPage}
            limit={limit}
            setLimit={setLimit}
            pagination={{ totalDocs: submissionsTotal }}
            noDataComponent="No submissions match these filters."
          />
        </CardBody>
      </Card>

      <ReviewModal
        isOpen={!!reviewing}
        toggle={() => setReviewing(null)}
        submission={reviewing}
        onApprove={approve}
        onReject={reject}
        busy={submissionReviewing}
        readOnly={viewingReadOnly}
      />
    </div>
  );
};

export default Approvals;