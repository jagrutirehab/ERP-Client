import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { Button, Card, CardBody, Col, Input, Row, Spinner } from "reactstrap";
import CalenderHourDuration from "./CalenderHourDuration";
import RenderWhen from "../../../../Components/Common/RenderWhen";
import { connect, useDispatch } from "react-redux";
import { fetchAllDoctorSchedule } from "../../../../store/actions";

const BookingBar = ({ loading, centerAccess }) => {
  const dispatch = useDispatch();
  const [query, setQuery] = useState("");

  useEffect(() => {
    setTimeout(() => {
      dispatch(
        fetchAllDoctorSchedule({
          name: query,
          centerAccess: JSON.stringify(centerAccess),
        })
      );
    }, 1000);
  }, [dispatch, query, centerAccess]);

  return (
    <React.Fragment>
      <Card>
        <CardBody className="bg-white">
          <Row className="gap-2 align-items-end">
            <Col xs={12} md={4} lg={3}>
              <CalenderHourDuration />
            </Col>
            <Col xs={12} md={4} lg={4}>
              <div className="search-box">
                <Input
                  type="text"
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                  }}
                  style={{ paddingLeft: "20px !important" }}
                  className="ps-4"
                  placeholder="Search for name"
                  bsSize="sm"
                />
                <i
                  style={{ right: "10px", left: "unset" }}
                  className="ri-search-line search-icon"
                ></i>
                <RenderWhen isTrue={loading}>
                  <Spinner
                    className="position-absolute"
                    style={{ right: 30, top: 8 }}
                    color="success"
                    size={"sm"}
                  />
                </RenderWhen>
              </div>
            </Col>
            <Col className="col-sm-auto ms-auto">
              <div className="list-grid-nav hstack gap-1">
                <Button
                  className="text-white"
                  color="success"
                  //   onClick={toggleForm}
                >
                  <i className="ri-add-fill me-1 align-bottom"></i> Add Item
                </Button>
              </div>
            </Col>
          </Row>
        </CardBody>
      </Card>
    </React.Fragment>
  );
};

const mapStateToProps = (state) => ({
  loading: state.Setting.loading,
  centerAccess: state.User?.centerAccess,
});

BookingBar.prototype = {
  loading: PropTypes.bool,
  centerAccess: PropTypes.array,
};

export default connect(mapStateToProps)(BookingBar);
