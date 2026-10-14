import React, { useState } from "react";
import PropTypes from "prop-types";
import { Button, Form, FormGroup, Input, Label } from "reactstrap";

import CustomModal from "../../../../Components/Common/Modal";
import RenderWhen from "../../../../Components/Common/RenderWhen";
import {
  PSYCH_TEST_STATUS,
  PSYCH_TEST_NA_REASONS,
  PSYCH_TEST_REASON_MAX,
} from "../../../../Components/constants/sopConstants";

const COPY = {
  [PSYCH_TEST_STATUS.NOT_APPLICABLE]: {
    title: "Psychological Tests Not Applicable",
    body: "Records that psychological tests do not apply to this admission. This stops the missed-test reminders for every clinical scale, including CIWA-Ar, COWS, C-SSRS, Morse, Ramsay and GCS. Score alerts still fire if a test is recorded.",
    color: "secondary",
  },
  [PSYCH_TEST_STATUS.APPLICABLE]: {
    title: "Reopen Psychological Tests",
    body: "Psychological tests apply to this admission again. Missed-test reminders resume from the next scheduled check — if no test is recorded in the current window, one reminder per rule may be raised then.",
    color: "warning",
  },
};

/**
 * Confirms a psychological-tests change for one admission: marking it Not
 * Applicable (one of two fixed reasons) or reopening it (a written reason).
 *
 * Modelled on BaselinePackageStatusModal, with two differences:
 *  - the dispatch stays in IPD.js, passed in as `onSubmit` resolving true/false,
 *    so a failed save keeps the dialog open without this knowing about Redux;
 *  - Submit is not rendered until a reason is given — it appears, rather than
 *    sitting there disabled, as the spec for this control asks.
 */
const PsychologicalTestsStatusModal = ({
  isOpen,
  toggle,
  addmission,
  nextStatus,
  onSubmit,
}) => {
  const [reasonCode, setReasonCode] = useState("");
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Both adjusted during render (React's pattern for state that follows a prop
  // change), so neither is ever painted wrong for a frame:
  //  - every open starts with an empty form, so a cancelled attempt can't
  //    prefill the next one;
  //  - the transition being confirmed is held while the dialog fades out. IPD
  //    clears `nextStatus` the moment it closes, and without this the Reopen
  //    dialog would flip to the Not Applicable one on its way out.
  const [wasOpen, setWasOpen] = useState(isOpen);
  const [shownStatus, setShownStatus] = useState(nextStatus);
  if (isOpen !== wasOpen) {
    setWasOpen(isOpen);
    if (isOpen) {
      setReasonCode("");
      setReason("");
      setSubmitting(false);
    }
  }
  if (isOpen && nextStatus && nextStatus !== shownStatus) {
    setShownStatus(nextStatus);
  }

  const isMarkingNA = shownStatus !== PSYCH_TEST_STATUS.APPLICABLE;
  const copy =
    COPY[
      isMarkingNA ? PSYCH_TEST_STATUS.NOT_APPLICABLE : PSYCH_TEST_STATUS.APPLICABLE
    ];
  const canSubmit = isMarkingNA ? !!reasonCode : reason.trim().length > 0;
  const idBase = `psych-tests-${addmission?._id}`;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit || submitting) return;
    setSubmitting(true);
    try {
      const ok = await onSubmit(
        addmission?._id,
        isMarkingNA
          ? { status: PSYCH_TEST_STATUS.NOT_APPLICABLE, reasonCode }
          : { status: PSYCH_TEST_STATUS.APPLICABLE, reason: reason.trim() },
      );
      // On failure keep the dialog and the selection so the user can retry —
      // IPD has already shown the server's message.
      if (ok) toggle();
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

        <RenderWhen isTrue={isMarkingNA}>
          <FormGroup
            className="mb-0"
            role="radiogroup"
            aria-labelledby={`${idBase}-reason-label`}
          >
            <div id={`${idBase}-reason-label`} className="form-label">
              Reason <span className="text-danger">*</span>
            </div>
            {PSYCH_TEST_NA_REASONS.map((r) => (
              <FormGroup check key={r.value} className="mb-2">
                <Input
                  type="radio"
                  id={`${idBase}-${r.value}`}
                  name={`${idBase}-reason`}
                  value={r.value}
                  checked={reasonCode === r.value}
                  disabled={submitting}
                  onChange={() => setReasonCode(r.value)}
                />
                <Label check htmlFor={`${idBase}-${r.value}`}>
                  {r.label}
                </Label>
              </FormGroup>
            ))}
          </FormGroup>
        </RenderWhen>

        <RenderWhen isTrue={!isMarkingNA}>
          <FormGroup className="mb-0">
            <Label for={`${idBase}-reopen`} className="mb-1">
              Reason <span className="text-danger">*</span>
            </Label>
            <Input
              id={`${idBase}-reopen`}
              type="textarea"
              rows="3"
              maxLength={PSYCH_TEST_REASON_MAX}
              value={reason}
              disabled={submitting}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Why do psychological tests apply again?"
            />
          </FormGroup>
        </RenderWhen>

        <div className="d-flex gap-2 justify-content-end mt-3">
          <Button
            type="button"
            color="light"
            onClick={toggle}
            disabled={submitting}
          >
            Cancel
          </Button>
          <RenderWhen isTrue={canSubmit}>
            <Button type="submit" color={copy.color} disabled={submitting}>
              {submitting ? "Saving..." : "Submit"}
            </Button>
          </RenderWhen>
        </div>
      </Form>
    </CustomModal>
  );
};

PsychologicalTestsStatusModal.propTypes = {
  isOpen: PropTypes.bool,
  toggle: PropTypes.func.isRequired,
  addmission: PropTypes.object,
  nextStatus: PropTypes.oneOf(Object.values(PSYCH_TEST_STATUS)),
  onSubmit: PropTypes.func.isRequired,
};

export default PsychologicalTestsStatusModal;
