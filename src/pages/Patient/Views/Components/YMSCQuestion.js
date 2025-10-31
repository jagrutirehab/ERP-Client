import React, { useState, useEffect, useRef } from 'react';
import { connect, useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { fetchDoctors, fetchPatientById } from '../../../../store/actions';
import { Dropdown, DropdownItem, DropdownMenu, DropdownToggle } from 'reactstrap';
import Loader from '../../../../Components/Common/Loader';
import { createYMRSTest, setIsClinicalTab, setTestName, setTestPageOpen } from '../../../../store/features/clinicalTest/clinicalTestSlice';
import axios from 'axios';

const YMSCQuestion = () => {
    const [userId, setUserId] = useState('dummy-user-id');
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [dummyDrop, setDummyDrop] = useState(false);
    const [selectedDoctor, setSelectedDoctor] = useState({ name: "Choose Doctor", id: -1 });
    const toggle2 = () => setDropdownOpen((prevState) => !prevState);
    const toggle3 = () => setDummyDrop((prev) => !prev);

    const { id } = useParams();
    const dispatch = useDispatch();

    const patientName = useSelector((state) => state.Patient?.patient?.name);
    const patientDetails = useSelector((state) => state.Patient?.patient?.id || {});
    const centerId = useSelector((state) => state.Patient.patient?.center?._id);
    const doctorDetails = useSelector((state) => state.User?.doctor);
    const counselerDetails = useSelector((state) => state.User.counsellors);

    const allMedicalStaff = [...doctorDetails, ...counselerDetails];
    const clinicalTestLoading = useSelector((state) => state.ClinicalTest?.isLoading);

    const [center, setCenters] = useState('');
    const [scores, setScores] = useState({});
    const [currentPage, setCurrentPage] = useState('assessment');

    const [observation, setObservations] = useState("")
    const [documentLInk, setDocumentLink] = useState("");
    const [evidenceDetails, setEvidenceDetails] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMessage, setModalMessage] = useState("");
    const [attempTotalQuestion, setAttempTotalQuestion] = useState(false)
    const fileInputRef = useRef(null);
    const [imagePreview, setImagePreview] = useState(null);


    useEffect(() => {
        dispatch(fetchDoctors({ center: centerId }));
    }, [id, centerId, dispatch]);

    useEffect(() => {
        const fetchPatientData = async () => {
            if (!id || id === "*") return;
            try {
                dispatch(fetchPatientById(id));
            } catch (err) {
                console.error('Error fetching patient data:', err);
            }
        };
        fetchPatientData();
    }, [dispatch, id]);

    function closeModal() {

        if (selectedDoctor.id == -1) {
            setIsModalOpen(false);
            setModalMessage("");
            return;
        }

        if (attempTotalQuestion == false) {
            setIsModalOpen(false);
            setModalMessage("");
            return;
        }
        setIsModalOpen(false);
        dispatch(setIsClinicalTab(true));
        setModalMessage('');
        dispatch(setTestName(""));
        dispatch(setTestPageOpen(false));
    }



    // YMRS QUESTIONS
    const YMRS_QUESTIONS = [
        {
            id: '01',
            category: 'Affective/Cognitive',
            question: 'Elevated Mood:',
            description: 'Reported by patient, observed by staff. Exaggerated feeling of well-being, euphoria, cheerfulness, optimism. (Score for duration and intensity).',
            scores: [
                { value: 0, label: 'Absent' },
                { value: 1, label: 'Mild, slight but definite' },
                { value: 2, label: 'Moderate, good humor, high spirits' },
                { value: 3, label: 'Severe, euphoria, laughter' },
                { value: 4, label: 'Extreme, ecstasy' },
            ],
        },
        {
            id: '02',
            category: 'Affective/Cognitive',
            question: 'Increased Motor Activity - Energy:',
            description: 'Reported by patient, observed by staff. Restlessness, pacing, increased gesticulation, inability to sit still, increased physical energy, participation in many activities.',
            scores: [
                { value: 0, label: 'Absent' },
                { value: 1, label: 'Subjectively increased energy' },
                { value: 2, label: 'Energetic, overactive, restless (not pacing)' },
                { value: 3, label: 'Excessive energy, constant motion, pacing' },
                { value: 4, label: 'Hyperactive, agitated, frenzied' },
            ],
        },
        {
            id: '03',
            category: 'Affective/Cognitive',
            question: 'Sexual Interest:',
            description: 'Reported by patient, observed by staff. Increased sexual drive, preoccupation with sexual thoughts, overt sexual behavior.',
            scores: [
                { value: 0, label: 'Absent' },
                { value: 1, label: 'Mild, slight but definite' },
                { value: 2, label: 'Moderate, increased interest, suggestive' },
                { value: 3, label: 'Severe, overt sexual behavior' },
                { value: 4, label: 'Extreme, promiscuity' },
            ],
        },
        {
            id: '04',
            category: 'Affective/Cognitive',
            question: 'Sleep:',
            description: 'Reported by patient, observed by staff. Decreased need for sleep, going to bed later, waking earlier, less sleep than usual.',
            scores: [
                { value: 0, label: 'No decrease in sleep' },
                { value: 1, label: 'Sleeping 1 hour less than usual' },
                { value: 2, label: 'Sleeping 2-3 hours less than usual' },
                { value: 3, label: 'Sleeping 4-5 hours less than usual' },
                { value: 4, label: 'Sleeping 6 or more hours less than usual' },
            ],
        },
        {
            id: '05',
            category: 'Affective/Cognitive',
            question: 'Irritability:',
            description: 'Reported by patient, observed by staff. Exaggerated response to minor annoyances, short temper, hostile, uncooperative.',
            scores: [
                { value: 0, label: 'Absent' },
                { value: 1, label: 'Mild, slight but definite' },
                { value: 2, label: 'Moderate, occasional outbursts' },
                { value: 3, label: 'Severe, frequent outbursts' },
                { value: 4, label: 'Extreme, constant hostility' },
            ],
        },
        {
            id: '06',
            category: 'Thought Disorder',
            question: 'Thought Content:',
            description: 'Observed by staff (delusions, grandiosity, paranoia, persecutory ideas).',
            scores: [
                { value: 0, label: 'Absent' },
                { value: 1, label: 'Suspicious, guarded, defensive' },
                { value: 2, label: 'Delusions of reference, persecution (not bizarre)' },
                { value: 3, label: 'Bizarre delusions, hallucinations, thought broadcasting' },
                { value: 4, label: 'Grandiose delusions, bizarre thoughts' },
            ],
        },
        {
            id: '07',
            category: 'Thought Disorder',
            question: 'Disruptive/Aggressive Behavior:',
            description: 'Observed by staff. Destructive, assaultive, threatening, self-injurious, uncooperative.',
            scores: [
                { value: 0, label: 'Normal' },
                { value: 1, label: 'Questionable plans, new interests' },
                { value: 2, label: 'Special project(s); hyperreligious' },
                { value: 3, label: 'Grandiose or paranoid ideas; ideas of reference' },
                { value: 4, label: 'Delusions; hallucinations' },
            ],
        },
        {
            id: '08',
            category: 'Speech',
            question: 'Speech (Rate and Amount):',
            description: 'Observed by staff. Rapid, pressured, loud, non-stop, difficult to interrupt.',
            scores: [
                { value: 0, label: 'Absent' },
                { value: 1, label: 'Mild, slightly increased' },
                { value: 2, label: 'Moderate, pressured, loud' },
                { value: 3, label: 'Severe, rapid, difficult to interrupt' },
                { value: 4, label: 'Extreme, continuous, incoherent' },
            ],
        },
        {
            id: '09',
            category: 'Speech',
            question: 'Language/Thought Disorder:',
            description: 'Observed by staff. Flight of ideas, racing thoughts, tangentiality, looseness of associations, clang associations, neologisms.',
            scores: [
                { value: 0, label: 'Absent' },
                { value: 1, label: 'Tangential, circumstantial' },
                { value: 2, label: 'Flight of ideas, racing thoughts' },
                { value: 3, label: 'Looseness of associations, clang associations' },
                { value: 4, label: 'Incoherent, neologisms' },
            ],
        },
        {
            id: '10',
            category: 'Appearance/Physical',
            question: 'Appearance (Dress/Grooming):',
            description: 'Observed by staff. Flamboyant, disheveled, eccentric, excessive makeup or jewelry.',
            scores: [
                { value: 0, label: 'Appropriate' },
                { value: 1, label: 'Slightly unusual' },
                { value: 2, label: 'Flamboyant, eccentric' },
                { value: 3, label: 'Disheveled, bizarre' },
                { value: 4, label: 'Markedly disheveled, grotesque' },
            ],
        },
        {
            id: '11', // This question has a score up to 8
            category: 'Insight',
            question: 'Insight:',
            description: 'Reported by patient, observed by staff. Awareness of illness, need for treatment, consequences of behavior.',
            scores: [
                { value: 0, label: 'Excellent insight' },
                { value: 1, label: 'Good insight' },
                { value: 2, label: 'Fair insight, admits illness but minimizes severity' },
                { value: 3, label: 'Poor insight, denies illness, attributes to external factors' },
                { value: 4, label: 'No insight, psychotic denial' },
                { value: 5, label: 'Delusional denial' },
                { value: 6, label: 'Complete lack of insight, actively resisting treatment' },
                { value: 7, label: 'Bizarre or persecutory delusions about treatment' },
                { value: 8, label: 'Total lack of insight, gross impairment in reality testing' },
            ],
        },
        // add more questions here
    ];

    const mappedYMRSQuestions = YMRS_QUESTIONS.map(q => ({
        id: q.id,
        question: q.question,
        type: 'radio',
        options: q.scores.map(option => ({
            score: option.value,
            label: `${option.value}: ${option.label}`
        })),
        guideline: q.description
    }));

    // Set base64 string for preview
    // In a real MERN stack app, you'd send this to the backend:
    // sendFileToBackend(reader.result, file.type);
    // openModal(`Image "${file.name}" selected. In a full application, this would be uploaded to the server.`);


    const handleImageUpload = (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        } else {
            setImagePreview(null);
        }
    };

    const triggerFileInput = () => {
        fileInputRef.current.click();
    };


    const handleScoreChange = (questionId, selectedScore) => {
        setScores(prevScores => ({
            ...prevScores,
            [questionId]: selectedScore
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (selectedDoctor.id == -1) {
            setIsModalOpen(true);
            setModalMessage("Please choose a doctor first");
            return;
        }

        const submissionData = mappedYMRSQuestions.map(q => {
            const selectedScore = scores[q.id];
            const selectedOption = q.options.find(opt => opt.score === selectedScore);

            return {
                questionId: q.id,
                question: q.question,
                score: selectedScore ?? null,
                label: selectedOption ? selectedOption.label : "No answer selected"
            };
        });

        const unansweredQuestions = submissionData.filter(item => item.score === null);

        if (unansweredQuestions.length > 0) {
            setIsModalOpen(true);
            setModalMessage("Please attempt all the questions");
            return;
        }

        const formData = new FormData();

        const imageFiles = fileInputRef.current?.files;

        if (imageFiles && imageFiles.length > 0) {
            for (let i = 0; i < imageFiles.length; i++) {
                formData.append("file", imageFiles[i]);
            }
        }

        // Append JSON fields as strings:
        formData.append("patientId", id);
        formData.append("centerId", centerId);
        formData.append("doctorId", selectedDoctor?.id);
        formData.append("testType", "YMRS");
        formData.append("questions", JSON.stringify(submissionData));
        // formData.append("documentationLink", documentLInk);
        formData.append("observation", observation);
        // formData.append("evidence", evidenceDetails);

        dispatch(createYMRSTest(formData));

        setAttempTotalQuestion(true);
        setIsModalOpen(true);
        setModalMessage("Test submitted! The results are now available on the next page.");
    };



    return (
        <div className="d-flex align-items-center justify-content-center min-vh-100 px-3 px-sm-4 px-lg-5 text-dark" >
            {clinicalTestLoading && <Loader />}
            <div className="bg-white shadow-xl rounded-2xl p-6 sm:p-8 lg:p-10 w-full max-w-4xl">
                <h1 className="text-center text-primary fw-bold mb-4 mb-sm-5 display-5">
                    <i className="fas fa-stethoscope me-2 text-primary"></i>
                    Young Mania Rating Scale {center}
                </h1>

                {userId && (
                    <div className="mb-4 d-flex align-items-center justify-content-between p-3 border border-primary rounded text-primary small bg-light">
                        <div className="d-flex flex-column justify-content-start">
                            <span className="fw-semibold">Patient ID: {patientDetails.prefix}{patientDetails.value}</span>
                            <span className="fw-semibold" style={{ textTransform: "capitalize" }}>Patient Name: {patientName}</span>
                        </div>
                        <div className='d-flex' style={{ gap: "5px" }}>
                            <Dropdown size="sm" isOpen={dummyDrop} toggle={toggle3} direction="down">
                                <DropdownToggle caret outline color="primary">
                                    {selectedDoctor.name || "Select Doctor"}
                                </DropdownToggle>
                                <DropdownMenu flip={false}>
                                    {allMedicalStaff && allMedicalStaff.length > 0 && allMedicalStaff.map((item) => (
                                        <DropdownItem key={item._id} onClick={() => setSelectedDoctor({ name: item.name, id: item._id })}>
                                            {item.name}
                                        </DropdownItem>
                                    ))}
                                </DropdownMenu>
                            </Dropdown>

                            <Dropdown size="sm" isOpen={dropdownOpen} toggle={toggle2} direction="down">
                                <DropdownToggle caret outline color="primary">
                                    English
                                </DropdownToggle>
                                <DropdownMenu flip={false}>
                                    {["English"].map((item, idx) => (
                                        <DropdownItem key={idx}>
                                            {item}
                                        </DropdownItem>
                                    ))}
                                </DropdownMenu>
                            </Dropdown>
                        </div>
                    </div>
                )}

                {currentPage === 'assessment' && (
                    <>
                        <div className="mb-5 p-4 bg-light border border-primary rounded shadow-sm max-h-[200px]">
                            <h2 className="h5 h4-sm fw-semibold text-primary mb-3">
                                <i className="fas fa-lightbulb me-2 text-primary fs-1"></i>
                                Guidelines for Administering YMRS
                            </h2>
                            <p className='fs-6 pl-[12px]'>
                                The Young Mania Rating Scale (YMRS) is an 11-item diagnostic questionnaire used to assess the severity of
                                manic symptoms. It is clinician-rated and based on the patient's subjective report of their clinical condition over the past 48
                                hours and observations made by the clinician during the interview.
                            </p>
                            <h2 className="h5 h4-sm fw-semibold text-primary mb-3">
                                <i className="fas fa-lightbulb me-2 text-primary fs-1"></i>
                                General Instructions:
                            </h2>
                            <ul className="ps-3 text-secondary text-dark small fs-6">
                                <li className="mb-2">Rate the patient based on the information obtained from the interview. Supplement with information from other sources (e.g., family members, nurses, medical records) if available and reliable.</li>
                                <li className="mb-2">Consider the patient's typical behavior and compare current symptoms to their baseline.</li>
                                <li className="mb-2">Each item is scored from 0 to 4 or 0 to 8, with higher scores indicating greater severity.</li>
                                <li className="mb-2">The total score ranges from 0 to 60.</li>
                                <li className="mb-2">The questions are designed to cover various domains of manic symptoms, including elevated mood, increased motor activity, sleep disturbance, irritability, thought disorder, and insight.</li>
                            </ul>
                            <h2 className="h5 h4-sm fw-semibold text-primary mb-3">
                                <i className="fas fa-lightbulb me-2 text-primary fs-1"></i>
                                Specific Item Scoring:
                            </h2>
                            <ul className="ps-3 text-secondary text-dark small fs-6">
                                <li className="mb-2">
                                    For each item, carefully read the description and the scoring anchors.
                                </li>
                                <li className="mb-2">
                                    Select the score that best reflects the patient's condition for the past 48 hours. If a symptom is intermittent, score based on its intensity when present and how frequently it occurs.
                                </li>
                                <li className="mb-2">
                                    Use the "Overall Evidence/Details" field to document specific examples, patient quotes, or observations that justify the overall assessment. This is crucial for maintaining clear records and for later review.
                                </li>
                                <li className="mb-2">
                                    The "Overall Document Link" field can be used to link to relevant external documents (e.g., PDF reports, external files) that serve as evidence for the entire test.
                                </li>
                            </ul>

                            {/* <h2 className="h5 h4-sm fw-semibold text-primary mb-3">
                                <i className="fas fa-lightbulb me-2 text-primary fs-1"></i>
                                Interpretation of Scores:
                            </h2>
                            <ul className="ps-3 text-secondary text-dark small fs-6">
                                <li className="mb-2">
                                    0-11: Normal / Euthymic - No or minimal manic symptoms.
                                </li>
                                <li className="mb-2">
                                    12-20: Mild Mania - Suggests hypomania or mild manic symptoms.
                                </li>
                                <li className="mb-2">
                                    21-25: Moderate Mania - Indicates moderate manic symptoms, likely requiring intervention.
                                </li>
                                <li className="mb-2">
                                    26-60: Severe Mania - Signifies severe manic symptoms, typically requiring urgent clinical attention.
                                </li>
                            </ul>

                            <h2 className="h5 h4-sm fw-semibold text-primary mb-3">
                                <i className="fas fa-lightbulb me-2 text-primary fs-1"></i>
                                Important Considerations:
                            </h2>
                            <ul className="ps-3 text-secondary text-dark small fs-6">
                                <li className="mb-2">
                                    This scale is a tool to aid clinical assessment and should always be used in conjunction with a comprehensive clinical evaluation.
                                </li>
                                <li className="mb-2">
                                    Regularly review guidelines and adapt to the patient's individual presentation.
                                </li>
                                <li className="mb-2">
                                    Always ensure patient confidentiality and data security.
                                </li>
                            </ul> */}
                        </div>


                        <form onSubmit={handleSubmit} className="mb-5">
                            {mappedYMRSQuestions.map((q, index) => (
                                <div key={q.id} className="mb-4 p-4 bg-white border rounded shadow-sm">
                                    <h3 className="h6 h5-sm fw-semibold text-dark mb-2 fx-4"> {index + 1}.&nbsp; {q.question}</h3>
                                    <p className="text-primary small mb-3 fst-italic fs-6">
                                        <i className="fas fa-info-circle me-1"></i>
                                        Guideline: {q.guideline}
                                    </p>
                                    <div className="d-flex flex-wrap gap-2 gap-sm-3">
                                        {q.options.map((option) => (
                                            <label
                                                key={option.score}
                                                className={`d-flex align-items-center p-2 rounded cursor-pointer transition ${scores[q.id] === option.score
                                                    ? 'bg-primary text-white shadow'
                                                    : 'bg-light text-dark border'
                                                    }`}
                                                style={{ transition: 'all 0.2s ease' }}
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

                            {/* <div className="mb-4 p-4 bg-white border rounded shadow-sm">
                                <h3 className="h6 h5-sm fw-semibold text-dark mb-2">
                                    <i className="fas fa-edit me-2 text-primary"></i>
                                    Overall Evidence/Details:
                                </h3>

                                <textarea
                                    value={evidenceDetails}
                                    onChange={(e) => setEvidenceDetails(e.target.value)}
                                    className="form-control"
                                    style={{ minHeight: '100px', resize: 'vertical' }}
                                    placeholder="Document overall evidence, patient quotes, or observations relevant to the entire test here..."
                                ></textarea>
                                <div className='flex flex-col mt-2 gap-3 '>
                                    <p>Overall Document Link (Optional):    </p>
                                    <input className="form-control " style={{ marginTop: "-13px" }} value={documentLInk} onChange={(e) => setDocumentLink(e.target.value)} type='text' placeholder='e.g., https://example.com/patient-report.pdf' />
                                </div>
                            </div> */}

                            {/* <div className="mb-4 p-4 bg-white border rounded shadow-sm">
                                <h3 className="h6 h5-sm fw-semibold text-dark mb-2">
                                    <i className="fas fa-edit me-2 text-primary"></i>
                                    Overall Observations and Notes:
                                </h3>

                                <textarea
                                    value={observation}
                                    onChange={(e) => setObservations(e.target.value)}
                                    className="form-control"
                                    style={{ minHeight: '100px', resize: 'vertical' }}
                                    placeholder="Document any general observations about the patient or the testing session here. This can include mood during interview, cooperativeness, etc."
                                ></textarea>
                            </div> */}


                            <div className="mb-4 p-4 bg-white border rounded shadow-sm">
                                <h3 className="h6 h5-sm fw-semibold text-dark mb-2">
                                    <i className="fas fa-edit me-2 text-primary"></i>
                                    Observations
                                </h3>
                                <p className="small text-muted mb-3">
                                    Document any additional clinical observations or relevant notes here.
                                </p>
                                <textarea
                                    value={observation}
                                    onChange={(e) => setObservations(e.target.value)}
                                    className="form-control"
                                    style={{ minHeight: '100px', resize: 'vertical' }}
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
                                    Psychiatrists can upload images or other relevant evidence here.
                                </p>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                    ref={fileInputRef}
                                    style={{ display: 'none' }}
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
                                                    'https://placehold.co/300x200/cccccc/ffffff?text=Image+Load+Error';
                                            }}
                                        />
                                        <p className="text-muted small mt-2">
                                            Note: In a full MORNStack app, this image would be securely stored on
                                            the server/database.
                                        </p>
                                    </div>
                                )}
                            </div>



                            <div className="d-flex justify-content-end bg-light p-4 rounded border border-primary">
                                <button type="submit" className="btn btn-success fw-bold px-4 py-2 shadow-sm">
                                    <i className="fas fa-check-circle me-2"></i>
                                    Submit Test
                                </button>
                            </div>
                        </form>
                    </>
                )}
            </div>
            {isModalOpen && (
                <div
                    className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center bg-dark bg-opacity-75"
                    style={{ zIndex: 1050 }}
                >
                    <div className="bg-white rounded shadow p-4 p-sm-5 m-3 border border-secondary" style={{ maxWidth: '400px', width: '100%' }}>
                        <h3 className="h5 fw-semibold text-dark mb-3">{selectedDoctor.id == -1 ? "" : "Notification"}</h3>
                        <p className="text-secondary mb-4">{modalMessage}</p>
                        <button
                            onClick={closeModal}
                            className="btn btn-primary fw-bold w-100 shadow-sm"
                            style={{ transition: 'all 0.3s ease-in-out' }}
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

export default connect(mapStateToProps)(YMSCQuestion);
