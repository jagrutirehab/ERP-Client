import { useState } from "react";
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

const Views = () => {
  const vws = {
    Overview: OVERVIEW_VIEW,
    Medication: MEDICATION_VIEW,
    Activities: ACTIVITY_VIEW,
    Notes: NOTES_VIEW,
  };

  const [view, setView] = useState(OVERVIEW_VIEW);

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
