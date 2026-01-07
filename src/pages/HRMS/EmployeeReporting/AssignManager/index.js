import { useNavigate } from 'react-router-dom';
import { useMediaQuery } from '../../../../Components/Hooks/useMediaQuery';
import { usePermissions } from '../../../../Components/Hooks/useRoles';
import { CardBody, Spinner } from 'reactstrap';
import EmployeeReportingForm from '../../components/forms/EmployeeReportingForm';

const AssignManager = () => {
  const navigate = useNavigate();
  const isMobile = useMediaQuery("(max-width: 1000px)");
  const microUser = localStorage.getItem("micrologin");
  const token = microUser ? JSON.parse(microUser).token : null;

  const { hasPermission, loading } = usePermissions(token);
  const hasUserPermission = hasPermission("HRMS", "ASSIGN_MANAGER", "READ");

  const hasCreatePermission = hasPermission("HRMS", "ASSIGN_MANAGER", "WRITE") || hasPermission("HR", "HIRING_ADD_REQUEST", "DELETE");


  if (!loading && !hasUserPermission) {
    navigate("/unauthorized");
  }

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: "100vh" }}>
        <Spinner color="primary" />
      </div>
    )
  }
  return (
    <CardBody className="bg-white" style={isMobile ? {
      width: "100%",
      paddingLeft: "1rem",
      paddingRight: "1rem",
      paddingBottom: "1rem"
    } : { width: "78%" }}>
      <div className="px-3 pt-3">
        <h5 className="mb-1">Assign Manager</h5>
        <small className="text-muted">
          Set the reporting manager and working shift for the employee.
        </small>
      </div>
      <hr className="mb-2 border-secondary" />
      <div>
        <div className="d-flex justify-content-center">
          <div
            style={{
              width: "100%",
              maxWidth: "700px",
              border: "1px solid #e5e7eb",
              borderRadius: "8px",
              padding: "1.5rem",
              backgroundColor: "#fff",
              boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
            }}
          >
            <EmployeeReportingForm
              view="PAGE"
              hasCreatePermission={hasCreatePermission}
            />
          </div>
        </div>
      </div>
    </CardBody >
  )
}

export default AssignManager;
