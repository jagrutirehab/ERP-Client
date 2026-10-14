import { CardBody, Spinner } from "reactstrap";
import { usePermissions } from "../../../../Components/Hooks/useRoles";
import { useNavigate } from "react-router-dom";
import { useMediaQuery } from "../../../../Components/Hooks/useMediaQuery";
import HiringForm from "../../components/forms/HiringForm";

const AddHiringRequest = () => {
  const navigate = useNavigate();
  const isMobile = useMediaQuery("(max-width: 1000px)");
  const microUser = localStorage.getItem("micrologin");
  const token = microUser ? JSON.parse(microUser).token : null;

  const { hasPermission, loading } = usePermissions(token);
  const hasUserPermission = hasPermission("HR", "HIRING_ADD_REQUEST", "READ");

  const hasCreatePermission =
    hasPermission("HR", "HIRING_ADD_REQUEST", "WRITE") ||
    hasPermission("HR", "HIRING_ADD_REQUEST", "DELETE");

  if (!loading && !hasUserPermission) {
    navigate("/unauthorized");
  }

  if (loading) {
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ height: "100vh" }}
      >
        <Spinner color="primary" />
      </div>
    );
  }

 

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
        <h5 className="mb-1">Add Hiring Request</h5>
        <small className="text-muted">
          Raise a hiring request for a selected center.
        </small>
      </div>
      <hr className="mb-2 border-secondary" />
      <div>
        <div className="d-flex justify-content-center">
          <div style={{ width: "100%", maxWidth: "700px" }}>
            <HiringForm view="PAGE" hasCreatePermission={hasCreatePermission} />
          </div>
        </div>
      </div>
    </CardBody>
  );
};

export default AddHiringRequest;
