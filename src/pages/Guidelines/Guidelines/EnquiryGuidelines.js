import React, { useRef } from "react";
import EnquiryTakingPrint from "./Prints/EnquiryPrint";
import { handlePrint } from "../../../utils/print";
import { Printer } from "lucide-react";

const EnquiryGuidelines = () => {
  const printRef = useRef();

  return (
    <div className="w-100 p-4">
      <div className="bg-white shadow-sm p-2 d-flex align-items-center justify-content-between mb-5">
        <h2 className="mb-0">Enquiry Taking Guidelines</h2>
        <button
          className="btn btn-sm btn-outline-primary d-flex align-items-center gap-1"
          onClick={() => handlePrint(printRef, "Enquiry Taking Guidelines")}
          title={`Print Enquiry Taking Guidelines`}
        >
          <Printer size={14} />
          Print
        </button>
      </div>
      <EnquiryTakingPrint ref={printRef} classnames={"hidden print:block"} />
      <EnquiryTakingPrint heading="hidden" />
    </div>
  );
};

export default EnquiryGuidelines;
