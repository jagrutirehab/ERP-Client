import React, { useState } from "react";
import { Button, Card, CardBody, Col, Input, Row, Spinner } from "reactstrap";
import RenderWhen from "../../../Components/Common/RenderWhen";
import NurseFilters from "./NurseFilters";

const NurseBar = () => {
  const [query, setQuery] = useState("");

  return (
    <React.Fragment>
      <Card>
        <CardBody>
          <Row className="gap-2 align-items-end">
            <Col xs={12} md={4} lg={3}>
              <NurseFilters />
            </Col>
            <Col xs={12} md={4} lg={3}>
              <div className="search-box">
                <Input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="form-control"
                  placeholder="Search Patients(Name, room)..."
                />
                <i className="ri-search-line search-icon" />
                <RenderWhen isTrue={false}>
                  <Spinner
                    className="position-absolute end-0 top-50 translate-middle-y me-2"
                    color="success"
                    size="sm"
                  />
                </RenderWhen>
              </div>
            </Col>
          </Row>
        </CardBody>
      </Card>
    </React.Fragment>
  );
};

export default NurseBar;
