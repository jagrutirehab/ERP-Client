import React from "react";
import { Row, Col } from "reactstrap";
import PropTypes from "prop-types";
import DataTable from "react-data-table-component";
import { v4 as uuid } from "uuid";

const InvoiceList = ({ list }) => {
  // console.log("list o man", list);
  const hasDateColumn = list?.some(
    (item) => item.fromDate && item.toDate
  );
  const hasDiscountReason = list?.some(
    (item) => Number(item.discount) > 0
  );
  const columns = [
    {
      name: "Treatment",
      selector: (row) => row.slot,
      wrap: true,
      grow: 2,
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
      name: "Item Discount",
      selector: (row) => row.discount ?? 0,
    },
...(hasDiscountReason
  ? [
      {
        name: "Reason",
        minWidth: "200px",
        cell: (row) => (
          <div
            style={{
              maxHeight: "50px",
              overflowY: "auto",
              fontSize: "12px",
              scrollbarWidth: "thin",
            }}
            className="scroll-hide-lite"
          >
            {row.discount > 0
              ? row.discountReason || "-"
              : "-"}
          </div>
        ),
        wrap: true,
      },
    ]
  : []),
    ...(hasDateColumn
      ? [
        {
          name: "Duration",
          cell: (row) =>
            row.fromDate && row.toDate
              ? `${new Date(row.fromDate).toLocaleDateString()} - ${new Date(
                row.toDate
              ).toLocaleDateString()}`
              : "-",
        },
      ]
      : []),
    {
      name: "Net Total",
      selector: (row) =>
        (row.unit ?? 0) * (row.cost ?? 0) - (row.discount ?? 0),
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
