import {
    Modal,
    ModalBody,
    ModalHeader,
} from "reactstrap";
import PropTypes from "prop-types";
import FinanceForm from "./forms/FinanceForm";

const FinanceModal = ({ isOpen, toggle, initialData, onUpdate, mode }) => {
    return (
        <Modal isOpen={isOpen} toggle={toggle} size="xl" backdrop="static"
            keyboard={false}>
            <ModalHeader toggle={toggle}>
                {mode === "EDIT"
                    ? "Edit Finance Details"
                    : "Manage Salary"
                }
            </ModalHeader>

            <ModalBody>
                <FinanceForm
                    initialData={initialData}
                    onSuccess={() => {
                        toggle();
                        onUpdate?.();
                    }}
                    onCancel={toggle}
                    mode={mode}
                />
            </ModalBody>
        </Modal>
    );
};

FinanceModal.propTypes = {
    isOpen: PropTypes.bool,
    toggle: PropTypes.func,
    initialData: PropTypes.object,
    onUpdate: PropTypes.func,
    mode: PropTypes.oneOf(["EDIT", "CHANGE"]),
};

export default FinanceModal;
