import React, { useState } from "react";
import VendorInvoiceList from "./VendorInvoiceList";
import GRNSelector from "./GRNSelector";
import VendorInvoiceForm from "./VendorInvoiceForm";
import { usePermissions } from "../../../../Components/Hooks/useRoles.js";
import Basic404 from "../../../AuthenticationInner/Errors/Basic404";
import "../../UnitOfMeasurement/uom.scss";

const VendorInvoice = () => {
  const token = JSON.parse(localStorage.getItem("micrologin"))?.token;
  const { hasPermission } = usePermissions(token);
  const canView = hasPermission("MASTERDATA", "VENDOR_INVOICE", "READ");

  const [view, setView] = useState("list");
  const [selectedGRN, setSelectedGRN] = useState(null);

  if (!canView) {
    return <Basic404 />;
  }

  const goToList = () => {
    setView("list");
    setSelectedGRN(null);
  };

  if (view === "select-grn") {
    return (
      <GRNSelector
        onBack={goToList}
        onSelect={(grn) => {
          setSelectedGRN(grn);
          setView("form");
        }}
      />
    );
  }

  if (view === "form" && selectedGRN) {
    return <VendorInvoiceForm grn={selectedGRN} onSaved={goToList} onCancel={goToList} />;
  }

  return <VendorInvoiceList onAdd={() => setView("select-grn")} />;
};

export default VendorInvoice;