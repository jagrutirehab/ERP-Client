import React, { useEffect, useState } from "react";
import { Input, Nav, NavItem, NavLink } from "reactstrap";
import Select from "react-select";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import classnames from "classnames";
import { startOfDay, endOfDay, subDays } from "date-fns";
import {
  getAllCenterFloorPhotos,
  reviewCenterFloorPhotoRecord,
} from "../../helpers/backend_helper";
import { useAuthError } from "../../Components/Hooks/useAuthError";
import useCenterOptions from "../../Components/Hooks/useCenterOptions";
import DataTableComponent from "../../Components/Common/DataTable";
import PreviewFile from "../../Components/Common/PreviewFile";
import DateRangeFilter from "../../Components/Common/DateRangeFilter";
import { CenterFloorPhotosColumn } from "./components/columns";
import RejectPhotoModal from "./components/RejectPhotoModal";

const emptyDraft = {
  cleanliness: { rating: 0, comment: "" },
  safety: { rating: 0, comment: "" },
};

const Verification = ({ hasWrite }) => {
  const handleAuthError = useAuthError();
  const user = useSelector((state) => state.User);
  const centerOptions = useCenterOptions();

  const [statusTab, setStatusTab] = useState("uploaded");
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [pagination, setPagination] = useState({});
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedCenter, setSelectedCenter] = useState("ALL");

  // A verifier routinely clears the last few days, not just today.
  const [reportDate, setReportDate] = useState({
    start: startOfDay(subDays(new Date(), 6)),
    end: endOfDay(new Date()),
  });

  // Inline rating drafts, keyed by record id. Cleared on every fetch so a
  // half-filled row can never be submitted against refreshed data.
  const [drafts, setDrafts] = useState({});
  const [savingRowId, setSavingRowId] = useState(null);

  const [previewFile, setPreviewFile] = useState(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewTitle, setPreviewTitle] = useState("Photo Preview");

  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectTarget, setRejectTarget] = useState(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search.trim());
      setPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    if (
      selectedCenter !== "ALL" &&
      !user?.centerAccess?.includes(selectedCenter)
    ) {
      setSelectedCenter("ALL");
    }
  }, [selectedCenter, user?.centerAccess]);

  const fetchPhotos = async () => {
    setLoading(true);
    try {
      let centers = [];
      if (selectedCenter === "") {
        centers = [];
      } else if (selectedCenter === "ALL") {
        centers = user?.centerAccess || [];
      } else {
        centers = [selectedCenter];
      }

      const res = await getAllCenterFloorPhotos({
        page,
        limit,
        centers,
        // Boundaries are already snapped to local start/end of day.
        startDate: reportDate.start.toISOString(),
        endDate: reportDate.end.toISOString(),
        ...(debouncedSearch && { search: debouncedSearch }),
        ...(statusTab !== "all" && { status: statusTab }),
      });

      setData(res?.data || []);
      setDrafts({});
      setPagination({
        ...res?.pagination,
        totalDocs: res?.pagination?.totalRecords,
      });
    } catch (error) {
      if (!handleAuthError(error)) {
        toast.error(error?.message || "Failed to fetch audit records");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPhotos();
  }, [
    page,
    limit,
    debouncedSearch,
    selectedCenter,
    statusTab,
    reportDate,
    user?.centerAccess,
  ]);

  useEffect(() => {
    setPage(1);
  }, [statusTab]);

  const setDraft = (rowId, next) =>
    setDrafts((prev) => ({ ...prev, [rowId]: { ...emptyDraft, ...next } }));

  const handleFilePreview = (file, title) => {
    if (!file?.fileUrl) return;
    setPreviewFile({ url: file.fileUrl, originalName: file.fileName });
    setPreviewTitle(title || "Photo Preview");
    setPreviewOpen(true);
  };

  const submitReview = async (row, payload, actionKey) => {
    setSavingRowId(`${actionKey}-${row._id}`);
    try {
      const res = await reviewCenterFloorPhotoRecord(row._id, payload);
      toast.success(
        res?.data?.message ||
          `Location ${actionKey === "verified" ? "approved" : "rejected"} successfully`,
      );
      return true;
    } catch (error) {
      if (!handleAuthError(error)) {
        toast.error(
          error.response?.data?.message ||
            error.message ||
            "Failed to review location",
        );
      }
      return false;
    } finally {
      setSavingRowId(null);
    }
  };

  const handleInlineApprove = async (row) => {
    if (!hasWrite) {
      toast.error("You do not have permission to verify locations");
      return;
    }

    const draft = drafts[row._id] || {};
    if (!draft.cleanliness?.rating || !draft.safety?.rating) {
      toast.error("Rate both cleanliness and safety before approving");
      return;
    }

    const ok = await submitReview(
      row,
      {
        status: "verified",
        assessment: {
          cleanliness: {
            rating: draft.cleanliness.rating,
            comment: (draft.cleanliness.comment || "").trim(),
          },
          safety: {
            rating: draft.safety.rating,
            comment: (draft.safety.comment || "").trim(),
          },
        },
      },
      "verified",
    );

    if (ok) fetchPhotos();
  };

  const openRejectModal = (row) => {
    if (!hasWrite) return;
    setRejectTarget(row);
    setRejectModalOpen(true);
  };

  const handleRejectConfirm = async (remarks) => {
    if (!rejectTarget || !hasWrite) return;

    const ok = await submitReview(
      rejectTarget,
      { status: "rejected", remarks },
      "rejected",
    );

    if (ok) {
      setRejectModalOpen(false);
      setRejectTarget(null);
      fetchPhotos();
    }
  };

  return (
    <>
      <Nav tabs className="mb-3">
        {[
          { key: "uploaded", label: "Pending Verification" },
          { key: "verified", label: "Verified" },
          { key: "rejected", label: "Rejected" },
        ].map((tab) => (
          <NavItem key={tab.key}>
            <NavLink
              className={classnames({ active: statusTab === tab.key })}
              onClick={() => setStatusTab(tab.key)}
              style={{ cursor: "pointer", fontWeight: 500 }}
            >
              {tab.label}
            </NavLink>
          </NavItem>
        ))}
      </Nav>

      <div className="d-flex flex-wrap align-items-end justify-content-between gap-3 mb-3">
        <div className="d-flex flex-wrap align-items-end gap-2">
          <div style={{ minWidth: 220 }}>
            <Input
              type="text"
              placeholder="Search by center or location..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div style={{ minWidth: 180 }}>
            <Select
              options={centerOptions}
              value={
                centerOptions.find((c) => c.value === selectedCenter) || null
              }
              onChange={(selected) =>
                setSelectedCenter(selected ? selected.value : "")
              }
              placeholder="Select Center"
              isDisabled={!centerOptions.length}
            />
          </div>

          <DateRangeFilter
            reportDate={reportDate}
            setReportDate={(next) => {
              setReportDate(next);
              setPage(1);
            }}
          />
        </div>

        <div className="text-nowrap">
          <span className="fw-semibold text-muted">
            Total Records: {pagination?.totalRecords || 0}
          </span>
        </div>
      </div>

      <DataTableComponent
        columns={CenterFloorPhotosColumn({
          statusTab,
          hasPermissionToEdit: hasWrite,
          onPreview: handleFilePreview,
          onApprove: handleInlineApprove,
          onReject: openRejectModal,
          drafts,
          setDraft,
          savingRowId,
        })}
        data={data}
        loading={loading}
        pagination={pagination}
        page={page}
        setPage={setPage}
        limit={limit}
        setLimit={setLimit}
        conditionalRowStyles={[
          {
            when: (row) => savingRowId?.endsWith(row._id),
            style: { backgroundColor: "#fff9db", opacity: 0.7 },
          },
        ]}
      />

      <PreviewFile
        title={previewTitle}
        file={previewFile}
        isOpen={previewOpen}
        toggle={() => {
          setPreviewOpen(false);
          setPreviewFile(null);
          setPreviewTitle("Photo Preview");
        }}
      />

      <RejectPhotoModal
        isOpen={rejectModalOpen}
        toggle={() => setRejectModalOpen((prev) => !prev)}
        locationLabel={rejectTarget?.locationLabel}
        onConfirm={handleRejectConfirm}
        loading={savingRowId === `rejected-${rejectTarget?._id}`}
      />
    </>
  );
};

export default Verification;
