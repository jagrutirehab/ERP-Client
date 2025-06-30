import React, { useState, useEffect, useRef } from "react";
import { connect, useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import {
  createCiwaTest,
  fetchCiwaTest,
  fetchDoctors,
  fetchPatientById,
} from "../../../../store/actions";
import {
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
} from "reactstrap";
import Loader from "../../../../Components/Common/Loader";
import {
  setIsClinicalTab,
  setTestName,
  setTestPageOpen,
} from "../../../../store/features/clinicalTest/clinicalTestSlice";

// Main App component
const CiwaQuestions = () => {
  // State to store current user's ID for Firestore (conceptual, not implemented in this frontend)
  const [userId, setUserId] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [dummyDrop, setDummyDrop] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState({
    name: "Choose Doctor",
    id: -1,
  });
  const toggle2 = () => setDropdownOpen((prevState) => !prevState);
  const toggle3 = () => setDummyDrop((prev) => !prev);

  const { id } = useParams();

  const dispatch = useDispatch();
  const patientName = useSelector((state) => state.Patient?.patient?.name);
  const patientDetails = useSelector((state) => state.Patient?.patient?.id);
  const centerId = useSelector((state) => state.Patient.patient?.center?._id);
  useEffect(() => {
    dispatch(fetchDoctors({ center: centerId }));
  }, [id, centerId, dispatch]);
  const doctorDetails = useSelector((state) => state.User?.doctor);

  const clinicalTestLoading = useSelector(
    (state) => state.ClinicalTest?.isLoading
  );

  const [center, setCenters] = useState("");

  useEffect(() => {
    const fetchPatientData = async () => {
      if (!id || id === "*") return;

      try {
        // Fetch fresh patient data
        dispatch(fetchPatientById(id));
      } catch (err) {
        // setLoading(false);
      } finally {
        // setLoading(false);
      }
    };
    fetchPatientData();
  }, [dispatch, id]);

  // // State to store the scores for each CIWA-AR item
  const [scores, setScores] = useState({
    nauseaVomiting: 0,
    tremor: 0,
    paroxysmalSweats: 0,
    anxiety: 0,
    agitation: 0,
    tactileDisturbances: 0,
    auditoryDisturbances: 0,
    visualDisturbances: 0,
    headache: 0,
    orientation: 0,
  });

  // State for managing image previews (for psychiatrist)
  const [imagePreview, setImagePreview] = useState(null);
  // Ref for the file input element
  const fileInputRef = useRef(null);
  // State for modal visibility
  const [isModalOpen, setIsModalOpen] = useState(false);
  // State for modal message
  const [modalMessage, setModalMessage] = useState("");
  // State to control which page is currently displayed: 'assessment' or 'results'
  const [currentPage, setCurrentPage] = useState("assessment");
  // State to store additional observations
  const [observations, setObservations] = useState("");

  // CIWA-AR questions and their possible scores with descriptions
  const ciwaQuestions = [
    {
      id: "nauseaVomiting",
      question:
        "1. Nausea and Vomiting: Do you feel sick to your stomach? Have you vomited?",
      type: "radio",
      options: [
        { score: 0, label: "0: No nausea and no vomiting" },
        { score: 1, label: "1: Mild nausea with no vomiting" },
        { score: 2, label: "2: Intermittent nausea" },
        { score: 3, label: "3: Intermittent nausea" },
        { score: 4, label: "4: Intermittent nausea with dry heaves" },
        { score: 5, label: "5: Constant nausea" },
        { score: 6, label: "6: Constant nausea" },
        {
          score: 7,
          label: "7: Constant nausea, frequent dry heaves & vomiting",
        },
      ],
      guideline:
        "Observe patient. Ask specific questions about nausea and vomiting. Rate based on severity and frequency.",
    },
    {
      id: "tremor",
      question:
        "2. Tremor: (Observe patient with arms extended, fingers spread apart) How severe are your tremors?",
      type: "radio",
      options: [
        { score: 0, label: "0: No tremor" },
        {
          score: 1,
          label: "1: Not visible, but can be felt fingertip to fingertip",
        },
        { score: 2, label: "2: Moderate" },
        { score: 3, label: "3: Moderate" },
        { score: 4, label: "4: Moderate, with patient's arms extended" },
        { score: 5, label: "5: Severe" },
        { score: 6, label: "6: Severe" },
        { score: 7, label: "7: Severe, even with arms not extended" },
      ],
      guideline:
        "Observe patient's hands with arms extended. Rate based on visibility and intensity of tremor.",
    },
    {
      id: "paroxysmalSweats",
      question:
        "3. Paroxysmal Sweats: (Observe patient) How much are you sweating?",
      type: "radio",
      options: [
        { score: 0, label: "0: No sweat visible" },
        { score: 1, label: "1: Barely perceptible sweating, palms moist" },
        { score: 2, label: "2: Beads of sweat" },
        { score: 3, label: "3: Beads of sweat" },
        { score: 4, label: "4: Beads of sweat obvious on forehead" },
        { score: 5, label: "5: Drenching sweats" },
        { score: 6, label: "6: Drenching sweats" },
        { score: 7, label: "7: Drenching sweats" },
      ],
      guideline:
        "Observe for visible sweating, especially on the forehead and palms. Rate based on amount of sweat.",
    },
    {
      id: "anxiety",
      question: "4. Anxiety: Do you feel nervous?",
      type: "radio",
      options: [
        { score: 0, label: "0: No anxiety, at ease" },
        { score: 1, label: "1: Mild anxious" },
        { score: 2, label: "2: Moderately anxious" },
        { score: 3, label: "3: Moderately anxious" },
        {
          score: 4,
          label: "4: Moderately anxious, or guarded, so anxiety is inferred",
        },
        { score: 5, label: "5: Acute panic states" },
        { score: 6, label: "6: Acute panic states" },
        {
          score: 7,
          label:
            "7: Equivalent to acute panic states as seen in severe delirium or acute schizophrenic reactions",
        },
      ],
      guideline:
        "Ask the patient directly. Observe for non-verbal cues of anxiety. Rate based on expressed feelings and observed behavior.",
    },
    {
      id: "agitation",
      question: "5. Agitation: (Observe patient) How agitated are you?",
      type: "radio",
      options: [
        { score: 0, label: "0: Normal activity" },
        { score: 1, label: "1: Somewhat more than normal activity" },
        { score: 2, label: "2: Moderately fidgety" },
        { score: 3, label: "3: Moderately fidgety" },
        { score: 4, label: "4: Moderately fidgety and restless" },
        { score: 5, label: "5: Paces back and forth" },
        { score: 6, label: "6: Paces back and forth" },
        {
          score: 7,
          label:
            "7: Paces back and forth during most of the interview, or constantly thrashes about",
        },
      ],
      guideline:
        "Observe patient's motor activity and restlessness throughout the interview. Rate based on the degree of physical activity.",
    },
    {
      id: "tactileDisturbances",
      question:
        "6. Tactile Disturbances: Have you any itching, pins and needles sensations, any burning, any numbness, or do you feel bugs crawling on or under your skin?",
      type: "radio",
      options: [
        { score: 0, label: "0: None" },
        {
          score: 1,
          label: "1: Very mild itching, pins & needles, burning or numbness",
        },
        {
          score: 2,
          label: "2: Mild itching, pins & needles, burning or numbness",
        },
        {
          score: 3,
          label: "3: Moderate itching, pins & needles, burning or numbness",
        },
        { score: 4, label: "4: Moderately severe hallucinations" },
        { score: 5, label: "5: Severe hallucinations" },
        { score: 6, label: "6: Extremely severe hallucinations" },
        { score: 7, label: "7: Continuous hallucinations" },
      ],
      guideline:
        "Ask specific questions about tactile sensations. Distinguish between general discomfort and explicit hallucinatory experiences.",
    },
    {
      id: "auditoryDisturbances",
      question:
        "7. Auditory Disturbances: Are you more aware of sounds around you? Are they harsh? Do they frighten you? Are you hearing anything that is disturbing to you? Are you hearing things you know are not there?",
      type: "radio",
      options: [
        { score: 0, label: "0: Not present" },
        { score: 1, label: "1: Very mild harshness or ability to frighten" },
        { score: 2, label: "2: Mild harshness or ability to frighten" },
        { score: 3, label: "3: Moderate harshness or ability to frighten" },
        { score: 4, label: "4: Moderately severe hallucinations" },
        { score: 5, label: "5: Severe hallucinations" },
        { score: 6, label: "6: Extremely severe hallucinations" },
        { score: 7, label: "7: Continuous hallucinations" },
      ],
      guideline:
        "Ask about auditory experiences. Differentiate between heightened sensitivity to sounds and actual auditory hallucinations.",
    },
    {
      id: "visualDisturbances",
      question:
        "8. Visual Disturbances: Does the light appear to be too bright? Is its color different? Does it hurt your eyes? Are you seeing anything that is disturbing to you? Are you seeing things you know are not there?",
      type: "radio",
      options: [
        { score: 0, label: "0: Not present" },
        { score: 1, label: "1: Very mild sensitivity" },
        { score: 2, label: "2: Mild sensitivity" },
        { score: 3, label: "3: Moderate sensitivity" },
        { score: 4, label: "4: Moderately severe hallucinations" },
        { score: 5, label: "5: Severe hallucinations" },
        { score: 6, label: "6: Extremely severe hallucinations" },
        { score: 7, label: "7: Continuous hallucinations" },
      ],
      guideline:
        "Inquire about visual sensitivity and any visual distortions or hallucinations. Pay attention to patient descriptions of visual experiences.",
    },
    {
      id: "headache",
      question:
        "9. Headache, Fullness in Head: Does your head feel different? Does it feel like there is a band around your head? (Do not rate for dizziness or lightheadedness)",
      type: "radio",
      options: [
        { score: 0, label: "0: Not present" },
        { score: 1, label: "1: Very mild" },
        { score: 2, label: "2: Mild" },
        { score: 3, label: "3: Moderate" },
        { score: 4, label: "4: Moderately severe" },
        { score: 5, label: "5: Severe" },
        { score: 6, label: "6: Very severe" },
        { score: 7, label: "7: Extremely severe" },
      ],
      guideline:
        "Ask about headache and sensation of fullness. Ensure not to rate for dizziness or lightheadedness, only pain or pressure in the head.",
    },
    {
      id: "orientation",
      question:
        "10. Orientation and Clouding of Sensorium: What day is this? Where are you? Who am I?",
      type: "radio",
      options: [
        {
          score: 0,
          label: "0: Oriented and can do serial additions (e.g., 3, 6, 9...)",
        },
        {
          score: 1,
          label: "1: Cannot do serial additions or is uncertain about date",
        },
        {
          score: 2,
          label: "2: Disoriented for date by no more than 2 calendar days",
        },
        {
          score: 3,
          label: "3: Disoriented for date by more than 2 calendar days",
        },
        { score: 4, label: "4: Disoriented for place and/or person" },
      ],
      guideline:
        "Assess patient's orientation to person, place, and time. Also, test their ability to perform serial additions (e.g., subtracting 7 from 100, or adding 3s).",
    },
  ];

  // Function to handle score changes for each question
  const handleScoreChange = (questionId, score) => {
    setScores((prevScores) => ({
      ...prevScores,
      [questionId]: parseInt(score, 10), // Ensure score is an integer
    }));
  };

  // Function to handle observation text changes
  const handleObservationsChange = (event) => {
    setObservations(event.target.value);
  };

  // Handle file selection for image upload
  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result); // Set base64 string for preview
        // In a real MERN stack app, you'd send this to the backend:
        // sendFileToBackend(reader.result, file.type);
        // openModal(`Image "${file.name}" selected. In a full application, this would be uploaded to the server.`);
      };
      reader.readAsDataURL(file);
    } else {
      setImagePreview(null);
    }
  };

  // Function to trigger file input click
  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  // Function to open the custom modal
  const openModal = (message, data) => {
    setModalMessage(message, data);
    setIsModalOpen(true);
  };

  // Function to close the custom modal
  const closeModal = () => {
    if (selectedDoctor.id == -1) {
      setIsModalOpen(false);
      setModalMessage("");
      return;
    }
    setIsModalOpen(false);
    dispatch(setIsClinicalTab(true));
    setModalMessage("");
    dispatch(setTestName(""));
    dispatch(setTestPageOpen(false));
    // If the modal was for submission, transition to results page
    // if (currentPage === 'assessment') {
    //     setCurrentPage('results');
    //     // fetch the cewa-ar test
    //     dispatch(fetchCiwaTest(id))
    // }
  };

  // Conceptual initialization of Firebase (for userId display)
  // In a real application, Firebase would be properly initialized and authenticated here.
  useEffect(() => {
    // This is a placeholder for Firebase auth setup.
    // In a real app, you would initialize Firebase, handle authentication,
    // and get the actual userId from Firebase Auth.
    // Example:
    // const app = initializeApp(firebaseConfig);
    // const auth = getAuth(app);
    // onAuthStateChanged(auth, (user) => {
    //     if (user) {
    //         setUserId(user.uid);
    //     } else {
    //         // If not authenticated, use a random ID as a placeholder for anonymous access
    //         setUserId(crypto.randomUUID());
    //     }
    // });

    // For this demo, just generate a random ID
    setUserId(`user-${Math.random().toString(36).substring(2, 11)}`);
  }, []);

  // Handle form submission
  const handleSubmit = async (event) => {
    event.preventDefault();

    if (
      selectedDoctor.id === null ||
      selectedDoctor.id == -1 ||
      selectedDoctor.id == "-1"
    ) {
      // alert("Please select a doctor name ");
      openModal("Please choose a doctor first", -1);
      return;
    }

    const formattedAnswers = ciwaQuestions.map((q) => {
      const selectedScore = scores[q.id];
      const selectedOption = q.options.find(
        (opt) => opt.score === selectedScore
      );
      return {
        questionId: q.id,
        question: q.question,
        score: selectedScore,
        label: selectedOption ? selectedOption.label : "Not answered",
      };
    });

    const formData = new FormData();
    formData.append("patientId", id);
    formData.append("centerId", centerId);
    formData.append("observation", observations);
    formData.append("questions", JSON.stringify(formattedAnswers));
    formData.append("testType", "CIWA_AR");
    formData.append("doctorId", selectedDoctor.id);
    const imageFiles = fileInputRef.current?.files;

    if (imageFiles && imageFiles.length > 0) {
      for (let i = 0; i < imageFiles.length; i++) {
        formData.append("file", imageFiles[i]);
      }
    }

    openModal(
      "Test submitted! The results are now available on the next page."
    );

    dispatch(createCiwaTest(formData));
  };

  return (
    <div
      className="d-flex  align-items-center justify-content-center min-vh-100 px-3 px-sm-4 px-lg-5 text-dark px-3  "
      style={{
        background:
          "linear-gradient(to bottom right, #e0e7ff, #ddd6fe); font-family: 'Inter', sans-serif",
      }}
    >
      {clinicalTestLoading && <Loader />}
      <div className="bg-white shadow-xl rounded-2xl p-6 sm:p-8 lg:p-10 w-full max-w-4xl ">
        <h1 class="text-center text-primary fw-bold mb-4 mb-sm-5 display-5">
          <i class="fas fa-stethoscope me-2 text-primary"></i>
          CIWA-AR Assessment
          {center}
        </h1>

        {/* Display User ID (conceptual for multi-user app) */}
        {userId && (
          <div className="mb-4 d-flex align-items-center justify-content-between  p-3 border border-primary rounded text-primary small bg-light">
            <div
              className="d-flex "
              style={{ flexDirection: "column", justifyContent: "start" }}
            >
              <span className="fw-semibold">
                {" "}
                Patient ID: {patientDetails.prefix + patientDetails.value}{" "}
              </span>
              <span
                className="fw-semibold"
                style={{ textTransform: "capitalize" }}
              >
                {" "}
                Patient Name : {patientName}{" "}
              </span>
            </div>
            <div className="d-flex " style={{ gap: "5px" }}>
              <Dropdown
                size="sm"
                isOpen={dummyDrop}
                toggle={toggle3}
                direction="down"
              >
                <DropdownToggle caret outline color="primary">
                  {selectedDoctor.name || "Select Doctor"}
                </DropdownToggle>
                <DropdownMenu flip={false}>
                  {doctorDetails &&
                    doctorDetails.length > 0 &&
                    doctorDetails.map((item, idx) => (
                      <DropdownItem
                        key={item._id}
                        onClick={() => {
                          setSelectedDoctor({ name: item.name, id: item._id });
                        }}
                      >
                        {item.name}
                      </DropdownItem>
                    ))}
                </DropdownMenu>
              </Dropdown>
              <Dropdown
                size="sm"
                isOpen={dropdownOpen}
                toggle={toggle2}
                direction="down"
              >
                <DropdownToggle caret outline color="primary">
                  English
                </DropdownToggle>
                <DropdownMenu flip={false}>
                  {["English"].map((item, idx) => (
                    <DropdownItem
                      key={idx}
                      onClick={() => {
                        console.log("Selected:", item);
                        // dispatch(setTestName(item.name))
                        // toggle(); // Optional: close modal
                      }}
                    >
                      {item}
                    </DropdownItem>
                  ))}
                </DropdownMenu>
              </Dropdown>
            </div>
          </div>
        )}

        {currentPage === "assessment" && (
          <>
            {/* Psychologist Guidelines Section */}
            <div className="mb-5 p-4 bg-light border border-primary rounded shadow-sm">
              <h2 className="h5 h4-sm fw-semibold text-primary mb-3">
                <i className="fas fa-lightbulb me-2 text-primary fs-1 "></i>
                Guidelines for Psychologists
              </h2>
              <ul className="ps-3 text-secondary text-dark small fs-6">
                <li className="mb-2  ">
                  Ensure a calm and private environment for the assessment.
                </li>
                <li className="mb-2">
                  Read each question clearly and exactly as written.
                </li>
                <li className="mb-2">
                  Listen carefully to the patient's responses and observe their
                  behavior.
                </li>
                <li className="mb-2">
                  Rate each item objectively based on the provided scoring
                  criteria.
                </li>
                <li className="mb-2">
                  For subjective items, infer anxiety/agitation from patient's
                  affect and behavior if not explicitly stated.
                </li>
                <li className="mb-2">
                  This tool helps assess alcohol withdrawal severity; use it in
                  conjunction with clinical judgment.
                </li>
                <li className="mb-2">
                  Document any additional observations or relevant patient
                  information.
                </li>
              </ul>
            </div>

            <form onSubmit={handleSubmit} className="mb-5">
              {ciwaQuestions.map((q) => (
                <div
                  key={q.id}
                  className="mb-4 p-4 bg-white border rounded shadow-sm"
                >
                  <h3 className="h6 h5-sm fw-semibold text-dark mb-2 fx-4 ">
                    {q.question}
                  </h3>
                  <p className="text-primary small mb-3 fst-italic fs-6 ">
                    <i className="fas fa-info-circle me-1"></i>
                    Guideline: {q.guideline}
                  </p>
                  <div className="d-flex flex-wrap gap-2 gap-sm-3">
                    {q.options.map((option) => (
                      <label
                        key={option.score}
                        className={`d-flex align-items-center p-2 rounded cursor-pointer transition ${
                          scores[q.id] === option.score
                            ? "bg-primary text-white shadow"
                            : "bg-light text-dark border"
                        }`}
                        style={{ transition: "all 0.2s ease" }}
                      >
                        <input
                          type="radio"
                          name={q.id}
                          value={option.score}
                          checked={scores[q.id] === option.score}
                          onChange={() => handleScoreChange(q.id, option.score)}
                          className="form-check-input me-2"
                        />
                        <span className="fs-6">{option.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}

              {/* Observations Text Area */}
              <div className="mb-4 p-4 bg-white border rounded shadow-sm">
                <h3 className="h6 h5-sm fw-semibold text-dark mb-2">
                  <i className="fas fa-edit me-2 text-primary"></i>
                  Observations
                </h3>
                <p className="small text-muted mb-3">
                  Document any additional clinical observations or relevant
                  notes here.
                </p>
                <textarea
                  value={observations}
                  onChange={handleObservationsChange}
                  className="form-control"
                  style={{ minHeight: "100px", resize: "vertical" }}
                  placeholder="Enter your observations here..."
                ></textarea>
              </div>

              {/* Image Upload Section */}
              <div className="mb-4 p-4 bg-white border rounded shadow-sm">
                <h3 className="h6 h5-sm fw-semibold text-dark mb-2">
                  <i className="fas fa-camera me-2 text-primary"></i>
                  Additional Evidence / Image Upload (for Psychiatrist)
                </h3>
                <p className="small text-muted mb-3">
                  Psychiatrists can upload images or other relevant evidence
                  here.
                </p>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  ref={fileInputRef}
                  style={{ display: "none" }}
                  multiple
                />
                <button
                  type="button"
                  onClick={triggerFileInput}
                  className="btn btn-primary fw-bold"
                >
                  <i className="fas fa-upload me-2"></i>
                  Upload Evidence Image
                </button>

                {imagePreview && (
                  <div className="mt-3 border rounded p-3">
                    <p className="fw-semibold text-dark mb-2">Image Preview:</p>
                    <img
                      src={imagePreview}
                      alt="Uploaded Evidence Preview"
                      className="img-fluid rounded shadow-sm"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src =
                          "https://placehold.co/300x200/cccccc/ffffff?text=Image+Load+Error";
                      }}
                    />
                    <p className="text-muted small mt-2">
                      Note: In a full MORNStack app, this image would be
                      securely stored on the server/database.
                    </p>
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <div className="d-flex flex-column flex-sm-row justify-content-end align-items-center bg-light p-4 rounded border border-primary">
                <button
                  type="submit"
                  className="btn btn-success fw-bold px-4 py-2 shadow-sm"
                  style={{ transition: "transform 0.3s ease-in-out" }}
                >
                  <i className="fas fa-check-circle me-2"></i>
                  Submit Test
                </button>
              </div>
            </form>
          </>
        )}
      </div>

      {/* Custom Modal for alerts */}
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
              {selectedDoctor.id == -1 ? "" : "Notification"}
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

const mapStateToProps = (state) => ({});

export default connect(mapStateToProps)(CiwaQuestions);
