// pages/Configuration.js
import React, { useState } from "react";
import { CardBody } from "reactstrap";
import { useMediaQuery } from "../../../Components/Hooks/useMediaQuery";
import SOPForm from "../components/SOPForm";
import ConfirmModal from "../components/ConfirmModal";
import { sopConfigure } from "../../../helpers/backend_helper";
import { toast } from "react-toastify";

const Configuration = () => {
  const isMobile = useMediaQuery("(max-width: 1000px)");
  const [isSubmitting, setIsSubmitting] = useState(false);
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
      console.log("SOP Payload Executed:\n", JSON.stringify(pendingPayload, null, 2));
      const response = await sopConfigure(pendingPayload);
      console.log("response", response);
      toast.success("Posted.")
      setModalOpen(false);
      setPendingPayload(null);
      return true;
    } catch (err) {
      console.log("error", err);
      toast.error(err.response?.data?.message || "Error");
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
          Create compliance rules across multiple target models — alerts dispatch to the configured roles & users.
        </p>
      </div>

      <div style={{ maxHeight: "80vh", overflowY: "auto", paddingRight: "4px", marginBottom: "20px" }}>
        <SOPForm onSubmit={handleFormSubmit} isSubmitting={isSubmitting} />
      </div>

      <ConfirmModal
        isOpen={modalOpen}
        title="Create SOP Rule"
        message={
          pendingPayload ? (
            <span>
              You're about to create rule <strong>{pendingPayload.ruleName}</strong> with {pendingPayload.targetBlocks?.length} target block(s). Confirm?
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