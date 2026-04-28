import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { Button, Container, Row, Col, Spinner, Input, Label, FormGroup } from "reactstrap";
import _ from "lodash";

const DEFAULT_CHUNK_SIZE = 50;

const BatchSelector = ({ charts, onSelect, onDownloadAll, downloadingAll, downloadProgress, failedBatches }) => {
  const [chunkSize, setChunkSize] = useState(DEFAULT_CHUNK_SIZE);
  const batches = _.chunk(charts || [], chunkSize);

  const [rangeFrom, setRangeFrom] = useState(1);
  const [rangeTo, setRangeTo] = useState(1);

  useEffect(() => {
    setRangeFrom(1);
    setRangeTo(batches.length);
  }, [batches.length]);

  const getBatchLabel = (batchIndex) => {
    const start = batchIndex * chunkSize + 1;
    const end = Math.min((batchIndex + 1) * chunkSize, charts.length);
    return `${start} – ${end}`;
  };

  const handleRangeDownload = () => {
    const from = Math.max(1, Math.min(rangeFrom, batches.length));
    const to = Math.max(from, Math.min(rangeTo, batches.length));
    onDownloadAll(batches.slice(from - 1, to), from);
  };

  const clampedFrom = Math.max(1, Math.min(rangeFrom, batches.length));
  const clampedTo = Math.max(clampedFrom, Math.min(rangeTo, batches.length));
  const rangeCount = clampedTo - clampedFrom + 1;

  return (
    <Container className="py-4" style={{ maxWidth: 960 }}>

      {/* ── Header ── */}
      <div className="text-center mb-3">
        <h5 className="fw-semibold mb-1">Select Charts Batch to Print</h5>
        <p className="text-muted small mb-0">Total charts: <strong>{charts?.length || 0}</strong></p>
      </div>

      {/* ── Notes ── */}
      <div
        className="mb-4 p-3 rounded small text-muted w-100"
        style={{ background: "#f8f9fa", border: "1px dashed #dee2e6", lineHeight: 1.8 }}
      >
        <div className="fw-semibold text-dark mb-1">Notes</div>
        <div>• If downloads <strong>fail or crash</strong>, lower the charts per batch number.</div>
        <div>• To download <strong>specific batches</strong>, set the From / To range and click Download Range.</div>
        <div>• To download <strong>everything</strong>, use the Download All button.</div>
        <div>• Click any batch button to <strong>preview</strong> it before downloading.</div>
      </div>

      {/* ── Chunk size control ── */}
      <div className="d-flex justify-content-center align-items-center gap-3 mb-3">
        <div className="d-flex align-items-center gap-2 p-2 px-3 border rounded bg-light">
          <Label className="mb-0 small fw-semibold text-nowrap">Charts per batch</Label>
          <Input
            type="number"
            bsSize="sm"
            min={1}
            max={50}
            value={chunkSize}
            onChange={(e) => setChunkSize(Math.min(50, Math.max(1, Number(e.target.value))))}
            style={{ width: 70 }}
            disabled={downloadingAll}
          />
          <span className="text-muted small text-nowrap">{batches.length} batches</span>
        </div>
      </div>

      {/* ── Batch grid ── */}
      <Row className="g-2 justify-content-center mb-4">
        {batches.map((batch, index) => {
          const batchNum = index + 1;
          const failed = failedBatches?.includes(batchNum);
          const inRange = !downloadingAll && batchNum >= rangeFrom && batchNum <= rangeTo;
          return (
            <Col key={index} xs="auto">
              <Button
                color={failed ? "danger" : inRange ? "success" : "primary"}
                outline={!failed && !inRange}
                onClick={() => onSelect(batch, index)}
                style={{ minWidth: 110, lineHeight: 1.3 }}
                title={failed ? "Failed — click to preview/download individually" : undefined}
              >
                <div style={{ fontSize: "0.68em", opacity: 0.8 }}>Batch {batchNum}{failed ? " ✕" : ""}</div>
                <div style={{ fontSize: "0.85em" }}>{getBatchLabel(index)}</div>
              </Button>
            </Col>
          );
        })}
      </Row>

      {/* ── Download controls ── */}
      {onDownloadAll && batches.length > 0 && (
        <div
          className="mx-auto p-3 rounded"
          style={{ background: "#f8f9fa", border: "1px solid #dee2e6", maxWidth: 560 }}
        >
          {/* Range row */}
          <div className="d-flex align-items-end gap-2 mb-3">
            <FormGroup className="mb-0 flex-fill">
              <Label className="small fw-semibold mb-1">From batch</Label>
              <Input
                type="number"
                bsSize="sm"
                min={1}
                max={batches.length}
                value={rangeFrom}
                onChange={(e) => setRangeFrom(Number(e.target.value))}
                disabled={downloadingAll}
              />
            </FormGroup>
            <FormGroup className="mb-0 flex-fill">
              <Label className="small fw-semibold mb-1">To batch</Label>
              <Input
                type="number"
                bsSize="sm"
                min={1}
                max={batches.length}
                value={rangeTo}
                onChange={(e) => setRangeTo(Number(e.target.value))}
                disabled={downloadingAll}
              />
            </FormGroup>
            <Button
              color="success"
              size="sm"
              onClick={handleRangeDownload}
              disabled={downloadingAll || rangeCount <= 0}
              style={{ whiteSpace: "nowrap" }}
            >
              {downloadingAll ? (
                <><Spinner size="sm" className="me-1" />{downloadProgress || "Preparing..."}</>
              ) : (
                `Download Batches ${clampedFrom}–${clampedTo} (${rangeCount})`
              )}
            </Button>
          </div>

          {/* Divider */}
          <div className="d-flex align-items-center gap-2 mb-3">
            <hr className="flex-fill m-0" />
            <span className="text-muted small">or</span>
            <hr className="flex-fill m-0" />
          </div>

          {/* Download all */}
          <div className="text-center">
            <Button
              color="primary"
              onClick={() => onDownloadAll(batches, 1)}
              disabled={downloadingAll}
            >
              {downloadingAll ? (
                <><Spinner size="sm" className="me-2" />{downloadProgress || "Preparing..."}</>
              ) : (
                `Download All ${batches.length} Batches`
              )}
            </Button>
          </div>

          {/* Result message */}
          {!downloadingAll && downloadProgress && (
            <p className={`text-center mt-2 mb-0 small ${failedBatches?.length > 0 ? "text-danger" : "text-success"}`}>
              {downloadProgress}
            </p>
          )}
        </div>
      )}

    </Container>
  );
};

BatchSelector.propTypes = {
  charts: PropTypes.array.isRequired,
  onSelect: PropTypes.func.isRequired,
  onDownloadAll: PropTypes.func,
  downloadingAll: PropTypes.bool,
  downloadProgress: PropTypes.string,
  failedBatches: PropTypes.array,
};

export default BatchSelector;
