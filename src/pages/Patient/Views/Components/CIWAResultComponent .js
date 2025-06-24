import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

const CIWAResultComponent = ({ resultData }) => {
  const {
    systemTotalScore,
    systemInterpretation,
    systemRecommendation,
    observation
    // answers, // [{ question: '', selectedOption: '' }]
  } = resultData;


  return (
    <div className="">
      <div className=" p-4 bg-light border border-primary rounded shadow-lg">
        <h2 className="h5 h4-sm fw-semibold text-primary mb-3">
          <i className="fas fa-chart-line me-2 text-primary"></i>
          CIWA-AR Test Results shown
        </h2>

        <div className="mb-3">
          <p className="h6 fw-semibold text-indigo">
            Total CIWA-AR Score: <span className="display-6 fw-bold">{systemTotalScore ? systemTotalScore : 0}</span> / 67
          </p>
        </div>

        <p className="text-dark fs-6 lh-lg mb-4">
          <span className="fw-bold text-primary">Interpretation:</span> {systemInterpretation ? systemInterpretation : "No Interpretation"}
        </p>

        <p className="text-dark fs-6 lh-lg mb-4">
          <span className="fw-bold text-success">Recommendation:</span> {systemRecommendation ? systemRecommendation : "No Recommendation"}
        </p>

        {/* Observations */}
        <div className="mt-3 border border-secondary rounded p-3 bg-white">
          <p className="fw-semibold text-secondary mb-2">Psychologist's Observations:</p>
          <p className="text-dark" style={{ whiteSpace: 'pre-wrap' }}>
            {observation ? observation : "No observations recorded."}
          </p>
        </div>

        {/* Image Preview */}
        {/* {imagePreview && (
            <div className="mt-3 border border-secondary rounded p-3">
              <p className="fw-semibold text-secondary mb-2">Submitted Evidence Image:</p>
              <img
                src={imagePreview}
                alt="Submitted Evidence Preview"
                className="img-fluid rounded shadow-sm"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "https://placehold.co/300x200/cccccc/ffffff?text=Image+Load+Error";
                }}
              />
            </div>
          )} */}

        <div className='d-flex justify-content-between align-items-center' >

        </div>
      </div>
    </div>
  );
};

export default CIWAResultComponent;
