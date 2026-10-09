import React, { useCallback, useEffect, useState } from "react";
import { CardBody, Spinner, FormGroup, Input, Label, Button } from "reactstrap";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import {
  acknowledgeTraining,
  getMyTrainingProgress,
  getOwnSignedCopy,
  getTrainingById,
  markOverviewRead,
} from "../../../helpers/backend_helper";
import { toast } from "react-toastify";
import { usePermissions } from "../../../Components/Hooks/useRoles";
import ConfirmModal from "../Components/ConfirmModal";
import TrainingFileViewer from "../Components/Learn/TrainingFileViewer";
import StructuredTraining from "../Components/Learn/StructuredTraining";
import LegacyStepper from "../Components/Learn/LegacyStepper";
import DeclarationReadStep from "../Components/Learn/DeclarationReadStep";
import SignedCopyViewer from "../Components/Declaration/SignedCopyViewer";
import { getErrorMessage } from "../Helpers/learnHelpers";

const TrainingDetail = () => {
  const { id } = useParams();
  const { state } = useLocation();
  const navigate = useNavigate();
  const token = JSON.parse(localStorage.getItem("micrologin"))?.token;
  const { hasPermission } = usePermissions(token);
  const activeTab = state?.activeTab || "pending";
  const canEdit =
    state?.canEdit ??
    (hasPermission("TRAININGS", "VIEW_TRAININGS", "WRITE") ||
      hasPermission("TRAININGS", "VIEW_TRAININGS", "DELETE"));

  const [training, setTraining] = useState(null);
  const [myProgress, setMyProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [checked, setChecked] = useState(false);
  const [confirmModal, setConfirmModal] = useState(false);
  const [ackLoading, setAckLoading] = useState(false);
  const [markLoading, setMarkLoading] = useState(false);
  const [fileLoading, setFileLoading] = useState(true);

  const file = training?.files?.[0];
  const questionCount =
    training?.questionCount ?? training?.questionary?.length ?? 0;
  const hasQuestionary = questionCount > 0;

  useEffect(() => {
    const load = async () => {
      try {
        const response = await getTrainingById(id);
        const data = response?.data;
        setTraining(data);
        if (!data?.files || data.files.length === 0) {
          setFileLoading(false);
        }

        if (!(data?.lessons?.length > 0)) {
          try {
            const mine = await getMyTrainingProgress(id);
            setMyProgress(mine?.data || null);
          } catch {
            setMyProgress(null);
          }
        }
      } catch {
        toast.error("Failed to load training");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const acknowledged = activeTab === "acknowledged" || !!myProgress?.acknowledged;
  const overviewDone = acknowledged || !!myProgress?.overviewReadAt;
  const [viewingCopy, setViewingCopy] = useState(false);
  const loadOwnCopy = useCallback(() => getOwnSignedCopy(id), [id]);
  const quizPassed = acknowledged || !!myProgress?.quiz?.passed;
  const declarationRequired = !!myProgress?.declaration?.required;
  const declarationDone = acknowledged || myProgress?.declaration?.state === "completed";

  const steps = [
    { key: "overview", label: "Overview", done: overviewDone },
    ...(hasQuestionary ? [{ key: "quiz", label: "Quiz", done: quizPassed }] : []),
    ...(declarationRequired ? [{ key: "declaration", label: "Declaration", done: declarationDone }] : []),
    { key: "acknowledged", label: "Acknowledgement", done: acknowledged },
  ];

  let currentKey = "acknowledged";
  if (acknowledged) currentKey = null;
  else if (!overviewDone) currentKey = "overview";
  else if (hasQuestionary && !quizPassed) currentKey = "quiz";
  else if (declarationRequired && !declarationDone) currentKey = "declaration";

  const goToQuiz = () => {
    navigate(`/trainings/questionary/${id}`, {
      state: {
        trainingName: training.trainingName,
        requiresDeclaration: !!training?.declaration?.required,
        activeTab,
        canEdit,
      },
    });
  };

  const handleMarkRead = async () => {
    try {
      setMarkLoading(true);
      const response = await markOverviewRead(id);
      setMyProgress((previous) => ({
        ...(previous || {}),
        overviewReadAt: response?.data?.overviewReadAt || new Date().toISOString(),
      }));
      if (hasQuestionary) goToQuiz();
    } catch (error) {
      toast.error(getErrorMessage(error, "Could not mark the overview as read"));
    } finally {
      setMarkLoading(false);
    }
  };

  const handleAcknowledge = async () => {
    try {
      setAckLoading(true);
      await acknowledgeTraining(id);
      toast.success("Acknowledged successfully");
      navigate(-1);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to acknowledge");
    } finally {
      setAckLoading(false);
      setConfirmModal(false);
    }
  };

  if (loading) {
    return (
      <CardBody
        className="p-3 bg-white d-flex flex-column justify-content-center align-items-center text-center text-muted"
        style={{ minHeight: "60vh" }}
      >
        <Spinner color="primary" />
      </CardBody>
    );
  }

  const header = (
    <div className="d-flex align-items-center gap-3 mb-4">
      <button
        className="btn btn-outline-secondary btn-sm"
        onClick={() => navigate(-1)}
      >
        <i className="ri-arrow-left-line" />
      </button>
      <h5 className="fw-bold mb-0">{training?.trainingName}</h5>
    </div>
  );

  if (training?.lessons?.length > 0) {
    return (
      <CardBody className="p-3 bg-white">
        {header}
        <StructuredTraining
          training={training}
          canAcknowledge={!!canEdit}
          activeTab={activeTab}
          onAcknowledged={() => navigate(-1)}
        />
      </CardBody>
    );
  }

  const renderAction = () => {
    if (!canEdit || fileLoading) return null;

    if (currentKey === "overview") {
      return (
        <div className="p-3 border rounded">
          <p className="mb-3 small text-muted">
            Read the training above. When you are done, continue to the next
            step.
          </p>
          <Button color="primary" disabled={markLoading} onClick={handleMarkRead}>
            {markLoading ? <Spinner size="sm" /> : "Mark as read and continue"}
          </Button>
        </div>
      );
    }

    if (currentKey === "declaration") {
      return (
        <DeclarationReadStep
          trainingId={id}
          onRead={async () => {
            try {
              const mine = await getMyTrainingProgress(id);
              setMyProgress(mine?.data || null);
            } catch {
              setMyProgress((previous) => ({
                ...(previous || {}),
                declaration: { ...(previous?.declaration || {}), state: "completed" },
              }));
            }
          }}
        />
      );
    }

    if (currentKey === "quiz") {
      return (
        <div className="p-3 border rounded">
          <p className="mb-3 small text-muted">
            You have read the overview. Next, take the quiz. You need 80% to
            pass and can retry as many times as you need.
          </p>
          <Button color="primary" onClick={goToQuiz}>
            Take the quiz
          </Button>
        </div>
      );
    }

    return (
      <div className="p-3 border rounded">
        <FormGroup check className="mb-3">
          <Input
            type="checkbox"
            checked={checked}
            onChange={(e) => setChecked(e.target.checked)}
          />
          <Label check className="small">
            I acknowledge that I have read, understood, and will adhere to the
            instructions and policies described in this manual.
          </Label>
        </FormGroup>
        <Button
          color="primary"
          disabled={!checked}
          onClick={() => setConfirmModal(true)}
        >
          I Acknowledge
        </Button>
      </div>
    );
  };

  return (
    <CardBody className="p-3 bg-white">
      {header}

      <LegacyStepper steps={steps} currentKey={currentKey} />

      {training?.description && (
        <p className="text-muted mb-4" style={{ whiteSpace: "pre-wrap" }}>
          {training.description}
        </p>
      )}

      <TrainingFileViewer file={file} onLoaded={() => setFileLoading(false)} />

      {acknowledged ? (
        <div className="d-flex align-items-center gap-2 text-success p-3 border rounded">
          <i className="ri-checkbox-circle-fill fs-5" />
          <span className="small fw-semibold">
            You have acknowledged this training
          </span>
          {training?.declaration?.required && (
            <button
              type="button"
              className="btn btn-outline-success btn-sm ms-auto"
              onClick={() => setViewingCopy(true)}
            >
              View my signed declaration
            </button>
          )}
        </div>
      ) : (
        renderAction()
      )}

      <SignedCopyViewer
        isOpen={viewingCopy}
        onClose={() => setViewingCopy(false)}
        title="My signed declaration"
        loader={loadOwnCopy}
      />

      <ConfirmModal
        isOpen={confirmModal}
        onConfirm={handleAcknowledge}
        onCancel={() => setConfirmModal(false)}
        loading={ackLoading}
      />
    </CardBody>
  );
};

export default TrainingDetail;
