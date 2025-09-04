import React from "react";
import { Card, CardBody, Col, Input, Label, Row, Spinner } from "reactstrap";
import { connect, useDispatch } from "react-redux";
import RenderWhen from "../../../Components/Common/RenderWhen";

const DashboardBar = ({ search, setSearch, flag, setFlag, loading }) => {
  const dispatch = useDispatch();
  const handleFlagChange = (e) => {
    setFlag(e.target.value);
  };
  return (
    <React.Fragment>
      <Card>
        <CardBody>
          <Row className="gap-2 align-items-end">
            <Col md={2}>
              <Label>Filter by Status</Label>
              <Input
                className="form-control"
                onChange={handleFlagChange}
                value={flag}
                bsSize="sm"
                type="select"
              >
                <option value={""}>All Patients</option>
                <option value={"suicidal"}>Suicidal</option>
                <option value={"runaway"}>Runaway</option>
                <option value={"serious"}>Medically Serious</option>
                <option value={"aggresive"}>Aggresive</option>
              </Input>
            </Col>

            <Col md={3}>
              <div className="search-box position-relative">
                <Input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="form-control"
                  placeholder="Search Patients(Name, UID)..."
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
  loading: state.Emergency.loading,
});

export default connect(mapStateToProps)(DashboardBar);
