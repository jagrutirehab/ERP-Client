import { Spinner } from "reactstrap";
import { usePermissions } from "../../Components/Hooks/useRoles";
import Views from "./Views";
import { useNavigate } from "react-router-dom";

const Main = () => {
  const navigate = useNavigate();
  const microUser = localStorage.getItem("micrologin");
  const token = microUser ? JSON.parse(microUser).token : null;
  const { loading: permissionLoader, hasPermission } = usePermissions(token);
  const hasUserPermission = hasPermission("CENTRALPAYMENT", null, "READ");
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
  return <Views />;
};

export default Main;
