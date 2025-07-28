import React from "react";
import Breadcrumb from "../../../Components/Common/BreadCrumb";
import { CardBody } from "reactstrap";
import { AddRoleCard, RoleCard } from "../../Patient/Views/Components/Roles/RolesCard";

const RolesManagement = () => {
  return (
    <>
      <div className="container-fluid d-flex flex-column h-100 px-3">
        <div className="mt-4 mx-4">
          <Breadcrumb title="Roles Management" pageTitle="Roles Management" />
        </div>

        <CardBody className="p-3 bg-white">
            <h1>Roles Management</h1>
            <div className="p-4">
            {/* <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10">
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
            </div> */}
        </div>
        </CardBody>
      </div>
    </>
  );
};

export default RolesManagement;
