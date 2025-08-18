import React, { useState } from "react";
import { Button, Card, CardBody, Col, Input, Row, Spinner } from "reactstrap";
import RenderWhen from "../../../../Components/Common/RenderWhen";
import NurseFilters from "./NurseFilters";
import PropTypes from "prop-types";
import { connect } from "react-redux";

const NurseBar = ({ search, setSearch, flag, setFlag, loading }) => {
  return (
    <React.Fragment>
      <Card>
        <CardBody>
          <Row className="gap-2 align-items-end">
            <Col xs={12} md={4} lg={3}>
              <NurseFilters flag={flag} setFlag={setFlag} />
            </Col>
            <Col xs={12} md={4} lg={3}>
              <div className="search-box">
                <Input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="form-control"
                  placeholder="Search Patients(Name, room)..."
                />
                <i className="ri-search-line search-icon" />
                <RenderWhen isTrue={loading}>
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

const mapStateToProps = (state) => ({
  loading: state.Nurse.loading,
});

export default connect(mapStateToProps)(NurseBar);
