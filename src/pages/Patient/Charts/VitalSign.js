import React from "react";
import PropTypes from "prop-types";

const VitalSign = ({ data }) => {
  const vitals = [
    {
      label: "Weight",
      unit: "kg",
      value: data?.weight,
      icon: "⚖️",
    },
    {
      label: "Blood Pressure",
      unit: "mmHg",
      value:
        data?.bloodPressure?.systolic && data?.bloodPressure?.diastolic
          ? `${data.bloodPressure.systolic}/${data.bloodPressure.diastolic}`
          : null,
    },
    {
      label: "Pulse",
      unit: "bpm",
      value: data?.pulse,
    },
    {
      label: "Temperature",
      unit: "°C",
      value: data?.temprature,
    },
    {
      label: "Resp. Rate",
      unit: "breaths/min",
      value: data?.respirationRate,
    },
    {
      label: "CNS",
      unit: null,
      value: data?.cns,
    },
    {
      label: "CVS",
      unit: null,
      value: data?.cvs,
    },
    {
      label: "RS",
      unit: null,
      value: data?.rs,
    },
    {
      label: "PA",
      unit: null,
      value: data?.pa,
    },
    {
      label: "SpO2",
      unit: "%",
      value: data?.spo2,
    },
    {
      label: "BSL",
      unit: "mg/dL",
      value: data?.bloodSugar,
    },
  ];

  return (
    <div
      style={{
        width: "100%",
        minWidth: 0,
        overflowX: "auto",
        WebkitOverflowScrolling: "touch",
        boxSizing: "border-box",
      }}
    >
      <table
        className="table table-sm table-bordered align-middle mb-0"
        style={{
          minWidth: "900px",
          whiteSpace: "nowrap",
          tableLayout: "fixed",
          width: "100%",
        }}
      >
        <thead className="table-primary">
          <tr>
            {vitals.map(({ label, unit }) => (
              <th
                key={label}
                style={{
                  fontSize: "12px",
                  fontWeight: 600,
                  textAlign: "center",
                  verticalAlign: "middle",
                  padding: "8px 6px",
                  lineHeight: "1.3",
                }}
              >
                <div>{label}</div>
                {unit && (
                  <div
                    style={{
                      fontSize: "10px",
                      fontWeight: 400,
                      opacity: 0.75,
                      marginTop: "2px",
                    }}
                  >
                    ({unit})
                  </div>
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr>
            {vitals.map(({ label, value }) => (
              <td
                key={label}
                className="font-size-14"
                title={value != null ? String(value) : undefined}
                style={{
                  textAlign: "center",
                  verticalAlign: "middle",
                  padding: "10px 6px",
                  fontWeight: value ? 500 : 400,
                  color: value ? "inherit" : "#9ca3af",
                  maxWidth: "100px",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {value ?? "—"}
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  );
};

VitalSign.propTypes = {
  data: PropTypes.object,
};

export default VitalSign;