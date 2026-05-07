import React, { useEffect, useState } from "react";
import { Modal, ModalHeader, ModalBody, Row, Col, Button, Spinner } from "reactstrap";
import moment from "moment";
import { renderStatusBadge } from "../../../Components/Common/renderStatusBadge";
import { capitalizeWords } from "../../../utils/toCapitalize";
import { normalizeUnderscores } from "../../../utils/normalizeUnderscore";
import { ExpandableText } from "../../../Components/Common/ExpandableText";
import { useDispatch } from "react-redux";
import { fetchMedicineRequisitionById } from "../../../store/features/medicine/medicineSlice";

const MedicineRequisitionDetailModal = ({
  isOpen,
  toggle,
  row,
  handleApprove,
  handleReject,
  hasWritePermission
}) => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);

  useEffect(() => {
    if (isOpen && row?._id) {
      setLoading(true);
      dispatch(fetchMedicineRequisitionById(row._id))
        .unwrap()
        .then((res) => {
          setData(res.data);
          setLoading(false);
        })
        .catch(() => {
          setLoading(false);
        });
    } else if (!isOpen) {
      setData(null);
    }
  }, [isOpen, row?._id, dispatch]);

  if (!isOpen) return null;

  const DataRow = ({ label, value }) => (
    <div className="d-flex justify-content-between py-2 border-bottom border-light">
      <span className="text-muted fs-13">{label}</span>
      <span className="fw-medium text-dark fs-13 text-end ps-3">{value || "—"}</span>
    </div>
  );

  return (
    <Modal isOpen={isOpen} toggle={toggle} size="lg" centered>
      <ModalHeader toggle={toggle} className="bg-white border-bottom-0 pt-4 px-4 pb-2">
        <div className="text-uppercase text-muted fw-bold ls-sm mb-1" style={{ fontSize: "10px" }}>Requisition Details</div>
        <h5 className="fw-bold m-0">{row?.requisitionNumber}</h5>
      </ModalHeader>

      <ModalBody className="px-4 pb-4">
        {loading ? (
          <div className="d-flex justify-content-center align-items-center py-5">
            <Spinner color="primary" />
          </div>
        ) : data ? (
          <>
            {/* Status and User Summary */}
            <div className="bg-light bg-opacity-50 p-3 rounded mb-4">
              <Row>
                <Col md={6}>
                  <div className="text-muted small mb-1">Requested By</div>
                  <div className="fw-bold">{capitalizeWords(data.filledBy?.name || "")}</div>
                  <div className="text-muted small">{capitalizeWords(data.requestingCenter?.title || "")}</div>
                </Col>
                <Col md={6} className="text-md-end mt-2 mt-md-0">
                  <div className="text-muted small mb-1">Current Status</div>
                  <div className="d-flex align-items-center justify-content-md-end gap-2">
                    {renderStatusBadge(data.status)}
                    <span className="text-muted small">
                      {moment(data.createdAt).format("DD MMM YYYY, hh:mm A")}
                    </span>
                  </div>
                </Col>
              </Row>
            </div>

            {/* Medicine Information */}
            <Row className="gx-5">
              <Col md={6}>
                <DataRow label="Medicine Name" value={data.proposedMedicine?.name} />
                <DataRow label="Generic Name" value={data.proposedMedicine?.genericName} />
                <DataRow label="Type" value={normalizeUnderscores(data.proposedMedicine?.type || "")} />
                <DataRow label="Form" value={normalizeUnderscores(data.proposedMedicine?.form || "")} />
                <DataRow label="Strength" value={data.proposedMedicine?.strength} />
              </Col>
              <Col md={6}>
                <DataRow label="Schedule" value={normalizeUnderscores(data.proposedMedicine?.scheduleType)} />
                <DataRow label="Category" value={normalizeUnderscores(data.proposedMedicine?.category)} />
                <DataRow label="Storage" value={normalizeUnderscores(data.proposedMedicine?.storageType)} />
                <DataRow label="Unit Price" value={data.proposedMedicine?.unitPrice ? `₹${data.proposedMedicine?.unitPrice}` : "—"} />
                <DataRow
                  label="Conversion"
                  value={`${data.proposedMedicine?.conversion?.purchaseQuantity || 1} ${normalizeUnderscores(data.proposedMedicine?.purchaseUnit)} = ${data.proposedMedicine?.conversion?.baseQuantity || 1} ${normalizeUnderscores(data.proposedMedicine?.baseUnit)}`}
                />
              </Col>
            </Row>

            <div className="mt-4 pt-2">
              <Row className="g-4">
                <Col md={6}>
                  <div className="text-muted small mb-1 fw-bold text-uppercase" style={{ fontSize: '10px' }}>Composition</div>
                  <div className="fs-13 text-dark fw-medium">
                    <ExpandableText
                      text={capitalizeWords(data.proposedMedicine?.composition || "")}
                      limit={100}
                    />
                  </div>
                </Col>
                <Col md={6}>
                  <div className="text-muted small mb-1 fw-bold text-uppercase" style={{ fontSize: '10px' }}>Instructions</div>
                  <div className="fs-13 text-dark fw-medium">
                    <ExpandableText
                      text={capitalizeWords(data.proposedMedicine?.instruction || "")}
                      limit={100}
                    />
                  </div>
                </Col>
                <Col md={12}>
                  <div className="text-muted small mb-1 fw-bold text-uppercase" style={{ fontSize: '10px' }}>Justification</div>
                  <div className="fs-13 text-muted" style={{ fontStyle: 'italic' }}>
                    <ExpandableText
                      text={capitalizeWords(data.justification || "")}
                      limit={150}
                    />
                  </div>
                </Col>
              </Row>
            </div>

            {data.status !== "PENDING" && data.review && (
              <div className="mt-4 pt-4 border-top">
                <Row>
                  <Col md={8}>
                    <div className="text-muted small text-uppercase mb-1 fw-bold" style={{ fontSize: '10px' }}>Reviewer Remarks</div>
                    <div className="fw-medium text-dark mb-2">
                      <ExpandableText text={capitalizeWords(data.review.remarks || "")} limit={150} />
                    </div>
                    {data.status === "APPROVED" && data.approvedMedicineId?.id && (
                      <div className="d-inline-flex align-items-center gap-2 bg-light px-2 py-1 rounded">
                        <span className="text-muted small fw-bold">MEDICINE ID:</span>
                        <span className="badge bg-success-subtle text-success border border-success-subtle">{data.approvedMedicineId.id}</span>
                      </div>
                    )}
                  </Col>
                  <Col md={4} className="text-md-end mt-2 mt-md-0">
                    <div className="text-muted small">Reviewed By</div>
                    <div className="fw-bold">{capitalizeWords(data.review.actionBy?.name )|| "System"}</div>
                    <div className="text-muted small">{moment(data.review.actionAt || data.review.reviewedAt).format("DD MMM YYYY")}</div>
                  </Col>
                </Row>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-5 text-muted">Failed to load details.</div>
        )}
      </ModalBody>
      <div className="modal-footer border-top-0 px-4 pb-4 gap-2">
        {data?.status === "PENDING" && hasWritePermission && (
          <>
            <Button
              color="danger"
              className="px-4 text-white"
              onClick={() => {
                toggle();
                handleReject(data);
              }}
            >
              Reject
            </Button>
            <Button
              color="success"
              className="px-4 text-white"
              onClick={() => {
                toggle();
                handleApprove(data);
              }}
            >
              Approve
            </Button>
          </>
        )}
      </div>
    </Modal>
  );
};

export default MedicineRequisitionDetailModal;
