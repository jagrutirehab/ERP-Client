import React, { useRef } from "react";
import Adm06ClinicalCarePathwaysSOP from "./Prints/Adm-06_Clinical_Care_Pathways_LOS_Policy";
import { handlePrint } from "../../../utils/print";
import { Printer } from "lucide-react";

const TITLE = "Adm-06 — Clinical Care Pathways, Programme Duration & LOS Policy";

const Adm06ClinicalCarePathwaysSOPPage = () => {
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
      <Adm06ClinicalCarePathwaysSOP ref={printRef} classnames={"hidden print:block"} />
      <Adm06ClinicalCarePathwaysSOP heading="hidden" />
    </div>
  );
};

export default Adm06ClinicalCarePathwaysSOPPage;
