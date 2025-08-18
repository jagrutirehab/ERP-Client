import React, { useEffect, useState } from "react";
import { Button, Col, Row, Spinner } from "reactstrap";
import NurseBar from "./Views/Components/NurseBar";
import PatientCard from "./Views/Components/PatientCard";
import {
  setAlertData,
  setAlertModal,
  setNotesData,
  setNotesModal,
} from "../../store/actions";
import PropTypes from "prop-types";
import { useDispatch, connect } from "react-redux";
import InfoModal from "./Views/Components/InfoModal";
import {
  allNurseAssignedPatients,
  getAlertsByPatientId,
} from "../../store/features/nurse/nurseSlice";

const Main = ({
  alertModal,
  alertData,
  notesModal,
  notesData,
  data,
  loading,
}) => {
  const dispatch = useDispatch();

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState(search);
  const [flag, setFlag] = useState("");
  const limit = 12;

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);

    return () => clearTimeout(handler);
  }, [search]);

  useEffect(() => {
    dispatch(
      allNurseAssignedPatients({ page, limit, search: debouncedSearch, flag })
    );
  }, [dispatch, page, limit, flag, debouncedSearch]);

  const toggleAlertsModal = (patientId) => {
    dispatch(getAlertsByPatientId(patientId));
    dispatch(setAlertModal());
  };

  const toggleNotesModal = (notes) => {
    dispatch(setNotesData(notes));
    dispatch(setNotesModal());
  };

  const closeAlertModal = () => {
    dispatch(setAlertModal());
  };

  const closeNotesModal = () => {
    dispatch(setNotesData([]));
    dispatch(setNotesModal());
  };

  const handlePrev = () => {
    if (page > 1) setPage(page - 1);
  };

  const handleNext = () => {
    if (page < data.pagination.totalPages) setPage(page + 1);
  };

  document.title = "Nurse | Your App Name";

  console.log(data);

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
                  toggleNotesModal={() => {
                    toggleNotesModal(patient.notes ?? []);
                    dispatch(setNotesData(patient.notes));
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
        show={alertModal}
        title={"Alerts"}
        onCloseClick={closeAlertModal}
        content={alertData}
      />
      <InfoModal
        show={notesModal}
        title={"Notes"}
        onCloseClick={closeNotesModal}
        content={notesData}
      />
    </React.Fragment>
  );
};

Main.propTypes = {
  alertModal: PropTypes.bool,
  alertData: PropTypes.array,
  notesModal: PropTypes.bool,
  notesData: PropTypes.array,
  data: PropTypes.array,
};

const mapStateToProps = (state) => ({
  alertModal: state.Nurse.alertModal,
  alertData: state.Nurse.alertData,
  notesModal: state.Nurse.notesModal,
  notesData: state.Nurse.notesData,
  data: state.Nurse.data,
  loading: state.Nurse.loading,
});

export default connect(mapStateToProps)(Main);
