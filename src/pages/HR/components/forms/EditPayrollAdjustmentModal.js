import {
    Modal,
    ModalBody,
    ModalHeader,
} from "reactstrap";
import PropTypes from "prop-types";
import PayrollAdjustmentsForm from "./PayrollAdjustmentsForm";

const EditPayrollAdjustmentModal = ({
    isOpen,
    toggle,
    initialData,
    onUpdate
}) => {

    return (
        <Modal isOpen={isOpen} toggle={toggle} size="lg" centered backdrop="static"
            keyboard={false}>
            <ModalHeader toggle={toggle}>
                Edit Payroll Adjustment Request
            </ModalHeader>

            <ModalBody>
                <PayrollAdjustmentsForm
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

EditPayrollAdjustmentModal.propTypes = {
    isOpen: PropTypes.bool,
    toggle: PropTypes.func,
    initialData: PropTypes.object,
    onUpdate: PropTypes.func
};

export default EditPayrollAdjustmentModal;
