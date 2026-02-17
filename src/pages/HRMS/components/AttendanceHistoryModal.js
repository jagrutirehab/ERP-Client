import { Modal, ModalBody, ModalHeader, Spinner } from 'reactstrap';
import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import { deleteAttendanceImport, getAttendanceImportHistory } from '../../../helpers/backend_helper';
import { toast } from 'react-toastify';
import { useAuthError } from '../../../Components/Hooks/useAuthError';
import { useSelector } from 'react-redux';
import DataTableComponent from '../../../Components/Common/DataTable';
import { attendanceImportHistoryColumns } from './Table/Columns/attendanceImportHistory';
import { usePermissions } from '../../../Components/Hooks/useRoles';
import DeleteConfirmModal from '../../HR/components/DeleteConfirmModal';

const AttendanceHistoryModal = ({ isOpen, toggle, importType }) => {
    const handleAuthError = useAuthError();

    const { centerAccess } = useSelector((state) => state.User);

    const [page, setPage] = useState(1);
    const [history, setHistory] = useState([]);
    const [pagination, setPagination] = useState({});
    const [loading, setLoading] = useState(false);
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedImportId, setSelectedImportId] = useState(null);
    const limit = 10;

    const microUser = localStorage.getItem("micrologin");
    const token = microUser ? JSON.parse(microUser).token : null;

    const { hasPermission } = usePermissions(token);

    const hasDeletePermission = hasPermission(
        "HRMS",
        "HRMS_ATTENDANCE",
        "DELETE"
    );

    const modalImportType = importType === "LOG" ? ["LOG", "API"] : importType;

    const loadAttendenceImportHistory = async () => {
        setLoading(true);
        try {
            const response = await getAttendanceImportHistory({
                centers: centerAccess,
                page,
                limit,
                importType: modalImportType
            });
            setHistory(response?.data || []);
            setPagination(response?.pagination || {});
        } catch (error) {
            if (!handleAuthError(error)) {
                toast.error(error.message || "something went wrong while fetching attendance import history");
            }
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        if (isOpen) {
            loadAttendenceImportHistory();
        }
    }, [isOpen, page, centerAccess]);

    const openDeleteConfirm = (importId) => {
        setSelectedImportId(importId);
        setIsDeleteModalOpen(true);
    };

    const handleDelete = async () => {
        if (!selectedImportId) return;

        setDeleteLoading(true);
        try {
            await deleteAttendanceImport({
                centers: centerAccess,
                importId: selectedImportId,
            });

            toast.success("Attendance import record deleted successfully");

            setPage(1);
            loadAttendenceImportHistory();
        } catch (error) {
            if (!handleAuthError(error)) {
                toast.error(
                    error.message ||
                    "Something went wrong while deleting the attendance import record"
                );
            }
        } finally {
            setIsDeleteModalOpen(false);
            setDeleteLoading(false);
        }
    };

    const columns = attendanceImportHistoryColumns({
        hasDeletePermission,
        onDelete: openDeleteConfirm,
        importType
    });

    return (
        <>
            <Modal isOpen={isOpen} toggle={toggle} size="xl" centered backdrop="static"
                keyboard={false}>
                <ModalHeader toggle={toggle}>
                    Attendance Import History
                </ModalHeader>
                <ModalBody style={{
                    minHeight: "80vh",
                    display: "flex",
                    flexDirection: "column",
                }}>
                    {loading ? (
                        <div className="flex-grow-1 d-flex flex-column justify-content-center align-items-center">
                            <Spinner color="primary" />
                            <p className="text-muted mt-2">Loading History…</p>
                        </div>
                    ) :
                        history.length === 0 ? (
                            <div className="text-center text-muted py-5">
                                No history found.
                            </div>
                        )
                            : (
                                <>
                                    <DataTableComponent
                                        columns={columns}
                                        data={history}
                                        page={page}
                                        setPage={setPage}
                                        limit={limit}
                                        loading={loading}
                                        pagination={pagination}
                                    />
                                </>
                            )
                    }
                </ModalBody>
            </Modal>

            <DeleteConfirmModal
                isOpen={isDeleteModalOpen}
                toggle={() => setIsDeleteModalOpen(!isDeleteModalOpen)}
                message="Are you sure you want to delete this import record?"
                onConfirm={handleDelete}
                loading={deleteLoading}
            />
        </>
    )
};

AttendanceHistoryModal.prototypes = {
    isOpen: PropTypes.bool,
    toggle: PropTypes.func,
    importType: PropTypes.string,
}

export default AttendanceHistoryModal;