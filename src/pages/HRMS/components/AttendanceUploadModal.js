import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { Modal, ModalBody, ModalHeader } from "reactstrap";
import { useSearchParams } from "react-router-dom";

import UploadAttendanceForm from "./forms/UploadAttendanceForm";
import AttendanceImportProgress from "./AttendanceImportProgress";

const AttendanceUploadModal = ({ isOpen, toggle }) => {
    const [importMeta, setImportMeta] = useState({
        importId: null,
        centerId: null,
        centerName: null,
    });

    const [searchParams, setSearchParams] = useSearchParams();

    useEffect(() => {
        const importId = searchParams.get("importId");
        const centerId = searchParams.get("centerId");
        const centerName = searchParams.get("centerName");

        if (importId) {
            setImportMeta({
                importId,
                centerId,
                centerName,
            });
        }
    }, []);

    const handleUploadSuccess = ({ importId, centerId, centerName }) => {
        setImportMeta({ importId, centerId, centerName });

        setSearchParams(
            {
                importId,
                centerId,
                centerName,
            },
            { replace: true }
        );
    };

    const handleClose = () => {
        setImportMeta({
            importId: null,
            centerId: null,
            centerName: null,
        });

        searchParams.delete("importId");
        searchParams.delete("centerId");
        searchParams.delete("centerName");
        setSearchParams(searchParams, { replace: true });

        toggle();
    };

    const shouldModalOpen =
        isOpen || !!searchParams.get("importId");

    return (
        <Modal
            isOpen={shouldModalOpen}
            toggle={handleClose}
            size="xl"
            backdrop="static"
            keyboard={false}
        >
            <ModalHeader toggle={handleClose}>
                Import Attendance
            </ModalHeader>

            <ModalBody>
                {!importMeta.importId && (
                    <UploadAttendanceForm
                        onSuccess={handleUploadSuccess}
                        onCancel={handleClose}
                    />
                )}

                {importMeta.importId && (
                    <AttendanceImportProgress
                        importId={importMeta.importId}
                        center={{
                            id: importMeta.centerId,
                            name: importMeta.centerName,
                        }}
                        onClose={handleClose}
                    />
                )}
            </ModalBody>
        </Modal>
    );
};

AttendanceUploadModal.propTypes = {
    isOpen: PropTypes.bool,
    toggle: PropTypes.func,
};

export default AttendanceUploadModal;
