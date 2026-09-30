import React, { useRef } from "react";
import Cl08AutismSpectrumDisorder from "./Prints/CL-08_Autism_Spectrum_Disorder";
import { handlePrint } from "../../../utils/print";
import { Printer } from "lucide-react";

const TITLE = "CL-08 — Autism Spectrum Disorder Assessment & Management Protocol";

const Cl08AutismSpectrumDisorderPage = () => {
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
      <Cl08AutismSpectrumDisorder ref={printRef} classnames={"hidden print:block"} />
      <Cl08AutismSpectrumDisorder heading="hidden" />
    </div>
  );
};

export default Cl08AutismSpectrumDisorderPage;
