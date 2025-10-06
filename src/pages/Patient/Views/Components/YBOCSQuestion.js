import { useState } from "react";
import YBSOCSAssesment from "./YBSOCSAssesment";
import ResultView from "./YBOCSResult";

const YBOCSQuestion = () => {
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
          <h1 className="text-primary fw-bold display-5">
            <i className="fas fa-stethoscope me-2"></i>
            The Yale-Brown Obsessive-Compulsive Scale (Y-BOCS)
          </h1>
        </div>

        {view === "psychologist" && (
          <YBSOCSAssesment onAssessmentComplete={handleAssessmentComplete} />
        )}

        {view === "results" && currentAssessment && (
          <ResultView
            assessment={currentAssessment}
            onBack={handleBackToForm}
          />
        )}
      </div>
    </div>
  )
}

export default YBOCSQuestion