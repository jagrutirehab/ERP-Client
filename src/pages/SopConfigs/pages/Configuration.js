import React, { useState } from "react";
import { CardBody, Alert } from "reactstrap";
import { useMediaQuery } from "../../../Components/Hooks/useMediaQuery";
import SOPForm from "../components/SOPForm";
import ConfirmModal from "../components/ConfirmModal";

const Configuration = () => {
  const isMobile = useMediaQuery("(max-width: 1000px)");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [recentRules, setRecentRules] = useState([]);

  const [pendingPayload, setPendingPayload] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  const handleFormSubmit = (payload) => {
    setPendingPayload(payload);
    setModalOpen(true);
  };

  const handleConfirm = async () => {
    if (!pendingPayload) return;
    setIsSubmitting(true);

    try {
      console.log("payload:", pendingPayload);
      await new Promise((resolve) => setTimeout(resolve, 3000));

      const created = [{ ...pendingPayload, _id: `mock_${Date.now()}` }];
      setRecentRules((prev) => [...created, ...prev].slice(0, 10));

      setModalOpen(false);
      setPendingPayload(null);
      return true;
    } catch (err) {
      const apiMsg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        "Failed to create SOP";
      throw new Error(apiMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (isSubmitting) return;
    setModalOpen(false);
    setPendingPayload(null);
  };

  return (
    <CardBody
      className="p-3 bg-white"
      style={isMobile ? { width: "100%" } : { width: "78%" }}
    >
      <div className="text-center text-md-left mb-4">
        <h1 className="display-6 fw-bold text-primary">SOP CONFIGURATIONS</h1>
        <p className="text-muted mb-0">
          Create compliance rules — when violated, alerts dispatch to the configured roles & emails.
        </p>
      </div>



      <div style={{ maxHeight: "80vh", overflowY: "auto", paddingRight: "4px", marginBottom: "20px", }}>
        <SOPForm onSubmit={handleFormSubmit} isSubmitting={isSubmitting} />
      </div>

      <ConfirmModal
        isOpen={modalOpen}
        title="Create SOP Rule"
        message={
          pendingPayload ? (
            <span>
              You're about to create rule <strong>{pendingPayload.ruleName}</strong>.
              This will be activated immediately if enabled. Confirm?
            </span>
          ) : "Do you want to proceed?"
        }
        confirmLabel="Yes, Create Rule"
        onConfirm={handleConfirm}
        onCancel={handleCancel}
        isLoading={isSubmitting}
      />
    </CardBody>
  );
};

export default Configuration;