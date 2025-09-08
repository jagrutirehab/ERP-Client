import React, { useEffect, useState } from "react";
import { Button, Col, Row, Spinner } from "reactstrap";
import NurseBar from "./Views/Components/NurseBar";
import PatientCard from "./Views/Components/PatientCard";
import { setAlertData, setAlertModal } from "../../store/actions";
import PropTypes from "prop-types";
import { useDispatch, connect, useSelector } from "react-redux";
import InfoModal from "./Views/Components/InfoModal";
import {
  allNurseAssignedPatients,
  getAlertsByPatientId,
  setPatientIds,
  setSearchMode,
} from "../../store/features/nurse/nurseSlice";
import { usePermissions } from "../../Components/Hooks/useRoles";
import { useNavigate } from "react-router-dom";

const Main = ({ alertModal, alertData, data, loading, centerAccess }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [selectedPatient, setSelectedPatient] = useState("");
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
  const hasUserPermission = hasPermission("NURSE", null, "READ");

  useEffect(() => {
    if (!hasPermission) return;
    const handler = setTimeout(() => {
      setDebouncedSearch(search);

      if (search && search.trim() !== "") {
        dispatch(setSearchMode(true));
      } else {
        dispatch(setSearchMode(false));
      }
    }, 500);

    return () => clearTimeout(handler);
  }, [search, roles, dispatch]);

  useEffect(() => {
    if (centerAccess && centerAccess.length > 0) {
      dispatch(setPatientIds([]));
      localStorage.removeItem("nursePatients");
    }
  }, [JSON.stringify(centerAccess)]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, flag]);

  useEffect(() => {
    if (!hasPermission) return;
    dispatch(
      allNurseAssignedPatients({
        page,
        limit,
        search: debouncedSearch,
        flag,
        centerAccess,
      })
    );
  }, [dispatch, page, limit, flag, debouncedSearch, centerAccess, roles]);

  const toggleAlertsModal = (patientId) => {
    setSelectedPatient(patientId);
    dispatch(getAlertsByPatientId(patientId));
    dispatch(setAlertModal());
  };

  const closeAlertModal = () => {
    dispatch(setAlertModal());
  };

  const handlePrev = () => {
    if (page > 1) setPage(page - 1);
  };

  const handleNext = () => {
    if (page < data.pagination.totalPages) setPage(page + 1);
  };

  document.title = "Nurse | Your App Name";

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

  return (
    <React.Fragment>
      <div>
        <NurseBar
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
                <PatientCard
                  toggleAlertsModal={() => {
                    toggleAlertsModal(patient._id);
                  }}
                  patient={{
                    ...patient,
                    notes: patient.notes ?? [],
                  }}
                />
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

        {data?.pagination?.totalPages > 1 && (
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

      <InfoModal
        patientId={selectedPatient}
        show={alertModal}
        title={"Alerts"}
        onCloseClick={closeAlertModal}
        content={alertData}
      />
    </React.Fragment>
  );
};

Main.propTypes = {
  alertModal: PropTypes.bool,
  alertData: PropTypes.array,
  data: PropTypes.array,
  centerAccess: PropTypes.array.isRequired,
};

const mapStateToProps = (state) => ({
  alertModal: state.Nurse.alertModal,
  alertData: state.Nurse.alertData,
  data: state.Nurse.data,
  loading: state.Nurse.loading,
  centerAccess: state.User?.centerAccess,
});

export default connect(mapStateToProps)(Main);
