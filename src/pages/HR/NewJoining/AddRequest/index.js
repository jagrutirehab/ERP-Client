import { Card, CardBody, CardHeader, Spinner } from "reactstrap";
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
        <Card className="bg-white" style={isMobile ? { width: "100%" } : { width: "78%" }}>
            <CardHeader className="bg-white">
                <div>
                    <h5 className="mb-1">Add Employee New Joining Request</h5>
                    <small className="text-muted">
                        Please fill the form & submit the request for approval
                    </small>
                </div>
            </CardHeader>
            <CardBody>
                <div className="d-flex justify-content-center">
                    <div style={{ width: "100%", maxWidth: "900px" }}>
                        <EmployeeForm view="PAGE" mode="NEW_JOINING" />
                    </div>
                </div>
            </CardBody>
        </Card>
    );
};

export default AddNewJoiningRequest;
