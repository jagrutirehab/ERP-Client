import {
    Modal,
    ModalBody,
    ModalHeader,
} from "reactstrap";
import PropTypes from "prop-types";
import ExitEmployeeForm from "./forms/ExitEmployeeForm";

const EditExitEmployeeModal = ({ isOpen, toggle, initialData, onUpdate }) => {
    return (
        <Modal isOpen={isOpen} toggle={toggle} size="lg" centered backdrop="static"
            keyboard={false}>
            <ModalHeader toggle={toggle}>
                Edit Exit Employee Request
            </ModalHeader>

            <ModalBody>
                <ExitEmployeeForm
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
