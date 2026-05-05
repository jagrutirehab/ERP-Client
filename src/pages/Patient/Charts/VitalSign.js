import React from "react";
import PropTypes from "prop-types";

const VitalSign = ({ data }) => {
  return (
    <React.Fragment>
      <div className="table-responsive">
        <table
          className="bill-table table table-sm align-middle table-nowrap"
          id="customerTable"
          style={{ minWidth: "900px" }}
        >
          <thead className="table-primary">
            <tr>
              <th colSpan={2}>WEIGHT (kg)</th>
              <th colSpan={2}>B.P. (mmHg)</th>
              <th colSpan={2}>PULSE (Heart beats/min)</th>
              <th colSpan={2}>TEMPERATURE (°C)</th>
              <th colSpan={2}>RESP. RATE (Breaths/min)</th>
              <th colSpan={2}>CNS</th>
              <th colSpan={2}>CVS</th>
              <th colSpan={2}>RS</th>
              <th colSpan={2}>PA</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colSpan={2} style={{ width: "150px", borderRight: "2px solid #dee2e6" }} className="text-wrap font-size-14">
                {data?.weight || ""}
              </td>
              <td colSpan={2} style={{ width: "150px", borderRight: "2px solid #dee2e6" }} className="text-wrap font-size-14">
                {data?.bloodPressure?.systolic || ""}/
                {data?.bloodPressure?.diastolic || ""}
              </td>
              <td colSpan={2} style={{ width: "150px", borderRight: "2px solid #dee2e6" }} className="text-wrap font-size-14">
                {data?.pulse || ""}
              </td>
              <td colSpan={2} style={{ width: "150px", borderRight: "2px solid #dee2e6" }} className="text-wrap font-size-14">
                {data?.temprature || ""}
              </td>
              <td colSpan={2} style={{ width: "150px", borderRight: "2px solid #dee2e6" }} className="text-wrap font-size-14">
                {data?.respirationRate || ""}
              </td>
              <td colSpan={2} style={{ width: "150px", borderRight: "2px solid #dee2e6" }} className="text-wrap font-size-14">
                {data?.cns || ""}
              </td>
              <td colSpan={2} style={{ width: "150px", borderRight: "2px solid #dee2e6" }} className="text-wrap font-size-14">
                {data?.cvs || ""}
              </td>
              <td colSpan={2} style={{ width: "150px", borderRight: "2px solid #dee2e6" }} className="text-wrap font-size-14">
                {data?.rs || ""}
              </td>
              <td colSpan={2} style={{ width: "150px" }} className="text-wrap font-size-14">
                {data?.pa || ""}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </React.Fragment>
  );
};

VitalSign.propTypes = {
  data: PropTypes.object,
};

export default VitalSign;