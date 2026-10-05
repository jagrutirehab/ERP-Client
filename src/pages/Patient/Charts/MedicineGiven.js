import React from "react";
import PropTypes from "prop-types";
import moment from "moment";
import { capitalizeWords } from "../../../utils/toCapitalize";

const rows = (data) => [
  { label: "Slot", value: data?.slot || "—" },
  {
    label: "Given At",
    value: data?.takenAt
      ? moment(data.takenAt).format("D MMM YYYY, hh:mm A")
      : "—",
  },
  { label: "Given By", value: data?.markedBy?.name || "—" },
  {
    label: "Comment",
    value: data?.comment ? capitalizeWords(data.comment) : "—",
  },
];

const MedicineGiven = ({ data }) => {
  return (
    <React.Fragment>
      <div>
        {rows(data).map((row) => (
          <div className="d-flex" key={row.label}>
            <h6 className="fs-xs-10 fs-md-14">{row.label}:-</h6>
            <p
              className="fs-xs-9 fs-md-12 mb-0 ms-2"
              style={{
                whiteSpace: "pre-line",
                color: row.value === "—" ? "#9ca3af" : "inherit",
              }}
            >
              {row.value}
            </p>
          </div>
        ))}
      </div>
    </React.Fragment>
  );
};

MedicineGiven.propTypes = {
  data: PropTypes.object,
};

export default MedicineGiven;
