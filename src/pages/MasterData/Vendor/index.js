import React, { useState } from "react";
import VendorList from "./VendorList";
import VendorForm from "./VendorForm";

const Vendor = () => {
  const [view, setView] = useState("list");
  const [editingId, setEditingId] = useState(null);

  const goToList = () => {
    setView("list");
    setEditingId(null);
  };

  if (view === "form") {
    return <VendorForm vendorId={editingId} onSaved={goToList} onCancel={goToList} />;
  }

  return (
    <VendorList
      onAdd={() => {
        setEditingId(null);
        setView("form");
      }}
      onEdit={(id) => {
        setEditingId(id);
        setView("form");
      }}
    />
  );
};

export default Vendor;