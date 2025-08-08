import { useEffect, useState } from "react";
import Breadcrumb from "../../../Components/Common/BreadCrumb";
import { CardBody, Button } from "reactstrap";
import { AddRoleCard, RoleCard } from "../../../Components/Roles/RolesCard";
import defaultimage from "../../../assets/profile-image.png";
import {
  addRole,
  editRole,
  getAllRoles,
  deleteRole,
} from "../../../helpers/backend_helper";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import AddEditRoleModal from "../../../Components/Roles/AddEditModal";
import DeleteConfirmationModal from "../../../Components/Roles/DeleteConfirmationModal";

const RolesManagement = () => {
  const token = useSelector((state) => state.User.microLogin.token);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);
  const [roleToDelete, setRoleToDelete] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 10;

  const fetchRoles = async (page = 1) => {
     if(!token) return;
    try {
      setLoading(true);
      const response = await getAllRoles({ page, limit, token });
      setRoles(response?.data?.data || []);
      setTotalPages(response?.data?.totalPages || 1);
      setCurrentPage(response?.data?.currentPage || page);
    } catch (error) {
      toast.error("Failed to fetch roles.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles(currentPage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, currentPage]);

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
      toast.error(
        selectedRole ? "Failed to update role." : "Failed to create role."
      );
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
      toast.error("Failed to delete role.");
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

  return (
    <div className="container-fluid d-flex flex-column h-100 px-3">
      <div className="mt-4 mx-4">
        <Breadcrumb title="Roles Management" pageTitle="Roles Management" />
      </div>

      <CardBody className="p-3 bg-white">
        <h1>Roles Management</h1>
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
                {roles.map((role) => (
                  <RoleCard
                    key={role.id || role._id}
                    totalUsers={role.userCount}
                    avatars={[defaultimage]}
                    roleName={role.name}
                    onEdit={() => handleEditClick(role)}
                    onDelete={() => handleDeleteClick(role)}
                  />
                ))}
                <AddRoleCard onAdd={handleAddClick} />
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
