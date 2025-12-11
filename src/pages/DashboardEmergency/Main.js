import React, { useEffect, useState } from "react";
import PatientBar from "./components/PatientBar";
import PropTypes from "prop-types";
import { connect, useDispatch } from "react-redux";
import { getAllPatients } from "../../store/features/emergency/emergencySlice";
import { Button, Col, Row, Spinner } from "reactstrap";
import PatientCard from "./components/PatientCard";
import { usePermissions } from "../../Components/Hooks/useRoles";
import { useNavigate } from "react-router-dom";

const Main = ({ loading, data, centerAccess }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState(search);
  const [flag, setFlag] = useState("");
  const limit = 12;
  const microUser = localStorage.getItem("micrologin");
  const token = microUser ? JSON.parse(microUser).token : null;
  const {
    loading: permissionLoader,
    hasPermission,
    roles,
  } = usePermissions(token);
  const hasUserPermission = hasPermission("EMERGENCY", null, "READ");

  useEffect(() => {
    if (!hasUserPermission) return;
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);
    return () => clearTimeout(handler);
  }, [search, roles]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, flag]);

  useEffect(() => {
    if (!hasUserPermission) return;
    dispatch(
      getAllPatients({
        page,
        limit,
        search: debouncedSearch,
        flag,
        centerAccess,
      })
    );
  }, [page, limit, debouncedSearch, flag, roles, centerAccess, dispatch]);

  const handlePrev = () => {
    if (page > 1) setPage(page - 1);
  };

  const handleNext = () => {
    if (page < data.pagination.totalPages) setPage(page + 1);
  };

  if (permissionLoader) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <Spinner
          color="primary"
          className="d-block"
          style={{ width: "3rem", height: "3rem" }}
        />
      </div>
    );
  }

  if (!hasUserPermission) {
    navigate("/unauthorized");
    return null;
  }

  document.title = "Emergency Dashboar | Your App Name";
  return (
    <React.Fragment>
      <div>
        <PatientBar
          flag={flag}
          search={search}
          setSearch={setSearch}
          setFlag={setFlag}
        />
        {loading ? (
          <div
            className="d-flex justify-content-center align-items-center"
            style={{ height: "50vh" }}
          >
            <Spinner color="primary" />
          </div>
        ) : data.data && data.data.length > 0 ? (
          <Row className="g-3">
            {data.data.map((patient) => (
              <Col xl={3} lg={4} md={6} sm={6} xs={12} key={patient._id}>
                <PatientCard patient={patient} />
              </Col>
            ))}
          </Row>
        ) : (
          <div
            className="d-flex justify-content-center align-items-center"
            style={{ height: "50vh", fontSize: "1.2rem", color: "#555" }}
          >
            No patients found.
          </div>
        )}
        {data.pagination?.totalPages > 1 && (
          <Row className="mt-4 justify-content-center align-items-center">
            <Col xs="auto" className="d-flex justify-content-center">
              <Button
                color="secondary"
                disabled={page === 1}
                onClick={handlePrev}
              >
                ← Previous
              </Button>
            </Col>
            <Col xs="auto" className="text-center text-muted mx-3">
              Showing {(page - 1) * limit + 1}–
              {Math.min(page * limit, data.pagination?.totalDocs || 0)} of{" "}
              {data.pagination?.totalDocs || 0}
            </Col>
            <Col xs="auto" className="d-flex justify-content-center">
              <Button
                color="secondary"
                disabled={page === data.pagination?.totalPages}
                onClick={handleNext}
              >
                Next →
              </Button>
            </Col>
          </Row>
        )}
      </div>
    </React.Fragment>
  );
};

Main.propTypes = {
  loading: PropTypes.bool,
  data: PropTypes.array,
  centerAccess: PropTypes.array.isRequired
};

const mapStateToProps = (state) => ({
  loading: state.Emergency.loading,
  data: state.Emergency.data,
  centerAccess: state.User?.centerAccess
});

export default connect(mapStateToProps)(Main);
