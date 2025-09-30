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
import {
  calculateScores,
  getInterpretationAndRecommendations,
  mmseQuestions,
} from "./QuestionData/MMSEQuestions";
import jsPDF from "jspdf";
import "svg2pdf.js";

const MMSEAssessment = () => {
  const dispatch = useDispatch();
  const fileInputRef = useRef(null);
  const svgRef = useRef(null);
  const readingTextRef = useRef(null);
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
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [pdfDataUrl, setPdfDataUrl] = useState("");
  const [pdfType, setPdfType] = useState("");
  const [isSvgReady, setIsSvgReady] = useState(false);
  const [isTextReady, setIsTextReady] = useState(false);

  const patient = useSelector((state) => state.Patient.patient);
  const psychologistDetails = useSelector((state) => state.User?.doctor) || [];
  const counselerDetails =
    useSelector((state) => state.User?.counsellors) || [];

  const allMedicalStaff = [...psychologistDetails, ...counselerDetails];
  const centerId = patient?.center?._id;

  useEffect(() => {
    if (centerId) {
      dispatch(fetchDoctors({ center: centerId }));
    }
  }, [centerId, dispatch]);

  // Ensure elements are rendered before capturing
  useEffect(() => {
    if (svgRef.current) {
      setTimeout(() => setIsSvgReady(true), 500); // Delay to ensure SVG is rendered
    }
    if (readingTextRef.current) {
      setTimeout(() => setIsTextReady(true), 500); // Delay to ensure text is rendered
    }
  }, []);

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

  const generateSVGPdf = async () => {
    if (!svgRef.current || !isSvgReady) {
      openModal("Drawing element is not ready. Please try again.");
      return null;
    }

    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("MMSE Assessment - Drawing Task", 20, 20);
    try {
      const svgElement = svgRef.current;
      await doc.svg(svgElement, {
        x: 20,
        y: 30,
        width: 100,
        height: 70,
      });
    } catch (error) {
      openModal("Failed to render drawing in PDF. Please try again.");
      console.error("svg2pdf.js error:", error);
      return null;
    }
    doc.setFontSize(10);
    doc.text(`Patient Name: ${patient?.name || "Unknown Patient"}`, 20, 110);
    doc.text(
      `Patient ID: ${patient?.id?.prefix + patient?.id?.value || "N/A"}`,
      20,
      120
    );
    doc.text(`Psychologist: ${selectedPsychologist.name}`, 20, 130);
    return doc;
  };

  const generateReadingPdf = async () => {
    if (!readingTextRef.current || !isTextReady) {
      openModal("Reading text element is not ready. Please try again.");
      return null;
    }

    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("MMSE Assessment - Reading Task", 20, 20);
    doc.setFontSize(14);
    doc.text("CLOSE YOUR EYES", 20, 30);
    doc.setFontSize(10);
    doc.text("Instruction: Patient should read and obey the command.", 20, 40);
    doc.setFontSize(10);
    doc.text(`Patient Name: ${patient?.name || "Unknown Patient"}`, 20, 60);
    doc.text(
      `Patient ID: ${patient?.id?.prefix + patient?.id?.value || "N/A"}`,
      20,
      70
    );
    doc.text(`Psychologist: ${selectedPsychologist.name}`, 20, 80);
    return doc;
  };

  const handlePreviewPDF = async (type) => {
    let doc;
    if (type === "svg") {
      doc = await generateSVGPdf();
    } else if (type === "reading") {
      doc = await generateReadingPdf();
    }
    if (doc) {
      const dataUrl = doc.output("datauristring");
      setPdfDataUrl(dataUrl);
      setPdfType(type);
      setIsPreviewModalOpen(true);
    }
  };

  const handlePrintPDF = async () => {
    let doc;
    if (pdfType === "svg") {
      doc = await generateSVGPdf();
      if (doc) doc.save("MMSE_Drawing.pdf");
    } else if (pdfType === "reading") {
      doc = await generateReadingPdf();
      if (doc) doc.save("MMSE_Reading.pdf");
    }
    setIsPreviewModalOpen(false);
    setPdfDataUrl("");
    setPdfType("");
  };

  const closePreviewModal = () => {
    setIsPreviewModalOpen(false);
    setPdfDataUrl("");
    setPdfType("");
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
      Array.from(files).forEach((file) => formData.append("file", file));
    }

    dispatch(createMMSETest(formData));
    openModal(
      "Test submitted! The results are now available on the next page."
    );
  };

  const sectionKeyMap = {
    Orientation: "orientation",
    Registration: "registration",
    "Attention and Calculation": "attention",
    Recall: "recall",
    Language: "language",
    Drawing: "drawing",
  };

  const sections = [
    { name: "Orientation", maxScore: 10 },
    { name: "Registration", maxScore: 3 },
    { name: "Attention and Calculation", maxScore: 5 },
    { name: "Recall", maxScore: 3 },
    { name: "Language", maxScore: 8 },
    { name: "Drawing", maxScore: 1 },
  ];

  const groupedQuestions = sections.map((section) => ({
    ...section,
    questions: mmseQuestions.filter(
      (q) => q.section === sectionKeyMap[section.name]
    ),
  }));

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
              {(allMedicalStaff || []).map((psych) => (
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
            drawing or writing samples) as evidence.
          </li>
        </ul>
      </div>

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
              <h3 className="h5 fw-semibold text-dark mb-2">
                {idx + 1}.{qIdx + 1}. {q.question[language]}
              </h3>
              <p className="h6 text-primary small mb-3 fst-italic">
                <i className="fas fa-info-circle me-1"></i>
                {q.guidance[language]}
              </p>
              <p className="h6 text-success small mb-3">
                <i className="fas fa-check-circle me-1"></i>
                Correct Answer: {q.correctAnswer[language]}
              </p>

              {q.id === "q5_reading_score" && (
                <>
                  <div className="mb-3 text-center">
                    <div
                      ref={readingTextRef}
                      style={{
                        fontSize: "24px",
                        fontWeight: "bold",
                        padding: "10px",
                        border: "1px solid black",
                        display: "inline-block",
                      }}
                    >
                      CLOSE YOUR EYES
                    </div>
                  </div>
                  <div className="d-flex justify-content-center">
                    <button
                      className="btn btn-primary fw-bold px-4 py-2 shadow-sm"
                      onClick={() => handlePreviewPDF("reading")}
                      disabled={!isTextReady}
                    >
                      <i className="fas fa-print me-2"></i> Print Reading
                    </button>
                  </div>
                </>
              )}

              {q.id === "q6_drawing_score" && (
                <>
                  <div className="mb-3 text-center">
                    <svg
                      ref={svgRef}
                      className="pentagon-svg"
                      viewBox="0 0 100 70"
                      aria-label="Two intersecting pentagons forming a four-sided figure in their intersection."
                      width="200"
                      height="140"
                    >
                      <title>Intersecting Pentagons for MMSE</title>
                      <polygon
                        points="25,10 45,10 55,30 40,50 10,30"
                        fill="none"
                        stroke="black"
                        strokeWidth="2"
                      />
                      <polygon
                        points="55,20 75,20 85,40 70,60 40,40"
                        fill="none"
                        stroke="black"
                        strokeWidth="2"
                      />
                    </svg>
                  </div>
                  <div className="d-flex justify-content-center">
                    <button
                      className="btn btn-primary fw-bold px-4 py-2 shadow-sm"
                      onClick={() => handlePreviewPDF("svg")}
                      disabled={!isSvgReady}
                    >
                      <i className="fas fa-print me-2"></i> Print Drawing
                    </button>
                  </div>
                </>
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

      {isPreviewModalOpen && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center bg-dark bg-opacity-75"
          style={{ zIndex: 1050 }}
        >
          <div
            className="bg-white rounded shadow p-4 p-sm-5 m-3 border border-secondary"
            style={{ maxWidth: "600px", width: "100%" }}
          >
            <h3 className="h5 fw-semibold text-dark mb-3">PDF Preview</h3>
            {pdfDataUrl ? (
              <iframe
                src={pdfDataUrl}
                title="PDF Preview"
                style={{ width: "100%", height: "400px", border: "none" }}
              ></iframe>
            ) : (
              <p className="text-danger">Failed to load PDF preview.</p>
            )}
            <div className="d-flex gap-2 mt-3">
              <button
                onClick={handlePrintPDF}
                className="btn btn-success fw-bold w-50 shadow-sm"
                disabled={!pdfDataUrl}
              >
                Print
              </button>
              <button
                onClick={closePreviewModal}
                className="btn btn-secondary fw-bold w-50 shadow-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MMSEAssessment;
