import React, { useRef } from "react";
import Cl19IntellectualDisabilityNeurodevelopmental from "./Prints/CL-19_Intellectual_Disability_Neurodevelopmental";
import { handlePrint } from "../../../utils/print";
import { Printer } from "lucide-react";

const TITLE = "CL-19 — Intellectual Disability & Neurodevelopmental Disorders Assessment & Management Protocol";

const Cl19IntellectualDisabilityNeurodevelopmentalPage = () => {
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
      <Cl19IntellectualDisabilityNeurodevelopmental ref={printRef} classnames={"hidden print:block"} />
      <Cl19IntellectualDisabilityNeurodevelopmental heading="hidden" />
    </div>
  );
};

export default Cl19IntellectualDisabilityNeurodevelopmentalPage;
