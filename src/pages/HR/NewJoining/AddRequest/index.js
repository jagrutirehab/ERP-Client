import { CardBody, Spinner } from "reactstrap";
import { usePermissions } from "../../../../Components/Hooks/useRoles";
import { useNavigate } from "react-router-dom";
import { useMediaQuery } from "../../../../Components/Hooks/useMediaQuery";
import EmployeeForm from "../../components/forms/EmployeeForm";

const AddNewJoiningRequest = () => {
    const navigate = useNavigate();
    const isMobile = useMediaQuery("(max-width: 1000px)");
    const microUser = localStorage.getItem("micrologin");
    const token = microUser ? JSON.parse(microUser).token : null;

    const { hasPermission, loading } = usePermissions(token);
    const hasUserPermission = hasPermission("HR", "NEW_JOINING_ADD_REQUEST", "READ");
    const hasCreatePermission = hasPermission("HR", "NEW_JOINING_ADD_REQUEST", "WRITE") || hasPermission("HR", "NEW_JOINING_ADD_REQUEST", "DELETE");

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
        <CardBody className="bg-white" style={isMobile ? { width: "100%" } : { width: "78%" }}>
            <div className="px-3 pt-3">
                <h5 className="mb-1">Add Employee New Joining Request</h5>
                <small className="text-muted">
                    Please fill the form & submit the request for approval
                </small>
            </div>
            <hr className="mb-2 border-secondary" />
            <div className="d-flex justify-content-center">
                <div className="w-100" style={{ maxWidth: "1000px" }}>
                    <EmployeeForm
                        view="PAGE"
                        mode="NEW_JOINING"
                        hasCreatePermission={hasCreatePermission}
                    />
                </div>
            </div>
        </CardBody >
    );
};

export default AddNewJoiningRequest;
