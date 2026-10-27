import React from "react";
import { Card, CardBody, Col, Input, Label, Row, Spinner } from "reactstrap";
import RenderWhen from "../../../../Components/Common/RenderWhen";
import NurseFilters from "./NurseFilters";
import { connect, useDispatch } from "react-redux";
import { setPatientIdsFromSearch } from "../../../../store/features/nurse/nurseSlice";

const NurseBar = ({
  search,
  setSearch,
  flag,
  setFlag,
  scope,
  setScope,
  loading,
}) => {
  const dispatch = useDispatch();

  const handleScopeChange = (e) => {
    setScope(e.target.value);
    // Same reset the status filter does: the stored patient-id list is for the
    // previous result set.
    dispatch(setPatientIdsFromSearch(true));
  };

  return (
    <React.Fragment>
      <Card>
        <CardBody>
          <Row className="gap-2 align-items-end">
            <Col xs={12} md={3} lg={2}>
              <Label>Patients</Label>
              <Input
                className="form-control"
                onChange={handleScopeChange}
                value={scope}
                bsSize="sm"
                type="select"
              >
                <option value="ALL">All Patients</option>
                <option value="MY">My Patients</option>
              </Input>
            </Col>
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
