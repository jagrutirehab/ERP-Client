import React, { useState, useEffect } from "react";
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  Label,
  Alert,
  Spinner,
} from "reactstrap";
import StarRating from "./StarRating";

const DIMENSIONS = [
  { key: "cleanliness", label: "Cleanliness" },
  { key: "safety", label: "Safety" },
];

const emptyAssessment = {
  cleanliness: { rating: 0, comment: "" },
  safety: { rating: 0, comment: "" },
};

const ReviewPhotoModal = ({
  isOpen,
  toggle,
  actionType,
  fileName,
  onConfirm,
  loading,
}) => {
  const [remarks, setRemarks] = useState("");
  const [assessment, setAssessment] = useState(emptyAssessment);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen) {
      setRemarks("");
      setAssessment(emptyAssessment);
      setError("");
    }
  }, [isOpen]);

  const isReject = actionType === "rejected";

  const updateDimension = (key, field, value) => {
    setAssessment((prev) => ({
      ...prev,
      [key]: { ...prev[key], [field]: value },
    }));
  };

  const handleSubmit = () => {
    setError("");

    if (isReject) {
      if (!remarks.trim()) {
        setError("Please provide a reason for rejection");
        return;
      }
      onConfirm({ remarks: remarks.trim() });
      return;
    }

    const unrated = DIMENSIONS.filter(
      (dimension) => !assessment[dimension.key]?.rating,
    );

    if (unrated.length) {
      setError(
        `Please give a star rating for ${unrated
          .map((dimension) => dimension.label.toLowerCase())
          .join(" and ")}`,
      );
      return;
    }

    onConfirm({
      assessment: DIMENSIONS.reduce(
        (acc, dimension) => ({
          ...acc,
          [dimension.key]: {
            rating: assessment[dimension.key].rating,
            comment: (assessment[dimension.key].comment || "").trim(),
          },
        }),
        {},
      ),
    });
  };

  return (
    <Modal isOpen={isOpen} toggle={toggle} centered>
      <ModalHeader toggle={toggle}>
        {isReject ? "Reject Photo" : "Approve Photo"}
      </ModalHeader>
      <ModalBody>
        {error && <Alert color="danger">{error}</Alert>}

        <p className="mb-3">
          {isReject ? "Reject" : "Approve"}{" "}
          <strong>{fileName || "this photo"}</strong>?
        </p>

        {isReject ? (
          <>
            <Label htmlFor="review-remarks">
              Remarks <span className="text-danger">*</span>
            </Label>
            <Input
              id="review-remarks"
              type="textarea"
              rows={3}
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="Explain why this photo is being rejected..."
            />
          </>
        ) : (
          DIMENSIONS.map((dimension, index) => (
            <div
              key={dimension.key}
              className={index < DIMENSIONS.length - 1 ? "mb-4" : ""}
            >
              <Label className="mb-1">
                {dimension.label} <span className="text-danger">*</span>
              </Label>
              <div className="mb-2">
                <StarRating
                  value={assessment[dimension.key]?.rating || 0}
                  onChange={(rating) =>
                    updateDimension(dimension.key, "rating", rating)
                  }
                  disabled={loading}
                />
              </div>
              <Input
                type="textarea"
                rows={2}
                value={assessment[dimension.key]?.comment || ""}
                onChange={(e) =>
                  updateDimension(dimension.key, "comment", e.target.value)
                }
                placeholder={`${dimension.label} comment (optional)`}
              />
            </div>
          ))
        )}
      </ModalBody>
      <ModalFooter>
        <Button color="secondary" outline onClick={toggle} disabled={loading}>
          Cancel
        </Button>
        <Button
          color={isReject ? "danger" : "success"}
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <>
              <Spinner size="sm" className="me-1" /> Processing...
            </>
          ) : isReject ? (
            "Reject"
          ) : (
            "Approve"
          )}
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default ReviewPhotoModal;
