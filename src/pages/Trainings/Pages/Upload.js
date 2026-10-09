import React, { useEffect, useReducer, useState } from "react";
import { CardBody, Spinner } from "reactstrap";
import {
  createTrainings,
  getPositions,
} from "../../../helpers/backend_helper";
import { toast } from "react-toastify";
import { useMediaQuery } from "../../../Components/Hooks/useMediaQuery";
import { usePermissions } from "../../../Components/Hooks/useRoles";
import { enqueueTrainingUploads } from "../../../helpers/trainingUploader";
import Questionary from "../Components/Questionary";
import PositionsSelector from "../Components/UploadTraining/PositionsSelector";
import OuterFileInput from "../Components/UploadTraining/OuterFileInput";
import DeclarationFileInput from "../Components/UploadTraining/DeclarationFileInput";
import LessonsSection from "../Components/UploadTraining/LessonsSection";
import { flattenPositions } from "../Helpers/Helper";
import {
  MIN_FINAL_EXAM_QUESTIONS,
  buildTrainingFormData,
  collectUploads,
  countSelectedFiles,
  emptyTraining,
  isTrainingValid,
  trainingReducer,
} from "../Helpers/uploadTrainingForm";

const Upload = () => {
  const [training, dispatch] = useReducer(trainingReducer, emptyTraining());
  const [allPositions, setAllPositions] = useState([]);
  const [positionsLoading, setPositionsLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const isMobile = useMediaQuery("(max-width: 1000px)");
  const token = JSON.parse(localStorage.getItem("micrologin"))?.token;
  const { hasPermission } = usePermissions(token);
  const hasWritePermission = hasPermission(
    "TRAININGS",
    "UPLOAD_TRAININGS",
    "WRITE",
  );
  const hasDeletePermission = hasPermission(
    "TRAININGS",
    "UPLOAD_TRAININGS",
    "DELETE",
  );
  const canEdit = hasWritePermission || hasDeletePermission;

  const loadPositions = async () => {
    try {
      const response = await getPositions();
      setAllPositions(flattenPositions(response?.data));
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to load positions");
    } finally {
      setPositionsLoading(false);
    }
  };

  useEffect(() => {
    loadPositions();
  }, []);

  const setField = (field, value) =>
    dispatch({ type: "SET_FIELD", field, value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitted(true);

    if (!isTrainingValid(training)) {
      toast.error("Please fix the highlighted fields before submitting.");
      return;
    }

    try {
      setLoading(true);
      const response = await createTrainings(buildTrainingFormData(training));
      const uploads = collectUploads(training, response?.data?.[0]);
      enqueueTrainingUploads(uploads);

      if (uploads.length > 0) {
        toast.success(
          `Training created. Uploading ${uploads.length} file${uploads.length !== 1 ? "s" : ""} in the background.`,
        );
      } else {
        toast.success(response?.message || "Training created successfully!!");
      }
      if (uploads.length < countSelectedFiles(training)) {
        toast.warning(
          "Some files could not be matched to their chapters. Add them again from the training.",
        );
      }
      dispatch({ type: "RESET" });
      setIsSubmitted(false);
    } catch (error) {
      toast.error("Error: " + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <CardBody
      className="p-3 bg-white"
      style={isMobile ? { width: "100%" } : { width: "78%" }}
    >
      <div className="text-center text-md-left mb-4">
        <h1 className="display-6 fw-bold text-primary">UPLOAD TRAINING</h1>
      </div>

      <form
        onSubmit={handleSubmit}
        noValidate
        style={{ maxHeight: "80vh", overflowY: "auto", overflowX: "hidden" }}
      >
        <div className="mb-4 p-3 border rounded">
          <div className="mb-3">
            <label className="form-label">Training Name</label>
            <input
              type="text"
              className="form-control"
              value={training.trainingName}
              onChange={(e) => setField("trainingName", e.target.value)}
            />
            {isSubmitted && training.trainingName.trim() === "" && (
              <small className="text-danger d-block mt-2">
                Training Name is required
              </small>
            )}
          </div>

          <div className="mb-3">
            <label className="form-label">Description</label>
            <textarea
              className="form-control"
              rows={3}
              value={training.description}
              onChange={(e) => setField("description", e.target.value)}
            />
          </div>

          <PositionsSelector
            allPositions={allPositions}
            selectedPositions={training.positions}
            onToggle={(position) => dispatch({ type: "TOGGLE_POSITION", position })}
            onChange={(positions) => dispatch({ type: "SET_POSITIONS", positions })}
            isSubmitted={isSubmitted}
            loading={positionsLoading}
          />

          <LessonsSection
            lessons={training.lessons}
            isSubmitted={isSubmitted}
            dispatch={dispatch}
          />

          <div className="mb-3">
            <label className="form-label">Repeat Frequency (days)</label>
            <input
              type="text"
              className="form-control"
              value={training.repeatFrequency}
              onChange={(e) => {
                const val = e.target.value;
                if (/^\d*$/.test(val) && (val === "" || parseInt(val) >= 1)) {
                  setField("repeatFrequency", val);
                }
              }}
            />
          </div>

          <OuterFileInput
            file={training.file}
            onChange={(file) => dispatch({ type: "SET_FILE", file })}
            isSubmitted={isSubmitted}
          />

          <DeclarationFileInput
            file={training.declaration}
            placements={training.declarationPlacements}
            onChange={({ file, placements }) => {
              setField("declaration", file);
              setField("declarationPlacements", placements);
            }}
          />

          <div className="mb-3">
            <Questionary
              title={
                training.lessons.length > 0 ? "Final Exam" : "Questionnaire"
              }
              optional
              minQuestions={MIN_FINAL_EXAM_QUESTIONS}
              questionary={training.questionary}
              onChange={(questionary) =>
                dispatch({ type: "SET_QUESTIONARY", questionary })
              }
              isSubmitted={isSubmitted}
            />
          </div>
        </div>

        {canEdit && (
          <div className="d-flex gap-2 mb-4">
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading || (!!training.declaration && !training.declarationPlacements)}
            >
              {loading ? <Spinner size="sm" /> : "Submit"}
            </button>
          </div>
        )}
      </form>
    </CardBody>
  );
};

export default Upload;
