import React, { useState } from "react";
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  Label,
  FormFeedback,
} from "reactstrap";
import { connect } from "react-redux";
import PropTypes from "prop-types";

const CentersModal = ({ isOpen, toggle, centers, onSave }) => {
  const [selectedCenters, setSelectedCenters] = useState([]);
  const [cost, setCost] = useState("");
  const [error, setError] = useState("");

  const handleCheckboxChange = (centerId) => {
    setSelectedCenters((prev) =>
      prev.includes(centerId)
        ? prev.filter((id) => id !== centerId)
        : [...prev, centerId],
    );
  };

  const handleSave = async () => {
    if (!selectedCenters.length) {
      setError("Please select at least one center");
      return;
    }
    if (!cost) {
      setError("Cost is required");
      return;
    }

    try {
      await onSave({
        centerIds: selectedCenters,
        cost: Number(cost),
      });

      setSelectedCenters([]);
      setCost("");
      setError("");
      toggle();
    } catch (err) {
        console.log("Err", err);
    }
  };

  return (
    <Modal isOpen={isOpen} toggle={toggle} size="md" centered>
      <ModalHeader toggle={toggle}>Add Centers</ModalHeader>

      <ModalBody>
        <Label className="fw-bold mb-2">Centers</Label>
        <div className="d-flex flex-wrap gap-3 mb-3">
          {(centers || []).map((cen) => (
            <div key={cen._id}>
              <Input
                type="checkbox"
                checked={selectedCenters.includes(cen._id)}
                onChange={() => handleCheckboxChange(cen._id)}
              />
              <Label className="ms-1">{cen.title}</Label>
            </div>
          ))}
        </div>

        <Label>
          Cost <span className="text-danger">*</span>
        </Label>
        <Input
          type="number"
          value={cost}
          onChange={(e) => setCost(e.target.value)}
          placeholder="Enter cost"
        />

        {error && <FormFeedback className="d-block mt-2">{error}</FormFeedback>}
      </ModalBody>

      <ModalFooter>
        <Button color="secondary" outline onClick={toggle}>
          Cancel
        </Button>
        <Button color="primary" onClick={handleSave}>
          Save
        </Button>
      </ModalFooter>
    </Modal>
  );
};

CentersModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  toggle: PropTypes.func.isRequired,
  centers: PropTypes.array,
  onSave: PropTypes.func.isRequired,
};

const mapStateToProps = (state) => ({
  centers: state.Center.data,
});

export default connect(mapStateToProps)(CentersModal);
