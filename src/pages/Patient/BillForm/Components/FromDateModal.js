import React from "react";

const FromDateModal = ({
    isOpen,
    onClose,
    fromDate,
    setFromDate,
    onSubmit,
}) => {
    if (!isOpen) return null;

    return (
        <div style={styles.overlay}>
            <div style={styles.modal}>
                <h3>Select From Date</h3>

                <input
                    type="date"
                    value={fromDate || ""}
                    onChange={(e) => setFromDate(e.target.value)}
                    style={styles.input}
                />

                <div style={styles.buttonContainer}>
                    <button onClick={onClose} style={styles.cancelBtn}>
                        Cancel
                    </button>

                    <button
                        onClick={onSubmit}
                        style={{
                            ...styles.submitBtn,
                            backgroundColor: !fromDate ? "#ccc" : "#007bff",
                            cursor: !fromDate ? "not-allowed" : "pointer",
                            opacity: !fromDate ? 0.7 : 1,
                        }}
                        disabled={!fromDate}
                    >
                        Submit
                    </button>
                </div>
            </div>
        </div>
    );
};

export default FromDateModal;

const styles = {
    overlay: {
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        backgroundColor: "rgba(0,0,0,0.5)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 1000,
    },
    modal: {
        background: "#fff",
        padding: "20px",
        borderRadius: "10px",
        width: "300px",
        textAlign: "center",
    },
    input: {
        width: "100%",
        padding: "8px",
        marginTop: "15px",
        marginBottom: "20px",
    },
    buttonContainer: {
        display: "flex",
        justifyContent: "space-between",
    },
    cancelBtn: {
        background: "#ccc",
        border: "none",
        padding: "8px 15px",
        cursor: "pointer",
    },
    submitBtn: {
        background: "#007bff",
        color: "#fff",
        border: "none",
        padding: "8px 15px",
        cursor: "pointer",
    },
};