import React, { useEffect, useState } from "react";
import { Card, CardBody, Button } from "reactstrap";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Pencil, Trash2 } from "lucide-react";
import DataTableComponent from "../../../Components/Common/DataTable";
import ConfirmationModal from "../../../Components/Common/ConfirmationModal";
import { formatDateTime } from "../../../utils/time";
import { fetchMyDrafts, removeDraft } from "../../../store/features/compliance/complianceSlice";

const centreLabel = (c) => c?.displayName || c?.title || c?.name || "—";

const MyDrafts = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { myDrafts, draftsLoading } = useSelector((state) => state.Compliance);

  const [discarding, setDiscarding] = useState(null);
  const [busy, setBusy] = useState(false);

  const loadDrafts = () => {
    dispatch(fetchMyDrafts({}))
      .unwrap()
      .catch((error) => {
        if (error?.aborted) return;
        toast.error(error?.message || "Failed to load drafts");
      });
  };

  useEffect(() => {
    loadDrafts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const confirmDiscard = async () => {
    if (!discarding) return;
    try {
      setBusy(true);
      await dispatch(removeDraft(discarding._id)).unwrap();
      toast.success("Draft discarded.");
      setDiscarding(null);
    } catch (error) {
      toast.error(error?.message || "Failed to discard draft");
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
          <Button
            color="success"
            size="sm"
            className="text-white text-nowrap"
            onClick={() => navigate(`/compliance/upload?draft=${row._id}`)}
          >
            <Pencil size={14} className="me-1" /> Continue
          </Button>
          <Button color="light" size="sm" className="border text-danger" onClick={() => setDiscarding(row)}>
            <Trash2 size={14} />
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
          <h5 className="mb-1 fw-semibold">My drafts</h5>
          <p className="text-muted mb-0 fs-13">
            Documents you started but haven't sent for verification yet. Only you can see and edit these.
          </p>
        </div>
        {/* <div className="d-flex gap-2">
          <RefreshButton onRefresh={loadDrafts} loading={draftsLoading} />
          <Button
            color="success"
            size="sm"
            className="text-white text-nowrap"
            onClick={() => navigate("/compliance/upload")}
          >
            <Plus size={14} className="me-1" /> New document
          </Button>
        </div> */}
      </div>

      <Card className="shadow-sm border-0">
        <CardBody className="p-0">
          <DataTableComponent
            columns={columns}
            data={myDrafts}
            loading={draftsLoading}
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
    </div>
  );
};

export default MyDrafts;