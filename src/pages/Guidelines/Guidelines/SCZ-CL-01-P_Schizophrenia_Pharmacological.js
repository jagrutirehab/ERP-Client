import React, { useRef } from "react";
import SczCl01PSchizophreniaPharmacological from "./Prints/SCZ-CL-01-P_Schizophrenia_Pharmacological";
import { handlePrint } from "../../../utils/print";
import { Printer } from "lucide-react";

const TITLE = "SCZ-CL-01-P — Pharmacological Protocol: Schizophrenia Spectrum Disorders (90-Day Programme)";

const SczCl01PSchizophreniaPharmacologicalPage = () => {
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
      <SczCl01PSchizophreniaPharmacological ref={printRef} classnames={"hidden print:block"} />
      <SczCl01PSchizophreniaPharmacological heading="hidden" />
    </div>
  );
};

export default SczCl01PSchizophreniaPharmacologicalPage;
