import {
    Modal,
    ModalBody,
    ModalHeader,
} from "reactstrap";
import SalaryAdvanceForm from "./forms/SalaryAdvanceForm";
import PropTypes from "prop-types";

const EditSalaryAdvanceModal = ({
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
                <SalaryAdvanceForm
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

EditSalaryAdvanceModal.prototypes = {
    isOpen: PropTypes.bool,
    toggle: PropTypes.func,
    initialData: PropTypes.object,
    onUpdate: PropTypes.func
};

export default EditSalaryAdvanceModal;
