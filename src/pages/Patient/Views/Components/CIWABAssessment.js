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
  createCIWABTest,
  setIsClinicalTab,
  setTestName,
  setTestPageOpen,
} from "../../../../store/features/clinicalTest/clinicalTestSlice";
import {
  calculateScores,
  ciwaBQuestions,
  getInterpretationAndRecommendations,
} from "./QuestionData/CIWABQuestions";
import { useAuthError } from "../../../../Components/Hooks/useAuthError";

// CIWA-B form. Same flow as COWSAssessment: choose the doctor and language,
// answer all 20 items, add observations / evidence, submit.
const CIWABAssessment = () => {
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

  const unansweredItems = () =>
    ciwaBQuestions.filter((q) => answers[q.id] === undefined);

  const openModal = (message) => {
    setModalMessage(message);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    if (selectedDoctor.id === -1 || unansweredItems().length > 0) {
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

    if (unansweredItems().length > 0) {
      return openModal("Please answer all 20 items");
    }

    const { partA, partB, total } = calculateScores(answers);
    const { severity, interpretation, recommendations } =
      getInterpretationAndRecommendations(total);

    const formattedQuestions = ciwaBQuestions.map((q) => ({
      questionId: q.id,
      question: q.question[language],
      answer: answers[q.id],
      score: q.score?.[answers[q.id]] ?? 0,
    }));

    const formData = new FormData();
    formData.append("patientId", patient._id || patient.id);
    formData.append("doctorId", selectedDoctor.id);
    formData.append("observation", observations);
    formData.append("systemPartAScore", partA);
    formData.append("systemPartBScore", partB);
    formData.append("systemTotalScore", total);
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
      await dispatch(createCIWABTest(formData)).unwrap();
      openModal(
        "Test submitted! The results are now available on the next page.",
      );
    } catch (error) {
      if (!handleAuthError(error)) {
        toast.error(error.message || "Failed to submit assessment");
      }
    }
  };

  const { partA, partB, total } = calculateScores(answers);

  const renderItem = (q) => (
    <div key={q.id} className="mb-4 p-4 bg-white border rounded shadow-sm">
      <h3 className="h6 fw-semibold text-dark mb-2">
        {q.id}. {q.question[language]}
      </h3>
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
              name={`ciwab-q${q.id}`}
              value={opt}
              checked={answers[q.id] === opt}
              onChange={() => setAnswers({ ...answers, [q.id]: opt })}
              className="form-check-input me-2"
            />
            <span className="fs-6">{opt}</span>
          </label>
        ))}
      </div>
    </div>
  );

  return (
    <div className="p-2 p-sm-3">
      {/* Patient Info + Doctor/Language Dropdowns */}
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

      {/* Clinician Instructions */}
      <div className="mb-5 p-4 bg-light border border-primary rounded shadow-sm">
        <h2 className="h5 fw-semibold text-primary mb-3">
          <i className="fas fa-lightbulb me-2 text-primary"></i>
          Clinician Instructions
        </h2>
        <ul className="ps-3 text-secondary small fs-6">
          <li className="mb-2 text-black">
            <strong>Purpose:</strong> The CIWA-B measures benzodiazepine
            withdrawal severity across 20 items, each scored 0–4 (maximum 80).
          </li>
          <li className="mb-2 text-black">
            <strong>Part A (items 1–17):</strong> ask the patient how they feel{" "}
            <strong>right now</strong>. 0 = Not at all, 1 = Slightly, 2 =
            Moderately, 3 = Quite a bit, 4 = Very much so.
          </li>
          <li className="mb-2 text-black">
            <strong>Part B (items 18–20):</strong> score what you observe.
          </li>
          <li className="mb-2 text-black">
            <strong>Interpretation:</strong> 1–20 = Mild; 21–40 = Moderate;
            41–60 = Severe; 61–80 = Very severe.
          </li>
          <li className="mb-2 text-black">
            <strong>Seizures can occur at any score.</strong> Risk is higher
            with high-dose use, abrupt stopping, short-acting agents (alprazolam,
            lorazepam), prior seizures, or alcohol co-use.
          </li>
          <li className="mb-2 text-black">
            <strong>Consistency:</strong> score at the same time each day and
            record vitals alongside the score.
          </li>
          <li className="mb-2 text-black">
            <strong>Differential:</strong> rule out alcohol or opioid
            withdrawal, primary anxiety disorder, thyrotoxicosis and infection.
          </li>
        </ul>
      </div>

      {/* Part A */}
      <h2 className="h5 fw-semibold text-primary mb-3">
        Part A – Patient-rated items (1–17)
      </h2>
      {ciwaBQuestions.filter((q) => q.part === "A").map(renderItem)}

      {/* Part B */}
      <h2 className="h5 fw-semibold text-primary mb-3 mt-4">
        Part B – Clinician-observed items (18–20)
      </h2>
      {ciwaBQuestions.filter((q) => q.part === "B").map(renderItem)}

      {/* Running score */}
      <div className="mb-4 p-3 bg-light border border-primary rounded d-flex flex-wrap gap-4 fw-semibold text-primary">
        <span>Part A: {partA} / 68</span>
        <span>Part B: {partB} / 12</span>
        <span>Total CIWA-B: {total} / 80</span>
      </div>

      {/* Observations */}
      <div className="mb-4 p-4 bg-white border rounded shadow-sm">
        <h3 className="h6 fw-semibold text-dark mb-2">
          <i className="fas fa-sticky-note me-2 text-primary"></i>
          Observations / Action taken
        </h3>
        <textarea
          className="form-control"
          rows="3"
          value={observations}
          onChange={(e) => setObservations(e.target.value)}
        />
      </div>

      {/* Image Upload */}
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
            const file = e.target.files?.[0];
            if (!file) return setImageUrl("");
            const reader = new FileReader();
            reader.onloadend = () => setImageUrl(reader.result);
            reader.readAsDataURL(file);
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

      {/* Submit */}
      <div className="d-flex justify-content-end">
        <button
          className="btn btn-success fw-bold px-4 py-2 shadow-sm"
          onClick={handleSubmit}
        >
          <i className="fas fa-check-circle me-2"></i> Submit Assessment
        </button>
      </div>

      {/* Modal */}
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

export default CIWABAssessment;
