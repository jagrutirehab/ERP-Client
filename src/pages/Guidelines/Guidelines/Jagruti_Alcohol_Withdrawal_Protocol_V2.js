import React, { useRef } from "react";
import JagrutiiAlcoholWithdrawalProtocolV2 from "./Prints/Jagruti_Alcohol_Withdrawal_Protocol_V2";
import { handlePrint } from "../../../utils/print";
import { Printer } from "lucide-react";

const TITLE = "Jagruti — Alcohol Withdrawal Management Protocol V2.0";

const JagrutiiAlcoholWithdrawalProtocolV2Page = () => {
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
      <JagrutiiAlcoholWithdrawalProtocolV2 ref={printRef} classnames={"hidden print:block"} />
      <JagrutiiAlcoholWithdrawalProtocolV2 heading="hidden" />
    </div>
  );
};

export default JagrutiiAlcoholWithdrawalProtocolV2Page;
