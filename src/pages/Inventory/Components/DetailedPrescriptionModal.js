import { useEffect, useState } from 'react'
import { Button, Modal, ModalBody, ModalFooter, ModalHeader, Spinner } from "reactstrap";
import PrescriptionForm from "../MedicineApproval/components/PrescriptionForm";
import { CheckCheck, X } from "lucide-react";
import { getDetailedPrescriptionById, updateApprovalStatus } from '../../../store/features/pharmacy/pharmacySlice';
import { useAuthError } from '../../../Components/Hooks/useAuthError';
import { toast } from 'react-toastify';
import { useDispatch, useSelector } from 'react-redux';
import { usePermissions } from '../../../Components/Hooks/useRoles';
import CheckPermission from '../../../Components/HOC/CheckPermission';

const DetailedPrescriptionModal = ({ patient, setModal, modal }) => {
    const dispatch = useDispatch();
    const handleAuthError = useAuthError();
    const { detailedPrescription } = useSelector((state) => state.Pharmacy);
    const [loading, setLoading] = useState(false);
    const [updatedDispenseData, setUpdatedDispenseData] = useState([]);
    const [remarks, setRemarks] = useState("");

    const microUser = localStorage.getItem("micrologin");
    const token = microUser ? JSON.parse(microUser).token : null;

    const { roles } = usePermissions(token);


    useEffect(() => {
        if (!modal) return;

        const fetchPrescription = async () => {
            setLoading(true);
            try {
                await dispatch(getDetailedPrescriptionById(
                    patient?.prescriptionChart?.[0]?.prescription
                )).unwrap();
            } catch (error) {
                console.error(error)
                if (!handleAuthError(error)) {
                    toast.error(error.message || "Failed to fetch prescription.");
                }
            } finally {
                setLoading(false);
            }
        };

        fetchPrescription();
    }, [modal]);


    const handleApprove = async () => {
        try {
            setLoading(true);

            await dispatch(updateApprovalStatus({
                id: patient._id,
                medicines: updatedDispenseData,
                remarks: remarks,
                status: "APPROVED",
                update: "pendingPatients"
            })).unwrap();

            toast.success("Medicines approved successfully");
            setModal(false);
        } catch (err) {
            toast.error(err?.message || "Failed to approve");
        } finally {
            setLoading(false);
        }
    };

    const handleReject = async () => {
        try {
            setLoading(true);

            await dispatch(updateApprovalStatus({
                id: patient._id,
                medicines: updatedDispenseData,
                remarks: remarks,
                status: "REJECTED"
            })).unwrap();

            toast.error("Medicines rejected successfully");
            setModal(false);
        } catch (err) {
            toast.error(err?.message || "Failed to reject");
        } finally {
            setLoading(false);
        }
    };


    return (
        <Modal
            isOpen={modal}
            toggle={() => setModal(!modal)}
            size="xl"
            centered
        >
            {loading && <Spinner className="text-primary" />}
            {!loading && (
                <>
                    <ModalHeader toggle={() => setModal(!modal)} className="border-bottom-2">
                        <div>
                            <div className="fw-bold text-dark fs-5">
                                {patient?.patient?.name}
                            </div>
                        </div>
                    </ModalHeader>
                    <ModalBody className="bg-light">
                        <PrescriptionForm
                            data={detailedPrescription}
                            onDispenseChanges={setUpdatedDispenseData}
                            onRemarks={setRemarks}
                            roles={roles}
                        />
                    </ModalBody>
                    <CheckPermission accessRolePermission={roles?.permissions} permission={"create"} subAccess={"MEDICINEAPPROVAL"}>
                        <ModalFooter className="border-top-2">
                            <Button
                                color="danger"
                                onClick={handleReject}
                                className="d-flex align-items-center justify-content-center text-white"
                            >
                                <X size={14} className="me-1" />
                                Reject
                            </Button>
                            <Button
                                color="success"
                                onClick={handleApprove}
                                className="d-flex align-items-center justify-content-center text-white"
                            >
                                <CheckCheck size={14} className="me-1" />
                                Approve
                            </Button>
                        </ModalFooter>
                    </CheckPermission>
                </>
            )}
        </Modal>
    )
}

export default DetailedPrescriptionModal;