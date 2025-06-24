import React from "react";
import PropTypes from "prop-types";
import InvoiceList from "../Tables/InvoiceList";
import { Col, Label, Row } from "reactstrap";
import { CARD, CHEQUE, UPI } from "../../../Components/constants/patient";
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
              <div className="d-flex align-items-center gap-3">
                <h6 className="display-6 fs-14 mb-0">Payment Mode--</h6>
                <div className="fs-13">
                  <span className="fw-bold">{data.paymentMode?.type} </span>

                  <RenderWhen isTrue={data.paymentMode?.type === CARD}>
                    <span>{data.paymentMode?.cardNumber}</span>
                  </RenderWhen>

                  <RenderWhen isTrue={data.paymentMode?.type === CHEQUE}>
                    <span>{data.paymentMode?.bankName}</span>
                    <span>{data.paymentMode?.chequeNumber}</span>
                  </RenderWhen>

                  <RenderWhen isTrue={data.paymentMode?.type === UPI}>
                    <span>{data.paymentMode?.transactionId}</span>
                  </RenderWhen>
                </div>
              </div>
            </Col>
          </Row>
        </div>
      </div>
    </React.Fragment>
  );
};

OPDInvoice.propTypes = {};

export default OPDInvoice;
