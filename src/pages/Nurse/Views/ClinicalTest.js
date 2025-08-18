import React, { useEffect } from "react";
import { Row } from "reactstrap";
import GeneralCard from "../../Patient/Views/Components/GeneralCard";
import CSSRSResultComponent from "../../Patient/Views/Components/SsrsResult";

import MPQ9ResultComponent from "../../Patient/Views/Components/MPQ9Result";
import MMSEResultComponent from "../../Patient/Views/Components/MMSEResult";
import YBOCSResultComponent from "../../Patient/Views/Components/YBOCSResult";
import YmscResult from "../../Patient/Views/Components/YmscResult";
import { connect, useDispatch } from "react-redux";
import Placeholder from "../../Patient/Views/Components/Placeholder";
import PropTypes from "prop-types";
import { useParams } from "react-router-dom";
import { getClinicalTestSummaryById } from "../../../store/features/nurse/nurseSlice";
import CIWAResultComponent from "../../Patient/Views/Components/CIWAResultComponent ";

const testComponents = {
  6: CIWAResultComponent,
  7: CSSRSResultComponent,
  8: YmscResult,
  9: MPQ9ResultComponent,
  10: MMSEResultComponent,
  11: YBOCSResultComponent
};

const ClinicalTest = ({ patient = [], loading }) => {
  const { id } = useParams();
  const dispatch = useDispatch();

  useEffect(() => {
    if (!id || id === "*") return;
    dispatch(getClinicalTestSummaryById(id));
  }, [dispatch, id]);

  const renderTestResults = () => {
    if (loading) return <Placeholder />;
    
    if (!patient || patient.length === 0) {
      return (
        <p style={{ color: "#888", fontStyle: "italic" }}>
          No test results available
        </p>
      );
    }

    return patient.map((test, index) => {
      if (!test?.testType) return null;
      
      const TestComponent = testComponents[test.testType];
      if (!TestComponent) return null;

      return (
        <div key={`test-${index}`}>
          <TestComponent role="NURSE" resultData={test} />
        </div>
      );
    });
  };

  return (
    <div className="">
      <Row className="timeline-right" style={{ rowGap: "2rem" }}>
        <GeneralCard data="Clinical Test">
          <div style={{
            paddingTop: "2rem",
            paddingLeft: "1rem",
            paddingRight: "1rem",
          }}>
            {renderTestResults()}
          </div>
        </GeneralCard>
      </Row>
    </div>
  );
};

ClinicalTest.propTypes = {
  patient: PropTypes.arrayOf(
    PropTypes.shape({
      testType: PropTypes.number,
    })
  ),
  loading: PropTypes.bool,
};

ClinicalTest.defaultProps = {
  patient: [],
  loading: false,
};

const mapStateToProps = (state) => ({
  patient: state.Nurse.patient || [],
  loading: state.Nurse.loading,
});

export default connect(mapStateToProps)(ClinicalTest);