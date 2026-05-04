import { useRef, useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { fetchDoctors } from "../../../../store/actions";
import {
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
} from "reactstrap";
import {
  createGCSTest,
  setIsClinicalTab,
  setTestName,
  setTestPageOpen,
} from "../../../../store/features/clinicalTest/clinicalTestSlice";
import {
  calculateScores,
  getInterpretationAndRecommendations,
  gcsQuestions,
} from "./QuestionData/Gcsquestions";
import { useAuthError } from "../../../../Components/Hooks/useAuthError";

const GCSAssessment = () => {
  const dispatch = useDispatch();
  const handleAuthError = useAuthError();
  const fileInputRef = useRef(null);

  const [answers, setAnswers] = useState({});
  const [language, setLanguage] = useState("en");
  const [observations, setObservations] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [modalMessage, setModalMessage] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [doctorDropdown, setDoctorDropdown] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState({
    name: "Choose Doctor",
    id: -1,
  });

  const patient = useSelector((state) => state.Patient.patient);
  const doctorDetails = useSelector((state) => state.User?.doctor) || [];
  const counselerDetails =
    useSelector((state) => state.User?.counsellors) || [];

  const allMedicalStaff = [...doctorDetails, ...counselerDetails];
  const centerId = patient?.center?._id;

  useEffect(() => {
    if (centerId) {
      dispatch(fetchDoctors({ center: centerId }));
    }
  }, [centerId, dispatch]);

  const toggleDoctorDropdown = () => setDoctorDropdown(!doctorDropdown);
  const toggleLanguageDropdown = () => setDropdownOpen(!dropdownOpen);

  const openModal = (message) => {
    setModalMessage(message);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    const unanswered = gcsQuestions.filter(
      (q) => q.type !== "optional" && !answers[q.id]
    );
    if (selectedDoctor.id === -1 || unanswered.length > 0) {
      setIsModalOpen(false);
      setModalMessage("");
      return;
    }
    setIsModalOpen(false);
    dispatch(setIsClinicalTab(true));
    dispatch(setTestName(""));
    dispatch(setTestPageOpen(false));
    setModalMessage("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedDoctor.id || selectedDoctor.id === -1) {
      return openModal("Please choose a doctor first");
    }

    const unanswered = gcsQuestions.filter(
      (q) => q.type !== "optional" && !answers[q.id]
    );
    if (unanswered.length > 0) {
      return openModal("Please answer all the questions");
    }

    const { totalScore, eyeScore, verbalScore, motorScore } =
      calculateScores(answers);
    const { severity, interpretation, recommendations } =
      getInterpretationAndRecommendations(totalScore);

    const formattedQuestions = gcsQuestions
      .filter((q) => answers[q.id] !== undefined)
      .map((q) => ({
        questionId: q.id,
        question: q.question[language],
        answer: answers[q.id],
        score: q.score?.[answers[q.id]] ?? 0,
      }));

    const formData = new FormData();
    formData.append("patientId", patient._id || patient.id);
    formData.append("doctorId", selectedDoctor.id);
    formData.append("observation", observations);
    formData.append("systemTotalScore", totalScore);
    formData.append("eyeScore", eyeScore);
    formData.append("verbalScore", verbalScore);
    formData.append("motorScore", motorScore);
    formData.append("systemSeverity", severity);
    formData.append("systemInterpretation", interpretation);
    formData.append("systemRecommendation", recommendations);
    formData.append("questions", JSON.stringify(formattedQuestions));
    formData.append("centerId", centerId);

    const files = fileInputRef.current?.files;
    if (files?.length > 0) {
      Array.from(files).forEach((file) => formData.append("files", file));
    }

    try {
      await dispatch(createGCSTest(formData)).unwrap();
      openModal(
        "Test submitted! The results are now available on the next page."
      );
    } catch (error) {
      if (!handleAuthError(error)) {
        toast.error(error.message || "Failed to submit assessment");
      }
    }
  };

  const { totalScore, eyeScore, verbalScore, motorScore } =
    calculateScores(answers);

  return (
    <div className="p-2 p-sm-3">
      <div className="mb-4 d-flex align-items-center justify-content-between p-3 border border-primary rounded text-primary small bg-light">
        <div>
          <div className="fw-semibold">
            Patient ID: {patient?.id?.prefix + patient?.id?.value}
          </div>
          <div className="fw-semibold text-capitalize">
            Patient Name: {patient?.name}
          </div>
        </div>
        <div className="d-flex gap-2 flex-wrap justify-content-end">
          <Dropdown
            size="sm"
            isOpen={doctorDropdown}
            toggle={toggleDoctorDropdown}
          >
            <DropdownToggle caret outline color="primary">
              {selectedDoctor.name}
            </DropdownToggle>
            <DropdownMenu>
              {(allMedicalStaff || []).map((doc) => (
                <DropdownItem
                  key={doc._id}
                  onClick={() =>
                    setSelectedDoctor({ name: doc.name, id: doc._id })
                  }
                >
                  {doc.name}
                </DropdownItem>
              ))}
            </DropdownMenu>
          </Dropdown>

          <Dropdown
            size="sm"
            isOpen={dropdownOpen}
            toggle={toggleLanguageDropdown}
          >
            <DropdownToggle caret outline color="primary">
              {language === "en" ? "English" : "Hindi"}
            </DropdownToggle>
            <DropdownMenu>
              <DropdownItem onClick={() => setLanguage("en")}>
                English
              </DropdownItem>
              <DropdownItem onClick={() => setLanguage("hi")}>
                Hindi
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
        </div>
      </div>

      <div className="mb-5 p-4 bg-light border border-primary rounded shadow-sm">
        <h2 className="h5 fw-semibold text-primary mb-3">
          <i className="fas fa-lightbulb me-2 text-primary"></i>
          Clinician Instructions
        </h2>
        <ul className="ps-3 text-secondary small fs-6">
          <li className="mb-2 text-black">
            <strong>Purpose:</strong> The Glasgow Coma Scale assesses the level
            of consciousness using three independent components: Eye Opening
            (E), Verbal Response (V), and Motor Response (M).
          </li>
          <li className="mb-2 text-black">
            <strong>Total Score:</strong> GCS = E + V + M. Range is 3 (deepest
            coma) to 15 (fully conscious).
          </li>
          <li className="mb-2 text-black">
            <strong>Best Response:</strong> Always record the best response
            observed for Motor. Do not average responses from both sides.
          </li>
          <li className="mb-2 text-black">
            <strong>Pain Stimulus:</strong> Apply only after ruling out higher
            responses. Use a central stimulus (trapezius squeeze or sternal rub)
            for Motor assessment.
          </li>
          <li className="mb-2 text-black">
            <strong>Intubated Patients:</strong> If the patient cannot produce a
            verbal response due to intubation, note this and select the closest
            applicable response based on clinical context.
          </li>
        </ul>
      </div>

      {Object.values(answers).some(Boolean) && (
        <div className="mb-4 p-3 bg-primary bg-opacity-10 border border-primary rounded">
          <p className="fw-semibold text-primary mb-1">Live Score Preview</p>
          <div className="d-flex gap-4 flex-wrap">
            <span>
              <strong>E:</strong> {eyeScore}
            </span>
            <span>
              <strong>V:</strong> {verbalScore}
            </span>
            <span>
              <strong>M:</strong> {motorScore}
            </span>
            <span>
              <strong>Total GCS:</strong> {totalScore} / 15
            </span>
          </div>
        </div>
      )}

      {gcsQuestions.map((q, idx) => (
        <div key={q.id} className="mb-4 p-4 bg-white border rounded shadow-sm">
          <h3 className="h6 fw-semibold text-dark mb-1">
            {idx + 1}. {q.question[language]}{" "}
            {q.type === "optional" && (
              <span className="text-secondary fst-italic">(Optional)</span>
            )}
          </h3>
          <p className="text-muted small mb-2 fw-medium">{q.component}</p>
          <p className="text-primary small mb-3 fst-italic">
            <i className="fas fa-info-circle me-1"></i>
            {q.guidance[language]}
          </p>
          <div className="d-flex flex-wrap gap-2">
            {Object.keys(q.score).map((opt) => (
              <label
                key={opt}
                className={`d-flex align-items-center p-2 rounded cursor-pointer ${
                  answers[q.id] === opt
                    ? "bg-primary text-white"
                    : "bg-light text-dark border"
                }`}
              >
                <input
                  type="radio"
                  name={`q${q.id}`}
                  value={opt}
                  checked={answers[q.id] === opt}
                  onChange={() => setAnswers({ ...answers, [q.id]: opt })}
                  className="form-check-input me-2"
                />
                <span className="fs-6 text-capitalize">{opt}</span>
              </label>
            ))}
          </div>
        </div>
      ))}

      <div className="mb-4 p-4 bg-white border rounded shadow-sm">
        <h3 className="h6 fw-semibold text-dark mb-2">
          <i className="fas fa-sticky-note me-2 text-primary"></i>
          Observations
        </h3>
        <textarea
          className="form-control"
          rows="3"
          value={observations}
          onChange={(e) => setObservations(e.target.value)}
        />
      </div>

      <div className="mb-4 p-4 bg-white border rounded shadow-sm">
        <h3 className="h6 fw-semibold text-dark mb-2">
          <i className="fas fa-camera me-2 text-primary"></i>
          Evidence / Image Upload (optional)
        </h3>
        <input
          type="file"
          className="form-control"
          accept="image/*"
          ref={fileInputRef}
          onChange={(e) => {
            const reader = new FileReader();
            reader.onloadend = () => setImageUrl(reader.result);
            reader.readAsDataURL(e.target.files[0]);
          }}
        />
        {imageUrl && (
          <img
            src={imageUrl}
            alt="Evidence"
            className="img-thumbnail mt-3"
            style={{ maxWidth: "250px" }}
          />
        )}
      </div>

      <div className="d-flex justify-content-end">
        <button
          className="btn btn-success fw-bold px-4 py-2 shadow-sm"
          onClick={handleSubmit}
        >
          <i className="fas fa-check-circle me-2"></i> Submit Assessment
        </button>
      </div>

      {isModalOpen && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center bg-dark bg-opacity-75"
          style={{ zIndex: 1050 }}
        >
          <div
            className="bg-white rounded shadow p-4 p-sm-5 m-3 border border-secondary"
            style={{ maxWidth: "400px", width: "100%" }}
          >
            <h3 className="h5 fw-semibold text-dark mb-3">Notification</h3>
            <p className="text-secondary mb-4">{modalMessage}</p>
            <button
              onClick={closeModal}
              className="btn btn-primary fw-bold w-100 shadow-sm"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default GCSAssessment;