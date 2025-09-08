import { useEffect, useState } from "react";
import { Button, ButtonGroup } from "reactstrap";
import {
  OVERVIEW_VIEW,
  MEDICATION_VIEW,
  NOTES_VIEW,
  ACTIVITY_VIEW,
} from "../../../Components/constants/nurse";
import Overview from "./Overview";
import Medications from "./Medications";
import Notes from "./Notes";
import Activities from "./Activities";
import { connect, useDispatch } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import {
  allNurseAssignedPatients,
  setIndex,
  setPatientIds,
} from "../../../store/features/nurse/nurseSlice";

const Views = ({ patients, patientIds, currentPatientIndex, searchMode, centerAccess }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [view, setView] = useState(OVERVIEW_VIEW);

  useEffect(() => {
    if (id && patientIds.length > 0) {
      const newIndex = patientIds.indexOf(String(id));
      if (newIndex !== -1 && newIndex !== currentPatientIndex) {
        dispatch(setIndex(newIndex));
      }
    }
  }, [id, patientIds, currentPatientIndex, dispatch]);

  const index = currentPatientIndex;

  const prevPatientId = index > 0 ? patientIds[index - 1] : null;
  const nextPatientId =
    index >= 0 && index < patientIds.length - 1 ? patientIds[index + 1] : null;

  useEffect(() => {
    if (patients?.data?.length > 0) {
      const newPatientIds = patients.data
        .map((p) => String(p?._id || p?.id))
        .filter(Boolean);

      if (searchMode) {
        dispatch(setPatientIds(newPatientIds));
      } else {
        const stored = patientIds;
        const merged = Array.from(new Set([...stored, ...newPatientIds]));
        dispatch(setPatientIds(merged));
      }
    }
  }, [patients, searchMode, centerAccess]);

  const handleNext = async () => {
    if (nextPatientId) {
      dispatch(setIndex(index + 1));
      navigate(`/nurse/p/${nextPatientId}`);
    } else {
      const currentPage = patients?.pagination?.page || 1;
      const totalPages = patients?.pagination?.totalPages || 1;
      if (searchMode) {
        if (currentPage >= totalPages) return;
        const result = await dispatch(
          allNurseAssignedPatients({
            page: currentPage + 1,
            limit:12,
            flag: "",
            centerAccess
          })
        ).unwrap();

        if (result?.data?.length > 0) {
          const firstNewId = String(result.data[0]?._id || result.data[0]?.id);
          if (firstNewId) {
            const newIndex = patientIds.length;
            dispatch(setIndex(newIndex));
            navigate(`/nurse/p/${firstNewId}`);
          }
        }
      } else {
        if (currentPage >= totalPages) return;

        const result = await dispatch(
          allNurseAssignedPatients({ page:currentPage + 1, limit: 12, flag: "", centerAccess })
        ).unwrap();

        if (result?.data?.length > 0) {
          const firstNewId = String(result.data[0]?._id || result.data[0]?.id);
          if (firstNewId) {
            const newIndex = patientIds.length;
            dispatch(setIndex(newIndex));
            navigate(`/nurse/p/${firstNewId}`);
          }
        }
      }
    }
  };

  const handlePrev = () => {
    if (prevPatientId) {
      dispatch(setIndex(index - 1));
      navigate(`/nurse/p/${prevPatientId}`);
    }
  };


  const disableNext =
    searchMode
      ? index >= (patients?.pagination?.totalDocs || 0) - 1
      : !nextPatientId && (patients?.pagination?.page || 1) >= (patients?.pagination?.totalPages || 1);

  const vws = {
    Overview: OVERVIEW_VIEW,
    Medication: MEDICATION_VIEW,
    Activities: ACTIVITY_VIEW,
    Notes: NOTES_VIEW,
  };

  const tabs = Object.keys(vws);

  return (
    <div className="position-relative overflow-x-hidden bg-white mt-1 px-2 py-2">
      <div className="d-flex justify-content-between flex-wrap">
        <ButtonGroup size="sm">
          {tabs.map((tab) => {
            const vw = vws[tab];
            return (
              <Button
                key={vw}
                outline={view !== vw}
                onClick={() => setView(vw)}
              >
                {tab}
              </Button>
            );
          })}
        </ButtonGroup>
        <div className="gap-2 d-flex">
          <Button outline disabled={!prevPatientId} onClick={handlePrev}>
            &larr; Previous
          </Button>
          <Button disabled={disableNext} outline onClick={handleNext}>
            Next &rarr;
          </Button>
        </div>
      </div>

      <div className="mt-3 overflowx-hidden">
        {view === OVERVIEW_VIEW && <Overview />}
        {view === MEDICATION_VIEW && <Medications />}
        {view === NOTES_VIEW && <Notes />}
        {view === ACTIVITY_VIEW && <Activities />}
      </div>
    </div>
  );
};

const mapStateToProps = (state) => ({
  patients: state.Nurse.data,
  patientIds: state.Nurse.patientIds,
  currentPatientIndex: state.Nurse.index,
  searchMode: state.Nurse.searchMode,
  patientIdsFromSearch:state.patientIdsFromSearch,
  centerAccess: state.User?.centerAccess,
});

export default connect(mapStateToProps)(Views);
