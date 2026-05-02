import React, { useRef, useState } from "react";
import { ButtonGroup, Button, Row, Col } from "reactstrap";
import {
  BILLING_VIEW,
  CHARTING_VIEW,
  TIMELINE_VIEW,
  OPD_VIEW,
  FORMS_VIEW,
  BELONGINGS_VIEW,
} from "../../../Components/constants/patient";
import SopPanel from "./Components/SopPanel";
import Charting from "./Charting";
import Billing from "./Billing";
import Timeline from "./Timeline";
import AddmissionForms from "./AdmissionForms/AdmissionForms";
import { connect, useSelector } from "react-redux";
import CiwaQuestion from "./Components/CiwaQuestion";
import SsrsQuestion from "./Components/SsrsQuestion";
import YMSCQuestion from "./Components/YMSCQuestion";
import MPQQuestion from "./Components/MPQ9Question";
import MMSEQuestion from "./Components/MMSEQuestion";
import YBOCSQuestion from "./Components/YBOCSQuestion";
import ACDSQuestion from "./Components/ACDSQuestion";
import HAMAQuestion from "./Components/HAMAQuestion";
import HAMDQuestion from "./Components/HAMDQuestion";
import PANSSQuestion from "./Components/PANSSQuestion";
import RamsayQuestion from "./Components/Ramsayquestion";
import GCSQuestion from "./Components/Gcsquestion";
import Morsefallquestion from "./Components/Morsefallquestion";
import Belongings from "./Belongings";

const Views = (props) => {
  const ref = useRef();

  const data = useSelector((state) => state.ClinicalTest.testName);
  const questionShow = useSelector(
    (state) => state.ClinicalTest.isTestPageOpen,
  );

  const vws = {
    Charting: CHARTING_VIEW,
    Billing: BILLING_VIEW,
    OPD: OPD_VIEW,
    Timeline: TIMELINE_VIEW,
    Belongings: BELONGINGS_VIEW,
  };

  const patientPage = props?.pageAccess?.find((pg) => pg.name === "Patient");
  const [view, setView] = useState(
    patientPage?.subAccess?.find(
      (sub) => sub?.name.toUpperCase() === CHARTING_VIEW,
    )
      ? CHARTING_VIEW
      : patientPage?.subAccess[0]?.name
        ? vws[patientPage?.subAccess[0]?.name]
        : "",
  );

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
            <Row>
              <Col className="mb-2" xs={12} xl={5} xxl={4}>
                <ButtonGroup size="sm">
                  {props?.pageAccess
                    ?.find((pg) => pg.name === "Patient")
                    ?.subAccess?.filter((s) => s.name !== "OPD")
                    .sort((a, b) => {
                      const aName = a.name.toUpperCase();
                      const bName = b.name.toUpperCase();
                      if (aName === "BELONGINGS" || aName === BELONGINGS_VIEW)
                        return 1;
                      if (bName === "BELONGINGS" || bName === BELONGINGS_VIEW)
                        return -1;
                      if (aName === "FORMS" || aName === FORMS_VIEW) return 1;
                      if (bName === "FORMS" || bName === FORMS_VIEW) return -1;
                      return 0;
                    })
                    .map((sub) => {
                      const vw =
                        sub?.name.toUpperCase() === CHARTING_VIEW
                          ? CHARTING_VIEW
                          : sub?.name.toUpperCase() === BILLING_VIEW
                            ? BILLING_VIEW
                            : sub.name.toUpperCase() === TIMELINE_VIEW
                              ? TIMELINE_VIEW
                              : sub.name.toUpperCase() === FORMS_VIEW
                                ? FORMS_VIEW
                                : sub.name.toUpperCase() === BELONGINGS_VIEW
                                  ? BELONGINGS_VIEW
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
              </Col>
              <Col xs={12} xl={7} xxl={8}>
                <SopPanel />
              </Col>
            </Row>
            <div>
              {view === CHARTING_VIEW && (
                <Charting view={view} pageAccess={props.pageAccess} />
              )}
              {view === BILLING_VIEW && <Billing view={view} />}
              {view === TIMELINE_VIEW && <Timeline view={view} />}
              {view === FORMS_VIEW && <AddmissionForms view={view} />}
              {view === BELONGINGS_VIEW && <Belongings view={view} />}
            </div>
          </div>
        ) : (
          <div className="patient-content position-relative overflow-auto bg-white mt-1 px-3 py-3">
            {data === "C-SSRS" && <SsrsQuestion />}
            {data === "CIWA-AR" && <CiwaQuestion />}
            {data === "YMRS" && <YMSCQuestion />}
            {data === "MPQ-9" && <MPQQuestion />}
            {data === "MMSE" && <MMSEQuestion />}
            {data === "Y-BOCS" && <YBOCSQuestion />}
            {data === "ACDS" && <ACDSQuestion />}
            {data === "HAM-A" && <HAMAQuestion />}
            {data === "HAM-D" && <HAMDQuestion />}
            {data === "PANSS" && <PANSSQuestion />}
            {data === "Morse Fall Scale" && <Morsefallquestion />}
            {data === "Ramsay Sedation Scale" && <RamsayQuestion />}
            {data === "GCS" && <GCSQuestion />}
          </div>
        )}
      </div>
    </React.Fragment>
  );
};

Views.propTypes = {};

const mapStateToProps = (state) => ({
  pageAccess: state.User?.user?.pageAccess?.pages,
});

export default connect(mapStateToProps)(Views);