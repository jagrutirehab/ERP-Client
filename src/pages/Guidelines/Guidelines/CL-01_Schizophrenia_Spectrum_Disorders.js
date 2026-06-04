import React, { useRef } from "react";
import Cl01SchizophreniaProtocol from "./Prints/CL-01_Schizophrenia_Spectrum_Disorders";
import { handlePrint } from "../../../utils/print";
import { Printer } from "lucide-react";

const TITLE = "CL-01 — Schizophrenia Spectrum Disorders Treatment Protocol";

const Cl01SchizophreniaProtocolPage = () => {
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
      <Cl01SchizophreniaProtocol ref={printRef} classnames={"hidden print:block"} />
      <Cl01SchizophreniaProtocol heading="hidden" />
    </div>
  );
};

export default Cl01SchizophreniaProtocolPage;
