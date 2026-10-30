import { useEffect, useState } from "react";
import Breadcrumb from "../../../Components/Common/BreadCrumb";
import {
  CardBody,
  Button,
  Spinner,
  Input,
  InputGroup,
  InputGroupText,
} from "reactstrap";
import { AddRoleCard, RoleCard } from "../../../Components/Roles/RolesCard";
import defaultimage from "../../../assets/profile-image.png";
import {
  addRole,
  editRole,
  getAllRoles,
  deleteRole,
} from "../../../helpers/backend_helper";
import { toast } from "react-toastify";
import AddEditRoleModal from "../../../Components/Roles/AddEditModal";
import DeleteConfirmationModal from "../../../Components/Roles/DeleteConfirmationModal";
import CheckPermission from "../../../Components/HOC/CheckPermission";
import { usePermissions } from "../../../Components/Hooks/useRoles";
import { useNavigate } from "react-router-dom";
import { useAuthError } from "../../../Components/Hooks/useAuthError";

const RolesManagement = () => {
  const navigate = useNavigate();
  const microUser = localStorage.getItem("micrologin");
  const token = microUser ? JSON.parse(microUser).token : null;

  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);
  const [roleToDelete, setRoleToDelete] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [totalRoles, setTotalRoles] = useState(0);

  const limit = 10;
  const {
    loading: permissionLoader,
    hasPermission,
    roles: userRoles,
  } = usePermissions(token);
  const hasUserPermission = hasPermission("SETTING", "ROLESSETTING", "READ");
  const handleAuthError = useAuthError();

  const fetchRoles = async (page = 1) => {
    if (!token) return;
    try {
      setLoading(true);
      const response = await getAllRoles({ page, limit, search, token });
      setRoles(response?.data?.data || []);
      setTotalPages(response?.data?.totalPages || 1);
      setTotalRoles(response?.data?.total || 0);
      setCurrentPage(response?.data?.currentPage || page);
    } catch (error) {
      if (!handleAuthError(error)) {
        toast.error("Failed to fetch roles.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!hasUserPermission) return;
    fetchRoles(currentPage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, currentPage, hasUserPermission, search]);

  useEffect(() => {
    const timer = setTimeout(() => {
      const value = searchInput.trim();
      if (value !== search) {
        setSearch(value);
        setCurrentPage(1);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [searchInput, search]);

  const handleSubmit = async (formData) => {
    try {
      setLoading(true);
      if (selectedRole) {
        const { name, permissions } = formData;
        await editRole({
          id: selectedRole.id || selectedRole._id,
          name,
          permissions,
          token,
        });
        toast.success("Role updated successfully!");
        setRoles((prev) =>
          prev.map((role) =>
            (role.id || role._id) === (selectedRole.id || selectedRole._id)
              ? { ...role, name, permissions }
              : role
          )
        );
      } else {
        const { name, permissions } = formData;
        await addRole({ name, permissions, token });
        toast.success("Role created successfully!");
        await fetchRoles(currentPage);
      }
      setIsModalOpen(false);
      setSelectedRole(null);
    } catch (error) {
      if (!handleAuthError(error)) {
        toast.error(
          selectedRole ? "Failed to update role." : "Failed to create role."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (role) => {
    setSelectedRole(role);
    setIsModalOpen(true);
  };

  const handleDeleteClick = (role) => {
    setRoleToDelete(role);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      setLoading(true);
      await deleteRole({
        id: roleToDelete.id || roleToDelete._id,
        token,
      });
      toast.success("Role deleted successfully!");
      await fetchRoles(currentPage);
      setIsDeleteModalOpen(false);
      setRoleToDelete(null);
    } catch (error) {
      if (!handleAuthError(error)) {
        toast.error("Failed to delete role.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAddClick = () => {
    setSelectedRole(null);
    setIsModalOpen(true);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage((prev) => prev - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage((prev) => prev + 1);
  };

  if (permissionLoader) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <Spinner
          color="primary"
          className="d-block"
          style={{ width: "3rem", height: "3rem" }}
        />
      </div>
    );
  }

  if (!hasUserPermission) {
    navigate("/unauthorized");
    return null;
  }

  return (
    <div className="container-fluid d-flex flex-column h-100 px-3">
      <div className="mt-4 mx-4">
        <Breadcrumb title="Roles Management" pageTitle="Roles Management" />
      </div>

      <CardBody className="p-3 bg-white">
        <h1>Roles Management</h1>
        <div className="px-4 pt-3">
          <InputGroup style={{ maxWidth: "400px" }}>
            <InputGroupText className="bg-white">
              <i className="bx bx-search" />
            </InputGroupText>
            <Input
              type="text"
              placeholder="Search by role name..."
              value={searchInput}
              autoComplete="off"
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  const value = searchInput.trim();
                  if (value !== search) {
                    setSearch(value);
                    setCurrentPage(1);
                  }
                }
                if (e.key === "Escape") setSearchInput("");
              }}
            />
            {searchInput && (
              <Button
                type="button"
                color="light"
                className="border"
                title="Clear search"
                onClick={() => setSearchInput("")}
              >
                <i className="bx bx-x" />
              </Button>
            )}
          </InputGroup>
          {search && !loading && (
            <small className="text-muted d-block mt-1">
              {totalRoles} role{totalRoles !== 1 ? "s" : ""} found for "{search}"
            </small>
          )}
        </div>
        <div className="p-4">
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              flexWrap: "wrap",
              gap: "15px",
            }}
          >
            {loading ? (
              <p>Loading roles...</p>
            ) : (
              <>
                {roles.length === 0 && search && (
                  <p className="text-muted">No roles found.</p>
                )}
                {roles.map((role) => (
                  <RoleCard
                    key={role.id || role._id}
                    totalUsers={role.userCount}
                    avatars={[defaultimage]}
                    roleName={role.name}
                    onEdit={() => handleEditClick(role)}
                    onDelete={() => handleDeleteClick(role)}
                    permissions={userRoles?.permissions}
                  />
                ))}
                <CheckPermission
                  accessRolePermission={userRoles?.permissions}
                  permission="create"
                >
                  <AddRoleCard onAdd={handleAddClick} />
                </CheckPermission>
              </>
            )}
          </div>
          {!loading && totalPages > 1 && (
            <div className="mt-4 d-flex justify-content-center align-items-center gap-2">
              <Button
                color="primary"
                disabled={currentPage === 1}
                onClick={handlePrevPage}
              >
                Prev
              </Button>
              <span className="mx-2">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                color="primary"
                disabled={currentPage === totalPages}
                onClick={handleNextPage}
              >
                Next
              </Button>
            </div>
          )}
        </div>
      </CardBody>

      {isModalOpen && (
        <AddEditRoleModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleSubmit}
          initialData={selectedRole || undefined}
        />
      )}

      {isDeleteModalOpen && (
        <DeleteConfirmationModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={handleDeleteConfirm}
          roleName={roleToDelete?.name}
        />
      )}
    </div>
  );
};

export default RolesManagement;
