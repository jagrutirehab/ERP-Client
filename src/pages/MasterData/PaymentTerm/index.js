import React, { useState } from "react";
import PaymentTermList from "./PaymentTermList";
import PaymentTermForm from "./PaymentTermForm";
import { usePermissions } from "../../../Components/Hooks/useRoles.js";
import Basic404 from "../../AuthenticationInner/Errors/Basic404";

const PaymentTerm = () => {
  const token = JSON.parse(localStorage.getItem("micrologin"))?.token;
  const { hasPermission } = usePermissions(token);
  const canView = hasPermission("MASTERDATA", "PAYMENT_TERM_VIEW", "READ");

  const [view, setView] = useState("list");
  const [editingItem, setEditingItem] = useState(null);

  if (!canView) {
    return <Basic404 />;
  }

  const goToList = () => {
    setView("list");
    setEditingItem(null);
  };

  if (view === "form") {
    return (
      <PaymentTermForm
        editingItem={editingItem}
        onSaved={goToList}
        onCancel={goToList}
      />
    );
  }

  return (
    <PaymentTermList
      onAdd={() => {
        setEditingItem(null);
        setView("form");
      }}
      onEdit={(item) => {
        setEditingItem(item);
        setView("form");
      }}
    />
  );
};

export default PaymentTerm;