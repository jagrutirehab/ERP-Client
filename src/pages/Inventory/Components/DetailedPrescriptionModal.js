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
import * as XLSX from "xlsx";

const DetailedPrescriptionModal = ({ patient, setModal, modal }) => {
    const dispatch = useDispatch();
    const handleAuthError = useAuthError();
    const { detailedPrescription } = useSelector((state) => state.Pharmacy);

    const [loading, setLoading] = useState(false);
    const [updatedDispenseData, setUpdatedDispenseData] = useState([]);
    const [remarks, setRemarks] = useState("");

    const [shortageMode, setShortageMode] = useState(false);
    const [bulkResult, setBulkResult] = useState(null);

    const { roles } = usePermissions(localStorage.getItem("micrologin") ? JSON.parse(localStorage.getItem("micrologin")).token : null);

    useEffect(() => {
        if (!modal) return;
        setShortageMode(false);

        const fetchPrescription = async () => {
            setLoading(true);
            try {
                await dispatch(getDetailedPrescriptionById(patient?.prescriptionId)).unwrap();
            } catch (error) {
                if (!handleAuthError(error)) {
                    toast.error(error.message || "Failed to fetch prescription.");
                }
            } finally {
                setLoading(false);
            }
        };

        fetchPrescription();
    }, [modal]);

    const downloadShortageXlsx = () => {
        if (!bulkResult) {
            return toast.error("No shortage data");
        }

        const rows = bulkResult.shortages.map(s => ({
            Center: s.centerName,
            Medicine: s.medicineName,
            Required: s.required,
            Available: s.available,
            Missing: s.required - s.available
        }));

        const ws = XLSX.utils.json_to_sheet(rows);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Shortages");
        XLSX.writeFile(wb, "shortages.xlsx");
    };

    const handleApprove = async () => {
        try {
            setLoading(true);

            const result = await dispatch(updateApprovalStatus({
                id: detailedPrescription.approvalId,
                medicines: updatedDispenseData,
                remarks,
                status: "APPROVED",
                update: "pendingPatients"
            })).unwrap();

            if (result?.shortages?.length > 0) {
                setBulkResult(result);
                setShortageMode(true);
                toast.error("Insufficient stock");
                setLoading(false);
                return;
            }

            toast.success("Medicines Approved successfully");
            setModal(false);

        } catch (err) {
            if (err?.shortages?.length > 0) {
                setBulkResult(err);
                setShortageMode(true);
                toast.error("Insufficient stock");
                setLoading(false);
                return;
            }
            toast.error(err.message || "Failed to approve");
        } finally {
            setLoading(false);
        }
    };

    const handleReject = async () => {
        try {
            setLoading(true);

            await dispatch(updateApprovalStatus({
                id: detailedPrescription.approvalId,
                medicines: updatedDispenseData,
                remarks,
                status: "REJECTED",
                update: "pendingPatients"
            })).unwrap();

            toast.success("Medicines Rejected successfully");
            setModal(false);

        } catch (err) {
            toast.error(err.message || "Failed to reject");
        } finally {
            setLoading(false);
        }
    };


    const resetAll = () => {
        setShortageMode(false);
        setBulkResult(null);
        setRemarks("");
        setUpdatedDispenseData([]);
        setModal(false);
    };


    return (
        <Modal isOpen={modal} toggle={resetAll} size="xl" centered>
            <ModalHeader toggle={resetAll}>
                {shortageMode ? "Approval Failed — Stock Shortage" : patient?.patient?.name}
            </ModalHeader>

            <ModalBody className="bg-light">
                {loading ? (
                    <div className="d-flex justify-content-center align-items-center py-5">
                        <Spinner className="text-primary" />
                    </div>
                ) : (
                    <>
                        {!shortageMode ? (
                            <PrescriptionForm
                                data={detailedPrescription}
                                onDispenseChanges={setUpdatedDispenseData}
                                onRemarks={setRemarks}
                                roles={roles}
                            />
                        ) : (
                            <>
                                <h4 className="fw-bold text-danger mb-3">Summary</h4>

                                <div className="border rounded p-3 bg-white mb-3">
                                    <div className="fw-bold mb-2">
                                        Medicines with shortage:{" "}
                                        <span className="text-danger">
                                            {bulkResult?.shortages?.length || 0}
                                        </span>
                                    </div>

                                    <div className="fw-semibold">Details:</div>

                                    <ul className="mt-2 mb-0">
                                        {bulkResult?.shortages?.map((s, idx) => (
                                            <li key={idx} className="text-muted">
                                                {s.medicineName} — Required:{" "}
                                                <span className="text-danger fw-bold">{s.required}</span>,{" "}
                                                Available:{" "}
                                                <span className="fw-bold">{s.available}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                <p className="text-muted mb-0">
                                    Download the XLSX report for complete details.
                                </p>
                            </>
                        )}
                    </>
                )}
            </ModalBody>

            <ModalFooter>
                {!shortageMode ? (
                    <CheckPermission
                        accessRolePermission={roles?.permissions}
                        permission={"create"}
                        subAccess={"MEDICINEAPPROVAL"}
                    >
                        <div className="d-flex gap-2">
                            <Button
                                color="danger"
                                onClick={handleReject}
                                className="text-white d-flex align-items-center"
                            >
                                <X size={14} className="me-1" />
                                Reject
                            </Button>

                            <Button
                                color="success"
                                onClick={handleApprove}
                                className="text-white d-flex align-items-center"
                            >
                                <CheckCheck size={14} className="me-1" />
                                Approve
                            </Button>
                        </div>
                    </CheckPermission>
                ) : (
                    <>
                        <Button color="primary" onClick={downloadShortageXlsx}>
                            Download XLSX
                        </Button>

                        <Button
                            color="secondary"
                            onClick={resetAll}
                        >
                            Close
                        </Button>
                    </>
                )}
            </ModalFooter>
        </Modal>
    );
};

export default DetailedPrescriptionModal;
