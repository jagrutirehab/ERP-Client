import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { CardBody } from "reactstrap";
import { useMediaQuery } from "../../../Components/Hooks/useMediaQuery";
import { getSopRuleById } from "../../../helpers/backend_helper";
import { useManageRules } from "../components/manageRules/useManageRules";
import ManageRulesHeader from "../components/manageRules/ManageRulesHeader";
import ManageRulesFilters from "../components/manageRules/ManageRulesFilters";
import RulesList from "../components/manageRules/RulesList";
import RulePreviewOffcanvas from "../components/manageRules/RulePreviewOffcanvas";
import DeleteRuleModal from "../components/manageRules/DeleteRuleModal";
import { usePermissions } from "../../../Components/Hooks/useRoles";
import { useEffect } from "react";

const ManageRules = () => {
  const isMobile = useMediaQuery("(max-width: 1000px)");
  const navigate = useNavigate();
  const rulesState = useManageRules();

  const microUser = localStorage.getItem("micrologin");
  const token = microUser ? JSON.parse(microUser).token : null;

  const { loading: permissionLoader, hasPermission } = usePermissions(token);

  const hasReadPermission = hasPermission("SOPCONFIGS", "MANAGE", "READ");
  const hasWritePermission = hasPermission("SOPCONFIGS", "MANAGE", "WRITE");
  const hasDeletePermission = hasPermission("SOPCONFIGS", "MANAGE", "DELETE");

  useEffect(() => {
    if (permissionLoader) return;
    if (!hasReadPermission) {
      navigate("/unauthorized");
      return;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasReadPermission, permissionLoader]);

  // Preview offcanvas — fetches full detail (with populated specific users)
  // when opened, falls back to the row-level rule data while loading.
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewRule, setPreviewRule] = useState(null);
  const [previewLoading, setPreviewLoading] = useState(false);

  const openPreview = async (rule) => {
    setPreviewRule(rule);
    setPreviewOpen(true);
    setPreviewLoading(true);
    try {
      const res = await getSopRuleById(rule._id);
      setPreviewRule(res?.data || rule);
    } catch {
      // keep the row-level rule as fallback
    } finally {
      setPreviewLoading(false);
    }
  };

  const closePreview = () => {
    setPreviewOpen(false);
    setPreviewRule(null);
  };

  // Delete modal target
  const [deleteTarget, setDeleteTarget] = useState(null);
  const openDelete = (rule) => setDeleteTarget(rule);
  const closeDelete = () => setDeleteTarget(null);

  const handleEdit = (rule) => {
    closePreview();
    navigate(`/sop-configs/save/${rule._id}`);
  };

  const handleConfirmDelete = async (rule) => {
    const ok = await rulesState.handleDelete(rule);
    if (ok) {
      closeDelete();
      if (previewRule?._id === rule._id) closePreview();
    }
    return ok;
  };

  const noFiltersApplied =
    rulesState.search === "" &&
    rulesState.severityFilter.length === 0 &&
    rulesState.activeFilter === "all";

  return (
    <CardBody
      className="p-3 bg-white"
      style={isMobile ? { width: "100%" } : { width: "78%" }}
    >
      <ManageRulesHeader
        hasWritePermission={hasWritePermission}
        counts={rulesState.counts}
        loading={rulesState.loading}
        onNew={() => navigate("/sop-configs/save")}
        onRefresh={rulesState.load}
      />

      <ManageRulesFilters
        counts={rulesState.counts}
        search={rulesState.search}
        onSearchChange={rulesState.setSearch}
        activeFilter={rulesState.activeFilter}
        onActiveFilterChange={rulesState.setActiveFilter}
        severityFilter={rulesState.severityFilter}
        onToggleSeverity={rulesState.toggleSeverity}
        onClearSeverity={rulesState.clearSeverityFilter}
      />

      <RulesList
        hasWritePermission={hasWritePermission}
        hasDeletePermission={hasDeletePermission}
        filtered={rulesState.filtered}
        filteredCount={rulesState.filtered.length}
        loading={rulesState.loading}
        emptyStateShowCreate={noFiltersApplied}
        onCreate={() => navigate("/sop-configs/save")}
        onPreview={openPreview}
        onToggleActive={rulesState.handleToggleActive}
        onEdit={handleEdit}
        onDelete={openDelete}
      />

      <RulePreviewOffcanvas
        isOpen={previewOpen}
        onClose={closePreview}
        rule={previewRule}
        loading={previewLoading}
        onEdit={handleEdit}
        onDelete={openDelete}
      />

      <DeleteRuleModal
        target={deleteTarget}
        onCancel={closeDelete}
        onConfirm={handleConfirmDelete}
      />
    </CardBody>
  );
};

export default ManageRules;
