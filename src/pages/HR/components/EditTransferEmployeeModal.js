import {
    Modal,
    ModalBody,
    ModalHeader,
} from "reactstrap";
import PropTypes from "prop-types";
import TransferEmployeeForm from "./forms/TransferEmployeeForm";

const EditExitEmployeeModal = ({ isOpen, toggle, initialData, onUpdate }) => {
    return (
        <Modal isOpen={isOpen} toggle={toggle} size="lg" centered backdrop="static"
            keyboard={false}>
            <ModalHeader toggle={toggle}>
                Edit Transfer Employee Request
            </ModalHeader>

            <ModalBody>
                <TransferEmployeeForm
                    initialData={initialData}
                    onSuccess={() => {
                        toggle();
                        onUpdate?.();
                    }}
                    onCancel={toggle}
                    view={"MODAL"}
                />
            </ModalBody>
        </Modal>
    );
};

EditExitEmployeeModal.prototypes = {
    isOpen: PropTypes.bool,
    toggle: PropTypes.func,
    initialData: PropTypes.object,
    onUpdate: PropTypes.func
};


export default EditExitEmployeeModal;
