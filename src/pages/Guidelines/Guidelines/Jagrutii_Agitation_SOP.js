import React, { useRef } from "react";
import JagrutiiAgitationSOP from "./Prints/Jagrutii_Agitation_SOP";
import { handlePrint } from "../../../utils/print";
import { Printer } from "lucide-react";

const TITLE = "Jagrutii SOP — Management of Agitated Patients in Rehabilitation Settings";

const JagrutiiAgitationSOPPage = () => {
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
      <JagrutiiAgitationSOP ref={printRef} classnames={"hidden print:block"} />
      <JagrutiiAgitationSOP heading="hidden" />
    </div>
  );
};

export default JagrutiiAgitationSOPPage;
