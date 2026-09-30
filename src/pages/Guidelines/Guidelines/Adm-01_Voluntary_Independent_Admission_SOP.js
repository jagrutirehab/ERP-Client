import React, { useRef } from "react";
import Adm01VoluntaryAdmissionSOP from "./Prints/Adm-01_Voluntary_Independent_Admission_SOP";
import { handlePrint } from "../../../utils/print";
import { Printer } from "lucide-react";

const TITLE = "Adm-01 — Voluntary (Independent) Admission SOP";

const Adm01VoluntaryAdmissionSOPPage = () => {
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
      <Adm01VoluntaryAdmissionSOP ref={printRef} classnames={"hidden print:block"} />
      <Adm01VoluntaryAdmissionSOP heading="hidden" />
    </div>
  );
};

export default Adm01VoluntaryAdmissionSOPPage;
