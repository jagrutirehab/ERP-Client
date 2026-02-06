// import React, { useState, useEffect } from "react";
// import {
//   Modal,
//   ModalHeader,
//   ModalBody,
//   ModalFooter,
//   Button,
//   Input,
//   Label,
//   FormFeedback,
// } from "reactstrap";
// import { connect } from "react-redux";
// import PropTypes from "prop-types";

// const CentersModal = ({ isOpen, toggle, centers, onSave, proData }) => {
//   const [selectedCenters, setSelectedCenters] = useState([]);
//   const [costs, setCosts] = useState({});
//   const [error, setError] = useState("");

//   console.log("proData", proData);

//   const unitsToRender = proData?.center?.[0]?.prices || [];

//   useEffect(() => {
//     if (!isOpen) {
//       setSelectedCenters([]);
//       setCosts({});
//       setError("");
//     }
//   }, [isOpen]);

//   const handleCheckboxChange = (centerId) => {
//     setSelectedCenters((prev) =>
//       prev.includes(centerId)
//         ? prev.filter((id) => id !== centerId)
//         : [...prev, centerId],
//     );
//   };

//   const handleCostChange = (unit, value) => {
//     setCosts((prev) => ({
//       ...prev,
//       [unit]: value,
//     }));
//   };

//   const handleSave = async () => {
//     if (!selectedCenters.length) {
//       setError("Please select at least one center");
//       return;
//     }

//     // Validation: Ensure all dynamic cost fields are filled
//     const missingCosts = unitsToRender.some((u) => !costs[u.unit]);
//     if (missingCosts) {
//       setError("All cost fields are required");
//       return;
//     }

//     try {
//       // Prepare payload: { centerIds, nosCost: 100, stripsCost: 200 }
//       const payload = {
//         centerIds: selectedCenters,
//       };

//       // Add dynamic keys to payload
//       Object.keys(costs).forEach((unitKey) => {
//         payload[`${unitKey}Cost`] = Number(costs[unitKey]);
//       });

//       // Also include a fallback 'cost' for backward compatibility with the controller
//       if (unitsToRender.length > 0) {
//         payload.cost = Number(costs[unitsToRender[0].unit]);
//       }

//       await onSave(payload);
//       toggle();
//     } catch (err) {
//       console.log("Err", err);
//     }
//   };

//   return (
//     <Modal isOpen={isOpen} toggle={toggle} size="md" centered>
//       <ModalHeader toggle={toggle}>Add Centers</ModalHeader>

//       <ModalBody>
//         <Label className="fw-bold mb-2">Select Centers</Label>
//         <div 
//           className="d-flex flex-wrap gap-3 mb-4 p-2 border rounded" 
//           style={{ maxHeight: "150px", overflowY: "auto" }}
//         >
//           {(centers || []).map((cen) => (
//             <div key={cen._id} className="d-flex align-items-center">
//               <Input
//                 type="checkbox"
//                 id={`check-${cen._id}`}
//                 checked={selectedCenters.includes(cen._id)}
//                 onChange={() => handleCheckboxChange(cen._id)}
//               />
//               <Label for={`check-${cen._id}`} className="ms-2 mb-0" style={{ cursor: "pointer" }}>
//                 {cen.title}
//               </Label>
//             </div>
//           ))}
//         </div>

//         <hr />

//         <Label className="fw-bold mb-2">Cost Configuration</Label>
//         <div className="row">
//           {unitsToRender.length > 0 ? (
//             unitsToRender.map((u, index) => (
//               <div className="col-6 mb-3" key={index}>
//                 <Label className="text-capitalize">
//                   {u.unit} Cost <span className="text-danger">*</span>
//                 </Label>
//                 <Input
//                   type="number"
//                   value={costs[u.unit] || ""}
//                   onChange={(e) => handleCostChange(u.unit, e.target.value)}
//                   placeholder={`Enter ${u.unit} cost`}
//                 />
//               </div>
//             ))
//           ) : (
//             <div className="col-12 mb-3">
//               <Label>
//                 Base Cost <span className="text-danger">*</span>
//               </Label>
//               <Input
//                 type="number"
//                 value={costs["default"] || ""}
//                 onChange={(e) => handleCostChange("default", e.target.value)}
//                 placeholder="Enter cost"
//               />
//             </div>
//           )}
//         </div>

//         {error && <FormFeedback className="d-block mt-2">{error}</FormFeedback>}
//       </ModalBody>

//       <ModalFooter>
//         <Button color="secondary" outline onClick={toggle}>
//           Cancel
//         </Button>
//         <Button color="primary" onClick={handleSave}>
//           Add Selected Centers
//         </Button>
//       </ModalFooter>
//     </Modal>
//   );
// };

// CentersModal.propTypes = {
//   isOpen: PropTypes.bool.isRequired,
//   toggle: PropTypes.func.isRequired,
//   centers: PropTypes.array,
//   onSave: PropTypes.func.isRequired,
//   proData: PropTypes.object,
// };

// const mapStateToProps = (state) => ({
//   centers: state.Center.data,
// });

// export default connect(mapStateToProps)(CentersModal);

import React, { useState, useEffect } from "react";
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

const CentersModal = ({ isOpen, toggle, centers, onSave, proData }) => {
  const [selectedCenters, setSelectedCenters] = useState([]);
  const [costs, setCosts] = useState({});
  const [error, setError] = useState("");

  console.log("proData", proData);

  const unitsToRender = proData?.center?.[0]?.prices || [];

  useEffect(() => {
    if (!isOpen) {
      setSelectedCenters([]);
      setCosts({});
      setError("");
    }
  }, [isOpen]);

  const handleCheckboxChange = (centerId) => {
    setSelectedCenters((prev) =>
      prev.includes(centerId)
        ? prev.filter((id) => id !== centerId)
        : [...prev, centerId],
    );
  };

  const handleCostChange = (unit, value) => {
    setCosts((prev) => ({
      ...prev,
      [unit]: value,
    }));
  };

  const handleSave = async () => {
    if (!selectedCenters.length) {
      setError("Please select at least one center");
      return;
    }

    const missingCosts = unitsToRender.some((u) => !costs[u.unit]);
    if (unitsToRender.length > 0 && missingCosts) {
      setError("All cost fields are required");
      return;
    }

    try {
      const payload = {
        proId: proData?._id,
        centerIds: selectedCenters,
      };

      unitsToRender.forEach((u) => {
        const fieldName = `${u.unit}Cost`;
        payload[fieldName] = Number(costs[u.unit]);
      });

      if (unitsToRender.length === 0) {
        payload.cost = Number(costs["default"]);
      }

      console.log("payload", payload)

      await onSave(payload);
      toggle();
    } catch (err) {
      console.error("Err", err);
    }
  };

  return (
    <Modal isOpen={isOpen} toggle={toggle} size="md" centered>
      <ModalHeader toggle={toggle}>Add Centers</ModalHeader>

      <ModalBody>
        <Label className="fw-bold mb-2">Select Centers</Label>
        <div 
          className="d-flex flex-wrap gap-3 mb-4 p-2 border rounded" 
          style={{ maxHeight: "150px", overflowY: "auto" }}
        >
          {(centers || []).map((cen) => (
            <div key={cen._id} className="d-flex align-items-center">
              <Input
                type="checkbox"
                id={`check-${cen._id}`}
                checked={selectedCenters.includes(cen._id)}
                onChange={() => handleCheckboxChange(cen._id)}
              />
              <Label for={`check-${cen._id}`} className="ms-2 mb-0" style={{ cursor: "pointer" }}>
                {cen.title}
              </Label>
            </div>
          ))}
        </div>

        <hr />

        <Label className="fw-bold mb-2">Cost Configuration</Label>
        <div className="row">
          {unitsToRender.length > 0 ? (
            unitsToRender.map((u, index) => (
              <div className="col-6 mb-3" key={index}>
                <Label className="text-capitalize">
                  {u.unit} Cost <span className="text-danger">*</span>
                </Label>
                <Input
                  type="number"
                  value={costs[u.unit] || ""}
                  onChange={(e) => handleCostChange(u.unit, e.target.value)}
                  placeholder={`Enter ${u.unit} cost`}
                />
              </div>
            ))
          ) : (
            <div className="col-12 mb-3">
              <Label>
                Base Cost <span className="text-danger">*</span>
              </Label>
              <Input
                type="number"
                value={costs["default"] || ""}
                onChange={(e) => handleCostChange("default", e.target.value)}
                placeholder="Enter cost"
              />
            </div>
          )}
        </div>

        {error && <FormFeedback className="d-block mt-2">{error}</FormFeedback>}
      </ModalBody>

      <ModalFooter>
        <Button color="secondary" outline onClick={toggle}>
          Cancel
        </Button>
        <Button color="primary" onClick={handleSave}>
          Add Selected Centers
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
  proData: PropTypes.object,
};

const mapStateToProps = (state) => ({
  centers: state.Center.data,
});

export default connect(mapStateToProps)(CentersModal);