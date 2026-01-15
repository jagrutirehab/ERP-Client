import {
    Modal,
    ModalBody,
    ModalHeader,
} from "reactstrap";
import PropTypes from "prop-types";
import EmployeeReportingForm from "./forms/EmployeeReportingForm";

const EditEmployeeReportingModal = ({
    isOpen,
    toggle,
    initialData,
    onUpdate
}) => {

    return (
        <Modal isOpen={isOpen} toggle={toggle} size="lg" centered backdrop="static"
            keyboard={false}>
            <ModalHeader toggle={toggle}>
                Edit Employee Reporting
            </ModalHeader>

            <ModalBody>
                <EmployeeReportingForm
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

EditEmployeeReportingModal.prototypes = {
    isOpen: PropTypes.bool,
    toggle: PropTypes.func,
    initialData: PropTypes.object,
    onUpdate: PropTypes.func
};

export default EditEmployeeReportingModal;
