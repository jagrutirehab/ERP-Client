import React, { useEffect, useState } from "react";
import {
  Input,
  Nav,
  NavItem,
  NavLink,
  Card,
  CardBody,
  Button,
  Spinner,
  Row,
  Col,
} from "reactstrap";
import Select from "react-select";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import classnames from "classnames";
import { startOfDay, endOfDay } from "date-fns";
import {
  getAllCenterFloorPhotos,
  reviewCenterFloorPhotoRecord,
  getCenterAuditTimeline,
} from "../../helpers/backend_helper";
import { useAuthError } from "../../Components/Hooks/useAuthError";
import useCenterOptions from "../../Components/Hooks/useCenterOptions";
import DataTableComponent from "../../Components/Common/DataTable";
import PreviewFile from "../../Components/Common/PreviewFile";
import { CenterFloorPhotosColumn } from "./components/columns";
import RejectPhotoModal from "./components/RejectPhotoModal";
import PendingReviewCard from "./components/PendingReviewCard";
import AuditDateStrip from "./components/AuditDateStrip";

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

  // The audit-day strip is the only date control. null means "All dates" —
  // no date restriction at all, so nothing outstanding can hide outside a window.
  const [selectedDay, setSelectedDay] = useState(null);
  const [auditDays, setAuditDays] = useState([]);
  const [auditDaysLoading, setAuditDaysLoading] = useState(false);

  const [drafts, setDrafts] = useState({});
  const [savingRowId, setSavingRowId] = useState(null);

  const [previewFile, setPreviewFile] = useState(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewTitle, setPreviewTitle] = useState("Photo Preview");

  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectTarget, setRejectTarget] = useState(null);

  const isPending = statusTab === "uploaded";
  const singleCenter = selectedCenter && selectedCenter !== "ALL";

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

      const day = selectedDay ? new Date(selectedDay) : null;

      const res = await getAllCenterFloorPhotos({
        page,
        limit,
        centers,
        // Oldest first while clearing the queue; newest first for history.
        sort: isPending ? "oldest" : "newest",
        ...(day && {
          startDate: startOfDay(day).toISOString(),
          endDate: endOfDay(day).toISOString(),
        }),
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
    selectedDay,
    user?.centerAccess,
  ]);

  useEffect(() => {
    setPage(1);
  }, [statusTab]);

  // ── Audit day strip ──────────────────────────────────────────────────────
  const fetchAuditDays = async (center) => {
    setAuditDaysLoading(true);
    try {
      const res = await getCenterAuditTimeline({ center });
      setAuditDays(res?.data || []);
    } catch (error) {
      if (!handleAuthError(error)) {
        toast.error(error?.message || "Failed to fetch audit dates");
      }
      setAuditDays([]);
    } finally {
      setAuditDaysLoading(false);
    }
  };

  // A day only means something within one center, so switching centers drops
  // both the pinned day and the list.
  useEffect(() => {
    setSelectedDay(null);
    setPage(1);

    if (!singleCenter) {
      setAuditDays([]);
      return;
    }
    fetchAuditDays(selectedCenter);
  }, [selectedCenter]);

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

  const afterReview = () => {
    fetchPhotos();
    // Pending counts on the chips move as records are reviewed.
    if (singleCenter) fetchAuditDays(selectedCenter);
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

    if (ok) afterReview();
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
      afterReview();
    }
  };

  const totalPages = pagination?.totalPages || 0;
  const totalRecords = pagination?.totalRecords || 0;

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

      <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-3">
        <div className="d-flex flex-wrap align-items-center gap-2">
          <div style={{ minWidth: 220 }}>
            <Input
              type="text"
              placeholder="Search by center or location..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div style={{ minWidth: 200 }}>
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
        </div>

        <div className="text-nowrap d-flex align-items-center gap-2">
          {isPending && totalRecords > 0 && (
            <span className="text-muted" style={{ fontSize: 11 }}>
              Oldest first
            </span>
          )}
          <span className="fw-semibold text-muted">
            {isPending ? "Awaiting review" : "Records"}: {totalRecords}
          </span>
        </div>
      </div>

      {/* Dates belong to one center, so the strip only appears for one. With
          All Centers the queue is simply unrestricted by date. */}
      {singleCenter && (
        <AuditDateStrip
          entries={auditDays}
          loading={auditDaysLoading}
          activeDate={selectedDay}
          onSelectDate={(entry) => {
            setSelectedDay(entry.auditDate);
            setPage(1);
          }}
          onSelectAll={() => {
            setSelectedDay(null);
            setPage(1);
          }}
        />
      )}

      {/* Pending locations are cards, so the rating comments get real room.
          Reviewed history stays tabular for scanning. */}
      {isPending ? (
        <>
          {loading ? (
            <div className="text-center py-5">
              <Spinner color="primary" />
            </div>
          ) : data.length === 0 ? (
            <Card>
              <CardBody className="text-center py-5 text-muted">
                <i
                  className="ri-checkbox-circle-line d-block mb-2 text-success"
                  style={{ fontSize: 30 }}
                />
                Nothing awaiting review
                {selectedDay ? " on this date" : ""}.
              </CardBody>
            </Card>
          ) : (
            <Row className="g-3">
              {data.map((row) => (
                <Col lg={6} key={row._id}>
                  <PendingReviewCard
                    row={row}
                    draft={drafts[row._id] || emptyDraft}
                    setDraft={setDraft}
                    canReview={hasWrite}
                    savingRowId={savingRowId}
                    onPreview={handleFilePreview}
                    onApprove={handleInlineApprove}
                    onReject={openRejectModal}
                  />
                </Col>
              ))}
            </Row>
          )}

          {totalPages > 1 && (
            <div className="d-flex align-items-center justify-content-between mt-3">
              <span className="text-muted small">
                Page {pagination.currentPage} of {totalPages}
              </span>
              <div className="d-flex align-items-center gap-2">
                <Input
                  type="select"
                  bsSize="sm"
                  value={limit}
                  style={{ width: 80 }}
                  onChange={(e) => {
                    setLimit(Number(e.target.value));
                    setPage(1);
                  }}
                >
                  {[10, 15, 20, 25, 30].map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </Input>
                <Button
                  size="sm"
                  outline
                  disabled={page <= 1 || loading}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  Previous
                </Button>
                <Button
                  size="sm"
                  outline
                  disabled={page >= totalPages || loading}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </>
      ) : (
        <DataTableComponent
          columns={CenterFloorPhotosColumn({
            statusTab,
            onPreview: handleFilePreview,
          })}
          data={data}
          loading={loading}
          pagination={pagination}
          page={page}
          setPage={setPage}
          limit={limit}
          setLimit={setLimit}
        />
      )}

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
