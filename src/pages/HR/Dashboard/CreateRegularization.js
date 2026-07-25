import React from "react";
import { CardBody } from "reactstrap";
import { useMediaQuery } from "../../../Components/Hooks/useMediaQuery";
import { usePermissions } from "../../../Components/Hooks/useRoles";
import RegularizationOnBehalfForm from "../components/forms/RegularizationOnBehalfForm";

const CreateRegularization = () => {
  const isMobile = useMediaQuery("(max-width: 1000px)");

  const microUser = localStorage.getItem("micrologin");
  const token = microUser ? JSON.parse(microUser).token : null;
  const { hasPermission } = usePermissions(token);
  const hasWrite = hasPermission("HR", "CREATE_REGULARIZATION", "WRITE");
  const hasDelete = hasPermission("HR", "CREATE_REGULARIZATION", "DELETE");
  const canCreate = hasWrite || hasDelete;

  return (
    <CardBody
      className="bg-white"
      style={
        isMobile
          ? {
              width: "100%",
              paddingLeft: "1rem",
              paddingRight: "1rem",
              paddingBottom: "1rem",
            }
          : { width: "78%" }
      }
    >
      <div className="px-3 pt-3">
        <h5 className="mb-1">Create Regularization</h5>
        <small className="text-muted">
          Search an employee and file a regularization on their behalf
        </small>
      </div>
      <hr className="mb-2 border-secondary" />
      <div>
        <div className="d-flex justify-content-center mb-5">
          <div style={{ width: "100%", maxWidth: "700px" }}>
            <RegularizationOnBehalfForm canCreate={canCreate} />
          </div>
        </div>
      </div>
    </CardBody>
  );
};

export default CreateRegularization;
