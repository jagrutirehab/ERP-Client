import { useState } from "react";
import { Button, ButtonGroup } from "reactstrap";
import {
  OVERVIEW_VIEW,
  MEDICATION_VIEW,
} from "../../../Components/constants/nurse";
import Overview from "./Overview";
import Medications from "./Medications";

const Views = () => {
  const vws = {
    Overview: OVERVIEW_VIEW,
    Medication: MEDICATION_VIEW,
  };

  const [open, setOpen] = useState("");
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
      </div>
    </div>
  );
};

export default Views;
