import React from "react";
import PropTypes from "prop-types";
import Sidebar from "./Sidebar";
import { Route, Routes } from "react-router-dom";
import { Container } from "reactstrap";
import Patient from "./Patient";
import { connect } from "react-redux";
import Center from "./Center";
import Lead from "./Lead";
import Medicine from "./Medicine";
import Chart from "./Chart";
import Bill from "./Bill";

const Recyclebin = ({ centerAccess }) => {
  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid>
          <div className="chat-wrapper d-lg-flex gap-1 my-n4 mx-n4">
            <Sidebar />
            <Routes>
              <Route
                path={`/center`}
                element={<Center centerAccess={centerAccess} />}
              />
              <Route path={`/user`} element={<div>User recycle bin</div>} />
              <Route
                path={`/patient`}
                element={<Patient centerAccess={centerAccess} />}
              />
              <Route
                path={`/chart`}
                element={<Chart centerAccess={centerAccess} />}
              />
              <Route
                path={`/bill`}
                element={<Bill centerAccess={centerAccess} />}
              />
              <Route
                path={`/lead`}
                element={<Lead centerAccess={centerAccess} />}
              />
              <Route
                path={`/medicine`}
                element={<Medicine centerAccess={centerAccess} />}
              />
            </Routes>
          </div>
        </Container>
      </div>
    </React.Fragment>
  );
};

Recyclebin.propTypes = {
  centerAccess: PropTypes.array.isRequired,
};

const mapStateToProps = (state) => ({
  centerAccess: state.User.centerAccess,
});

export default connect(mapStateToProps)(Recyclebin);
