import React, { useState } from "react";
import { ButtonGroup, Button } from "reactstrap";
import {
  BILLING_VIEW,
  TIMELINE_VIEW,
} from "../../../Components/constants/intern";
import Billing from "./Billing";
import Timeline from "./Timeline";
import { connect } from "react-redux";

const Views = (props) => {
  const vws = {
    Billing: BILLING_VIEW,
    Timeline: TIMELINE_VIEW,
  };
  const internPage = props.pageAccess.find((pg) => pg.name === "Intern");
  const [view, setView] = useState(
    internPage?.subAccess[0]?.name ? vws[internPage.subAccess[0]?.name] : ""
  );
  const handleView = (v) => setView(v);

  return (
    <React.Fragment>
      <div
        style={{ overflow: "auto !important" }}
        color="primary"
        className="h-auto"
      >
        <div className="patient-content postion-relative overflow-auto bg-white mt-1 px-3 py-3">
          <div className="d-flex justify-content-between flex-wrap">
            <ButtonGroup size="sm">
              {props.pageAccess
                .find((pg) => pg.name === "Intern")
                ?.subAccess.filter((s) => s.name !== "OPD")
                .map((sub) => {
                  const vw =
                    sub.name.toUpperCase() === BILLING_VIEW
                      ? BILLING_VIEW
                      : sub.name.toUpperCase() === TIMELINE_VIEW
                      ? TIMELINE_VIEW
                      : "";
                  return (
                    <Button
                      outline={view !== vw}
                      onClick={() => handleView(vw)}
                    >
                      {sub.name}
                    </Button>
                  );
                })}
            </ButtonGroup>
          </div>
          <div>
            {view === BILLING_VIEW && <Billing view={view} />}
            {view === TIMELINE_VIEW && <Timeline view={view} />}
          </div>
        </div>
      </div>
    </React.Fragment>
  );
};

Views.propTypes = {};

const mapStateToProps = (state) => {
  return {
    pageAccess: state.User.user.pageAccess.pages,
  };
};

export default connect(mapStateToProps)(Views);
