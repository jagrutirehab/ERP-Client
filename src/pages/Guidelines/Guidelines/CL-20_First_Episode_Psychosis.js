import React, { useRef } from "react";
import Cl20FirstEpisodePsychosis from "./Prints/CL-20_First_Episode_Psychosis";
import { handlePrint } from "../../../utils/print";
import { Printer } from "lucide-react";

const TITLE = "CL-20 — First-Episode Psychosis (FEP) Early Detection, Assessment & Management Protocol";

const Cl20FirstEpisodePsychosisPage = () => {
  const printRef = useRef();

  return (
    <div className="w-100 p-4">
      <div className="bg-white shadow-sm p-2 d-flex align-items-center justify-content-between mb-5">
        <h2 className="mb-0">{TITLE}</h2>
        <button
          className="btn btn-sm btn-outline-primary d-flex align-items-center gap-1"
          onClick={() => handlePrint(printRef, TITLE)}
          title={`Print ${TITLE}`}
        >
          <Printer size={14} />
          Print
        </button>
      </div>
      <Cl20FirstEpisodePsychosis ref={printRef} classnames={"hidden print:block"} />
      <Cl20FirstEpisodePsychosis heading="hidden" />
    </div>
  );
};

export default Cl20FirstEpisodePsychosisPage;
