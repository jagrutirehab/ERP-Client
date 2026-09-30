import React from "react";
import {
  Card,
  CardBody,
  CardHeader,
  Row,
  Col,
  Spinner,
  Badge,
} from "reactstrap";
import DocPreview from "./DocPreview";
import PositionDocumentsCard from "./PositionDocumentsCard";

const Field = ({ label, value }) => (
  <Col md={4} className="mb-3">
    <p className="text-muted mb-1 fw-semibold">{label}</p>
    <p className="mb-0">{value || "—"}</p>
  </Col>
);

const EmployeeProfileTab = ({ data, loading }) => {
  if (loading)
    return (
      <div className="text-center py-5">
        <Spinner />
      </div>
    );
  if (!data) return <p className="text-muted">No profile data found.</p>;

  return (
    <>
      <Card>
        <CardHeader>
          <h5 className="mb-0">Basic Information</h5>
        </CardHeader>
        <CardBody>
          <Row>
            <Field label="Employee Code" value={data.eCode} />
            <Field label="Full Name" value={data.name} />
            <Field label="Gender" value={data.gender} />
            <Field label="Date of Birth" value={data.dateOfBirth} />
            <Field label="Mobile" value={data.mobile} />
            <Field label="Email" value={data.email} />
            <Field label="Father's Name" value={data.father} />
            <Field label="State" value={data.state} />
            <Col md={4} className="mb-3">
              <p className="text-muted mb-1 fw-semibold">Status</p>
              <Badge color={data.status === "ACTIVE" ? "success" : "danger"}>
                {data.status}
              </Badge>
            </Col>
          </Row>
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <h5 className="mb-0">Employment Details</h5>
        </CardHeader>
        <CardBody>
          <Row>
            <Field label="Designation" value={data.designation?.name} />
            <Field label="Department" value={data.department?.department} />
            <Field label="Position" value={data.position?.name} />
            <Field label="Employment Type" value={data.employmentType} />
            <Field label="Employment Status" value={data.employmentStatus} />
            <Field label="Payroll Type" value={data.payrollType} />
            <Field
              label="Joining Date"
              value={
                data.joinningDate
                  ? new Date(data.joinningDate).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })
                  : "—"
              }
            />
            <Field
              label="PF Applicable"
              value={data.pfApplicable ? "Yes" : "No"}
            />
            <Field label="PF No." value={data.pfNo} />
            <Field label="UAN No." value={data.uanNo} />
          </Row>
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <h5 className="mb-0">Location</h5>
        </CardHeader>
        <CardBody>
          <Row>
            <Field label="First Location" value={data.firstLocation?.title} />
            <Field
              label="Current Location"
              value={data.currentLocation?.title}
            />
            <Field
              label="Transferred From"
              value={data.transferredFrom?.title}
            />
          </Row>
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <h5 className="mb-0">Bank Details</h5>
        </CardHeader>
        <CardBody>
          <Row>
            <Field label="Bank Name" value={data.bankDetails?.bankName} />
            <Field label="Account Name" value={data.bankDetails?.accountName} />
            <Field label="Account No." value={data.bankDetails?.accountNo} />
            <Field label="IFSC Code" value={data.bankDetails?.IFSCCode} />
          </Row>
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <h5 className="mb-0">Documents</h5>
        </CardHeader>
        <CardBody>
          <Row>
            <DocPreview
              label="Aadhaar Card"
              url={data.adhar?.url}
              detail={data.adhar?.number ? `No: ${data.adhar.number}` : null}
            />
            <DocPreview
              label="PAN Card"
              url={data.pan?.url}
              detail={data.pan?.number ? `No: ${data.pan.number}` : null}
            />
            <DocPreview label="Offer Letter" url={data.offerLetter} />
          </Row>
        </CardBody>
      </Card>

      <PositionDocumentsCard employeeId={data._id} />
    </>
  );
};

export default EmployeeProfileTab;
