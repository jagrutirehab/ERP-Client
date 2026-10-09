import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { Spinner } from "reactstrap";
import { toast } from "react-toastify";
import {
  acknowledgeTraining,
  getTrainingById,
} from "../../../helpers/backend_helper";
import QuizRunner from "./Learn/QuizRunner";

const QuestionaryTest = () => {
  const { id } = useParams();
  const { state } = useLocation();
  const navigate = useNavigate();

  const [trainingName, setTrainingName] = useState(
    state?.trainingName || "Training",
  );
  const [requiresDeclaration, setRequiresDeclaration] = useState(!!state?.requiresDeclaration);
  const [ackLoading, setAckLoading] = useState(false);

  useEffect(() => {
    if (state?.trainingName && state?.requiresDeclaration !== undefined) return;
    const loadName = async () => {
      try {
        const response = await getTrainingById(id);
        setTrainingName(response?.data?.trainingName || "Training");
        setRequiresDeclaration(!!response?.data?.declaration?.required);
      } catch {
        setTrainingName("Training");
      }
    };
    loadName();
  }, [id]);

  const handleAcknowledge = async () => {
    try {
      setAckLoading(true);
      await acknowledgeTraining(id);
      toast.success("Acknowledged successfully");
      navigate(-2);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to acknowledge");
    } finally {
      setAckLoading(false);
    }
  };

  return (
    <QuizRunner
      trainingId={id}
      scope="final"
      title={trainingName}
      onBack={() => navigate(-1)}
      renderPassActions={() =>
        requiresDeclaration ? (
          <button
            className="btn btn-success btn-sm d-flex align-items-center gap-2 px-4"
            onClick={() => navigate(-1)}
          >
            Continue to Declaration
          </button>
        ) : (
        <button
          className="btn btn-success btn-sm d-flex align-items-center gap-2 px-4"
          onClick={handleAcknowledge}
          disabled={ackLoading}
        >
          {ackLoading ? (
            <Spinner size="sm" color="light" />
          ) : (
            <>
              <i className="ri-check-line" />
              Acknowledge
            </>
          )}
        </button>
        )
      }
    />
  );
};

export default QuestionaryTest;
