import {
    Modal,
    ModalBody,
    ModalHeader,
} from "reactstrap";
import PropTypes from "prop-types";
import HiringForm from "./forms/HiringForm";

const EditHiringModal = ({
    isOpen,
    toggle,
    initialData,
    onUpdate
}) => {

    return (
        <Modal isOpen={isOpen} toggle={toggle} size="lg" centered backdrop="static"
            keyboard={false}>
            <ModalHeader toggle={toggle}>
                Edit Hiring Request
            </ModalHeader>

            <ModalBody>
                <HiringForm
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

EditHiringModal.prototypes = {
    isOpen: PropTypes.bool,
    toggle: PropTypes.func,
    initialData: PropTypes.object,
    onUpdate: PropTypes.func
};

export default EditHiringModal;
