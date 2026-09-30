import { CardBody, Spinner } from "reactstrap";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { submitMedicineRequisition } from "../../../../../store/features/medicine/medicineSlice";
import { useAuthError } from "../../../../../Components/Hooks/useAuthError";
import MedicineRequisitionForm from "../Form";
import { useMediaQuery } from "../../../../../Components/Hooks/useMediaQuery";
import { usePermissions } from "../../../../../Components/Hooks/useRoles";

const MedicineRequisitionAddRequest = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const handleAuthError = useAuthError();
  const isMobile = useMediaQuery("(max-width: 1000px)");
  const { loading } = useSelector((state) => state.Medicine);

  const microUser = localStorage.getItem("micrologin");
  const token = microUser ? JSON.parse(microUser).token : null;
  const { hasPermission, loading: permissionLoader } = usePermissions(token);

  const hasWritePermission = hasPermission("PHARMACY", "REQUISITION_MEDICINE_REQUISITION", "WRITE");

  const handleSubmit = async (payload) => {
    try {
      const result = await dispatch(submitMedicineRequisition(payload)).unwrap();
      if (result) {
        navigate("/pharmacy/requisition/medicine-requisition");
      }
    } catch (error) {
      if (!handleAuthError(error)) {
        toast.error(error?.message || "Failed to submit requisition");
      }
    }
  };

  if (permissionLoader || loading) {
    return (
      <CardBody
        className="p-3 bg-white d-flex justify-content-center align-items-center"
        style={isMobile ? { width: "100%", minHeight: "60vh" } : { width: "78%", minHeight: "60vh" }}
      >
        <Spinner color="primary" />
      </CardBody>
    );
  }

  if (!hasWritePermission) navigate("/unauthorized");

  return (
    <CardBody
      className="p-3 bg-white"
      style={isMobile ? { width: "100%" } : { width: "78%" }}
    >
      <MedicineRequisitionForm
        initialData={null}
        onSubmit={handleSubmit}
        loading={loading}
        isEdit={false}
      />
    </CardBody>
  );
};

export default MedicineRequisitionAddRequest;
