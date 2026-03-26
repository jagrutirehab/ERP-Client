import React from "react";
import PropTypes from "prop-types";
import InvoiceList from "../Tables/InvoiceList";
import { Col, Label, Row } from "reactstrap";
import { CARD, CASH, CHEQUE, UPI } from "../../../Components/constants/patient";
import RenderWhen from "../../../Components/Common/RenderWhen";

const OPDInvoice = ({ data, bill }) => {
  return (
    <React.Fragment>
      <div>
        <div>
          <h6 className="mb-3 fs-xs-14 fs-md-18">Invoice / Receipt</h6>
        </div>
        <div>
          <InvoiceList list={data?.invoiceList} />
        </div>
        <div className="pt-3">
          <Row>
            <Col xs={6} md={4}>
              <Label className="fs-xs-11 fs-md-14">GrandTotal--</Label>
              <span className="fs-xs-10 fs-md-12">{data?.grandTotal}</span>
            </Col>
            <Col xs={6} md={4}>
              <Label className="fs-xs-11 fs-md-14">Total Discount--</Label>
              <span className="fs-xs-10 fs-md-12">{data?.totalDiscount}</span>
            </Col>
            <Col xs={6} md={4}>
              <Label className="fs-xs-11 fs-md-14">Payable--</Label>
              <span className="fs-xs-10 fs-md-12">{data?.payable}</span>
            </Col>
            <Col xs={12}>
              {data?.paymentModes.map((paymentMode, i) => (
                <div key={i} className="d-flex align-items-center gap-3">
                  <h6 className="display-6 fs-14 mb-0">Payment Mode--</h6>
                  <div className="fs-13">
                    <span className="fw-bold">{paymentMode?.type}</span>

                    <RenderWhen isTrue={paymentMode?.type !== CASH}>
                      {" - "}
                      <span>Bank Account: {paymentMode?.bankAccount}</span>
                    </RenderWhen>

                    <RenderWhen isTrue={paymentMode?.type === CARD}>
                      {" - "}
                      <span>{paymentMode?.cardNumber}</span>
                    </RenderWhen>

                    <RenderWhen isTrue={paymentMode?.type === CHEQUE}>
                      {" - "}
                      <span>{paymentMode?.bankName}</span>
                      {" - "}
                      <span>{paymentMode?.chequeNumber}</span>
                    </RenderWhen>

                    <RenderWhen isTrue={paymentMode?.type === UPI}>
                      {" - "}
                      <span>{paymentMode?.transactionId}</span>
                    </RenderWhen>
                  </div>
                </div>
              ))}
            </Col>
          </Row>
        </div>
      </div>
    </React.Fragment>
  );
};

OPDInvoice.propTypes = {};

export default OPDInvoice;
