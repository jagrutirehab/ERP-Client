import { useRef, useState, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
} from "reactstrap";
import { createMMSETest } from "../../../../store/features/clinicalTest/clinicalTestSlice";
import {
  setIsClinicalTab,
  setTestName,
  setTestPageOpen,
} from "../../../../store/features/clinicalTest/clinicalTestSlice";
import { fetchDoctors } from "../../../../store/actions";
import { mmseQuestions } from "./QuestionData/MMSEQuestions";

const calculateScores = (answers) => {
  const sections = {
    orientation: { max: 10, current: 0 },
    registration: { max: 3, current: 0 },
    attention: { max: 5, current: 0 },
    recall: { max: 3, current: 0 },
    language: { max: 8, current: 0 },
    drawing: { max: 1, current: 0 },
  };

  // Calculate scores for each section
  mmseQuestions.forEach((question) => {
    const section = question.section;
    const answer = answers[question.id];
    if (answer && section in sections) {
      if (section === "attention" && question.id === "q3_world_total_score") {
        sections.attention.current = Math.max(
          sections.attention.current,
          parseInt(answer) || 0
        );
      } else if (answer === "Correct") {
        sections[section].current += 1;
      }
    }
  });

  // Special handling for Attention: take max of Serial 7s and WORLD backwards
  let serial7sScore = 0;
  for (let i = 1; i <= 5; i++) {
    if (answers[`q3_s7_${i}_score`] === "Correct") {
      serial7sScore += 1;
    }
  }
  const worldBackwardsScore = answers.q3_world_total_score
    ? parseInt(answers.q3_world_total_score)
    : 0;
  sections.attention.current = Math.max(serial7sScore, worldBackwardsScore);

  // Ensure scores don't exceed max
  Object.keys(sections).forEach((section) => {
    sections[section].current = Math.min(
      sections[section].current,
      sections[section].max
    );
  });

  // Calculate total score
  const totalScore = Object.values(sections).reduce(
    (sum, section) => sum + section.current,
    0
  );

  return { ...sections, totalScore };
};

const getInterpretationAndRecommendations = (totalScore) => {
  let interpretationText = "";
  let recommendationsText = "";

  if (totalScore >= 25 && totalScore <= 30) {
    interpretationText =
      "The patient's MMSE score suggests normal cognitive function. There are no significant signs of cognitive impairment based on this screening tool.";
    recommendationsText =
      "Continue routine follow-up as per standard medical guidelines. No specific cognitive interventions are indicated at this time based on MMSE results alone. Consider further assessment if clinical concerns persist despite the normal MMSE score.";
  } else if (totalScore >= 20 && totalScore <= 24) {
    interpretationText =
      "The patient's MMSE score indicates mild cognitive impairment. This suggests some decline in cognitive abilities, which may affect daily activities.";
    recommendationsText =
      "Further comprehensive neuropsychological evaluation is recommended to identify specific areas of impairment and potential underlying causes. Consider lifestyle modifications, cognitive stimulation activities, and regular monitoring. Discuss findings with the patient and family, and explore potential medical or neurological consultations if appropriate.";
  } else if (totalScore >= 10 && totalScore <= 19) {
    interpretationText =
      "The patient's MMSE score suggests moderate cognitive impairment. This level of impairment is likely to significantly impact daily functioning and independence.";
    recommendationsText =
      "Urgent and thorough medical and neuropsychological evaluation is strongly recommended to determine the etiology of cognitive decline. Consider interventions such as cognitive rehabilitation, environmental modifications for safety, and support for caregivers. A multidisciplinary approach involving neurology, geriatrics, and social services may be beneficial. Discuss long-term care planning with the patient and family.";
  } else if (totalScore >= 0 && totalScore <= 9) {
    interpretationText =
      "The patient's MMSE score indicates severe cognitive impairment. This suggests a profound decline in cognitive function, likely leading to significant dependence in most daily activities.";
    recommendationsText =
      "Immediate and comprehensive medical and neurological assessment is crucial to identify the cause and manage symptoms. Focus on ensuring patient safety, comfort, and dignity. Provide extensive support for caregivers. Consider palliative care options and discuss advanced care planning. A multidisciplinary team approach is essential for managing complex needs.";
  } else {
    interpretationText =
      "Invalid MMSE score. Please ensure the score is between 0 and 30.";
    recommendationsText =
      "Review the test administration and scoring. Ensure all sections are correctly evaluated.";
  }

  return { interpretationText, recommendationsText };
};

const MMSEAssessment = () => {
  const dispatch = useDispatch();
  const fileInputRef = useRef(null);

  const [answers, setAnswers] = useState({});
  const [language, setLanguage] = useState("en");
  const [observations, setObservations] = useState("");
  const [imagePreviews, setImagePreviews] = useState([]);
  const [modalMessage, setModalMessage] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [psychologistDropdown, setPsychologistDropdown] = useState(false);
  const [selectedPsychologist, setSelectedPsychologist] = useState({
    name: "Choose Psychologist",
    id: -1,
  });

  const patient = useSelector((state) => state.Patient.patient);
  const psychologistDetails = useSelector((state) => state.User.doctor);
  const centerId = patient?.center?._id;

  useEffect(() => {
    if (centerId) {
      dispatch(fetchDoctors({ center: centerId }));
    }
  }, [centerId, dispatch]);

  // Memoize scores to avoid recalculating on every render
  const scores = useMemo(() => calculateScores(answers), [answers]);

  const togglePsychologistDropdown = () =>
    setPsychologistDropdown(!psychologistDropdown);
  const toggleLanguageDropdown = () => setDropdownOpen(!dropdownOpen);

  const openModal = (message) => {
    setModalMessage(message);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    const unAnswered = mmseQuestions.filter((q) => !answers[q.id]);
    if (selectedPsychologist.id === -1 || unAnswered.length > 0) {
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

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    const previews = [];
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        previews.push(reader.result);
        if (previews.length === files.length) {
          setImagePreviews(previews);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!selectedPsychologist.id || selectedPsychologist.id === -1) {
      return openModal("Please choose a psychologist first");
    }

    const unanswered = mmseQuestions.filter((q) => !answers[q.id]);
    if (unanswered.length > 0) {
      return openModal("Please answer all the questions");
    }

    const { interpretationText, recommendationsText } =
      getInterpretationAndRecommendations(scores.totalScore);

    const formData = new FormData();
    formData.append("patientId", patient._id || patient.id);
    formData.append("doctorId", selectedPsychologist.id);
    formData.append("patientName", patient.name || "Unknown Patient");
    formData.append("psychologistName", selectedPsychologist.name);
    formData.append(
      "scores",
      JSON.stringify({
        orientation: scores.orientation.current,
        registration: scores.registration.current,
        attention: scores.attention.current,
        recall: scores.recall.current,
        language: scores.language.current,
        drawing: scores.drawing.current,
        total: scores.totalScore,
      })
    );
    formData.append("answers", JSON.stringify(answers));
    formData.append("observation", observations);
    formData.append("interpretation", interpretationText);
    formData.append("recommendation", recommendationsText);
    formData.append("centerId", centerId);
    const files = fileInputRef.current?.files;
    if (files?.length > 0) {
      Array.from(files).forEach((file) => formData.append("files", file));
    }

    dispatch(createMMSETest(formData));
    openModal(
      "Test submitted! The results are now available on the next page."
    );
  };

  // Map section names to schema keys
  const sectionKeyMap = {
    Orientation: "orientation",
    Registration: "registration",
    "Attention and Calculation": "attention",
    Recall: "recall",
    Language: "language",
    Drawing: "drawing",
  };

  // Define sections with display names and max scores
  const sections = [
    { name: "Orientation", maxScore: 10 },
    { name: "Registration", maxScore: 3 },
    { name: "Attention and Calculation", maxScore: 5 },
    { name: "Recall", maxScore: 3 },
    { name: "Language", maxScore: 8 },
    { name: "Drawing", maxScore: 1 },
  ];

  // Group questions by section for rendering
  const groupedQuestions = sections.map((section) => ({
    ...section,
    questions: mmseQuestions.filter(
      (q) => q.section === sectionKeyMap[section.name]
    ),
  }));

  return (
    <div className="p-2 p-sm-3">
      {/* Patient + Psychologist Selection */}
      <div className="mb-4 d-flex align-items-center justify-content-between p-3 border border-primary rounded text-primary small bg-light">
        <div>
          <div className="fw-semibold">
            Patient ID: {patient?.id?.prefix + patient?.id?.value}
          </div>
          <div className="fw-semibold text-capitalize">
            Patient Name: {patient?.name}
          </div>
        </div>
        <div className="d-flex gap-2">
          <Dropdown
            size="sm"
            isOpen={psychologistDropdown}
            toggle={togglePsychologistDropdown}
          >
            <DropdownToggle caret outline color="primary">
              {selectedPsychologist.name}
            </DropdownToggle>
            <DropdownMenu>
              {(psychologistDetails || []).map((psych) => (
                <DropdownItem
                  key={psych._id}
                  onClick={() =>
                    setSelectedPsychologist({ name: psych.name, id: psych._id })
                  }
                >
                  {psych.name}
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

      {/* Instructions */}
      <div className="mb-5 p-4 bg-light border border-primary rounded shadow-sm">
        <h2 className="h5 fw-semibold text-primary mb-3">
          <i className="fas fa-lightbulb me-2 text-primary"></i>
          Psychologist Instructions
        </h2>
        <ul className="ps-3 text-secondary small fs-6">
          <li className="mb-2 text-black">
            <strong>Purpose:</strong> The Mini-Mental State Examination (MMSE)
            is a screening tool to assess cognitive function, including
            orientation, memory, attention, language, and visuospatial skills.
          </li>
          <li className="mb-2 text-black">
            <strong>Administration:</strong> Read each question clearly and
            follow the provided guidance. Ensure the patient understands before
            responding. Do not provide hints unless specified.
          </li>
          <li className="mb-2 text-black">
            <strong>Response Entry:</strong> Select 'Correct' or 'Incorrect'
            based on the patient's response, except for the 'WORLD backwards'
            question, which is scored 0-5. Scores are calculated automatically.
          </li>
          <li className="mb-2 text-black">
            <strong>Observations:</strong> Use the 'Observations' field to note
            patient behavior, mood, cooperation, or other relevant non-verbal
            cues.
          </li>
          <li className="mb-2 text-black">
            <strong>Evidence/Image:</strong> Upload images (e.g., patient’s
            drawing or writing samples) as evidence. Multiple images are
            supported and will be stored securely.
          </li>
        </ul>
      </div>

      {/* Questions by Section */}
      {groupedQuestions.map((section, idx) => (
        <div key={section.name} className="mb-5">
          <h2 className="h5 fw-semibold text-primary mb-3">
            {idx + 1}. {section.name} (Score:{" "}
            {scores[sectionKeyMap[section.name]]?.current || 0}/
            {section.maxScore})
          </h2>
          {section.questions.map((q, qIdx) => (
            <div
              key={q.id}
              className="mb-4 p-4 bg-white border rounded shadow-sm"
            >
              <h3 className="h6 fw-semibold text-dark mb-2">
                {idx + 1}.{qIdx + 1}. {q.question[language]}
              </h3>
              <p className="text-primary small mb-3 fst-italic">
                <i className="fas fa-info-circle me-1"></i>
                {q.guidance[language]}
              </p>
              <p className="text-success small mb-3">
                <i className="fas fa-check-circle me-1"></i>
                Correct Answer: {q.correctAnswer[language]}
              </p>

              {/* Conditionally render SVG for question with id "q6_drawing_score" */}
              {q.id === "q6_drawing_score" && (
                <div className="mb-3 text-center">
                  <svg
                    className="pentagon-svg"
                    viewBox="0 0 100 70"
                    aria-label="Two intersecting pentagons forming a four-sided figure in their intersection."
                    width="200"
                    height="140"
                  >
                    <title>Intersecting Pentagons for MMSE</title>
                    {/* First Pentagon */}
                    <polygon
                      points="25,10 45,10 55,30 40,50 10,30"
                      fill="none"
                      stroke="black"
                      strokeWidth="2"
                    />
                    {/* Second Pentagon */}
                    <polygon
                      points="55,20 75,20 85,40 70,60 40,40"
                      fill="none"
                      stroke="black"
                      strokeWidth="2"
                    />
                  </svg>
                </div>
              )}

              <div className="d-flex flex-wrap gap-2">
                {q.options.map((opt) => (
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
        </div>
      ))}

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
          multiple
          ref={fileInputRef}
          onChange={handleFileChange}
        />
        {imagePreviews.length > 0 && (
          <div className="mt-3 d-flex flex-wrap gap-2">
            {imagePreviews.map((preview, index) => (
              <img
                key={index}
                src={preview}
                alt={`Evidence ${index + 1}`}
                className="img-thumbnail"
                style={{ maxWidth: "150px" }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Submit Button */}
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

export default MMSEAssessment;
