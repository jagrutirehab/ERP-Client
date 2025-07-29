import React, { useEffect, useState } from "react";
import Breadcrumb from "../../../Components/Common/BreadCrumb";
import { CardBody } from "reactstrap";
import { AddRoleCard, RoleCard } from "../../../Components/Roles/RolesCard";
import defaultimage from "../../../assets/profile-image.png";
import { getAllRoles } from "../../../helpers/backend_helper";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import AddEditRoleModal from "../../../Components/Roles/AddEditModal";

const RolesManagement = () => {
  const token = useSelector((state) => state.User.microLogin.token);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);

  const fetchRoles = async () => {
    try {
      setLoading(true);
      const response = await getAllRoles({ page: 1, limit: 10, token });
      setRoles(response.data.data || []);
    } catch (error) {
      toast.error("Failed to fetch roles:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const handleEditClick = (role) => {
    console.log("Edit role:", role);
    // Implement your logic
  };

  const handleDeleteClick = (role) => {
    console.log("Delete role:", role);
    // Implement your logic
  };

  const handleAddClick = () => {
    setSelectedRole(null);
    setIsModalOpen(true);
  };

  return (
    <div className="container-fluid d-flex flex-column h-100 px-3">
      <div className="mt-4 mx-4">
        <Breadcrumb title="Roles Management" pageTitle="Roles Management" />
      </div>

      <CardBody className="p-3 bg-white">
        <h1>Roles Management</h1>
        <div className="p-4">
          <div style={{ display: "flex", flexDirection: "row", gap: "15px" }}>
            {loading ? (
              <p>Loading roles...</p>
            ) : (
              <>
                {roles.map((role) => (
                  <RoleCard
                    key={role.id}
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
        </div>
      </CardBody>
      {isModalOpen && (
        <AddEditRoleModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          // onSubmit={handleSubmit}
          // initialData={selectedRole || undefined}
        />
      )}
    </div>
  );
};

export default RolesManagement;
