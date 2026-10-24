import PropTypes from "prop-types";
import { Modal, ModalBody, ModalHeader } from "reactstrap";
import PharmacyStockPicker from "./PharmacyStockPicker";

const PharmacyStockPickerModal = ({
    isOpen,
    onClose,
    title,
    centerId,
    medicineId,
    selectedPharmacyId,
    onSelect,
}) => {
    const handleSelect = (doc) => {
        onSelect(doc);
        onClose();
    };

    return (
        <Modal isOpen={isOpen} toggle={onClose} centered>
            <ModalHeader toggle={onClose}>{title || "Select from Inventory"}</ModalHeader>
            <ModalBody>
                {isOpen && (
                    <PharmacyStockPicker
                        centerId={centerId}
                        medicineId={medicineId}
                        selectedPharmacyId={selectedPharmacyId}
                        onSelect={handleSelect}
                        onCancel={onClose}
                    />
                )}
            </ModalBody>
        </Modal>
    );
};

PharmacyStockPickerModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    title: PropTypes.string,
    centerId: PropTypes.string,
    medicineId: PropTypes.string,
    selectedPharmacyId: PropTypes.string,
    onSelect: PropTypes.func.isRequired,
};

export default PharmacyStockPickerModal;
