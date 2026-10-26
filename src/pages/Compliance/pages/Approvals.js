import React, { useEffect, useMemo, useRef, useState } from "react";
import { Card, CardBody, Nav, NavItem, NavLink, Input } from "reactstrap";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import DataTableComponent from "../../../Components/Common/DataTable";
import RefreshButton from "../../../Components/Common/RefreshButton";
import Select from "react-select";
import ReviewModal from "../components/ReviewModal";
import { getApprovalsColumns } from "../Columns/ApprovalsColumns";
import { getComplianceSubmissionById } from "../../../helpers/backend_helper";
import {
  fetchComplianceSubmissions,
  approveSubmission,
  rejectSubmission,
} from "../../../store/features/compliance/complianceSlice";
import { useCenterOptions } from "../../../Components/Hooks/useCenterOptions";
import { useAuthError } from "../../../Components/Hooks/useAuthError";
import { usePermissions } from "../../../Components/Hooks/useRoles";

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
  const user = useSelector((state) => state.User);
  const centreOptions = useCenterOptions();

  const [statusFilter, setStatusFilter] = useState("PENDING");
  const [centreFilter, setCentreFilter] = useState("ALL");
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [reviewing, setReviewing] = useState(null);
  const [viewingReadOnly, setViewingReadOnly] = useState(false);
  const [loadingReviewId, setLoadingReviewId] = useState(null);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const loadSubmissions = async () => {
    const centerParam =
      centreFilter === "ALL"
        ? (user?.centerAccess || []).map((c) => c?._id || c).join(",")
        : centreFilter;
    try {
      await dispatch(
        fetchComplianceSubmissions({
          status: statusFilter,
          center: centerParam,
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

  // If the centre access list changes (e.g. access revoked for the one
  // currently selected), fall back to "ALL" instead of filtering on a centre
  // the user can no longer see.
  useEffect(() => {
    if (centreFilter !== "ALL" && !user?.centerAccess?.includes(centreFilter)) {
      setCentreFilter("ALL");
      setPage(1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.centerAccess]);

  // reload whenever the tab, centre filter, page, limit, or the user's
  // centre access changes
  useEffect(() => {
    loadSubmissions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, centreFilter, page, limit, debouncedQuery, user?.centerAccess]);

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

  const openReview = async (row, readOnly) => {
    setLoadingReviewId(row.id);
    try {
      const res = await getComplianceSubmissionById(row.id);
      setViewingReadOnly(readOnly);
      setReviewing(toRow(res?.data));
    } catch (error) {
      if (!handleAuthError(error)) {
        toast.error(error?.response?.data?.message || error?.message || "Failed to load submission");
      }
    } finally {
      setLoadingReviewId(null);
    }
  };

  const columns = getApprovalsColumns({
    roles,
    statusFilter,
    loadingReviewId,
    onOpenReview: openReview,
  });

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
                  setCentreFilter(option?.value || "ALL");
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