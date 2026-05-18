import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { CardBody, Spinner, Alert, Button } from "reactstrap";
import { useMediaQuery } from "../../../Components/Hooks/useMediaQuery";
import SOPForm from "../components/SOPForm";
import ConfirmModal from "../components/ConfirmModal";
import { toast } from "react-toastify";
import {
  sopConfigure,
  getSopRuleById,
  updateSopRule,
} from "../../../helpers/backend_helper";

/**
 * Dual-purpose page:
 *   - /sop-configs/save        → create
 *   - /sop-configs/save/:id    → edit
 * Same component, same SOPForm; the URL param decides the mode.
 */
const SaveRule = () => {
  const isMobile = useMediaQuery("(max-width: 1000px)");
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [initialValues, setInitialValues] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pendingPayload, setPendingPayload] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    if (!isEdit) {
      setInitialValues(null);
      return;
    }
    let alive = true;
    setLoading(true);
    setLoadError(null);
    getSopRuleById(id)
      .then((res) => {
        if (!alive) return;
        // axios response interceptor unwraps `res.data` to be the API body,
        // so `res.data` is `{ success, data: rule }`.
        setInitialValues(res?.data || null);
      })
      .catch((err) => {
        if (!alive) return;
        setLoadError(err?.response?.data?.message || "Failed to load rule");
      })
      .finally(() => alive && setLoading(false));
    return () => { alive = false; };
  }, [id, isEdit]);

  const handleFormSubmit = (payload) => {
    setPendingPayload(payload);
    setModalOpen(true);
  };

  const handleConfirm = async () => {
    if (!pendingPayload) return;
    setIsSubmitting(true);
    try {
      if (isEdit) {
        await updateSopRule(id, pendingPayload);
        toast.success("Rule updated.");
      } else {
        await sopConfigure(pendingPayload);
        toast.success("Rule created.");
      }
      setModalOpen(false);
      setPendingPayload(null);
      navigate("/sop-configs/manage");
      return true;
    } catch (err) {
      toast.error(err?.response?.data?.message || "Save failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (isSubmitting) return;
    setModalOpen(false);
    setPendingPayload(null);
  };

  if (isEdit && loading) {
    return (
      <CardBody className="p-3 bg-white" style={isMobile ? { width: "100%" } : { width: "78%" }}>
        <div className="text-center py-5">
          <Spinner color="primary" />
          <div className="mt-2 text-muted">Loading rule...</div>
        </div>
      </CardBody>
    );
  }

  if (isEdit && loadError) {
    return (
      <CardBody className="p-3 bg-white" style={isMobile ? { width: "100%" } : { width: "78%" }}>
        <Alert color="danger">
          {loadError}{" "}
          <Button color="link" size="sm" onClick={() => navigate("/sop-configs/manage")}>
            Back to list
          </Button>
        </Alert>
      </CardBody>
    );
  }

  return (
    <CardBody
      className="p-3 bg-white"
      style={isMobile ? { width: "100%" } : { width: "78%" }}
    >
      <div className="d-flex align-items-center justify-content-between mb-4 flex-wrap gap-2">
        <div>
          <h1 className="display-6 fw-bold text-primary mb-1">
            {isEdit ? "EDIT SOP RULE" : "CREATE SOP RULE"}
          </h1>
          <p className="text-muted mb-0">
            {isEdit
              ? <>Editing <strong>{initialValues?.ruleName || id}</strong> — saving creates a new version.</>
              : "Define a new compliance rule. Alerts will dispatch to the routes you configure."}
          </p>
        </div>
        <Button color="secondary" outline size="sm" onClick={() => navigate("/sop-configs/manage")}>
          <i className="bx bx-arrow-back me-1" /> Back to list
        </Button>
      </div>

      <div style={{ maxHeight: "80vh", overflowY: "auto", paddingRight: "4px", marginBottom: "20px" }}>
        <SOPForm
          onSubmit={handleFormSubmit}
          isSubmitting={isSubmitting}
          initialValues={initialValues}
          submitLabel={isEdit ? "Save Changes" : "Create SOP Rule"}
          submittingLabel={isEdit ? "Saving..." : "Creating..."}
        />
      </div>

      <ConfirmModal
        isOpen={modalOpen}
        title={isEdit ? "Save Changes" : "Create SOP Rule"}
        message={
          pendingPayload ? (
            <span>
              {isEdit ? "Save changes to" : "Create rule"}{" "}
              <strong>{pendingPayload.ruleName}</strong> with {pendingPayload.targetBlocks?.length} target block(s)?
            </span>
          ) : "Do you want to proceed?"
        }
        confirmLabel={isEdit ? "Save Changes" : "Yes, Create Rule"}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
        isLoading={isSubmitting}
      />
    </CardBody>
  );
};

export default SaveRule;
