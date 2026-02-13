import React from "react";
import { Row, Col } from "reactstrap";
import PropTypes from "prop-types";
import DataTable from "react-data-table-component";
import { v4 as uuid } from "uuid";

const InvoiceList = ({ list }) => {
  const columns = [
    {
      name: "Treatment",
      selector: (row) => row.slot,
    },
    {
      name: "Quantity",
      selector: (row) => row.unit,
    },
    {
      name: "Cost",
      selector: (row) => row.cost,
    },
    {
      name: "Unit of Measurement",
      selector: (row) => row.unitOfMeasurement,
      style: {
        textTransform: "capitalize",
      },
    },
    {
      name: "Total",
      selector: (row) => (row.unit ?? 0) * (row.cost ?? 0) || 0,
    },
  ];

  return (
    <React.Fragment>
      <div className="px-2">
        {/* <h6 className='display-6 font-size-20 font-semi-bold'>
          {chartHeading || 'Prescriptions'}
        </h6> */}

        <DataTable
          columns={columns}
          data={list?.map((_) => ({ ..._, id: uuid() }))}
        />
        {/* <Row className="bg-white">
          <Col xs={3} className="border-bottom">
            <span className="font-semi-bold fs-6">Treatment</span>{" "}
          </Col>
          <Col xs={3} className="border-bottom">
            <span className="font-semi-bold fs-6">Unit</span>
          </Col>
          <Col xs={3} className="border-bottom">
            <span className="font-semi-bold fs-6">Cost</span>
          </Col>
          <Col xs={3} className="border-bottom">
            <span className="font-semi-bold fs-6">Total</span>
          </Col>
          {(list || []).map((item) => (
            <React.Fragment key={item._id}>
              <Col xs={3} className="py-2">
                <span className="font-semi-bold">{item.slot?.name}</span>
              </Col>
              <Col xs={3} className="py-2">
                <span className="font-semi-bold">{item.unit}</span>
              </Col>
              <Col xs={3} className="py-2">
                <span className="font-semi-bold">{item.cost}</span>
              </Col>
              <Col xs={3} className="py-2">
                <span className="font-semi-bold">{item.unit * item.cost}</span>
              </Col>
            </React.Fragment>
          ))}
        </Row> */}
      </div>
    </React.Fragment>
  );
};

InvoiceList.propTypes = {
  list: PropTypes.array.isRequired,
};

export default InvoiceList;
