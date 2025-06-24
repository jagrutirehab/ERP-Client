import React, { useState } from "react";
import PropTypes from "prop-types";
import { Route, Routes } from "react-router-dom";
import Activity from "./Activity";
import Main from "./Main";
import { Container } from "reactstrap";
import BreadCrumb from "../../Components/Common/BreadCrumb";

const Register = (props) => {
  const [userActivity, setUserActivity] = useState();

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid>
          <BreadCrumb
            title={
              userActivity
                ? `${userActivity.name} (${userActivity.role})`
                : "User"
            }
            pageTitle="User"
          />
          <Routes>
            <Route
              path="/:name"
              element={<Activity userActivity={userActivity} />}
            />
            <Route
              path="/"
              element={
                <Main
                  userActivity={userActivity}
                  setUserActivity={setUserActivity}
                />
              }
            />
          </Routes>
        </Container>
      </div>
    </React.Fragment>
  );
};

Register.propTypes = {};

export default Register;
