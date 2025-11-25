import { useState } from "react";
import HAMDAssesment from "./HAMDAssesment";
import ResultView from "./HAMDResult";

const HAMDQuestion = () => {
  const [view, setView] = useState("psychologist");
  const [currentAssessment, setCurrentAssessment] = useState(null);

  const handleAssessmentComplete = (newAssessment) => {
    setCurrentAssessment(newAssessment);
    setView("results");
  };

  const handleBackToForm = () => {
    setView("psychologist");
    setCurrentAssessment(null);
  };

  return (
    <div className="d-flex align-items-center justify-content-center min-vh-100 text-dark px-3">
        <div className="bg-white shadow-xl rounded-2xl w-100">
        <div className="text-center mb-4">
          <h1 className="text-primary fw-bold display-6 display-md-5">
            <i className="fas fa-stethoscope me-2"></i>
            Hamilton Depression Rating Scale (HAM-D) Assessment
          </h1>
        </div>

        {view === "psychologist" && (
          <HAMDAssesment onAssessmentComplete={handleAssessmentComplete} />
        )}

        {view === "results" && currentAssessment && (
          <ResultView
            assessment={currentAssessment}
            onBack={handleBackToForm}
          />
        )}
      </div>
    </div>
  );
};

export default HAMDQuestion;
