import React from "react";
import PropTypes from "prop-types";

const VitalSign = ({ data }) => {
  return (
    <React.Fragment>
      <div
        style={{
          width: "100%",
          overflowX: "auto",
          overflowY: "visible",
          display: "block",
          WebkitOverflowScrolling: "touch",
        }}
      >
        <table
          className="bill-table table table-sm align-middle table-bordered"
          id="customerTable"
          style={{ minWidth: "1650px", whiteSpace: "nowrap" }}
        >
          <thead className="table-primary">
            <tr>
              <th>WEIGHT (kg)</th>
              <th>B.P. (mmHg)</th>
              <th>PULSE (Heart beats/min)</th>
              <th>TEMPERATURE (°C)</th>
              <th>RESP. RATE (Breaths/min)</th>
              <th>CNS</th>
              <th>CVS</th>
              <th>RS</th>
              <th>PA</th>
              <th>SpO2 (%)</th>
              <th>BSL (mg/dL)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{ minWidth: "120px" }} className="font-size-14">
                {data?.weight || "—"}
              </td>
              <td style={{ minWidth: "130px" }} className="font-size-14">
                {data?.bloodPressure?.systolic || "—"}/
                {data?.bloodPressure?.diastolic || "—"}
              </td>
              <td style={{ minWidth: "150px" }} className="font-size-14">
                {data?.pulse || "—"}
              </td>
              <td style={{ minWidth: "140px" }} className="font-size-14">
                {data?.temprature || "—"}
              </td>
              <td style={{ minWidth: "160px" }} className="font-size-14">
                {data?.respirationRate || "—"}
              </td>
              <td style={{ minWidth: "100px" }} className="font-size-14">
                {data?.cns || "—"}
              </td>
              <td style={{ minWidth: "100px" }} className="font-size-14">
                {data?.cvs || "—"}
              </td>
              <td style={{ minWidth: "100px" }} className="font-size-14">
                {data?.rs || "—"}
              </td>
              <td style={{ minWidth: "100px" }} className="font-size-14">
                {data?.pa || "—"}
              </td>
              <td style={{ minWidth: "110px" }} className="font-size-14">
                {data?.spo2 || "—"}
              </td>
              <td style={{ minWidth: "120px" }} className="font-size-14">
                {data?.bloodSugar || "—"}
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