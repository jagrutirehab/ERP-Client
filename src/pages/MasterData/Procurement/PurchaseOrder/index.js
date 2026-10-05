import React, { useState } from "react";
import POList from "./POList";
import POForm from "./POForm";
import POOverview from "./POOverview";
import { usePermissions } from "../../../../Components/Hooks/useRoles.js";
import Basic404 from "../../../AuthenticationInner/Errors/Basic404";
import "../../UnitOfMeasurement/uom.scss";

const PurchaseOrder = () => {
  const token = JSON.parse(localStorage.getItem("micrologin"))?.token;
  const { hasPermission } = usePermissions(token);
  const canView = hasPermission("MASTERDATA", "PO", "READ");

  const [view, setView] = useState("list");
  const [selectedPOId, setSelectedPOId] = useState(null);

  if (!canView) {
    return <Basic404 />;
  }

  const goToList = () => {
    setView("list");
    setSelectedPOId(null);
  };

  if (view === "form") {
    return <POForm onSaved={goToList} onCancel={goToList} />;
  }

  if (view === "overview" && selectedPOId) {
    return <POOverview poId={selectedPOId} onBack={goToList} />;
  }

  return (
    <POList
      onAdd={() => setView("form")}
      onOpen={(po) => {
        setSelectedPOId(po._id);
        setView("overview");
      }}
    />
  );
};

export default PurchaseOrder;