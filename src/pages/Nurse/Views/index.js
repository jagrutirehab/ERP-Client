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
import { useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";

const Views = () => {
  // const { id } = useParams();
  // const navigate = useNavigate();

  // const patients = useSelector((state) => state.Nurse.data.data) || [];
  const [currentUserIndex, setCurrentUserIndex] = useState(0);
  const [view, setView] = useState(OVERVIEW_VIEW);

  const vws = {
    Overview: OVERVIEW_VIEW,
    Medication: MEDICATION_VIEW,
    Activities: ACTIVITY_VIEW,
    Notes: NOTES_VIEW,
  };

  // useEffect(() => {
  //   if (!Array.isArray(patients) || patients.length === 0) return;
  //   const index = patients.findIndex((patient) => patient._id === id);
  //   setCurrentUserIndex(index >= 0 ? index : 0); 
  // }, [id, patients]);

  // const prevPatient = patients[currentUserIndex - 1];
  // const nextPatient = patients[currentUserIndex + 1];

  // const navigateTo = (index) => {
  //   if (index < 0 || index >= patients.length) return; 
  //   navigate(`/nurse/p/${patients[index]._id}`);
  // };

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
        {/* <div className="gap-2 d-flex">
          <Button
            outline
            disabled={!prevPatient}
            onClick={() => navigateTo(currentUserIndex - 1)}
          >
            &larr; Previous
          </Button>

          <Button
            outline
            disabled={!nextPatient}
            onClick={() => navigateTo(currentUserIndex + 1)}
          >
            Next &rarr;
          </Button>
        </div> */}
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

export default Views;
