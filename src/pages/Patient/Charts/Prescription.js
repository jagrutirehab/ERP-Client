import React from "react";
import PropTypes from "prop-types";
import MedicineChart from "../Tables/MedicineChart";
import Divider from "../../../Components/Common/Divider";

const Prescription = ({ data }) => {
  return (
    <React.Fragment>
      <div>
        {data?.drNotes && (
          <div className="d-flex justify-content-between mb-2">
            <p className="fs-xs-9 font-size-14 mb-0">
              <span className="display-6 font-semi-bold fs-xs-11 font-size-20 me-3">
                Dr Notes:-
              </span>
              {data.drNotes}
            </p>
          </div>
        )}
        {data?.diagnosis && (
          <div className="d-flex justify-content-between mb-2">
            <p className="fs-xs-9 font-size-14 mb-0">
              <span className="display-6 font-semi-bold fs-xs-11 font-size-20 me-3">
                Diagnosis:-
              </span>
              {data.diagnosis}
            </p>
          </div>
        )}
        {data?.observation && (
          <div className="d-flex justify-content-between mb-2">
            <p className="fs-xs-9 font-size-14 mb-0">
              <span className="display-6 font-semi-bold fs-xs-11 font-size-20 me-3">
                Observation:-
              </span>
              {data.observation}
            </p>
          </div>
        )}
        {data?.complaints && (
          <div className="d-flex justify-content-between mb-2">
            <p className="fs-xs-9 font-size-14 mb-0">
              <span className="display-6 font-semi-bold fs-xs-11 font-size-20 me-3">
                Complaints:-
              </span>
              {data.complaints}
            </p>
          </div>
        )}
        {/* )} */}
        <div className="d-block text-center mt-3 mb-3">
          <Divider />
        </div>
        <>
          <MedicineChart medicines={data?.medicines || []} />
          <div className="d-block text-center mt-3 mb-3">
            <Divider />
          </div>
        </>
        {data?.notes && (
          <div className="d-flex justify-content-between mb-2">
            <p className="fs-xs-9 font-size-14 mb-0">
              <span className="display-6 font-semi-bold fs-xs-11 font-size-20 me-3">
                Notes:-
              </span>
              {data.notes}
            </p>
          </div>
        )}
        {data?.investigationPlan && (
          <div className="d-flex justify-content-between mb-2">
            <p className="fs-xs-9 font-size-14 mb-0">
              <span className="display-6 font-semi-bold fs-xs-11 font-size-20 me-3">
                Investigation Plan:-
              </span>
              {data.investigationPlan}
            </p>
          </div>
        )}
      </div>
    </React.Fragment>
  );
};

Prescription.propTypes = {
  data: PropTypes.object.isRequired,
};

export default Prescription;
