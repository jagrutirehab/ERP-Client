import React from "react";
import Sidebar from "./Sidebar";
import { Route, Routes } from "react-router-dom";
import { Container } from "reactstrap";
import Center from "./Center";
import Medicine from "../Medicine";
import Billing from "./Billing";
import Calender from "./Calender";
import OfferCode from "./OfferCode";
import TaxManagement from "./TaxManagement";
import RolesManagement from "./RolesManagement";
import Therapies from "./Therapies";
import Conditions from "./Conditions";
import Symptom from "./Symptom";

const index = (props) => {
  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid>
          <div className="chat-wrapper d-lg-flex gap-1 my-n4 mx-n4">
            <Sidebar />
            <Routes>
              <Route path={`/center`} element={<Center />} />
              <Route path={`/medicine`} element={<Medicine />} />
              <Route path={`/billing`} element={<Billing />} />
              <Route path={`/calender`} element={<Calender />} />
              <Route path={`/offercode`} element={<OfferCode />} />
              <Route path={`/taxmanagement`} element={<TaxManagement />} />
              <Route path={`/rolesmanagment`} element={<RolesManagement />} />
              <Route path={`/therapies`} element={<Therapies />} />
              <Route path={`/conditions`} element={<Conditions />} />
              <Route path={`/symptoms`} element={<Symptom />} />
            </Routes>
          </div>
        </Container>
      </div>
    </React.Fragment>
  );
};

index.propTypes = {};

export default index;
