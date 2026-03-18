import React, { useEffect, useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { getCallRecordings, getFeedbackRecordingById, getFeedbackRecordings, getRecordingById } from "../../../helpers/backend_helper";
import { Card, CardBody, Row, Col, Spinner } from "reactstrap";
import { normalizeGeminiResponse } from "../Helpers/normalizeGeminiResponse";
import { normalizeDates } from "../Helpers/normalizeDates";

const formatLabel = (text) => {
    return text
        ?.replaceAll("_", " ")
        ?.replace(/([A-Z])/g, " $1")
        ?.replace(/\s+/g, " ")
        ?.trim();
};

const Field = ({ label, value }) => {
    return (
        <div className="d-flex justify-content-between border-bottom py-2">
            <span className="text-muted">{label}</span>
            <span className="fw-semibold text-end">{value ?? "-"}</span>
        </div>
    );
};

const Section = ({ title, children }) => {
    return (
        <div className="mb-4">
            <h5 className="fw-bold text-primary mb-3">{title}</h5>
            <div className="bg-light rounded p-3">{children}</div>
        </div>
    );
};

const MoreDetailsFeedback = () => {
    const { id } = useParams();

    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();

    const { recordings = [], index = 0, page = 1, limit = 10 } = location.state || {};

    const prevRecording = recordings[index - 1];
    const nextRecording = recordings[index + 1];


    const loadById = async () => {
        setLoading(true);
        try {
            const response = await getFeedbackRecordingById(id);
            console.log("Details:", response);
            setData(response?.recording || null);
        } catch (error) {
            toast.error("Failed to load details");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadById();
        window.scrollTo(0, 0);
    }, [id]);

    if (loading) {
        return (
            <div
                className="d-flex justify-content-center align-items-center"
                style={{
                    height: "calc(100vh - 120px)",
                    width: "100%"
                }}
            >
                <Spinner
                    color="primary"
                    style={{ width: "2rem", height: "2rem" }}
                />
            </div>
        );
    }

    if (!data) return <div className="p-4">No data found</div>;

    const renderedFields = [
        "Call_ID",
        "Call_Type",
        "Status",
        "Caller_No",
        "Dialed_Number",
        "Campaign",
        "Agent",
        "Agent_ID",
        "Location",
        "Skill",
        "Call_Date",
        "Start_Time",
        "End_Time",
        "Duration",
        "Talk_Time",
        "Talk_time_in_Min",
        "Pickup_Time",
        "Time_to_Answer",
        "Customer_Ring_Time",
        "UCID",
        "DID",
        "Queue_Time",
        "Hold_Time",
        "Hangup_By",
        "Transfer_Type",
        "Transfered_To",
        "DynamicDid",
        "Disposition"
    ];

    const extraFields = Object.entries(data).filter(
        ([key]) =>
            !renderedFields.includes(key) &&
            !["Files", "_id", "__v", "createdAt", "updatedAt"].includes(key)
    );
    // const handleNext = () => {
    //     if (nextId) {
    //         navigate(`/recordings/more/${nextId}`, {
    //             state: {
    //                 recordings,
    //                 index: index + 1
    //             }
    //         });
    //     }
    // };

    // const handlePrevious = () => {
    //     if (prevId) {
    //         navigate(`/recordings/more/${prevId}`, {
    //             state: {
    //                 recordings,
    //                 index: index - 1
    //             }
    //         });
    //     }
    // };
    return (
        <div className="container-fluid px-4">

            <Card className="shadow-sm w-100">
                <CardBody>

                    <div className="d-flex justify-content-between mb-3">

                        <button
                            disabled={!prevRecording && page === 1}
                            className="btn btn-light rounded-circle d-flex align-items-center justify-content-center"

                            style={{
                                width: "40px",
                                height: "40px",
                                border: "1px solid #e5e7eb",
                                boxShadow: "0 2px 6px rgba(0,0,0,0.08)",

                            }}
                            onClick={async () => {

                                if (prevRecording) {
                                    navigate(`/recordings/more-feedback/${prevRecording._id}`, {
                                        state: {
                                            recordings,
                                            index: index - 1,
                                            page,
                                            limit
                                        }
                                    });
                                }
                                else {
                                    const prevPage = page - 1;

                                    if (prevPage < 1) return;

                                    const response = await getFeedbackRecordings({
                                        page: prevPage,
                                        limit
                                    });

                                    const prevPageData = response?.data || [];

                                    if (prevPageData.length > 0) {
                                        navigate(`/recordings/more-feedback/${prevPageData[prevPageData.length - 1]._id}`, {
                                            state: {
                                                recordings: prevPageData,
                                                index: prevPageData.length - 1,
                                                page: prevPage,
                                                limit
                                            }
                                        });
                                    }
                                }

                            }}
                        >
                            <i className="bx bx-chevron-left fs-4"></i>
                        </button>
                        <button
                            className="btn btn-light rounded-circle d-flex align-items-center justify-content-center"
                            style={{
                                width: "40px",
                                height: "40px",
                                border: "1px solid #e5e7eb",
                                boxShadow: "0 2px 6px rgba(0,0,0,0.08)"
                            }}
                            disabled={!nextRecording && recordings.length < limit}
                            onClick={async () => {

                                if (nextRecording) {
                                    navigate(`/recordings/more-feedback/${nextRecording._id}`, {
                                        state: {
                                            recordings,
                                            index: index + 1,
                                            page,
                                            limit
                                        }
                                    });
                                }
                                else {
                                    const nextPage = page + 1;

                                    const response = await getFeedbackRecordings({
                                        page: nextPage,
                                        limit
                                    });

                                    const nextPageData = response?.data || [];

                                    if (nextPageData.length > 0) {
                                        navigate(`/recordings/more-feedback/${nextPageData[0]._id}`, {
                                            state: {
                                                recordings: nextPageData,
                                                index: 0,
                                                page: nextPage,
                                                limit
                                            }
                                        });
                                    }
                                }

                            }}
                        >
                            <i className="bx bx-chevron-right fs-4"></i>
                        </button>

                    </div>

                    <h3 className="fw-bold text-primary mb-4">
                        Call Recording Details of {data?.Agent || "N/A"}
                    </h3>

                    {/* Recording */}
                    {data?.Files?.recording_url && (
                        <Section title="Call Recording">
                            <audio controls style={{ width: "100%" }}>
                                <source src={data?.Files?.recording_url} />
                            </audio>
                        </Section>
                    )}

                    <Row>

                        {/* Call Information */}
                        <Col md={6}>
                            <Section title="Call Information">
                                <Field label="Call ID" value={data?.Call_ID} />
                                <Field label="Call Type" value={data?.Call_Type} />
                                <Field label="Status" value={data?.Status} />
                                <Field label="Caller Number" value={data?.Caller_No} />
                                <Field label="Dialed Number" value={data?.Dialed_Number} />
                                <Field label="Campaign" value={data?.Campaign} />
                            </Section>
                        </Col>

                        {/* Agent Details */}
                        <Col md={6}>
                            <Section title="Agent Details">
                                <Field label="Agent Name" value={data?.Agent} />
                                <Field label="Agent ID" value={data?.Agent_ID} />
                                <Field label="Agent Dial Status" value={data?.Agent_Dial_Status} />
                                <Field label="Customer Dial Status" value={data?.Customer_Dial_Status} />
                                <Field label="Location" value={data?.Location} />
                                <Field label="Skill" value={data?.Skill} />
                            </Section>
                        </Col>

                        {/* Call Timing */}
                        <Col md={6}>
                            <Section title="Call Timing">
                                <Field label="Call Date" value={data?.Call_Date} />
                                <Field label="Start Time" value={data?.Start_Time} />
                                <Field label="End Time" value={data?.End_Time} />
                                <Field label="Duration" value={data?.Duration} />
                                <Field label="Talk Time" value={data?.Talk_Time} />
                                <Field label="Talk Time (Minutes)" value={data?.Talk_time_in_Min} />
                                <Field label="Pickup Time" value={data?.Pickup_Time} />
                                <Field label="Time to Answer" value={data?.Time_to_Answer} />
                                <Field label="Customer Ring Time" value={data?.Customer_Ring_Time} />
                            </Section>
                        </Col>

                        {/* System Details */}
                        <Col md={6}>
                            <Section title="System Details">
                                <Field label="UCID" value={data?.UCID || "-"} />
                                <Field label="DID" value={data?.DID || "-"} />
                                <Field label="Queue Time" value={data?.Queue_Time || "-"} />
                                <Field label="Hold Time" value={data?.Hold_Time || "-"} />
                                <Field label="Hangup By" value={data?.Hangup_By || "-"} />
                                <Field label="Transfer Type" value={data?.Transfer_Type || "-"} />
                                <Field label="Transferred To" value={data?.Transfered_To || "-"} />
                                <Field label="Dynamic DID" value={data?.DynamicDid || "-"} />
                                <Field label="Disposition" value={data?.Disposition || "-"} />
                            </Section>
                        </Col>


                        {/* Gemini AI Overview */}
                        {data?.Files?.geminiResponse &&
                            !data?.Files?.geminiResponse?.startsWith("API Error") && (
                                <Col md={12}>
                                    <Section
                                        title={
                                            <div className="d-flex justify-content-between align-items-center w-100">
                                                <span>AI Call Summary & Analysis</span>

                                                {data?.Files?.geminResponseGeneratedOn && (
                                                    <small className="text-muted">
                                                        {normalizeDates(
                                                            data?.Files?.geminResponseGeneratedOn
                                                        )}
                                                    </small>
                                                )}
                                            </div>
                                        }
                                    >
                                        <div
                                            style={{
                                                // maxHeight: "300px",
                                                overflowY: "auto",
                                                lineHeight: "1.7",
                                                fontSize: "14px",
                                                whiteSpace: "pre-wrap"
                                            }}
                                        >
                                            {normalizeGeminiResponse(
                                                data?.Files?.geminiResponse
                                            )}
                                        </div>
                                    </Section>
                                </Col>
                            )}

                        {/* Additional Call Metadata */}
                        {extraFields.length > 0 && (
                            <Col md={12}>
                                <Section title="Additional Metadata">
                                    {extraFields.map(([key, value]) => (
                                        <Field
                                            key={key}
                                            label={formatLabel(key)}
                                            value={
                                                typeof value === "object"
                                                    ? JSON.stringify(value)
                                                    : value || "-"
                                            }
                                        />
                                    ))}
                                </Section>
                            </Col>
                        )}
                    </Row>

                </CardBody>
            </Card>

        </div>
    );
};

export default MoreDetailsFeedback;