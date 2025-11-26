import { useRef, useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
} from "reactstrap";
import {
  calculateScore,
  cssrsQuestions,
  generateInterpretation,
} from "./QuestionData/SsrsQuestions";
import { createSsrsTest } from "../../../../store/features/clinicalTest/clinicalTestSlice";
import {
  setIsClinicalTab,
  setTestName,
  setTestPageOpen,
} from "../../../../store/features/clinicalTest/clinicalTestSlice";
import { fetchDoctors } from "../../../../store/actions";

const PsychologistAssessment = ({ onAssessmentComplete }) => {
  const dispatch = useDispatch();
  const fileInputRef = useRef(null);
  const [modalMessage, setModalMessage] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [answers, setAnswers] = useState({});
  const [evidence, setEvidence] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [observations, setObservations] = useState("");
  const [language, setLanguage] = useState("en");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [dummyDrop, setDummyDrop] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState({
    name: "Choose Doctor",
    id: -1,
  });

  const patient = useSelector((state) => state.Patient.patient);
  const doctorDetails = useSelector((state) => state.User?.doctor) || [];
  const counselerDetails = useSelector((state) => state.User?.counsellors) || [];

  const allMedicalStaff = [...doctorDetails, ...counselerDetails];
  const centerId = useSelector((state) => state.Patient.patient?.center?._id);

  useEffect(() => {
    dispatch(fetchDoctors({ center: centerId }));
  }, [centerId, dispatch]);

  const toggle2 = () => setDropdownOpen(!dropdownOpen);
  const toggle3 = () => setDummyDrop(!dummyDrop);

  const openModal = (message, data) => {
    setModalMessage(message, data);
    setIsModalOpen(true);
  };

  // Function to close the custom modal
  const closeModal = () => {
    const unAnsweredQuestions = cssrsQuestions.filter((q) => !answers[q.id]);
    if (selectedDoctor.id === -1 || unAnsweredQuestions.length > 0) {
      setIsModalOpen(false);
      setModalMessage("");
      return;
    }
    setIsModalOpen(false);
    dispatch(setIsClinicalTab(true));
    setModalMessage("");
    dispatch(setTestName(""));
    dispatch(setTestPageOpen(false));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (
      selectedDoctor.id === null ||
      selectedDoctor.id === -1 ||
      selectedDoctor.id === "-1"
    ) {
      // alert("Please select a doctor name ");
      openModal("Please choose a doctor first", -1);
      return;
    }

    const unansweredQuestions = cssrsQuestions.filter((q) => !answers[q.id]);

    if (unansweredQuestions.length > 0) {
      openModal("Please answer all the questions", -1);
      return;
    }

    const score = calculateScore(answers);
    const { interpretationText, recommendationsText } = generateInterpretation({
      patientName: patient.name,
      score,
    });

    const formattedQuestions = cssrsQuestions.map((q) => ({
      questionId: q.id,
      question: q.question[language],
      answer: answers[q.id],
      score: q.score ? q.score[answers[q.id]] || 0 : 0,
    }));

    const formData = new FormData();
    formData.append("patientId", patient._id || patient.id);
    formData.append("doctorId", selectedDoctor.id);
    formData.append("observation", observations);
    formData.append("systemTotalScore", score.totalScore);
    formData.append("systemIdeationScore", score.ideationScore);
    formData.append("systemBehaviorScore", score.behaviorScore);
    formData.append("systemRiskLevel", score.riskLevel);
    formData.append("systemInterpretation", interpretationText);
    formData.append("systemRecommendation", recommendationsText);
    formData.append("questions", JSON.stringify(formattedQuestions));
    formData.append("centerId", centerId);

    const imageFiles = fileInputRef.current?.files;
    if (imageFiles && imageFiles.length > 0) {
      for (let i = 0; i < imageFiles.length; i++) {
        formData.append("files", imageFiles[i]);
      }
    }
    openModal(
      "Test submitted! The results are now available on the next page."
    );

    dispatch(createSsrsTest(formData));
  };

  return (
    <div className="p-2 p-sm-3">
      {/* {showError && (
        <div className="alert alert-danger">
          Please complete all fields and questions.
        </div>
      )} */}

      {/* Patient Info & Dropdowns */}
      <div className="mb-4 d-flex align-items-center justify-content-between p-3 border border-primary rounded text-primary small bg-light">
        <div className="d-flex flex-column">
          <span className="fw-semibold">
            Patient ID: {patient?.id?.prefix + patient?.id?.value}
          </span>
          <span className="fw-semibold text-capitalize">
            Patient Name: {patient?.name}
          </span>
        </div>
        <div className="d-flex gap-2 flex-wrap justify-content-end">
          <Dropdown size="sm" isOpen={dummyDrop} toggle={toggle3}>
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

          <Dropdown size="sm" isOpen={dropdownOpen} toggle={toggle2}>
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

      {/* Instructions */}
      <div className="mb-5 p-4 bg-light border border-primary rounded shadow-sm">
        <h2 className="h5 h4-sm fw-semibold text-primary mb-3">
          <i className="fas fa-lightbulb me-2 text-primary fs-1 "></i>
          Psychologist Instructions
        </h2>
        <ul className="ps-3 text-secondary small fs-6">
          <li className="mb-2 text-black">
            Ensure a safe and private setting.
          </li>
          <li className="mb-2 text-black">
            Read each question clearly and accurately.
          </li>
          <li className="mb-2 text-black">
            Observe behavior closely and score objectively.
          </li>
          <li className="mb-2 text-black">
            Use this tool in combination with clinical judgment.
          </li>
        </ul>
      </div>

      {/* Questions */}
      {cssrsQuestions.map((q, idx) => (
        <div key={q.id} className="mb-4 p-4 bg-white border rounded shadow-sm">
          <h3 className="h6 fw-semibold text-dark mb-2">
            {idx + 1}. {q.question[language]}
          </h3>
          <p className="text-primary small mb-3 fst-italic">
            <i className="fas fa-info-circle me-1"></i>
            {q.guidance[language]}
          </p>
          <div className="d-flex flex-wrap gap-2">
            {q.type === "binary" &&
              ["yes", "no"].map((opt) => (
                <label
                  key={opt}
                  className={`d-flex align-items-center p-2 rounded cursor-pointer transition ${
                    answers[q.id] === opt
                      ? "bg-primary text-white shadow"
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

            {q.type === "text" && (
              <textarea
                className="form-control"
                value={answers[q.id] || ""}
                onChange={(e) =>
                  setAnswers({ ...answers, [q.id]: e.target.value })
                }
              ></textarea>
            )}
          </div>
        </div>
      ))}

      {/* Evidence */}
      {/* <div className="mb-4 p-4 bg-white border rounded shadow-sm">
        <h3 className="h6 fw-semibold text-dark mb-2">
          <i className="fas fa-edit me-2 text-primary"></i>
          Evidence
        </h3>
        <textarea
          className="form-control"
          rows="3"
          value={evidence}
          onChange={(e) => setEvidence(e.target.value)}
        />
      </div> */}

      {/* Observations */}
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

      {/* Image Upload */}
      <div className="mb-4 p-4 bg-white border rounded shadow-sm">
        <h3 className="h6 fw-semibold text-dark mb-2">
          <i className="fas fa-camera me-2 text-primary"></i>
          Additional Evidence / Image Upload (optional)
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

      {/* Submit */}
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
            <h3 className="h5 fw-semibold text-dark mb-3">
              {selectedDoctor.id === -1 ? "" : "Notification"}
            </h3>
            <p className="text-secondary mb-4">{modalMessage}</p>
            <button
              onClick={closeModal}
              className="btn btn-primary fw-bold w-100 shadow-sm"
              style={{ transition: "all 0.3s ease-in-out" }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PsychologistAssessment;
