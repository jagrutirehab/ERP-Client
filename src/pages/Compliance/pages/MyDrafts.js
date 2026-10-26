import React, { useEffect, useState } from "react";
import { Card, CardBody } from "reactstrap";
import Select from "react-select";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import DataTableComponent from "../../../Components/Common/DataTable";
import ConfirmationModal from "../../../Components/Common/ConfirmationModal";
import ReviewModal from "../components/ReviewModal";
import { getMyDraftsColumns } from "../Columns/MyDraftsColumns";
import { getComplianceDraftById } from "../../../helpers/backend_helper";
import { fetchMyDrafts, removeDraft } from "../../../store/features/compliance/complianceSlice";
import { useCenterOptions } from "../../../Components/Hooks/useCenterOptions";
import { useAuthError } from "../../../Components/Hooks/useAuthError";
import { usePermissions } from "../../../Components/Hooks/useRoles";
import RefreshButton from "../../../Components/Common/RefreshButton";

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
  const user = useSelector((state) => state.User);
  const centreOptions = useCenterOptions();

  const [discarding, setDiscarding] = useState(null);
  const [busy, setBusy] = useState(false);
  const [viewing, setViewing] = useState(null);
  const [loadingRowId, setLoadingRowId] = useState(null);
  const [centreFilter, setCentreFilter] = useState("ALL");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const loadDrafts = async () => {
    const centerParam =
      centreFilter === "ALL"
        ? (user?.centerAccess || []).map((c) => c?._id || c).join(",")
        : centreFilter;
    try {
      await dispatch(
        fetchMyDrafts({
          center: centerParam,
          page,
          limit,
        }),
      ).unwrap();
    } catch (error) {
      if (error?.aborted) return;
      if (!handleAuthError(error)) {
        toast.error(error?.message || "Failed to load drafts");
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

  useEffect(() => {
    loadDrafts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [centreFilter, page, limit, user?.centerAccess]);

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


  const openView = async (row) => {
    setLoadingRowId(row._id);
    try {
      const res = await getComplianceDraftById(row._id);
      setViewing(toModalShape(res?.data));
    } catch (error) {
      if (!handleAuthError(error)) {
        toast.error(error?.response?.data?.message || error?.message || "Failed to load draft");
      }
    } finally {
      setLoadingRowId(null);
    }
  };

  const columns = getMyDraftsColumns({
    roles,
    onView: openView,
    onContinue: (row) => navigate(`/compliance/upload?draft=${row._id}`),
    onDiscard: setDiscarding,
    loadingRowId,
  });

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

      <Card className="mb-3 shadow-sm border-0">
        <CardBody className="py-3">
          <div style={{ maxWidth: 260 }}>
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
        </CardBody>
      </Card>

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