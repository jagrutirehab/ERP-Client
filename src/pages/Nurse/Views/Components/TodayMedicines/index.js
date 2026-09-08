import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { connect } from "react-redux";
import { Button, ButtonGroup, Card, CardBody, Spinner, Input, Row, Col } from "reactstrap";
import DataTable from "react-data-table-component";
import Select from "react-select";
import { toast } from "react-toastify";
import moment from "moment";
import { CheckCircle2, Circle, Clock } from "lucide-react";
import { endOfDay, startOfDay } from "date-fns";
import { capitalizeWords } from "../../../../../utils/toCapitalize";
import CenterDropdown from "../../../../Report/Components/Doctor/components/CenterDropDown";
import DateRangeFilter from "../../../../../Components/Common/DateRangeFilter";
import RefreshButton from "../../../../../Components/Common/RefreshButton";
import ConfirmationModal from "../../../../../Components/Common/ConfirmationModal";
import {
  getTodayMedicinesToGive,
  markTodayMedicinesGivenBulk,
  getTodayGivenMedicineHistory,
} from "../../../../../helpers/backend_helper";

const TO_GIVE_TAB = "TO_GIVE";
const HISTORY_TAB = "HISTORY";

const LIMIT_OPTIONS = [10, 20, 30, 40, 50].map((l) => ({ value: l, label: String(l) }));

const emptyPagination = { totalDocs: 0, totalPages: 0 };

const Tick = ({ checked, onClick }) => (
  <span role="checkbox" aria-checked={checked} onClick={onClick} style={{ cursor: "pointer", display: "inline-flex" }}>
    {checked ? <CheckCircle2 size={20} className="text-success" /> : <Circle size={20} className="text-muted" />}
  </span>
);

const paginationFor = (res) => ({ totalDocs: res?.totalDocs || 0, totalPages: res?.totalPages || 0 });

const TodayMedicines = ({ centerAccess, centers, writable = true }) => {
  const [activeTab, setActiveTab] = useState(TO_GIVE_TAB);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitProgress, setSubmitProgress] = useState(null);
  const [slot, setSlot] = useState(null);
  const [slotWindowLabel, setSlotWindowLabel] = useState("");
  const [rows, setRows] = useState([]);
  const [message, setMessage] = useState("");
  const [selectedMap, setSelectedMap] = useState(new Map());
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [overallComment, setOverallComment] = useState("");
  const [individualComments, setIndividualComments] = useState(new Map());
  const [selectingAll, setSelectingAll] = useState(false);
  const [selectAllWarningOpen, setSelectAllWarningOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(50);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [pagination, setPagination] = useState(emptyPagination);
  const [reportDate, setReportDate] = useState({ start: startOfDay(new Date()), end: endOfDay(new Date()) });

  const centerOptions = useMemo(
    () =>
      centers
        ?.filter((c) => centerAccess?.includes(c._id))
        .map((c) => ({ _id: c._id, title: c.title })) || [],
    [centers, centerAccess]
  );
  const [selectedCentersIds, setSelectedCentersIds] = useState([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const prevAvailableIdsRef = useRef([]);

  useEffect(() => {
    if (centerOptions.length > 0 && !isInitialized) {
      const availableIds = centerOptions.map((c) => c._id);
      prevAvailableIdsRef.current = availableIds;
      setSelectedCentersIds(availableIds);
      setIsInitialized(true);
    }
  }, [centerOptions, isInitialized]);

  useEffect(() => {
    if (!isInitialized) return;
    const availableIds = centerOptions.map((c) => c._id);
    const newlyGranted = availableIds.filter((id) => !prevAvailableIdsRef.current.includes(id));
    prevAvailableIdsRef.current = availableIds;

    setSelectedCentersIds((prev) => {
      const kept = prev.filter((id) => availableIds.includes(id));
      const next = [...kept, ...newlyGranted];
      if (next.length === prev.length && next.every((id) => prev.includes(id))) return prev;
      return next;
    });
  }, [centerOptions, isInitialized]);

  // Debounce the search box so every keystroke doesn't trigger a request.
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearch(search.trim()), 400);
    return () => clearTimeout(handler);
  }, [search]);

  useEffect(() => {
    setPage(1);
  }, [
    activeTab,
    debouncedSearch,
    limit,
    JSON.stringify(selectedCentersIds),
    reportDate.start,
    reportDate.end,
  ]);

  const load = useCallback(() => {
    if (!selectedCentersIds.length) {
      setRows([]);
      setPagination(emptyPagination);
      setMessage("No center selected");
      setLoading(false);
      return;
    }
    setLoading(true);

    const request =
      activeTab === TO_GIVE_TAB
        ? getTodayMedicinesToGive({ centers: selectedCentersIds, page, limit, search: debouncedSearch })
        : getTodayGivenMedicineHistory({
            centers: selectedCentersIds,
            page,
            limit,
            search: debouncedSearch,
            startDate: reportDate.start.toISOString(),
            endDate: reportDate.end.toISOString(),
          });

    request
      .then((res) => {
        if (activeTab === TO_GIVE_TAB) {
          setSlot(res?.slot || null);
          setSlotWindowLabel(res?.slotWindowLabel || "");
          setMessage(res?.message || "");
        }
        const data = res?.data || [];
        setRows(data);
        setPagination(paginationFor(res?.pagination));
      })
      .catch((err) => {
        toast.error(
          err?.message ||
            `Failed to load ${activeTab === TO_GIVE_TAB ? "today's medicines" : "medicine history"}`
        );
        setRows([]);
        setPagination(emptyPagination);
      })
      .finally(() => setLoading(false));
  }, [activeTab, selectedCentersIds, page, limit, debouncedSearch, reportDate]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    setSelectedMap(new Map());
  }, [activeTab, JSON.stringify(selectedCentersIds)]);

  const toggleRowSelection = useCallback((row) => {
    if (!writable || row.changedSinceMorningCheck) return;
    setSelectedMap((prev) => {
      const next = new Map(prev);
      if (next.has(row.patientId)) {
        next.delete(row.patientId);
      } else {
        next.set(row.patientId, row);
      }
      return next;
    });
  }, [writable]);

  const selectedRows = Array.from(selectedMap.values());

  const runSelectAll = async () => {
    setSelectingAll(true);
    try {
      const res = await getTodayMedicinesToGive({
        centers: selectedCentersIds,
        selectAll: true,
        search: debouncedSearch,
      });
      const all = res?.data || [];

      const selectable = all.filter((row) => !row.changedSinceMorningCheck);
      const skipped = all.length - selectable.length;
      setSelectedMap((prev) => {
        const next = new Map(prev);
        selectable.forEach((row) => next.set(row.patientId, row));
        return next;
      });
      if (res?.pagination?.message) {
        toast.warning(res.pagination.message);
      } else {
        toast.success(
          `${selectable.length} patient${selectable.length !== 1 ? "s" : ""} selected` +
            (skipped ? `, ${skipped} skipped (schedule changed since morning check)` : "")
        );
      }
    } catch (err) {
      toast.error(err?.message || "Failed to select all patients");
    } finally {
      setSelectingAll(false);
    }
  };

  const handleSelectAll = () => {
    if (selectedRows.length) {
      setSelectedMap(new Map());
      return;
    }
    if (selectedCentersIds.length > 1) {
      setSelectAllWarningOpen(true);
      return;
    }
    runSelectAll();
  };

  const closeConfirmModal = () => {
    if (submitting) return; // don't let it be dismissed mid-batch
    setConfirmModalOpen(false);
    setOverallComment("");
    setIndividualComments(new Map());
  };

  const SUBMIT_BATCH_SIZE = 40;
  const handleConfirmSubmit = async () => {
    if (!selectedRows.length) return;
    setSubmitting(true);

    const batches = [];
    for (let i = 0; i < selectedRows.length; i += SUBMIT_BATCH_SIZE) {
      batches.push(selectedRows.slice(i, i + SUBMIT_BATCH_SIZE));
    }
    setSubmitProgress(batches.length > 1 ? { batch: 0, totalBatches: batches.length } : null);

    let failed = 0;
    try {
      for (let i = 0; i < batches.length; i++) {
        if (batches.length > 1) setSubmitProgress({ batch: i + 1, totalBatches: batches.length });
        const res = await markTodayMedicinesGivenBulk({
          slot,
          patients: batches[i].map((row) => {
            const comment = (individualComments.get(row.patientId) || overallComment || "").trim();
            return { patientId: row.patientId, ...(comment ? { comment } : {}) };
          }),
        });
        failed += (res?.results || []).filter((r) => !r.success).length;
      }

      if (failed) {
        toast.error(`${failed} of ${selectedRows.length} patients couldn't be marked as given`);
      } else {
        toast.success(`${selectedRows.length} patient${selectedRows.length !== 1 ? "s" : ""} marked as given`);
      }
    } catch (err) {
      toast.error(err?.message || "Failed to mark patients as given");
    }

    setSubmitting(false);
    setSubmitProgress(null);
    setSelectedMap(new Map());
    closeConfirmModal();
    load();
  };

  const columns = useMemo(
    () =>
      activeTab === TO_GIVE_TAB
        ? [
            { name: "UID", selector: (row) => row.patientUid || "-", minWidth: "110px" },
            { name: "Patient Name", selector: (row) => capitalizeWords(row.patientName), wrap: true, grow: 2 },
            { name: "Slot", selector: () => slot, minWidth: "110px" },
            ...(writable
              ? [
                  {
                    name: "Mark",
                    cell: (row) =>
                      row.changedSinceMorningCheck ? (
                        <span className="text-muted" title="Schedule changed since this morning's check — can't be marked given">
                          —
                        </span>
                      ) : (
                        <Tick checked={selectedMap.has(row.patientId)} onClick={() => toggleRowSelection(row)} />
                      ),
                    minWidth: "80px",
                    center: true,
                  },
                ]
              : []),
          ]
        : [
            { name: "UID", selector: (row) => row.patientUid || "-", minWidth: "110px" },
            { name: "Patient Name", selector: (row) => capitalizeWords(row.patientName), wrap: true, grow: 2 },
            { name: "Slot", selector: (row) => row.slot, minWidth: "110px" },
            {
              name: "Marked at",
              selector: (row) => (row.takenAt ? moment(row.takenAt).format("D MMM YYYY, hh:mm A") : "-"),
              minWidth: "180px",
            },
            { name: "By", selector: (row) => (row.markedByName ? capitalizeWords(row.markedByName) : "-"), minWidth: "130px" },
            { name: "Comment", selector: (row) => row.comment || "-", wrap: true, minWidth: "160px" },
          ],
    [activeTab, slot, selectedMap, toggleRowSelection, writable]
  );

  return (
    <div className="bg-white px-2 py-2">
      <div className="tab-scroll-strip mb-2">
        <ButtonGroup size="sm">
          <Button outline={activeTab !== TO_GIVE_TAB} onClick={() => setActiveTab(TO_GIVE_TAB)}>
            To Give
          </Button>
          <Button outline={activeTab !== HISTORY_TAB} onClick={() => setActiveTab(HISTORY_TAB)}>
            History
          </Button>
        </ButtonGroup>
      </div>

      <div className="d-flex flex-wrap align-items-center gap-2 mb-2">
        <div className="flex-grow-1">
          {activeTab === TO_GIVE_TAB &&
            (slot ? (
              <div className="d-inline-flex align-items-center gap-2 px-3 py-2 rounded-3 bg-primary-subtle border border-primary-subtle">
                <Clock size={16} className="text-primary-emphasis flex-shrink-0" />
                <span className="fw-semibold text-primary-emphasis">{slot}</span>
                <span className="text-primary-emphasis opacity-75 small">{slotWindowLabel}</span>
              </div>
            ) : (
              <span className="text-muted small">{message || "No active medicine slot right now"}</span>
            ))}
        </div>
        <div className="d-flex flex-wrap align-items-center gap-2">
          {/* Limit selector hidden — default limit fixed at 50 instead.
          <Select
            options={LIMIT_OPTIONS}
            value={LIMIT_OPTIONS.find((o) => o.value === limit)}
            onChange={(option) => setLimit(option.value)}
            isSearchable={false}
            className="react-select-container"
            classNamePrefix="react-select"
            styles={{ container: (base) => ({ ...base, width: 90 }) }}
          />
          */}
          <CenterDropdown
            options={centerOptions}
            value={selectedCentersIds}
            onChange={setSelectedCentersIds}
          />
          {activeTab === HISTORY_TAB && (
            <DateRangeFilter reportDate={reportDate} setReportDate={setReportDate} />
          )}
          <Input
            placeholder="Search patient…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: 200 }}
          />
          <RefreshButton loading={loading} onRefresh={load} />
        </div>
      </div>

      {activeTab === TO_GIVE_TAB && writable && (
        <div className="d-flex flex-wrap align-items-center gap-2 mb-2">
          <span className="text-muted small">
            {selectedRows.length > 0 ? `${selectedRows.length} selected` : "Select one or more patients"}
          </span>
          {/* Select All / Unselect All hidden.
          <Button
            color="secondary"
            outline
            className="ms-auto"
            disabled={selectingAll || (!rows.length && !selectedRows.length)}
            onClick={handleSelectAll}
          >
            {selectingAll ? <Spinner size="sm" /> : selectedRows.length ? "Unselect All" : "Select All"}
          </Button>
          */}
          <Button
            color="success"
            className="text-white ms-auto"
            disabled={!selectedRows.length}
            onClick={() => setConfirmModalOpen(true)}
          >
            Submit
          </Button>
        </div>
      )}

      <Card className="mt-2">
        <CardBody className="p-2">
          {loading ? (
            <div className="text-center py-4">
              <Spinner color="primary" />
            </div>
          ) : (
            <DataTable
              columns={columns}
              data={rows}
              noDataComponent={
                <div className="py-4 text-center text-muted">
                  {activeTab === TO_GIVE_TAB ? "No patients due right now" : "No one marked as given yet"}
                </div>
              }
              highlightOnHover
              striped
              responsive
              dense
              conditionalRowStyles={
                activeTab === TO_GIVE_TAB
                  ? [
                      {
                        when: (row) => row.changedSinceMorningCheck,
                        style: {
                          backgroundColor: "rgba(220, 53, 69, 0.35)",
                          "&:hover": { backgroundColor: "rgba(220, 53, 69, 0.45)" },
                        },
                      },
                      {
                        when: (row) => row.dosageChangedSinceMorningCheck && !row.changedSinceMorningCheck,
                        style: {
                          backgroundColor: "rgba(255, 193, 7, 0.35)",
                          "&:hover": { backgroundColor: "rgba(255, 193, 7, 0.45)" },
                        },
                      },
                    ]
                  : []
              }
            />
          )}
          {activeTab === TO_GIVE_TAB && !loading && rows.length > 0 && (
            <div className="d-flex flex-wrap gap-3 mt-2 small text-muted">
              <span className="d-flex align-items-center gap-1">
                <span style={{ width: 12, height: 12, borderRadius: 3, backgroundColor: "rgba(220, 53, 69, 0.6)", display: "inline-block" }} />
                Due at this morning's check, not due any more — can't be marked
              </span>
              <span className="d-flex align-items-center gap-1">
                <span style={{ width: 12, height: 12, borderRadius: 3, backgroundColor: "rgba(255, 193, 7, 0.7)", display: "inline-block" }} />
                Still due, but the dose changed since this morning — verify the amount
              </span>
            </div>
          )}
          {!loading && pagination.totalPages > 1 && (
            <>
              {/* Mobile Layout */}
              <div className="d-block d-md-none text-center mt-3">
                <div className="text-muted mb-2">
                  Showing {(page - 1) * limit + 1}–{Math.min(page * limit, pagination.totalDocs)} of{" "}
                  {pagination.totalDocs}
                </div>
                <div className="d-flex justify-content-center gap-2">
                  <Button color="secondary" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>
                    ← Previous
                  </Button>
                  <Button
                    color="secondary"
                    disabled={page === pagination.totalPages}
                    onClick={() => setPage((p) => p + 1)}
                  >
                    Next →
                  </Button>
                </div>
              </div>

              {/* Desktop Layout */}
              <Row className="mt-4 justify-content-center align-items-center d-none d-md-flex">
                <Col xs="auto" className="d-flex justify-content-center">
                  <Button color="secondary" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>
                    ← Previous
                  </Button>
                </Col>
                <Col xs="auto" className="text-center text-muted mx-3">
                  Showing {(page - 1) * limit + 1}–{Math.min(page * limit, pagination.totalDocs)} of{" "}
                  {pagination.totalDocs}
                </Col>
                <Col xs="auto" className="d-flex justify-content-center">
                  <Button
                    color="secondary"
                    disabled={page === pagination.totalPages}
                    onClick={() => setPage((p) => p + 1)}
                  >
                    Next →
                  </Button>
                </Col>
              </Row>
            </>
          )}
        </CardBody>
      </Card>

      {activeTab === TO_GIVE_TAB && writable && (
        <div className="d-flex flex-wrap align-items-center gap-2 mt-2">
          <span className="text-muted small">
            {selectedRows.length > 0 ? `${selectedRows.length} selected` : "Select one or more patients"}
          </span>
          <Button
            color="success"
            className="text-white ms-auto"
            disabled={!selectedRows.length}
            onClick={() => setConfirmModalOpen(true)}
          >
            Submit
          </Button>
        </div>
      )}

      <ConfirmationModal
        isOpen={selectAllWarningOpen}
        toggle={() => setSelectAllWarningOpen(false)}
        title="Select all across multiple centers?"
        message={`You have ${selectedCentersIds.length} centers selected. This will select every patient due for this slot across all of them, and Submit would mark them all as given at once. Continue?`}
        confirmText="Yes, select all"
        confirmColor="warning"
        onConfirm={() => {
          setSelectAllWarningOpen(false);
          runSelectAll();
        }}
        onCancel={() => setSelectAllWarningOpen(false)}
      />

      <ConfirmationModal
        isOpen={confirmModalOpen}
        toggle={closeConfirmModal}
        title={`Mark ${selectedRows.length} patient${selectedRows.length !== 1 ? "s" : ""} as given`}
        confirmText={
          submitting ? (
            <span className="d-flex align-items-center gap-2">
              <Spinner size="sm" />
              {submitProgress ? `Submitting batch ${submitProgress.batch} of ${submitProgress.totalBatches}…` : "Submitting…"}
            </span>
          ) : (
            "Confirm & Submit"
          )
        }
        confirmColor="success"
        confirmDisabled={submitting}
        size="xl"
        onConfirm={handleConfirmSubmit}
        onCancel={closeConfirmModal}
      >
        {selectedRows.length === 1 ? (
          <div className="mb-2">
            <label className="form-label fw-semibold small">
              Comment for {capitalizeWords(selectedRows[0].patientName)}
              {selectedRows[0].patientUid ? ` (${selectedRows[0].patientUid})` : ""} — optional
            </label>
            <Input
              type="textarea"
              rows={3}
              placeholder="Comment for this patient (optional)"
              value={individualComments.get(selectedRows[0].patientId) || ""}
              onChange={(e) =>
                setIndividualComments((prev) => {
                  const next = new Map(prev);
                  if (e.target.value) next.set(selectedRows[0].patientId, e.target.value);
                  else next.delete(selectedRows[0].patientId);
                  return next;
                })
              }
            />
          </div>
        ) : (
          <>
            <div className="mb-3">
              <label className="form-label fw-semibold small">Overall comment (optional)</label>
              <Input
                type="textarea"
                rows={2}
                placeholder="Applies to any patient below without its own comment…"
                value={overallComment}
                onChange={(e) => setOverallComment(e.target.value)}
              />
            </div>
            <Row className="g-2" style={{ maxHeight: 350, overflowY: "auto" }}>
              {selectedRows.map((row) => (
                <Col key={row.patientId} xs={12} md={6}>
                  <div className="d-flex flex-column flex-sm-row align-items-sm-center gap-2 border rounded p-2">
                    <div style={{ minWidth: 140 }} className="small">
                      <div className="fw-semibold">{capitalizeWords(row.patientName)}</div>
                      {row.patientUid && <div className="text-muted">{row.patientUid}</div>}
                    </div>
                    <Input
                      bsSize="sm"
                      placeholder="Comment for this patient (optional)"
                      value={individualComments.get(row.patientId) || ""}
                      onChange={(e) =>
                        setIndividualComments((prev) => {
                          const next = new Map(prev);
                          if (e.target.value) next.set(row.patientId, e.target.value);
                          else next.delete(row.patientId);
                          return next;
                        })
                      }
                    />
                  </div>
                </Col>
              ))}
            </Row>
          </>
        )}
      </ConfirmationModal>
    </div>
  );
};

const mapStateToProps = (state) => ({
  centerAccess: state.User?.centerAccess,
  centers: state.Center.data,
});

export default connect(mapStateToProps)(TodayMedicines);
