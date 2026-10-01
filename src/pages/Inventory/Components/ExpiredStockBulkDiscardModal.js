import React, { useEffect, useState } from "react";
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  Spinner,
} from "reactstrap";
import moment from "moment";
import * as XLSX from "xlsx";
import { toast } from "react-toastify";
import { getExpiredStock, discardAllExpiredStock } from "../../../helpers/backend_helper";

const MAX_CHUNK_CALLS = 1000;

const ExpiredStockBulkDiscardModal = ({
  isOpen,
  closeModal,
  centers,
  centerLabel,
  isAllCenters,
  remarks,
  setRemarks,
  onComplete,
}) => {
  const PREVIEW_PAGE_SIZE = 25;

  const [previewLoading, setPreviewLoading] = useState(false);
  const [rows, setRows] = useState([]);
  const [truncated, setTruncated] = useState(false);
  const [acknowledged, setAcknowledged] = useState(false);
  const [previewPage, setPreviewPage] = useState(1);
  const [discarding, setDiscarding] = useState(false);
  const [progress, setProgress] = useState({ discarded: 0, skipped: 0 });

  const centerKey = (centers || []).join(",");

  useEffect(() => {
    if (!isOpen || !centers?.length) {
      setRows([]);
      setTruncated(false);
      setAcknowledged(false);
      setPreviewPage(1);
      setDiscarding(false);
      setProgress({ discarded: 0, skipped: 0 });
      return;
    }

    setPreviewLoading(true);
    setAcknowledged(false);
    setPreviewPage(1);
    setProgress({ discarded: 0, skipped: 0 });
    // all=true so this previews everything that will be discarded, not just
    // the page currently on screen. The on-screen table is paginated client
    // side below — the fetch itself still pulls the whole (capped) set, both
    // so the Excel export has everything and so the discard count shown
    // matches what the server will actually process.
    getExpiredStock({ centers, all: true })
      .then((res) => {
        setRows(res?.data || []);
        setTruncated(!!res?.truncated);
      })
      .catch(() => {
        setRows([]);
        setTruncated(false);
      })
      .finally(() => setPreviewLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, centerKey]);

  const pageCount = Math.max(1, Math.ceil(rows.length / PREVIEW_PAGE_SIZE));
  const pagedRows = rows.slice(
    (previewPage - 1) * PREVIEW_PAGE_SIZE,
    previewPage * PREVIEW_PAGE_SIZE
  );

  const totalUnits = rows.reduce((sum, r) => sum + (r.stock || 0), 0);
  const affectedCenters = [
    ...new Set(rows.map((r) => r.center?.title).filter(Boolean)),
  ];
  const spansMultipleCenters = affectedCenters.length > 1;
  const needsAcknowledgement = isAllCenters && spansMultipleCenters;

  const downloadExcel = () => {
    if (rows.length === 0) return;

    const sheet = rows.map((r) => ({
      "PHR ID": r.id || "",
      "Medicine": [r.medicine?.type, r.medicineName, r.Strength]
        .filter(Boolean)
        .join(" "),
      "Generic Name": r.medicine?.genericName || "",
      "Batch": r.Batch || "",
      "Expiry": r.expiryDate
        ? moment.utc(r.expiryDate).format("DD MMM YYYY")
        : r.Expiry || "",
      "Center": r.center?.title || "",
      "Stock Discarded": r.stock ?? 0,
      "Unit": r.medicine?.baseUnit || "",
      "Company": r.company || "",
    }));

    const ws = XLSX.utils.json_to_sheet(sheet);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Discarded Stock");
    XLSX.writeFile(
      wb,
      `expired-stock-discard-${moment().format("YYYY-MM-DD")}.xlsx`
    );
    toast.success("Excel downloaded");
  };

  // One chunk at a time, waiting for each response before sending the next —
  // no queue, no background job, just small bounded requests in series so
  // none can hit a proxy timeout, with a progress bar updating between calls.
  // Each discard $pulls the rows it processes, so the next call's "first N
  // eligible" is naturally the next slice; no offset to track.
  const runBulkDiscard = async () => {
    setDiscarding(true);
    let discardedTotal = 0;
    let skippedTotal = 0;
    const previewTotal = rows.length;

    try {
      for (let i = 0; i < MAX_CHUNK_CALLS; i += 1) {
        const res = await discardAllExpiredStock({
          centers,
          remarks: remarks.trim(),
        });

        const discardedNow = res?.data?.discarded?.length || 0;
        const skippedNow = res?.data?.skipped?.length || 0;
        discardedTotal += discardedNow;
        skippedTotal += skippedNow;
        setProgress({ discarded: discardedTotal, skipped: skippedTotal });

        const madeProgress = discardedNow + skippedNow > 0;
        const reachedPreviewedScope = discardedTotal + skippedTotal >= previewTotal;

        if (!res?.hasMore || !madeProgress || reachedPreviewedScope) break;
      }

      onComplete?.({ discardedTotal, skippedTotal });
    } catch (error) {
      onComplete?.({ discardedTotal, skippedTotal, error });
    } finally {
      setDiscarding(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      toggle={discarding ? undefined : closeModal}
      centered
      size="xl"
    >
      <ModalHeader toggle={discarding ? undefined : closeModal}>
        Discard All Expired Stock
      </ModalHeader>
      <ModalBody>
        {previewLoading ? (
          <div className="d-flex justify-content-center align-items-center py-5">
            <Spinner color="primary" />
          </div>
        ) : discarding ? (
          <div className="py-5 px-4">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <span className="fw-semibold" style={{ fontSize: 13 }}>
                Discarding…
              </span>
              <span className="text-muted" style={{ fontSize: 12 }}>
                {progress.discarded + progress.skipped} of {rows.length}
              </span>
            </div>
            <div className="progress" style={{ height: 8 }}>
              <div
                className="progress-bar bg-danger"
                style={{
                  width: `${Math.min(
                    100,
                    ((progress.discarded + progress.skipped) /
                      Math.max(1, rows.length)) *
                    100
                  )}%`,
                }}
              />
            </div>
            <p className="text-muted mt-2 mb-0" style={{ fontSize: 12 }}>
              Please don't close this window until it finishes.
            </p>
          </div>
        ) : rows.length === 0 ? (
          <div className="text-center text-muted py-5">
            No expired stock to discard for {centerLabel}.
          </div>
        ) : (
          <>
            {needsAcknowledgement && (
              <div
                className="d-flex align-items-start gap-2 p-3 mb-3"
                style={{
                  background: "#fff8e6",
                  border: "1px solid #ffe08a",
                  borderRadius: 8,
                }}
              >
                <i className="bx bx-error fs-5" style={{ color: "#b7791f" }} />
                <div style={{ fontSize: 13, color: "#856404" }}>
                  You have <strong>All Centers</strong> selected. This will
                  discard expired stock across{" "}
                  <strong>{affectedCenters.length} centers</strong> at once:{" "}
                  {affectedCenters.join(", ")}.
                </div>
              </div>
            )}

            {truncated && (
              <div
                className="d-flex align-items-start gap-2 p-3 mb-3"
                style={{
                  background: "#fff8e6",
                  border: "1px solid #ffe08a",
                  borderRadius: 8,
                }}
              >
                <i className="bx bx-info-circle fs-5" style={{ color: "#b7791f" }} />
                <div style={{ fontSize: 13, color: "#856404" }}>
                  There are more than <strong>{rows.length}</strong> eligible
                  batches at the selected scope. Only the first{" "}
                  <strong>{rows.length}</strong> are shown and will be
                  discarded. Narrow by a single center and run this again to
                  cover the rest.
                </div>
              </div>
            )}

            <div
              className="d-flex align-items-start gap-2 p-3 mb-3"
              style={{
                background: "#fff5f5",
                border: "1px solid #ffc9c9",
                borderRadius: 8,
              }}
            >
              <i className="bx bx-error-circle fs-5 text-danger" />
              <div style={{ fontSize: 13 }}>
                This will remove <strong>{rows.length}</strong> batch(es) —{" "}
                <strong>{totalUnits}</strong> unit(s) in total — from their
                center's inventory. A batch stocked only at that center will be
                deleted entirely.
                <div className="text-muted mt-1" style={{ fontSize: 12 }}>
                  This cannot be undone. Download the list first if you need a
                  record.
                </div>
              </div>
            </div>

            <div className="d-flex justify-content-between align-items-center mb-2">
              <span className="fw-semibold" style={{ fontSize: 13 }}>
                Medicines being discarded
              </span>
              <Button
                color="success"
                outline
                size="sm"
                onClick={downloadExcel}
                className="d-flex align-items-center gap-1"
              >
                <i className="bx bx-download" />
                Download Excel
              </Button>
            </div>

            <div
              className="table-responsive mb-3"
              style={{ maxHeight: 320, overflowY: "auto" }}
            >
              <table className="table table-sm table-hover mb-0">
                <thead
                  style={{
                    position: "sticky",
                    top: 0,
                    background: "#f8f9fa",
                    zIndex: 1,
                  }}
                >
                  <tr>
                    {["PHR ID", "Medicine", "Batch", "Expiry", "Center", "Stock"].map(
                      (h) => (
                        <th
                          key={h}
                          className="fw-semibold"
                          style={{ fontSize: 12, whiteSpace: "nowrap" }}
                        >
                          {h}
                        </th>
                      )
                    )}
                  </tr>
                </thead>
                <tbody>
                  {pagedRows.map((r) => (
                    <tr key={`${r._id}-${r.centerId}`}>
                      <td style={{ fontSize: 12 }} className="text-primary">
                        {r.id}
                      </td>
                      <td style={{ fontSize: 12 }} className="text-uppercase">
                        {[r.medicine?.type, r.medicineName, r.Strength]
                          .filter(Boolean)
                          .join(" ")}
                      </td>
                      <td style={{ fontSize: 12 }}>{r.Batch || "—"}</td>
                      <td style={{ fontSize: 12 }}>
                        {r.expiryDate
                          ? moment.utc(r.expiryDate).format("DD MMM YYYY")
                          : r.Expiry || "—"}
                      </td>
                      <td style={{ fontSize: 12 }}>{r.center?.title || "—"}</td>
                      <td
                        style={{ fontSize: 12 }}
                        className={`fw-bold text-nowrap ${r.stock > 0 ? "text-danger" : "text-muted"}`}
                      >
                        {r.stock > 0 ? `${r.stock} ${r.medicine?.baseUnit || ""}` : "Empty"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {rows.length > PREVIEW_PAGE_SIZE && (
              <div className="d-flex justify-content-between align-items-center mb-3">
                <span className="text-muted" style={{ fontSize: 12 }}>
                  Showing {(previewPage - 1) * PREVIEW_PAGE_SIZE + 1}–
                  {Math.min(previewPage * PREVIEW_PAGE_SIZE, rows.length)} of{" "}
                  {rows.length}
                </span>
                <div className="d-flex align-items-center gap-2">
                  <Button
                    color="secondary"
                    outline
                    size="sm"
                    disabled={previewPage === 1}
                    onClick={() => setPreviewPage((p) => Math.max(1, p - 1))}
                  >
                    <i className="bx bx-chevron-left" />
                  </Button>
                  <span style={{ fontSize: 12 }}>
                    Page {previewPage} of {pageCount}
                  </span>
                  <Button
                    color="secondary"
                    outline
                    size="sm"
                    disabled={previewPage === pageCount}
                    onClick={() => setPreviewPage((p) => Math.min(pageCount, p + 1))}
                  >
                    <i className="bx bx-chevron-right" />
                  </Button>
                </div>
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Remarks (Optional)</label>
              <Input
                type="textarea"
                rows={2}
                placeholder="Reason or reference for this write-off..."
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
              />
            </div>

            <div className="form-check mt-3">
              <input
                className="form-check-input"
                type="checkbox"
                id="bulk-discard-ack"
                checked={acknowledged}
                onChange={(e) => setAcknowledged(e.target.checked)}
              />
              <label
                className="form-check-label fw-semibold"
                htmlFor="bulk-discard-ack"
                style={{ fontSize: 13 }}
              >
                I acknowledge that these {rows.length} batch(es) of expired stock
                {needsAcknowledgement
                  ? ` across ${affectedCenters.length} centers`
                  : ""}{" "}
                have been physically discarded and should be cleared from
                inventory.
              </label>
            </div>
          </>
        )}
      </ModalBody>
      <ModalFooter>
        <Button color="light" onClick={closeModal} disabled={discarding}>
          Cancel
        </Button>
        <Button
          color="danger"
          className="text-white"
          onClick={runBulkDiscard}
          disabled={
            discarding || previewLoading || rows.length === 0 || !acknowledged
          }
        >
          {discarding ? (
            <Spinner size="sm" />
          ) : (
            `Discard All (${rows.length})`
          )}
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default ExpiredStockBulkDiscardModal;
