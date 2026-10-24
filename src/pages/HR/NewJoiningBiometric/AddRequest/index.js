import { useEffect } from "react";
import { CardBody, Spinner } from "reactstrap";
import { useNavigate } from "react-router-dom";
import { usePermissions } from "../../../../Components/Hooks/useRoles";
import { useMediaQuery } from "../../../../Components/Hooks/useMediaQuery";
import NewJoiningBiometricForm from "../../components/forms/NewJoiningBiometricForm";

const AddNewJoiningBiometric = () => {
  const navigate = useNavigate();
  const isMobile = useMediaQuery("(max-width: 1000px)");
  const microUser = localStorage.getItem("micrologin");
  const token = microUser ? JSON.parse(microUser).token : null;

  const { hasPermission, loading } = usePermissions(token);
  const hasUserPermission = hasPermission(
    "HR",
    "NEW_JOINING_BIOMETRIC_MAPPING",
    "READ",
  );
  const hasCreatePermission = hasPermission(
    "HR",
    "NEW_JOINING_BIOMETRIC_MAPPING",
    "WRITE",
  );

  useEffect(() => {
    if (!loading && !hasUserPermission) {
      navigate("/unauthorized");
    }
  }, [loading, hasUserPermission, navigate]);

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
        <h5 className="mb-1">New Joining Biometric Creation</h5>
        <small className="text-muted">
          Create a biometric ID mapping for a new joining by entering their name and center.
        </small>
      </div>
      <hr className="mb-2 border-secondary" />
      <div className="d-flex justify-content-center">
        <div style={{ width: "100%", maxWidth: "700px" }} className="pt-3">
          <NewJoiningBiometricForm hasCreatePermission={hasCreatePermission} />
        </div>
      </div>
    </CardBody>
  );
};

export default AddNewJoiningBiometric;
