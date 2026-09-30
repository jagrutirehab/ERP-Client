import AUDITAssessment from "./AUDITAssessment";

const AUDITQuestion = () => {
  return (
    <div className="d-flex align-items-center justify-content-center min-vh-100 text-dark px-3">
      <div className="bg-white shadow-xl rounded-2xl w-100">
        <div className="text-center mb-4">
          <h1 className="text-primary fw-bold display-6 display-md-5">
            <i className="fas fa-stethoscope me-2"></i>
            Alcohol Use Disorders Identification Test (AUDIT)
          </h1>
        </div>
        <AUDITAssessment />
      </div>
    </div>
  );
};

export default AUDITQuestion;
