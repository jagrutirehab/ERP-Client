import React, { useEffect, useState } from "react";
import { Card, CardBody, Button } from "reactstrap";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import Select from "react-select";
import { Eye } from "lucide-react";
import DataTableComponent from "../../../Components/Common/DataTable";
import RefreshButton from "../../../Components/Common/RefreshButton";
import ReviewModal from "../components/ReviewModal";
import { formatDateTime } from "../../../utils/time";
import { getAllCenters } from "../../../helpers/backend_helper";
import { fetchAllDrafts } from "../../../store/features/compliance/complianceSlice";

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

const AllDrafts = () => {
  const dispatch = useDispatch();
  const { allDrafts, draftsLoading } = useSelector((state) => state.Compliance);

  const [centres, setCentres] = useState([]);
  const [centreFilter, setCentreFilter] = useState("all");
  const [viewing, setViewing] = useState(null);

  useEffect(() => {
    getAllCenters()
      .then((res) => {
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
      })
      .catch(() => toast.error("Failed to load centres"));
  }, []);

  const loadDrafts = () => {
    dispatch(fetchAllDrafts({ center: centreFilter === "all" ? undefined : centreFilter }))
      .unwrap()
      .catch((error) => {
        if (error?.aborted) return;
        toast.error(error?.message || "Failed to load drafts");
      });
  };

  useEffect(() => {
    loadDrafts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [centreFilter]);

  const centreOptions = [
    { value: "all", label: "All centres" },
    ...centres.map((c) => ({ value: c._id, label: centreLabel(c) })),
  ];

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
      name: <div>Started by</div>,
      selector: (row) => row.submittedBy?.name || row.submittedBy?.email || "—",
      wrap: true,
      minWidth: "120px",
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
        <Button color="light" className="border" size="sm" onClick={() => setViewing(toModalShape(row))}>
          <Eye size={14} className="me-1" /> View
        </Button>
      ),
      ignoreRowClick: true,
      allowOverflow: true,
      button: true,
      minWidth: "100px",
    },
  ];

  return (
    <div className="p-3 p-lg-4">
      <div className="d-flex flex-column flex-sm-row align-items-start align-items-sm-center justify-content-between gap-3 mb-3">
        <div>
          <h5 className="mb-1 fw-semibold">All drafts</h5>
          {/* <p className="text-muted mb-0 fs-13">
            Unfinished documents across all centres. Read only: only the person who started a draft can
            edit or send it.
          </p> */}
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
              onChange={(option) => setCentreFilter(option?.value || "all")}
            />
          </div>
        </CardBody>
      </Card>

      <Card className="shadow-sm border-0">
        <CardBody className="p-0">
          <DataTableComponent
            columns={columns}
            data={allDrafts}
            loading={draftsLoading}
            noDataComponent="No drafts for this filter."
          />
        </CardBody>
      </Card>

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

export default AllDrafts;