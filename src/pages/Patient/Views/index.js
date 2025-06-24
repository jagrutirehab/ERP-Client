import React, { useEffect, useRef, useState } from "react";
import { ButtonGroup, Button } from "reactstrap";

//constants
import {
  BILLING_VIEW,
  CHARTING_VIEW,
  TIMELINE_VIEW,
  OPD_VIEW,
} from "../../../Components/constants/patient";

//components
import Charting from "./Charting";
import Billing from "./Billing";
import Timeline from "./Timeline";
import ScrollBar from "react-perfect-scrollbar";
import { connect, useSelector } from "react-redux";
import RorQuestion from "./Components/RorQuestion";
import CiwaQuestion from "./Components/CiwaQuestion";
import SsrsQuestion from "./Components/SsrsQuestion";

const Views = (props) => {
  const ref = useRef();

  const data = useSelector((state) => state.ClinicalTest.testName);
  const questionShow = useSelector(
    (state) => state.ClinicalTest.isTestPageOpen
  );

  const vws = {
    Charting: CHARTING_VIEW,
    Billing: BILLING_VIEW,
    OPD: OPD_VIEW,
    Timeline: TIMELINE_VIEW,
  };

  const patientPage = props.pageAccess.find((pg) => pg.name === "Patient");
  const [view, setView] = useState(
    patientPage?.subAccess.find(
      (sub) => sub.name.toUpperCase() === CHARTING_VIEW
    )
      ? CHARTING_VIEW
      : patientPage.subAccess[0]?.name
      ? vws[patientPage.subAccess[0]?.name]
      : ""
  );

  useEffect(() => {
    const scrollContainer = ref.current;
    console.log(scrollContainer, "scroll div");

    // if (scrollContainer)
    //   scrollContainer.setAttribute("style", "overflow: auto !important;");
  }, []);

  const handleView = (v) => setView(v);

  return (
    <React.Fragment>
      <div
        style={{ overflow: "auto !important" }}
        color="primary"
        className="h-auto"
      >
        {questionShow === false ? (
          <div className="patient-content postion-relative overflow-auto bg-white mt-1 px-3 py-3">
            <div className="d-flex justify-content-between flex-wrap">
              <ButtonGroup size="sm">
                {props.pageAccess
                  .find((pg) => pg.name === "Patient")
                  ?.subAccess.filter((s) => s.name !== "OPD")
                  .map((sub) => {
                    const vw =
                      sub.name.toUpperCase() === CHARTING_VIEW
                        ? CHARTING_VIEW
                        : sub.name.toUpperCase() === BILLING_VIEW
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
              {view === CHARTING_VIEW && (
                <Charting view={view} pageAccess={props.pageAccess} />
              )}
              {view === BILLING_VIEW && <Billing view={view} />}
              {view === TIMELINE_VIEW && <Timeline view={view} />}
            </div>
          </div>
        ) : (
          <div className="patient-content position-relative overflow-auto bg-white mt-1 px-3 py-3">
            {data === "C-SSRS" ? <SsrsQuestion /> : <CiwaQuestion />}
          </div>
        )}
      </div>
    </React.Fragment>
  );
};

Views.propTypes = {};

const mapStateToProps = (state) => ({
  pageAccess: state.User.user.pageAccess.pages,
});

export default connect(mapStateToProps)(Views);
