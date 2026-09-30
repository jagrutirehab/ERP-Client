import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { Button, Form, FormGroup, Input, Label } from "reactstrap";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";

import CustomModal from "../../../../Components/Common/Modal";
import { setAdmissionBaselineInvestigationStatus } from "../../../../store/features/chart/chartSlice";

// A reason is mandatory for anything that isn't "the work was done" — the
// server enforces the same rule, this just avoids a round-trip to learn it.
const REASON_REQUIRED = new Set(["WAIVED", "PENDING"]);

const COPY = {
  COMPLETED: {
    title: "Mark Baseline Package Complete",
    body: "Records that the baseline investigation package has been completed for this admission. This stops the escalation alerts.",
    reasonLabel: "Note (optional)",
    confirm: "Mark Complete",
    color: "success",
  },
  WAIVED: {
    title: "Baseline Package Not Applicable",
    body: "Records that the baseline investigation package does not apply to this admission. This stops the escalation alerts.",
    reasonLabel: "Reason",
    confirm: "Mark Not Applicable",
    color: "secondary",
  },
  PENDING: {
    title: "Reopen Baseline Package",
    body: "Returns this admission to pending. Escalation alerts resume from where they stopped — tiers that already fired will not fire again.",
    reasonLabel: "Reason",
    confirm: "Reopen",
    color: "warning",
  },
};

/**
 * Confirms a baseline investigation package status change for one admission.
 *
 * Follows SetAdmissionTypeModal — the existing precedent for a per-admission
 * action modal in the IPD row — but hand-rolled rather than Formik, since this
 * is one optional-or-required textarea.
 */
const BaselinePackageStatusModal = ({ isOpen, toggle, addmission, nextStatus }) => {
  const dispatch = useDispatch();
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Reset when reopened, so a cancelled attempt doesn't prefill the next one.
  useEffect(() => {
    if (!isOpen) {
      setReason("");
      setSubmitting(false);
    }
  }, [isOpen]);

  const copy = COPY[nextStatus] || COPY.COMPLETED;
  const reasonRequired = REASON_REQUIRED.has(nextStatus);
  const canSubmit = !submitting && (!reasonRequired || reason.trim().length > 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit) return;
    setSubmitting(true);
    try {
      await dispatch(
        setAdmissionBaselineInvestigationStatus({
          admissionId: addmission?._id,
          status: nextStatus,
          reason: reason.trim() || undefined,
        }),
      ).unwrap();
      toast.success(copy.confirm === "Reopen" ? "Baseline package reopened" : "Baseline package updated");
      toggle();
    } catch (error) {
      // The response interceptor rejects with the unwrapped body, so the
      // message is on `error.message` — not `error.response.data.message`.
      toast.warn(error?.message || "Could not update the baseline package");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <CustomModal isOpen={isOpen} toggle={toggle} centered title={copy.title}>
      <Form onSubmit={handleSubmit}>
        <p className="text-muted mb-3" style={{ fontSize: "0.85rem" }}>
          {copy.body}
        </p>

        <FormGroup>
          <Label for="baseline-reason" className="mb-1">
            {copy.reasonLabel}
            {reasonRequired && <span className="text-danger"> *</span>}
          </Label>
          <Input
            id="baseline-reason"
            type="textarea"
            rows="3"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            disabled={submitting}
            placeholder={
              reasonRequired
                ? "Why does this not apply / why is it being reopened?"
                : "Anything worth recording alongside this"
            }
          />
        </FormGroup>

        <div className="d-flex gap-2 justify-content-end mt-3">
          <Button type="button" color="light" onClick={toggle} disabled={submitting}>
            Cancel
          </Button>
          <Button type="submit" color={copy.color} disabled={!canSubmit}>
            {submitting ? "Saving..." : copy.confirm}
          </Button>
        </div>
      </Form>
    </CustomModal>
  );
};

BaselinePackageStatusModal.propTypes = {
  isOpen: PropTypes.bool,
  toggle: PropTypes.func.isRequired,
  addmission: PropTypes.object,
  nextStatus: PropTypes.oneOf(["COMPLETED", "WAIVED", "PENDING"]),
};

export default BaselinePackageStatusModal;
