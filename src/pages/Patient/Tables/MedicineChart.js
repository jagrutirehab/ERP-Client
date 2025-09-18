import React from "react";
import PropTypes from "prop-types";
import DataTable from "react-data-table-component";

const MedicineChart = ({ medicines }) => {
  const columns = [
    {
      name: "Medicine",
      selector: (row) =>
        `${row.medicine?.type} ${row.medicine?.name} ${row.medicine?.strength} ${row.medicine?.unit}`,
      style: {
        textTransform: "capitalize",
      },
      wrap: true,
    },
    {
      name: <div>Dosage & Frequency</div>,
      selector: (row) =>
        `${row.dosageAndFrequency?.morning} - ${row.dosageAndFrequency?.evening} - ${row.dosageAndFrequency?.night}`,
      wrap: true,
    },
    {
      name: "Duration",
      selector: (row, idx) => `${row?.duration} ${row?.unit}`,
      wrap: true,
    },
    {
      name: "Intake",
      cell: (row) => (
        <div style={{ whiteSpace: "normal", wordBreak: "break-word" }}>
          {row?.instructions ? `${row?.instructions}, ` : ""}
          {row?.intake || ""}
        </div>
      ),
      wrap: true,
      // selector: (row, idx) =>
      //   row?.instructions ? `${row?.instructions}, ` : "" + row?.intake || "",
      //       style: {
      //   whiteSpace: "normal",
      // },
    },
  ];

  return (
    <React.Fragment>
      <div className="px-2">
        <DataTable columns={columns} data={medicines} />
        {/* <Row className="bg-white">
          <Col xs={3} className="border-bottom">
            <span className="font-semi-bold fs-6">Medicine</span>{" "}
          </Col>
          <Col xs={3} className="border-bottom">
            <span className="font-semi-bold fs-6">Dosage & Frequency</span>
          </Col>
          <Col xs={3} className="border-bottom">
            <span className="font-semi-bold fs-6">Intake</span>
          </Col>
          <Col xs={3} className="border-bottom">
            <span className="font-semi-bold fs-6">Duration</span>
          </Col>
          {(medicines || []).map((medicine) => (
            <React.Fragment key={medicine._id}>
              <Col xs={3} className="py-2">
                <span className="font-semi-bold">
                  {medicine.medicine?.name}
                </span>
              </Col>
              <Col xs={3} className="py-2">
                <span className="font-semi-bold">
                  {medicine.dosageAndFrequency?.morning || ""}-
                  {medicine.dosageAndFrequency?.evening || ""}-
                  {medicine.dosageAndFrequency?.night || ""}
                </span>
              </Col>
              <Col xs={3} className="py-2">
                <span className="font-semi-bold">
                  {medicine?.duration} {medicine?.unit}
                </span>
              </Col>
              <Col xs={3} className="py-2">
                <span className="font-semi-bold">
                  {medicine?.instructions ? `${medicine?.instructions}, ` : ""}
                  {medicine?.intake || ""}
                </span>
              </Col>
            </React.Fragment>
          ))}
        </Row> */}
      </div>
    </React.Fragment>
  );
};

MedicineChart.propTypes = {
  medicines: PropTypes.array.isRequired,
};

export default MedicineChart;
