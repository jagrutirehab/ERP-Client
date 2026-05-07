import { useEffect, useState } from "react";
import { CardBody, Spinner } from "reactstrap";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import {
  fetchMedicineRequisitionById,
  editMedicineRequisition,
} from "../../../../../store/features/medicine/medicineSlice";
import { useAuthError } from "../../../../../Components/Hooks/useAuthError";
import MedicineRequisitionForm from "../Form";
import { useMediaQuery } from "../../../../../Components/Hooks/useMediaQuery";
import { usePermissions } from "../../../../../Components/Hooks/useRoles";

const MedicineRequisitionEditRequest = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const handleAuthError = useAuthError();
  const isMobile = useMediaQuery("(max-width: 1000px)");

  const { id } = useParams();

  const [fetching, setFetching] = useState(true);
  const [initialData, setInitialData] = useState(null);
  const { loading } = useSelector((state) => state.Medicine);

  const microUser = localStorage.getItem("micrologin");
  const token = microUser ? JSON.parse(microUser).token : null;
  const { hasPermission, loading: permissionLoader } = usePermissions(token);

  const hasWritePermission = hasPermission("PHARMACY", "REQUISITION_MEDICINE_REQUISITION", "WRITE");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await dispatch(fetchMedicineRequisitionById(id)).unwrap();
        const data = response?.data || response;
        if (data.status !== "PENDING") {
          navigate("/pharmacy/requisition/medicine-requisition", { replace: true });
          return;
        }
        setInitialData(data);
      } catch (error) {
        if (!handleAuthError(error)) {
          toast.error(error?.message || "Failed to fetch requisition details");
        }
        navigate("/pharmacy/requisition/medicine-requisition", { replace: true });
      } finally {
        setFetching(false);
      }
    };
    if (id) fetchData();
  }, [id, dispatch, navigate, handleAuthError]);

  const handleSubmit = async (payload) => {
    try {
      const result = await dispatch(editMedicineRequisition({ id, ...payload })).unwrap();
      if (result) {
        navigate("/pharmacy/requisition/medicine-requisition");
      }
    } catch (error) {
      if (!handleAuthError(error)) {
        toast.error(error?.message || "Failed to update requisition");
      }
    }
  };

  if (fetching || permissionLoader) {
    return (
      <CardBody
        className="p-3 bg-white d-flex justify-content-center align-items-center"
        style={isMobile ? { width: "100%", minHeight: "60vh" } : { width: "78%", minHeight: "60vh" }}
      >
        <Spinner color="primary" />
      </CardBody>
    );
  }

  if (!hasWritePermission) navigate("/unauthorized")

  return (
    <CardBody
      className="p-3 bg-white"
      style={isMobile ? { width: "100%" } : { width: "78%" }}
    >
      <MedicineRequisitionForm
        initialData={initialData}
        onSubmit={handleSubmit}
        loading={loading}
        isEdit={true}
      />
    </CardBody>
  );
};

export default MedicineRequisitionEditRequest;
