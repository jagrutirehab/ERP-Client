import React, { useState } from "react";
import BudgetList from "./BudgetList";
import BudgetForm from "./BudgetForm";
import { usePermissions } from "../../../../Components/Hooks/useRoles.js";
import Basic404 from "../../../AuthenticationInner/Errors/Basic404";
import "../../UnitOfMeasurement/uom.scss";

const BudgetManagement = () => {
  const token = JSON.parse(localStorage.getItem("micrologin"))?.token;
  const { hasPermission } = usePermissions(token);
  const canView = hasPermission("MASTERDATA", "BUDGET", "READ");

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
      <BudgetForm editingItem={editingItem} onSaved={goToList} onCancel={goToList} />
    );
  }

  return (
    <div className="uom-page">
      <div className="uom-list-header">
        <div>
          <h4>Budget Management</h4>
          <p>Track and manage department budgets</p>
        </div>
      </div>

      <BudgetList
        onAdd={() => {
          setEditingItem(null);
          setView("form");
        }}
        onEdit={(item) => {
          setEditingItem(item);
          setView("form");
        }}
      />
    </div>
  );
};

export default BudgetManagement;