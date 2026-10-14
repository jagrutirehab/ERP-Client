import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import {
  Button,
  Form,
  FormGroup,
  Label,
  Input,
  FormFeedback,
} from "reactstrap";
import CustomModal from "../../../Components/Common/Modal";

const WriteOffModal = ({ isOpen, toggle, onSubmit, adjustedPayable }) => {
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!isOpen) {
      setAmount("");
      setReason("");
      setErrors({});
    }
  }, [isOpen]);

  const validate = () => {
    const newErrors = {};

    if (!amount) {
      newErrors.amount = "Amount is required";
    } else if (Number(amount) <= 0) {
      newErrors.amount = "Amount must be greater than 0";
    }

    if (!reason.trim()) {
      newErrors.reason = "Reason is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    onSubmit({
      amount: Number(amount),
      reason,
    });
  };

  return (
    <CustomModal title="Write Off" isOpen={isOpen} toggle={toggle}>
      <Form onSubmit={handleSubmit}>
        <FormGroup>
          <Label>
            Write Off Amount <span className="text-danger">*</span>
          </Label>
          <Input
            type="number"
            min="0"
            step="1"
            max={adjustedPayable}
            inputMode="numeric"
            placeholder={`e.g. ${adjustedPayable}`}
            className="form-control"
            value={amount}
            onKeyDown={(e) => {
              if (["-", "+", "e", "E"].includes(e.key)) {
                e.preventDefault();
              }
            }}
            onChange={(e) => {
              const value = e.target.value;

              if (!/^\d*$/.test(value)) return;

              if (Number(value) > Number(adjustedPayable)) {
                setAmount(adjustedPayable);
                return;
              }

              setAmount(value);

              if (errors.amount) {
                setErrors({ ...errors, amount: "" });
              }
            }}
            invalid={!!errors.amount}
          />
          {errors.amount && (
            <FormFeedback>{errors.amount}</FormFeedback>
          )}
        </FormGroup>

        <FormGroup className="mt-2">
          <Label>
            Reason <span className="text-danger">*</span>
          </Label>
          <Input
            type="textarea"
            value={reason}
            onChange={(e) => {
              setReason(e.target.value);
              if (errors.reason) {
                setErrors({ ...errors, reason: "" });
              }
            }}
            invalid={!!errors.reason}
          />
          {errors.reason && (
            <FormFeedback>{errors.reason}</FormFeedback>
          )}
        </FormGroup>

        <div className="d-flex justify-content-end gap-2 mt-3">
          <Button outline size="sm" type="button" onClick={toggle}>
            Cancel
          </Button>

          <Button color="primary" size="sm" type="submit">
            Submit
          </Button>
        </div>
      </Form>
    </CustomModal>
  );
};

WriteOffModal.propTypes = {
  isOpen: PropTypes.bool,
  toggle: PropTypes.func,
};

export default WriteOffModal;