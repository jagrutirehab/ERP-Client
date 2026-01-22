import {
    Modal,
    ModalBody,
    ModalHeader,
} from "reactstrap";
import PropTypes from "prop-types";
import EmployeeForm from "./forms/EmployeeForm";

const EmployeeModal = ({ isOpen, toggle, initialData, onUpdate, mode, hasCreatePermission }) => {
    return (
        <Modal isOpen={isOpen} toggle={toggle} size="xl" centered backdrop="static"
            keyboard={false}>
            <ModalHeader toggle={toggle}>
                {
                    initialData?._id
                        ? mode === "NEW_JOINING"
                            ? "Edit Employee New Joining Request"
                            : "Edit Employee"
                        : "Add Employee"
                }
            </ModalHeader>

            <ModalBody>
                <EmployeeForm
                    initialData={initialData}
                    onSuccess={() => {
                        toggle();
                        onUpdate?.();
                    }}
                    onCancel={toggle}
                    view={"MODAL"}
                    mode={mode}
                    hasCreatePermission={hasCreatePermission}
                />
            </ModalBody>
        </Modal>
    );
};

EmployeeModal.prototypes = {
    isOpen: PropTypes.bool,
    toggle: PropTypes.func,
    initialData: PropTypes.object,
    onUpdate: PropTypes.func,
    mode: PropTypes.string,
    hasCreatePermission: PropTypes.bool
};


export default EmployeeModal;
