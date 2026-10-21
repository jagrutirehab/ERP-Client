import React, { useEffect, useRef, useState } from "react";
import { Card, CardBody, Row, Col, Button, Input } from "reactstrap";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { Plus } from "lucide-react";
import DataTableComponent from "../../../Components/Common/DataTable";
import RefreshButton from "../../../Components/Common/RefreshButton";
import CategoryFormModal from "../components/CategoryFormModal";
import ConfirmationModal from "../../../Components/Common/ConfirmationModal";
import CheckPermission from "../../../Components/HOC/CheckPermission";
import { getCategoryColumns } from "../Columns/CategoryColumns";
import { usePermissions } from "../../../Components/Hooks/useRoles";
import { capitalizeWords } from "../../../utils/toCapitalize";
import {
  fetchComplianceCategories,
  addComplianceCategory,
  updateComplianceCategory,
  setComplianceCategoryStatus,
  removeComplianceCategory,
} from "../../../store/features/compliance/complianceSlice";

const Categories = () => {
  const dispatch = useDispatch();
  const microUser = localStorage.getItem("micrologin");
  const token = microUser ? JSON.parse(microUser).token : null;
  const { roles } = usePermissions(token);

  const { categories, categoriesLoading, saving } = useSelector((state) => state.Compliance);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [deactivating, setDeactivating] = useState(null);
  const [statusUpdating, setStatusUpdating] = useState(false);
  const [deletingCategory, setDeletingCategory] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const searchPromiseRef = useRef(null);

  const loadCategories = (search = searchQuery) => {
    searchPromiseRef.current?.abort();
    const trimmed = search.trim();
    const promise = dispatch(fetchComplianceCategories({ search: trimmed || undefined }));
    searchPromiseRef.current = promise;
    promise
      .unwrap()
      .catch((error) => {
        if (error?.aborted) return;
        toast.error(error?.message || "Failed to load categories");
      });
  };

  useEffect(() => {
    loadCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isFirstSearchRun = useRef(true);
  useEffect(() => {
    if (isFirstSearchRun.current) {
      isFirstSearchRun.current = false;
      return;
    }
    const handler = setTimeout(() => {
      loadCategories(searchQuery);
    }, 500);
    return () => clearTimeout(handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery]);

  const openAdd = () => {
    setEditingCategory(null);
    setModalOpen(true);
  };

  const openEdit = (category) => {
    setEditingCategory(category);
    setModalOpen(true);
  };

  const handleSubmit = async (values) => {
    try {
      if (editingCategory) {
        await dispatch(updateComplianceCategory({ id: editingCategory._id, data: values })).unwrap();
        toast.success("Category updated.");
      } else {
        await dispatch(addComplianceCategory(values)).unwrap();
        toast.success("Category created.");
        loadCategories();
      }
      setModalOpen(false);
    } catch (error) {
      toast.error(error?.message || "Failed to save category");
    }
  };

  const handleToggleActive = (category) => {
    setDeactivating(category);
  };

  const confirmDeactivate = async () => {
    if (!deactivating) return;
    try {
      setStatusUpdating(true);
      await dispatch(
        setComplianceCategoryStatus({ id: deactivating._id, active: !deactivating.active }),
      ).unwrap();
      setDeactivating(null);
    } catch (error) {
      toast.error(error?.message || "Failed to update status");
    } finally {
      setStatusUpdating(false);
    }
  };

  const confirmDelete = async () => {
    if (!deletingCategory) return;
    try {
      setDeleting(true);
      await dispatch(removeComplianceCategory(deletingCategory._id)).unwrap();
      toast.success("Category deleted.");
      setDeletingCategory(null);
    } catch (error) {
      toast.error(error?.message || "Failed to delete category");
    } finally {
      setDeleting(false);
    }
  };

  const columns = getCategoryColumns({
    roles,
    openEdit,
    handleToggleActive,
    handleDeleteRequest: setDeletingCategory,
  });

  return (
    <React.Fragment>
      <CardBody className="p-3 bg-white">
        <div className="d-flex flex-column h-100">
          <div className="d-flex flex-column flex-sm-row align-items-start align-items-sm-center justify-content-between gap-3 mb-3">
            <div>
              <h5 className="mb-1 fw-semibold">Categories</h5>
              <p className="text-muted mb-0 fs-13">
                Groups compliance types belong to (e.g. Statutory registration, Safety &amp; environment).
                Used when creating or editing a compliance type.
              </p>
            </div>
            <CheckPermission accessRolePermission={roles?.permissions} subAccess="CATEGORIES" permission="create">
              <Button color="success" size="sm" className="text-white text-nowrap" onClick={openAdd}>
                <Plus size={14} className="me-1" /> Add category
              </Button>
            </CheckPermission>
          </div>

          <Card className="mb-3 shadow-sm border-0" style={{ borderRadius: "0 0 8px 8px" }}>
            <CardBody className="py-3">
              <Row className="g-2 align-items-center">
                <Col md={6} lg={5}>
                  <div className="position-relative">
                    <i
                      className="bx bx-search position-absolute text-muted"
                      style={{ top: "50%", left: 10, transform: "translateY(-50%)" }}
                    />
                    <Input
                      type="text"
                      placeholder="Search category..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      style={{ paddingLeft: 32 }}
                    />
                  </div>
                </Col>
                <Col md={6} lg={7} className="d-flex justify-content-end">
                  <RefreshButton onRefresh={() => loadCategories()} loading={categoriesLoading} />
                </Col>
              </Row>
            </CardBody>
          </Card>

          <Card className="flex-grow-1 shadow-sm border-0 mb-0">
            <CardBody className="p-0 d-flex flex-column h-100">
              <div className="flex-grow-1 position-relative" style={{ minHeight: "500px" }}>
                <DataTableComponent
                  columns={columns}
                  data={categories}
                  loading={categoriesLoading}
                  noDataComponent="No categories match your search."
                />
              </div>
            </CardBody>
          </Card>
        </div>
      </CardBody>

      <CategoryFormModal
        isOpen={modalOpen}
        toggle={() => setModalOpen(false)}
        category={editingCategory}
        saving={saving}
        onSubmit={handleSubmit}
      />

      <ConfirmationModal
        isOpen={!!deactivating}
        toggle={() => setDeactivating(null)}
        title={deactivating?.active ? "Deactivate category" : "Activate category"}
        message={
          deactivating?.active
            ? `Are you sure you want to deactivate "${capitalizeWords(deactivating?.name || "")}"? It will no longer be selectable when creating or editing a compliance type.`
            : `Are you sure you want to activate "${capitalizeWords(deactivating?.name || "")}"? It will become selectable again when creating or editing a compliance type.`
        }
        confirmText={deactivating?.active ? "Deactivate" : "Activate"}
        confirmColor={deactivating?.active ? "danger" : "success"}
        confirmDisabled={statusUpdating}
        onConfirm={confirmDeactivate}
      />

      <ConfirmationModal
        isOpen={!!deletingCategory}
        toggle={() => setDeletingCategory(null)}
        title="Delete category"
        message={`Are you sure you want to delete "${capitalizeWords(deletingCategory?.name || "")}"? This cannot be undone.`}
        confirmText="Delete"
        confirmColor="danger"
        confirmDisabled={deleting}
        onConfirm={confirmDelete}
      />
    </React.Fragment>
  );
};

export default Categories;
