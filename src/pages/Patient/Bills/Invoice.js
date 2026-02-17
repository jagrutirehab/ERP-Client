import React from "react";
import PropTypes from "prop-types";
import InvoiceList from "../Tables/InvoiceList";
import { Col, Label, Row } from "reactstrap";
import { INVOICE, REFUND } from "../../../Components/constants/patient";
import RenderWhen from "../../../Components/Common/RenderWhen";

const Invoice = ({ title = "Invoice", data, bill }) => {
  console.log("data while draft", data);

  const itemsDiscount =
    data?.invoiceList?.reduce(
      (sum, item) => sum + (parseFloat(item.discount) || 0),
      0,
    ) || 0;

  const additionalDiscount =
    (parseFloat(data?.totalDiscount) || 0) - itemsDiscount;
  console.log("additionalDiscount", additionalDiscount);
  console.log("InvoiceList Raw:", JSON.stringify(data?.invoiceList, null, 2));
  return (
    <React.Fragment>
      <div>
        <div>
          {/* <h6 className="mb-3 fs-xs-14 fs-md-18">
            {bill.bill === INVOICE ? title : "Refund Receipt"}
          </h6> */}
        </div>
        <div>
          <InvoiceList list={data?.invoiceList} />
        </div>
        <div className="pt-3 ">
          <Row className="justify-content-between">
            <Col xs={6} md={2}>
              <Label className="fs-xs-11 fs-md-14">GrandTotal--</Label>
              <span className="fs-xs-10 fs-md-12">{data?.grandTotal}</span>
            </Col>
            <Col xs={6} md={2}>
              <Label className="fs-xs-11 fs-md-14">Items Discount--</Label>
              <span className="fs-xs-10 fs-md-12">{itemsDiscount || 0}</span>
            </Col>
            <Col xs={6} md={2}>
              <Label className="fs-xs-11 fs-md-14">Additional Discount--</Label>
              <span className="fs-xs-10 fs-md-12">
                {additionalDiscount || 0}
              </span>
            </Col>
            <Col xs={6} md={2}>
              <Label className="fs-xs-11 fs-md-14">Total Discount--</Label>
              <span className="fs-xs-10 fs-md-12">{data?.totalDiscount}</span>
            </Col>
            <Col xs={6} md={2}>
              <Label className="fs-xs-11 fs-md-14">Payable--</Label>
              <span className="fs-xs-10 fs-md-12">{data?.payable}</span>
            </Col>

            <Col xs={12}>
              <RenderWhen isTrue={bill.bill === INVOICE}>
                <div className="d-flex justify-content-center gap-5 shadow-lg border p-1">
                  {" "}
                  <h6 className="text-primary text-center fs-xs-11 fs-md-14 m-0">
                    Current Advance: {data?.currentAdvance ?? 0}
                  </h6>
                  <h6 className="text-primary text-center fs-xs-11 fs-md-14 m-0">
                    Calculated Advance: {data?.calculatedAdvance ?? 0}
                  </h6>
                  <h6 className="text-primary text-center fs-xs-11 fs-md-14 m-0">
                    Calculated Payable: {data?.calculatedPayable ?? 0}
                  </h6>
                </div>
              </RenderWhen>
              <RenderWhen isTrue={bill.bill === REFUND}>
                <div className="d-flex justify-content-center gap-5 shadow-lg border p-1">
                  {" "}
                  <h6 className="text-primary text-center fs-xs-11 fs-md-14 m-0">
                    Refund: {data?.refund ?? 0}
                  </h6>
                </div>
              </RenderWhen>
            </Col>
          </Row>
        </div>
      </div>
    </React.Fragment>
  );
};

Invoice.propTypes = {};

export default Invoice;
