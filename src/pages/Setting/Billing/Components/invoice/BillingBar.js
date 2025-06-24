import PropTypes from "prop-types";
import { useEffect, useState } from "react";
import { CardBody, Row, Col, Input, Button } from "reactstrap";

const BillingBar = ({ toggleForm, setSearch }) => {
  const [tempSearch, setTempSearch] = useState("");

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      setSearch(tempSearch);
    }, 500);

    return () => clearTimeout(delayDebounce);
  }, [tempSearch, setSearch]);

  return (
    <CardBody className="p-3 bg-white">
      <Row className="gy-2 gx-3 align-items-center">
        <Col xs="12" sm="8" md="6" lg="4">
          <div className="position-relative">
            <Input
              type="text"
              value={tempSearch}
              onChange={(e) => setTempSearch(e.target.value)}
              className="form-control pe-5"
              placeholder="Search for name"
              aria-label="Search for name"
            />
            <i
              className="ri-search-line position-absolute end-0 top-50 translate-middle-y me-3 text-muted"
              style={{ pointerEvents: "none" }}
            ></i>
          </div>
        </Col>

        <Col xs="12" sm="4" md="6" lg="4" className="ms-sm-auto text-sm-end">
          <Button
            className="text-white w-100 w-sm-auto"
            color="success"
            onClick={toggleForm}
          >
            <i className="ri-add-fill me-1 align-middle"></i> Add Item
          </Button>
        </Col>
      </Row>
    </CardBody>
  );
};

BillingBar.propTypes = {
  toggleForm: PropTypes.func.isRequired,
  setSearch: PropTypes.func.isRequired,
};

export default BillingBar;
