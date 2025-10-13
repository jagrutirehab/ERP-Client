import React from "react";
import PropTypes from "prop-types";

const VitalSign = ({ data }) => {
  return (
    <React.Fragment>
      <div>
        <div className="table-auto">
          <div className="table-responsive h-auto table-card mb-1 ">
            <table
              className="bill-table table table-sm align-middle table-nowrap"
              id="customerTable"
            >
              <thead className="table-primary">
                <tr>
                  <th className="sort" colSpan={2} data-sort="treatments">
                    WEIGHT (kg)
                  </th>
                  <th className="sort" colSpan={2} data-sort="unit">
                    B.P. (mmHg)
                  </th>
                  <th className="sort" colSpan={2} data-sort="cost">
                    PULSE (Heart beats/min)
                  </th>
                  <th className="sort" colSpan={2} data-sort="discount">
                    TEMPERATURE (°C)
                  </th>
                  <th className="sort" colSpan={2} data-sort="discount">
                    RESP. RATE (Breaths/min)
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td
                    colSpan={2}
                    style={{ width: "150px" }}
                    className="text-wrap font-size-14"
                  >
                    {data?.weight || ""}
                  </td>
                  <td
                    colSpan={2}
                    style={{ width: "150px" }}
                    className="text-wrap font-size-14"
                  >
                    {data?.bloodPressure?.systolic || ""}/
                    {data?.bloodPressure?.diastolic || ""}
                  </td>
                  <td
                    colSpan={2}
                    style={{ width: "150px" }}
                    className="text-wrap font-size-14"
                  >
                    {data?.pulse || ""}
                  </td>
                  <td
                    colSpan={2}
                    style={{ width: "150px" }}
                    className="text-wrap font-size-14"
                  >
                    {data?.temprature || ""}
                  </td>
                  <td
                    colSpan={2}
                    style={{ width: "150px" }}
                    className="text-wrap font-size-14"
                  >
                    {data?.respirationRate || ""}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </React.Fragment>
  );
};

VitalSign.prototype = {
  data: PropTypes.object,
};

export default VitalSign;
