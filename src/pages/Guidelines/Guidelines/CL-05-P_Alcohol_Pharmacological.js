import React, { useRef } from "react";
import Cl05PAlcoholPharmacological from "./Prints/CL-05-P_Alcohol_Pharmacological";
import { handlePrint } from "../../../utils/print";
import { Printer } from "lucide-react";

const TITLE = "CL-05-P — Pharmacological Protocol: Alcohol Withdrawal & De-Addiction Management (12-Day Extended Detox)";

const Cl05PAlcoholPharmacologicalPage = () => {
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
      <Cl05PAlcoholPharmacological ref={printRef} classnames={"hidden print:block"} />
      <Cl05PAlcoholPharmacological heading="hidden" />
    </div>
  );
};

export default Cl05PAlcoholPharmacologicalPage;
