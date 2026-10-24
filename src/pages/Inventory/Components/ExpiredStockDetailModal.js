import React, { useEffect, useState } from "react";
import { Modal, ModalHeader, ModalBody, ModalFooter, Row, Col, Button, Spinner } from "reactstrap";
import moment from "moment";
import { useDispatch } from "react-redux";
import { capitalizeWords } from "../../../utils/toCapitalize";
import { normalizeUnderscores } from "../../../utils/normalizeUnderscore";
import { fetchExpiredStockDetails } from "../../../store/features/pharmacy/pharmacySlice";

const DataRow = ({ label, value }) => (
  <div className="d-flex justify-content-between py-2 border-bottom border-light">
    <span className="text-muted fs-13">{label}</span>
    <span className="fw-medium text-dark fs-13 text-end ps-3 text-uppercase">
      {value === 0 ? 0 : value || "—"}
    </span>
  </div>
);

const SectionTitle = ({ children }) => (
  <div
    className="text-uppercase text-muted fw-bold ls-sm mt-3 mb-1"
    style={{ fontSize: 10 }}
  >
    {children}
  </div>
);

const money = (n) =>
  n === null || n === undefined || n === "" ? "—" : `₹${Number(n).toFixed(2)}`;

const ExpiredStockDetailModal = ({
  isOpen,
  toggle,
  row,
  handleDiscard,
  hasWritePermission,
}) => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);

  useEffect(() => {
    if (isOpen && row?._id && row?.centerId) {
      setLoading(true);
      dispatch(fetchExpiredStockDetails({ id: row._id, center: row.centerId }))
        .unwrap()
        .then((res) => {
          setData(res.data);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    } else if (!isOpen) {
      setData(null);
    }
  }, [isOpen, row?._id, row?.centerId, dispatch]);

  if (!isOpen) return null;

  const med = data?.medicineId;
  // expiryDate is stored at UTC midnight of the labelled day, so read it in UTC.
  const expiry = data?.expiryDate ? moment.utc(data.expiryDate) : null;
  const daysAgo = expiry ? moment.utc().startOf("day").diff(expiry, "days") : null;

  return (
    <Modal isOpen={isOpen} toggle={toggle} size="xl">
      <ModalHeader toggle={toggle} className="bg-white border-bottom-0 pt-4 px-4 pb-2">
        <div
          className="text-uppercase text-muted fw-bold ls-sm mb-1"
          style={{ fontSize: 10 }}
        >
          Inventory Details
        </div>
        <h5 className="fw-bold m-0">
          {row?.medicineName || "—"}
          {row?.id && <span className="text-primary ms-2 fs-14">{row.id}</span>}
        </h5>
      </ModalHeader>

      <ModalBody className="px-4 pb-4">
        {loading ? (
          <div className="d-flex justify-content-center align-items-center py-5">
            <Spinner color="primary" />
          </div>
        ) : data ? (
          <>
            <div
              className="d-flex align-items-start gap-2 p-3 rounded mb-3"
              style={{ background: "#fff5f5", border: "1px solid #ffc9c9" }}
            >
              <i className="bx bx-calendar-x fs-5 text-danger" />
              <div style={{ fontSize: 13 }}>
                Expired on <strong>{expiry ? expiry.format("DD MMM YYYY") : "—"}</strong>
                {daysAgo !== null && (
                  <span className="text-muted">
                    {" "}
                    ({daysAgo} day{daysAgo === 1 ? "" : "s"} ago)
                  </span>
                )}
                <div className="text-muted mt-1" style={{ fontSize: 12 }}>
                  Labelled expiry: {data.Expiry || "—"}
                </div>
              </div>
            </div>

            <div className="bg-light bg-opacity-50 p-3 rounded mb-2">
              <Row>
                <Col md={6}>
                  <div className="text-muted small mb-1">Center</div>
                  <div className="fw-bold">
                    {capitalizeWords(data.center?.title || "—")}
                  </div>
                </Col>
                <Col md={6} className="text-md-end mt-2 mt-md-0">
                  <div className="text-muted small mb-1">Stock at this center</div>
                  <div className={`fw-bold fs-5 ${data.centerStock > 0 ? "text-danger" : "text-muted"}`}>
                    {data.centerStock > 0 ? `${data.centerStock} ${med?.baseUnit || ""}` : "Empty"}
                  </div>
                </Col>
              </Row>
            </div>

            <Row>
              <Col md={6}>
                <SectionTitle>Batch</SectionTitle>
                <DataRow label="PHR ID" value={data.id} />
                <DataRow label="Batch No" value={data.Batch} />
                <DataRow label="Rack" value={data.RackNum} />
                <DataRow label="Code" value={data.code} />
                <DataRow
                  label="Status"
                  value={normalizeUnderscores(data.Status || "")}
                />
                <DataRow label="Company" value={data.company} />
                <DataRow label="Manufacturer" value={data.manufacturer} />

                <SectionTitle>Pricing</SectionTitle>
                <DataRow label="Cost Price" value={money(data.costprice)} />
                <DataRow label="Purchase Price" value={money(data.purchasePrice)} />
                <DataRow label="MRP" value={money(data.mrp)} />
                <DataRow label="Sales Price" value={money(data.SalesPrice)} />
              </Col>

              <Col md={6}>
                <SectionTitle>Medicine</SectionTitle>
                <DataRow label="Medicine ID" value={med?.id} />
                <DataRow label="Name" value={med?.name} />
                <DataRow label="Generic Name" value={med?.genericName} />
                <DataRow label="Type" value={med?.type} />
                <DataRow label="Form" value={normalizeUnderscores(med?.form || "")} />
                <DataRow label="Strength" value={data.Strength || med?.strength} />
                <DataRow label="Unit" value={data.unitType || med?.unit} />
                <DataRow label="Base Unit" value={normalizeUnderscores(med?.baseUnit || "")} />
                <DataRow label="Purchase Unit" value={normalizeUnderscores(med?.purchaseUnit || "")} />
                <DataRow
                  label="Conversion"
                  value={
                    med?.baseUnit &&
                      med?.purchaseUnit &&
                      med?.conversion?.baseQuantity &&
                      med?.conversion?.purchaseQuantity
                      ? `${med.conversion.purchaseQuantity} ${normalizeUnderscores(med.purchaseUnit)} = ${med.conversion.baseQuantity} ${normalizeUnderscores(med.baseUnit)}`
                      : ""
                  }
                />
                <DataRow label="Category" value={med?.category} />
                <DataRow label="Schedule" value={med?.scheduleType} />
                <DataRow label="Storage" value={med?.storageType} />
                <DataRow
                  label="Controlled Drug"
                  value={med?.isControlledDrug ? "Yes" : "No"}
                />
              </Col>
            </Row>

            {data.otherCenters?.length > 0 && (
              <>
                <SectionTitle>Same batch at other centers</SectionTitle>
                {data.otherCenters.map((oc) => (
                  <DataRow
                    key={oc.center?._id || oc.center}
                    label={capitalizeWords(oc.center?.title || "Unknown center")}
                    value={`${oc.stock} ${med?.baseUnit || ""}`}
                  />
                ))}
                <div className="text-muted mt-2" style={{ fontSize: 11 }}>
                  Approving here only clears stock at {data.center?.title || "this center"}.
                </div>
              </>
            )}

          </>
        ) : (
          <div className="text-center text-muted py-5">
            Could not load inventory details.
          </div>
        )}
      </ModalBody>

      <ModalFooter>
        <Button color="light" onClick={toggle}>
          Close
        </Button>
        {hasWritePermission && data && (
          <Button
            color="success"
            className="text-white"
            onClick={() => {
              toggle();
              if (handleDiscard) handleDiscard(row);
            }}
          >
            <i className="bx bx-check me-1" />
            Discard
          </Button>
        )}
      </ModalFooter>
    </Modal>
  );
};

export default ExpiredStockDetailModal;
