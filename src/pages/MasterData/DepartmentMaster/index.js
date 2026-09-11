import React, { useState } from "react";
import DepartmentList from "./DepartmentList";
import DepartmentForm from "./DepartmentForm";
import SubDepartmentList from "./SubDepartmentList";
import SubDepartmentForm from "./SubDepartmentForm";
import { usePermissions } from "../../../Components/Hooks/useRoles.js";
import Basic404 from "../../AuthenticationInner/Errors/Basic404";
import "../UnitOfMeasurement/uom.scss";

const TABS = [
  { key: "departments", label: "Departments" },
  { key: "subdepartments", label: "Sub-Departments" },
];

const DepartmentMaster = () => {
  const token = JSON.parse(localStorage.getItem("micrologin"))?.token;
  const { hasPermission } = usePermissions(token);
  const canView = hasPermission("MASTERDATA", "DEPARTMENT", "READ");

  const [activeTab, setActiveTab] = useState("departments");
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
    if (activeTab === "departments") {
      return <DepartmentForm editingItem={editingItem} onSaved={goToList} onCancel={goToList} />;
    }
    return <SubDepartmentForm editingItem={editingItem} onSaved={goToList} onCancel={goToList} />;
  }

  return (
    <div className="uom-page">
      <div className="uom-list-header">
        <div>
          <h4>Department Management</h4>
          <p>Manage departments and sub-departments across the organization</p>
        </div>
      </div>

      <div className="im-pill-tabs mb-3" style={{ display: "inline-flex" }}>
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            className={activeTab === t.key ? "active" : ""}
            onClick={() => setActiveTab(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {activeTab === "departments" && (
        <DepartmentList
          onAdd={() => {
            setEditingItem(null);
            setView("form");
          }}
          onEdit={(item) => {
            setEditingItem(item);
            setView("form");
          }}
        />
      )}
      {activeTab === "subdepartments" && (
        <SubDepartmentList
          onAdd={() => {
            setEditingItem(null);
            setView("form");
          }}
          onEdit={(item) => {
            setEditingItem(item);
            setView("form");
          }}
        />
      )}
    </div>
  );
};

export default DepartmentMaster;