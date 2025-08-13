import React from "react";
import {Button, Col, Row } from "reactstrap";
import NurseBar from "./Components/NurseBar";
import { patients } from "./Components/PatientData";
import PatientCard from "./Components/PatientCard";

const Main = () => {

  document.title = "Nurse | Your App Name";

  return (
    <React.Fragment>
      <div>
        <NurseBar />
        <Row className="g-4">
          {patients.length > 0 &&
            patients.map((patient) => (
              <Col xxl={3} lg={4} md={6} key={patient.id}>
                <PatientCard patient={patient} />
              </Col>
            ))}
        </Row>
        <Row className="mt-4 justify-content-center align-items-center">
          <Col xs="auto" className="d-flex justify-content-center">
            <Button
              color="secondary"
              disabled
            //   onClick={() => handlePageChange(currentPage - 1)}
            >
              ← Previous
            </Button>
          </Col>
          <Col xs="auto" className="text-center text-muted mx-3">
            {/* Showing {Math.min((currentPage - 1) * limit + 1, totalCount)}– */}
            {/* {Math.min(currentPage * limit, totalCount)} of {totalCount} */}
            Showing 1-1 of 1
          </Col>
          <Col xs="auto" className="d-flex justify-content-center">
            <Button
              color="secondary"
              disabled
            //   onClick={() => handlePageChange(currentPage + 1)}
            >
              Next →
            </Button>
          </Col>
        </Row>
      </div>
    </React.Fragment>
  );
};

export default Main;
