import React, { useEffect, useState } from "react";
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Label,
  Input,
  Spinner,
} from "reactstrap";
import { useAuthError } from "../../../Components/Hooks/useAuthError";
import { toast } from "react-toastify";
import { getEmployeeId } from "../../../helpers/backend_helper";
import Select from "react-select";

const ApproveModal = ({
  isOpen,
  toggle,
  onSubmit,
  mode,           // NEW_JOINING | SALARY_ADVANCE | TECH_ISSUES
  actionType,
  setActionType,
  paymentType,
  setPaymentType,
  note,
  setNote,
  eCode,
  setECode,
  usersLinkedToEmployee,
  loading,
}) => {

  const [approvedBy, setApprovedBy] = useState("");
  const handleAuthError = useAuthError();


  const generateEmployeeId = async () => {
    try {
      const response = await getEmployeeId();
      setECode(response.payload.value);
    } catch (error) {
      if (!handleAuthError) {
        toast.error("Failed to generate employee id");
      }
    }
  }

  useEffect(() => {
    if (mode === "NEW_JOINING" && actionType === "APPROVE") {
      generateEmployeeId();
    }
  }, [actionType, mode])

  const handleSubmit = () => {
    if (mode === "SALARY_ADVANCE" && actionType === "APPROVE" && !paymentType) {
      toast.warn("Please select a payment type.");
      return;
    }
    onSubmit({
      note,
      approvedBy: mode === "TECH_ISSUES" ? approvedBy : undefined,
      paymentType: mode === "SALARY_ADVANCE" ? paymentType : undefined,
      action: actionType,
      eCode: mode === "NEW_JOINING" ? eCode : undefined,
    });

    setNote("");
    if (mode === "SALARY_ADVANCE") {
      setPaymentType("");
    }
    toggle();
  };

  if (loading) {
    return (
      <div className="py-4 text-center">
        <Spinner className="text-primary" />
      </div>
    )
  }

  return (
    <Modal isOpen={isOpen} toggle={toggle} centered>
      <ModalHeader toggle={toggle}>
        {(mode === "EXIT_EMPLOYEES_EXIT_PENDING" || mode === "EXIT_EMPLOYEES_FNF_PENDING") ? "Action Required" : actionType === "APPROVE" ? "Approve Request" : "Reject Request"}
      </ModalHeader>

      <ModalBody>
        {mode === "NEW_JOINING" && actionType === "APPROVE" && (
          <div className="mb-3">
            <Label htmlFor="eCode" className="fw-bold">ECode</Label>
            <Input
              id="eCode"
              disabled
              type="text"
              value={eCode}
            />
          </div>
        )}
        <div className="mb-3">
          <Label htmlFor="note" className="fw-bold">Note (Optional)</Label>
          <Input
            id="note"
            type="textarea"
            rows="3"
            value={note}
            placeholder="Write a note..."
            onChange={(e) => setNote(e.target.value)}
          />
        </div>
        {mode === "EXIT_EMPLOYEES_EXIT_PENDING" && (
          <div className="mb-3">
            <Label htmlFor="action" className="fw-bold">
              Action <span className="text-danger">*</span>
            </Label>
            <Select
              id="action"
              options={[
                { label: "Approve", value: "APPROVE" },
                { label: "Reject", value: "REJECT" },
              ]}
              placeholder="Select Action..."
              value={actionType}
              onChange={(option) => setActionType(option)}
              className="mt-2"
            />
          </div>
        )}

        {mode === "EXIT_EMPLOYEES_FNF_PENDING" && (
          <div className="mb-3">
            <Label htmlFor="action" className="fw-bold">
              Action <span className="text-danger">*</span>
            </Label>
            <Select
              id="action"
              options={[
                { label: "FNF Closed", value: "APPROVE" },
                { label: "Reject", value: "REJECT" },
                { label: "Reject and Active Employee", value: "REJECT_AND_ACTIVE_EMPLOYEE" },
              ]}
              placeholder="Select Action..."
              value={actionType}
              onChange={(option) => setActionType(option)}
              className="mt-2"
            />
          </div>
        )}

        {
          mode === "EXIT_EMPLOYEES_IT_PENDING" &&
            actionType === "APPROVE" ? (
            usersLinkedToEmployee?.length > 0 ? (
              <div style={{ marginTop: "10px" }}>
                <p className="text-danger fw-bold">
                  User(s) associated with this employee will be suspended:
                </p>

                <ul style={{ paddingLeft: "20px", marginTop: "5px" }}>
                  {usersLinkedToEmployee.map((email, idx) => (
                    <li key={idx} className="text-muted">
                      {email}
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <div
                style={{
                  marginTop: "10px",
                  padding: "10px 12px",
                  background: "#f8f9fa",
                  borderRadius: "6px",
                  border: "1px solid #e2e3e5",
                }}
              >
                <p className="m-0 text-secondary">
                  <i className="bx bx-info-circle me-1"></i>
                  No user accounts are linked with this employee.
                </p>
              </div>
            )
          ) : null
        }

        {mode === "SALARY_ADVANCE" && actionType === "APPROVE" && (
          <div className="mb-3">
            <Label className="fw-bold">Payment Type *</Label>
            <Input
              type="select"
              value={paymentType}
              onChange={(e) => setPaymentType(e.target.value)}
            >
              <option value="">Select Payment Type</option>
              <option value="CASH">Cash</option>
              <option value="CENTRAL">Central</option>
            </Input>
          </div>
        )}

        {/* TECH_ISSUES: ApprovedBy */}
        {mode === "TECH_ISSUES" && (
          <div className="mb-3">
            <Label className="fw-bold">Confirmed By (Optional)</Label>
            <Input
              type="text"
              value={approvedBy}
              placeholder="Enter confirmer name..."
              onChange={(e) => setApprovedBy(e.target.value)}
            />
          </div>
        )}
      </ModalBody>

      <ModalFooter>
        <Button color="secondary" className="text-white" onClick={toggle}>
          Cancel
        </Button>

        {(mode === "EXIT_EMPLOYEES_EXIT_PENDING" || mode === "EXIT_EMPLOYEES_FNF_PENDING") ? (
          <Button color="warning" className="text-white" disabled={!actionType || !actionType.value} onClick={handleSubmit}>
            Confirm
          </Button>
        ) : actionType === "APPROVE" ? (
          <Button color="success" className="text-white" onClick={handleSubmit}>
            Approve
          </Button>
        ) : (
          <Button color="danger" className="text-white" onClick={handleSubmit}>
            Reject
          </Button>
        )}

      </ModalFooter>
    </Modal>
  );
};

export default ApproveModal;
