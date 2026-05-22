import React from "react";
import { Button, Alert } from "reactstrap";
import SuggestedMedicineRow from "./SuggestedMedicineRow";
import { emptySuggestedMedicine } from "../../../../Components/constants/sopConstants";

/**
 * Suggested Medicines block for a SOP rule.
 *
 *   medicines:    SuggestedMedicine[]                         (form-shape)
 *   onChange:     (next: SuggestedMedicine[]) => void
 *
 * The list is independent of targetBlocks / satisfyingCriteria — the rule's
 * satisfyingCriteria already gates whether this medicine set applies to a
 * given patient. Day filtering happens at suggest-time using each medicine's
 * `applicableDays`.
 */
const SuggestedMedicinesSection = ({
  medicines = [],
  onChange,
  isSubmitting = false,
  errors = [],
}) => {
  // Functional setState — multiple set() calls inside one handler
  // (e.g. handleMedicineChange dispatches medicine + snapshot + unit) need
  // the latest state on every call, otherwise later calls overwrite earlier
  // ones using a stale closure of `medicines`. This was hiding the selected
  // medicine in the AsyncSelect.
  const update = (idx, key, value) => {
    onChange((prev) => {
      const next = [...prev];
      next[idx] = { ...next[idx], [key]: value };
      return next;
    });
  };

  const add = () => onChange((prev) => [...prev, emptySuggestedMedicine()]);

  const remove = (idx) =>
    onChange((prev) => prev.filter((_, i) => i !== idx));

  return (
    <div className="mb-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h5 className="fw-semibold mb-0">4. Suggested Medicines</h5>
          <small className="text-muted">
            Optional. When this rule's satisfying criteria pass for a patient,
            these medicines are offered as one-click populate on the
            prescription form. Day filtering is per-medicine.
          </small>
        </div>
        <Button
          type="button"
          color="primary"
          size="sm"
          onClick={add}
          disabled={isSubmitting}
        >
          + Add Medicine
        </Button>
      </div>

      {medicines.length === 0 && (
        <Alert color="light" className="border text-muted small">
          No medicines suggested by this rule yet. Click <b>+ Add Medicine</b>{" "}
          to attach one. Skip this section if the rule is alert-only.
        </Alert>
      )}

      {medicines.map((m, idx) => (
        <SuggestedMedicineRow
          key={m.id || idx}
          medicine={m}
          idx={idx}
          onChange={update}
          onRemove={remove}
          isDisabled={isSubmitting}
          error={errors[idx] || {}}
        />
      ))}
    </div>
  );
};

export default SuggestedMedicinesSection;
