import React, { useState } from "react";
import RFQList from "./RFQList";
import RFQForm from "./RFQForm";
import RFQDetail from "./RFQDetail";
import { usePermissions } from "../../../../Components/Hooks/useRoles.js";
import Basic404 from "../../../AuthenticationInner/Errors/Basic404";
import "../../UnitOfMeasurement/uom.scss";

const RFQModule = () => {
  const token = JSON.parse(localStorage.getItem("micrologin"))?.token;
  const { hasPermission } = usePermissions(token);
  const canView = hasPermission("MASTERDATA", "RFQ", "READ");

  const [view, setView] = useState("list");
  const [selectedRFQ, setSelectedRFQ] = useState(null);

  if (!canView) {
    return <Basic404 />;
  }

  const goToList = () => {
    setView("list");
    setSelectedRFQ(null);
  };

  if (view === "form") {
    return <RFQForm onSaved={goToList} onCancel={goToList} />;
  }

  if (view === "detail" && selectedRFQ) {
    return <RFQDetail rfqId={selectedRFQ} onBack={goToList} />;
  }

  return (
    <RFQList
      onAdd={() => setView("form")}
      onOpen={(rfq) => {
        setSelectedRFQ(rfq._id);
        setView("detail");
      }}
    />
  );
};

export default RFQModule;