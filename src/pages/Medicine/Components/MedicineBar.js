import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import {
  CardBody,
  Row,
  Col,
  Input,
  Button,
  InputGroup,
  InputGroupText,
} from "reactstrap";

const MedicineBar = ({ toggleForm, toggleCSV, setSearchItem }) => {
  const [tempSearch, setTempSearch] = useState("");

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      setSearchItem(tempSearch);
    }, 500);

    return () => clearTimeout(delayDebounce);
  }, [tempSearch, setSearchItem]);

  return (
    // <Card>
    <CardBody className="p-3 bg-white">
      <Row className="g-2 align-items-center">
        <Col sm={4}>
          <InputGroup>
            <Input
              type="text"
              value={tempSearch}
              onChange={(e) => setTempSearch(e.target.value)}
              placeholder="Search for name"
            />
            <InputGroupText>
              <i className="ri-search-line"></i>
            </InputGroupText>
          </InputGroup>
        </Col>

        <Col className="col-sm-auto me-auto">
          <Button color="info" className="text-white" onClick={toggleCSV}>
            <i className="ri-file-paper-2-line"></i>
          </Button>
        </Col>

        <Col className="col-sm-auto ms-auto">
          <Button color="success" className="text-white" onClick={toggleForm}>
            <i className="ri-add-fill me-1 align-bottom"></i> Add Medicine
          </Button>
        </Col>
      </Row>
    </CardBody>
    // </Card>/
  );
};

MedicineBar.propTypes = {
  toggleForm: PropTypes.func.isRequired,
  toggleCSV: PropTypes.func.isRequired,
  setSearchItem: PropTypes.func.isRequired,
};

export default MedicineBar;
