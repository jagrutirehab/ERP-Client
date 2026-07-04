import React, { useState } from "react";
import PropTypes from "prop-types";
import { Card, CardBody, CardHeader, Col, Row, Button } from "reactstrap";
import { useDispatch, useSelector } from "react-redux";
import { togglePatientForm } from "../../../store/actions";
import AddPatient from "../../../Components/Patient/AddPatient";
import { PDFViewer } from "@react-pdf/renderer";
import BioDataPdf from "../../../Components/Print/BioData";
// TODO: confirm this path resolves — pattern inferred from Charting.jsx's
// "../../../Components/Common/RenderWhen" import
import CustomModal from "../../../Components/Common/Modal";

const InfoItem = ({ label, value }) => (
  <Col xs={12} md={6} lg={4} className="mb-3">
    <div className="text-muted fs-13 mb-1">{label}</div>
    <div className="fw-medium">{value || "-"}</div>
  </Col>
);

InfoItem.propTypes = {
  label: PropTypes.string,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};

const BioData = ({ patient }) => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.User.user);
  const [isPdfOpen, setIsPdfOpen] = useState(false);

  if (!patient) return null;

  const handleEdit = () => {
    dispatch(
      togglePatientForm({ data: patient, leadData: null, isOpen: true }),
    );
  };

  const togglePdfModal = () => setIsPdfOpen((prev) => !prev);

  const fullAddress = [
    patient.houseNo,
    patient.streetName,
    patient.city,
    patient.state,
    patient.country,
    patient.pinCode,
  ]
    .filter(Boolean)
    .join(", ");

  const dob = patient.dateOfBirth
    ? new Date(patient.dateOfBirth).toLocaleDateString()
    : "";

  return (
    <div className="mt-2">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5 className="fw-semibold mb-0 text-capitalize">
          Bio Data of {patient.name || "Patient"}
        </h5>
        <div className="d-flex gap-2">
          <Button color="secondary" size="sm" onClick={togglePdfModal}>
            <i className="ri-printer-line align-middle me-1"></i>
            Print
          </Button>
          <Button color="primary" size="sm" onClick={handleEdit}>
            <i className="ri-edit-line align-middle me-1"></i>
            Edit
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="fw-semibold">Personal Information</CardHeader>
        <CardBody>
          <Row>
            <InfoItem label="Name" value={patient.name} />
            <InfoItem label="Gender" value={patient.gender} />
            <InfoItem label="Date of Birth" value={dob} />
            <InfoItem label="Age" value={patient.age} />
            <InfoItem label="Marital Status" value={patient.maritalstatus} />
            <InfoItem label="Religion" value={patient.religion} />
            {/* <InfoItem label="Nationality" value={patient.nationality} /> */}
            <InfoItem
              label="Aadhaar Card Number"
              value={patient.aadhaarCardNumber}
            />
          </Row>
        </CardBody>
      </Card>

      <Card>
        <CardHeader className="fw-semibold">Contact Information</CardHeader>
        <CardBody>
          <Row>
            <InfoItem label="Phone Number" value={patient.phoneNumber} />
            <InfoItem label="Email" value={patient.email} />
            <InfoItem label="Address" value={patient.address} />
            {/* <InfoItem label="Full Address" value={fullAddress} /> */}
          </Row>
        </CardBody>
      </Card>

      <Card>
        <CardHeader className="fw-semibold">Guardian Information</CardHeader>
        <CardBody>
          <Row>
            <InfoItem label="Guardian Name" value={patient.guardianName} />
            <InfoItem
              label="Guardian Relation"
              value={patient.guardianRelation}
            />
            <InfoItem
              label="Guardian Phone Number"
              value={patient.guardianPhoneNumber}
            />
          </Row>
        </CardBody>
      </Card>

      <Card>
        <CardHeader className="fw-semibold">
          Education, Occupation &amp; Language
        </CardHeader>
        <CardBody>
          <Row>
            <InfoItem
              label="Education / Qualification"
              value={patient.education}
            />
            <InfoItem label="Occupation" value={patient.occupation} />
            <InfoItem
              label="Occupation Detail"
              value={patient.occupationDetail}
            />
            <InfoItem
              label="Languages Known"
              value={patient.languagesKnown?.join(", ")}
            />
          </Row>
        </CardBody>
      </Card>

      <Card>
        <CardHeader className="fw-semibold">Other Details</CardHeader>
        <CardBody>
          <Row>
            <InfoItem
              label="Socioeconomic Status"
              value={patient.socioeconomicstatus}
            />
            <InfoItem label="Area Type" value={patient.areatype} />
            <InfoItem label="IPD File Number" value={patient.ipdFileNumber} />
            <InfoItem
              label="Provisional Diagnosis"
              value={patient.provisionalDiagnosis}
            />
            <InfoItem
              label="Referred By"
              value={patient.referredBy?.doctorName}
            />
          </Row>
        </CardBody>
      </Card>

      <AddPatient />

      <CustomModal
        isOpen={isPdfOpen}
        title="Bio Data Preview"
        centered
        size="xl"
        toggle={togglePdfModal}
      >
        {isPdfOpen && (
          <PDFViewer style={{ width: "100%", height: "75vh", border: "none" }}>
            <BioDataPdf patient={patient} user={user} />
          </PDFViewer>
        )}
      </CustomModal>
    </div>
  );
};

BioData.propTypes = {
  patient: PropTypes.object,
};

export default BioData;
