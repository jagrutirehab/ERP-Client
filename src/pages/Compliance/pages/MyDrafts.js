import React, { useEffect, useState } from "react";
import { Card, CardBody, Button } from "reactstrap";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Eye, Pencil, Trash2 } from "lucide-react";
import DataTableComponent from "../../../Components/Common/DataTable";
import RefreshButton from "../../../Components/Common/RefreshButton";
import ConfirmationModal from "../../../Components/Common/ConfirmationModal";
import ReviewModal from "../components/ReviewModal";
import { formatDateTime } from "../../../utils/time";
import { fetchMyDrafts, removeDraft } from "../../../store/features/compliance/complianceSlice";
import { useAuthError } from "../../../Components/Hooks/useAuthError";
import { usePermissions } from "../../../Components/Hooks/useRoles";
import CheckPermission from "../../../Components/HOC/CheckPermission";

const centreLabel = (c) => c?.displayName || c?.title || c?.name || "—";

// Draft -> the shape ReviewModal already understands (read-only here)
const toModalShape = (s) => ({
  id: s._id,
  centreName: centreLabel(s.center),
  categoryName: s.complianceType?.name || "—",
  submittedBy: s.submittedBy?.name || s.submittedBy?.email || "—",
  submittedAt: s.updatedAt,
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
  status: "draft", // no approve/reject buttons for drafts
  note: "",
});

const MyDrafts = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const handleAuthError = useAuthError();
  const microUser = localStorage.getItem("micrologin");
  const token = microUser ? JSON.parse(microUser).token : null;
  const { roles } = usePermissions(token);
  const { myDrafts, myDraftsTotal, draftsLoading } = useSelector((state) => state.Compliance);

  const [discarding, setDiscarding] = useState(null);
  const [busy, setBusy] = useState(false);
  const [viewing, setViewing] = useState(null);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const loadDrafts = async () => {
    try {
      await dispatch(fetchMyDrafts({ page, limit })).unwrap();
    } catch (error) {
      if (error?.aborted) return;
      if (!handleAuthError(error)) {
        toast.error(error?.message || "Failed to load drafts");
      }
    }
  };

  useEffect(() => {
    loadDrafts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, limit]);

  const confirmDiscard = async () => {
    if (!discarding) return;
    try {
      setBusy(true);
      await dispatch(removeDraft(discarding._id)).unwrap();
      toast.success("Draft discarded.");
      setDiscarding(null);
      loadDrafts();
    } catch (error) {
      if (!handleAuthError(error)) {
        toast.error(error?.response?.data?.message || error?.message || "Failed to discard draft");
      }
    } finally {
      setBusy(false);
    }
  };

  const columns = [
    {
      name: <div>Last saved</div>,
      selector: (row) => formatDateTime(row.updatedAt),
      wrap: true,
      minWidth: "150px",
    },
    {
      name: <div>Centre</div>,
      selector: (row) => centreLabel(row.center),
      wrap: true,
      minWidth: "110px",
    },
    {
      name: <div>Compliance type</div>,
      selector: (row) => row.complianceType?.name || "—",
      wrap: true,
      minWidth: "150px",
    },
    {
      name: <div>Licence / reg. no.</div>,
      selector: (row) => row.licenceNumber || "—",
      wrap: true,
      minWidth: "140px",
    },
    {
      name: <div>Files</div>,
      selector: (row) => (row.documents?.length ? `${row.documents.length} file(s)` : "None yet"),
      wrap: true,
      minWidth: "90px",
    },
    {
      name: <div>Actions</div>,
      cell: (row) => (
        <div className="d-flex gap-2">
          <button
            type="button"
            className="btn btn-sm btn-outline-primary"
            onClick={() => setViewing(toModalShape(row))}
            title="View"
          >
            <Eye size={14} />
          </button>
          <CheckPermission accessRolePermission={roles?.permissions} subAccess="MY_DRAFTS" permission="edit">
            <Button
              color="success"
              size="sm"
              className="text-white text-nowrap"
              onClick={() => navigate(`/compliance/upload?draft=${row._id}`)}
            >
              <Pencil size={14} className="me-1" /> Continue
            </Button>
          </CheckPermission>
          <CheckPermission accessRolePermission={roles?.permissions} subAccess="MY_DRAFTS" permission="delete">
            <Button color="light" size="sm" className="border text-danger" onClick={() => setDiscarding(row)}>
              <Trash2 size={14} />
            </Button>
          </CheckPermission>
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
          <h5 className="mb-1 fw-semibold">My drafts</h5>
          <p className="text-muted mb-0 fs-13">
            Documents you started but haven't sent for verification yet. Only you can see and edit these.
          </p>
        </div>
        <RefreshButton onRefresh={loadDrafts} loading={draftsLoading} />
      </div>

      <Card className="shadow-sm border-0">
        <CardBody className="p-0">
          <DataTableComponent
            columns={columns}
            data={myDrafts}
            loading={draftsLoading}
            fixedHeader={false}
            page={page}
            setPage={setPage}
            limit={limit}
            setLimit={setLimit}
            pagination={{ totalDocs: myDraftsTotal }}
            noDataComponent="No drafts. Anything you save as a draft will appear here."
          />
        </CardBody>
      </Card>

      <ConfirmationModal
        isOpen={!!discarding}
        toggle={() => setDiscarding(null)}
        title="Discard draft"
        message={`Discard the draft for "${discarding?.complianceType?.name || ""} · ${centreLabel(
          discarding?.center,
        )}"? This cannot be undone.`}
        confirmText="Discard"
        confirmColor="danger"
        confirmDisabled={busy}
        onConfirm={confirmDiscard}
      />

      <ReviewModal
        isOpen={!!viewing}
        toggle={() => setViewing(null)}
        submission={viewing}
        onApprove={() => false}
        onReject={() => false}
      />
    </div>
  );
};

export default MyDrafts;