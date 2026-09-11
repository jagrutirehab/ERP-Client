import React, { useState } from "react";
import { useParams } from "react-router-dom";
import AssetCategoryList from "./AssetCategoryList";
import AssetCategoryForm from "./AssetCategoryForm";
import { usePermissions } from "../../../Components/Hooks/useRoles.js";
import Basic404 from "../../AuthenticationInner/Errors/Basic404";
import "../shared/itemMasterForms.scss";

const AssetCategory = () => {
  const { level: levelParam } = useParams();
  const level = Number(levelParam) || 1;

  const token = JSON.parse(localStorage.getItem("micrologin"))?.token;
  const { hasPermission } = usePermissions(token);
  const canView = hasPermission("MASTERDATA", "ASSET_CATEGORY", "READ");

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
      <AssetCategoryForm
        editingItem={editingItem}
        level={level}
        onSaved={goToList}
        onCancel={goToList}
      />
    );
  }

    return (
    <div className="uom-page">
      <div className="uom-list-header">
        <div>
          <h4>Asset Category Level {level}</h4>
          <p>Configure level {level} asset categories used for capitalization and depreciation</p>
        </div>
      </div>

      

      <AssetCategoryList
        level={level}
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

export default AssetCategory;