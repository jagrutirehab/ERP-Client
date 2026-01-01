import {
    Modal,
    ModalBody,
    ModalHeader,
} from "reactstrap";
import TPMForm from "./forms/TPMForm";
import PropTypes from "prop-types";

const EditTPMModal = ({
    isOpen,
    toggle,
    initialData,
    onUpdate
}) => {

    return (
        <Modal isOpen={isOpen} toggle={toggle} size="lg" centered backdrop="static"
            keyboard={false}>
            <ModalHeader toggle={toggle}>
                Edit Advance Salary Request
            </ModalHeader>

            <ModalBody>
                <TPMForm
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

EditTPMModal.prototypes = {
    isOpen: PropTypes.bool,
    toggle: PropTypes.func,
    initialData: PropTypes.object,
    onUpdate: PropTypes.func
};

export default EditTPMModal;
