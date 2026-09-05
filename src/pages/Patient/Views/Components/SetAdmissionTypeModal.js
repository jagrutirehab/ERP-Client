import React, { useEffect } from "react";
import PropTypes from "prop-types";
import { Form, Button } from "reactstrap";
import { format } from "date-fns";
import { useFormik } from "formik";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";

import CustomModal from "../../../../Components/Common/Modal";
import RenderFields from "../../../../Components/Common/RenderFields";
import { admissionTypeFields } from "../../../../Components/constants/patient";
import {
  admissionTypeValidationSchema,
  clearInactiveBranchFields,
  stripInactiveBranchFields,
} from "../../../../utils/admissionTypeForm";
import { setAdmissionTypeDirect } from "../../../../store/features/chart/chartSlice";

// These sit in a full-width modal column, so let each field take the row.
const FORM_FIELDS = admissionTypeFields.map((field) => ({
  ...field,
  fullWidth: true,
}));

const EMPTY = {
  admissionType: "",
  adultationType: "",
  supportType: "",
  emergencyType: "",
  emergencyRestraint: "",
};

/**
 * Records an admission type straight onto an admission that has none.
 *
 * For stays predating the Admission Type chart that also never had a structured
 * Admission Form — the backfill script can't reach them, because it derives
 * history FROM those two sources. The caller only renders this when
 * `admissionTypeHistory` is empty, and the server refuses otherwise, so this is
 * create-only: corrections go through the Admission Type chart.
 */
const SetAdmissionTypeModal = ({ isOpen, toggle, addmission }) => {
  const dispatch = useDispatch();

  const validation = useFormik({
    enableReinitialize: true,
    initialValues: EMPTY,
    validationSchema: admissionTypeValidationSchema,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        await dispatch(
          setAdmissionTypeDirect({
            admissionId: addmission?._id,
            ...stripInactiveBranchFields(values),
          }),
        ).unwrap();
        toast.success("Admission type recorded");
        toggle();
      } catch (error) {
        toast.warn(error?.message || "Could not record the admission type");
      } finally {
        setSubmitting(false);
      }
    },
  });

  const { admissionType } = validation.values;

  // RenderFields hides a field whose showIf stops matching, but Formik keeps its
  // value — clear the branches that no longer apply as the user switches.
  useEffect(() => {
    clearInactiveBranchFields(validation);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [admissionType]);

  // Reset when reopened, so a cancelled attempt doesn't prefill the next one.
  useEffect(() => {
    if (!isOpen) validation.resetForm({ values: EMPTY });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const admittedOn = addmission?.addmissionDate
    ? format(new Date(addmission.addmissionDate), "dd MMM yyyy")
    : null;

  return (
    <CustomModal
      isOpen={isOpen}
      toggle={toggle}
      centered
      title="Set Admission Type"
    >
      <Form
        onSubmit={(e) => {
          e.preventDefault();
          validation.handleSubmit();
        }}
      >
        {/* The entry is stamped with the admission date, not today — say so,
            because it means the type is recorded as covering the whole stay. */}
        {admittedOn && (
          <p className="text-muted mb-3" style={{ fontSize: "0.8rem" }}>
            Recorded as effective from the admission date,{" "}
            <span className="fw-semibold">{admittedOn}</span>.
          </p>
        )}

        <RenderFields fields={FORM_FIELDS} validation={validation} />

        <div className="d-flex gap-2 justify-content-end mt-3">
          <Button type="button" color="light" onClick={toggle}>
            Cancel
          </Button>
          <Button
            type="submit"
            color="primary"
            disabled={validation.isSubmitting}
          >
            {validation.isSubmitting ? "Saving..." : "Save"}
          </Button>
        </div>
      </Form>
    </CustomModal>
  );
};

SetAdmissionTypeModal.propTypes = {
  isOpen: PropTypes.bool,
  toggle: PropTypes.func,
  addmission: PropTypes.object,
};

export default SetAdmissionTypeModal;
