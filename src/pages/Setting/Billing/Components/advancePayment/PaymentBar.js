import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { Card, CardBody, Row, Col, Input, Button } from "reactstrap";

const PaymentBar = ({ toggleForm, setSearchadv }) => {
  const [tempSearch, setTempSearch] = useState("");

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      setSearchadv(tempSearch);
    }, 500);

    return () => clearTimeout(delayDebounce);
  }, [tempSearch, setSearchadv]);
  return (
    <CardBody className="p-3 bg-white">
      <Row className="gy-2 gx-3 align-items-center">
        <Col xs="12" sm="8" md="6" lg="4">
          <div className="position-relative">
            <Input
              type="text"
              value={tempSearch}
              onChange={(e) => setTempSearch(e.target.value)}
              className="form-control"
              placeholder="Search for name"
            />
            <i className="ri-search-line position-absolute end-0 top-50 translate-middle-y me-3 text-muted"></i>
          </div>
        </Col>
        <Col xs="12" sm="4" md="6" lg="4" className="ms-sm-auto text-sm-end">
          <Button
            className="text-white w-100 w-sm-auto"
            color="success"
            onClick={toggleForm}
          >
            <i className="ri-add-fill me-1 align-bottom"></i> Add Item
          </Button>
        </Col>
      </Row>
    </CardBody>
  );
};

PaymentBar.propTypes = {
  toggleModal: PropTypes.func,
};

export default PaymentBar;
