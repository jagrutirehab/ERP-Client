import React, { useState } from "react";
import DIList from "./DIList";
import POSelector from "./POSelector";
import DIForm from "./DIForm";
import { usePermissions } from "../../../../Components/Hooks/useRoles.js";
import Basic404 from "../../../AuthenticationInner/Errors/Basic404";
import "../../UnitOfMeasurement/uom.scss";

const DeliveryIntimation = () => {
  const token = JSON.parse(localStorage.getItem("micrologin"))?.token;
  const { hasPermission } = usePermissions(token);
  const canView = hasPermission("MASTERDATA", "DELIVERY_INTIMATION", "READ");

  const [view, setView] = useState("list");
  const [selectedPO, setSelectedPO] = useState(null);

  if (!canView) {
    return <Basic404 />;
  }

  const goToList = () => {
    setView("list");
    setSelectedPO(null);
  };

  if (view === "select-po") {
    return (
      <POSelector
        onBack={goToList}
        onSelect={(po) => {
          setSelectedPO(po);
          setView("form");
        }}
      />
    );
  }

  if (view === "form" && selectedPO) {
    return <DIForm po={selectedPO} onSaved={goToList} onCancel={goToList} />;
  }

  return <DIList onAdd={() => setView("select-po")} />;
};

export default DeliveryIntimation;