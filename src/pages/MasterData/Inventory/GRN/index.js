import React, { useState } from "react";
import GRNList from "./GRNList";
import DISelector from "./DISelector";
import GRNForm from "./GRNForm";
import { usePermissions } from "../../../../Components/Hooks/useRoles.js";
import Basic404 from "../../../AuthenticationInner/Errors/Basic404";
import "../../UnitOfMeasurement/uom.scss";

const GoodsReceiptNote = () => {
  const token = JSON.parse(localStorage.getItem("micrologin"))?.token;
  const { hasPermission } = usePermissions(token);
  const canView = hasPermission("MASTERDATA", "GRN", "READ");

  const [view, setView] = useState("list");
  const [selectedDI, setSelectedDI] = useState(null);

  if (!canView) {
    return <Basic404 />;
  }

  const goToList = () => {
    setView("list");
    setSelectedDI(null);
  };

  if (view === "select-di") {
    return (
      <DISelector
        onBack={goToList}
        onSelect={(di) => {
          setSelectedDI(di);
          setView("form");
        }}
      />
    );
  }

  if (view === "form" && selectedDI) {
    return <GRNForm di={selectedDI} onSaved={goToList} onCancel={goToList} />;
  }

  return <GRNList onAdd={() => setView("select-di")} />;
};

export default GoodsReceiptNote;