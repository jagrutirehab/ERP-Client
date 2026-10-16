import React, { useState } from "react";
import PropTypes from "prop-types";
import { Button } from "reactstrap";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import { format, isValid } from "date-fns";

import CustomModal from "../../../../Components/Common/Modal";
import { clearAdmissionTypeDirect } from "../../../../store/features/chart/chartSlice";
import {
  getCurrentAdmissionType,
  admissionTypeLabel,
  getAdmissionTypeDetailParts,
} from "../../../../utils/admissionType";

/**
 * Confirms emptying an admission's admission-type history — back to "no
 * admission type recorded". Only rendered for the override accounts in IPD.js;
 * the server enforces the same list.
 *
 * Destructive (the entries are deleted, only the activity log keeps them), so it
 * says exactly what is about to go and what changes as a result.
 */
const ClearAdmissionTypeModal = ({ isOpen, toggle, addmission }) => {
  const dispatch = useDispatch();
  const [submitting, setSubmitting] = useState(false);

  const entries = addmission?.admissionTypeHistory?.length || 0;
  const current = getCurrentAdmissionType(addmission);
  const currentLabel = current
    ? [
        admissionTypeLabel("admissionType", current.data.admissionType),
        ...getAdmissionTypeDetailParts(current.data),
      ].join(" · ")
    : "—";
  const since = current?.date ? new Date(current.date) : null;

  const handleConfirm = async () => {
    setSubmitting(true);
    try {
      const res = await dispatch(
        clearAdmissionTypeDirect({ admissionId: addmission?._id }),
      ).unwrap();
      toast.success(res?.message || "Admission type cleared");
      toggle();
    } catch {
      // The thunk rejects with a string and has already shown the server's
      // message via setAlert — nothing more to say here.
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <CustomModal
      isOpen={isOpen}
      toggle={toggle}
      centered
      title="Clear Admission Type"
    >
      <p className="mb-2">
        Current type: <strong>{currentLabel}</strong>
        {since && isValid(since) && (
          <span className="text-muted"> (since {format(since, "dd MMM yyyy")})</span>
        )}
      </p>
      <ul className="text-muted mb-3 ps-3" style={{ fontSize: "0.85rem" }}>
        <li>
          Deletes this stay&rsquo;s admission type history ({entries}{" "}
          {entries === 1 ? "entry" : "entries"}). The admission will show no
          admission type, as before one was set.
        </li>
        <li>
          SOP rules gated on the admission type — including the §89 / §90
          admission-duration alerts — stop for this patient until a type is set
          again.
        </li>
        <li>
          Admission Type charts and uploaded admission forms are not deleted.
          The change is recorded in the activity log.
        </li>
      </ul>

      <div className="d-flex gap-2 justify-content-end">
        <Button color="light" onClick={toggle} disabled={submitting}>
          Cancel
        </Button>
        <Button color="danger" onClick={handleConfirm} disabled={submitting}>
          {submitting ? "Clearing..." : "Clear Admission Type"}
        </Button>
      </div>
    </CustomModal>
  );
};

ClearAdmissionTypeModal.propTypes = {
  isOpen: PropTypes.bool,
  toggle: PropTypes.func.isRequired,
  addmission: PropTypes.object,
};

export default ClearAdmissionTypeModal;
