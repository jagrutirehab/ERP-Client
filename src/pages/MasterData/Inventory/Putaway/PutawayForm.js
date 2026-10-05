import React, { useState, useEffect, useRef } from "react";
import { Row, Col, Label, Input, Button, Modal, ModalBody } from "reactstrap";
import { toast } from "react-toastify";
import { Html5Qrcode } from "html5-qrcode";
import { createPutaway, getStorageLocations } from "../../../../helpers/backend_helper";
import { useAuthError } from "../../../../Components/Hooks/useAuthError";
import "../../UnitOfMeasurement/uom.scss";

const PutawayForm = ({ di, onSaved, onCancel }) => {
  const handleAuthError = useAuthError();
  const [submitting, setSubmitting] = useState(false);
  const [remarks, setRemarks] = useState("");
  const [locations, setLocations] = useState([]);
  const [groups, setGroups] = useState([]);
  const [tagCode, setTagCode] = useState("");
  const [scannerOpen, setScannerOpen] = useState(false);
  const scannerRef = useRef(null);

  const centerId = di?.poId?.deliverySiteId?._id || di?.poId?.deliverySiteId;

  useEffect(() => {
    if (!di) return;
    setGroups(
      (di.lineItems || []).map((li) => ({
        itemName: li.itemName,
        receivedQty: li.receivedQty,
        splits: [{ storageLocationId: "", quantity: li.receivedQty, remarks: "" }],
      })),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [di]);

  useEffect(() => {
    if (!centerId) return;
    getStorageLocations({ centerId, status: "active" })
      .then((res) => setLocations(res?.data || []))
      .catch(() => {});
  }, [centerId]);

  useEffect(() => {
    if (!scannerOpen) return;

    const timer = setTimeout(() => {
      const scanner = new Html5Qrcode("qr-reader-region");
      scannerRef.current = scanner;

      scanner
        .start(
          { facingMode: "environment" },
          { fps: 10, qrbox: 250 },
          (decodedText) => {
            setTagCode(decodedText);
            toast.success(`Scanned: ${decodedText}`);
            closeScanner();
          },
          () => {
            // ignore per-frame scan failures — fires constantly while scanning
          },
        )
        .catch(() => {
          toast.error("Couldn't access camera. Check browser permissions.");
          setScannerOpen(false);
        });
    }, 300); // wait for the Modal's DOM to actually mount

    return () => {
      clearTimeout(timer);
      if (scannerRef.current) {
        scannerRef.current
          .stop()
          .then(() => scannerRef.current.clear())
          .catch(() => {});
        scannerRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scannerOpen]);

  const openScanner = () => setScannerOpen(true);

  const closeScanner = () => {
    if (scannerRef.current) {
      scannerRef.current
        .stop()
        .then(() => scannerRef.current.clear())
        .catch(() => {});
      scannerRef.current = null;
    }
    setScannerOpen(false);
  };

  if (!di) {
    return (
      <div className="uom-page">
        <div className="uom-empty-state">
          <p className="uom-empty-title">No GRN selected</p>
          <p className="uom-empty-sub">Please go back and select a GRN to put away.</p>
          <Button color="light" onClick={onCancel}>
            <i className="bx bx-arrow-back me-1"></i> Back
          </Button>
        </div>
      </div>
    );
  }

  const updateSplit = (groupIdx, splitIdx, field, value) => {
    setGroups((prev) =>
      prev.map((g, gi) =>
        gi !== groupIdx
          ? g
          : {
              ...g,
              splits: g.splits.map((s, si) => (si !== splitIdx ? s : { ...s, [field]: value })),
            },
      ),
    );
  };

  const addSplit = (groupIdx) => {
    setGroups((prev) =>
      prev.map((g, gi) =>
        gi !== groupIdx
          ? g
          : { ...g, splits: [...g.splits, { storageLocationId: "", quantity: 0, remarks: "" }] },
      ),
    );
  };

  const removeSplit = (groupIdx, splitIdx) => {
    setGroups((prev) =>
      prev.map((g, gi) =>
        gi !== groupIdx ? g : { ...g, splits: g.splits.filter((_, si) => si !== splitIdx) },
      ),
    );
  };

  const groupTotal = (group) => group.splits.reduce((sum, s) => sum + (Number(s.quantity) || 0), 0);

  const handleSubmit = async (e) => {
    e.preventDefault();

    for (const g of groups) {
      const total = groupTotal(g);
      if (total !== g.receivedQty) {
        return toast.error(
          `"${g.itemName}": split quantities total ${total}, must equal received qty ${g.receivedQty}`,
        );
      }
      if (g.splits.some((s) => !s.storageLocationId || Number(s.quantity) <= 0)) {
        return toast.error(`"${g.itemName}": every split needs a location and a quantity > 0`);
      }
    }

    setSubmitting(true);
    try {
      const lineItems = groups.flatMap((g) =>
        g.splits.map((s) => ({
          itemName: g.itemName,
          putawayQty: Number(s.quantity),
          storageLocationId: s.storageLocationId,
          remarks: s.remarks,
        })),
      );

      const res = await createPutaway({
        grnId: di._id,
        remarks,
        tagCode: tagCode || undefined,
        lineItems,
      });
      toast.success(
        res?.data?.linkedTag
          ? `Putaway recorded — tag ${res.data.linkedTag.tagCode} linked`
          : "Putaway recorded successfully",
      );
      onSaved();
    } catch (error) {
      if (!handleAuthError(error)) {
        toast.error(error?.response?.data?.message || error?.message || "Something went wrong");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="uom-form-page">
      <div className="d-flex justify-content-between align-items-start mb-1">
        <h4 className="uom-form-title mb-0">Assign Storage Locations</h4>
        <Button color="primary" onClick={handleSubmit} disabled={submitting}>
          {submitting ? "Saving..." : "Save Putaway"}
        </Button>
      </div>
      <p className="text-muted mb-4">
        GRN: <strong>{di.grnNumber}</strong> · PO: <strong>{di.poId?.poNumber}</strong>
      </p>

      <div className="uom-form-panel">
        <form onSubmit={handleSubmit}>
          <Label>TEMP Tag Code (optional — scan or enter to link this putaway)</Label>
          <div className="d-flex gap-2 mb-4">
            <Input
              value={tagCode}
              onChange={(e) => setTagCode(e.target.value)}
              placeholder="e.g. TEMP000001"
            />
            <Button type="button" color="light" onClick={openScanner} style={{ flexShrink: 0 }}>
              <i className="bx bx-scan me-1"></i> Scan
            </Button>
          </div>

          {groups.map((g, gIdx) => {
            const total = groupTotal(g);
            const remaining = g.receivedQty - total;
            return (
              <div key={gIdx} className="uom-table-card p-3 mb-3">
                <div className="d-flex justify-content-between mb-2">
                  <div className="fw-semibold">{g.itemName}</div>
                  <div className={`small ${remaining !== 0 ? "text-danger fw-semibold" : "text-success"}`}>
                    Allocated {total} / {g.receivedQty}
                    {remaining !== 0 && ` (${remaining} left to allocate)`}
                  </div>
                </div>
                {g.splits.map((s, sIdx) => (
                  <Row key={sIdx} className="mb-2 align-items-end">
                    <Col md={5}>
                      <Label className="small">Storage Location</Label>
                      <Input
                        type="select"
                        value={s.storageLocationId}
                        onChange={(e) => updateSplit(gIdx, sIdx, "storageLocationId", e.target.value)}
                      >
                        <option value="">Select location</option>
                        {locations.map((loc) => (
                          <option key={loc._id} value={loc._id}>
                            {loc.name} ({loc.code})
                          </option>
                        ))}
                      </Input>
                    </Col>
                    <Col md={3}>
                      <Label className="small">Quantity</Label>
                      <Input
                        type="number"
                        min={1}
                        value={s.quantity}
                        onFocus={(e) => e.target.select()}
                        onChange={(e) => updateSplit(gIdx, sIdx, "quantity", e.target.value)}
                      />
                    </Col>
                    <Col md={3}>
                      <Label className="small">Remarks</Label>
                      <Input
                        value={s.remarks}
                        onChange={(e) => updateSplit(gIdx, sIdx, "remarks", e.target.value)}
                      />
                    </Col>
                    <Col md={1}>
                      <Button
                        color="light"
                        disabled={g.splits.length === 1}
                        onClick={() => removeSplit(gIdx, sIdx)}
                      >
                        <i className="bx bx-trash text-danger"></i>
                      </Button>
                    </Col>
                  </Row>
                ))}

                <Button color="light" size="sm" onClick={() => addSplit(gIdx)}>
                  <i className="bx bx-plus me-1"></i> Split to another location
                </Button>
              </div>
            );
          })}

          <Label className="mt-3">Overall Remarks</Label>
          <Input type="textarea" rows={2} value={remarks} onChange={(e) => setRemarks(e.target.value)} />

          <div className="uom-form-footer d-flex justify-content-end gap-2 mt-3">
            <Button type="button" color="light" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" color="primary" disabled={submitting}>
              {submitting ? "Saving..." : "Save Putaway"}
            </Button>
          </div>
        </form>
      </div>

      <Modal isOpen={scannerOpen} toggle={closeScanner} centered>
        <ModalBody className="p-4">
          <h5 className="mb-3">Scan TEMP Tag QR Code</h5>
          <div id="qr-reader-region" style={{ width: "100%" }}></div>
          <div className="text-muted small mt-2">
            Point your camera at the QR code printed on the tag.
          </div>
          <div className="d-flex justify-content-end mt-3">
            <Button color="light" onClick={closeScanner}>
              Cancel
            </Button>
          </div>
        </ModalBody>
      </Modal>
    </div>
  );
};

export default PutawayForm;