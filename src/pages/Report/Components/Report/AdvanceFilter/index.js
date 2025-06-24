import React from "react";
import { Collapse, Card, CardBody, Row, Col, Input, Label } from "reactstrap";
import ReferralPatient from "./ReferrelPatient";
import { ADDMISSION_DATE, ALL_REFERRELS, DISCHARGE_DATE } from "../data";

const AdvanceFilter = ({
  isOpen,
  sortByDate,
  setSortByDate,
  sortPatientStatus,
  setSortPatientStatus,
  patientsReferrel,
  setPatientsReferrel,
  diagnosisCol,
  setDiagnosisCol,
}) => {
  return (
    <React.Fragment>
      <div className="mt-3">
        <div>
          <Collapse isOpen={isOpen}>
            <Card>
              <CardBody>
                <Row>
                  <Col s={12} md={4} lg={3} className="mb-3 mb-md-0">
                    <div className="d-flex h-100">
                      <Input
                        id=""
                        name="dates"
                        type="select"
                        onChange={(e) => setSortByDate(e.target.value)}
                        value={sortByDate || ""}
                        className="form-control form-control-sm h-100"
                      >
                        <option disabled selected value="">
                          Choose Date Filter
                        </option>
                        <option value={ADDMISSION_DATE} className="text-muted">
                          Date Of Addmission
                        </option>
                        <option value={DISCHARGE_DATE} className="text-muted">
                          Date Of Discharge
                        </option>
                      </Input>
                    </div>
                  </Col>
                  <Col xs={12} md={3} className="mb-3 mb-md-0">
                    <div className="d-flex h-100">
                      <Input
                        id=""
                        name="patientStatus"
                        type="select"
                        onChange={(e) => {
                          setSortPatientStatus(e.target.value);
                        }}
                        value={sortPatientStatus || ""}
                        className="form-control form-control-sm h-100"
                      >
                        <option value="" selected disabled>
                          Choose here
                        </option>
                        <option value={"ADMIT_PATIENT"} className="text-muted">
                          Admit Patients
                        </option>
                        <option
                          value={"DISCHARGE_PATIENT"}
                          className="text-muted"
                        >
                          Discharge Patients
                        </option>
                      </Input>
                    </div>
                  </Col>
                  <Col xs={12} md={3} className="mb-3 mb-md-0">
                    <ReferralPatient
                      patientsReferrel={patientsReferrel}
                      setPatientsReferrel={setPatientsReferrel}
                    />
                  </Col>
                  <Col xs={12} md={4} className="mb-3 mb-md-0">
                    <div className="d-flex align-items-center h-100">
                      <Input
                        id=""
                        name="diagnosis"
                        type="checkbox"
                        onChange={(e) => setDiagnosisCol(!diagnosisCol)}
                        checked={diagnosisCol}
                        className="mt-0"
                      />
                      <Label className="mb-0 ms-3 fs-4">Diagnosis</Label>
                    </div>
                  </Col>
                  <Col xs={12} md={4} className="mb-3 mb-md-0">
                    <div className="d-flex align-items-center h-100">
                      <Input
                        id=""
                        name="diagnosis"
                        type="checkbox"
                        onChange={(e) => {
                          if (patientsReferrel === ALL_REFERRELS)
                            setPatientsReferrel("");
                          else setPatientsReferrel(ALL_REFERRELS);
                        }}
                        checked={patientsReferrel === ALL_REFERRELS}
                        className="mt-0"
                      />
                      <Label className="mb-0 ms-3 fs-4">Referral</Label>
                    </div>
                  </Col>
                </Row>
              </CardBody>
            </Card>
          </Collapse>
        </div>
      </div>
    </React.Fragment>
  );
};

export default AdvanceFilter;
