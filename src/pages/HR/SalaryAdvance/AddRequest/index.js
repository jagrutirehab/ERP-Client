import { Card, CardBody, CardHeader, Spinner } from "reactstrap";
import SalaryAdvanceForm from "../../components/forms/SalaryAdvanceForm";
import { usePermissions } from "../../../../Components/Hooks/useRoles";
import { useNavigate } from "react-router-dom";
import { useMediaQuery } from "../../../../Components/Hooks/useMediaQuery";

const AddSalaryAdvanceRequest = () => {
    const navigate = useNavigate();
    const isMobile = useMediaQuery("(max-width: 1000px)");
    const microUser = localStorage.getItem("micrologin");
    const token = microUser ? JSON.parse(microUser).token : null;

    const { hasPermission, loading } = usePermissions(token);
    const hasUserPermission = hasPermission("HR", "SALARY_ADVANCE_ADD_REQUEST", "READ");

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
                    <h5 className="mb-1">Add Salary Advance Request</h5>
                    <small className="text-muted">
                        Select an employee and enter the advance amount
                    </small>
                </div>
            </CardHeader>
            <CardBody>
                <div className="d-flex justify-content-center">
                    <div style={{ width: "100%", maxWidth: "700px" }}>
                        <SalaryAdvanceForm view="PAGE" />
                    </div>
                </div>
            </CardBody>
        </Card>
    );
};

export default AddSalaryAdvanceRequest;
