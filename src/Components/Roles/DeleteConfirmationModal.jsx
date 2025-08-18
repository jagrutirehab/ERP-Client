import { X } from "lucide-react";

const DeleteConfirmationModal = ({ isOpen, onClose, onConfirm, roleName }) => {
  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 10000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        backdropFilter: "blur(5px)", // Blurry background
        padding: "20px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "400px",
          backgroundColor: "#fff",
          borderRadius: "12px",
          padding: "24px",
          position: "relative",
          boxShadow: "0 5px 15px rgba(0, 0, 0, 0.3)",
        }}
      >
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: "16px",
            right: "16px",
            border: "none",
            background: "none",
            cursor: "pointer",
            color: "#555",
          }}
          aria-label="Close"
        >
          <X size={20} />
        </button>

        <h2
          style={{
            fontSize: "20px",
            fontWeight: "600",
            color: "#333",
            marginBottom: "16px",
          }}
        >
          Confirm Deletion
        </h2>
        <p
          style={{
            fontSize: "14px",
            color: "#555",
            marginBottom: "24px",
          }}
        >
          Are you sure you want to delete the role <strong>{roleName}</strong>? This action cannot be undone.
        </p>

        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: "12px",
          }}
        >
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: "10px 16px",
              backgroundColor: "#f5f5f5",
              border: "1px solid #ccc",
              borderRadius: "6px",
              cursor: "pointer",
              color: "#333",
            }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            style={{
              padding: "10px 16px",
              backgroundColor: "#dc3545",
              color: "white",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
            }}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmationModal;